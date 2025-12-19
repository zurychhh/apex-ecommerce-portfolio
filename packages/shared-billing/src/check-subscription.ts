import type { PlanType } from './types';

export async function checkSubscription(
  shopDomain: string
): Promise<{ plan: PlanType; isActive: boolean } | null> {
  // TODO: Implement subscription check logic
  console.log('Checking subscription for', shopDomain);
  return null;
}
