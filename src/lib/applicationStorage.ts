import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, requireUid } from './firebase';
import { genId } from './resumeStorage';
import type { ApplicationData, ApplicationStage } from '@/types/application';

function applicationsCol(uid: string) {
  return collection(db, 'users', uid, 'applications');
}

export async function getApplications(): Promise<ApplicationData[]> {
  const snap = await getDocs(applicationsCol(requireUid()));
  return snap.docs.map(d => d.data() as ApplicationData);
}

export async function saveApplication(app: ApplicationData): Promise<void> {
  const uid = requireUid();
  await setDoc(doc(db, 'users', uid, 'applications', app.id), app);
}

export async function deleteApplication(id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', requireUid(), 'applications', id));
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
