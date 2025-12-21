# Lessons Learned

This document tracks insights from building each app in the APEX portfolio.

## Purpose

- Document what worked and what didn't
- Speed up future app development
- Track metrics and improvements
- Share knowledge across apps

## Template

### App #X: [Name]
**Launch Date**: YYYY-MM-DD
**Status**: 🟢 Live | 🟡 In Progress | 🔴 Paused
**MRR Goal**: $X,XXX

**What Worked**:
- [Success 1]
- [Success 2]

**What Didn't**:
- [Challenge 1]
- [Challenge 2]

**Solutions/Workarounds**:
- [How we fixed Challenge 1]
- [How we fixed Challenge 2]

**Next Time**:
- [Improvement 1]
- [Improvement 2]

**Metrics**:
- Time to MVP: X weeks
- Code reuse: X%
- Lines of code: X,XXX
- Install rate: X%
- MRR (30 days): $X
- MRR (90 days): $X
- Churn rate: X%

**Technical Decisions**:
- [Decision 1 and why]
- [Decision 2 and why]

**Marketing Insights**:
- [What worked in marketing]
- [What didn't work]

---

## Apps

### App #1: ConversionAI

**Launch Date**: TBD (Infrastructure Ready: 2025-12-19)
**Status**: 🟢 Infrastructure Complete - Ready for Development
**MRR Goal**: $10K-15K Year 1

**What Worked**:
- Railway GraphQL API - pełna automatyzacja infrastruktury bez interakcji
- Shopify CLI `deploy --force` - aktualizuje konfigurację automatycznie
- GitHub `gh secret set` - ustawia secrets bez problemów
- Prisma `db push` - sync schematu do produkcji bez migracji

**What Didn't**:
- Railway CLI - wymaga interaktywnego logowania (rozwiązanie: użyj API)
- Shopify Partner API - nie można tworzyć apps (rozwiązanie: manual w Dashboard)
- Expect scripts dla Shopify CLI - niestabilne, prompty się zmieniają

**Solutions/Workarounds**:
- Railway: Używaj GraphQL API z Bearer token zamiast CLI
- Shopify: Utwórz app ręcznie, resztę automatyzuj przez CLI
- Database: `prisma db push` dla initial setup, migracje dla zmian

**Next Time**:
- Od razu używaj Railway GraphQL API
- Przygotuj client_id przed automatyzacją
- Użyj `shopify app deploy --force` bez prób automatyzacji promptów

**Metrics**:
- Time to Infrastructure: 1 session (~2 hours)
- Automated Steps: 13/14 (93%)
- Manual Steps: 1 (Shopify app creation)

**Technical Decisions**:
- Railway over Fly.io: All-in-one (app + PostgreSQL + Redis)
- Resend over SendGrid: Simpler API, generous free tier
- Claude Sonnet 4.5: Best quality/cost ratio for CRO recommendations

**Infrastructure Created**:
- Railway Project: `c1ad5a4a-a4ff-4698-bf0f-e1f950623869`
- PostgreSQL: `turntable.proxy.rlwy.net:50904`
- Redis: `mainline.proxy.rlwy.net:43368`
- Domain: `conversionai-web-production.up.railway.app`
- Shopify App: `client_id: 30c5af756ea767c28f82092b98ffc9e1`

---

## General Insights

### Code Reuse Patterns

**What's Most Reusable** (70%+):
- Authentication flow
- Billing/subscription logic
- Database models (Shop, Subscription)
- UI components (forms, tables, modals)
- Utility functions

**What's Least Reusable** (30%):
- App-specific business logic
- Custom API integrations
- Unique features

### Common Pitfalls

1. **Over-engineering**: Keep it simple, ship fast
2. **Premature optimization**: Optimize after you have users
3. **Scope creep**: Stick to PROJECT_BRIEF.md
4. **Ignoring user feedback**: Test with real merchants early

### Time-Saving Tips

1. **Copy-paste is OK**: Extract to shared after 2nd use
2. **Use existing libraries**: Don't reinvent the wheel
3. **Leverage AI**: ChatGPT/Copilot for boilerplate
4. **Test in dev store**: Catch bugs before production

### Marketing Learnings

[To be filled as apps launch]

### Pricing Strategies

[To be filled as we learn what works]

---

## Portfolio Metrics

Track across all apps:

| Metric | Target | Current |
|--------|--------|---------|
| Total MRR | $10K-50K | $0 |
| Active Apps | 5-10 | 0 |
| Total Installs | 1,000+ | 0 |
| Avg. Code Reuse | 60-70% | TBD |
| Avg. Time to MVP | 2-4 weeks | TBD |

---

## Resources

### Helpful Links
- [Shopify Dev Docs](https://shopify.dev)
- [Shopify Partner Community](https://community.shopify.com/c/Partners/ct-p/Partners)
- [Remix Docs](https://remix.run/docs)
- [Prisma Docs](https://www.prisma.io/docs)

### Tools We Use
- GitHub for version control
- Fly.io for hosting
- PostgreSQL for database
- Sentry for error tracking (TBD)
- Klaviyo/Shopify for marketing integrations

### Communities
- Shopify Partners Slack
- Indie Hackers
- Reddit: r/shopify, r/ecommerce

---

## Update Log

- **2025-12-19**: Repository structure created
- [Future updates as apps are built]
