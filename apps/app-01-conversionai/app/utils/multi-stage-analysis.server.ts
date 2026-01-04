/**
 * Multi-Stage Analysis Architecture
 * 3-stage process for deeper, more accurate CRO recommendations
 *
 * Stage 1: Quick Problem Identification (3-5 critical issues)
 * Stage 2: Deep Dive on Top 3 Problems (psychology + data)
 * Stage 3: Generate & Prioritize All Recommendations
 */

import { callClaudeAPI } from "./claude.server";
import { logger } from "./logger.server";
import { calculateRealisticROI, formatROIForDisplay, type ROICalculation } from "./roi-calculator.server";
import { validateRecommendations, conflictCheck, getValidationStats } from "./recommendation-validator.server";
import type { Screenshot } from "../jobs/captureScreenshots";
import type { ShopifyAnalytics, ShopifyProduct } from "./shopify.server";

// ============ Types ============

export interface StoreMetrics {
  conversionRate: number;
  avgOrderValue: number;
  monthlyVisitors: number;
  mobilePercentage: number;
  cartAbandonmentRate: number;
}

export interface ShopifyData {
  shop: { domain: string };
  topProducts: ShopifyProduct[];
  priceRange: { min: number; max: number };
  theme: { name: string; id: string };
  industry?: string;
}

interface Stage1Problem {
  id: string;
  title: string;
  severity: number; // 1-10
  affectedUsers: string; // "78% of mobile users"
  category: string;
  quickEvidence: string;
}

interface Stage2DeepDive {
  problemId: string;
  whyItMatters: string;
  dataEvidence: string;
  psychologyPrinciple: string;
  recommendations: Array<{
    title: string;
    specificChange: string;
    expectedOutcome: string;
  }>;
}

export interface Stage3Prioritized {
  id: string;
  title: string;
  description: string;
  impactScore: number;
  effortScore: number;
  category: string;
  priorityScore: number;
  implementationOrder: number;
  dependencies: string[];
  estimatedUplift: string;
  estimatedROI: string;
  roiDetails?: ROICalculation; // Full ROI breakdown
  roiFormatted?: string; // Human-readable ROI
  implementation: string[];
  codeSnippet?: string;
  confidence: number;
  benchmarkComparison: string;
  reasoning: string;
}

// ============ Main Function ============

