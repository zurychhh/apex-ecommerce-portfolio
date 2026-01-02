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
  const url = new URL(request.url);
  console.log("[AUTH] Request to:", url.pathname, url.search);
  console.log("[AUTH] Headers:", JSON.stringify(Object.fromEntries(request.headers.entries())));

  try {
    await authenticate.admin(request);
    console.log("[AUTH] Authentication successful");
    return null;
  } catch (error) {
    // Check if this is a Response (redirect) - which is normal flow
    if (error instanceof Response) {
      console.log("[AUTH] Redirect response:", error.status, error.headers.get("Location"));
      throw error; // Re-throw redirect responses
    }
    // Log actual errors
    console.error("[AUTH] Error:", error);
    console.error("[AUTH] Error stack:", error instanceof Error ? error.stack : "no stack");
    throw error;
  }
};
