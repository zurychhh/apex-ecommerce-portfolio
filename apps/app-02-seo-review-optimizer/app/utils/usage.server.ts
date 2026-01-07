import { PrismaClient } from "@prisma/client";
import { getPlan, isNewBillingCycle, getResponseLimit } from "./billing.server";

/**
 * Usage tracking utilities for ReviewBoost AI
 */

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  isUnlimited: boolean;
  canGenerate: boolean;
  resetDate: Date;
}

/**
 * Get current usage status for a shop
 */
export async function getUsageStatus(
  prisma: PrismaClient,
  shopId: string
): Promise<UsageStatus> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  // Check if we need to reset usage (new billing cycle)
  if (isNewBillingCycle(shop.billingCycleStart)) {
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        responsesUsed: 0,
        billingCycleStart: new Date(),
      },
    });
    shop.responsesUsed = 0;
  }

  const plan = getPlan(shop.plan);
  const limit = plan.features.responsesPerMonth;
  const isUnlimited = limit === -1;

  const used = shop.responsesUsed;
  const remaining = isUnlimited ? -1 : Math.max(0, limit - used);
  const percentage = isUnlimited ? 0 : Math.round((used / limit) * 100);
  const canGenerate = isUnlimited || remaining > 0;

  // Calculate reset date (1st of next month)
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    used,
    limit: isUnlimited ? -1 : limit,
    remaining,
    percentage,
    isUnlimited,
    canGenerate,
    resetDate,
  };
}

/**
 * Increment usage count
 */
export async function incrementUsage(
  prisma: PrismaClient,
  shopId: string
): Promise<{ newCount: number; success: boolean }> {
  try {
    const result = await prisma.shop.update({
      where: { id: shopId },
      data: {
        responsesUsed: { increment: 1 },
      },
    });

    return {
      newCount: result.responsesUsed,
      success: true,
    };
  } catch (error) {
    console.error("[ReviewBoost] Failed to increment usage:", error);
    return {
      newCount: 0,
      success: false,
    };
  }
}

/**
 * Check if shop can generate more responses
 */
export async function canGenerateMore(
  prisma: PrismaClient,
  shopId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getUsageStatus(prisma, shopId);

  if (status.canGenerate) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `You've used all ${status.limit} responses this month. Upgrade your plan or wait until ${status.resetDate.toLocaleDateString()}.`,
  };
}

/**
 * Get usage stats for dashboard
 */
export async function getUsageStats(
  prisma: PrismaClient,
  shopId: string
): Promise<{
  responsesUsed: number;
  responsesLimit: number;
  reviewsTotal: number;
  reviewsPending: number;
  reviewsPublished: number;
  avgRating: number;
}> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const [reviewsTotal, reviewsPending, reviewsPublished, avgRatingResult] =
    await Promise.all([
      prisma.review.count({ where: { shopId } }),
      prisma.review.count({
        where: { shopId, responseStatus: "pending" },
      }),
      prisma.review.count({
        where: { shopId, responseStatus: "published" },
      }),
      prisma.review.aggregate({
        where: { shopId },
        _avg: { rating: true },
      }),
    ]);

  return {
    responsesUsed: shop.responsesUsed,
    responsesLimit: shop.responsesLimit,
    reviewsTotal,
    reviewsPending,
    reviewsPublished,
    avgRating: avgRatingResult._avg.rating || 0,
  };
}
