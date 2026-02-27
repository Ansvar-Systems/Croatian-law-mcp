import type { VercelRequest, VercelResponse } from '@vercel/node';
import Database from '@ansvar/mcp-sqlite';
import { existsSync, createWriteStream, renameSync, rmSync } from 'fs';
import { pipeline } from 'stream/promises';
import { createGunzip } from 'zlib';
import https from 'https';
import type { IncomingMessage } from 'http';
import {
  REPOSITORY_URL,
  SERVER_NAME,
  SERVER_VERSION,
} from '../src/constants.js';

const TMP_DB = '/tmp/database.db';
const TMP_DB_TMP = '/tmp/database.db.health.tmp';
const STALENESS_THRESHOLD_DAYS = 30;

const GITHUB_REPO = 'Ansvar-Systems/Croatian-law-mcp';
const RELEASE_TAG = `v${SERVER_VERSION}`;
const ASSET_NAME = 'database.db.gz';
const DEFAULT_RELEASE_URL =
  `https://github.com/${GITHUB_REPO}/releases/download/${RELEASE_TAG}/${ASSET_NAME}`;

function httpsGet(url: string): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': SERVER_NAME } }, resolve)
      .on('error', reject);
  });
}

async function downloadDatabase(): Promise<void> {
  const url = process.env.CROATIAN_LAW_DB_URL ?? DEFAULT_RELEASE_URL;
  let response = await httpsGet(url);
  let redirects = 0;
  while (
    response.statusCode &&
    response.statusCode >= 300 &&
    response.statusCode < 400 &&
    response.headers.location &&
    redirects < 5
  ) {
    response = await httpsGet(response.headers.location);
    redirects++;
  }
  if (response.statusCode !== 200) {
    throw new Error(`Failed to download database: HTTP ${response.statusCode}`);
  }
  const gunzip = createGunzip();
  const out = createWriteStream(TMP_DB_TMP);
  await pipeline(response, gunzip, out);
  renameSync(TMP_DB_TMP, TMP_DB);
}

function getHealthDb(): InstanceType<typeof Database> | null {
  try {
    const bundledPath = process.env.CROATIAN_LAW_DB || 'data/database.db';
    if (existsSync(bundledPath)) return new Database(bundledPath, { readonly: true });
    if (existsSync(TMP_DB)) return new Database(TMP_DB, { readonly: true });
  } catch { /* DB not available */ }
  return null;
}

function readMeta(db: InstanceType<typeof Database>, key: string): string | null {
  try {
    const row = db.prepare('SELECT value FROM db_metadata WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? null;
  } catch { return null; }
}

function safeCount(db: InstanceType<typeof Database>, sql: string): number {
  try {
    const row = db.prepare(sql).get() as { count: number } | undefined;
    return row ? Number(row.count) : 0;
  } catch { return 0; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url ?? '/', `https://${req.headers.host}`);

  if (url.pathname === '/version' || url.searchParams.has('version')) {
    res.status(200).json({
      name: SERVER_NAME, version: SERVER_VERSION, node_version: process.version,
      transport: ['stdio', 'streamable-http'], capabilities: ['statutes', 'eu_cross_references'],
      tier: 'free', repo_url: REPOSITORY_URL,
    });
    return;
  }

  // Strategy B: download DB from GitHub Releases if not available locally
  let db = getHealthDb();
  if (!db) {
    try {
      await downloadDatabase();
      db = getHealthDb();
    } catch { /* download failed — report degraded */ }
  }
  let dataStatus: 'ok' | 'stale' | 'degraded' = 'degraded';
  let builtAt: string | null = null;
  let daysSinceBuilt: number | null = null;
  let tier = 'free', schemaVersion = 'unknown';
  let counts: Record<string, number> = {};

  if (db) {
    try {
      builtAt = readMeta(db, 'built_at');
      tier = readMeta(db, 'tier') ?? 'free';
      schemaVersion = readMeta(db, 'schema_version') ?? 'unknown';
      if (builtAt) {
        daysSinceBuilt = Math.floor((Date.now() - new Date(builtAt).getTime()) / 86400000);
        dataStatus = daysSinceBuilt > STALENESS_THRESHOLD_DAYS ? 'stale' : 'ok';
      }
      counts = {
        documents: safeCount(db, 'SELECT COUNT(*) as count FROM legal_documents'),
        provisions: safeCount(db, 'SELECT COUNT(*) as count FROM legal_provisions'),
      };
    } finally { db.close(); }
  }

  res.status(200).json({
    status: dataStatus, server: SERVER_NAME, version: SERVER_VERSION,
    uptime_seconds: Math.floor(process.uptime()),
    data: { built_at: builtAt, days_since_built: daysSinceBuilt, staleness_threshold_days: STALENESS_THRESHOLD_DAYS, schema_version: schemaVersion, counts },
    capabilities: ['statutes', 'eu_cross_references'], tier,
  });
}
