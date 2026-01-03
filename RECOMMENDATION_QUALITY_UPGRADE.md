# 🚀 ConversionAI - Plan Maksymalizacji Jakości Rekomendacji

**Wersja**: 2.0
**Data**: 2026-01-03
**Cel**: Upgrade z "dobrych" do "world-class" rekomendacji AI
**Executor**: Claude Code
**Estimated Time**: 6-8 godzin

---

## 📋 Executive Summary

**Obecny stan:**
- Model: Claude 3 Haiku (budget tier)
- Rekomendacje: 5-7 ogólnych
- ROI: Generyczne szacunki
- Jakość: 3.5/5

**Target:**
- Model: **Claude Sonnet 4.5** (flagship, najnowszy)
- Rekomendacje: 10-15 ultra-szczegółowych
- ROI: Kalkulacje oparte na danych sklepu
- Jakość: 5/5

**Expected Impact:**
- +200% dokładność ROI estimates
- +100% więcej rekomendacji per analiza
- +80% lepsze priorytetyzacja
- +300% bardziej actionable (konkretny kod, kroki)

---

## 🎯 Strategia Wdrożenia

### Faza 1: Model Upgrade (2h)
Wymiana silnika AI na najlepszy dostępny

### Faza 2: Multi-Stage Analysis (2h)
3-stopniowy proces analizy zamiast 1-shot

### Faza 3: Real ROI Calculator (2h)
Matematyczne kalkulacje oparte na danych sklepu

### Faza 4: Validation & Quality Control (1h)
Filtrowanie słabych rekomendacji, smart ranking

### Faza 5: Testing & Verification (1h)
Kompletne testy nowego systemu

---

## 📦 FAZA 1: Model Upgrade to Sonnet 4.5

### Cel
Wymiana Claude 3 Haiku na **Claude Sonnet 4.5** (claude-sonnet-4-5-20250929) - najnowszy i najlepszy model Anthropic.

### Dlaczego Sonnet 4.5?
```
Haiku 3:       Szybki, tani, podstawowy
Sonnet 4:      Bardzo dobry, balanced
Sonnet 4.5:    NAJLEPSZY - najnowszy flagship model
Opus 4:        Nie wypuszczony publicznie (Q1 2026)

Koszt Sonnet 4.5:
- Input: $3 per 1M tokens
- Output: $15 per 1M tokens
- Przy 100 analiz/mies = ~$25-40/mies (akceptowalne)

Korzyści:
- Najlepsza jakość reasoning
- Najbardziej szczegółowe analizy
- Najdokładniejsze ROI estimates
- Najlepsze rozumienie eCommerce context
```

### Zadanie 1.1: Update Model Configuration

**Plik**: `app/utils/claude.server.ts`

**Zmiany:**
```typescript
// PRZED:
const response = await anthropic.messages.create({
  model: "claude-3-haiku-20240307",
  max_tokens: 4096,
  // ...
});

// PO:
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-5-20250929", // NAJNOWSZY FLAGSHIP
  max_tokens: 8192, // Podwójnie więcej = więcej rekomendacji
  // ...
});
```

**Pełny kod do zastąpienia w funkcji `callClaudeAPI()`:**

```typescript
export async function callClaudeAPI(
  systemPrompt: string,
  userPrompt: string,
  images?: { data: string; mediaType: string }[]
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const contentBlocks: any[] = [
    {
      type: "text",
      text: userPrompt,
    },
  ];

  // Dodaj obrazy jeśli są
  if (images && images.length > 0) {
    images.forEach((img) => {
      contentBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType,
          data: img.data,
        },
      });
    });
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929", // ⭐ UPGRADE HERE
    max_tokens: 8192, // ⭐ DOUBLED
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: contentBlocks,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude API");
  }

  return textContent.text;
}
```

**Acceptance Criteria:**
- [ ] Model zmieniony na `claude-sonnet-4-5-20250929`
- [ ] max_tokens zwiększone do 8192
- [ ] Build passing (`npm run build`)
- [ ] TypeScript types correct

---

### Zadanie 1.2: Enhanced System Prompt

**Plik**: `app/utils/claude.server.ts` (funkcja `buildAnalysisPrompt`)

**Obecny prompt jest za krótki i ogólny. Nowy prompt wykorzysta pełną moc Sonnet 4.5:**

```typescript
function buildAnalysisPrompt(
  shopData: ShopifyData,
  metrics: StoreMetrics
): { system: string; user: string } {
  const systemPrompt = `You are a world-class eCommerce Conversion Rate Optimization (CRO) consultant with 15+ years of experience.

Your expertise:
- Optimized 500+ Shopify stores across all industries
- Average client results: +30-50% conversion rate improvement
- Deep knowledge of consumer psychology, UX best practices, and data-driven optimization
- Expert in Shopify Liquid templating, theme customization, and app ecosystem

Your analysis approach:
1. EVIDENCE-BASED: Every recommendation backed by data and psychology principles
2. SPECIFIC: Exact pixel measurements, color codes, copy suggestions
3. PRIORITIZED: Focus on highest-impact, lowest-effort wins first
4. REALISTIC: ROI estimates based on actual store metrics, not generic averages
5. ACTIONABLE: Provide copy-paste ready code and step-by-step implementation

Output format: JSON array of 10-12 recommendations (not 5-7).
Each recommendation MUST include all fields with high detail.`;

  const userPrompt = `# STORE ANALYSIS REQUEST

## Current Performance Metrics
- **Conversion Rate**: ${metrics.conversionRate}%
- **Average Order Value**: $${metrics.aov}
- **Monthly Traffic**: ${metrics.monthlyVisitors} visitors
- **Cart Abandonment Rate**: ${metrics.cartAbandonmentRate}%
- **Mobile Traffic**: ${metrics.mobilePercentage}%

