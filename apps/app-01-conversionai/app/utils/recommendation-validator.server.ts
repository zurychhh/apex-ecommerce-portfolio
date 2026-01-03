/**
 * Recommendation Validator Module
 * Filters out generic/weak recommendations and adds quality scoring
 *
 * Purpose:
 * 1. Reject vague, non-actionable recommendations
 * 2. Ensure recommendations have specific measurements
 * 3. Validate effort scores match implementation complexity
 * 4. Add quality scores for ranking
 * 5. Check for conflicting recommendations
 */

import { logger } from "./logger.server";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impactScore: number;
  effortScore: number;
  category: string;
  implementation: string[] | string;
  codeSnippet?: string;
  [key: string]: any;
}

// Generic phrases that indicate low-quality recommendations
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
  "optimize the",
  "consider adding",
  "might help",
  "could improve",
  "general optimization",
];

// Regex patterns for vague titles
const VAGUE_TITLE_PATTERNS = [
  /^improve\s+\w+$/i, // "improve mobile"
  /^optimize\s+\w+$/i, // "optimize checkout"
  /^enhance\s+\w+$/i, // "enhance design"
  /^better\s+\w+$/i, // "better ux"
  /^fix\s+\w+$/i, // "fix design" (too vague)
  /^add\s+\w+$/i, // "add feature" (too vague)
];

