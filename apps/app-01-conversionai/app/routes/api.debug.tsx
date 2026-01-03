/**
 * Debug endpoint to test analysis components
 * GET /api/debug - Returns diagnostic information
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { fetchShopifyAnalytics, fetchProducts, fetchCurrentTheme } from '../utils/shopify.server';
import { callClaudeAPI, buildAnalysisPrompt, parseRecommendations } from '../utils/claude.server';
import { logger } from '../utils/logger.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    // Step 1: Authenticate
    results.steps.push({ step: 'authenticate', status: 'starting' });
    const { session } = await authenticate.admin(request);
    results.steps[0] = { step: 'authenticate', status: 'success', shop: session.shop };

    // Step 2: Get shop from DB
    results.steps.push({ step: 'getShop', status: 'starting' });
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });
    results.steps[1] = { 
      step: 'getShop', 
      status: shop ? 'success' : 'failed',
      hasAccessToken: !!shop?.accessToken,
      shopId: shop?.id,
    };

    if (!shop) {
      results.error = 'Shop not found in database';
      return json(results);
    }

    // Step 3: Fetch analytics
    results.steps.push({ step: 'fetchAnalytics', status: 'starting' });
    try {
      const analytics = await fetchShopifyAnalytics(shop);
      results.steps[2] = { 
        step: 'fetchAnalytics', 
        status: 'success',
        analytics: {
          conversionRate: analytics.conversionRate,
          totalOrders: analytics.totalOrders,
          totalRevenue: analytics.totalRevenue,
        }
      };
    } catch (e: any) {
      results.steps[2] = { step: 'fetchAnalytics', status: 'failed', error: e.message };
    }

    // Step 4: Fetch products
    results.steps.push({ step: 'fetchProducts', status: 'starting' });
    try {
      const products = await fetchProducts(shop, 5);
      results.steps[3] = { 
        step: 'fetchProducts', 
        status: 'success',
        productCount: products.length,
        firstProduct: products[0]?.title,
      };
    } catch (e: any) {
      results.steps[3] = { step: 'fetchProducts', status: 'failed', error: e.message };
    }

    // Step 5: Fetch theme
    results.steps.push({ step: 'fetchTheme', status: 'starting' });
    try {
      const theme = await fetchCurrentTheme(shop);
      results.steps[4] = { 
        step: 'fetchTheme', 
        status: 'success',
        themeName: theme.name,
      };
    } catch (e: any) {
      results.steps[4] = { step: 'fetchTheme', status: 'failed', error: e.message };
    }

    // Step 6: Test Claude API (simple test)
    results.steps.push({ step: 'testClaude', status: 'starting' });
    try {
      const testPrompt = 'Say "Hello ConversionAI" in JSON format like {"message": "..."}';
      const response = await callClaudeAPI(testPrompt, []);
      results.steps[5] = { 
        step: 'testClaude', 
        status: 'success',
        responsePreview: response.substring(0, 200),
      };
    } catch (e: any) {
      results.steps[5] = { step: 'testClaude', status: 'failed', error: e.message };
    }

    results.success = true;

  } catch (error: any) {
    results.error = error.message;
    results.stack = error.stack;
  }

  return json(results);
}