## Store Context
- **Primary Products**: ${shopData.topProducts.map(p => p.title).join(", ")}
- **Price Range**: $${shopData.priceRange.min} - $${shopData.priceRange.max}
- **Theme**: ${shopData.theme.name}
- **Industry**: ${shopData.industry || "General eCommerce"}

## Analysis Instructions

Analyze the provided screenshots (homepage, product page, mobile) and store data.

Generate 10-12 SPECIFIC, ACTIONABLE recommendations prioritized by:
**Priority Score = (Impact × Urgency) / Effort**

For EACH recommendation provide:

1. **title**: Specific action (not "improve mobile UX" but "Reposition CTA 120px higher on mobile")
2. **description**: 
   - What exactly is wrong (with measurements, data)
   - Why it hurts conversions (psychology + evidence)
   - What to change (specific instructions)
   
3. **impact**: 1-5 scale
   - 5 = Critical (affects >50% of users, major CR blocker)
   - 4 = High (affects 25-50% users, significant friction)
   - 3 = Medium (affects 10-25% users, moderate impact)
   - 2 = Low (affects <10% users, minor improvement)
   - 1 = Minimal (polish, nice-to-have)

4. **effort**: 1-5 scale
   - 1 = 5-15 minutes (CSS tweak, copy change)
   - 2 = 30-60 minutes (simple template edit)
   - 3 = 2-4 hours (multiple file changes)
   - 4 = 1-2 days (theme customization)
   - 5 = 1+ week (major rebuild, app integration)

5. **category**: One of: hero | product | cart | checkout | mobile | trust | navigation | speed

6. **estimatedUplift**: Be SPECIFIC based on metrics
   - Calculate realistic CR improvement percentage
   - Example: "Current mobile CR 1.2% → projected 1.8% (+0.6%)"

7. **estimatedROI**: Calculate monthly revenue impact
   - Formula: (New CR - Old CR) × Monthly Traffic × AOV
   - Example: "+54 orders/mo × $85 AOV = +$4,590/mo"
   - Show the math in description

8. **implementationSteps**: 3-6 concrete steps with file names
   - Example: "1. Edit theme.liquid line 47..."
   - Example: "2. Add CSS to assets/custom.css..."

9. **codeSnippet**: COPY-PASTE READY code
   - Shopify Liquid for templates
   - CSS for styling
   - JavaScript if needed
   - Include comments explaining what it does

10. **dependencies**: Array of other recommendations that should be done first
    - Example: ["rec-001-fix-navigation"] if navigation must work first

11. **confidence**: Your confidence in the estimate (%)
    - 90-100%: Proven pattern, strong data support
    - 70-89%: Likely works, some assumptions
    - 50-69%: Hypothesis, needs testing
    - <50%: Experimental, high variance

12. **benchmarkComparison**: How store compares to industry
    - Example: "Your hero CTA at 650px, industry best practice <400px"
    - Example: "Your mobile CR 1.2% vs industry avg 2.1% (-0.9%)"

## Output Format

Return ONLY a JSON array. No markdown, no explanation, just:

[
  {
    "id": "rec-001",
    "title": "...",
    "description": "...",
    "impact": 5,
    "effort": 2,
    "category": "hero",
    "estimatedUplift": "+0.6% CR (1.8% → 2.4%)",
    "estimatedROI": "+72 orders/mo × $${metrics.aov} = +$${72 * metrics.aov}/mo",
    "implementationSteps": ["...", "..."],
    "codeSnippet": "...",
    "dependencies": [],
    "confidence": 85,
    "benchmarkComparison": "..."
  },
  // ... 9-11 more recommendations
]

CRITICAL RULES:
- NO generic advice ("improve UX", "optimize design")
- EVERY recommendation must be implementable TODAY
- SHOW YOUR MATH for ROI calculations
- PRIORITIZE quick wins (high impact, low effort) first
- BE BRUTALLY HONEST about what's broken
`;

  return { system: systemPrompt, user: userPrompt };
}
```

**Acceptance Criteria:**
- [ ] System prompt zawiera expertise context
- [ ] User prompt zawiera wszystkie metryki
- [ ] Instrukcje jasno definiują każde pole
- [ ] Format output wyraźnie JSON array
- [ ] Build passing

---

## 📦 FAZA 2: Multi-Stage Analysis Architecture

### Cel
Zamiast 1 shot analysis, robimy 3-stage process dla głębszej analizy.

### Zadanie 2.1: Refactor analyzeStore()

**Plik**: `app/utils/claude.server.ts` lub nowy `app/utils/multi-stage-analysis.server.ts`

**Utwórz nowy plik** `app/utils/multi-stage-analysis.server.ts`:

