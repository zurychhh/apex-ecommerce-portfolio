/**
 * Jest test setup file
 * Runs before each test file
 */

// Mock environment variables
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CRON_SECRET = 'test-cron-secret';

// Increase timeout for slow tests
jest.setTimeout(10000);

// Mock console methods if needed
// console.log = jest.fn();
// console.error = jest.fn();

// Mock logger
jest.mock('../app/utils/logger.server', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Anthropic SDK
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              recommendations: [
                {
                  title: 'Test Recommendation',
                  category: 'hero_section',
                  description: 'Test description',
                  impactScore: 5,
                  effortScore: 2,
                  estimatedUplift: '+0.5%',
                  estimatedROI: '+$1000/mo',
                  reasoning: 'Test reasoning',
                  implementation: 'Test implementation',
                  codeSnippet: '<div>Test code</div>',
                },
              ],
            }),
          },
        ],
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
