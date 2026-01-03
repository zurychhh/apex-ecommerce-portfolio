# ⚙️ APEX Phase 2: Core Development
**Version**: 1.0.0 | **Execution Time**: 3-5 days (automated)  
**Prerequisites**: Phase 1 complete, PROJECT_BRIEF.md available

---

## 📋 PRE-FLIGHT CHECKLIST

Before starting development, verify:

```bash
- [ ] Phase 1 completed successfully
- [ ] npm run dev works locally
- [ ] Railway services running (check: railway status)
- [ ] PROJECT_BRIEF.md defines all features
- [ ] IMPLEMENTATION_LOG.md exists
- [ ] MCP servers connected (claude mcp list)
```

---

## 🎯 DEVELOPMENT STRATEGY

### Core Principle: **Iterative Implementation**

```
Feature 1 → Test → Document → Commit
    ↓
Feature 2 → Test → Document → Commit
    ↓
Feature 3 → Test → Document → Commit
    ↓
Integration → E2E Test → Deploy
```

**NOT: Build everything → Test at end → Fix 100 bugs**

---

## 🛠️ EXECUTION WORKFLOW

### STEP 1: Backend Infrastructure (Day 1)

#### 1.1 Bull Queue Setup

**Create `app/utils/queue.server.ts`:**
```typescript
import Queue from 'bull';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Queue configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create queues (customize per app)
export const mainQueue = new Queue('main-queue', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

// Worker processor
mainQueue.process(async (job) => {
  const { type, shopId, data } = job.data;
  
  console.log(`Processing job ${job.id}: ${type} for shop ${shopId}`);
  
  try {
    switch (type) {
      case 'example_task':
        // Implement task logic
        await processExampleTask(shopId, data);
        break;
      
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error;
  }
});

// Helper functions
async function processExampleTask(shopId: string, data: any) {
  // Implement app-specific logic
  console.log('Processing task for', shopId);
}

// Utility: Add job to queue
export async function queueJob(type: string, shopId: string, data: any) {
  await mainQueue.add({ type, shopId, data }, {
    priority: type === 'urgent' ? 1 : 5,
  });
}

// Queue monitoring
mainQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

mainQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});
```

**Test queue:**
```bash
npm install bull ioredis
npx ts-node -e "
  import { queueJob } from './app/utils/queue.server';
  await queueJob('example_task', 'shop-test', {});
  console.log('Job queued');
"
```

**Expected output:**
- Queue configured with retry logic
- Worker processing jobs
- Error handling in place

---

#### 1.2 Shopify Data Fetching

**Create `app/utils/shopify-data.server.ts`:**
```typescript
import { authenticate } from '../shopify.server';

export async function getShopData(request: Request) {
  const { admin, session } = await authenticate.admin(request);
  
  const response = await admin.graphql(`
    query {
      shop {
        id
        name
        email
        currencyCode
        plan {
          displayName
        }
      }
    }
  `);
  
  const data = await response.json();
  return data.data.shop;
}

export async function getProducts(request: Request, limit = 50) {
  const { admin } = await authenticate.admin(request);
  
  const response = await admin.graphql(`
    query($limit: Int!) {
      products(first: $limit) {
        edges {
          node {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  compareAtPrice
                  inventoryQuantity
                }
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: { limit }
  });
  
  const data = await response.json();
  return data.data.products.edges.map((e: any) => e.node);
}

// Add more Shopify data fetchers as needed
```

**Use Shopify Dev MCP to generate queries:**
```
Tool: learn_shopify_api

Query: "Generate GraphQL query for [SPECIFIC_DATA]"
- Include: [fields needed]
- Pagination: cursor-based
- Error handling: handle rate limits

Apply generated query to shopify-data.server.ts
```

**Expected output:**
- Reusable Shopify data fetchers
- Proper error handling
- Rate limiting respected

---

#### 1.3 API Endpoints

**Create core API routes:**

**Example: `app/routes/api.trigger-task.tsx`:**
```typescript
import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { queueJob } from '../utils/queue.server';

export const action: ActionFunction = async ({ request }) => {
  // Authenticate request
  const { session } = await authenticate.admin(request);
  
  if (!session) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse request body
    const body = await request.json();
    const { taskType, data } = body;
    
    // Queue job
    await queueJob(taskType, session.shop, data);
    
    return json({ 
      success: true, 
      message: 'Task queued successfully' 
    });
  } catch (error) {
    console.error('API error:', error);
    return json({ 
      error: 'Failed to queue task' 
    }, { status: 500 });
  }
};
```

**Create for each major feature:**
- Triggering main app function
- Settings update
- Status check
- Data export (if applicable)

**Test endpoints:**
```bash
curl -X POST http://localhost:3000/api/trigger-task \
  -H "Content-Type: application/json" \
  -d '{"taskType": "example", "data": {}}'
