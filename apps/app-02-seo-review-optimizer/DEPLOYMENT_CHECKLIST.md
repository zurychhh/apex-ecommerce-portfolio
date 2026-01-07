# ReviewBoost AI - Deployment Checklist

This document outlines the steps to deploy ReviewBoost AI to production.

## Pre-Deployment Requirements

### 1. Shopify Partner Account Setup
- [ ] Create new app in [Shopify Partner Dashboard](https://partners.shopify.com)
- [ ] Get `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`
- [ ] Update `client_id` in `shopify.app.toml`
- [ ] Configure OAuth redirect URLs:
  - `https://reviewboost-production.up.railway.app/auth/callback`
  - `https://reviewboost-production.up.railway.app/auth/shopify/callback`

### 2. External API Keys
- [ ] [Anthropic Console](https://console.anthropic.com): Get `ANTHROPIC_API_KEY`
- [ ] [Resend Dashboard](https://resend.com/api-keys): Get `RESEND_API_KEY`

### 3. Generate Secrets
```bash
# Generate CRON_SECRET
openssl rand -hex 32
```

---

## Railway Deployment

### Step 1: Create Railway Service

```bash
# Option A: Railway CLI
railway login
railway link  # Link to existing project
railway up    # Deploy

# Option B: Railway Dashboard
# 1. Go to https://railway.app/project/c1ad5a4a-a4ff-4698-bf0f-e1f950623869
# 2. Click "+ New Service"
# 3. Select "GitHub Repo" → apex-ecommerce-portfolio
# 4. Set Root Directory: apps/app-02-seo-review-optimizer
```

### Step 2: Add PostgreSQL Database
1. Click "+ New" → "Database" → "PostgreSQL"
2. Database URL is auto-injected as `DATABASE_URL`

### Step 3: Add Redis (Optional - for future queue features)
1. Click "+ New" → "Database" → "Redis"
2. Redis URL is auto-injected as `REDIS_URL`

### Step 4: Configure Environment Variables

Using Railway API (replace `<TOKEN>` with Railway token):

```bash
# Service ID will be available after creating the service
SERVICE_ID="your-new-service-id"
ENV_ID="6fd2892b-9846-4e7b-bf9a-dafef8bc1c4e"
PROJECT_ID="c1ad5a4a-a4ff-4698-bf0f-e1f950623869"

# Set each variable
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { variableUpsert(input: { projectId: \"'$PROJECT_ID'\", environmentId: \"'$ENV_ID'\", serviceId: \"'$SERVICE_ID'\", name: \"SHOPIFY_API_KEY\", value: \"your_value\" }) }"
  }'
```

Required variables:
| Variable | Source |
|----------|--------|
| `SHOPIFY_API_KEY` | Shopify Partners Dashboard |
| `SHOPIFY_API_SECRET` | Shopify Partners Dashboard |
| `SHOPIFY_APP_URL` | `https://reviewboost-production.up.railway.app` |
| `SCOPES` | `read_products,write_products,read_content,write_content` |
| `ANTHROPIC_API_KEY` | Anthropic Console |
| `RESEND_API_KEY` | Resend Dashboard |
| `CRON_SECRET` | Self-generated |
| `NODE_ENV` | `production` |

### Step 5: Configure Custom Domain (Optional)
1. Go to Service → Settings → Domains
2. Add custom domain or use Railway's `*.up.railway.app`

### Step 6: Deploy
1. Push to main branch, Railway auto-deploys
2. Or trigger manual deploy in Railway Dashboard

---

## Post-Deployment

### Verify Deployment
```bash
# Check health
curl https://reviewboost-production.up.railway.app/

# Check OAuth flow (opens in browser)
open https://admin.shopify.com/store/YOUR_DEV_STORE/apps/reviewboost
```

### Run Database Migrations
Migrations run automatically on deploy via `nixpacks.toml`:
```toml
[start]
cmd = "npx prisma migrate deploy && npm run start"
```

### Set Up Monthly Usage Reset
Configure cron job (e.g., cron-job.org, Railway Cron):
```bash
# Run on 1st of each month at 00:00 UTC
0 0 1 * * curl -X POST https://reviewboost-production.up.railway.app/api/cron/reset-usage \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

---

## Shopify App Store Preparation

### App Listing Requirements
- [ ] App icon (1200x1200 PNG)
- [ ] Feature screenshot (1920x1200 or similar)
- [ ] App description (short + long)
- [ ] Pricing details
- [ ] Privacy Policy URL (`/privacy`)
- [ ] Terms of Service URL (`/terms`)
- [ ] Support contact (`/support`)

### GDPR Compliance
All webhooks are pre-configured in `shopify.app.toml`:
- `/webhooks/customers/redact`
- `/webhooks/customers/data-request`
- `/webhooks/shop/redact`
- `/webhooks/app-uninstalled`

---

## Troubleshooting

### OAuth Issues
- Check `SHOPIFY_APP_URL` matches actual Railway URL
- Verify redirect URLs in Shopify Partners Dashboard
- Check Railway logs for errors

### Database Connection
- Verify `DATABASE_URL` is set in Railway
- Run `npx prisma migrate deploy` manually if needed

### Build Failures
- Check Node.js version (18.x required)
- Verify all dependencies in `package.json`
- Check Railway build logs

---

## Environment Quick Reference

| Environment | URL | Database |
|-------------|-----|----------|
| Development | http://localhost:3000 | Local PostgreSQL |
| Production | https://reviewboost-production.up.railway.app | Railway PostgreSQL |

---

**Last Updated:** 2026-01-07
