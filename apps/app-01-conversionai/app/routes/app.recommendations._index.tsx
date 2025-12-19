import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Page, Card, Text, Badge, Button, Select } from '@shopify/polaris';
import { useState } from 'react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: Fetch recommendations from database

  return json({
    recommendations: [
      // Placeholder data
      {
        id: '1',
        title: 'Change Hero CTA from "Buy Now" to "Explore"',
        category: 'hero_section',
        impactScore: 5,
        effortScore: 2,
        estimatedUplift: '+0.4% CR',
        estimatedROI: '+$2,100/mo',
        status: 'pending',
      },
    ],
  });
};

export default function RecommendationsIndex() {
  const { recommendations } = useLoaderData<typeof loader>();
  const [sortBy, setSortBy] = useState('impact');

  const sortOptions = [
    { label: 'Impact (High to Low)', value: 'impact' },
    { label: 'Effort (Low to High)', value: 'effort' },
    { label: 'ROI (High to Low)', value: 'roi' },
    { label: 'Recent', value: 'recent' },
  ];

  const getImpactStars = (score: number) => '⭐'.repeat(score);
  const getEffortWrenches = (score: number) => '🔧'.repeat(score);

  return (
    <Page
      title="Recommendations"
      subtitle={`${recommendations.length} actionable insights to boost conversion`}
    >
      <div style={{ marginBottom: '20px' }}>
        <Select
          label="Sort by"
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Text as="h3" variant="headingMd">
                      {rec.title}
                    </Text>
                    <Badge status="info">{rec.category}</Badge>
                  </div>

                  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <Text as="p" variant="bodyMd">
                      Impact: {getImpactStars(rec.impactScore)} |
                      Effort: {getEffortWrenches(rec.effortScore)}
                    </Text>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <Text as="p" variant="bodyMd">
                      Est. Impact: <strong>{rec.estimatedUplift}</strong>
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Est. ROI: <strong>{rec.estimatedROI}</strong>
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <Button url={`/app/recommendations/${rec.id}`}>View Details</Button>
                <Button>Mark Implemented</Button>
                <Button>Skip</Button>
              </div>
            </div>
          </Card>
        ))}

        {recommendations.length === 0 && (
          <Card>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Text as="p" variant="bodyMd" color="subdued">
                No recommendations yet. Run an analysis to get started!
              </Text>
              <div style={{ marginTop: '16px' }}>
                <Button primary url="/app/analysis/start">
                  Start Analysis
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Page>
  );
}
