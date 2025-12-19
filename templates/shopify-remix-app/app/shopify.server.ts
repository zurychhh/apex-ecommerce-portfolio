/**
 * Shopify App configuration
 * TODO: Implement using @shopify/shopify-app-remix
 */

import { createShopifyAuth } from '@apex/shared-auth';

export const shopify = createShopifyAuth({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecret: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SCOPES?.split(',') || [],
  hostName: process.env.HOST!,
});

// TODO: Add session storage, webhook handlers, etc.
// This will be fleshed out during App #1 development
