import { genId } from '@/lib/resumeStorage';
import type { NodeKind, NodeStyle, ThemeNode } from '@/types/theme';

const DEFAULT_STYLE: Record<NodeKind, NodeStyle> = {
  row: { direction: 'row', gap: 6, align: 'center' },
  column: { direction: 'column', gap: 4 },
  box: { widthMode: 'fixed', widthValue: 40 },
  text: { fontSize: 10, color: 'text' },
  image: { imageWidth: 60, imageHeight: 60 },
  bullets: { fontSize: 9.5, color: 'faint', gap: 2, bulletMarker: 'dot' },
  icon: { iconSize: 12, color: 'muted' },
};

export function createNode(kind: NodeKind): ThemeNode {
  const isContainer = kind === 'row' || kind === 'column' || kind === 'box';
  return {
    id: genId(),
    kind,
    style: { ...DEFAULT_STYLE[kind] },
    children: isContainer ? [] : undefined,
    binding: kind === 'text' ? { literal: 'Text' } : undefined,
  };
}

export function findNode(root: ThemeNode, id: string): ThemeNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function nodePath(root: ThemeNode, id: string): ThemeNode[] | null {
  if (root.id === id) return [root];
  for (const child of root.children ?? []) {
    const found = nodePath(child, id);
    if (found) return [root, ...found];
  }
  return null;
}

export function findParent(root: ThemeNode, id: string): { parent: ThemeNode; index: number } | null {
  for (let i = 0; i < (root.children ?? []).length; i++) {
    const child = root.children![i];
    if (child.id === id) return { parent: root, index: i };
    const found = findParent(child, id);
    if (found) return found;
  }
  return null;
}

export function updateNode(root: ThemeNode, id: string, patch: Partial<ThemeNode>): ThemeNode {
  if (root.id === id) return { ...root, ...patch };
  if (!root.children) return root;
  return { ...root, children: root.children.map(c => updateNode(c, id, patch)) };
}

export function removeNode(root: ThemeNode, id: string): ThemeNode {
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.filter(c => c.id !== id).map(c => removeNode(c, id)),
  };
}

export function insertAt(root: ThemeNode, parentId: string, index: number, node: ThemeNode): ThemeNode {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])];
    children.splice(index, 0, node);
    return { ...root, children };
  }
  if (!root.children) return root;
  return { ...root, children: root.children.map(c => insertAt(c, parentId, index, node)) };
}

export function moveNodeAt(root: ThemeNode, id: string, parentId: string, index: number): ThemeNode {
  const node = findNode(root, id);
  if (!node) return root;
  const containsSelf = findNode(node, parentId);
  if (containsSelf) return root; // can't move a node inside its own subtree
  const withoutNode = removeNode(root, id);
  return insertAt(withoutNode, parentId, index, node);
}
