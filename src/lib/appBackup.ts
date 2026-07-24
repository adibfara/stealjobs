// App-wide backup: dumps/restores every piece of the app's localStorage data.

const APP_PREFIX = 'resume-builder-';
const THEME_KEY = 'project-ui-theme';

export interface AppBackup {
  app: 'adib-resume-builder';
  version: 1;
  exportedAt: number;
  data: Record<string, string>;
}

/** Collect all app-owned localStorage keys (the resume-builder-* namespace + theme). */
function backupKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (key.startsWith(APP_PREFIX) || key === THEME_KEY) keys.push(key);
  }
  return keys;
}

/** Build the full backup object (raw stringified values, kept verbatim). */
export function buildAppBackup(): AppBackup {
  const data: Record<string, string> = {};
  for (const key of backupKeys()) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: 'adib-resume-builder', version: 1, exportedAt: Date.now(), data };
}

export function serializeAppBackup(): string {
  return JSON.stringify(buildAppBackup(), null, 2);
}

/** Download the backup as a timestamped .json file. */
export function downloadAppBackup(): void {
  const json = serializeAppBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `resume-builder-backup-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Copy the backup JSON to the clipboard. Returns false if the clipboard API is unavailable. */
export async function copyAppBackupToClipboard(): Promise<boolean> {
  const json = serializeAppBackup();
  try {
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}

/**
 * Restore a backup produced by buildAppBackup. Replaces all app-owned keys with
 * the backup's contents (removes app keys not present in the backup).
 * Throws if the payload is not a recognizable backup.
 */
export function restoreAppBackup(raw: string): void {
  const parsed = JSON.parse(raw) as Partial<AppBackup>;
  if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Not a valid backup file');
  }
  const data = parsed.data as Record<string, string>;
  // Clear existing app keys first so removed items don't linger.
  for (const key of backupKeys()) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') localStorage.setItem(key, value);
  }
}
