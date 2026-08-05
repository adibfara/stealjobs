import type { NodeStyle, ThemeData, ThemeNode, NodeKind, StyleEntry } from '@/types/theme';
import { defaultStyleSet } from './builtinStyles';

let counter = 0;
function n(kind: NodeKind, style: NodeStyle, extra?: Partial<ThemeNode>): ThemeNode {
  counter += 1;
  return { id: `seed-${counter}`, kind, style, ...extra };
}

const contactRow = n('row', { gap: 6, align: 'center' }, {
  repeat: 'contacts',
  children: [
    n('icon', { color: 'muted', opacity: 0.7, iconSize: 11 }, { binding: 'contact.icon' }),
    n('text', { styleRef: 'contact', lineHeight: 1.3 }, { binding: 'contact.text' }),
  ],
});

const contactsCol = n('column', { gap: 6, wrap: true, align: 'start' }, {
  children: [contactRow],
});

const headerLeft = n('row', { gap: 16, align: 'center', widthMode: 'fill' }, {
  children: [
    n('image', { imageWidth: 80, imageHeight: 80, imageCircle: true, border: { width: 2, color: 'surface', style: 'solid' } }, { binding: 'resume.photo' }),
    n('column', { gap: 5 }, {
      children: [
        n('text', { styleRef: 'title', lineHeight: 1.15 }, { binding: 'resume.title' }),
        n('text', { styleRef: 'subtitle', lineHeight: 1.4 }, { binding: 'resume.subtitle' }),
      ],
    }),
  ],
});

const header = n('row', { align: 'center', padding: [12, 28, 12, 28], background: 'background' }, {
  children: [headerLeft, contactsCol],
});

const subsectionTitleCol = n('column', { widthMode: 'fill' }, {
  children: [
    n('text', { styleRef: 'itemTitle' }, { binding: 'subsection.title' }),
    n('text', { styleRef: 'itemSubtitle', opacity: 0.95 }, {
      binding: 'subsection.subtitle',
      visibleWhen: { field: 'subsection.type', notEquals: 2 },
    }),
  ],
});

const dateBadge = n('text', {
  styleRef: 'date', padding: [1, 6, 1, 6], borderRadius: 10, margin: [1, 0, 0, 8],
}, { binding: 'subsection.date' });

const subsectionHeaderRow = n('row', { align: 'start' }, {
  children: [subsectionTitleCol, dateBadge],
});

const tagsTop = n('row', { wrap: true, gap: 3, margin: [3, 0, 4, 0] }, {
  visibleWhen: { any: [{ field: 'subsection.tagsPosition', equals: 'top' }, { field: 'subsection.type', equals: 3 }] },
  children: [n('text', { styleRef: 'tag', borderRadius: 3, padding: [1, 5, 1, 5] }, { repeat: 'tags', binding: 'tag.text' })],
});

const tagsBottom = n('row', { wrap: true, gap: 3, margin: [5, 0, 0, 0] }, {
  visibleWhen: { all: [{ field: 'subsection.tagsPosition', notEquals: 'top' }, { field: 'subsection.type', notEquals: 3 }] },
  children: [n('text', { styleRef: 'tag', borderRadius: 5, padding: [1.5, 6, 1.5, 6] }, { repeat: 'tags', binding: 'tag.text' })],
});

const bodyText = n('text', { styleRef: 'body', lineHeight: 1.45, margin: [3, 0, 4, 0] }, {
  binding: 'subsection.text',
  visibleWhen: { fieldPresent: 'subsection.text' },
});

const bulletsEl = n('bullets', { styleRef: 'bullet', lineHeight: 1.45, gap: 2, margin: [4, 0, 0, 0], bulletMarker: 'dot' });

const subsection = n('column', { margin: [0, 0, 12, 0] }, {
  children: [subsectionHeaderRow, tagsTop, bodyText, bulletsEl, tagsBottom],
});

const subsectionsCol = n('column', {}, { repeat: 'subsections', children: [subsection] });

const sectionHeaderRow = n('row', { align: 'center', gap: 8, margin: [0, 0, 8, 0] }, {
  children: [
    n('text', { styleRef: 'sectionTitle', letterSpacing: 1.5, textTransform: 'uppercase' }, { binding: 'section.title' }),
    n('box', { widthMode: 'fill', background: 'border', padding: [0.9, 0.9, 0.9, 0.9] }),
  ],
});

