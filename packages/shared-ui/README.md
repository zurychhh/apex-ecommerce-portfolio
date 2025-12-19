# @apex/shared-ui

Shared React components for Shopify apps using Polaris design system.

## Usage

```typescript
import { PricingTable, OnboardingWizard, SettingsForm } from '@apex/shared-ui';
import { useShopifyToast } from '@apex/shared-ui';

// Pricing Table
<PricingTable
  currentPlan="basic"
  onSelectPlan={(plan) => console.log(plan)}
/>

// Onboarding Wizard
<OnboardingWizard onComplete={() => console.log('Done')} />

// Settings Form
<SettingsForm
  initialValues={{ apiKey: 'abc' }}
  onSave={(values) => console.log(values)}
/>

// Toast Hook
const { showToast } = useShopifyToast();
showToast('Settings saved!');
showToast('Error occurred', true);
```

## Components

- **PricingTable** - Displays plan options with features and pricing
- **OnboardingWizard** - Multi-step wizard for new users
- **SettingsForm** - Reusable settings/configuration form

## Hooks

- **useShopifyToast** - Shows toast notifications via App Bridge

## Development

This package will be fleshed out during App #1 development.
All components use Shopify Polaris for consistent design.