```typescript
import { callClaudeAPI } from "./claude.server";
import type { ShopifyData, StoreMetrics } from "./types";

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

interface Stage3Prioritized {
  recommendationId: string;
  title: string;
  description: string;
  impact: number;
  effort: number;
  category: string;
  priorityScore: number;
  implementationOrder: number;
  dependencies: string[];
  estimatedUplift: string;
  estimatedROI: string;
  implementationSteps: string[];
  codeSnippet?: string;
  confidence: number;
  benchmarkComparison: string;
}

export async function multiStageAnalysis(
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: { homepage: string; product: string; mobile: string }
): Promise<Stage3Prioritized[]> {
  
  // STAGE 1: Quick Problem Identification
  console.log("Stage 1: Identifying critical problems...");
  const problems = await stage1_IdentifyProblems(shopData, metrics, screenshots);
  
  // STAGE 2: Deep Dive on Top Problems
  console.log(`Stage 2: Deep diving into top ${Math.min(3, problems.length)} problems...`);
  const topProblems = problems
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 3);
  
  const deepDives = await Promise.all(
    topProblems.map(problem => 
      stage2_DeepDive(problem, shopData, metrics, screenshots)
    )
  );
  
  // STAGE 3: Generate & Prioritize All Recommendations
  console.log("Stage 3: Generating and prioritizing recommendations...");
  const allRecommendations = deepDives.flatMap(dive => 
    dive.recommendations.map(rec => ({
      problemId: dive.problemId,
      ...rec
    }))
  );
  
  const prioritized = await stage3_PrioritizeAndEnrich(
    allRecommendations,
    shopData,
    metrics
  );
  
  return prioritized;
}

async function stage1_IdentifyProblems(
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: any
): Promise<Stage1Problem[]> {
  const prompt = `Analyze this Shopify store and identify the 3-5 most critical conversion problems.

Store metrics:
- Conversion Rate: ${metrics.conversionRate}%
- AOV: $${metrics.aov}
- Traffic: ${metrics.monthlyVisitors}/mo
- Mobile %: ${metrics.mobilePercentage}%

For each problem, provide:
- id: Unique identifier (e.g., "prob-hero-cta")
- title: Specific problem (e.g., "Hero CTA invisible on mobile")
- severity: 1-10 (10 = critical)
- affectedUsers: Percentage and count (e.g., "78% of mobile users = 9,360/mo")
- category: hero|product|cart|mobile|trust|checkout
- quickEvidence: One-sentence proof (e.g., "CTA at 650px, 78% have 667px viewport")

Return JSON array of 3-5 problems, sorted by severity DESC.`;

  const response = await callClaudeAPI(
    "You are a CRO expert identifying critical conversion blockers.",
    prompt,
    Object.values(screenshots).map(data => ({
      data: data.split(",")[1],
      mediaType: "image/png"
    }))
  );

  return JSON.parse(response);
}

async function stage2_DeepDive(
  problem: Stage1Problem,
  shopData: ShopifyData,
  metrics: StoreMetrics,
  screenshots: any
): Promise<Stage2DeepDive> {
  const prompt = `Deep dive analysis for problem: ${problem.title}

Problem context:
${JSON.stringify(problem, null, 2)}

Store context:
- Current CR: ${metrics.conversionRate}%
- Industry avg: 2.4% (example - use realistic benchmark)
- Gap: ${2.4 - metrics.conversionRate}% = $X lost revenue/mo

Provide:
1. whyItMatters: Detailed explanation with psychology and data
2. dataEvidence: Specific metrics proving this is a problem
3. psychologyPrinciple: What psychological principle is violated
4. recommendations: Array of 3-5 specific solutions

Each recommendation should have:
- title: Specific action
- specificChange: Exact change to make (with measurements, colors, copy)
- expectedOutcome: Realistic impact with calculation

Return JSON object.`;

  const response = await callClaudeAPI(
    "You are a CRO expert doing deep-dive analysis.",
    prompt,
    Object.values(screenshots).map(data => ({
      data: data.split(",")[1],
      mediaType: "image/png"
    }))
  );

  return JSON.parse(response);
}

async function stage3_PrioritizeAndEnrich(
  recommendations: any[],
  shopData: ShopifyData,
  metrics: StoreMetrics
): Promise<Stage3Prioritized[]> {
  const prompt = `You have ${recommendations.length} CRO recommendations.

Enrich each with:
- Complete implementation details
- Code snippets (Liquid, CSS, JS)
- Realistic ROI calculation based on these metrics:
  * Current CR: ${metrics.conversionRate}%
  * Monthly traffic: ${metrics.monthlyVisitors}
  * AOV: $${metrics.aov}
- Priority score: (Impact × 10) / Effort
- Implementation order (considering dependencies)
- Confidence level (%)
- Industry benchmark comparison

Recommendations to process:
${JSON.stringify(recommendations, null, 2)}

Return JSON array sorted by priorityScore DESC, with implementationOrder 1,2,3...`;

  const response = await callClaudeAPI(
    "You are a CRO expert finalizing recommendations.",
    prompt
  );

  const enriched = JSON.parse(response);
  
  // Add priority scores and order
  return enriched
    .map((rec: any) => ({
      ...rec,
      priorityScore: (rec.impact * 10) / rec.effort,
    }))
    .sort((a: any, b: any) => b.priorityScore - a.priorityScore)
    .map((rec: any, index: number) => ({
      ...rec,
      implementationOrder: index + 1,
    }));
}
```

**Acceptance Criteria:**
- [ ] Plik `multi-stage-analysis.server.ts` utworzony
- [ ] 3 funkcje stage1, stage2, stage3 zaimplementowane
- [ ] TypeScript types poprawne
- [ ] Build passing

---

### Zadanie 2.2: Integrate Multi-Stage into Main Flow

**Plik**: `app/jobs/analyzeStore.ts` lub `app/routes/api.analysis.start.tsx`

**Znajdź miejsce gdzie wywołujesz obecną analizę i zamień na:**

```typescript
import { multiStageAnalysis } from "~/utils/multi-stage-analysis.server";

// PRZED:
// const recommendations = await analyzeStore(shopData, metrics, screenshots);

// PO:
const recommendations = await multiStageAnalysis(shopData, metrics, screenshots);

// Recommendations są już w pełnym formacie Stage3Prioritized[]
// Zapisz do bazy jak dotychczas
```

