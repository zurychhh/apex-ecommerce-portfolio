# 🎯 PROJECT BRIEF: ConversionAI

**App Name**: ConversionAI ✅ CONFIRMED  
**Target Platform**: Shopify App Store  
**Version**: 1.0.0 (MVP)  
**Created**: 2025-01-20  
**Updated**: 2025-01-20 (Tech stack decisions finalized)  
**Status**: 🟢 Ready to Build

---

## 📋 Executive Summary

**What**: AI-powered CRO consultant że analizuje Shopify store i dostarcza priorytetyzowane, actionable recommendations do zwiększenia conversion rate.

**For Whom**: Shopify merchants ($100K-$5M/rok revenue) którzy:
- Wiedzą że conversion rate może być lepszy
- Nie mają budżetu na agencję CRO ($2K-10K/miesiąc)
- Chcą konkretnych kroków, nie ogólnych porad
- Potrzebują ongoing optimization, nie one-time audit

**Problem**: 
- 87% merchantów nie wie dlaczego ich conversion rate jest niski
- CRO agencies są za drogie dla small/mid merchants
- Google daje overwhelmingly dużo informacji
- Shopify apps jak Hotjar pokazują DATA, ale nie mówią CO ZROBIĆ

**Solution**: 
AI assistant który w 60 sekund analizuje store i mówi DOKŁADNIE co zmienić, w jakiej kolejności, z code snippets i ROI estimates.

**Business Model**: Freemium → $29/$79/$199/mo  
**Target Year 1 MRR**: $10K-15K  
**Time to MVP**: 3-4 tygodnie

---

## 🎯 Success Metrics

### Business KPIs (Year 1)
| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Total Installs | 200 | 600 | 1,500 |
| Paying Customers | 10 | 60 | 150 |
| MRR | $500 | $4,000 | $12,000 |
| Churn Rate | <8% | <6% | <5% |
| App Rating | 4.5★+ | 4.7★+ | 4.8★+ |
| Free→Paid | 5% | 7% | 10% |

### Product KPIs
- Time to first recommendation: <90 seconds
- Recommendations quality score: 8+/10 (user rating)
- Recommendations implemented rate: >30%
- User reports conversion uplift: >60% users

---

## 🏗️ Product Architecture

### Phase 1: MVP - AI Recommendations (Weeks 1-4) ← **CURRENT FOCUS**

```
User Flow:
1. Install app from Shopify App Store
2. OAuth connection (read: products, orders, themes, analytics)
3. Onboarding: "What's your primary goal?" 
   - Increase overall conversion rate
   - Reduce cart abandonment
   - Increase AOV
   - Improve product page conversion
   - Boost mobile conversion
4. AI Analysis runs (60-90 seconds)
5. Dashboard shows 10-15 prioritized recommendations
6. User clicks recommendation → sees:
   - Problem explanation
   - Suggested solution
   - Code snippet (copy-paste)
   - Visual mockup (before/after)
   - Estimated impact
7. User marks as "Implemented" or "Skipped"
8. Weekly refresh → new recommendations
```

**Tech Stack**: ✅ FINALIZED
```yaml
Framework: Remix + @shopify/shopify-app-remix
Database: PostgreSQL (Railway)
AI: Claude API (Sonnet 3.5)
Screenshots: Playwright
Hosting: Railway
Queue: Bull (for async analysis jobs)
Storage: Railway Volume (for screenshots)
Email: Resend
```

