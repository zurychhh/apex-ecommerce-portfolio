import { Page, Layout, Card, Text } from '@shopify/polaris';
import { SettingsForm } from '@apex/shared-ui';

export default function Settings() {
  const handleSave = (values: Record<string, any>) => {
    console.log('Saving settings:', values);
    // TODO: Implement settings save logic
  };

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              App Settings
            </Text>
            <SettingsForm
              initialValues={{}}
              onSave={handleSave}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
