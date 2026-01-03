/**
 * Cost Monitor Module
 * Tracks Claude API usage and costs for budget management
 *
 * Pricing (as of 2025):
 * - Claude Sonnet 4.5: $3/1M input, $15/1M output tokens
 * - Claude 3 Haiku: $0.25/1M input, $1.25/1M output tokens
 */

import { logger } from "./logger.server";

export interface APIUsage {
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  shop: string;
  stage?: string; // 'stage1' | 'stage2' | 'stage3'
}

// Pricing per 1K tokens
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-5-20250929": {
    input: 0.003, // $3 per 1M = $0.003 per 1K
    output: 0.015, // $15 per 1M = $0.015 per 1K
  },
  "claude-3-haiku-20240307": {
    input: 0.00025, // $0.25 per 1M
    output: 0.00125, // $1.25 per 1M
  },
  // Default fallback for unknown models
  "default": {
    input: 0.003,
    output: 0.015,
  },
};

// In-memory usage tracking (could be replaced with database storage)
const usageLog: APIUsage[] = [];

/**
 * Calculate cost for API call
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["default"];

  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;

  return inputCost + outputCost;
}

/**
 * Log API usage (call after each Claude API call)
 */
export async function logAPIUsage(
  model: string,
  inputTokens: number,
  outputTokens: number,
  shop: string,
  stage?: string
): Promise<number> {
  const cost = calculateCost(model, inputTokens, outputTokens);

  const usage: APIUsage = {
    timestamp: new Date(),
    model,
    inputTokens,
    outputTokens,
    cost,
    shop,
    stage,
  };

  // Store in memory (for development)
  usageLog.push(usage);

  // Log for monitoring
  logger.info(`💰 API Usage: ${model} | ${shop}${stage ? ` | ${stage}` : ''}`);
  logger.info(`   Tokens: ${inputTokens.toLocaleString()} in / ${outputTokens.toLocaleString()} out`);
  logger.info(`   Cost: $${cost.toFixed(4)}`);

  // TODO: Persist to database
  // await prisma.apiUsage.create({ data: usage });

  return cost;
}

/**
 * Get total spend for a shop (current session only - for development)
 */
export function getSessionSpend(shop?: string): {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  callCount: number;
} {
  const filtered = shop
    ? usageLog.filter(u => u.shop === shop)
    : usageLog;

  return {
    totalCost: filtered.reduce((sum, u) => sum + u.cost, 0),
    totalInputTokens: filtered.reduce((sum, u) => sum + u.inputTokens, 0),
    totalOutputTokens: filtered.reduce((sum, u) => sum + u.outputTokens, 0),
    callCount: filtered.length,
  };
}

/**
 * Estimate cost for a full analysis (3-stage)
 * Based on typical token usage
 */
export function estimateAnalysisCost(): {
  estimated: string;
  breakdown: { stage: string; inputTokens: number; outputTokens: number; cost: number }[];
} {
  // Typical token usage per stage (based on testing)
  const stageEstimates = [
    { stage: "Stage 1: Problem ID", inputTokens: 2000, outputTokens: 1000 },
    { stage: "Stage 2: Deep Dives (x3)", inputTokens: 6000, outputTokens: 3000 },
    { stage: "Stage 3: Enrichment", inputTokens: 4000, outputTokens: 4000 },
  ];

  const breakdown = stageEstimates.map(s => ({
    ...s,
    cost: calculateCost("claude-sonnet-4-5-20250929", s.inputTokens, s.outputTokens),
  }));

  const totalCost = breakdown.reduce((sum, s) => sum + s.cost, 0);

  return {
    estimated: `$${totalCost.toFixed(2)}/analysis`,
    breakdown,
  };
}

/**
 * Check if spending is within budget
 */
export function checkBudget(
  spent: number,
  budgetLimit: number = 50 // Default $50/month
): {
  withinBudget: boolean;
  percentUsed: number;
  remaining: string;
  warning?: string;
} {
  const percentUsed = (spent / budgetLimit) * 100;

  let warning: string | undefined;
  if (percentUsed >= 90) {
    warning = "CRITICAL: Near budget limit!";
  } else if (percentUsed >= 75) {
    warning = "Warning: Approaching budget limit";
  }

  return {
    withinBudget: spent <= budgetLimit,
    percentUsed: Math.round(percentUsed),
    remaining: `$${(budgetLimit - spent).toFixed(2)}`,
    warning,
  };
}

/**
 * Format usage report for logging/display
 */
export function formatUsageReport(shop?: string): string {
  const spend = getSessionSpend(shop);
  const estimate = estimateAnalysisCost();
  const budget = checkBudget(spend.totalCost);

  return `
📊 API Usage Report${shop ? ` for ${shop}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Session Spend: $${spend.totalCost.toFixed(4)}
📞 API Calls: ${spend.callCount}
📥 Input Tokens: ${spend.totalInputTokens.toLocaleString()}
📤 Output Tokens: ${spend.totalOutputTokens.toLocaleString()}

📈 Budget Status:
   Used: ${budget.percentUsed}% of $50 monthly limit
   Remaining: ${budget.remaining}
   ${budget.warning ? `⚠️ ${budget.warning}` : '✅ Within budget'}

📋 Per-Analysis Estimate: ${estimate.estimated}
`.trim();
}

/**
 * Clear usage log (for testing)
 */
export function clearUsageLog(): void {
  usageLog.length = 0;
}