const sectionBlock = n('column', { margin: [0, 0, 16, 0] }, {
  children: [sectionHeaderRow, subsectionsCol],
});

const sectionsCol = n('column', {}, { repeat: 'sections', children: [sectionBlock] });

const main = n('column', { padding: [12, 28, 12, 28], background: 'background' }, {
  children: [sectionsCol],
});

const root = n('column', {}, { children: [header, main] });

export const DEFAULT_PALETTE_ID = 'default-palette';

export const modernRowTheme: ThemeData = {
  id: 'modern-row',
  name: 'Modern Row',
  builtin: true,
  palette: {
    background: '#fff',
    surface: '#fff',
    text: '#2050bf',
    muted: '#16213e',
    faint: '#2d2d44',
    primary: '#2050bf',
    accent: '#1f44a3',
    border: '#d0dff5',
  },
  paletteId: DEFAULT_PALETTE_ID,
  styleSet: defaultStyleSet.entries,
  styleSetId: defaultStyleSet.id,
  page: { background: 'background', paddingV: 0, paddingH: 0 },
  root,
  createdAt: 0,
  lastModified: 0,
};

// ---------------------------------------------------------------------------
// Professional theme
// ---------------------------------------------------------------------------

const professionalStyleEntries: StyleEntry[] = [
  { id: 'title', name: 'Title', typography: { fontFamily: 'lora', fontSize: 30, fontWeight: 400, color: 'text' } },
  { id: 'subtitle', name: 'Subtitle', typography: { fontFamily: 'ubuntu', fontSize: 9.5, italic: true, color: 'muted' } },
  { id: 'sectionTitle', name: 'Section Heading', typography: { fontFamily: 'lora', fontSize: 16, fontWeight: 400, color: 'text' } },
  { id: 'itemTitle', name: 'Item Title', typography: { fontFamily: 'ubuntu', fontSize: 10.5, fontWeight: 700, color: 'text' } },
  { id: 'itemSubtitle', name: 'Item Subtitle', typography: { fontFamily: 'ubuntu', fontSize: 9.5, color: 'muted' } },
  { id: 'date', name: 'Date', typography: { fontFamily: 'ubuntu', fontSize: 10.5, color: 'text' } },
  { id: 'tag', name: 'Tag', typography: { fontFamily: 'ubuntu', fontSize: 8, color: 'muted', background: 'surface', border: { width: 0.5, color: 'border', style: 'solid' } } },
  { id: 'body', name: 'Body', typography: { fontFamily: 'ubuntu', fontSize: 9.5, color: 'text' } },
  { id: 'bullet', name: 'Bullet', typography: { fontFamily: 'ubuntu', fontSize: 9.5, color: 'text' } },
  { id: 'contact', name: 'Contact', typography: { fontFamily: 'ubuntu', fontSize: 9.5, color: 'muted' } },
];

const pPhoto = n('image', { imageWidth: 44, imageHeight: 44, imageCircle: true }, { binding: 'resume.photo' });
const pTitle = n('text', { styleRef: 'title', lineHeight: 1.1 }, { binding: 'resume.title' });
const pHeaderRow = n('row', { align: 'center', gap: 10 }, { children: [pPhoto, pTitle] });
const pDivider = n('box', { widthMode: 'fill', background: 'border', padding: [0.5, 0.5, 0.5, 0.5] });
const pContactsRow = n('row', { wrap: true, gap: 8, margin: [6, 0, 0, 0] }, {
  children: [n('text', { styleRef: 'contact' }, { repeat: 'contacts', binding: 'contact.text' })],
});
const pSubtitleText = n('text', { styleRef: 'subtitle', margin: [4, 0, 0, 0] }, { binding: 'resume.subtitle' });
const pHeader = n('column', { gap: 6, padding: [24, 32, 0, 32], background: 'background' }, {
  children: [pHeaderRow, pDivider, pContactsRow, pSubtitleText],
});

