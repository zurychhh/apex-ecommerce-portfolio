import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { createSubscription, PLANS } from "../utils/billing.server";

/**
 * POST /app/billing/create
 * Creates a new Shopify subscription and redirects to confirmation page
 *
 * Body: { plan: "starter" | "growth" | "agency" }
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Parse plan from form data or JSON
  let plan: string = "starter";

  const contentType = request.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const body = await request.json();
    plan = body.plan;
  } else {
    const formData = await request.formData();
    plan = (formData.get("plan") as string) || "starter";
  }

  // Validate plan
  if (!["starter", "growth", "agency"].includes(plan)) {
    return json(
      { error: "Invalid plan. Choose starter, growth, or agency." },
      { status: 400 }
    );
  }

  try {
    const result = await createSubscription(
      admin,
      session.shop,
      plan as "starter" | "growth" | "agency"
    );

    if (result.confirmationUrl) {
      // Redirect to Shopify's confirmation page
      return redirect(result.confirmationUrl);
    }

    return json({
      success: true,
      subscriptionId: result.subscriptionId,
    });
  } catch (error: any) {
    console.error("[ReviewBoost] Billing create error:", error);
    return json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
};

/**
 * GET /app/billing/create?plan=starter
 * Alternative: create subscription via GET with query param
 */
export const loader = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "starter";

  // Validate plan
  if (!["starter", "growth", "agency"].includes(plan)) {
    return redirect("/app/pricing?error=invalid_plan");
  }

  try {
    const result = await createSubscription(
      admin,
      session.shop,
      plan as "starter" | "growth" | "agency"
    );

    if (result.confirmationUrl) {
      return redirect(result.confirmationUrl);
    }

    return redirect("/app/pricing?success=true");
  } catch (error: any) {
    console.error("[ReviewBoost] Billing create error:", error);
    return redirect(`/app/pricing?error=${encodeURIComponent(error.message)}`);
  }
};
