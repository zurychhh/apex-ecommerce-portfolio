# ConversionAI - Implementation Log

## Session #11 - 2026-01-02 (HTTP 500 FIX - ROOT CAUSE SOLVED)

### ✅ RESOLVED: HTTP 500 in Browser Context

**Status**: ✅ FIXED - Root cause identified and fixed

---

### Problem Summary
Browser requests to the app returned HTTP 500 "Unexpected Server Error", while curl requests returned 410 (expected).

### Root Cause
Shopify's `@shopify/shopify-app-remix` package detects browser User-Agents and triggers embedded auth flow. This requires specific configuration that was missing:
1. `isEmbeddedApp: true` in shopify.server.ts
2. `unstable_newEmbeddedAuthStrategy: true` in future flags
3. `headers` and `ErrorBoundary` exports in auth route for boundary handling

### Fixes Applied

**File: `app/shopify.server.ts`**
```typescript
const shopify = shopifyApp({
  isEmbeddedApp: true,  // Added
  future: {
    unstable_newEmbeddedAuthStrategy: true,  // Changed from false
  },
  // ... rest
});
```

**File: `app/routes/auth.$.tsx`**
```typescript
// Added boundary exports
export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}
```

### Commits
- `fix: Enable embedded app auth strategy and isEmbeddedApp flag`
- `fix: Add missing boundary headers and ErrorBoundary to auth route`

### Result
- Browser requests now return 302 (OAuth redirect) instead of 500
- App loads correctly in Shopify Admin iframe
- **NO MORE HTTP 500 ERRORS**

---

## Session #10 - 2026-01-02 (Iframe HTTP 500 Deep Debug)

### CRITICAL: App Returns HTTP 500 in Browser Context

**Status**: ✅ RESOLVED in Session #11

---

### Problem Summary

**Symptom**: App loads in Shopify Admin iframe but shows "Unexpected Server Error" with HTTP 500.

**Key Discovery**:
- `curl` requests to `/auth?shop=xxx` return **410** (expected for embedded apps)
- Browser requests from Shopify Admin iframe return **HTTP 500** (unexpected)

This means there's something different about how the browser/iframe context makes requests that causes a server-side crash.

---

### [2026-01-02 12:30] - Browser Debugging Infrastructure Setup
**Status**: ✅ DONE

**What was created**:
1. **Chrome DevTools MCP** - Installed for AI-assisted browser debugging
   ```bash
   claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest
   ```

2. **Chrome with Remote Debugging** - Launch command:
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=9222 \
     --user-data-dir="$HOME/.chrome-debug-profile" \
     "https://admin.shopify.com/store/conversionai-development/apps"
   ```

3. **Puppeteer Debug Scripts** in `/tmp/`:
   - `debug-shopify.cjs` - Navigate and screenshot
   - `click-app.cjs` - Click app and capture errors
   - `capture-error.cjs` - Focused error capture
   - `detailed-debug.cjs` - Full request/response logging

**How to use**:
```bash
# 1. Kill any existing Chrome
pkill -9 "Google Chrome"

# 2. Launch Chrome with debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-debug-profile" \
  "https://admin.shopify.com/store/conversionai-development/apps"

# 3. Verify connection
curl -s http://localhost:9222/json/version

# 4. Run puppeteer script
cd /tmp && node capture-error.cjs
```

---

### [2026-01-02 12:45] - HTTP 500 Error Captured
**Status**: ✅ DONE

**Captured Error**:
```
HTTP ERROR: 500
URL: https://conversionai-web-production.up.railway.app/auth?shop=conversionai-development.myshopify.com
Response Headers:
  content-type: text/plain; charset=utf-8
  server: railway-edge
