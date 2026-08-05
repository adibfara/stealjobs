import type { Binding, RepeatSource, ThemeNode } from '@/types/theme';

export type ScopeSet = Set<RepeatSource>;

function walk(node: ThemeNode, targetId: string, ancestors: RepeatSource[]): RepeatSource[] | null {
  if (node.id === targetId) return ancestors;
  const next = node.repeat ? [...ancestors, node.repeat] : ancestors;
  for (const child of node.children ?? []) {
    const found = walk(child, targetId, next);
    if (found) return found;
  }
  return null;
}

/** Repeat scopes active for the node's ancestors (not including the node's own repeat). */
export function ancestorScope(root: ThemeNode, targetId: string): ScopeSet {
  return new Set(walk(root, targetId, []) ?? []);
}

/** Repeat scopes active for resolving the node's own bindings (includes its own repeat). */
export function ownScope(root: ThemeNode, targetId: string): ScopeSet {
  const node = findNodeShallow(root, targetId);
  const ancestors = ancestorScope(root, targetId);
  if (node?.repeat) ancestors.add(node.repeat);
  return ancestors;
}

function findNodeShallow(node: ThemeNode, id: string): ThemeNode | null {
  if (node.id === id) return node;
  for (const child of node.children ?? []) {
    const found = findNodeShallow(child, id);
    if (found) return found;
  }
  return null;
}

const REPEAT_REQUIRES: Record<RepeatSource, RepeatSource | null> = {
  contacts: null,
  sections: null,
  subsections: 'sections',
  bullets: 'subsections',
  tags: 'subsections',
  images: 'subsections',
};

export function availableRepeatOptions(scope: ScopeSet): RepeatSource[] {
  return (Object.keys(REPEAT_REQUIRES) as RepeatSource[]).filter(r => {
    const req = REPEAT_REQUIRES[r];
    return !req || scope.has(req);
  });
}

const BINDING_SCOPE: { binding: Binding; requires: RepeatSource | null }[] = [
  { binding: 'resume.title', requires: null },
  { binding: 'resume.subtitle', requires: null },
  { binding: 'resume.photo', requires: null },
  { binding: 'resume.name', requires: null },
  { binding: 'contact.icon', requires: 'contacts' },
  { binding: 'contact.text', requires: 'contacts' },
  { binding: 'section.title', requires: 'sections' },
  { binding: 'subsection.title', requires: 'subsections' },
  { binding: 'subsection.subtitle', requires: 'subsections' },
  { binding: 'subsection.date', requires: 'subsections' },
  { binding: 'subsection.text', requires: 'subsections' },
  { binding: 'bullet.text', requires: 'bullets' },
  { binding: 'tag.text', requires: 'tags' },
  { binding: 'image.title', requires: 'images' },
  { binding: 'image.subtitle', requires: 'images' },
  { binding: 'image.imageLink', requires: 'images' },
];

export function availableBindings(scope: ScopeSet): Binding[] {
  return BINDING_SCOPE.filter(b => !b.requires || scope.has(b.requires)).map(b => b.binding);
}
