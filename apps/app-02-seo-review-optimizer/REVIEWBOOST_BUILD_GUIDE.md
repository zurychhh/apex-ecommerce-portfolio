# 🤖 ReviewBoost AI — Claude Code Build Guide

**Version**: 1.0.0  
**Created**: 2025-01-07  
**Target MVP**: 14 days  
**Automation Level**: 95% (Claude Code handles everything)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Phase 0: Project Setup (Day 1)](#phase-0-project-setup)
3. [Phase 1: Core MVP (Days 2-7)](#phase-1-core-mvp)
4. [Phase 2: Billing & Polish (Days 8-11)](#phase-2-billing--polish)
5. [Phase 3: Testing & Deployment (Days 12-14)](#phase-3-testing--deployment)
6. [Documentation Protocol](#documentation-protocol)
7. [Quality Gates](#quality-gates)

---

## Project Overview

### What We're Building
AI-powered Shopify app that automatically generates professional responses to product reviews. Merchants save 2-4 hours/week while maintaining engagement and SEO benefits.

### Tech Stack (Proven from ConversionAI)
- **Framework**: Remix + @shopify/shopify-app-remix
- **Database**: PostgreSQL (Railway)
- **Queue**: Bull + Redis
- **AI**: Claude API (Haiku for cost efficiency)
- **Email**: Resend
- **Hosting**: Railway
- **UI**: Polaris

### Success Criteria
- ✅ OAuth flow working (no HTTP 500 in iframe)
- ✅ AI generates appropriate responses (3 tones)
- ✅ Publishing to Shopify works
- ✅ Billing integration functional
- ✅ E2E tests passing (7/7)
- ✅ App Store compliant

### Reference Documents
- `/mnt/project/APEX_FRAMEWORK.md` - Architecture principles
- `/mnt/project/SHOPIFY_APP_DEVELOPMENT_GUIDE.md` - Critical patterns
- `/mnt/project/APP_CANDIDATES_ANALYSIS.md` - Business requirements
- `/mnt/project/APEX_PROJECT_STATUS.md` - Lessons from ConversionAI

---

## 🎬 INITIALIZATION PROMPT

**Use this to start Phase 0:**

```
I'm building ReviewBoost AI, a Shopify app for AI-powered review response automation.

CONTEXT:
- This is App #2 in APEX Portfolio
- App #1 (ConversionAI) is complete and successful
- You have access to proven patterns in apps/app-01-conversionai/
- Follow APEX_FRAMEWORK.md and SHOPIFY_APP_DEVELOPMENT_GUIDE.md

YOUR MISSION:
Complete Phase 0: Project Setup from REVIEWBOOST_BUILD_GUIDE.md

CRITICAL REQUIREMENTS:
1. Read ALL reference documents first:
   - /mnt/project/APEX_FRAMEWORK.md
   - /mnt/project/SHOPIFY_APP_DEVELOPMENT_GUIDE.md
   - /mnt/project/APP_CANDIDATES_ANALYSIS.md (ReviewBoost section)
   - /mnt/project/APEX_PROJECT_STATUS.md (lessons learned)

2. After EVERY completed task:
   - Update apps/app-02-reviewboost/IMPLEMENTATION_LOG.md
   - Document what worked, what didn't, why
   - Note any deviations from plan

3. After EVERY 3 tasks OR when you encounter a blocker:
   - Summarize progress
   - Propose improvements based on what you learned
   - Ask if I want to continue or adjust approach

4. When Phase 0 is 100% complete:
   - Run verification checklist
   - Update IMPLEMENTATION_LOG.md with phase summary
   - Update /mnt/project/APEX_PROJECT_STATUS.md
   - Show me completion report
   - Ask: "Phase 0 complete. Ready to start Phase 1?"

BEGIN Phase 0 now. Read the reference docs, then start with Repository Structure.
```

---

## Phase 0: Project Setup

**Goal**: Create project structure, configure Shopify app, set up database schema  
**Duration**: 4-6 hours  
**Output**: Runnable skeleton app with auth working

### Phase 0 Prompt (Comprehensive)

```
PHASE 0: PROJECT SETUP — ReviewBoost AI

MISSION:
Create complete project skeleton based on proven ConversionAI patterns, avoiding all known pitfalls.

REFERENCE DOCUMENTS (read first):
1. /mnt/project/APEX_FRAMEWORK.md - Monorepo structure
2. /mnt/project/SHOPIFY_APP_DEVELOPMENT_GUIDE.md - Critical files (section 4)
3. apps/app-01-conversionai/ - Working example to copy from
4. /mnt/project/APP_CANDIDATES_ANALYSIS.md - ReviewBoost data model

TASKS:

## Task 1: Repository Structure (30 min)

CREATE directory: apps/app-02-reviewboost/

COPY these CRITICAL files from apps/app-01-conversionai/ (DO NOT MODIFY):
- app/shopify.server.ts (has isEmbeddedApp: true)
- app/entry.server.tsx (has CSP headers)
- app/routes/auth.$.tsx (has boundary exports)
- app/utils/session-storage.server.ts (Prisma sessions)
- app/routes/webhooks.customers.data-request.tsx
- app/routes/webhooks.customers.redact.tsx
- app/routes/webhooks.shop.redact.tsx
- app/routes/privacy.tsx
- app/routes/terms.tsx
- package.json (rename to "reviewboost-ai")
- shopify.app.*.toml (update name to "ReviewBoost AI")
- tsconfig.json
- .env.example

CREATE these NEW files:
- apps/app-02-reviewboost/PROJECT_BRIEF.md
  Content: Copy entire ReviewBoost section from APP_CANDIDATES_ANALYSIS.md
  
- apps/app-02-reviewboost/IMPLEMENTATION_LOG.md
  Content: Use IMPLEMENTATION_LOG_TEMPLATE.md structure
  
- apps/app-02-reviewboost/README.md
  Content: Quick start guide for developers

UPDATE branding in copied files:
- Replace "ConversionAI" → "ReviewBoost AI"
- Replace "conversionai" → "reviewboost"
- Update descriptions to match review response automation

VERIFY:
- Build succeeds: npm install && npm run build
- No import errors
- shopify.server.ts has isEmbeddedApp: true
- entry.server.tsx calls addDocumentResponseHeaders

DOCUMENT in IMPLEMENTATION_LOG.md:
- Files copied vs created
- Any issues encountered
- Build verification results

## Task 2: Shopify Partner Dashboard Setup (15 min)

OUTPUT a checklist for manual browser steps:

```
SHOPIFY PARTNER DASHBOARD SETUP CHECKLIST
https://partners.shopify.com/

[ ] Create New App
    - Name: ReviewBoost AI
    - Type: Custom app

[ ] OAuth Configuration
    - Scopes needed:
      * read_products (view products)
      * write_products (publish responses) 
      * read_content (access reviews)
      * write_content (write responses)
    
    - Redirect URLs:
      * http://localhost:3000/auth/callback
      * http://localhost:3000/auth/shopify/callback
      * https://reviewboost-production.up.railway.app/auth/callback
      * https://reviewboost-production.up.railway.app/auth/shopify/callback

[ ] Copy credentials to .env
    SHOPIFY_API_KEY=xxx
    SHOPIFY_API_SECRET=xxx

[ ] Register webhooks (for later):
    - customer_data_request → /webhooks/customers/data-request
    - customers_redact → /webhooks/customers/redact
    - shop_redact → /webhooks/shop/redact

AFTER MANUAL SETUP:
Update shopify.app.toml with client_id from Partner Dashboard
```

WAIT for user confirmation before proceeding.

## Task 3: Database Schema (45 min)

REFERENCE: APP_CANDIDATES_ANALYSIS.md - ReviewBoost technical spec

CREATE prisma/schema.prisma:

```prisma
// Base from ConversionAI
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ===== CORE MODELS =====

model Session {
  id          String    @id
  shop        String
  state       String
  isOnline    Boolean   @default(false)
  scope       String?
  expires     DateTime?
  accessToken String
  userId      BigInt?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Shop {
  id                String   @id @default(cuid())
  domain            String   @unique
  accessToken       String
  
  // Subscription
  plan              String   @default("free")
  planStartedAt     DateTime?
  
  // Usage tracking
  responsesUsed     Int      @default(0)
  responsesLimit    Int      @default(10)
  
  // Settings
  brandVoice        String?  // Custom prompt addition
  autoPublish       Boolean  @default(false)
  defaultTone       String   @default("professional")
  
  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastSyncedAt      DateTime?
  
  reviews           Review[]
  responseTemplates ResponseTemplate[]
}

// ===== REVIEW MANAGEMENT =====

model Review {
  id                    String   @id @default(cuid())
  shopId                String
  shop                  Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  
  // Shopify data
  shopifyReviewId       String   @unique
  productId             String
  productTitle          String
  productHandle         String?
  
  // Review content
  author                String
  authorEmail           String?
  rating                Int      // 1-5
  title                 String?
  body                  String   @db.Text
  
  // Analysis
  sentiment             String?  // positive, neutral, negative
  keyIssues             String[] // Extracted from negative reviews
  
  // Response
  responseBody          String?  @db.Text
  responseTone          String?  // professional, friendly, apologetic
  responseGeneratedAt   DateTime?
  responsePublishedAt   DateTime?
  responseEditedBy      String?  // user, ai
  
  // Status
  status                String   @default("pending") // pending, drafted, published, skipped
  isArchived            Boolean  @default(false)
  
  // Metadata
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([shopId, status])
  @@index([shopId, createdAt])
  @@index([sentiment])
}

model ResponseTemplate {
  id          String   @id @default(cuid())
  shopId      String
  shop        Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  
  name        String   // "5-star thank you", "3-star feedback"
  tone        String   // professional, friendly, apologetic
  template    String   @db.Text
  
  // Usage tracking
  usageCount  Int      @default(0)
  isDefault   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([shopId])
}

// ===== ANALYTICS (optional for MVP) =====

model AnalyticsEvent {
  id        String   @id @default(cuid())
  shopId    String
  
  event     String   // review_synced, response_generated, response_published
  metadata  Json?    // Additional data
  
  createdAt DateTime @default(now())
  
  @@index([shopId, event, createdAt])
}
```

CREATE prisma/seed.ts for development:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test shop
  const shop = await prisma.shop.upsert({
    where: { domain: 'test-store.myshopify.com' },
    update: {},
    create: {
      domain: 'test-store.myshopify.com',
      accessToken: 'test_token',
      plan: 'free',
      responsesLimit: 10,
    },
  });

  // Create sample reviews
  const reviews = [
    {
      shopifyReviewId: 'review_1',
      productId: 'prod_123',
      productTitle: 'Wireless Headphones',
      author: 'John Doe',
      rating: 5,
      title: 'Amazing quality!',
      body: 'These headphones exceeded my expectations. Sound quality is superb and battery life is incredible.',
      sentiment: 'positive',
      status: 'pending',
    },
    {
      shopifyReviewId: 'review_2',
      productId: 'prod_124',
      productTitle: 'Smart Watch',
      author: 'Jane Smith',
      rating: 3,
      title: 'Good but has issues',
      body: 'Watch works well but the app is buggy. Fitness tracking is accurate though.',
      sentiment: 'neutral',
      status: 'pending',
    },
    {
      shopifyReviewId: 'review_3',
      productId: 'prod_125',
      productTitle: 'Laptop Stand',
      author: 'Mike Johnson',
      rating: 1,
      title: 'Disappointed',
      body: 'Stand arrived damaged and wobbles. Very poor quality for the price.',
      sentiment: 'negative',
      keyIssues: ['damaged', 'quality'],
      status: 'pending',
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        ...review,
        shopId: shop.id,
      },
    });
  }

  console.log('✅ Database seeded with 1 shop and 3 sample reviews');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

RUN migration:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

VERIFY:
- Migration succeeds
- Seed creates 1 shop + 3 reviews
- Prisma Studio shows data: npx prisma studio

DOCUMENT in IMPLEMENTATION_LOG.md:
- Schema design decisions
- Any changes from original spec
- Seed data verification

## Task 4: Basic UI Structure (30 min)

CREATE minimal dashboard with Polaris:

1. app/routes/app._index.tsx (Dashboard)
```typescript
import { useLoaderData } from "@remix-run/react";
import { Page, Card, EmptyState, Badge, DataTable } from "@shopify/polaris";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const shop = await getShopFromSession(admin.session);
  
  // Get pending reviews count
  const pendingCount = await prisma.review.count({
    where: { shopId: shop.id, status: 'pending' }
  });

  return json({ pendingCount });
}

export default function Index() {
  const { pendingCount } = useLoaderData();

  return (
    <Page title="ReviewBoost AI">
      <Card>
        {pendingCount > 0 ? (
          <p>You have {pendingCount} reviews waiting for responses.</p>
        ) : (
          <EmptyState
            heading="No pending reviews"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>All caught up! New reviews will appear here.</p>
          </EmptyState>
        )}
      </Card>
    </Page>
  );
}
```

2. app/routes/app.reviews._index.tsx (Review list placeholder)
```typescript
export default function ReviewsList() {
  return <Page title="Reviews">Coming soon...</Page>;
}
```

UPDATE app/root.tsx to add navigation:
```typescript
{
  label: 'Dashboard',
  destination: '/app',
},
{
  label: 'Reviews',
  destination: '/app/reviews',
},
```

TEST:
- Run dev server: npm run dev
- Visit http://localhost:3000/app
- Dashboard loads with empty state

## Task 5: Environment Configuration (15 min)

CREATE .env.example:
```bash
# Shopify
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=http://localhost:3000
SCOPES=read_products,write_products,read_content,write_content

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reviewboost_dev

# Redis (for background jobs)
REDIS_URL=redis://localhost:6379

# Claude AI
ANTHROPIC_API_KEY=

# Resend (email)
RESEND_API_KEY=

# App
NODE_ENV=development
```

DOCUMENT required API keys and where to get them:
```markdown
# API Keys Setup

## Anthropic (Claude AI)
1. Sign up: https://console.anthropic.com/
2. Create API key
3. Copy to .env as ANTHROPIC_API_KEY

## Resend (Email)
1. Sign up: https://resend.com/
2. Verify domain or use test mode
3. Create API key
4. Copy to .env as RESEND_API_KEY

## Local Development
- PostgreSQL: Use Docker or local install
- Redis: Use Docker or local install
  ```bash
  docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
  docker run -d -p 6379:6379 redis
  ```
```

---

## PHASE 0 COMPLETION CHECKLIST

Before proceeding to Phase 1, verify:

- [ ] Repository structure matches APEX monorepo pattern
- [ ] All critical files copied from ConversionAI
- [ ] shopify.server.ts has isEmbeddedApp: true
- [ ] entry.server.tsx has CSP headers
- [ ] auth.$.tsx has boundary exports
- [ ] Prisma schema created and migrated
- [ ] Seed data loaded (3 reviews)
- [ ] Basic dashboard loads
- [ ] Build succeeds: npm run build
- [ ] Dev server runs: npm run dev
- [ ] .env.example documented
- [ ] IMPLEMENTATION_LOG.md updated
- [ ] PROJECT_BRIEF.md created

---

## DOCUMENTATION UPDATE PROTOCOL

After completing Phase 0:

1. UPDATE apps/app-02-reviewboost/IMPLEMENTATION_LOG.md:
```markdown
## Phase 0: Project Setup - COMPLETE ✅

**Duration**: [X hours]
**Date**: [YYYY-MM-DD]

### Tasks Completed
1. ✅ Repository structure created
2. ✅ Critical files copied from ConversionAI
3. ✅ Shopify Partner Dashboard configured
4. ✅ Database schema created and seeded
5. ✅ Basic UI skeleton working

### Files Created
- [list all new files]

### Deviations from Plan
- [any changes made and why]

### Lessons Learned
- [what worked well]
- [what could be improved]
- [gotchas to avoid in next phase]

### Blockers Encountered
- [none / list issues]

### Next Phase Preparation
- Shopify OAuth ready for testing
- Database ready for real data
- UI framework in place
- Ready for Phase 1: Core MVP
```

2. UPDATE /mnt/project/APEX_PROJECT_STATUS.md:
```markdown
### Session #XX (DATE) - ReviewBoost Phase 0
**Duration**: ~Xh
**Focus**: Project setup and foundation

**Completed**:
- ✅ Repository structure (apps/app-02-reviewboost/)
- ✅ Prisma schema with Review, Shop, ResponseTemplate models
- ✅ Basic dashboard UI
- ✅ Critical files copied from ConversionAI

**Status**: Phase 0 complete, ready for Phase 1
```

3. PROPOSE IMPROVEMENTS:
```
Based on Phase 0 completion, I suggest these improvements for Phase 1:

1. [Improvement 1]: [Why it would help]
2. [Improvement 2]: [Why it would help]
3. [Improvement 3]: [Why it would help]

Proceed with standard Phase 1, or adjust based on these suggestions?
```

---

## AUTOMATIC PHASE TRANSITION

When Phase 0 is complete:

```
✅ PHASE 0 COMPLETE

Summary:
- Repository: apps/app-02-reviewboost/ created
- Database: PostgreSQL schema migrated, 3 sample reviews seeded
- UI: Basic dashboard rendering
- Build: Passing
- Verification: 11/11 checks passed

Documentation updated:
- IMPLEMENTATION_LOG.md (Phase 0 summary)
- APEX_PROJECT_STATUS.md (session entry)

Proposed improvements for Phase 1:
1. [suggestion]
2. [suggestion]

---

Ready to start PHASE 1: CORE MVP (Days 2-7)?

Phase 1 will build:
- Shopify review sync
- Claude AI response generation
- Response publishing flow
- Dashboard with review management

Type "start phase 1" to continue, or ask questions about Phase 0 results.
```

---

END OF PHASE 0 PROMPT
```

---

## Phase 1: Core MVP

**Goal**: Build complete review → AI response → publish flow  
**Duration**: 5-7 days  
**Output**: Functional app that can respond to reviews

### Phase 1 Prompt (Comprehensive)

```
PHASE 1: CORE MVP — ReviewBoost AI

MISSION:
Build end-to-end review response automation: sync reviews from Shopify → generate AI responses → publish back to Shopify.

PREREQUISITES:
- Phase 0 complete (verify IMPLEMENTATION_LOG.md)
- Database seeded with 3 sample reviews
- Basic dashboard working

REFERENCE DOCUMENTS:
1. apps/app-01-conversionai/app/utils/claude.server.ts - Claude API patterns
2. /mnt/project/SHOPIFY_APP_DEVELOPMENT_GUIDE.md - API integration patterns
3. /mnt/project/APP_CANDIDATES_ANALYSIS.md - ReviewBoost prompt design

TASKS:

## Task 1: Shopify Product Reviews API Integration (3-4 hours)

RESEARCH first:
- Shopify Product Reviews API documentation
- Rate limits (2 requests/second)
- Pagination (max 250 results per request)

CREATE app/utils/shopify-reviews.server.ts:

```typescript
import { GraphQLClient } from 'graphql-request';

export async function fetchProductReviews(
  shop: string, 
  accessToken: string,
  productId?: string
) {
  // GraphQL query to fetch reviews
  // Handle pagination
  // Transform to our Review model format
  // Return: { reviews: Review[], hasMore: boolean, cursor?: string }
}

export async function publishReviewResponse(
  shop: string,
  accessToken: string,
  reviewId: string,
  responseBody: string
) {
  // Publish response via Shopify API
  // Handle errors (rate limits, invalid review, etc.)
  // Return: { success: boolean, shopifyResponseId?: string }
}
```

IMPORTANT: Handle these edge cases:
- Review with no body (only rating)
- Reviews from deleted products
- Reviews marked as spam
- Rate limit (429) - exponential backoff

CREATE app/routes/api.reviews.sync.tsx:
```typescript
export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const shop = await getShopFromSession(admin.session);
  
  // Fetch all products
  // For each product, fetch reviews
  // Save new reviews to database
  // Detect sentiment (positive 4-5★, neutral 3★, negative 1-2★)
  // Return: { synced: X, new: Y, errors: [] }
}
```

WEBHOOK for real-time sync:
CREATE app/routes/webhooks.products.update.tsx:
```typescript
// When product updated, check for new reviews
// This keeps data fresh without manual sync
```

TEST:
1. Call /api/reviews/sync with test shop
2. Verify new reviews appear in database
3. Check sentiment detection accuracy
4. Test with products that have many reviews (pagination)

DOCUMENT:
- API integration patterns used
- Rate limit handling approach
- Any Shopify API quirks discovered

## Task 2: Claude AI Response Generator (4-5 hours)

REFERENCE: apps/app-01-conversionai/app/utils/claude.server.ts

CREATE app/utils/review-response-ai.server.ts:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface GenerateResponseOptions {
  review: {
    author: string;
    rating: number;
    title?: string;
    body: string;
    productTitle: string;
  };
  tone: 'professional' | 'friendly' | 'apologetic';
  brandVoice?: string;
  storeName?: string;
}

export async function generateReviewResponse(
  options: GenerateResponseOptions
): Promise<{ responseBody: string; tokensUsed: number }> {
  
  const { review, tone, brandVoice, storeName } = options;
  
  // Build prompt based on APP_CANDIDATES_ANALYSIS.md spec
  const prompt = buildPrompt(review, tone, brandVoice, storeName);
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Cost efficient
      max_tokens: 512, // Response should be short
      temperature: 0.7, // Some creativity but consistent
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    const responseBody = extractTextFromResponse(response);
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;
    
    return { responseBody, tokensUsed };
    
  } catch (error: any) {
    // CRITICAL: Log full error body (lesson from ConversionAI)
    console.error('Claude API error:', {
      message: error.message,
      status: error.status,
      type: error.type,
      body: JSON.stringify(error.error || error.body || {}),
    });
    throw error;
  }
}

function buildPrompt(
  review: any, 
  tone: string, 
  brandVoice?: string, 
  storeName?: string
): string {
  
  // Base from APP_CANDIDATES_ANALYSIS.md
  let prompt = `You are a customer service specialist for an ecommerce store.
Generate a response to this product review.

STORE CONTEXT:
- Store name: ${storeName || 'the store'}
- Brand voice: ${brandVoice || getToneDescription(tone)}

REVIEW:
- Product: ${review.productTitle}
- Rating: ${review.rating}/5 stars
- Author: ${review.author}
${review.title ? `- Title: "${review.title}"` : ''}
- Review: "${review.body}"

TONE: ${tone}

RULES:
- Keep response 2-4 sentences
- If positive (4-5★): Thank them, mention specific praise they gave, invite them back
- If neutral (3★): Thank them, acknowledge feedback, offer to help
- If negative (1-2★): Apologize sincerely, address specific issue, offer solution/contact
- Never be defensive
- Never offer discounts/refunds (legal reasons)
- Sound human, not robotic
- Match the review language (if casual, be casual; if formal, be formal)

Respond ONLY with the review response text, no explanations or meta-commentary.`;

  return prompt;
}

function getToneDescription(tone: string): string {
  switch (tone) {
    case 'professional':
      return 'Professional and courteous, maintaining formality';
    case 'friendly':
      return 'Warm and conversational, like talking to a friend';
    case 'apologetic':
      return 'Empathetic and solution-focused, deeply apologetic for issues';
    default:
      return 'Professional and friendly';
  }
}

function extractTextFromResponse(response: any): string {
  // Extract text from Claude response
  // Handle both text blocks and tool_use blocks
  const textContent = response.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n\n')
    .trim();
    
  return textContent;
}
```

CREATE app/routes/api.reviews.$id.generate.tsx:
```typescript
export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const shop = await getShopFromSession(admin.session);
  
  const reviewId = params.id;
  const { tone } = await request.json();
  
  // Verify review belongs to shop
  const review = await prisma.review.findFirst({
    where: { id: reviewId, shopId: shop.id }
  });
  
  if (!review) {
    return json({ error: 'Review not found' }, { status: 404 });
  }
  
  // Check usage limits
  if (shop.responsesUsed >= shop.responsesLimit) {
    return json({ 
      error: 'Monthly limit reached',
      upgradeRequired: true 
    }, { status: 402 });
  }
  
  // Generate response
  const { responseBody, tokensUsed } = await generateReviewResponse({
    review: {
      author: review.author,
      rating: review.rating,
      title: review.title,
      body: review.body,
      productTitle: review.productTitle,
    },
    tone,
    brandVoice: shop.brandVoice,
    storeName: shop.domain.replace('.myshopify.com', ''),
  });
  
  // Save draft
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      responseBody,
      responseTone: tone,
      responseGeneratedAt: new Date(),
      status: 'drafted',
    },
  });
  
  // Increment usage
  await prisma.shop.update({
    where: { id: shop.id },
    data: { responsesUsed: { increment: 1 } },
  });
  
  return json({ 
    responseBody, 
    tokensUsed,
    responsesRemaining: shop.responsesLimit - shop.responsesUsed - 1 
  });
}
```

TEST all 3 tones:
1. Generate response for 5★ review (professional tone)
2. Generate response for 3★ review (friendly tone)
3. Generate response for 1★ review (apologetic tone)
4. Verify responses are appropriate
5. Test hitting usage limit

DOCUMENT:
- Prompt engineering decisions
- Token usage per response (estimate cost)
- Response quality assessment

## Task 3: Review Management Dashboard (4-5 hours)

CREATE app/routes/app.reviews._index.tsx:

```typescript
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page, Card, DataTable, Badge, Button, Select, 
  Filters, TextField, EmptyState
} from "@shopify/polaris";

export async function loader({ request }) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const sentiment = url.searchParams.get('sentiment');
  
  const { admin } = await authenticate.admin(request);
  const shop = await getShopFromSession(admin.session);
  
  const where: any = { shopId: shop.id };
  if (status !== 'all') where.status = status;
  if (sentiment) where.sentiment = sentiment;
  
  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50, // Pagination later
  });
  
  const stats = {
    pending: await prisma.review.count({ where: { shopId: shop.id, status: 'pending' }}),
    drafted: await prisma.review.count({ where: { shopId: shop.id, status: 'drafted' }}),
    published: await prisma.review.count({ where: { shopId: shop.id, status: 'published' }}),
  };
  
  return json({ reviews, stats, currentStatus: status });
}

export default function ReviewsList() {
  const { reviews, stats, currentStatus } = useLoaderData();
  const generateFetcher = useFetcher();
  
  const rows = reviews.map((review) => [
    <Badge status={getSentimentColor(review.sentiment)}>
      {review.rating}★
    </Badge>,
    <div>
      <strong>{review.productTitle}</strong>
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        {review.author} • {formatDate(review.createdAt)}
      </p>
    </div>,
    <p style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {review.body}
    </p>,
    <Badge status={getStatusColor(review.status)}>
      {review.status}
    </Badge>,
    <Button
      onClick={() => {
        // Open modal or navigate to detail page
      }}
    >
      {review.status === 'pending' ? 'Generate' : 'View'}
    </Button>
  ]);
  
  return (
    <Page
      title="Reviews"
      primaryAction={{
        content: 'Sync Reviews',
        onAction: () => syncFetcher.submit({}, { method: 'post', action: '/api/reviews/sync' })
      }}
    >
      <Card>
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          <Badge status="info">Pending: {stats.pending}</Badge>
          <Badge status="warning">Drafted: {stats.drafted}</Badge>
          <Badge status="success">Published: {stats.published}</Badge>
        </div>
        
        <DataTable
          columnContentTypes={['text', 'text', 'text', 'text', 'text']}
          headings={['Rating', 'Product & Author', 'Review', 'Status', 'Action']}
          rows={rows}
        />
      </Card>
    </Page>
  );
}
```

CREATE app/routes/app.reviews.$id.tsx (Detail view):
```typescript
export default function ReviewDetail() {
  // Full review display
  // Tone selector
  // Generate button
  // Edit response
  // Publish button
  // Response preview
}
```

CREATE app/components/ReviewResponseGenerator.tsx:
```typescript
export function ReviewResponseGenerator({ review, onPublish }) {
  const [tone, setTone] = useState('professional');
  const [response, setResponse] = useState(review.responseBody || '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateResponse = async () => {
    setIsGenerating(true);
    const result = await fetch(`/api/reviews/${review.id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tone })
    });
    const data = await result.json();
    setResponse(data.responseBody);
    setIsGenerating(false);
  };
  
  return (
    <Card>
      <Select
        label="Tone"
        options={[
          { label: 'Professional', value: 'professional' },
          { label: 'Friendly', value: 'friendly' },
          { label: 'Apologetic', value: 'apologetic' },
        ]}
        value={tone}
        onChange={setTone}
      />
      
      <Button
        onClick={generateResponse}
        loading={isGenerating}
        primary
      >
        Generate Response
      </Button>
      
      {response && (
        <TextField
          label="Response (edit if needed)"
          value={response}
          onChange={setResponse}
          multiline={4}
        />
      )}
      
      <Button
        onClick={() => onPublish(response)}
        disabled={!response}
      >
        Publish to Shopify
      </Button>
    </Card>
  );
}
```

TEST full user flow:
1. Sync reviews from Shopify
2. View review list
3. Click on pending review
4. Select tone and generate response
5. Edit response
6. Verify preview looks good

## Task 4: Response Publishing (2-3 hours)

CREATE app/routes/api.reviews.$id.publish.tsx:
```typescript
export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const shop = await getShopFromSession(admin.session);
  
  const reviewId = params.id;
  const { responseBody } = await request.json();
  
  const review = await prisma.review.findFirst({
    where: { id: reviewId, shopId: shop.id }
  });
  
  if (!review || review.status !== 'drafted') {
    return json({ error: 'Review not ready to publish' }, { status: 400 });
  }
  
  try {
    // Publish to Shopify
    const result = await publishReviewResponse(
      shop.domain,
      shop.accessToken,
      review.shopifyReviewId,
      responseBody
    );
    
    if (!result.success) {
      throw new Error('Shopify API rejected response');
    }
    
    // Update database
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'published',
        responsePublishedAt: new Date(),
        responseBody, // Save final edited version
      },
    });
    
    return json({ success: true });
    
  } catch (error: any) {
    console.error('Publish failed:', error);
    return json({ 
      error: error.message,
      retryable: error.status === 429 
    }, { status: 500 });
  }
}
```

ADD success notifications:
- Toast message on publish
- Update review list in real-time
- Send email notification (optional)

TEST:
1. Publish drafted response
2. Verify appears in Shopify Product Reviews
3. Test error handling (invalid review, API down)
4. Test retry mechanism for 429

## Task 5: Bulk Operations (2 hours)

CREATE app/routes/api.reviews.bulk-generate.tsx:
```typescript
export async function action({ request }) {
  const { reviewIds, tone } = await request.json();
  
  // Process in sequence (avoid rate limits)
  const results = [];
  for (const reviewId of reviewIds) {
    try {
      const result = await generateAndSaveResponse(reviewId, tone);
      results.push({ reviewId, success: true, response: result });
    } catch (error) {
      results.push({ reviewId, success: false, error: error.message });
    }
    
    // Rate limit: 1 request per second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return json({ results });
}
```

ADD to dashboard:
- Select multiple reviews (checkboxes)
- "Generate All" button
- Progress indicator
- Results summary

---

## PHASE 1 COMPLETION CHECKLIST

Before proceeding to Phase 2, verify:

- [ ] Reviews sync from Shopify successfully
- [ ] Pagination works for stores with 250+ reviews
- [ ] AI generates appropriate responses for all 3 tones
- [ ] Responses can be edited before publishing
- [ ] Publishing to Shopify works
- [ ] Usage tracking increments correctly
- [ ] Dashboard shows correct counts
- [ ] Bulk generation works
- [ ] Error handling for rate limits
- [ ] E2E test: sync → generate → publish completes
- [ ] Performance: Generate response in <5 seconds
- [ ] Token usage is reasonable (~200-400 tokens per response)

---

## DOCUMENTATION UPDATE PROTOCOL

After each major task completion:

1. UPDATE IMPLEMENTATION_LOG.md with task details
2. Document any API quirks discovered
3. Note performance metrics
4. Capture lessons learned

After Phase 1 completion:

1. UPDATE apps/app-02-reviewboost/IMPLEMENTATION_LOG.md with phase summary
2. UPDATE /mnt/project/APEX_PROJECT_STATUS.md with session entry
3. CALCULATE cost per response (Claude tokens + Shopify API calls)
4. PROPOSE improvements for Phase 2

---

## LEARNING & IMPROVEMENT PROTOCOL

After every 3 tasks, pause and reflect:

```
LEARNING CHECKPOINT

Completed: [Task X, Y, Z]

What worked well:
- [specific thing that worked]
- [pattern that should be reused]

What could be improved:
- [inefficiency discovered]
- [better approach would be...]

Blockers encountered:
- [issue and how resolved]

Proposed changes for remaining tasks:
1. [suggestion with rationale]
2. [suggestion with rationale]

Continue as planned or adjust?
```

---

## AUTOMATIC PHASE TRANSITION

When Phase 1 is complete:

```
✅ PHASE 1 COMPLETE: CORE MVP

Summary:
- Shopify integration: Reviews syncing (X reviews imported)
- AI generation: Working for all 3 tones
- Publishing: Successfully posting to Shopify
- Dashboard: Functional review management UI
- Performance: <5s generation, <10s publish

Key Metrics:
- Average tokens per response: ~XXX
- Cost per response: $0.XXX
- API success rate: XX%

Documentation updated:
- IMPLEMENTATION_LOG.md (Phase 1 detailed)
- APEX_PROJECT_STATUS.md (session entry)

Lessons learned:
1. [key lesson]
2. [key lesson]
3. [key lesson]

Recommended improvements for Phase 2:
1. [improvement]
2. [improvement]

---

Ready to start PHASE 2: BILLING & POLISH (Days 8-11)?

Phase 2 will add:
- Subscription plans (Free/Starter/Growth/Agency)
- Usage limit enforcement
- Monthly reset automation
- UI polish and bulk actions
- Email notifications

Type "start phase 2" to continue.
```

---

END OF PHASE 1 PROMPT
```

---

## Phase 2: Billing & Polish

**Goal**: Add subscription plans, enforce limits, polish UX  
**Duration**: 3-4 days  
**Output**: Production-ready app with monetization

### Phase 2 Prompt (Comprehensive)

```
PHASE 2: BILLING & POLISH — ReviewBoost AI

MISSION:
Implement subscription billing, usage limits, and UX polish to make app production-ready.

PREREQUISITES:
- Phase 1 complete (core MVP working)
- Review sync + AI generation + publishing functional

REFERENCE DOCUMENTS:
1. apps/app-01-conversionai/app/utils/billing.server.ts - Proven billing patterns
2. /mnt/project/SHOPIFY_APP_DEVELOPMENT_GUIDE.md - Billing API best practices
3. /mnt/project/APP_CANDIDATES_ANALYSIS.md - ReviewBoost pricing strategy

TASKS:

## Task 1: Subscription Plans Setup (3-4 hours)

COPY and ADAPT from ConversionAI:
- app/utils/billing.server.ts (core logic)
- app/routes/api.billing.create.tsx (charge creation)
- app/routes/api.billing.callback.tsx (approval handling)

UPDATE pricing for ReviewBoost:

```typescript
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    responsesLimit: 10,
    features: [
      '10 AI responses/month',
      '1 tone preset',
      'Manual publish only',
      'Community support',
    ],
  },
  starter: {
    name: 'Starter',
    price: 19,
    responsesLimit: 100,
    features: [
      '100 AI responses/month',
      'All tone presets',
      'One-click publish',
      'Remove branding',
      'Email support',
    ],
    shopifyPlanName: 'Starter Plan',
  },
  growth: {
    name: 'Growth',
    price: 49,
    responsesLimit: -1, // Unlimited
    features: [
      'Unlimited responses',
      'Bulk generation',
      'Sentiment auto-detection',
      'Priority negative alerts',
      'Custom brand voice',
      'Priority support',
    ],
    shopifyPlanName: 'Growth Plan',
    recommended: true,
  },
  agency: {
    name: 'Agency',
    price: 149,
    responsesLimit: -1,
    features: [
      'Everything in Growth',
      '10 stores',
      'Team members (3)',
      'White-label',
      'API access',
      'Dedicated support',
    ],
    shopifyPlanName: 'Agency Plan',
  },
};

