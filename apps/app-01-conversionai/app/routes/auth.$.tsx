import type { LoaderFunctionArgs } from '@remix-run/node';

/**
 * OAuth authentication route
 * Handles: /auth/login, /auth/callback, /auth/logout
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // TODO: Implement OAuth flow using @apex/shared-auth
  // This will be fleshed out during App #1 development

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.includes('login')) {
    // Redirect to Shopify OAuth
    return new Response('Redirect to Shopify OAuth', { status: 302 });
  }

  if (pathname.includes('callback')) {
    // Handle OAuth callback
    return new Response('OAuth callback handled', { status: 302 });
  }

  if (pathname.includes('logout')) {
    // Handle logout
    return new Response('Logged out', { status: 302 });
  }

  return new Response('Not found', { status: 404 });
};
