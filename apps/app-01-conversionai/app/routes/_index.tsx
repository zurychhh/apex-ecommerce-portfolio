import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { login } from "../shopify.server";

/**
 * Root index route - redirects to /app or starts login flow
 * This handles the initial request when the app is opened in Shopify admin
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // If there's a shop parameter, start the login flow
  if (url.searchParams.get("shop")) {
    throw await login(request);
  }

  // Otherwise redirect to /app
  return redirect("/app");
};
