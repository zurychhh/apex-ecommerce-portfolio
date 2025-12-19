import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * OAuth authentication route
 * Handles all auth paths: /auth/*, including:
 * - /auth (initial auth request)
 * - /auth/callback (OAuth callback)
 * - /auth/session-token (session token exchange)
 *
 * The @shopify/shopify-app-remix package handles the OAuth flow automatically.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};