**Database Schema (Prisma)**:
```prisma
model Shop {
  id            String   @id @default(cuid())
  domain        String   @unique
  accessToken   String
  plan          String   @default("free")
  primaryGoal   String?
  lastAnalysis  DateTime?
  createdAt     DateTime @default(now())
  
  recommendations Recommendation[]
  metrics        ShopMetrics[]
}

model Recommendation {
  id              String   @id @default(cuid())
  shopId          String
  shop            Shop     @relation(fields: [shopId], references: [id])
  
  title           String
  description     String
  category        String // "hero_cta", "pdp_layout", "cart_flow"
  impactScore     Int      // 1-5
  effortScore     Int      // 1-5
  estimatedUplift String   // "+0.3-0.5%"
  estimatedROI    String   // "+$2,100/mo"
  
  codeSnippet     String?
  mockupUrl       String?
  
  status          String   @default("pending") // pending, implemented, skipped
  implementedAt   DateTime?
  
  createdAt       DateTime @default(now())
}

model ShopMetrics {
  id                String   @id @default(cuid())
  shopId            String
  shop              Shop     @relation(fields: [shopId], references: [id])
  
  conversionRate    Float
  avgOrderValue     Float
  cartAbandonmentRate Float
  mobileConversionRate Float?
  
  recordedAt        DateTime @default(now())
}
```

**API Endpoints**:
```
POST /api/analysis/start
  → Triggers async analysis job
  
GET /api/recommendations
  → Returns paginated recommendations list
  
PATCH /api/recommendations/:id/status
  → Mark as implemented/skipped
  
GET /api/metrics/current
  → Current store metrics
  
POST /api/analysis/refresh
  → Trigger weekly refresh (cron job)
```

---

### Phase 2: Semi-Automated Testing (Months 4-6) ← **FUTURE**

**New Features**:
- User clicks "Test This" → app generates A/B test config
- **Manual implementation** but automated tracking
- App monitors Shopify Analytics API
- Automatically declares winner at statistical significance
- Sends email: "Test complete, Variant B won (+12.3%)"

**Tech Additions**:
- Statistical significance calculator
- Google Analytics 4 integration (optional)
- Shopify Analytics API polling

**User Flow**:
```
1. User sees recommendation
2. Clicks "Create A/B Test"
3. App generates test config:
   - Control vs Variant code
   - Traffic split: 50/50
   - Success metric: Add to cart rate
   - Min sample size: 2,000 sessions
4. User implements BOTH variants (still manual)
5. App tracks via Shopify Analytics
6. Auto-calculates statistical significance
7. Email when complete: "Winner is Variant B"
8. User switches to winning variant
```

---

### Phase 3: Fully Automated Testing (Months 9-12) ← **NORTH STAR**

**New Features**:
- **Theme App Extension** (injected by app)
- App can toggle variants without merchant touching code
- Automated implementation → monitoring → rollout
- Queue of tests runs automatically

**Requirements**:
- Shopify Theme App Extension (stable API)
- Visual regression testing (prevent broken layouts)
- Rollback mechanism
- Insurance/indemnification (legal)

**User Flow**:
```
1. User reviews test queue (AI-generated)
2. Approves tests with one click
3. App automatically:
   - Implements variants via Theme Extension
   - Runs test to statistical significance
   - Declares winner
   - Rolls out winning variant to 100%
   - Starts next test in queue
4. User receives weekly summary email
```

**Challenges to Solve Later**:
- Custom themes compatibility (1000s of variants)
- Checkout modifications (requires Shopify Plus)
- Visual QA automation
- Legal liability (if test breaks store)

---

## ✨ MVP Feature Set (Phase 1)

### Must Have (Weeks 1-4)

**1. Shopify OAuth & Connection** ✅
- Read permissions: products, orders, themes, analytics
- Handle session management
- Billing API integration (free tier + paid)

**2. AI Analysis Engine** 🎯
```typescript
async function analyzeStore(shop: Shop) {
  // 1. Fetch Shopify data
  const analytics = await getShopifyAnalytics(shop.id);
  const products = await getProducts(shop.id);
  const theme = await getCurrentTheme(shop.id);
  
  // 2. Take screenshots
  const screenshots = await captureScreenshots([
    `${shop.domain}`,
    `${shop.domain}/products/${topProduct.handle}`,
    `${shop.domain}/cart`
  ]);
  
  // 3. Scrape competitors (if identifiable)
  const competitors = await findCompetitors(shop.primaryCategory);
  
  // 4. Claude API analysis
  const prompt = buildAnalysisPrompt({
    goal: shop.primaryGoal,
    currentMetrics: analytics,
    products: products.slice(0, 5),
    screenshots: screenshots,
    competitors: competitors,
    industryBenchmarks: getIndustryBenchmarks(shop.category)
  });
  
  const aiResponse = await claude.messages.create({
    model: "claude-sonnet-3-5-20241022",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: prompt
    }]
  });
  
  // 5. Parse & prioritize recommendations
  return parseAndPrioritize(aiResponse.content);
}
```

