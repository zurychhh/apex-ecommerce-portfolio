/**
 * Jest test setup file for ReviewBoost AI
 * Runs before each test file
 */

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.SHOPIFY_API_KEY = 'test-shopify-key';
process.env.SHOPIFY_API_SECRET = 'test-shopify-secret';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/reviewboost_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CRON_SECRET = 'test-cron-secret';

// Increase timeout for slow tests
jest.setTimeout(10000);

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: 'Thank you so much for your wonderful review! We are thrilled to hear that you love the product. Your feedback means the world to us. We hope to see you again soon!',
          },
        ],
        usage: {
          input_tokens: 250,
          output_tokens: 50,
        },
      }),
    },
  }));
});

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    shop: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});
