import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, requireUid } from './firebase';
import { genId } from './resumeStorage';
import type { ExperienceData } from '@/types/experience';

function experiencesCol(uid: string) {
  return collection(db, 'users', uid, 'experiences');
}

function normalize(e: ExperienceData): ExperienceData {
  return {
    ...e,
    context: e.context ?? [],
    goal: e.goal ?? [],
    action: e.action ?? [],
    result: e.result ?? [],
    learning: e.learning ?? [],
  };
}

export async function getExperiences(): Promise<ExperienceData[]> {
  const snap = await getDocs(experiencesCol(requireUid()));
  return snap.docs
    .map(d => normalize(d.data() as ExperienceData))
    .sort((a, b) => a.order - b.order);
}

export async function saveExperience(exp: ExperienceData): Promise<void> {
  const uid = requireUid();
  await setDoc(doc(db, 'users', uid, 'experiences', exp.id), exp);
}

export async function saveExperienceOrder(ordered: ExperienceData[]): Promise<void> {
  const uid = requireUid();
  const batch = writeBatch(db);
  ordered.forEach((e, i) => {
    batch.set(doc(db, 'users', uid, 'experiences', e.id), { ...e, order: i });
  });
  await batch.commit();
}

export async function deleteExperience(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', requireUid(), 'experiences', id));
}

export function createExperience(): ExperienceData {
  const now = Date.now();
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
    // Timestamp order keeps new items monotonically increasing (sorted last);
    // saveExperienceOrder reindexes to 0..n on manual drag-reorder.
    order: now,
    createdAt: now,
    lastModified: now,
  };
}

/** Pure: derive the sorted unique tag list from an already-loaded experience list. */
export function getAllTags(experiences: ExperienceData[]): string[] {
  const tags = new Set<string>();
  experiences.forEach(e => e.tags.forEach(t => tags.add(t)));
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Pure: derive the sorted unique company list from an already-loaded experience list. */
export function getAllCompanies(experiences: ExperienceData[]): string[] {
  const companies = new Set<string>();
  experiences.forEach(e => { if (e.company) companies.add(e.company); });
  return [...companies].sort((a, b) => a.localeCompare(b));
}

export async function getFavoriteTags(): Promise<string[]> {
  const snap = await getDoc(doc(db, 'users', requireUid(), 'settings', 'prefs'));
  const data = snap.data() as { favoriteTags?: string[] } | undefined;
  return data?.favoriteTags ?? [];
}

export async function saveFavoriteTags(tags: string[]): Promise<void> {
  const uid = requireUid();
  await setDoc(
    doc(db, 'users', uid, 'settings', 'prefs'),
    { favoriteTags: tags },
    { merge: true },
  );
}

export interface ExperienceExport {
  version: 1;
  experiences: ExperienceData[];
  favoriteTags: string[];
}

export function exportExperiencesAsJson(
  experiences: ExperienceData[],
  favoriteTags: string[],
): void {
  const payload: ExperienceExport = {
    version: 1,
    experiences,
    favoriteTags,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'experiences.json';
  a.click();
  URL.revokeObjectURL(url);
}
