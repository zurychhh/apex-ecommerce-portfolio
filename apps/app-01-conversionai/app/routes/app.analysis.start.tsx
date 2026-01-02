import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { Page, Card, Text, Button, Select, Banner } from '@shopify/polaris';
import { useState } from 'react';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { analyzeStore } from '../jobs/analyzeStore';
import { logger } from '../utils/logger.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
    select: {
      domain: true,
      primaryGoal: true,
      lastAnalysis: true,
    },
  });

  return json({
    shop: {
      domain: session.shop,
      primaryGoal: shop?.primaryGoal || null,
      lastAnalysis: shop?.lastAnalysis?.toISOString() || null,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const primaryGoal = formData.get('primaryGoal') as string || 'Increase overall conversion rate';

  try {
    // Get shop from database
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      logger.error(`Shop not found: ${session.shop}`);
      return json({ error: 'Shop not found. Please reinstall the app.' }, { status: 404 });
    }

    // Clear previous recommendations
    await prisma.recommendation.deleteMany({
      where: { shopId: shop.id },
    });

    // Run analysis synchronously (bypassing queue for debugging)
    logger.info(`Starting synchronous analysis for ${shop.domain} with goal: ${primaryGoal}`);

    try {
      const result = await analyzeStore({
        shopId: shop.id,
        shopDomain: shop.domain,
        primaryGoal,
      });

      logger.info(`Analysis completed: ${result.recommendationsCount} recommendations generated`);
    } catch (analysisError: any) {
      logger.error('Analysis failed:', analysisError);
      // Don't throw - still redirect to dashboard
    }

    // Redirect to dashboard - analysis should be complete now
    return redirect('/app');

  } catch (error: any) {
    logger.error('Failed to start analysis:', error);
    return json({ error: 'Failed to start analysis. Please try again.' }, { status: 500 });
  }
};

export default function StartAnalysis() {
  const { shop } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [selectedGoal, setSelectedGoal] = useState(shop.primaryGoal || 'increase_conversion');

  const goalOptions = [
    { label: 'Increase overall conversion rate', value: 'increase_conversion' },
    { label: 'Reduce cart abandonment', value: 'reduce_abandonment' },
    { label: 'Increase average order value', value: 'increase_aov' },
    { label: 'Improve product page conversion', value: 'improve_pdp' },
    { label: 'Boost mobile conversion', value: 'boost_mobile' },
  ];

  const goalLabels: Record<string, string> = {
    increase_conversion: 'Increase overall conversion rate',
    reduce_abandonment: 'Reduce cart abandonment',
    increase_aov: 'Increase average order value',
    improve_pdp: 'Improve product page conversion',
    boost_mobile: 'Boost mobile conversion',
  };

  return (
    <Page
      title="Start Analysis"
      backAction={{ url: '/app' }}
    >
      {shop.lastAnalysis && (
        <div style={{ marginBottom: '16px' }}>
          <Banner tone="info">
            Last analysis: {new Date(shop.lastAnalysis).toLocaleDateString()}. Running a new analysis will replace your existing recommendations.
          </Banner>
        </div>
      )}

      <Card>
        <div style={{ padding: '20px' }}>
          <Text as="h2" variant="headingMd">
            What&apos;s your primary goal?
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            This helps our AI focus on the most relevant recommendations for your store.
          </Text>

          <Form method="post" style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <Select
                label="Primary Goal"
                options={goalOptions}
                value={selectedGoal}
                onChange={setSelectedGoal}
                name="primaryGoal"
              />
            </div>

            <input type="hidden" name="primaryGoalLabel" value={goalLabels[selectedGoal] || selectedGoal} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button submit variant="primary" loading={isSubmitting} disabled={!selectedGoal}>
                {isSubmitting ? 'Starting Analysis...' : 'Start Analysis'}
              </Button>
              <Button url="/app">Cancel</Button>
            </div>
          </Form>

          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f6f6f7', borderRadius: '8px' }}>
            <Text as="h3" variant="headingSm">
              What happens next?
            </Text>
            <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
              <li><Text as="span" variant="bodyMd">We&apos;ll analyze your store data (analytics, products, theme)</Text></li>
              <li><Text as="span" variant="bodyMd">Capture screenshots of key pages</Text></li>
              <li><Text as="span" variant="bodyMd">Compare with industry benchmarks</Text></li>
              <li><Text as="span" variant="bodyMd">Generate 10-15 prioritized recommendations</Text></li>
            </ul>
            <Text as="p" variant="bodySm" tone="subdued">
              This process takes 60-90 seconds. You&apos;ll receive an email when it&apos;s complete.
            </Text>
          </div>
        </div>
      </Card>
    </Page>
  );
}
