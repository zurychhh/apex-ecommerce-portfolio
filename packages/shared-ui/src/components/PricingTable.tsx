import { Card } from '@shopify/polaris';
import type { PlanType } from '@apex/shared-billing';

interface PricingTableProps {
  currentPlan: PlanType;
  onSelectPlan: (plan: PlanType) => void;
}

export function PricingTable({ currentPlan, onSelectPlan }: PricingTableProps) {
  // TODO: Implement beautiful pricing table with PLANS from @apex/shared-billing
  // This will be filled out when we build App #1
  return <Card>Pricing Table (TODO)</Card>;
}