const pSubsectionTitleCol = n('column', { widthMode: 'fill' }, {
  children: [
    n('text', { styleRef: 'itemTitle' }, { binding: 'subsection.title' }),
    n('text', { styleRef: 'itemSubtitle', opacity: 0.95 }, {
      binding: 'subsection.subtitle',
      visibleWhen: { field: 'subsection.type', notEquals: 2 },
    }),
  ],
});
const pDateBadge = n('text', { styleRef: 'date', margin: [1, 0, 0, 16] }, { binding: 'subsection.date' });
const pSubsectionHeaderRow = n('row', { align: 'start' }, { children: [pSubsectionTitleCol, pDateBadge] });
const pTagsTop = n('row', { wrap: true, gap: 4, margin: [4, 0, 4, 0] }, {
  visibleWhen: { any: [{ field: 'subsection.tagsPosition', equals: 'top' }, { field: 'subsection.type', equals: 3 }] },
  children: [n('text', { styleRef: 'tag', borderRadius: 3, padding: [1, 7, 1, 7] }, { repeat: 'tags', binding: 'tag.text' })],
});
const pTagsBottom = n('row', { wrap: true, gap: 4, margin: [6, 0, 0, 0] }, {
  visibleWhen: { all: [{ field: 'subsection.tagsPosition', notEquals: 'top' }, { field: 'subsection.type', notEquals: 3 }] },
  children: [n('text', { styleRef: 'tag', borderRadius: 3, padding: [1, 7, 1, 7] }, { repeat: 'tags', binding: 'tag.text' })],
});
const pBodyText = n('text', { styleRef: 'body', lineHeight: 1.55, margin: [5, 0, 4, 0] }, {
  binding: 'subsection.text',
  visibleWhen: { fieldPresent: 'subsection.text' },
});
const pBulletsEl = n('bullets', { styleRef: 'bullet', lineHeight: 1.55, gap: 7, margin: [6, 0, 0, 0], bulletMarker: 'dot' });
const pSubsection = n('column', { margin: [0, 0, 20, 0] }, {
  children: [pSubsectionHeaderRow, pTagsTop, pBodyText, pBulletsEl, pTagsBottom],
});
const pSubsectionsCol = n('column', {}, { repeat: 'subsections', children: [pSubsection] });

const pSectionTitle = n('text', { styleRef: 'sectionTitle', margin: [0, 0, 4, 0] }, { binding: 'section.title' });
const pSectionDivider = n('box', { widthMode: 'fill', background: 'border', padding: [0.5, 0.5, 0.5, 0.5] });
const pSectionHeader = n('column', { margin: [0, 0, 8, 0] }, { children: [pSectionTitle, pSectionDivider] });
const pSectionBlock = n('column', { margin: [0, 0, 8, 0] }, { children: [pSectionHeader, pSubsectionsCol] });
const pSectionsCol = n('column', {}, { repeat: 'sections', children: [pSectionBlock] });

const pMain = n('column', { padding: [16, 32, 32, 32], background: 'background' }, { children: [pSectionsCol] });
const pRoot = n('column', {}, { children: [pHeader, pMain] });

export const professionalTheme: ThemeData = {
  id: 'professional',
  name: 'Professional',
  builtin: true,
  palette: {
    background: '#ffffff',
    surface: '#f0f0f0',
    text: '#1a1a1a',
    muted: '#555555',
    faint: '#484848',
    primary: '#1a1a1a',
    accent: '#1a1a1a',
    border: '#cccccc',
  },
  styleSet: professionalStyleEntries,
  page: { background: 'background', paddingV: 0, paddingH: 0 },
  root: pRoot,
  createdAt: 0,
  lastModified: 0,
};

// ---------------------------------------------------------------------------
// Modern (sidebar) theme
// ---------------------------------------------------------------------------

const WHITE = { literal: '#ffffff' };
const WHITE_70 = { literal: 'rgba(255,255,255,0.7)' };
const WHITE_50 = { literal: 'rgba(255,255,255,0.5)' };
const WHITE_85 = { literal: 'rgba(255,255,255,0.85)' };
const WHITE_35 = { literal: 'rgba(255,255,255,0.35)' };

const msPhoto = n('image', {
  imageWidth: 80, imageHeight: 80, imageCircle: true,
  border: { width: 2, color: WHITE_35, style: 'solid' },
}, { binding: 'resume.photo' });
const msTitle = n('text', {
  fontFamily: 'dm-serif', fontSize: 26, fontWeight: 400, color: WHITE, lineHeight: 1.15, margin: [0, 0, 5, 0],
}, { binding: 'resume.title' });
const msSubtitle = n('text', { fontSize: 12, color: WHITE_70, lineHeight: 1.4 }, { binding: 'resume.subtitle' });
const msNameCol = n('column', { gap: 0 }, { children: [msTitle, msSubtitle] });
const msContactLabel = n('text', {
  fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: WHITE_50, fontWeight: 600, margin: [0, 0, 8, 0],
}, { binding: { literal: 'Contact' } });
const msContactRow = n('row', { gap: 6, align: 'center' }, {
  repeat: 'contacts',
  children: [
    n('icon', { color: WHITE_70, iconSize: 11 }, { binding: 'contact.icon' }),
    n('text', { fontSize: 8.5, color: WHITE_85, lineHeight: 1.3 }, { binding: 'contact.text' }),
  ],
});
const msContactBlock = n('column', { gap: 6 }, { children: [msContactLabel, msContactRow] });
const sidebar = n('column', {
  widthMode: 'fixed', widthValue: 160, gap: 18, padding: [28, 16, 28, 16], background: 'accent',
}, { children: [msPhoto, msNameCol, msContactBlock] });