**Acceptance Criteria:**
- [ ] Multi-stage analysis zintegrowana w main flow
- [ ] Test run zwraca 10-12 rekomendacji (nie 5-7)
- [ ] Każda rekomendacja ma wszystkie pola
- [ ] Build passing

---

## 📦 FAZA 3: Real ROI Calculator

### Cel
Zamienić generyczne "+8-12%" na matematyczne kalkulacje oparte na RZECZYWISTYCH danych sklepu.

### Zadanie 3.1: Create ROI Calculator Module

**Utwórz nowy plik**: `app/utils/roi-calculator.server.ts`

```typescript
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

export function calculateRealisticROI(
  impact: number, // 1-5
  effort: number, // 1-5
  category: string,
  metrics: StoreMetrics
): ROICalculation {
  
  // Mapowanie impact score → realistic CR lift
  const impactToCRLift = {
    5: 0.008, // +0.8% CR (critical fix)
    4: 0.005, // +0.5% CR (high impact)
    3: 0.003, // +0.3% CR (medium)
    2: 0.0015, // +0.15% CR (low)
    1: 0.0005, // +0.05% CR (minimal)
  };

  // Kategoria może wpływać na multiplier
  const categoryMultipliers: Record<string, number> = {
    hero: 1.2, // Hero section affects all users
    product: 1.0,
    cart: 1.3, // Cart optimization high impact
    checkout: 1.4, // Checkout critical
    mobile: 0.8, // Only affects mobile users
    trust: 1.1,
    navigation: 0.9,
    speed: 1.15,
  };

  const baseCRLift = impactToCRLift[impact as keyof typeof impactToCRLift] || 0.003;
  const multiplier = categoryMultipliers[category] || 1.0;
  const adjustedCRLift = baseCRLift * multiplier;

  // Jeśli mobile-only, adjust by mobile percentage
  let effectiveTraffic = metrics.monthlyVisitors;
  if (category === "mobile") {
    effectiveTraffic = metrics.monthlyVisitors * (metrics.mobilePercentage / 100);
  }

  // Calculations
  const currentCR = metrics.conversionRate / 100;
  const projectedCR = currentCR + adjustedCRLift;
  
  const currentOrders = effectiveTraffic * currentCR;
  const projectedOrders = effectiveTraffic * projectedCR;
  const additionalOrders = projectedOrders - currentOrders;
  
  const monthlyRevenueLift = additionalOrders * metrics.avgOrderValue;
  const annualRevenueLift = monthlyRevenueLift * 12;

  // Confidence based on effort (easier = more confidence)
  const effortConfidence = {
    1: 95, // Very easy, proven
    2: 85, // Easy, likely works
    3: 75, // Medium complexity
    4: 65, // Hard, more variables
    5: 55, // Very hard, uncertain
  };
  
  const baseConfidence = effortConfidence[effort as keyof typeof effortConfidence] || 70;
  
  // Adjust confidence by impact (higher impact = more evidence)
  const impactBonus = impact >= 4 ? 10 : impact >= 3 ? 5 : 0;
  const finalConfidence = Math.min(95, baseConfidence + impactBonus);

  return {
    estimatedLift: `+${(adjustedCRLift * 100).toFixed(2)}% CR`,
    monthlyRevenue: `+$${Math.round(monthlyRevenueLift).toLocaleString()}/mo`,
    annualRevenue: `+$${Math.round(annualRevenueLift).toLocaleString()}/yr`,
    confidence: finalConfidence,
    calculation: {
      current: `${(currentCR * 100).toFixed(2)}% CR × ${effectiveTraffic.toLocaleString()} visits = ${Math.round(currentOrders)} orders/mo`,
      projected: `${(projectedCR * 100).toFixed(2)}% CR × ${effectiveTraffic.toLocaleString()} visits = ${Math.round(projectedOrders)} orders/mo`,
      difference: `+${Math.round(additionalOrders)} orders × $${metrics.avgOrderValue} AOV = +$${Math.round(monthlyRevenueLift).toLocaleString()}/mo`,
    },
    assumptions: [
      `Impact score ${impact}/5 translates to +${(adjustedCRLift * 100).toFixed(2)}% CR lift`,
      `${category === 'mobile' ? 'Mobile-only impact' : 'Affects all traffic'}`,
      `AOV remains constant at $${metrics.avgOrderValue}`,
      `No seasonal variations considered`,
      `Confidence ${finalConfidence}% based on effort level ${effort}/5`,
    ],
  };
}

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
```

**Acceptance Criteria:**
- [ ] ROI calculator działa dla wszystkich impact/effort combinations
- [ ] Calculations matematycznie poprawne
- [ ] Mobile-specific handling
- [ ] Category multipliers sensowne
- [ ] TypeScript types complete
- [ ] Build passing

---

### Zadanie 3.2: Integrate ROI Calculator

**Plik**: `app/utils/multi-stage-analysis.server.ts` (funkcja `stage3_PrioritizeAndEnrich`)

**Dodaj import:**
```typescript
import { calculateRealisticROI, formatROIForDisplay } from "./roi-calculator.server";
```

**W funkcji `stage3_PrioritizeAndEnrich`, po otrzymaniu response od Claude:**

```typescript
const enriched = JSON.parse(response);

// Calculate realistic ROI for each recommendation
const withROI = enriched.map((rec: any) => {
  const roi = calculateRealisticROI(
    rec.impact,
    rec.effort,
    rec.category,
    metrics
  );

  return {
    ...rec,
    estimatedUplift: roi.estimatedLift,
    estimatedROI: roi.monthlyRevenue,
    roiDetails: roi, // Full calculation object for modal view
    roiFormatted: formatROIForDisplay(roi), // Human-readable
  };
});

return withROI
  .map((rec: any) => ({
    ...rec,
    priorityScore: (rec.impact * 10) / rec.effort,
  }))
  .sort((a: any, b: any) => b.priorityScore - a.priorityScore)
  .map((rec: any, index: number) => ({
    ...rec,
    implementationOrder: index + 1,
  }));
```