```

**Expected output:**
- RESTful API structure
- Authentication on all routes
- Error responses standardized

---

### STEP 2: Frontend Dashboard (Day 2-3)

#### 2.1 Main Dashboard Route

**Update `app/routes/app._index.tsx`:**
```typescript
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { Page, Layout, Card, Text, Button } from '@shopify/polaris';
import { prisma } from '../db.server';

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Fetch shop data
  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  
  // Fetch app-specific data
  const stats = {
    totalItems: 0, // Replace with actual count
    lastProcessed: shop?.lastAnalysisAt,
    currentPlan: shop?.subscriptions[0]?.plan || 'free',
  };
  
  return json({ shop, stats });
};

export default function Dashboard() {
  const { shop, stats } = useLoaderData<typeof loader>();
  
  return (
    <Page title="Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingLg" as="h2">
                Welcome to [APP_NAME]
              </Text>
              <div style={{ marginTop: '20px' }}>
                <Text as="p">
                  Current Plan: <strong>{stats.currentPlan}</strong>
                </Text>
                <Text as="p">
                  Total Items: <strong>{stats.totalItems}</strong>
                </Text>
                {stats.lastProcessed && (
                  <Text as="p">
                    Last Processed: {new Date(stats.lastProcessed).toLocaleDateString()}
                  </Text>
                )}
              </div>
              <div style={{ marginTop: '20px' }}>
                <Button 
                  primary 
                  onClick={() => {
                    // Trigger main app function
                    fetch('/api/trigger-task', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ taskType: 'main', data: {} }),
                    });
                  }}
                >
                  Run [Main Action]
                </Button>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

**Expected output:**
- Clean dashboard UI using Polaris
- Key metrics displayed
- CTA button for main feature
- Plan badge visible

---

#### 2.2 Settings Page

**Create `app/routes/app.settings.tsx`:**
```typescript
import { useLoaderData, useSubmit } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { authenticate } from '../shopify.server';
import { Page, Layout, Card, FormLayout, TextField, Button } from '@shopify/polaris';
import { prisma } from '../db.server';
import { useState } from 'react';

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  const shop = await prisma.shop.findUnique({
    where: { domain: session.shop },
  });
  
  return json({ 
    settings: shop?.settings || {} 
  });
};

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const settings = {
    setting1: formData.get('setting1'),
    setting2: formData.get('setting2'),
    // Add more settings
  };
  
  await prisma.shop.update({
    where: { domain: session.shop },
    data: { settings },
  });
  
  return redirect('/app/settings?success=true');
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  
  const [formState, setFormState] = useState(settings);
  
  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    submit(formData, { method: 'post' });
  };
  
  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <FormLayout>
              <TextField
                label="Setting 1"
                value={formState.setting1 || ''}
                onChange={(value) => setFormState({ ...formState, setting1: value })}
                autoComplete="off"
              />
              <TextField
                label="Setting 2"
                value={formState.setting2 || ''}
                onChange={(value) => setFormState({ ...formState, setting2: value })}
                autoComplete="off"
              />
              <Button primary onClick={handleSubmit}>
                Save Settings
              </Button>
            </FormLayout>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

**Expected output:**
- Settings page with form
- Data persisted to database
- Success feedback

---

### STEP 3: Core Feature Implementation (Day 3-4)

**This is app-specific. Use PROJECT_BRIEF.md as reference.**

**General structure:**

1. **Create feature-specific files:**
   - `app/utils/[feature].server.ts` - Business logic
   - `app/jobs/[feature].ts` - Background job
   - `app/routes/api.[feature].tsx` - API endpoint
   - `app/routes/app.[feature].tsx` - UI component

2. **Use Shopify Dev MCP for API guidance:**
   ```
   Tool: learn_shopify_api
   
   Query: "How to [SPECIFIC_FEATURE] in Shopify app"
   - Best practices
   - API limitations
   - Error handling
   
   Implement according to MCP guidance
   ```

3. **Test incrementally:**
   ```bash
   # After each feature component:
   npm run build
   npm run dev
   # Manual test in browser
   # Fix any errors
   # Document in IMPLEMENTATION_LOG.md
   ```

**Example structure for ConversionAI (AI Analysis):**
```
app/utils/claude.server.ts       # Claude API wrapper
app/utils/prompts/cro-analysis.ts # Prompt templates
app/jobs/analyzeStore.ts          # Main analysis job
app/routes/api.analysis.start.tsx # Trigger endpoint
app/routes/app.results.tsx        # Results UI
```

**Expected output:**
- Core feature working end-to-end
- Queue processing jobs
- Results displayed in UI
- Error handling comprehensive

---

### STEP 4: Sentry Integration (Day 4)

**Setup Sentry:**
```bash
npm install @sentry/remix @sentry/node
```

**Update `app/entry.server.tsx`:**
```typescript
import * as Sentry from '@sentry/remix';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});