export function getPlanLimits(plan: string) {
  return PLANS[plan as keyof typeof PLANS] || PLANS.free;
}
```

CREATE app/routes/app.pricing.tsx:
```typescript
export default function Pricing() {
  const currentPlan = useCurrentPlan();
  
  return (
    <Page title="Pricing">
      <Layout>
        {Object.entries(PLANS).map(([key, plan]) => (
          <Layout.Section oneThird key={key}>
            <PricingCard
              plan={plan}
              isCurrent={currentPlan === key}
              isRecommended={plan.recommended}
              onUpgrade={() => upgradeToplan(key)}
            />
          </Layout.Section>
        ))}
      </Layout>
    </Page>
  );
}
```

IMPLEMENT billing flow:
1. User clicks "Upgrade to Starter"
2. Create Shopify charge via Billing API
3. Redirect to Shopify approval page
4. Handle callback, update shop.plan in database
5. Update responsesLimit

TEST:
- Free → Starter upgrade
- Starter → Growth upgrade
- Downgrade handling
- Free trial period (7 days Growth for new users)

## Task 2: Usage Limit Enforcement (2-3 hours)

CREATE app/utils/usage-limits.server.ts:
```typescript
export async function checkUsageLimit(shopId: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: Date;
}> {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  
  const planLimits = getPlanLimits(shop.plan);
  const limit = planLimits.responsesLimit;
  
  // Unlimited plan
  if (limit === -1) {
    return { allowed: true, remaining: -1, limit: -1, resetDate: getNextMonthStart() };
  }
  
  const remaining = Math.max(0, limit - shop.responsesUsed);
  const allowed = remaining > 0;
  
  return { allowed, remaining, limit, resetDate: getNextMonthStart() };
}

function getNextMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
```

ADD to generation endpoint:
```typescript
// In app/routes/api.reviews.$id.generate.tsx
const usageCheck = await checkUsageLimit(shop.id);

if (!usageCheck.allowed) {
  return json({
    error: 'Monthly limit reached',
    remaining: usageCheck.remaining,
    limit: usageCheck.limit,
    resetDate: usageCheck.resetDate,
    upgradeRequired: true,
  }, { status: 402 });
}
```

CREATE usage indicator component:
```typescript
export function UsageIndicator({ shopId }) {
  const usage = useUsage(shopId);
  
  const percentage = usage.limit === -1 
    ? 100 
    : (usage.used / usage.limit) * 100;
  
  const color = percentage > 80 ? 'critical' : percentage > 60 ? 'warning' : 'success';
  
  return (
    <Card>
      <ProgressBar progress={percentage} color={color} />
      <p>
        {usage.limit === -1 
          ? `${usage.used} responses this month (unlimited)`
          : `${usage.used} / ${usage.limit} responses used`}
      </p>
      {percentage > 80 && usage.limit !== -1 && (
        <Banner status="warning">
          <p>You're running low on responses. <Link to="/app/pricing">Upgrade now</Link></p>
        </Banner>
      )}
    </Card>
  );
}
```

CREATE monthly reset job:
```typescript
// app/jobs/resetMonthlyUsage.ts
export async function resetMonthlyUsage() {
  const result = await prisma.shop.updateMany({
    where: { responsesUsed: { gt: 0 } },
    data: { responsesUsed: 0 },
  });
  
  console.log(`Reset usage for ${result.count} shops`);
}

