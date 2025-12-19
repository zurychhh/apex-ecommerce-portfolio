import { Page, Layout, Card, Text, FormLayout, TextField, Button, BlockStack } from '@shopify/polaris';
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
    <Page title="Settings">
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
                <Button variant="primary" onClick={handleSave}>
                  Save Settings
                </Button>
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
