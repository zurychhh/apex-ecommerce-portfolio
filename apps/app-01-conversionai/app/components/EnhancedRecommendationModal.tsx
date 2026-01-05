/**
 * Enhanced Recommendation Modal
 * Full-featured modal with syntax highlighting, impact visualization, and implementation guide
 */

import {
  Modal,
  Text,
  Badge,
  BlockStack,
  InlineStack,
  Box,
  Divider,
  ProgressBar,
  Banner,
  Button,
} from '@shopify/polaris';
import { CodeSnippet } from './CodeSnippet';
import type { Recommendation } from '../types/recommendation.types';
import {
  getEffortLevel,
  getImpactStars,
  getCategoryInfo,
  parseImplementationSteps,
  extractConfidence,
  extractBenchmark,
  cleanReasoning,
  getTestingChecklist,
  getCommonPitfalls,
  getHelpfulResources,
} from '../utils/recommendation-helpers';

interface EnhancedRecommendationModalProps {
  recommendation: Recommendation | null;
  open: boolean;
  onClose: () => void;
  onImplement?: (id: string) => void;
  onSkip?: (id: string) => void;
  onReset?: (id: string) => void;
  loading?: boolean;
}

export function EnhancedRecommendationModal({
  recommendation,
  open,
  onClose,
  onImplement,
  onSkip,
  onReset,
  loading = false,
}: EnhancedRecommendationModalProps) {
  if (!recommendation) return null;

  const effort = getEffortLevel(recommendation.effortScore);
  const categoryInfo = getCategoryInfo(recommendation.category);
  const implementationSteps = parseImplementationSteps(recommendation.implementation);
  const confidence = extractConfidence(recommendation.reasoning);
  const benchmark = extractBenchmark(recommendation.reasoning);
  const cleanedReasoning = cleanReasoning(recommendation.reasoning);

  // Parse estimated uplift for progress bar (e.g., "+0.3%" -> 0.3)
  const upliftMatch = recommendation.estimatedUplift.match(/([\d.]+)%?/);
  const upliftPercent = upliftMatch ? parseFloat(upliftMatch[1]) : 0;
  // Normalize to 0-100 scale (assuming max 5% uplift)
  const upliftProgress = Math.min((upliftPercent / 5) * 100, 100);

  const handleImplement = () => {
    if (onImplement && recommendation) {
      onImplement(recommendation.id);
    }
  };

  const handleSkip = () => {
    if (onSkip && recommendation) {
      onSkip(recommendation.id);
    }
  };

  const handleReset = () => {
    if (onReset && recommendation) {
      onReset(recommendation.id);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recommendation.title}
      size="large"
      primaryAction={
        recommendation.status !== 'implemented'
          ? {
              content: 'Mark as Implemented',
              onAction: handleImplement,
              loading,
            }
          : undefined
      }
      secondaryActions={[
        ...(recommendation.status === 'pending'
          ? [{ content: 'Skip This', onAction: handleSkip, loading }]
          : []),
        ...(recommendation.status !== 'pending'
          ? [{ content: 'Reset to Pending', onAction: handleReset, loading }]
          : []),
        { content: 'Close', onAction: onClose },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {/* Status Banner */}
          {recommendation.status === 'implemented' && (
            <Banner tone="success">
              You implemented this recommendation
              {recommendation.implementedAt &&
                ` on ${new Date(recommendation.implementedAt).toLocaleDateString()}`}
              .
            </Banner>
          )}

          {recommendation.status === 'skipped' && (
            <Banner tone="warning">
              You skipped this recommendation. Reset to pending if you change your mind.
            </Banner>
          )}

          {/* Badges Row */}
          <InlineStack gap="200" wrap>
            <span className="brand-badge-blue">
              <Badge>{categoryInfo.label}</Badge>
            </span>
            <Badge tone={effort.color}>{effort.text}</Badge>
            <span className={
              recommendation.status === 'implemented'
                ? 'brand-badge-green'
                : recommendation.status === 'skipped'
                ? 'brand-badge-gray'
                : 'brand-badge-amber'
            }>
              <Badge>{recommendation.status}</Badge>
            </span>
            {confidence && (
              <span className="brand-badge-blue">
                <Badge>{confidence}% confidence</Badge>
              </span>
            )}
          </InlineStack>

          {/* Metrics Grid */}
          <Box
            background="bg-surface-secondary"
            padding="400"
            borderRadius="200"
          >
            <InlineStack gap="800" wrap>
              {/* Impact Score */}
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Impact Score
                </Text>
                <Text as="p" variant="headingLg">
                  <span style={{ color: '#008060' }}>
                    {getImpactStars(recommendation.impactScore)}
                  </span>
                  <span style={{ marginLeft: '8px', fontSize: '0.7em', color: '#637381' }}>
                    ({recommendation.impactScore}/5)
                  </span>
                </Text>
              </BlockStack>

              {/* Effort Level */}
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Effort Required
                </Text>
                <InlineStack gap="200" blockAlign="center">
                  <Badge tone={effort.color}>{effort.text}</Badge>
                  <Text as="span" variant="bodyMd">
                    {effort.time}
                  </Text>
                </InlineStack>
              </BlockStack>

              {/* Estimated Uplift */}
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Estimated Uplift
                </Text>
                <BlockStack gap="100">
                  <Text as="p" variant="headingMd" fontWeight="bold">
                    {recommendation.estimatedUplift}
                  </Text>
                  <div style={{ width: '100px' }}>
                    <ProgressBar
                      progress={upliftProgress}
                      tone="primary"
                      size="small"
                    />
                  </div>
                </BlockStack>
              </BlockStack>

              {/* Estimated ROI */}
              <BlockStack gap="100">
                <Text as="p" variant="bodySm" tone="subdued">
                  Estimated ROI
                </Text>
                <Text as="p" variant="headingMd" fontWeight="bold" tone="success">
                  {recommendation.estimatedROI}
                </Text>
              </BlockStack>
            </InlineStack>
          </Box>

          <Divider />

          {/* Description */}
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              🎯 What to Do
            </Text>
            <Text as="p" variant="bodyMd">
              {recommendation.description}
            </Text>
          </BlockStack>

          {/* Why This Matters */}
          {cleanedReasoning && (
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                🧠 Why This Matters
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                {cleanedReasoning}
              </Text>
              {benchmark && (
                <Box paddingBlockStart="100">
                  <InlineStack gap="100">
                    <Badge tone="info">Benchmark</Badge>
                    <Text as="span" variant="bodySm">
                      {benchmark}
                    </Text>
                  </InlineStack>
                </Box>
              )}
            </BlockStack>
          )}

          <Divider />

          {/* Implementation Steps */}
          {implementationSteps.length > 0 && (
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                🛠️ Implementation Steps ({implementationSteps.length} steps)
              </Text>
              <BlockStack gap="200">
                {implementationSteps.map((step, index) => (
                  <InlineStack key={index} gap="200" blockAlign="start" wrap={false}>
                    <Box
                      background="bg-fill-info"
                      borderRadius="full"
                      minWidth="24px"
                      minHeight="24px"
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </div>
                    </Box>
                    <Text as="p" variant="bodyMd">
                      {step}
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </BlockStack>
          )}

          {/* Code Snippet */}
          {recommendation.codeSnippet && (
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                💻 Complete Code
              </Text>
              <CodeSnippet
                code={recommendation.codeSnippet}
                showLineNumbers
                showCopyButton
                showLanguageBadge
                theme="dark"
                maxHeight="300px"
              />
            </BlockStack>
          )}

          <Divider />

          {/* Testing Checklist */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              ✅ Testing Checklist
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Before going live, verify:
            </Text>
            <Box
              background="bg-surface-secondary"
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="200">
                {getTestingChecklist(recommendation.category).map((item, index) => (
                  <InlineStack key={index} gap="200" blockAlign="start" wrap={false}>
                    <input
                      type="checkbox"
                      id={`test-${index}`}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#008060',
                      }}
                    />
                    <label
                      htmlFor={`test-${index}`}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <Text as="span" variant="bodyMd">
                        {item}
                      </Text>
                    </label>
                  </InlineStack>
                ))}
              </BlockStack>
            </Box>
          </BlockStack>

          <Divider />

          {/* Common Pitfalls */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              ⚠️ Common Pitfalls
            </Text>
            <Box
              background="bg-surface-caution"
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="200">
                {getCommonPitfalls(recommendation.category).map((pitfall, index) => (
                  <InlineStack key={index} gap="200" blockAlign="start" wrap={false}>
                    <Text as="span" variant="bodyMd">⚠️</Text>
                    <Text as="p" variant="bodyMd">
                      {pitfall}
                    </Text>
                  </InlineStack>
                ))}
              </BlockStack>
            </Box>
          </BlockStack>

          <Divider />

          {/* Helpful Resources */}
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              📚 Helpful Resources
            </Text>
            <BlockStack gap="200">
              {getHelpfulResources(recommendation.category).map((resource, index) => (
                <Box
                  key={index}
                  background="bg-surface-secondary"
                  padding="300"
                  borderRadius="200"
                >
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Text as="span" variant="bodyMd">
                      {resource.type === 'doc' && '📖'}
                      {resource.type === 'video' && '🎥'}
                      {resource.type === 'research' && '📊'}
                    </Text>
                    <Text as="span" variant="bodyMd" fontWeight="medium">
                      {resource.title}
                    </Text>
                    <Text as="span" variant="bodySm" tone="subdued">
                      ↗
                    </Text>
                  </a>
                </Box>
              ))}
            </BlockStack>
          </BlockStack>

          <Divider />

          {/* Priority indicator */}
          <Box paddingBlockStart="200">
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodySm" tone="subdued">
                Priority:
              </Text>
              <Badge tone={recommendation.priority >= 8 ? 'critical' : recommendation.priority >= 5 ? 'warning' : 'info'}>
                #{recommendation.priority}
              </Badge>
              <Text as="span" variant="bodySm" tone="subdued">
                {recommendation.priority >= 8
                  ? 'High Priority - Do First'
                  : recommendation.priority >= 5
                  ? 'Medium Priority'
                  : 'Lower Priority'}
              </Text>
            </InlineStack>
          </Box>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export default EnhancedRecommendationModal;