// Run via cron on 1st of each month
// Setup via cron-job.org or Railway cron
```

## Task 3: Brand Voice Customization (2 hours)

CREATE app/routes/app.settings.tsx:
```typescript
export default function Settings() {
  const [brandVoice, setBrandVoice] = useState('');
  const [defaultTone, setDefaultTone] = useState('professional');
  const [autoPublish, setAutoPublish] = useState(false);
  
  return (
    <Page title="Settings">
      <Card sectioned>
        <FormLayout>
          <TextField
            label="Brand Voice (optional)"
            value={brandVoice}
            onChange={setBrandVoice}
            multiline={4}
            helpText="Describe your brand's personality. Example: 'We're a fun, casual outdoor gear company that loves adventure.'"
          />
          
          <Select
            label="Default Tone"
            options={[
              { label: 'Professional', value: 'professional' },
              { label: 'Friendly', value: 'friendly' },
              { label: 'Apologetic', value: 'apologetic' },
            ]}
            value={defaultTone}
            onChange={setDefaultTone}
          />
          
          <Checkbox
            label="Auto-publish positive reviews (4-5★)"
            checked={autoPublish}
            onChange={setAutoPublish}
            helpText="Growth plan only"
            disabled={!isGrowthOrAbove}
          />
          
          <Button primary onClick={saveSettings}>
            Save Settings
          </Button>
        </FormLayout>
      </Card>
    </Page>
  );
}
```

UPDATE AI prompt to use brand voice:
- Pass shop.brandVoice to generateReviewResponse()
- Incorporate into system prompt

TEST brand voice:
- Set brand voice: "We're a luxury skincare brand, elegant and sophisticated"
- Generate response for 5★ review
- Verify tone matches brand voice

## Task 4: Email Notifications (2 hours)

CREATE app/utils/email.server.ts:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWeeklySummary(
  email: string,
  shopName: string,
  stats: {
    newReviews: number;
    responsesGenerated: number;
    responsesPublished: number;
    averageRating: number;
  }
) {
  await resend.emails.send({
    from: 'ReviewBoost <hello@reviewboost.app>',
    to: email,
    subject: `ReviewBoost Weekly Summary - ${shopName}`,
    html: `
      <h2>Your Weekly ReviewBoost Summary</h2>
      <p>Here's what happened this week:</p>
      <ul>
        <li>📬 ${stats.newReviews} new reviews received</li>
        <li>🤖 ${stats.responsesGenerated} AI responses generated</li>
        <li>✅ ${stats.responsesPublished} responses published</li>
        <li>⭐ Average rating: ${stats.averageRating.toFixed(1)}</li>
      </ul>
      <p><a href="https://your-app.railway.app/app">View Dashboard</a></p>
    `,
  });
}

export async function sendNegativeReviewAlert(
  email: string,
  shopName: string,
  review: {
    productTitle: string;
    author: string;
    rating: number;
    body: string;
  }
) {
  await resend.emails.send({
    from: 'ReviewBoost Alerts <alerts@reviewboost.app>',
    to: email,
    subject: `⚠️ Negative Review Alert - ${shopName}`,
    html: `
      <h2>Negative Review Detected</h2>
      <p>A ${review.rating}★ review needs your attention:</p>
      <blockquote>
        <strong>Product:</strong> ${review.productTitle}<br>
        <strong>From:</strong> ${review.author}<br>
        <strong>Review:</strong> ${review.body}
      </blockquote>
      <p><a href="https://your-app.railway.app/app/reviews">Respond Now</a></p>
    `,
  });
}
```

