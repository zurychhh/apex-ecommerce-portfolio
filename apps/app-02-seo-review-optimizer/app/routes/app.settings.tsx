import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  TextField,
  Select,
  Button,
  Banner,
} from "@shopify/polaris";
import { useState } from "react";
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
      shop: shop
        ? {
            brandVoice: shop.brandVoice || "professional",
            customInstructions: shop.customInstructions || "",
            email: shop.email || "",
          }
        : {
            brandVoice: "professional",
            customInstructions: "",
            email: "",
          },
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const brandVoice = formData.get("brandVoice") as string;
  const customInstructions = formData.get("customInstructions") as string;
  const email = formData.get("email") as string;

  const prisma = new PrismaClient();

  try {
    await prisma.shop.update({
      where: { domain: session.shop },
      data: {
        brandVoice,
        customInstructions,
        email,
        updatedAt: new Date(),
      },
    });

    return json({ success: true, message: "Settings saved successfully!" });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return json({ success: false, message: "Failed to save settings." });
  } finally {
    await prisma.$disconnect();
  }
};

export default function Settings() {
  const { shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [brandVoice, setBrandVoice] = useState(shop.brandVoice);
  const [customInstructions, setCustomInstructions] = useState(
    shop.customInstructions
  );
  const [email, setEmail] = useState(shop.email);

  const isSubmitting = navigation.state === "submitting";

  const brandVoiceOptions = [
    { label: "Professional", value: "professional" },
    { label: "Friendly", value: "friendly" },
    { label: "Apologetic", value: "apologetic" },
    { label: "Enthusiastic", value: "enthusiastic" },
    { label: "Formal", value: "formal" },
  ];

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner
              title="Settings saved"
              tone="success"
              onDismiss={() => {}}
            />
          )}

          {actionData?.success === false && (
            <Banner title="Error" tone="critical" onDismiss={() => {}}>
              <p>{actionData.message}</p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Form method="post">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Brand Voice
                  </Text>
                  <Text as="p" tone="subdued">
                    Choose the tone for your AI-generated responses. This affects
                    how responses are written.
                  </Text>

                  <Select
                    label="Response Tone"
                    name="brandVoice"
                    options={brandVoiceOptions}
                    value={brandVoice}
                    onChange={setBrandVoice}
                  />

                  <TextField
                    label="Custom Instructions"
                    name="customInstructions"
                    value={customInstructions}
                    onChange={setCustomInstructions}
                    multiline={4}
                    helpText="Add any specific instructions for the AI. For example: 'Always mention our 30-day return policy' or 'Sign off with -The [Store Name] Team'"
                    autoComplete="off"
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Notifications
                  </Text>

                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    helpText="We'll send you notifications about new reviews and usage limits"
                    autoComplete="email"
                  />
                </BlockStack>
              </Card>

              <Button submit variant="primary" loading={isSubmitting}>
                Save Settings
              </Button>
            </BlockStack>
          </Form>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Tips
              </Text>
              <BlockStack gap="200">
                <Text as="p" variant="bodySm">
                  <strong>Professional:</strong> Clear, business-like tone. Best
                  for B2B or premium brands.
                </Text>
                <Text as="p" variant="bodySm">
                  <strong>Friendly:</strong> Warm and approachable. Great for
                  lifestyle brands.
                </Text>
                <Text as="p" variant="bodySm">
                  <strong>Apologetic:</strong> Empathetic tone for addressing
                  complaints. Use for negative reviews.
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
