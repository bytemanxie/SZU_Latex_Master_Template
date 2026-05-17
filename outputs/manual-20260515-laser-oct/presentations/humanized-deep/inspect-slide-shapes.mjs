import fs from "node:fs/promises";
import path from "node:path";
import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const pptx = process.argv[2];
const needle = process.argv[3];
if (!pptx || !needle) {
  throw new Error("Usage: node inspect-slide-shapes.mjs <pptx> <slide-text-needle>");
}

const previewDir = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/humanized-deep/inspect-preview";
const presentation = await PresentationFile.importPptx(await FileBlob.load(pptx));

function shapeText(shape) {
  if (!shape?.text) return "";
  const value = String(shape.text);
  return value === "[object Object]" ? "" : value;
}

const slide = presentation.slides.items.find((candidate) =>
  candidate.shapes.items.some((shape) => shapeText(shape).includes(needle)),
);
if (!slide) throw new Error(`Slide not found: ${needle}`);

console.log("slide index", slide.index);
for (const shape of slide.shapes.items) {
  const frame = shape.frame;
  const text = shapeText(shape).replace(/\s+/g, " ").trim();
  if (text || (frame?.left > 900 && frame?.top < 350)) {
    console.log(JSON.stringify({
      id: shape.id,
      type: shape.type,
      frame,
      text,
      geometry: shape.data?.shape?.geometry,
      fill: shape.data?.shape?.fill?.color?.value,
      line: shape.data?.shape?.line?.fill?.color?.value,
    }, null, 2));
  }
}

await fs.mkdir(previewDir, { recursive: true });
const safe = needle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-").slice(0, 32);
const preview = await presentation.export({ slide, format: "png", scale: 1 });
await fs.writeFile(path.join(previewDir, `${slide.index}-${safe}.png`), Buffer.from(await preview.arrayBuffer()));
