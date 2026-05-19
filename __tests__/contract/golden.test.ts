import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getProvision } from '../../src/tools/get-provision.js';
import { getProvisionEUBasis } from '../../src/tools/get-provision-eu-basis.js';
import { searchLegislation } from '../../src/tools/search-legislation.js';

interface ContractAssertion {
  result_not_empty?: boolean;
  min_results?: number;
  any_result_contains?: string[];
  fields_present?: string[];
  text_not_empty?: boolean;
  citation_url_pattern?: string;
  handles_gracefully?: boolean;
}

interface ContractCase {
  id: string;
  description: string;
  tool: string;
  input: Record<string, unknown>;
  assertions: ContractAssertion;
}

interface ContractFile {
  tests: ContractCase[];
}

interface ToolResponse {
  results?: unknown;
  _metadata?: unknown;
  _citation?: { source_url?: string };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'database.db');
const CONTRACT_PATH = join(__dirname, '..', '..', 'fixtures', 'golden-tests.json');
const contract = JSON.parse(readFileSync(CONTRACT_PATH, 'utf8')) as ContractFile;

let db: InstanceType<typeof Database>;

beforeAll(() => {
  db = new Database(DB_PATH, { readonly: true });
  db.pragma('foreign_keys = ON');
});

afterAll(() => {
  db.close();
});

function normalizeInput(input: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...input };
  if (typeof normalized.law_identifier === 'string' && !normalized.document_id) {
    normalized.document_id = normalized.law_identifier;
  }
  if (typeof normalized.article === 'string' && !normalized.provision_ref) {
    normalized.provision_ref = normalized.article;
  }
  delete normalized.law_identifier;
  return normalized;
}

async function callTool(testCase: ContractCase): Promise<ToolResponse> {
  const input = normalizeInput(testCase.input);

  switch (testCase.tool) {
    case 'get_provision':
      return getProvision(db as never, input as never) as Promise<ToolResponse>;
    case 'get_provision_eu_basis':
      return getProvisionEUBasis(db as never, input as never) as Promise<ToolResponse>;
    case 'search_legislation':
      return searchLegislation(db as never, input as never) as Promise<ToolResponse>;
    default:
      throw new Error(`Unsupported contract tool: ${testCase.tool}`);
  }
}

function resultItems(response: ToolResponse): unknown[] {
  if (Array.isArray(response.results)) return response.results;
  if (response.results === undefined || response.results === null) return [];
  return [response.results];
}

function getTextCarrier(item: unknown): string {
  if (!item || typeof item !== 'object') return '';
  const record = item as Record<string, unknown>;
  for (const key of ['content', 'text', 'snippet']) {
    if (typeof record[key] === 'string') return record[key];
  }
  return '';
}

describe('golden contract fixtures', () => {
  for (const testCase of contract.tests) {
    it(`${testCase.id}: ${testCase.description}`, async () => {
      const response = await callTool(testCase);
      const items = resultItems(response);
      const assertions = testCase.assertions;

      if (assertions.handles_gracefully) {
        expect(response).toHaveProperty('results');
      }

      if (assertions.result_not_empty) {
        expect(items.length).toBeGreaterThan(0);
      }

      if (typeof assertions.min_results === 'number') {
        expect(items.length).toBeGreaterThanOrEqual(assertions.min_results);
      }

      if (assertions.fields_present) {
        expect(items.length).toBeGreaterThan(0);
        const first = items[0] as Record<string, unknown>;
        for (const field of assertions.fields_present) {
          expect(first).toHaveProperty(field);
        }
      }

      if (assertions.text_not_empty) {
        expect(items.length).toBeGreaterThan(0);
        expect(getTextCarrier(items[0]).trim().length).toBeGreaterThan(0);
      }

      if (assertions.any_result_contains) {
        const haystack = JSON.stringify(response).toLocaleLowerCase('hr-HR');
        const matched = assertions.any_result_contains.some((needle) =>
          haystack.includes(needle.toLocaleLowerCase('hr-HR')),
        );
        expect(matched).toBe(true);
      }

      if (assertions.citation_url_pattern) {
        const pattern = new RegExp(assertions.citation_url_pattern);
        const urls = [
          response._citation?.source_url,
          ...items.map((item) =>
            item && typeof item === 'object' ? (item as Record<string, unknown>).url : undefined,
          ),
        ].filter((url): url is string => typeof url === 'string');
        expect(urls.some((url) => pattern.test(url))).toBe(true);
      }
    });
  }
});
