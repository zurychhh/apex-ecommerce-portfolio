# 🎯 ConversionAI - AI-Powered CRO Consultant for Shopify

**App #1 in the APEX eCommerce Portfolio**

ConversionAI is an AI-powered CRO consultant that analyzes Shopify stores and provides prioritized, actionable recommendations to increase conversion rates. Think of it as a $2K-10K/month CRO agency for just $29-199/month.

## Overview

- **Goal**: Help Shopify merchants increase conversion rates without expensive agencies
- **Tech Stack**: Remix + Shopify App Remix + Railway + Claude API + Playwright + Resend
- **Timeline**: 3-week MVP
- **Status**: 🟢 MVP Feature Complete (95%) - Ready for E2E Testing
- **Production URL**: `https://conversionai-web-production.up.railway.app`

## Features

### MVP (Phase 1)
- ✅ Shopify OAuth integration
- ✅ Store analysis (60-90 seconds)
- ✅ AI-generated recommendations (10-15 per analysis)
- ✅ Prioritization by impact & effort
- ✅ Code snippets for implementation
- ✅ Freemium billing (Free, Basic, Pro, Enterprise)
- ✅ Email notifications

### Future Phases
- **Phase 2** (Months 4-6): Semi-automated A/B testing
- **Phase 3** (Months 9-12): Fully automated testing via Theme Extensions

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Railway account (for hosting + PostgreSQL + Redis)
- Shopify Partner account (for app credentials)
- Anthropic API key (for Claude AI)
- Resend API key (for emails)

### Local Development Setup

```bash
# 1. Navigate to project directory
cd apps/app-01-conversionai

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env and fill in your credentials:
#   - SHOPIFY_API_KEY & SHOPIFY_API_SECRET (from Partners Dashboard)
#   - DATABASE_URL (PostgreSQL connection string)
#   - REDIS_URL (Redis connection string)
#   - ANTHROPIC_API_KEY (from console.anthropic.com)
#   - RESEND_API_KEY (from resend.com)

# 4. Install Playwright browsers
npx playwright install

# 5. Initialize database
npm run prisma:generate
npm run prisma:migrate dev --name init

# 6. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Shopify Partner Setup

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Create new app → Custom app
3. Configure:
   - **App URL**: `https://your-railway-url.railway.app` (or localhost for dev)
   - **Allowed redirection URLs**:
     - `https://your-railway-url.railway.app/auth/callback`
     - `https://your-railway-url.railway.app/auth/shopify/callback`
   - **Scopes**: `read_products,read_orders,read_themes,read_analytics,read_customers`

## Project Structure

```
apps/app-01-conversionai/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx              # Dashboard (metrics, billing, polling)
│   │   ├── app.recommendations._index.tsx  # Recommendations list
│   │   ├── app.recommendations.$id.tsx     # Recommendation detail
│   │   ├── app.analysis.start.tsx      # Start analysis
│   │   ├── app.upgrade.tsx             # Pricing/upgrade page
│   │   ├── app.settings.tsx            # Settings
│   │   ├── api.billing.create.tsx      # Subscription creation
│   │   ├── api.billing.callback.tsx    # Billing callback handler
│   │   ├── api.cron.weekly-refresh.tsx # Weekly cron endpoint
│   │   └── auth.$.tsx                  # OAuth routes
│   ├── jobs/
│   │   ├── analyzeStore.ts             # Main analysis logic
│   │   └── captureScreenshots.ts       # Playwright screenshots
│   ├── utils/
│   │   ├── db.server.ts                # Prisma client
│   │   ├── shopify.server.ts           # Shopify API helpers
│   │   ├── billing.server.ts           # Shopify Billing API
│   │   ├── claude.server.ts            # Claude API integration
│   │   ├── queue.server.ts             # Bull job queue
│   │   ├── email.server.ts             # Resend email service
│   │   └── logger.server.ts            # Structured logging
│   └── components/                     # React components
├── prisma/
│   └── schema.prisma                   # Database schema
├── .env.example                        # Environment variables template
├── railway.json                        # Railway deployment config
├── shopify.app.toml                    # Shopify CLI config
└── package.json                        # Dependencies
```

## Database Schema

### Models

