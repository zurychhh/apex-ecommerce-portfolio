/**
 * Claude API integration
 * Handles prompt construction and API calls to Anthropic
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger.server';
import { logAPIUsage } from './cost-monitor.server';
import type { Screenshot } from '../jobs/captureScreenshots';
import type { ShopifyAnalytics, ShopifyProduct } from './shopify.server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface AnalysisPromptData {
  shop: any;
  primaryGoal: string;
  analytics: ShopifyAnalytics;
  products: ShopifyProduct[];
  theme: any;
  screenshots: Screenshot[];
  competitors: any[];
}

/**
 * Build comprehensive analysis prompt for Claude
 * Enhanced for Sonnet 4.5 with world-class CRO consultant persona
 */
export function buildAnalysisPrompt(data: AnalysisPromptData): { system: string; user: string } {
  const { shop, primaryGoal, analytics, products, theme, competitors } = data;

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

  // Calculate derived metrics
  const monthlyVisitors = analytics.totalSessions || 10000;
  const conversionRate = analytics.conversionRate || 1.5;
  const aov = analytics.avgOrderValue || 75;
  const cartAbandonmentRate = analytics.cartAbandonmentRate || 70;
  const mobilePercentage = analytics.mobileConversionRate ? 65 : 60; // Estimate

  const userPrompt = `# STORE ANALYSIS REQUEST

## Current Performance Metrics
- **Conversion Rate**: ${conversionRate}%
- **Average Order Value**: $${aov}
- **Monthly Traffic**: ${monthlyVisitors} visitors
- **Cart Abandonment Rate**: ${cartAbandonmentRate}%
- **Mobile Traffic**: ${mobilePercentage}%

## Store Context
- **Domain**: ${shop.domain}
- **Primary Goal**: ${primaryGoal}
- **Primary Products**: ${products.slice(0, 5).map(p => p.title).join(", ")}
- **Theme**: ${theme.name}
- **Industry**: General eCommerce

${competitors.length > 0 ? `## Competitors
${competitors.map(c => `- ${c.name}: ${c.heroCTA}, ${c.trustBadges}`).join('\n')}` : ''}

## Analysis Instructions

Analyze the provided screenshots (homepage, product page, cart) and store data.

Generate 10-12 SPECIFIC, ACTIONABLE recommendations prioritized by:
**Priority Score = (Impact × Urgency) / Effort**

For EACH recommendation provide:

1. **title**: Specific action (not "improve mobile UX" but "Reposition CTA 120px higher on mobile")
2. **description**:
   - What exactly is wrong (with measurements, data)
   - Why it hurts conversions (psychology + evidence)
   - What to change (specific instructions)

3. **impactScore**: 1-5 scale
   - 5 = Critical (affects >50% of users, major CR blocker)
   - 4 = High (affects 25-50% users, significant friction)
   - 3 = Medium (affects 10-25% users, moderate impact)
   - 2 = Low (affects <10% users, minor improvement)
   - 1 = Minimal (polish, nice-to-have)

4. **effortScore**: 1-5 scale
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
   - Example: "+54 orders/mo × $${aov} AOV = +$${Math.round(54 * aov)}/mo"
   - Show the math in description

8. **implementation**: 3-6 concrete steps with file names
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

Return ONLY a JSON object with recommendations array. No markdown, no explanation, just:

{"recommendations": [
  {
    "id": "rec-001",
    "title": "...",
    "description": "...",
    "impactScore": 5,
    "effortScore": 2,
    "category": "hero",
    "estimatedUplift": "+0.6% CR (1.8% → 2.4%)",
    "estimatedROI": "+72 orders/mo × $${aov} = +$${Math.round(72 * aov)}/mo",
    "implementation": ["...", "..."],
    "codeSnippet": "...",
    "dependencies": [],
    "confidence": 85,
    "benchmarkComparison": "...",
    "reasoning": "..."
  }
]}

CRITICAL RULES:
- NO generic advice ("improve UX", "optimize design")
- EVERY recommendation must be implementable TODAY
- SHOW YOUR MATH for ROI calculations
- PRIORITIZE quick wins (high impact, low effort) first
- BE BRUTALLY HONEST about what's broken
`;

  return { system: systemPrompt, user: userPrompt };
}

export interface Recommendation {
  title: string;
  category: string;
  description: string;
  impactScore: number;
  effortScore: number;
  priority: number;
  estimatedUplift: string;
  estimatedROI: string;
  reasoning: string;
  implementation: string;
  codeSnippet?: string;
}

/**
 * Call Claude API with prompt and screenshots
 * Supports both legacy single prompt and new system/user prompt format
 */
