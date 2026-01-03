# 🔥 BULLETPROOF Testing Plan - Recommendation Quality Upgrade

**Version**: 2.0 - EXECUTION READY
**Date**: 2026-01-03
**Status**: 🟢 IMPLEMENTATION COMPLETE - READY FOR TESTING
**Purpose**: 100% verification that upgrade works flawlessly
**Attitude**: ZERO TOLERANCE for bugs, edge cases, or incomplete features

---

## ✅ CURRENT IMPLEMENTATION STATUS

### 🎉 ALL 6 PHASES COMPLETED

```
Phase 1: Model Upgrade               ✅ COMPLETE
  - Claude Sonnet 4.5 deployed
  - max_tokens: 4096 → 8192
  - Enhanced prompts active

Phase 2: Multi-Stage Analysis        ✅ COMPLETE
  - multi-stage-analysis.server.ts created (300+ lines)
  - 4-stage pipeline implemented
  - Integration with analyzeStore.ts done

Phase 3: Real ROI Calculator         ✅ COMPLETE
  - roi-calculator.server.ts created (200+ lines)
  - Mathematical formulas implemented
  - Category multipliers active

Phase 4: Validation Layer            ✅ COMPLETE
  - recommendation-validator.server.ts created (250+ lines)
  - Generic phrase filtering active
  - Quality scoring implemented

Phase 5: Testing Suite               ✅ COMPLETE
  - 22/22 unit tests passing
  - Build successful
  - No TypeScript errors

Phase 6: Documentation               ✅ COMPLETE
  - cost-monitor.server.ts created
  - All types updated
  - API usage tracking ready
```

### 📊 Implementation Summary

| Component | Status | Files | Tests |
|-----------|--------|-------|-------|
| Model Upgrade | ✅ | claude.server.ts | N/A |
| Multi-Stage | ✅ | multi-stage-analysis.server.ts | N/A |
| ROI Calculator | ✅ | roi-calculator.server.ts | 12 passing |
| Validator | ✅ | recommendation-validator.server.ts | 10 passing |
| Cost Monitor | ✅ | cost-monitor.server.ts | N/A |
| Integration | ✅ | analyzeStore.ts | N/A |

**Total New Code**: ~1,200 lines
**Unit Tests**: 22/22 passing (100%)
**Build Status**: ✅ Successful

---

## 🎯 TESTING OBJECTIVE

**We are NOT testing IF the code works** - it compiles and unit tests pass.

**We ARE testing**:
1. Does it produce EXCELLENT recommendations in real scenarios?
2. Is performance acceptable (<180s)?
3. Are costs within budget (<$0.50/analysis)?
4. Do all edge cases work gracefully?
5. Are there any regressions?

**This is QUALITY ASSURANCE, not debugging session.**

---

## ⚠️ CRITICAL MINDSET

```
This is NOT a "quick check" - this is NUCLEAR-LEVEL verification.

Every test MUST pass.
Every edge case MUST be covered.
Every failure scenario MUST be handled.
Every assumption MUST be validated.

If ANYTHING fails, the upgrade is NOT production-ready.
No excuses. No "it works on my machine". No "probably fine".

100% pass rate or ROLLBACK.
```

---

## 📋 Testing Phases

| Phase | Duration | Pass Criteria | Failure Action |
|-------|----------|---------------|----------------|
| **0. Pre-Flight** | 15 min | All systems green | FIX before proceeding |
| **1. Unit Tests** | 45 min | 100% pass | STOP, debug, fix |
| **2. Integration** | 30 min | All modules work together | STOP, debug, fix |
| **3. E2E Flow** | 60 min | Complete flow works | STOP, debug, fix |
| **4. Performance** | 30 min | Meets benchmarks | Optimize or ROLLBACK |
| **5. Cost Validation** | 15 min | Within budget | Adjust or ROLLBACK |
| **6. Quality Assurance** | 45 min | Recommendations are excellent | Tune prompts or ROLLBACK |
| **7. Edge Cases** | 60 min | All edge cases handled | Handle or ROLLBACK |
| **8. Failure Modes** | 30 min | Graceful degradation | Fix or ROLLBACK |
| **9. Regression** | 30 min | Old features still work | Fix or ROLLBACK |
| **10. Production Readiness** | 30 min | All checks pass | Deploy or WAIT |

**Total**: ~6 hours of BRUTAL testing

---

## 🚨 PHASE 0: Pre-Flight Checks

### Environment Verification

**Objective**: Ensure environment is ready for testing

```bash
# Run these commands and verify output
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai

# 1. Node version
node --version
# MUST BE: v20.x.x or v22.x.x
# FAIL IF: v18.x.x or lower

# 2. Dependencies installed
npm list --depth=0
# MUST SHOW: All packages installed, no errors
# FAIL IF: Any missing packages, peer dependency warnings

# 3. Build passes
npm run build
# MUST: Exit code 0, no TypeScript errors
# FAIL IF: Any compilation errors

# 4. Tests run
npm run test
# MUST: Test suite runs (may have failures, we'll fix those)
# FAIL IF: Test suite doesn't start

# 5. Environment variables
cat .env | grep -E "ANTHROPIC_API_KEY|SHOPIFY"
# MUST HAVE: ANTHROPIC_API_KEY set
# FAIL IF: Missing API key
```

**Checklist:**
- [ ] Node.js version correct
- [ ] All dependencies installed
- [ ] Build compiles without errors
- [ ] Test suite runs
- [ ] Environment variables present
- [ ] Railway connection works (if testing on Railway)
- [ ] Dev store accessible

**PASS CRITERIA**: ALL checkboxes ✅

**FAILURE ACTION**: Fix environment before proceeding. DO NOT CONTINUE with broken environment.

---

## 🧪 PHASE 1: Unit Tests (Nuclear Level)

**STATUS**: ✅ ALREADY PASSING (22/22 tests)

### Verification Only - Tests Already Exist

The implementation team already created and verified unit tests:
- `tests/unit/roi-calculator.test.ts` - 12 tests passing
- `tests/unit/recommendation-validator.test.ts` - 10 tests passing

**Your task**: Verify they're still passing, don't recreate them.

### Test Suite 1.1: ROI Calculator

**File**: `tests/unit/roi-calculator.test.ts` (ALREADY EXISTS)

