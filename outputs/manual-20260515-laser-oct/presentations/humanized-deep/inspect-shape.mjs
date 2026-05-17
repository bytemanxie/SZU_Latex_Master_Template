import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const input = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/diagram-enhance/output/激光焊接OCT论文答辩_流程图增强版.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(input));
const slide = presentation.slides.getItem(1);
for (const shape of slide.shapes.items.slice(0, 10)) {
  console.log("type", shape.type, "id", shape.id);
  console.log("shape.text", typeof shape.text, shape.text ? String(shape.text) : "");
  console.log("text keys", shape.text ? Object.keys(shape.text) : []);
  console.log("data keys", Object.keys(shape.data ?? {}));
  console.log(JSON.stringify(shape.data ?? {}, null, 2).slice(0, 1600));
  console.log("---");
}
