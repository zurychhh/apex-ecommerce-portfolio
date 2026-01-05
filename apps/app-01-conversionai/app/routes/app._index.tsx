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
  Badge,
} from "@shopify/polaris";
import { BrandedFooter } from "../components/BrandedFooter";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import { prisma } from "../utils/db.server";
import { PLANS, canPerformAnalysis } from "../utils/billing.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const analyzingParam = url.searchParams.get("analyzing") === "true";
  const upgraded = url.searchParams.get("upgraded") === "true";
  const upgradeCancelled = url.searchParams.get("upgrade_cancelled") === "true";
  const billingError = url.searchParams.get("billing_error") === "true";

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

  // Check billing limits
  const currentPlan = shop?.plan || "free";
  const planConfig = PLANS[currentPlan] || PLANS.free;

  // Count analyses this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const analysisCountThisMonth = shop?.lastAnalysis && shop.lastAnalysis >= startOfMonth ? 1 : 0;
  const billingCheck = await canPerformAnalysis(currentPlan, analysisCountThisMonth);

  return json({
    shop: {
      domain: session.shop,
      plan: currentPlan,
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
    billing: {
      canAnalyze: billingCheck.allowed,
      limitReason: billingCheck.reason,
      analysisLimit: planConfig.features.analysisPerMonth,
      analysisUsed: analysisCountThisMonth,
    },
    notifications: {
      upgraded,
      upgradeCancelled,
      billingError,
    },
    analyzingParam,
  });
};

export default function Dashboard() {
  const { shop, metrics, recommendations, billing, notifications, analyzingParam } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [isAnalyzing, setIsAnalyzing] = useState(analyzingParam);
  const [progress, setProgress] = useState(10);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(notifications.upgraded);
  const [showCancelledBanner, setShowCancelledBanner] = useState(notifications.upgradeCancelled);

  // Auto-refresh when analyzing
  useEffect(() => {
    if (!isAnalyzing) return;

    // Progress animation - slower for multi-stage (2-3 min)
    // Increment by 2% every 4 seconds = 90% in ~180s (3 min)
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 4000);

    // Check for new recommendations every 15 seconds
    const pollInterval = setInterval(() => {
      revalidator.revalidate();
    }, 15000);

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

  const canStartAnalysis = billing.canAnalyze && !isAnalyzing;

  return (
    <Page
      title="ConversionAI Dashboard"
      subtitle="by ApexMind AI Labs"
      primaryAction={{
        content: isAnalyzing ? "Analyzing..." : "Run New Analysis",
        url: "/app/analysis/start",
        disabled: !canStartAnalysis,
      }}
      secondaryActions={[
        {
          content: "Upgrade Plan",
          url: "/app/upgrade",
        },
      ]}
    >
      <BlockStack gap="500">
        {/* Upgrade success banner */}
        {showUpgradeBanner && (
          <Banner
            title="Successfully upgraded!"
            tone="success"
            onDismiss={() => setShowUpgradeBanner(false)}
          >
            <p>Your plan has been upgraded. Enjoy your new features!</p>
          </Banner>
        )}

        {/* Upgrade cancelled banner */}
        {showCancelledBanner && (
          <Banner
            title="Upgrade cancelled"
            tone="warning"
            onDismiss={() => setShowCancelledBanner(false)}
          >
            <p>Your upgrade was cancelled. You can try again anytime.</p>
          </Banner>
        )}

        {/* Billing limit reached banner */}
        {!billing.canAnalyze && !isAnalyzing && (
          <Banner
            title="Monthly analysis limit reached"
            tone="warning"
            action={{ content: "Upgrade Plan", url: "/app/upgrade" }}
          >
            <p>
              You&apos;ve used {billing.analysisUsed} of {billing.analysisLimit} analyses this month.
              Upgrade to run more analyses.
            </p>
          </Banner>
        )}

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
                  This takes 2-3 minutes. We&apos;re running 3-stage deep AI analysis
                  to generate highly specific recommendations with ROI estimates.
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
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">
                      Your Store
                    </Text>
                    <Badge tone={shop.plan === "free" ? "info" : "success"}>
                      {shop.plan.charAt(0).toUpperCase() + shop.plan.slice(1)}
                    </Badge>
                  </InlineStack>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      {shop.domain}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Analyses: {billing.analysisUsed}/{billing.analysisLimit >= 999 ? "∞" : billing.analysisLimit} this month
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
                    {shop.plan === "free" && (
                      <Button url="/app/upgrade" variant="plain" size="slim">
                        Upgrade for more features
                      </Button>
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
                    <div className="brand-primary-button">
                      <Button url="/app/analysis/start" variant="primary">
                        Start Analysis
                      </Button>
                    </div>
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

        <BrandedFooter />
      </BlockStack>
    </Page>
  );
}
