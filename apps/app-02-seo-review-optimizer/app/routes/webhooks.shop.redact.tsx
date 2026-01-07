import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

/**
 * GDPR Webhook: shop/redact
 *
 * Called 48 hours after a store uninstalls the app, requesting
 * full deletion of all shop data. This is a MANDATORY webhook
 * for Shopify App Store compliance.
 *
 * We delete:
 * - Shop record and all related data (reviews, responses, settings)
 * - All session data for the shop
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log(`Shop redact request - full data deletion required`);

  const prisma = new PrismaClient();

  try {
    // Find the shop record
    const shopRecord = await prisma.shop.findUnique({
      where: { domain: shop },
    });

    if (shopRecord) {
      // Delete all related data (cascades handle reviews, etc.)
      await prisma.shop.delete({
        where: { domain: shop },
      });

      console.log(`Shop ${shop} and all related data permanently deleted`);
    } else {
      console.log(`Shop ${shop} not found in database - may have been deleted already`);
    }

    // Delete any remaining sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: { shop },
    });

    console.log(`Deleted ${deletedSessions.count} sessions for ${shop}`);

    console.log(`GDPR shop/redact completed for ${shop}`);
  } catch (error) {
    console.error("Failed to handle shop redact:", error);
    // Still return 200 - Shopify will retry if we return error
    // Log the error for manual investigation
  } finally {
    await prisma.$disconnect();
  }

  return new Response(null, { status: 200 });
};
