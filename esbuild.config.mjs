import { build, context } from "esbuild";

const production = process.argv.includes("production");
const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "main.js",
  format: "cjs",
  platform: "browser",
  target: "es2020",
  external: ["obsidian", "electron"],
  sourcemap: production ? false : "inline",
  minify: production,
  logLevel: "info",
  define: { "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development") },
};

if (production) await build(options);
else {
  const ctx = await context(options);
  await ctx.watch();
}
