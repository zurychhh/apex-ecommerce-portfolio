/**
 * Unit tests for billing.server.ts
 */

import {
  PLANS,
  getPlan,
  getResponseLimit,
  canGenerateResponse,
  comparePlans,
  hasFeature,
  isNewBillingCycle,
  getPlanFromSubscription,
  getNextBillingDate,
} from '~/utils/billing.server';

describe('billing.server', () => {
  describe('PLANS constant', () => {
    it('should have all required plans defined', () => {
      expect(PLANS).toHaveProperty('free');
      expect(PLANS).toHaveProperty('starter');
      expect(PLANS).toHaveProperty('growth');
      expect(PLANS).toHaveProperty('agency');
    });

    it('should have correct pricing for each plan', () => {
      expect(PLANS.free.price).toBe(0);
      expect(PLANS.starter.price).toBe(19);
      expect(PLANS.growth.price).toBe(49);
      expect(PLANS.agency.price).toBe(149);
    });

    it('should have growth plan marked as recommended', () => {
      expect(PLANS.growth.recommended).toBe(true);
    });

    it('should have correct response limits', () => {
      expect(PLANS.free.features.responsesPerMonth).toBe(10);
      expect(PLANS.starter.features.responsesPerMonth).toBe(100);
      expect(PLANS.growth.features.responsesPerMonth).toBe(-1); // Unlimited
      expect(PLANS.agency.features.responsesPerMonth).toBe(-1); // Unlimited
    });
  });

  describe('getPlan', () => {
    it('should return correct plan for valid plan key', () => {
      expect(getPlan('starter').name).toBe('Starter');
      expect(getPlan('growth').name).toBe('Growth');
    });

    it('should return free plan for invalid plan key', () => {
      expect(getPlan('invalid').name).toBe('Free');
      expect(getPlan('').name).toBe('Free');
    });
  });

  describe('getResponseLimit', () => {
    it('should return correct limits for each plan', () => {
      expect(getResponseLimit('free')).toBe(10);
      expect(getResponseLimit('starter')).toBe(100);
      expect(getResponseLimit('growth')).toBe(-1);
      expect(getResponseLimit('agency')).toBe(-1);
    });

    it('should return free limit for unknown plan', () => {
      expect(getResponseLimit('unknown')).toBe(10);
    });
  });

  describe('canGenerateResponse', () => {
    it('should allow generation when under limit', () => {
      const result = canGenerateResponse('free', 5);
      expect(result.allowed).toBe(true);
    });

    it('should deny generation when at limit', () => {
      const result = canGenerateResponse('free', 10);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('monthly limit');
    });

    it('should deny generation when over limit', () => {
      const result = canGenerateResponse('free', 15);
      expect(result.allowed).toBe(false);
    });

    it('should always allow unlimited plans', () => {
      expect(canGenerateResponse('growth', 1000).allowed).toBe(true);
      expect(canGenerateResponse('agency', 10000).allowed).toBe(true);
    });
  });

  describe('comparePlans', () => {
    it('should detect upgrades', () => {
      expect(comparePlans('free', 'starter')).toBe('upgrade');
      expect(comparePlans('starter', 'growth')).toBe('upgrade');
      expect(comparePlans('growth', 'agency')).toBe('upgrade');
      expect(comparePlans('free', 'agency')).toBe('upgrade');
    });

    it('should detect downgrades', () => {
      expect(comparePlans('agency', 'growth')).toBe('downgrade');
      expect(comparePlans('growth', 'starter')).toBe('downgrade');
      expect(comparePlans('starter', 'free')).toBe('downgrade');
    });

    it('should detect same plan', () => {
      expect(comparePlans('free', 'free')).toBe('same');
      expect(comparePlans('growth', 'growth')).toBe('same');
    });
  });

  describe('hasFeature', () => {
    it('should check boolean features correctly', () => {
      expect(hasFeature('free', 'bulkActions')).toBe(false);
      expect(hasFeature('growth', 'bulkActions')).toBe(true);
      expect(hasFeature('free', 'customBrandVoice')).toBe(false);
      expect(hasFeature('starter', 'customBrandVoice')).toBe(true);
    });

    it('should check array features correctly', () => {
      expect(hasFeature('free', 'tones')).toBe(true); // Has at least one tone
    });

    it('should check numeric features correctly', () => {
      expect(hasFeature('free', 'responsesPerMonth')).toBe(true); // 10 > 0
      expect(hasFeature('growth', 'responsesPerMonth')).toBe(true); // -1 !== 0
    });

    it('should return false for unknown plan', () => {
      expect(hasFeature('unknown', 'bulkActions')).toBe(false);
    });
  });

  describe('getPlanFromSubscription', () => {
    it('should extract plan from subscription name', () => {
      expect(getPlanFromSubscription('ReviewBoost AI Starter')).toBe('starter');
      expect(getPlanFromSubscription('ReviewBoost AI Growth')).toBe('growth');
      expect(getPlanFromSubscription('ReviewBoost AI Agency')).toBe('agency');
    });

    it('should be case insensitive', () => {
      expect(getPlanFromSubscription('REVIEWBOOST AI STARTER')).toBe('starter');
      expect(getPlanFromSubscription('reviewboost ai growth')).toBe('growth');
    });

    it('should return free for unknown subscription', () => {
      expect(getPlanFromSubscription('Unknown Plan')).toBe('free');
      expect(getPlanFromSubscription('')).toBe('free');
    });
  });

  describe('isNewBillingCycle', () => {
    it('should return true if no last reset date', () => {
      expect(isNewBillingCycle(null)).toBe(true);
      expect(isNewBillingCycle(undefined)).toBe(true);
    });

    it('should return false if reset was this month', () => {
      const thisMonth = new Date();
      expect(isNewBillingCycle(thisMonth)).toBe(false);
    });

    it('should return true if reset was last month', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      expect(isNewBillingCycle(lastMonth)).toBe(true);
    });

    it('should return true if reset was last year', () => {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      expect(isNewBillingCycle(lastYear)).toBe(true);
    });
  });

  describe('getNextBillingDate', () => {
    it('should return first of next month', () => {
      const nextBilling = getNextBillingDate();
      const now = new Date();
      const expectedMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;

      expect(nextBilling.getDate()).toBe(1);
      expect(nextBilling.getMonth()).toBe(expectedMonth);
    });
  });
});
