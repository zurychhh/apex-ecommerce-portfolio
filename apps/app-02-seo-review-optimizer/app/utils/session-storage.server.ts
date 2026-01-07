import { Session } from "@shopify/shopify-api";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { PrismaClient } from "@prisma/client";

// Lazy-load Prisma to avoid crash if DATABASE_URL not set
let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    prisma = new PrismaClient();
  }
  return prisma;
}

export class PrismaSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    try {
      const data = {
        id: session.id,
        shop: session.shop,
        state: session.state || "",
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: session.accessToken || "",
        userId: session.onlineAccessInfo?.associated_user?.id
          ? BigInt(session.onlineAccessInfo.associated_user.id)
          : null,
        firstName: session.onlineAccessInfo?.associated_user?.first_name,
        lastName: session.onlineAccessInfo?.associated_user?.last_name,
        email: session.onlineAccessInfo?.associated_user?.email,
        accountOwner:
          session.onlineAccessInfo?.associated_user?.account_owner || false,
        locale: session.onlineAccessInfo?.associated_user?.locale,
        collaborator:
          session.onlineAccessInfo?.associated_user?.collaborator || false,
        emailVerified:
          session.onlineAccessInfo?.associated_user?.email_verified || false,
      };

      await getPrisma().session.upsert({
        where: { id: session.id },
        update: data,
        create: data,
      });

      return true;
    } catch (error) {
      console.error("Failed to store session:", error);
      return false;
    }
  }

  async loadSession(id: string): Promise<Session | undefined> {
    try {
      const sessionRecord = await getPrisma().session.findUnique({
        where: { id },
      });

      if (!sessionRecord) {
        return undefined;
      }

      const session = new Session({
        id: sessionRecord.id,
        shop: sessionRecord.shop,
        state: sessionRecord.state,
        isOnline: sessionRecord.isOnline,
      });

      session.scope = sessionRecord.scope || undefined;
      session.expires = sessionRecord.expires || undefined;
      session.accessToken = sessionRecord.accessToken;

      if (sessionRecord.userId) {
        session.onlineAccessInfo = {
          expires_in: 0,
          associated_user_scope: sessionRecord.scope || "",
          associated_user: {
            id: Number(sessionRecord.userId),
            first_name: sessionRecord.firstName || "",
            last_name: sessionRecord.lastName || "",
            email: sessionRecord.email || "",
            account_owner: sessionRecord.accountOwner,
            locale: sessionRecord.locale || "",
            collaborator: sessionRecord.collaborator || false,
            email_verified: sessionRecord.emailVerified || false,
          },
        };
      }

      return session;
    } catch (error) {
      console.error("Failed to load session:", error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await getPrisma().session.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Failed to delete session:", error);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await getPrisma().session.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      return true;
    } catch (error) {
      console.error("Failed to delete sessions:", error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const sessionRecords = await getPrisma().session.findMany({
        where: { shop },
      });

      return sessionRecords.map((record) => {
        const session = new Session({
          id: record.id,
          shop: record.shop,
          state: record.state,
          isOnline: record.isOnline,
        });

        session.scope = record.scope || undefined;
        session.expires = record.expires || undefined;
        session.accessToken = record.accessToken;

        return session;
      });
    } catch (error) {
      console.error("Failed to find sessions by shop:", error);
      return [];
    }
  }
}
