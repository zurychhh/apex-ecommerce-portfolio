/**
 * Helper functions for recommendation display
 */

import type { CodeLanguage, EffortLevel, CategoryInfo } from '../types/recommendation.types';

/**
 * Detect programming language from code snippet
 */
export function detectLanguage(code: string): CodeLanguage {
  if (!code) return 'javascript';

  const lowerCode = code.toLowerCase();

  // Liquid detection (Shopify templates)
  if (lowerCode.includes('{% ') || lowerCode.includes('{{ ') || lowerCode.includes('{%- ')) {
    return 'liquid';
  }

  // HTML detection
  if (lowerCode.includes('<!doctype') || (lowerCode.includes('<div') && lowerCode.includes('</div>'))) {
    return 'html';
  }

  // CSS detection
  if (lowerCode.includes('{') && (lowerCode.includes('px') || lowerCode.includes('color:') || lowerCode.includes('font-'))) {
    if (!lowerCode.includes('function') && !lowerCode.includes('const ') && !lowerCode.includes('let ')) {
      return 'css';
    }
  }

  // JSON detection
  if ((code.trim().startsWith('{') && code.trim().endsWith('}')) ||
      (code.trim().startsWith('[') && code.trim().endsWith(']'))) {
    try {
      JSON.parse(code);
      return 'json';
    } catch {
      // Not valid JSON, continue detection
    }
  }

  // TypeScript/TSX detection
  if (lowerCode.includes(': string') || lowerCode.includes(': number') ||
      lowerCode.includes('interface ') || lowerCode.includes(': boolean') ||
      lowerCode.includes('<t>') || lowerCode.includes('type ')) {
    if (lowerCode.includes('react') || lowerCode.includes('jsx') || lowerCode.includes('</>')) {
      return 'tsx';
    }
    return 'typescript';
  }

  // JSX detection
  if (lowerCode.includes('react') || lowerCode.includes('jsx') ||
      lowerCode.includes('return (') || lowerCode.includes('classname=')) {
    return 'jsx';
  }

  // Default to JavaScript
  return 'javascript';
}

/**
 * Get human-readable language name
 */
export function getLanguageName(lang: CodeLanguage): string {
  const names: Record<CodeLanguage, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    html: 'HTML',
    css: 'CSS',
    liquid: 'Liquid',
    json: 'JSON',
    jsx: 'React JSX',
    tsx: 'React TSX',
  };
  return names[lang] || lang;
}

/**
 * Get effort level info from effort score
 */
export function getEffortLevel(score: number): EffortLevel {
  if (score <= 2) {
    return { text: 'Easy', time: '~10-15 minutes', color: 'success' };
  }
  if (score <= 3) {
    return { text: 'Medium', time: '~20-30 minutes', color: 'warning' };
  }
  return { text: 'Complex', time: '~45-60 minutes', color: 'critical' };
}

/**
 * Get impact stars display
 */
export function getImpactStars(score: number): string {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(i < score ? '\u2605' : '\u2606');
  }
  return stars.join('');
}

/**
 * Get category display info
 */
export function getCategoryInfo(category: string): CategoryInfo {
  const categories: Record<string, CategoryInfo> = {
    hero_section: { label: 'Hero Section', color: 'info' },
    product_page: { label: 'Product Page', color: 'success' },
    cart_page: { label: 'Cart Page', color: 'warning' },
    checkout: { label: 'Checkout', color: 'critical' },
    mobile: { label: 'Mobile', color: 'info' },
    trust_building: { label: 'Trust Building', color: 'success' },
    social_proof: { label: 'Social Proof', color: 'success' },
    urgency: { label: 'Urgency', color: 'warning' },
    pricing: { label: 'Pricing', color: 'info' },
    navigation: { label: 'Navigation', color: 'info' },
    general: { label: 'General', color: 'info' },
    cta: { label: 'Call to Action', color: 'warning' },
    copy: { label: 'Copy & Messaging', color: 'info' },
  };

  const key = category.toLowerCase().replace(/\s+/g, '_');
  return categories[key] || { label: category.replace(/_/g, ' '), color: 'info' };
}

/**
 * Format implementation steps from string to array
 */
export function parseImplementationSteps(implementation: string): string[] {
  if (!implementation) return [];

  // Split by newlines and filter empty lines
  const lines = implementation.split('\n').filter(line => line.trim());

  // Check if it's already numbered
  const isNumbered = lines.some(line => /^\d+[\.\)]/.test(line.trim()));

  if (isNumbered) {
    return lines.map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());
  }

  return lines;
}

/**
 * Extract confidence percentage from reasoning (if present)
 */
export function extractConfidence(reasoning: string): number | null {
  const match = reasoning.match(/Confidence:\s*(\d+)%/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract benchmark comparison from reasoning (if present)
 */
export function extractBenchmark(reasoning: string): string | null {
  const match = reasoning.match(/Benchmark:\s*([^\n]+)/i);
  return match ? match[1].trim() : null;
}

/**
 * Clean reasoning text (remove confidence/benchmark if extracted)
 */
export function cleanReasoning(reasoning: string): string {
  return reasoning
    .replace(/\n\nConfidence:\s*\d+%/i, '')
    .replace(/\nBenchmark:\s*[^\n]+/i, '')
    .trim();
}
