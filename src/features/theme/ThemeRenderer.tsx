import * as React from 'react';
import type { ThemeData, ThemeNode } from '@/types/theme';
import type { ResumeData } from '@/types/resume';
import { LinkedText, TemplateIcon } from '@/features/resume/components/templates/shared';
import { nodeStyleToCss, resolveColor, imageDimensionStyle } from './nodeStyleToCss';
import {
  resolveBinding, resolveCollection, extendScope, evalCondition, itemKey, type Scope,
} from './resolve';

export function ThemeRenderer({ theme, resume }: { theme: ThemeData; resume: ResumeData }) {
  const scope: Scope = { resume };
  return (
    <div
      style={{
        background: resolveColor(theme.page.background, theme.palette),
        padding: `${theme.page.paddingV}pt ${theme.page.paddingH}pt`,
        minHeight: '100%',
      }}
    >
      {renderNode(theme.root, scope, theme)}
    </div>
  );
}

function renderNode(node: ThemeNode, scope: Scope, theme: ThemeData): React.ReactNode {
  if (node.visibleWhen && !evalCondition(node.visibleWhen, scope)) return null;

  if (node.repeat) {
    const collection = resolveCollection(node.repeat, scope);
    return (
      <React.Fragment key={node.id}>
        {collection.map((item, i) => {
          const childScope = extendScope(scope, node.repeat!, item);
          return <React.Fragment key={itemKey(item, i)}>{renderNodeBody(node, childScope, theme)}</React.Fragment>;
        })}
      </React.Fragment>
    );
  }

  return <React.Fragment key={node.id}>{renderNodeBody(node, scope, theme)}</React.Fragment>;
}

function renderNodeBody(node: ThemeNode, scope: Scope, theme: ThemeData): React.ReactNode {
  const css = nodeStyleToCss(node.style, theme.palette, node.kind, theme.styleSet);

  if (node.kind === 'row' || node.kind === 'column' || node.kind === 'box') {
    return (
      <div style={css}>
        {(node.children ?? []).map(child => renderNode(child, scope, theme))}
      </div>
    );
  }

  if (node.kind === 'text') {
    const r = resolveBinding(node.binding, scope);
    if (!r.text) return null;
    return <LinkedText text={r.text} link={r.link} style={css} />;
  }

  if (node.kind === 'icon') {
    const r = resolveBinding(node.binding, scope);
    const iconName = r.icon ?? node.style.iconName ?? 'Link';
    return (
      <span style={{ ...css, display: 'inline-flex', alignItems: 'center' }}>
        <TemplateIcon name={iconName} size={node.style.iconSize ?? 12} />
      </span>
    );
  }

  if (node.kind === 'image') {
    const r = resolveBinding(node.binding, scope);
    if (!r.src) return null;
    return <img src={r.src} alt="" style={{ ...css, ...imageDimensionStyle(node.style) }} />;
  }

  if (node.kind === 'bullets') {
    const bullets = (scope.subsection?.bullets ?? []).filter(b => b.text);
    if (bullets.length === 0) return null;
    return (
      <ul style={{ margin: 0, padding: 0, listStyleType: 'none', ...css, display: 'flex', flexDirection: 'column' }}>
        {bullets.map(b => (
          <li key={b.id} style={{ position: 'relative', paddingLeft: node.style.bulletMarker === 'none' ? 0 : '10pt' }}>
            {node.style.bulletMarker !== 'none' && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '5pt',
                  width: '4pt',
                  height: '4pt',
                  borderRadius: '50%',
                  background: resolveColor(node.style.color ?? 'accent', theme.palette),
                }}
              />
            )}
            <LinkedText text={b.text} link={b.link} />
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
