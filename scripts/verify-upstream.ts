#!/usr/bin/env tsx
/**
 * Verifies every stored provision against the official Narodne novine upstream HTML
 * character-by-character.
 *
 * Usage:
 *   npm run verify:upstream
 *   npm run verify:upstream -- --document gdpr-impl-nn-42-18
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../data/database.db');

interface CliArgs {
  documentId: string | null;
}

interface UpstreamProvision {
  section: string;
  content: string;
}

interface VerificationRow {
  documentId: string;
  section: string;
  result: 'MATCH' | 'MISMATCH' | 'MISSING_UPSTREAM';
  detail?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let documentId: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--document' && args[i + 1]) {
      documentId = args[i + 1];
      i++;
    }
  }

  return { documentId };
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number.parseInt(n, 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : _;
    });
}

function stripHtml(input: string): string {
  return decodeEntities(
    input
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function normalizeSection(section: string): string {
  return section.replace(/[^0-9A-Za-z]/g, '').toLowerCase();
}

function extractUpstreamProvisions(html: string): UpstreamProvision[] {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  // Intentionally separate from parser.ts internals to avoid self-verifying with the same exact code path.
  const articleHeadingRe = new RegExp(
    String.raw`<p[^>]*class\s*=\s*(?:"[^"]*Clanak[^"]*"|'[^']*Clanak[^']*'|[^\s>]*Clanak[^\s>]*)[^>]*>[\s\S]*?Članak\s*(\d+[a-z]?)\.[\s\S]*?<\/p>`,
    'giu',
  );

  const headings = [...cleaned.matchAll(articleHeadingRe)];
  const longestBySection = new Map<string, UpstreamProvision>();

  for (let i = 0; i < headings.length; i++) {
    const sectionRaw = headings[i][1];
    const section = normalizeSection(sectionRaw);
    if (!section) continue;

    const start = (headings[i].index ?? 0) + headings[i][0].length;
    const end = headings[i + 1] ? (headings[i + 1].index ?? cleaned.length) : cleaned.length;

    const content = stripHtml(cleaned.slice(start, end));
    if (content.length < 20) continue;

    const existing = longestBySection.get(section);
    if (!existing || content.length > existing.content.length) {
      longestBySection.set(section, { section, content });
    }
  }

  return [...longestBySection.values()];
}

function firstDiff(a: string, b: string): string {
  const len = Math.min(a.length, b.length);
  let i = 0;
  while (i < len && a[i] === b[i]) i++;

  if (i === len && a.length === b.length) return 'no-diff';

  const start = Math.max(0, i - 30);
  const endA = Math.min(a.length, i + 30);
  const endB = Math.min(b.length, i + 30);
  const snippetA = a.slice(start, endA).replace(/\s+/g, ' ');
  const snippetB = b.slice(start, endB).replace(/\s+/g, ' ');

  return `idx=${i}; db="${snippetA}" vs upstream="${snippetB}"`;
}

async function verify(): Promise<void> {
  const { documentId } = parseArgs();
  const db = new Database(DB_PATH, { readonly: true });

  let docsSql = 'SELECT id, title, url FROM legal_documents';
  const docsParams: string[] = [];

  if (documentId) {
    docsSql += ' WHERE id = ?';
    docsParams.push(documentId);
  }

  docsSql += ' ORDER BY id';

  const docs = db.prepare(docsSql).all(...docsParams) as {
    id: string;
    title: string;
    url: string | null;
  }[];

  if (docs.length === 0) {
    db.close();
    throw new Error(documentId ? `Document not found: ${documentId}` : 'No documents in database');
  }

  const results: VerificationRow[] = [];
  let checked = 0;
  let matched = 0;
  let mismatched = 0;
  let missing = 0;

  for (const doc of docs) {
    if (!doc.url) {
      console.log(`Skipping ${doc.id}: missing source URL`);
      continue;
    }

    const printUrl = doc.url.endsWith('/hrv/printhtml') ? doc.url : `${doc.url}/hrv/printhtml`;
    process.stdout.write(`Verifying ${doc.id} ... `);

    const response = await fetchWithRateLimit(printUrl);
    if (response.status !== 200) {
      console.log(`FAILED (HTTP ${response.status})`);
      continue;
    }

    const upstream = extractUpstreamProvisions(response.body);
    const upstreamBySection = new Map<string, string>(
      upstream.map(p => [p.section, p.content]),
    );

    const provisions = db.prepare(
      'SELECT section, content FROM legal_provisions WHERE document_id = ? ORDER BY CAST(section AS INTEGER), section',
    ).all(doc.id) as { section: string; content: string }[];

    let docMatch = 0;
    let docMismatch = 0;
    let docMissing = 0;

    for (const p of provisions) {
      checked++;
      const section = normalizeSection(p.section);
      const up = upstreamBySection.get(section);

      if (!up) {
        missing++;
        docMissing++;
        results.push({
          documentId: doc.id,
          section,
          result: 'MISSING_UPSTREAM',
          detail: 'Section missing in upstream extraction',
        });
        continue;
      }

      if (p.content === up) {
        matched++;
        docMatch++;
        results.push({ documentId: doc.id, section, result: 'MATCH' });
      } else {
        mismatched++;
        docMismatch++;
        results.push({
          documentId: doc.id,
          section,
          result: 'MISMATCH',
          detail: firstDiff(p.content, up),
        });
      }
    }

    console.log(`OK (match=${docMatch}, mismatch=${docMismatch}, missing=${docMissing}, total=${provisions.length})`);
  }

  db.close();

  console.log('\nUpstream verification summary');
  console.log('----------------------------');
  console.log(`Checked provisions: ${checked}`);
  console.log(`Matches:            ${matched}`);
  console.log(`Mismatches:         ${mismatched}`);
  console.log(`Missing upstream:   ${missing}`);

  if (mismatched > 0 || missing > 0) {
    console.log('\nFirst issues:');
    for (const row of results.filter(r => r.result !== 'MATCH').slice(0, 20)) {
      console.log(`- ${row.documentId} čl.${row.section}: ${row.result}${row.detail ? ` (${row.detail})` : ''}`);
    }
    process.exit(1);
  }
}

verify().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});
