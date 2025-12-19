# ConversionAI - Manual Setup Steps Required

**Status:** Infrastructure 90% Complete | Manual Browser Steps Required
**Date:** 2025-12-19
**Commit:** 23e55ed

---

## ✅ COMPLETED AUTOMATICALLY

### 1. Development Environment
- ✅ Shopify CLI installed (v3.88.1)
- ✅ Authenticated as rafaloleksiakconsulting@gmail.com
- ✅ Dev store connected: apexmind-dev-01.myshopify.com
- ✅ Node.js v24.9.0 verified
- ✅ Dependencies installed (884 packages)
- ✅ Prisma client generated
- ✅ Playwright Chromium installed (159.6 MB)

### 2. Configuration Files
- ✅ `.env` created with API keys (ANTHROPIC_API_KEY, RESEND_API_KEY)
- ✅ `.env.example` template
- ✅ `shopify.app.toml` base configuration
- ✅ `railway.json` deployment config
- ✅ Prisma schema (Shop, Subscription, Recommendation, ShopMetrics)

### 3. CI/CD Pipeline
- ✅ GitHub Actions workflow (`.github/workflows/deploy-conversionai.yml`)
- ✅ Railway token added to GitHub Secrets
- ✅ Auto-deployment on push to main branch
- ✅ Automatic Prisma migrations on deploy

### 4. Git Repository
- ✅ All files committed (commit 23e55ed)
- ✅ Pushed to https://github.com/zurychhh/apex-ecommerce-portfolio
- ✅ Monorepo structure with shared packages

---

## ⚠️ MANUAL STEPS REQUIRED (Browser Interaction)

These steps **cannot be automated** and require browser-based authentication:

### STEP 1: Railway Project Setup (15 min)

Railway CLI requires interactive browser login. Follow these steps:

```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai

# 1. Login to Railway (opens browser)
railway login
# Browser will open → Login with GitHub or Email
# After login, return to terminal

# 2. Create new project
railway init
# When prompted:
# - Project name: "conversionai-production"
# - Start from: "Empty Project"

# 3. Add PostgreSQL database
railway add
# Select: PostgreSQL
# Railway will auto-generate DATABASE_URL

# 4. Add Redis database
railway add
# Select: Redis
# Railway will auto-generate REDIS_URL

# 5. Generate domain for deployment
railway domain
# Note the URL: https://conversionai-production-xxxxx.up.railway.app
# SAVE THIS URL - needed for Shopify configuration

# 6. Set environment variables
railway variables set NODE_ENV=production
railway variables set ANTHROPIC_API_KEY=sk-ant-api03-***YOUR_ANTHROPIC_KEY***
railway variables set RESEND_API_KEY=re_***YOUR_RESEND_KEY***
railway variables set SCOPES=read_products,read_orders,read_themes,read_analytics,read_customers

# 7. Link this directory to Railway project
railway link
# Select the "conversionai-production" project you just created
```

**Expected Result:** Railway project created, databases provisioned, domain generated.

---

### STEP 2: Shopify App Creation (10 min)

Create the Shopify app in Partner Dashboard:

#### Option A: Via Shopify CLI (Recommended)

```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai

# Start development server with reset flag
shopify app dev --reset --store apexmind-dev-01

# This will:
# 1. Prompt to create new app
# 2. Ask for app name: "ConversionAI Development"
# 3. Register app in Partner Dashboard
# 4. Generate client_id and client_secret
# 5. Update shopify.app.toml automatically
# 6. Open browser for OAuth installation
```

#### Option B: Via Partner Dashboard

1. Go to https://partners.shopify.com
2. Navigate to: **Apps** → **Create app**
3. Select: **Create app manually**
4. Fill in:
   - **App name:** ConversionAI Development
   - **App URL:** [Railway URL from Step 1.5]
   - **Allowed redirection URLs:**
     - `https://[RAILWAY_URL]/auth/callback`
     - `https://[RAILWAY_URL]/auth/shopify/callback`
5. Click **Create app**
6. Go to **Configuration** → Copy **Client ID** and **Client secret**
7. Update `shopify.app.toml`:
   ```toml
   client_id = "[PASTE_CLIENT_ID_HERE]"
   application_url = "https://[RAILWAY_URL]"
   ```

**Expected Result:** App created in Partner Dashboard, credentials obtained.

---

### STEP 3: Configure Shopify App with Railway URL (5 min)

Update `shopify.app.toml` with Railway deployment URL:

```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai

# Edit shopify.app.toml
nano shopify.app.toml
```

Replace `your-app.railway.app` with actual Railway URL:

```toml
application_url = "https://conversionai-production-xxxxx.up.railway.app"

[auth]
redirect_urls = [
  "https://conversionai-production-xxxxx.up.railway.app/auth/callback",
  "https://conversionai-production-xxxxx.up.railway.app/auth/shopify/callback"
]

[[webhooks.subscriptions]]
topics = [ "customers/data_request" ]
uri = "https://conversionai-production-xxxxx.up.railway.app/webhooks/gdpr/customers-data-request"

[[webhooks.subscriptions]]
topics = [ "customers/redact" ]
uri = "https://conversionai-production-xxxxx.up.railway.app/webhooks/gdpr/customers-redact"

[[webhooks.subscriptions]]
topics = [ "shop/redact" ]
uri = "https://conversionai-production-xxxxx.up.railway.app/webhooks/gdpr/shop-redact"

[[webhooks.subscriptions]]
topics = [ "app/uninstalled" ]
uri = "https://conversionai-production-xxxxx.up.railway.app/webhooks/app-uninstalled"
```

Push updated config to Shopify:

```bash
shopify app config push
```

