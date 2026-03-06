# Privacy & Client Confidentiality / Privatnost i povjerljivost

**IMPORTANT READING FOR LEGAL PROFESSIONALS**
**VAŽNO ŠTIVO ZA PRAVNE STRUČNJAKE**

This document addresses privacy and confidentiality considerations when using this Tool, with particular attention to professional obligations under Croatian bar association rules.

---

## Executive Summary

**Key Risks:**
- Queries through Claude API flow via Anthropic cloud infrastructure
- Query content may reveal client matters and privileged information
- Hrvatska odvjetnička komora (Croatian Bar Association) rules require strict confidentiality controls

**Safe Use Options:**
1. **General Legal Research**: Use Tool for non-client-specific queries
2. **Local npm Package**: Install `@ansvar/croatian-law-mcp` locally — database queries stay on your machine
3. **Remote Endpoint**: Vercel Streamable HTTP endpoint — queries transit Vercel infrastructure
4. **On-Premise Deployment**: Self-host with local LLM for privileged matters

---

## Data Flows and Infrastructure

### MCP (Model Context Protocol) Architecture

This Tool uses the **Model Context Protocol (MCP)** to communicate with AI clients:

```
User Query -> MCP Client (Claude Desktop/Cursor/API) -> Anthropic Cloud -> MCP Server -> Database
```

### Deployment Options

#### 1. Local npm Package (Most Private)

```bash
npx @ansvar/croatian-law-mcp
```

- Database is local SQLite file on your machine
- No data transmitted to external servers (except to AI client for LLM processing)
- Full control over data at rest

#### 2. Remote Endpoint (Vercel)

```
Endpoint: https://croatian-law-mcp.vercel.app/mcp
```

- Queries transit Vercel infrastructure
- Tool responses return through the same path
- Subject to Vercel's privacy policy

### What Gets Transmitted

When you use this Tool through an AI client:

- **Query Text**: Your search queries and tool parameters
- **Tool Responses**: Statute text, provision content, search results
- **Metadata**: Timestamps, request identifiers

**What Does NOT Get Transmitted:**
- Files on your computer
- Your full conversation history (depends on AI client configuration)

---

## Professional Obligations (Croatia)

### Croatian Bar Association Rules

Croatian lawyers (odvjetnici) are bound by strict confidentiality rules under the Zakon o odvjetništvu (Attorneys Act) and the Kodeks odvjetničke etike (Code of Attorney Ethics) of the Hrvatska odvjetnička komora.

#### Odvjetnička tajna (Attorney-Client Privilege)

- All client communications are privileged under Croatian law
- Client identity may be confidential in sensitive matters
- Case strategy and legal analysis are protected
- Information that could identify clients or matters must be safeguarded
- Breach of professional secrecy is a disciplinary offense and may constitute a criminal offense

### GDPR and Croatian Act on Implementation of GDPR

Under **GDPR** and the **Zakon o provedbi Opće uredbe o zaštiti podataka** (Croatian Act on Implementation of GDPR), when using services that process client data:

- You are the **Data Controller** (voditelj obrade)
- AI service providers (Anthropic, Vercel) may be **Data Processors** (izvršitelji obrade)
- A **Data Processing Agreement (DPA)** may be required under GDPR Article 28
- Ensure adequate technical and organizational measures
- The **AZOP** (Agencija za zaštitu osobnih podataka / Croatian Personal Data Protection Agency) oversees compliance
- International data transfers outside the EEA require appropriate safeguards (Standard Contractual Clauses, adequacy decisions)

---

## Risk Assessment by Use Case

### LOW RISK: General Legal Research

**Safe to use through any deployment:**

```
Example: "What does the Croatian Companies Act say about director liability?"
```

- No client identity involved
- No case-specific facts
- Publicly available legal information

### MEDIUM RISK: Anonymized Queries

**Use with caution:**

```
Example: "What are the penalties for tax evasion under Croatian fiscal law?"
```

- Query pattern may reveal you are working on a tax evasion matter
- Anthropic/Vercel logs may link queries to your API key

### HIGH RISK: Client-Specific Queries

**DO NOT USE through cloud AI services:**

- Remove ALL identifying details
- Use the local npm package with a self-hosted LLM
- Or use commercial legal databases with proper DPAs

---

## Data Collection by This Tool

### What This Tool Collects

**Nothing.** This Tool:

- Does NOT log queries
- Does NOT store user data
- Does NOT track usage
- Does NOT use analytics
- Does NOT set cookies

The database is read-only. No user data is written to disk.

### What Third Parties May Collect

- **Anthropic** (if using Claude): Subject to [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)
- **Vercel** (if using remote endpoint): Subject to [Vercel Privacy Policy](https://vercel.com/legal/privacy-policy)

---

## Recommendations

### For Solo Practitioners / Small Firms

1. Use local npm package for maximum privacy
2. General research: Cloud AI is acceptable for non-client queries
3. Client matters: Use commercial legal databases (IUS-INFO, Narodne novine premium)

### For Large Firms / Corporate Legal

1. Negotiate DPAs with AI service providers in compliance with GDPR Article 28
2. Consider on-premise deployment with self-hosted LLM
3. Train staff on safe vs. unsafe query patterns
4. Conduct a Data Protection Impact Assessment (DPIA) if processing client data at scale

### For Government / Public Sector

1. Use self-hosted deployment, no external APIs
2. Follow Croatian government cloud security requirements
3. Air-gapped option available for classified matters

---

## Questions and Support

- **Privacy Questions**: Open issue on [GitHub](https://github.com/Ansvar-Systems/Croatian-law-mcp/issues)
- **Anthropic Privacy**: Contact privacy@anthropic.com
- **Croatian Bar Guidance**: Consult the Hrvatska odvjetnička komora ethics guidance
- **AZOP**: Contact the Agencija za zaštitu osobnih podataka for data protection matters

---

**Last Updated**: 2026-02-22
**Tool Version**: 1.0.0
