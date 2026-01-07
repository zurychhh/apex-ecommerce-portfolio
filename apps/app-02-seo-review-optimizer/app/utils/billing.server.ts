/**
 * ReviewBoost AI - Shopify Billing API integration
 * Handles subscription creation, plan limits, and usage tracking
 */

export interface PlanFeatures {
  responsesPerMonth: number;
  tones: string[];
  bulkActions: boolean;
  customBrandVoice: boolean;
  autoPublish: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  stores: number;
}

export interface Plan {
  name: string;
  price: number;
  trialDays: number;
  features: PlanFeatures;
  recommended?: boolean;
}

export const PLANS: Record<string, Plan> = {
  free: {
    name: "Free",
    price: 0,
    trialDays: 0,
    features: {
      responsesPerMonth: 10,
      tones: ["professional"],
      bulkActions: false,
      customBrandVoice: false,
      autoPublish: false,
      prioritySupport: false,
      apiAccess: false,
      stores: 1,
    },
  },
  starter: {
    name: "Starter",
    price: 19,
    trialDays: 7,
    features: {
      responsesPerMonth: 100,
      tones: ["professional", "friendly", "apologetic"],
      bulkActions: false,
      customBrandVoice: true,
      autoPublish: false,
      prioritySupport: false,
      apiAccess: false,
      stores: 1,
    },
  },
  growth: {
    name: "Growth",
    price: 49,
    trialDays: 7,
    recommended: true,
    features: {
      responsesPerMonth: -1, // Unlimited
      tones: ["professional", "friendly", "apologetic"],
      bulkActions: true,
      customBrandVoice: true,
      autoPublish: true,
      prioritySupport: true,
      apiAccess: false,
      stores: 1,
    },
  },
  agency: {
    name: "Agency",
    price: 149,
    trialDays: 14,
    features: {
      responsesPerMonth: -1, // Unlimited
      tones: ["professional", "friendly", "apologetic"],
      bulkActions: true,
      customBrandVoice: true,
      autoPublish: true,
      prioritySupport: true,
      apiAccess: true,
      stores: 10,
    },
  },
};

/**
 * Create a new app subscription via Shopify Billing API
 */
export async function createSubscription(
  admin: any,
  shop: string,
  plan: "starter" | "growth" | "agency",
  returnUrl?: string
) {
  const planConfig = PLANS[plan];

  if (!planConfig || planConfig.price === 0) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const appUrl = process.env.SHOPIFY_APP_URL || `https://${shop}/admin/apps/reviewboost`;
  const defaultReturnUrl = `${appUrl}/app/billing/callback?plan=${plan}`;

  try {
    const response = await admin.graphql(
      `mutation CreateAppSubscription($name: String!, $returnUrl: URL!, $trialDays: Int, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          trialDays: $trialDays
          test: ${process.env.NODE_ENV !== "production"}
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
          name: `ReviewBoost AI ${planConfig.name}`,
          returnUrl: returnUrl || defaultReturnUrl,
          trialDays: planConfig.trialDays,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: planConfig.price,
                    currencyCode: "USD",
                  },
                  interval: "EVERY_30_DAYS",
                },
              },
            },
          ],
        },
      }
    );

    const result = await response.json();
    const data = result?.data?.appSubscriptionCreate;

    if (data?.userErrors?.length > 0) {
      console.error("[ReviewBoost] Billing API error:", data.userErrors);
      throw new Error(data.userErrors[0].message);
    }

    console.log(`[ReviewBoost] Subscription created for ${shop}: ${plan}`, {
      subscriptionId: data?.appSubscription?.id,
    });

    return {
      subscriptionId: data?.appSubscription?.id,
      confirmationUrl: data?.confirmationUrl,
      subscription: data?.appSubscription,
    };
  } catch (error) {
    console.error("[ReviewBoost] Failed to create subscription:", error);
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

    const result = await response.json();
    const subscriptions =
      result?.data?.currentAppInstallation?.activeSubscriptions || [];

    return subscriptions;
  } catch (error) {
    console.error("[ReviewBoost] Failed to check subscription:", error);
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

    const result = await response.json();
    const data = result?.data?.appSubscriptionCancel;

    if (data?.userErrors?.length > 0) {
      throw new Error(data.userErrors[0].message);
    }

    console.log(`[ReviewBoost] Subscription cancelled: ${subscriptionId}`);
    return data?.appSubscription;
  } catch (error) {
    console.error("[ReviewBoost] Failed to cancel subscription:", error);
    throw error;
  }
}

/**
 * Determine plan tier from subscription name
 */
export function getPlanFromSubscription(subscriptionName: string): string {
  const lowerName = subscriptionName.toLowerCase();

  if (lowerName.includes("agency")) return "agency";
  if (lowerName.includes("growth")) return "growth";
  if (lowerName.includes("starter")) return "starter";

  return "free";
}

/**
 * Get plan configuration
 */
export function getPlan(planKey: string): Plan {
  return PLANS[planKey] || PLANS.free;
}

/**
 * Get response limit for a plan
 */
export function getResponseLimit(planKey: string): number {
  const plan = PLANS[planKey] || PLANS.free;
  return plan.features.responsesPerMonth;
}

/**
 * Check if shop can generate response based on plan limits
 */
export function canGenerateResponse(
  plan: string,
  responsesUsed: number
): { allowed: boolean; reason?: string } {
  const planConfig = PLANS[plan] || PLANS.free;
  const limit = planConfig.features.responsesPerMonth;

  // Unlimited plan
  if (limit === -1) {
    return { allowed: true };
  }

  if (responsesUsed >= limit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limit} responses. Upgrade to get more.`,
    };
  }

  return { allowed: true };
}

/**
 * Compare plans for upgrade/downgrade logic
 */
export function comparePlans(
  currentPlan: string,
  targetPlan: string
): "upgrade" | "downgrade" | "same" {
  const planOrder = ["free", "starter", "growth", "agency"];
  const currentIndex = planOrder.indexOf(currentPlan);
  const targetIndex = planOrder.indexOf(targetPlan);

  if (targetIndex > currentIndex) return "upgrade";
  if (targetIndex < currentIndex) return "downgrade";
  return "same";
}

/**
 * Check if a feature is available on a plan
 */
export function hasFeature(
  plan: string,
  feature: keyof PlanFeatures
): boolean {
  const planConfig = PLANS[plan] || PLANS.free;
  const value = planConfig.features[feature];

  // Handle boolean features
  if (typeof value === "boolean") {
    return value;
  }

  // Handle numeric features (>0 means available)
  if (typeof value === "number") {
    return value !== 0;
  }

  // Handle array features (length > 0 means available)
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return false;
}

/**
 * Get next billing date (1st of next month)
 */
export function getNextBillingDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

/**
 * Check if current date is start of new billing cycle
 */
export function isNewBillingCycle(lastResetDate?: Date | null): boolean {
  if (!lastResetDate) return true;

  const now = new Date();
  const lastReset = new Date(lastResetDate);

  // New cycle if we're in a new month
  return (
    now.getFullYear() !== lastReset.getFullYear() ||
    now.getMonth() !== lastReset.getMonth()
  );
}
