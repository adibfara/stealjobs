import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, requireUid } from './firebase';
import type { ResumeData } from '@/types/resume';

export function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function resumesCol(uid: string) {
  return collection(db, 'users', uid, 'resumes');
}

export async function getResumes(): Promise<ResumeData[]> {
  const snap = await getDocs(resumesCol(requireUid()));
  return snap.docs.map(d => d.data() as ResumeData);
}

export async function getResume(id: string): Promise<ResumeData | null> {
  const snap = await getDoc(doc(db, 'users', requireUid(), 'resumes', id));
  return snap.exists() ? (snap.data() as ResumeData) : null;
}

export async function saveResume(resume: ResumeData): Promise<void> {
  const uid = requireUid();
  const updated = { ...resume, lastModified: Date.now() };
  await setDoc(doc(db, 'users', uid, 'resumes', resume.id), updated);
}

export async function deleteResume(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', requireUid(), 'resumes', id));
}

export function createResume(name: string): ResumeData {
  const now = Date.now();
  return {
    id: genId(),
    name,
    type: 'resume',
    title: '',
    subtitle: '',
    contacts: [],
    sections: [],
    selectedTemplate: 'classic',
    lastModified: now,
    createdAt: now,
  };
}

export function createCoverLetter(name: string): ResumeData {
  const now = Date.now();
  return {
    id: genId(),
    name,
    type: 'coverletter',
    title: '',
    subtitle: '',
    contacts: [],
    sections: [],
    selectedTemplate: 'coverletter-default',
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
        resolve(data);
      } catch {
        reject(new Error('Invalid resume file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
