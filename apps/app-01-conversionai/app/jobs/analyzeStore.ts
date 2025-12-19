/**
 * Main analysis job that orchestrates the entire store analysis process
 *
 * Flow:
 * 1. Fetch Shopify data (analytics, products, theme)
 * 2. Capture screenshots of key pages
 * 3. Find competitors (optional, best-effort)
 * 4. Build Claude API prompt
 * 5. Call Claude API for analysis
 * 6. Parse and prioritize recommendations
 * 7. Save to database
 * 8. Send email notification
 */

import { prisma } from '~/utils/db.server';
import { fetchShopifyAnalytics, fetchProducts, fetchCurrentTheme } from '~/utils/shopify.server';
import { captureScreenshots } from './captureScreenshots';
import { callClaudeAPI, buildAnalysisPrompt, parseRecommendations } from '~/utils/claude.server';
import { sendAnalysisCompleteEmail } from '~/utils/email.server';
import { logger } from '@apex/shared-utils';

export interface AnalyzeStoreJobData {
  shopId: string;
  shopDomain: string;
  primaryGoal: string;
}

export async function analyzeStore(data: AnalyzeStoreJobData) {
  const { shopId, shopDomain, primaryGoal } = data;

  try {
    logger.info(`Starting analysis for shop: ${shopDomain}`);

    // 1. Fetch shop data
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      throw new Error(`Shop not found: ${shopId}`);
    }

    // 2. Fetch Shopify data
    logger.info('Fetching Shopify analytics...');
    const analytics = await fetchShopifyAnalytics(shop);

    logger.info('Fetching products...');
    const products = await fetchProducts(shop, 10);

    logger.info('Fetching theme...');
    const theme = await fetchCurrentTheme(shop);

    // 3. Capture screenshots
    logger.info('Capturing screenshots...');
    const screenshots = await captureScreenshots(shopDomain, [
      '/',
      `/products/${products[0]?.handle || 'example'}`,
      '/cart',
    ]);

    // 4. Find competitors (optional, best-effort)
    // TODO: Implement competitor discovery
    const competitors = [];

    // 5. Build Claude prompt
    logger.info('Building analysis prompt...');
    const prompt = buildAnalysisPrompt({
      shop,
      primaryGoal,
      analytics,
      products: products.slice(0, 5),
      theme,
      screenshots,
      competitors,
    });

    // 6. Call Claude API
    logger.info('Calling Claude API...');
    const claudeResponseText = await callClaudeAPI(prompt, screenshots);

    // 7. Parse recommendations
    logger.info('Parsing recommendations...');
    const parsedRecommendations = parseRecommendations(claudeResponseText);

    // Add shopId to each recommendation
    const recommendations = parsedRecommendations.map(rec => ({
      ...rec,
      shopId,
      mockupUrl: null,
      status: 'pending',
    }));

    // 8. Save to database
    logger.info(`Saving ${recommendations.length} recommendations...`);
    await prisma.recommendation.createMany({
      data: recommendations,
    });

    // 9. Update shop
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        lastAnalysis: new Date(),
        primaryGoal,
      },
    });

    // 10. Send email notification
    if (shop.email) {
      logger.info(`Sending email notification to ${shop.email}`);
      await sendAnalysisCompleteEmail(shop.email, recommendations.length);
    }

    logger.info(`Analysis complete! Generated ${recommendations.length} recommendations`);

    return {
      success: true,
      recommendationsCount: recommendations.length,
    };

  } catch (error) {
    logger.error('Analysis failed:', error);
    throw error;
  }
}
