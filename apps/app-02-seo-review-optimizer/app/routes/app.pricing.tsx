import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Box,
  Divider,
  Icon,
} from "@shopify/polaris";
import { CheckIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const prisma = new PrismaClient();

  try {
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    return json({
      currentPlan: shop?.plan || "free",
    });
  } finally {
    await prisma.$disconnect();
  }
};

const plans = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    responses: 10,
    features: [
      "10 AI responses per month",
      "All sentiment types",
      "Basic brand voice",
      "Email support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Starter",
    id: "starter",
    price: "$19",
    period: "/month",
    description: "For growing stores",
    responses: 100,
    features: [
      "100 AI responses per month",
      "All sentiment types",
      "Custom brand voice",
      "Response templates",
      "Priority support",
    ],
    cta: "Upgrade to Starter",
    popular: true,
  },
  {
    name: "Growth",
    id: "growth",
    price: "$49",
    period: "/month",
    description: "For high-volume stores",
    responses: -1, // Unlimited
    features: [
      "Unlimited AI responses",
      "All sentiment types",
      "Custom brand voice",
      "Response templates",
      "Bulk actions",
      "Auto-publish (coming soon)",
      "Priority support",
    ],
    cta: "Upgrade to Growth",
  },
  {
    name: "Agency",
    id: "agency",
    price: "$149",
    period: "/month",
    description: "For agencies managing multiple stores",
    responses: -1,
    features: [
      "Everything in Growth",
      "Multi-store support",
      "Team access",
      "API access",
      "White-label option",
      "Dedicated support",
    ],
    cta: "Contact Sales",
  },
];

export default function Pricing() {
  const { currentPlan } = useLoaderData<typeof loader>();

  return (
    <Page title="Pricing">
      <BlockStack gap="500">
        <Text as="p" variant="bodyLg" tone="subdued">
          Choose the plan that's right for your business. All plans include a
          7-day free trial.
        </Text>

        <Layout>
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;

            return (
              <Layout.Section key={plan.id} variant="oneThird">
                <Card>
                  <BlockStack gap="400">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingLg">
                        {plan.name}
                      </Text>
                      {plan.popular && <Badge tone="success">Popular</Badge>}
                      {isCurrentPlan && <Badge tone="info">Current</Badge>}
                    </InlineStack>

                    <BlockStack gap="100">
                      <InlineStack gap="100" blockAlign="baseline">
                        <Text as="span" variant="heading2xl">
                          {plan.price}
                        </Text>
                        <Text as="span" tone="subdued">
                          {plan.period}
                        </Text>
                      </InlineStack>
                      <Text as="p" tone="subdued">
                        {plan.description}
                      </Text>
                    </BlockStack>

                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {plan.responses === -1
                        ? "Unlimited responses"
                        : `${plan.responses} responses/month`}
                    </Text>

                    <Divider />

                    <BlockStack gap="200">
                      {plan.features.map((feature, index) => (
                        <InlineStack key={index} gap="200" blockAlign="start">
                          <Box>
                            <Icon source={CheckIcon} tone="success" />
                          </Box>
                          <Text as="span" variant="bodySm">
                            {feature}
                          </Text>
                        </InlineStack>
                      ))}
                    </BlockStack>

                    <Box paddingBlockStart="200">
                      <Button
                        variant={plan.popular ? "primary" : "secondary"}
                        disabled={isCurrentPlan || plan.disabled}
                        fullWidth
                        url={
                          plan.id === "agency"
                            ? "mailto:rafal@oleksiakconsulting.com?subject=ReviewBoost Agency Plan"
                            : `/app/billing/create?plan=${plan.id}`
                        }
                      >
                        {isCurrentPlan ? "Current Plan" : plan.cta}
                      </Button>
                    </Box>
                  </BlockStack>
                </Card>
              </Layout.Section>
            );
          })}
        </Layout>

        <Card>
          <BlockStack gap="200">
            <Text as="h3" variant="headingMd">
              Questions?
            </Text>
            <Text as="p">
              Contact us at{" "}
              <a href="mailto:rafal@oleksiakconsulting.com">
                rafal@oleksiakconsulting.com
              </a>{" "}
              if you have any questions about pricing or need a custom plan.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
