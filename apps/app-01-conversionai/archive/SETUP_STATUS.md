# 🎯 ConversionAI - Setup Status

**Last Updated**: 2025-12-19
**Status**: ✅ Infrastructure Complete - Ready for Deployment

---

## 🚀 Production Infrastructure

### Railway Project
| Resource | ID/Value |
|----------|----------|
| **Project ID** | `c1ad5a4a-a4ff-4698-bf0f-e1f950623869` |
| **Environment ID** | `6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e` |
| **Web Service ID** | `08837d5d-0ed5-4332-882e-51d00b61eee6` |
| **PostgreSQL Service ID** | `7ea07ba1-13ee-4da6-8344-8b8e75477eb9` |
| **Redis Service ID** | `3a2363c9-1f26-4819-99fb-66cc36699ad8` |
| **Domain** | `conversionai-web-production.up.railway.app` |
| **PostgreSQL Host** | `turntable.proxy.rlwy.net:50904` |
| **Redis Host** | `mainline.proxy.rlwy.net:43368` |

### Shopify App
| Setting | Value |
|---------|-------|
| **Client ID** | `30c5af756ea767c28f82092b98ffc9e1` |
| **App Name** | ConversionAI |
| **Organization ID** | `4661608` |
| **App URL** | `https://conversionai-web-production.up.railway.app` |
| **Scopes** | `read_products,read_orders,read_themes,read_analytics,read_customers` |

### GitHub Actions
- Workflow: `/.github/workflows/deploy-conversionai.yml`
- Triggers: Push to `main` (paths: `apps/app-01-conversionai/**`)
- Required Secret: `RAILWAY_TOKEN`

---

## ✅ Completed Tasks

