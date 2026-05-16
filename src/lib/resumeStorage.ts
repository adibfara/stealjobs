import type { ResumeData } from '@/types/resume';

const STORAGE_KEY = 'resume-builder-resumes';

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getResumes(): ResumeData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ResumeData[];
  } catch {
    return [];
  }
}

export function getResume(id: string): ResumeData | null {
  return getResumes().find(r => r.id === id) ?? null;
}

export function saveResume(resume: ResumeData): void {
  const resumes = getResumes();
  const idx = resumes.findIndex(r => r.id === resume.id);
  const updated = { ...resume, lastModified: Date.now() };
  if (idx >= 0) {
    resumes[idx] = updated;
  } else {
    resumes.push(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

export function deleteResume(id: string): void {
  const resumes = getResumes().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
}

export function createResume(name: string): ResumeData {
  const now = Date.now();
  return {
    id: genId(),
    name,
    title: '',
    subtitle: '',
    contacts: [],
    sections: [],
    selectedTemplate: 'classic',
    lastModified: now,
    createdAt: now,
  };
}

export function exportResumeAsJson(resume: ResumeData): void {
  const json = JSON.stringify(resume, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.resume.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importResumeFromFile(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ResumeData;
        data.id = genId();
        data.lastModified = Date.now();
        resolve(data);
      } catch {
        reject(new Error('Invalid resume file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