Response Body: Unexpected Server Error
```

**Screenshot**: `/tmp/detailed-debug.png` shows "Unexpected Server Error" in iframe

---

### [2026-01-02 13:00] - Attempted Fixes (DID NOT SOLVE)
**Status**: ❌ NOT FIXED

**Fix Attempt #1**: Added `auth.login` route
- Created `app/routes/auth.login/route.tsx`
- Uses `login()` function instead of `authenticate.admin()`
- **Result**: Still HTTP 500

**Fix Attempt #2**: Added error logging to `auth.$.tsx`
- Added try/catch with detailed logging
- Logs request URL, headers, and errors
- **Result**: Deploy triggered, need to check Railway logs

---

### [2026-01-02 13:15] - Current State
**Status**: 🔄 AWAITING DEPLOYMENT

**Files Changed**:
1. `app/routes/auth.$.tsx` - Added error logging (try/catch)
2. `app/routes/auth.login/route.tsx` - NEW - Login route with `login()` function

**Commits Made**:
- `feat: Add missing auth.login route` - 4a0e552
- `debug: Add error logging to auth route` - 4e085f5

**Deploy Status**: Pushed to GitHub, Railway auto-deploy triggered

---

## NEXT STEPS (For Next Session)

### Step 1: Check Railway Logs
```bash
# Option A: Railway CLI (if working)
RAILWAY_TOKEN="d89e435b-d16d-4614-aa16-6b63cf54e86b" railway logs --service conversionai-web

# Option B: Railway Dashboard
# https://railway.app/project/c1ad5a4a-a4ff-4698-bf0f-e1f950623869
# Navigate to conversionai-web service → Deployments → View logs
```

Look for logs starting with `[AUTH]` to see:
- What URL path is being hit
- What headers are being sent
- What the actual error is

### Step 2: Analyze Error
The error could be:
1. **Database/Session Error** - Prisma failing to connect or query
2. **Authentication Error** - Shopify package throwing an unhandled exception
3. **Missing Environment Variable** - Some required config not set
4. **Cookie/Header Issue** - Browser sends something that breaks the flow

### Step 3: Fix Based on Error
Once we see the actual error in logs, apply appropriate fix.

---

## KEY DIFFERENCES: curl vs Browser

| Aspect | curl | Browser (Shopify iframe) |
|--------|------|--------------------------|
| Response | 410 Gone | 500 Internal Server Error |
| Headers | Minimal | Full browser headers + cookies |
| Origin | None | https://admin.shopify.com |
| Referer | None | https://admin.shopify.com/... |
| Cookies | None | Shopify session cookies |

The browser is sending additional context that triggers a different code path in the server.

---

## DO NOT REPEAT - Already Attempted

| Fix Attempted | Result | Notes |
|---------------|--------|-------|
| Add auth.login route | ❌ Still 500 | Route was missing but not the root cause |
| Check CSP headers | ✅ Headers OK | Not the issue |
| Sync Partners Dashboard | ✅ Done | Already synced in previous session |
| Set SHOPIFY_APP_URL | ✅ Done | Already set |

---

## Browser Debugging Tooling Reference

### Puppeteer Scripts Location
All scripts in `/tmp/` directory:

```javascript
// /tmp/capture-error.cjs - MOST USEFUL
// Captures HTTP 500 errors with full response body

const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
  const page = (await browser.pages())[0];

  page.on('response', async res => {
    if (res.url().includes('railway.app') && res.status() >= 400) {
      console.log('HTTP ERROR:', res.status(), res.url());
      console.log('Body:', await res.text().catch(() => 'N/A'));
    }
  });

  await page.goto('https://admin.shopify.com/store/conversionai-development/apps/conversionai-1');
  await new Promise(r => setTimeout(r, 30000));
  await browser.disconnect();
})();
```

### Chrome DevTools MCP
Installed but not fully utilized. Can be used for:
- Screenshot capture
- Network inspection
- Console logging
- DOM manipulation

---

## Session #9 - 2025-12-23 (Iframe Troubleshooting)

### App Not Loading in Shopify Admin - Complete Fix

---

### [2025-12-23 20:25] - ROOT CAUSE FOUND & FIXED: Partners Config Synced
**Status**: ✅ DONE

**Problem**:
- App iframe showed "Serwer admin.shopify.com odrzucił połączenie"
- CSP headers verified working with `?shop=` parameter
- Local TOML files had correct Railway URL

**ROOT CAUSE**:
⚠️ **Shopify Partners configuration was NOT synced with local TOML files!**
- Local `shopify.app.toml` had: `application_url = "https://conversionai-web-production.up.railway.app"`
- Shopify Partners had: `application_url = "https://localhost:3000"` (old value)

**FIX APPLIED**:
```bash
SHOPIFY_CLI_PARTNERS_TOKEN="atkn_xxx" shopify app deploy --force
```

**Result**: ✅ New version `conversionai-10` released
- Version URL: https://dev.shopify.com/dashboard/197047495/apps/304999071745/versions/817112219649
- Partners config now synced with Railway URL

**Verified Working (Local)**:
```bash
# CSP headers correctly returned when shop parameter present:
curl -I "https://conversionai-web-production.up.railway.app/app?shop=conversionai-development.myshopify.com"

