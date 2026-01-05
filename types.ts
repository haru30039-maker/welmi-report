
export interface CategoryData {
  sns: number;
  wix: number;
  design: number;
  other: number;
}

export interface Staff {
  id: string;
  name: string;
  joinedAt: string;
  color: string; // Tailwind color class
}

export interface DailyReport {
  id: string;
  createdAt: string; // ISO string
  submittedAt: string; // Formatted date string
  staffName: string;
  date: string;
  workType: 'standard' | 'flex';
  workHours: string;
  categoryHours: CategoryData; 
  categoryTexts: Record<string, string>; 
  workContent: string;
  learnings: string;
  issues: string;
  tomorrowSchedule: string;
  rawText: string;
}

export interface AppSettings {
  staffName: string;
  webhookUrl: string;
  emailRecipient: string;
  reportTemplate: string;
  defaultWorkHours: string;
}

export interface AIAnalysis {
  summary: string;
  suggestions: string[];
  sentiment: 'positive' | 'neutral' | 'concerned';
}
