/**
 * Shared Shopify authentication logic
 * Used by all apps to handle OAuth flow
 */

export function createShopifyAuth(config: {
  apiKey: string;
  apiSecret: string;
  scopes: string[];
  hostName: string;
}) {
  // TODO: Implement based on @shopify/shopify-app-remix patterns
  // This will be filled out when we build App #1
  console.log('Shopify auth initialized', config);
}