---

### STEP 4: Add Shopify Credentials to Railway (3 min)

```bash
# Get credentials from Shopify CLI
shopify app env show

# Copy SHOPIFY_API_KEY and SHOPIFY_API_SECRET

# Add to Railway
railway variables set SHOPIFY_API_KEY=[CLIENT_ID_FROM_ABOVE]
railway variables set SHOPIFY_API_SECRET=[CLIENT_SECRET_FROM_ABOVE]
railway variables set HOST=https://conversionai-production-xxxxx.up.railway.app
```

---

### STEP 5: Deploy to Railway (5 min)

```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai

# Deploy application
railway up

# This will:
# 1. Build the app (npm run build)
# 2. Deploy to Railway
# 3. Start server
# 4. Return deployment URL

# Run database migrations
railway run npx prisma migrate deploy

# Watch logs
railway logs --follow
```

**Expected Output:**
```
✓ Build successful
✓ Deployment live
✓ URL: https://conversionai-production-xxxxx.up.railway.app
```

---

### STEP 6: Install App on Dev Store (5 min)

```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai

# Start development server (creates OAuth tunnel)
shopify app dev --store apexmind-dev-01

# This will:
# 1. Open browser at: https://admin.shopify.com/store/apexmind-dev-01/oauth/install?client_id=xxx
# 2. Click "Install" button
# 3. Grant permissions
# 4. Redirect to app dashboard
```

**Verify Installation:**
1. Go to: https://admin.shopify.com/store/apexmind-dev-01/settings/apps
2. Check that "ConversionAI Development" appears in installed apps
3. Click app → Should open app dashboard

---

### STEP 7: Verify Everything Works (5 min)

Run these checks:

```bash
# 1. Check Railway status
railway status
# Should show: ✓ Service running

# 2. Check environment variables
railway variables
# Should show ~15 variables including DATABASE_URL, REDIS_URL

# 3. Check database connection
railway run npx prisma studio
# Should open Prisma Studio at http://localhost:5555

# 4. Test app endpoint
curl https://conversionai-production-xxxxx.up.railway.app/
# Should return 200 or redirect to Shopify OAuth

# 5. Check GitHub Actions
gh run list --repo zurychhh/apex-ecommerce-portfolio --limit 1
# Should show successful workflow run
```

---

## 🔐 CREDENTIALS SUMMARY

### Shopify
- **Partner Email:** rafaloleksiakconsulting@gmail.com
- **Organization:** ApexMind AI Labs
- **Dev Store:** apexmind-dev-01.myshopify.com
- **App Name:** ConversionAI Development
- **Client ID:** [Get from Step 2]
- **Client Secret:** [Get from Step 2]

### Railway
- **Project Name:** conversionai-production
- **Deployment URL:** [Get from Step 1.5]
- **Token:** d02c1f21-*** (already in GitHub Secrets)
- **PostgreSQL:** Auto-provisioned (DATABASE_URL)
- **Redis:** Auto-provisioned (REDIS_URL)

### API Keys (Already Configured)
- **Claude API:** sk-ant-api03-*** (Check .env file or secure password manager)
- **Resend API:** re_*** (Check .env file or secure password manager)
- **GitHub Token:** ghp_*** (Check .env file or secure password manager)

---

## 📋 NEXT STEPS AFTER MANUAL SETUP

Once all manual steps are complete, you can proceed with:

### Immediate Next Steps
1. **Test local development:**
   ```bash
   cd apps/app-01-conversionai
   npm run dev
   ```

2. **Trigger first analysis:**
   - Open app in dev store
   - Click "Start Analysis" button
   - Wait for recommendations

3. **Monitor logs:**
   ```bash
   railway logs --follow
   ```

### Development Tasks (PROJECT_BRIEF.md → Week 1)
Implementation priorities:
1. ✅ Infrastructure (DONE)
2. ⏳ Shopify data fetching (`app/utils/shopify.server.ts`)
3. ⏳ Screenshot automation (`app/jobs/captureScreenshots.ts`)
4. ⏳ Claude API integration (`app/utils/claude.server.ts`)
5. ⏳ Analysis orchestration (`app/jobs/analyzeStore.ts`)
6. ⏳ Email notifications (`app/utils/email.server.ts`)

---

## 🆘 TROUBLESHOOTING

### Railway Login Issues
**Problem:** `railway login` doesn't open browser
**Solution:**
```bash
# Try direct browser link
railway login --browserless
# Copy the URL shown and open in browser manually
```

### Shopify App Creation Fails
**Problem:** `shopify app dev --reset` fails
**Solution:**
1. Go to Partner Dashboard manually
2. Create app via Option B (see Step 2)
3. Copy credentials to `.env` and `shopify.app.toml`

### Database Migration Fails
**Problem:** `railway run npx prisma migrate deploy` fails
**Solution:**
```bash
# Push schema without migration history
railway run npx prisma db push

# Or create new migration
railway run npx prisma migrate dev --name init
```

### OAuth Installation Fails
**Problem:** "App installation failed" in Shopify admin
**Solution:**
1. Check that `application_url` in `shopify.app.toml` matches Railway URL
2. Verify `redirect_urls` are correct
3. Run `shopify app config push` to sync changes
4. Try installation again

---

## 📞 SUPPORT

- **Shopify CLI Docs:** https://shopify.dev/docs/apps/tools/cli
- **Railway Docs:** https://docs.railway.app
- **Prisma Docs:** https://www.prisma.io/docs
- **Claude API Docs:** https://docs.anthropic.com

**Project Repository:** https://github.com/zurychhh/apex-ecommerce-portfolio
**Commit:** 23e55ed