IMPLEMENT webhooks for notifications:
- When 1-2★ review synced → send alert immediately
- Every Monday → send weekly summary

## Task 5: UX Polish (3-4 hours)

IMPROVEMENTS:

1. **Response Templates**
```typescript
// Save commonly used responses as templates
CREATE app/routes/app.templates.tsx:
- List saved templates
- Create new template
- Edit/delete existing
- Apply template to review
```

2. **Keyboard Shortcuts**
```typescript
// Add keyboard navigation
- Tab through reviews
- G to generate
- P to publish
- E to edit
```

3. **Filter & Search**
```typescript
// Enhanced dashboard filtering
- Filter by rating (1★, 2★, 3★, 4★, 5★)
- Filter by product
- Search by author or content
- Sort by date, rating
```

4. **Analytics Dashboard**
```typescript
CREATE app/routes/app.analytics.tsx:
- Response rate over time (chart)
- Average rating trend
- Most reviewed products
- Response time stats
```

5. **Onboarding**
```typescript
// First-time user experience
- Welcome modal with 3-step guide
- Sample review with AI generation demo
- Product tour of key features
- Link to help documentation
```

---

## PHASE 2 COMPLETION CHECKLIST

Before proceeding to Phase 3, verify:

- [ ] All 4 pricing tiers working
- [ ] Upgrade flow: Free → Starter → Growth → Agency
- [ ] Usage limits enforced correctly
- [ ] Monthly reset scheduled
- [ ] Brand voice influences AI responses
- [ ] Email notifications sending
- [ ] Response templates functional
- [ ] Dashboard analytics accurate
- [ ] Onboarding smooth for new users
- [ ] Settings persist correctly
- [ ] Performance: Dashboard loads in <2s
- [ ] No console errors

---

## DOCUMENTATION & LEARNING

After Phase 2:

1. UPDATE IMPLEMENTATION_LOG.md:
```markdown
## Phase 2: Billing & Polish - COMPLETE ✅

### Billing Implementation
- Shopify Billing API: 4 tiers configured
- Upgrade flow tested: All paths working
- Usage tracking: Per-shop, resets monthly

### Key Metrics
- Average upgrade rate: TBD (need beta testers)
- Most popular tier: Expected Growth ($49/mo)
- Churn risk: Free tier users hitting limit

### UX Improvements
- Response time: <5s for AI generation
- Dashboard load: <2s
- Mobile responsive: Yes

### Lessons Learned
1. [lesson]
2. [lesson]
3. [lesson]
```