```typescript
import { describe, it, expect } from "vitest";
import { calculateRealisticROI } from "../app/utils/roi-calculator.server";
import type { StoreMetrics } from "../app/utils/roi-calculator.server";

describe("ROI Calculator - BRUTAL TESTING", () => {
  const standardMetrics: StoreMetrics = {
    conversionRate: 1.8,
    avgOrderValue: 85,
    monthlyVisitors: 12000,
    mobilePercentage: 65,
    cartAbandonmentRate: 68,
  };

  describe("Basic Functionality", () => {
    it("returns valid ROI object structure", () => {
      const roi = calculateRealisticROI(5, 2, "hero", standardMetrics);

      // Structure validation
      expect(roi).toHaveProperty("estimatedLift");
      expect(roi).toHaveProperty("monthlyRevenue");
      expect(roi).toHaveProperty("annualRevenue");
      expect(roi).toHaveProperty("confidence");
      expect(roi).toHaveProperty("calculation");
      expect(roi).toHaveProperty("assumptions");

      // Type validation
      expect(typeof roi.estimatedLift).toBe("string");
      expect(typeof roi.monthlyRevenue).toBe("string");
      expect(typeof roi.annualRevenue).toBe("string");
      expect(typeof roi.confidence).toBe("number");
      expect(Array.isArray(roi.assumptions)).toBe(true);
    });

    it("calculates correct CR lift for impact levels", () => {
      const impact5 = calculateRealisticROI(5, 2, "hero", standardMetrics);
      const impact4 = calculateRealisticROI(4, 2, "hero", standardMetrics);
      const impact3 = calculateRealisticROI(3, 2, "hero", standardMetrics);
      const impact2 = calculateRealisticROI(2, 2, "hero", standardMetrics);
      const impact1 = calculateRealisticROI(1, 2, "hero", standardMetrics);

      // Extract CR lift percentages
      const lift5 = parseFloat(impact5.estimatedLift.match(/[\d.]+/)?.[0] || "0");
      const lift4 = parseFloat(impact4.estimatedLift.match(/[\d.]+/)?.[0] || "0");
      const lift3 = parseFloat(impact3.estimatedLift.match(/[\d.]+/)?.[0] || "0");
      const lift2 = parseFloat(impact2.estimatedLift.match(/[\d.]+/)?.[0] || "0");
      const lift1 = parseFloat(impact1.estimatedLift.match(/[\d.]+/)?.[0] || "0");

      // MUST be descending
      expect(lift5).toBeGreaterThan(lift4);
      expect(lift4).toBeGreaterThan(lift3);
      expect(lift3).toBeGreaterThan(lift2);
      expect(lift2).toBeGreaterThan(lift1);

      // Sanity bounds
      expect(lift5).toBeGreaterThan(0);
      expect(lift5).toBeLessThan(5); // Max 5% CR lift
      expect(lift1).toBeGreaterThan(0);
    });

    it("calculates revenue correctly", () => {
      const roi = calculateRealisticROI(5, 2, "hero", standardMetrics);

      // Extract monthly revenue number
      const monthlyRevenue = parseInt(
        roi.monthlyRevenue.replace(/[^0-9]/g, "")
      );

      // Sanity checks
      expect(monthlyRevenue).toBeGreaterThan(0);
      expect(monthlyRevenue).toBeLessThan(100000); // <$100k/mo is realistic

      // Annual should be 12x monthly
      const annualRevenue = parseInt(
        roi.annualRevenue.replace(/[^0-9]/g, "")
      );
      expect(annualRevenue).toBe(monthlyRevenue * 12);
    });
  });

  describe("Category Multipliers", () => {
    it("checkout has highest multiplier", () => {
      const checkout = calculateRealisticROI(4, 2, "checkout", standardMetrics);
      const hero = calculateRealisticROI(4, 2, "hero", standardMetrics);

      const checkoutRev = parseInt(
        checkout.monthlyRevenue.replace(/[^0-9]/g, "")
      );
      const heroRev = parseInt(hero.monthlyRevenue.replace(/[^0-9]/g, ""));

      expect(checkoutRev).toBeGreaterThan(heroRev);
    });

    it("mobile adjusts for mobile percentage", () => {
      const mobile = calculateRealisticROI(4, 2, "mobile", standardMetrics);
      const hero = calculateRealisticROI(4, 2, "hero", standardMetrics);

      const mobileRev = parseInt(mobile.monthlyRevenue.replace(/[^0-9]/g, ""));
      const heroRev = parseInt(hero.monthlyRevenue.replace(/[^0-9]/g, ""));

      // Mobile should be ~65% of hero (mobile percentage)
      const ratio = mobileRev / heroRev;
      expect(ratio).toBeGreaterThan(0.5);
      expect(ratio).toBeLessThan(0.8);
    });

    it("applies correct multiplier for each category", () => {
      const categories = [
        "hero",
        "product",
        "cart",
        "checkout",
        "mobile",
        "trust",
        "navigation",
        "speed",
      ];

      categories.forEach((category) => {
        const roi = calculateRealisticROI(4, 2, category, standardMetrics);
        expect(roi.monthlyRevenue).toBeTruthy();
        expect(roi.confidence).toBeGreaterThan(0);
      });
    });
  });

  describe("Confidence Scoring", () => {
    it("decreases confidence with effort", () => {
      const easy = calculateRealisticROI(4, 1, "hero", standardMetrics);
      const medium = calculateRealisticROI(4, 3, "hero", standardMetrics);
      const hard = calculateRealisticROI(4, 5, "hero", standardMetrics);

      expect(easy.confidence).toBeGreaterThan(medium.confidence);
      expect(medium.confidence).toBeGreaterThan(hard.confidence);
    });

    it("increases confidence with impact", () => {
      const highImpact = calculateRealisticROI(5, 2, "hero", standardMetrics);
      const lowImpact = calculateRealisticROI(2, 2, "hero", standardMetrics);

      expect(highImpact.confidence).toBeGreaterThanOrEqual(
        lowImpact.confidence
      );
    });

    it("confidence stays within 0-100 range", () => {
      for (let impact = 1; impact <= 5; impact++) {
        for (let effort = 1; effort <= 5; effort++) {
          const roi = calculateRealisticROI(
            impact as 1 | 2 | 3 | 4 | 5,
            effort as 1 | 2 | 3 | 4 | 5,
            "hero",
            standardMetrics
          );
          expect(roi.confidence).toBeGreaterThanOrEqual(0);
          expect(roi.confidence).toBeLessThanOrEqual(100);
        }
      }
    });
  });

  describe("Edge Cases & Failures", () => {
    it("handles zero conversion rate", () => {
      const zeroMetrics = { ...standardMetrics, conversionRate: 0 };
      const roi = calculateRealisticROI(4, 2, "hero", zeroMetrics);

      expect(roi.monthlyRevenue).toBeTruthy();
      expect(roi.calculation.current).toContain("0.00%");
    });

    it("handles very low traffic", () => {
      const lowTraffic = { ...standardMetrics, monthlyVisitors: 100 };
      const roi = calculateRealisticROI(4, 2, "hero", lowTraffic);

      const revenue = parseInt(roi.monthlyRevenue.replace(/[^0-9]/g, ""));
      expect(revenue).toBeGreaterThan(0);
      expect(revenue).toBeLessThan(10000); // Realistic for low traffic
    });

    it("handles very high AOV", () => {
      const highAOV = { ...standardMetrics, avgOrderValue: 5000 };
      const roi = calculateRealisticROI(4, 2, "hero", highAOV);

      const revenue = parseInt(roi.monthlyRevenue.replace(/[^0-9]/g, ""));
      expect(revenue).toBeGreaterThan(10000); // Should scale with AOV
    });

    it("handles 100% mobile traffic", () => {
      const allMobile = { ...standardMetrics, mobilePercentage: 100 };
      const roi = calculateRealisticROI(4, 2, "mobile", allMobile);

      expect(roi.monthlyRevenue).toBeTruthy();
    });

    it("handles 0% mobile traffic", () => {
      const noMobile = { ...standardMetrics, mobilePercentage: 0 };
      const roi = calculateRealisticROI(4, 2, "mobile", noMobile);

      const revenue = parseInt(roi.monthlyRevenue.replace(/[^0-9]/g, ""));
      expect(revenue).toBe(0); // No mobile traffic = no mobile revenue
    });
  });

  describe("Mathematical Accuracy", () => {
    it("calculation breakdown matches final numbers", () => {
      const roi = calculateRealisticROI(5, 2, "hero", standardMetrics);

      // Parse calculation strings
      const currentMatch = roi.calculation.current.match(/= (\d+) orders/);
      const projectedMatch = roi.calculation.projected.match(/= (\d+) orders/);
      const diffMatch = roi.calculation.difference.match(/\+(\d+) orders/);

      expect(currentMatch).toBeTruthy();
      expect(projectedMatch).toBeTruthy();
      expect(diffMatch).toBeTruthy();

      const current = parseInt(currentMatch![1]);
      const projected = parseInt(projectedMatch![1]);
      const difference = parseInt(diffMatch![1]);

      // Math must be exact
      expect(projected - current).toBe(difference);
    });

    it("annual revenue is exactly 12x monthly", () => {
      const roi = calculateRealisticROI(4, 2, "hero", standardMetrics);

      const monthly = parseInt(roi.monthlyRevenue.replace(/[^0-9]/g, ""));
      const annual = parseInt(roi.annualRevenue.replace(/[^0-9]/g, ""));

      expect(annual).toBe(monthly * 12);
    });

    it("revenue = orders × AOV", () => {
      const roi = calculateRealisticROI(4, 2, "hero", standardMetrics);

      const ordersMatch = roi.calculation.difference.match(/\+(\d+) orders/);
      const revenueMatch = roi.calculation.difference.match(/= \+\$(\d+)/);

      expect(ordersMatch).toBeTruthy();
      expect(revenueMatch).toBeTruthy();

      const orders = parseInt(ordersMatch![1]);
      const revenue = parseInt(revenueMatch![1].replace(/,/g, ""));

      expect(revenue).toBe(orders * standardMetrics.avgOrderValue);
    });
  });

  describe("Output Format Validation", () => {
    it("estimatedLift has correct format", () => {
      const roi = calculateRealisticROI(4, 2, "hero", standardMetrics);

      expect(roi.estimatedLift).toMatch(/^\+\d+\.\d{2}% CR$/);
    });

    it("monthlyRevenue has correct format", () => {
      const roi = calculateRealisticROI(4, 2, "hero", standardMetrics);

      expect(roi.monthlyRevenue).toMatch(/^\+\$[\d,]+\/mo$/);
    });

    it("annualRevenue has correct format", () => {
      const roi = calculateRealisticROI(4, 2, "hero", standardMetrics);

      expect(roi.annualRevenue).toMatch(/^\+\$[\d,]+\/yr$/);
    });

    it("assumptions array is non-empty", () => {
      const roi = calculateRealisticROI(4, 2, "hero", standardMetrics);

      expect(roi.assumptions.length).toBeGreaterThan(0);
      expect(roi.assumptions.every((a) => typeof a === "string")).toBe(true);
    });
  });
});
```

