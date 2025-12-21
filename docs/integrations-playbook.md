# 🔧 Integrations Playbook

**Version**: 1.0.0 | **Last Updated**: 2025-12-19

Ten dokument zawiera sprawdzone procedury automatyzacji infrastruktury dla aplikacji APEX. Każda nowa aplikacja powinna korzystać z tych skryptów i wzorców.

---

## 📋 Spis Treści

1. [Railway Setup](#1-railway-setup)
2. [Shopify App Setup](#2-shopify-app-setup)
3. [GitHub Actions CI/CD](#3-github-actions-cicd)
4. [Claude AI Integration](#4-claude-ai-integration)
5. [Resend Email Setup](#5-resend-email-setup)
6. [Prisma Database](#6-prisma-database)
7. [Full Automation Script](#7-full-automation-script)

---

## 1. Railway Setup

### Wymagane Tokeny
```bash
RAILWAY_TOKEN="your-railway-token"
```

### Automatyczne Tworzenie Projektu (via GraphQL API)

```bash
# 1. Utwórz projekt
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { projectCreate(input: { name: \"app-name\" }) { id } }"
  }'

# Zapisz PROJECT_ID z odpowiedzi
```

### Tworzenie Usług

```bash
# 2. PostgreSQL
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { serviceCreate(input: { name: \"postgresql\", projectId: \"PROJECT_ID\", source: { image: \"ghcr.io/railwayapp-templates/postgres-ssl:16\" } }) { id } }"
  }'

# 3. Redis
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { serviceCreate(input: { name: \"redis\", projectId: \"PROJECT_ID\", source: { image: \"redis:alpine\" } }) { id } }"
  }'

# 4. Web Service
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { serviceCreate(input: { name: \"web\", projectId: \"PROJECT_ID\" }) { id } }"
  }'
```

### TCP Proxy dla Baz Danych

```bash
# PostgreSQL TCP Proxy
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { tcpProxyCreate(input: { serviceId: \"POSTGRES_SERVICE_ID\", environmentId: \"ENV_ID\" }) { domain proxyPort } }"
  }'

# Redis TCP Proxy
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { tcpProxyCreate(input: { serviceId: \"REDIS_SERVICE_ID\", environmentId: \"ENV_ID\" }) { domain proxyPort } }"
  }'
```

### Zmienne Środowiskowe

```bash
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { variableCollectionUpsert(input: { projectId: \"PROJECT_ID\", environmentId: \"ENV_ID\", serviceId: \"WEB_SERVICE_ID\", variables: { NODE_ENV: \"production\", HOST: \"https://app.up.railway.app\" } }) }"
  }'
```

### Tworzenie Domeny

```bash
curl --request POST \
  --url 'https://backboard.railway.app/graphql/v2' \
  --header "Authorization: Bearer $RAILWAY_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "mutation { serviceDomainCreate(input: { serviceId: \"WEB_SERVICE_ID\", environmentId: \"ENV_ID\" }) { domain } }"
  }'
```

---

## 2. Shopify App Setup

### Wymagane Tokeny
```bash
SHOPIFY_CLI_PARTNERS_TOKEN="atkn_xxxxx"  # CLI Token
SHOPIFY_PARTNER_API_TOKEN="prtapi_xxxxx"  # Partner API (opcjonalnie)
```

### Ręczne Tworzenie App (wymagane)

Shopify wymaga ręcznego utworzenia aplikacji w Partner Dashboard:

1. Przejdź do: https://partners.shopify.com/{ORG_ID}/apps
2. Kliknij "Create app" → "Create app manually"
3. Zapisz `client_id` i `client_secret`

### Konfiguracja via CLI

```bash
# shopify.app.toml
cat > shopify.app.toml << 'EOF'
name = "AppName"
client_id = "YOUR_CLIENT_ID"
application_url = "https://app.up.railway.app"
embedded = true

[access_scopes]
scopes = "read_products,read_orders,read_themes,read_analytics,read_customers"

[auth]
redirect_urls = [
  "https://app.up.railway.app/auth/callback",
  "https://app.up.railway.app/auth/shopify/callback",
  "http://localhost:3000/auth/callback",
  "http://localhost:3000/auth/shopify/callback"
]

[webhooks]
api_version = "2024-01"

[[webhooks.subscriptions]]
topics = [ "customers/data_request" ]
uri = "/webhooks/gdpr/customers-data-request"

[[webhooks.subscriptions]]
topics = [ "customers/redact" ]
uri = "/webhooks/gdpr/customers-redact"

[[webhooks.subscriptions]]
topics = [ "shop/redact" ]
uri = "/webhooks/gdpr/shop-redact"

[[webhooks.subscriptions]]
topics = [ "app/uninstalled" ]
uri = "/webhooks/app-uninstalled"

[pos]
embedded = false
EOF
```

### Deploy Konfiguracji

```bash
SHOPIFY_CLI_PARTNERS_TOKEN="YOUR_TOKEN" shopify app deploy --force
```

### Link Instalacyjny

```bash
echo "https://admin.shopify.com/oauth/install?client_id=YOUR_CLIENT_ID"
```

---

## 3. GitHub Actions CI/CD

### Ustawianie Secretów

```bash
# Ustaw RAILWAY_TOKEN
gh secret set RAILWAY_TOKEN --body "your-railway-token"

# Ustaw inne sekrety
gh secret set SHOPIFY_API_KEY --body "your-api-key"
gh secret set SHOPIFY_API_SECRET --body "your-api-secret"
```

### Workflow Template

```yaml
# .github/workflows/deploy-app.yml
name: Deploy App

on:
  push:
    branches: [main]
    paths:
      - 'apps/app-XX-name/**'
      - '.github/workflows/deploy-app.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/app-XX-name

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/app-XX-name/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Type check
        run: npm run typecheck || true

      - name: Build
        run: npm run build

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        run: railway up --service web --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

      - name: Run database migrations
        run: railway run npx prisma migrate deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 4. Claude AI Integration

### Setup

```typescript
// utils/claude.server.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(prompt: string, images?: string[]) {
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];
  
  // Dodaj obrazy (Vision API)
  if (images) {
    for (const imageBase64 of images) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: imageBase64,
        },
      });
    }
  }
  
  content.push({ type: 'text', text: prompt });
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content }],
  });
  
  return response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';
}
```

### Parsowanie JSON z Odpowiedzi

```typescript
export function parseJSONResponse<T>(response: string): T {
  // Usuń markdown code blocks
  const cleaned = response
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  // Znajdź JSON array lub object
  const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  return JSON.parse(jsonMatch[0]);
}
```

---

## 5. Resend Email Setup

### Konfiguracja

```typescript
// utils/email.server.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'App Name <noreply@yourdomain.com>',
    to,
    subject,
    html,
  });
  
  if (error) {
    console.error('Email send failed:', error);
    throw error;
  }
  
  return data;
}
```

### Email Templates

```typescript
export const emailTemplates = {
  analysisComplete: (shopName: string, count: number) => ({
    subject: `Your analysis is ready - ${count} recommendations`,
    html: `
      <h1>Hi ${shopName}!</h1>
      <p>Your store analysis is complete. We found ${count} recommendations to improve your conversion rate.</p>
      <a href="https://app.url/recommendations">View Recommendations</a>
    `,
  }),
  
  weeklyDigest: (shopName: string, implemented: number, pending: number) => ({
    subject: `Weekly CRO Digest`,
    html: `
      <h1>Your Weekly Progress</h1>
      <p>Implemented: ${implemented}</p>
      <p>Pending: ${pending}</p>
    `,
  }),
};
```

---

## 6. Prisma Database

### Base Schema (dla wszystkich aplikacji)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === SHARED MODELS ===

model Shop {
  id              String           @id @default(cuid())
  domain          String           @unique
  accessToken     String
  scope           String
  isActive        Boolean          @default(true)
  plan            String           @default("free")
  email           String?
  installedAt     DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  subscriptions   Subscription[]
  
  // App-specific relations - add below
  @@index([domain])
  @@index([plan])
}

model Subscription {
  id              String    @id @default(cuid())
  shopId          String
  plan            String
  status          String
  billingOn       DateTime?
  trialEndsOn     DateTime?
  shopifyChargeId String?   @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  shop            Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@index([shopId])
  @@index([status])
}

// Shopify Session storage (required for OAuth)
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean   @default(false)
  locale        String?
  collaborator  Boolean?  @default(false)
  emailVerified Boolean?  @default(false)

  @@index([shop])
}
```

