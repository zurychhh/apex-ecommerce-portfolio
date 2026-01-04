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

/**
 * Generate testing checklist based on category
 */
export function getTestingChecklist(category: string): string[] {
  const commonTests = [
    'Test on mobile viewport (375px width)',
    'Test on tablet (768px width)',
    'Verify no console errors',
    'A/B test for minimum 7 days',
  ];

  const categoryTests: Record<string, string[]> = {
    hero_section: [
      'Check fold line visibility (~600px)',
      'Verify CTA tap target size (min 44×44px)',
      'Test on actual devices (not just DevTools)',
    ],
    checkout: [
      'Test complete checkout flow',
      'Verify all payment methods work',
      'Check error message display',
    ],
    cart_page: [
      'Test add/remove items',
      'Verify cart total updates',
      'Test cart abandonment email triggers',
    ],
    mobile: [
      'Test on iPhone (375×667)',
      'Test on Android (360×640)',
      'Verify touch targets >44px',
      'Test landscape orientation',
    ],
    product_page: [
      'Test with various product types',
      'Verify variant selection',
      'Check image gallery functionality',
    ],
    trust_building: [
      'Verify badges display correctly',
      'Test trust seal visibility',
      'Check security icon rendering',
    ],
    social_proof: [
      'Verify review count accuracy',
      'Test star rating display',
      'Check testimonial loading',
    ],
    urgency: [
      'Verify countdown timer accuracy',
      'Test stock indicator updates',
      'Check limited offer visibility',
    ],
    pricing: [
      'Verify price display accuracy',
      'Test discount calculation',
      'Check currency formatting',
    ],
    navigation: [
      'Test menu on all breakpoints',
      'Verify search functionality',
      'Check breadcrumb accuracy',
    ],
  };

  const key = category.toLowerCase().replace(/\s+/g, '_');
  return [...commonTests, ...(categoryTests[key] || [])];
}

/**
 * Get common pitfalls for category
 */
export function getCommonPitfalls(category: string): string[] {
  const pitfalls: Record<string, string[]> = {
    hero_section: [
      "Don't move CTA above headline",
      'Ensure min contrast ratio 4.5:1',
      'Test seasonal image variations',
      "Don't hide CTA on scroll",
    ],
    checkout: [
      "Don't remove required security badges",
      'Keep guest checkout option',
      "Don't hide shipping costs until final step",
      'Maintain PCI compliance',
    ],
    cart_page: [
      "Don't hide total price",
      'Keep visible shipping calculator',
      "Don't auto-apply untested coupons",
      'Maintain inventory count accuracy',
    ],
    mobile: [
      "Don't reduce font below 16px",
      'Keep tap targets >44px',
      "Don't hide hamburger menu",
      'Test with one-handed use',
    ],
    product_page: [
      "Don't hide stock count",
      'Keep variant prices visible',
      "Don't auto-select variants",
      'Maintain image quality',
    ],
    trust_building: [
      "Don't remove existing trust badges",
      'Keep security icons visible',
      "Don't overcrowd with too many badges",
      'Ensure badges are from recognized sources',
    ],
    social_proof: [
      "Don't fake reviews or testimonials",
      'Keep review dates visible',
      "Don't hide negative reviews completely",
      'Maintain review authenticity',
    ],
    urgency: [
      "Don't use false scarcity",
      'Keep countdown timers accurate',
      "Don't overuse urgency tactics",
      'Ensure stock counts are real',
    ],
    pricing: [
      "Don't hide original price",
      'Keep discount percentages accurate',
      "Don't confuse with multiple currencies",
      'Maintain price consistency across pages',
    ],
    navigation: [
      "Don't hide main navigation on desktop",
      'Keep search accessible',
      "Don't use too many menu levels",
      'Maintain consistent nav structure',
    ],
  };

  const key = category.toLowerCase().replace(/\s+/g, '_');
  return (
    pitfalls[key] || [
      'Test thoroughly before deploying',
      'Monitor analytics for 48h post-launch',
      'Have rollback plan ready',
    ]
  );
}

/**
 * Resource type for helpful links
 */
export interface HelpfulResource {
  type: 'doc' | 'video' | 'research';
  title: string;
  url: string;
}

/**
 * Get helpful resources for category
 */
export function getHelpfulResources(category: string): HelpfulResource[] {
  const resources: Record<string, HelpfulResource[]> = {
    hero_section: [
      {
        type: 'doc',
        title: 'Shopify: Theme sections',
        url: 'https://shopify.dev/docs/themes/architecture/sections',
      },
      {
        type: 'doc',
        title: 'Liquid reference: Sections',
        url: 'https://shopify.dev/docs/api/liquid/tags/section',
      },
      {
        type: 'research',
        title: 'Baymard: Above-the-fold study',
        url: 'https://baymard.com/blog/above-the-fold',
      },
    ],
    checkout: [
      {
        type: 'doc',
        title: 'Shopify: Checkout customization',
        url: 'https://shopify.dev/docs/api/checkout-ui-extensions',
      },
      {
        type: 'research',
        title: 'Baymard: Checkout usability',
        url: 'https://baymard.com/checkout-usability',
      },
    ],
    cart_page: [
      {
        type: 'doc',
        title: 'Shopify: Cart API',
        url: 'https://shopify.dev/docs/api/ajax/reference/cart',
      },
      {
        type: 'doc',
        title: 'Cart templates',
        url: 'https://shopify.dev/docs/themes/architecture/templates/cart',
      },
    ],
    mobile: [
      {
        type: 'research',
        title: 'Google: Mobile-first indexing',
        url: 'https://developers.google.com/search/mobile-sites',
      },
      {
        type: 'doc',
        title: 'Responsive design basics',
        url: 'https://web.dev/responsive-web-design-basics/',
      },
    ],
    product_page: [
      {
        type: 'doc',
        title: 'Product templates',
        url: 'https://shopify.dev/docs/themes/architecture/templates/product',
      },
      {
        type: 'doc',
        title: 'Product media',
        url: 'https://shopify.dev/docs/api/liquid/objects/product/media',
      },
    ],
    trust_building: [
      {
        type: 'research',
        title: 'Trust signals in eCommerce',
        url: 'https://baymard.com/blog/trust-seals-and-badges',
      },
      {
        type: 'doc',
        title: 'Shopify: Security badges',
        url: 'https://help.shopify.com/en/manual/online-store/themes',
      },
    ],
    social_proof: [
      {
        type: 'research',
        title: 'Social proof psychology',
        url: 'https://www.nngroup.com/articles/social-proof-ux/',
      },
      {
        type: 'doc',
        title: 'Shopify: Product reviews',
        url: 'https://help.shopify.com/en/manual/products/product-reviews',
      },
    ],
  };

  const common: HelpfulResource[] = [
    {
      type: 'doc',
      title: 'Shopify Theme Docs',
      url: 'https://shopify.dev/docs/themes',
    },
  ];

  const key = category.toLowerCase().replace(/\s+/g, '_');
  return [...(resources[key] || []), ...common];
}
