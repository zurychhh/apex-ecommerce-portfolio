# Shopify Development Environment Setup

## ✅ Completed Setup

- [x] Shopify CLI installed (version: 3.88.1)
- [x] Authenticated with ApexMind AI Labs Partner account
- [x] Development store connected: apexmind-dev-01
- [x] Monorepo structure verified
- [x] Configuration files created

## 🔑 Credentials Location

**DO NOT COMMIT:**
- `.env` files (add to .gitignore)
- Shopify API keys/secrets
- Database credentials

**Safe to commit:**
- `.env.example` (template)
- `shopify.app.toml` (configuration structure)

## 🚀 Quick Start for New App

### Create App #1 (ConversionAI)
```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps
shopify app init

# Select:
# - Template: Remix
# - Name: app-01-conversionai
# - Connect to: apexmind-dev-01
```

### Start Development
```bash
cd apps/app-01-conversionai
npm install
npm run dev

# This will:
# - Start local dev server (port 3000)
# - Create tunnel to dev store
# - Auto-refresh on code changes
```

## 🔗 Important Links

- Partner Dashboard: https://partners.shopify.com
- Dev Store Admin: https://admin.shopify.com/store/apexmind-dev-01
- Shopify Docs: https://shopify.dev/docs/apps
- GitHub Repo: https://github.com/zurychhh/apex-ecommerce-portfolio

## 📋 Environment Variables Checklist

Before deploying to Railway:
- [ ] SHOPIFY_API_KEY (from Partner Dashboard)
- [ ] SHOPIFY_API_SECRET (from Partner Dashboard)
- [ ] DATABASE_URL (from Railway)
- [ ] ANTHROPIC_API_KEY (from Anthropic Console)
- [ ] SESSION_SECRET (generate: openssl rand -base64 32)

## 🆘 Troubleshooting

### "Not authenticated"
```bash
shopify auth logout
shopify auth login
```

### "Store not found"
Verify dev store name in Partner Dashboard

### "Permission denied"
Check scopes in shopify.app.toml match app requirements

## 📦 Monorepo Structure

```
apex-ecommerce-portfolio/
├── apps/
│   └── app-01-conversionai/        # First Shopify app
├── packages/
│   ├── shared-auth/                # Shared authentication logic
│   ├── shared-billing/             # Shared billing logic
│   ├── shared-ui/                  # Shared UI components
│   ├── shared-db/                  # Shared database logic
│   └── shared-utils/               # Shared utilities
├── docs/                           # Documentation
├── .shopify-cli.yml                # Shopify CLI configuration
├── shopify.app.toml                # Shopify app configuration
└── .env.example                    # Environment variables template
```

## 🔐 Authentication Details

- **Authenticated as:** rafaloleksiakconsulting@gmail.com
- **Organization:** ApexMind AI Labs
- **CLI Version:** 3.88.1
- **Node Version:** v24.9.0

## 📝 Next Steps

1. Create first Shopify app using `shopify app init`
2. Configure app-specific .env file
3. Start development server
4. Connect shared packages for code reuse
5. Deploy to Railway when ready
