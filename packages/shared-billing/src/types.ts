export type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  name: PlanType;
  price: number;
  trialDays: number;
  features: string[];
}

export const PLANS: Record<PlanType, SubscriptionPlan> = {
  free: {
    name: 'free',
    price: 0,
    trialDays: 0,
    features: ['Basic features', 'Community support']
  },
  basic: {
    name: 'basic',
    price: 19,
    trialDays: 7,
    features: ['All free features', 'Email support']
  },
  pro: {
    name: 'pro',
    price: 49,
    trialDays: 7,
    features: ['All basic features', 'Priority support', 'Advanced analytics']
  },
  enterprise: {
    name: 'enterprise',
    price: 199,
    trialDays: 14,
    features: ['All pro features', 'White-label', 'Dedicated support']
  }
};