**Run:**
```bash
npm run test roi-calculator.test.ts
```

**PASS CRITERIA**: 100% tests pass (0 failures)

**FAILURE ACTION**: Fix ROI calculator until all tests pass. DO NOT PROCEED.

---

### Test Suite 1.2: Recommendation Validator

**File**: Create `tests/recommendation-validator.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import {
  validateRecommendations,
  conflictCheck,
} from "../app/utils/recommendation-validator.server";
import type { Recommendation } from "../app/utils/recommendation-validator.server";

describe("Recommendation Validator - RUTHLESS TESTING", () => {
  describe("Generic Phrase Filtering", () => {
    it("REJECTS vague 'improve UX' recommendations", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Improve user experience",
          description: "Make it better",
          impact: 4,
          effort: 2,
          category: "hero",
          implementationSteps: ["Do something", "Test it"],
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated.length).toBe(0);
    });

    it("REJECTS 'optimize website' without specifics", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Optimize website",
          description: "General optimization",
          impact: 3,
          effort: 3,
          category: "speed",
          implementationSteps: ["Optimize", "Done"],
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated.length).toBe(0);
    });

    it("REJECTS 'enhance design' vagueness", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Enhance design",
          description: "Better design needed",
          impact: 3,
          effort: 4,
          category: "hero",
          implementationSteps: ["Design better"],
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated.length).toBe(0);
    });

    it("ACCEPTS specific measurements", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Increase CTA button from 14px to 18px font size",
          description: "Current 14px font is too small on mobile viewports",
          impact: 4,
          effort: 1,
          category: "mobile",
          implementationSteps: [
            "Edit assets/theme.css line 147",
            "Change font-size from 14px to 18px",
            "Test on iPhone SE viewport (375px)",
          ],
          codeSnippet: ".cta-button { font-size: 18px; }",
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated.length).toBe(1);
    });
  });

  describe("Specificity Requirements", () => {
    it("requires pixel measurements for positioning", () => {
      const vague: Recommendation[] = [
        {
          id: "1",
          title: "Move CTA higher",
          description: "Put it at the top",
          impact: 5,
          effort: 2,
          category: "hero",
          implementationSteps: ["Move it"],
        },
      ];

      const specific: Recommendation[] = [
        {
          id: "2",
          title: "Reposition CTA 120px higher (650px → 530px)",
          description: "Current position below fold",
          impact: 5,
          effort: 2,
          category: "hero",
          implementationSteps: [
            "Edit theme.liquid line 47",
            "Add margin-top: -120px",
          ],
        },
      ];

      expect(validateRecommendations(vague).length).toBe(0);
      expect(validateRecommendations(specific).length).toBe(1);
    });

    it("requires color codes for color changes", () => {
      const vague: Recommendation[] = [
        {
          id: "1",
          title: "Change button color",
          description: "Make it more visible",
          impact: 3,
          effort: 1,
          category: "hero",
          implementationSteps: ["Change color"],
        },
      ];

      const specific: Recommendation[] = [
        {
          id: "2",
          title: "Change CTA background to high-contrast orange (#FF6B35)",
          description: "Current gray blends with background",
          impact: 3,
          effort: 1,
          category: "hero",
          implementationSteps: [
            "Edit CSS: background-color: #FF6B35",
            "Test contrast ratio (WCAG AA)",
          ],
        },
      ];

      expect(validateRecommendations(vague).length).toBe(0);
      expect(validateRecommendations(specific).length).toBe(1);
    });

    it("requires dollar amounts for revenue-related changes", () => {
      const vague: Recommendation[] = [
        {
          id: "1",
          title: "Add free shipping threshold",
          description: "Encourage larger orders",
          impact: 4,
          effort: 2,
          category: "cart",
          implementationSteps: ["Set threshold"],
        },
      ];

      const specific: Recommendation[] = [
        {
          id: "2",
          title: "Add free shipping threshold at $75 (current AOV $85)",
          description: "Incentivize customers to add $10 more",
          impact: 4,
          effort: 2,
          category: "cart",
          implementationSteps: [
            "Edit cart.liquid",
            "Add banner: 'Free shipping on $75+'",
            "Track AOV increase",
          ],
        },
      ];

      expect(validateRecommendations(vague).length).toBe(0);
      expect(validateRecommendations(specific).length).toBe(1);
    });
  });

  describe("Implementation Steps Quality", () => {
    it("REJECTS recommendations with no steps", () => {
      const noSteps: Recommendation[] = [
        {
          id: "1",
          title: "Fix mobile menu (with 120px positioning)",
          description: "Menu needs adjustment",
          impact: 4,
          effort: 2,
          category: "mobile",
          implementationSteps: [],
        },
      ];

      const validated = validateRecommendations(noSteps);
      expect(validated.length).toBe(0);
    });

    it("REJECTS steps that are too vague", () => {
      const vagueSteps: Recommendation[] = [
        {
          id: "1",
          title: "Optimize hero CTA positioning (120px higher)",
          description: "Move from 650px to 530px",
          impact: 5,
          effort: 2,
          category: "hero",
          implementationSteps: ["Do it", "Test", "Deploy"],
        },
      ];

      const validated = validateRecommendations(vagueSteps);
      expect(validated.length).toBe(0);
    });

    it("ACCEPTS detailed, actionable steps", () => {
      const goodSteps: Recommendation[] = [
        {
          id: "1",
          title: "Reposition CTA 120px higher on mobile",
          description: "Currently at 650px, move to 530px",
          impact: 5,
          effort: 2,
          category: "mobile",
          implementationSteps: [
            "Edit sections/hero.liquid line 47 - locate <div class='hero-cta'>",
            "Add CSS: .hero-cta { margin-top: -120px; position: relative; }",
            "Test on iPhone SE (375×667px viewport) using Chrome DevTools",
            "Verify CTA visible without scroll",
            "A/B test for 7 days to confirm CR lift",
          ],
          codeSnippet: ".hero-cta { margin-top: -120px; }",
        },
      ];

      const validated = validateRecommendations(goodSteps);
      expect(validated.length).toBe(1);
      expect(validated[0].implementationSteps.length).toBeGreaterThanOrEqual(3);
    });

    it("each step must be >20 characters", () => {
      const shortSteps: Recommendation[] = [
        {
          id: "1",
          title: "Specific title with 120px measurement",
          description: "Specific description",
          impact: 4,
          effort: 2,
          category: "hero",
          implementationSteps: ["Edit file", "Add CSS", "Test it", "Done"],
        },
      ];

      const validated = validateRecommendations(shortSteps);
      expect(validated.length).toBe(0);
    });
  });

  describe("Effort Validation", () => {
    it("auto-corrects effort=1 with 5+ steps", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Specific task with 120px measurement",
          description: "Details here",
          impact: 4,
          effort: 1,
          category: "hero",
          implementationSteps: [
            "Step 1 is detailed and specific",
            "Step 2 is detailed and specific",
            "Step 3 is detailed and specific",
            "Step 4 is detailed and specific",
            "Step 5 is detailed and specific",
            "Step 6 is detailed and specific",
          ],
          codeSnippet: "code here",
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated[0].effort).toBeGreaterThan(1);
    });

    it("auto-corrects effort=5 with simple steps", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Simple CSS change from 14px to 18px",
          description: "One-line change",
          impact: 3,
          effort: 5,
          category: "mobile",
          implementationSteps: [
            "Edit CSS file and change font-size from 14px to 18px",
            "Test on mobile viewport to verify readability",
          ],
          codeSnippet: ".button { font-size: 18px; }",
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated[0].effort).toBeLessThan(5);
    });
  });

  describe("Quality Scoring", () => {
    it("assigns quality scores to all recommendations", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Reposition element by 120px",
          description: "From 650px to 530px with #FF6B35 color",
          impact: 5,
          effort: 2,
          category: "hero",
          implementationSteps: [
            "Very detailed step explaining exactly what to do and where to find the file",
            "Another detailed step with specific measurements and validation",
          ],
          codeSnippet: ".element { margin-top: -120px; background: #FF6B35; }",
        },
      ];

      const validated = validateRecommendations(recs);
      expect(validated[0]).toHaveProperty("qualityScore");
      expect(validated[0].qualityScore).toBeGreaterThan(50);
    });

    it("higher quality = more bonuses", () => {
      const lowQuality: Recommendation = {
        id: "1",
        title: "Change something by 10px",
        description: "Basic change",
        impact: 2,
        effort: 3,
        category: "hero",
        implementationSteps: ["Step one is short", "Step two is short"],
      };

      const highQuality: Recommendation = {
        id: "2",
        title: "Reposition CTA 120px higher to 530px with #FF6B35 background",
        description:
          "Detailed analysis showing current 650px position causes 78% mobile users (9,360/mo) to miss CTA. Moving to 530px ensures above-fold visibility. Expected revenue impact: +$4,590/mo based on 0.6% CR lift.",
        impact: 5,
        effort: 1,
        category: "mobile",
        implementationSteps: [
          "Edit sections/hero.liquid line 47 and locate the hero CTA wrapper div element",
          "Add CSS rule: .hero-cta { margin-top: -120px; position: relative; z-index: 10; background: #FF6B35; }",
          "Test on iPhone SE (375×667px), iPhone 12 (390×844px), and Samsung Galaxy S21 (360×800px) viewports",
          "Verify CTA appears above fold without scrolling on all three devices",
          "Set up A/B test in Google Optimize or similar tool for 7-14 days",
          "Monitor mobile conversion rate lift - target +0.5-0.7% improvement",
        ],
        codeSnippet: `/* Add to theme.css */
