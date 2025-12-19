import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Page, Layout, Card, Text, Button, Banner, ProgressBar } from '@shopify/polaris';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: Get actual shop data from session
  // TODO: Fetch metrics and recommendations from database

  return json({
    shop: {
      domain: 'example.myshopify.com',
      plan: 'free',
      primaryGoal: 'Increase overall conversion rate',
      lastAnalysis: null,
    },
    metrics: {
      conversionRate: 2.3,
      industryAverage: 2.8,
      opportunity: 3400,
    },
    recommendations: {
      total: 0,
      pending: 0,
      implemented: 0,
    },
    isAnalyzing: false,
  });
};

export default function Dashboard() {
  const { shop, metrics, recommendations, isAnalyzing } = useLoaderData<typeof loader>();

  return (
    <Page
      title="ConversionAI Dashboard"
      primaryAction={
        <Button primary onClick={() => console.log('Start analysis')}>
          Run New Analysis
        </Button>
      }
    >
      <Layout>
        {!shop.lastAnalysis && (
          <Layout.Section>
            <Banner
              title="Welcome to ConversionAI!"
              status="info"
              action={{ content: 'Get Started', url: '/app/onboarding' }}
            >
              <p>
                Let's analyze your store and get actionable CRO recommendations in 60 seconds.
              </p>
            </Banner>
          </Layout.Section>
        )}

        {isAnalyzing && (
          <Layout.Section>
            <Card>
              <div style={{ padding: '20px' }}>
                <Text as="h2" variant="headingMd">
                  Analyzing your store...
                </Text>
                <ProgressBar progress={75} size="small" />
                <Text as="p" variant="bodyMd">
                  This will take 60-90 seconds. We're analyzing your store data, capturing
                  screenshots, and consulting with AI.
                </Text>
              </div>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <Layout>
            <Layout.Section oneHalf>
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text as="h2" variant="headingMd">
                    📊 Current Metrics
                  </Text>
                  <div style={{ marginTop: '16px' }}>
                    <Text as="p" variant="bodyLg">
                      Conversion Rate: {metrics.conversionRate}%
                    </Text>
                    <Text as="p" variant="bodySm" color="subdued">
                      Industry Avg: {metrics.industryAverage}% ↗️
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Opportunity: +${metrics.opportunity.toLocaleString()}/mo
                    </Text>
                  </div>
                </div>
              </Card>
            </Layout.Section>

            <Layout.Section oneHalf>
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text as="h2" variant="headingMd">
                    🎯 Primary Goal
                  </Text>
                  <div style={{ marginTop: '16px' }}>
                    <Text as="p" variant="bodyMd">
                      {shop.primaryGoal || 'Not set'}
                    </Text>
                    {shop.lastAnalysis && (
                      <Text as="p" variant="bodySm" color="subdued">
                        Last Analysis: {new Date(shop.lastAnalysis).toLocaleDateString()}
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text as="h2" variant="headingMd">
                💡 Recommendations ({recommendations.total})
              </Text>
              {recommendations.total === 0 ? (
                <div style={{ marginTop: '16px', textAlign: 'center', padding: '40px' }}>
                  <Text as="p" variant="bodyMd" color="subdued">
                    No recommendations yet. Run your first analysis to get started!
                  </Text>
                  <div style={{ marginTop: '16px' }}>
                    <Button primary url="/app/analysis/start">
                      Start Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <Text as="p" variant="bodyMd">
                    Pending: {recommendations.pending} | Implemented: {recommendations.implemented}
                  </Text>
                  <div style={{ marginTop: '16px' }}>
                    <Button url="/app/recommendations">View All Recommendations</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
