#!/usr/bin/env tsx
/**
 * Resumable crawler for Narodne novine API that builds a catalog of laws (ZAKON*)
 * from the full official SL index.
 *
 * Usage examples:
 *   node --import tsx scripts/crawl-nn-law-catalog.ts --max-lookups 500
 *   node --import tsx scripts/crawl-nn-law-catalog.ts --max-lookups 5000 --resume
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_DIR = path.resolve(__dirname, '../data/catalog');
const CATALOG_PATH = path.join(CATALOG_DIR, 'nn-law-catalog.json');
const STATE_PATH = path.join(CATALOG_DIR, 'nn-law-catalog.state.json');

interface CliArgs {
  maxLookups: number;
  resume: boolean;
}

interface CrawlState {
  yearIndex: number;
  editionIndex: number;
  actIndex: number;
  lookupsDone: number;
  years: number[];
}

interface CatalogEntry {
  key: string;
  year: number;
  issue: number;
  act_num: string;
  type: string;
  title: string;
  url: string;
}

// Respect NN rate limits with a conservative 1.0s minimum request interval.
const MIN_DELAY_MS = 1000;
let lastRequestAt = 0;

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let maxLookups = 500;
  let resume = true;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max-lookups' && args[i + 1]) {
      maxLookups = Number.parseInt(args[i + 1], 10);
      i++;
      continue;
    }
    if (args[i] === '--no-resume') resume = false;
    if (args[i] === '--resume') resume = true;
  }

  return { maxLookups, resume };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < MIN_DELAY_MS) {
    await sleep(MIN_DELAY_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

async function getJson(url: string): Promise<unknown> {
  await enforceRateLimit();
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Ansvar-Law-MCP-Catalog/1.0',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  await enforceRateLimit();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': 'Ansvar-Law-MCP-Catalog/1.0',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

function parseActMetadata(payload: unknown): { title: string; type: string } | null {
  if (!Array.isArray(payload)) return null;

  const legalResource = payload.find(
    (v): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null &&
      Array.isArray((v as Record<string, unknown>)['@type']) &&
      ((v as Record<string, unknown>)['@type'] as unknown[]).includes('http://data.europa.eu/eli/ontology#LegalResource'),
  );

  const legalExpression = payload.find(
    (v): v is Record<string, unknown> =>
      typeof v === 'object' && v !== null &&
      Array.isArray((v as Record<string, unknown>)['@type']) &&
      ((v as Record<string, unknown>)['@type'] as unknown[]).includes('http://data.europa.eu/eli/ontology#LegalExpression'),
  );

  const typeNode = legalResource?.['http://data.europa.eu/eli/ontology#type_document'];
  const titleNode = legalExpression?.['http://data.europa.eu/eli/ontology#title'];

  const type = Array.isArray(typeNode) && typeNode[0] && typeof typeNode[0] === 'object'
    ? String((typeNode[0] as Record<string, unknown>)['@id'] ?? '')
    : '';

  const title = Array.isArray(titleNode) && titleNode[0] && typeof titleNode[0] === 'object'
    ? String((titleNode[0] as Record<string, unknown>)['@value'] ?? '')
    : '';

  if (!title) return null;
  return { title, type };
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
      source: 'https://narodne-novine.nn.hr/api',
      entries,
    }, null, 2)}\n`,
  );
}

function loadState(): CrawlState | null {
  if (!fs.existsSync(STATE_PATH)) return null;
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8')) as CrawlState;
}

function saveState(state: CrawlState): void {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
}

async function main(): Promise<void> {
  const { maxLookups, resume } = parseArgs();

  let state = resume ? loadState() : null;
  let catalog = loadCatalog().filter(v => /(^|_)ZAKON($|_)/.test(v.type));
  const byKey = new Map(catalog.map(v => [v.key, v]));

  if (!state) {
    const years = (await getJson('https://narodne-novine.nn.hr/api/index')) as number[];
    state = {
      years,
      yearIndex: 0,
      editionIndex: 0,
      actIndex: 0,
      lookupsDone: 0,
    };
  }

  let lookupsThisRun = 0;

  while (state.yearIndex < state.years.length && lookupsThisRun < maxLookups) {
    const year = state.years[state.yearIndex];
    const editions = (await postJson('https://narodne-novine.nn.hr/api/editions', { part: 'SL', year })) as number[];

    while (state.editionIndex < editions.length && lookupsThisRun < maxLookups) {
      const issue = editions[state.editionIndex];
      const acts = (await postJson('https://narodne-novine.nn.hr/api/acts', {
        part: 'SL',
        year,
        number: issue,
      })) as string[];

      while (state.actIndex < acts.length && lookupsThisRun < maxLookups) {
        const actNum = String(acts[state.actIndex]);
        const key = `${year}-${issue}-${actNum}`;

        if (!byKey.has(key)) {
          const payload = await postJson('https://narodne-novine.nn.hr/api/act', {
            part: 'SL',
            year,
            number: issue,
            act_num: actNum,
            format: 'JSON-LD',
          });

          const meta = parseActMetadata(payload);
          if (meta) {
            const typeLeaf = meta.type.split('/').pop() ?? '';
            if (/(^|_)ZAKON($|_)/.test(typeLeaf)) {
              const entry: CatalogEntry = {
                key,
                year,
                issue,
                act_num: actNum,
                type: typeLeaf,
                title: meta.title,
                url: `https://narodne-novine.nn.hr/eli/sluzbeni/${year}/${issue}/${actNum}`,
              };
              byKey.set(key, entry);
            }
          }
        }

        state.actIndex++;
        state.lookupsDone++;
        lookupsThisRun++;

        if (state.lookupsDone % 50 === 0) {
          catalog = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
          saveCatalog(catalog);
          saveState(state);
          console.log(`Progress: lookups_total=${state.lookupsDone}, laws_cataloged=${catalog.length}, cursor=${year}/${issue}/${actNum}`);
        }

      }

      if (state.actIndex >= acts.length) {
        state.actIndex = 0;
        state.editionIndex++;
      }
    }

    if (state.editionIndex >= editions.length) {
      state.editionIndex = 0;
      state.yearIndex++;
    }
  }

  catalog = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  saveCatalog(catalog);
  saveState(state);

  const done = state.yearIndex >= state.years.length;
  console.log('\nCatalog run complete');
  console.log(`Lookups this run: ${lookupsThisRun}`);
  console.log(`Lookups total:    ${state.lookupsDone}`);
  console.log(`Laws cataloged:   ${catalog.length}`);
  console.log(`Finished:         ${done ? 'yes' : 'no'}`);
  if (!done) {
    console.log(`Resume cursor:    yearIndex=${state.yearIndex}, editionIndex=${state.editionIndex}, actIndex=${state.actIndex}`);
  }
}

main().catch(error => {
  console.error('Catalog crawl failed:', error);
  process.exit(1);
});
