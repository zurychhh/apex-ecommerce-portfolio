/**
 * Unit tests for billing.server.ts
 * Tests billing plans, features, and utility functions
 */

import {
  PLANS,
  getPlanFromSubscription,
  canPerformAnalysis,
  getPlanFeatures,
  comparePlans,
} from '../../app/utils/billing.server';

describe('Billing Server Utils', () => {
  describe('PLANS constant', () => {
    it('should have all four plan tiers defined', () => {
      expect(PLANS).toHaveProperty('free');
      expect(PLANS).toHaveProperty('basic');
      expect(PLANS).toHaveProperty('pro');
      expect(PLANS).toHaveProperty('enterprise');
    });

    it('should have correct pricing for each plan', () => {
      expect(PLANS.free.price).toBe(0);
      expect(PLANS.basic.price).toBe(29);
      expect(PLANS.pro.price).toBe(79);
      expect(PLANS.enterprise.price).toBe(199);
    });

    it('should have trial days only for paid plans', () => {
      expect(PLANS.free.trialDays).toBe(0);
      expect(PLANS.basic.trialDays).toBe(7);
      expect(PLANS.pro.trialDays).toBe(7);
      expect(PLANS.enterprise.trialDays).toBe(14);
    });

    it('should have increasing analysis limits per plan', () => {
      expect(PLANS.free.features.analysisPerMonth).toBe(1);
      expect(PLANS.basic.features.analysisPerMonth).toBe(4);
      expect(PLANS.pro.features.analysisPerMonth).toBe(12);
      expect(PLANS.enterprise.features.analysisPerMonth).toBe(999);
    });

    it('should have email notifications only for paid plans', () => {
      expect(PLANS.free.features.emailNotifications).toBe(false);
      expect(PLANS.basic.features.emailNotifications).toBe(true);
      expect(PLANS.pro.features.emailNotifications).toBe(true);
      expect(PLANS.enterprise.features.emailNotifications).toBe(true);
    });

    it('should have weekly refresh only for pro and enterprise', () => {
      expect(PLANS.free.features.weeklyRefresh).toBe(false);
      expect(PLANS.basic.features.weeklyRefresh).toBe(false);
      expect(PLANS.pro.features.weeklyRefresh).toBe(true);
      expect(PLANS.enterprise.features.weeklyRefresh).toBe(true);
    });

    it('should have priority support only for pro and enterprise', () => {
      expect(PLANS.free.features.prioritySupport).toBeUndefined();
      expect(PLANS.basic.features.prioritySupport).toBeUndefined();
      expect(PLANS.pro.features.prioritySupport).toBe(true);
      expect(PLANS.enterprise.features.prioritySupport).toBe(true);
    });
  });

  describe('getPlanFromSubscription', () => {
    it('should return "enterprise" for enterprise subscription names', () => {
      expect(getPlanFromSubscription('ConversionAI Enterprise')).toBe('enterprise');
      expect(getPlanFromSubscription('ENTERPRISE Plan')).toBe('enterprise');
      expect(getPlanFromSubscription('My Store - Enterprise')).toBe('enterprise');
    });

    it('should return "pro" for pro subscription names', () => {
      expect(getPlanFromSubscription('ConversionAI Pro')).toBe('pro');
      expect(getPlanFromSubscription('PRO Plan')).toBe('pro');
      expect(getPlanFromSubscription('My Store - Pro')).toBe('pro');
    });

    it('should return "basic" for basic subscription names', () => {
      expect(getPlanFromSubscription('ConversionAI Basic')).toBe('basic');
      expect(getPlanFromSubscription('BASIC Plan')).toBe('basic');
      expect(getPlanFromSubscription('My Store - Basic')).toBe('basic');
    });

    it('should return "free" for unrecognized subscription names', () => {
      expect(getPlanFromSubscription('Unknown Plan')).toBe('free');
      expect(getPlanFromSubscription('')).toBe('free');
      expect(getPlanFromSubscription('Standard')).toBe('free');
    });

    it('should be case-insensitive', () => {
      expect(getPlanFromSubscription('CONVERSIONAI PRO')).toBe('pro');
      expect(getPlanFromSubscription('conversionai basic')).toBe('basic');
      expect(getPlanFromSubscription('Enterprise')).toBe('enterprise');
    });
  });

  describe('canPerformAnalysis', () => {
    describe('free plan limits', () => {
      it('should allow first analysis on free plan', async () => {
        const result = await canPerformAnalysis('free', 0);
        expect(result.allowed).toBe(true);
        expect(result.reason).toBeUndefined();
      });

      it('should deny second analysis on free plan', async () => {
        const result = await canPerformAnalysis('free', 1);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('1 analyses');
        expect(result.reason).toContain('Upgrade');
      });

      it('should deny when over limit on free plan', async () => {
        const result = await canPerformAnalysis('free', 5);
        expect(result.allowed).toBe(false);
      });
    });

    describe('basic plan limits', () => {
      it('should allow analyses within basic limit', async () => {
        expect((await canPerformAnalysis('basic', 0)).allowed).toBe(true);
        expect((await canPerformAnalysis('basic', 1)).allowed).toBe(true);
        expect((await canPerformAnalysis('basic', 2)).allowed).toBe(true);
        expect((await canPerformAnalysis('basic', 3)).allowed).toBe(true);
      });

      it('should deny at basic limit', async () => {
        const result = await canPerformAnalysis('basic', 4);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('4 analyses');
      });
    });

    describe('pro plan limits', () => {
      it('should allow analyses within pro limit', async () => {
        expect((await canPerformAnalysis('pro', 0)).allowed).toBe(true);
        expect((await canPerformAnalysis('pro', 5)).allowed).toBe(true);
        expect((await canPerformAnalysis('pro', 11)).allowed).toBe(true);
      });

      it('should deny at pro limit', async () => {
        const result = await canPerformAnalysis('pro', 12);
        expect(result.allowed).toBe(false);
        expect(result.reason).toContain('12 analyses');
      });
    });

    describe('enterprise plan (unlimited)', () => {
      it('should always allow for enterprise', async () => {
        expect((await canPerformAnalysis('enterprise', 0)).allowed).toBe(true);
        expect((await canPerformAnalysis('enterprise', 100)).allowed).toBe(true);
        expect((await canPerformAnalysis('enterprise', 500)).allowed).toBe(true);
        expect((await canPerformAnalysis('enterprise', 998)).allowed).toBe(true);
      });
    });

    describe('unknown plan', () => {
      it('should fall back to free plan limits for unknown plans', async () => {
        const result = await canPerformAnalysis('unknown', 1);
        expect(result.allowed).toBe(false);
      });
    });
  });

  describe('getPlanFeatures', () => {
    it('should return free plan features for "free" key', () => {
      const features = getPlanFeatures('free');
      expect(features.analysisPerMonth).toBe(1);
      expect(features.recommendations).toBe(10);
      expect(features.emailNotifications).toBe(false);
    });

    it('should return basic plan features for "basic" key', () => {
      const features = getPlanFeatures('basic');
      expect(features.analysisPerMonth).toBe(4);
      expect(features.recommendations).toBe(20);
      expect(features.emailNotifications).toBe(true);
      expect(features.competitorTracking).toBe(3);
    });

    it('should return pro plan features for "pro" key', () => {
      const features = getPlanFeatures('pro');
      expect(features.analysisPerMonth).toBe(12);
      expect(features.recommendations).toBe(50);
      expect(features.weeklyRefresh).toBe(true);
      expect(features.prioritySupport).toBe(true);
      expect(features.competitorTracking).toBe(10);
    });

    it('should return enterprise plan features for "enterprise" key', () => {
      const features = getPlanFeatures('enterprise');
      expect(features.analysisPerMonth).toBe(999);
      expect(features.recommendations).toBe(999);
      expect(features.competitorTracking).toBe(999);
    });

    it('should return free plan features for unknown keys', () => {
      const features = getPlanFeatures('nonexistent');
      expect(features.analysisPerMonth).toBe(1);
      expect(features.recommendations).toBe(10);
    });
  });

  describe('comparePlans', () => {
    describe('upgrade scenarios', () => {
      it('should detect upgrade from free to any paid plan', () => {
        expect(comparePlans('free', 'basic')).toBe('upgrade');
        expect(comparePlans('free', 'pro')).toBe('upgrade');
        expect(comparePlans('free', 'enterprise')).toBe('upgrade');
      });

      it('should detect upgrade from basic to higher plans', () => {
        expect(comparePlans('basic', 'pro')).toBe('upgrade');
        expect(comparePlans('basic', 'enterprise')).toBe('upgrade');
      });

      it('should detect upgrade from pro to enterprise', () => {
        expect(comparePlans('pro', 'enterprise')).toBe('upgrade');
      });
    });

    describe('downgrade scenarios', () => {
      it('should detect downgrade from enterprise to any lower plan', () => {
        expect(comparePlans('enterprise', 'pro')).toBe('downgrade');
        expect(comparePlans('enterprise', 'basic')).toBe('downgrade');
        expect(comparePlans('enterprise', 'free')).toBe('downgrade');
      });

      it('should detect downgrade from pro to lower plans', () => {
        expect(comparePlans('pro', 'basic')).toBe('downgrade');
        expect(comparePlans('pro', 'free')).toBe('downgrade');
      });

      it('should detect downgrade from basic to free', () => {
        expect(comparePlans('basic', 'free')).toBe('downgrade');
      });
    });

    describe('same plan scenarios', () => {
      it('should detect same plan for all tiers', () => {
        expect(comparePlans('free', 'free')).toBe('same');
        expect(comparePlans('basic', 'basic')).toBe('same');
        expect(comparePlans('pro', 'pro')).toBe('same');
        expect(comparePlans('enterprise', 'enterprise')).toBe('same');
      });
    });
  });
});