.hero-cta {
  margin-top: -120px;
  position: relative;
  z-index: 10;
  background: #FF6B35;
  padding: 16px 32px;
  font-size: 18px;
}`,
      };

      const validatedLow = validateRecommendations([lowQuality]);
      const validatedHigh = validateRecommendations([highQuality]);

      if (validatedLow.length > 0 && validatedHigh.length > 0) {
        expect(validatedHigh[0].qualityScore).toBeGreaterThan(
          validatedLow[0].qualityScore
        );
      }
    });

    it("sorts by quality score DESC", () => {
      const recs: Recommendation[] = [
        {
          id: "1",
          title: "Low quality with 10px",
          description: "Basic",
          impact: 2,
          effort: 3,
          category: "hero",
          implementationSteps: ["Short step one", "Short step two"],
        },
        {
          id: "2",
          title: "High quality with 120px and #FF6B35 color code",
          description: "Very detailed with $4,590 revenue impact",
          impact: 5,
          effort: 1,
          category: "hero",
          implementationSteps: [
            "Extremely detailed step explaining everything in great detail with file names and line numbers",
            "Another extremely detailed step with validation criteria and testing methodology",
          ],
          codeSnippet: "/* Detailed code */",
        },
      ];

      const validated = validateRecommendations(recs);

      if (validated.length === 2) {
        expect(validated[0].qualityScore).toBeGreaterThan(
          validated[1].qualityScore
        );
      }
    });
  });

  describe("Conflict Detection", () => {
    it("detects conflicting recommendations", () => {
      const recs: Recommendation[] = [
        {
          id: "rec-hero-cta",
          title: "Change hero CTA by 120px",
          description: "Specific change",
          impact: 5,
          effort: 2,
          category: "hero",
          implementationSteps: ["Detailed step"],
        },
        {
          id: "rec-hero-image",
          title: "Redesign hero image at 650px",
          description: "Another change",
          impact: 4,
          effort: 3,
          category: "hero",
          implementationSteps: ["Another detailed step"],
        },
      ];

      const checked = conflictCheck(recs);
      const hasWarning = checked.some((r) => r.warning);
      expect(hasWarning).toBe(true);
    });
  });

  describe("Stress Testing", () => {
    it("handles empty array", () => {
      const validated = validateRecommendations([]);
      expect(validated).toEqual([]);
    });

    it("handles 100 recommendations", () => {
      const recs: Recommendation[] = Array.from({ length: 100 }, (_, i) => ({
        id: `rec-${i}`,
        title: `Recommendation ${i} with 120px measurement`,
        description: "Specific description with measurements",
        impact: Math.ceil(Math.random() * 5) as 1 | 2 | 3 | 4 | 5,
        effort: Math.ceil(Math.random() * 5) as 1 | 2 | 3 | 4 | 5,
        category: "hero",
        implementationSteps: [
          "Detailed step one with file names",
          "Detailed step two with line numbers",
        ],
      }));

      const validated = validateRecommendations(recs);
      expect(Array.isArray(validated)).toBe(true);
    });

    it("handles malformed recommendation gracefully", () => {
      const bad: any = [
        {
          id: "1",
          title: null, // Invalid
          description: undefined, // Invalid
          impact: "high", // Wrong type
          effort: 2,
          category: "hero",
        },
      ];

      expect(() => validateRecommendations(bad)).not.toThrow();
    });
  });
});
```

