# 🎯 APEX eCommerce Portfolio Framework
**Version**: 1.0.0 | **Last Updated**: 2025-01-20

## ⚡ Quick Start dla Claude Code

### Przed rozpoczęciem KAŻDEJ nowej aplikacji:

1. **Przeczytaj**: Ten dokument + `templates/PROJECT_BRIEF.md`
2. **Zduplikuj**: Template z `templates/shopify-remix-app/` do `apps/app-XX-nazwa/`
3. **Wypełnij**: `apps/app-XX-nazwa/PROJECT_BRIEF.md`
4. **Verify**: Checklist poniżej

---

## 🏗️ Architecture Principles

### 1. **Start Simple, Scale Later**
- MVP = 1-3 core features MAX
- Nie buduj "nice to have" w pierwszej iteracji
- 2-4 tygodnie od zera do deployed MVP

### 2. **Reuse Relentlessly**
- Zanim napiszesz nowy kod, sprawdź `packages/shared-*`
- Jeśli robisz coś po raz drugi → extract do shared package
- Cel: <30% unique code per app

### 3. **Document for Future You**
- PROJECT_BRIEF.md = source of truth
- Każdy commit message = why, not what
- Update lessons-learned.md co 2 tygodnie

---

## 🛠️ Tech Stack (Non-Negotiable)

### Shopify Apps
```yaml
Framework: Remix + @shopify/shopify-app-remix
Database: PostgreSQL (prod) / SQLite (dev)
ORM: Prisma
Hosting: Fly.io, Railway, Render
Auth: Shopify OAuth (via @shopify/shopify-app-remix)
Billing: Shopify Billing API
UI: Polaris (Shopify's design system)
```

### WooCommerce Plugins
```yaml
Language: PHP 8.1+
Framework: WordPress Plugin API
Database: WordPress wpdb
Testing: PHPUnit
Distribution: WordPress.org Plugin Repository
```

---

## 📋 Pre-Build Checklist

Przed pierwszą linijką kodu, odpowiedz na:

### Business Validation
- [ ] **Pain Score**: 7+/10? (Jak bardzo boli problem?)
- [ ] **Market Size**: 10,000+ potential customers?
- [ ] **Competition**: <5 direct competitors OR clear differentiation?
- [ ] **Monetization**: Subscription model possible?
- [ ] **Time to Value**: User sees value in <5 minutes?

### Technical Feasibility
- [ ] **API Availability**: Wszystkie potrzebne API są dostępne?
- [ ] **No External Dependencies**: Nie wymaga integracji z >2 third-party services?
- [ ] **Claude Code Friendly**: Można zbudować bez skomplikowanych algorytmów?
- [ ] **Maintenance**: <4h/tydzień na support po launch?

### Red Flags (Jeden = STOP)
- ❌ Wymaga real-time data synchronization
- ❌ Konkurent venture-backed z >$10M funding
- ❌ Shopify może to zbudować natywnie w 6 miesięcy
- ❌ Regulacje prawne (GDPR, CCPA, finanse)
- ❌ Potrzebujesz zespołu do utrzymania

---

## 🎨 Shared Components Library

### `packages/shared-ui/`
```typescript
// Gotowe komponenty (nie buduj od zera!)
- <PricingTable />
- <OnboardingWizard />
- <SettingsForm />
- <UsageStats />
- <SupportWidget />
```

### `packages/shared-auth/`
```typescript
// Shopify OAuth flow (skomplikowany, nie dotykaj)
- authenticateRequest()
- validateSession()
- handleCallback()
```

### `packages/shared-billing/`
```typescript
// Shopify Billing API wrapper
- createSubscription(plan: 'basic' | 'pro' | 'enterprise')
- checkActiveSubscription()
- handleUpgrade()
- handleDowngrade()
```

