import { ModernRowTemplate } from './ModernRowTemplate';
import { CoverLetterTemplate } from './CoverLetterTemplate';
import type { ResumeData } from '@/types/resume';
import type { ComponentType } from 'react';

export interface TemplateDefinition {
  id: string;
  name: string;
  component: ComponentType<{ resume: ResumeData }>;
}

// 'modern' and 'professional' are now editable JSON themes (see builtinThemes.ts),
// sharing their ids so resumes with those selectedTemplate values keep resolving —
// now via ThemeRenderer instead of legacy components.
export const TEMPLATES: TemplateDefinition[] = [
  { id: 'modern-row', name: 'Modern Row', component: ModernRowTemplate },
];

export const COVER_LETTER_TEMPLATES: TemplateDefinition[] = [
  { id: 'coverletter-default', name: 'Default', component: CoverLetterTemplate },
];

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}

export function getCoverLetterTemplate(id: string): TemplateDefinition {
  return COVER_LETTER_TEMPLATES.find(t => t.id === id) ?? COVER_LETTER_TEMPLATES[0];
}

export { ModernRowTemplate, CoverLetterTemplate };
