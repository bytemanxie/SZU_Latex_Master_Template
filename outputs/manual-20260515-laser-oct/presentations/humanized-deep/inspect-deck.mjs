import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const input = process.argv[2] ?? "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/diagram-enhance/output/激光焊接OCT论文答辩_流程图增强版.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(input));

function textOf(shape) {
  if (!shape || shape.text == null) return "";
  if (typeof shape.text === "string") return shape.text;
  for (const key of ["plainText", "text", "value"]) {
    if (typeof shape.text?.[key] === "string") return shape.text[key];
  }
  const str = String(shape.text);
  return str === "[object Object]" ? "" : str;
}

console.log(Object.keys(presentation));
console.log(Object.keys(presentation.slides ?? {}));
const slides = presentation.slides?.items ?? presentation.slides?._items ?? [];

let index = 1;
for (const slide of slides) {
  console.log(`\n--- slide ${index} ---`);
  for (const shape of slide.shapes.items) {
    const text = textOf(shape).replace(/\s+/g, " ").trim();
    if (text) console.log(text);
  }
  index += 1;
}
