import { ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ProfessionalTemplate } from './ProfessionalTemplate';
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
  { id: 'professional', name: 'Professional', component: ProfessionalTemplate },
];

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}

export { ClassicTemplate, ModernTemplate, ProfessionalTemplate };
