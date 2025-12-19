# 🎯 APEX eCommerce Portfolio

Monorepo for building 5-10 profitable Shopify/WooCommerce apps generating $10K-50K MRR.

## Quick Start

### Setup
```bash
npm install
```

### Start New App
```bash
# 1. Copy template
cp -r templates/shopify-remix-app apps/app-01-your-name

# 2. Fill PROJECT_BRIEF.md
cd apps/app-01-your-name
# Edit PROJECT_BRIEF.md

# 3. Install & run
npm install
npm run dev
```

## Structure

- `/apps/*` — Individual Shopify/WooCommerce apps
- `/packages/*` — Shared code (auth, billing, UI, database, utils)
- `/templates/*` — Starter templates for new apps
- `/docs/*` — Documentation & learnings

## Apps in Portfolio

### App #1: ConversionAI 🎯 (In Development)
**Status**: ✅ Week 1 Complete - Core Logic Implemented
**Tech Stack**: Remix + Shopify App Remix + Railway + Claude API + Playwright + Resend

AI-powered CRO consultant that analyzes Shopify stores and provides prioritized, actionable recommendations to increase conversion rates.

- **Goal**: Help merchants increase conversion rates without expensive CRO agencies
- **Pricing**: $29-199/mo (vs $2K-10K/mo for agencies)
- **Target**: $10K-15K MRR Year 1
- **Timeline**: 3-week MVP
- **Location**: `apps/app-01-conversionai/`
- **Docs**: See `apps/app-01-conversionai/README.md`

**Key Features**:
- 60-second store analysis
- 10-15 AI-generated recommendations per analysis
- Impact/effort scoring with priority ranking
- Copy-paste code snippets
- Email notifications
- Freemium billing model

**Progress**:
- [x] Project scaffolding (31 files)
- [x] Database schema (4 models)
- [x] UI routes (dashboard, recommendations, analysis)
- [x] Background jobs (Bull queue)
- [x] API integrations (Shopify, Claude, Resend)
- [x] Documentation (3 guides)
- [x] Shopify API implementation (Analytics, Products, Themes)
- [x] Claude API integration (Sonnet 4.5 with Vision)
- [x] Screenshot automation (Playwright with retry logic)
- [ ] OAuth flow completion
- [ ] Beta testing with real stores

---

## Shared Packages

- `@apex/shared-auth` — Shopify OAuth logic
- `@apex/shared-billing` — Shopify Billing API wrapper
- `@apex/shared-ui` — React components (Polaris-based)
- `@apex/shared-db` — Prisma schema + migrations
- `@apex/shared-utils` — Helper functions

## Commands

```bash
npm run dev              # Run specific app (from app directory)
npm run build            # Build all workspaces
npm run lint             # Lint all code
npm run format           # Format with Prettier
npm run type-check       # TypeScript check
```

## Philosophy

- **Portfolio > Perfect**: 5 good apps > 1 perfect app
- **Reuse Relentlessly**: Extract to shared packages after 2nd use
- **Ship Fast**: 2-4 weeks to MVP

Read `APEX_FRAMEWORK.md` before starting.
