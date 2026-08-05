import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db, requireUid } from './firebase';
import { genId } from './resumeStorage';
import { stripUndefined } from './themeStorage';
import type { NamedStyleSet, StyleEntry } from '@/types/theme';
import { builtinStyleSets } from '@/features/theme/builtinStyles';

function stylesCol(uid: string) {
  return collection(db, 'users', uid, 'styles');
}

export async function getStyleSets(): Promise<NamedStyleSet[]> {
  const snap = await getDocs(stylesCol(requireUid()));
  return snap.docs.map(d => d.data() as NamedStyleSet);
}

export async function getStyleSet(id: string): Promise<NamedStyleSet | null> {
  const snap = await getDoc(doc(db, 'users', requireUid(), 'styles', id));
  return snap.exists() ? (snap.data() as NamedStyleSet) : null;
}

export async function saveStyleSet(styleSet: NamedStyleSet): Promise<void> {
  if (styleSet.builtin) return;
  const uid = requireUid();
  const updated = stripUndefined({ ...styleSet, lastModified: Date.now() });
  await setDoc(doc(db, 'users', uid, 'styles', styleSet.id), updated);
}

export async function deleteStyleSet(id: string): Promise<void> {
  if (builtinStyleSets.some(s => s.id === id)) return;
  await deleteDoc(doc(db, 'users', requireUid(), 'styles', id));
}

export function createStyleSet(name: string, entries: StyleEntry[]): NamedStyleSet {
  const now = Date.now();
  return { id: genId(), name, entries, builtin: false, createdAt: now, lastModified: now };
}

export function resolveStyleSet(id: string, customList: NamedStyleSet[]): NamedStyleSet | null {
  const custom = customList.find(s => s.id === id);
  if (custom) return custom;
  const builtin = builtinStyleSets.find(s => s.id === id);
  if (builtin) return builtin;
  return null;
}
