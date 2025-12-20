/**
 * Billing callback endpoint
 * GET /api/billing/callback
 *
 * Shopify redirects here after merchant approves/declines subscription
 */

import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { checkActiveSubscription, getPlanFromSubscription } from '../utils/billing.server';
import { prisma } from '../utils/db.server';
import { logger } from '../utils/logger.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const url = new URL(request.url);
    const chargeId = url.searchParams.get('charge_id');

    logger.info(`Billing callback for ${session.shop}, charge_id: ${chargeId}`);

    // Check active subscriptions
    const subscriptions = await checkActiveSubscription(admin);

    if (subscriptions.length > 0) {
      // Find the most recent active subscription
      const activeSubscription = subscriptions.find(
        (sub: any) => sub.status === 'ACTIVE'
      );

      if (activeSubscription) {
        const plan = getPlanFromSubscription(activeSubscription.name);

        // Update shop's plan in database
        await prisma.shop.update({
          where: { domain: session.shop },
          data: {
            plan: plan,
            updatedAt: new Date(),
          },
        });

        logger.info(`Shop ${session.shop} upgraded to ${plan} plan`);

        // Redirect to dashboard with success message
        return redirect('/app?upgraded=true');
      }
    }

    // No active subscription found - merchant may have declined
    logger.warn(`No active subscription found for ${session.shop} after callback`);

    return redirect('/app?upgrade_cancelled=true');
  } catch (error: any) {
    logger.error('Billing callback error:', error);
    return redirect('/app?billing_error=true');
  }
}
