import { Page, Layout, Card, Text, FormLayout, TextField, Button, BlockStack, Box } from '@shopify/polaris';
import { BrandedFooter } from '../components/BrandedFooter';
import { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    analysisDepth: 'standard',
    autoAnalyze: false,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement settings save logic
  };

  return (
    <Page title="Settings" subtitle="ConversionAI by ApexMind AI Labs">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                App Settings
              </Text>
              <FormLayout>
                <TextField
                  label="Analysis Depth"
                  value={settings.analysisDepth}
                  onChange={(value) => setSettings({ ...settings, analysisDepth: value })}
                  autoComplete="off"
                />
                <div className="brand-primary-button">
                  <Button variant="primary" onClick={handleSave}>
                    Save Settings
                  </Button>
                </div>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <Box paddingBlockStart="800">
        <BrandedFooter />
      </Box>
    </Page>
  );
}
