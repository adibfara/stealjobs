import { ClassicTemplate } from './ClassicTemplate';
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
  { id: 'classic', name: 'Classic', component: ClassicTemplate },
  { id: 'modern', name: 'Modern', component: ModernTemplate },
  { id: 'modern-row', name: 'Modern Row', component: ModernRowTemplate },
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

export { ClassicTemplate, ModernTemplate, ModernRowTemplate, ProfessionalTemplate, CoverLetterTemplate };
