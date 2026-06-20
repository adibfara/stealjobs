import { ModernTemplate } from './ModernTemplate';
import { ModernRowTemplate } from './ModernRowTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
import { CoverLetterTemplate } from './CoverLetterTemplate';
import type { ResumeData } from '@/types/resume';
import type { ComponentType } from 'react';

export interface TemplateDefinition {
  id: string;
  name: string;
  component: ComponentType<{ resume: ResumeData }>;
}

export const TEMPLATES: TemplateDefinition[] = [
  { id: 'modern-row', name: 'Modern Row', component: ModernRowTemplate },
  { id: 'modern', name: 'Modern', component: ModernTemplate },
  { id: 'professional', name: 'Professional', component: ProfessionalTemplate },
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

export { ModernTemplate, ModernRowTemplate, ProfessionalTemplate, CoverLetterTemplate };
