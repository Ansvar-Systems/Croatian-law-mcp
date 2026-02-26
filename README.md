# Croatian Law MCP Server

**The Narodne novine alternative for the AI age.**

[![npm version](https://badge.fury.io/js/@ansvar%2Fcroatian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/croatian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/Croatian-law-mcp?style=social)](https://github.com/Ansvar-Systems/Croatian-law-mcp)
[![CI](https://github.com/Ansvar-Systems/Croatian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Croatian-law-mcp/actions/workflows/ci.yml)
[![Daily Data Check](https://github.com/Ansvar-Systems/Croatian-law-mcp/actions/workflows/check-updates.yml/badge.svg)](https://github.com/Ansvar-Systems/Croatian-law-mcp/actions/workflows/check-updates.yml)
[![Database](https://img.shields.io/badge/database-pre--built-green)](docs/EU_INTEGRATION_GUIDE.md)
[![Provisions](https://img.shields.io/badge/provisions-157%2C667-blue)](docs/EU_INTEGRATION_GUIDE.md)

Query **4,531 Croatian laws** -- from the Cybersecurity Act and Criminal Code to the Maritime Code, Obligations Act, and more -- directly from Claude, Cursor, or any MCP-compatible client.

If you're building legal tech, compliance tools, or doing Croatian legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Croatian legal research is scattered across Narodne novine, zakon.hr, and EUR-Lex. Whether you're:
- A **lawyer** validating citations in a brief or contract
- A **compliance officer** checking if a Croatian statute is still in force
- A **legal tech developer** building tools on Croatian law
- A **researcher** tracing legislative history from the Official Gazette

...you shouldn't need 47 browser tabs and manual PDF cross-referencing. Ask Claude. Get the exact provision. With context.

This MCP server makes Croatian law **searchable, cross-referenceable, and AI-readable**.

---

## Quick Start

### Use Remotely (No Install Needed)

> Connect directly to the hosted version -- zero dependencies, nothing to install.

**Endpoint:** `https://croatian-law-mcp.vercel.app/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude.ai** | Settings > Connectors > Add Integration > paste URL |
| **Claude Code** | `claude mcp add croatian-law --transport http https://croatian-law-mcp.vercel.app/mcp` |
| **Claude Desktop** | Add to config (see below) |
| **GitHub Copilot** | Add to VS Code settings (see below) |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "croatian-law": {
      "type": "url",
      "url": "https://croatian-law-mcp.vercel.app/mcp"
    }
  }
}
```

**GitHub Copilot** -- add to VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "croatian-law": {
      "type": "http",
      "url": "https://croatian-law-mcp.vercel.app/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/croatian-law-mcp
```

**Claude Desktop** -- add to `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

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

**Cursor / VS Code:**

```json
{
  "mcp.servers": {
    "croatian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/croatian-law-mcp"]
    }
  }
}
```

## Example Queries

Once connected, just ask naturally:

- *"What does the Croatian Cybersecurity Act say about incident reporting?"*
- *"Show me Article 266 of the Croatian Criminal Code on unauthorized computer access"*
- *"Find provisions about personal data in Croatian law"*
- *"What EU directives does the Croatian GDPR Implementation Act transpose?"*
- *"Which Croatian laws implement the NIS2 Directive?"*
- *"Is the Critical Infrastructures Act still in force?"*
- *"Compare data protection provisions across Croatian statutes"*

---

## What's Included

| Category | Count | Details |
|----------|-------|---------|
| **Statutes** | 4,531 laws | Full Croatian legislation corpus (1990-2026) |
| **Provisions** | 157,667 articles | Full-text searchable with FTS5 (unicode61 tokenizer) |
| **EU Cross-References** | 4,407 references | 816 EU directives and regulations |
| **Legal Definitions** | 1,076 terms | Auto-extracted from definition articles |
| **Database Size** | ~253 MB | Optimized SQLite, portable |
| **Daily Updates** | Automated | Freshness checks against Narodne novine |

**Verified data only** -- every provision is ingested from official Narodne novine ELI endpoints. Zero LLM-generated content.

---

## See It In Action

### Why This Works

**Verbatim Source Text (No LLM Processing):**
- All statute text is ingested from official Narodne novine (Official Gazette) ELI endpoints
- Provisions are returned **unchanged** from SQLite FTS5 database rows
- Zero LLM summarization or paraphrasing -- the database contains regulation text, not AI interpretations

**Smart Context Management:**
- Search returns ranked provisions with BM25 scoring (safe for context)
- Provision retrieval gives exact text by law name + article number
- Cross-references help navigate without loading everything at once

**Technical Architecture:**
```
Narodne novine CSV index --> Census --> ELI fetch --> Parse --> SQLite --> FTS5 snippet() --> MCP response
                              |                        |
                        Full corpus enum        Verbatim database query
```

### Traditional Research vs. This MCP

| Traditional Approach | This MCP Server |
|---------------------|-----------------|
| Search Narodne novine by issue number | Search by plain Croatian or English text |
| Navigate multi-chapter statutes manually | Get the exact provision with context |
| Manual cross-referencing between laws | `build_legal_stance` aggregates across sources |
| "Is this statute still in force?" -> check manually | `check_currency` tool -> answer in seconds |
| Find EU basis -> dig through EUR-Lex | `get_eu_basis` -> linked EU directives instantly |
| Check 5+ sites for updates | Daily automated freshness checks |
| No API, no integration | MCP protocol -> AI-native |

---

## Available Tools (12)

### Core Legal Research Tools (8)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 search on 157,667 provisions with BM25 ranking |
| `get_provision` | Retrieve specific provision by law name + article |
| `validate_citation` | Validate citation against database (zero-hallucination check) |
| `build_legal_stance` | Aggregate citations from statutes and cross-references |
| `format_citation` | Format citations per Croatian conventions |
| `check_currency` | Check if statute is in force, amended, or repealed |
| `list_sources` | Data provenance information |
| `about` | Server metadata |

### EU Law Integration Tools (4)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get EU directives/regulations for Croatian statute |
| `get_croatian_implementations` | Find Croatian laws implementing EU act |
| `search_eu_implementations` | Search EU documents with Croatian implementation counts |
| `validate_eu_compliance` | Check implementation status |

---

## EU Law Integration

**4,407 cross-references** linking Croatian statutes to EU law, with bi-directional lookup.

| Metric | Value |
|--------|-------|
| **EU References** | 4,407 cross-references |
| **EU Documents** | 816 unique directives and regulations |
| **Directives** | Auto-extracted from statute text |
| **Regulations** | Auto-extracted from statute text |
| **EUR-Lex Integration** | Automated metadata extraction |

As an EU member state, Croatia transposes EU directives into national law. This MCP server automatically detects and catalogues these cross-references, enabling bi-directional lookup between Croatian and EU legislation.

---

## Data Sources & Freshness

All content is sourced from the authoritative Croatian legal database:

- **[Narodne novine (Official Gazette)](https://www.nn.hr)** -- Official Gazette of the Republic of Croatia
- **[EUR-Lex](https://eur-lex.europa.eu/)** -- Official EU law database (cross-reference metadata)

### Census-First Ingestion Pipeline

The ingestion pipeline follows the golden standard census-first approach:

1. **Census** (`npm run census`) -- Enumerates all Croatian laws from yearly CSV indexes (1990-present)
2. **Ingest** (`npm run ingest`) -- Fetches and parses each law from ELI endpoints
3. **Build DB** (`npm run build:db`) -- Compiles seed JSON into optimized SQLite

### Automated Freshness Checks (Daily)

A daily GitHub Actions workflow monitors data sources:

| Source | Check | Method |
|--------|-------|--------|
| **New legislation** | Narodne novine CSV index | Yearly index comparison |
| **Portal availability** | nn.hr HEAD request | Reachability check |
| **Database age** | Build metadata | Flagged if >90 days old |

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from official Narodne novine (Official Gazette) publications. However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Verify critical citations** against primary sources for court filings
> - **EU cross-references** are extracted from Croatian statute text, not EUR-Lex full text
> - **Coverage** spans 1990-present but may not include the most recent amendments

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [PRIVACY.md](PRIVACY.md)

### Client Confidentiality

Queries go through the Claude API. For privileged or confidential matters, use on-premise deployment. See [PRIVACY.md](PRIVACY.md) for data handling guidance.

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/Croatian-law-mcp
cd Croatian-law-mcp
npm install
npm run build
npm test
```

### Running Locally

```bash
npm run dev                                       # Start MCP server
npx @anthropic/mcp-inspector node dist/index.js   # Test with MCP Inspector
```

### Data Management

```bash
npm run census                          # Enumerate all Croatian laws (census.json)
npm run ingest                          # Census-driven full ingestion
npm run ingest -- --resume              # Resume interrupted ingestion
npm run ingest -- --limit 10            # Test with 10 laws
npm run build:db                        # Rebuild SQLite database
npm run check-updates                   # Check for amendments
npm run verify:upstream                 # Verify provisions against source
npm run catalog:build-csv               # Build catalog from CSV indexes
npm run catalog:ingest                  # Ingest from catalog (incremental)
npm run catalog:sync-fast               # One-shot catalog + ingest
```

### Performance

- **Search Speed:** <100ms for most FTS5 queries
- **Database Size:** ~253 MB (optimized SQLite with unicode61 tokenizer)
- **Reliability:** 99.7% ingestion success rate (4,531 of 4,529 ingestable laws)

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, MiFID II, eIDAS, and more. Full regulatory text with article-level search. `npx @ansvar/eu-regulations-mcp`

### [@ansvar/swedish-law-mcp](https://github.com/Ansvar-Systems/swedish-law-mcp)
**Query 2,415 Swedish statutes directly from Claude** -- DSL, BrB, ABL, MB, and more. Full provision text with EU cross-references. `npx @ansvar/swedish-law-mcp`

### [@ansvar/us-regulations-mcp](https://github.com/Ansvar-Systems/US_Compliance_MCP)
**Query US federal and state compliance laws** -- HIPAA, CCPA, SOX, GLBA, FERPA, and more. `npm install @ansvar/us-regulations-mcp`

### [@ansvar/security-controls-mcp](https://github.com/Ansvar-Systems/Security-controls-MCP)
**Query 261 security frameworks** -- NIST CSF, ISO 27001, CIS Controls, SCF, and 1,451 mapped controls. `npx @ansvar/security-controls-mcp`

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- English translations for key statutes
- Historical statute versions and amendment tracking
- Case law integration
- Enhanced definition extraction

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{croatian_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Croatian Law MCP Server: Production-Grade Croatian Legal Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/Croatian-law-mcp},
  note = {Comprehensive Croatian legal database with 4,531 statutes and EU law cross-references}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Statutes:** Croatian Government Open Data (public domain under Copyright Act Art. 8)
- **EU Metadata:** EUR-Lex (EU public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools for the European market. This MCP server started as our internal reference tool for Croatian law -- turns out everyone building for the Croatian market has the same research frustrations.

So we're open-sourcing it. Navigating 4,531 statutes shouldn't require a law degree.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>
