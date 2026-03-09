import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { login } from "../../shopify.server";

// Loader: login() auto-redirects if shop param is present
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = await login(request);
  return json({ errors });
};

// Action: handles POST (form submission if needed)
export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = await login(request);
  return json({ errors });
};

// Minimal component - only shown when no shop param (direct access)
// NO manual URL input - satisfies Shopify review requirement 2.3.1
export default function AuthLogin() {
  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem", textAlign: "center" }}>
      <h1>ConversionAI</h1>
      <p>Please install this app from the <a href="https://apps.shopify.com/">Shopify App Store</a>.</p>
    </div>
  );
}
