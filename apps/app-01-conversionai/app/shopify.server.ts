import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "./utils/session-storage.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(",") || [
    "read_products",
    "read_orders",
    "read_themes",
    "read_analytics",
    "read_customers",
  ],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(),
  distribution: AppDistribution.AppStore,
  isEmbeddedApp: true,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app-uninstalled",
    },
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      // Register webhooks after successful auth
      shopify.registerWebhooks({ session });

      // Create or update Shop record in our database
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      try {
        await prisma.shop.upsert({
          where: { domain: session.shop },
          update: {
            accessToken: session.accessToken!,
            scope: session.scope || "",
            isActive: true,
            updatedAt: new Date(),
          },
          create: {
            domain: session.shop,
            accessToken: session.accessToken!,
            scope: session.scope || "",
            isActive: true,
            plan: "free",
            installedAt: new Date(),
          },
        });
        console.log(`Shop ${session.shop} created/updated in database`);
      } catch (error) {
        console.error("Failed to create/update shop:", error);
      } finally {
        await prisma.$disconnect();
      }
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,  // Required for embedded app token exchange
    wrapBillingPageChargeRoute: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
