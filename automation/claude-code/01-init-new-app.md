# 🚀 APEX Phase 1: Initialize New App
**Version**: 1.0.0 | **Execution Time**: 10-15 minutes  
**Prerequisites**: MCP servers configured, Railway CLI authenticated

---

## 📋 INPUT PARAMETERS

Before starting, gather these from user:

```yaml
app_name: "Full app name (e.g., PriceRounder)"
app_slug: "Short slug (e.g., pricerounder)"
app_number: "Portfolio sequence (e.g., 02)"
business_concept: "1-2 sentence problem/solution"
target_category: "Shopify category (e.g., Marketing & Conversion)"
```

---

## 🎯 EXECUTION WORKFLOW

### STEP 1: Documentation Research (2-3 min)

**Use Shopify Dev MCP:**
```
Tool: learn_shopify_api

Query: "How to build a Shopify app with [RELEVANT_FEATURES]"
- Authentication flow
- Billing API integration
- [Specific APIs needed for this app]
- Best practices

Document findings in memory for later reference.
```

**Expected output:**
- Clear understanding of required Shopify APIs
- Authentication approach confirmed
- Billing strategy determined

---

### STEP 2: Project Scaffolding (3-5 min)

**Use bash_tool:**
```bash
cd ~/projects/apex-ecommerce-portfolio/apps

# Scaffold new Shopify app
shopify app init \
  --name="app-[NUMBER]-[SLUG]" \
  --template=remix \
  --package-manager=npm

cd app-[NUMBER]-[SLUG]

# Install dependencies
npm install

# Install additional packages
npm install bull ioredis resend @sentry/remix @prisma/client
npm install -D prisma @types/node

# Initialize Prisma
npx prisma init --datasource-provider postgresql
```

**Expected output:**
- New app directory created
- Dependencies installed
- Prisma initialized with PostgreSQL

---

### STEP 3: Railway Infrastructure Setup (3-5 min)

**Use Railway GraphQL API (or bash_tool with Railway CLI):**

```graphql
# Create new project
mutation CreateProject {
  projectCreate(input: {
    name: "app-[NUMBER]-[SLUG]"
  }) {
    id
    name
  }
}

# Create PostgreSQL database
mutation CreateDatabase {
  pluginCreate(input: {
    projectId: "[PROJECT_ID]"
    plugin: "postgresql"
  }) {
    id
    name
  }
}

# Create Redis database
mutation CreateRedis {
  pluginCreate(input: {
    projectId: "[PROJECT_ID]"
    plugin: "redis"
  }) {
    id
    name
  }
}

# Create web service
mutation CreateWebService {
  serviceCreate(input: {
    projectId: "[PROJECT_ID]"
    name: "web"
    source: {
      repo: "apex-ecommerce-portfolio"
      rootDirectory: "apps/app-[NUMBER]-[SLUG]"
    }
  }) {
    id
    name
  }
}
```

**Alternative (simpler, via Railway CLI):**
```bash
cd ~/projects/apex-ecommerce-portfolio/apps/app-[NUMBER]-[SLUG]

# Create Railway project
railway init --name="app-[NUMBER]-[SLUG]"

# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Link to GitHub repo
railway link
```

**Expected output:**
- Railway project created
- PostgreSQL + Redis provisioned
- Web service configured

---

### STEP 4: Environment Variables Setup (2-3 min)

**Create `.env` file:**
```bash
cat > .env << 'EOF'
# Shopify App
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=
SCOPES=read_products,write_products,read_orders

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# AI Services (if needed)
CLAUDE_API_KEY=

# Email
RESEND_API_KEY=

# Error Tracking
SENTRY_DSN=

# Railway
HOST=0.0.0.0
PORT=3000
NODE_ENV=development
EOF
```

**Update Railway environment variables:**
```bash
railway variables set SHOPIFY_API_KEY="placeholder"
railway variables set SHOPIFY_API_SECRET="placeholder"
railway variables set HOST="0.0.0.0"
railway variables set PORT="3000"
# ... (repeat for all variables)
```

**Expected output:**
- `.env` file created locally
- Railway variables configured
- Placeholders ready for user input

---

### STEP 5: Database Schema Creation (2-3 min)

**Update `prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Session {
  id          String   @id
  shop        String
  state       String
  isOnline    Boolean  @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Shop {
  id              String   @id @default(cuid())
  domain          String   @unique
  accessToken     String
  scope           String
  email           String?
  name            String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // App-specific fields (customize per app)
  settings        Json?
  lastAnalysisAt  DateTime?
  
  // Relations
  subscriptions   Subscription[]
}

model Subscription {
  id                String   @id @default(cuid())
  shopId            String
  shop              Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  
  plan              String   // free, basic, pro, enterprise
  status            String   // active, cancelled, expired
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  shopifyChargeId   String?  @unique
  shopifyConfirmUrl String?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Add more models specific to your app here
```

**Run migration:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Expected output:**
- Database schema defined
- Initial migration created
- Prisma Client generated

---

### STEP 6: Shopify App Configuration (2-3 min)