export async function multiStageAnalysis(
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: Screenshot[]
): Promise<Stage3Prioritized[]> {

  // STAGE 1: Quick Problem Identification
  logger.info("Stage 1: Identifying critical problems...");
  const problems = await stage1_IdentifyProblems(shopData, metrics, screenshots);
  logger.info(`Stage 1 complete: Found ${problems.length} problems`);

  // STAGE 2: Deep Dive on Top Problems
  const topProblemsCount = Math.min(3, problems.length);
  logger.info(`Stage 2: Deep diving into top ${topProblemsCount} problems...`);
  const topProblems = problems
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3);

  const deepDives = await Promise.all(
    topProblems.map(problem =>
      stage2_DeepDive(problem, shopData, metrics, screenshots)
    )
  );
  logger.info(`Stage 2 complete: ${deepDives.length} deep dives done`);

  // STAGE 3: Generate & Prioritize All Recommendations
  logger.info("Stage 3: Generating and prioritizing recommendations...");
  const allRecommendations = deepDives.flatMap(dive =>
    dive.recommendations.map(rec => ({
      problemId: dive.problemId,
      whyItMatters: dive.whyItMatters,
      psychologyPrinciple: dive.psychologyPrinciple,
      ...rec
    }))
  );

  const prioritized = await stage3_PrioritizeAndEnrich(
    allRecommendations,
    shopData,
    metrics,
    screenshots
  );

  logger.info(`Stage 3 complete: ${prioritized.length} recommendations generated`);

  // STAGE 4: Validation & Quality Control
  logger.info("Stage 4: Validating and filtering recommendations...");
  const validated = validateRecommendations(prioritized as any[]);

  // Log validation stats
  const stats = getValidationStats(prioritized as any[], validated);
  logger.info(`Validation stats: ${stats.validatedCount}/${stats.originalCount} passed (filtered ${stats.filterRate})`);
  logger.info(`Average quality score: ${stats.avgQualityScore}/100`);

  // FALLBACK: If validation filtered too many (>80%), use unvalidated with warning
  if (validated.length === 0 && prioritized.length > 0) {
    logger.warn(`Validation filtered ALL ${prioritized.length} recommendations - using unvalidated results with quality warnings`);

    // Return prioritized results with low quality flag
    const fallbackResults = prioritized.map((rec: any, index: number) => ({
      ...rec,
      qualityScore: 40, // Low quality indicator
      warning: "This recommendation may be too generic - review before implementing",
      implementationOrder: index + 1,
    }));

    return conflictCheck(fallbackResults) as Stage3Prioritized[];
  }

  // If validation passed at least some, use validated results
  const withConflictCheck = conflictCheck(validated) as Stage3Prioritized[];

  // FINAL SAFETY: If we somehow have 0 recommendations, generate basic fallback
  if (withConflictCheck.length === 0) {
    logger.warn('Final safety: 0 recommendations after all stages, generating emergency fallback');
    const emergencyFallback: Stage3Prioritized[] = [{
      id: 'rec-emergency-001',
      title: `Optimize checkout flow to reduce ${metrics.cartAbandonmentRate}% cart abandonment`,
      description: `Your cart abandonment rate of ${metrics.cartAbandonmentRate}% is above industry average. Simplifying checkout can improve conversions.`,
      impactScore: 4,
      effortScore: 3,
      category: 'checkout',
      priorityScore: 13,
      implementationOrder: 1,
      dependencies: [],
      estimatedUplift: '+0.5% CR',
      estimatedROI: `+$${Math.round(metrics.monthlyVisitors * 0.005 * metrics.avgOrderValue)}/mo`,
      implementation: [
        'Add guest checkout option to reduce friction',
        'Reduce form fields to essential information only',
        'Add progress indicator to show checkout steps',
        'Implement address autocomplete for faster entry'
      ],
      confidence: 70,
      benchmarkComparison: `${metrics.cartAbandonmentRate}% vs 69% industry average`,
      reasoning: 'Reducing checkout friction is proven to decrease cart abandonment and increase conversions.'
    }];
    return emergencyFallback;
  }

  return withConflictCheck;
}

// ============ Stage 1: Problem Identification ============

async function stage1_IdentifyProblems(
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: Screenshot[]
): Promise<Stage1Problem[]> {
  const systemPrompt = `You are a CRO expert identifying critical conversion blockers.
Return ONLY valid JSON array. No markdown, no explanation.`;

  const userPrompt = `Analyze this Shopify store and identify the 3-5 most critical conversion problems.

Store metrics:
- Conversion Rate: ${metrics.conversionRate}%
- AOV: $${metrics.avgOrderValue}
- Traffic: ${metrics.monthlyVisitors}/mo
- Mobile %: ${metrics.mobilePercentage}%
- Cart Abandonment: ${metrics.cartAbandonmentRate}%

Store: ${shopData.shop.domain}
Theme: ${shopData.theme.name}
Top Products: ${shopData.topProducts.slice(0, 3).map(p => p.title).join(", ")}

For each problem, provide:
- id: Unique identifier (e.g., "prob-hero-cta")
- title: MUST include specific measurements (px, %, $) - e.g., "Hero CTA at 650px below fold needs repositioning to 350px"
- severity: 1-10 (10 = critical blocker)
- affectedUsers: Percentage and count (e.g., "78% of mobile users = ${Math.round(metrics.monthlyVisitors * metrics.mobilePercentage / 100 * 0.78)}/mo")
- category: hero|product|cart|mobile|trust|checkout|navigation|speed
- quickEvidence: One-sentence proof with numbers

CRITICAL: Every title MUST contain specific numbers (px, %, $, or exact values). Generic titles will be rejected.

Return JSON array of 3-5 problems, sorted by severity DESC:
[{"id": "...", "title": "...", "severity": 10, "affectedUsers": "...", "category": "...", "quickEvidence": "..."}]`;

  try {
    const response = await callClaudeAPI(
      systemPrompt,
      userPrompt,
      screenshots
    );

    const problems = parseJSONResponse(response, []) as Stage1Problem[];

    // If parsing returned empty, use fallback
    if (!problems || problems.length === 0) {
      logger.warn('Stage 1: Claude returned empty/invalid JSON, using fallback problems');
      return generateFallbackProblems(metrics);
    }

    return problems;
  } catch (error) {
    logger.error("Stage 1 failed:", error);
    // Return fallback problems based on metrics
    return generateFallbackProblems(metrics);
  }
}

