#!/usr/bin/env tsx
/**
 * Ingests laws discovered by scripts/crawl-nn-law-catalog.ts into a separate seed set.
 *
 * This is intentionally separate from scripts/ingest.ts to keep the curated 10-law
 * MCP dataset stable while full-index expansion runs incrementally.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';
import { parseCroatianEliHtml, type LawTarget } from './lib/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.resolve(__dirname, '../data/catalog/nn-law-catalog.json');
const SOURCE_DIR = path.resolve(__dirname, '../data/source-catalog');
const OUTPUT_DIR = path.resolve(__dirname, '../data/seed-catalog');

interface CatalogEntry {
  key: string;
  year: number;
  issue: number;
  act_num: string;
  type: string;
  title: string;
  url: string;
}

function isCorrectionNotice(entry: CatalogEntry): boolean {
  return /^ispravak\b/i.test(entry.title.trim());
}

interface CliArgs {
  limit: number | null;
  offset: number;
  skipFetch: boolean;
  onlyNew: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let offset = 0;
  let skipFetch = false;
  let onlyNew = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = Number.parseInt(args[i + 1], 10);
      i++;
      continue;
    }
    if (args[i] === '--offset' && args[i + 1]) {
      offset = Number.parseInt(args[i + 1], 10);
      i++;
      continue;
    }
    if (args[i] === '--skip-fetch') {
      skipFetch = true;
    }
    if (args[i] === '--only-new') {
      onlyNew = true;
    }
    if (args[i] === '--all') {
      onlyNew = false;
    }
  }

  return { limit, offset, skipFetch, onlyNew };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function loadCatalog(): CatalogEntry[] {
  const parsed = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')) as { entries?: CatalogEntry[] };
  return (parsed.entries ?? []).sort((a, b) => a.key.localeCompare(b.key));
}

function listExistingIds(): Set<string> {
  if (!fs.existsSync(OUTPUT_DIR)) return new Set<string>();

  const ids = new Set<string>();
  const files = fs.readdirSync(OUTPUT_DIR).filter(name => name.endsWith('.json'));

  for (const file of files) {
    const base = path.basename(file, '.json');
    // New files may include a numeric ingestion prefix; existing id starts after it.
    const withoutPrefix = base.replace(/^\d{5}-/, '');
    ids.add(withoutPrefix);
  }

  return ids;
}

function toTarget(entry: CatalogEntry, idx: number): LawTarget {
  const slug = slugify(entry.title) || `zakon-${entry.year}-${entry.issue}-${entry.act_num}`;
  const id = `${slug}-${entry.year}-${entry.issue}-${entry.act_num}`;
  return {
    seedFile: `${String(idx + 1).padStart(5, '0')}-${id}.json`,
    id,
    title: entry.title,
    titleEn: entry.title,
    shortName: entry.title,
    year: entry.year,
    issue: entry.issue,
    actNum: entry.act_num,
    status: 'in_force',
    description: `Zakon objavljen u Narodnim novinama (${entry.year}/${entry.issue}/${entry.act_num}), preuzet putem ELI sučelja.`,
  };
}

async function fetchHtml(target: LawTarget, skipFetch: boolean): Promise<string> {
  const sourceFile = path.join(SOURCE_DIR, `${target.id}.html`);
  const url = `https://narodne-novine.nn.hr/eli/sluzbeni/${target.year}/${target.issue}/${target.actNum}/hrv/printhtml`;

  if (skipFetch && fs.existsSync(sourceFile)) {
    return fs.readFileSync(sourceFile, 'utf-8');
  }

  const result = await fetchWithRateLimit(url);
  if (result.status !== 200) throw new Error(`HTTP ${result.status} for ${url}`);
  if (result.body.includes('Sadržaj je nedostupan')) throw new Error(`No content for ${url}`);

  fs.writeFileSync(sourceFile, result.body);
  return result.body;
}

async function main(): Promise<void> {
  const { limit, offset, skipFetch, onlyNew } = parseArgs();

  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`Catalog not found: ${CATALOG_PATH}`);
  }

  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const catalog = loadCatalog();
  const slice = limit == null
    ? catalog.slice(offset)
    : catalog.slice(offset, offset + limit);
  const existingIds = listExistingIds();
  const filtered = slice.filter(entry => !isCorrectionNotice(entry));
  const targets = filtered
    .map((entry, idx) => toTarget(entry, offset + idx))
    .filter(target => !onlyNew || !existingIds.has(target.id));
  const skippedCorrections = slice.length - filtered.length;
  const skippedAlreadyIngested = onlyNew ? filtered.length - targets.length : 0;
  const skipped = skippedCorrections + skippedAlreadyIngested;

  let ok = 0;
  let failed = 0;
  let provisions = 0;

  for (const target of targets) {
    process.stdout.write(`Ingest ${target.id} ... `);
    try {
      const html = await fetchHtml(target, skipFetch);
      const parsed = parseCroatianEliHtml(html, target);
      if (parsed.provisions.length === 0) throw new Error('Parsed 0 provisions');

      fs.writeFileSync(path.join(OUTPUT_DIR, target.seedFile), `${JSON.stringify(parsed, null, 2)}\n`);
      ok++;
      provisions += parsed.provisions.length;
      console.log(`OK (${parsed.provisions.length} provisions)`);
    } catch (error) {
      failed++;
      console.log(`FAILED (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  console.log('\nCatalog ingestion summary');
  console.log('-------------------------');
  console.log(`Targets:    ${targets.length}`);
  console.log(`Ingested:   ${ok}`);
  console.log(`Failed:     ${failed}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`  - already ingested: ${skippedAlreadyIngested}`);
  console.log(`  - correction notices: ${skippedCorrections}`);
  console.log(`Provisions: ${provisions}`);
  console.log(`Output:     ${OUTPUT_DIR}`);
}

main().catch(error => {
  console.error('Catalog ingestion failed:', error);
  process.exit(1);
});