2. CALCULATE unit economics:
```
Cost per response:
- Claude API: $0.XXX (Haiku)
- Shopify API: Free
- Total: $0.XXX

Margins:
- Free tier: -$0.XX per user (lead gen cost)
- Starter ($19): $XX profit if >10 responses
- Growth ($49): $XX profit (break-even at ~500 responses)

LTV projection:
- Average subscription length: 12 months (target)
- Churn rate: 5% monthly (target)
- LTV: $19 × 12 × (1 - 0.05) = $216 (Starter)
```

3. PROPOSE Phase 3 optimizations:
```
Based on Phase 2 completion:

Performance optimizations needed:
1. [suggestion]

UX improvements discovered:
1. [suggestion]

Feature ideas for v1.1 (post-launch):
1. [suggestion]
```

---

## AUTOMATIC PHASE TRANSITION

When Phase 2 is complete:

```
✅ PHASE 2 COMPLETE: BILLING & POLISH

Summary:
- Billing: 4 tiers configured, upgrade flow working
- Usage limits: Enforced, monthly reset scheduled
- Brand voice: Customization working
- Email notifications: Alerts + weekly summaries
- UX polish: Templates, analytics, onboarding

Unit Economics:
- Cost per response: $0.XXX
- Margin per Starter user: $XX
- Margin per Growth user: $XX
- Break-even: XX responses/month

Documentation updated:
- IMPLEMENTATION_LOG.md (Phase 2 complete)
- APEX_PROJECT_STATUS.md (session entry)
- Cost model calculated

Ready for production:
- ✅ Core functionality
- ✅ Monetization
- ✅ Usage limits
- ⚠️ Needs testing & deployment (Phase 3)

---

Ready to start PHASE 3: TESTING & DEPLOYMENT (Days 12-14)?

Phase 3 will:
- Create E2E test suite
- Deploy to Railway production
- Submit to Shopify App Store
- Set up monitoring

Type "start phase 3" to continue.
```

---

END OF PHASE 2 PROMPT
```

---

## Phase 3: Testing & Deployment

**Goal**: Production deployment + App Store submission  
**Duration**: 2-3 days  
**Output**: Live app in Shopify App Store

### Phase 3 Prompt (Comprehensive)

```
PHASE 3: TESTING & DEPLOYMENT — ReviewBoost AI

MISSION:
Create comprehensive test suite, deploy to production, and submit to Shopify App Store.

PREREQUISITES:
- Phase 2 complete (billing + polish working)
- All features functional in development

REFERENCE DOCUMENTS:
1. /mnt/project/APEX_TESTING_FRAMEWORK.md - E2E testing patterns
2. /mnt/project/SHOPIFY_APP_DEVELOPMENT_GUIDE.md - Deployment checklist
3. /mnt/project/UNIVERSAL_E2E_TESTING_FRAMEWORK.md - Playwright MCP guide

TASKS:

## Task 1: E2E Testing Suite (4-5 hours)

REFERENCE: APEX_TESTING_FRAMEWORK.md for Playwright MCP patterns

CREATE comprehensive test scenarios:

### Critical Path Tests (MUST PASS)

**RB-CP-01: OAuth Installation & App Load**
```
Use Playwright MCP to test ReviewBoost OAuth flow:

1. Navigate to app installation URL
2. If Shopify login appears, use test credentials
3. Click "Install app" button
4. Wait for redirect to dashboard (max 10 seconds)
5. Verify text "ReviewBoost AI" appears in header
6. Verify reviews count is displayed (even if 0)
7. Check browser console for errors
8. Take screenshot as "oauth-success.png"

Report: PASS/FAIL with load time
```

**RB-CP-02: Review Sync from Shopify**
```
Use Playwright to test review sync:

1. Ensure logged into ReviewBoost dashboard
2. Click "Sync Reviews" button
3. Wait for sync to complete (show loading indicator)
4. Verify success message appears
5. Verify reviews list populates (or shows "No reviews yet")
6. Check at least 1 review displays with: product name, rating, author, body
7. Take screenshot

Report: PASS/FAIL with sync time and count
```

**RB-CP-03: AI Response Generation (All 3 Tones)**
```
Use Playwright to test AI generation:

TEST 1: Professional tone (5★ review)
1. Navigate to pending review (5★)
2. Select tone: "Professional"
3. Click "Generate Response"
4. Wait for AI generation (max 10 seconds)
5. Verify response appears in text field
6. Verify response is 2-4 sentences
7. Verify response mentions specific praise from review

TEST 2: Friendly tone (3★ review)
1. Navigate to pending review (3★)
2. Select tone: "Friendly"
3. Generate response
4. Verify conversational language

TEST 3: Apologetic tone (1★ review)
1. Navigate to pending review (1★)
2. Select tone: "Apologetic"
3. Generate response
4. Verify apologetic language + solution offered

Report: PASS/FAIL for each tone
```

**RB-CP-04: Response Publishing to Shopify**
```
Use Playwright to test publishing:

1. Navigate to drafted response
2. Edit response (change 1 word)
3. Click "Publish to Shopify"
4. Wait for success message
5. Verify review status changes to "Published"
6. Verify response appears on Shopify product page (external verification)

Report: PASS/FAIL with publish time
```

**RB-CP-05: Billing Upgrade Flow**
```
Use Playwright to test billing:

1. Navigate to /app/pricing
2. Verify all 4 tiers displayed (Free, Starter, Growth, Agency)
3. Click "Upgrade to Growth" ($49/mo)
4. Verify redirect to Shopify billing
5. On Shopify billing page, verify amount matches $49.00
6. Click "Approve charge" (test mode)
7. Verify redirect back to app
8. Verify plan badge shows "Growth"
9. Verify usage indicator shows "Unlimited"

Report: PASS/FAIL with billing confirmation
```

### Regression Tests

**RB-RG-01: Usage Limit Enforcement**
```
Test free tier limit (10 responses):

1. Create test shop on Free plan
2. Generate 10 responses (use bulk generation)
3. Attempt 11th response
4. Verify error message: "Monthly limit reached"
5. Verify upgrade prompt displayed
6. Click "Upgrade Now"
7. Verify redirects to pricing page

Report: PASS/FAIL
```

**RB-RG-02: Bulk Generation**
```
Test bulk response generation:

1. Select 5 pending reviews (checkboxes)
2. Click "Generate All" with Professional tone
3. Verify progress indicator shows 1/5, 2/5, etc.
4. Wait for completion (max 30 seconds)
5. Verify all 5 reviews have drafted responses
6. Verify all responses are appropriate

Report: PASS/FAIL with total time
```

**RB-RG-03: Brand Voice Customization**
```
Test custom brand voice:

1. Navigate to Settings
2. Enter brand voice: "We're a luxury boutique, formal and elegant"
3. Save settings
4. Generate response for 5★ review with Professional tone
5. Verify response uses sophisticated language
6. Compare with default response (without brand voice)

Report: PASS/FAIL with response comparison
```

### Performance Tests

**RB-PERF-01: Dashboard Load Time**
```
Measure dashboard performance:

1. Clear browser cache
2. Navigate to /app
3. Measure time to:
   - First Contentful Paint
   - DOM Content Loaded
   - Full Page Load
4. Target: <3 seconds

Report: Load times, PASS if <3s
```

**RB-PERF-02: AI Generation Latency**
```
Measure AI response times:

1. Generate 10 responses (various tones)
2. Record time for each
3. Calculate: min, max, average, p95
4. Target: <5 seconds average

Report: Latency stats, PASS if avg <5s
```

---

CREATE testing automation script:

```typescript
// apps/app-02-reviewboost/tests/run-e2e-suite.ts

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TESTS = [
  { id: 'RB-CP-01', name: 'OAuth & App Load' },
  { id: 'RB-CP-02', name: 'Review Sync' },
  { id: 'RB-CP-03', name: 'AI Generation (3 tones)' },
  { id: 'RB-CP-04', name: 'Response Publishing' },
  { id: 'RB-CP-05', name: 'Billing Upgrade' },
  { id: 'RB-RG-01', name: 'Usage Limits' },
  { id: 'RB-RG-02', name: 'Bulk Generation' },
  { id: 'RB-RG-03', name: 'Brand Voice' },
  { id: 'RB-PERF-01', name: 'Dashboard Performance' },
  { id: 'RB-PERF-02', name: 'AI Latency' },
];

async function runTestSuite() {
  console.log('🧪 ReviewBoost E2E Test Suite\n');
  
  const results = [];
  
  for (const test of TESTS) {
    console.log(`Running ${test.id}: ${test.name}...`);
    
    try {
      // Run Playwright test
      // Record result
      results.push({ ...test, status: 'PASS' });
      console.log(`✅ PASS\n`);
    } catch (error) {
      results.push({ ...test, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL: ${error.message}\n`);
    }
  }
  
  // Generate report
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`\n📊 Test Results: ${passed}/${TESTS.length} passed`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.id}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! Ready for deployment.');
  }
}

