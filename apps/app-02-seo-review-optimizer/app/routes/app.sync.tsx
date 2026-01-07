import { useFetcher, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  Banner,
  Box,
  InlineStack,
  Spinner,
} from "@shopify/polaris";

// Type definition for sync response
interface SyncFetcherData {
  success?: boolean;
  message?: string;
  new?: number;
  total?: number;
  error?: string;
}

export default function SyncPage() {
  const fetcher = useFetcher<SyncFetcherData>();
  const navigate = useNavigate();

  const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";
  const data = fetcher.data;

  const handleSync = (mode: "sample" | "shopify") => {
    fetcher.submit(
      { mode },
      {
        method: "POST",
        action: "/api/reviews/sync",
        encType: "application/json",
      }
    );
  };

  return (
    <Page
      title="Sync Reviews"
      backAction={{ content: "Dashboard", onAction: () => navigate("/app") }}
    >
      <Layout>
        {data?.success && (
          <Layout.Section>
            <Banner tone="success" title="Sync Complete!">
              <p>{data.message}</p>
              {data.new > 0 && (
                <Box paddingBlockStart="200">
                  <Button url="/app/reviews">View Reviews</Button>
                </Box>
              )}
            </Banner>
          </Layout.Section>
        )}

        {data?.error && (
          <Layout.Section>
            <Banner tone="critical" title="Sync Failed">
              <p>{data.error}</p>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Import Sample Reviews
              </Text>
              <Text as="p" tone="subdued">
                Perfect for testing! Import 5 sample reviews with different
                ratings (1-5 stars) to see how ReviewBoost AI generates
                responses.
              </Text>
              <Button
                variant="primary"
                onClick={() => handleSync("sample")}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Syncing..." : "Import Sample Reviews"}
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Sync from Shopify
              </Text>
              <Text as="p" tone="subdued">
                Fetch real reviews from your Shopify store. This requires
                Shopify Product Reviews or a compatible review app installed.
              </Text>
              <Banner tone="info">
                <p>
                  <strong>Note:</strong> Shopify's native Product Reviews API
                  access varies by store. If you use a third-party review app
                  (Judge.me, Yotpo, etc.), contact us for integration.
                </p>
              </Banner>
              <Button
                onClick={() => handleSync("shopify")}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Syncing..." : "Sync from Shopify"}
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        {isLoading && (
          <Layout.Section>
            <Card>
              <Box padding="800">
                <InlineStack align="center" gap="400">
                  <Spinner size="large" />
                  <Text as="p">Syncing reviews...</Text>
                </InlineStack>
              </Box>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                How Review Sync Works
              </Text>
              <BlockStack gap="200">
                <Text as="p">
                  1. <strong>Fetch</strong> - We pull reviews from your store
                </Text>
                <Text as="p">
                  2. <strong>Analyze</strong> - AI detects sentiment (positive,
                  neutral, negative)
                </Text>
                <Text as="p">
                  3. <strong>Store</strong> - Reviews are saved for response
                  generation
                </Text>
                <Text as="p">
                  4. <strong>Respond</strong> - Generate and publish AI
                  responses
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
