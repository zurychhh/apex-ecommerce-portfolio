import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import {
  checkActiveSubscription,
  getPlanFromSubscription,
  getResponseLimit,
} from "../utils/billing.server";

/**
 * GET /app/billing/callback?plan=starter&charge_id=...
 * Called after user approves/declines subscription on Shopify
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "free";
  const chargeId = url.searchParams.get("charge_id");

  const prisma = new PrismaClient();

  try {
    // Check if subscription was approved
    const subscriptions = await checkActiveSubscription(admin);

    const activeSubscription = subscriptions.find(
      (sub: any) => sub.status === "ACTIVE" || sub.status === "ACCEPTED"
    );

    if (activeSubscription) {
      // Subscription approved - update shop plan
      const confirmedPlan = getPlanFromSubscription(activeSubscription.name);
      const responseLimit = getResponseLimit(confirmedPlan);

      await prisma.shop.update({
        where: { domain: session.shop },
        data: {
          plan: confirmedPlan,
          responsesLimit: responseLimit === -1 ? 999999 : responseLimit,
          // Don't reset usage - keep current month's usage
          updatedAt: new Date(),
        },
      });

      // Also create/update subscription record
      await prisma.subscription.upsert({
        where: {
          shopifyChargeId: activeSubscription.id,
        },
        update: {
          status: "active",
          plan: confirmedPlan,
          updatedAt: new Date(),
        },
        create: {
          shopId: (
            await prisma.shop.findUnique({
              where: { domain: session.shop },
            })
          )!.id,
          shopifyChargeId: activeSubscription.id,
          plan: confirmedPlan,
          status: "active",
          trialEndsOn: activeSubscription.trialDays
            ? new Date(
                Date.now() + activeSubscription.trialDays * 24 * 60 * 60 * 1000
              )
            : null,
        },
      });

      console.log(
        `[ReviewBoost] Subscription activated for ${session.shop}: ${confirmedPlan}`
      );

      return redirect(`/app?upgraded=${confirmedPlan}`);
    } else {
      // Subscription declined or not found
      console.log(`[ReviewBoost] Subscription declined for ${session.shop}`);
      return redirect("/app/pricing?declined=true");
    }
  } catch (error: any) {
    console.error("[ReviewBoost] Billing callback error:", error);
    return redirect(`/app/pricing?error=${encodeURIComponent(error.message)}`);
  } finally {
    await prisma.$disconnect();
  }
};