**Shop**
- Core shop info (domain, access token, scopes)
- ConversionAI-specific: plan, primaryGoal, lastAnalysis

**Recommendation**
- AI-generated recommendations
- Scoring: impactScore, effortScore, priority
- Implementation: codeSnippet, mockupUrl, reasoning
- Status tracking: pending, implemented, skipped

**ShopMetrics**
- Snapshots of store metrics
- conversionRate, avgOrderValue, cartAbandonmentRate, etc.

**Subscription**
- Shopify billing integration
- Plans: free, basic, pro, enterprise

## Development Commands

```bash
# Development
npm run dev                 # Start dev server
npm run typecheck           # TypeScript check

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Run migrations (dev)
npm run prisma:deploy       # Deploy migrations (prod)
npm run prisma:studio       # Open Prisma Studio

# Build & Deploy
npm run build               # Build for production
npm start                   # Start production server
```

## How It Works

### Analysis Flow

1. **User triggers analysis** (`/app/analysis/start`)
2. **Job queued** (Bull + Redis)
3. **Data collection**:
   - Fetch Shopify analytics (conversion rate, AOV, etc.)
   - Fetch products (top 5)
   - Fetch theme info
4. **Screenshot capture** (Playwright):
   - Homepage
   - Product page
   - Cart page
5. **Claude API call**:
   - Send prompt with store data + screenshots (Vision API)
   - Receive 10-15 prioritized recommendations
6. **Parse & save** to database
7. **Email notification** (Resend)

### Recommendation Priority

Priority = `(impactScore * 2) - effortScore`

Quick wins (high impact, low effort) appear first.

## Environment Variables

Required:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SHOPIFY_API_KEY` | Shopify app API key | Partners Dashboard |
| `SHOPIFY_API_SECRET` | Shopify app secret | Partners Dashboard |
| `DATABASE_URL` | PostgreSQL connection | Railway auto-provides |
| `REDIS_URL` | Redis connection | Railway auto-provides |
| `ANTHROPIC_API_KEY` | Claude API key | console.anthropic.com |
| `RESEND_API_KEY` | Resend API key | resend.com/api-keys |
| `HOST` | App URL | Railway URL or custom domain |
| `SCOPES` | Shopify scopes | See shopify.app.toml |

## Deployment to Railway

### Initial Setup

1. Create Railway project
2. Add PostgreSQL plugin
3. Add Redis plugin
4. Connect GitHub repo
5. Configure environment variables (Railway will auto-set `DATABASE_URL` and `REDIS_URL`)

### Deploy

```bash
# Railway CLI (optional)
npm install -g @railway/cli
railway login
railway link
railway up

# Or: Push to main branch (auto-deploys via GitHub)
git push origin main
```

### Post-Deployment

1. Run migrations:
   ```bash
   railway run npm run prisma:deploy
   ```

2. Update Shopify app URLs to Railway URL

3. Test installation in development store

4. Configure weekly cron job (see below)

## Cron Job Configuration

The app includes a weekly auto-refresh feature for Pro and Enterprise plans.

### 1. Add CRON_SECRET to Railway

Generate a secure secret:
```bash
openssl rand -base64 32
```

Add to Railway (via Dashboard):
1. Go to https://railway.app/project/c1ad5a4a-a4ff-4698-bf0f-e1f950623869
2. Select "conversionai-web" service
3. Go to Variables tab
4. Add: `CRON_SECRET` = `<your-generated-secret>`
5. Redeploy to apply

### 2. Configure External Cron Service

Railway doesn't have built-in cron scheduling, so use an external service:

**Option A: cron-job.org (Recommended)**
1. Go to https://console.cron-job.org
2. Create account
3. Create new cron job:
   - **Title**: ConversionAI Weekly Refresh
   - **URL**: `https://conversionai-web-production.up.railway.app/api/cron/weekly-refresh`
   - **Schedule**: `0 9 * * 1` (Every Monday at 9 AM UTC)
   - **HTTP Method**: POST
   - **Headers**:
     ```
     Authorization: Bearer <CRON_SECRET>
     Content-Type: application/json
     ```
4. Save and test

**Option B: EasyCron**
Similar setup at https://www.easycron.com

### 3. Test Manually