**Acceptance Criteria:**
- [ ] Każda rekomendacja ma realistic ROI
- [ ] ROI calculation visible w JSON response
- [ ] Build passing
- [ ] Test run pokazuje proper ROI numbers

---

## 📦 FAZA 4: Validation & Quality Control

### Cel
Odfiltrowujemy słabe/generyczne rekomendacje, dodajemy smart ranking.

### Zadanie 4.1: Create Validation Module

**Utwórz nowy plik**: `app/utils/recommendation-validator.server.ts`

```typescript
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: number;
  effort: number;
  category: string;
  implementationSteps: string[];
  codeSnippet?: string;
  [key: string]: any;
}

const GENERIC_PHRASES = [
  "improve user experience",
  "enhance ux",
  "optimize website",
  "better design",
  "improve layout",
  "make it better",
  "increase engagement",
  "boost conversions", // without specifics
  "improve performance", // without metrics
  "enhance ui",
];

const VAGUE_TITLES = [
  /^improve\s+\w+$/i, // "improve mobile"
  /^optimize\s+\w+$/i, // "optimize checkout"
  /^enhance\s+\w+$/i, // "enhance design"
  /^better\s+\w+$/i, // "better ux"
];

export function validateRecommendations(
  recommendations: Recommendation[]
): Recommendation[] {
  return recommendations
    .filter(isSpecific)
    .filter(isActionable)
    .filter(hasRealisticEffort)
    .map(addQualityScore)
    .sort((a, b) => (b as any).qualityScore - (a as any).qualityScore);
}

function isSpecific(rec: Recommendation): boolean {
  const titleLower = rec.title.toLowerCase();
  const descLower = rec.description.toLowerCase();

  // Reject generic phrases
  if (GENERIC_PHRASES.some(phrase => titleLower.includes(phrase))) {
    console.log(`❌ Rejected generic: ${rec.title}`);
    return false;
  }

  // Reject vague title patterns
  if (VAGUE_TITLES.some(pattern => pattern.test(rec.title))) {
    console.log(`❌ Rejected vague: ${rec.title}`);
    return false;
  }

  // Must have some specificity markers
  const specificityMarkers = [
    /\d+px/i, // pixel measurements
    /\d+%/i, // percentages
    /#[0-9a-f]{3,6}/i, // color codes
    /\$\d+/i, // dollar amounts
    /\d+\s*(second|minute|hour)/i, // time measurements
    /(above|below|left|right|top|bottom)\s+the\s+fold/i, // positioning
    /(increase|decrease|change|move|reposition)\s+\w+\s+(by|to)\s+\d+/i, // specific actions
  ];

  const hasSpecificity = specificityMarkers.some(marker => 
    marker.test(rec.title) || marker.test(rec.description)
  );

  if (!hasSpecificity) {
    console.log(`❌ Rejected non-specific: ${rec.title}`);
  }

  return hasSpecificity;
}

function isActionable(rec: Recommendation): boolean {
  // Must have implementation steps
  if (!rec.implementationSteps || rec.implementationSteps.length === 0) {
    console.log(`❌ Rejected no steps: ${rec.title}`);
    return false;
  }

  // Steps must be detailed (not just "do X")
  const detailedSteps = rec.implementationSteps.filter(step => 
    step.length > 20 && // At least 20 chars
    (step.includes("edit") || 
     step.includes("add") || 
     step.includes("change") ||
     step.includes("modify") ||
     step.includes("create") ||
     step.includes("update"))
  );

  if (detailedSteps.length < 2) {
    console.log(`❌ Rejected vague steps: ${rec.title}`);
    return false;
  }

  return true;
}

function hasRealisticEffort(rec: Recommendation): boolean {
  // Effort should match implementation complexity
  const stepCount = rec.implementationSteps?.length || 0;
  const hasCode = !!rec.codeSnippet;

  // Sanity checks
  if (rec.effort === 1 && stepCount > 5) {
    console.log(`⚠️ Effort mismatch: ${rec.title} (effort 1 but ${stepCount} steps)`);
    rec.effort = Math.min(3, Math.ceil(stepCount / 2));
  }

  if (rec.effort === 5 && stepCount < 3 && !hasCode) {
    console.log(`⚠️ Effort mismatch: ${rec.title} (effort 5 but simple steps)`);
    rec.effort = 3;
  }

  return true; // Always pass, but auto-correct above
}

function addQualityScore(rec: Recommendation): Recommendation {
  let score = 50; // Base score

  // Bonus for specificity
  if (/\d+px/i.test(rec.title)) score += 10;
  if (/#[0-9a-f]{3,6}/i.test(rec.description)) score += 5;
  if (/\$\d+/.test(rec.description)) score += 5;

  // Bonus for detailed steps
  const avgStepLength = rec.implementationSteps.reduce((sum, step) => sum + step.length, 0) / rec.implementationSteps.length;
  if (avgStepLength > 50) score += 10;
  if (avgStepLength > 100) score += 10;

  // Bonus for code snippet
  if (rec.codeSnippet && rec.codeSnippet.length > 100) score += 15;

  // Bonus for high impact, low effort
  const impactEffortRatio = rec.impact / rec.effort;
  if (impactEffortRatio >= 2) score += 15; // 5/2, 4/2, etc
  if (impactEffortRatio >= 3) score += 10; // 5/1, etc

  return {
    ...rec,
    qualityScore: Math.min(100, score),
  };
}

export function conflictCheck(recommendations: Recommendation[]): Recommendation[] {
  // Simple conflict detection
  const conflicts: Map<string, string[]> = new Map([
    ["hero-cta", ["hero-image", "hero-text"]], // If changing CTA, might conflict with hero redesign
    ["mobile-menu", ["navigation"]], // Mobile menu vs desktop nav changes
  ]);

  // Mark conflicting recommendations
  return recommendations.map(rec => {
    const potentialConflicts = conflicts.get(rec.id.split("-")[1]) || [];
    const hasConflict = recommendations.some(other => 
      other.id !== rec.id && potentialConflicts.includes(other.id.split("-")[1])
    );

    if (hasConflict) {
      return {
        ...rec,
        warning: "May conflict with other recommendations - review together",
      };
    }

    return rec;
  });
}
```

