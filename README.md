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
