export interface NoteFile {
  path: string;
  basename: string;
}

export interface GraphNode {
  id: string;
  title: string;
  group: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface BrainGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalMatching: number;
  omitted: number;
}

export interface GraphOptions {
  folder: string;
  maxNotes: number;
}

export type ResolvedLinks = Record<string, Record<string, number>>;

function normalizedFolder(value: string): string {
  return value.trim().replace(/^\/+|\/+$/g, "").replace(/\\/g, "/");
}

function groupFor(path: string): string {
  const parts = path.split("/");
  if (parts.length === 1) return "root";
  if (parts[0] === "knowledge" && parts.length > 2) return parts[1];
  return parts[0];
}

export function buildGraph(
  files: NoteFile[],
  resolvedLinks: ResolvedLinks,
  options: GraphOptions,
): BrainGraph {
  const folder = normalizedFolder(options.folder);
  const cap = Math.max(1, Math.floor(options.maxNotes));
  const matching = files
    .filter((file) => !folder || file.path.startsWith(`${folder}/`))
    .sort((a, b) => a.path.localeCompare(b.path));
  const selected = matching.slice(0, cap);
  const included = new Set(selected.map((file) => file.path));
  const nodes = selected.map((file) => ({
    id: file.path,
    title: file.basename,
    group: groupFor(file.path),
  }));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  for (const source of selected) {
    for (const [target, count] of Object.entries(resolvedLinks[source.path] ?? {})) {
      if (count <= 0 || !included.has(target) || source.path === target) continue;
      const key = [source.path, target].sort().join("\0");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ source: source.path, target });
    }
  }
  return {
    nodes,
    edges,
    totalMatching: matching.length,
    omitted: Math.max(0, matching.length - selected.length),
  };
}