runTestSuite();
```

RUN full test suite:
```bash
npm run test:e2e
```

TARGET: 10/10 (100%) tests passing

## Task 2: Railway Production Deployment (2-3 hours)

REFERENCE: SHOPIFY_APP_DEVELOPMENT_GUIDE.md - Railway section

STEPS:

1. **Create Railway Project**
```bash
# Use Railway GraphQL API (not CLI)
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer YOUR_RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { projectCreate(input: { name: \"reviewboost-production\" }) { id } }"
  }'
```

2. **Add Services**
- PostgreSQL database
- Redis (for background jobs)
- reviewboost-web (main app)

3. **Configure Environment Variables**

Via Railway GraphQL API:
```bash
# Critical variables
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
SHOPIFY_APP_URL=https://reviewboost-production.up.railway.app
DATABASE_URL=postgresql://... # Railway provides
REDIS_URL=redis://... # Railway provides
ANTHROPIC_API_KEY=xxx
RESEND_API_KEY=xxx
NODE_ENV=production
```

4. **Connect GitHub Repository**
- Connect to apex-ecommerce-portfolio repo
- Set Root Directory: apps/app-02-reviewboost
- Set Build Command: npm run build
- Set Start Command: npm run start

5. **Deploy**
```bash
# Trigger deploy via GraphQL
curl -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation { serviceInstanceDeploy(serviceId: \"xxx\", environmentId: \"xxx\", latestCommit: true) }"
  }'
```

6. **Run Database Migration on Production**
```bash
# Via Railway CLI or web console
npx prisma migrate deploy
```

7. **Verify Production Deployment**
```bash
# Test endpoints
curl -I https://reviewboost-production.up.railway.app/app
# Expected: 410 (needs session)

curl -I https://reviewboost-production.up.railway.app/privacy
# Expected: 200 OK

curl -I https://reviewboost-production.up.railway.app/terms
# Expected: 200 OK

# Test OAuth flow (browser)
# Visit: https://reviewboost-production.up.railway.app/app?shop=test-store.myshopify.com
# Expected: Redirect to Shopify OAuth
```

VERIFY checklist:
- [ ] All environment variables set
- [ ] Database migrated successfully
- [ ] Privacy & Terms pages load (200 OK)
- [ ] OAuth redirect works (no 500 errors)
- [ ] Can install on test store
- [ ] Dashboard loads in <3 seconds
- [ ] Can sync reviews
- [ ] Can generate & publish responses

## Task 3: Shopify Partner Dashboard Configuration (1 hour)

UPDATE Partner Dashboard with production URLs:

1. **App URLs**
   - App URL: https://reviewboost-production.up.railway.app
   - Allowed redirection URL(s):
     * https://reviewboost-production.up.railway.app/auth/callback
     * https://reviewboost-production.up.railway.app/auth/shopify/callback

2. **GDPR Webhooks** (CRITICAL for App Store)
   - Customer data request: https://reviewboost-production.up.railway.app/webhooks/customers/data-request
   - Customer redaction: https://reviewboost-production.up.railway.app/webhooks/customers/redact
   - Shop redaction: https://reviewboost-production.up.railway.app/webhooks/shop/redact

3. **Webhook Subscriptions**
   - products/update → sync reviews
   - app/uninstalled → cleanup

4. **Test on Development Store**
   - Install from Partner Dashboard
   - Complete OAuth flow
   - Sync reviews
   - Generate & publish response
   - Verify billing works

## Task 4: App Store Assets (3-4 hours)

REFERENCE: SHOPIFY_APP_DEVELOPMENT_GUIDE.md - App Store compliance

CREATE required assets:

1. **App Icon (1200x1200 PNG)**
   - NO TEXT allowed on icon
   - Simple, recognizable design
   - Professional quality
   - ReviewBoost brand colors

2. **Screenshots (1600x900 PNG, 5 required)**
   - Screenshot 1: Dashboard with pending reviews
   - Screenshot 2: AI response generation (showing 3 tones)
   - Screenshot 3: Response editing & publishing
   - Screenshot 4: Usage analytics
   - Screenshot 5: Pricing tiers
   
   **CRITICAL RULES:**
   - NO unsubstantiated claims ("increase by 50%")
   - NO star ratings or review scores
   - NO promotional language in UI screenshots
   - Focus on features, not outcomes

3. **App Listing Copy**

**Short Description** (100 characters):
```
AI writes professional review responses. Save 2-4h/week responding to customers.
```

**Full Description** (4000 characters):
```
ReviewBoost AI helps Shopify merchants respond to product reviews automatically using artificial intelligence.

WHAT IT DOES:
• Syncs product reviews from your Shopify store
• Generates professional, personalized responses using AI
• Publishes responses back to your store with one click
• Saves 2-4 hours per week on review management

KEY FEATURES:
• AI Response Generation - Choose from 3 tones (Professional, Friendly, Apologetic)
• Bulk Operations - Generate responses for multiple reviews at once
• Brand Voice Customization - Train AI to match your brand's personality
• Sentiment Detection - Automatically flag negative reviews for priority
• Usage Analytics - Track response rate and customer engagement

HOW IT WORKS:
1. Install ReviewBoost and connect your store
2. Sync your existing product reviews
3. Select reviews and generate AI responses
4. Edit if needed, then publish to Shopify

PRICING:
• Free: 10 AI responses/month
• Starter ($19/mo): 100 responses/month
• Growth ($49/mo): Unlimited responses + bulk features
• Agency ($149/mo): Multi-store management

PERFECT FOR:
• Stores with active review programs
• Merchants who want to engage customers but lack time
• Agencies managing multiple Shopify stores

SUPPORT:
Email: support@reviewboost.app
Documentation: reviewboost.app/docs
```

4. **Privacy Policy & Terms** (Already created in Phase 0)
   - Verify live at /privacy and /terms
   - Update with actual contact email

5. **Demo Video** (Optional but recommended)
   - 90-second screen recording
   - Show: Install → Sync → Generate → Publish flow
   - Upload to YouTube, add link to App Store listing

## Task 5: App Store Submission (1-2 hours)

SUBMISSION CHECKLIST:

Pre-submission verification:
- [ ] E2E tests: 10/10 passing
- [ ] Production deployment: Live and stable
- [ ] GDPR webhooks: Registered and responding
- [ ] Privacy policy: Live at /privacy
- [ ] Terms of service: Live at /terms
- [ ] App icon: 1200x1200, no text
- [ ] Screenshots: 5 images, 1600x900, compliant
- [ ] Listing copy: No unsubstantiated claims
- [ ] Test install: Works on development store

SUBMIT via Shopify Partner Dashboard:

1. **App listing** → Edit listing
2. Upload all assets
3. Fill out all required fields
4. Select pricing model: "Merchant pays"
5. Add subscription plans (Free, Starter, Growth, Agency)
6. Review Shopify's content guidelines
7. Submit for review

EXPECTED TIMELINE:
- Review time: 5-7 business days
- Possible rejection reasons:
  * Unsubstantiated claims in copy/screenshots
  * Missing GDPR compliance
  * Broken OAuth flow
  * Poor app quality

IF REJECTED:
- Read rejection reason carefully
- Fix issues
- Update IMPLEMENTATION_LOG.md with lesson learned
- Resubmit

## Task 6: Monitoring & Alerting Setup (1-2 hours)

CREATE monitoring for production:

1. **Error Tracking**
```typescript
// app/utils/error-tracking.server.ts

export function logError(error: Error, context: any) {
  console.error('Application error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // Optional: Send to error tracking service (Sentry, etc.)
}
```

2. **Health Check Endpoint**
```typescript
// app/routes/api.health.tsx

export async function loader() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    const redis = getRedisClient();
    await redis.ping();
    
    return json({
      status: 'healthy',
      database: 'ok',
      redis: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return json({
      status: 'unhealthy',
      error: error.message,
    }, { status: 503 });
  }
}
```

3. **Uptime Monitoring**
- Use UptimeRobot or similar (free tier)
- Monitor: https://reviewboost-production.up.railway.app/api/health
- Alert: Email if down >5 minutes

4. **Usage Metrics**
```typescript
// Track key metrics
- Daily active users
- Responses generated per day
- API error rate
- Average response time
```

---

## PHASE 3 COMPLETION CHECKLIST

Final verification before going live:

- [ ] E2E tests: 10/10 (100%) passing
- [ ] Production deployment: Stable for 24+ hours
- [ ] Test store install: OAuth working, no 500 errors
- [ ] Review sync: Works for stores with 100+ reviews
- [ ] AI generation: All 3 tones appropriate
- [ ] Publishing: Successfully posts to Shopify
- [ ] Billing: All 4 plans working, upgrade smooth
- [ ] Usage limits: Enforced correctly
- [ ] GDPR webhooks: Responding with 200 OK
- [ ] Privacy/Terms: Live and accessible
- [ ] App Store assets: Compliant with guidelines
- [ ] Monitoring: Health check + alerting configured
- [ ] Documentation: Complete and accurate
- [ ] Performance: Dashboard <3s, generation <5s

---

## FINAL DOCUMENTATION

After Phase 3 completion:

1. UPDATE apps/app-02-reviewboost/IMPLEMENTATION_LOG.md:
```markdown
## Phase 3: Testing & Deployment - COMPLETE ✅

**Deployment Date**: [YYYY-MM-DD]
**Production URL**: https://reviewboost-production.up.railway.app
**App Store Status**: Submitted / Under Review / Approved

### Test Results
- E2E Suite: 10/10 (100%) PASS
- Performance: Dashboard <3s, AI <5s
- Load tested: 100 concurrent users

### Production Metrics (First 24h)
- Uptime: 100%
- Average response time: XXXms
- Error rate: 0.X%

### App Store Submission
- Submitted: [DATE]
- Review notes: [any special instructions]

### Lessons Learned
1. [key lesson from deployment]
2. [key lesson from testing]
3. [key lesson from App Store process]

### Next Steps (Post-Launch)
1. Monitor error logs daily
2. Collect user feedback
3. Track conversion metrics
4. Plan v1.1 features
```

2. UPDATE /mnt/project/APEX_PROJECT_STATUS.md:
```markdown
## App #2: ReviewBoost AI - STATUS

**Phase**: 🎉 LAUNCHED
**Build Time**: 14 days (as planned)
**Production URL**: https://reviewboost-production.up.railway.app
**App Store**: Submitted [DATE]

### Tech Stack
- Framework: Remix + Shopify App Remix
- Database: PostgreSQL (Railway)
- AI: Claude Haiku (cost efficient)
- Email: Resend
- Hosting: Railway

### Final Stats
- Lines of code: ~XXX
- Test coverage: 100% (Critical Path)
- Performance: Grade A
- Cost per response: $0.XXX

### Reusable Components (for App #3)
- ✅ OAuth flow (shopify.server.ts)
- ✅ Billing logic (billing.server.ts)
- ✅ GDPR webhooks
- ✅ Privacy/Terms pages
- ✅ Testing suite structure

### Timeline Actual vs Planned
- Phase 0: X hours (planned 4-6h)
- Phase 1: X hours (planned 5-7 days)
- Phase 2: X hours (planned 3-4 days)
- Phase 3: X hours (planned 2-3 days)
- **TOTAL**: XX days (target: 14 days)

### Lessons for App #3
1. [lesson]
2. [lesson]
3. [lesson]

### Next: App #3 Candidate
Based on APP_CANDIDATES_ANALYSIS.md:
- Option 1: PriceRounder (1.5 weeks, utility app)
- Option 2: BundleGenius AI (3 weeks, higher ceiling)
```

3. CREATE post-launch checklist:
```markdown
## Post-Launch Checklist

### Week 1
- [ ] Monitor logs daily for errors
- [ ] Respond to all support requests <4 hours
- [ ] Track metrics: installs, paid conversions
- [ ] Fix any critical bugs immediately

### Week 2-4
- [ ] Collect user feedback (in-app survey)
- [ ] Request reviews from satisfied users (target: 20 reviews)
- [ ] A/B test pricing (if conversion <3%)
- [ ] Content marketing: 1 blog post

### Month 2
- [ ] Analyze churn reasons
- [ ] Plan v1.1 features based on requests
- [ ] Partner outreach (Shopify agencies)
- [ ] Consider paid ads ($300 test budget)

### Month 3
- [ ] Evaluate success metrics vs goals
- [ ] Decision: Scale ReviewBoost or start App #3?
- [ ] Update APEX_FRAMEWORK.md with learnings
```

---

## BUILD COMPLETE! 🎉

When all 3 phases are done:

```
🎉 REVIEWBOOST AI - BUILD COMPLETE!

✅ Phase 0: Project Setup (X hours)
✅ Phase 1: Core MVP (X hours)  
✅ Phase 2: Billing & Polish (X hours)
✅ Phase 3: Testing & Deployment (X hours)

**TOTAL BUILD TIME**: XX days (vs 14 day target)

🚀 PRODUCTION STATUS:
- Live URL: https://reviewboost-production.up.railway.app
- Shopify App Store: Submitted [DATE]
- Test Coverage: 10/10 (100%)
- Performance: Grade A
- Monitoring: Active

📊 READY FOR USERS:
- Free tier: 10 responses/month (lead gen)
- Starter: $19/mo (100 responses)
- Growth: $49/mo (unlimited)
- Agency: $149/mo (multi-store)

📈 SUCCESS METRICS (90-day targets):
- Installs: 150
- Paid users: 15
- MRR: $900
- Reviews: 15+ (4.5★ avg)

🎯 NEXT STEPS:
1. Wait for App Store approval (5-7 days)
2. Beta test with 10 users
3. Gather feedback
4. Decide: Scale ReviewBoost or start App #3?

---

Documentation complete:
- ✅ IMPLEMENTATION_LOG.md (detailed build history)
- ✅ APEX_PROJECT_STATUS.md (portfolio tracker)
- ✅ README.md (setup guide)
- ✅ PROJECT_BRIEF.md (business requirements)

🎓 KEY LEARNINGS:
1. [biggest lesson from build]
2. [most challenging part]
3. [best time-saver from ConversionAI reuse]

Reusable code for App #3: ~70%
Estimated App #3 build time: 8-10 days (vs 14 for ReviewBoost)

---

Ready to start App #3, or want to focus on scaling ReviewBoost?

Type your decision.
```

---

END OF PHASE 3 PROMPT

END OF BUILD GUIDE
```

---

## Documentation Protocol

This section defines how Claude Code maintains project continuity.

### Automatic Documentation Triggers

Claude Code MUST update `IMPLEMENTATION_LOG.md` after:
1. ✅ Every completed task
2. ⚠️ Every blocker encountered (after 3 attempts)
3. 🎯 Every phase completion
4. 💡 Every significant learning/insight

### Documentation Template

```markdown
### [TIMESTAMP] - [TASK/PHASE NAME]

**Status**: ✅ DONE / ⚠️ BLOCKED / ❌ FAILED

**What was done**:
- [Specific action 1]
- [Specific action 2]

**Files modified**:
- `path/to/file.ts` (created/modified/deleted)

**Verification**:
- [ ] Build passing
- [ ] Tests passing  
- [ ] Manual test completed

**Performance**:
- Build time: XXs
- Test time: XXs

**Issues encountered**:
- [Issue description]
- [Resolution or workaround]

**Learnings**:
- [What worked well]
- [What could be improved]
- [Pattern to reuse/avoid]

**Next steps**:
1. [Immediate next task]
2. [Dependency for next task]
```

---

## Quality Gates

Claude Code must pass these gates before phase transitions:

### Phase 0 → Phase 1
- [ ] Build succeeds without errors
- [ ] Database migration successful
- [ ] Basic dashboard loads
- [ ] No TypeScript errors
- [ ] All critical files copied from ConversionAI

### Phase 1 → Phase 2
- [ ] Reviews sync from Shopify
- [ ] AI generates appropriate responses (all 3 tones)
- [ ] Responses publish to Shopify
- [ ] No console errors in browser
- [ ] E2E happy path works

### Phase 2 → Phase 3
- [ ] All 4 billing tiers functional
- [ ] Usage limits enforced
- [ ] Brand voice affects responses
- [ ] Email notifications send
- [ ] Dashboard <3s load time

### Phase 3 → Launch
- [ ] 10/10 E2E tests passing
- [ ] Production deployment stable
- [ ] GDPR webhooks responding
- [ ] App Store assets compliant
- [ ] Monitoring configured

---

## Self-Learning Protocol

Every 3 tasks, Claude Code pauses to reflect:

```
🧠 LEARNING CHECKPOINT

Tasks completed since last checkpoint:
1. [Task name]
2. [Task name]  
3. [Task name]

Patterns that worked:
- [Successful pattern]
- [Code structure that was clean]

Patterns to avoid:
- [Inefficiency discovered]
- [Code that caused issues]

Proposed improvements for remaining work:
1. [Suggestion with rationale]
2. [Suggestion with rationale]

Questions for human:
- [Clarification needed on...]

Continue with current approach or adjust?
```

---

## Emergency Protocols

### If Build Breaks
1. Document exact error in IMPLEMENTATION_LOG.md
2. Attempt 3 different solutions
3. If still broken after attempt 3:
   - Stop work
   - Document all 3 attempts
   - Ask human for guidance

### If API Fails
1. Log full error body (status, message, error object)
2. Check environment variables
3. Verify API key valid
4. Test with curl/Postman independently
5. Document findings in IMPLEMENTATION_LOG.md

### If Test Fails
1. Re-run test 3 times (rule out flakiness)
2. If still failing:
   - Screenshot failure state
   - Check browser console
   - Verify test data exists
   - Document in IMPLEMENTATION_LOG.md
   - Fix root cause, don't skip test

---

## Success Metrics

Track these throughout the build:

| Metric | Target | Actual |
|--------|--------|--------|
| Total build time | 14 days | TBD |
| Code reuse from ConversionAI | 60-70% | TBD |
| Test coverage (Critical Path) | 100% | TBD |
| E2E test pass rate | 100% | TBD |
| Dashboard load time | <3s | TBD |
| AI generation time | <5s | TBD |
| Cost per response | <$0.05 | TBD |
| Claude Code automation % | 90%+ | TBD |

---

## Project Complete Criteria

ReviewBoost AI is considered DONE when:

✅ All 3 phases complete  
✅ 10/10 E2E tests passing  
✅ Production deployed and stable  
✅ Shopify App Store submitted  
✅ Documentation complete:
  - IMPLEMENTATION_LOG.md
  - APEX_PROJECT_STATUS.md  
  - README.md
  - PROJECT_BRIEF.md
✅ Monitoring configured  
✅ Post-launch checklist created

---

**End of ReviewBoost AI Build Guide**

Use this document as the single source of truth for building ReviewBoost AI with Claude Code. Follow the phases sequentially, document thoroughly, learn continuously, and ship confidently.

Good luck! 🚀