// ============ Stage 2: Deep Dive ============

async function stage2_DeepDive(
  problem: Stage1Problem,
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: Screenshot[]
): Promise<Stage2DeepDive> {
  const systemPrompt = `You are a CRO expert doing deep-dive analysis.
Return ONLY valid JSON object. No markdown, no explanation.`;

  const userPrompt = `Deep dive analysis for problem: ${problem.title}

Problem context:
- ID: ${problem.id}
- Severity: ${problem.severity}/10
- Affected Users: ${problem.affectedUsers}
- Category: ${problem.category}
- Evidence: ${problem.quickEvidence}

Store context:
- Current CR: ${metrics.conversionRate}%
- Industry avg CR: 2.4%
- CR Gap: ${(2.4 - metrics.conversionRate).toFixed(2)}%
- Monthly traffic: ${metrics.monthlyVisitors}
- AOV: $${metrics.avgOrderValue}

Provide:
1. whyItMatters: Detailed explanation with psychology and business impact (2-3 sentences)
2. dataEvidence: Specific metrics proving this is a problem
3. psychologyPrinciple: What psychological principle is violated (e.g., "Hick's Law", "Social Proof", "Urgency")
4. recommendations: Array of 3-4 specific solutions

Each recommendation MUST have:
- title: Specific action WITH MEASUREMENTS (px, %, $) - e.g., "Move CTA from 650px to 350px for above-fold visibility"
- specificChange: Exact change with CSS values (e.g., "Add margin-top: -300px to .hero-cta class")
- expectedOutcome: Realistic impact with exact numbers (e.g., "+0.5% CR = +${Math.round(metrics.monthlyVisitors * 0.005)} orders/mo")

CRITICAL: Every title MUST contain specific numbers. Generic titles like "improve mobile UX" will be rejected.

Return JSON object:
{
  "problemId": "${problem.id}",
  "whyItMatters": "...",
  "dataEvidence": "...",
  "psychologyPrinciple": "...",
  "recommendations": [
    {"title": "...", "specificChange": "...", "expectedOutcome": "..."}
  ]
}`;

  try {
    const response = await callClaudeAPI(
      systemPrompt,
      userPrompt,
      screenshots
    );

    const parsed = parseJSONResponse(response, null);
    if (parsed) {
      return parsed as Stage2DeepDive;
    }
  } catch (error) {
    logger.error(`Stage 2 failed for ${problem.id}:`, error);
  }

  // Fallback
  return {
    problemId: problem.id,
    whyItMatters: `${problem.title} affects ${problem.affectedUsers}, directly impacting conversions.`,
    dataEvidence: problem.quickEvidence,
    psychologyPrinciple: "Usability Heuristics",
    recommendations: [{
      title: `Fix: ${problem.title}`,
      specificChange: "Requires manual investigation",
      expectedOutcome: `Estimated +0.3% CR improvement`
    }]
  };
}

// ============ Stage 3: Prioritize & Enrich ============

