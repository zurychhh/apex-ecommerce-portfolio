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
  Filters,
  ChoiceList,
  DataTable,
  EmptyState,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const prisma = new PrismaClient();

  try {
    const shop = await prisma.shop.findUnique({
      where: { domain: session.shop },
    });

    if (!shop) {
      return json({ reviews: [], shop: null });
    }

    const reviews = await prisma.review.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
    });

    return json({
      reviews: reviews.map((r) => ({
        id: r.id,
        productTitle: r.productTitle,
        rating: r.rating,
        title: r.title,
        body: r.body.substring(0, 100) + (r.body.length > 100 ? "..." : ""),
        reviewerName: r.reviewerName,
        sentiment: r.sentiment,
        responseStatus: r.responseStatus,
        createdAt: r.createdAt.toISOString(),
      })),
      shop: {
        domain: shop.domain,
        lastSyncAt: shop.lastSyncAt?.toISOString() || null,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
};

export default function ReviewsIndex() {
  const { reviews, shop } = useLoaderData<typeof loader>();
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<string[]>([]);
  const [queryValue, setQueryValue] = useState("");

  const handleStatusChange = useCallback(
    (value: string[]) => setStatusFilter(value),
    []
  );

  const handleSentimentChange = useCallback(
    (value: string[]) => setSentimentFilter(value),
    []
  );

  const handleQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );

  const handleQueryClear = useCallback(() => setQueryValue(""), []);

  const handleClearAll = useCallback(() => {
    setStatusFilter([]);
    setSentimentFilter([]);
    setQueryValue("");
  }, []);

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(review.responseStatus);
    const matchesSentiment =
      sentimentFilter.length === 0 || sentimentFilter.includes(review.sentiment);
    const matchesQuery =
      queryValue === "" ||
      review.productTitle.toLowerCase().includes(queryValue.toLowerCase()) ||
      review.reviewerName.toLowerCase().includes(queryValue.toLowerCase()) ||
      review.body.toLowerCase().includes(queryValue.toLowerCase());
    return matchesStatus && matchesSentiment && matchesQuery;
  });

  const filters = [
    {
      key: "status",
      label: "Response Status",
      filter: (
        <ChoiceList
          title="Response Status"
          titleHidden
          choices={[
            { label: "Pending", value: "pending" },
            { label: "Generated", value: "generated" },
            { label: "Published", value: "published" },
            { label: "Skipped", value: "skipped" },
          ]}
          selected={statusFilter}
          onChange={handleStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "sentiment",
      label: "Sentiment",
      filter: (
        <ChoiceList
          title="Sentiment"
          titleHidden
          choices={[
            { label: "Positive (4-5★)", value: "positive" },
            { label: "Neutral (3★)", value: "neutral" },
            { label: "Negative (1-2★)", value: "negative" },
          ]}
          selected={sentimentFilter}
          onChange={handleSentimentChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters = [];
  if (statusFilter.length > 0) {
    appliedFilters.push({
      key: "status",
      label: `Status: ${statusFilter.join(", ")}`,
      onRemove: () => setStatusFilter([]),
    });
  }
  if (sentimentFilter.length > 0) {
    appliedFilters.push({
      key: "sentiment",
      label: `Sentiment: ${sentimentFilter.join(", ")}`,
      onRemove: () => setSentimentFilter([]),
    });
  }

  const rows = filteredReviews.map((r) => [
    <InlineStack gap="200" blockAlign="center" key={`${r.id}-product`}>
      <Text as="span" variant="bodyMd" fontWeight="semibold">
        {r.productTitle}
      </Text>
    </InlineStack>,
    <Text as="span" key={`${r.id}-rating`}>
      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
    </Text>,
    <Text as="span" key={`${r.id}-reviewer`} tone="subdued">
      {r.reviewerName}
    </Text>,
    <Badge
      key={`${r.id}-sentiment`}
      tone={
        r.sentiment === "positive"
          ? "success"
          : r.sentiment === "negative"
          ? "critical"
          : "info"
      }
    >
      {r.sentiment}
    </Badge>,
    <Badge
      key={`${r.id}-status`}
      tone={
        r.responseStatus === "published"
          ? "success"
          : r.responseStatus === "pending"
          ? "attention"
          : "info"
      }
    >
      {r.responseStatus}
    </Badge>,
    <Button key={`${r.id}-action`} size="slim" url={`/app/reviews/${r.id}`}>
      View
    </Button>,
  ]);

  if (reviews.length === 0) {
    return (
      <Page
        title="Reviews"
        primaryAction={{
          content: "Sync Reviews",
          url: "/app/sync",
        }}
      >
        <Card>
          <EmptyState
            heading="No reviews synced yet"
            action={{
              content: "Sync Reviews from Shopify",
              url: "/app/sync",
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Sync your product reviews from Shopify to start generating
              AI-powered responses.
            </p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Reviews"
      primaryAction={{
        content: "Sync Reviews",
        url: "/app/sync",
      }}
      secondaryActions={[
        {
          content: "Generate All Responses",
          url: "/app/reviews/generate-all",
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Filters
                filters={filters}
                appliedFilters={appliedFilters}
                onClearAll={handleClearAll}
                queryValue={queryValue}
                onQueryChange={handleQueryChange}
                onQueryClear={handleQueryClear}
                queryPlaceholder="Search reviews..."
              />

              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                  "text",
                ]}
                headings={[
                  "Product",
                  "Rating",
                  "Reviewer",
                  "Sentiment",
                  "Status",
                  "Actions",
                ]}
                rows={rows}
              />

              {filteredReviews.length === 0 && reviews.length > 0 && (
                <Box padding="400">
                  <Text as="p" tone="subdued" alignment="center">
                    No reviews match the selected filters.
                  </Text>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
