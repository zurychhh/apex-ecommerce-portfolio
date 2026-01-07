import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GDPR Webhook: customers/data_request
 *
 * Called when a customer requests their data from a store.
 * ReviewBoost AI stores review responses which may contain
 * customer names from review metadata. We acknowledge the request.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log(`Customer data request for customer ID: ${payload?.customer?.id || 'unknown'}`);

  // ReviewBoost AI stores:
  // - Shop-level settings
  // - Review data synced from Shopify (includes customer name from review)
  // - AI-generated responses
  //
  // Customer-specific data is minimal (just reviewer name from Shopify reviews)
  // No action needed - respond with 200 to acknowledge

  console.log(`Data request acknowledged for ${shop}`);

  return new Response(null, { status: 200 });
};
