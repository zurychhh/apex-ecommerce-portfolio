/**
 * Recommendation types for enhanced modal display
 */

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  impactScore: number;
  effortScore: number;
  priority: number;
  estimatedUplift: string;
  estimatedROI: string;
  reasoning: string;
  implementation: string;
  codeSnippet: string | null;
  mockupUrl: string | null;
  status: 'pending' | 'implemented' | 'skipped';
  implementedAt: string | null;
  createdAt: string;
}

export interface RecommendationCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  impactScore: number;
  effortScore: number;
  priority: number;
  estimatedUplift: string;
  estimatedROI: string;
  status: string;
  createdAt: string;
}

export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'liquid'
  | 'json'
  | 'jsx'
  | 'tsx';

export interface EffortLevel {
  text: string;
  time: string;
  color: 'success' | 'warning' | 'critical';
}

export interface CategoryInfo {
  label: string;
  icon?: string;
  color: 'success' | 'warning' | 'critical' | 'info';
}
