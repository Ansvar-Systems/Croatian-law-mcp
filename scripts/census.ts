#!/usr/bin/env tsx
/**
 * Croatian Law MCP -- Census Script
 *
 * Enumerates ALL Croatian laws from the official Narodne novine yearly CSV indexes
 * (1990 to current year). Writes data/census.json in golden standard format.
 *
 * This is the authoritative law enumeration step. The census must run before ingestion
 * to establish a complete inventory of Croatian legislation.
 *
 * Source: https://narodne-novine.nn.hr/get_index_file.aspx?year=YYYY&type=csv
 * License: Croatian Government Open Data (public domain under Copyright Act Art. 8)
 *
 * Usage:
 *   npx tsx scripts/census.ts
 *   npx tsx scripts/census.ts --year-from 2020 --year-to 2026
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const CENSUS_PATH = path.join(DATA_DIR, 'census.json');

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CensusLaw {
  id: string;
  title: string;
  year: number;
  issue: number;
  act_num: string;
  type: string;
  url: string;
  classification: 'ingestable' | 'inaccessible' | 'metadata_only' | 'correction_notice';
}

interface CensusOutput {
  generated_at: string;
  source: string;
  description: string;
  stats: {
    total: number;
    class_ingestable: number;
    class_inaccessible: number;
    class_metadata_only: number;
    class_correction_notice: number;
  };
  ingestion?: {
    completed_at: string;
    total_laws: number;
    total_provisions: number;
    coverage_pct: string;
  };
  laws: CensusLaw[];
}

/* ------------------------------------------------------------------ */
/*  CLI args                                                           */
/* ------------------------------------------------------------------ */

interface CliArgs {
  yearFrom: number;
  yearTo: number;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const currentYear = new Date().getUTCFullYear();
  let yearFrom = 1990;
  let yearTo = currentYear;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--year-from' && args[i + 1]) {
      yearFrom = Number.parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--year-to' && args[i + 1]) {
      yearTo = Number.parseInt(args[i + 1], 10);
      i++;
    }
  }

  if (!Number.isFinite(yearFrom) || !Number.isFinite(yearTo) || yearFrom > yearTo) {
    throw new Error('Invalid --year-from / --year-to');
  }

  return { yearFrom, yearTo };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function looksLikeLaw(docType: string, title: string): boolean {
  const type = normalizeText(docType);
  const normalizedTitle = normalizeText(title).trim();
  if (type.includes('zakon')) return true;
  return normalizedTitle.startsWith('ispravak zakona');
}

function isCorrection(title: string): boolean {
  return /^ispravak\b/i.test(title.trim());
}

function docTypeToLeaf(docType: string, title: string): string {
  const normalizedTitle = normalizeText(title).trim();
  if (normalizedTitle.startsWith('ispravak zakona')) return 'ISPRAVAK_ZAKONA';

  const leaf = normalizeText(docType)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return leaf || 'ZAKON';
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

function parseTsv(content: string): string[][] {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0);
  return lines.map(line => line.split('\t'));
}

function entryFromRow(columns: string[]): CensusLaw | null {
  if (columns.length < 8) return null;

  const title = (columns[2] ?? '').trim();
  const docType = (columns[3] ?? '').trim();
  const urlRaw = (columns[7] ?? '').trim();

  if (!title || !docType || !urlRaw) return null;
  if (!looksLikeLaw(docType, title)) return null;

  let url: URL;
  try {
    url = new URL(urlRaw);
  } catch {
    return null;
  }

  const match = url.pathname.match(/^\/eli\/([^/]+)\/(\d{4})\/(\d+)\/([^/?#]+)/);
  if (!match) return null;

  const [, part, yearRaw, issueRaw, actNum] = match;
  if (part !== 'sluzbeni') return null;

  const year = Number.parseInt(yearRaw, 10);
  const issue = Number.parseInt(issueRaw, 10);
  if (!Number.isFinite(year) || !Number.isFinite(issue)) return null;

  const slug = slugify(title) || `zakon-${year}-${issue}-${actNum}`;
  const id = `${slug}-${year}-${issue}-${actNum}`;
  const type = docTypeToLeaf(docType, title);
  const correction = isCorrection(title);

  return {
    id,
    title,
    year,
    issue,
    act_num: actNum,
    type,
    url: `https://narodne-novine.nn.hr/eli/sluzbeni/${year}/${issue}/${actNum}`,
    classification: correction ? 'correction_notice' : 'ingestable',
  };
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const { yearFrom, yearTo } = parseArgs();

  console.log('Croatian Law MCP -- Census');
  console.log('==========================\n');
  console.log(`  Source:  Narodne novine official yearly CSV indexes`);
  console.log(`  Method:  CSV index scrape (${yearFrom}..${yearTo})`);
  console.log(`  License: Croatian Government Open Data (public domain)\n`);

  const byKey = new Map<string, CensusLaw>();
  let processedYears = 0;
  let failedYears = 0;

  for (let year = yearFrom; year <= yearTo; year++) {
    const url = `https://narodne-novine.nn.hr/get_index_file.aspx?year=${year}&type=csv`;
    process.stdout.write(`  Fetching ${year}...`);

    try {
      const result = await fetchWithRateLimit(url);

      if (result.status !== 200) {
        console.log(` HTTP ${result.status} -- skipped`);
        failedYears++;
        continue;
      }

      const rows = parseTsv(result.body);
      const dataRows = rows.slice(1); // skip header

      let yearLaws = 0;
      for (const row of dataRows) {
        const entry = entryFromRow(row);
        if (!entry) continue;
        if (entry.year !== year) continue;

        if (!byKey.has(entry.id)) {
          byKey.set(entry.id, entry);
          yearLaws++;
        }
      }

      processedYears++;
      console.log(` ${dataRows.length} rows, ${yearLaws} laws`);
    } catch (error) {
      failedYears++;
      const msg = error instanceof Error ? error.message : String(error);
      console.log(` ERROR: ${msg}`);
    }
  }

  // Sort by year, issue, act_num for deterministic output
  const allLaws = [...byKey.values()].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.issue !== b.issue) return a.issue - b.issue;
    return a.act_num.localeCompare(b.act_num);
  });

  // Build census output
  const census: CensusOutput = {
    generated_at: new Date().toISOString(),
    source: 'narodne-novine.nn.hr (Official Gazette yearly CSV indexes)',
    description: 'Full census of Croatian legislation from Narodne novine (1990-present)',
    stats: {
      total: allLaws.length,
      class_ingestable: allLaws.filter(l => l.classification === 'ingestable').length,
      class_inaccessible: allLaws.filter(l => l.classification === 'inaccessible').length,
      class_metadata_only: allLaws.filter(l => l.classification === 'metadata_only').length,
      class_correction_notice: allLaws.filter(l => l.classification === 'correction_notice').length,
    },
    laws: allLaws,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2) + '\n');

  console.log(`\n${'='.repeat(50)}`);
  console.log('CENSUS COMPLETE');
  console.log('='.repeat(50));
  console.log(`  Years processed:       ${processedYears}`);
  console.log(`  Years failed:          ${failedYears}`);
  console.log(`  Total laws discovered: ${allLaws.length}`);
  console.log(`  Ingestable:            ${census.stats.class_ingestable}`);
  console.log(`  Correction notices:    ${census.stats.class_correction_notice}`);
  console.log(`  Inaccessible:          ${census.stats.class_inaccessible}`);
  console.log(`  Metadata only:         ${census.stats.class_metadata_only}`);
  console.log(`\n  Output: ${CENSUS_PATH}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
