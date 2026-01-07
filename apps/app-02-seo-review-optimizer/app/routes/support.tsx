import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Support | ReviewBoost AI" },
    { name: "description", content: "Get help with ReviewBoost AI Shopify App" },
  ];
};

export default function Support() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Support</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        We're here to help you get the most out of ReviewBoost AI
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Contact Us</h2>
        <p>
          For any questions, issues, or feedback about ReviewBoost AI, please reach out to us:
        </p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:rafal@oleksiakconsulting.com" style={{ color: "#0066cc" }}>
              rafal@oleksiakconsulting.com
            </a>
          </li>
          <li>
            <strong>Response time:</strong> Within 24 hours on business days
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Frequently Asked Questions</h2>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>How do I sync reviews from my store?</h3>
          <p style={{ color: "#444" }}>
            Go to the Dashboard and click "Sync Reviews". You can import sample reviews for testing
            or sync real reviews from your Shopify Product Reviews app.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>How does AI response generation work?</h3>
          <p style={{ color: "#444" }}>
            Our AI analyzes each review's sentiment and content, then generates a professional
            response tailored to your chosen tone (Professional, Friendly, or Apologetic).
            You can edit the response before publishing.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>What counts as a "response"?</h3>
          <p style={{ color: "#444" }}>
            Each time you click "Generate with AI" on a review, it counts as one response
            against your monthly limit. Editing or publishing doesn't count as additional responses.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Can I customize the AI's tone?</h3>
          <p style={{ color: "#444" }}>
            Yes! On the Settings page, you can add custom brand voice instructions.
            For example: "We're a fun, casual outdoor brand" or "Always mention our 30-day return policy."
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>When does my usage reset?</h3>
          <p style={{ color: "#444" }}>
            Your monthly response count resets on the 1st of each month.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>How do I upgrade my plan?</h3>
          <p style={{ color: "#444" }}>
            Go to the Pricing page and click on your desired plan. You'll be redirected to
            Shopify to confirm the subscription. Changes take effect immediately.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>How do I cancel my subscription?</h3>
          <p style={{ color: "#444" }}>
            You can cancel anytime from your Shopify admin under Apps → ReviewBoost AI → Manage subscription.
            Your access continues until the end of the current billing period.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Is my data secure?</h3>
          <p style={{ color: "#444" }}>
            Yes. We only access the data necessary to provide our service (reviews, products).
            We never share your data with third parties except as described in our Privacy Policy.
            All data is stored securely with encryption.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Getting Started Guide</h2>
        <ol style={{ paddingLeft: "1.5rem", lineHeight: "1.8" }}>
          <li>Install ReviewBoost AI from the Shopify App Store</li>
          <li>Click "Sync Reviews" to import your existing reviews</li>
          <li>Go to a pending review and select a tone</li>
          <li>Click "Generate with AI" to create a response</li>
          <li>Edit the response if needed</li>
          <li>Click "Publish" to post it to your store</li>
        </ol>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Troubleshooting</h2>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Reviews not syncing?</h3>
          <p style={{ color: "#444" }}>
            Make sure you have Shopify Product Reviews or a compatible review app installed.
            Try the "Import Sample Reviews" option to test the app functionality.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Response generation failed?</h3>
          <p style={{ color: "#444" }}>
            Check if you've reached your monthly limit. If not, wait a moment and try again.
            If the issue persists, contact support.
          </p>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>Can't publish response?</h3>
          <p style={{ color: "#444" }}>
            Ensure the review still exists on your store. Some review apps require specific
            permissions. Contact us if you need help with a third-party review integration.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: "2rem", padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Still Need Help?</h2>
        <p>
          Email us at{" "}
          <a href="mailto:rafal@oleksiakconsulting.com" style={{ color: "#0066cc" }}>
            rafal@oleksiakconsulting.com
          </a>{" "}
          with:
        </p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>Your store URL</li>
          <li>Description of the issue</li>
          <li>Screenshots if applicable</li>
        </ul>
        <p style={{ marginTop: "0.5rem" }}>
          We typically respond within 24 hours.
        </p>
      </section>

      <footer style={{ marginTop: "3rem", paddingTop: "1rem", borderTop: "1px solid #eee", color: "#666" }}>
        <a href="/privacy" style={{ color: "#0066cc", marginRight: "1rem" }}>Privacy Policy</a>
        <a href="/terms" style={{ color: "#0066cc", marginRight: "1rem" }}>Terms of Service</a>
        <a href="/" style={{ color: "#0066cc" }}>Back to App</a>
      </footer>
    </div>
  );
}