**3. Recommendations Dashboard** 📊
- List view z sortowaniem (Impact, Effort, ROI)
- Card dla każdej recommendation:
  - Title & description
  - Impact stars (⭐⭐⭐⭐⭐)
  - Effort wrenches (🔧🔧🔧)
  - Estimated uplift
  - "View Details" → modal z:
    - Full explanation
    - Code snippet (syntax highlighted)
    - Before/After mockup
    - Implementation guide (3-5 steps)
  - Actions: "Mark Implemented", "Skip", "Need Help"

**4. Onboarding Flow** 🚀
- Step 1: "Welcome! Let's analyze your store"
- Step 2: "What's your primary goal?" (dropdown)
- Step 3: "Analyzing... (progress bar with fun messages)
- Step 4: "Done! Here are your recommendations"

**5. Billing & Plans** 💳
```yaml
FREE:
  - 1 analysis per month
  - 5 recommendations
  - Email support

BASIC ($29/mo):
  - Weekly analysis
  - Unlimited recommendations
  - 3 competitor tracking
  - Email support
  
PRO ($79/mo):
  - Daily analysis
  - Competitor tracking (unlimited)
  - Industry benchmarks
  - Priority support
  - ROI calculator
  
ENTERPRISE ($199/mo):
  - Multi-store management
  - White-label reports
  - API access
  - Dedicated support
```

**6. Email Notifications** 📧
- Weekly: "New recommendations ready"
- Monthly: "Your metrics this month"
- Milestone: "You've implemented 10 recommendations! 🎉"

---

### Nice to Have (Post-MVP)

**Phase 1.5 (Weeks 5-8)**:
- [ ] Competitor tracking dashboard
- [ ] Industry benchmark charts
- [ ] Implementation video tutorials (Loom embeds)
- [ ] "Quick Wins" filter (show easy + high impact first)
- [ ] Mobile app preview (for mobile-specific tests)
- [ ] Shopify Expert referral program (if user needs help implementing)

**Phase 2 (Months 4-6)**: Semi-automated testing (outlined above)

**Phase 3 (Months 9-12)**: Fully automated testing (north star)

---

## 🎨 UI/UX Mockup References

### Dashboard Layout
```
┌─────────────────────────────────────────────────────┐
│ 🎯 ConversionAI         [Pro Plan] [Settings] [?]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📊 Current Metrics               🎯 Primary Goal    │
│ Conversion Rate: 2.3%            Increase CR       │
│ Industry Avg: 2.8% ↗️            Last Analysis: 2d ago│
│ Opportunity: +$3,400/mo          [Run New Analysis] │
│                                                      │
├─────────────────────────────────────────────────────┤
│ 💡 Recommendations (12)          Sort: [Impact ▼]   │
│                                                      │
│ ⭐⭐⭐⭐⭐ 🔧🔧 [URGENT]                              │
│ Change Hero CTA from "Buy Now" to "Explore"        │
│ Est. Impact: +0.4% CR (+$2,100/mo)                 │
│ [View Details] [Mark Implemented] [Skip]           │
│                                                      │
│ ⭐⭐⭐⭐ 🔧🔧🔧                                       │
│ Add trust badges above "Add to Cart" button        │
│ Est. Impact: +0.3% CR (+$1,800/mo)                 │
│ [View Details] [Mark Implemented] [Skip]           │
│                                                      │
│ ⭐⭐⭐ 🔧🔧                                          │
│ Reduce product image size on mobile (faster load)  │
│ Est. Impact: +0.2% mobile CR (+$900/mo)            │
│ [View Details] [Mark Implemented] [Skip]           │
│                                                      │
│ [Load More...]                                      │
└─────────────────────────────────────────────────────┘
```

