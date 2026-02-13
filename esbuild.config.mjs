import { build, context } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes("--watch");

// Build sandbox (code.ts -> dist/code.js)
const sandboxOptions = {
  entryPoints: [join(__dirname, "src/code.ts")],
  bundle: true,
  outfile: join(__dirname, "dist/code.js"),
  format: "iife",
  target: "es2017",
  platform: "browser",
};

// Build UI (index.tsx -> dist/ui.js, then inline into HTML)
const uiOptions = {
  entryPoints: [join(__dirname, "src/ui/index.tsx")],
  bundle: true,
  outfile: join(__dirname, "dist/ui.js"),
  format: "iife",
  target: "es2020",
  platform: "browser",
  jsx: "automatic",
  jsxImportSource: "react",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

function inlineHtml() {
  const htmlTemplate = readFileSync(
    join(__dirname, "src/ui/index.html"),
    "utf8"
  );
  const jsBundle = readFileSync(join(__dirname, "dist/ui.js"), "utf8");
  const finalHtml = htmlTemplate.replace(
    "<!-- INLINE_SCRIPT -->",
    `<script>${jsBundle}</script>`
  );
  writeFileSync(join(__dirname, "dist/ui.html"), finalHtml);
  console.log("✓ dist/ui.html generated");
}

async function run() {
  mkdirSync(join(__dirname, "dist"), { recursive: true });

  if (isWatch) {
    const sandboxCtx = await context(sandboxOptions);
    const uiCtx = await context({
      ...uiOptions,
      plugins: [
        {
          name: "inline-html",
          setup(build) {
            build.onEnd(() => {
              try {
                inlineHtml();
              } catch (e) {
                console.error("HTML inline failed:", e.message);
              }
            });
          },
        },
      ],
    });
    await sandboxCtx.watch();
    await uiCtx.watch();
    console.log("Watching for changes...");
  } else {
    await build(sandboxOptions);
    console.log("✓ dist/code.js built");
    await build(uiOptions);
    console.log("✓ dist/ui.js built");
    inlineHtml();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