**Acceptance Criteria:**
- [ ] Validation module utworzony
- [ ] Filters działają poprawnie
- [ ] Quality scoring sensowny
- [ ] Build passing

---

### Zadanie 4.2: Apply Validation in Pipeline

**Plik**: `app/utils/multi-stage-analysis.server.ts`

**Na końcu funkcji `multiStageAnalysis`, przed return:**

```typescript
import { validateRecommendations, conflictCheck } from "./recommendation-validator.server";

export async function multiStageAnalysis(
  // ... params
): Promise<Stage3Prioritized[]> {
  
  // ... existing stages ...
  
  // VALIDATION & QUALITY CONTROL
  console.log("Validating and filtering recommendations...");
  const validated = validateRecommendations(prioritized);
  const checkedConflicts = conflictCheck(validated);
  
  console.log(`✅ ${validated.length}/${prioritized.length} recommendations passed validation`);
  
  return checkedConflicts;
}
```

**Acceptance Criteria:**
- [ ] Validation applied before returning
- [ ] Console logs show filtering stats
- [ ] Generic recommendations filtered out
- [ ] Build passing

---

## 📦 FAZA 5: Testing & Verification

### Zadanie 5.1: Update Unit Tests

**Plik**: `tests/roi-calculator.test.ts` (utwórz nowy)

```typescript
import { describe, it, expect } from "vitest";
import { calculateRealisticROI } from "../app/utils/roi-calculator.server";

describe("ROI Calculator", () => {
  const mockMetrics = {
    conversionRate: 1.8,
    avgOrderValue: 85,
    monthlyVisitors: 12000,
    mobilePercentage: 65,
    cartAbandonmentRate: 68,
  };

  it("calculates ROI for high impact, low effort", () => {
    const roi = calculateRealisticROI(5, 2, "hero", mockMetrics);
    
    expect(roi.confidence).toBeGreaterThan(80);
    expect(roi.estimatedLift).toContain("%");
    expect(roi.monthlyRevenue).toContain("$");
    expect(roi.calculation.current).toBeTruthy();
  });

  it("adjusts for mobile-only changes", () => {
    const mobileROI = calculateRealisticROI(4, 2, "mobile", mockMetrics);
    const heroROI = calculateRealisticROI(4, 2, "hero", mockMetrics);
    
    // Mobile should have lower $ impact (only 65% of traffic)
    const mobileValue = parseInt(mobileROI.monthlyRevenue.replace(/[^0-9]/g, ""));
    const heroValue = parseInt(heroROI.monthlyRevenue.replace(/[^0-9]/g, ""));
    
    expect(mobileValue).toBeLessThan(heroValue);
  });

  it("confidence decreases with effort", () => {
    const easy = calculateRealisticROI(4, 1, "hero", mockMetrics);
    const hard = calculateRealisticROI(4, 5, "hero", mockMetrics);
    
    expect(easy.confidence).toBeGreaterThan(hard.confidence);
  });
});
```

**Plik**: `tests/recommendation-validator.test.ts` (utwórz nowy)

```typescript
import { describe, it, expect } from "vitest";
import { validateRecommendations } from "../app/utils/recommendation-validator.server";

describe("Recommendation Validator", () => {
  it("filters out generic recommendations", () => {
    const recs = [
      {
        id: "1",
        title: "Improve user experience",
        description: "Make the site better",
        impact: 4,
        effort: 2,
        category: "hero",
        implementationSteps: ["Step 1", "Step 2"],
      },
      {
        id: "2",
        title: "Reposition CTA 120px higher on mobile viewport",
        description: "Move button from 650px to 530px",
        impact: 5,
        effort: 2,
        category: "mobile",
        implementationSteps: [
          "Edit theme.liquid line 47",
          "Add CSS margin-top: -120px",
        ],
      },
    ];

    const validated = validateRecommendations(recs);
    
    expect(validated.length).toBe(1);
    expect(validated[0].id).toBe("2");
  });

  it("requires specific measurements", () => {
    const vague = {
      id: "1",
      title: "Make button bigger",
      description: "Increase size",
      impact: 3,
      effort: 1,
      category: "hero",
      implementationSteps: ["Change size"],
    };

    const specific = {
      id: "2",
      title: "Increase CTA button from 14px to 18px font",
      description: "Current 14px too small on mobile",
      impact: 3,
      effort: 1,
      category: "mobile",
      implementationSteps: ["Edit CSS: font-size: 18px"],
    };

    const validated = validateRecommendations([vague, specific]);
    
    expect(validated.length).toBe(1);
    expect(validated[0].id).toBe("2");
  });
});
```

**Run tests:**
```bash
npm run test
```

**Acceptance Criteria:**
- [ ] ROI calculator tests pass
- [ ] Validator tests pass
- [ ] Edge cases covered
- [ ] 100% test coverage for new modules

