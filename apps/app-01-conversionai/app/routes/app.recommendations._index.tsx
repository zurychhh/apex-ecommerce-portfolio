import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import {
  Page,
  Card,
  Text,
  Badge,
  Button,
  Select,
  EmptyState,
  BlockStack,
  InlineStack,
  Box,
} from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { logger } from '../utils/logger.server';
import { EnhancedRecommendationModal } from '../components/EnhancedRecommendationModal';
import type { Recommendation } from '../types/recommendation.types';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
    include: {
      recommendations: {
        orderBy: [
          { priority: 'desc' },
          { impactScore: 'desc' },
          { effortScore: 'asc' },
        ],
      },
    },
  });

  if (!shop) {
    return json({
      recommendations: [],
      shopDomain: session.shop,
    });
  }

  // Return full recommendation data for modal display
  return json({
    recommendations: shop.recommendations.map(rec => ({
      id: rec.id,
      title: rec.title,
      description: rec.description,
      category: rec.category,
      impactScore: rec.impactScore,
      effortScore: rec.effortScore,
      priority: rec.priority,
      estimatedUplift: rec.estimatedUplift,
      estimatedROI: rec.estimatedROI,
      reasoning: rec.reasoning,
      implementation: rec.implementation,
      codeSnippet: rec.codeSnippet,
      mockupUrl: rec.mockupUrl,
      status: rec.status as 'pending' | 'implemented' | 'skipped',
      implementedAt: rec.implementedAt?.toISOString() || null,
      createdAt: rec.createdAt.toISOString(),
    })),
    shopDomain: session.shop,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const action = formData.get('action') as string;
  const recommendationId = formData.get('recommendationId') as string;

  if (!recommendationId) {
    return json({ error: 'Missing recommendation ID' }, { status: 400 });
  }

  try {
    if (action === 'implement') {
      await prisma.recommendation.update({
        where: { id: recommendationId },
        data: {
          status: 'implemented',
          implementedAt: new Date(),
        },
      });
      logger.info(`Recommendation ${recommendationId} marked as implemented`);
    } else if (action === 'skip') {
      await prisma.recommendation.update({
        where: { id: recommendationId },
        data: { status: 'skipped' },
      });
      logger.info(`Recommendation ${recommendationId} marked as skipped`);
    } else if (action === 'pending') {
      await prisma.recommendation.update({
        where: { id: recommendationId },
        data: {
          status: 'pending',
          implementedAt: null,
        },
      });
      logger.info(`Recommendation ${recommendationId} reset to pending`);
    }

    return json({ success: true });
  } catch (error: any) {
    logger.error('Failed to update recommendation:', error);
    return json({ error: 'Failed to update' }, { status: 500 });
  }
};

export default function RecommendationsIndex() {
  const { recommendations } = useLoaderData<typeof loader>();
  const [sortBy, setSortBy] = useState('priority');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const fetcher = useFetcher();

  // Modal state
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sortOptions = [
    { label: 'Priority (Quick Wins First)', value: 'priority' },
    { label: 'Impact (High to Low)', value: 'impact' },
    { label: 'Effort (Low to High)', value: 'effort' },
    { label: 'Recent', value: 'recent' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Hero Section', value: 'hero_section' },
    { label: 'Product Page', value: 'product_page' },
    { label: 'Cart Page', value: 'cart_page' },
    { label: 'Checkout', value: 'checkout' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Trust Building', value: 'trust_building' },
    { label: 'Social Proof', value: 'social_proof' },
    { label: 'Urgency', value: 'urgency' },
    { label: 'Pricing', value: 'pricing' },
    { label: 'Navigation', value: 'navigation' },
    { label: 'General', value: 'general' },
  ];

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Implemented', value: 'implemented' },
    { label: 'Skipped', value: 'skipped' },
  ];

  // Filter and sort recommendations
  let filteredRecs = [...recommendations];

  if (filterCategory !== 'all') {
    filteredRecs = filteredRecs.filter(r => r.category.toLowerCase() === filterCategory);
  }

  if (filterStatus !== 'all') {
    filteredRecs = filteredRecs.filter(r => r.status === filterStatus);
  }

  // Sort
  filteredRecs.sort((a, b) => {
    switch (sortBy) {
      case 'impact':
        return b.impactScore - a.impactScore;
      case 'effort':
        return a.effortScore - b.effortScore;
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
      default:
        return b.priority - a.priority;
    }
  });

  const getImpactBadge = (score: number) => {
    if (score >= 4) return <Badge tone="success">High Impact</Badge>;
    if (score >= 3) return <Badge tone="info">Medium Impact</Badge>;
    return <Badge>Low Impact</Badge>;
  };

  const getEffortBadge = (score: number) => {
    if (score <= 2) return <Badge tone="success">Easy</Badge>;
    if (score <= 3) return <Badge tone="warning">Medium</Badge>;
    return <Badge tone="critical">Complex</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge tone="success">Implemented</Badge>;
      case 'skipped':
        return <Badge>Skipped</Badge>;
      default:
        return <Badge tone="attention">Pending</Badge>;
    }
  };

  // Open modal with selected recommendation
  const handleOpenModal = useCallback((rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    // Don't clear selection immediately to avoid flicker during close animation
    setTimeout(() => setSelectedRecommendation(null), 300);
  }, []);

  // Handle status changes from both list and modal
  const handleStatusChange = useCallback((recommendationId: string, action: string) => {
    fetcher.submit(
      { action, recommendationId },
      { method: 'post' }
    );
  }, [fetcher]);

  // Update selected recommendation when data changes (after status update)
  useEffect(() => {
    if (selectedRecommendation && fetcher.state === 'idle') {
      const updated = recommendations.find(r => r.id === selectedRecommendation.id);
      if (updated) {
        setSelectedRecommendation(updated);
      }
    }
  }, [recommendations, selectedRecommendation, fetcher.state]);

  const pendingCount = recommendations.filter(r => r.status === 'pending').length;
  const implementedCount = recommendations.filter(r => r.status === 'implemented').length;

  if (recommendations.length === 0) {
    return (
      <Page
        title="Recommendations"
        backAction={{ url: '/app' }}
      >
        <Card>
          <EmptyState
            heading="No recommendations yet"
            action={{ content: 'Start Analysis', url: '/app/analysis/start' }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Run an AI analysis to get personalized CRO recommendations for your store.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Recommendations"
      subtitle={`${pendingCount} pending · ${implementedCount} implemented · ${recommendations.length} total`}
      backAction={{ url: '/app' }}
      primaryAction={{ content: 'Refresh Analysis', url: '/app/analysis/start' }}
    >
      <BlockStack gap="400">
        <Card>
          <Box padding="400">
            <InlineStack gap="400" wrap={false}>
              <div style={{ flex: 1 }}>
                <Select
                  label="Sort by"
                  labelHidden
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="Category"
                  labelHidden
                  options={categoryOptions}
                  value={filterCategory}
                  onChange={setFilterCategory}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="Status"
                  labelHidden
                  options={statusOptions}
                  value={filterStatus}
                  onChange={setFilterStatus}
                />
              </div>
            </InlineStack>
          </Box>
        </Card>

        {filteredRecs.map((rec) => (
          <Card key={rec.id}>
            <Box padding="400">
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="start">
                  <BlockStack gap="200">
                    <InlineStack gap="200">
                      <Text as="h3" variant="headingMd">
                        {rec.title}
                      </Text>
                    </InlineStack>
                    <InlineStack gap="200">
                      <Badge>{rec.category.replace(/_/g, ' ')}</Badge>
                      {getImpactBadge(rec.impactScore)}
                      {getEffortBadge(rec.effortScore)}
                      {getStatusBadge(rec.status)}
                    </InlineStack>
                  </BlockStack>
                </InlineStack>

                <Text as="p" variant="bodyMd" tone="subdued">
                  {rec.description}
                </Text>

                <InlineStack gap="400">
                  <Text as="p" variant="bodyMd">
                    Est. Impact: <strong>{rec.estimatedUplift}</strong>
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Est. ROI: <strong>{rec.estimatedROI}</strong>
                  </Text>
                </InlineStack>

                <InlineStack gap="200">
                  <Button onClick={() => handleOpenModal(rec)} variant="primary">
                    View Details
                  </Button>
                  {rec.status !== 'implemented' && (
                    <Button
                      onClick={() => handleStatusChange(rec.id, 'implement')}
                      loading={fetcher.state === 'submitting'}
                    >
                      Mark Implemented
                    </Button>
                  )}
                  {rec.status === 'pending' && (
                    <Button
                      onClick={() => handleStatusChange(rec.id, 'skip')}
                      loading={fetcher.state === 'submitting'}
                    >
                      Skip
                    </Button>
                  )}
                  {rec.status !== 'pending' && (
                    <Button
                      onClick={() => handleStatusChange(rec.id, 'pending')}
                      loading={fetcher.state === 'submitting'}
                    >
                      Reset
                    </Button>
                  )}
                </InlineStack>
              </BlockStack>
            </Box>
          </Card>
        ))}

        {filteredRecs.length === 0 && recommendations.length > 0 && (
          <Card>
            <Box padding="400">
              <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                No recommendations match your filters. Try adjusting the category or status filter.
              </Text>
            </Box>
          </Card>
        )}
      </BlockStack>

      {/* Enhanced Recommendation Modal */}
      <EnhancedRecommendationModal
        recommendation={selectedRecommendation}
        open={modalOpen}
        onClose={handleCloseModal}
        onImplement={(id) => handleStatusChange(id, 'implement')}
        onSkip={(id) => handleStatusChange(id, 'skip')}
        onReset={(id) => handleStatusChange(id, 'pending')}
        loading={fetcher.state === 'submitting'}
      />
    </Page>
  );
}
