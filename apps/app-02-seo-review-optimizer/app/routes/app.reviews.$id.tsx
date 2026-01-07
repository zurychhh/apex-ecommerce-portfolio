import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useFetcher, useNavigate } from "@remix-run/react";
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
  Select,
  TextField,
  Banner,
  Divider,
  Spinner,
} from "@shopify/polaris";
import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

// Type definitions for fetcher responses
interface GenerateFetcherData {
  responseBody?: string;
  tokensUsed?: number;
  error?: string;
  upgradeRequired?: boolean;
}

interface PublishFetcherData {
  success?: boolean;
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const reviewId = params.id;
  if (!reviewId) {
    throw new Response("Review ID required", { status: 400 });
  }

  const prisma = new PrismaClient();

  try {
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      throw new Response("Shop not found", { status: 404 });
    }

    const review = await prisma.review.findFirst({
      where: { id: reviewId, shopId: shop.id },
    });

    if (!review) {
      throw new Response("Review not found", { status: 404 });
    }

    return json({
      review: {
        id: review.id,
        productTitle: review.productTitle,
        productHandle: review.productHandle,
        rating: review.rating,
        title: review.title,
        body: review.body,
        reviewerName: review.reviewerName,
        sentiment: review.sentiment,
        responseStatus: review.responseStatus,
        generatedResponse: review.generatedResponse,
        editedResponse: review.editedResponse,
        publishedResponse: review.publishedResponse,
        publishedAt: review.publishedAt?.toISOString() || null,
        reviewCreatedAt: review.reviewCreatedAt.toISOString(),
      },
      shop: {
        responsesUsed: shop.responsesUsed,
        responsesLimit: shop.responsesLimit,
        brandVoice: shop.brandVoice,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Action for saving edited response
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const reviewId = params.id;
  if (!reviewId) {
    return json({ error: "Review ID required" }, { status: 400 });
  }

  const formData = await request.formData();
  const editedResponse = formData.get("editedResponse") as string;

  const prisma = new PrismaClient();

  try {
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      return json({ error: "Shop not found" }, { status: 404 });
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        editedResponse,
        responseStatus: "edited",
        updatedAt: new Date(),
      },
    });

    return json({ success: true, message: "Response saved" });
  } finally {
    await prisma.$disconnect();
  }
};

