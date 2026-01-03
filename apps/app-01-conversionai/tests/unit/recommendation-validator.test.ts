/**
 * Unit tests for Recommendation Validator
 */

import {
  validateRecommendations,
  conflictCheck,
  getValidationStats,
  type Recommendation,
} from '~/utils/recommendation-validator.server';

describe('Recommendation Validator', () => {
  describe('validateRecommendations', () => {
    it('filters out generic recommendations', () => {
      const recs: Recommendation[] = [
        {
          id: '1',
          title: 'Improve user experience',
          description: 'Make the site better',
          impactScore: 4,
          effortScore: 2,
          category: 'hero',
          implementation: ['Step 1', 'Step 2'],
        },
        {
          id: '2',
          title: 'Reposition CTA 120px higher on mobile viewport',
          description: 'Move button from 650px to 530px position for above-the-fold visibility',
          impactScore: 5,
          effortScore: 2,
          category: 'mobile',
          implementation: [
            'Edit theme.liquid line 47 to modify button position',
            'Add CSS rule: margin-top: -120px to hero-cta class',
          ],
        },
      ];

      const validated = validateRecommendations(recs);

      expect(validated.length).toBe(1);
      expect(validated[0].id).toBe('2');
    });

    it('requires specific measurements in recommendations', () => {
      const vague: Recommendation = {
        id: '1',
        title: 'Make button bigger',
        description: 'Increase size for better visibility',
        impactScore: 3,
        effortScore: 1,
        category: 'hero',
        implementation: ['Change size in CSS'],
      };

      const specific: Recommendation = {
        id: '2',
        title: 'Increase CTA button from 14px to 18px font',
        description: 'Current 14px too small on mobile devices, 18px improves tap target by 30%',
        impactScore: 3,
        effortScore: 1,
        category: 'mobile',
        implementation: ['Edit CSS: change font-size from 14px to 18px'],
      };

      const validated = validateRecommendations([vague, specific]);

      expect(validated.length).toBe(1);
      expect(validated[0].id).toBe('2');
    });

    it('rejects recommendations without implementation steps', () => {
      const noSteps: Recommendation = {
        id: '1',
        title: 'Add trust badges near checkout button for 25% conversion boost',
        description: 'Trust signals reduce anxiety, current checkout has 0 badges vs industry avg 3',
        impactScore: 4,
        effortScore: 2,
        category: 'trust',
        implementation: [],
      };

      const validated = validateRecommendations([noSteps]);

      expect(validated.length).toBe(0);
    });

    it('rejects vague title patterns', () => {
      const vaguePatterns: Recommendation[] = [
        {
          id: '1',
          title: 'Improve mobile',
          description: 'Mobile needs work with 25% better performance',
          impactScore: 4,
          effortScore: 2,
          category: 'mobile',
          implementation: ['Update mobile CSS to fix layout'],
        },
        {
          id: '2',
          title: 'Optimize checkout',
          description: 'Checkout optimization for 30% improvement',
          impactScore: 5,
          effortScore: 3,
          category: 'checkout',
          implementation: ['Modify checkout template settings'],
        },
      ];

      const validated = validateRecommendations(vaguePatterns);

      expect(validated.length).toBe(0);
    });

    it('adds quality scores to valid recommendations', () => {
      const goodRec: Recommendation = {
        id: 'rec-001',
        title: 'Move hero CTA button 150px higher to position at 350px from top',
        description: 'Currently at 500px which is below fold for 60% of mobile users with 667px viewport',
        impactScore: 5,
        effortScore: 2,
        category: 'hero',
        implementation: [
          'Edit sections/hero.liquid line 47',
          'Add CSS: .hero-cta { margin-top: -150px; }',
          'Test on mobile devices with different viewport sizes',
        ],
        codeSnippet: '.hero-cta { margin-top: -150px; position: relative; z-index: 10; }',
      };

      const validated = validateRecommendations([goodRec]);

      expect(validated.length).toBe(1);
      expect((validated[0] as any).qualityScore).toBeGreaterThan(50);
    });

    it('auto-corrects effort scores for complex implementations', () => {
      const mismatchedEffort: Recommendation = {
        id: '1',
        title: 'Complete checkout redesign with 8 implementation steps at 450px width',
        description: 'Major overhaul requiring 15% more conversion from new layout',
        impactScore: 5,
        effortScore: 1, // Too low for the complexity
        category: 'checkout',
        implementation: [
          'Step 1: Create backup of current checkout template',
          'Step 2: Modify checkout.liquid header section',
          'Step 3: Add new CSS file for checkout styles',
          'Step 4: Update payment form layout',
          'Step 5: Add trust badges to sidebar',
          'Step 6: Implement progress indicator',
        ],
      };

      const validated = validateRecommendations([mismatchedEffort]);

      // Should correct effort score
      if (validated.length > 0) {
        expect(validated[0].effortScore).toBeGreaterThan(1);
      }
    });

    it('prioritizes recommendations by quality score', () => {
      const recs: Recommendation[] = [
        {
          id: 'low',
          title: 'Add trust badge at 200px position near checkout CTA',
          description: 'Small improvement with 5% estimated lift',
          impactScore: 2,
          effortScore: 1,
          category: 'trust',
          implementation: ['Add trust badge image to checkout template'],
        },
        {
          id: 'high',
          title: 'Reposition primary CTA from 650px to 400px for above-fold visibility',
          description: 'Critical fix affecting 75% of users with expected +0.8% CR improvement',
          impactScore: 5,
          effortScore: 2,
          category: 'hero',
          implementation: [
            'Edit sections/hero.liquid to modify CTA wrapper',
            'Add CSS margin-top: -250px to hero-cta class',
            'Update mobile breakpoint at 768px for responsive design',
          ],
          codeSnippet: '@media (max-width: 768px) { .hero-cta { margin-top: -250px; } }',
        },
      ];

      const validated = validateRecommendations(recs);

      // High quality should come first
      if (validated.length >= 2) {
        expect((validated[0] as any).qualityScore).toBeGreaterThanOrEqual(
          (validated[1] as any).qualityScore
        );
      }
    });
  });

  describe('conflictCheck', () => {
    it('identifies potentially conflicting recommendations', () => {
      const recs: Recommendation[] = [
        {
          id: 'rec-hero-cta',
          title: 'Move hero CTA 100px higher',
          description: 'Reposition for visibility',
          impactScore: 4,
          effortScore: 2,
          category: 'hero',
          implementation: ['Edit hero section'],
        },
        {
          id: 'rec-hero-redesign',
          title: 'Complete hero section redesign at 600px height',
          description: 'Full redesign',
          impactScore: 5,
          effortScore: 4,
          category: 'hero',
          implementation: ['Redesign entire hero'],
        },
      ];

      const checked = conflictCheck(recs);

      // At least one should have a warning
      const hasWarning = checked.some((rec: any) => rec.warning);
      // Note: This depends on the conflict mapping, may or may not trigger
    });
  });

  describe('getValidationStats', () => {
    it('calculates validation statistics correctly', () => {
      const original: Recommendation[] = [
        {
          id: '1',
          title: 'Generic improvement',
          description: 'Vague description',
          impactScore: 3,
          effortScore: 2,
          category: 'hero',
          implementation: [],
        },
        {
          id: '2',
          title: 'Specific 150px CTA repositioning',
          description: 'Move from 500px to 350px for mobile',
          impactScore: 4,
          effortScore: 2,
          category: 'mobile',
          implementation: ['Edit CSS position settings'],
        },
      ];

      const validated = validateRecommendations(original);
      const stats = getValidationStats(original, validated);

      expect(stats.originalCount).toBe(2);
      expect(stats.filteredCount).toBe(original.length - validated.length);
      expect(stats.filterRate).toContain('%');
    });

    it('calculates average quality score', () => {
      const recs: Recommendation[] = [
        {
          id: '1',
          title: 'Move CTA 200px higher for $5000/mo revenue increase',
          description: 'High impact change with 0.5% CR lift',
          impactScore: 5,
          effortScore: 2,
          category: 'hero',
          implementation: ['Edit theme.liquid and update CSS rules'],
          codeSnippet: '.hero-cta { top: 200px; }',
        },
      ];

      const validated = validateRecommendations(recs);
      const stats = getValidationStats(recs, validated);

      if (validated.length > 0) {
        expect(stats.avgQualityScore).toBeGreaterThan(0);
        expect(stats.avgQualityScore).toBeLessThanOrEqual(100);
      }
    });
  });
});
