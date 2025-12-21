# ConversionAI E2E Test Suite

**Framework**: Playwright MCP + Claude Code
**Last Updated**: 2025-12-21
**App Version**: MVP 1.0

---

## Test Environment

| Setting | Value |
|---------|-------|
| Production URL | https://conversionai-web-production.up.railway.app |
| Dev Store | conversionai-development.myshopify.com |
| Shopify Admin | https://admin.shopify.com/store/conversionai-development |

---

## Critical Path Tests

These tests must ALL pass before any production deployment.

---

## CAI-CP-01: OAuth Installation

**Priority**: Critical
**Duration**: ~60 seconds
**Last Run**: [TBD]
**Status**: Not Run

### Description
Verifies that a merchant can install the app via Shopify OAuth flow.

### Prerequisites
- Dev store exists and is accessible
- App is deployed to production URL
- Shopify app credentials are configured

### Playwright MCP Prompt

```
Use Playwright to test ConversionAI OAuth installation:

1. Navigate to: https://conversionai-web-production.up.railway.app/auth?shop=conversionai-development.myshopify.com
2. If Shopify login page appears, wait for redirect (app may already be installed)
3. If "Install app" or permission screen appears:
   - Verify app name "ConversionAI" is displayed
   - Verify requested permissions are shown
   - Click "Install app" or "Approve" button
4. Wait for redirect to app dashboard (max 15 seconds)
5. Verify the page contains text "Dashboard" or "ConversionAI"
6. Check browser console for JavaScript errors
7. Take screenshot and save as "cai-cp-01-oauth-success.png"

Report results as:
- PASS: If dashboard loads successfully
- FAIL: If any step fails, with error details
```

### Expected Results
- Redirect to dashboard within 15 seconds
- No console errors
- Dashboard UI renders correctly

### Acceptance Criteria
- [ ] OAuth flow completes without errors
- [ ] User lands on dashboard
- [ ] Session is authenticated

---

## CAI-CP-02: Dashboard Load

**Priority**: Critical
**Duration**: ~30 seconds
**Last Run**: [TBD]
**Status**: Not Run

### Description
Verifies dashboard loads with all expected components.

### Prerequisites
- User is authenticated (CP-01 passed)

### Playwright MCP Prompt

```
Use Playwright to verify ConversionAI dashboard components:

1. Navigate to: https://conversionai-web-production.up.railway.app/app
2. Wait for page to fully load (network idle)
3. Verify these elements are present:
   - Header with "ConversionAI" branding
   - Metrics section with cards showing:
     - "Total Recommendations" (number or 0)
     - "Last Analysis" (date or "Never")
     - "Implementation Progress" (percentage)
   - "Run New Analysis" button
   - Recommendations list (may be empty initially)
4. Measure page load time from navigation start
5. Check browser console for errors
6. Take screenshot as "cai-cp-02-dashboard.png"

Report results as:
- PASS: All components present, load time < 3 seconds
- FAIL: Missing components or slow load, with details
```

### Expected Results
- All metrics cards visible
- Page loads in < 3 seconds
- No console errors

### Acceptance Criteria
- [ ] All UI components render
- [ ] Metrics display correctly
- [ ] Page loads under 3 seconds

---

## CAI-CP-03: AI Analysis Trigger

**Priority**: Critical
**Duration**: ~120 seconds
**Last Run**: [TBD]
**Status**: Not Run

### Description
Verifies the AI analysis flow works end-to-end.

### Prerequisites
- User is authenticated
- Dashboard is accessible

### Playwright MCP Prompt

```
Use Playwright to test ConversionAI AI analysis:

1. Navigate to dashboard: https://conversionai-web-production.up.railway.app/app
2. Find and click the "Run New Analysis" or "Start Analysis" button
3. Wait for analysis to begin:
   - Look for loading indicator or progress bar
   - Page may redirect to analysis status page
4. Wait up to 120 seconds for completion:
   - Poll every 5 seconds for completion status
   - Look for "Analysis Complete" or recommendations appearing
5. Once complete, verify:
   - At least 5 recommendations are displayed
   - Each recommendation has:
     - Title text
     - Impact badge (High/Medium/Low)
     - Effort badge (Easy/Medium/Hard)
6. Take screenshot of results as "cai-cp-03-analysis-results.png"
7. Check console for errors

Report results as:
- PASS: Analysis completed with 5+ recommendations
- FAIL: Timeout, errors, or insufficient recommendations
Include: recommendation count, total time taken
```

### Expected Results
- Analysis completes within 120 seconds
- Minimum 5 recommendations generated
- No critical errors

