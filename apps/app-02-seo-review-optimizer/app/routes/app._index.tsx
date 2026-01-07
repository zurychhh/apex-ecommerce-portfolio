import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Box,
  ProgressBar,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const prisma = new PrismaClient();

  try {
    // Get or create shop
    let shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          domain: session.shop,
          accessToken: session.accessToken || "",
          scope: session.scope || "",
          plan: "free",
          responsesLimit: 10,
        },
        include: {
          reviews: true,
        },
      });
    }

    // Calculate stats
    const totalReviews = await prisma.review.count({
      where: { shopId: shop.id },
    });

    const pendingReviews = await prisma.review.count({
      where: { shopId: shop.id, responseStatus: "pending" },
    });

    const publishedResponses = await prisma.review.count({
      where: { shopId: shop.id, responseStatus: "published" },
    });

    const usagePercent = shop.responsesLimit > 0
      ? Math.round((shop.responsesUsed / shop.responsesLimit) * 100)
      : 0;

    return json({
      shop: {
        domain: shop.domain,
        plan: shop.plan,
        responsesUsed: shop.responsesUsed,
        responsesLimit: shop.responsesLimit,
        lastSyncAt: shop.lastSyncAt?.toISOString() || null,
      },
      stats: {
        totalReviews,
        pendingReviews,
        publishedResponses,
        usagePercent,
      },
      recentReviews: shop.reviews.map((r) => ({
        id: r.id,
        productTitle: r.productTitle,
        rating: r.rating,
        reviewerName: r.reviewerName,
        responseStatus: r.responseStatus,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } finally {
    await prisma.$disconnect();
  }
};

export default function Dashboard() {
  const { shop, stats, recentReviews } = useLoaderData<typeof loader>();

  const planBadgeStatus: "info" | "success" = shop.plan === "free" ? "info" : "success";

  return (
    <Page title="ReviewBoost AI">
      <BlockStack gap="500">
        {/* Welcome Banner for new users */}
        {stats.totalReviews === 0 && (
          <Banner
            title="Welcome to ReviewBoost AI!"
            tone="info"
            onDismiss={() => {}}
          >
            <p>
              Get started by syncing your product reviews. We'll help you respond
              to customers professionally with AI-powered responses.
            </p>
          </Banner>
        )}

        {/* Stats Cards */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Total Reviews
                </Text>
                <Text as="p" variant="heading2xl">
                  {stats.totalReviews}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Pending Responses
                </Text>
                <Text as="p" variant="heading2xl" tone="caution">
                  {stats.pendingReviews}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Published Responses
                </Text>
                <Text as="p" variant="heading2xl" tone="success">
                  {stats.publishedResponses}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Usage & Plan */}
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Monthly Usage
                  </Text>
                  <Badge tone={planBadgeStatus}>
                    {`${shop.plan.charAt(0).toUpperCase()}${shop.plan.slice(1)} Plan`}
                  </Badge>
                </InlineStack>

                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      {shop.responsesUsed} / {shop.responsesLimit} responses
                    </Text>
                    <Text as="span" variant="bodyMd" tone="subdued">
                      {stats.usagePercent}%
                    </Text>
                  </InlineStack>
                  <ProgressBar
                    progress={stats.usagePercent}
                    tone={stats.usagePercent > 80 ? "critical" : "primary"}
                  />
                </BlockStack>

                {shop.plan === "free" && (
                  <Button variant="primary" url="/app/pricing">
                    Upgrade for More Responses
                  </Button>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Quick Actions
                </Text>

                <BlockStack gap="200">
                  <Button variant="primary" url="/app/reviews">
                    View All Reviews
                  </Button>
                  <Button url="/app/settings">
                    Configure Brand Voice
                  </Button>
                  <Button url="/app/sync" tone="success">
                    Sync Reviews from Shopify
                  </Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Recent Reviews */}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h3" variant="headingMd">
                Recent Reviews
              </Text>
              <Button variant="plain" url="/app/reviews">
                View all
              </Button>
            </InlineStack>

            {recentReviews.length === 0 ? (
              <Box padding="400">
                <Text as="p" tone="subdued" alignment="center">
                  No reviews synced yet. Click "Sync Reviews" to get started.
                </Text>
              </Box>
            ) : (
              <BlockStack gap="300">
                {recentReviews.map((review) => (
                  <Box
                    key={review.id}
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="100">
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {review.productTitle}
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                          by {review.reviewerName} • {"★".repeat(review.rating)}
                        </Text>
                      </BlockStack>
                      <Badge
                        tone={
                          review.responseStatus === "published"
                            ? "success"
                            : review.responseStatus === "pending"
                            ? "attention"
                            : "info"
                        }
                      >
                        {review.responseStatus}
                      </Badge>
                    </InlineStack>
                  </Box>
                ))}
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