### Recommendation Detail Modal
```
┌───────────────────────────────────────────────────┐
│ 🎯 Recommendation #1                        [✕]  │
├───────────────────────────────────────────────────┤
│                                                    │
│ Change Hero CTA from "Buy Now" to "Explore"      │
│                                                    │
│ 📊 Impact: ⭐⭐⭐⭐⭐                              │
│ 🔧 Effort: 🔧🔧 (Low - 10 minutes)                │
│ 💰 Est. ROI: +$2,100/month                        │
│                                                    │
│ 🤔 Why This Matters:                               │
│ 82% of your homepage visitors are first-time.     │
│ "Buy Now" is too aggressive - they need context.  │
│                                                    │
│ Your hero says: "Buy Now"                         │
│ 4 out of 5 competitors say: "Shop Collection"     │
│                                                    │
│ 📸 Before → After                                  │
│ [Image: Current hero] [Image: Suggested hero]     │
│                                                    │
│ 💻 Implementation (3 steps):                       │
│                                                    │
│ 1. Open: Themes > Edit Code                       │
│ 2. Find: sections/hero.liquid (line 42)           │
│ 3. Replace this code:                              │
│                                                    │
│    ```liquid                                       │
│    <button class="hero-cta">                       │
│      {{ section.settings.button_text }}           │
│    </button>                                       │
│    ```                                             │
│                                                    │
│    With this:                                      │
│                                                    │
│    ```liquid                                       │
│    <button class="hero-cta">                       │
│      Explore Collection                            │
│    </button>                                       │
│    ```                                             │
│                                                    │
│ [Copy Code]                                        │
│                                                    │
│ 📹 Video Guide: [Watch 2-min tutorial]            │
│                                                    │
│ ❓ Need Help?                                      │
│ [Hire Shopify Expert] [Ask in Community]          │
│                                                    │
│ [Mark as Implemented] [Skip This] [Test This]🔒   │
│                                   (Pro feature)     │
└───────────────────────────────────────────────────┘
```

---

## 🤖 Claude API Prompt Engineering

### Analysis Prompt Template

```typescript
const ANALYSIS_PROMPT = `You are an expert CRO (Conversion Rate Optimization) consultant analyzing a Shopify store.

STORE INFORMATION:
- Domain: ${shop.domain}
- Primary Goal: ${shop.primaryGoal}
- Current Conversion Rate: ${metrics.conversionRate}%
- Industry Average: ${benchmarks.avgConversion}%
- Average Order Value: $${metrics.avgOrderValue}
- Cart Abandonment Rate: ${metrics.cartAbandonment}%
- Mobile Traffic: ${metrics.mobilePercentage}%

VISUAL ANALYSIS:
I've captured screenshots of:
1. Homepage hero section
2. Top-selling product page
3. Cart page

[Images attached via Vision API]

COMPETITOR COMPARISON:
Top 3 competitors in this niche:
${competitors.map(c => `- ${c.name}: ${c.heroCTA}, ${c.trustBadges}`).join('\n')}

TASK:
Generate 10-15 prioritized, actionable recommendations to achieve the goal: "${shop.primaryGoal}".

For EACH recommendation, provide:

1. **title**: Clear, action-oriented (e.g., "Change hero CTA from X to Y")
2. **category**: One of [hero_section, product_page, cart_page, checkout, mobile, trust_building, social_proof, urgency, pricing, navigation]
3. **description**: 2-3 sentences explaining the problem and solution
4. **impactScore**: 1-5 (how much this will move the needle)
5. **effortScore**: 1-5 (how hard to implement, 1=easy, 5=complex)
6. **estimatedUplift**: Range like "+0.3-0.5% conversion rate"
7. **estimatedROI**: Monthly revenue impact like "+$2,100-3,500/mo"
8. **reasoning**: Why this matters (data-driven, reference competitors or benchmarks)
9. **implementation**: Step-by-step guide (3-5 bullet points)
10. **codeSnippet**: Exact Liquid/HTML/CSS code to copy-paste (if applicable)

