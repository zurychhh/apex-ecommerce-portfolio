# @apex/shared-auth

Shared Shopify OAuth authentication logic.

## Usage

```typescript
import { createShopifyAuth } from '@apex/shared-auth';

const auth = createShopifyAuth({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecret: process.env.SHOPIFY_API_SECRET!,
  scopes: ['read_products', 'write_products'],
  hostName: process.env.HOST!
});
```

## Development

This package will be fleshed out during App #1 development.
Extract common patterns here as they emerge.
