/**
 * Unit tests for ROI Calculator
 */

import {
  calculateRealisticROI,
  formatROIForDisplay,
  calculateTotalROI,
  getIndustryBenchmark,
  type StoreMetrics,
} from '~/utils/roi-calculator.server';

describe('ROI Calculator', () => {
  const mockMetrics: StoreMetrics = {
    conversionRate: 1.8,
    avgOrderValue: 85,
    monthlyVisitors: 12000,
    mobilePercentage: 65,
    cartAbandonmentRate: 68,
  };

  describe('calculateRealisticROI', () => {
    it('calculates ROI for high impact, low effort', () => {
      const roi = calculateRealisticROI(5, 2, 'hero', mockMetrics);

      expect(roi.confidence).toBeGreaterThan(80);
      expect(roi.estimatedLift).toContain('%');
      expect(roi.monthlyRevenue).toContain('$');
      expect(roi.calculation.current).toBeTruthy();
      expect(roi.calculation.projected).toBeTruthy();
      expect(roi.calculation.difference).toBeTruthy();
      expect(roi.assumptions).toBeInstanceOf(Array);
      expect(roi.assumptions.length).toBeGreaterThan(0);
    });

    it('adjusts for mobile-only changes', () => {
      const mobileROI = calculateRealisticROI(4, 2, 'mobile', mockMetrics);
      const heroROI = calculateRealisticROI(4, 2, 'hero', mockMetrics);

      // Mobile should have lower $ impact (only 65% of traffic)
      const mobileValue = parseInt(mobileROI.monthlyRevenue.replace(/[^0-9]/g, ''));
      const heroValue = parseInt(heroROI.monthlyRevenue.replace(/[^0-9]/g, ''));

      expect(mobileValue).toBeLessThan(heroValue);
    });

    it('confidence decreases with effort', () => {
      const easy = calculateRealisticROI(4, 1, 'hero', mockMetrics);
      const hard = calculateRealisticROI(4, 5, 'hero', mockMetrics);

      expect(easy.confidence).toBeGreaterThan(hard.confidence);
    });

    it('confidence increases with impact', () => {
      const lowImpact = calculateRealisticROI(2, 3, 'hero', mockMetrics);
      const highImpact = calculateRealisticROI(5, 3, 'hero', mockMetrics);

      expect(highImpact.confidence).toBeGreaterThanOrEqual(lowImpact.confidence);
    });

    it('applies category multipliers correctly', () => {
      const checkout = calculateRealisticROI(4, 2, 'checkout', mockMetrics);
      const navigation = calculateRealisticROI(4, 2, 'navigation', mockMetrics);

      // Checkout has higher multiplier (1.4) than navigation (0.9)
      const checkoutValue = parseInt(checkout.monthlyRevenue.replace(/[^0-9]/g, ''));
      const navValue = parseInt(navigation.monthlyRevenue.replace(/[^0-9]/g, ''));

      expect(checkoutValue).toBeGreaterThan(navValue);
    });

    it('handles edge case impact/effort values', () => {
      // Values outside 1-5 should be clamped
      const lowRoi = calculateRealisticROI(0, 0, 'hero', mockMetrics);
      const highRoi = calculateRealisticROI(10, 10, 'hero', mockMetrics);

      expect(lowRoi.estimatedLift).toContain('%');
      expect(highRoi.estimatedLift).toContain('%');
      expect(lowRoi.confidence).toBeGreaterThanOrEqual(50);
      expect(highRoi.confidence).toBeLessThanOrEqual(100);
    });

    it('includes annual revenue calculation', () => {
      const roi = calculateRealisticROI(4, 2, 'cart', mockMetrics);

      const monthlyValue = parseInt(roi.monthlyRevenue.replace(/[^0-9]/g, ''));
      const annualValue = parseInt(roi.annualRevenue.replace(/[^0-9]/g, ''));

      expect(annualValue).toBe(monthlyValue * 12);
    });
  });

  describe('formatROIForDisplay', () => {
    it('formats ROI for human-readable display', () => {
      const roi = calculateRealisticROI(5, 2, 'hero', mockMetrics);
      const formatted = formatROIForDisplay(roi);

      expect(formatted).toContain('Expected Impact');
      expect(formatted).toContain('Revenue Impact');
      expect(formatted).toContain('Calculation');
      expect(formatted).toContain('Assumptions');
    });
  });

  describe('calculateTotalROI', () => {
    it('calculates total ROI for multiple recommendations', () => {
      const recommendations = [
        { impact: 5, effort: 2, category: 'hero' },
        { impact: 4, effort: 3, category: 'cart' },
        { impact: 3, effort: 1, category: 'trust' },
      ];

      const total = calculateTotalROI(recommendations, mockMetrics);

      expect(total.totalMonthly).toContain('$');
      expect(total.totalAnnual).toContain('$');
      expect(total.avgConfidence).toBeGreaterThan(0);
      expect(total.avgConfidence).toBeLessThanOrEqual(100);
      expect(total.recommendationCount).toBe(3);
    });
  });

  describe('getIndustryBenchmark', () => {
    it('compares metrics to industry averages', () => {
      const benchmark = getIndustryBenchmark(mockMetrics);

      expect(benchmark.crComparison).toContain('industry avg');
      expect(benchmark.aovComparison).toContain('industry avg');
      expect(benchmark.cartAbandonmentComparison).toContain('avg');
    });

    it('identifies below-average metrics correctly', () => {
      const poorMetrics: StoreMetrics = {
        conversionRate: 1.0, // Below 2.4% avg
        avgOrderValue: 50, // Below $120 avg
        monthlyVisitors: 5000,
        mobilePercentage: 60,
        cartAbandonmentRate: 80, // Worse than 69.8% avg
      };

      const benchmark = getIndustryBenchmark(poorMetrics);

      expect(benchmark.crComparison).toContain('below');
      expect(benchmark.aovComparison).toContain('below');
      expect(benchmark.cartAbandonmentComparison).toContain('worse');
    });

    it('identifies above-average metrics correctly', () => {
      const goodMetrics: StoreMetrics = {
        conversionRate: 3.5, // Above 2.4% avg
        avgOrderValue: 150, // Above $120 avg
        monthlyVisitors: 20000,
        mobilePercentage: 70,
        cartAbandonmentRate: 55, // Better than 69.8% avg
      };

      const benchmark = getIndustryBenchmark(goodMetrics);

      expect(benchmark.crComparison).toContain('above');
      expect(benchmark.aovComparison).toContain('above');
      expect(benchmark.cartAbandonmentComparison).toContain('better');
    });
  });
});
