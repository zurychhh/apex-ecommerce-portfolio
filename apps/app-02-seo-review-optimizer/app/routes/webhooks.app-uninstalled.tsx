import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

/**
 * Webhook: app/uninstalled
 *
 * Called immediately when a store uninstalls the app.
 * We mark the shop as inactive. Full data deletion happens
 * via shop/redact webhook 48 hours later.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const prisma = new PrismaClient();

  try {
    // Mark shop as inactive (don't delete yet - GDPR gives us 48h)
    await prisma.shop.update({
      where: { domain: shop },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    console.log(`Shop ${shop} marked as inactive`);

    // Delete sessions immediately (user can't use app anymore)
    const deletedSessions = await prisma.session.deleteMany({
      where: { shop },
    });

    console.log(`Deleted ${deletedSessions.count} sessions for ${shop}`);
  } catch (error) {
    console.error("Failed to handle app uninstall:", error);
  } finally {
    await prisma.$disconnect();
  }

  return new Response(null, { status: 200 });
};
