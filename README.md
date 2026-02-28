# Croatian Law MCP

[![npm](https://img.shields.io/npm/v/@ansvar/croatian-law-mcp)](https://www.npmjs.com/package/@ansvar/croatian-law-mcp)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![CI](https://github.com/Ansvar-Systems/Croatian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Croatian-law-mcp/actions/workflows/ci.yml)

A Model Context Protocol (MCP) server providing access to Croatian legislation covering data protection, cybersecurity, e-commerce, and criminal law provisions.

**MCP Registry:** `eu.ansvar/croatian-law-mcp`
**npm:** `@ansvar/croatian-law-mcp`

## Quick Start

### Claude Desktop / Cursor (stdio)

```json
{
  "mcpServers": {
    "croatian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/croatian-law-mcp"]
    }
  }
}
```

### Remote (Streamable HTTP)

```
croatian-law-mcp.vercel.app/mcp
```

## Data Sources

| Source | Authority | License |
|--------|-----------|---------|
| [Narodne novine (Official Gazette)](https://www.nn.hr) | Narodne novine d.d. | Croatian Government Open Data (public domain under Croatian Copyright Act Art. 8) |

> Full provenance: [`sources.yml`](./sources.yml)

## Real Ingestion (Open Method)

This repository uses an explicit, auditable ingestion pipeline from official Narodne novine endpoints.

### Why this approach

The earlier catalog approach discovered laws by calling per-act API metadata, which is correct but slow.
The current default method builds the catalog much faster from yearly official index files, then ingests full text law-by-law.

### Official endpoints used

- Yearly index (CSV/XLSX): `https://narodne-novine.nn.hr/get_index_file.aspx?year=YYYY&type=csv`
- Law text (HTML print view): `https://narodne-novine.nn.hr/eli/sluzbeni/{year}/{issue}/{act}/hrv/printhtml`
- Optional metadata/verification: `https://narodne-novine.nn.hr/api/*` and ELI URLs

### Selection and filtering rules

- Only `eli/sluzbeni` entries are cataloged (same scope as SL ingestion).
- A row is treated as law corpus when the document type contains `zakon`.
- `ispravak` correction notices are kept in catalog for transparency but skipped during ingest when they have no article structure.
- No legal text is fabricated; entries that cannot be parsed are reported as failed/skipped.

### Rate limiting and compliance

- Requests to government servers are rate limited to **1 request/second** (within the required 1-2s interval).
- Retries are performed only for transient HTTP errors (`429`/`5xx`) with exponential backoff.

### Commands

```bash
# Fast catalog build from official yearly CSV indexes (1990..current year)
npm run catalog:build-csv

# Ingest only missing laws from catalog into data/seed-catalog
npm run catalog:ingest

# One-shot fast sync (catalog + ingest)
npm run catalog:sync-fast
```

`catalog:ingest` is incremental (`only-new` behavior) and safe to rerun.

## Tools

| Tool | Description |
|------|-------------|
| `search_legislation` | Full-text search across provisions |
| `get_provision` | Retrieve specific article/section |
| `validate_citation` | Validate legal citation |
| `check_currency` | Check if statute is in force |
| `get_eu_basis` | EU legal basis cross-references |
| `get_croatian_implementations` | National EU implementations |
| `search_eu_implementations` | Search EU documents |
| `validate_eu_compliance` | EU compliance check |
| `build_legal_stance` | Comprehensive legal research |
| `format_citation` | Citation formatting |
| `list_sources` | Data provenance |
| `about` | Server metadata |

## License

Apache-2.0
