// One-time migration: push existing localStorage app data into the signed-in
// user's Firestore collections. Idempotent — guarded by a `migrated` flag on
// the user's settings/prefs doc. localStorage is left untouched as a fallback.

import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, requireUid } from './firebase';
import type { ResumeData } from '@/types/resume';
import type { ExperienceData } from '@/types/experience';
import type { ApplicationData } from '@/types/application';

const RESUMES_KEY = 'resume-builder-resumes';
const EXPERIENCES_KEY = 'resume-builder-experiences';
const APPLICATIONS_KEY = 'resume-builder-applications';
const FAV_TAGS_KEY = 'resume-builder-favorite-tags';

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export async function migrateLocalToFirestore(): Promise<void> {
  const uid = requireUid();
  const prefsRef = doc(db, 'users', uid, 'settings', 'prefs');
  const prefsSnap = await getDoc(prefsRef);
  if ((prefsSnap.data() as { migrated?: boolean } | undefined)?.migrated) return;

  const resumes = readLocal<ResumeData>(RESUMES_KEY);
  const experiences = readLocal<ExperienceData>(EXPERIENCES_KEY);
  const applications = readLocal<ApplicationData>(APPLICATIONS_KEY);
  let favoriteTags: string[] = [];
  try {
    favoriteTags = JSON.parse(localStorage.getItem(FAV_TAGS_KEY) ?? '[]') as string[];
  } catch {
    favoriteTags = [];
  }

  const batch = writeBatch(db);
  for (const r of resumes) {
    if (r?.id) batch.set(doc(db, 'users', uid, 'resumes', r.id), r);
  }
  for (const e of experiences) {
    if (e?.id) batch.set(doc(db, 'users', uid, 'experiences', e.id), e);
  }
  for (const a of applications) {
    if (a?.id) batch.set(doc(db, 'users', uid, 'applications', a.id), a);
  }
  batch.set(prefsRef, { favoriteTags, migrated: true }, { merge: true });
  await batch.commit();
}