**Update `shopify.app.[SLUG].toml`:**
```toml
name = "app-[NUMBER]-[SLUG]"
client_id = "placeholder"
application_url = "https://[SLUG]-web-production.up.railway.app"
embedded = true

[auth]
redirect_urls = [
  "https://[SLUG]-web-production.up.railway.app/auth/callback"
]

[webhooks]
api_version = "2024-10"

[[webhooks.subscriptions]]
topics = ["app/uninstalled"]
uri = "/webhooks"

[[webhooks.subscriptions]]
topics = ["shop/redact"]
uri = "/webhooks"

[[webhooks.subscriptions]]
topics = ["customers/redact"]
uri = "/webhooks"

[[webhooks.subscriptions]]
topics = ["customers/data_request"]
uri = "/webhooks"

[pos]
embedded = false

[build]
automatically_update_urls_on_dev = true
```

**Expected output:**
- Shopify app configured
- Webhook subscriptions defined
- Ready for Shopify Partners registration

---

### STEP 7: Git Initialization (1-2 min)

**Use GitHub MCP or bash_tool:**
```bash
cd ~/projects/apex-ecommerce-portfolio

# Create feature branch
git checkout -b feature/app-[NUMBER]-[SLUG]-init

# Add files
git add apps/app-[NUMBER]-[SLUG]

# Commit
git commit -m "feat(app-[NUMBER]): initialize [APP_NAME]

- Scaffold Remix app
- Setup Railway infrastructure
- Configure Prisma schema
- Setup environment variables
- Configure Shopify app"

# Push
git push origin feature/app-[NUMBER]-[SLUG]-init
```

**Expected output:**
- New branch created
- Initial commit pushed
- Ready for development

---

### STEP 8: PROJECT_BRIEF.md Generation (3-5 min)

**Create comprehensive PROJECT_BRIEF.md:**

```markdown
# [APP_NAME] - Project Brief

**App Number**: [NUMBER]  
**Slug**: [SLUG]  
**Created**: [DATE]  
**Status**: Initialization Complete ✅

---

## 🎯 BUSINESS CONCEPT

### Problem
[Describe the pain point this app solves]

### Solution
[Describe how this app solves it]

### Target Users
- [User persona 1]
- [User persona 2]

### Success Metrics
- Install rate: >3%
- Free→Paid: >3%
- Churn: <5%/month
- Rating: >4.5★

---

## 💰 MONETIZATION

### Pricing Tiers
```
FREE: [Features + Limits]
BASIC ($19/mo): [Features]
PRO ($49/mo): [Features]
ENTERPRISE ($99/mo): [Features]
```

### Revenue Projections
- Month 1: 50 installs, $200 MRR
- Month 3: 200 installs, $1,200 MRR
- Month 6: 500 installs, $4,000 MRR

---

## 🛠️ TECHNICAL ARCHITECTURE

### Stack
- Framework: Remix + @shopify/shopify-app-remix
- Database: PostgreSQL (Prisma ORM)
- Queue: Bull + Redis
- Hosting: Railway
- Error Tracking: Sentry
- Email: Resend

### Shopify Integration
- APIs: [List required APIs]
- Webhooks: [List webhooks]
- Scopes: [List OAuth scopes]

### Third-party Services
- [Service 1]: [Purpose]
- [Service 2]: [Purpose]

---

## 📋 MVP FEATURE SET

### Must Have (Week 1-2)
- [ ] OAuth authentication
- [ ] Dashboard UI
- [ ] [Core feature 1]
- [ ] [Core feature 2]
- [ ] Basic error handling

### Nice to Have (Week 3-4)
- [ ] Billing integration
- [ ] Email notifications
- [ ] Advanced [feature]
- [ ] Settings page

### Future Iterations
- [ ] [Enhancement 1]
- [ ] [Enhancement 2]
- [ ] [Integration X]

---

## 🧪 TESTING STRATEGY

### Critical Path Tests (Playwright MCP)
- CP-01: OAuth Installation
- CP-02: Dashboard Load
- CP-03: [Core Feature]
- CP-04: Billing Flow
- CP-05: Data Persistence

### Unit Tests (Vitest)
- API endpoints: 80%+ coverage
- Utility functions: 90%+ coverage
- Business logic: 100% coverage

---

## 🚀 DEPLOYMENT

### Infrastructure
- Railway Project: [PROJECT_ID]
- PostgreSQL: [DATABASE_URL]
- Redis: [REDIS_URL]

### Domains
- Production: https://[SLUG]-web-production.up.railway.app
- Development: http://localhost:3000

### CI/CD
- GitHub Actions: Auto-deploy on merge to main
- Preview deploys: On PR creation

---

## 📊 TIMELINE

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: Init | Day 1 | ✅ Scaffolding, infrastructure |
| Phase 2: Core Dev | Days 2-7 | Build features, tests |
| Phase 3: Integration | Days 8-10 | E2E tests, bug fixes |
| Phase 4: Deployment | Day 11 | Railway + Shopify deploy |
| Phase 5: Launch | Days 12-14 | Beta testing, iterate |

**Target Launch**: [DATE + 14 days]

---

## 🔗 RESOURCES

- Shopify Partner App: [URL]
- Railway Dashboard: [URL]
- GitHub Repo: apex-ecommerce-portfolio
- Sentry Project: [URL]
- Implementation Log: IMPLEMENTATION_LOG.md

---

**Next Step**: Read `automation/claude-code/02-core-development.md`
```

