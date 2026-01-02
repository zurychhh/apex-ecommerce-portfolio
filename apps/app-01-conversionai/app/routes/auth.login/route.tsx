import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { useState } from "react";

import { login } from "../../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = login(request);

  // Convert errors to serializable format
  const errorMessage = errors?.shop === "MISSING"
    ? "Please enter your shop domain to log in"
    : errors?.shop === "INVALID"
    ? "Please enter a valid shop domain to log in"
    : errors?.shop
    ? `Error: ${errors.shop}`
    : "";

  return { errorMessage, polarisTranslations: {} };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = login(request);

  const errorMessage = errors?.shop === "MISSING"
    ? "Please enter your shop domain to log in"
    : errors?.shop === "INVALID"
    ? "Please enter a valid shop domain to log in"
    : errors?.shop
    ? `Error: ${errors.shop}`
    : "";

  return { errorMessage };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [shop, setShop] = useState("");
  const errorMessage = actionData?.errorMessage || loaderData?.errorMessage;

  return (
    <AppProvider i18n={loaderData?.polarisTranslations || {}}>
      <Page>
        <Card>
          <Form method="post">
            <FormLayout>
              <Text variant="headingMd" as="h2">
                Log in
              </Text>
              <TextField
                type="text"
                name="shop"
                label="Shop domain"
                helpText="example.myshopify.com"
                value={shop}
                onChange={setShop}
                autoComplete="on"
                error={errorMessage || undefined}
              />
              <Button submit>Log in</Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </AppProvider>
  );
}