# Returns:
# content-security-policy: frame-ancestors https://conversionai-development.myshopify.com https://admin.shopify.com...
```

---

### [2025-12-23 19:00] - CSP Headers Fix
**Status**: ✅ DONE

**Pliki utworzone**:
- `app/entry.server.tsx` - Adds Shopify CSP headers to all HTML responses

**Co zrobiono**:
- Created entry.server.tsx with `addDocumentResponseHeaders()` call
- This adds `Content-Security-Policy: frame-ancestors` header for iframe embedding
- Headers are dynamically generated based on shop domain
- Deployed to Railway (commit: `ec8ced6`)

**Key Learning**:
- CSP headers only added when `?shop=` parameter is present in request
- Direct access without shop returns 410 (expected for embedded apps)
- This is correct behavior - the issue was Partners config, not CSP

---

### [2025-12-23 18:00] - Initial Troubleshooting
**Status**: ✅ DONE

**Fixes Applied**:
1. ✅ Fixed webhook API version: `2026-01` → `2024-10` in shopify.app.conversionai.toml
2. ✅ Deployed new app version to Railway
3. ✅ Set `SHOPIFY_APP_URL=https://conversionai-web-production.up.railway.app` on Railway
4. ✅ Created entry.server.tsx with CSP headers
5. ❌ Partners config sync failed (token expired)

**Verified Environment Variables on Railway**:
```
SHOPIFY_API_KEY=30c5af756ea767c28f82092b98ffc9e1
SHOPIFY_API_SECRET=<redacted>
SHOPIFY_APP_URL=https://conversionai-web-production.up.railway.app
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
NODE_ENV=production
```

