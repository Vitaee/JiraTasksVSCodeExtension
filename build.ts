import { build } from "bun";

const watch = process.argv.includes("--watch");

await build({
  entrypoints: ["./src/extension.ts"],
  outdir: "./out",
  target: "node",
  format: "cjs",
  external: ["vscode"],
  minify: true,
  sourcemap: "external"
});

console.log(watch ? "Watching for changes..." : "Extension built successfully via Bun.");
