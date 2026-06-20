import * as React from 'react';
import { LinkedText, ImagesBlock, BoldText } from './shared';
import type { ResumeData, SubSection } from './shared';
import { professionalTheme as t } from './templateThemes';

const HR: React.CSSProperties = {
  border: 'none',
  borderTop: `${t.dividerWidth} solid ${t.dividerColor}`,
  margin: '0',
};

interface Props { resume: ResumeData; }

function T1({ ss }: { ss: SubSection }) {
  return (
    <div style={{ marginBottom: '20pt' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <LinkedText
          text={ss.title ?? ''}
          link={ss.titleLink}
          style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: t.sizeSubsectionTitle, color: t.colorText }}
        />
        {ss.date && (
          <LinkedText
            text={ss.date}
            link={ss.dateLink}
            style={{ fontFamily: t.fontBody, fontWeight: 400, fontSize: t.sizeSubsectionTitle, color: t.colorText, whiteSpace: 'nowrap', marginLeft: '16px' }}
          />
        )}
      </div>
      {ss.subtitle && (
        <LinkedText
          text={ss.subtitle}
          link={ss.subtitleLink}
          style={{ display: 'block', fontFamily: t.fontBody, fontWeight: 400, fontSize: t.sizeBody, color: t.colorMuted, marginTop: '1px' }}
        />
      )}
      {ss.text && (
        <p style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.55, margin: '5px 0 4px 0', textAlign: 'justify' }}>
          <BoldText text={ss.text} />
        </p>
      )}
      {!ss.tagsHidden && ss.tagsPosition === 'top' && ss.tags.filter(tg => tg.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {ss.tags.filter(tg => tg.text).map(tg => (
            <span key={tg.id} style={{ fontFamily: t.fontBody, fontSize: t.sizeTiny, color: t.tagSecondaryColor, background: t.tagSecondaryBg, border: t.tagSecondaryBorder, borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {tg.text}
            </span>
          ))}
        </div>
      )}
      {ss.bullets.filter(b => b.text).length > 0 && (
        <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          {ss.bullets.map(b => b.text && (
            <li key={b.id} style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.55, marginBottom: '7px' }}>
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}
      {!ss.tagsHidden && (ss.tagsPosition ?? 'bottom') === 'bottom' && ss.tags.filter(tg => tg.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
          {ss.tags.filter(tg => tg.text).map(tg => (
            <span key={tg.id} style={{ fontFamily: t.fontBody, fontSize: t.sizeTiny, color: t.tagSecondaryColor, background: t.tagSecondaryBg, border: t.tagSecondaryBorder, borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {tg.text}
            </span>
          ))}
        </div>
      )}
      <ImagesBlock ss={ss} accentColor={t.colorAccent} />
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
          style={{ fontFamily: t.fontBody, fontWeight: 700, fontSize: t.sizeSubsectionTitle, color: t.colorText }}
        />
        {ss.date && (
          <LinkedText
            text={ss.date}
            link={ss.dateLink}
            style={{ fontFamily: t.fontBody, fontWeight: 400, fontSize: t.sizeSubsectionTitle, color: t.colorText, whiteSpace: 'nowrap', marginLeft: '16px' }}
          />
        )}
      </div>
      {ss.subtitle && (
        <LinkedText
          text={ss.subtitle}
          link={ss.subtitleLink}
          style={{ display: 'block', fontFamily: t.fontBody, fontWeight: 400, fontSize: t.sizeBody, color: t.colorFaint, marginTop: '2px' }}
        />
      )}
      {ss.text && (
        <p style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.5, margin: '4px 0 3px 0', textAlign: 'justify' }}>
          <BoldText text={ss.text} />
        </p>
      )}
      {!ss.tagsHidden && ss.tagsPosition === 'top' && ss.tags.filter(tg => tg.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
          {ss.tags.filter(tg => tg.text).map(tg => (
            <span key={tg.id} style={{ fontFamily: t.fontBody, fontSize: t.sizeTiny, color: t.tagSecondaryColor, background: t.tagSecondaryBg, border: t.tagSecondaryBorder, borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {tg.text}
            </span>
          ))}
        </div>
      )}
      {ss.bullets.filter(b => b.text).length > 0 && (
        <ul style={{ margin: '5px 0 0 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          {ss.bullets.map(b => b.text && (
            <li key={b.id} style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.5, marginBottom: '5px' }}>
              <LinkedText text={b.text} link={b.link} />
            </li>
          ))}
        </ul>
      )}
      {!ss.tagsHidden && (ss.tagsPosition ?? 'bottom') === 'bottom' && ss.tags.filter(tg => tg.text).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '5px' }}>
          {ss.tags.filter(tg => tg.text).map(tg => (
            <span key={tg.id} style={{ fontFamily: t.fontBody, fontSize: t.sizeTiny, color: t.tagSecondaryColor, background: t.tagSecondaryBg, border: t.tagSecondaryBorder, borderRadius: '3px', padding: '1px 7px', lineHeight: 1.6 }}>
              {tg.text}
            </span>
          ))}
        </div>
      )}
      <ImagesBlock ss={ss} accentColor={t.colorAccent} />
    </div>
  );
}

