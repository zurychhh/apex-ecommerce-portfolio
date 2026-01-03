/**
 * Debug page to test analysis components
 * /app/debug - Shows diagnostic information
 * /app/debug?reset=true - Reset monthly analysis count
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { Page, Card, Text, BlockStack, Banner, Box, Button } from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { fetchShopifyAnalytics, fetchProducts, fetchCurrentTheme } from '../utils/shopify.server';
import { callClaudeAPI, buildAnalysisPrompt, parseRecommendations } from '../utils/claude.server';
import { logger } from '../utils/logger.server';

// Action to reset monthly analysis count
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  // Reset lastAnalysis to null (allows new analysis)
  await prisma.shop.update({
    where: { domain: session.shop },
    data: { lastAnalysis: null },
  });

  // Also clear old recommendations
  await prisma.recommendation.deleteMany({
    where: { shop: { domain: session.shop } },
  });

  return json({ reset: true });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    // Step 1: Authenticate
    const { session } = await authenticate.admin(request);
    results.steps.push({ step: 'authenticate', status: 'success', shop: session.shop });

    // Check for reset parameter
    const url = new URL(request.url);
    if (url.searchParams.get('reset') === 'true') {
      await prisma.shop.update({
        where: { domain: session.shop },
        data: { lastAnalysis: null },
      });
      await prisma.recommendation.deleteMany({
        where: { shop: { domain: session.shop } },
      });
      results.reset = 'Analysis count reset! You can now run a new analysis.';
    }

    // Step 2: Get shop from DB
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });
    results.steps.push({ 
      step: 'getShop', 
      status: shop ? 'success' : 'failed',
      hasAccessToken: !!shop?.accessToken,
      shopId: shop?.id?.substring(0, 20) + '...',
    });

    if (!shop) {
      results.error = 'Shop not found in database';
      return json({ results });
    }

    // Step 3: Fetch analytics
    try {
      const analytics = await fetchShopifyAnalytics(shop);
      results.steps.push({ 
        step: 'fetchAnalytics', 
        status: 'success',
        data: {
          conversionRate: analytics.conversionRate,
          totalOrders: analytics.totalOrders,
          totalRevenue: analytics.totalRevenue,
        }
      });
    } catch (e: any) {
      results.steps.push({ step: 'fetchAnalytics', status: 'failed', error: e.message });
    }

    // Step 4: Fetch products
    try {
      const products = await fetchProducts(shop, 5);
      results.steps.push({ 
        step: 'fetchProducts', 
        status: 'success',
        productCount: products.length,
        firstProduct: products[0]?.title || 'none',
      });
    } catch (e: any) {
      results.steps.push({ step: 'fetchProducts', status: 'failed', error: e.message });
    }

    // Step 5: Fetch theme
    try {
      const theme = await fetchCurrentTheme(shop);
      results.steps.push({ 
        step: 'fetchTheme', 
        status: 'success',
        themeName: theme.name,
      });
    } catch (e: any) {
      results.steps.push({ step: 'fetchTheme', status: 'failed', error: e.message });
    }

    // Step 6: Test Claude API (simple test)
    try {
      const testPrompt = 'Return exactly this JSON: {"test": "success", "recommendations": [{"title": "Test Rec", "category": "test", "description": "Test desc", "impactScore": 5, "effortScore": 1, "estimatedUplift": "+1%", "estimatedROI": "+$100", "reasoning": "test", "implementation": "test"}]}';
      const response = await callClaudeAPI(testPrompt, []);
      results.steps.push({ 
        step: 'testClaude', 
        status: 'success',
        responsePreview: response.substring(0, 300),
      });
    } catch (e: any) {
      results.steps.push({ step: 'testClaude', status: 'failed', error: e.message });
    }

    results.success = results.steps.every((s: any) => s.status === 'success');

  } catch (error: any) {
    results.error = error.message;
  }

  return json({ results });
}

export default function DebugPage() {
  const { results } = useLoaderData<typeof loader>();

  return (
    <Page title="Debug Diagnostics" backAction={{ url: '/app' }}>
      <BlockStack gap="400">
        {results.reset && (
          <Banner tone="success">
            <p>{results.reset}</p>
          </Banner>
        )}

        {results.error && (
          <Banner tone="critical">
            <p>Error: {results.error}</p>
          </Banner>
        )}

        {results.success && (
          <Banner tone="success">
            <p>All diagnostics passed!</p>
          </Banner>
        )}

        <Card>
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Actions</Text>
              <Form method="get">
                <input type="hidden" name="reset" value="true" />
                <Button submit variant="primary" tone="critical">Reset Monthly Analysis Count</Button>
              </Form>
            </BlockStack>
          </Box>
        </Card>

        <Card>
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Diagnostic Steps</Text>
              {results.steps?.map((step: any, i: number) => (
                <Box key={i} padding="200" background={step.status === 'success' ? 'bg-surface-success' : 'bg-surface-critical'}>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      {step.status === 'success' ? '✅' : '❌'} {step.step}
                    </Text>
                    {step.error && <Text as="p" variant="bodySm" tone="critical">{step.error}</Text>}
                    {step.data && <Text as="p" variant="bodySm">{JSON.stringify(step.data)}</Text>}
                    {step.shop && <Text as="p" variant="bodySm">Shop: {step.shop}</Text>}
                    {step.hasAccessToken !== undefined && <Text as="p" variant="bodySm">Has token: {step.hasAccessToken ? 'yes' : 'no'}</Text>}
                    {step.productCount !== undefined && <Text as="p" variant="bodySm">Products: {step.productCount}</Text>}
                    {step.themeName && <Text as="p" variant="bodySm">Theme: {step.themeName}</Text>}
                    {step.responsePreview && <Text as="p" variant="bodySm">Response: {step.responsePreview}</Text>}
                  </BlockStack>
                </Box>
              ))}
            </BlockStack>
          </Box>
        </Card>

        <Card>
          <Box padding="400">
            <Text as="h2" variant="headingMd">Raw Results</Text>
            <pre style={{ fontSize: '11px', overflow: 'auto', maxHeight: '300px' }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}
