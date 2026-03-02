# Croatian Law MCP Server

**The NN (Narodne novine) alternative for the AI age.**

[![npm version](https://badge.fury.io/js/@ansvar%2Fcroatian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/croatian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/croatian-law-mcp?style=social)](https://github.com/Ansvar-Systems/croatian-law-mcp)
[![CI](https://github.com/Ansvar-Systems/croatian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/croatian-law-mcp/actions/workflows/ci.yml)
[![Database](https://img.shields.io/badge/database-pre--built-green)](docs/EU_INTEGRATION_GUIDE.md)
[![Provisions](https://img.shields.io/badge/provisions-157%2C667-blue)](docs/EU_INTEGRATION_GUIDE.md)

Query **4,531 Croatian statutes** -- from the Zakon o provedbi GDPR and Kazneni zakon to the Zakon o radu, Zakon o trgovačkim društvima, and more -- directly from Claude, Cursor, or any MCP-compatible client.

If you're building legal tech, compliance tools, or doing Croatian legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Croatian legal research means navigating Narodne novine, zakon.hr, and EUR-Lex for EU implementation status -- across a dense system of codes and implementing regulations. Whether you're:

- A **lawyer** validating citations before the Vrhovni sud (Supreme Court) or Ustavni sud (Constitutional Court)
- A **compliance officer** checking GDPR implementation status under the Zakon o provedbi Opće uredbe o zaštiti podataka
- A **legal tech developer** building tools on Croatian law
- A **researcher** tracing EU directive transposition across 4,531 statutes

...you shouldn't need dozens of browser tabs and manual cross-referencing. Ask Claude. Get the exact provision. With context.

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

- *"Što govori Zakon o provedbi Opće uredbe o zaštiti podataka o privoli?"*
- *"Je li Kazneni zakon još uvijek na snazi?"*
- *"Pretraži 'zaštita osobnih podataka' u hrvatskom zakonodavstvu"*
- *"Koje EU direktive provodi Zakon o radu?"*
- *"Što kaže članak 144. Kaznenog zakona o povredi tajnosti?"*
- *"Pronađi odredbe o prijavljivanju povreda osobnih podataka"*
- *"Koji hrvatski zakoni provode NIS2 direktivu?"*
- *"Validiraj citat 'članak 5. Zakona o zaštiti osobnih podataka'"*
- *"Usporedi zahtjeve za zaštitu podataka kroz NIS2 implementacije u hrvatskom pravu"*

---

## What's Included

| Category | Count | Details |
|----------|-------|---------|
| **Statutes** | 4,531 statutes | Comprehensive Croatian legislation from Narodne novine |
| **Provisions** | 157,667 articles | Full-text searchable with FTS5 |
| **Database Size** | 253 MB | Optimized SQLite, portable |
| **Freshness Checks** | Automated | Drift detection against Narodne novine |

**Verified data only** -- every citation is validated against official sources (Narodne novine, zakon.hr). Zero LLM-generated content.

---

## See It In Action

### Why This Works

**Verbatim Source Text (No LLM Processing):**
- All statute text is ingested from Narodne novine (nn.hr) and zakon.hr official sources
- Provisions are returned **unchanged** from SQLite FTS5 database rows
- Zero LLM summarization or paraphrasing -- the database contains statute text, not AI interpretations

**Smart Context Management:**
- Search returns ranked provisions with BM25 scoring (safe for context)
- Provision retrieval gives exact text by statute identifier + article number
- Cross-references help navigate without loading everything at once

**Technical Architecture:**
```
Narodne novine / zakon.hr --> Parse --> SQLite --> FTS5 snippet() --> MCP response
                               ^                        ^
                        Provision parser         Verbatim database query
```

### Traditional Research vs. This MCP

| Traditional Approach | This MCP Server |
|---------------------|-----------------|
| Search zakon.hr by statute name | Search by plain Croatian: *"zaštita osobnih podataka pristanak"* |
| Navigate multi-article codes manually | Get the exact provision with context |
| Manual cross-referencing between laws | `build_legal_stance` aggregates across sources |
| "Je li ovaj zakon na snazi?" -- check manually | `check_currency` tool -- answer in seconds |
| Find EU basis -- dig through EUR-Lex | `get_eu_basis` -- linked EU directives instantly |
| No API, no integration | MCP protocol -- AI-native |

**Traditional:** Pretraži zakon.hr --> Navigi višečlane zakone --> Ctrl+F --> Usporedi s EU direktivama --> Ponovi

**This MCP:** *"Koji EU akt je osnova za članak 5. Zakona o provedbi GDPR?"* --> Done.

---

## Available Tools (13)

### Core Legal Research Tools (8)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 full-text search across 157,667 provisions with BM25 ranking. Supports Croatian, quoted phrases, boolean operators, prefix wildcards |
| `get_provision` | Retrieve specific provision by statute identifier + article (e.g., "Kazneni zakon" + "144") |
| `check_currency` | Check if a statute is in force, amended, or repealed |
| `validate_citation` | Validate citation against database -- zero-hallucination check |
| `build_legal_stance` | Aggregate citations from multiple statutes for a legal topic |
| `format_citation` | Format citations per Croatian conventions (full/short/pinpoint) |
| `list_sources` | List all available statutes with metadata, coverage scope, and data provenance |
| `about` | Server info, capabilities, dataset statistics, and coverage summary |

### EU Law Integration Tools (5)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get EU directives/regulations for a Croatian statute |
| `get_croatian_implementations` | Find Croatian laws implementing a specific EU act |
| `search_eu_implementations` | Search EU documents with Croatian implementation counts |
| `get_provision_eu_basis` | Get EU law references for a specific provision |
| `validate_eu_compliance` | Check implementation status (future, requires EU MCP) |

---

## EU Law Integration

Croatia joined the EU on 1 July 2013. All EU regulations apply directly; directives require transposition into Croatian law.

| Metric | Value |
|--------|-------|
| **EU Membership** | Since 1 July 2013 |
| **Acquis communautaire** | Full EU legal order applies |
| **GDPR** | Implemented via Zakon o provedbi Opće uredbe o zaštiti podataka (NN 42/2018) |
| **NIS2** | Transposed via Zakon o kibernetičkoj sigurnosti (NN 14/2024) |
| **AML4/5** | Implemented via Zakon o sprječavanju pranja novca i financiranja terorizma |
| **EUR-Lex Integration** | Cross-references link Croatian statutes to source EU acts |

### Key EU-Derived Croatian Legislation

1. **Zakon o provedbi Opće uredbe o zaštiti podataka (NN 42/2018)** -- GDPR implementation
2. **Zakon o kibernetičkoj sigurnosti (NN 14/2024)** -- NIS2 transposition
3. **Zakon o elektroničkim komunikacijama** -- Electronic Communications Code transposition
4. **Zakon o tržištu kapitala** -- MiFID II transposition
5. **Zakon o sprječavanju pranja novca** -- AML directive transposition

See [EU_INTEGRATION_GUIDE.md](docs/EU_INTEGRATION_GUIDE.md) for detailed documentation and [EU_USAGE_EXAMPLES.md](docs/EU_USAGE_EXAMPLES.md) for practical examples.

---

## Data Sources & Freshness

All content is sourced from authoritative Croatian legal databases:

- **[Narodne novine](https://narodne-novine.nn.hr/)** -- Official Gazette of the Republic of Croatia
- **[Zakon.hr](https://www.zakon.hr/)** -- Consolidated Croatian legislation portal
- **[EUR-Lex](https://eur-lex.europa.eu/)** -- Official EU law database (cross-reference metadata)

### Data Provenance

| Field | Value |
|-------|-------|
| **Authority** | Narodne novine d.d. (Official Gazette) |
| **Languages** | Croatian (sole official legislative language) |
| **Coverage** | All national Croatian legislation; EU regulations apply directly |
| **Source** | narodne-novine.nn.hr, zakon.hr |

### Automated Freshness Checks

A [GitHub Actions workflow](.github/workflows/check-updates.yml) monitors Narodne novine for changes:

| Check | Method |
|-------|--------|
| **Statute amendments** | Drift detection against known provision anchors |
| **New statutes** | Comparison against NN publication index |
| **Repealed statutes** | Status change detection |

**Verified data only** -- every citation is validated against official sources. Zero LLM-generated content.

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |
| **Socket.dev** | Supply chain attack detection | PRs |
| **Dependabot** | Automated dependency updates | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from official Narodne novine and zakon.hr publications. However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Court case coverage is not included** -- do not rely solely on this for case law research; consult official Vrhovni sud and Ustavni sud databases
> - **Verify critical citations** against primary sources for court filings
> - **EU cross-references** are derived from statute text and metadata, not EUR-Lex full text analysis
> - **Consolidated versions** on zakon.hr may differ from the Narodne novine original -- always verify against the official gazette for legal proceedings

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [PRIVACY.md](PRIVACY.md)

### Client Confidentiality

Queries go through the Claude API. For privileged or confidential matters, use on-premise deployment. Consult Hrvatska odvjetnička komora (HOK) guidelines on the use of AI tools in legal practice.

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/croatian-law-mcp
cd croatian-law-mcp
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
npm run ingest                    # Ingest statutes from Narodne novine
npm run catalog:crawl             # Crawl NN law catalog
npm run catalog:build-csv         # Build catalog from CSV
npm run catalog:ingest            # Ingest from catalog
npm run catalog:sync-fast         # Fast sync via CSV + ingest
npm run build:db                  # Rebuild SQLite database
npm run drift:detect              # Run drift detection against anchors
```

### Performance

- **Search Speed:** <100ms for most FTS5 queries
- **Database Size:** 253 MB (optimized, portable)
- **Reliability:** 100% ingestion success rate across 4,531 statutes

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, MiFID II, eIDAS, and more. `npx @ansvar/eu-regulations-mcp`

### [@ansvar/slovenian-law-mcp](https://github.com/Ansvar-Systems/Slovenian-law-mcp)
**Query Slovenian legislation** -- neighbour state, similar legal system. `npx @ansvar/slovenian-law-mcp`

### [@ansvar/security-controls-mcp](https://github.com/Ansvar-Systems/security-controls-mcp)
**Query 261 security frameworks** -- ISO 27001, NIST CSF, SOC 2, CIS Controls, SCF, and more. `npx @ansvar/security-controls-mcp`

**70+ national law MCPs** covering Austria, Belgium, Czech Republic, Denmark, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, and more.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- Court case law expansion (Vrhovni sud, Ustavni sud, VSRH)
- EU cross-reference expansion (full directive-to-statute mapping)
- Historical statute versions and amendment tracking
- Lower court decisions (Županijski sud, Općinski sud archives)

---

## Roadmap

- [x] Core statute database with FTS5 search
- [x] Full corpus ingestion (4,531 statutes, 157,667 provisions)
- [x] EU law integration tools
- [x] Vercel Streamable HTTP deployment
- [x] npm package publication
- [ ] Court case law expansion (Vrhovni sud, Ustavni sud)
- [ ] Full EU text integration (via @ansvar/eu-regulations-mcp)
- [ ] Lower court coverage (Županijski, Općinski archives)
- [ ] Historical statute versions (amendment tracking)
- [ ] Web API for programmatic access

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{croatian_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Croatian Law MCP Server: AI-Powered Legal Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/croatian-law-mcp},
  note = {4,531 Croatian statutes with 157,667 provisions and EU law cross-references}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Statutes & Legislation:** Narodne novine d.d. (public domain government works)
- **EU Metadata:** EUR-Lex (EU public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools for the European market. This MCP server started as our internal reference tool for Croatian law -- turns out everyone building for the Adriatic and EU markets has the same research frustrations.

So we're open-sourcing it. Navigating 4,531 statutes and their EU source directives shouldn't require a law degree.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>
