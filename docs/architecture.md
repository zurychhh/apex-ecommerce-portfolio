# Architecture Overview

## Monorepo Structure

We use npm workspaces for:
- **Code reuse**: 60-70% shared across apps
- **Unified tooling**: One ESLint, Prettier, TypeScript config
- **Atomic updates**: Change shared packages once, all apps benefit

## Directory Structure

```
apex-ecommerce-portfolio/
├── apps/              # Individual Shopify/WooCommerce apps
├── packages/          # Shared code libraries
├── templates/         # Starter templates for new apps
└── docs/              # Documentation
```

## Shared Packages

### @apex/shared-auth
Handles Shopify OAuth flow. All apps use the same authentication logic.

**Key Functions:**
- `createShopifyAuth()` - Initialize OAuth configuration
- Session storage utilities

**Why Shared:**
- OAuth flow is identical across all Shopify apps
- Security best practices centralized
- Reduces auth-related bugs

### @apex/shared-billing
Wrapper around Shopify Billing API. Supports Free/Basic/Pro/Enterprise tiers.

**Key Functions:**
- `createSubscription()` - Create new subscription
- `checkSubscription()` - Verify subscription status
- `PLANS` - Plan configuration with pricing and features

**Why Shared:**
- Consistent pricing tiers across portfolio
- Centralized billing logic
- Easy to update pricing globally

### @apex/shared-ui
React components using Shopify Polaris. Includes:
- `PricingTable` - Display plan options
- `OnboardingWizard` - Multi-step setup flow
- `SettingsForm` - Configuration UI
- `useShopifyToast` - Toast notifications hook

**Why Shared:**
- Consistent UI/UX across all apps
- Polaris components pre-configured
- Reduces frontend development time

### @apex/shared-db
Prisma schema for Shop and Subscription models.

**Core Models:**
- `Shop` - Store info (domain, access token, installation date)
- `Subscription` - Billing info (plan, status, trial dates)

**Why Shared:**
- Every app needs shop and subscription tracking
- Consistent data model
- Each app extends with app-specific models

### @apex/shared-utils
Logging, formatting, and other helpers.

**Key Functions:**
- `logger` - Structured logging (info, error, warn, debug)
- `formatMoney()` - Currency formatting
- `formatDate()` - Date formatting
- `slugify()` - URL-friendly strings
- `truncate()` - Text truncation

**Why Shared:**
- Common utilities needed everywhere
- Consistent formatting across apps
- Reduces code duplication

## App Structure

Each app in `/apps/` is an independent Shopify Remix application that:
- Imports shared packages
- Has its own Prisma schema (extends shared-db)
- Deploys independently
- Has its own Shopify App Store listing

## Data Flow

```
1. User installs app
   ↓
2. OAuth flow (shared-auth)
   ↓
3. Shop record created (shared-db)
   ↓
4. User selects plan
   ↓
5. Subscription created (shared-billing)
   ↓
6. User configures app
   ↓
7. App-specific features
   ↓
8. Data stored (shared-db + app models)
```

## Development Workflow

1. **Start with template**
   - Copy `templates/shopify-remix-app` to `apps/app-XX-name`
   - Fill out PROJECT_BRIEF.md

2. **Build app-specific features**
   - Add routes in `app/routes/`
   - Extend Prisma schema with app models
   - Import shared packages as needed

3. **Extract reusable code**
   - After 2nd use, move to shared packages
   - Update other apps to use shared code

4. **Repeat for next app**
   - 50% faster due to shared code
   - Focus only on unique features

## Deployment

Each app deploys independently to:
- Fly.io (recommended)
- Railway
- Render
- Heroku

Database per app or shared database (TBD based on scaling needs).

## Testing Strategy

- **Unit tests**: Shared packages (critical logic)
- **Integration tests**: App-specific features
- **Manual testing**: Development stores before production

## Scaling Considerations

- **Horizontal**: Each app scales independently
- **Code updates**: Update shared packages affects all apps
- **Database**: Consider multi-tenancy vs separate DBs
- **Monitoring**: Centralized logging and error tracking

## Security

- API keys in environment variables
- OAuth tokens encrypted at rest
- Rate limiting on API endpoints
- Regular dependency updates
- Security audits on shared packages

## Future Enhancements

- Add testing framework
- CI/CD pipeline
- Shared analytics package
- Shared email templates
- Shared webhook handlers
