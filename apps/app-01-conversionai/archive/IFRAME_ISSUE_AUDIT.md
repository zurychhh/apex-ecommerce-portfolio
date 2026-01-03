# ConversionAI - Iframe Loading Issue Audit

**Data**: 2025-12-23
**Problem**: App nie ładuje się w iframe Shopify Admin
**Błąd**: "Serwer admin.shopify.com odrzucił połączenie"

---

## 1. OPIS PROBLEMU

Aplikacja ConversionAI jest widoczna na liście zainstalowanych aplikacji w Shopify Admin, ale po kliknięciu wyświetla błąd:

```
Serwer admin.shopify.com odrzucił połączenie
```

Iframe próbuje załadować aplikację, ale przeglądarka blokuje połączenie.

---

## 2. AKTUALNA KONFIGURACJA

### 2.1 Shopify App Configuration (shopify.app.conversionai.toml)

```toml
client_id = "30c5af756ea767c28f82092b98ffc9e1"
name = "conversionai"
application_url = "https://conversionai-web-production.up.railway.app"
embedded = true

[webhooks]
api_version = "2024-10"

[auth]
redirect_urls = [
  "https://conversionai-web-production.up.railway.app/auth/callback",
  "https://conversionai-web-production.up.railway.app/auth/shopify/callback",
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/shopify/callback"
]
```

### 2.2 Server Configuration (shopify.server.ts)

```typescript
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: ApiVersion.January25,  // ⚠️ January 2025
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(),
  distribution: AppDistribution.AppStore,  // ⚠️ AppStore distribution
  future: {
    unstable_newEmbeddedAuthStrategy: true,  // ⚠️ New embedded auth
    wrapBillingPageChargeRoute: true,
  },
});
```

### 2.3 Railway Environment Variables

| Variable | Value |
|----------|-------|
| SHOPIFY_API_KEY | 30c5af756ea767c28f82092b98ffc9e1 |
| SHOPIFY_API_SECRET | (set) |
| SHOPIFY_APP_URL | https://conversionai-web-production.up.railway.app |
| DATABASE_URL | (PostgreSQL on Railway) |
| REDIS_URL | (Redis on Railway) |
| NODE_ENV | production |

### 2.4 Shopify Partners App Version

- **Latest version**: conversionai-10
- **Released**: 2025-12-23
- **Deploy method**: `shopify app deploy --force`

---

## 3. CO DZIAŁA ✅

### 3.1 Railway Deployment
```bash
curl -I https://conversionai-web-production.up.railway.app
# HTTP/2 302 → redirects to /app
```

### 3.2 CSP Headers (Content-Security-Policy)
```bash
curl -I "https://conversionai-web-production.up.railway.app/app?shop=conversionai-development.myshopify.com"

# Zwraca prawidłowe nagłówki:
# content-security-policy: frame-ancestors https://conversionai-development.myshopify.com https://admin.shopify.com...
```

### 3.3 API Endpoints
| Endpoint | Status | Opis |
|----------|--------|------|
| `/` | 302 | Redirect to /app |
| `/app` | 410 | Expected (embedded app) |
| `/app?shop=xxx` | 410 + CSP | Headers correct |
| `/api/cron/weekly-refresh` | 200 | Working |

### 3.4 Build & Deployment
- `npm run build` - ✅ SUCCESS
- `npm run typecheck` - ✅ SUCCESS
- Railway auto-deploy - ✅ SUCCESS
- GitHub Actions CI - ✅ SUCCESS

---

## 4. CO NIE DZIAŁA ❌

### 4.1 Iframe Loading w Shopify Admin
- App nie ładuje się gdy otwierane z: `https://admin.shopify.com/store/conversionai-development/apps`
- Błąd: "Serwer admin.shopify.com odrzucił połączenie"

### 4.2 Auth Endpoint Returns 410
```bash
curl -s "https://conversionai-web-production.up.railway.app/auth?shop=conversionai-development.myshopify.com" -D -

# HTTP/2 410  ← Powinno być 302 redirect do Shopify OAuth!
# x-remix-catch: yes
```

---

## 5. PRÓBY NAPRAWY (WYKONANE)

| # | Działanie | Wynik |
|---|-----------|-------|
| 1 | Naprawiono webhook API version 2026-01 → 2024-10 | ✅ Wdrożone |
| 2 | Ustawiono SHOPIFY_APP_URL na Railway | ✅ Wdrożone |
| 3 | Utworzono entry.server.tsx z CSP headers | ✅ Wdrożone |
| 4 | Naprawiono lokalne TOML (localhost → Railway URL) | ✅ Wdrożone |
| 5 | Zsynchronizowano konfigurację z Partners (`shopify app deploy`) | ✅ Wdrożone |
| 6 | Wielokrotne redeploy na Railway | ✅ Wykonane |