PRIORITIZATION LOGIC:
- Quick wins first (high impact, low effort)
- Address the PRIMARY GOAL directly
- Reference industry benchmarks when suggesting changes
- Be specific (not "improve CTA" but "change CTA from 'Buy Now' to 'Shop Best Sellers'")

OUTPUT FORMAT: JSON array of recommendations.

CRITICAL: Focus ONLY on changes that directly impact the primary goal. No generic advice. Every recommendation must be:
1. Specific to THIS store
2. Backed by data/competitor analysis
3. Implementable in <30 minutes
4. Measurable impact`;
```

### Response Parsing
```typescript
function parseClaudeResponse(response: string): Recommendation[] {
  const json = JSON.parse(response);
  
  return json.recommendations.map((rec: any) => ({
    title: rec.title,
    category: rec.category,
    description: rec.description,
    impactScore: rec.impactScore,
    effortScore: rec.effortScore,
    estimatedUplift: rec.estimatedUplift,
    estimatedROI: rec.estimatedROI,
    reasoning: rec.reasoning,
    implementation: rec.implementation,
    codeSnippet: rec.codeSnippet || null,
    priority: calculatePriority(rec.impactScore, rec.effortScore)
  }));
}

function calculatePriority(impact: number, effort: number): number {
  // High impact + low effort = highest priority
  return (impact * 2) - effort;
}
```

---

## 🚀 Development Roadmap (3 Weeks - Full-Time)

### Week 1: Foundation & Core Logic
**Monday-Tuesday: Foundation**
- [ ] Railway setup (app, PostgreSQL, Redis)
- [ ] Shopify app scaffold (@shopify/shopify-app-remix template)
- [ ] Database schema (Prisma)
- [ ] OAuth flow
- [ ] Basic dashboard (Polaris components)

**Wednesday-Friday: Core Logic**
- [ ] Shopify data fetching (Analytics API, Products API, Themes API)
- [ ] Screenshot automation (Playwright setup)
- [ ] Claude API integration
- [ ] Analysis job queue (Bull + Redis)
- [ ] Prompt engineering & testing

### Week 2: UI/UX & Features
**Monday-Wednesday: UI**
- [ ] Onboarding flow
- [ ] Recommendations dashboard
- [ ] Recommendation detail modal
- [ ] Code snippet syntax highlighting

**Thursday-Friday: Business Logic**
- [ ] Billing integration (Shopify Billing API)
- [ ] Resend email notifications
- [ ] User action tracking (implemented/skipped)

### Week 3: Polish, Test & Deploy
**Monday-Tuesday: Polish**
- [ ] Error handling & edge cases
- [ ] Loading states & animations
- [ ] Mobile responsiveness
- [ ] Security audit

**Wednesday-Thursday: Beta Testing**
- [ ] Deploy to Railway staging
- [ ] Recruit 5-10 beta testers (r/shopify)
- [ ] Collect feedback
- [ ] Fix critical bugs
- [ ] Refine AI prompts based on real data

**Friday: Production Deploy**
- [ ] Final QA
- [ ] Deploy to Railway production
- [ ] Submit to Shopify App Store
- [ ] Prepare marketing materials

### Week 4+: Launch & Iterate
- Submit to Shopify App Store (approval takes 3-5 days)
- Soft launch to beta users
- Marketing push (Reddit, Twitter, Product Hunt)
- Monitor metrics and iterate

---

## 📊 Measurement & Analytics

### Track in Database
```sql
-- User behavior
- Recommendations viewed
- Recommendations marked as implemented
- Recommendations skipped
- Time spent on each recommendation
- Code copied (via click tracking)

-- Business metrics
- Free → Paid conversion
- Time to first paid plan
- Churn events
- Feature usage by plan tier
```

