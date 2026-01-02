# APEX eCommerce Portfolio - Project Status

**Last Updated**: 2026-01-02 13:15 UTC

---

## Active App: ConversionAI (App #1)

### Overall Progress: 95% MVP Complete

| Phase | Status | Progress |
|-------|--------|----------|
| Week 1 - Foundation | ✅ Complete | 100% |
| Week 2 - Features | ✅ Complete | 100% |
| Week 3 - Polish & Deploy | 🔴 BLOCKED | 95% |

**BLOCKER**: App returns HTTP 500 when loading in Shopify Admin iframe

**Testing Status**:
- ✅ Unit Tests: 108/108 PASS (100%)
- ✅ API Health Checks: 5/5 PASS (100%)
- ✅ Code Coverage: 83.2% statements, 84.2% branches, 80% functions
- ❌ Browser E2E Tests: BLOCKED - HTTP 500 error in iframe

---

## 🔴 CURRENT BLOCKER: HTTP 500 in Browser Context

### Problem
When app loads in Shopify Admin iframe, it returns HTTP 500 "Unexpected Server Error".
- `curl` requests return 410 (expected)
- Browser requests return 500 (unexpected server crash)

### What Was Tried (Session #10)
1. ❌ Added `auth.login` route - Still 500
2. ✅ Added error logging to `auth.$.tsx` - Deployed, waiting for logs
3. ✅ Set up Chrome DevTools + Puppeteer for browser debugging

### Next Steps
1. Check Railway logs for `[AUTH]` entries
2. Identify actual error from logs
3. Fix based on root cause

### Detailed Info
See `apps/app-01-conversionai/IMPLEMENTATION_LOG.md` Session #10

---

## Session History

### Session #10 (2026-01-02)
**Duration**: ~1h
**Focus**: Deep debugging of HTTP 500 error in iframe

