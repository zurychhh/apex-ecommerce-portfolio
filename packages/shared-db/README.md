# @apex/shared-db

Shared Prisma database schema and client for all APEX apps.

## Usage

```typescript
import { prisma, Shop, Subscription } from '@apex/shared-db';

// Query shops
const shops = await prisma.shop.findMany({
  where: { isActive: true },
  include: { subscriptions: true }
});

// Create shop
const shop = await prisma.shop.create({
  data: {
    domain: 'example.myshopify.com',
    accessToken: 'shpat_xxx',
    scope: 'read_products,write_products'
  }
});
```

## Schema

### Shop Model
- `id` - Unique identifier
- `domain` - Shopify shop domain (unique)
- `accessToken` - OAuth access token
- `scope` - Granted scopes
- `isActive` - Whether shop is active
- `installedAt` - Installation timestamp
- `updatedAt` - Last update timestamp

### Subscription Model
- `id` - Unique identifier
- `shopId` - Reference to Shop
- `plan` - Plan type (free/basic/pro/enterprise)
- `status` - Subscription status (active/cancelled/expired)
- `billingOn` - Next billing date
- `trialEndsOn` - Trial end date
- `shopifyChargeId` - Shopify charge ID

## Development

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema (no migration)
npm run db:push
```

## Extending Schema

Each app can extend this base schema by:
1. Copying schema.prisma to app's prisma directory
2. Adding app-specific models
3. Running migrations in app context

Example:
```prisma
// In your app's schema.prisma
// Include base models + add your own

model ProductSync {
  id        String   @id @default(cuid())
  shopId    String
  productId String
  syncedAt  DateTime @default(now())

  shop      Shop     @relation(fields: [shopId], references: [id])
}
```
