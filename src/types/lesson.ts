import { ValidationRule } from './canvas';

export interface LessonContent {
  videoUrl?: string;
  instructions: string;
  initialCanvas?: { nodes: unknown[]; edges: unknown[] };
}

export interface Lesson {
  id: string;
  moduleId: string;
  slug: string;
  titleHe: string;
  titleEn: string;
  type: 'video' | 'interactive' | 'challenge';
  xpReward: number;
  order: number;
  content: LessonContent;
  solution?: unknown;
  rules?: ValidationRule[] | null;
}
