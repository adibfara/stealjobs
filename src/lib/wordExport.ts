import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  Tab,
  TabStopType,
  convertInchesToTwip,
  ExternalHyperlink,
  UnderlineType,
} from 'docx';
import type { ResumeData, SubSection } from '@/types/resume';

const FONT = 'Calibri';
const COLOR_HEADING = '1a1a2e';
const COLOR_ACCENT = '2563eb';
const COLOR_MUTED = '6b7280';

function textRun(text: string, opts: {
  bold?: boolean;
  italic?: boolean;
  size?: number;
  color?: string;
  underline?: boolean;
} = {}) {
  return new TextRun({
    text,
    font: FONT,
    bold: opts.bold,
    italics: opts.italic,
    size: opts.size ?? 20,
    color: opts.color,
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function hyperlink(text: string, url: string, size = 20) {
  return new ExternalHyperlink({
    link: url,
    children: [
      new TextRun({
        text,
        font: FONT,
        size,
        color: COLOR_ACCENT,
        underline: { type: UnderlineType.SINGLE },
      }),
    ],
  });
}

function sectionDivider() {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'e5e7eb', space: 1 },
    },
    spacing: { before: 80, after: 80 },
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 60 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'e5e7eb', space: 1 },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT,
        bold: true,
        size: 22,
        color: COLOR_HEADING,
      }),
    ],
  });
}

function subsectionHeader(sub: SubSection): Paragraph[] {
  const paras: Paragraph[] = [];

  if (sub.type === 1) {
    // title (left) + date (right) on same line via tab stop
    const leftChildren: (TextRun | ExternalHyperlink)[] = [];
    if (sub.title) {
      if (sub.titleLink) {
        leftChildren.push(hyperlink(sub.title, sub.titleLink, 20));
      } else {
        leftChildren.push(textRun(sub.title, { bold: true }));
      }
    }
    if (sub.subtitle) {
      leftChildren.push(textRun('  ·  ', { color: COLOR_MUTED }));
      if (sub.subtitleLink) {
        leftChildren.push(hyperlink(sub.subtitle, sub.subtitleLink, 20));
      } else {
        leftChildren.push(textRun(sub.subtitle, { italic: true, color: COLOR_MUTED }));
      }
    }

    const rightChildren: (TextRun | ExternalHyperlink | Tab)[] = [];
    if (sub.date) {
      rightChildren.push(new Tab());
      if (sub.dateLink) {
        rightChildren.push(hyperlink(sub.date, sub.dateLink, 20));
      } else {
        rightChildren.push(textRun(sub.date, { color: COLOR_MUTED }));
      }
    }

    paras.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(6.5) }],
      spacing: { before: 120, after: 20 },
      children: [...leftChildren, ...rightChildren],
    }));
  } else if (sub.type === 2) {
    // title only, no subtitle
    const children: (TextRun | ExternalHyperlink | Tab)[] = [];
    if (sub.title) {
      if (sub.titleLink) {
        children.push(hyperlink(sub.title, sub.titleLink, 20));
      } else {
        children.push(textRun(sub.title, { bold: true }));
      }
    }
    if (sub.date) {
      children.push(new Tab());
      children.push(textRun(sub.date, { color: COLOR_MUTED }));
    }
    paras.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(6.5) }],
      spacing: { before: 120, after: 20 },
      children,
    }));
  } else {
    // type 3: just title
    if (sub.title) {
      paras.push(new Paragraph({
        spacing: { before: 120, after: 20 },
        children: [sub.titleLink ? hyperlink(sub.title, sub.titleLink, 20) : textRun(sub.title, { bold: true })],
      }));
    }
  }

  if (sub.text) {
    paras.push(new Paragraph({
      spacing: { before: 0, after: 20 },
      children: [textRun(sub.text, { color: COLOR_MUTED })],
    }));
  }

  return paras;
}

function bulletsParas(sub: SubSection): Paragraph[] {
  const paras: Paragraph[] = [];

  // tags at top
  if (sub.tagsPosition !== 'bottom' && sub.tags?.length) {
    const filtered = sub.tags.filter(t => t.text.trim());
    if (filtered.length) {
      paras.push(new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [textRun(filtered.map(t => t.text).join('  ·  '), { color: COLOR_MUTED, italic: true })],
      }));
    }
  }

  for (const b of sub.bullets) {
    if (!b.text.trim()) continue;
    const children: (TextRun | ExternalHyperlink)[] = [textRun('• ', { bold: true })];
    if (b.link) {
      children.push(hyperlink(b.text, b.link));
    } else {
      children.push(textRun(b.text));
    }
    paras.push(new Paragraph({
      spacing: { before: 0, after: 16 },
      indent: { left: convertInchesToTwip(0.15) },
      children,
    }));
  }

  // tags at bottom
  if (sub.tagsPosition === 'bottom' && sub.tags?.length) {
    const filtered = sub.tags.filter(t => t.text.trim());
    if (filtered.length) {
      paras.push(new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [textRun(filtered.map(t => t.text).join('  ·  '), { color: COLOR_MUTED, italic: true })],
      }));
    }
  }

  return paras;
}

export async function exportToWord(resume: ResumeData): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // Header
  const nameChildren: (TextRun | ExternalHyperlink)[] = [
    new TextRun({ text: resume.name, font: FONT, bold: true, size: 52, color: COLOR_HEADING }),
  ];
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
    children: nameChildren,
  }));

  if (resume.title) {
    const titleChildren: (TextRun | ExternalHyperlink)[] = [];
    if (resume.titleLink) {
      titleChildren.push(hyperlink(resume.title, resume.titleLink, 26));
    } else {
      titleChildren.push(new TextRun({ text: resume.title, font: FONT, size: 26, color: COLOR_MUTED }));
    }
    if (resume.subtitle) {
      titleChildren.push(new TextRun({ text: '  ·  ', font: FONT, size: 26, color: COLOR_MUTED }));
      if (resume.subtitleLink) {
        titleChildren.push(hyperlink(resume.subtitle, resume.subtitleLink, 26));
      } else {
        titleChildren.push(new TextRun({ text: resume.subtitle, font: FONT, size: 26, color: COLOR_MUTED }));
      }
    }
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: titleChildren,
    }));
  }

  // Contacts
  const contactTexts = resume.contacts
    .filter(c => c.text.trim())
    .map(c => c.text);
  if (contactTexts.length) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [textRun(contactTexts.join('  |  '), { color: COLOR_MUTED })],
    }));
  }

  // Sections
  for (const section of resume.sections) {
    if (section.title) {
      children.push(sectionHeading(section.title));
    }

    for (const sub of section.subsections) {
      const headerParas = subsectionHeader(sub);
      children.push(...headerParas);
      children.push(...bulletsParas(sub));
    }

    children.push(sectionDivider());
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.75),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(0.85),
            right: convertInchesToTwip(0.85),
          },
        },
      },
      children,
    }],
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20 },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.name} - Resume.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
