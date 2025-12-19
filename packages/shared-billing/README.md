# @apex/shared-billing

Shared Shopify Billing API wrapper for subscription management.

## Usage

```typescript
import { createSubscription, checkSubscription, PLANS } from '@apex/shared-billing';

// Create a subscription
await createSubscription('shop.myshopify.com', 'pro', '/dashboard');

// Check subscription status
const subscription = await checkSubscription('shop.myshopify.com');
if (subscription?.isActive) {
  console.log(`Shop is on ${subscription.plan} plan`);
}

// Access plan details
console.log(PLANS.pro.price); // 49
console.log(PLANS.pro.features); // ['All basic features', ...]
```

## Plans

- **Free**: $0/mo - Basic features
- **Basic**: $19/mo - Email support (7-day trial)
- **Pro**: $49/mo - Priority support + Analytics (7-day trial)
- **Enterprise**: $199/mo - White-label + Dedicated support (14-day trial)

## Development

This package will be fleshed out during App #1 development.