**API Test Results**:
| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/` | GET | 302 | Redirects to /app |
| `/app` | GET | 410 | Expected for embedded apps |
| `/app?shop=xxx` | GET | 410 + CSP | ✅ Headers correct! |
| `/api/cron/weekly-refresh` | GET | 200 | Returns docs JSON |

---

## DO NOT REPEAT - Already Fixed (Session #9)

These issues have been resolved. Do not troubleshoot again:

| Issue | Fix | Status |
|-------|-----|--------|
| Webhook API version `2026-01` | Changed to `2024-10` | ✅ Fixed |
| Missing SHOPIFY_APP_URL env var | Set via Railway GraphQL API | ✅ Fixed |
| Missing CSP headers | Created entry.server.tsx | ✅ Fixed |
| Local TOML has localhost URL | Updated to Railway URL | ✅ Fixed |
| Partners Dashboard out of sync | `shopify app deploy --force` | ✅ Fixed |

**ALL ISSUES RESOLVED** - App version `conversionai-10` deployed.

---

## Session #8 - 2025-12-21 (E2E Testing)

### E2E Testing Execution

---

### [2025-12-22 09:00] - Troubleshooting Continued
**Status**: Superseded by Session #9

*Previous notes moved to Session #9 with complete analysis*

**Railway Working Token**: `d89e435b-d16d-4614-aa16-6b63cf54e86b` (for GraphQL API)

---

### [2025-12-22 09:00] - Integration Tests for Shopify GraphQL Billing
**Status**: ✅ DONE

**Pliki utworzone**:
- `tests/integration/billing-graphql.test.ts` - 21 integration tests for Shopify billing

**Pliki zaktualizowane**:
- `jest.config.js` - Added testPathIgnorePatterns
- `tests/RESULTS.md` - Updated with new test counts and coverage

**Co zrobiono**:
- Added 21 integration tests for Shopify GraphQL billing functions
- Tests cover all 3 billing API functions:
  - createSubscription() - 9 tests
  - checkActiveSubscription() - 6 tests
  - cancelSubscription() - 6 tests
- Mocked admin.graphql() to simulate Shopify responses
- Tested success cases, error handling, and edge cases

**Test Results**:
| File | Tests | Coverage |
|------|-------|----------|
| billing.server.ts | 33+21 PASS | **100% stmts** |
| claude.server.ts | 30 PASS | 55.31% stmts |
| email.server.ts | 24 PASS | 100% stmts |
| **Total** | **108 PASS** | **83.2% stmts** |

**Coverage Improvement**:
- Statements: 60% → **83.2%** (+23.2%)
- Branches: 68.42% → **84.21%** (+15.79%)
- Functions: 65% → **80%** (+15%)
- billing.server.ts: 52.45% → **100%** (+47.55%)

**Next steps**:
1. Manual browser E2E testing przez Shopify Admin
2. Configure cron-job.org
3. Consider adding integration tests for Claude API (callClaudeAPI)

---

## Current State (Updated 2026-01-02)

**Co działa**:
- ✅ Railway deployment via GraphQL API
- ✅ GitHub Actions CI/CD pipeline
- ✅ All API routes (`/api/cron/weekly-refresh`, `/api/billing/*`, `/api/analysis/*`)
- ✅ Billing integration (Free, Basic, Pro, Enterprise)
- ✅ Email notifications (Resend)
- ✅ Database (PostgreSQL on Railway)
- ✅ Redis queue (on Railway)
- ✅ Cron endpoint tested and working
- ✅ Unit tests (108 passing, 83.2% coverage)
- ✅ CSP headers configured
- ✅ Partners Dashboard synced
- ✅ **App loading in Shopify Admin iframe** (FIXED Session #11)
- ✅ **OAuth flow** (returns 302 redirect correctly)

**Wszystkie blokery rozwiązane!**

**Production URL**: https://conversionai-web-production.up.railway.app

---

## Documentation Map

| Plik | Opis | Kiedy używać |
|------|------|--------------|
| `APEX_PROJECT_STATUS.md` | Status całego portfolio | Przegląd postępu, co zostało zrobione |
| `IMPLEMENTATION_LOG.md` | Szczegóły techniczne App #1 | Na początku każdej sesji Claude Code |
| `APEX_FRAMEWORK.md` | Framework guidelines | Przed rozpoczęciem nowej aplikacji |
| `APEX_TESTING_FRAMEWORK.md` | E2E testing guide | Przy testowaniu aplikacji |
| `docs/integrations-playbook.md` | Automation scripts | Setup nowej aplikacji |
| `docs/lessons-learned.md` | Lekcje z poprzednich apps | Unikanie powtarzania błędów |
| `RAILWAY_DEBUG_STATUS.md` | Railway API reference | Debugging Railway issues |

---

## Next Session TODO

1. **Execute E2E Browser Tests** (30 min)
   - OAuth installation flow
   - Dashboard load
   - AI analysis trigger
   - Recommendation detail modal
   - Billing upgrade flow

2. **Configure cron-job.org** (15 min)
   - Set up weekly refresh calls to `/api/cron/weekly-refresh`
   - Verify CRON_SECRET is working

3. **Final Review** (15 min)
   - Verify all features working in production
   - Check production logs for any errors
   - Update documentation if needed

---

## Lessons Learned

1. **Railway CLI vs API**: CLI wymaga Project Token, API działa z User Token
2. **Monorepo setup**: Wymaga ustawienia `rootDirectory` w Railway
3. **Service connection**: Railway service musi być połączony z GitHub repo by deployment from source działał
4. **Browser vs curl**: Browser sends additional headers/cookies that can trigger different server code paths
5. **Shopify embedded apps**: Always return 410 for direct access without valid session
