# 🧪 APEX Testing Framework

**Version**: 1.0.0 | **Last Updated**: 2025-12-21  
**Purpose**: Standardized E2E testing for all APEX Portfolio apps using Playwright MCP + Claude Code

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup Instructions](#setup-instructions)
4. [Testing Standards](#testing-standards)
5. [Test Templates](#test-templates)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Playwright MCP + Claude Code?

Traditional E2E testing requires:
- Writing test scripts manually
- Maintaining selectors when UI changes
- Setting up complex test infrastructure
- Running tests manually or via CI

**With Playwright MCP + Claude Code:**
- ✅ Natural language test descriptions
- ✅ AI handles selector changes automatically
- ✅ Zero infrastructure setup (browser runs locally)
- ✅ Tests execute during development sessions
- ✅ Human-readable test reports
- ✅ **100% FREE** (no SaaS subscriptions)

### Testing Pyramid for APEX Apps

```
         ▲
        /  \        E2E Tests (Playwright MCP)
       /    \       - Critical user journeys
      /      \      - 5-10 tests per app
     /────────\     
    /          \    Integration Tests (Vitest)
   /            \   - API endpoints
  /              \  - Database operations
 /────────────────\ - 20-50 tests per app
/                  \
/    Unit Tests     \ (Vitest)
/    (Components)    \ - Individual functions
/──────────────────────\ - 50-100 tests per app
```

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                             │
│  (AI Development Assistant)                                  │
├─────────────────────────────────────────────────────────────┤
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Playwright MCP Server                   │    │
│  │  - Browser automation                                │    │
│  │  - Accessibility tree navigation                     │    │
│  │  - Screenshot capture                                │    │
│  │  - Form interaction                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ▼                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Chromium │  │ Firefox  │  │  WebKit  │  │   Edge   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  APEX Apps                           │    │
│  │  - ConversionAI (localhost:3000 / Railway)          │    │
│  │  - PriceRounder (localhost:3001 / Railway)          │    │
│  │  - ReviewBoost  (localhost:3002 / Railway)          │    │
│  │  - BundleGenius (localhost:3003 / Railway)          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### MCP Communication Flow

```
Claude Code                    Playwright MCP              Browser
    │                               │                         │
    │──── "navigate to X" ─────────>│                         │
    │                               │──── CDP command ───────>│
    │                               │<─── accessibility tree ─│
    │<─── structured response ──────│                         │
    │                               │                         │
    │──── "click button Y" ────────>│                         │
    │                               │──── click action ──────>│
    │                               │<─── result ─────────────│
    │<─── confirmation ─────────────│                         │
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+ (already installed: v24.9.0)
- Claude Code CLI or Claude Desktop
- APEX monorepo cloned

### Step 1: Install Playwright MCP Server

**Option A: Global installation (recommended)**
```bash
npm install -g @playwright/mcp@latest
```

**Option B: Per-project installation**
```bash
cd ~/projects/apex-ecommerce-portfolio
npm install -D @playwright/mcp
```

### Step 2: Configure Claude Code

**For Claude Code CLI:**
```bash
claude mcp add --transport stdio playwright npx @playwright/mcp@latest
```

**For Claude Desktop (macOS):**

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**For Claude Desktop (Windows):**

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Step 3: Verify Installation

Restart Claude Code/Desktop, then say:

```
Use Playwright to navigate to https://example.com and tell me the page title.
```

Expected: Claude opens browser, navigates, returns "Example Domain".

### Step 4: Configure for APEX Apps

Create `.mcp.json` in monorepo root:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless"
      ]
    }
  }
}
```

**Available flags:**
- `--headless` - Run without visible browser (CI/CD)
- `--browser chromium|firefox|webkit` - Specific browser
- `--viewport 1280x720` - Custom viewport
- `--save-trace` - Save trace for debugging
- `--save-video 1280x720` - Record video

---

## Testing Standards

### Test Categories

#### 1. Critical Path Tests (MUST PASS)
Every APEX app must pass these before deployment:

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| CP-01 | OAuth Installation | App installs successfully on dev store |
| CP-02 | Dashboard Load | Main dashboard renders without errors |
| CP-03 | Core Feature | Primary feature works (analysis, rounding, etc.) |
| CP-04 | Billing Flow | Upgrade/downgrade works correctly |
| CP-05 | Data Persistence | Data saves and loads correctly |

#### 2. Regression Tests (SHOULD PASS)
Run after each significant change:

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| RG-01 | Navigation | All menu items work |
| RG-02 | Forms | All forms submit correctly |
| RG-03 | Modals | All modals open/close |
| RG-04 | Filters | Filtering/sorting works |
| RG-05 | Error States | Error messages display |

#### 3. Edge Case Tests (NICE TO HAVE)
Run before major releases:

| Test ID | Test Name | Description |
|---------|-----------|-------------|
| EC-01 | Empty State | App handles no data gracefully |
| EC-02 | Large Data | App handles 1000+ items |
| EC-03 | Slow Network | App shows loading states |
| EC-04 | Session Timeout | App handles expired sessions |
| EC-05 | Concurrent Users | No race conditions |

### Test Naming Convention

```
[APP]-[CATEGORY]-[NUMBER]: [Description]

Examples:
CAI-CP-01: ConversionAI OAuth Installation
CAI-RG-03: ConversionAI Recommendation Modal
PRR-CP-03: PriceRounder Core Rounding Feature
```

### Test Documentation Format

Each test must be documented in `apps/app-XX-name/tests/E2E_TESTS.md`:

```markdown
## CAI-CP-01: OAuth Installation

**Priority**: Critical  
**Estimated Duration**: 60 seconds  
**Last Run**: 2025-12-21  
**Status**: ✅ PASSING

### Prerequisites
- Dev store: conversionai-development.myshopify.com
- Test credentials in `.env.test`

### Steps
1. Navigate to app installation URL
2. Click "Install app" on Shopify OAuth screen
3. Grant required permissions
4. Verify redirect to app dashboard

### Expected Results
- Dashboard loads within 5 seconds
- Shop name displayed in header
- No console errors

### Playwright MCP Prompt
```
Use Playwright to test ConversionAI OAuth:
1. Go to [INSTALL_URL]
2. If Shopify login appears, use email [EMAIL] password [PASSWORD]
3. Click "Install app" button
4. Wait for redirect to dashboard
5. Verify text "Welcome to ConversionAI" appears
6. Check browser console for errors
7. Take screenshot of final state
```
```

---

## Test Templates

### Template 1: OAuth Installation Test

```markdown
## [APP]-CP-01: OAuth Installation

Use Playwright MCP to test [APP_NAME] OAuth flow:

1. Navigate to: [APP_INSTALL_URL]
2. If Shopify login required:
   - Email: [SHOPIFY_EMAIL]
   - Password: [SHOPIFY_PASSWORD]
3. On OAuth screen, click "Install app"
4. Wait for redirect (max 10 seconds)
5. Verify dashboard loads:
   - Check for element with text "[WELCOME_TEXT]"
   - Verify no JavaScript errors in console
6. Take screenshot and save as "[APP]-oauth-success.png"

Report: PASS/FAIL with details
```

### Template 2: Core Feature Test

```markdown
## [APP]-CP-03: Core Feature Test

Use Playwright MCP to test [APP_NAME] main functionality:

1. Ensure logged into app dashboard
2. Trigger main feature:
   - [SPECIFIC_ACTION_1]
   - [SPECIFIC_ACTION_2]
3. Wait for processing (max [TIMEOUT] seconds)
4. Verify results:
   - [EXPECTED_RESULT_1]
   - [EXPECTED_RESULT_2]
5. Take screenshot of results

Report: PASS/FAIL with metrics (time, count, etc.)
```

### Template 3: Billing Flow Test

```markdown
## [APP]-CP-04: Billing Flow Test

Use Playwright MCP to test [APP_NAME] billing:

1. Navigate to pricing/upgrade page
2. Verify all plan tiers displayed:
   - Free: [FREE_FEATURES]
   - Basic ($X/mo): [BASIC_FEATURES]
   - Pro ($Y/mo): [PRO_FEATURES]
3. Click "Upgrade to Pro"
4. On Shopify billing screen:
   - Verify amount matches ($Y/mo)
   - Click "Approve" (test mode)
5. Verify redirect to app with Pro features unlocked
6. Take screenshot

Report: PASS/FAIL with billing confirmation
```

### Template 4: Full E2E Journey

```markdown
## [APP]-E2E-01: Complete User Journey

Use Playwright MCP to simulate complete user journey for [APP_NAME]:

### Phase 1: Installation (2 min)
1. Start from Shopify App Store listing
2. Click "Add app"
3. Complete OAuth flow
4. Verify onboarding screen

### Phase 2: Configuration (2 min)
5. Complete onboarding wizard
6. Configure initial settings
7. Save preferences

### Phase 3: Core Usage (3 min)
8. Trigger main feature
9. Wait for results
10. Interact with results (click, filter, etc.)
11. Mark item as complete/implemented

### Phase 4: Upgrade (2 min)
12. Hit free tier limit (if applicable)
13. Click upgrade prompt
14. Complete billing flow
15. Verify premium features unlocked

### Phase 5: Cleanup (1 min)
16. Navigate to settings
17. Verify data persisted correctly
18. Take final screenshot

Total expected time: 10 minutes
Report: Detailed PASS/FAIL for each phase
```

---

## App-Specific Test Suites

### ConversionAI Tests

```markdown
# ConversionAI E2E Test Suite

## Environment
- Dev Store: conversionai-development.myshopify.com
- Production: conversionai-web-production.up.railway.app
- Test User: [configured in .env.test]

## Critical Path Tests

### CAI-CP-01: OAuth Installation
[Use Template 1]
- Install URL: https://conversionai-web-production.up.railway.app/auth?shop=conversionai-development.myshopify.com
- Welcome text: "ConversionAI Dashboard"

### CAI-CP-02: Dashboard Load
Use Playwright to verify ConversionAI dashboard:
1. Navigate to dashboard (already authenticated)
2. Verify metrics card displays:
   - Total Recommendations count
   - Last Analysis date
   - Implementation progress
3. Verify recommendations list loads
4. Check no console errors
5. Measure page load time (should be <3s)

### CAI-CP-03: AI Analysis
Use Playwright to test ConversionAI analysis:
1. On dashboard, click "Run New Analysis"
2. Wait for analysis to complete (max 120 seconds)
3. Verify:
   - Progress indicator shows
   - Recommendations appear (minimum 5)
   - Each recommendation has: title, impact, effort, category
4. Take screenshot of results

### CAI-CP-04: Recommendation Interaction
Use Playwright to test recommendation features:
1. Click on first recommendation to open modal
2. Verify modal contains:
   - Detailed description
   - Code snippet (if applicable)
   - Implementation steps
3. Click "Mark as Implemented"
4. Verify recommendation moves to implemented list
5. Close modal
6. Verify list updates

### CAI-CP-05: Billing Upgrade
Use Playwright to test billing:
1. Navigate to /app/pricing
2. Verify three tiers: Free, Basic ($19), Pro ($49)
3. Click "Upgrade to Pro"
4. On Shopify billing, click "Approve charge"
5. Verify return to app with Pro badge visible
```

### PriceRounder Tests (Template for App #2)

```markdown
# PriceRounder E2E Test Suite

## Environment
- Dev Store: pricerounder-dev.myshopify.com
- Production: [TBD]

## Critical Path Tests

### PRR-CP-01: OAuth Installation
[Use Template 1]

### PRR-CP-02: Dashboard Load
Use Playwright to verify PriceRounder dashboard:
1. Navigate to dashboard
2. Verify currency list displays
3. Verify rounding rules table
4. Check product count

### PRR-CP-03: Rounding Rule Creation
Use Playwright to test rule creation:
1. Click "Add Rounding Rule"
2. Select currency: EUR
3. Set rounding: .99
4. Set threshold: 0.50
5. Click "Save Rule"
6. Verify rule appears in table

### PRR-CP-04: Price Preview
Use Playwright to test price preview:
1. Select 5 products
2. Click "Preview Rounded Prices"
3. Verify before/after prices shown
4. Verify correct rounding applied

### PRR-CP-05: Bulk Apply
Use Playwright to test bulk application:
1. Select all products (use checkbox)
2. Click "Apply Rounding"
3. Confirm in modal
4. Wait for processing
5. Verify success message
6. Spot-check 3 products have new prices
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run Playwright tests
        run: npx playwright test
        env:
          SHOPIFY_DEV_STORE: ${{ secrets.SHOPIFY_DEV_STORE }}
          SHOPIFY_API_KEY: ${{ secrets.SHOPIFY_API_KEY }}
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Railway Cron for Scheduled Tests

For weekly regression tests, add to Railway:

```bash
# Cron: Every Monday 6:00 UTC
0 6 * * 1 curl -X POST https://your-app.railway.app/api/run-tests \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Slack Notifications

Add to test runner:

```typescript
// utils/notify-slack.ts
async function notifySlack(results: TestResults) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  
  const message = {
    text: results.passed 
      ? `✅ E2E Tests Passed (${results.total} tests)`
      : `❌ E2E Tests Failed (${results.failed}/${results.total})`,
    attachments: [{
      color: results.passed ? 'good' : 'danger',
      fields: [
        { title: 'App', value: results.appName, short: true },
        { title: 'Duration', value: `${results.duration}s`, short: true },
        { title: 'Environment', value: results.env, short: true },
      ]
    }]
  };
  
  await fetch(webhook, {
    method: 'POST',
    body: JSON.stringify(message)
  });
}
```

---

## Manual Testing with Claude Code

### Quick Test Commands

Copy-paste these prompts to Claude Code for quick testing:

**Health Check:**
```
Use Playwright to check if [APP_URL] is responding:
1. Navigate to the URL
2. Wait for page load
3. Report: status code, page title, load time
```

**Screenshot All Pages:**
```
Use Playwright to screenshot all pages of [APP_NAME]:
1. Navigate to dashboard, take screenshot
2. Navigate to settings, take screenshot
3. Navigate to pricing, take screenshot
4. Navigate to help, take screenshot
Save all screenshots with descriptive names.
```

**Console Error Check:**
```
Use Playwright to check [APP_URL] for JavaScript errors:
1. Navigate to each main page
2. Collect all console.error messages
3. Report any errors found with page context
```

**Performance Check:**
```
Use Playwright to measure [APP_NAME] performance:
1. Clear cache
2. Navigate to dashboard
3. Measure: Time to First Byte, First Contentful Paint, Load Complete
4. Report metrics and compare to targets (<3s load)
```

### Interactive Testing Session

For exploratory testing, use this prompt:

```
I want to do exploratory testing of [APP_NAME]. 

Use Playwright MCP to:
1. Start at the dashboard
2. For each interactive element you find:
   - Describe what it is
   - Click/interact with it
   - Report what happens
   - Note any issues
3. Continue until you've tested all visible features
4. Provide a summary of findings

Focus on: unexpected behaviors, slow responses, broken UI, missing feedback
```

---

## Troubleshooting

### Common Issues

#### MCP Server Not Starting

**Symptom:** "MCP server not found" error

**Solution:**
```bash
# Verify installation
npx @playwright/mcp --version

# Reinstall if needed
npm uninstall -g @playwright/mcp
npm install -g @playwright/mcp@latest

# Restart Claude Code/Desktop
```

#### Browser Not Opening

**Symptom:** Tests run but no browser visible

**Solution:**
```bash
# Remove --headless flag for debugging
# In .mcp.json, change args to:
"args": ["@playwright/mcp@latest"]

# Or explicitly request headed mode:
"args": ["@playwright/mcp@latest", "--headed"]
```

#### Shopify OAuth Loops

**Symptom:** OAuth keeps redirecting without completing

**Solution:**
1. Clear browser cookies in Playwright:
```
Use Playwright: clear all cookies, then retry OAuth flow
```

2. Check app scopes in `shopify.app.toml`

3. Verify SHOPIFY_API_KEY matches Partner Dashboard

#### Element Not Found

**Symptom:** "Cannot find element with text X"

**Solution:**
Playwright MCP uses accessibility tree, not visual selectors. Try:
```
Instead of: "click button with class .submit-btn"
Use: "click button with text 'Submit'"
Or: "click the submit button"
```

#### Timeout Errors

**Symptom:** "Timeout waiting for X"

**Solution:**
Add explicit waits:
```
Use Playwright:
1. Click "Run Analysis"
2. Wait up to 120 seconds for text "Analysis Complete" to appear
3. Then verify results
```

### Debug Mode

For detailed debugging:

```
Use Playwright in debug mode:
1. Enable verbose logging
2. Navigate to [URL]
3. Before each action, describe what you see
4. After each action, report the result
5. If anything fails, take a screenshot and describe the DOM state
```

### Getting Help

1. **Playwright MCP Issues:** https://github.com/microsoft/playwright-mcp/issues
2. **Shopify OAuth:** https://shopify.dev/docs/apps/auth
3. **APEX Support:** Update IMPLEMENTATION_LOG.md with full error details

---

## Appendix A: Environment Variables for Testing

Add to `.env.test` in each app:

```bash
# Shopify Test Store
SHOPIFY_DEV_STORE=your-dev-store.myshopify.com
SHOPIFY_TEST_EMAIL=test@example.com
SHOPIFY_TEST_PASSWORD=your-test-password

# App URLs
APP_LOCAL_URL=http://localhost:3000
APP_STAGING_URL=https://app-staging.railway.app
APP_PRODUCTION_URL=https://app-production.railway.app

# Test Configuration
TEST_TIMEOUT=120000
TEST_RETRIES=2
HEADLESS=true

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## Appendix B: Test Result Template

After each test session, update `tests/RESULTS.md`:

```markdown
# Test Results - [DATE]

## Summary
- **App**: ConversionAI
- **Environment**: Production
- **Tester**: Claude Code + Playwright MCP
- **Duration**: 15 minutes
- **Result**: ✅ 8/8 PASSED | ❌ 0 FAILED

## Detailed Results

| Test ID | Test Name | Result | Duration | Notes |
|---------|-----------|--------|----------|-------|
| CAI-CP-01 | OAuth Installation | ✅ PASS | 45s | |
| CAI-CP-02 | Dashboard Load | ✅ PASS | 3s | Load time: 2.1s |
| CAI-CP-03 | AI Analysis | ✅ PASS | 89s | 12 recommendations |
| CAI-CP-04 | Recommendation Modal | ✅ PASS | 5s | |
| CAI-CP-05 | Billing Flow | ✅ PASS | 12s | Test mode |

## Screenshots
- [oauth-success.png](./screenshots/oauth-success.png)
- [dashboard.png](./screenshots/dashboard.png)
- [analysis-results.png](./screenshots/analysis-results.png)

## Issues Found
None

## Next Steps
- [ ] Run regression tests
- [ ] Test on Firefox
- [ ] Test mobile viewport
```

---

## Appendix C: Quick Reference Card

### Playwright MCP Commands (for Claude Code)

| Action | Prompt |
|--------|--------|
| Navigate | "Use Playwright to go to [URL]" |
| Click | "Click the button/link with text [TEXT]" |
| Type | "Type [TEXT] into the [FIELD] input" |
| Wait | "Wait for [ELEMENT/TEXT] to appear" |
| Screenshot | "Take a screenshot and save as [NAME]" |
| Check | "Verify that [CONDITION]" |
| Console | "Check for console errors" |
| Network | "Wait for network to be idle" |

### Test Checklist Before Deploy

- [ ] All CP (Critical Path) tests passing
- [ ] No console errors
- [ ] Load time < 3 seconds
- [ ] Mobile viewport tested
- [ ] Billing flow verified (test mode)
- [ ] Screenshots captured
- [ ] Results documented

---

**Document maintained by:** APEX Team  
**Last updated:** 2025-12-21  
**Next review:** After App #2 (PriceRounder) launch
