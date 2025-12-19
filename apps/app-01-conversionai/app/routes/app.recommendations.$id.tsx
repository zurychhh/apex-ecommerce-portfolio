import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Page, Card, Text, Button, Badge } from '@shopify/polaris';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // TODO: Fetch recommendation by ID from database
  const { id } = params;

  return json({
    recommendation: {
      id,
      title: 'Change Hero CTA from "Buy Now" to "Explore"',
      description: '82% of your homepage visitors are first-time. "Buy Now" is too aggressive - they need context.',
      category: 'hero_section',
      impactScore: 5,
      effortScore: 2,
      priority: 8,
      estimatedUplift: '+0.4% conversion rate',
      estimatedROI: '+$2,100/mo',
      reasoning: 'Analysis of your store shows that 82% of homepage visitors are first-time visitors. Your hero CTA currently says "Buy Now" which is too aggressive for cold traffic. Comparing to 4 out of 5 competitors in your niche, they use softer CTAs like "Shop Collection" or "Explore Products". This allows visitors to browse before committing to purchase.',
      implementation: '1. Open: Themes > Edit Code\n2. Find: sections/hero.liquid (line 42)\n3. Replace button text',
      codeSnippet: `<button class="hero-cta">
  {{ section.settings.button_text }}
</button>

<!-- Replace with: -->
<button class="hero-cta">
  Explore Collection
</button>`,
      mockupUrl: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  });
};

export default function RecommendationDetail() {
  const { recommendation } = useLoaderData<typeof loader>();

  const getImpactStars = (score: number) => '⭐'.repeat(score);
  const getEffortWrenches = (score: number) => '🔧'.repeat(score);

  return (
    <Page
      title={recommendation.title}
      backAction={{ url: '/app/recommendations' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Badge status="info">{recommendation.category}</Badge>
              <Badge>{recommendation.status}</Badge>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Text as="h3" variant="headingMd">📊 Impact & Effort</Text>
              <div style={{ marginTop: '12px' }}>
                <Text as="p" variant="bodyMd">
                  Impact: {getImpactStars(recommendation.impactScore)} ({recommendation.impactScore}/5)
                </Text>
                <Text as="p" variant="bodyMd">
                  Effort: {getEffortWrenches(recommendation.effortScore)} ({recommendation.effortScore}/5 - {recommendation.effortScore <= 2 ? 'Low' : recommendation.effortScore <= 3 ? 'Medium' : 'High'} - ~{recommendation.effortScore * 10} minutes)
                </Text>
                <Text as="p" variant="bodyMd">
                  💰 Est. ROI: <strong>{recommendation.estimatedROI}</strong>
                </Text>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Text as="h3" variant="headingMd">🤔 Why This Matters</Text>
              <Text as="p" variant="bodyMd" color="subdued">
                {recommendation.reasoning}
              </Text>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <Text as="h3" variant="headingMd">💻 Implementation</Text>
            <div style={{ marginTop: '12px', marginBottom: '12px' }}>
              <Text as="p" variant="bodyMd">
                {recommendation.implementation}
              </Text>
            </div>

            {recommendation.codeSnippet && (
              <div style={{ marginTop: '16px' }}>
                <Text as="h4" variant="headingSm">Code Snippet</Text>
                <div style={{
                  marginTop: '8px',
                  padding: '16px',
                  backgroundColor: '#f6f6f7',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto'
                }}>
                  {recommendation.codeSnippet}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Button onClick={() => navigator.clipboard.writeText(recommendation.codeSnippet)}>
                    Copy Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px', display: 'flex', gap: '12px' }}>
            <Button primary>Mark as Implemented</Button>
            <Button>Skip This</Button>
            <Button>Need Help</Button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
