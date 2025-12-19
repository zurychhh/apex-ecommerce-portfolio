import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  ProgressBar,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const prisma = new PrismaClient();

  try {
    // Get shop data from our database
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
      include: {
        recommendations: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        metrics: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });

    // Count recommendations by status
    const recommendationCounts = await prisma.recommendation.groupBy({
      by: ["status"],
      where: { shopId: shop?.id },
      _count: true,
    });

    const pending =
      recommendationCounts.find((r) => r.status === "pending")?._count || 0;
    const implemented =
      recommendationCounts.find((r) => r.status === "implemented")?._count || 0;
    const total = recommendationCounts.reduce((acc, r) => acc + r._count, 0);

    const latestMetrics = shop?.metrics[0];

    return json({
      shop: {
        domain: session.shop,
        plan: shop?.plan || "free",
        primaryGoal: shop?.primaryGoal || "Increase overall conversion rate",
        lastAnalysis: shop?.lastAnalysis?.toISOString() || null,
        email: shop?.email,
      },
      metrics: {
        conversionRate: latestMetrics?.conversionRate || 0,
        industryAverage: 2.8,
        opportunity: latestMetrics
          ? Math.round(
              (latestMetrics.conversionRate * 0.2 *
                (latestMetrics.avgOrderValue || 100) *
                (latestMetrics.totalSessions || 1000)) /
                100
            )
          : 0,
        avgOrderValue: latestMetrics?.avgOrderValue || 0,
        cartAbandonmentRate: latestMetrics?.cartAbandonmentRate || 0,
      },
      recommendations: {
        total,
        pending,
        implemented,
        recent: shop?.recommendations.slice(0, 3) || [],
      },
      isAnalyzing: false,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export default function Dashboard() {
  const { shop, metrics, recommendations, isAnalyzing } =
    useLoaderData<typeof loader>();

  const hasMetrics = metrics.conversionRate > 0;

  return (
    <Page
      title="ConversionAI Dashboard"
      primaryAction={{
        content: "Run New Analysis",
        url: "/app/analysis/start",
      }}
    >
      <BlockStack gap="500">
        {!shop.lastAnalysis && (
          <Banner
            title="Welcome to ConversionAI!"
            tone="info"
            action={{ content: "Get Started", url: "/app/analysis/start" }}
          >
            <p>
              Let&apos;s analyze your store and get actionable CRO
              recommendations in 60 seconds.
            </p>
          </Banner>
        )}

        {isAnalyzing && (
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Analyzing your store...
              </Text>
              <ProgressBar progress={75} size="small" tone="primary" />
              <Text as="p" variant="bodyMd" tone="subdued">
                This will take 60-90 seconds. We&apos;re analyzing your store
                data, capturing screenshots, and consulting with AI.
              </Text>
            </BlockStack>
          </Card>
        )}

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Current Metrics
                </Text>
                {hasMetrics ? (
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyLg">
                      Conversion Rate: {metrics.conversionRate.toFixed(2)}%
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Industry Avg: {metrics.industryAverage}%
                    </Text>
                    {metrics.opportunity > 0 && (
                      <Text as="p" variant="bodyMd" tone="success">
                        Opportunity: +${metrics.opportunity.toLocaleString()}/mo
                      </Text>
                    )}
                  </BlockStack>
                ) : (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Run your first analysis to see metrics
                  </Text>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Your Store
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    {shop.domain}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Plan: {shop.plan.charAt(0).toUpperCase() + shop.plan.slice(1)}
                  </Text>
                  {shop.lastAnalysis && (
                    <Text as="p" variant="bodySm" tone="subdued">
                      Last Analysis:{" "}
                      {new Date(shop.lastAnalysis).toLocaleDateString()}
                    </Text>
                  )}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Recommendations ({recommendations.total})
              </Text>
              {recommendations.total > 0 && (
                <Button url="/app/recommendations" variant="plain">
                  View All
                </Button>
              )}
            </InlineStack>

            {recommendations.total === 0 ? (
              <BlockStack gap="400" align="center">
                <Text as="p" variant="bodyMd" tone="subdued">
                  No recommendations yet. Run your first analysis to get
                  started!
                </Text>
                <Button url="/app/analysis/start" variant="primary">
                  Start Analysis
                </Button>
              </BlockStack>
            ) : (
              <BlockStack gap="300">
                <InlineStack gap="400">
                  <Text as="p" variant="bodyMd">
                    Pending: {recommendations.pending}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Implemented: {recommendations.implemented}
                  </Text>
                </InlineStack>
                {recommendations.recent.length > 0 && (
                  <BlockStack gap="200">
                    {recommendations.recent.map((rec: any) => (
                      <Card key={rec.id} padding="300">
                        <InlineStack align="space-between">
                          <BlockStack gap="100">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {rec.title}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {rec.category} • Impact: {rec.impactScore}/10
                            </Text>
                          </BlockStack>
                          <Button
                            url={`/app/recommendations/${rec.id}`}
                            variant="plain"
                          >
                            View
                          </Button>
                        </InlineStack>
                      </Card>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
