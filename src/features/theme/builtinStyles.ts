import type { NamedStyleSet, StyleEntry } from '@/types/theme';

const entries: StyleEntry[] = [
  { id: 'title', name: 'Title', typography: { fontFamily: 'dm-serif', fontSize: 32, fontWeight: 400, color: 'muted' } },
  { id: 'subtitle', name: 'Subtitle', typography: { fontSize: 14, color: 'muted' } },
  { id: 'sectionTitle', name: 'Section Heading', typography: { fontSize: 9, fontWeight: 700, color: 'muted' } },
  { id: 'itemTitle', name: 'Item Title', typography: { fontSize: 10.5, fontWeight: 700, color: 'text' } },
  { id: 'itemSubtitle', name: 'Item Subtitle', typography: { fontSize: 9.5, color: 'muted' } },
  { id: 'date', name: 'Date', typography: { fontSize: 8.5, color: 'accent', background: 'surface' } },
  { id: 'tag', name: 'Tag', typography: { fontSize: 8, color: 'text', background: 'surface', border: { width: 0.5, color: 'border', style: 'solid' } } },
  { id: 'body', name: 'Body', typography: { fontSize: 9.5, color: 'faint' } },
  { id: 'bullet', name: 'Bullet', typography: { fontSize: 9.5, color: 'faint' } },
  { id: 'contact', name: 'Contact', typography: { fontSize: 8.5, color: 'faint' } },
];

export const defaultStyleSet: NamedStyleSet = {
  id: 'default-style',
  name: 'Default',
  entries,
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const builtinStyleSets: NamedStyleSet[] = [defaultStyleSet];
