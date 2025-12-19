/**
 * Email utilities using Resend
 * Handles transactional emails (analysis complete, weekly summaries, etc.)
 */

import { Resend } from 'resend';
import { logger } from '@apex/shared-utils';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send analysis complete notification
 */
export async function sendAnalysisCompleteEmail(
  toEmail: string,
  recommendationsCount: number
) {
  try {
    logger.info(`Sending analysis complete email to ${toEmail}`);

    await resend.emails.send({
      from: 'ConversionAI <notifications@conversionai.app>',
      to: toEmail,
      subject: `Your CRO Analysis is Ready! 🎉 (${recommendationsCount} recommendations)`,
      html: `
        <h1>Your ConversionAI Analysis is Complete!</h1>
        <p>We've analyzed your Shopify store and generated <strong>${recommendationsCount} actionable recommendations</strong> to boost your conversion rate.</p>
        <p><a href="https://app.conversionai.com/app/recommendations" style="background: #5850ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Recommendations</a></p>
        <p>Quick wins are prioritized at the top. Each recommendation includes:</p>
        <ul>
          <li>✅ Clear explanation of why it matters</li>
          <li>💻 Copy-paste code snippet</li>
          <li>📈 Estimated impact on revenue</li>
          <li>📋 Step-by-step implementation guide</li>
        </ul>
        <p>Questions? Just reply to this email!</p>
        <p>— The ConversionAI Team</p>
      `,
    });

    logger.info(`Email sent successfully to ${toEmail}`);
  } catch (error) {
    logger.error('Failed to send email:', error);
    // Don't throw - email failure shouldn't fail the job
  }
}

/**
 * Send weekly summary email
 */
export async function sendWeeklySummaryEmail(
  toEmail: string,
  data: {
    implementedCount: number;
    pendingCount: number;
    metricsImprovement: number;
  }
) {
  try {
    await resend.emails.send({
      from: 'ConversionAI <notifications@conversionai.app>',
      to: toEmail,
      subject: 'Your Weekly CRO Summary 📊',
      html: `
        <h1>Weekly Summary</h1>
        <p>Here's your progress this week:</p>
        <ul>
          <li>Implemented: ${data.implementedCount} recommendations</li>
          <li>Pending: ${data.pendingCount} recommendations</li>
          <li>Metrics improvement: ${data.metricsImprovement > 0 ? '+' : ''}${data.metricsImprovement}%</li>
        </ul>
        <p><a href="https://app.conversionai.com/app">View Dashboard</a></p>
      `,
    });
  } catch (error) {
    logger.error('Failed to send weekly summary:', error);
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(toEmail: string, shopDomain: string) {
  try {
    await resend.emails.send({
      from: 'ConversionAI <notifications@conversionai.app>',
      to: toEmail,
      subject: 'Welcome to ConversionAI! 👋',
      html: `
        <h1>Welcome to ConversionAI!</h1>
        <p>Thanks for installing ConversionAI on <strong>${shopDomain}</strong>.</p>
        <p>We're an AI-powered CRO consultant that helps Shopify merchants like you increase conversion rates without the $2K-10K/month agency fees.</p>
        <h2>Next Steps:</h2>
        <ol>
          <li>Run your first store analysis (takes 60 seconds)</li>
          <li>Review your prioritized recommendations</li>
          <li>Implement quick wins first (10-15 minutes each)</li>
          <li>Track your results</li>
        </ol>
        <p><a href="https://app.conversionai.com/app/analysis/start" style="background: #5850ec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start First Analysis</a></p>
        <p>Questions? Reply to this email anytime!</p>
        <p>— The ConversionAI Team</p>
      `,
    });
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
  }
}