### `packages/shared-db/`
```prisma
// Shared Prisma models
model Shop {
  id String @id
  domain String @unique
  accessToken String
  // ... common fields
}

model Subscription {
  id String @id
  shopId String
  plan String
  status String
  // ... billing fields
}
```

---

## 📝 Naming Conventions

### Apps
```
app-[number]-[slug]/
Examples:
- app-01-review-mate
- app-02-price-rounder
- app-03-inventory-forecast
```

### Git Commits
```
[app-XX] feat: add feature description
[app-XX] fix: bug description
[shared] refactor: move auth to shared-auth
[docs] update: architecture decisions
```

### Database Tables
```
Prefix with app slug:
- review_mate_reviews
- price_rounder_rules
- inventory_forecast_predictions
```

---

## 🚀 Development Workflow

### Step 1: Initialize New App (10 min)
```bash
# 1. Copy template
cp -r templates/shopify-remix-app apps/app-XX-nazwa

# 2. Update PROJECT_BRIEF.md
cd apps/app-XX-nazwa
# Edit PROJECT_BRIEF.md

# 3. Install dependencies
npm install

# 4. Setup database
npx prisma migrate dev

# 5. Start dev server
npm run dev
```

### Step 2: Build MVP (2-4 weeks)
```
Week 1: Core functionality (1-3 features)
Week 2: Shopify integration + testing
Week 3: UI polish + error handling
Week 4: Documentation + beta testing
```

### Step 3: Deploy (1 day)
```bash
# Deploy to Fly.io
flyctl launch
flyctl deploy

# Submit to Shopify App Store
# (Follow apps/app-XX-nazwa/DEPLOYMENT.md)
```

---

## 📊 Success Metrics (Track from Day 1)

### Technical
- Build time: <4 weeks MVP
- Shared code %: >60%
- Test coverage: >70% (critical paths)
- Deploy time: <5 minutes

### Business
- Install rate: >3% (app store visitors → installs)
- Free→Paid: >3% (within 30 days)
- Churn: <5%/month
- Review rating: >4.5★
- Support tickets: <2% of users

---

## 🎓 Lessons Learned (Update After Each App)

### What Worked
- [Add after app #1 launch]

### What Didn't
- [Add after app #1 launch]

### Next Time Do This
- [Add after app #1 launch]

---

## 🆘 When Things Go Wrong

### Claude Code Struggles
1. Break down the task into smaller steps
2. Show examples from other apps in monorepo
3. Reference Shopify docs explicitly
4. Ask for explanation, not just code

### Deployment Issues
1. Check `docs/deployment.md`
2. Verify environment variables
3. Test locally with production mode
4. Check Fly.io/Railway logs

### Business Not Working
1. Re-read niche validation criteria
2. Talk to 10 real users
3. Consider pivot vs persist
4. Don't fall for sunk cost fallacy

---

## 📚 Essential Reading

### Before App #1
- [ ] Shopify App Docs: https://shopify.dev/docs/apps
- [ ] Remix Docs: https://remix.run/docs
- [ ] This framework (duh)

### Before App #2
- [ ] Your own lessons-learned.md
- [ ] Refactoring opportunities from app #1

### Every Month
- [ ] Shopify App Store trends
- [ ] Competitor analysis
- [ ] User feedback synthesis

---

## 💡 Pro Tips

1. **Start with Shopify**: Największy rynek, najlepsza dokumentacja
2. **Don't over-engineer**: MVP ≠ production-ready architecture
3. **Ship fast, learn faster**: 4 weeks max do pierwszych revenues
4. **Reuse ruthlessly**: Drugi app to 50% czasu pierwszego
5. **Document early**: Future You będzie wdzięczny

---

## 🔄 Framework Updates

Track framework improvements:
- v1.0.0 (2025-01-20): Initial version
- v1.1.0 (TBD): After app #1 launch
- v1.2.0 (TBD): After app #2 launch

---

**Remember**: Portfolio > Perfect. 5 "good enough" apps > 1 "perfect" app.

🎯 **Let's build.**