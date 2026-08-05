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
import type { ThemeData, ThemeNode } from '@/types/theme';
import { modernRowTheme, builtinThemes } from '@/features/theme/builtinThemes';

function themesCol(uid: string) {
  return collection(db, 'users', uid, 'themes');
}

export function stripUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(stripUndefined) as unknown as T;
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return obj;
}

export async function getThemes(): Promise<ThemeData[]> {
  const snap = await getDocs(themesCol(requireUid()));
  return snap.docs.map(d => d.data() as ThemeData);
}

export async function getTheme(id: string): Promise<ThemeData | null> {
  const snap = await getDoc(doc(db, 'users', requireUid(), 'themes', id));
  return snap.exists() ? (snap.data() as ThemeData) : null;
}

export async function saveTheme(theme: ThemeData): Promise<void> {
  const uid = requireUid();
  const updated = stripUndefined({ ...theme, lastModified: Date.now() });
  await setDoc(doc(db, 'users', uid, 'themes', theme.id), updated);
}

export async function deleteTheme(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', requireUid(), 'themes', id));
}

function regenerateIds(node: ThemeNode): ThemeNode {
  return {
    ...node,
    id: genId(),
    children: node.children ? node.children.map(regenerateIds) : undefined,
  };
}

export function createTheme(name: string, from?: ThemeData): ThemeData {
  const now = Date.now();
  const base = from ?? modernRowTheme;
  return {
    ...base,
    id: genId(),
    name,
    builtin: false,
    root: regenerateIds(base.root),
    createdAt: now,
    lastModified: now,
  };
}

export function exportThemeAsJson(theme: ThemeData): void {
  const json = JSON.stringify(theme, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${theme.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.theme.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importThemeFromFile(file: File): Promise<ThemeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ThemeData;
        resolve(data);
      } catch {
        reject(new Error('Invalid theme file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function resolveTheme(id: string, customList: ThemeData[]): ThemeData | null {
  const custom = customList.find(t => t.id === id);
  if (custom) return custom;
  return builtinThemes.find(t => t.id === id) ?? null;
}
