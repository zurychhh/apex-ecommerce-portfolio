import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

/**
 * Root index route - redirects to /app for embedded apps
 *
 * For embedded apps with unstable_newEmbeddedAuthStrategy: true,
 * we should NOT use login() here as it forces OAuth redirect.
 * Instead, redirect to /app which uses authenticate.admin()
 * that properly handles token exchange from id_token parameter.
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Preserve query params (shop, host, id_token, etc.) when redirecting
  const searchParams = url.searchParams.toString();
  const redirectUrl = searchParams ? `/app?${searchParams}` : "/app";

  return redirect(redirectUrl);
};
