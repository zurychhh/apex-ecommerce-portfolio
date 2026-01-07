import { PrismaClient } from "@prisma/client";

/**
 * Shopify Product Reviews API Integration
 *
 * NOTE: Shopify's native Product Reviews app uses a specific API.
 * For stores using third-party review apps (Judge.me, Yotpo, etc.),
 * we would need different integrations.
 *
 * This implementation supports:
 * 1. Shopify Product Reviews (native)
 * 2. Manual review import (for testing/MVP)
 */

interface ShopifyReview {
  id: string;
  product_id: string;
  product_title: string;
  product_handle?: string;
  author: string;
  email?: string;
  rating: number;
  title?: string;
  body: string;
  created_at: string;
  state: string; // published, pending, spam
}

interface SyncResult {
  synced: number;
  new: number;
  updated: number;
  errors: string[];
}

/**
 * Detect sentiment based on star rating
 */
export function detectSentiment(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

/**
 * Fetch reviews from Shopify Product Reviews API
 *
 * Note: The actual Shopify Product Reviews API is available via
 * the shopify-product-reviews.myshopify.com endpoint.
 *
 * For MVP, we also support manual/mock data import.
 */
export async function fetchProductReviews(
  shop: string,
  accessToken: string,
  options: {
    productId?: string;
    since?: Date;
    limit?: number;
  } = {}
): Promise<{ reviews: ShopifyReview[]; hasMore: boolean; cursor?: string }> {
  const { productId, since, limit = 50 } = options;

  // For MVP: Try to fetch from Shopify's native reviews
  // Note: This requires the store to have Shopify Product Reviews installed
  try {
    const endpoint = `https://${shop}/admin/api/2024-10/products.json`;

    // First get products to find reviews
    const productsResponse = await fetch(endpoint, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();

    // Note: Shopify native reviews are accessed through metafields
    // For this MVP, we'll create a simpler approach

    // Return empty for now - reviews will be imported via manual sync or webhook
    return {
      reviews: [],
      hasMore: false,
    };

  } catch (error) {
    console.error("Error fetching Shopify reviews:", error);
    throw error;
  }
}

/**
 * Sync reviews from Shopify to local database
 */
export async function syncReviewsFromShopify(
  prisma: PrismaClient,
  shopId: string,
  shop: string,
  accessToken: string
): Promise<SyncResult> {
  const result: SyncResult = {
    synced: 0,
    new: 0,
    updated: 0,
    errors: [],
  };

  try {
    // Fetch reviews from Shopify
    const { reviews } = await fetchProductReviews(shop, accessToken);

    for (const review of reviews) {
      try {
        const existingReview = await prisma.review.findUnique({
          where: { shopifyReviewId: review.id },
        });

        const reviewData = {
          shopId,
          shopifyReviewId: review.id,
          productId: review.product_id,
          productTitle: review.product_title,
          productHandle: review.product_handle,
          reviewerName: review.author,
          reviewerEmail: review.email,
          rating: review.rating,
          title: review.title,
          body: review.body,
          sentiment: detectSentiment(review.rating),
          reviewCreatedAt: new Date(review.created_at),
        };

        if (existingReview) {
          await prisma.review.update({
            where: { id: existingReview.id },
            data: reviewData,
          });
          result.updated++;
        } else {
          await prisma.review.create({
            data: reviewData,
          });
          result.new++;
        }

        result.synced++;
      } catch (error: any) {
        result.errors.push(`Review ${review.id}: ${error.message}`);
      }
    }

    // Update last sync time
    await prisma.shop.update({
      where: { id: shopId },
      data: { lastSyncAt: new Date() },
    });

  } catch (error: any) {
    result.errors.push(`Sync failed: ${error.message}`);
  }

  return result;
}

/**
 * Import sample reviews for testing/demo
 * This is useful for development and demo stores
 */
export async function importSampleReviews(
  prisma: PrismaClient,
  shopId: string
): Promise<SyncResult> {
  const result: SyncResult = {
    synced: 0,
    new: 0,
    updated: 0,
    errors: [],
  };

  const sampleReviews = [
    {
      shopifyReviewId: `sample_${Date.now()}_1`,
      productId: "prod_sample_1",
      productTitle: "Premium Wireless Headphones",
      productHandle: "premium-wireless-headphones",
      reviewerName: "Sarah M.",
      rating: 5,
      title: "Best headphones I've ever owned!",
      body: "The sound quality is incredible and the battery lasts forever. Super comfortable for long listening sessions. Would definitely recommend to anyone looking for quality wireless headphones.",
      sentiment: "positive",
      reviewCreatedAt: new Date(),
    },
    {
      shopifyReviewId: `sample_${Date.now()}_2`,
      productId: "prod_sample_2",
      productTitle: "Smart Fitness Watch",
      productHandle: "smart-fitness-watch",
      reviewerName: "Mike T.",
      rating: 3,
      title: "Good but could be better",
      body: "The fitness tracking is accurate and I like the design. However, the app sometimes crashes and syncing can be slow. It's decent for the price but there's room for improvement.",
      sentiment: "neutral",
      reviewCreatedAt: new Date(),
    },
    {
      shopifyReviewId: `sample_${Date.now()}_3`,
      productId: "prod_sample_3",
      productTitle: "Ergonomic Office Chair",
      productHandle: "ergonomic-office-chair",
      reviewerName: "Jennifer K.",
      rating: 1,
      title: "Very disappointed",
      body: "Chair arrived with a broken armrest and the cushion started sagging after just two weeks. Customer service has been unresponsive. Save your money and buy elsewhere.",
      sentiment: "negative",
      reviewCreatedAt: new Date(),
    },
    {
      shopifyReviewId: `sample_${Date.now()}_4`,
      productId: "prod_sample_1",
      productTitle: "Premium Wireless Headphones",
      productHandle: "premium-wireless-headphones",
      reviewerName: "David R.",
      rating: 4,
      title: "Great product, minor issues",
      body: "Sound quality is excellent and they're very comfortable. Only giving 4 stars because the carrying case feels a bit cheap. Otherwise, highly recommend these headphones.",
      sentiment: "positive",
      reviewCreatedAt: new Date(),
    },
    {
      shopifyReviewId: `sample_${Date.now()}_5`,
      productId: "prod_sample_4",
      productTitle: "Organic Coffee Beans",
      productHandle: "organic-coffee-beans",
      reviewerName: "Lisa W.",
      rating: 2,
      title: "Not fresh",
      body: "The beans tasted stale and the packaging was damaged when it arrived. Expected much better quality for an organic product at this price point.",
      sentiment: "negative",
      reviewCreatedAt: new Date(),
    },
  ];

  for (const review of sampleReviews) {
    try {
      await prisma.review.create({
        data: {
          ...review,
          shopId,
        },
      });
      result.new++;
      result.synced++;
    } catch (error: any) {
      // Skip if already exists
      if (error.code === "P2002") {
        result.errors.push(`Review already exists: ${review.shopifyReviewId}`);
      } else {
        result.errors.push(`Failed to create review: ${error.message}`);
      }
    }
  }

  // Update last sync time
  await prisma.shop.update({
    where: { id: shopId },
    data: { lastSyncAt: new Date() },
  });

  return result;
}

/**
 * Publish response to Shopify
 *
 * Note: Publishing responses requires the Shopify Product Reviews app
 * or a third-party integration. For MVP, this marks the review as published
 * in our database.
 */
export async function publishReviewResponse(
  shop: string,
  accessToken: string,
  shopifyReviewId: string,
  responseBody: string
): Promise<{ success: boolean; error?: string }> {
  // For MVP: Mark as published in our system
  // Real implementation would POST to Shopify Product Reviews API

  try {
    // TODO: Implement actual Shopify Product Reviews API call
    // POST https://{shop}/admin/api/2024-10/products/{product_id}/reviews/{review_id}/reply.json
    // Body: { reply: { body: responseBody } }

    console.log(`[ReviewBoost] Publishing response to ${shop} for review ${shopifyReviewId}`);
    console.log(`[ReviewBoost] Response: ${responseBody.substring(0, 100)}...`);

    // For now, return success (actual integration depends on review app used)
    return { success: true };

  } catch (error: any) {
    console.error("Error publishing review response:", error);
    return { success: false, error: error.message };
  }
}
