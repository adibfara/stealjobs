export const ICON_NAMES = [
  'Mail', 'Phone', 'Globe', 'Linkedin', 'Github', 'MapPin',
  'Twitter', 'Link', 'Youtube', 'Instagram', 'Facebook',
  'Briefcase', 'Calendar', 'ExternalLink', 'User', 'Building2',
  'Rss', 'Award', 'Laptop', 'BookOpen', 'FileText', 'AtSign',
] as const;

export type IconName = typeof ICON_NAMES[number];

export interface Contact {
  id: string;
  icon: IconName;
  text: string;
  link?: string;
}

export interface Bullet {
  id: string;
  text: string;
  link?: string;
}

export interface Tag {
  id: string;
  text: string;
}

export interface ImageItem {
  id: string;
  title: string;
  subtitle?: string;
  imageLink: string;
  link?: string;
}

export type SubSectionType = 1 | 2 | 3;
export type TagsPosition = 'top' | 'bottom';

export interface SubSection {
  id: string;
  title?: string;
  titleLink?: string;
  subtitle?: string;
  subtitleLink?: string;
  date?: string;
  dateLink?: string;
  text?: string;
  bullets: Bullet[];
  tags: Tag[];
  images?: ImageItem[];
  imagesCardView?: boolean;
  type: SubSectionType;
  tagsPosition?: TagsPosition;
  tagsHidden?: boolean;
}

export interface Section {
  id: string;
  title?: string;
  titleLink?: string;
  subsections: SubSection[];
}

export interface ResumeData {
  id: string;
  name: string;
  title?: string;
  titleLink?: string;
  subtitle?: string;
  subtitleLink?: string;
  photo?: string;
  contacts: Contact[];
  sections: Section[];
  selectedTemplate: string;
  lastModified: number;
  createdAt: number;
}