### Sync do Produkcji

```bash
# Development (z migracjami)
npx prisma migrate dev --name init

# Production (bez interakcji)
npx prisma db push
```

---

## 7. Full Automation Script

### Skrypt do Nowej Aplikacji

```bash
#!/bin/bash
# scripts/setup-new-app.sh

APP_NAME=$1
APP_NUMBER=$2

if [ -z "$APP_NAME" ] || [ -z "$APP_NUMBER" ]; then
  echo "Usage: ./setup-new-app.sh <app-name> <app-number>"
  echo "Example: ./setup-new-app.sh inventory-sync 02"
  exit 1
fi

APP_DIR="apps/app-${APP_NUMBER}-${APP_NAME}"

echo "🚀 Setting up $APP_NAME..."

# 1. Copy template
cp -r templates/shopify-remix-app "$APP_DIR"

# 2. Update package.json
sed -i '' "s/app-template/app-${APP_NUMBER}-${APP_NAME}/g" "$APP_DIR/package.json"

# 3. Install dependencies
cd "$APP_DIR"
npm install

# 4. Create Railway project (requires RAILWAY_TOKEN)
if [ -n "$RAILWAY_TOKEN" ]; then
  echo "📦 Creating Railway project..."
  # Add Railway API calls here
fi

# 5. Generate Prisma client
npx prisma generate

echo "✅ App $APP_NAME created in $APP_DIR"
echo ""
echo "Next steps:"
echo "1. Create Shopify app in Partner Dashboard"
echo "2. Update .env with credentials"
echo "3. Run: npx prisma db push"
echo "4. Run: npm run dev"
```