**Completed**:
- ✅ Set up Chrome DevTools MCP for browser debugging
- ✅ Launched Chrome with remote debugging port 9222
- ✅ Created Puppeteer scripts for error capture
- ✅ Confirmed HTTP 500 from browser vs 410 from curl
- ✅ Added `auth.login` route (didn't fix)
- ✅ Added error logging to `auth.$.tsx`
- ✅ Committed and deployed changes

**Files Created**:
- `app/routes/auth.login/route.tsx` - Login route with `login()` function

**Files Modified**:
- `app/routes/auth.$.tsx` - Added try/catch error logging

**Commits**:
- `feat: Add missing auth.login route` - 4a0e552
- `debug: Add error logging to auth route` - 4e085f5

**Blocked**: HTTP 500 still occurring, need to check Railway logs for actual error

---

### Session #9 (2025-12-23)
**Duration**: ~2h
**Focus**: Iframe "Connection refused" fix

**Completed**:
- ✅ Fixed Shopify Partners Dashboard sync
- ✅ Deployed app version `conversionai-10`
- ✅ Verified CSP headers working

**Result**: Fixed "connection refused" but revealed HTTP 500 issue

---

### Session #8 (2025-12-21)
**Duration**: ~1h
**Focus**: Complete Testing Suite (Unit + E2E + API)

**Completed**:
- ✅ Set up Jest testing framework with ts-jest
- ✅ Wrote 108 unit tests (billing, claude, email utilities)
- ✅ All unit tests passing (108/108 = 100%)
- ✅ Executed 5 API Health Checks - **ALL PASS**
- ✅ Generated comprehensive test coverage report

**Test Coverage**:
| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| billing.server.ts | 100% | 100% | 100% |
| claude.server.ts | 55.31% | 73.91% | 60% |
| email.server.ts | 100% | 100% | 100% |
| **Total** | **83.2%** | **84.21%** | **80%** |

---

### Session #7 (2025-12-21)
**Focus**: Railway deployment fix, cron configuration, E2E testing framework, documentation

**Completed**:
- ✅ Fixed GitHub Actions deployment (Railway CLI → GraphQL API)
- ✅ Connected Railway service to GitHub repo
- ✅ Set monorepo rootDirectory (`apps/app-01-conversionai`)
- ✅ Verified cron endpoint working
- ✅ Created E2E testing framework documentation

---

## Infrastructure Status

### Railway (Production)
| Service | Status | Notes |
|---------|--------|-------|
| conversionai-web | ✅ Running | Connected to GitHub, auto-deploy |
| postgres | ✅ Running | Database |
| redis | ✅ Running | Job queue |

**Project URL**: https://railway.app/project/c1ad5a4a-a4ff-4698-bf0f-e1f950623869
**Production URL**: https://conversionai-web-production.up.railway.app

### GitHub Actions
| Workflow | Status |
|----------|--------|
| Deploy ConversionAI | ✅ Passing |

---

## Feature Checklist

### MVP Features
- [x] Shopify OAuth integration
- [x] Store data fetching (Analytics, Products, Themes)
- [x] Screenshot capture (Playwright)
- [x] AI analysis (Claude Sonnet + Vision)
- [x] Recommendations with prioritization
- [x] Dashboard UI (Polaris)
- [x] Recommendation detail view
- [x] Code snippet viewer
- [x] Billing integration (Shopify Billing API)
- [x] Email notifications (Resend)
- [x] Weekly auto-refresh (cron endpoint)
- [x] E2E testing framework (Playwright MCP)
- [x] CI/CD pipeline (GitHub Actions)
- [x] Unit tests (108 passing)
- [x] Documentation complete
- [x] E2E API Health Checks executed (5/5 PASS)
- [ ] **Fix HTTP 500 in iframe** *(BLOCKER)*
- [ ] External cron service configuration *(manual)*
- [ ] E2E browser tests on dev store *(blocked by HTTP 500)*

### Post-MVP
- [ ] Competitor tracking
- [ ] Industry benchmarks
- [ ] ROI calculator
- [ ] A/B testing (Phase 2)

---

## Key Configuration Reference

### Railway IDs
```
Project ID: c1ad5a4a-a4ff-4698-bf0f-e1f950623869
Environment ID: 6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e
Service ID: 08837d5d-0ed5-4332-882e-51d00b61eee6
Root Directory: apps/app-01-conversionai
Working Token: d89e435b-d16d-4614-aa16-6b63cf54e86b
```

### API Endpoints
```
Production: https://conversionai-web-production.up.railway.app
Cron: POST /api/cron/weekly-refresh (Authorization: Bearer <CRON_SECRET>)
Billing Create: POST /api/billing/create
Billing Callback: GET /api/billing/callback
Analysis Start: POST /api/analysis/start
```

### External Services
```
Shopify Partners: https://partners.shopify.com/4661608/apps/7638204481584
Dev Store: https://admin.shopify.com/store/conversionai-development
Railway Dashboard: https://railway.app/project/c1ad5a4a-a4ff-4698-bf0f-e1f950623869
```

---

## Browser Debugging Setup (Session #10)

### Chrome Remote Debugging
```bash
# Kill existing Chrome
pkill -9 "Google Chrome"

# Launch with debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-debug-profile" \
  "https://admin.shopify.com/store/conversionai-development/apps"

# Verify
curl -s http://localhost:9222/json/version
```

### Puppeteer Script (in /tmp/)
```bash
cd /tmp && node capture-error.cjs
```

### Chrome DevTools MCP
Installed: `claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest`

---

## Blockers & Issues

### Current Blocker
**HTTP 500 in Shopify iframe**
- Browser requests to `/auth?shop=xxx` return 500
- curl requests return 410 (expected)
- Error logging added, need to check Railway logs

### Resolved Issues
1. ~~Railway CLI "Project Token not found"~~ → Switched to GraphQL API
2. ~~Routes 404~~ → Set rootDirectory for monorepo
3. ~~Partners Dashboard out of sync~~ → `shopify app deploy --force`
4. ~~CSP headers missing~~ → Created entry.server.tsx
5. ~~"Connection refused" in iframe~~ → Partners sync fixed

---

## Cost Tracking

### Current (Development)
- Railway: ~$5/mo (hobby tier)
- Claude API: ~$0 (testing only)
- Resend: $0 (free tier)

### Projected (Production)
- Railway: $15-30/mo
- Claude API: $50-200/mo
- Resend: $0-20/mo

---

## Next Session Priorities

1. **Check Railway Logs** (5 min)
   - Look for `[AUTH]` log entries
   - Identify the actual error causing HTTP 500

2. **Fix Based on Error** (15-60 min)
   - Database issue → Check Prisma config
   - Auth package issue → Check shopify.server.ts config
   - Env var issue → Verify Railway variables

3. **Test in Browser** (5 min)
   - Use puppeteer script to verify fix
   - Take screenshot of working app

4. **If Fixed - Continue with E2E**
   - Execute manual browser tests
   - Configure cron-job.org
