import { readFile, stat } from "node:fs/promises";

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
const pkg = JSON.parse(await readFile("package.json", "utf8"));
if (manifest.version !== pkg.version) throw new Error("Manifest and package versions differ");
if (manifest.id !== "second-brain-lab") throw new Error("Unexpected plugin ID");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error("Invalid release version");
for (const filename of ["main.js", "manifest.json", "styles.css"]) {
  const details = await stat(filename);
  if (!details.isFile() || details.size === 0) throw new Error(`Missing release asset: ${filename}`);
}
const bundle = await readFile("main.js", "utf8");
for (const forbidden of ["/api/graph", "graph-en.json", "graph-ko.json", "127.0.0.1:5173"]) {
  if (bundle.includes(forbidden)) throw new Error(`Development viewer dependency found: ${forbidden}`);
}
if (!bundle.includes("Copyright © 2010-2025 three.js authors"))
  throw new Error("Three.js license notice missing from release bundle");
console.log(`Release assets valid for ${manifest.id} ${manifest.version}`);