// Specificity markers that indicate quality recommendations
const SPECIFICITY_MARKERS = [
  /\d+px/i, // pixel measurements
  /\d+%/i, // percentages
  /#[0-9a-f]{3,6}/i, // color codes
  /\$\d+/i, // dollar amounts
  /\d+\s*(second|minute|hour|ms)/i, // time measurements
  /(above|below|left|right|top|bottom)\s+the\s+fold/i, // positioning
  /(increase|decrease|change|move|reposition)\s+\w+\s+(by|to)\s+\d+/i, // specific actions
  /from\s+\d+.*to\s+\d+/i, // range changes
  /currently\s+\d+/i, // current measurements
  /rgb\(|rgba\(/i, // RGB colors
  /font-size|margin|padding|width|height/i, // CSS properties
];

/**
 * Main validation function - filters and scores recommendations
 */
export function validateRecommendations(
  recommendations: Recommendation[]
): Recommendation[] {
  logger.info(`Validating ${recommendations.length} recommendations...`);

  const validated = recommendations
    .filter((rec, index) => {
      const isValid = isSpecific(rec) && isActionable(rec);
      if (!isValid) {
        logger.info(`Filtered out recommendation ${index + 1}: ${rec.title?.substring(0, 50)}...`);
      }
      return isValid;
    })
    .map(rec => {
      // Auto-correct effort scores
      const corrected = correctEffortScore(rec);
      // Add quality score
      return addQualityScore(corrected);
    })
    .sort((a, b) => (b as any).qualityScore - (a as any).qualityScore);

  logger.info(`Validation complete: ${validated.length}/${recommendations.length} passed`);

  return validated;
}

/**
 * Check if recommendation is specific (not generic)
 */
function isSpecific(rec: Recommendation): boolean {
  const titleLower = (rec.title || '').toLowerCase();
  const descLower = (rec.description || '').toLowerCase();
  const combined = titleLower + ' ' + descLower;

  // Reject generic phrases
  for (const phrase of GENERIC_PHRASES) {
    if (combined.includes(phrase)) {
      logger.debug(`Rejected generic phrase: "${phrase}" in "${rec.title}"`);
      return false;
    }
  }

  // Reject vague title patterns
  for (const pattern of VAGUE_TITLE_PATTERNS) {
    if (pattern.test(rec.title || '')) {
      logger.debug(`Rejected vague title: "${rec.title}"`);
      return false;
    }
  }

  // Must have some specificity markers
  const hasSpecificity = SPECIFICITY_MARKERS.some(marker =>
    marker.test(rec.title || '') || marker.test(rec.description || '')
  );

  if (!hasSpecificity) {
    // Allow if title is long and detailed (>60 chars suggests specificity)
    if ((rec.title || '').length < 60) {
      logger.debug(`Rejected non-specific: "${rec.title}"`);
      return false;
    }
  }

  return true;
}

/**
 * Check if recommendation is actionable (has clear implementation steps)
 */
function isActionable(rec: Recommendation): boolean {
  // Get implementation steps
  const steps = Array.isArray(rec.implementation)
    ? rec.implementation
    : (rec.implementation || '').split('\n').filter(s => s.trim());

  // Must have implementation steps
  if (steps.length === 0) {
    logger.debug(`Rejected no steps: "${rec.title}"`);
    return false;
  }

  // Steps must be somewhat detailed
  const actionVerbs = ['edit', 'add', 'change', 'modify', 'create', 'update', 'remove', 'replace', 'move', 'set', 'configure'];
  const detailedSteps = steps.filter(step => {
    const stepLower = step.toLowerCase();
    return step.length > 15 && actionVerbs.some(verb => stepLower.includes(verb));
  });

  if (detailedSteps.length < 1) {
    logger.debug(`Rejected vague steps: "${rec.title}" (${detailedSteps.length} detailed steps)`);
    return false;
  }

  return true;
}

/**
 * Auto-correct effort scores based on implementation complexity
 */
function correctEffortScore(rec: Recommendation): Recommendation {
  const steps = Array.isArray(rec.implementation)
    ? rec.implementation
    : (rec.implementation || '').split('\n').filter(s => s.trim());

  const stepCount = steps.length;
  const hasCode = !!(rec.codeSnippet && rec.codeSnippet.length > 50);
  const codeLength = (rec.codeSnippet || '').length;

  let correctedEffort = rec.effortScore;

  // Sanity checks and corrections
  if (rec.effortScore === 1 && stepCount > 5) {
    correctedEffort = Math.min(3, Math.ceil(stepCount / 2));
    logger.debug(`Corrected effort for "${rec.title}": ${rec.effortScore} → ${correctedEffort} (${stepCount} steps)`);
  }

  if (rec.effortScore === 1 && codeLength > 500) {
    correctedEffort = 2;
    logger.debug(`Corrected effort for "${rec.title}": ${rec.effortScore} → ${correctedEffort} (long code snippet)`);
  }

  if (rec.effortScore === 5 && stepCount < 3 && !hasCode) {
    correctedEffort = 3;
    logger.debug(`Corrected effort for "${rec.title}": ${rec.effortScore} → ${correctedEffort} (simple steps)`);
  }

  return {
    ...rec,
    effortScore: correctedEffort,
  };
}

/**
 * Add quality score based on various factors
 */
function addQualityScore(rec: Recommendation): Recommendation {
  let score = 50; // Base score

  const title = rec.title || '';
  const description = rec.description || '';
  const combined = title + ' ' + description;

  // Bonus for specificity markers
  for (const marker of SPECIFICITY_MARKERS) {
    if (marker.test(title)) score += 5;
    if (marker.test(description)) score += 3;
  }

  // Bonus for detailed steps
  const steps = Array.isArray(rec.implementation)
    ? rec.implementation
    : (rec.implementation || '').split('\n').filter(s => s.trim());

  const avgStepLength = steps.length > 0
    ? steps.reduce((sum, step) => sum + step.length, 0) / steps.length
    : 0;

  if (avgStepLength > 50) score += 10;
  if (avgStepLength > 100) score += 10;

  // Bonus for code snippet
  const codeLength = (rec.codeSnippet || '').length;
  if (codeLength > 100) score += 10;
  if (codeLength > 300) score += 5;
  if (codeLength > 500) score += 5;

  // Bonus for high impact, low effort
  const impactEffortRatio = rec.impactScore / rec.effortScore;
  if (impactEffortRatio >= 2) score += 15;
  if (impactEffortRatio >= 3) score += 10;
  if (impactEffortRatio >= 4) score += 5;

  // Bonus for critical categories
  const criticalCategories = ['checkout', 'cart', 'hero'];
  if (criticalCategories.includes(rec.category?.toLowerCase())) {
    score += 10;
  }

  // Cap at 100
  const finalScore = Math.min(100, score);

  return {
    ...rec,
    qualityScore: finalScore,
  };
}

/**
 * Check for conflicting recommendations and add warnings
 */
export function conflictCheck(recommendations: Recommendation[]): Recommendation[] {
  // Define potential conflicts
  const conflictGroups: Record<string, string[]> = {
    "hero-cta": ["hero-image", "hero-redesign", "hero-text"],
    "mobile-menu": ["navigation", "header"],
    "product-images": ["product-gallery", "product-layout"],
    "checkout-fields": ["checkout-redesign", "checkout-flow"],
  };

  // Extract category/type from recommendation ID
  const getRecType = (id: string): string => {
    const parts = (id || '').toLowerCase().split('-');
    return parts.slice(1).join('-');
  };

  return recommendations.map(rec => {
    const recType = getRecType(rec.id);

    // Find if any other rec might conflict
    const potentialConflicts = conflictGroups[recType] || [];
    const hasConflict = recommendations.some(other => {
      if (other.id === rec.id) return false;
      const otherType = getRecType(other.id);
      return potentialConflicts.includes(otherType);
    });

    if (hasConflict) {
      return {
        ...rec,
        warning: "May conflict with other recommendations - review together before implementing",
      };
    }

    return rec;
  });
}

/**
 * Get validation statistics
 */
export function getValidationStats(
  original: Recommendation[],
  validated: Recommendation[]
): {
  originalCount: number;
  validatedCount: number;
  filteredCount: number;
  filterRate: string;
  avgQualityScore: number;
} {
  const avgQuality = validated.length > 0
    ? validated.reduce((sum, rec) => sum + ((rec as any).qualityScore || 0), 0) / validated.length
    : 0;

  return {
    originalCount: original.length,
    validatedCount: validated.length,
    filteredCount: original.length - validated.length,
    filterRate: `${Math.round((1 - validated.length / original.length) * 100)}%`,
    avgQualityScore: Math.round(avgQuality),
  };
}
