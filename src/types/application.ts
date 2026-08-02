export type ApplicationStage = 'applied' | 'in_progress' | 'offer' | 'accepted' | 'rejected';

export interface StageChange {
  stage: ApplicationStage;
  at: number;
}

export type ApplicationCountry = 'Netherlands' | 'Germany' | 'UAE';

export interface ApplicationData {
  id: string;
  title: string;
  stage: ApplicationStage;
  appliedAt: number;
  lastModified: number;
  link?: string;
  resumeId?: string;
  coverLetterId?: string;
  description?: string;
  salary?: number;
  country?: ApplicationCountry;
  timeline: StageChange[];
}

export interface ApplicationImport {
  title: string;
  date?: string;
  link?: string;
  status?: ApplicationStage;
  country?: ApplicationCountry;
  description?: string;
}
