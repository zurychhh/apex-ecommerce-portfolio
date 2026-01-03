import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma } from "../utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Find shop by domain
  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
    include: {
      recommendations: true,
      metrics: {
        orderBy: { recordedAt: 'desc' },
        take: 1,
      },
    },
  });

  // Get all shops for debugging
  const allShops = await prisma.shop.findMany({
    select: {
      id: true,
      domain: true,
      lastAnalysis: true,
      primaryGoal: true,
      _count: {
        select: { recommendations: true },
      },
    },
  });

  // Get total recommendation count
  const totalRecs = await prisma.recommendation.count();

  return json({
    sessionShop: session.shop,
    foundShop: shop ? {
      id: shop.id,
      domain: shop.domain,
      lastAnalysis: shop.lastAnalysis?.toISOString(),
      primaryGoal: shop.primaryGoal,
      recommendationCount: shop.recommendations.length,
      latestMetrics: shop.metrics[0] || null,
    } : null,
    allShops,
    totalRecommendations: totalRecs,
    timestamp: new Date().toISOString(),
  });
};
