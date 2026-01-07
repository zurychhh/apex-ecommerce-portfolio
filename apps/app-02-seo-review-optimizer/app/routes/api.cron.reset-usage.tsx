import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

/**
 * POST /api/cron/reset-usage
 *
 * Monthly usage reset endpoint - called by external cron service
 * (Railway cron, cron-job.org, or similar)
 *
 * Should be called on the 1st of each month.
 *
 * Security: Verify cron secret to prevent unauthorized access
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  // Verify cron secret
  const cronSecret = request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && cronSecret !== expectedSecret) {
    console.warn("[ReviewBoost] Unauthorized cron request attempt");
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();

  try {
    // Reset usage for all shops
    const result = await prisma.shop.updateMany({
      where: {
        responsesUsed: { gt: 0 },
      },
      data: {
        responsesUsed: 0,
        billingCycleStart: new Date(),
      },
    });

    console.log(`[ReviewBoost] Monthly usage reset: ${result.count} shops updated`);

    return json({
      success: true,
      shopsReset: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[ReviewBoost] Usage reset failed:", error);
    return json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

/**
 * GET /api/cron/reset-usage
 * Health check for cron endpoint
 */
export const loader = async () => {
  return json({
    endpoint: "reset-usage",
    method: "POST",
    description: "Resets monthly usage for all shops. Call on 1st of each month.",
    headers: {
      "x-cron-secret": "Required if CRON_SECRET env var is set",
    },
  });
};
