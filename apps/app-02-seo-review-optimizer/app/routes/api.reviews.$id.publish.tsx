import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import { publishReviewResponse } from "../utils/shopify-reviews.server";

/**
 * API endpoint to publish a review response to Shopify
 *
 * POST /api/reviews/:id/publish
 * Body: { responseBody?: string } (optional - use edited version)
 */
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const reviewId = params.id;
  if (!reviewId) {
    return json({ error: "Review ID is required" }, { status: 400 });
  }

  const prisma = new PrismaClient();

  try {
    // Get shop
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      return json({ error: "Shop not found" }, { status: 404 });
    }

    // Get review and verify it belongs to this shop
    const review = await prisma.review.findFirst({
      where: { id: reviewId, shopId: shop.id },
    });

    if (!review) {
      return json({ error: "Review not found" }, { status: 404 });
    }

    // Check if review has a response
    if (!review.generatedResponse && !review.editedResponse) {
      return json(
        { error: "No response to publish. Generate a response first." },
        { status: 400 }
      );
    }

    // Parse request body for custom response
    let responseBody = review.editedResponse || review.generatedResponse;
    try {
      const body = await request.json();
      if (body.responseBody) {
        responseBody = body.responseBody;
      }
    } catch {
      // Use existing response
    }

    if (!responseBody) {
      return json({ error: "Response body is required" }, { status: 400 });
    }

    // Publish to Shopify (or mark as published for MVP)
    const result = await publishReviewResponse(
      shop.domain,
      shop.accessToken,
      review.shopifyReviewId || review.id,
      responseBody
    );

    if (!result.success) {
      return json(
        { error: result.error || "Failed to publish to Shopify" },
        { status: 500 }
      );
    }

    // Update review status
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        publishedResponse: responseBody,
        responseStatus: "published",
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`[ReviewBoost] Published response for review ${reviewId}`);

    return json({
      success: true,
      message: "Response published successfully",
      publishedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("[ReviewBoost] Publish error:", error);
    return json(
      { error: `Failed to publish response: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