### Acceptance Criteria
- [ ] Analysis triggers successfully
- [ ] Progress indication shown
- [ ] 5+ recommendations generated
- [ ] Results display correctly

---

## CAI-CP-04: Recommendation Detail Modal

**Priority**: Critical
**Duration**: ~30 seconds
**Last Run**: [TBD]
**Status**: Not Run

### Description
Verifies recommendation details and interaction.

### Prerequisites
- Analysis has been run (CP-03 passed)
- Recommendations exist in the system

### Playwright MCP Prompt

```
Use Playwright to test recommendation interaction:

1. Navigate to recommendations: https://conversionai-web-production.up.railway.app/app/recommendations
2. Wait for recommendations list to load
3. Click on the first recommendation in the list
4. Verify modal or detail page opens with:
   - Recommendation title
   - Full description/reasoning
   - Impact score (1-10 or High/Medium/Low)
   - Effort score (1-10 or Easy/Medium/Hard)
   - Implementation steps or instructions
   - Code snippet section (if applicable)
5. Find "Mark as Implemented" or similar status button
6. Click the button to change status
7. Verify:
   - Modal closes or status updates
   - Recommendation shows new status in list
8. Take screenshot as "cai-cp-04-recommendation-detail.png"

Report results as:
- PASS: Modal displays correctly, status updates
- FAIL: Missing content or interaction fails
```

### Expected Results
- Modal displays all required fields
- Status change persists
- UI updates correctly

### Acceptance Criteria
- [ ] Detail view shows complete information
- [ ] Status change works
- [ ] UI reflects changes

---

## CAI-CP-05: Billing Upgrade Flow

**Priority**: Critical
**Duration**: ~45 seconds
**Last Run**: [TBD]
**Status**: Not Run

### Description
Verifies Shopify billing integration works correctly.

### Prerequisites
- User is authenticated
- App uses Shopify test billing mode

### Playwright MCP Prompt

```
Use Playwright to test ConversionAI billing:

1. Navigate to upgrade page: https://conversionai-web-production.up.railway.app/app/upgrade
2. Wait for pricing page to load
3. Verify three pricing tiers are displayed:
   - Free tier with features list
   - Basic tier ($19/month) with features
   - Pro tier ($49/month) with "Most Popular" badge
4. Click "Upgrade to Pro" or "Choose Pro" button
5. Wait for Shopify billing page to load:
   - Should show charge confirmation screen
   - Amount should display $49.00/month
6. On Shopify billing screen:
   - Click "Approve charge" button (test mode)
7. Wait for redirect back to app (max 10 seconds)
8. Verify:
   - User lands on dashboard or success page
   - Pro plan indicator visible (badge, text, or feature unlock)
9. Take screenshot as "cai-cp-05-billing-success.png"

Report results as:
- PASS: Billing flow completes, Pro status confirmed
- FAIL: Any step fails, with error details
```

### Expected Results
- All pricing tiers displayed
- Shopify billing screen loads
- Upgrade completes successfully
- Plan status updates in app

### Acceptance Criteria
- [ ] Pricing page displays correctly
- [ ] Shopify billing integration works
- [ ] Plan upgrade reflects in app

---

## Test Execution Log

| Date | Tester | Tests Run | Pass | Fail | Notes |
|------|--------|-----------|------|------|-------|
| TBD | - | - | - | - | - |

---

## How to Run Tests

### With Claude Code / Claude Desktop

1. Ensure Playwright MCP is configured in `.mcp.json`
2. Open this file in your conversation
3. Copy the "Playwright MCP Prompt" for the test you want to run
4. Paste to Claude and execute
5. Document results in `tests/RESULTS.md`

### Manual Execution

If Playwright MCP is not available:
1. Follow test steps manually in browser
2. Take screenshots at each verification point
3. Document any failures with error messages
4. Update results file accordingly

---

## Troubleshooting

### OAuth Redirect Loop
- Clear browser cookies for the domain
- Verify SHOPIFY_API_KEY matches Partners dashboard
- Check Railway logs for OAuth errors

### Analysis Timeout
- Check Redis connection in Railway
- Verify Claude API key is valid
- Check Railway logs for queue errors

### Billing Page Not Loading
- Ensure app is in Shopify test mode
- Verify billing scopes in shopify.app.toml
- Check for CSP errors in console

---

## Related Documentation

- [RESULTS.md](./RESULTS.md) - Test execution results
- [README.md](../README.md) - App documentation
- [IMPLEMENTATION_LOG.md](../IMPLEMENTATION_LOG.md) - Development log
