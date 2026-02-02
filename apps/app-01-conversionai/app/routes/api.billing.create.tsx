/**
 * API endpoint to create a subscription
 * POST /api/billing/create
 *
 * Creates a new Shopify app subscription and returns confirmation URL
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { createSubscription, PLANS } from '../utils/billing.server';
import { prisma } from '../utils/db.server';
import { logger } from '../utils/logger.server';

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const formData = await request.formData();
    const plan = formData.get('plan') as string;

    // Validate plan
    if (!plan || !['basic', 'pro'].includes(plan)) {
      return json(
        { error: 'Invalid plan. Choose basic or pro.' },
        { status: 400 }
      );
    }

    logger.info(`Creating ${plan} subscription for ${session.shop}`);

    // Create subscription via Shopify Billing API
    const result = await createSubscription(
      admin,
      session.shop,
      plan as 'basic' | 'pro'
    );

    if (!result.confirmationUrl) {
      return json(
        { error: 'Failed to create subscription. Please try again.' },
        { status: 500 }
      );
    }

    // Store pending subscription in database
    await prisma.shop.update({
      where: { domain: session.shop },
      data: {
        // Don't update plan yet - will be updated on callback
        updatedAt: new Date(),
      },
    });

    logger.info(`Subscription created, returning confirmation URL: ${session.shop}`);

    // Return confirmationUrl as JSON - the client must redirect the top-level
    // window (not the iframe) to this URL. A server-side redirect would try to
    // load admin.shopify.com inside its own iframe, which is blocked.
    return json({ confirmationUrl: result.confirmationUrl });
  } catch (error: any) {
    logger.error('Billing create error:', error);

    return json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function loader() {
  return json({
    message: 'Use POST to create a subscription',
    plans: Object.entries(PLANS)
      .filter(([key]) => key !== 'free')
      .map(([key, plan]) => ({
        id: key,
        name: plan.name,
        price: plan.price,
        trialDays: plan.trialDays,
        features: plan.features,
      })),
  });
}