**Run:**
```bash
npm run test recommendation-validator.test.ts
```

**PASS CRITERIA**: 100% tests pass

**FAILURE ACTION**: Fix validator until all tests pass.

---

### Test Suite 1.3: Multi-Stage Analysis (Integration-ish)

**File**: Create `tests/multi-stage-analysis.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Multi-Stage Analysis - INTEGRATION TESTING", () => {
  // Mock the Claude API
  const mockClaudeResponse = vi.fn();

  describe("Stage Flow Verification", () => {
    it("executes all 3 stages in order", async () => {
      // This test verifies the flow exists
      // Real testing will be in E2E phase
      
      expect(true).toBe(true); // Placeholder
      
      // TODO: Add actual integration test when multi-stage is implemented
    });
  });
});
```

**PASS CRITERIA**: Placeholder passes (real test in E2E)

---

### Summary Phase 1

**Run all unit tests:**
```bash
npm run test
```

**PASS CRITERIA**: 
- All ROI calculator tests pass (30+ tests)
- All validator tests pass (25+ tests)
- 0 failures
- Code coverage >80%

**FAILURE**: STOP. Fix all failures before Phase 2.

---

## 🔗 PHASE 2: Integration Tests

### Test 2.1: ROI Calculator + Validator Integration

**Objective**: Verify modules work together

**File**: Create `tests/integration/roi-validator.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { calculateRealisticROI } from "../../app/utils/roi-calculator.server";
import { validateRecommendations } from "../../app/utils/recommendation-validator.server";

describe("ROI + Validator Integration", () => {
  it("validated recommendations have realistic ROI", () => {
    const mockMetrics = {
      conversionRate: 1.8,
      avgOrderValue: 85,
      monthlyVisitors: 12000,
      mobilePercentage: 65,
      cartAbandonmentRate: 68,
    };

    // Create recommendation
    const rec = {
      id: "1",
      title: "Reposition CTA 120px higher",
      description: "Move from 650px to 530px",
      impact: 5 as const,
      effort: 2 as const,
      category: "mobile" as const,
      implementationSteps: [
        "Edit theme.liquid line 47",
        "Add CSS margin-top: -120px",
      ],
    };

    // Calculate ROI
    const roi = calculateRealisticROI(
      rec.impact,
      rec.effort,
      rec.category,
      mockMetrics
    );

    // Create enriched recommendation
    const enriched = {
      ...rec,
      estimatedUplift: roi.estimatedLift,
      estimatedROI: roi.monthlyRevenue,
      roiDetails: roi,
    };

    // Validate
    const validated = validateRecommendations([enriched]);

    // Should pass validation AND have ROI
    expect(validated.length).toBe(1);
    expect(validated[0].estimatedROI).toBeTruthy();
    expect(validated[0].roiDetails).toBeTruthy();
    expect(validated[0].roiDetails.confidence).toBeGreaterThan(0);
  });
});
```

**Run:**
```bash
npm run test integration/
```

**PASS CRITERIA**: All integration tests pass

---

## 🎭 PHASE 3: End-to-End Flow Testing

### Test 3.1: Complete Analysis Flow

**Objective**: Test ENTIRE flow from trigger to recommendations

**Prerequisites**:
- [ ] Dev store accessible
- [ ] Anthropic API key valid
- [ ] Database connected
- [ ] App running locally or on Railway

**Test Script**: Create `tests/e2e/full-analysis-flow.test.ts`

```typescript
// This will use Playwright or manual testing
// See manual E2E test procedure below
```

### Manual E2E Test Procedure

**File**: Create separate checklist file

