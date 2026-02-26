#!/usr/bin/env tsx
/**
 * Fast catalog builder using official yearly CSV law indexes from Narodne novine.
 *
 * Source endpoint:
 *   https://narodne-novine.nn.hr/get_index_file.aspx?year=YYYY&type=csv
 *
 * This replaces slow per-act metadata crawling for catalog discovery and keeps
 * ingest throughput constrained only by article-text fetches.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_DIR = path.resolve(__dirname, '../data/catalog');
const CATALOG_PATH = path.join(CATALOG_DIR, 'nn-law-catalog.json');

interface CatalogEntry {
  key: string;
  year: number;
  issue: number;
  act_num: string;
  type: string;
  title: string;
  url: string;
}

interface CliArgs {
  yearFrom: number;
  yearTo: number;
  overwrite: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const currentYear = new Date().getUTCFullYear();
  let yearFrom = 1990;
  let yearTo = currentYear;
  let overwrite = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--year-from' && args[i + 1]) {
      yearFrom = Number.parseInt(args[i + 1], 10);
      i++;
      continue;
    }
    if (args[i] === '--year-to' && args[i + 1]) {
      yearTo = Number.parseInt(args[i + 1], 10);
      i++;
      continue;
    }
    if (args[i] === '--overwrite') {
      overwrite = true;
    }
  }

  if (!Number.isFinite(yearFrom) || !Number.isFinite(yearTo)) {
    throw new Error('Invalid --year-from/--year-to');
  }
  if (yearFrom > yearTo) {
    throw new Error('--year-from must be <= --year-to');
  }

  return { yearFrom, yearTo, overwrite };
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function looksLikeLaw(docType: string, title: string): boolean {
  const type = normalizeText(docType);
  const normalizedTitle = normalizeText(title).trim();
  if (type.includes('zakon')) return true;
  return normalizedTitle.startsWith('ispravak zakona');
}

function docTypeToLeaf(docType: string, title: string): string {
  const normalizedTitle = normalizeText(title).trim();
  if (normalizedTitle.startsWith('ispravak zakona')) {
    return 'ISPRAVAK_ZAKONA';
  }

  const leaf = normalizeText(docType)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return leaf || 'ZAKON';
}

function parseTsv(content: string): string[][] {
  const lines = content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter(line => line.trim().length > 0);

  return lines.map(line => line.split('\t'));
}

function entryFromRow(columns: string[]): CatalogEntry | null {
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

  return {
    key: `${year}-${issue}-${actNum}`,
    year,
    issue,
    act_num: actNum,
    type: docTypeToLeaf(docType, title),
    title,
    url: `https://narodne-novine.nn.hr/eli/sluzbeni/${year}/${issue}/${actNum}`,
  };
}

function loadCatalog(): CatalogEntry[] {
  if (!fs.existsSync(CATALOG_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')) as { entries?: CatalogEntry[] };
  return parsed.entries ?? [];
}

function saveCatalog(entries: CatalogEntry[]): void {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  fs.writeFileSync(
    CATALOG_PATH,
    `${JSON.stringify({
      generated_at: new Date().toISOString(),
      source: 'https://narodne-novine.nn.hr/get_index_file.aspx?year=YYYY&type=csv',
      entries,
    }, null, 2)}\n`,
  );
}

async function fetchYearCsv(year: number): Promise<string> {
  const url = `https://narodne-novine.nn.hr/get_index_file.aspx?year=${year}&type=csv`;
  const result = await fetchWithRateLimit(url);
  if (result.status !== 200) {
    throw new Error(`HTTP ${result.status}`);
  }
  return result.body;
}

async function main(): Promise<void> {
  const { yearFrom, yearTo, overwrite } = parseArgs();

  const seed = overwrite ? [] : loadCatalog();
  const byKey = new Map(seed.map(entry => [entry.key, entry]));

  let processedYears = 0;
  let failedYears = 0;
  let added = 0;
  let updated = 0;

  for (let year = yearFrom; year <= yearTo; year++) {
    process.stdout.write(`Index year ${year} ... `);
    try {
      const csv = await fetchYearCsv(year);
      const rows = parseTsv(csv);
      const dataRows = rows.slice(1);

      let yearLaws = 0;
      let yearAdded = 0;
      let yearUpdated = 0;

      for (const row of dataRows) {
        const entry = entryFromRow(row);
        if (!entry) continue;
        if (entry.year !== year) continue;

        yearLaws++;
        const existing = byKey.get(entry.key);
        if (!existing) {
          byKey.set(entry.key, entry);
          yearAdded++;
          continue;
        }

        if (
          existing.title !== entry.title ||
          existing.type !== entry.type ||
          existing.url !== entry.url
        ) {
          byKey.set(entry.key, { ...existing, ...entry });
          yearUpdated++;
        }
      }

      processedYears++;
      added += yearAdded;
      updated += yearUpdated;
      console.log(`OK (rows=${dataRows.length}, laws=${yearLaws}, added=${yearAdded}, updated=${yearUpdated})`);
    } catch (error) {
      failedYears++;
      console.log(`FAILED (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  const entries = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  saveCatalog(entries);

  console.log('\nCSV catalog build summary');
  console.log('-------------------------');
  console.log(`Years requested: ${yearTo - yearFrom + 1}`);
  console.log(`Years processed: ${processedYears}`);
  console.log(`Years failed:    ${failedYears}`);
  console.log(`Added:           ${added}`);
  console.log(`Updated:         ${updated}`);
  console.log(`Catalog total:   ${entries.length}`);
  console.log(`Output:          ${CATALOG_PATH}`);
}

main().catch(error => {
  console.error('CSV catalog build failed:', error);
  process.exit(1);
});
