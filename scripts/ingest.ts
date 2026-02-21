#!/usr/bin/env tsx
/**
 * Croatian Law MCP ingestion from official Narodne novine ELI pages.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { fetchWithRateLimit } from './lib/fetcher.js';
import {
  TARGET_LAWS,
  buildEliPrintHtmlUrl,
  parseCroatianEliHtml,
  type LawTarget,
} from './lib/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../data/source');
const SEED_DIR = path.resolve(__dirname, '../data/seed');

interface CliArgs {
  limit: number | null;
  skipFetch: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let skipFetch = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = Number.parseInt(args[i + 1], 10);
      i++;
      continue;
    }

    if (args[i] === '--skip-fetch') {
      skipFetch = true;
    }
  }

  return { limit, skipFetch };
}

function ensureDirs(): void {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.mkdirSync(SEED_DIR, { recursive: true });
}

function clearSeedDir(): void {
  const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    fs.rmSync(path.join(SEED_DIR, file));
  }
}

async function fetchHtml(target: LawTarget, skipFetch: boolean): Promise<string> {
  const sourceFile = path.join(SOURCE_DIR, `${target.id}.html`);

  if (skipFetch && fs.existsSync(sourceFile)) {
    return fs.readFileSync(sourceFile, 'utf-8');
  }

  const url = buildEliPrintHtmlUrl(target);
  const result = await fetchWithRateLimit(url);

  if (result.status !== 200) {
    throw new Error(`HTTP ${result.status} for ${url}`);
  }

  if (result.body.includes('Sadržaj je nedostupan')) {
    throw new Error(`No public content available for ${url}`);
  }

  fs.writeFileSync(sourceFile, result.body);
  return result.body;
}

async function run(targets: LawTarget[], skipFetch: boolean): Promise<void> {
  ensureDirs();
  clearSeedDir();

  let okCount = 0;
  let failedCount = 0;
  let totalProvisions = 0;
  let totalDefinitions = 0;

  const failures: { id: string; reason: string }[] = [];

  for (const target of targets) {
    process.stdout.write(`Fetching ${target.id} ... `);

    try {
      const html = await fetchHtml(target, skipFetch);
      const parsed = parseCroatianEliHtml(html, target);

      if (parsed.provisions.length === 0) {
        throw new Error('Parsed 0 provisions');
      }

      const seedPath = path.join(SEED_DIR, target.seedFile);
      fs.writeFileSync(seedPath, `${JSON.stringify(parsed, null, 2)}\n`);

      okCount++;
      totalProvisions += parsed.provisions.length;
      totalDefinitions += parsed.definitions.length;
      console.log(`OK (${parsed.provisions.length} provisions, ${parsed.definitions.length} definitions)`);
    } catch (error) {
      failedCount++;
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({ id: target.id, reason });
      console.log(`FAILED (${reason})`);
    }
  }

  console.log('\nIngestion summary');
  console.log('-----------------');
  console.log(`Laws requested: ${targets.length}`);
  console.log(`Laws ingested:  ${okCount}`);
  console.log(`Laws failed:    ${failedCount}`);
  console.log(`Provisions:     ${totalProvisions}`);
  console.log(`Definitions:    ${totalDefinitions}`);

  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const failure of failures) {
      console.log(`- ${failure.id}: ${failure.reason}`);
    }
  }
}

async function main(): Promise<void> {
  const { limit, skipFetch } = parseArgs();
  const targets = limit ? TARGET_LAWS.slice(0, limit) : TARGET_LAWS;

  console.log('Croatian Law MCP real ingestion (Narodne novine ELI)');
  console.log(`Target laws: ${targets.length}`);
  console.log(`Skip fetch:  ${skipFetch ? 'yes' : 'no'}`);

  await run(targets, skipFetch);
}

main().catch(error => {
  console.error('Fatal ingestion error:', error);
  process.exit(1);
});
