import { Asset, AssetTreeNode } from '../types';

export function buildTree(assets: Asset[]): AssetTreeNode[] {
  const map = new Map<string, AssetTreeNode>();
  const roots: AssetTreeNode[] = [];

  assets.forEach(asset => {
    map.set(asset.id, { ...asset, children: [], depth: 0, path: [asset.id] });
  });

  assets.forEach(asset => {
    const node = map.get(asset.id)!;
    if (asset.parentId && map.has(asset.parentId)) {
      map.get(asset.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  function calcDepth(node: AssetTreeNode, depth: number, parentPath: string[]) {
    node.depth = depth;
    node.path = [...parentPath, node.id];
    node.children.forEach(child => calcDepth(child, depth + 1, node.path));
  }
  roots.forEach(r => calcDepth(r, 0, []));

  function sortTree(nodes: AssetTreeNode[]) {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => sortTree(n.children));
  }
  sortTree(roots);

  return roots;
}

export function searchTree(nodes: AssetTreeNode[], query: string): AssetTreeNode[] {
  if (!query.trim()) return nodes;
  const q = query.toLowerCase();
  return nodes.reduce<AssetTreeNode[]>((acc, node) => {
    const matches = node.name.toLowerCase().includes(q) || (node.code || '').toLowerCase().includes(q);
    const matchingChildren = searchTree(node.children, query);
    if (matches || matchingChildren.length > 0) {
      acc.push({ ...node, children: matchingChildren });
    }
    return acc;
  }, []);
}

export function flattenTree(nodes: AssetTreeNode[]): AssetTreeNode[] {
  let flat: AssetTreeNode[] = [];
  nodes.forEach(node => {
    flat.push(node);
    if (node.children.length > 0) flat = flat.concat(flattenTree(node.children));
  });
  return flat;
}

export function findAncestors(id: string, assets: Asset[]): Asset[] {
  const ancestors: Asset[] = [];
  let currentId: string | null = id;
  while (currentId) {
    const asset = assets.find(a => a.id === currentId);
    if (!asset || !asset.parentId) break;
    const parent = assets.find(a => a.id === asset.parentId);
    if (parent) { ancestors.unshift(parent); currentId = parent.id; }
    else break;
  }
  return ancestors;
}