export default function ReviewDetail() {
  const { review, shop } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const generateFetcher = useFetcher<GenerateFetcherData>();
  const publishFetcher = useFetcher<PublishFetcherData>();

  const [tone, setTone] = useState("professional");
  const [editedResponse, setEditedResponse] = useState(
    review.editedResponse || review.generatedResponse || ""
  );

  const isGenerating = generateFetcher.state === "submitting";
  const isPublishing = publishFetcher.state === "submitting";

  // Update editedResponse when AI generates a new one
  useEffect(() => {
    if (generateFetcher.data?.responseBody) {
      setEditedResponse(generateFetcher.data.responseBody);
    }
  }, [generateFetcher.data]);

  const handleGenerate = () => {
    generateFetcher.submit(
      { tone },
      {
        method: "POST",
        action: `/api/reviews/${review.id}/generate`,
        encType: "application/json",
      }
    );
  };

  const handlePublish = () => {
    publishFetcher.submit(
      { responseBody: editedResponse },
      {
        method: "POST",
        action: `/api/reviews/${review.id}/publish`,
        encType: "application/json",
      }
    );
  };

  const getSentimentBadge = (sentiment: string) => {
    const toneMap: Record<string, "success" | "warning" | "critical"> = {
      positive: "success",
      neutral: "warning",
      negative: "critical",
    };
    return <Badge tone={toneMap[sentiment] || "info"}>{sentiment}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const toneMap: Record<string, "success" | "warning" | "attention" | "info"> = {
      pending: "attention",
      generated: "warning",
      edited: "warning",
      published: "success",
      skipped: "info",
    };
    return <Badge tone={toneMap[status] || "info"}>{status}</Badge>;
  };

  const canGenerate = shop.responsesUsed < shop.responsesLimit;
  const canPublish = editedResponse && review.responseStatus !== "published";

  return (
    <Page
      title={review.productTitle}
      backAction={{ content: "Reviews", onAction: () => navigate("/app/reviews") }}
      subtitle={`Review by ${review.reviewerName}`}
    >
      <Layout>
        {/* Error/Success Banners */}
        {generateFetcher.data?.error && (
          <Layout.Section>
            <Banner tone="critical" title="Generation Failed">
              <p>{generateFetcher.data.error}</p>
              {generateFetcher.data.upgradeRequired && (
                <Button url="/app/pricing">Upgrade Plan</Button>
              )}
            </Banner>
          </Layout.Section>
        )}

        {publishFetcher.data?.success && (
          <Layout.Section>
            <Banner tone="success" title="Published!">
              <p>Your response has been published successfully.</p>
            </Banner>
          </Layout.Section>
        )}

        {publishFetcher.data?.error && (
          <Layout.Section>
            <Banner tone="critical" title="Publish Failed">
              <p>{publishFetcher.data.error}</p>
            </Banner>
          </Layout.Section>
        )}

        {/* Review Details */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <InlineStack gap="200">
                  <Text as="span" variant="headingLg">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </Text>
                  {getSentimentBadge(review.sentiment)}
                </InlineStack>
                {getStatusBadge(review.responseStatus)}
              </InlineStack>

              {review.title && (
                <Text as="h3" variant="headingMd">
                  "{review.title}"
                </Text>
              )}

              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <Text as="p">{review.body}</Text>
              </Box>

              <Text as="p" tone="subdued" variant="bodySm">
                Posted on{" "}
                {new Date(review.reviewCreatedAt).toLocaleDateString()}
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Response Generator */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Generate Response
              </Text>

              <InlineStack gap="400" align="start">
                <div style={{ width: 200 }}>
                  <Select
                    label="Response Tone"
                    options={[
                      { label: "Professional", value: "professional" },
                      { label: "Friendly", value: "friendly" },
                      { label: "Apologetic", value: "apologetic" },
                    ]}
                    value={tone}
                    onChange={setTone}
                    disabled={isGenerating}
                  />
                </div>

                <div style={{ paddingTop: 24 }}>
                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                    loading={isGenerating}
                    disabled={!canGenerate || isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate with AI"}
                  </Button>
                </div>
              </InlineStack>

              {!canGenerate && (
                <Banner tone="warning">
                  <p>
                    You've used all {shop.responsesLimit} responses this month.{" "}
                    <a href="/app/pricing">Upgrade your plan</a> for more.
                  </p>
                </Banner>
              )}

              <Text as="p" tone="subdued" variant="bodySm">
                {shop.responsesUsed} / {shop.responsesLimit} responses used this
                month
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Response Editor */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Response
              </Text>

              {isGenerating ? (
                <Box padding="800">
                  <InlineStack align="center" gap="400">
                    <Spinner size="large" />
                    <Text as="p">Generating response...</Text>
                  </InlineStack>
                </Box>
              ) : (
                <TextField
                  label="Edit response before publishing"
                  value={editedResponse}
                  onChange={setEditedResponse}
                  multiline={6}
                  autoComplete="off"
                  helpText="You can edit this response before publishing to your store"
                />
              )}

              <Divider />

              <InlineStack gap="400">
                <Button
                  variant="primary"
                  tone="success"
                  onClick={handlePublish}
                  loading={isPublishing}
                  disabled={!canPublish || isPublishing}
                >
                  {isPublishing ? "Publishing..." : "Publish Response"}
                </Button>

                {review.responseStatus === "published" && (
                  <Text as="span" tone="success">
                    Published on{" "}
                    {review.publishedAt
                      ? new Date(review.publishedAt).toLocaleString()
                      : ""}
                  </Text>
                )}
              </InlineStack>

              {review.publishedResponse && (
                <Box
                  padding="400"
                  background="bg-surface-success"
                  borderRadius="200"
                >
                  <Text as="p" fontWeight="semibold">
                    Published Response:
                  </Text>
                  <Text as="p">{review.publishedResponse}</Text>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
