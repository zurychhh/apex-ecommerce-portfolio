/**
 * Integration tests for Shopify GraphQL billing functions
 * Tests createSubscription, checkActiveSubscription, cancelSubscription
 * with mocked Shopify admin.graphql() responses
 */

// Mock logger FIRST (hoisted)
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
const mockLoggerWarn = jest.fn();

jest.mock('../../app/utils/logger.server', () => ({
  logger: {
    info: mockLoggerInfo,
    error: mockLoggerError,
    warn: mockLoggerWarn,
    debug: jest.fn(),
  },
}));

import {
  createSubscription,
  checkActiveSubscription,
  cancelSubscription,
  PLANS,
} from '../../app/utils/billing.server';

describe('Shopify GraphQL Billing Integration', () => {
  // Mock admin object with graphql method
  let mockAdmin: { graphql: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdmin = {
      graphql: jest.fn(),
    };
  });

  describe('createSubscription', () => {
    const mockShop = 'test-store.myshopify.com';

    it('should create basic subscription successfully', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCreate: {
              appSubscription: {
                id: 'gid://shopify/AppSubscription/123',
                status: 'PENDING',
                name: 'ConversionAI Basic',
                test: true,
                trialDays: 7,
                currentPeriodEnd: '2024-02-01T00:00:00Z',
              },
              confirmationUrl: 'https://test-store.myshopify.com/admin/charges/confirm',
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await createSubscription(mockAdmin, mockShop, 'basic');

      expect(result.subscriptionId).toBe('gid://shopify/AppSubscription/123');
      expect(result.confirmationUrl).toBe('https://test-store.myshopify.com/admin/charges/confirm');
      expect(result.subscription).toBeDefined();
      expect(result.subscription.name).toBe('ConversionAI Basic');
    });

    it('should create pro subscription with correct pricing', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCreate: {
              appSubscription: {
                id: 'gid://shopify/AppSubscription/456',
                status: 'PENDING',
                name: 'ConversionAI Pro',
                test: true,
                trialDays: 7,
              },
              confirmationUrl: 'https://test-store.myshopify.com/admin/charges/confirm',
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await createSubscription(mockAdmin, mockShop, 'pro');

      // Verify GraphQL was called with correct variables
      expect(mockAdmin.graphql).toHaveBeenCalledTimes(1);
      const callArgs = mockAdmin.graphql.mock.calls[0];
      expect(callArgs[1].variables.name).toBe('ConversionAI Pro');
      expect(callArgs[1].variables.trialDays).toBe(PLANS.pro.trialDays);
      expect(callArgs[1].variables.lineItems[0].plan.appRecurringPricingDetails.price.amount).toBe(PLANS.pro.price);
    });

    it('should reject enterprise plan (no longer supported)', async () => {
      await expect(async () => {
        await createSubscription(mockAdmin, mockShop, 'enterprise' as any);
      }).rejects.toThrow('Invalid plan: enterprise');
    });

    it('should use custom returnUrl when provided', async () => {
      const customReturnUrl = 'https://custom-url.com/callback';
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCreate: {
              appSubscription: { id: 'gid://shopify/AppSubscription/123' },
              confirmationUrl: 'https://test-store.myshopify.com/admin/charges/confirm',
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await createSubscription(mockAdmin, mockShop, 'basic', customReturnUrl);

      const callArgs = mockAdmin.graphql.mock.calls[0];
      expect(callArgs[1].variables.returnUrl).toBe(customReturnUrl);
    });

    it('should use default returnUrl when not provided', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCreate: {
              appSubscription: { id: 'gid://shopify/AppSubscription/123' },
              confirmationUrl: 'https://test-store.myshopify.com/admin/charges/confirm',
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await createSubscription(mockAdmin, mockShop, 'basic');

      const callArgs = mockAdmin.graphql.mock.calls[0];
      expect(callArgs[1].variables.returnUrl).toBe(`https://${mockShop}/admin/apps/conversionai`);
    });

    it('should throw error for invalid plan (free)', async () => {
      await expect(
        createSubscription(mockAdmin, mockShop, 'free' as any)
      ).rejects.toThrow('Invalid plan: free');

      expect(mockAdmin.graphql).not.toHaveBeenCalled();
    });

    it('should throw error when Shopify returns userErrors', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCreate: {
              appSubscription: null,
              confirmationUrl: null,
              userErrors: [
                { field: 'lineItems', message: 'Invalid pricing configuration' },
              ],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await expect(
        createSubscription(mockAdmin, mockShop, 'basic')
      ).rejects.toThrow('Invalid pricing configuration');

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Billing API error:',
        expect.any(Array)
      );
    });

    it('should throw and log error on GraphQL failure', async () => {
      const graphqlError = new Error('Network error');
      mockAdmin.graphql.mockRejectedValue(graphqlError);

      await expect(
        createSubscription(mockAdmin, mockShop, 'basic')
      ).rejects.toThrow('Network error');

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to create subscription:',
        graphqlError
      );
    });

    it('should log successful subscription creation', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCreate: {
              appSubscription: {
                id: 'gid://shopify/AppSubscription/123',
              },
              confirmationUrl: 'https://test-store.myshopify.com/admin/charges/confirm',
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await createSubscription(mockAdmin, mockShop, 'pro');

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        `Subscription created for ${mockShop}: pro`,
        expect.objectContaining({
          subscriptionId: 'gid://shopify/AppSubscription/123',
        })
      );
    });
  });

  describe('checkActiveSubscription', () => {
    it('should return active subscriptions', async () => {
      const mockSubscriptions = [
        {
          id: 'gid://shopify/AppSubscription/123',
          name: 'ConversionAI Pro',
          status: 'ACTIVE',
          test: false,
          trialDays: 7,
          currentPeriodEnd: '2024-02-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse = {
        json: async () => ({
          data: {
            currentAppInstallation: {
              activeSubscriptions: mockSubscriptions,
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await checkActiveSubscription(mockAdmin);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('ConversionAI Pro');
      expect(result[0].status).toBe('ACTIVE');
    });

    it('should return empty array when no subscriptions', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            currentAppInstallation: {
              activeSubscriptions: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await checkActiveSubscription(mockAdmin);

      expect(result).toEqual([]);
    });

    it('should return empty array when activeSubscriptions is null', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            currentAppInstallation: {
              activeSubscriptions: null,
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await checkActiveSubscription(mockAdmin);

      expect(result).toEqual([]);
    });

    it('should return multiple subscriptions', async () => {
      const mockSubscriptions = [
        { id: 'sub-1', name: 'ConversionAI Pro', status: 'ACTIVE' },
        { id: 'sub-2', name: 'ConversionAI Basic', status: 'CANCELLED' },
      ];

      const mockResponse = {
        json: async () => ({
          data: {
            currentAppInstallation: {
              activeSubscriptions: mockSubscriptions,
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await checkActiveSubscription(mockAdmin);

      expect(result).toHaveLength(2);
    });

    it('should return empty array and log error on failure', async () => {
      const error = new Error('GraphQL error');
      mockAdmin.graphql.mockRejectedValue(error);

      const result = await checkActiveSubscription(mockAdmin);

      expect(result).toEqual([]);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to check subscription:',
        error
      );
    });

    it('should handle missing currentAppInstallation', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            currentAppInstallation: null,
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await checkActiveSubscription(mockAdmin);

      expect(result).toEqual([]);
    });
  });

  describe('cancelSubscription', () => {
    const subscriptionId = 'gid://shopify/AppSubscription/123';

    it('should cancel subscription successfully', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCancel: {
              appSubscription: {
                id: subscriptionId,
                status: 'CANCELLED',
              },
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await cancelSubscription(mockAdmin, subscriptionId);

      expect(result.id).toBe(subscriptionId);
      expect(result.status).toBe('CANCELLED');
    });

    it('should pass correct subscription ID to GraphQL', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCancel: {
              appSubscription: { id: subscriptionId, status: 'CANCELLED' },
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await cancelSubscription(mockAdmin, subscriptionId);

      const callArgs = mockAdmin.graphql.mock.calls[0];
      expect(callArgs[1].variables.id).toBe(subscriptionId);
    });

    it('should log successful cancellation', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCancel: {
              appSubscription: { id: subscriptionId, status: 'CANCELLED' },
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await cancelSubscription(mockAdmin, subscriptionId);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        `Subscription cancelled: ${subscriptionId}`
      );
    });

    it('should throw error when Shopify returns userErrors', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCancel: {
              appSubscription: null,
              userErrors: [
                { field: 'id', message: 'Subscription not found' },
              ],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      await expect(
        cancelSubscription(mockAdmin, subscriptionId)
      ).rejects.toThrow('Subscription not found');
    });

    it('should throw and log error on GraphQL failure', async () => {
      const error = new Error('Network error');
      mockAdmin.graphql.mockRejectedValue(error);

      await expect(
        cancelSubscription(mockAdmin, subscriptionId)
      ).rejects.toThrow('Network error');

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Failed to cancel subscription:',
        error
      );
    });

    it('should handle empty userErrors array', async () => {
      const mockResponse = {
        json: async () => ({
          data: {
            appSubscriptionCancel: {
              appSubscription: { id: subscriptionId, status: 'CANCELLED' },
              userErrors: [],
            },
          },
        }),
      };

      mockAdmin.graphql.mockResolvedValue(mockResponse);

      const result = await cancelSubscription(mockAdmin, subscriptionId);

      expect(result).toBeDefined();
      expect(result.status).toBe('CANCELLED');
    });
  });
});
