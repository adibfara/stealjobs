import * as React from 'react';
import { LinkedText, TemplateIcon } from './shared';
import type { ResumeData, SubSection } from './shared';

interface Props {
  resume: ResumeData;
}

function SubSectionRender({ ss }: { ss: SubSection }) {
  const hasTitleRow = ss.title || ss.subtitle || ss.date;
  const showSubtitle = ss.type !== 2 && ss.subtitle;

  return (
    <div style={{ marginBottom: '10pt' }}>
      {hasTitleRow && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
          <div style={{ flex: 1 }}>
            {ss.title && (
              <LinkedText
                text={ss.title}
                link={ss.titleLink}
                style={{ fontWeight: 600, fontSize: '10.5pt', color: '#111' }}
              />
            )}
            {showSubtitle && (
              <>
                {ss.title && <span style={{ color: '#555', fontSize: '10pt' }}> · </span>}
                <LinkedText
                  text={ss.subtitle}
                  link={ss.subtitleLink}
                  style={{ fontStyle: 'italic', fontSize: '10pt', color: '#444' }}
                />
              </>
            )}
          </div>
          {ss.date && (
            <LinkedText
              text={ss.date}
              link={ss.dateLink}
              style={{ fontSize: '9.5pt', color: '#666', marginLeft: '12pt', whiteSpace: 'nowrap' }}
            />
          )}
        </div>
      )}

      {/* Type 3: show tags prominently after title */}
      {ss.type === 3 && ss.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt', marginBottom: '4pt' }}>
          {ss.tags.map(tag => (
            <span
              key={tag.id}
              style={{
                fontSize: '8.5pt',
                background: '#f0f0f0',
                border: '0.5pt solid #ddd',
                borderRadius: '3pt',
                padding: '1pt 5pt',
                color: '#333',
              }}
            >
              {tag.text}
            </span>
          ))}
        </div>
      )}

      {/* Text */}
      {ss.text && (
        <p style={{ margin: '3pt 0 4pt 0', fontSize: '10pt', color: '#222', lineHeight: 1.4, textAlign: 'justify' }}>
          {ss.text}
        </p>
      )}

      {/* Bullets */}
      {ss.bullets.length > 0 && (
        <ul style={{ margin: '3pt 0 0 0', paddingLeft: '14pt', listStyleType: 'disc' }}>
          {ss.bullets.map(b => b.text && (
            <li key={b.id} style={{ fontSize: '10pt', color: '#222', marginBottom: '2pt', lineHeight: 1.4 }}>
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}

      {/* Type 1 & 2: tags at bottom */}
      {ss.type !== 3 && ss.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt', marginTop: '4pt' }}>
          {ss.tags.map(tag => (
            <span
              key={tag.id}
              style={{
                fontSize: '8.5pt',
                background: '#f5f5f5',
                border: '0.5pt solid #e0e0e0',
                borderRadius: '3pt',
                padding: '1pt 5pt',
                color: '#444',
              }}
            >
              {tag.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ClassicTemplate({ resume }: Props) {
  return (
    <div
      style={{
        fontFamily: "'Crimson Pro', 'EB Garamond', Georgia, serif",
        fontSize: '10.5pt',
        color: '#111',
        backgroundColor: '#fff',
        padding: '36pt 48pt',
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '16pt' }}>
        {resume.title && (
          <LinkedText
            text={resume.title}
            link={resume.titleLink}
            style={{
              display: 'block',
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: '26pt',
              fontWeight: 400,
              letterSpacing: '-0.5pt',
              color: '#111',
              lineHeight: 1.1,
              marginBottom: '4pt',
            }}
          />
        )}
        {resume.subtitle && (
          <LinkedText
            text={resume.subtitle}
            link={resume.subtitleLink}
            style={{
              display: 'block',
              fontSize: '12pt',
              fontStyle: 'italic',
              color: '#555',
              marginBottom: '8pt',
            }}
          />
        )}

        {/* Contacts */}
        {resume.contacts.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '4pt 12pt',
              fontSize: '9.5pt',
              color: '#444',
              marginTop: '6pt',
            }}
          >
            {resume.contacts.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 && <span style={{ color: '#bbb' }}>·</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
                  <TemplateIcon name={c.icon} size={10} />
                  <LinkedText text={c.text} link={c.link} style={{ color: '#333' }} />
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1.5pt solid #111', marginBottom: '14pt' }} />

      {/* Sections */}
      {resume.sections.map(section => (
        <div key={section.id} style={{ marginBottom: '14pt' }}>
          {section.title && (
            <div style={{ marginBottom: '6pt' }}>
              <LinkedText
                text={section.title}
                link={section.titleLink}
                style={{
                  display: 'block',
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: '12.5pt',
                  fontWeight: 400,
                  letterSpacing: '0.5pt',
                  textTransform: 'uppercase',
                  color: '#111',
                  borderBottom: '0.5pt solid #ccc',
                  paddingBottom: '3pt',
                  marginBottom: '6pt',
                }}
              />
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
