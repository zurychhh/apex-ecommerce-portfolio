import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GDPR Webhook: customers/data_request
 *
 * Called when a customer requests their data from a store.
 * Our app does NOT store individual customer data - only shop-level
 * analytics and recommendations. We acknowledge the request but have
 * no customer-specific data to return.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log(`Customer data request for customer ID: ${payload?.customer?.id || 'unknown'}`);

  // ConversionAI does not store individual customer data
  // We only store:
  // - Shop-level metrics (conversion rates, AOV, etc.)
  // - CRO recommendations for the store
  // - Session data for OAuth
  //
  // No action needed - respond with 200 to acknowledge

  console.log(`Data request acknowledged for ${shop} - no customer data stored`);

  return new Response(null, { status: 200 });
};
