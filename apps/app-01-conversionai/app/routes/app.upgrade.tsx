/**
 * Upgrade/Pricing page
 * Shows available plans and allows merchants to upgrade
 */

import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Badge,
  BlockStack,
  InlineStack,
  Icon,
  Box,
  Divider,
} from '@shopify/polaris';
import { BrandedFooter } from '../components/BrandedFooter';
import { CheckIcon } from '@shopify/polaris-icons';
import { authenticate } from '../shopify.server';
import { prisma } from '../utils/db.server';
import { PLANS, checkActiveSubscription } from '../utils/billing.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
    select: { plan: true },
  });

  const subscriptions = await checkActiveSubscription(admin);
  const hasActiveSubscription = subscriptions.some(
    (sub: any) => sub.status === 'ACTIVE'
  );

  return json({
    currentPlan: shop?.plan || 'free',
    hasActiveSubscription,
    plans: Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      ...plan,
    })),
  });
};

export default function UpgradePage() {
  const { currentPlan, plans } = useLoaderData<typeof loader>();

  const formatFeature = (key: string, value: any): string => {
    switch (key) {
      case 'analysisPerMonth':
        return value >= 999 ? 'Unlimited AI analyses/month' : `${value} AI analyses/month`;
      case 'recommendations':
        return `Up to ${value} recommendations`;
      default:
        return null;
    }
  };

  return (
    <Page
      title="Choose Your Plan"
      backAction={{ url: '/app' }}
      subtitle="ConversionAI by ApexMind AI Labs | Unlock more features and grow your conversion rate"
    >
      <Layout>
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const isPopular = plan.id === 'pro';

          return (
            <Layout.Section key={plan.id} variant="oneThird">
              <Card>
                <Box padding="400">
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h2" variant="headingLg">
                        {plan.name}
                      </Text>
                      {isPopular && (
                        <span className="brand-badge-purple">
                          <Badge>Most Popular</Badge>
                        </span>
                      )}
                      {isCurrentPlan && <Badge>Current Plan</Badge>}
                    </InlineStack>

                    <BlockStack gap="200">
                      <InlineStack gap="100" blockAlign="end">
                        <Text as="span" variant="heading2xl">
                          ${plan.price}
                        </Text>
                        {plan.price > 0 && (
                          <Text as="span" variant="bodySm" tone="subdued">
                            /month
                          </Text>
                        )}
                      </InlineStack>

                      {plan.trialDays > 0 && (
                        <Text as="p" variant="bodySm" tone="success">
                          {plan.trialDays}-day free trial
                        </Text>
                      )}
                    </BlockStack>

                    <Divider />

                    <BlockStack gap="200">
                      {Object.entries(plan.features).map(([key, value]) => {
                        const featureText = formatFeature(key, value);
                        if (!featureText) return null;

                        return (
                          <InlineStack key={key} gap="200" blockAlign="center">
                            <Icon source={CheckIcon} tone="success" />
                            <Text as="span" variant="bodyMd">
                              {featureText}
                            </Text>
                          </InlineStack>
                        );
                      })}
                    </BlockStack>

                    <Box paddingBlockStart="400">
                      {isCurrentPlan ? (
                        <Button disabled fullWidth>
                          Current Plan
                        </Button>
                      ) : plan.price === 0 ? (
                        <Button fullWidth disabled>
                          Free Forever
                        </Button>
                      ) : (
                        <Form method="post" action="/api/billing/create">
                          <input type="hidden" name="plan" value={plan.id} />
                          <div className="brand-primary-button">
                            <Button
                              submit
                              variant="primary"
                              fullWidth
                            >
                              {currentPlan === 'free'
                                ? `Start ${plan.trialDays}-Day Trial`
                                : `Upgrade to ${plan.name}`}
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Box>
                  </BlockStack>
                </Box>
              </Card>
            </Layout.Section>
          );
        })}
      </Layout>

      <Box paddingBlockStart="800">
        <Card>
          <Box padding="400">
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                Frequently Asked Questions
              </Text>

              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Can I cancel anytime?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Yes! You can cancel your subscription at any time. You&apos;ll
                    continue to have access until the end of your billing period.
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    What happens after the trial?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    After your trial ends, you&apos;ll be charged the monthly rate
                    unless you cancel. You can downgrade to Free at any time.
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Do you offer refunds?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    We offer a 30-day money-back guarantee. If you&apos;re not
                    satisfied, contact support for a full refund.
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Box>
        </Card>
      </Box>

      <BrandedFooter />
    </Page>
  );
}
