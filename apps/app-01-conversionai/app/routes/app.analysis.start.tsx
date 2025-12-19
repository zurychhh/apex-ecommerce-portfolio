import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { Page, Card, Text, Button, Select } from '@shopify/polaris';
import { useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: Get shop info from session
  return json({
    shop: {
      domain: 'example.myshopify.com',
      primaryGoal: null,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const primaryGoal = formData.get('primaryGoal');

  // TODO: Save primary goal to database
  // TODO: Queue analysis job

  console.log('Starting analysis with goal:', primaryGoal);

  // Redirect to dashboard with analysis in progress
  return redirect('/app');
};

export default function StartAnalysis() {
  const { shop } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [selectedGoal, setSelectedGoal] = useState(shop.primaryGoal || '');

  const goalOptions = [
    { label: 'Select your primary goal...', value: '' },
    { label: 'Increase overall conversion rate', value: 'increase_conversion' },
    { label: 'Reduce cart abandonment', value: 'reduce_abandonment' },
    { label: 'Increase average order value', value: 'increase_aov' },
    { label: 'Improve product page conversion', value: 'improve_pdp' },
    { label: 'Boost mobile conversion', value: 'boost_mobile' },
  ];

  return (
    <Page
      title="Start Analysis"
      backAction={{ url: '/app' }}
    >
      <Card>
        <div style={{ padding: '20px' }}>
          <Text as="h2" variant="headingMd">
            🎯 What's your primary goal?
          </Text>
          <Text as="p" variant="bodyMd" color="subdued">
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button submit primary loading={isSubmitting} disabled={!selectedGoal}>
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
              <li><Text as="span" variant="bodyMd">We'll analyze your store data (analytics, products, theme)</Text></li>
              <li><Text as="span" variant="bodyMd">Capture screenshots of key pages</Text></li>
              <li><Text as="span" variant="bodyMd">Compare with industry benchmarks</Text></li>
              <li><Text as="span" variant="bodyMd">Generate 10-15 prioritized recommendations</Text></li>
            </ul>
            <Text as="p" variant="bodySm" color="subdued">
              This process takes 60-90 seconds. You'll receive an email when it's complete.
            </Text>
          </div>
        </div>
      </Card>
    </Page>
  );
}
