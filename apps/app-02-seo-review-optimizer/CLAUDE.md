# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReviewBoost AI is a Shopify app for AI-powered review response automation. It syncs product reviews from Shopify, generates professional AI responses using Claude, and publishes them back to the store. This is App #2 in the APEX eCommerce Portfolio.

**Status**: Phase 0 Complete - Project skeleton created. Ready for Phase 1 (Core MVP).

## Tech Stack

- **Framework**: Remix + @shopify/shopify-app-remix
- **Database**: PostgreSQL (Railway) with Prisma ORM
- **Queue**: Bull + Redis
- **AI**: Claude API (Haiku for cost efficiency)
- **Email**: Resend
- **Hosting**: Railway
- **UI**: Shopify Polaris

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Run production server
npm run typecheck        # TypeScript type checking

# Tests
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:deploy    # Deploy migrations (production)
```

## Architecture

### Core Flow (To Be Implemented)
1. **Sync**: Fetch reviews from Shopify Product Reviews API
2. **Analyze**: Detect sentiment (positive 4-5★, neutral 3★, negative 1-2★)
3. **Generate**: Create AI response with selected tone
4. **Edit**: Allow merchant to modify response
5. **Publish**: Post response back to Shopify

### Key Patterns

**Shopify Embedded App Configuration** (`app/shopify.server.ts`):
- `isEmbeddedApp: true` - CRITICAL for iframe functionality
- `unstable_newEmbeddedAuthStrategy: true` - Required for token exchange
- Uses `PrismaSessionStorage` for session management
- `afterAuth` hook creates/updates Shop record on install

**CSP Headers** (`app/entry.server.tsx`):
- Calls `addDocumentResponseHeaders(request, responseHeaders)` - CRITICAL for embedded iframe

**OAuth Routes** (`app/routes/auth.$.tsx`):
- Must export `headers` and `ErrorBoundary` using `boundary.*` functions
- Handles all `/auth/*` paths automatically

**App Layout** (`app/routes/app.tsx`):
- Wraps all `/app/*` routes with `AppProvider` and `NavMenu`
- Authenticates via `authenticate.admin(request)`
- Must export `headers` and `ErrorBoundary`

### Database Models (Prisma)

- **Shop**: Store settings, plan, usage tracking, brand voice
- **Subscription**: Billing tracking with Shopify charge ID
- **Review**: Synced reviews with response status workflow
- **ResponseTemplate**: Saved response templates by category
- **Session**: Shopify OAuth session storage

### Billing Tiers
- Free: 10 responses/month
- Starter ($19): 100 responses/month
- Growth ($49): Unlimited + bulk features
- Agency ($149): Multi-store

## Critical Implementation Notes

### Embedded App Requirements
Every route under `app/routes/app.*` MUST:
1. Call `authenticate.admin(request)` in loader
2. Export `headers` function using `boundary.headers(headersArgs)`
3. Export `ErrorBoundary` using `boundary.error(useRouteError())`

### Session Storage Pattern
`app/utils/session-storage.server.ts` uses lazy-loaded singleton:
```typescript
let prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient { ... }
```

## Environment Variables

```bash
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=
RESEND_API_KEY=
```

## Reference Documents

Before making changes, read:
1. `/APEX_FRAMEWORK.md` - Architecture principles
2. `REVIEWBOOST_BUILD_GUIDE.md` - Detailed build phases
3. `/apps/app-01-conversionai/` - Working reference implementation

## Documentation Protocol

After every completed task, update `IMPLEMENTATION_LOG.md` with:
- Status (DONE/BLOCKED/FAILED)
- Files modified
- Verification results
- Issues encountered
- Next steps

After 3 attempts on a blocker, stop and document for escalation.
