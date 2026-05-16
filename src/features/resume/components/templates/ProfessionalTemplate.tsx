import * as React from 'react';
import { LinkedText, ImagesBlock } from './shared';
import type { ResumeData, SubSection } from './shared';

const SERIF = "'Lora', Georgia, serif";
const SANS = "'Ubuntu', 'Helvetica Neue', Arial, sans-serif";

const HR: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #ccc',
  margin: '0',
};

interface Props { resume: ResumeData; }

function T1({ ss }: { ss: SubSection }) {
  return (
    <div style={{ marginBottom: '20pt' }}>
      {/* Job title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <LinkedText
          text={ss.title ?? ''}
          link={ss.titleLink}
          style={{ fontFamily: SANS, fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}
        />
        {ss.date && (
          <LinkedText
            text={ss.date}
            link={ss.dateLink}
            style={{ fontFamily: SANS, fontWeight: 400, fontSize: '13px', color: '#1a1a1a', whiteSpace: 'nowrap', marginLeft: '16px' }}
          />
        )}
      </div>
      {/* Company / location */}
      {ss.subtitle && (
        <LinkedText
          text={ss.subtitle}
          link={ss.subtitleLink}
          style={{ display: 'block', fontFamily: SANS, fontWeight: 400, fontSize: '12px', color: '#555', marginTop: '1px' }}
        />
      )}
      {ss.text && (
        <p style={{ fontFamily: SANS, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.55, margin: '5px 0 4px 0', textAlign: 'justify' }}>
          {ss.text}
        </p>
      )}
      {ss.tagsPosition === 'top' && ss.tags.filter(t => t.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {ss.tags.filter(t => t.text).map(t => (
            <span key={t.id} style={{ fontFamily: SANS, fontSize: '11px', color: '#444', background: '#f0f0f0', border: '0.5px solid #d0d0d0', borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {t.text}
            </span>
          ))}
        </div>
      )}
      {/* Bullets */}
      {ss.bullets.filter(b => b.text).length > 0 && (
        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          {ss.bullets.map(b => b.text && (
            <li key={b.id} style={{ fontFamily: SANS, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.55, marginBottom: '7px' }}>
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}
      {(ss.tagsPosition ?? 'bottom') === 'bottom' && ss.tags.filter(t => t.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
          {ss.tags.filter(t => t.text).map(t => (
            <span key={t.id} style={{ fontFamily: SANS, fontSize: '11px', color: '#444', background: '#f0f0f0', border: '0.5px solid #d0d0d0', borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {t.text}
            </span>
          ))}
        </div>
      )}
      <ImagesBlock ss={ss} accentColor="#1a1a1a" />
    </div>
  );
}

function T2({ ss }: { ss: SubSection }) {
  return (
    <div style={{ marginBottom: '10pt' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <LinkedText
          text={ss.title ?? ''}
          link={ss.titleLink}
          style={{ fontFamily: SANS, fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}
        />
        {ss.date && (
          <LinkedText
            text={ss.date}
            link={ss.dateLink}
            style={{ fontFamily: SANS, fontWeight: 400, fontSize: '13px', color: '#1a1a1a', whiteSpace: 'nowrap', marginLeft: '16px' }}
          />
        )}
      </div>
      {ss.subtitle && (
        <LinkedText
          text={ss.subtitle}
          link={ss.subtitleLink}
          style={{ display: 'block', fontFamily: SANS, fontWeight: 400, fontSize: '12px', color: '#484848', marginTop: '2px' }}
        />
      )}
      {ss.text && (
        <p style={{ fontFamily: SANS, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.5, margin: '4px 0 3px 0', textAlign: 'justify' }}>
          {ss.text}
        </p>
      )}
      {ss.tagsPosition === 'top' && ss.tags.filter(t => t.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {ss.tags.filter(t => t.text).map(t => (
            <span key={t.id} style={{ fontFamily: SANS, fontSize: '11px', color: '#444', background: '#f0f0f0', border: '0.5px solid #d0d0d0', borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {t.text}
            </span>
          ))}
        </div>
      )}
      {ss.bullets.filter(b => b.text).length > 0 && (
        <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          {ss.bullets.map(b => b.text && (
            <li key={b.id} style={{ fontFamily: SANS, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.5, marginBottom: '5px' }}>
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}
      {(ss.tagsPosition ?? 'bottom') === 'bottom' && ss.tags.filter(t => t.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
          {ss.tags.filter(t => t.text).map(t => (
            <span key={t.id} style={{ fontFamily: SANS, fontSize: '11px', color: '#444', background: '#f0f0f0', border: '0.5px solid #d0d0d0', borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {t.text}
            </span>
          ))}
        </div>
      )}
      <ImagesBlock ss={ss} accentColor="#1a1a1a" />
    </div>
  );
}

function T3({ ss }: { ss: SubSection }) {
  const items = [
    ...ss.bullets.filter(b => b.text).map(b => ({ text: b.text, link: b.link })),
    ...ss.tags.filter(t => t.text).map(t => ({ text: t.text, link: undefined })),
  ];
  if (items.length === 0) return null;

  const cols = 3;
  const perCol = Math.ceil(items.length / cols);
  const columns = Array.from({ length: cols }, (_, i) => items.slice(i * perCol, (i + 1) * perCol));

  return (
    <div style={{ marginBottom: '6px' }}>
      {ss.title && (
        <LinkedText
          text={ss.title}
          link={ss.titleLink}
          style={{ display: 'block', fontFamily: SANS, fontWeight: 700, fontSize: '13px', color: '#1a1a1a', marginBottom: '6px' }}
        />
      )}
      {ss.text && (
        <p style={{ fontFamily: SANS, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.5, margin: '0 0 5px 0', textAlign: 'justify' }}>
          {ss.text}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {columns.map((col, ci) => (
          <ul key={ci} style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
            {col.map((item, ii) => (
              <li key={ii} style={{ fontFamily: SANS, fontSize: '12px', color: '#1a1a1a', lineHeight: 1.5, marginBottom: '5px' }}>
                <LinkedText text={item.text} link={item.link} />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <ImagesBlock ss={ss} accentColor="#1a1a1a" />
    </div>
  );
}

function SubSectionRender({ ss }: { ss: SubSection }) {
  if (ss.type === 3) return <T3 ss={ss} />;
  if (ss.type === 2) return <T2 ss={ss} />;
  return <T1 ss={ss} />;
}

export function ProfessionalTemplate({ resume }: Props) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: '13px',
        color: '#1a1a1a',
        backgroundColor: '#ffffff',
        padding: '36px 48px',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Name */}
      {resume.title && (
        <LinkedText
          text={resume.title}
          link={resume.titleLink}
          style={{
            display: 'block',
            fontFamily: SERIF,
            fontSize: '38px',
            fontWeight: 400,
            color: '#1a1a1a',
            lineHeight: 1.1,
            marginBottom: '10px',
          }}
        />
      )}

      {/* HR between name and contacts */}
      <hr style={HR} />

      {/* Contacts */}
      {resume.contacts.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontFamily: SANS,
            fontSize: '12px',
            color: '#555',
            margin: '8px 0 0 0',
          }}
        >
          {resume.contacts.map((c, i) => (
            <React.Fragment key={c.id}>
              {i > 0 && <span style={{ margin: '0 7px', color: '#888' }}>•</span>}
              <LinkedText text={c.text} link={c.link} style={{ color: '#555' }} />
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Subtitle / tagline */}
      {resume.subtitle && (
        <div style={{ marginTop: '6px' }}>
          <LinkedText
            text={resume.subtitle}
            link={resume.subtitleLink}
            style={{ fontFamily: SANS, fontSize: '12px', color: '#555', fontStyle: 'italic' }}
          />
        </div>
      )}

      {/* Sections */}
      {resume.sections.map(section => (
        <div key={section.id} style={{ marginTop: '26px' }}>
          {section.title && (
            <div style={{ marginBottom: '8px' }}>
              <LinkedText
                text={section.title}
                link={section.titleLink}
                style={{
                  display: 'block',
                  fontFamily: SERIF,
                  fontSize: '21px',
                  fontWeight: 400,
                  color: '#1a1a1a',
                  marginBottom: '4px',
                }}
              />
              <hr style={HR} />
            </div>
          )}
          {section.subsections.map(ss => (
            <SubSectionRender key={ss.id} ss={ss} />
          ))}
        </div>
      ))}
    </div>
  );
}
