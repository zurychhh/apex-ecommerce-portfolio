# 🎨 UI MODAL ENHANCEMENT - Recommendation Detail View

## CONTEXT

ConversionAI backend już generuje szczegółowe rekomendacje z:
- Konkretne wymiary (px, $, %)
- CSS code snippets
- Implementation steps (3-5 kroków)
- ROI calculations
- Psychology principles
- Data evidence

**PROBLEM:** Current modal pokazuje tylko 2 sekcje:
- "Why This Matters" (basic)
- "Implementation Guide" (2 bullet points bez kodu)

**TO NIE WYSTARCZY.**

Backend ma DUŻO więcej danych które nie są wyświetlane.

---

## YOUR MISSION

Rozbuduj `RecommendationDetailModal` component aby pokazać WSZYSTKIE dane które backend generuje.

Transform modal z "basic" → "premium SaaS quality".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 1: RECONNAISSANCE (15 min)

### Step 1.1: Check Database Schema

Navigate to:
```bash
cd /Users/user/projects/apex-ecommerce-portfolio/apps/app-01-conversionai
```

Examine Prisma schema:
```bash
cat prisma/schema.prisma | grep -A 50 "model Recommendation"
```

Document ALL fields available:
- title ✓
- description ✓
- implementationSteps ✓
- codeSnippet ✓
- estimatedRoi ✓
- impact ✓
- effort ✓
- category ✓
- [LIST ANY OTHER FIELDS YOU FIND]

### Step 1.2: Check Current Implementation

Locate current modal component:
```bash
find app -name "*RecommendationModal*" -o -name "*RecommendationDetail*"
```

Read current implementation:
```bash
# Replace [ACTUAL_FILE] with file you found
cat app/components/[ACTUAL_FILE].tsx
```

### Step 1.3: Check Sample Data

Query database to see real recommendation data:
```bash
# Start Prisma Studio
npx prisma studio
```

OR use Node script to query:
```typescript
// Create temp script: check-recommendation-data.ts
import { prisma } from '~/utils/db.server';

const rec = await prisma.recommendation.findFirst({
  orderBy: { createdAt: 'desc' }
});

console.log(JSON.stringify(rec, null, 2));
```

Run it:
```bash
npx tsx check-recommendation-data.ts
```

**Report findings:**
```
✅ Database fields available: [list]
✅ Current modal file: [path]
✅ Sample data structure: [summary]
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 2: INSTALL DEPENDENCIES (5 min)

Install syntax highlighting for code snippets:

```bash
npm install react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

Verify installation:
```bash
npm list react-syntax-highlighter
```

Expected: ✅ react-syntax-highlighter@X.Y.Z

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 3: CREATE ENHANCED MODAL (90 min)

### Step 3.1: Update Type Definitions (10 min)

Create/update: `app/types/recommendation.ts`

```typescript
export interface EnhancedRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: number; // 1-5
  effort: number; // 1-5
  
  // Implementation details
  implementationSteps: string[];
  codeSnippet?: string;
  specificChange?: string;
  
  // ROI data
  estimatedRoi: string; // e.g., "+$2,250/mo"
  estimatedImpact: string; // e.g., "+0.3% CR"
  expectedOutcome?: string;
  confidence?: number; // 0-100
  
  // Psychology/Evidence
  psychologyPrinciple?: string;
  dataEvidence?: string;
  affectedUsers?: string;
  
  // Metadata
  status: 'pending' | 'implemented' | 'skipped';
  createdAt: Date;
}
```

### Step 3.2: Create Utility Functions (15 min)

Create: `app/utils/recommendation-helpers.ts`

