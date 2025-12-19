import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

/**
 * Webhook handler for app/uninstalled topic
 * This is called when a merchant uninstalls the app
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  const prisma = new PrismaClient();

  try {
    // Mark the shop as inactive instead of deleting
    // This preserves data in case they reinstall
    await prisma.shop.update({
      where: { domain: shop },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    console.log(`Shop ${shop} marked as inactive`);

    // Delete sessions for this shop
    await prisma.session.deleteMany({
      where: { shop },
    });

    console.log(`Sessions for ${shop} deleted`);
  } catch (error) {
    console.error("Failed to handle app uninstall:", error);
  } finally {
    await prisma.$disconnect();
  }

  return new Response(null, { status: 200 });
};