---

### Zadanie 5.2: End-to-End Test on Dev Store

**Manual test checklist:**

```markdown
## E2E Test - Upgraded Analysis System

### Setup
- [ ] Dev store: conversionai-development.myshopify.com
- [ ] Logged in as admin
- [ ] Dashboard loaded

### Test Flow
1. Click "Run New Analysis"
2. Wait for completion (90-120 seconds)
3. Verify results:

### Expected Results
- [ ] 10-12 recommendations (not 5-7)
- [ ] Each has detailed ROI calculation
- [ ] Each has specific measurements (px, %, $)
- [ ] Each has code snippets
- [ ] No generic titles ("improve UX")
- [ ] Priority order makes sense
- [ ] Confidence scores present (%)
- [ ] Implementation order numbered
- [ ] Quality score visible (if in modal)

### Spot Check 3 Recommendations
For each, verify:
- [ ] Title is specific and actionable
- [ ] Description explains WHY (data + psychology)
- [ ] ROI shows full calculation breakdown
- [ ] Implementation steps are detailed
- [ ] Code snippet is copy-paste ready
- [ ] Confidence level seems reasonable

### Performance
- [ ] Analysis completes in <120 seconds
- [ ] No errors in browser console
- [ ] Database saves all recommendations
- [ ] UI renders properly

### Pass Criteria
All checkboxes above must be ✅
```

---

## 📊 FAZA 6: Documentation & Monitoring

### Zadanie 6.1: Update API Documentation

**Plik**: `app/utils/types.ts` (or create if missing)

**Add/update interfaces:**

```typescript
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 1 | 2 | 3 | 4 | 5;
  effort: 1 | 2 | 3 | 4 | 5;
  category: "hero" | "product" | "cart" | "checkout" | "mobile" | "trust" | "navigation" | "speed";
  estimatedUplift: string; // "+0.6% CR"
  estimatedROI: string; // "+$4,590/mo"
  roiDetails: ROICalculation; // Full breakdown
  roiFormatted: string; // Human-readable
  implementationSteps: string[];
  codeSnippet?: string;
  dependencies: string[];
  confidence: number; // 0-100
  benchmarkComparison: string;
  priorityScore: number;
  implementationOrder: number;
  qualityScore?: number;
  warning?: string;
}

export interface ROICalculation {
  estimatedLift: string;
  monthlyRevenue: string;
  annualRevenue: string;
  confidence: number;
  calculation: {
    current: string;
    projected: string;
    difference: string;
  };
  assumptions: string[];
}

export interface StoreMetrics {
  conversionRate: number;
  avgOrderValue: number;
  monthlyVisitors: number;
  mobilePercentage: number;
  cartAbandonmentRate: number;
}

export interface ShopifyData {
  shop: string;
  topProducts: Array<{ title: string; price: number }>;
  priceRange: { min: number; max: number };
  theme: { name: string; id: string };
  industry?: string;
}
```

---

### Zadanie 6.2: Add Cost Monitoring

**Plik**: `app/utils/cost-monitor.server.ts` (utwórz nowy)

```typescript
export interface APIUsage {
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  shop: string;
}

const PRICING = {
  "claude-sonnet-4-5-20250929": {
    input: 0.003, // per 1K tokens
    output: 0.015,
  },
  "claude-3-haiku-20240307": {
    input: 0.00025,
    output: 0.00125,
  },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return inputCost + outputCost;
}

export async function logAPIUsage(
  model: string,
  inputTokens: number,
  outputTokens: number,
  shop: string
) {
  const cost = calculateCost(model, inputTokens, outputTokens);

  // Log to database or external service
  console.log(`💰 API Usage: ${model} | ${shop} | $${cost.toFixed(4)}`);

  // Could save to database:
  // await prisma.apiUsage.create({
  //   data: { model, inputTokens, outputTokens, cost, shop }
  // });

  return cost;
}

export async function getMonthlySpend(shop?: string): Promise<number> {
  // Query database for current month's spend
  // const usage = await prisma.apiUsage.findMany({
  //   where: {
  //     shop: shop,
  //     timestamp: { gte: startOfMonth(new Date()) }
  //   }
  // });
  // return usage.reduce((sum, u) => sum + u.cost, 0);
  
  return 0; // Placeholder
}
```

**Integrate into claude.server.ts:**

```typescript
import { logAPIUsage } from "./cost-monitor.server";

export async function callClaudeAPI(
  systemPrompt: string,
  userPrompt: string,
  images?: any[],
  shop?: string
): Promise<string> {
  // ... existing code ...

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 8192,
    // ...
  });

  // Log usage
  await logAPIUsage(
    "claude-sonnet-4-5-20250929",
    response.usage.input_tokens,
    response.usage.output_tokens,
    shop || "unknown"
  );

  // ... rest of code ...
}
```

---

## ✅ Final Checklist

### Pre-Deployment
- [ ] All 5 phases completed
- [ ] Unit tests passing (>90% coverage)
- [ ] E2E test passed on dev store
- [ ] No TypeScript errors
- [ ] Build passing (`npm run build`)
- [ ] Cost monitoring active

### Quality Verification
- [ ] 10-12 recommendations per analysis (not 5-7)
- [ ] Each recommendation has realistic ROI with math
- [ ] No generic recommendations pass validation
- [ ] Priority scoring makes sense
- [ ] Code snippets are copy-paste ready
- [ ] Implementation orders logical

### Performance
- [ ] Analysis completes in <120 seconds
- [ ] API costs <$0.50 per analysis
- [ ] Database saves all fields correctly
- [ ] UI renders properly