function T3({ ss }: { ss: SubSection }) {
  const items = [
    ...ss.bullets.filter(b => b.text).map(b => ({ text: b.text, link: b.link })),
    ...(ss.tagsHidden ? [] : ss.tags.filter(tg => tg.text).map(tg => ({ text: tg.text, link: undefined }))),
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
          style={{ display: 'block', fontFamily: t.fontBody, fontWeight: 700, fontSize: t.sizeSubsectionTitle, color: t.colorText, marginBottom: '6px' }}
        />
      )}
      {ss.text && (
        <p style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.5, margin: '0 0 5px 0', textAlign: 'justify' }}>
          <BoldText text={ss.text} />
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {columns.map((col, ci) => (
          <ul key={ci} style={{ margin: 0, paddingLeft: '18px', listStyleType: 'disc' }}>
            {col.map((item, ii) => (
              <li key={ii} style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorText, lineHeight: 1.5, marginBottom: '5px' }}>
                <LinkedText text={item.text} link={item.link} />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <ImagesBlock ss={ss} accentColor={t.colorAccent} />
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
        fontFamily: t.fontBody,
        fontSize: t.sizeBody,
        color: t.colorText,
        backgroundColor: t.colorBg,
        padding: `${t.pagePaddingV} ${t.pagePaddingH}`,
        minHeight: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: resume.title ? '0' : '0' }}>
        {resume.photo && (
          <img
            src={resume.photo}
            alt=""
            style={{
              width: '60pt',
              height: '60pt',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        )}
        {resume.title && (
          <LinkedText
            text={resume.title}
            link={resume.titleLink}
            style={{
              display: 'block',
              fontFamily: t.fontDisplay,
              fontSize: t.sizeTitle,
              fontWeight: 400,
              color: t.colorText,
              lineHeight: 1.1,
              marginBottom: '10px',
            }}
          />
        )}
      </div>

      <hr style={HR} />

      {resume.contacts.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            fontFamily: t.fontBody,
            fontSize: t.sizeBody,
            color: t.colorMuted,
            margin: '8px 0 0 0',
          }}
        >
          {resume.contacts.map((c, i) => (
            <React.Fragment key={c.id}>
              {i > 0 && <span style={{ margin: '0 7px', color: '#888' }}>â€¢</span>}
              <LinkedText text={c.text} link={c.link} style={{ color: t.colorMuted }} />
            </React.Fragment>
          ))}
        </div>
      )}

      {resume.subtitle && (
        <div style={{ marginTop: '6px' }}>
          <LinkedText
            text={resume.subtitle}
            link={resume.subtitleLink}
            style={{ fontFamily: t.fontBody, fontSize: t.sizeBody, color: t.colorMuted, fontStyle: 'italic' }}
          />
        </div>
      )}

      {resume.sections.map(section => (
        <div key={section.id} style={{ marginTop: t.sectionGap }}>
          {section.title && (
            <div style={{ marginBottom: '8px' }}>
              <LinkedText
                text={section.title}
                link={section.titleLink}
                style={{
                  display: 'block',
                  fontFamily: t.fontDisplay,
                  fontSize: t.sizeSectionHeading,
                  fontWeight: 400,
                  color: t.colorText,
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
