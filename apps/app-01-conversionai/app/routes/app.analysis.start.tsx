import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation, useActionData } from '@remix-run/react';
import { Page, Card, Text, Button, Select, Banner } from '@shopify/polaris';
import { useState } from 'react';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { queueAnalysis } from '../utils/queue.server';
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

    // Queue analysis job (runs in background via Bull/Redis)
    // This returns immediately, allowing the UI to show progress
    logger.info(`Queueing analysis for ${shop.domain} with goal: ${primaryGoal}`);

    try {
      const job = await queueAnalysis({
        shopId: shop.id,
        shopDomain: shop.domain,
        primaryGoal,
      });

      logger.info(`Analysis job queued: ${job.id} for ${shop.domain}`);

      // Redirect immediately with analyzing=true
      // Dashboard will poll every 10s until recommendations appear
      return redirect('/app?analyzing=true');
    } catch (queueError: any) {
      logger.error('Failed to queue analysis:', queueError);
      return json({
        error: `Failed to queue analysis: ${queueError.message}`,
        stack: queueError.stack?.substring(0, 500)
      }, { status: 500 });
    }

  } catch (error: any) {
    logger.error('Failed to start analysis:', error);
    return json({ error: 'Failed to start analysis. Please try again.' }, { status: 500 });
  }
};

export default function StartAnalysis() {
  const { shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
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
      {actionData?.error && (
        <div style={{ marginBottom: '16px' }}>
          <Banner tone="critical">
            <p><strong>Error:</strong> {actionData.error}</p>
            {actionData.stack && (
              <pre style={{ fontSize: '11px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                {actionData.stack}
              </pre>
            )}
          </Banner>
        </div>
      )}

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
              <li><Text as="span" variant="bodyMd">Run 3-stage deep AI analysis (problems → solutions → priorities)</Text></li>
              <li><Text as="span" variant="bodyMd">Compare with industry benchmarks</Text></li>
              <li><Text as="span" variant="bodyMd">Generate 10-12 highly specific recommendations with ROI</Text></li>
            </ul>
            <Text as="p" variant="bodySm" tone="subdued">
              This process takes 2-3 minutes. You can leave this page - we&apos;ll send an email when it&apos;s complete.
            </Text>
          </div>
        </div>
      </Card>
    </Page>
  );
}