### Documentation
- [ ] Types updated in types.ts
- [ ] Cost monitoring documented
- [ ] IMPLEMENTATION_LOG.md updated

---

## 📈 Expected Outcomes

### Before Upgrade
```json
{
  "title": "Optimize hero section",
  "description": "The hero needs improvement",
  "impact": 4,
  "effort": 2,
  "estimatedUplift": "+8-12%",
  "implementationSteps": ["Edit hero", "Test changes"]
}
```

### After Upgrade
```json
{
  "id": "rec-001",
  "title": "Reposition primary CTA 120px higher on mobile viewport (currently 650px from top)",
  "description": "Analysis of 9,360 monthly mobile sessions shows 78% have viewport height ≤667px (iPhone 8/SE standard). Your primary CTA button loads at 650px, requiring scroll to become visible. Industry data shows 50% of mobile bounces occur within first 3 seconds before scroll. Moving CTA to 530px ensures above-the-fold visibility for 95% of users.\n\nPsychological principle: Zero Moment of Truth - users decide to engage within 3 seconds of page load. Hidden CTA = lost opportunity.\n\nData evidence: Your mobile CR 1.2% vs industry average 2.1% = -0.9% gap = -108 mobile orders/month.",
  
  "impact": 5,
  "effort": 2,
  "category": "mobile",
  
  "estimatedUplift": "+0.60% CR (1.2% → 1.8%)",
  "estimatedROI": "+$4,590/mo",
  "roiDetails": {
    "estimatedLift": "+0.60% CR",
    "monthlyRevenue": "+$4,590/mo",
    "annualRevenue": "+$55,080/yr",
    "confidence": 85,
    "calculation": {
      "current": "1.20% CR × 9,000 mobile visits = 108 orders/mo",
      "projected": "1.80% CR × 9,000 mobile visits = 162 orders/mo",
      "difference": "+54 orders × $85 AOV = +$4,590/mo"
    },
    "assumptions": [
      "Impact score 5/5 translates to +0.60% CR lift",
      "Mobile-only impact (65% of total traffic)",
      "AOV remains constant at $85",
      "No seasonal variations considered",
      "Confidence 85% based on effort level 2/5"
    ]
  },
  
  "implementationSteps": [
    "Edit theme.liquid (sections/hero.liquid) line 47 - locate <div class=\"hero-cta-wrapper\">",
    "Add CSS rule: .hero-cta { margin-top: -120px; position: relative; z-index: 10; }",
    "Test on mobile device inspector (iPhone 8, 375×667px viewport)",
    "Verify CTA visible without scroll on 5 different mobile sizes",
    "A/B test for 7 days to confirm 0.5-0.7% CR lift",
    "If successful, make permanent; monitor for 30 days"
  ],
  
  "codeSnippet": "{% comment %} Add to theme.liquid or assets/custom.css {% endcomment %}\n<style>\n  @media (max-width: 768px) {\n    .hero-cta {\n      margin-top: -120px;\n      position: relative;\n      z-index: 10;\n      box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n    }\n    \n    /* Ensure CTA stands out */\n    .hero-cta-button {\n      background: #FF6B35; /* High contrast orange */\n      font-size: 18px;\n      padding: 16px 32px;\n      min-height: 56px; /* Touch-friendly */\n    }\n  }\n</style>",
  
  "dependencies": [],
  "confidence": 85,
  "benchmarkComparison": "Industry best practice: CTA <400px from top. Yours: 650px (+250px gap). Top performers achieve 2.5-3% mobile CR vs your 1.2%.",
  
  "priorityScore": 25,
  "implementationOrder": 1,
  "qualityScore": 95
}
```

### Metrics Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Recommendations/analysis | 5-7 | 10-12 | +70% |
| ROI accuracy | Generic | Calculated | +200% |
| Specificity | Medium | High | +150% |
| Actionability | Good | Excellent | +100% |
| Code quality | Basic | Production-ready | +180% |
| Confidence scores | None | Present | New |
| Quality filtering | None | Active | New |

---

## 🚨 Important Notes

### Cost Impact
- **Haiku cost**: ~$0.05 per analysis
- **Sonnet 4.5 cost**: ~$0.35-0.50 per analysis
- **Increase**: 7-10x
- **Worth it**: YES - quality improvement is 3-5x

At 100 analyses/month:
- Old cost: $5/mo
- New cost: $35-50/mo
- **Still very affordable** for the quality delivered

### Performance
- Analysis time may increase from 45s → 90-120s
- This is acceptable - users see "Analyzing..." with progress
- Quality > Speed for this use case

### Monitoring
- Watch API costs in first month
- Track if users convert better with new recommendations
- Measure implementation rate (do merchants actually use them?)

---

## 🎬 Execution Instructions for Claude Code

Copy this entire document and paste it to Claude Code with this prompt:

```
Execute the complete recommendation quality upgrade plan from RECOMMENDATION_QUALITY_UPGRADE.md.

Work through each phase sequentially:
1. Phase 1: Model upgrade
2. Phase 2: Multi-stage analysis
3. Phase 3: ROI calculator
4. Phase 4: Validation layer
5. Phase 5: Testing

For each phase:
- Read the task description carefully
- Implement all code changes
- Run tests to verify
- Report completion before moving to next phase

After each phase completes, show me:
✅ What was done
📊 Test results
⚡ What's next

Start with Phase 1, Task 1.1 (Model Configuration Update).
```

---

**Document End**

*Ready to transform ConversionAI recommendations from "good" to "world-class".*
*Estimated total implementation time: 6-8 hours*
*Expected quality improvement: 3-5x*
*Cost increase: Acceptable ($5 → $40/mo for 100 analyses)*

**Let's ship this! 🚀**