### Dashboards to Build (Internal)
1. **Cohort Analysis**: Free install → Paid conversion by week
2. **Recommendation Performance**: Which recommendations have highest implementation rate?
3. **AI Quality**: User ratings on recommendations (add "👍 👎" buttons)
4. **Revenue Analytics**: MRR, churn, expansion revenue

### Customer Success Indicators
- User implemented >3 recommendations = likely to convert
- User rated recommendations 4-5 stars = promoter
- User hasn't returned in 14 days = churn risk (send email)

---

## 💰 Financial Projections (Conservative)

### Year 1 (Month by Month)

| Month | Installs | Paying | MRR | Costs | Profit |
|-------|----------|--------|-----|-------|--------|
| 1 | 20 | 1 | $79 | $200 | -$121 |
| 2 | 50 | 3 | $237 | $250 | -$13 |
| 3 | 100 | 10 | $580 | $300 | +$280 |
| 4 | 200 | 25 | $1,625 | $400 | +$1,225 |
| 5 | 350 | 45 | $3,105 | $500 | +$2,605 |
| 6 | 500 | 70 | $4,970 | $600 | +$4,370 |
| 7 | 700 | 95 | $6,935 | $700 | +$6,235 |
| 8 | 900 | 120 | $8,900 | $800 | +$8,100 |
| 9 | 1,100 | 145 | $10,865 | $900 | +$9,965 |
| 10 | 1,300 | 170 | $12,830 | $1,000 | +$11,830 |
| 11 | 1,400 | 180 | $13,780 | $1,100 | +$12,680 |
| 12 | 1,500 | 190 | $14,730 | $1,200 | +$13,530 |

**Assumptions**:
- Free→Paid: 7% average
- Avg MRR per paying customer: $75 (mix of $29/$79/$199)
- Churn: 6%/month average
- **Costs breakdown**:
  - Railway: $5-20/mo (app + DB + Redis, scales with usage)
  - Claude API: $50-300/mo (depends on analysis volume)
  - Resend: $0/mo (free tier 3K emails/mo, later $20/mo)
  - Domain + tools: $20-50/mo
  - **Total**: $75-370/mo (starts low, scales with users)

**Year 1 Total**: ~$13K-15K MRR by December

---

## ⚠️ Risks & Mitigation

### High-Priority Risks

**1. AI Recommendations Are Wrong/Harmful**
- **Risk**: AI suggests change that tanks conversion
- **Probability**: Medium
- **Impact**: Critical (bad reviews, churn)
- **Mitigation**:
  - Clear disclaimer: "Test recommendations on low-traffic pages first"
  - User rating system (👍👎) → bad recommendations get hidden
  - Human review of first 100 recommendations
  - Rollback instructions in every recommendation

**2. Claude API Costs Spiral**
- **Risk**: $0.50-2.00 per analysis × 1000 users/month = $500-2000
- **Probability**: High
- **Impact**: Medium (eats into profit)
- **Mitigation**:
  - Cache analyses (refresh weekly, not on-demand)
  - Rate limiting (1 analysis per 7 days on free plan)
  - Prompt optimization (reduce tokens)
  - Consider cheaper models for specific tasks

**3. Merchants Don't Implement Recommendations**
- **Risk**: Users see value but don't act → don't convert to paid
- **Probability**: High
- **Impact**: High
- **Mitigation**:
  - Make it STUPID easy (1-click copy code)
  - Video tutorials (Loom)
  - "Quick wins" filter (show easy stuff first)
  - Gamification (badges for implemented recs)
  - Offer "Done for you" service (affiliate Shopify Experts)

