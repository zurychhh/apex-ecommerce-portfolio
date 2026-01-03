/**
 * Claude API integration
 * Handles prompt construction and API calls to Anthropic
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from './logger.server';
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
 */
export function buildAnalysisPrompt(data: AnalysisPromptData): string {
  const { shop, primaryGoal, analytics, products, theme, competitors } = data;

  return `You are an expert CRO (Conversion Rate Optimization) consultant analyzing a Shopify store.

STORE INFORMATION:
- Domain: ${shop.domain}
- Primary Goal: ${primaryGoal}
- Current Conversion Rate: ${analytics.conversionRate}%
- Average Order Value: $${analytics.avgOrderValue}
- Cart Abandonment Rate: ${analytics.cartAbandonmentRate}%
- Mobile Traffic: ${analytics.mobileConversionRate ? `${analytics.mobileConversionRate}%` : 'N/A'}
- Total Sessions: ${analytics.totalSessions}
- Total Orders: ${analytics.totalOrders}

THEME:
- Theme Name: ${theme.name}

TOP PRODUCTS:
${products.map((p, i) => `${i + 1}. ${p.title} (${p.handle})`).join('\n')}

VISUAL ANALYSIS:
I've captured screenshots of:
1. Homepage hero section
2. Top-selling product page
3. Cart page

[Images will be attached via Vision API]

${competitors.length > 0 ? `COMPETITOR COMPARISON:
Top competitors in this niche:
${competitors.map(c => `- ${c.name}: ${c.heroCTA}, ${c.trustBadges}`).join('\n')}` : ''}

TASK:
Generate exactly 5 prioritized, actionable CRO recommendations for goal: "${primaryGoal}".

For EACH recommendation provide these fields (keep responses concise):
- title: Action-oriented, specific (e.g., "Change hero CTA to 'Shop Now'")
- category: One of [hero_section, product_page, cart_page, mobile, trust_building]
- description: 1-2 sentences max
- impactScore: 1-5
- effortScore: 1-5
- estimatedUplift: e.g., "+0.3-0.5%"
- estimatedROI: e.g., "+$2K/mo"
- reasoning: 1 sentence why this matters
- implementation: 2-3 bullet points max

RULES:
- Quick wins first (high impact, low effort)
- Be specific to THIS store
- Keep each field brief

OUTPUT: Return ONLY valid JSON: {"recommendations": [...]}
No markdown, no explanation, just the JSON object.`;
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
 */
export async function callClaudeAPI(
  prompt: string,
  screenshots: Screenshot[]
): Promise<any> {
  try {
    logger.info('Calling Claude API with Vision...');

    // Convert screenshots to Claude Vision format
    const imageContent = screenshots
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
      model: 'claude-3-haiku-20240307', // Claude 3 Haiku - fast and cost-effective
      max_tokens: 4096, // Maximum for Haiku model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            ...imageContent,
          ],
        },
      ],
      temperature: 1.0, // Full creativity for diverse recommendations
    });

    logger.info('Claude API response received');

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
