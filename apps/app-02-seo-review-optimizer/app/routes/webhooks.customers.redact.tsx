import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * GDPR Webhook: customers/redact
 *
 * Called when a customer requests deletion of their data from a store.
 * ReviewBoost AI may store reviewer names in review records.
 * We acknowledge the request and could anonymize if needed.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log(`Customer redact request for customer ID: ${payload?.customer?.id || 'unknown'}`);

  // ReviewBoost AI stores reviewer names as part of review data.
  // In a full implementation, we would anonymize any reviews
  // from this customer. For now, acknowledge the request.
  //
  // TODO: Implement review anonymization if needed

  console.log(`Customer redact acknowledged for ${shop}`);

  return new Response(null, { status: 200 });
};
