# Deployment Guide

## Overview

Each APEX app deploys independently. This guide covers deployment to major platforms.

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Shopify App setup in Partner Dashboard
- [ ] App URLs configured (callback URLs, GDPR webhooks)
- [ ] Test in Shopify development store
- [ ] Production build succeeds locally

## Fly.io (Recommended)

### Why Fly.io?
- Free tier sufficient for starting out
- Global edge deployment
- Easy database setup (PostgreSQL)
- Great performance for Shopify apps

### Setup

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Initialize app (from app directory)
cd apps/app-01-your-name
flyctl launch

# Follow prompts:
# - App name: app-01-your-name
# - Region: Choose closest to your users
# - PostgreSQL: Yes (creates database)

# Set environment variables
flyctl secrets set SHOPIFY_API_KEY=your_key_here
flyctl secrets set SHOPIFY_API_SECRET=your_secret_here
flyctl secrets set SCOPES=read_products,write_products
flyctl secrets set HOST=https://your-app.fly.dev

# Deploy
flyctl deploy
```

### Database Setup

```bash
# Connect to database
flyctl postgres connect -a your-app-db

# Run migrations (from app directory)
npm run prisma:migrate deploy
```

### Monitoring

```bash
# View logs
flyctl logs

# Check status
flyctl status

# Open app
flyctl open
```

## Railway

### Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd apps/app-01-your-name
railway init

# Link project
railway link

# Add PostgreSQL
# (Do this in Railway dashboard)

# Set environment variables
railway variables set SHOPIFY_API_KEY=your_key_here
railway variables set SHOPIFY_API_SECRET=your_secret_here
railway variables set SCOPES=read_products,write_products

# Deploy
railway up
```

## Render

### Setup

1. Create account at render.com
2. New Web Service
3. Connect GitHub repo
4. Configure:
   - Name: app-01-your-name
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables (in dashboard)
6. Create PostgreSQL database
7. Deploy

## Environment Variables

Required for all apps:

```bash
# Shopify Credentials
SHOPIFY_API_KEY=shpca_xxxxx
SHOPIFY_API_SECRET=shpss_xxxxx

# App Configuration
SCOPES=read_products,write_products,read_customers
HOST=https://your-app.fly.dev

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Environment
NODE_ENV=production
```

## Database Migrations

### Production Migrations

```bash
# Generate migration
npm run prisma:migrate dev --name your_migration_name

# Deploy to production (non-interactive)
npm run prisma:migrate deploy
```

### Rollback Strategy

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Apply specific migration
npx prisma migrate deploy
```

## Shopify App Configuration

### Partner Dashboard Setup

1. Go to partners.shopify.com
2. Apps → Create app
3. Create app manually
4. Configure:
   - App URL: `https://your-app.fly.dev`
   - Allowed redirection URL(s):
     - `https://your-app.fly.dev/auth/callback`
     - `https://your-app.fly.dev/auth/shopify/callback`
   - GDPR webhooks (if required):
     - `https://your-app.fly.dev/webhooks/gdpr/customers-data-request`
     - `https://your-app.fly.dev/webhooks/gdpr/customers-redact`
     - `https://your-app.fly.dev/webhooks/gdpr/shop-redact`

### App Scopes

Common scopes:
- `read_products` - View products
- `write_products` - Modify products
- `read_orders` - View orders
- `read_customers` - View customers
- `write_script_tags` - Add scripts to storefront

### Distribution

- **Public**: Submit to Shopify App Store
- **Custom**: Share direct install link with specific merchants
- **Private**: Only your own stores

## CI/CD (Optional)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## Monitoring & Logging

### Error Tracking

Consider adding:
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (APM)

### Uptime Monitoring

- UptimeRobot (free)
- Pingdom
- StatusCake

### Example Sentry Setup

```typescript
import * as Sentry from '@sentry/remix';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Performance Optimization

### CDN for Static Assets

- Use Cloudflare or Fastly
- Enable gzip/brotli compression

### Database Optimization

- Add indexes for frequently queried fields
- Use connection pooling (PgBouncer)
- Monitor slow queries

### Caching

- Redis for session storage
- Cache API responses
- Use Shopify's caching headers

## Security

### SSL/TLS

All platforms provide free SSL certificates.

### Environment Variables

Never commit `.env` files. Use platform secret management.

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Backup Strategy

### Database Backups

```bash
# Fly.io automatic backups (enabled by default)
# Manual backup:
flyctl postgres backup create -a your-app-db
```

### Code Backups

- Use Git for version control
- Tag releases: `git tag v1.0.0`
- Keep production branch protected

## Troubleshooting

### App won't install

- Check redirect URLs match exactly
- Verify scopes are correct
- Ensure HOST environment variable matches deployment URL

### Database connection errors

- Verify DATABASE_URL is correct
- Check database is running
- Ensure migrations are applied

### Build failures

- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all dependencies are in package.json

## Cost Estimation

### Fly.io
- **Free tier**: 3 VMs, 3GB storage
- **Paid**: ~$5-20/month per app

### Railway
- **Free tier**: $5 credit/month
- **Paid**: Usage-based, ~$10-30/month

### Render
- **Free tier**: Limited resources
- **Paid**: $7+/month per service

### Database
- **Fly.io PostgreSQL**: $10-30/month
- **Railway PostgreSQL**: Included
- **Render PostgreSQL**: $7+/month

## Next Steps

After deployment:
1. Test thoroughly in production
2. Submit to Shopify App Store (if public)
3. Setup monitoring and alerts
4. Document any deployment-specific issues
5. Update `docs/lessons-learned.md`