// ... rest of entry.server.tsx
```

**Add error boundaries:**
```typescript
// app/root.tsx
import { captureRemixErrorBoundaryError } from '@sentry/remix';

export function ErrorBoundary({ error }: { error: Error }) {
  captureRemixErrorBoundaryError(error);
  return (
    <div>
      <h1>Error occurred</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

**Expected output:**
- Errors tracked in Sentry
- Performance monitoring active
- Alerts configured

---

### STEP 5: Unit Testing (Day 5)

**Setup Vitest:**
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
});
```

**Write tests for critical functions:**
```typescript
// test/utils/feature.test.ts
import { describe, it, expect } from 'vitest';
import { myFeatureFunction } from '~/utils/feature.server';

describe('Feature Function', () => {
  it('should process data correctly', () => {
    const input = { foo: 'bar' };
    const result = myFeatureFunction(input);
    expect(result).toEqual({ processed: true });
  });
  
  it('should handle errors gracefully', () => {
    const invalid = null;
    expect(() => myFeatureFunction(invalid)).toThrow('Invalid input');
  });
});
```

**Run tests:**
```bash
npm test
npm run test:coverage
```

**Target: 70%+ coverage for critical paths**

**Expected output:**
- Test suite passing
- Coverage reports generated
- CI-ready test configuration

---

## 📋 CONTINUOUS DOCUMENTATION

**Update IMPLEMENTATION_LOG.md after EACH major task:**

```markdown
### [DATE TIME] - [FEATURE NAME]

**Status**: ✅ COMPLETE / ⚠️ IN PROGRESS / ❌ BLOCKED

**Files Created/Modified:**
- `app/utils/queue.server.ts` (created)
- `app/routes/app._index.tsx` (modified)

**What Was Done:**
- Implemented Bull queue with retry logic
- Created main dashboard with metrics
- Added API endpoint for task triggering

**Tests:**
- ✅ npm run build: PASSING
- ✅ Queue processes jobs: VERIFIED
- ⚠️ E2E test: PENDING

**Next Steps:**
1. Add Sentry error tracking
2. Write unit tests for queue
3. Deploy to Railway staging

**Blockers:**
None

**Time Spent:** 2 hours
```

---

## ✅ COMPLETION CRITERIA

Phase 2 is complete when:

- [ ] All core features from PROJECT_BRIEF.md implemented
- [ ] Dashboard UI functional with Polaris components
- [ ] Settings page working
- [ ] API endpoints created and tested
- [ ] Bull queue processing jobs
- [ ] Sentry integrated and tracking errors
- [ ] Unit tests written (70%+ coverage critical paths)
- [ ] `npm run build` passing without errors
- [ ] `npm run dev` runs without crashes
- [ ] IMPLEMENTATION_LOG.md updated with all tasks
- [ ] Manual testing completed in browser
- [ ] No console errors in browser
- [ ] All TypeScript errors resolved

---

## 🚨 TROUBLESHOOTING

### Build Fails
```bash
# Clear everything
rm -rf node_modules .cache build
npm install
npm run build
```

### Queue Not Processing
```bash
# Check Redis connection
railway logs redis

# Verify REDIS_URL env var
echo $REDIS_URL

# Test queue manually
npx ts-node test-queue.ts
```

### Sentry Not Tracking
```bash
# Verify SENTRY_DSN
echo $SENTRY_DSN

# Test Sentry manually
npx ts-node -e "
  import * as Sentry from '@sentry/node';
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  Sentry.captureMessage('Test from CLI');
"
```

### Prisma Errors
```bash
# Regenerate client
npx prisma generate

# Reset database (DESTRUCTIVE)
npx prisma migrate reset

# Check schema
npx prisma validate
```

---

## 📊 PROGRESS TRACKING

**Update APEX_PROJECT_STATUS.md:**
```markdown
## [APP_NAME] - Phase 2 Progress

**Overall Progress**: 20% → 80%

### Completed Features
- [x] Queue infrastructure
- [x] Shopify data fetchers
- [x] Dashboard UI
- [x] Settings page
- [x] [Core Feature 1]
- [x] [Core Feature 2]
- [x] Sentry integration
- [x] Unit tests

### In Progress
- [ ] [Feature X]
- [ ] [Feature Y]

### Blocked
None

### Next Phase
Phase 3: Integration & Testing
- Playwright MCP E2E tests
- Bug fixes
- Performance optimization
```

---

## 🚀 NEXT STEPS

After Phase 2 completion:

```
✅ PHASE 2 COMPLETE: Core Development Done

📊 Progress: 80% MVP
⏱️ Time: [X] days
🎯 Status: Ready for Integration Testing

Next: Execute Phase 3
- Read: automation/claude-code/03-integration-testing.md
- Timeline: 1-2 days
- Goal: All CP tests passing

Continue? (yes/no)
```

---

**Version History:**
- v1.0.0 (2025-01-02): Initial release

**Maintained by:** APEX Automation Toolkit