async function stage3_PrioritizeAndEnrich(
  recommendations: any[],
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: Screenshot[]
): Promise<Stage3Prioritized[]> {
  const systemPrompt = `You are a senior eCommerce advisor presenting to a CEO.
Your job: translate technical CRO findings into clear business opportunities.
Lead with money and impact, save technical details for implementation steps.
Return ONLY valid JSON array. No markdown, no explanation.`;

  const userPrompt = `You have ${recommendations.length} CRO recommendations to enrich and prioritize.

Store metrics:
- Current CR: ${metrics.conversionRate}%
- Monthly traffic: ${metrics.monthlyVisitors.toLocaleString()}
- AOV: $${metrics.avgOrderValue}
- Cart abandonment: ${metrics.cartAbandonmentRate}%

Recommendations to process:
${JSON.stringify(recommendations, null, 2)}

IMPORTANT: You are writing for a busy CEO who has 5 seconds to decide if a recommendation is worth pursuing.

For each recommendation provide:

1. id: Unique ID (rec-001, rec-002, etc.)

2. title: BUSINESS NUMBERS + CLEAR ACTION (max 70 chars)
   - MUST include business metrics: $revenue, %conversion, customer count
   - NO technical metrics: px, fold, viewport, DOM, CSS
   - Format: "[$ or % impact] + [what you'll fix]"
   - GOOD: "Recover $2,250/mo from 340 shoppers who miss your Add to Cart"
   - GOOD: "Stop losing 28% of mobile buyers at checkout"
   - GOOD: "Convert 15% more browsers with visible social proof"
   - GOOD: "$1,800/mo lost to cart abandoners who don't see shipping costs"
   - BAD: "Reposition CTA from 650px to 350px" (technical, no business impact)
   - BAD: "Add above-fold urgency elements" (jargon, no numbers)
   - BAD: "Improve mobile experience" (vague, no metrics)

3. description: 2-3 sentences. First sentence = business problem & impact. Second sentence = simple solution. No jargon.
   - GOOD: "34% of your mobile visitors leave product pages without adding to cart - that's ~850 lost customers/month. Adding a sticky 'Add to Cart' bar keeps the buying option visible as they scroll."
   - BAD: "The CTA element is positioned below the fold requiring scroll interaction which reduces conversion probability based on Fitts's law."

4. impactScore: 1-5 (5 = affects >50% of revenue)
5. effortScore: 1-5 (1 = 15 min, 5 = 1+ week)
6. category: hero|product|cart|checkout|mobile|trust|navigation|speed

7. estimatedUplift: "+X.X% conversion rate"
8. estimatedROI: "+$X,XXX/mo potential revenue"

9. reasoning: ONE sentence explaining WHY this works (buyer psychology, not UX theory)
   - GOOD: "Shoppers trust stores more when they see others buying - it reduces the fear of being the first."
   - BAD: "Social proof leverages normative social influence per Cialdini's principles."

10. implementation: Array of 4-6 steps for developers. Each step:
    - Starts with action verb (Edit, Add, Change, Remove)
    - Includes specific file/location when possible
    - Technical details go HERE, not in title/description

11. codeSnippet: Ready-to-use Liquid/CSS/JS code (50+ chars)
12. dependencies: Array of rec IDs to do first (or empty)
13. confidence: 0-100%
14. benchmarkComparison: "Your store: X vs Top performers: Y"

TONE RULES:
- Write like a trusted advisor, not a consultant trying to sound smart
- Business impact first, technical details last
- No jargon: "above the fold" → "visible without scrolling"
- No overpromising: be realistic about impact ranges

Return JSON array of 10-12 recommendations sorted by priority:
[
  {
    "id": "rec-001",
    "title": "...",
    "description": "...",
    "impactScore": 5,
    "effortScore": 2,
    "category": "hero",
    "estimatedUplift": "...",
    "estimatedROI": "...",
    "implementation": ["Step 1...", "Step 2..."],
    "codeSnippet": "...",
    "dependencies": [],
    "confidence": 85,
    "benchmarkComparison": "...",
    "reasoning": "..."
  }
]`;

  try {
    const response = await callClaudeAPI(
      systemPrompt,
      userPrompt,
      screenshots
    );

    const enriched = parseJSONResponse(response, []) as any[];

    // If parsing returned empty, use fallback with input recommendations
    if (!enriched || enriched.length === 0) {
      logger.warn('Stage 3: Claude returned empty/invalid JSON, using enriched input');
      throw new Error('Empty stage 3 response - falling back to input enrichment');
    }

    // Calculate realistic ROI for each recommendation using our calculator
    logger.info('Calculating realistic ROI for each recommendation...');
    const withROI = enriched.map((rec: any) => {
      const impactScore = rec.impactScore || rec.impact || 3;
      const effortScore = rec.effortScore || rec.effort || 3;
      const category = rec.category || 'general';

      // Use our ROI calculator for data-driven estimates
      const roi = calculateRealisticROI(
        impactScore,
        effortScore,
        category,
        {
          conversionRate: metrics.conversionRate,
          avgOrderValue: metrics.avgOrderValue,
          monthlyVisitors: metrics.monthlyVisitors,
          mobilePercentage: metrics.mobilePercentage,
          cartAbandonmentRate: metrics.cartAbandonmentRate,
        }
      );

      return {
        ...rec,
        impactScore,
        effortScore,
        // Override Claude's estimates with our calculated values
        estimatedUplift: roi.estimatedLift,
        estimatedROI: roi.monthlyRevenue,
        roiDetails: roi, // Full calculation object for modal view
        roiFormatted: formatROIForDisplay(roi), // Human-readable format
        confidence: roi.confidence, // Use our calculated confidence
      };
    });

    // Calculate priority scores and add implementation order
    return withROI
      .map((rec: any) => ({
        ...rec,
        priorityScore: (rec.impactScore * 10) / rec.effortScore,
      }))
      .sort((a: any, b: any) => b.priorityScore - a.priorityScore)
      .map((rec: any, index: number) => ({
        ...rec,
        implementationOrder: index + 1,
      }));
  } catch (error) {
    logger.error("Stage 3 failed:", error);

    // Return enriched versions of input recommendations
    return recommendations.map((rec, index) => ({
      id: `rec-${String(index + 1).padStart(3, '0')}`,
      title: rec.title,
      description: rec.specificChange || rec.expectedOutcome || '',
      impactScore: 3,
      effortScore: 3,
      category: 'general',
      priorityScore: 10,
      implementationOrder: index + 1,
      dependencies: [],
      estimatedUplift: '+0.3% CR',
      estimatedROI: `+$${Math.round(metrics.monthlyVisitors * 0.003 * metrics.avgOrderValue)}/mo`,
      implementation: [rec.specificChange || 'Manual implementation required'],
      confidence: 60,
      benchmarkComparison: 'Industry comparison pending',
      reasoning: rec.whyItMatters || 'Improves user experience'
    }));
  }
}