**4. Competition Copies Idea**
- **Risk**: Bigger player (Lucky Orange, Hotjar) adds AI recommendations
- **Probability**: Medium (6-12 months)
- **Impact**: Medium
- **Mitigation**:
  - Speed to market (first mover advantage)
  - Better AI prompts (proprietary, refined over time)
  - Tighter integration with Shopify
  - Focus on Shopify specifically (they're generic)
  - Build community/brand

---

## 🎯 Go-to-Market Strategy

### Pre-Launch (Week -2 to 0)

**1. Landing Page**
- Headline: "CRO Agency Expertise at $29/Month. Powered by AI."
- Subheadline: "Get 10-15 prioritized recommendations to boost your conversion rate in 60 seconds"
- Social proof: "Trusted by 100+ beta testers" (after beta)
- CTA: "Start Free Analysis"
- Collect emails for waitlist

**2. Beta Testing**
- Recruit 20-30 stores from:
  - r/shopify ("I built a free CRO tool, need beta testers")
  - Shopify Partner Slack communities
  - Twitter/X outreach
- Give free Pro access for 60 days
- Ask for testimonials + case studies

**3. Content**
- Blog post: "10 CRO Mistakes Every Shopify Store Makes"
- YouTube video: "I analyzed 100 Shopify stores. Here's what I learned."
- Tweet thread: Behind-the-scenes of building with Claude Code

### Launch Week (Week 1)

**Day 1**: Soft launch to beta users
- Email: "Beta is over. Here's your discount code (50% off first 3 months)"

**Day 2-3**: Submit to Shopify App Store
- App listing optimized for SEO
- Screenshots, video demo
- Description emphasizing AI + affordability

**Day 4**: Social media blitz
- r/shopify post
- r/ecommerce post
- Twitter thread with demo video
- Product Hunt (optional, depends on readiness)

**Day 5-7**: Outreach
- Message 50 Shopify influencers/YouTubers
- Offer free Pro account in exchange for honest review
- Partner with Shopify agencies (affiliate commission)

### Post-Launch (Month 1-3)

**Content Marketing**:
- Weekly blog post (SEO optimized):
  - "How to Reduce Cart Abandonment (10 Proven Tactics)"
  - "Product Page Conversion Rate Benchmarks by Industry"
  - "Mobile CRO Checklist for Shopify Stores"
- Guest posts on ecommerce blogs

**Community Building**:
- Create Facebook group "Shopify CRO Hacks"
- Weekly "CRO office hours" (free advice)
- Share user wins (with permission)

**Paid Acquisition** (Month 3+):
- Google Ads: "shopify conversion optimization"
- Facebook Ads: Targeting Shopify store owners
- Budget: $500-1000/month
- Target CPA: <$50

---

## 🛠️ Technical Architecture (Detailed)

### Stack ✅ FINALIZED
```yaml
Frontend:
  - Remix 2.x
  - @shopify/polaris (UI components)
  - TypeScript
  - TailwindCSS (for custom styles outside Polaris)

Backend:
  - Remix (same app, API routes)
  - Prisma ORM
  - PostgreSQL (Railway)
  - Bull (job queue)
  - Redis (Railway built-in)

External Services:
  - Claude API (Anthropic)
  - Playwright (screenshots)
  - Shopify Admin API
  - Shopify Analytics API
  - Resend (emails)
  - Railway Volume (screenshot storage)

Hosting:
  - Railway (all-in-one: app, DB, Redis, volumes)

Monitoring:
  - Sentry (error tracking)
  - LogRocket (session replay - optional)
  - Mixpanel (product analytics)
```

### Key Files Structure
```
apps/app-01-conversionai/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx              # Dashboard
│   │   ├── app.recommendations._index.tsx
│   │   ├── app.recommendations.$id.tsx  # Detail modal
│   │   ├── app.analysis.start.tsx      # Trigger analysis
│   │   ├── app.settings.tsx
│   │   └── api/
│   │       ├── analysis.start.ts       # POST analysis job
│   │       ├── recommendations.ts      # GET list
│   │       └── webhooks.shopify.ts     # Shopify webhooks
│   ├── jobs/
│   │   ├── analyzeStore.ts             # Main analysis logic
│   │   ├── captureScreenshots.ts
│   │   └── callClaudeAPI.ts
│   ├── utils/
│   │   ├── shopify.server.ts           # Shopify API helpers
│   │   ├── claude.server.ts            # Claude API wrapper
│   │   └── metrics.server.ts           # Calculate metrics
│   └── components/
│       ├── RecommendationCard.tsx
│       ├── RecommendationDetailModal.tsx
│       ├── MetricsDashboard.tsx
│       └── OnboardingWizard.tsx
├── prisma/
│   └── schema.prisma
├── public/
└── package.json
```

### Analysis Job Flow
```typescript
// jobs/analyzeStore.ts
export async function analyzeStore(shopId: string) {
  try {
    // 1. Fetch data from Shopify
    const shop = await prisma.shop.findUnique({ where: { id: shopId }});
    const analytics = await fetchShopifyAnalytics(shop);
    const products = await fetchProducts(shop);
    const theme = await fetchCurrentTheme(shop);
    
    // 2. Capture screenshots
    const screenshots = await captureScreenshots(shop.domain, [
      '/',
      `/products/${products[0].handle}`,
      '/cart'
    ]);
    
    // 3. Find competitors (optional, best-effort)
    const competitors = await findCompetitors(shop);
    
    // 4. Build prompt
    const prompt = buildAnalysisPrompt({
      shop,
      analytics,
      products: products.slice(0, 5),
      screenshots,
      competitors
    });
    
    // 5. Call Claude API
    const claudeResponse = await callClaudeAPI(prompt, screenshots);
    
    // 6. Parse response
    const recommendations = parseRecommendations(claudeResponse);
    
    // 7. Save to database
    await prisma.recommendation.createMany({
      data: recommendations.map(rec => ({
        shopId: shop.id,
        ...rec,
        status: 'pending'
      }))
    });
    
    // 8. Update shop
    await prisma.shop.update({
      where: { id: shopId },
      data: { lastAnalysis: new Date() }
    });
    
    // 9. Send email notification
    await sendEmail(shop.email, 'Your CRO analysis is ready!');
    
  } catch (error) {
    // Log to Sentry
    console.error('Analysis failed:', error);
    throw error;
  }
}
```

---

## ✅ Tech Stack Decisions (FINALIZED)

All critical decisions made on 2025-01-20:

1. **App Name**: ConversionAI ✅
2. **Hosting**: Railway (all-in-one platform) ✅
3. **Database**: Railway PostgreSQL ✅
4. **Email Service**: Resend (3K emails/mo free tier) ✅
5. **Budget**: $0-50/mo initially, scaling with revenue ✅
6. **Time Commitment**: Full-time (40h/week) → 3-week MVP timeline ✅

### Railway Advantages (Why We Chose It)
- ✅ All-in-one: App + PostgreSQL + Redis in one platform
- ✅ Simple pricing: Pay for what you use, starts ~$5/mo
- ✅ Great DX: Deploy from GitHub, auto-deploys on push
- ✅ Built-in monitoring and logs
- ✅ Volume storage for screenshots (no S3 needed)
- ✅ Generous free trial ($5 credit)

### Cost Breakdown (Expected)
**Month 1-3** (low traffic):
- Railway: $5-10/mo (app + DB + Redis)
- Claude API: $20-50/mo (50-200 analyses)
- Resend: $0/mo (free tier)
- Domain: $10/year
- **Total**: ~$25-60/mo

**Month 6+** (scaling):
- Railway: $15-30/mo
- Claude API: $100-200/mo (500+ analyses)
- Resend: $20/mo (10K+ emails)
- **Total**: ~$135-250/mo

---

## 🎬 Ready to Build!

**Status**: 🟢 ALL DECISIONS MADE - READY FOR CLAUDE CODE

**Next Immediate Step**: 
Claude Code will initialize the project structure in `apps/app-01-conversionai/` and begin Week 1 implementation.

**Estimated MVP Launch**: 3 weeks from start (mid-February 2025)

Let's ship this! 🚀