export async function callClaudeAPI(
  promptOrSystem: string,
  screenshotsOrUser?: Screenshot[] | string,
  screenshots?: Screenshot[]
): Promise<any> {
  try {
    logger.info('Calling Claude API with Vision...');

    // Determine if using new format (system, user) or legacy format (prompt, screenshots)
    let systemPrompt: string | undefined;
    let userPrompt: string;
    let imageScreenshots: Screenshot[];

    if (typeof screenshotsOrUser === 'string') {
      // New format: callClaudeAPI(system, user, screenshots)
      systemPrompt = promptOrSystem;
      userPrompt = screenshotsOrUser;
      imageScreenshots = screenshots || [];
    } else {
      // Legacy format: callClaudeAPI(prompt, screenshots)
      systemPrompt = undefined;
      userPrompt = promptOrSystem;
      imageScreenshots = screenshotsOrUser || [];
    }

    // Convert screenshots to Claude Vision format
    const imageContent = imageScreenshots
      .filter(s => s.base64) // Only include screenshots that were captured successfully
      .map(screenshot => ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/png' as const,
          data: screenshot.base64!,
        },
      }));

    logger.info(`Sending ${imageContent.length} screenshots to Claude`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // ⭐ FLAGSHIP MODEL - Best quality for CRO analysis
      max_tokens: 8192, // ⭐ DOUBLED for more detailed recommendations
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            ...imageContent,
          ],
        },
      ],
      temperature: 1.0, // Full creativity for diverse recommendations
    });

    logger.info('Claude API response received');
    logger.info(`Token usage: ${response.usage.input_tokens} input, ${response.usage.output_tokens} output`);

    // Log API usage for cost monitoring
    await logAPIUsage(
      'claude-sonnet-4-5-20250929',
      response.usage.input_tokens,
      response.usage.output_tokens,
      'analysis' // Could pass shop domain if available
    );

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  } catch (error: any) {
    logger.error('Claude API call failed:', error);
    logger.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      body: JSON.stringify(error.error || error.body || {}),
    });

    // Provide more helpful error messages
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    } else if (error.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check your environment variables.');
    } else if (error.status === 400) {
      const detail = error.error?.error?.message || error.message || 'Unknown error';
      throw new Error(`Claude API 400 error: ${detail}`);
    } else if (error.status === 404) {
      throw new Error(`Model not found: ${error.message}`);
    }

    throw new Error(`Claude API error: ${error.message || error.toString()}`);
  }
}

/**
 * Parse Claude's JSON response into recommendations
 */
export function parseRecommendations(responseText: string): Recommendation[] {
  logger.info('Parsing Claude response, length:', responseText.length);
  logger.info('Response preview:', responseText.substring(0, 300));

  let jsonText = responseText;

  // Strategy 1: Try to extract JSON from markdown code blocks
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
    logger.info('Extracted from code block');
  } else {
    // Strategy 2: Find JSON object or array by looking for { or [
    const jsonStartBrace = responseText.indexOf('{');
    const jsonStartBracket = responseText.indexOf('[');

    if (jsonStartBrace >= 0 || jsonStartBracket >= 0) {
      const startIdx = jsonStartBrace >= 0 && jsonStartBracket >= 0
        ? Math.min(jsonStartBrace, jsonStartBracket)
        : Math.max(jsonStartBrace, jsonStartBracket);

      // Find matching end
      const isObject = responseText[startIdx] === '{';
      let depth = 0;
      let endIdx = startIdx;

      for (let i = startIdx; i < responseText.length; i++) {
        const char = responseText[i];
        if (char === '{' || char === '[') depth++;
        if (char === '}' || char === ']') depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }

      jsonText = responseText.substring(startIdx, endIdx);
      logger.info('Extracted JSON by brace matching, length:', jsonText.length);
    }
  }

  // Helper function to map recommendation object
  const mapRecommendation = (rec: any): Recommendation => ({
    title: rec.title || 'Untitled Recommendation',
    category: rec.category || 'general',
    description: rec.description || '',
    impactScore: parseInt(rec.impactScore) || 3,
    effortScore: parseInt(rec.effortScore) || 3,
    priority: (parseInt(rec.impactScore) || 3) * 2 - (parseInt(rec.effortScore) || 3),
    estimatedUplift: rec.estimatedUplift || 'TBD',
    estimatedROI: rec.estimatedROI || 'TBD',
    reasoning: rec.reasoning || '',
    implementation: Array.isArray(rec.implementation)
      ? rec.implementation.join('\n')
      : (rec.implementation || ''),
    codeSnippet: rec.codeSnippet || null,
  });

  try {
    const parsed = JSON.parse(jsonText);

    // Handle both { recommendations: [...] } and direct array formats
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations;

    if (!Array.isArray(recommendations)) {
      logger.error('Parsed object keys:', Object.keys(parsed));
      throw new Error('Response does not contain a recommendations array');
    }

    logger.info(`Found ${recommendations.length} recommendations`);
    return recommendations.map(mapRecommendation);

  } catch (error: any) {
    logger.warn('Primary JSON parse failed, trying fallback extraction:', error.message);

    // Fallback: Try to extract individual recommendation objects
    // This handles truncated JSON by finding complete objects
    const recommendations: Recommendation[] = [];
    const objectPattern = /\{[^{}]*"title"\s*:\s*"[^"]+[^{}]*\}/g;
    const matches = jsonText.match(objectPattern);

    if (matches && matches.length > 0) {
      logger.info(`Fallback: Found ${matches.length} potential recommendation objects`);

      for (const match of matches) {
        try {
          // Try to parse each match as a complete object
          const rec = JSON.parse(match);
          if (rec.title) {
            recommendations.push(mapRecommendation(rec));
          }
        } catch {
          // Skip malformed objects
        }
      }

      if (recommendations.length > 0) {
        logger.info(`Fallback extraction succeeded: ${recommendations.length} recommendations`);
        return recommendations;
      }
    }

    // If fallback also fails, log and throw
    logger.error('All parsing attempts failed');
    logger.error('Attempted to parse:', jsonText.substring(0, 500));
    logger.error('Full response (first 1500 chars):', responseText.substring(0, 1500));
    throw new Error(`Failed to parse recommendations: ${error.message}`);
  }
}

/**
 * Calculate estimated ROI based on conversion rate improvement
 */
export function calculateEstimatedROI(
  currentRevenue: number,
  currentConversion: number,
  estimatedUplift: number
): number {
  const newConversion = currentConversion + estimatedUplift;
  const upliftPercentage = (newConversion / currentConversion) - 1;
  return currentRevenue * upliftPercentage;
}