---

## 6. POTENCJALNE PRZYCZYNY (NIESPRAWDZONE)

### 6.1 ⚠️ API Version Mismatch
- TOML: `api_version = "2024-10"`
- Code: `ApiVersion.January25` (2025-01)
- **Możliwy konflikt wersji API**

### 6.2 ⚠️ unstable_newEmbeddedAuthStrategy
- Ta flaga zmienia sposób działania OAuth
- Z tą flagą app zwraca 410 dla nieuwierzytelnionych requestów
- **Możliwe że OAuth flow nie inicjuje się poprawnie**

### 6.3 ⚠️ AppDistribution.AppStore
- Ustawione na `AppStore` zamiast `SingleMerchant` lub `ShopifyAdmin`
- **Możliwe że wymaga to innej konfiguracji dla dev store**

### 6.4 ⚠️ Session Storage / Database
- App używa `PrismaSessionStorage`
- **Możliwe że sesje nie są poprawnie zapisywane/odczytywane**

### 6.5 ⚠️ Reinstalacja aplikacji
- Stara instalacja może mieć cached/stale data
- **Możliwe że trzeba odinstalować i zainstalować ponownie**

---

## 7. SUGEROWANE DALSZE KROKI

### 7.1 Sprawdź w przeglądarce (DevTools)
1. Otwórz `https://admin.shopify.com/store/conversionai-development/apps`
2. Otwórz DevTools → Network tab
3. Kliknij na ConversionAI
4. **Sprawdź jaki URL próbuje załadować iframe**
5. **Sprawdź odpowiedź serwera (headers, body)**

### 7.2 Sprawdź Partners Dashboard
1. Idź do: https://partners.shopify.com → Apps → ConversionAI
2. **Sprawdź App URL w sekcji "App setup"**
3. **Sprawdź czy redirect URLs są prawidłowe**

### 7.3 Spróbuj reinstalacji
1. Odinstaluj app z dev store
2. Zainstaluj ponownie przez Partners "Test on development store"

### 7.4 Sprawdź z lokalnym dev
```bash
cd apps/app-01-conversionai
shopify app dev
```
- Czy app działa lokalnie?
- Czy OAuth flow działa?

### 7.5 Zmień konfigurację (do przetestowania)

**Opcja A: Wyłącz unstable_newEmbeddedAuthStrategy**
```typescript
future: {
  unstable_newEmbeddedAuthStrategy: false,  // zmiana
  wrapBillingPageChargeRoute: true,
},
```

**Opcja B: Zmień distribution**
```typescript
distribution: AppDistribution.SingleMerchant,  // zamiast AppStore
```

**Opcja C: Wyrównaj API version**
```typescript
apiVersion: ApiVersion.October24,  // zamiast January25
```

---

## 8. KLUCZOWE PLIKI DO SPRAWDZENIA

| Plik | Opis |
|------|------|
| `app/shopify.server.ts` | Główna konfiguracja Shopify |
| `app/entry.server.tsx` | CSP headers |
| `app/routes/auth.$.tsx` | OAuth route |
| `app/routes/app.tsx` | Main app route |
| `shopify.app.conversionai.toml` | App config dla Shopify CLI |

---

## 9. PRZYDATNE KOMENDY

```bash
# Sprawdź info o aplikacji
SHOPIFY_CLI_PARTNERS_TOKEN="atkn_xxx" shopify app info

# Deploy konfiguracji
SHOPIFY_CLI_PARTNERS_TOKEN="atkn_xxx" shopify app deploy --force

# Uruchom lokalnie
shopify app dev

# Sprawdź logi Railway
RAILWAY_TOKEN="d89e435b-d16d-4614-aa16-6b63cf54e86b" railway logs --service conversionai-web
```

---

## 10. LINKI

- **Railway Dashboard**: https://railway.app/project/c1ad5a4a-a4ff-4698-bf0f-e1f950623869
- **Shopify Partners**: https://partners.shopify.com (App: ConversionAI)
- **Dev Store Admin**: https://admin.shopify.com/store/conversionai-development
- **Production URL**: https://conversionai-web-production.up.railway.app
- **Shopify Docs (Embedded Auth)**: https://shopify.dev/docs/apps/build/authentication-authorization/app-bridge

---

## 11. KONTAKT SHOPIFY SUPPORT

Jeśli problem nie zostanie rozwiązany, skontaktuj się z Shopify Support:
- https://help.shopify.com/en/support
- Opisz: "Embedded app not loading in admin iframe, returns connection refused"
- Podaj: Client ID `30c5af756ea767c28f82092b98ffc9e1`