```bash
# Test the cron endpoint
curl -X POST \
  https://conversionai-web-production.up.railway.app/api/cron/weekly-refresh \
  -H "Authorization: Bearer <CRON_SECRET>" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "timestamp": "2025-12-20T17:00:00.000Z",
#   "shopsProcessed": 0,
#   "jobsQueued": 0,
#   "jobs": []
# }
```

### How It Works

- Runs every Monday at 9 AM UTC
- Finds Pro/Enterprise shops with `lastAnalysis` > 7 days ago
- Clears old recommendations
- Queues new analysis jobs
- Sends email notifications when complete

### Troubleshooting Cron

**If 401 Unauthorized:**
- Verify `CRON_SECRET` matches in Railway and cron service
- Check header format: `Authorization: Bearer <secret>`

**If 500 Error:**
- Check Railway logs: `railway logs`
- Verify database connection

**If no shops queued:**
- Expected if no Pro/Enterprise users with old analyses
- Check database: `SELECT * FROM "Shop" WHERE plan IN ('pro', 'enterprise');`

## Cost Breakdown

**Month 1-3** (low traffic):
- Railway: $5-10/mo (app + PostgreSQL + Redis)
- Claude API: $20-50/mo (50-200 analyses)
- Resend: $0/mo (free tier covers 3K emails)
- **Total**: ~$25-60/mo

**Month 6+** (scaling):
- Railway: $15-30/mo
- Claude API: $100-200/mo (500+ analyses)
- Resend: $20/mo (10K+ emails)
- **Total**: ~$135-250/mo

## Roadmap

### Week 1 (Foundation) ✅ COMPLETE
- [x] Monorepo setup
- [x] Database schema
- [x] Shopify OAuth
- [x] Basic UI (dashboard, recommendations)
- [x] Shopify data fetching (Analytics, Products, Themes APIs)
- [x] Claude API integration (Sonnet with Vision)
- [x] Screenshot automation (Playwright with retry logic)

### Week 2 (Features) ✅ COMPLETE
- [x] Onboarding flow
- [x] Recommendations detail view
- [x] Code snippet viewer
- [x] Billing integration (Shopify Billing API)
- [x] Email notifications (Resend)
- [x] Weekly cron endpoint

### Week 3 (Polish & Deploy) 🟡 IN PROGRESS
- [x] Error handling
- [x] Loading states & animations
- [x] Mobile responsiveness (Polaris)
- [x] Production deploy (Railway)
- [ ] Configure cron job (external service)
- [ ] E2E testing on dev store
- [ ] Beta testing

### Post-MVP
- Competitor tracking
- Industry benchmarks
- ROI calculator
- A/B testing (Phase 2)

## Testing

```bash
# Run tests (when implemented)
npm test

# Manual testing checklist
- [ ] Install app in development store
- [ ] Complete onboarding flow
- [ ] Trigger analysis
- [ ] View recommendations
- [ ] Mark recommendation as implemented
- [ ] Test billing flow
- [ ] Verify email notifications
```

## Troubleshooting

### Analysis job fails
- Check Claude API key is valid
- Ensure Redis is running
- Check Playwright browsers installed: `npx playwright install`

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check Railway PostgreSQL is running
- Run migrations: `npm run prisma:migrate dev`

### Shopify OAuth fails
- Verify `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`
- Check `HOST` matches Shopify app URLs
- Ensure scopes match shopify.app.toml

## Support & Documentation

- **Project Brief**: `/PROJECT_BRIEF.md`
- **APEX Framework**: `/APEX_FRAMEWORK.md`
- **Deployment Guide**: `/docs/deployment.md`
- **Architecture**: `/docs/architecture.md`

## Contributing

This is app #1 in the APEX portfolio. As patterns emerge, extract reusable code to shared packages:

- `@apex/shared-auth` - Shopify OAuth logic
- `@apex/shared-billing` - Subscription management
- `@apex/shared-ui` - React components
- `@apex/shared-db` - Database utilities
- `@apex/shared-utils` - Helper functions

## License

Private - APEX eCommerce Portfolio

---

Built with ❤️ using Claude Code

**Timeline**: 3-week MVP → $10K-15K MRR Year 1
