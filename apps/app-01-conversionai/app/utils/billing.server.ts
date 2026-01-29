/**
 * Shopify Billing API integration
 * Handles subscription creation, plan limits, and usage tracking
 */

import { logger } from './logger.server';

export interface PlanFeatures {
  analysisPerMonth: number;
  recommendations: number;
}

export interface Plan {
  name: string;
  price: number;
  trialDays: number;
  features: PlanFeatures;
}

export const PLANS: Record<string, Plan> = {
  free: {
    name: 'Free',
    price: 0,
    trialDays: 0,
    features: {
      analysisPerMonth: 1,
      recommendations: 5,
    },
  },
  basic: {
    name: 'Basic',
    price: 29,
    trialDays: 7,
    features: {
      analysisPerMonth: 4,
      recommendations: 15,
    },
  },
  pro: {
    name: 'Pro',
    price: 79,
    trialDays: 7,
    features: {
      analysisPerMonth: 999, // Unlimited
      recommendations: 50,
    },
  },
};

/**
 * Create a new app subscription via Shopify Billing API
 */
export async function createSubscription(
  admin: any,
  shop: string,
  plan: 'basic' | 'pro',
  appHandle?: string
) {
  const planConfig = PLANS[plan];

  if (!planConfig || planConfig.price === 0) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  // Check if appHandle is a full URL or just a handle
  let returnUrl: string;
  if (appHandle && appHandle.startsWith('http')) {
    // Full URL provided (for testing or custom deployments)
    returnUrl = appHandle;
  } else {
    // App handle provided - construct standard admin URL
    const handle = appHandle || process.env.SHOPIFY_APP_HANDLE || 'conversionai';
    returnUrl = `https://${shop}/admin/apps/${handle}`;
  }

  // Use test mode unless explicitly set to false via env var
  const isTestMode = process.env.SHOPIFY_BILLING_TEST !== 'false' && process.env.NODE_ENV !== 'production';

  try {
    const response = await admin.graphql(
      `mutation CreateAppSubscription($name: String!, $returnUrl: URL!, $trialDays: Int, $test: Boolean!, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          trialDays: $trialDays
          test: $test
          lineItems: $lineItems
        ) {
          appSubscription {
            id
            status
            name
            test
            trialDays
            currentPeriodEnd
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          name: `ConversionAI ${planConfig.name}`,
          returnUrl: returnUrl,
          trialDays: planConfig.trialDays,
          test: isTestMode,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: planConfig.price,
                    currencyCode: 'USD',
                  },
                  interval: 'EVERY_30_DAYS',
                },
              },
            },
          ],
        },
      }
    );

    const responseJson = await response.json();
    const result = responseJson.data?.appSubscriptionCreate;

    if (result?.userErrors?.length > 0) {
      logger.error('Billing API error:', result.userErrors);
      throw new Error(result.userErrors[0].message);
    }

    if (!result) {
      logger.error('Billing API returned empty result:', JSON.stringify(responseJson));
      throw new Error('Shopify Billing API returned empty response');
    }

    logger.info(`Subscription created for ${shop}: ${plan}`, {
      subscriptionId: result?.appSubscription?.id,
      testMode: isTestMode,
    });

    return {
      subscriptionId: result?.appSubscription?.id,
      confirmationUrl: result?.confirmationUrl,
      subscription: result?.appSubscription,
    };
  } catch (error) {
    logger.error('Failed to create subscription:', error);
    throw error;
  }
}

/**
 * Check if shop has an active subscription
 */
export async function checkActiveSubscription(admin: any) {
  try {
    const response = await admin.graphql(
      `{
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
            test
            trialDays
            currentPeriodEnd
            createdAt
          }
        }
      }`
    );

    const responseJson = await response.json();
    const subscriptions =
      responseJson.data?.currentAppInstallation?.activeSubscriptions || [];

    return subscriptions;
  } catch (error) {
    logger.error('Failed to check subscription:', error);
    return [];
  }
}

/**
 * Cancel an active subscription
 */
export async function cancelSubscription(admin: any, subscriptionId: string) {
  try {
    const response = await admin.graphql(
      `mutation CancelSubscription($id: ID!) {
        appSubscriptionCancel(id: $id) {
          appSubscription {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          id: subscriptionId,
        },
      }
    );

    const responseJson = await response.json();
    const result = responseJson.data?.appSubscriptionCancel;

    if (result?.userErrors?.length > 0) {
      throw new Error(result.userErrors[0].message);
    }

    logger.info(`Subscription cancelled: ${subscriptionId}`);
    return result?.appSubscription;
  } catch (error) {
    logger.error('Failed to cancel subscription:', error);
    throw error;
  }
}

/**
 * Determine plan tier from subscription name
 */
export function getPlanFromSubscription(subscriptionName: string): string {
  const lowerName = subscriptionName.toLowerCase();

  // Enterprise no longer exists, map to pro for existing customers
  if (lowerName.includes('enterprise')) return 'pro';
  if (lowerName.includes('pro')) return 'pro';
  if (lowerName.includes('basic')) return 'basic';

  return 'free';
}

/**
 * Check if shop can perform analysis based on plan limits
 */
export async function canPerformAnalysis(
  shopPlan: string,
  analysisCountThisMonth: number
): Promise<{ allowed: boolean; reason?: string }> {
  const plan = PLANS[shopPlan] || PLANS.free;
  const limit = plan.features.analysisPerMonth;

  if (analysisCountThisMonth >= limit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} analyses. Upgrade to get more.`,
    };
  }

  return { allowed: true };
}

/**
 * Get plan features for display
 */
export function getPlanFeatures(planKey: string): PlanFeatures {
  const plan = PLANS[planKey] || PLANS.free;
  return plan.features;
}

/**
 * Compare plans for upgrade/downgrade logic
 */
export function comparePlans(
  currentPlan: string,
  targetPlan: string
): 'upgrade' | 'downgrade' | 'same' {
  const planOrder = ['free', 'basic', 'pro'];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);

  if (targetIndex > currentIndex) return 'upgrade';
  if (targetIndex < currentIndex) return 'downgrade';
  return 'same';
}
