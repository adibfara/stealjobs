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

const classicSerifEntries: StyleEntry[] = [
  { id: 'title', name: 'Title', typography: { fontFamily: 'eb-garamond', fontSize: 34, fontWeight: 700, color: 'muted' } },
  { id: 'subtitle', name: 'Subtitle', typography: { fontFamily: 'eb-garamond', fontSize: 14, italic: true, color: 'muted' } },
  { id: 'sectionTitle', name: 'Section Heading', typography: { fontFamily: 'eb-garamond', fontSize: 11, fontWeight: 700, color: 'muted' } },
  { id: 'itemTitle', name: 'Item Title', typography: { fontFamily: 'eb-garamond', fontSize: 11, fontWeight: 700, color: 'text' } },
  { id: 'itemSubtitle', name: 'Item Subtitle', typography: { fontFamily: 'eb-garamond', fontSize: 9.5, italic: true, color: 'muted' } },
  { id: 'date', name: 'Date', typography: { fontFamily: 'eb-garamond', fontSize: 8.5, color: 'accent', background: 'surface' } },
  { id: 'tag', name: 'Tag', typography: { fontFamily: 'eb-garamond', fontSize: 8, color: 'text', background: 'surface', border: { width: 0.5, color: 'border', style: 'solid' } } },
  { id: 'body', name: 'Body', typography: { fontFamily: 'eb-garamond', fontSize: 10, color: 'faint' } },
  { id: 'bullet', name: 'Bullet', typography: { fontFamily: 'eb-garamond', fontSize: 10, color: 'faint' } },
  { id: 'contact', name: 'Contact', typography: { fontFamily: 'eb-garamond', fontSize: 8.5, color: 'faint' } },
];

export const classicSerifStyleSet: NamedStyleSet = {
  id: 'classic-serif-style',
  name: 'Classic Serif',
  entries: classicSerifEntries,
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

const modernSansEntries: StyleEntry[] = [
  { id: 'title', name: 'Title', typography: { fontFamily: 'geist', fontSize: 28, fontWeight: 700, color: 'muted' } },
  { id: 'subtitle', name: 'Subtitle', typography: { fontFamily: 'geist', fontSize: 13, color: 'muted' } },
  { id: 'sectionTitle', name: 'Section Heading', typography: { fontFamily: 'geist', fontSize: 9, fontWeight: 700, color: 'muted' } },
  { id: 'itemTitle', name: 'Item Title', typography: { fontFamily: 'geist', fontSize: 10.5, fontWeight: 600, color: 'text' } },
  { id: 'itemSubtitle', name: 'Item Subtitle', typography: { fontFamily: 'geist', fontSize: 9.5, color: 'muted' } },
  { id: 'date', name: 'Date', typography: { fontFamily: 'geist', fontSize: 8.5, fontWeight: 600, color: 'accent', background: 'surface' } },
  { id: 'tag', name: 'Tag', typography: { fontFamily: 'geist', fontSize: 8, fontWeight: 600, color: 'text', background: 'surface', border: { width: 0.5, color: 'border', style: 'solid' } } },
  { id: 'body', name: 'Body', typography: { fontFamily: 'geist', fontSize: 9.5, color: 'faint' } },
  { id: 'bullet', name: 'Bullet', typography: { fontFamily: 'geist', fontSize: 9.5, color: 'faint' } },
  { id: 'contact', name: 'Contact', typography: { fontFamily: 'geist', fontSize: 8.5, color: 'faint' } },
];

export const modernSansStyleSet: NamedStyleSet = {
  id: 'modern-sans-style',
  name: 'Modern Sans',
  entries: modernSansEntries,
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

const executiveBoldEntries: StyleEntry[] = [
  { id: 'title', name: 'Title', typography: { fontFamily: 'ubuntu', fontSize: 30, fontWeight: 700, color: 'muted' } },
  { id: 'subtitle', name: 'Subtitle', typography: { fontFamily: 'ubuntu', fontSize: 13, fontWeight: 400, color: 'muted' } },
  { id: 'sectionTitle', name: 'Section Heading', typography: { fontFamily: 'ubuntu', fontSize: 10, fontWeight: 700, color: 'muted' } },
  { id: 'itemTitle', name: 'Item Title', typography: { fontFamily: 'ubuntu', fontSize: 10.5, fontWeight: 700, color: 'text' } },
  { id: 'itemSubtitle', name: 'Item Subtitle', typography: { fontFamily: 'ubuntu', fontSize: 9.5, fontWeight: 600, color: 'muted' } },
  { id: 'date', name: 'Date', typography: { fontFamily: 'ubuntu', fontSize: 8.5, fontWeight: 700, color: 'accent', background: 'surface' } },
  { id: 'tag', name: 'Tag', typography: { fontFamily: 'ubuntu', fontSize: 8, fontWeight: 700, color: 'text', background: 'surface', border: { width: 0.75, color: 'border', style: 'solid' } } },
  { id: 'body', name: 'Body', typography: { fontFamily: 'ubuntu', fontSize: 9.5, color: 'faint' } },
  { id: 'bullet', name: 'Bullet', typography: { fontFamily: 'ubuntu', fontSize: 9.5, color: 'faint' } },
  { id: 'contact', name: 'Contact', typography: { fontFamily: 'ubuntu', fontSize: 8.5, fontWeight: 600, color: 'faint' } },
];

export const executiveBoldStyleSet: NamedStyleSet = {
  id: 'executive-bold-style',
  name: 'Executive Bold',
  entries: executiveBoldEntries,
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

const elegantMinimalEntries: StyleEntry[] = [
  { id: 'title', name: 'Title', typography: { fontFamily: 'lora', fontSize: 26, fontWeight: 600, color: 'muted' } },
  { id: 'subtitle', name: 'Subtitle', typography: { fontFamily: 'crimson-pro', fontSize: 12.5, color: 'muted' } },
  { id: 'sectionTitle', name: 'Section Heading', typography: { fontFamily: 'lora', fontSize: 8.5, fontWeight: 600, color: 'muted' } },
  { id: 'itemTitle', name: 'Item Title', typography: { fontFamily: 'lora', fontSize: 10, fontWeight: 600, color: 'text' } },
  { id: 'itemSubtitle', name: 'Item Subtitle', typography: { fontFamily: 'crimson-pro', fontSize: 9, color: 'muted' } },
  { id: 'date', name: 'Date', typography: { fontFamily: 'crimson-pro', fontSize: 8, italic: true, color: 'accent', background: 'surface' } },
  { id: 'tag', name: 'Tag', typography: { fontFamily: 'crimson-pro', fontSize: 7.5, color: 'text', background: 'surface', border: { width: 0.5, color: 'border', style: 'dotted' } } },
  { id: 'body', name: 'Body', typography: { fontFamily: 'crimson-pro', fontSize: 9.5, color: 'faint' } },
  { id: 'bullet', name: 'Bullet', typography: { fontFamily: 'crimson-pro', fontSize: 9.5, color: 'faint' } },
  { id: 'contact', name: 'Contact', typography: { fontFamily: 'crimson-pro', fontSize: 8, color: 'faint' } },
];

export const elegantMinimalStyleSet: NamedStyleSet = {
  id: 'elegant-minimal-style',
  name: 'Elegant Minimal',
  entries: elegantMinimalEntries,
  builtin: true,
  createdAt: 0,
  lastModified: 0,
};

export const builtinStyleSets: NamedStyleSet[] = [
  defaultStyleSet,
  classicSerifStyleSet,
  modernSansStyleSet,
  executiveBoldStyleSet,
  elegantMinimalStyleSet,
];
