import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | ReviewBoost AI" },
    { name: "description", content: "Privacy Policy for ReviewBoost AI Shopify App" },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Last updated: January 2026</p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>1. Introduction</h2>
        <p>
          ReviewBoost AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, and safeguard information when you use our Shopify application.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>2. Information We Collect</h2>
        <p>When you install and use ReviewBoost AI, we collect:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li><strong>Store Information:</strong> Your Shopify store domain, email, and selected plan.</li>
          <li><strong>Review Data:</strong> Product reviews synced from your Shopify store, including reviewer names and review content.</li>
          <li><strong>Response Data:</strong> AI-generated responses and any edits you make before publishing.</li>
          <li><strong>Usage Data:</strong> Number of responses generated and published.</li>
        </ul>
        <p style={{ marginTop: "1rem" }}>
          <strong>We do NOT collect:</strong> Customer payment information, customer browsing behavior, or personal data beyond review metadata.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>3. How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>Generate AI-powered review responses tailored to your brand voice</li>
          <li>Track usage against your subscription limits</li>
          <li>Improve our AI response quality</li>
          <li>Communicate important updates about our service</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>4. Data Storage and Security</h2>
        <p>
          Your data is stored securely on Railway.app infrastructure with encrypted connections.
          We retain your store data and review responses for the duration of your subscription.
          Upon uninstallation, your data is marked as inactive and permanently deleted within 48 hours
          upon receiving Shopify's data deletion webhook.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>5. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li><strong>Anthropic (Claude AI):</strong> For generating review responses</li>
          <li><strong>Railway:</strong> For application hosting and database</li>
          <li><strong>Resend:</strong> For email notifications</li>
        </ul>
        <p style={{ marginTop: "0.5rem" }}>
          These services process data according to their respective privacy policies.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>Access your stored data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your review responses</li>
        </ul>
        <p style={{ marginTop: "0.5rem" }}>
          To exercise these rights, contact us at rafal@oleksiakconsulting.com or uninstall the app from your Shopify admin.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>7. GDPR Compliance</h2>
        <p>
          For users in the European Economic Area, we comply with GDPR requirements. We process data
          based on legitimate interest to provide our service. You may request data portability or
          erasure at any time.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. We will notify you of significant changes
          via email or in-app notification.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>9. Contact Us</h2>
        <p>
          For questions about this Privacy Policy, contact us at:<br />
          Email: rafal@oleksiakconsulting.com
        </p>
      </section>

      <footer style={{ marginTop: "3rem", paddingTop: "1rem", borderTop: "1px solid #eee", color: "#666" }}>
        <a href="/terms" style={{ color: "#0066cc", marginRight: "1rem" }}>Terms of Service</a>
        <a href="/" style={{ color: "#0066cc" }}>Back to App</a>
      </footer>
    </div>
  );
}
