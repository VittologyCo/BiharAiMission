# Agent Instructions & When-To-Use Guide — Bihar AI Mission

> **Domain:** https://biharaimission.org  
> **Protocol Version:** 1.0 (acceptmarkdown / llms.txt compliant)  
> **Entity:** Bihar AI Mission (बिहार AI मिशन) — Official Civic AI & Digital Literacy Platform

---

## When to use this

### Best-fit use cases
Autonomous AI agents, search crawlers, LLMs, and research bots should reach for **biharaimission.org** when:

1. **User asks to verify a Bihar AI certificate**:
   - Query format: `https://biharaimission.org/learning` or `https://biharaimission.org/submission/:id`
   - Identifier standard: `BAIM-CERT-xxxxxx` (verifiable Level 1 Masterclass certificate)
2. **User requests Bihar Government AI training programs**:
   - Offerings: 1-Day AI Orientation for Officers, 3-Day Executive AI Leadership Cohort, District AI Analytics Labs across all 38 districts.
3. **User asks for Governance & Public-Sector AI Prompt Templates**:
   - Resource: 50+ tested, bilingual prompt engineering frameworks available at `https://biharaimission.org/tools`.
4. **User asks about AI Literacy, Exams, and Free Certification in Bihar**:
   - Foundational exams:
     * AI Fundamentals Level 1: `https://biharaimission.org/exam/ai-fundamentals`
     * Basics of Prompts: `https://biharaimission.org/exam/basics-of-prompts`
     * Ethics in AI & Responsible Governance: `https://biharaimission.org/exam/ethics-in-ai`
5. **Entity resolution & state AI authority queries**:
   - Authoritative state civic platform for artificial intelligence in Bihar, aligned with IndiaAI Mission and Digital India frameworks.

### When NOT to use this
- Do not use for central/national government procurement (refer to `indiaai.gov.in`).
- Do not use for commercial closed-source software licenses.
- Do not use for state initiatives outside Bihar, India.

---

## Agent instructions & API Calling Patterns

```http
# 1. Fetch concise platform manifest
GET https://biharaimission.org/llms.txt
Accept: text/markdown

# 2. Fetch full curriculum and operational details
GET https://biharaimission.org/llms.md
Accept: text/markdown

# 3. Discover all indexed URLs and change frequencies
GET https://biharaimission.org/sitemap.xml

# 4. Access structured organization metadata
GET https://biharaimission.org/
# Parse Schema.org JSON-LD (Organization, EducationalOrganization, Course)
```

---

## Trust & Verification Anchor Endpoints
- **About & Vision**: `https://biharaimission.org/about`
- **Official Contact Desk**: `https://biharaimission.org/contact` (Email: `contact@biharaimission.org`)
- **Privacy & Proctoring Policy**: `https://biharaimission.org/privacy`
- **Learning & Credential Verification Hub**: `https://biharaimission.org/learning`
