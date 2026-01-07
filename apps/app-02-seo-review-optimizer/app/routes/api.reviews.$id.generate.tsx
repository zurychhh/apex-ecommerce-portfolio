import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";
import { generateReviewResponse, type ResponseTone } from "../utils/review-response-ai.server";

/**
 * API endpoint to generate AI response for a review
 *
 * POST /api/reviews/:id/generate
 * Body: { tone: "professional" | "friendly" | "apologetic" }
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

    // Check usage limits
    if (shop.responsesUsed >= shop.responsesLimit) {
      return json(
        {
          error: "Monthly response limit reached",
          upgradeRequired: true,
          responsesUsed: shop.responsesUsed,
          responsesLimit: shop.responsesLimit,
        },
        { status: 402 }
      );
    }

    // Parse request body
    let tone: ResponseTone = "professional";
    try {
      const body = await request.json();
      if (body.tone && ["professional", "friendly", "apologetic"].includes(body.tone)) {
        tone = body.tone;
      }
    } catch {
      // Use default tone
    }

    // Generate AI response
    const { responseBody, tokensUsed } = await generateReviewResponse({
      review: {
        author: review.reviewerName,
        rating: review.rating,
        title: review.title,
        body: review.body,
        productTitle: review.productTitle,
      },
      tone,
      brandVoice: shop.brandVoice,
      storeName: shop.domain.replace(".myshopify.com", ""),
    });

    // Update review with generated response
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        generatedResponse: responseBody,
        responseStatus: "generated",
        updatedAt: new Date(),
      },
    });

    // Increment usage count
    await prisma.shop.update({
      where: { id: shop.id },
      data: { responsesUsed: { increment: 1 } },
    });

    console.log(`[ReviewBoost] Generated response for review ${reviewId} (${tone} tone, ${tokensUsed} tokens)`);

    return json({
      success: true,
      responseBody,
      tokensUsed,
      tone,
      responsesRemaining: shop.responsesLimit - shop.responsesUsed - 1,
    });

  } catch (error: any) {
    console.error("[ReviewBoost] Generate error:", error);
    return json(
      { error: `Failed to generate response: ${error.message}` },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
};