```typescript
/**
 * Parse ROI string like "+$2,250/mo" into structured data
 */
export function parseROI(roiString: string): {
  amount: number;
  period: 'mo' | 'yr';
  sign: '+' | '-';
} {
  const match = roiString.match(/([+\-])?[$]?([\d,]+)\/(mo|yr)/);
  if (!match) return { amount: 0, period: 'mo', sign: '+' };
  
  return {
    sign: (match[1] as '+' | '-') || '+',
    amount: parseInt(match[2].replace(/,/g, '')),
    period: match[3] as 'mo' | 'yr'
  };
}

/**
 * Parse impact string like "+0.3% CR" into number
 */
export function parseImpact(impactString: string): number {
  const match = impactString.match(/([+\-])?(\d+\.?\d*)%/);
  return match ? parseFloat(match[2]) : 0;
}

/**
 * Detect code language from snippet
 */
export function detectCodeLanguage(code: string): string {
  if (code.includes('{% ') || code.includes('{{ ')) return 'liquid';
  if (code.includes('{') && code.includes('function')) return 'javascript';
  if (code.includes('.') && code.includes(':')) return 'css';
  if (code.includes('<div') || code.includes('<span')) return 'html';
  return 'plaintext';
}

/**
 * Generate testing checklist based on category
 */
export function getTestingChecklist(category: string): string[] {
  const commonTests = [
    'Test on mobile viewport (375px width)',
    'Test on tablet (768px width)',
    'Verify no console errors',
    'A/B test for minimum 7 days'
  ];
  
  const categoryTests: Record<string, string[]> = {
    hero: [
      'Check fold line visibility (~600px)',
      'Verify CTA tap target size (min 44×44px)',
      'Test on actual devices (not just DevTools)'
    ],
    checkout: [
      'Test complete checkout flow',
      'Verify all payment methods work',
      'Check error message display'
    ],
    cart: [
      'Test add/remove items',
      'Verify cart total updates',
      'Test cart abandonment email triggers'
    ],
    mobile: [
      'Test on iPhone (375×667)',
      'Test on Android (360×640)',
      'Verify touch targets >44px',
      'Test landscape orientation'
    ],
    product: [
      'Test with various product types',
      'Verify variant selection',
      'Check image gallery functionality'
    ]
  };
  
  return [
    ...commonTests,
    ...(categoryTests[category] || [])
  ];
}

/**
 * Get common pitfalls for category
 */
export function getCommonPitfalls(category: string): string[] {
  const pitfalls: Record<string, string[]> = {
    hero: [
      "Don't move CTA above headline",
      "Ensure min contrast ratio 4.5:1",
      "Test seasonal image variations",
      "Don't hide CTA on scroll"
    ],
    checkout: [
      "Don't remove required security badges",
      "Keep guest checkout option",
      "Don't hide shipping costs until final step",
      "Maintain PCI compliance"
    ],
    cart: [
      "Don't hide total price",
      "Keep visible shipping calculator",
      "Don't auto-apply untested coupons",
      "Maintain inventory count accuracy"
    ],
    mobile: [
      "Don't reduce font below 16px",
      "Keep tap targets >44px",
      "Don't hide hamburger menu",
      "Test with one-handed use"
    ],
    product: [
      "Don't hide stock count",
      "Keep variant prices visible",
      "Don't auto-select variants",
      "Maintain image quality"
    ]
  };
  
  return pitfalls[category] || [
    "Test thoroughly before deploying",
    "Monitor analytics for 48h post-launch",
    "Have rollback plan ready"
  ];
}

/**
 * Get helpful resources for category
 */
export function getHelpfulResources(category: string): Array<{
  type: 'doc' | 'video' | 'research';
  title: string;
  url: string;
}> {
  const resources: Record<string, Array<{type: 'doc' | 'video' | 'research'; title: string; url: string}>> = {
    hero: [
      { type: 'doc', title: 'Shopify: Theme sections', url: 'https://shopify.dev/docs/themes/architecture/sections' },
      { type: 'doc', title: 'Liquid reference: Sections', url: 'https://shopify.dev/docs/api/liquid/tags/section' },
      { type: 'research', title: 'Baymard: Above-the-fold study', url: 'https://baymard.com/blog/above-the-fold' }
    ],
    checkout: [
      { type: 'doc', title: 'Shopify: Checkout customization', url: 'https://shopify.dev/docs/api/checkout-ui-extensions' },
      { type: 'research', title: 'Baymard: Checkout usability', url: 'https://baymard.com/checkout-usability' }
    ],
    cart: [
      { type: 'doc', title: 'Shopify: Cart API', url: 'https://shopify.dev/docs/api/ajax/reference/cart' },
      { type: 'doc', title: 'Cart templates', url: 'https://shopify.dev/docs/themes/architecture/templates/cart' }
    ],
    mobile: [
      { type: 'research', title: 'Google: Mobile-first indexing', url: 'https://developers.google.com/search/mobile-sites' },
      { type: 'doc', title: 'Responsive design basics', url: 'https://web.dev/responsive-web-design-basics/' }
    ],
    product: [
      { type: 'doc', title: 'Product templates', url: 'https://shopify.dev/docs/themes/architecture/templates/product' },
      { type: 'doc', title: 'Product media', url: 'https://shopify.dev/docs/api/liquid/objects/product/media' }
    ]
  };
  
  const common = [
    { type: 'doc' as const, title: 'Shopify Theme Docs', url: 'https://shopify.dev/docs/themes' }
  ];
  
  return [...(resources[category] || []), ...common];
}
```

