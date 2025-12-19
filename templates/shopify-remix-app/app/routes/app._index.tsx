import { Page, Layout, Card, Text } from '@shopify/polaris';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: Get shop info from session
  return json({
    shopDomain: 'example.myshopify.com',
  });
};

export default function Index() {
  const { shopDomain } = useLoaderData<typeof loader>();

  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Welcome to Your App!
            </Text>
            <Text as="p" variant="bodyMd">
              Shop: {shopDomain}
            </Text>
            <Text as="p" variant="bodyMd">
              TODO: Build your app features here
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
