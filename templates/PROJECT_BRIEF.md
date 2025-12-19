# 📋 Project Brief: [APP NAME]

**Status**: 🔴 Not Started | 🟡 In Progress | 🟢 Launched  
**App ID**: app-XX-slug  
**Created**: YYYY-MM-DD  
**Target Launch**: YYYY-MM-DD  

---

## 🎯 Executive Summary

### One-Sentence Pitch
[Describe what the app does in ONE sentence]

### Problem Statement
[What pain point does this solve? Be specific.]

### Target Customer
- **Profile**: [e.g., "Shopify merchants selling physical products"]
- **Annual revenue**: [e.g., "$100K-$1M/year"]
- **Shop size**: [e.g., "500-5000 orders/month"]
- **Current solution**: [What do they use now?]

---

## 📊 Market Validation

### APEX Score
| Criterion | Score (1-10) | Weighted | Notes |
|-----------|--------------|----------|-------|
| Pain Intensity | X | X×3 | [Why this score?] |
| Market Size | X | X×2 | [TAM/SAM estimate] |
| Competition | X | X×2 | [Who are competitors?] |
| Tech Feasibility | X | X×2 | [Can Claude build it?] |
| Defensibility | X | X×1 | [Moat?] |
| **TOTAL** | - | **XX/100** | 🟢/🟡/🔴 |

### Market Size
- **TAM**: [Total addressable market]
- **SAM**: [Serviceable addressable market]
- **SOM (Year 1)**: [Realistic first-year target]

### Competition
| Competitor | Pricing | Rating | Installs | Weakness |
|------------|---------|--------|----------|----------|
| [Name] | $X/mo | X.X★ | ~X | [What they do poorly] |

---

## 💡 Product Specification

### Core Features (MVP)
1. **[Feature 1 Name]**
   - User story: As a merchant, I want to [X] so that [Y]
   - Success metric: [How do we measure success?]
   - Estimated effort: [X days]

2. **[Feature 2 Name]**
   - User story: ...
   - Success metric: ...
   - Estimated effort: ...

3. **[Feature 3 Name]**
   - User story: ...
   - Success metric: ...
   - Estimated effort: ...

### Out of Scope (For Later)
- [Feature that can wait]
- [Another nice-to-have]

---

## 🏗️ Technical Architecture

### Shopify Integration Points
- [ ] **OAuth**: Standard Shopify app authentication
- [ ] **Webhooks**: 
  - [ ] `orders/create`
  - [ ] `products/update`
  - [ ] `app/uninstalled`
- [ ] **App Extensions**:
  - [ ] Theme block: [Describe]
  - [ ] App proxy: [Describe]
- [ ] **Admin API Calls**:
  - [ ] `GET /admin/api/2024-01/products.json`
  - [ ] [Other endpoints]

### Database Schema (Prisma)
```prisma
model AppNameData {
  id        String   @id @default(cuid())
  shopId    String
  // ... app-specific fields
  
  shop      Shop     @relation(fields: [shopId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Third-Party Services (If Any)
- [ ] None (preferred)
- [ ] [Service name]: [Why needed? API limits?]

### Shared Packages Used
- [ ] `@apex/shared-auth`
- [ ] `@apex/shared-billing`
- [ ] `@apex/shared-ui`
- [ ] `@apex/shared-db`

---

## 💰 Business Model

### Pricing Tiers
```
FREE (Lead Magnet)
- [Limited feature]
- [Watermark/branding]
- Community support
- Goal: Reviews + upsell leads

BASIC — $X/month ($Y/year)
- [Unlimited feature]
- [Remove watermark]
- Email support
- Goal: Solo merchants

PRO — $X/month ($Y/year) ← HERO
- [Advanced features]
- Priority support
- Analytics
- Goal: Growing stores

ENTERPRISE — $X/month (custom)
- White-label
- API access
- Dedicated support
- Goal: High-volume
```

### Target Metrics (90 Days)
- Installs: [X]
- Free→Paid: [X%]
- MRR: $[X]
- Reviews: [X] @ [X.X]★

---

## 🚀 Go-to-Market

### Pre-Launch (2 weeks)
- [ ] Landing page + waitlist
- [ ] Beta testers: 50-100 signups
- [ ] Demo video (Loom)
- [ ] Documentation

### Launch Week
- [ ] Day 1: Beta launch
- [ ] Day 2-3: Feedback + fixes
- [ ] Day 4: Shopify App Store submission
- [ ] Day 5-7: Promotion (Reddit, Twitter, communities)

### Post-Launch (90 Days)
- [ ] Week 1-4: Obsess over first 20 reviews
- [ ] Week 5-8: Optimize conversion
- [ ] Week 9-12: Scale

---

## ⚠️ Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to prevent?] |
| [Risk 2] | High/Med/Low | High/Med/Low | [How to prevent?] |

---

## 📝 Development Log

### Week 1 (YYYY-MM-DD)
- [What did you build?]
- [Challenges encountered?]
- [Decisions made?]

### Week 2 (YYYY-MM-DD)
- ...

---

## 🎓 Lessons Learned

### What Worked
- [Add post-launch]

### What Didn't
- [Add post-launch]

### Next App: Do This
- [Add post-launch]

---

## 📎 Resources

- Figma/Design: [Link]
- Docs: [Link to documentation]
- Support: [Link to help center]
- App Store: [Link once published]

---

**Claude Code Instructions**:
```
Read this entire file before writing any code.
Start with: "I've read the PROJECT_BRIEF. Here's my understanding..."
Ask clarifying questions if anything is ambiguous.
Reference shared packages from /packages/ before writing new code.
Update this file as decisions are made.
```