### Step 3.3: Create Code Snippet Component (20 min)

Create: `app/components/CodeSnippet.tsx`

```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { Button, Icon } from '@shopify/polaris';
import { ClipboardIcon } from '@shopify/polaris-icons';

interface CodeSnippetProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeSnippet({
  code,
  language = 'javascript',
  filename,
  showLineNumbers = true
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ 
      marginBottom: '16px',
      border: '1px solid var(--p-color-border)',
      borderRadius: 'var(--p-border-radius-200)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid var(--p-color-border)',
        backgroundColor: 'var(--p-color-bg-surface-secondary)'
      }}>
        <span style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'var(--p-color-text-secondary)'
        }}>
          {filename || `${language}.${language === 'css' ? 'css' : language === 'liquid' ? 'liquid' : 'js'}`}
        </span>
        
        <Button
          size="slim"
          onClick={handleCopy}
          icon={ClipboardIcon}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '13px'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
```

### Step 3.4: Create Enhanced Modal Component (45 min)

Create: `app/components/EnhancedRecommendationModal.tsx`

```typescript
import { Modal, Text, Badge, Divider, Card, Button, Icon, Collapsible } from '@shopify/polaris';
import { ChevronDownIcon, ChevronUpIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { CodeSnippet } from './CodeSnippet';
import { EnhancedRecommendation } from '~/types/recommendation';
import {
  parseROI,
  parseImpact,
  detectCodeLanguage,
  getTestingChecklist,
  getCommonPitfalls,
  getHelpfulResources
} from '~/utils/recommendation-helpers';

interface EnhancedRecommendationModalProps {
  open: boolean;
  onClose: () => void;
  recommendation: EnhancedRecommendation;
  onMarkImplemented: () => void;
  onSkip: () => void;
}

export function EnhancedRecommendationModal({
  open,
  onClose,
  recommendation,
  onMarkImplemented,
  onSkip
}: EnhancedRecommendationModalProps) {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([0]); // First step expanded by default

  const toggleStep = (index: number) => {
    setExpandedSteps(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const roi = parseROI(recommendation.estimatedRoi);
  const impact = parseImpact(recommendation.estimatedImpact);
  const testingChecklist = getTestingChecklist(recommendation.category);
  const commonPitfalls = getCommonPitfalls(recommendation.category);
  const resources = getHelpfulResources(recommendation.category);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recommendation.title}
      primaryAction={{
        content: 'Mark Implemented',
        onAction: onMarkImplemented
      }}
      secondaryActions={[
        {
          content: 'Skip',
          onAction: onSkip
        }
      ]}
      large
    >
      <Modal.Section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 1: Impact & Effort */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h3" variant="headingMd">
                📊 Impact & Effort
              </Text>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '16px',
                marginTop: '12px'
              }}>
                <div>
                  <Text as="p" variant="bodySm" tone="subdued">Impact Score</Text>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ fontSize: '20px' }}>
                        {i < recommendation.impact ? '⭐' : '☆'}
                      </span>
                    ))}
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      ({recommendation.impact}/5)
                    </Text>
                  </div>
                </div>

                <div>
                  <Text as="p" variant="bodySm" tone="subdued">Effort Level</Text>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ fontSize: '20px' }}>
                        {i < recommendation.effort ? '⚡' : '○'}
                      </span>
                    ))}
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      ({recommendation.effort}/5)
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Badge>{recommendation.category}</Badge>
              </div>
            </div>
          </Card>

          {/* SECTION 2: ROI Breakdown */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h3" variant="headingMd">
                💰 ROI Breakdown
              </Text>

              <div style={{ marginTop: '12px' }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--p-color-bg-surface-secondary)',
                  borderRadius: 'var(--p-border-radius-200)'
                }}>
                  <div>
                    <Text as="p" variant="bodySm" tone="subdued">Estimated Impact</Text>
                    <Text as="p" variant="bodyLg" fontWeight="semibold">
                      {recommendation.estimatedImpact}
                    </Text>
                  </div>

                  <div>
                    <Text as="p" variant="bodySm" tone="subdued">Estimated ROI</Text>
                    <Text as="p" variant="bodyLg" fontWeight="semibold" tone="success">
                      {recommendation.estimatedRoi}
                    </Text>
                  </div>

                  {recommendation.confidence && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Text as="p" variant="bodySm" tone="subdued">Confidence</Text>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginTop: '4px'
                      }}>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: 'var(--p-color-bg-surface-tertiary)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${recommendation.confidence}%`,
                            height: '100%',
                            backgroundColor: 'var(--p-color-bg-fill-success)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          {recommendation.confidence}%
                        </Text>
                      </div>
                    </div>
                  )}
                </div>

                {recommendation.expectedOutcome && (
                  <div style={{ marginTop: '12px' }}>
                    <Text as="p" variant="bodySm" tone="subdued">Expected Outcome</Text>
                    <Text as="p" variant="bodyMd">
                      {recommendation.expectedOutcome}
                    </Text>
                  </div>
                )}

                {recommendation.affectedUsers && (
                  <div style={{ marginTop: '8px' }}>
                    <Text as="p" variant="bodySm" tone="subdued">Affected Users</Text>
                    <Text as="p" variant="bodyMd">
                      {recommendation.affectedUsers}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* SECTION 3: Why This Matters */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h3" variant="headingMd">
                🧠 Why This Matters
              </Text>

              <div style={{ marginTop: '12px' }}>
                <Text as="p" variant="bodyMd">
                  {recommendation.description}
                </Text>

                {recommendation.psychologyPrinciple && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--p-color-bg-surface-info)',
                    borderLeft: '4px solid var(--p-color-border-info)',
                    borderRadius: 'var(--p-border-radius-200)'
                  }}>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Psychology Principle:
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {recommendation.psychologyPrinciple}
                    </Text>
                  </div>
                )}

                {recommendation.dataEvidence && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--p-color-bg-surface-secondary)',
                    borderRadius: 'var(--p-border-radius-200)'
                  }}>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      Supporting Evidence:
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {recommendation.dataEvidence}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* SECTION 4: Specific Change Required */}
          {recommendation.specificChange && (
            <Card>
              <div style={{ padding: '16px' }}>
                <Text as="h3" variant="headingMd">
                  🎨 Specific Change Required
                </Text>

                <div style={{ 
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--p-color-bg-surface-caution)',
                  borderLeft: '4px solid var(--p-color-border-caution)',
                  borderRadius: 'var(--p-border-radius-200)'
                }}>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    {recommendation.specificChange}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 5: Step-by-Step Implementation */}
          {recommendation.implementationSteps && recommendation.implementationSteps.length > 0 && (
            <Card>
              <div style={{ padding: '16px' }}>
                <Text as="h3" variant="headingMd">
                  🛠️ Implementation Guide ({recommendation.implementationSteps.length} steps)
                </Text>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recommendation.implementationSteps.map((step, index) => {
                    const isExpanded = expandedSteps.includes(index);
                    
                    // Parse step to extract code if present
                    const hasCode = step.includes('<') || step.includes('{') || step.includes('/*');
                    const parts = step.split('\n');
                    const title = parts[0];
                    const content = parts.slice(1).join('\n').trim();

                    return (
                      <div
                        key={index}
                        style={{
                          border: '1px solid var(--p-color-border)',
                          borderRadius: 'var(--p-border-radius-200)',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Step Header */}
                        <button
                          onClick={() => toggleStep(index)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            backgroundColor: isExpanded 
                              ? 'var(--p-color-bg-surface-selected)'
                              : 'var(--p-color-bg-surface)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            textAlign: 'left'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--p-color-bg-fill-brand)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {index + 1}
                            </div>
                            <Text as="span" variant="bodyMd" fontWeight="semibold">
                              {title}
                            </Text>
                          </div>

                          <Icon
                            source={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                          />
                        </button>

                        {/* Step Content */}
                        <Collapsible
                          open={isExpanded}
                          id={`step-${index}`}
                          transition={{ duration: '200ms', timingFunction: 'ease-in-out' }}
                        >
                          <div style={{ padding: '16px', borderTop: '1px solid var(--p-color-border)' }}>
                            {hasCode ? (
                              <>
                                {/* Text before code */}
                                {content.split(/```|<div|<style|\{/).slice(0, 1).map((text, i) => (
                                  text.trim() && (
                                    <Text key={i} as="p" variant="bodyMd" tone="subdued">
                                      {text.trim()}
                                    </Text>
                                  )
                                ))}

                                {/* Code snippet */}
                                <div style={{ marginTop: '12px' }}>
                                  <CodeSnippet
                                    code={content}
                                    language={detectCodeLanguage(content)}
                                  />
                                </div>
                              </>
                            ) : (
                              <Text as="p" variant="bodyMd">
                                {content}
                              </Text>
                            )}
                          </div>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 6: Full Code Snippet */}
          {recommendation.codeSnippet && (
            <Card>
              <div style={{ padding: '16px' }}>
                <Text as="h3" variant="headingMd">
                  💻 Complete Code
                </Text>

                <div style={{ marginTop: '12px' }}>
                  <CodeSnippet
                    code={recommendation.codeSnippet}
                    language={detectCodeLanguage(recommendation.codeSnippet)}
                    showLineNumbers={true}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SECTION 7: Testing Checklist */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h3" variant="headingMd">
                ✅ Testing Checklist
              </Text>

              <div style={{ marginTop: '12px' }}>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Before going live, verify:
                </Text>

                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testingChecklist.map((item, index) => (
                    <label
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{
                          marginTop: '2px',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <Text as="span" variant="bodyMd">
                        {item}
                      </Text>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 8: Common Pitfalls */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h3" variant="headingMd">
                ⚠️ Common Pitfalls
              </Text>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {commonPitfalls.map((pitfall, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '8px',
                      backgroundColor: 'var(--p-color-bg-surface-caution-subdued)',
                      borderRadius: 'var(--p-border-radius-200)'
                    }}
                  >
                    <span style={{ fontSize: '16px', marginTop: '2px' }}>⚠️</span>
                    <Text as="p" variant="bodyMd">
                      {pitfall}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* SECTION 9: Helpful Resources */}
          <Card>
            <div style={{ padding: '16px' }}>
              <Text as="h3" variant="headingMd">
                📚 Helpful Resources
              </Text>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      textDecoration: 'none',
                      color: 'var(--p-color-text)',
                      backgroundColor: 'var(--p-color-bg-surface)',
                      border: '1px solid var(--p-color-border)',
                      borderRadius: 'var(--p-border-radius-200)',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--p-color-bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--p-color-bg-surface)';
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>
                      {resource.type === 'doc' && '📖'}
                      {resource.type === 'video' && '🎥'}
                      {resource.type === 'research' && '📊'}
                    </span>
                    <Text as="span" variant="bodyMd">
                      {resource.title}
                    </Text>
                  </a>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </Modal.Section>
    </Modal>
  );
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 4: UPDATE ROUTE TO USE NEW MODAL (15 min)

### Step 4.1: Find Current Usage

Search for current modal usage:
```bash
grep -r "RecommendationModal" app/routes/
```

### Step 4.2: Replace Import

In the route file (likely `app/routes/app.recommendations.$id.tsx` or similar):

```typescript
// OLD:
// import { RecommendationModal } from '~/components/RecommendationModal';

// NEW:
import { EnhancedRecommendationModal } from '~/components/EnhancedRecommendationModal';
```

### Step 4.3: Update Component Usage

Replace old modal with new:

```typescript
// OLD:
// <RecommendationModal
//   open={modalOpen}
//   onClose={() => setModalOpen(false)}
//   recommendation={selectedRecommendation}
// />

// NEW:
<EnhancedRecommendationModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  recommendation={selectedRecommendation}
  onMarkImplemented={handleMarkImplemented}
  onSkip={handleSkip}
/>
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 5: BUILD & TEST (20 min)

### Step 5.1: Build

```bash
npm run build
```

Expected: ✅ Build successful with 0 errors

### Step 5.2: Start Dev Server

```bash
npm run dev
```

### Step 5.3: Manual Test

1. Navigate to http://localhost:3000
2. Login to ConversionAI
3. Go to Recommendations page
4. Click "View Details" on any recommendation
5. Verify ALL new sections display:
   - ✅ Impact & Effort (stars visible)
   - ✅ ROI Breakdown (metrics visible)
   - ✅ Why This Matters (psychology/evidence visible)
   - ✅ Specific Change (if present)
   - ✅ Implementation steps (expandable/collapsible)
   - ✅ Code snippets (with syntax highlighting + copy button)
   - ✅ Testing checklist (checkboxes work)
   - ✅ Common pitfalls (warnings visible)
   - ✅ Resources (links clickable)

### Step 5.4: Test Code Copy

1. Click "Copy" button on any code snippet
2. Paste into text editor
3. Verify code is correct

### Step 5.5: Test Responsive

1. Open DevTools
2. Switch to mobile viewport (375px)
3. Verify modal is readable on mobile
4. Verify code snippets scroll horizontally if needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 6: FINAL VERIFICATION (10 min)

### Step 6.1: TypeScript Check

```bash
npm run typecheck
```

Expected: ✅ 0 errors

### Step 6.2: Lint

```bash
npm run lint
```

Expected: ✅ 0 critical errors (warnings OK)

### Step 6.3: Take Screenshots

Open modal and take screenshots:
1. Full modal scroll (all sections visible)
2. Code snippet with syntax highlighting
3. Expanded implementation step
4. Testing checklist
5. Mobile view

Save as:
- `enhanced-modal-desktop-1.png`
- `enhanced-modal-desktop-2.png`
- `enhanced-modal-code.png`
- `enhanced-modal-mobile.png`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## FINAL REPORT

Provide complete summary:

═══════════════════════════════════════════════════════
UI MODAL ENHANCEMENT - COMPLETE
═══════════════════════════════════════════════════════

Files Created:
✅ app/types/recommendation.ts
✅ app/utils/recommendation-helpers.ts
✅ app/components/CodeSnippet.tsx
✅ app/components/EnhancedRecommendationModal.tsx

Files Modified:
✅ app/routes/[ROUTE_FILE].tsx (updated import/usage)

Dependencies Added:
✅ react-syntax-highlighter
✅ @types/react-syntax-highlighter

Build Status:
✅ npm run build: SUCCESS
✅ npm run typecheck: 0 errors
✅ npm run lint: 0 critical errors

New Modal Sections (9 total):
1. ✅ Impact & Effort (star ratings)
2. ✅ ROI Breakdown (metrics + confidence bar)
3. ✅ Why This Matters (psychology + evidence)
4. ✅ Specific Change Required (highlighted)
5. ✅ Step-by-Step Guide (expandable, 3-5 steps)
6. ✅ Complete Code (syntax highlighted)
7. ✅ Testing Checklist (interactive checkboxes)
8. ✅ Common Pitfalls (category-specific warnings)
9. ✅ Helpful Resources (Shopify docs links)

Features Implemented:
✅ Syntax highlighting (Liquid, CSS, JS, HTML)
✅ Copy-to-clipboard for code
✅ Expandable/collapsible steps
✅ Category-specific checklists
✅ Category-specific pitfalls
✅ Category-specific resources
✅ Confidence percentage bar
✅ Responsive mobile design

Manual Testing:
✅ Modal opens on recommendation click
✅ All 9 sections display correctly
✅ Code copy functionality works
✅ Steps expand/collapse smoothly
✅ Checkboxes are interactive
✅ Links open in new tab
✅ Mobile view is readable

Screenshots Saved:
✅ enhanced-modal-desktop-1.png
✅ enhanced-modal-desktop-2.png
✅ enhanced-modal-code.png
✅ enhanced-modal-mobile.png

Next Steps for User:
1. Review screenshots in project root
2. Test on actual dev store
3. Deploy to Railway production
4. Gather user feedback

Estimated Improvement:
- Before: 2 sections, ~150 words
- After: 9 sections, ~500-800 words
- Code visibility: 0% → 100%
- Actionability: 3/10 → 9/10

═══════════════════════════════════════════════════════
READY FOR DEPLOYMENT 🚀
═══════════════════════════════════════════════════════

END OF IMPLEMENTATION
```