const msSubsectionTitleCol = n('column', { widthMode: 'fill' }, {
  children: [
    n('text', { styleRef: 'itemTitle' }, { binding: 'subsection.title' }),
    n('text', { styleRef: 'itemSubtitle', italic: true, opacity: 0.75 }, {
      binding: 'subsection.subtitle',
      visibleWhen: { field: 'subsection.type', notEquals: 2 },
    }),
  ],
});
const msDateBadge = n('text', {
  styleRef: 'date', padding: [1, 6, 1, 6], borderRadius: 10, margin: [1, 0, 0, 8],
}, { binding: 'subsection.date' });
const msSubsectionHeaderRow = n('row', { align: 'start' }, { children: [msSubsectionTitleCol, msDateBadge] });
const msTagsTop = n('row', { wrap: true, gap: 3, margin: [3, 0, 4, 0] }, {
  visibleWhen: { any: [{ field: 'subsection.tagsPosition', equals: 'top' }, { field: 'subsection.type', equals: 3 }] },
  children: [n('text', { styleRef: 'tag', borderRadius: 3, padding: [1, 5, 1, 5] }, { repeat: 'tags', binding: 'tag.text' })],
});
const msTagsBottom = n('row', { wrap: true, gap: 3, margin: [5, 0, 0, 0] }, {
  visibleWhen: { all: [{ field: 'subsection.tagsPosition', notEquals: 'top' }, { field: 'subsection.type', notEquals: 3 }] },
  children: [n('text', { styleRef: 'tag', borderRadius: 3, padding: [1.5, 6, 1.5, 6] }, { repeat: 'tags', binding: 'tag.text' })],
});
const msBodyText = n('text', { styleRef: 'body', lineHeight: 1.45, margin: [3, 0, 4, 0] }, {
  binding: 'subsection.text',
  visibleWhen: { fieldPresent: 'subsection.text' },
});
const msBulletsEl = n('bullets', { styleRef: 'bullet', lineHeight: 1.45, gap: 2, margin: [4, 0, 0, 0], bulletMarker: 'dot' });
const msSubsection = n('column', { margin: [0, 0, 12, 0] }, {
  children: [msSubsectionHeaderRow, msTagsTop, msBodyText, msBulletsEl, msTagsBottom],
});
const msSubsectionsCol = n('column', {}, { repeat: 'subsections', children: [msSubsection] });

const msSectionHeaderRow = n('row', { align: 'center', gap: 8, margin: [0, 0, 8, 0] }, {
  children: [
    n('text', { styleRef: 'sectionTitle', letterSpacing: 1.5, textTransform: 'uppercase' }, { binding: 'section.title' }),
    n('box', { widthMode: 'fill', background: 'border', padding: [0.9, 0.9, 0.9, 0.9] }),
  ],
});
const msSectionBlock = n('column', { margin: [0, 0, 16, 0] }, { children: [msSectionHeaderRow, msSubsectionsCol] });
const msSectionsCol = n('column', {}, { repeat: 'sections', children: [msSectionBlock] });

const msMain = n('column', { widthMode: 'fill', padding: [12, 28, 12, 28], background: 'background' }, {
  children: [msSectionsCol],
});
const msRoot = n('row', {}, { children: [sidebar, msMain] });

export const modernSidebarTheme: ThemeData = {
  id: 'modern',
  name: 'Modern',
  builtin: true,
  palette: modernRowTheme.palette,
  paletteId: DEFAULT_PALETTE_ID,
  styleSet: defaultStyleSet.entries,
  styleSetId: defaultStyleSet.id,
  page: { background: 'background', paddingV: 0, paddingH: 0 },
  root: msRoot,
  createdAt: 0,
  lastModified: 0,
};

export const builtinThemes: ThemeData[] = [modernRowTheme, professionalTheme, modernSidebarTheme];
