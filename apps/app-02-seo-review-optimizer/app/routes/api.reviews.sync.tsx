import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import { syncReviewsFromShopify, importSampleReviews } from "../utils/shopify-reviews.server";

/**
 * API endpoint to sync reviews from Shopify
 *
 * POST /api/reviews/sync
 * Body: { mode: "shopify" | "sample" }
 *
 * - "shopify": Fetch reviews from Shopify Product Reviews API
 * - "sample": Import sample reviews for testing/demo
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const prisma = new PrismaClient();

  try {
    // Get shop from database
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      return json(
        { error: "Shop not found. Please reinstall the app." },
        { status: 404 }
      );
    }

    // Parse request body
    let mode = "sample"; // Default to sample for MVP
    try {
      const body = await request.json();
      mode = body.mode || "sample";
    } catch {
      // No body or invalid JSON, use default
    }

    let result;

    if (mode === "shopify") {
      // Sync from Shopify Product Reviews
      result = await syncReviewsFromShopify(
        prisma,
        shop.id,
        shop.domain,
        shop.accessToken
      );
    } else {
      // Import sample reviews for testing
      result = await importSampleReviews(prisma, shop.id);
    }

    console.log(`[ReviewBoost] Sync completed for ${shop.domain}:`, result);

    return json({
      success: true,
      mode,
      ...result,
      message:
        result.new > 0
          ? `Synced ${result.synced} reviews (${result.new} new)`
          : result.errors.length > 0
          ? `Sync completed with ${result.errors.length} errors`
          : "No new reviews found",
    });

  } catch (error: any) {
    console.error("[ReviewBoost] Sync error:", error);
    return json(
      { error: `Sync failed: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
