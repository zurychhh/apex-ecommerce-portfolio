/**
 * Prisma database client
 * Singleton pattern to prevent multiple instances in development
 * Lazy-loaded to avoid crash if DATABASE_URL is not set
 */

import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient | null = null;

declare global {
  var __db__: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return new PrismaClient();
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    if (!_prisma) {
      _prisma = createPrismaClient();
    }
    return _prisma;
  } else {
    if (!global.__db__) {
      global.__db__ = createPrismaClient();
    }
    return global.__db__;
  }
}

// Export a proxy that lazily initializes prisma
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  }
});
