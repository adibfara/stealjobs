import type { NodeStyle, ThemeData, ThemeNode, NodeKind } from '@/types/theme';

let counter = 0;
function n(kind: NodeKind, style: NodeStyle, extra?: Partial<ThemeNode>): ThemeNode {
  counter += 1;
  return { id: `seed-${counter}`, kind, style, ...extra };
}

const contactRow = n('row', { gap: 6, align: 'center' }, {
  repeat: 'contacts',
  children: [
    n('icon', { color: 'muted', opacity: 0.7, iconSize: 11 }, { binding: 'contact.icon' }),
    n('text', { fontSize: 8.5, color: 'faint', lineHeight: 1.3 }, { binding: 'contact.text' }),
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
        n('text', { fontFamily: 'dm-serif', fontSize: 32, fontWeight: 400, color: 'muted', lineHeight: 1.15 }, { binding: 'resume.title' }),
        n('text', { fontSize: 14, color: 'muted', lineHeight: 1.4 }, { binding: 'resume.subtitle' }),
      ],
    }),
  ],
});

const header = n('row', { align: 'center', padding: [12, 28, 12, 28], background: 'background' }, {
  children: [headerLeft, contactsCol],
});

const subsectionTitleCol = n('column', { widthMode: 'fill' }, {
  children: [
    n('text', { fontWeight: 700, fontSize: 10.5, color: 'text' }, { binding: 'subsection.title' }),
    n('text', { fontSize: 9.5, color: 'muted', opacity: 0.95 }, {
      binding: 'subsection.subtitle',
      visibleWhen: { field: 'subsection.type', notEquals: 2 },
    }),
  ],
});

const dateBadge = n('text', {
  fontSize: 8.5, color: 'accent', background: 'surface', padding: [1, 6, 1, 6], borderRadius: 10, margin: [1, 0, 0, 8],
}, { binding: 'subsection.date' });

const subsectionHeaderRow = n('row', { align: 'start' }, {
  children: [subsectionTitleCol, dateBadge],
});

const tagsTop = n('row', { wrap: true, gap: 3, margin: [3, 0, 4, 0] }, {
  visibleWhen: { any: [{ field: 'subsection.tagsPosition', equals: 'top' }, { field: 'subsection.type', equals: 3 }] },
  children: [n('text', { fontSize: 8, color: 'text', background: 'surface', borderRadius: 3, padding: [1, 5, 1, 5], border: { width: 0.5, color: 'border', style: 'solid' } }, { repeat: 'tags', binding: 'tag.text' })],
});

const tagsBottom = n('row', { wrap: true, gap: 3, margin: [5, 0, 0, 0] }, {
  visibleWhen: { all: [{ field: 'subsection.tagsPosition', notEquals: 'top' }, { field: 'subsection.type', notEquals: 3 }] },
  children: [n('text', { fontSize: 8, color: 'text', background: 'surface', borderRadius: 5, padding: [1.5, 6, 1.5, 6], border: { width: 0.5, color: 'border', style: 'solid' } }, { repeat: 'tags', binding: 'tag.text' })],
});

const bodyText = n('text', { fontSize: 9.5, color: 'faint', lineHeight: 1.45, margin: [3, 0, 4, 0] }, {
  binding: 'subsection.text',
  visibleWhen: { fieldPresent: 'subsection.text' },
});

const bulletsEl = n('bullets', { fontSize: 9.5, color: 'faint', lineHeight: 1.45, gap: 2, margin: [4, 0, 0, 0], bulletMarker: 'dot' });

const subsection = n('column', { margin: [0, 0, 12, 0] }, {
  children: [subsectionHeaderRow, tagsTop, bodyText, bulletsEl, tagsBottom],
});

const subsectionsCol = n('column', {}, { repeat: 'subsections', children: [subsection] });

const sectionHeaderRow = n('row', { align: 'center', gap: 8, margin: [0, 0, 8, 0] }, {
  children: [
    n('text', { fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'muted' }, { binding: 'section.title' }),
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
  page: { background: 'background', paddingV: 0, paddingH: 0 },
  root,
  createdAt: 0,
  lastModified: 0,
};
