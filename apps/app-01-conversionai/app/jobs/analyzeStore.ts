/**
 * Main analysis job that orchestrates the entire store analysis process
 *
 * UPGRADED: Now uses multi-stage analysis for world-class recommendations
 *
 * Flow:
 * 1. Fetch Shopify data (analytics, products, theme)
 * 2. Capture screenshots of key pages
 * 3. Find competitors (optional, best-effort)
 * 4. Run 3-stage analysis:
 *    Stage 1: Identify critical problems
 *    Stage 2: Deep dive on top problems
 *    Stage 3: Generate & prioritize recommendations
 * 5. Save to database
 * 6. Send email notification
 */

import { prisma } from '../utils/db.server';
import { fetchShopifyAnalytics, fetchProducts, fetchCurrentTheme } from '../utils/shopify.server';
import { captureScreenshots, type Screenshot } from './captureScreenshots';
import { callClaudeAPI, buildAnalysisPrompt, parseRecommendations } from '../utils/claude.server';
import { multiStageAnalysis, type StoreMetrics, type ShopifyData } from '../utils/multi-stage-analysis.server';
import { sendAnalysisCompleteEmail } from '../utils/email.server';
import { logger } from '../utils/logger.server';

// Feature flag: Use multi-stage analysis for better recommendations
// ENABLED: Now using Bull queue for background processing (no timeout issues)
const USE_MULTI_STAGE_ANALYSIS = true;

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

    // 3. Capture screenshots (now enabled with Dockerfile + Playwright)
    logger.info('Capturing screenshots with Playwright...');
    let screenshots: Screenshot[] = [];
    try {
      screenshots = await captureScreenshots(shopDomain, [
        '/',
        `/products/${products[0]?.handle || 'example'}`,
        '/cart',
      ]);
      logger.info(`Captured ${screenshots.length} screenshots`);
    } catch (screenshotError) {
      logger.warn('Screenshot capture failed (non-fatal):', screenshotError);
      // Continue without screenshots - analysis can still work
    }

    // 4. Find competitors (optional, best-effort)
    // TODO: Implement competitor discovery
    const competitors: any[] = [];

    // 5. Run analysis
    let recommendations: any[];

    if (USE_MULTI_STAGE_ANALYSIS) {
      // ⭐ NEW: Multi-stage analysis for world-class recommendations
      logger.info('Running multi-stage analysis (3 stages)...');

      // Prepare store metrics
      const metrics: StoreMetrics = {
        conversionRate: analytics.conversionRate || 1.5,
        avgOrderValue: analytics.avgOrderValue || 75,
        monthlyVisitors: analytics.totalSessions || 10000,
        mobilePercentage: analytics.mobileConversionRate ? 65 : 60,
        cartAbandonmentRate: analytics.cartAbandonmentRate || 70,
      };

      // Prepare shop data
      const shopifyData: ShopifyData = {
        shop: { domain: shop.domain },
        topProducts: products.slice(0, 5),
        priceRange: {
          min: Math.min(...products.map(p => parseFloat(p.variants?.[0]?.price || '0') || 0), 999999),
          max: Math.max(...products.map(p => parseFloat(p.variants?.[0]?.price || '0') || 0), 0),
        },
        theme: { name: theme.name, id: theme.id?.toString() || '' },
        industry: 'General eCommerce',
      };

      // Run 3-stage analysis
      const stageResults = await multiStageAnalysis(shopifyData, metrics, screenshots);

      // Map to database format
      recommendations = stageResults.map(rec => ({
        shopId,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        impactScore: rec.impactScore,
        effortScore: rec.effortScore,
        priority: rec.implementationOrder,
        estimatedUplift: rec.estimatedUplift,
        estimatedROI: rec.estimatedROI,
        reasoning: `${rec.reasoning}\n\nConfidence: ${rec.confidence}%\nBenchmark: ${rec.benchmarkComparison}`,
        implementation: Array.isArray(rec.implementation) ? rec.implementation.join('\n') : rec.implementation,
        codeSnippet: rec.codeSnippet || null,
        mockupUrl: null,
        status: 'pending',
      }));

      logger.info(`Multi-stage analysis complete: ${recommendations.length} recommendations`);

    } else {
      // Legacy: Single-shot Claude analysis
      logger.info('Building analysis prompt...');
      const promptData = buildAnalysisPrompt({
        shop,
        primaryGoal,
        analytics,
        products: products.slice(0, 5),
        theme,
        screenshots,
        competitors,
      });

      // Call Claude API with system and user prompts
      logger.info('Calling Claude API...');
      const claudeResponseText = await callClaudeAPI(
        promptData.system,
        promptData.user,
        screenshots
      );

      // Parse recommendations
      logger.info('Parsing recommendations...');
      const parsedRecommendations = parseRecommendations(claudeResponseText);

      // Add shopId to each recommendation
      recommendations = parsedRecommendations.map(rec => ({
        ...rec,
        shopId,
        mockupUrl: null,
        status: 'pending',
      }));
    }

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

    // 10. Save ShopMetrics snapshot
    logger.info('Saving shop metrics...');
    await prisma.shopMetrics.create({
      data: {
        shopId,
        conversionRate: analytics.conversionRate,
        avgOrderValue: analytics.avgOrderValue,
        cartAbandonmentRate: analytics.cartAbandonmentRate,
        mobileConversionRate: analytics.mobileConversionRate,
        desktopConversionRate: analytics.desktopConversionRate,
        totalSessions: analytics.totalSessions,
        totalOrders: analytics.totalOrders,
        totalRevenue: analytics.totalRevenue,
      },
    });

    // 11. Send email notification
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
