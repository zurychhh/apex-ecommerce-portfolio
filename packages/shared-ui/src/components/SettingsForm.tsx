import { Card } from '@shopify/polaris';

interface SettingsFormProps {
  initialValues: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
}

export function SettingsForm({ initialValues, onSave }: SettingsFormProps) {
  // TODO: Implement reusable settings form component
  // This will be filled out when we build App #1
  return <Card>Settings Form (TODO)</Card>;
}