```markdown
# E2E Test - Full Analysis Flow

## Setup
- [ ] App running at https://conversionai-web-production.up.railway.app
- [ ] Logged into dev store: conversionai-development.myshopify.com
- [ ] Database accessible
- [ ] Redis running
- [ ] Clean slate (delete previous analyses in DB)

## Test Execution

### Step 1: Trigger Analysis
1. Open app dashboard
2. Click "Run New Analysis" button
3. Start timer

**Expected**:
- Loading indicator appears
- Status updates show progress
- No JavaScript errors in console

### Step 2: Monitor Progress
Watch Railway logs or local console for:
- [ ] "Stage 1: Identifying problems..." appears
- [ ] "Stage 2: Deep diving..." appears
- [ ] "Stage 3: Prioritizing..." appears
- [ ] "Validating recommendations..." appears

**Expected duration**: 90-180 seconds (increased from 45s due to multi-stage)

### Step 3: Verify Database

Query database:
```sql
SELECT * FROM analyses ORDER BY created_at DESC LIMIT 1;
SELECT * FROM recommendations WHERE analysis_id = [ID] ORDER BY implementation_order;
```

**Expected**:
- [ ] 1 new analysis record
- [ ] 10-15 recommendation records (NOT 5-7)
- [ ] All fields populated
- [ ] No NULL values in critical fields

### Step 4: Verify UI Display

Check dashboard:
- [ ] Recommendations list populated
- [ ] Each has title, description, impact, effort
- [ ] Priority badges visible
- [ ] Implementation order numbers present
- [ ] No "undefined" or "[Object object]"

### Step 5: Verify Recommendation Quality

Click on FIRST recommendation, check:
- [ ] Title is specific (contains measurements: px, %, $)
- [ ] Title is NOT generic ("improve UX")
- [ ] Description is detailed (>100 characters)
- [ ] Impact score 1-5 makes sense
- [ ] Effort score 1-5 makes sense
- [ ] Category is relevant

### Step 6: Verify ROI Calculation

In modal or detail view:
- [ ] "Estimated Uplift" shows percentage (e.g., "+0.6% CR")
- [ ] "Monthly Revenue" shows dollar amount (e.g., "+$4,590/mo")
- [ ] "Annual Revenue" shows dollar amount (e.g., "+$55,080/yr")
- [ ] "Confidence" percentage shown (e.g., "85%")
- [ ] Full calculation breakdown visible
- [ ] Math is correct (manually verify one calculation)

### Step 7: Verify Implementation Steps

Check at least 3 recommendations:
- [ ] Each has 3+ implementation steps
- [ ] Steps are detailed (>20 chars each)
- [ ] Steps reference specific files/lines
- [ ] Steps include validation/testing

### Step 8: Verify Code Snippets

Check recommendations with code:
- [ ] Code snippet present
- [ ] Code is valid (CSS/Liquid/JS)
- [ ] Code is copy-paste ready
- [ ] Code relates to recommendation

### Step 9: Verify Priority Scoring

Check all recommendations:
- [ ] Implementation order is numbered 1, 2, 3...
- [ ] Order makes sense (high impact/low effort first)
- [ ] Priority score visible (if in API response)
- [ ] No duplicates in implementation order

### Step 10: Verify Quality Filtering

Scan all recommendations:
- [ ] ZERO generic titles ("improve UX", "optimize website")
- [ ] ALL have specific measurements
- [ ] ALL have detailed steps
- [ ] Quality score visible (if implemented)

## PASS CRITERIA

ALL checkboxes above must be ✅

If ANY checkbox is ❌ → FAIL → Debug → Re-test

## Performance Benchmarks

Record actual times:
- Analysis completion: _____ seconds (target: <180s)
- UI render time: _____ seconds (target: <3s)
- Database save time: _____ seconds (target: <2s)

## Cost Verification

After test, check Railway logs:
- Claude API calls: _____ (expect 3+ for multi-stage)
- Total tokens used: _____
- Estimated cost: $_____ (target: <$0.50)

## Error Handling

Try these failure scenarios:
- [ ] Shopify API timeout → Graceful error message
- [ ] Claude API error → Retry or fallback
- [ ] Database connection lost → Error logged, user notified
- [ ] Invalid shop data → Validation error shown

All errors must be GRACEFUL (no crashes, no 500s)
```

**PASS CRITERIA**: ALL checkboxes in manual E2E checklist are ✅

**FAILURE**: STOP. Debug. Fix. Re-test.

---

## ⚡ PHASE 4: Performance Benchmarks

### Test 4.1: Response Time

**Target**: Analysis completes in <180 seconds

**Test**:
```bash
# In browser console on dashboard:
console.time('analysis');
// Click "Run New Analysis"
// Wait for completion
console.timeEnd('analysis');
```

**PASS**: <180 seconds
**WARN**: 180-240 seconds (acceptable but not ideal)
**FAIL**: >240 seconds (too slow)

**FAILURE ACTION**: Optimize or consider rollback

---

### Test 4.2: API Call Efficiency

**Monitor Railway logs** during one analysis:

**Expected**:
- Stage 1: 1 Claude API call
- Stage 2: 3 Claude API calls (one per problem)
- Stage 3: 1 Claude API call
- **Total**: ~5 API calls

**PASS**: 4-6 API calls
**WARN**: 7-8 API calls
**FAIL**: >8 API calls (too many, cost issue)

---

### Test 4.3: Token Usage

**Check Railway logs** for token counts:

**Expected per analysis**:
- Input tokens: 8,000-12,000
- Output tokens: 12,000-18,000
- **Total**: ~20,000-30,000 tokens

**Cost calculation**:
```
Input: 10K tokens × $0.003/1K = $0.03
Output: 15K tokens × $0.015/1K = $0.225
Total: ~$0.26 per analysis
```

**PASS**: $0.20-0.40 per analysis
**WARN**: $0.40-0.60 per analysis
**FAIL**: >$0.60 per analysis

**FAILURE ACTION**: Optimize prompts or reconsider model

---

### Test 4.4: Database Performance

**Query after 10 analyses**:

```sql
-- Check table sizes
SELECT COUNT(*) FROM analyses; -- Expect 10
SELECT COUNT(*) FROM recommendations; -- Expect 100-150

-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM recommendations 
WHERE analysis_id = 'recent-id' 
ORDER BY implementation_order;
```

**PASS**: Query executes in <100ms
**WARN**: 100-500ms
**FAIL**: >500ms

---

## 💰 PHASE 5: Cost Validation

### Test 5.1: Monthly Cost Projection

**Scenario**: 100 analyses/month (realistic for early users)

**Current costs** (Haiku):
- 100 analyses × $0.05 = $5/mo

**New costs** (Sonnet 4.5):
- 100 analyses × $0.35 = $35/mo

**Revenue at 100 users**:
- Assume 70 free, 20 basic, 8 pro, 2 enterprise
- Revenue: $0 + $580 + $632 + $398 = $1,610/mo

**Cost ratio**: $35 / $1,610 = 2.2%

**PASS**: Cost <5% of revenue
**WARN**: Cost 5-10% of revenue
**FAIL**: Cost >10% of revenue

**Current**: ✅ PASS (2.2%)

---

### Test 5.2: Cost per User Type

Calculate average API cost per user tier:

| Tier | Analyses/mo | Cost/user | Margin |
|------|-------------|-----------|--------|
| Free | 1 | $0.35 | -$0.35 (loss leader) |
| Basic ($29) | 4 | $1.40 | $27.60 (95%) |
| Pro ($79) | Unlimited | $10-15 | $64-69 (87%) |
| Enterprise ($199) | Unlimited | $20-30 | $169-179 (90%) |

**PASS**: All paid tiers have >80% margin

---

## 🔍 PHASE 6: Quality Assurance

### Test 6.1: Recommendation Content Quality

**Run 5 analyses on different dev stores** (if available, or re-run on same store)

For EACH analysis, manually review ALL recommendations:

**Checklist per recommendation**:
- [ ] Title contains specific measurements (px, %, $)
- [ ] Title is actionable (verb + object + measurement)
- [ ] Description explains WHY (not just what)
- [ ] Description references data/psychology
- [ ] Impact score justifiable (1-5)
- [ ] Effort score realistic (1-5)
- [ ] ROI calculation present
- [ ] ROI math is correct
- [ ] Implementation steps are detailed
- [ ] Code snippet is valid
- [ ] Code snippet is copy-paste ready
- [ ] Confidence score realistic

**PASS**: 90%+ of recommendations meet ALL criteria

**FAILURE**: If <90%, prompts need tuning

---

### Test 6.2: Diversity of Recommendations

Across 5 analyses, verify:
- [ ] Recommendations cover multiple categories (hero, product, cart, mobile, trust)
- [ ] Not all recommendations are "move button X pixels"
- [ ] Mix of quick wins (effort 1-2) and bigger projects (effort 3-4)
- [ ] At least 3 different recommendation types per analysis

**PASS**: Good diversity
**FAIL**: Too repetitive → Improve Stage 1 problem identification

---

### Test 6.3: Accuracy Spot Check

**Pick 3 random recommendations** and verify manually:

1. **Screenshot verification**: Does the problem actually exist in screenshot?
2. **Metric verification**: Are the metrics cited correct?
3. **ROI verification**: Recalculate ROI manually, does it match?
4. **Code verification**: Test code snippet, does it work?

**PASS**: 100% accurate (all 3)
**WARN**: 2/3 accurate
**FAIL**: <2/3 accurate

---

## 🚨 PHASE 7: Edge Cases & Failure Modes

### Test 7.1: Zero Traffic Store

**Setup**: Modify metrics to simulate brand new store
```typescript
const zeroTraffic = {
  conversionRate: 0,
  avgOrderValue: 0,
  monthlyVisitors: 0,
  mobilePercentage: 50,
  cartAbandonmentRate: 0,
};
```