// ============ Helper Functions ============

function parseJSONResponse<T>(response: string, fallback: T): T {
  let jsonText = response;

  // Strategy 1: Extract from markdown code blocks
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  } else {
    // Strategy 2: Find JSON by brace matching
    const jsonStartBrace = response.indexOf('{');
    const jsonStartBracket = response.indexOf('[');

    if (jsonStartBrace >= 0 || jsonStartBracket >= 0) {
      const startIdx = jsonStartBrace >= 0 && jsonStartBracket >= 0
        ? Math.min(jsonStartBrace, jsonStartBracket)
        : Math.max(jsonStartBrace, jsonStartBracket);

      let depth = 0;
      let endIdx = startIdx;

      for (let i = startIdx; i < response.length; i++) {
        const char = response[i];
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }

      jsonText = response.substring(startIdx, endIdx);
    }
  }

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    logger.warn('JSON parse failed, using fallback');
    return fallback;
  }
}

function generateFallbackProblems(metrics: StoreMetrics): Stage1Problem[] {
  const problems: Stage1Problem[] = [];

  if (metrics.conversionRate < 2) {
    problems.push({
      id: 'prob-low-cr',
      title: 'Below-average conversion rate indicates UX friction',
      severity: 8,
      affectedUsers: 'All visitors',
      category: 'general',
      quickEvidence: `CR ${metrics.conversionRate}% vs industry avg 2.4%`
    });
  }

  if (metrics.cartAbandonmentRate >= 65) {
    problems.push({
      id: 'prob-cart-abandon',
      title: 'High cart abandonment rate suggests checkout friction',
      severity: 9,
      affectedUsers: `${metrics.cartAbandonmentRate}% of cart initiators`,
      category: 'cart',
      quickEvidence: `${metrics.cartAbandonmentRate}% abandon rate vs 69% industry avg`
    });
  }

  // Always add AOV optimization if avg order value < $100
  if (metrics.avgOrderValue < 100) {
    problems.push({
      id: 'prob-low-aov',
      title: 'Average order value below $100 indicates upsell opportunity',
      severity: 7,
      affectedUsers: 'All customers',
      category: 'pricing',
      quickEvidence: `AOV $${metrics.avgOrderValue} - room for bundle/upsell strategies`
    });
  }

  if (metrics.mobilePercentage > 50) {
    problems.push({
      id: 'prob-mobile-opt',
      title: 'Mobile-majority traffic requires mobile-first optimization',
      severity: 7,
      affectedUsers: `${metrics.mobilePercentage}% of traffic`,
      category: 'mobile',
      quickEvidence: 'Mobile visitors typically convert 50% lower than desktop'
    });
  }

  return problems.length > 0 ? problems : [{
    id: 'prob-general',
    title: 'General CRO audit needed',
    severity: 5,
    affectedUsers: 'All visitors',
    category: 'general',
    quickEvidence: 'Baseline analysis required'
  }];
}
