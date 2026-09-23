import assert from "node:assert/strict";
import test from "node:test";
import { buildGraph, type NoteFile } from "../src/graph";

const files: NoteFile[] = [
  { path: "index.md", basename: "index" },
  { path: "knowledge/react/Effects.md", basename: "Effects" },
  { path: "knowledge/react/State.md", basename: "State" },
  { path: "knowledge/codex/Checks.md", basename: "Checks" },
];
const links = {
  "index.md": { "knowledge/react/Effects.md": 1 },
  "knowledge/react/Effects.md": {
    "index.md": 1,
    "knowledge/react/State.md": 2,
    "deleted.md": 1,
  },
  "knowledge/react/State.md": { "knowledge/react/Effects.md": 1 },
};

test("empty vault creates an empty graph", () => {
  assert.deepEqual(buildGraph([], {}, { folder: "", maxNotes: 100 }), {
    nodes: [], edges: [], totalMatching: 0, omitted: 0,
  });
});

test("resolved links are deduplicated and exclude missing files", () => {
  const graph = buildGraph(files, links, { folder: "", maxNotes: 100 });
  assert.equal(graph.nodes.length, 4);
  assert.equal(graph.edges.length, 2);
  assert.ok(graph.edges.some((edge) => edge.source === "index.md"));
  assert.ok(graph.edges.every((edge) => edge.target !== "deleted.md"));
});

test("folder filter stays inside a path segment", () => {
  const graph = buildGraph(
    [...files, { path: "knowledge/react-extra/Other.md", basename: "Other" }],
    links,
    { folder: "/knowledge/react/", maxNotes: 100 },
  );
  assert.deepEqual(graph.nodes.map((node) => node.id), [
    "knowledge/react/Effects.md", "knowledge/react/State.md",
  ]);
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.nodes[0]?.group, "react");
});

test("note cap is deterministic and reports omitted count", () => {
  const graph = buildGraph(files, links, { folder: "", maxNotes: 2 });
  assert.deepEqual(graph.nodes.map((node) => node.id), [
    "index.md", "knowledge/codex/Checks.md",
  ]);
  assert.equal(graph.omitted, 2);
  assert.equal(graph.totalMatching, 4);
  assert.equal(graph.edges.length, 0);
});

test("rebuilding after a rename or delete changes the graph without stale links", () => {
  const renamed = files
    .filter((file) => file.path !== "knowledge/react/State.md")
    .concat({ path: "knowledge/react/Local state.md", basename: "Local state" });
  const graph = buildGraph(renamed, links, { folder: "", maxNotes: 100 });
  assert.equal(graph.nodes.length, 4);
  assert.ok(graph.nodes.some((node) => node.id.endsWith("Local state.md")));
  assert.equal(graph.edges.length, 1);
});
