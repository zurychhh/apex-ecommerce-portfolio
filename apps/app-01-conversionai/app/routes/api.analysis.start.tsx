/**
 * API endpoint to trigger store analysis
 * POST /api/analysis/start
 *
 * Authenticates the Shopify request, fetches shop data, and queues an analysis job.
 * Returns job ID for status tracking.
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { queueAnalysis } from '../utils/queue.server';
import { prisma } from '../utils/db.server';
import { logger } from '../utils/logger.server';
import { canPerformAnalysis } from '../utils/billing.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    // 1. Authenticate Shopify request
    const { session } = await authenticate.admin(request);

    logger.info(`[API] Analysis requested for shop: ${session.shop}`);

    // 2. Get form data (optional primary goal)
    let primaryGoal = 'Increase overall conversion rate';
    try {
      const formData = await request.formData();
      const goalFromForm = formData.get('primaryGoal');
      if (goalFromForm && typeof goalFromForm === 'string') {
        primaryGoal = goalFromForm;
      }
    } catch {
      // No form data, use default goal
    }

    // 3. Get shop from database
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      logger.error(`[API] Shop not found: ${session.shop}`);
      return json(
        { error: 'Shop not found. Please reinstall the app.' },
        { status: 404 }
      );
    }

    // 4. Billing validation: check monthly analysis limit
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const analysisCountThisMonth = await prisma.shopMetrics.count({
      where: {
        shopId: shop.id,
        recordedAt: { gte: startOfMonth },
      },
    });

    const billingCheck = await canPerformAnalysis(shop.plan || 'free', analysisCountThisMonth);
    if (!billingCheck.allowed) {
      logger.warn(`[API] Billing limit reached for ${shop.domain}: ${billingCheck.reason}`);
      return json(
        { error: billingCheck.reason },
        { status: 429 }
      );
    }

    // 5. Delete old recommendations before new analysis
    await prisma.recommendation.deleteMany({
      where: { shopId: shop.id },
    });
    logger.info(`[API] Cleared previous recommendations for shop ${shop.domain}`);

    // 6. Queue analysis job
    const job = await queueAnalysis({
      shopId: shop.id,
      shopDomain: shop.domain,
      primaryGoal,
    });

    logger.info(`[API] Analysis job queued: ${job.id} for ${shop.domain}`);

    return json({
      success: true,
      jobId: job.id?.toString(),
      message: 'Analysis started. This will take 60-90 seconds.',
    });

  } catch (error: any) {
    logger.error('[API] Error starting analysis:', error);

    // Handle specific error types
    if (error.message?.includes('Rate limit')) {
      return json(
        { error: 'Too many requests. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    return json(
      { error: 'Failed to start analysis. Please try again.' },
      { status: 500 }
    );
  }
}

// Also allow GET for status checks (redirect to dashboard)
export async function loader() {
  return json({
    message: 'Use POST to start analysis',
    usage: 'POST /api/analysis/start with optional primaryGoal in form data'
  });
}
