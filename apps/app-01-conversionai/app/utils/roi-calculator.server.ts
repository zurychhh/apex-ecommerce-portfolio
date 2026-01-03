/**
 * ROI Calculator Module
 * Calculates realistic ROI based on actual store metrics,
 * not generic estimates like "+8-12%"
 */

export interface StoreMetrics {
  conversionRate: number; // 1.8
  avgOrderValue: number; // 85
  monthlyVisitors: number; // 12000
  mobilePercentage: number; // 65
  cartAbandonmentRate: number; // 68
}

export interface ROICalculation {
  estimatedLift: string; // "+0.6% CR"
  monthlyRevenue: string; // "+$4,590/mo"
  annualRevenue: string; // "+$55,080/yr"
  confidence: number; // 85%
  calculation: {
    current: string; // "1.8% × 12,000 = 216 orders/mo"
    projected: string; // "2.4% × 12,000 = 270 orders/mo"
    difference: string; // "+54 orders × $85 AOV = $4,590/mo"
  };
  assumptions: string[];
}

// Mapping impact score → realistic CR lift percentage points
const IMPACT_TO_CR_LIFT: Record<number, number> = {
  5: 0.008, // +0.8% CR (critical fix)
  4: 0.005, // +0.5% CR (high impact)
  3: 0.003, // +0.3% CR (medium)
  2: 0.0015, // +0.15% CR (low)
  1: 0.0005, // +0.05% CR (minimal)
};

// Category-specific multipliers (some categories have broader impact)
const CATEGORY_MULTIPLIERS: Record<string, number> = {
  hero: 1.2, // Hero section affects all users
  product: 1.0, // Standard product page impact
  cart: 1.3, // Cart optimization has high impact
  checkout: 1.4, // Checkout is critical path
  mobile: 0.8, // Only affects mobile users (adjusted by mobilePercentage)
  trust: 1.1, // Trust signals help conversions
  navigation: 0.9, // Navigation issues affect less
  speed: 1.15, // Speed affects everyone
};

// Confidence based on effort (easier = more predictable)
const EFFORT_TO_CONFIDENCE: Record<number, number> = {
  1: 95, // Very easy, proven pattern
  2: 85, // Easy, likely works
  3: 75, // Medium complexity
  4: 65, // Hard, more variables
  5: 55, // Very hard, uncertain
};

/**
 * Calculate realistic ROI for a recommendation
 */
export function calculateRealisticROI(
  impact: number, // 1-5
  effort: number, // 1-5
  category: string,
  metrics: StoreMetrics
): ROICalculation {
  // Validate inputs
  const validImpact = Math.max(1, Math.min(5, Math.round(impact)));
  const validEffort = Math.max(1, Math.min(5, Math.round(effort)));

  // Get base CR lift from impact score
  const baseCRLift = IMPACT_TO_CR_LIFT[validImpact] || 0.003;

  // Apply category multiplier
  const multiplier = CATEGORY_MULTIPLIERS[category.toLowerCase()] || 1.0;
  const adjustedCRLift = baseCRLift * multiplier;

  // Calculate effective traffic (for mobile-only changes)
  let effectiveTraffic = metrics.monthlyVisitors;
  if (category.toLowerCase() === 'mobile') {
    effectiveTraffic = metrics.monthlyVisitors * (metrics.mobilePercentage / 100);
  }

  // Convert current CR from percentage to decimal
  const currentCR = metrics.conversionRate / 100;
  const projectedCR = currentCR + adjustedCRLift;

  // Calculate orders
  const currentOrders = effectiveTraffic * currentCR;
  const projectedOrders = effectiveTraffic * projectedCR;
  const additionalOrders = projectedOrders - currentOrders;

  // Calculate revenue impact
  const monthlyRevenueLift = additionalOrders * metrics.avgOrderValue;
  const annualRevenueLift = monthlyRevenueLift * 12;

  // Calculate confidence
  const baseConfidence = EFFORT_TO_CONFIDENCE[validEffort] || 70;
  const impactBonus = validImpact >= 4 ? 10 : validImpact >= 3 ? 5 : 0;
  const finalConfidence = Math.min(95, baseConfidence + impactBonus);

  // Build calculation breakdown
  const calculation = {
    current: `${(currentCR * 100).toFixed(2)}% CR × ${effectiveTraffic.toLocaleString()} visits = ${Math.round(currentOrders).toLocaleString()} orders/mo`,
    projected: `${(projectedCR * 100).toFixed(2)}% CR × ${effectiveTraffic.toLocaleString()} visits = ${Math.round(projectedOrders).toLocaleString()} orders/mo`,
    difference: `+${Math.round(additionalOrders).toLocaleString()} orders × $${metrics.avgOrderValue} AOV = +$${Math.round(monthlyRevenueLift).toLocaleString()}/mo`,
  };

  // Build assumptions list
  const assumptions = [
    `Impact score ${validImpact}/5 translates to +${(adjustedCRLift * 100).toFixed(2)}% CR lift`,
    category.toLowerCase() === 'mobile'
      ? `Mobile-only impact (${metrics.mobilePercentage}% of traffic = ${effectiveTraffic.toLocaleString()} visitors)`
      : 'Affects all traffic',
    `AOV remains constant at $${metrics.avgOrderValue}`,
    `No seasonal variations considered`,
    `Confidence ${finalConfidence}% based on effort level ${validEffort}/5`,
  ];

  return {
    estimatedLift: `+${(adjustedCRLift * 100).toFixed(2)}% CR`,
    monthlyRevenue: `+$${Math.round(monthlyRevenueLift).toLocaleString()}/mo`,
    annualRevenue: `+$${Math.round(annualRevenueLift).toLocaleString()}/yr`,
    confidence: finalConfidence,
    calculation,
    assumptions,
  };
}

