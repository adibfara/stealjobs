import { genId } from './resumeStorage';
import type { ExperienceData } from '@/types/experience';

const KEY = 'resume-builder-experiences';

export function getExperiences(): ExperienceData[] {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '[]') as ExperienceData[];
    return all
      .map(e => ({
        ...e,
        context: e.context ?? [],
        goal: e.goal ?? [],
        action: e.action ?? [],
        result: e.result ?? [],
        learning: e.learning ?? [],
      }))
      .sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function saveExperience(exp: ExperienceData): void {
  const all = getExperiences();
  const idx = all.findIndex(e => e.id === exp.id);
  if (idx >= 0) all[idx] = exp;
  else all.push(exp);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function saveExperienceOrder(ordered: ExperienceData[]): void {
  const withOrder = ordered.map((e, i) => ({ ...e, order: i }));
  localStorage.setItem(KEY, JSON.stringify(withOrder));
}

export function deleteExperience(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getExperiences().filter(e => e.id !== id)));
}

export function createExperience(): ExperienceData {
  const now = Date.now();
  const maxOrder = getExperiences().reduce((max, e) => Math.max(max, e.order), -1);
  return {
    id: genId(),
    title: '',
    company: 'TAPSI',
    tags: [],
    context: [],
    goal: [],
    action: [],
    result: [],
    learning: [],
    description: '',
    order: maxOrder + 1,
    createdAt: now,
    lastModified: now,
  };
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  getExperiences().forEach(e => e.tags.forEach(t => tags.add(t)));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function getAllCompanies(): string[] {
  const companies = new Set<string>();
  getExperiences().forEach(e => { if (e.company) companies.add(e.company); });
  return [...companies].sort((a, b) => a.localeCompare(b));
}

export function exportExperiencesAsJson(experiences: ExperienceData[]): void {
  const json = JSON.stringify(experiences, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'experiences.json';
  a.click();
  URL.revokeObjectURL(url);
}
