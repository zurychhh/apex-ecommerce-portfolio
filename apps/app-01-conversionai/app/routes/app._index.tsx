import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, useRevalidator } from "@remix-run/react";
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
  Spinner,
  Box,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import { prisma } from "../utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const analyzingParam = url.searchParams.get("analyzing") === "true";

  // Get shop data from our database
  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
    include: {
      recommendations: {
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 5,
      },
      metrics: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
  });

  // Count recommendations by status
  const recommendationCounts = shop?.id
    ? await prisma.recommendation.groupBy({
        by: ["status"],
        where: { shopId: shop.id },
        _count: true,
      })
    : [];

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
            ((latestMetrics.conversionRate * 0.2 *
              (latestMetrics.avgOrderValue || 100) *
              (latestMetrics.totalSessions || 1000)) /
              100)
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
    analyzingParam,
  });
};

export default function Dashboard() {
  const { shop, metrics, recommendations, analyzingParam } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isAnalyzing, setIsAnalyzing] = useState(analyzingParam);
  const [progress, setProgress] = useState(10);

  // Auto-refresh when analyzing
  useEffect(() => {
    if (!isAnalyzing) return;

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 3000);

    // Check for new recommendations every 10 seconds
    const pollInterval = setInterval(() => {
      revalidator.revalidate();
    }, 10000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(pollInterval);
    };
  }, [isAnalyzing, revalidator]);

  // When recommendations appear, stop analyzing
  useEffect(() => {
    if (isAnalyzing && recommendations.total > 0) {
      setIsAnalyzing(false);
      setProgress(100);
      // Remove analyzing param from URL
      searchParams.delete("analyzing");
      setSearchParams(searchParams, { replace: true });
    }
  }, [recommendations.total, isAnalyzing, searchParams, setSearchParams]);

  const hasMetrics = metrics.conversionRate > 0;

  return (
    <Page
      title="ConversionAI Dashboard"
      primaryAction={{
        content: isAnalyzing ? "Analyzing..." : "Run New Analysis",
        url: "/app/analysis/start",
        disabled: isAnalyzing,
      }}
    >
      <BlockStack gap="500">
        {!shop.lastAnalysis && !isAnalyzing && (
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
            <Box padding="400">
              <BlockStack gap="400">
                <InlineStack gap="300" blockAlign="center">
                  <Spinner size="small" />
                  <Text as="h2" variant="headingMd">
                    Analyzing your store...
                  </Text>
                </InlineStack>
                <ProgressBar progress={progress} size="small" tone="primary" />
                <Text as="p" variant="bodyMd" tone="subdued">
                  This takes 60-90 seconds. We&apos;re fetching your store data,
                  capturing screenshots, and generating AI recommendations.
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  You can leave this page - we&apos;ll send an email when ready.
                </Text>
              </BlockStack>
            </Box>
          </Card>
        )}

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <Box padding="400">
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
                      <Text as="p" variant="bodySm" tone="subdued">
                        Avg Order Value: ${metrics.avgOrderValue.toFixed(2)}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Cart Abandonment: {metrics.cartAbandonmentRate.toFixed(1)}%
                      </Text>
                    </BlockStack>
                  ) : (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Run your first analysis to see metrics
                    </Text>
                  )}
                </BlockStack>
              </Box>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <Box padding="400">
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
                    {shop.primaryGoal && (
                      <Text as="p" variant="bodySm" tone="subdued">
                        Goal: {shop.primaryGoal}
                      </Text>
                    )}
                  </BlockStack>
                </BlockStack>
              </Box>
            </Card>
          </Layout.Section>
        </Layout>

        <Card>
          <Box padding="400">
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
                <BlockStack gap="400" inlineAlign="center">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {isAnalyzing
                      ? "Recommendations will appear here once analysis completes."
                      : "No recommendations yet. Run your first analysis to get started!"}
                  </Text>
                  {!isAnalyzing && (
                    <Button url="/app/analysis/start" variant="primary">
                      Start Analysis
                    </Button>
                  )}
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
                                {rec.category.replace(/_/g, " ")} • Impact: {rec.impactScore}/5
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
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}