/**
 * Format ROI calculation for human-readable display
 */
export function formatROIForDisplay(roi: ROICalculation): string {
  return `
**Expected Impact:**
${roi.estimatedLift} (${roi.confidence}% confidence)

**Revenue Impact:**
- Monthly: ${roi.monthlyRevenue}
- Annual: ${roi.annualRevenue}

**Calculation:**
${roi.calculation.current}
${roi.calculation.projected}
= ${roi.calculation.difference}

**Assumptions:**
${roi.assumptions.map(a => `- ${a}`).join('\n')}
`.trim();
}

/**
 * Calculate total ROI for multiple recommendations
 */
export function calculateTotalROI(
  recommendations: Array<{ impact: number; effort: number; category: string }>,
  metrics: StoreMetrics
): {
  totalMonthly: string;
  totalAnnual: string;
  avgConfidence: number;
  recommendationCount: number;
} {
  let totalMonthlyRevenue = 0;
  let totalConfidence = 0;

  for (const rec of recommendations) {
    const roi = calculateRealisticROI(rec.impact, rec.effort, rec.category, metrics);
    // Extract numeric value from formatted string
    const monthlyValue = parseInt(roi.monthlyRevenue.replace(/[^0-9]/g, ''), 10) || 0;
    totalMonthlyRevenue += monthlyValue;
    totalConfidence += roi.confidence;
  }

  const avgConfidence = Math.round(totalConfidence / recommendations.length);
  const totalAnnualRevenue = totalMonthlyRevenue * 12;

  return {
    totalMonthly: `+$${totalMonthlyRevenue.toLocaleString()}/mo`,
    totalAnnual: `+$${totalAnnualRevenue.toLocaleString()}/yr`,
    avgConfidence,
    recommendationCount: recommendations.length,
  };
}

/**
 * Get industry benchmark for comparison
 */
export function getIndustryBenchmark(metrics: StoreMetrics): {
  crComparison: string;
  aovComparison: string;
  cartAbandonmentComparison: string;
} {
  // Industry averages (can be customized by vertical)
  const industryAvgCR = 2.4;
  const industryAvgAOV = 120;
  const industryAvgCartAbandonment = 69.8;

  const crGap = metrics.conversionRate - industryAvgCR;
  const aovGap = metrics.avgOrderValue - industryAvgAOV;
  const cartGap = metrics.cartAbandonmentRate - industryAvgCartAbandonment;

  return {
    crComparison: crGap >= 0
      ? `Your CR ${metrics.conversionRate}% is +${crGap.toFixed(1)}% above industry avg ${industryAvgCR}%`
      : `Your CR ${metrics.conversionRate}% is ${crGap.toFixed(1)}% below industry avg ${industryAvgCR}%`,
    aovComparison: aovGap >= 0
      ? `Your AOV $${metrics.avgOrderValue} is +$${Math.abs(aovGap).toFixed(0)} above industry avg $${industryAvgAOV}`
      : `Your AOV $${metrics.avgOrderValue} is -$${Math.abs(aovGap).toFixed(0)} below industry avg $${industryAvgAOV}`,
    cartAbandonmentComparison: cartGap <= 0
      ? `Your cart abandonment ${metrics.cartAbandonmentRate}% is ${Math.abs(cartGap).toFixed(1)}% better than avg ${industryAvgCartAbandonment}%`
      : `Your cart abandonment ${metrics.cartAbandonmentRate}% is +${cartGap.toFixed(1)}% worse than avg ${industryAvgCartAbandonment}%`,
  };
}
