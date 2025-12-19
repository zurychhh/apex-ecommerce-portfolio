# Shopify Remix App Template

This is the starter template for new APEX portfolio apps.

## Setup New App

```bash
# 1. Copy this template
cp -r templates/shopify-remix-app apps/app-XX-your-name

# 2. Update package.json name
cd apps/app-XX-your-name
# Edit package.json, change name from "@apex/shopify-remix-template" to "@apex/app-XX-your-name"

# 3. Fill out PROJECT_BRIEF.md
# Copy from templates/PROJECT_BRIEF.md and fill it out

# 4. Install dependencies
npm install

# 5. Setup environment
cp .env.example .env
# Fill in Shopify API credentials

# 6. Initialize database
npm run prisma:generate
npm run prisma:migrate

# 7. Start dev server
npm run dev
```

## What's Included

- ✅ Shopify OAuth flow (@shopify/shopify-app-remix)
- ✅ App Bridge embedded app setup
- ✅ Polaris UI components
- ✅ Prisma database setup
- ✅ Basic routes (index, settings)
- ✅ Webhook handlers stub
- ✅ TypeScript configured

## Shared Packages Available

Import from:
- `@apex/shared-auth` — Auth logic
- `@apex/shared-billing` — Subscription management
- `@apex/shared-ui` — React components
- `@apex/shared-db` — Database models
- `@apex/shared-utils` — Helpers

Example:
```typescript
import { logger } from '@apex/shared-utils';
import { PricingTable } from '@apex/shared-ui';
import { PLANS } from '@apex/shared-billing';
import { prisma } from '@apex/shared-db';

logger.info('App started');
const shops = await prisma.shop.findMany();
```

## Customization

1. Update `package.json` name
2. Update app name in `shopify.app.toml` (if using Shopify CLI)
3. Extend Prisma schema for app-specific models
4. Build your features in `app/routes/`
5. Add components to `app/components/`

## Project Structure

```
app/
├── routes/
│   ├── app._index.tsx      # Main dashboard
│   ├── app.settings.tsx    # Settings page
│   └── auth.$.tsx          # OAuth routes
├── shopify.server.ts       # Shopify config
└── root.tsx                # Root layout

prisma/
└── schema.prisma           # Database schema (extend as needed)
```

## Development

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run typecheck        # TypeScript check
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
```

## Deployment

See `/docs/deployment.md` for deployment guides (Fly.io, Railway, Render).

## Next Steps

1. Read `APEX_FRAMEWORK.md` for philosophy
2. Fill out `PROJECT_BRIEF.md` for your app
3. Start building features!
4. Extract reusable code to shared packages
