# ReviewBoost AI - Project Brief

**App #2 in the APEX eCommerce Portfolio**

## Overview

ReviewBoost AI is an AI-powered Shopify app that helps merchants respond to product reviews professionally and efficiently. It syncs reviews from Shopify, generates AI responses using Claude, and publishes them back to the store.

## Problem Statement

Shopify merchants struggle to respond to product reviews consistently:
- Time-consuming to write personalized responses
- Difficult to maintain professional tone under stress (negative reviews)
- Inconsistent brand voice across responses
- Missed opportunities to engage customers and improve SEO

## Solution

ReviewBoost AI automates review response generation while keeping merchants in control:
1. **Sync** - Automatically fetch reviews from Shopify
2. **Analyze** - Detect sentiment (positive/neutral/negative)
3. **Generate** - Create AI response with selected brand voice
4. **Edit** - Allow merchant to modify before publishing
5. **Publish** - Post response back to Shopify

## Target Market

- Shopify merchants with product reviews
- Stores with 50+ reviews/month
- Brands that value customer engagement
- Merchants who want to improve SEO through review responses

## Pricing Model

| Plan | Price | Responses/Month | Features |
|------|-------|-----------------|----------|
| Free | $0 | 10 | Basic features |
| Starter | $19 | 100 | Custom brand voice |
| Growth | $49 | Unlimited | Bulk actions, templates |
| Agency | $149 | Unlimited | Multi-store, API access |

## Technical Stack

- **Framework**: Remix + @shopify/shopify-app-remix
- **Database**: PostgreSQL (Railway)
- **Queue**: Bull + Redis
- **AI**: Claude API (claude-3-haiku for cost efficiency)
- **Email**: Resend
- **Hosting**: Railway
- **UI**: Shopify Polaris

## MVP Features (Phase 1)

- [ ] Shopify OAuth integration
- [ ] Review sync from Shopify Product Reviews API
- [ ] Sentiment detection (positive/neutral/negative)
- [ ] AI response generation with brand voice selection
- [ ] Response editing before publish
- [ ] Publish response back to Shopify
- [ ] Usage tracking and limits
- [ ] Basic dashboard with stats

## Future Features (Phase 2+)

- Auto-publish for positive reviews
- Response templates
- Bulk actions
- Multi-language support
- Integration with Judge.me, Yotpo, etc.
- API for headless stores

## Success Metrics

- Install rate: >3% of app store visitors
- Free to Paid conversion: >5%
- Monthly churn: <5%
- App store rating: >4.5★

## Timeline

- **Week 1**: Core functionality (sync, generate, publish)
- **Week 2**: Billing integration + usage limits
- **Week 3**: UI polish + testing
- **Week 4**: App Store submission

## Dependencies

- Shopify Product Reviews API (or Judge.me/Yotpo API)
- Claude API (Anthropic)
- Railway (hosting)

## Risks

1. **Shopify native reviews API limitations** - May need to integrate with third-party review apps
2. **AI response quality** - Need good prompts and brand voice customization
3. **Rate limits** - Both Shopify API and Claude API have rate limits

## Notes

- Use claude-3-haiku for cost efficiency (~$0.01 per response)
- Cache synced reviews to reduce API calls
- Implement exponential backoff for API failures
