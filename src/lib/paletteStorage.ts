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
import type { NamedPalette, Palette } from '@/types/theme';
import { builtinPalettes } from '@/features/theme/builtinPalettes';

function palettesCol(uid: string) {
  return collection(db, 'users', uid, 'palettes');
}

export async function getPalettes(): Promise<NamedPalette[]> {
  const snap = await getDocs(palettesCol(requireUid()));
  return snap.docs.map(d => d.data() as NamedPalette);
}

export async function getPalette(id: string): Promise<NamedPalette | null> {
  const snap = await getDoc(doc(db, 'users', requireUid(), 'palettes', id));
  return snap.exists() ? (snap.data() as NamedPalette) : null;
}

export async function savePalette(palette: NamedPalette): Promise<void> {
  if (palette.builtin) return;
  const uid = requireUid();
  const updated = { ...palette, lastModified: Date.now() };
  await setDoc(doc(db, 'users', uid, 'palettes', palette.id), updated);
}

export async function deletePalette(id: string): Promise<void> {
  if (builtinPalettes.some(p => p.id === id)) return;
  await deleteDoc(doc(db, 'users', requireUid(), 'palettes', id));
}

export function createPalette(name: string, colors: Palette): NamedPalette {
  const now = Date.now();
  return { id: genId(), name, colors, builtin: false, createdAt: now, lastModified: now };
}

export function resolvePalette(id: string, customList: NamedPalette[]): NamedPalette | null {
  const custom = customList.find(p => p.id === id);
  if (custom) return custom;
  const builtin = builtinPalettes.find(p => p.id === id);
  if (builtin) return builtin;
  return null;
}
