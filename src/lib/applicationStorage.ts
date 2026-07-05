import { genId } from './resumeStorage';
import type { ApplicationData, ApplicationStage } from '@/types/application';

const KEY = 'resume-builder-applications';

export function getApplications(): ApplicationData[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as ApplicationData[];
  } catch {
    return [];
  }
}

export function saveApplication(app: ApplicationData): void {
  const all = getApplications();
  const idx = all.findIndex(a => a.id === app.id);
  if (idx >= 0) all[idx] = app;
  else all.push(app);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteApplication(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getApplications().filter(a => a.id !== id)));
}

export function createApplication(title: string, stage: ApplicationStage = 'applied'): ApplicationData {
  const now = Date.now();
  return {
    id: genId(),
    title,
    stage,
    appliedAt: now,
    lastModified: now,
    timeline: [{ stage, at: now }],
  };
}
