export interface TemplateTheme {
  // Fonts
  fontDisplay: string;
  fontBody: string;

  // Colors
  colorBg: string;
  colorText: string;
  colorMuted: string;
  colorFaint: string;
  colorAccent: string;
  colorAccentLight: string;

  // Tag styles
  tagSecondaryBg: string;
  tagSecondaryColor: string;
  tagSecondaryBorder: string;

  // Font sizes
  sizeTitle: string;
  sizeSubtitle: string;
  sizeSectionHeading: string;
  sizeSubsectionTitle: string;
  sizeBody: string;
  sizeSmall: string;
  sizeTiny: string;

  // Layout
  pagePaddingV: string;
  pagePaddingH: string;
  sectionGap: string;
  subsectionGap: string;

  // Borders
  dividerWidth: string;
  dividerColor: string;
}

export const classicTheme: TemplateTheme = {
  fontDisplay: "'DM Serif Display', Georgia, serif",
  fontBody: "'Crimson Pro', 'EB Garamond', Georgia, serif",

  colorBg: '#fff',
  colorText: '#111',
  colorMuted: '#444',
  colorFaint: '#666',
  colorAccent: '#111',
  colorAccentLight: '#555',

  tagSecondaryBg: '#f5f5f5',
  tagSecondaryColor: '#444',
  tagSecondaryBorder: '0.5pt solid #e0e0e0',

  sizeTitle: '26pt',
  sizeSubtitle: '12pt',
  sizeSectionHeading: '12.5pt',
  sizeSubsectionTitle: '10.5pt',
  sizeBody: '10pt',
  sizeSmall: '9.5pt',
  sizeTiny: '8.5pt',

  pagePaddingV: '36pt',
  pagePaddingH: '48pt',
  sectionGap: '14pt',
  subsectionGap: '10pt',

  dividerWidth: '1.5pt',
  dividerColor: '#111',
};

export const modernTheme: TemplateTheme = {
  fontDisplay: "'DM Serif Display', Georgia, serif",
  fontBody: "'Instrument Sans', 'Geist Variable', sans-serif",

  colorBg: '#fff',
  colorText: '#2050bf',
  colorMuted: '#16213e',
  colorFaint: '#2d2d44',
  colorAccent: '#1f44a3',
  colorAccentLight: '#fff',

  tagSecondaryBg: 'rgba(244,244,244,0)',
  tagSecondaryColor: '#1e1e1e',
  tagSecondaryBorder: '0.5pt solid #bdbdbd',

  sizeTitle: '32pt',
  sizeSubtitle: '14pt',
  sizeSectionHeading: '9pt',
  sizeSubsectionTitle: '10.5pt',
  sizeBody: '9.5pt',
  sizeSmall: '8.5pt',
  sizeTiny: '8pt',

  pagePaddingV: '12pt',
  pagePaddingH: '28pt',
  sectionGap: '16pt',
  subsectionGap: '12pt',

  dividerWidth: '1pt',
  dividerColor: '#d0dff5',
};

export const professionalTheme: TemplateTheme = {
  fontDisplay: "'Lora', Georgia, serif",
  fontBody: "'Ubuntu', 'Helvetica Neue', Arial, sans-serif",

  colorBg: '#ffffff',
  colorText: '#1a1a1a',
  colorMuted: '#555',
  colorFaint: '#484848',
  colorAccent: '#1a1a1a',
  colorAccentLight: '#f0f0f0',

  tagSecondaryBg: '#f0f0f0',
  tagSecondaryColor: '#444',
  tagSecondaryBorder: '0.5px solid #d0d0d0',

  sizeTitle: '38px',
  sizeSubtitle: '12px',
  sizeSectionHeading: '21px',
  sizeSubsectionTitle: '13px',
  sizeBody: '12px',
  sizeSmall: '12px',
  sizeTiny: '11px',

  pagePaddingV: '36px',
  pagePaddingH: '48px',
  sectionGap: '26px',
  subsectionGap: '10pt',

  dividerWidth: '1px',
  dividerColor: '#ccc',
};
