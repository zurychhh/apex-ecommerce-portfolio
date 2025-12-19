import type { PlanType } from './types';

export async function createSubscription(
  shopDomain: string,
  plan: PlanType,
  returnUrl: string
) {
  // TODO: Implement Shopify Billing API call
  console.log('Creating subscription', { shopDomain, plan, returnUrl });
}
