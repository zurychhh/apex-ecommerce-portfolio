import type { LoaderFunctionArgs, HeadersFunction } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
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

/**
 * Headers export - required for proper iframe handling in embedded apps
 * Sets correct headers for App Bridge when redirects occur outside the iframe
 */
export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};

/**
 * ErrorBoundary - handles authentication errors in iframe context
 * Ensures proper redirection during OAuth flow
 */
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}
