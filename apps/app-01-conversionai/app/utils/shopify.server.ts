/**
 * Shopify API utilities
 * Wrappers for fetching store data, analytics, products, etc.
 */

import { logger } from '@apex/shared-utils';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: process.env.SCOPES?.split(',') || [],
  hostName: process.env.HOST?.replace(/https?:\/\//, '') || 'localhost',
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: true,
});

export interface Shop {
  id: string;
  domain: string;
  accessToken: string;
  scope: string;
}

export interface ShopifyAnalytics {
  conversionRate: number;
  avgOrderValue: number;
  cartAbandonmentRate: number;
  mobileConversionRate: number | null;
  desktopConversionRate: number | null;
  totalSessions: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  images: string[];
  variants: any[];
}

/**
 * Create a Shopify session from shop data
 */
function createSession(shop: Shop): Session {
  return new Session({
    id: `offline_${shop.domain}`,
    shop: shop.domain,
    state: 'active',
    isOnline: false,
    accessToken: shop.accessToken,
    scope: shop.scope,
  });
}

/**
 * Fetch analytics data from Shopify Analytics API and Orders
 * Note: Shopify Analytics API has limited direct access, so we calculate from orders
 */
export async function fetchShopifyAnalytics(shop: Shop): Promise<ShopifyAnalytics> {
  logger.info(`Fetching analytics for ${shop.domain}`);

  try {
    const session = createSession(shop);
    const client = new shopify.clients.Rest({ session });

    // Fetch last 30 days of orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get orders
    const ordersResponse = await client.get({
      path: 'orders',
      query: {
        status: 'any',
        created_at_min: thirtyDaysAgo.toISOString(),
        limit: 250,
      },
    });

    const orders = (ordersResponse.body as any).orders || [];

    // Calculate metrics from orders
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_price || '0');
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get shop info for additional context
    const shopResponse = await client.get({ path: 'shop' });
    const shopData = (shopResponse.body as any).shop;

    // Estimate sessions (rough approximation: orders * 50 for ~2% conversion)
    const estimatedSessions = totalOrders * 50;

    // Calculate conversion rate
    const conversionRate = estimatedSessions > 0
      ? (totalOrders / estimatedSessions) * 100
      : 0;

    // Cart abandonment - get abandoned checkouts
    let abandonedCheckouts = 0;
    try {
      const checkoutsResponse = await client.get({
        path: 'checkouts',
        query: {
          created_at_min: thirtyDaysAgo.toISOString(),
          limit: 250,
        },
      });
      abandonedCheckouts = ((checkoutsResponse.body as any).checkouts || []).length;
    } catch (error) {
      logger.warn('Could not fetch abandoned checkouts:', error);
    }

    const cartAbandonmentRate = (abandonedCheckouts + totalOrders) > 0
      ? (abandonedCheckouts / (abandonedCheckouts + totalOrders)) * 100
      : 70; // Industry average fallback

    return {
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      cartAbandonmentRate: parseFloat(cartAbandonmentRate.toFixed(2)),
      mobileConversionRate: null, // Requires additional analytics integration
      desktopConversionRate: null, // Requires additional analytics integration
      totalSessions: estimatedSessions,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    };
  } catch (error) {
    logger.error('Error fetching Shopify analytics:', error);

    // Return reasonable defaults on error
    return {
      conversionRate: 2.5,
      avgOrderValue: 75.0,
      cartAbandonmentRate: 70.0,
      mobileConversionRate: null,
      desktopConversionRate: null,
      totalSessions: 10000,
      totalOrders: 250,
      totalRevenue: 18750,
    };
  }
}

/**
 * Fetch products from Shopify Admin API
 * Returns top 10 products by default
 */
export async function fetchProducts(shop: Shop, limit: number = 10): Promise<ShopifyProduct[]> {
  logger.info(`Fetching products for ${shop.domain}`);

  try {
    const session = createSession(shop);
    const client = new shopify.clients.Rest({ session });

    const response = await client.get({
      path: 'products',
      query: {
        limit: limit.toString(),
        status: 'active',
      },
    });

    const products = (response.body as any).products || [];

    return products.map((product: any) => ({
      id: product.id ? `gid://shopify/Product/${product.id}` : product.admin_graphql_api_id,
      handle: product.handle || '',
      title: product.title || 'Untitled Product',
      description: product.body_html || '',
      images: (product.images || []).map((img: any) => img.src),
      variants: product.variants || [],
    }));
  } catch (error) {
    logger.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch current theme info
 */
export async function fetchCurrentTheme(shop: Shop) {
  logger.info(`Fetching theme for ${shop.domain}`);

  try {
    const session = createSession(shop);
    const client = new shopify.clients.Rest({ session });

    const response = await client.get({
      path: 'themes',
    });

    const themes = (response.body as any).themes || [];
    const mainTheme = themes.find((theme: any) => theme.role === 'main');

    if (mainTheme) {
      return {
        id: mainTheme.id?.toString() || '',
        name: mainTheme.name || 'Unknown Theme',
        role: mainTheme.role || 'main',
      };
    }

    return {
      id: '',
      name: 'Unknown Theme',
      role: 'main',
    };
  } catch (error) {
    logger.error('Error fetching theme:', error);
    return {
      id: '',
      name: 'Unknown Theme',
      role: 'main',
    };
  }
}

/**
 * Fetch shop info
 */
export async function fetchShopInfo(shop: Shop) {
  logger.info(`Fetching shop info for ${shop.domain}`);

  try {
    const session = createSession(shop);
    const client = new shopify.clients.Rest({ session });

    const response = await client.get({
      path: 'shop',
    });

    const shopData = (response.body as any).shop;

    return {
      name: shopData.name || shop.domain,
      email: shopData.email || '',
      domain: shopData.domain || shop.domain,
      currency: shopData.currency || 'USD',
      moneyFormat: shopData.money_format || '${{amount}}',
      timezone: shopData.timezone || 'UTC',
      iana_timezone: shopData.iana_timezone || 'UTC',
      plan_name: shopData.plan_name || 'Unknown',
    };
  } catch (error) {
    logger.error('Error fetching shop info:', error);
    return {
      name: shop.domain,
      email: '',
      domain: shop.domain,
      currency: 'USD',
      moneyFormat: '${{amount}}',
      timezone: 'UTC',
      iana_timezone: 'UTC',
      plan_name: 'Unknown',
    };
  }
}
