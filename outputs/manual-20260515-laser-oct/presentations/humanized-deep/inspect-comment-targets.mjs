import fs from "node:fs/promises";
import path from "node:path";
import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const pptx = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/humanized-deep/output/激光焊接OCT论文答辩_去AI味_细化版.pptx";
const previewDir = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/humanized-deep/comment-preview";
const presentation = await PresentationFile.importPptx(await FileBlob.load(pptx));

function shapeText(shape) {
  if (!shape?.text) return "";
  const value = String(shape.text);
  return value === "[object Object]" ? "" : value;
}

function saveBlob(blob, outputPath) {
  return blob.arrayBuffer().then((buffer) => fs.writeFile(outputPath, Buffer.from(buffer)));
}

await fs.mkdir(previewDir, { recursive: true });

const slide02a = presentation.slides.items.find((slide) =>
  slide.shapes.items.some((shape) => shapeText(shape).includes("OCT ACQUISITION")),
);
if (!slide02a) throw new Error("02A slide not found.");
console.log("02A index", slide02a.index);
for (const shape of slide02a.shapes.items) {
  const frame = shape.frame ?? shape.position ?? {};
  const text = shapeText(shape).replace(/\s+/g, " ").trim();
  if (["40", "43", "45", "46", "47", "48", "49", "50"].includes(shape.id) || (frame.left > 360 && frame.left < 520 && frame.top > 520 && frame.top < 660)) {
    console.log(JSON.stringify({
      id: shape.id,
      type: shape.type,
      frame,
      data: shape.data,
      text,
    }, null, 2));
  }
}

const preview = await presentation.export({ slide: slide02a, format: "png", scale: 1 });
await saveBlob(preview, path.join(previewDir, "slide-02a-before.png"));

const contrib = presentation.slides.items.find((slide) =>
  slide.shapes.items.some((shape) => shapeText(shape).includes("17 CONTRIBUTIONS")),
);
console.log("CONTRIBUTIONS index", contrib?.index);
