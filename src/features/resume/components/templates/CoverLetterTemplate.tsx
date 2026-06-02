import type { ResumeData } from '@/types/resume';
import { LinkedText } from './shared';

export function CoverLetterTemplate({ resume }: { resume: ResumeData }) {
  const contacts = resume.contacts.filter(c => c.text);

  const paragraphs = resume.sections.flatMap(section =>
    section.subsections.flatMap(sub => {
      const texts: string[] = [];
      if (sub.text) texts.push(sub.text);
      sub.bullets.forEach(b => { if (b.text) texts.push(b.text); });
      return texts;
    })
  ).filter(Boolean);

  return (
    <div style={{
      fontFamily: "'Inter', 'Calibri', sans-serif",
      fontSize: '13.5pt',
      color: '#1A1A1A',
      lineHeight: 1.3,
      padding: '2.5cm',
      backgroundColor: '#fff',
      minHeight: '29.7cm',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div>
          <div style={{ fontSize: '32pt', fontWeight: 600, color: '#1A1A1A' }}>
          {resume.name || resume.title || ''}
        </div>
        {contacts.length > 0 && (
          <div style={{ fontSize: '9.5pt', color: '#666666', marginTop: '4pt' }}>
            {contacts.map((c, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <LinkedText text={c.text} link={c.link} style={{ color: '#666666' }} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rule */}
      <div style={{
        borderTop: '1px solid #E0E0E0',
        marginTop: '10pt',
        marginBottom: '10pt',
      }} />

      {/* Body paragraphs */}
      <div>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ marginBottom: '10pt', marginTop: 0 }}>{p}</p>
        ))}
      </div>

      {/* Closing */}
      {paragraphs.length > 0 && (
        <div style={{ marginTop: '20pt' }}>
          {resume.name || resume.title || ''}
        </div>
      )}
    </div>
  );
}
