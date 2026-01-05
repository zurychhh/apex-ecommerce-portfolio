import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Support | ConversionAI" },
    { name: "description", content: "Get help with ConversionAI - FAQ, contact information, and support resources" },
  ];
};

export default function Support() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Support Center</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Get help with ConversionAI</p>

      {/* Contact Information */}
      <section style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#2563EB" }}>Contact Us</h2>
        <p style={{ marginBottom: "0.5rem" }}>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@apexmind.ai" style={{ color: "#2563EB" }}>support@apexmind.ai</a>
        </p>
        <p style={{ marginBottom: "0.5rem" }}>
          <strong>Response Time:</strong> Within 24 hours (usually much faster during business hours CET)
        </p>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          For urgent issues, include "[URGENT]" in your email subject line.
        </p>
      </section>

      {/* FAQ Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Frequently Asked Questions</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            1. How long does an analysis take?
          </h3>
          <p style={{ color: "#555" }}>
            A full AI analysis typically takes 60-90 seconds. During this time, we capture screenshots of your
            store, analyze your metrics, and generate personalized recommendations using advanced AI.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            2. How many recommendations will I receive?
          </h3>
          <p style={{ color: "#555" }}>
            Each analysis generates 10-12 prioritized recommendations. These are ranked by potential impact
            and effort required, so you can focus on quick wins first.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            3. How accurate are the ROI estimates?
          </h3>
          <p style={{ color: "#555" }}>
            ROI estimates are based on industry benchmarks and your store's current metrics. They represent
            potential improvements and should be used as directional guidance. Actual results may vary based
            on implementation quality and market conditions.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            4. Can I run unlimited analyses on the Free plan?
          </h3>
          <p style={{ color: "#555" }}>
            The Free plan includes 1 analysis per month. Upgrade to Pro ($29/month) for unlimited analyses
            and weekly auto-refresh that keeps your recommendations current.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            5. Do I need coding skills to implement recommendations?
          </h3>
          <p style={{ color: "#555" }}>
            Many recommendations can be implemented without coding using your theme editor or Shopify apps.
            For technical recommendations, we provide code snippets and step-by-step instructions. You can also
            hire a developer or contact us for implementation assistance.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            6. Is my store data secure?
          </h3>
          <p style={{ color: "#555" }}>
            Yes. We only access the data necessary to generate recommendations (analytics, products, themes).
            We never access customer personal data or payment information. All data is encrypted in transit
            and at rest. See our <a href="/privacy" style={{ color: "#2563EB" }}>Privacy Policy</a> for details.
          </p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            7. How do I cancel my subscription?
          </h3>
          <p style={{ color: "#555" }}>
            You can cancel anytime from your Shopify Admin under Settings &gt; Apps and sales channels &gt;
            ConversionAI &gt; Manage subscription. You'll continue to have access until the end of your
            billing period.
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Getting Started</h2>
        <ol style={{ paddingLeft: "1.5rem", color: "#555" }}>
          <li style={{ marginBottom: "0.5rem" }}>Install ConversionAI from the Shopify App Store</li>
          <li style={{ marginBottom: "0.5rem" }}>Click "Run New Analysis" on your dashboard</li>
          <li style={{ marginBottom: "0.5rem" }}>Wait 60-90 seconds for AI analysis to complete</li>
          <li style={{ marginBottom: "0.5rem" }}>Review your prioritized recommendations</li>
          <li style={{ marginBottom: "0.5rem" }}>Implement high-impact, low-effort changes first</li>
          <li style={{ marginBottom: "0.5rem" }}>Mark recommendations as "Implemented" to track progress</li>
        </ol>
      </section>

      {/* Troubleshooting */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Troubleshooting</h2>

        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>Analysis not completing?</h3>
          <p style={{ color: "#555" }}>
            If your analysis seems stuck, wait at least 2 minutes before refreshing. If the issue persists,
            try running a new analysis. Contact support if the problem continues.
          </p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>App not loading?</h3>
          <p style={{ color: "#555" }}>
            Try refreshing your browser, clearing your cache, or opening the app in an incognito window.
            If issues persist, contact support with your browser name and any error messages you see.
          </p>
        </div>
      </section>

      {/* Implementation Help */}
      <section style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#f0f4ff", borderRadius: "8px", border: "1px solid #2563EB20" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "#2563EB" }}>Need Implementation Help?</h2>
        <p style={{ color: "#555", marginBottom: "1rem" }}>
          Get expert CRO implementation support from the creators of ConversionAI.
        </p>
        <p>
          <a href="https://oleksiakconsulting.com/" style={{ color: "#2563EB", fontWeight: "500" }} target="_blank" rel="noopener noreferrer">
            oleksiakconsulting.com
          </a>
          <span style={{ margin: "0 0.5rem", color: "#999" }}>|</span>
          <a href="mailto:rafal@oleksiakconsulting.com" style={{ color: "#2563EB" }}>
            rafal@oleksiakconsulting.com
          </a>
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