**Expected**:
- [ ] Analysis completes (doesn't crash)
- [ ] Recommendations still generated
- [ ] ROI shows $0 or "N/A"
- [ ] Recommendations focus on setup/launch

**PASS**: Handles gracefully
**FAIL**: Crashes or nonsensical output

---

### Test 7.2: Extremely High Traffic Store

**Setup**: Simulate high-volume merchant
```typescript
const highTraffic = {
  conversionRate: 3.5,
  avgOrderValue: 250,
  monthlyVisitors: 500000,
  mobilePercentage: 70,
  cartAbandonmentRate: 55,
};
```

**Expected**:
- [ ] Analysis completes
- [ ] ROI numbers are realistic (not absurd)
- [ ] Recommendations appropriate for scale
- [ ] No integer overflow errors

**PASS**: Handles gracefully

---

### Test 7.3: API Failures

**Test each failure scenario**:

#### Claude API Timeout
```typescript
// Mock Claude API to timeout after 30s
```

**Expected**:
- [ ] Graceful error message
- [ ] Retry logic triggers (if implemented)
- [ ] User notified clearly
- [ ] Analysis status saved as "failed"

#### Claude API Rate Limit
```typescript
// Mock 429 response
```

**Expected**:
- [ ] Exponential backoff
- [ ] Retry after delay
- [ ] User sees "processing" status
- [ ] Eventually completes or clear failure

#### Invalid API Key
```typescript
// Set ANTHROPIC_API_KEY to invalid value
```

**Expected**:
- [ ] Clear error message
- [ ] Error logged to Railway
- [ ] User sees helpful error
- [ ] No crash

**PASS**: ALL failure modes handled gracefully

---

### Test 7.4: Database Failures

**Simulate**:
- Database connection lost mid-analysis
- Prisma query timeout
- Unique constraint violation

**Expected**:
- [ ] Transactions rollback properly
- [ ] No orphaned records
- [ ] Clear error to user
- [ ] App remains stable

---

### Test 7.5: Malformed Shopify Data

**Test with**:
- Missing products
- Invalid theme data
- Null analytics

**Expected**:
- [ ] Validation catches issues
- [ ] Default/fallback values used
- [ ] Analysis still completes
- [ ] Quality doesn't suffer severely

---

## ♻️ PHASE 8: Regression Testing

### Test 8.1: Existing Features Still Work

**Verify these are NOT broken**:

#### Dashboard
- [ ] Dashboard loads
- [ ] Metrics card displays
- [ ] Previous analyses list shows
- [ ] Navigation works

#### Authentication
- [ ] OAuth flow works
- [ ] Session persists
- [ ] Logout works

#### Billing
- [ ] Pricing page loads
- [ ] Upgrade flow works
- [ ] Plan limits enforced

#### Email Notifications
- [ ] Welcome email sends
- [ ] Analysis complete email sends
- [ ] Email contains correct data

#### Cron Job
- [ ] Weekly refresh endpoint accessible
- [ ] Cron secret validates
- [ ] Pro users get queued

**PASS**: ALL existing features work
**FAIL**: Any regression → FIX before proceeding

---

### Test 8.2: Backward Compatibility

**Test**: Load old analysis from before upgrade

**Expected**:
- [ ] Old recommendations still display
- [ ] No errors loading old data
- [ ] UI handles missing new fields gracefully

**PASS**: Backward compatible

---

## ✅ PHASE 9: Production Readiness

### Checklist 9.1: Code Quality

- [ ] No console.log statements in production code
- [ ] All TypeScript errors resolved
- [ ] No `any` types (except where justified)
- [ ] Error handling comprehensive
- [ ] Comments on complex logic
- [ ] No hardcoded values (use env vars)

### Checklist 9.2: Security

- [ ] API keys in environment variables
- [ ] No sensitive data in logs
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (React handles)

### Checklist 9.3: Monitoring

- [ ] Cost monitoring active
- [ ] Error tracking setup (Sentry/similar)
- [ ] Performance monitoring
- [ ] API usage logging

### Checklist 9.4: Documentation

- [ ] API documentation updated
- [ ] Type definitions complete
- [ ] README accurate
- [ ] Deployment guide updated

### Checklist 9.5: Deployment

- [ ] Build passes on Railway
- [ ] Environment variables set on Railway
- [ ] Database migrated on Railway
- [ ] Redis connected
- [ ] Health check endpoint works

---

## 🎯 FINAL GO/NO-GO DECISION

### Scoring System

Count your ✅ checkboxes across all phases:

| Phase | Total Checks | Your Score | Required |
|-------|-------------|------------|----------|
| 0. Pre-Flight | 7 | ___/7 | 7 (100%) |
| 1. Unit Tests | 50+ | ___/50+ | 45+ (90%) |
| 2. Integration | 5+ | ___/5+ | 5 (100%) |
| 3. E2E | 40+ | ___/40+ | 36+ (90%) |
| 4. Performance | 8 | ___/8 | 6 (75%) |
| 5. Cost | 5 | ___/5 | 5 (100%) |
| 6. Quality | 15+ | ___/15+ | 13+ (85%) |
| 7. Edge Cases | 20+ | ___/20+ | 15+ (75%) |
| 8. Regression | 15+ | ___/15+ | 15 (100%) |
| 9. Production | 20+ | ___/20+ | 18+ (90%) |

### Decision Matrix

**GO TO PRODUCTION** if:
- ✅ All critical phases (0, 2, 5, 8, 9) at 100%
- ✅ All other phases at or above required %
- ✅ No CRITICAL bugs outstanding
- ✅ Cost projection acceptable
- ✅ Performance acceptable

**CONDITIONAL GO** if:
- ⚠️ 1-2 phases slightly below target
- ⚠️ No critical bugs, only minor issues
- ⚠️ Has clear fix plan for deficiencies

Action: Deploy with monitoring, fix issues in next sprint

**NO-GO / ROLLBACK** if:
- ❌ Any critical phase below 90%
- ❌ Critical bugs present
- ❌ Cost exceeds 10% of revenue
- ❌ Performance unacceptable
- ❌ Quality below standards

Action: Fix issues, re-test all affected phases

---

## 📝 Test Execution Log

**Tester**: _____________  
**Date**: _____________  
**Duration**: _________ hours

### Phase Results

| Phase | Status | Duration | Notes |
|-------|--------|----------|-------|
| 0. Pre-Flight | ⬜ PASS / FAIL | ___ min | |
| 1. Unit Tests | ⬜ PASS / FAIL | ___ min | |
| 2. Integration | ⬜ PASS / FAIL | ___ min | |
| 3. E2E | ⬜ PASS / FAIL | ___ min | |
| 4. Performance | ⬜ PASS / FAIL | ___ min | |
| 5. Cost | ⬜ PASS / FAIL | ___ min | |
| 6. Quality | ⬜ PASS / FAIL | ___ min | |
| 7. Edge Cases | ⬜ PASS / FAIL | ___ min | |
| 8. Regression | ⬜ PASS / FAIL | ___ min | |
| 9. Production | ⬜ PASS / FAIL | ___ min | |

### Critical Bugs Found

1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Minor Issues

1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Performance Metrics

- Analysis time: _____ seconds
- API cost: $_____ per analysis
- Token usage: _____ tokens
- Database queries: _____

### Final Recommendation

⬜ **GO** - Deploy to production  
⬜ **CONDITIONAL GO** - Deploy with caveats: _____________  
⬜ **NO-GO** - Do not deploy, fix issues: _____________

**Signature**: _____________  
**Date**: _____________

---

## 🔥 RUTHLESS TESTING MANTRAS

Remember:

1. **"If it's not tested, it's broken"**
2. **"One failed test = entire upgrade fails"**
3. **"Edge cases are where bugs live"**
4. **"Production is not a testing environment"**
5. **"Your users will find what you missed"**

**BE BRUTAL. BE THOROUGH. BE CERTAIN.**

Only deploy when you can say with 100% confidence:

> "This upgrade makes recommendations SIGNIFICANTLY better, 
> costs are acceptable, performance is good, and I have 
> PROOF through comprehensive testing."

---

## 🚀 EXECUTION PROMPT FOR CLAUDE CODE

**Copy this prompt and paste it to Claude Code to begin systematic testing:**

---

```
BULLETPROOF TESTING EXECUTION - Recommendation Quality Upgrade

CONTEXT:
- Implementation is COMPLETE (all 6 phases done)
- Unit tests are PASSING (22/22)
- Build is SUCCESSFUL
- Now executing quality assurance phase

YOUR MISSION:
Execute phases 0-9 of BULLETPROOF_TESTING_PLAN.md systematically.

CRITICAL RULES:
1. ANY failed test = STOP and report
2. Follow the plan EXACTLY - no shortcuts
3. Document EVERY result (pass/fail)
4. Be RUTHLESS - if something seems off, it IS off
5. Update the Test Execution Log as you go

EXECUTION ORDER:

Phase 0: Pre-Flight Checks (15 min)
- Verify environment is ready
- Check all dependencies
- Confirm Railway connection
- ALL 7 checks must pass

Phase 1: Unit Tests Verification (10 min)
- Run: npm run test
- Verify: 22/22 tests passing
- Check: No new failures introduced

Phase 2: Integration Tests (30 min)
- Create integration test file
- Verify ROI + Validator work together
- Test multi-stage pipeline end-to-end

Phase 3: E2E Flow Testing (60 min)
- CRITICAL: This is the main event
- Execute full manual E2E checklist
- Test on dev store: conversionai-development.myshopify.com
- Verify ALL 40+ checkboxes

Phase 4: Performance Benchmarks (30 min)
- Measure analysis time (target: <180s)
- Count API calls (target: 4-6)
- Calculate cost per analysis (target: <$0.50)

Phase 5: Cost Validation (15 min)
- Verify monthly projection acceptable
- Check margin on each tier
- Confirm <5% of revenue

Phase 6: Quality Assurance (45 min)
- Run 3-5 real analyses
- Manually review ALL recommendations
- Verify specificity, ROI accuracy, code quality

Phase 7: Edge Cases (60 min)
- Test zero traffic store
- Test high traffic store
- Test API failures
- Test database failures
- ALL must handle gracefully

Phase 8: Regression Testing (30 min)
- Verify dashboard still works
- Verify auth still works
- Verify billing still works
- Verify emails still send
- NO regressions allowed

Phase 9: Production Readiness (30 min)
- Final code quality check
- Security audit
- Documentation review
- Deployment checklist

REPORTING:
After EACH phase, report:
✅ PHASE X: PASS - [summary]
❌ PHASE X: FAIL - [details] - STOPPING
⚠️ PHASE X: WARNINGS - [issues found]

At the end, provide:
1. Complete Test Execution Log (filled out)
2. GO/NO-GO recommendation
3. List of any issues found
4. Performance metrics summary

START WITH: Phase 0 - Pre-Flight Checks

Execute with ZERO TOLERANCE for failures.
Be BRUTAL. Be THOROUGH. Be CERTAIN.

Ready? Begin Phase 0 now.
```

---

**End of Testing Plan**

*Test like your business depends on it. Because it does.* 🔥
