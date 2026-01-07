/**
 * Unit tests for review-response-ai.server.ts
 */

import {
  generateReviewResponse,
  estimateResponseCost,
} from '~/utils/review-response-ai.server';

// Mock is set up in tests/setup.ts

describe('review-response-ai.server', () => {
  describe('generateReviewResponse', () => {
    const baseReview = {
      author: 'John Doe',
      rating: 5,
      title: 'Great product!',
      body: 'I absolutely love this product. Works exactly as described.',
      productTitle: 'Premium Widget',
    };

    it('should generate a response for a positive review', async () => {
      const result = await generateReviewResponse({
        review: baseReview,
        tone: 'professional',
      });

      expect(result).toHaveProperty('responseBody');
      expect(result).toHaveProperty('tokensUsed');
      expect(typeof result.responseBody).toBe('string');
      expect(result.responseBody.length).toBeGreaterThan(0);
    });

    it('should generate a response for a negative review', async () => {
      const negativeReview = {
        ...baseReview,
        rating: 1,
        title: 'Disappointed',
        body: 'The product broke after one day of use.',
      };

      const result = await generateReviewResponse({
        review: negativeReview,
        tone: 'apologetic',
      });

      expect(result).toHaveProperty('responseBody');
      expect(result.tokensUsed).toBeGreaterThan(0);
    });

    it('should generate a response for a neutral review', async () => {
      const neutralReview = {
        ...baseReview,
        rating: 3,
        title: 'Its okay',
        body: 'Product is decent but could be better.',
      };

      const result = await generateReviewResponse({
        review: neutralReview,
        tone: 'friendly',
      });

      expect(result).toHaveProperty('responseBody');
    });

    it('should accept custom brand voice', async () => {
      const result = await generateReviewResponse({
        review: baseReview,
        tone: 'friendly',
        brandVoice: 'Casual and fun, using emojis occasionally',
        storeName: 'Widget Wonderland',
      });

      expect(result).toHaveProperty('responseBody');
    });

    it('should handle review without title', async () => {
      const noTitleReview = {
        ...baseReview,
        title: null,
      };

      const result = await generateReviewResponse({
        review: noTitleReview,
        tone: 'professional',
      });

      expect(result).toHaveProperty('responseBody');
    });

    it('should track token usage', async () => {
      const result = await generateReviewResponse({
        review: baseReview,
        tone: 'professional',
      });

      // Based on mock: 250 input + 50 output = 300
      expect(result.tokensUsed).toBe(300);
    });
  });

  describe('estimateResponseCost', () => {
    it('should calculate cost for average token usage', () => {
      const cost = estimateResponseCost(300);

      // ~$0.0002 per response based on Haiku pricing
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.001); // Less than $0.001
    });

    it('should return positive cost for any token usage', () => {
      expect(estimateResponseCost(100)).toBeGreaterThan(0);
      expect(estimateResponseCost(1000)).toBeGreaterThan(0);
    });
  });
});
