# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-02-26
### Changed
- **Full corpus ingestion** -- upgraded from 10 curated laws to 4,531 laws (45,210% growth)
- **Census-driven pipeline** -- new `census.ts` enumerates ALL Croatian laws from Narodne novine yearly CSV indexes (1990-2026)
- **Rewritten `ingest.ts`** -- now reads `census.json` for complete corpus enumeration; falls back to original TARGET_LAWS if census is missing
- **Updated `build-db.ts`** -- merges seed files from both `data/seed` (curated) and `data/seed-catalog` (census-driven) with deduplication by ID
- **Database size** -- grew from ~2.4 MB to ~253 MB (Git LFS tracked)

### Added
- `scripts/census.ts` -- census script enumerating all Croatian legislation from official CSV indexes
- `data/census.json` -- canonical inventory of 4,763 discovered laws (4,529 ingestable, 234 correction notices)
- Git LFS tracking for `data/database.db` (>100 MB threshold)
- 4 additional golden test cases covering full-corpus laws (Obligations Act, Maritime Code, public procurement, labour law)
- Progress logging in `build-db.ts` for large dataset builds
- Build metadata: `build_date`, `total_documents`, `total_provisions`, `total_definitions`, `total_eu_documents`, `total_eu_references`

### Stats
| Metric | v1.0.0 | v2.0.0 | Growth |
|--------|--------|--------|--------|
| Laws | 10 | 4,531 | 45,210% |
| Provisions | 937 | 157,667 | 16,722% |
| Definitions | 3 | 1,076 | 35,767% |
| EU Documents | ~20 | 816 | 3,980% |
| EU References | ~50 | 4,407 | 8,714% |
| Database Size | 2.4 MB | 253 MB | 10,442% |

## [1.0.0] - 2026-02-21
### Added
- Initial release of Croatian Law MCP
- `search_legislation` tool for full-text search across Croatian legislation
- `get_provision` tool for retrieving specific articles
- `validate_citation` tool for citation validation
- `check_currency` tool for checking if legislation is in force
- `get_eu_basis` tool for EU cross-references
- `get_croatian_implementations` tool for finding national EU implementations
- `search_eu_implementations` tool for searching EU documents
- `validate_eu_compliance` tool for EU compliance checking
- `build_legal_stance` tool for comprehensive legal research
- `format_citation` tool for citation formatting
- `get_provision_eu_basis` tool for provision-level EU references
- `list_sources` tool for data provenance
- `about` tool for server metadata
- Contract tests with 12 golden test cases
- Health and version endpoints
- Vercel deployment (Strategy A, bundled DB)
- npm package with stdio transport

[2.0.0]: https://github.com/Ansvar-Systems/Croatian-law-mcp/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Ansvar-Systems/Croatian-law-mcp/releases/tag/v1.0.0
