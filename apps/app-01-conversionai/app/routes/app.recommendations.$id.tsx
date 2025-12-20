import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import {
  Page,
  Card,
  Text,
  Button,
  Badge,
  BlockStack,
  InlineStack,
  Box,
  Divider,
  Banner,
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { logger } from '../utils/logger.server';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;

  if (!id) {
    throw new Response('Not Found', { status: 404 });
  }

  const recommendation = await prisma.recommendation.findUnique({
    where: { id },
    include: {
      shop: {
        select: { domain: true },
      },
    },
  });

  if (!recommendation) {
    throw new Response('Recommendation not found', { status: 404 });
  }

  // Verify the recommendation belongs to the current shop
  if (recommendation.shop.domain !== session.shop) {
    throw new Response('Unauthorized', { status: 403 });
  }

  return json({
    recommendation: {
      id: recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      category: recommendation.category,
      impactScore: recommendation.impactScore,
      effortScore: recommendation.effortScore,
      priority: recommendation.priority,
      estimatedUplift: recommendation.estimatedUplift,
      estimatedROI: recommendation.estimatedROI,
      reasoning: recommendation.reasoning,
      implementation: recommendation.implementation,
      codeSnippet: recommendation.codeSnippet,
      mockupUrl: recommendation.mockupUrl,
      status: recommendation.status,
      implementedAt: recommendation.implementedAt?.toISOString() || null,
      createdAt: recommendation.createdAt.toISOString(),
    },
  });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  const formData = await request.formData();
  const action = formData.get('action') as string;

  if (!id) {
    return json({ error: 'Missing recommendation ID' }, { status: 400 });
  }

  try {
    // Verify ownership
    const recommendation = await prisma.recommendation.findUnique({
      where: { id },
      include: { shop: { select: { domain: true } } },
    });

    if (!recommendation || recommendation.shop.domain !== session.shop) {
      return json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'implement') {
      await prisma.recommendation.update({
        where: { id },
        data: {
          status: 'implemented',
          implementedAt: new Date(),
        },
      });
      logger.info(`Recommendation ${id} marked as implemented`);
    } else if (action === 'skip') {
      await prisma.recommendation.update({
        where: { id },
        data: { status: 'skipped' },
      });
      logger.info(`Recommendation ${id} marked as skipped`);
    } else if (action === 'pending') {
      await prisma.recommendation.update({
        where: { id },
        data: {
          status: 'pending',
          implementedAt: null,
        },
      });
      logger.info(`Recommendation ${id} reset to pending`);
    } else if (action === 'rate') {
      const rating = parseInt(formData.get('rating') as string);
      if (rating >= 1 && rating <= 5) {
        await prisma.recommendation.update({
          where: { id },
          data: { userRating: rating },
        });
        logger.info(`Recommendation ${id} rated ${rating}/5`);
      }
    }

    return json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update recommendation:', error);
    return json({ error: 'Failed to update' }, { status: 500 });
  }
};

export default function RecommendationDetail() {
  const { recommendation } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const getImpactStars = (score: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < score ? '★' : '☆');
    }
    return stars.join('');
  };

  const getEffortLevel = (score: number) => {
    if (score <= 2) return { text: 'Easy', time: '~10-15 minutes', color: 'success' as const };
    if (score <= 3) return { text: 'Medium', time: '~20-30 minutes', color: 'warning' as const };
    return { text: 'Complex', time: '~45-60 minutes', color: 'critical' as const };
  };

  const effort = getEffortLevel(recommendation.effortScore);

  const handleAction = (action: string) => {
    fetcher.submit({ action }, { method: 'post' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Page
      title={recommendation.title}
      backAction={{ url: '/app/recommendations' }}
    >
      <BlockStack gap="400">
        {recommendation.status === 'implemented' && (
          <Banner tone="success">
            You implemented this recommendation
            {recommendation.implementedAt && ` on ${new Date(recommendation.implementedAt).toLocaleDateString()}`}.
          </Banner>
        )}

        {recommendation.status === 'skipped' && (
          <Banner tone="warning">
            You skipped this recommendation. You can reset it to pending if you change your mind.
          </Banner>
        )}

        {/* Impact & Metrics Card */}
        <Card>
          <Box padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Impact & Effort</Text>

              <InlineStack gap="800" wrap>
                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Impact Score</Text>
                  <Text as="p" variant="headingLg">
                    <span style={{ color: '#008060' }}>{getImpactStars(recommendation.impactScore)}</span>
                    <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#637381' }}>
                      ({recommendation.impactScore}/5)
                    </span>
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Effort Level</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone={effort.color}>{effort.text}</Badge>
                    <Text as="span" variant="bodyMd">{effort.time}</Text>
                  </InlineStack>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Estimated Impact</Text>
                  <Text as="p" variant="headingMd" fontWeight="bold">
                    {recommendation.estimatedUplift}
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodySm" tone="subdued">Estimated ROI</Text>
                  <Text as="p" variant="headingMd" fontWeight="bold" tone="success">
                    {recommendation.estimatedROI}
                  </Text>
                </BlockStack>
              </InlineStack>

              <InlineStack gap="200">
                <Badge>{recommendation.category.replace(/_/g, ' ')}</Badge>
                <Badge tone={recommendation.status === 'implemented' ? 'success' : recommendation.status === 'skipped' ? undefined : 'attention'}>
                  {recommendation.status}
                </Badge>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>

        {/* Why This Matters */}
        <Card>
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Why This Matters</Text>
              <Text as="p" variant="bodyMd">
                {recommendation.description}
              </Text>
              {recommendation.reasoning && (
                <Box paddingBlockStart="200">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {recommendation.reasoning}
                  </Text>
                </Box>
              )}
            </BlockStack>
          </Box>
        </Card>

        {/* Implementation Guide */}
        <Card>
          <Box padding="400">
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Implementation Guide</Text>

              {recommendation.implementation && (
                <Box
                  background="bg-surface-secondary"
                  padding="400"
                  borderRadius="200"
                >
                  <Text as="p" variant="bodyMd">
                    {recommendation.implementation.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </Text>
                </Box>
              )}

              {recommendation.codeSnippet && (
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text as="h3" variant="headingSm">Code Snippet</Text>
                    <Button
                      size="slim"
                      onClick={() => copyToClipboard(recommendation.codeSnippet!)}
                    >
                      Copy Code
                    </Button>
                  </InlineStack>

                  <Box
                    background="bg-surface-secondary"
                    padding="400"
                    borderRadius="200"
                  >
                    <pre style={{
                      margin: 0,
                      fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowX: 'auto',
                    }}>
                      {recommendation.codeSnippet}
                    </pre>
                  </Box>
                </BlockStack>
              )}
            </BlockStack>
          </Box>
        </Card>

        {/* Actions Card */}
        <Card>
          <Box padding="400">
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">Actions</Text>

              <InlineStack gap="200">
                {recommendation.status !== 'implemented' && (
                  <Button
                    variant="primary"
                    onClick={() => handleAction('implement')}
                    loading={fetcher.state === 'submitting'}
                  >
                    Mark as Implemented
                  </Button>
                )}

                {recommendation.status === 'pending' && (
                  <Button
                    onClick={() => handleAction('skip')}
                    loading={fetcher.state === 'submitting'}
                  >
                    Skip This
                  </Button>
                )}

                {recommendation.status !== 'pending' && (
                  <Button
                    onClick={() => handleAction('pending')}
                    loading={fetcher.state === 'submitting'}
                  >
                    Reset to Pending
                  </Button>
                )}

                <Button url="/app/recommendations">
                  Back to List
                </Button>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}
