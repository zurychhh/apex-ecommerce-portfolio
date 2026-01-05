import { Box, Text, Link, InlineStack, BlockStack } from '@shopify/polaris';

export function BrandedFooter() {
  return (
    <Box
      padding="600"
      background="bg-surface-secondary"
      borderBlockStartWidth="025"
      borderColor="border-secondary"
    >
      <BlockStack gap="400">
        {/* Cross-sell CTA */}
        <Box
          padding="400"
          background="bg-surface-success-subdued"
          borderRadius="200"
        >
          <BlockStack gap="200">
            <Text variant="headingMd" as="h3">
              Need help implementing these recommendations?
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Get expert CRO implementation support from the creator of ConversionAI.
            </Text>
            <InlineStack gap="300" wrap={false}>
              <Link
                url="https://oleksiakconsulting.com"
                target="_blank"
                monochrome
              >
                oleksiakconsulting.com
              </Link>
              <Text variant="bodySm" as="span">or</Text>
              <Link
                url="mailto:rafal@oleksiakconsulting.com"
                monochrome
              >
                rafal@oleksiakconsulting.com
              </Link>
            </InlineStack>
          </BlockStack>
        </Box>

        {/* Legal links */}
        <InlineStack gap="400" align="center" blockAlign="center">
          <Text variant="bodySm" as="p" tone="subdued">
            &copy; {new Date().getFullYear()} ApexMind AI Labs
          </Text>
          <Link
            url="https://apexmind.ai/privacy"
            target="_blank"
            monochrome
            removeUnderline
          >
            Privacy
          </Link>
          <Link
            url="https://apexmind.ai/terms"
            target="_blank"
            monochrome
            removeUnderline
          >
            Terms
          </Link>
        </InlineStack>
      </BlockStack>
    </Box>
  );
}
