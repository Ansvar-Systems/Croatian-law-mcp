/**
 * Response metadata utilities for Croatian Law MCP.
 */

import type Database from '@ansvar/mcp-sqlite';

export interface ResponseMetadata {
  data_source: string;
  jurisdiction: string;
  disclaimer: string;
  freshness?: string;
}

export interface ToolResponse<T> {
  results: T;
  _metadata: ResponseMetadata;
}

export function generateResponseMetadata(
  db: InstanceType<typeof Database>,
): ResponseMetadata {
  let freshness: string | undefined;
  try {
    const row = db.prepare(
      "SELECT value FROM db_metadata WHERE key = 'built_at'"
    ).get() as { value: string } | undefined;
    if (row) freshness = row.value;
  } catch {
    // Ignore
  }

  return {
    data_source: 'Narodne novine (Official Gazette) (www.nn.hr) — Narodne novine d.d.',
    jurisdiction: 'HR',
    disclaimer:
      'This data is sourced from the Narodne novine (Official Gazette) under public domain. ' +
      'The authoritative versions are maintained by Narodne novine d.d.. ' +
      'Always verify with the official Narodne novine (Official Gazette) portal (www.nn.hr).',
    freshness,
  };
}