---

## 📊 Checklist dla Nowej Aplikacji

### Infrastructure
- [ ] Railway Project utworzony
- [ ] PostgreSQL z TCP proxy
- [ ] Redis z TCP proxy
- [ ] Web service z domeną
- [ ] Zmienne środowiskowe ustawione

### Shopify
- [ ] App utworzona w Partner Dashboard
- [ ] client_id i secret zapisane
- [ ] shopify.app.toml skonfigurowany
- [ ] `shopify app deploy` wykonany

### GitHub
- [ ] Workflow CI/CD utworzony
- [ ] RAILWAY_TOKEN w secrets

### Database
- [ ] Schema z Session model
- [ ] Prisma db push wykonany

### Development
- [ ] .env z credentials
- [ ] npm install
- [ ] npm run dev działa

---

## 🔄 Evolving Automation

### Cel: Pełna Automatyzacja

Z każdą iteracją zwiększamy poziom automatyzacji:

| Iteracja | Manual Steps | Automated |
|----------|--------------|-----------|
| App #1 | 6 | 8 |
| App #2 | 3 | 11 |
| App #3 | 1 | 13 |
| App #4+ | 0 | 14 |

### Roadmap Automatyzacji

1. **Poziom 1** (Current): API calls + CLI commands
2. **Poziom 2**: Pojedynczy skrypt setup
3. **Poziom 3**: Template z pre-configured CI/CD
4. **Poziom 4**: Pełna automatyzacja z generatorem

---

**Dokument aktualizowany z każdą nową aplikacją.**
