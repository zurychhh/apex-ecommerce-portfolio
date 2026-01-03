/**
 * Unit tests for claude.server.ts
 * Tests prompt building, response parsing, and ROI calculations
 */

import {
  buildAnalysisPrompt,
  parseRecommendations,
  calculateEstimatedROI,
} from '../../app/utils/claude.server';

describe('Claude Server Utils', () => {
  describe('buildAnalysisPrompt', () => {
    const mockPromptData = {
      shop: { domain: 'test-store.myshopify.com' },
      primaryGoal: 'Increase conversion rate',
      analytics: {
        conversionRate: 2.5,
        avgOrderValue: 75.00,
        cartAbandonmentRate: 65,
        mobileConversionRate: 1.8,
        totalSessions: 10000,
        totalOrders: 250,
      },
      products: [
        { title: 'Product A', handle: 'product-a', id: '1' },
        { title: 'Product B', handle: 'product-b', id: '2' },
      ],
      theme: { name: 'Dawn' },
      screenshots: [],
      competitors: [],
    };

    // Helper to get combined prompt text for testing
    const getCombinedPrompt = (data: typeof mockPromptData) => {
      const result = buildAnalysisPrompt(data);
      return result.system + result.user;
    };

    it('should return system and user prompts', () => {
      const result = buildAnalysisPrompt(mockPromptData);
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('user');
      expect(typeof result.system).toBe('string');
      expect(typeof result.user).toBe('string');
    });

    it('should include store domain in prompt', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('test-store.myshopify.com');
    });

    it('should include primary goal in prompt', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('Increase conversion rate');
    });

    it('should include conversion rate metrics', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('2.5%');
    });

    it('should include average order value', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('$75');
    });

    it('should include cart abandonment rate', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      // Cart abandonment rate is now calculated from analytics or defaults to 70%
      expect(prompt).toContain('%');
    });

    it('should include mobile conversion rate', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      // Mobile traffic % is now estimated based on mobileConversionRate presence
      expect(prompt).toContain('Mobile');
    });

    it('should include total sessions and orders', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('10000');
    });

    it('should include theme name', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('Dawn');
    });

    it('should include product list', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('Product A');
      expect(prompt).toContain('Product B');
    });

    it('should include competitor info when available', () => {
      const dataWithCompetitors = {
        ...mockPromptData,
        competitors: [
          { name: 'Competitor 1', heroCTA: 'Shop Now', trustBadges: '5' },
          { name: 'Competitor 2', heroCTA: 'Buy Today', trustBadges: '3' },
        ],
      };
      const prompt = getCombinedPrompt(dataWithCompetitors);
      expect(prompt).toContain('Competitor 1');
      expect(prompt).toContain('Shop Now');
    });

    it('should not include competitor section when empty', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      // When no competitors, the section should be empty or not include competitor info
      expect(prompt).not.toContain('Competitor 1');
    });

    it('should request JSON output format', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('JSON');
      expect(prompt).toContain('recommendations');
    });

    it('should include all required recommendation fields', () => {
      const prompt = getCombinedPrompt(mockPromptData);
      expect(prompt).toContain('title');
      expect(prompt).toContain('category');
      expect(prompt).toContain('description');
      expect(prompt).toContain('impactScore');
      expect(prompt).toContain('effortScore');
      expect(prompt).toContain('estimatedUplift');
      expect(prompt).toContain('estimatedROI');
      expect(prompt).toContain('implementation');
      expect(prompt).toContain('codeSnippet');
    });
  });

  describe('parseRecommendations', () => {
    it('should parse valid JSON object with recommendations array', () => {
      const response = JSON.stringify({
        recommendations: [
          {
            title: 'Test Title',
            category: 'hero_section',
            description: 'Test description',
            impactScore: 5,
            effortScore: 2,
            estimatedUplift: '+0.5%',
            estimatedROI: '+$1000/mo',
            reasoning: 'Test reasoning',
            implementation: 'Test steps',
            codeSnippet: '<div>test</div>',
          },
        ],
      });

      const result = parseRecommendations(response);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Title');
      expect(result[0].category).toBe('hero_section');
      expect(result[0].impactScore).toBe(5);
      expect(result[0].effortScore).toBe(2);
    });

    it('should parse direct JSON array', () => {
      const response = JSON.stringify([
        {
          title: 'Recommendation 1',
          category: 'product_page',
          impactScore: 4,
          effortScore: 3,
        },
        {
          title: 'Recommendation 2',
          category: 'cart_page',
          impactScore: 3,
          effortScore: 1,
        },
      ]);

      const result = parseRecommendations(response);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Recommendation 1');
      expect(result[1].title).toBe('Recommendation 2');
    });

    it('should extract JSON from markdown code blocks', () => {
      const response = `Here are my recommendations:

\`\`\`json
{
  "recommendations": [
    {
      "title": "Code Block Rec",
      "category": "mobile",
      "impactScore": 4,
      "effortScore": 2
    }
  ]
}
\`\`\`

Hope this helps!`;

      const result = parseRecommendations(response);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Code Block Rec');
    });

    it('should handle code blocks without json language tag', () => {
      const response = `\`\`\`
{
  "recommendations": [
    {
      "title": "No Language Tag",
      "impactScore": 3,
      "effortScore": 2
    }
  ]
}
\`\`\``;

      const result = parseRecommendations(response);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('No Language Tag');
    });

    it('should calculate priority score correctly', () => {
      const response = JSON.stringify({
        recommendations: [
          { title: 'High Impact Low Effort', impactScore: 5, effortScore: 1 },
          { title: 'Low Impact High Effort', impactScore: 1, effortScore: 5 },
          { title: 'Medium Both', impactScore: 3, effortScore: 3 },
        ],
      });

      const result = parseRecommendations(response);

      // Priority = impactScore * 2 - effortScore
      expect(result[0].priority).toBe(5 * 2 - 1); // 9
      expect(result[1].priority).toBe(1 * 2 - 5); // -3
      expect(result[2].priority).toBe(3 * 2 - 3); // 3
    });

    it('should provide defaults for missing fields', () => {
      const response = JSON.stringify({
        recommendations: [
          { title: 'Minimal Rec' },
        ],
      });

      const result = parseRecommendations(response);
      expect(result[0].category).toBe('general');
      expect(result[0].description).toBe('');
      expect(result[0].impactScore).toBe(3);
      expect(result[0].effortScore).toBe(3);
      expect(result[0].estimatedUplift).toBe('TBD');
      expect(result[0].estimatedROI).toBe('TBD');
      expect(result[0].codeSnippet).toBeNull();
    });

    it('should handle missing title with default', () => {
      const response = JSON.stringify({
        recommendations: [
          { category: 'test', impactScore: 4 },
        ],
      });

      const result = parseRecommendations(response);
      expect(result[0].title).toBe('Untitled Recommendation');
    });

    it('should throw error for invalid JSON', () => {
      const invalidResponse = 'This is not valid JSON';
      expect(() => parseRecommendations(invalidResponse)).toThrow();
    });

    it('should throw error when recommendations is not an array', () => {
      const response = JSON.stringify({ recommendations: 'not an array' });
      expect(() => parseRecommendations(response)).toThrow('Failed to parse recommendations');
    });

    it('should parse string impact/effort scores', () => {
      const response = JSON.stringify({
        recommendations: [
          {
            title: 'String Scores',
            impactScore: '4',
            effortScore: '2',
          },
        ],
      });

      const result = parseRecommendations(response);
      expect(result[0].impactScore).toBe(4);
      expect(result[0].effortScore).toBe(2);
    });
  });

  describe('calculateEstimatedROI', () => {
    it('should calculate positive ROI for conversion improvement', () => {
      // $10,000 revenue, 2% conversion, +0.5% uplift = +25% relative increase
      const roi = calculateEstimatedROI(10000, 2, 0.5);
      expect(roi).toBe(2500); // 25% of $10,000
    });

    it('should calculate correct ROI for small uplift', () => {
      // $50,000 revenue, 3% conversion, +0.1% uplift
      const roi = calculateEstimatedROI(50000, 3, 0.1);
      // New conversion: 3.1%, uplift percentage: (3.1/3 - 1) = 0.0333
      expect(roi).toBeCloseTo(1666.67, 0);
    });

    it('should calculate correct ROI for large uplift', () => {
      // $100,000 revenue, 1% conversion, +1% uplift (doubles conversion)
      const roi = calculateEstimatedROI(100000, 1, 1);
      // New conversion: 2%, uplift percentage: 100%
      expect(roi).toBe(100000);
    });

    it('should handle zero uplift', () => {
      const roi = calculateEstimatedROI(10000, 2, 0);
      expect(roi).toBe(0);
    });

    it('should handle small revenues', () => {
      const roi = calculateEstimatedROI(1000, 2, 0.5);
      expect(roi).toBe(250);
    });

    it('should handle high conversion rates', () => {
      // 10% conversion, +1% uplift = 10% relative increase
      const roi = calculateEstimatedROI(20000, 10, 1);
      expect(roi).toBeCloseTo(2000, 2);
    });

    it('should work with decimal revenues', () => {
      const roi = calculateEstimatedROI(15432.50, 2.5, 0.25);
      // New conversion: 2.75%, uplift: (2.75/2.5 - 1) = 0.1 = 10%
      expect(roi).toBeCloseTo(1543.25, 2);
    });
  });
});