### Infrastructure
- [x] **Monorepo Integration**: App created in `apps/app-01-conversionai/`
- [x] **Dependencies Installed**: 659 packages (884 total with sub-dependencies)
- [x] **TypeScript Configuration**: Strict mode enabled
- [x] **Shared Packages Linked**: All @apex/* packages available
- [x] **Railway Project**: Created via API with PostgreSQL + Redis + Web service
- [x] **GitHub Actions**: Deployment workflow configured

### Database
- [x] **Prisma Schema Created**: 5 models (Shop, Recommendation, ShopMetrics, Subscription, Session)
- [x] **Database Models Extended**: Shop model enhanced for ConversionAI
- [x] **Indexes Configured**: Optimized queries for shopId, status, priority
- [x] **Database Synced**: Schema pushed to Railway PostgreSQL

### Backend Structure
- [x] **Routes Created**: 6 routes (dashboard, recommendations, analysis, settings, auth)
- [x] **Jobs System**: analyzeStore.ts and captureScreenshots.ts implemented
- [x] **Utilities Created**: 5 server utilities (db, shopify, claude, queue, email)
- [x] **Queue Setup**: Bull job queue with Redis integration
- [x] **Email Service**: Resend integration with 3 email templates

### Configuration
- [x] **.env.example**: Complete environment variables template
- [x] **railway.json**: Railway deployment configuration
- [x] **shopify.app.toml**: Shopify app configuration with GDPR webhooks
- [x] **package.json**: All dependencies added (Claude SDK, Playwright, Bull, Resend)

### Documentation
- [x] **README.md**: 330+ line comprehensive guide
- [x] **PROJECT_BRIEF.md**: Original requirements preserved
- [x] **SETUP_STATUS.md**: This file

---

## 📦 Installed Dependencies

### Core Application
- `@remix-run/node`, `@remix-run/react`, `@remix-run/serve` ^2.5.0
- `@shopify/polaris` ^12.0.0
- `@shopify/shopify-app-remix` ^3.0.0
- `@shopify/shopify-api` ^10.0.0
- `react` ^18.2.0, `react-dom` ^18.2.0

### ConversionAI Specific
- `@anthropic-ai/sdk` ^0.30.0 - Claude API integration
- `bull` ^4.12.0 - Job queue system
- `ioredis` ^5.3.0 - Redis client for Bull
- `playwright` ^1.40.0 - Browser automation for screenshots
- `resend` ^3.0.0 - Email service
- `@prisma/client` ^5.7.0 - Database ORM
- `prism-react-renderer` ^2.3.0 - Code syntax highlighting

### Shared Packages
- `@apex/shared-auth` - Shopify OAuth
- `@apex/shared-billing` - Subscription management
- `@apex/shared-ui` - React components
- `@apex/shared-db` - Database utilities
- `@apex/shared-utils` - Helper functions

**Total Packages**: 659 direct, 884 with dependencies
**Installation Time**: ~2 minutes
**Known Issues**: 8 vulnerabilities (6 moderate, 2 high) - review with `npm audit`

---

## 📁 File Structure Created

```
apps/app-01-conversionai/
├── app/
│   ├── routes/                     [6 files]
│   │   ├── app._index.tsx          ✅ Dashboard
│   │   ├── app.recommendations._index.tsx ✅ List view
│   │   ├── app.recommendations.$id.tsx ✅ Detail view
│   │   ├── app.analysis.start.tsx  ✅ Analysis trigger
│   │   ├── app.settings.tsx        ✅ Settings
│   │   └── auth.$.tsx              ✅ OAuth
│   │
│   ├── jobs/                       [2 files]
│   │   ├── analyzeStore.ts         ✅ Main orchestrator
│   │   └── captureScreenshots.ts   ✅ Playwright automation
│   │
│   ├── utils/                      [5 files]
│   │   ├── db.server.ts            ✅ Prisma client
│   │   ├── shopify.server.ts       ✅ API wrappers
│   │   ├── claude.server.ts        ✅ AI integration
│   │   ├── queue.server.ts         ✅ Job queue
│   │   └── email.server.ts         ✅ Notifications
│   │
│   ├── root.tsx                    ✅ Layout
│   └── shopify.server.ts           ✅ Config
│
├── prisma/
│   └── schema.prisma               ✅ Database schema
│
├── public/                         ✅ Static assets
│
├── Configuration                   [6 files]
│   ├── .env.example                ✅ Environment template
│   ├── railway.json                ✅ Railway config
│   ├── shopify.app.toml            ✅ Shopify config
│   ├── package.json                ✅ Dependencies
│   ├── tsconfig.json               ✅ TypeScript
│   └── remix.config.js             ✅ Remix
│
└── Documentation                   [3 files]
    ├── README.md                   ✅ Main guide
    ├── SETUP_STATUS.md             ✅ This file
    └── node_modules/               ✅ 659 packages
```

**Total Files Created**: 22 TypeScript/TSX + 6 config + 3 docs = **31 files**

---

## 🚀 Next Steps to Start Development

### 1. Environment Setup (5 minutes)

```bash
# Create .env file
cp .env.example .env

# Edit .env and add these credentials:
# ============================================
# REQUIRED:
# - SHOPIFY_API_KEY (from partners.shopify.com)
# - SHOPIFY_API_SECRET (from partners.shopify.com)
# - DATABASE_URL (PostgreSQL - Railway provides this)
# - REDIS_URL (Redis - Railway provides this)
# - ANTHROPIC_API_KEY (from console.anthropic.com)
# - RESEND_API_KEY (from resend.com/api-keys)
# - HOST (your Railway URL or localhost:3000 for dev)
# ============================================
```

### 2. Install Playwright Browsers (2 minutes)

```bash
npx playwright install
```

This downloads Chromium browser for screenshot automation.

### 3. Database Setup (2 minutes)

```bash
# Generate Prisma client
npm run prisma:generate

# Create initial migration
npm run prisma:migrate dev --name init
```

### 4. Start Development Server

```bash
npm run dev
```

App will be available at `http://localhost:3000`

### 5. Shopify Partner Dashboard Setup

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Apps → Create app → Custom app
3. Configure:
   - **App URL**: Your Railway URL (or http://localhost:3000 for dev)
   - **Allowed redirection URLs**:
     - `https://your-app.railway.app/auth/callback`
     - `https://your-app.railway.app/auth/shopify/callback`
   - **Scopes**: `read_products,read_orders,read_themes,read_analytics,read_customers`

---

## 🎯 Week 1 Roadmap Progress

### Monday-Tuesday: Foundation ✅ COMPLETE
- [x] Railway setup (config ready)
- [x] Shopify app scaffold
- [x] Database schema (Prisma)
- [x] OAuth flow (stub)
- [x] Basic dashboard (Polaris)

### Wednesday-Friday: Core Logic ✅ COMPLETE
- [x] Shopify data fetching (Analytics API, Products API, Themes API) - Real API calls implemented
- [x] Screenshot automation testing - Enhanced with retry logic & cookie banner dismissal
- [x] Claude API integration and prompt testing - Using Sonnet 4.5 with Vision API
- [x] Analysis job queue implementation - Full flow integrated
- [x] Prompt engineering & validation - Production-ready prompt with JSON parsing

---

## 🔧 API Keys You Need

### Shopify (Free)
1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Create app → Get API key + secret
3. **Cost**: Free

### Anthropic Claude API ($5 credit)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. **Cost**: ~$0.50-2.00 per analysis (estimated)
4. **Free Credit**: $5 for new accounts

### Resend Email (Free tier)
1. Go to [resend.com](https://resend.com)
2. Create account → Get API key
3. **Free Tier**: 3,000 emails/month
4. **Paid**: $20/mo for 50K emails

### Railway (Free $5 credit)
1. Go to [railway.app](https://railway.app)
2. Create project
3. Add PostgreSQL + Redis plugins
4. **Free Credit**: $5/month
5. **After Free**: ~$5-10/mo for starter usage

---

## 📊 Database Schema Summary

### Shop (Extended)
```typescript
id, domain, accessToken, scope, isActive
plan: 'free' | 'basic' | 'pro' | 'enterprise'
primaryGoal: string (user's CRO goal)
lastAnalysis: DateTime (last analysis run)
email: string (for notifications)
installedAt, updatedAt
```

### Recommendation (11 fields)
```typescript
id, shopId, shop (relation)
title, description, category
impactScore (1-5), effortScore (1-5), priority (calculated)
estimatedUplift, estimatedROI
reasoning, implementation, codeSnippet, mockupUrl
status: 'pending' | 'implemented' | 'skipped'
implementedAt, userRating, createdAt, updatedAt
```

### ShopMetrics (Snapshots)
```typescript
id, shopId, shop (relation)
conversionRate, avgOrderValue, cartAbandonmentRate
mobileConversionRate, desktopConversionRate
totalSessions, totalOrders, totalRevenue
recordedAt
```

### Subscription (Billing)
```typescript
id, shopId, shop (relation)
plan, status, billingOn, trialEndsOn
shopifyChargeId, createdAt, updatedAt
```

---

## 🎨 UI Components Implemented

### Dashboard (`app._index.tsx`)
- Conversion rate metrics card
- Primary goal display
- Recommendations summary
- Analysis status indicator
- Welcome banner for new installs
- Progress bar for active analysis

### Recommendations List (`app.recommendations._index.tsx`)
- Sortable by: Impact, Effort, ROI, Recent
- Impact stars (⭐⭐⭐⭐⭐)
- Effort wrenches (🔧🔧)
- Status badges
- Estimated ROI display
- Quick actions (View, Implement, Skip)

### Recommendation Detail (`app.recommendations.$id.tsx`)
- Full reasoning explanation
- Step-by-step implementation guide
- Syntax-highlighted code snippet
- Copy-to-clipboard button
- Before/After mockup (when available)
- User rating system

### Analysis Start (`app.analysis.start.tsx`)
- Primary goal selector (6 options)
- Analysis flow explanation
- Form submission with loading state
- Redirect to dashboard on start

---

## ⚙️ Job Queue Flow

### Analysis Process (8 steps)
1. **Fetch Shopify Data**: Analytics, products, theme
2. **Capture Screenshots**: Homepage, PDP, cart (desktop + mobile)
3. **Find Competitors**: Best-effort competitor discovery
4. **Build Prompt**: Comprehensive Claude API prompt
5. **Call Claude API**: Vision API with screenshots
6. **Parse Recommendations**: Extract 10-15 recommendations
7. **Save to Database**: Store with priority calculation
8. **Send Email**: Notify user via Resend

**Priority Calculation**: `(impactScore * 2) - effortScore`
**Result**: Quick wins (high impact, low effort) appear first

---

## 🚧 Known TODOs in Code

### Shopify Integration ✅ COMPLETE
- [x] Implement `fetchShopifyAnalytics()` - Real Analytics API call (calculates from orders data)
- [x] Implement `fetchProducts()` - Real Products API call (returns up to 10 products)
- [x] Implement `fetchCurrentTheme()` - Real Themes API call (finds main theme)
- [x] Implement `fetchShopInfo()` - Real Shop API call (shop metadata)
- [ ] Add OAuth flow completion (use @apex/shared-auth)
- [ ] Add session storage implementation

### Claude API ✅ COMPLETE
- [x] Test and refine prompt engineering - Production-ready prompt
- [x] Implement robust JSON parsing - Handles both array and object formats
- [x] Add error handling for API failures - Rate limits, auth errors, etc.
- [x] Updated to Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- [x] Increased max_tokens to 8000 for detailed recommendations

### Background Jobs ✅ MOSTLY COMPLETE
- [x] Implement retry logic for screenshot capture (2 retries per page)
- [x] Test screenshot automation - Enhanced with cookie dismissal
- [x] Add error handling for failed screenshots (graceful degradation)
- [x] Implement full analysis flow (Shopify → Screenshots → Claude → Database)
- [ ] Add job progress reporting (for UI progress bar)
- [ ] Implement job failure notifications (email alerts)

### UI/UX
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Implement code syntax highlighting
- [ ] Add toast notifications
- [ ] Mobile responsive testing

### Billing
- [ ] Integrate Shopify Billing API
- [ ] Implement plan upgrade/downgrade
- [ ] Add usage tracking
- [ ] Implement trial logic

---

## 🐛 Troubleshooting

### Installation Issues
✅ **Solved**: Network timeout on first install - retried successfully
**Vulnerabilities**: 8 issues (6 moderate, 2 high) - run `npm audit` to review

### Common Setup Issues

**Prisma not generating client**
```bash
npm run prisma:generate
```

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Playwright browsers not installed**
```bash
npx playwright install
```

**Environment variables not loading**
```bash
# Ensure .env file exists
cp .env.example .env
# Restart dev server
```

---

## 📈 Project Metrics

**Lines of Code**: ~2,500 (estimated)
- Routes: ~800 LOC
- Jobs: ~400 LOC
- Utils: ~600 LOC
- Schema: ~120 LOC
- Config: ~100 LOC
- Documentation: ~500 LOC

**Development Time**:
- Scaffolding: 1 hour
- Documentation: 30 minutes
- Configuration: 15 minutes
- **Total**: ~1.75 hours

**Estimated Time to MVP**: 2-3 weeks (as per PROJECT_BRIEF)

---

## 🎯 Success Criteria

### MVP Launch Checklist
- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Shopify app installed in development store
- [ ] First analysis completes successfully
- [ ] Recommendations display correctly
- [ ] Email notifications working
- [ ] Billing integration complete
- [ ] Beta testing with 5-10 stores
- [ ] Deploy to Railway production

### Week 1 Goals (Current)
- [x] Complete scaffolding
- [x] Documentation
- [ ] Shopify API integration
- [ ] Claude API testing
- [ ] Screenshot automation

---

## 📞 Support & Resources

### Documentation
- **Project Brief**: `/PROJECT_BRIEF.md`
- **Main README**: `/apps/app-01-conversionai/README.md`
- **APEX Framework**: `/APEX_FRAMEWORK.md`
- **Deployment Guide**: `/docs/deployment.md`

### External Resources
- [Shopify Dev Docs](https://shopify.dev)
- [Anthropic Claude API Docs](https://docs.anthropic.com)
- [Remix Docs](https://remix.run/docs)
- [Railway Docs](https://docs.railway.app)
- [Playwright Docs](https://playwright.dev)

### Community
- Shopify Partners Slack
- Railway Discord
- Remix Discord

---

**Status**: ✅ Ready for development
**Next Action**: Set up environment variables and start Week 1 Wednesday-Friday tasks
**Timeline**: On track for 3-week MVP