**Expected output:**
- Comprehensive PROJECT_BRIEF.md created
- All sections filled with app-specific details
- Clear roadmap established

---

### STEP 9: Verification & Handoff (2 min)

**Run verification checks:**
```bash
# Verify build
npm run build

# Verify Prisma
npx prisma validate

# Verify environment
cat .env | grep -v "^#" | grep "="

# Test dev server (quick check)
npm run dev &
sleep 10
curl -I http://localhost:3000
kill %1
```

**Create IMPLEMENTATION_LOG.md:**
```markdown
# Implementation Log - [APP_NAME]

## Session #1: Initialization - [DATE]

### Status: ✅ COMPLETE

### Completed Tasks
- [x] Shopify Dev MCP: Research APIs
- [x] Scaffolded Remix app
- [x] Railway infrastructure: PostgreSQL + Redis
- [x] Environment variables configured
- [x] Prisma schema created & migrated
- [x] Shopify app configuration
- [x] Git initialized & pushed
- [x] PROJECT_BRIEF.md created
- [x] Build passing

### Verification Results
```bash
✅ npm run build: SUCCESS
✅ npx prisma validate: OK
✅ Environment variables: All set
✅ Dev server: Responding
```

### Next Session
Execute Phase 2: Core Development
- Read: automation/claude-code/02-core-development.md
- Tasks: Implement [CORE_FEATURES]
- Timeline: 3-5 days

### Notes
- Railway project ID: [PROJECT_ID]
- Shopify app placeholder created (needs client_id update)
- Database schema extensible for app-specific models
```

**Update APEX_PROJECT_STATUS.md:**
```markdown
## [APP_NAME] - Phase 1 Complete ✅

**Progress**: 15% → 20%
**Status**: Infrastructure Ready
**Next**: Core Development

### Completed
- Scaffolding
- Database
- Railway setup
- Git initialization
- PROJECT_BRIEF.md

### Infrastructure
- Railway: [PROJECT_ID]
- Database: PostgreSQL
- Queue: Redis
- Hosting: Railway

### Next Steps
1. Implement core features
2. Build dashboard UI
3. Add billing integration
```

---

## ✅ COMPLETION CRITERIA

Before marking Phase 1 complete, verify:

- [ ] App scaffolded in `apps/app-[NUMBER]-[SLUG]/`
- [ ] Railway project created with PostgreSQL + Redis
- [ ] Environment variables configured (Railway + local)
- [ ] Prisma schema created with base models
- [ ] Database migrated successfully
- [ ] Shopify app configured (toml file)
- [ ] Git branch created and pushed
- [ ] PROJECT_BRIEF.md comprehensive and accurate
- [ ] IMPLEMENTATION_LOG.md started
- [ ] `npm run build` passing
- [ ] `npm run dev` starts without errors
- [ ] APEX_PROJECT_STATUS.md updated

---

## 🚨 TROUBLESHOOTING

### Railway Project Creation Fails
```bash
# Login again
railway login

# Verify authentication
railway whoami

# Create manually via dashboard if needed
# Then link: railway link
```

### Prisma Migration Fails
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Verify PostgreSQL is running (Railway)
railway logs postgresql

# Reset if needed (DESTRUCTIVE)
npx prisma migrate reset
```

### Build Errors
```bash
# Clear cache
rm -rf node_modules .cache build
npm install
npm run build
```

### MCP Tools Not Available
```bash
# Verify MCP servers
claude mcp list

# Should show: shopify-dev, playwright, github, shopify-admin
# If missing, run: automation/mcp/setup-mcp.sh
```

---

## 📝 REPORTING FORMAT

After completion, provide this summary to user:

```
✅ PHASE 1 COMPLETE: [APP_NAME] Initialized

📊 Time Taken: [X] minutes
🎯 Status: Infrastructure Ready

✅ Completed:
- Scaffolded Remix app
- Railway: PostgreSQL + Redis
- Database migrated
- Git initialized
- PROJECT_BRIEF.md created

📂 Files Created:
- apps/app-[NUMBER]-[SLUG]/ (entire app structure)
- apps/app-[NUMBER]-[SLUG]/PROJECT_BRIEF.md
- apps/app-[NUMBER]-[SLUG]/IMPLEMENTATION_LOG.md

🔗 Resources:
- Railway: https://railway.app/project/[PROJECT_ID]
- GitHub: [BRANCH_URL]
- Local: http://localhost:3000

🚀 Next Step:
Execute Phase 2: Core Development
- Read: automation/claude-code/02-core-development.md
- Timeline: 3-5 days
- Goal: Build [CORE_FEATURES]

Ready to continue? (yes/no)
```

---

**Version History:**
- v1.0.0 (2025-01-02): Initial release

**Maintained by:** APEX Automation Toolkit
