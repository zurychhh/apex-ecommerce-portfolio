/**
 * Weekly refresh cron endpoint
 * POST /api/cron/weekly-refresh
 *
 * Called by Railway cron to refresh analyses for Pro/Enterprise users
 * Protected by CRON_SECRET header
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { prisma } from '../utils/db.server';
import { queueAnalysis } from '../utils/queue.server';
import { logger } from '../utils/logger.server';

export async function action({ request }: ActionFunctionArgs) {
  // Verify cron secret
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    logger.error('CRON_SECRET not configured');
    return json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    logger.warn('Unauthorized cron request');
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find all shops on Pro or Enterprise plans that haven't been analyzed in 7 days
    const shops = await prisma.shop.findMany({
      where: {
        plan: { in: ['pro', 'enterprise'] },
        OR: [
          { lastAnalysis: { lte: sevenDaysAgo } },
          { lastAnalysis: null },
        ],
      },
      select: {
        id: true,
        domain: true,
        primaryGoal: true,
        lastAnalysis: true,
      },
    });

    logger.info(`Weekly refresh: Found ${shops.length} shops eligible for refresh`);

    const queuedJobs = [];

    for (const shop of shops) {
      try {
        // Clear old recommendations before new analysis
        await prisma.recommendation.deleteMany({
          where: { shopId: shop.id },
        });

        // Queue analysis job
        const job = await queueAnalysis({
          shopId: shop.id,
          shopDomain: shop.domain,
          primaryGoal: shop.primaryGoal || 'Increase overall conversion rate',
        });

        queuedJobs.push({
          shopDomain: shop.domain,
          jobId: job.id,
          lastAnalysis: shop.lastAnalysis,
        });

        logger.info(`Queued weekly refresh for ${shop.domain}`);
      } catch (shopError) {
        logger.error(`Failed to queue refresh for ${shop.domain}:`, shopError);
      }
    }

    return json({
      success: true,
      timestamp: new Date().toISOString(),
      shopsProcessed: shops.length,
      jobsQueued: queuedJobs.length,
      jobs: queuedJobs,
    });
  } catch (error: any) {
    logger.error('Weekly refresh cron failed:', error);
    return json(
      { error: 'Failed to process weekly refresh', details: error.message },
      { status: 500 }
    );
  }
}

export async function loader() {
  return json({
    message: 'Weekly refresh cron endpoint',
    usage: 'POST /api/cron/weekly-refresh with Authorization: Bearer <CRON_SECRET>',
    schedule: 'Every Monday at 9 AM UTC',
    eligibility: 'Pro and Enterprise plans only',
  });
}
