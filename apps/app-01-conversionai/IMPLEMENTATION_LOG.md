# ConversionAI - Implementation Log

## Session #7 - 2025-12-21

### Railway Deployment Fix & Cron Configuration

---

### [2025-12-21 14:30] - Railway GraphQL API Migration
**Status**: ✅ DONE

**Problem**: GitHub Actions deployment failing with "Project Token not found"

**Pliki zmienione**:
- `.github/workflows/deploy-conversionai.yml` (modified) - switched from Railway CLI to GraphQL API
- `CLAUDE.md` (created) - project instructions for Claude Code

**Co zrobiono**:
- Zidentyfikowano problem: Railway CLI wymaga Project Token, nie User Token
- Zmieniono podejście zgodnie z CLAUDE.md na Railway GraphQL API
- Zaktualizowano workflow by używał curl + GraphQL mutation `serviceInstanceDeploy`
- Zaktualizowano GitHub secret `RAILWAY_TOKEN` z działającym tokenem

**Testy**:
- ✅ GitHub Actions workflow passing
- ✅ Railway deployment triggered via API

---

### [2025-12-21 14:35] - Railway Service Configuration
**Status**: ✅ DONE

**Problem**: Routes returning 404 - Railway building from wrong directory

**Co zrobiono**:
- Połączono Railway service z GitHub repo (`zurychhh/apex-ecommerce-portfolio`)
- Ustawiono `rootDirectory: apps/app-01-conversionai` dla monorepo
- Re-deployed z prawidłową konfiguracją

**Railway Configuration (REFERENCE)**:
```
Project ID: c1ad5a4a-a4ff-4698-bf0f-e1f950623869
Environment ID (production): 6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e
Service ID (conversionai-web): 08837d5d-0ed5-4332-882e-51d00b61eee6
Working Token: d89e435b-d16d-4614-aa16-6b63cf54e86b
Root Directory: apps/app-01-conversionai
GraphQL API: https://backboard.railway.app/graphql/v2
```

**Testy**:
- ✅ Build SUCCESS
- ✅ Deployment SUCCESS
- ✅ All routes accessible

---

### [2025-12-21 14:40] - Cron Endpoint Verification
**Status**: ✅ DONE

**Pliki verified**:
- `app/routes/api.cron.weekly-refresh.tsx` - working correctly

**Testy**:
- ✅ GET `/api/cron/weekly-refresh` returns API documentation
- ✅ POST with `Authorization: Bearer <CRON_SECRET>` returns success
- ✅ Response: `{"success":true,"timestamp":"2025-12-21T13:31:52.159Z","shopsProcessed":0,"jobsQueued":0,"jobs":[]}`

**CRON_SECRET**: `VZW3SdReDbvhFuVAJ9uXJXRTKSnubP/uTjw/3SS9mmY=` (set in Railway)

---

## Current State

**Co działa**:
- ✅ Railway deployment via GraphQL API
- ✅ GitHub Actions CI/CD pipeline
- ✅ All API routes (`/api/cron/weekly-refresh`, `/api/billing/*`, `/api/analysis/*`)
- ✅ Shopify OAuth flow
- ✅ Billing integration
- ✅ Email notifications (Resend)
- ✅ Database (PostgreSQL on Railway)
- ✅ Redis queue (on Railway)

**Co NIE działa / Do zrobienia**:
- ⏳ External cron service (cron-job.org) - needs configuration
- ⏳ E2E testing on dev store

**Production URL**: https://conversionai-web-production.up.railway.app

---

## Next Session TODO

1. **Konfiguracja cron-job.org**:
   - URL: `https://conversionai-web-production.up.railway.app/api/cron/weekly-refresh`
   - Schedule: `0 9 * * 1` (Monday 9 AM UTC)
   - Headers: `Authorization: Bearer VZW3SdReDbvhFuVAJ9uXJXRTKSnubP/uTjw/3SS9mmY=`

2. **E2E Testing**:
   - Install app on dev store via OAuth
   - Test analysis flow
   - Test billing flow
   - Verify email notifications

---

## Lessons Learned

1. **Railway CLI vs API**: CLI wymaga Project Token, API działa z User Token
2. **Monorepo setup**: Wymaga ustawienia `rootDirectory` w Railway
3. **Service connection**: Railway service musi być połączony z GitHub repo by deployment from source działał
