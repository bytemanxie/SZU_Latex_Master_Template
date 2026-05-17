import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const input = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/diagram-enhance/output/激光焊接OCT论文答辩_流程图增强版.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(input));

function keys(obj) {
  const own = Object.keys(obj ?? {});
  const proto = Object.getPrototypeOf(obj);
  return { own, proto: proto ? Object.getOwnPropertyNames(proto) : [] };
}

console.log("presentation", keys(presentation));
console.log("slides", keys(presentation.slides));
console.log("slide0", keys(presentation.slides.getItem(0)));
console.log("slide0 shapes", keys(presentation.slides.getItem(0).shapes));
console.log("shape0", keys(presentation.slides.getItem(0).shapes.items[0]));
console.log("slide count", presentation.slides.items?.length);
console.log("slide frame", presentation.slides.getItem(0).frame);
console.log("slides.add", presentation.slides.add.length, String(presentation.slides.add).slice(0, 800));
console.log("slides.insert", presentation.slides.insert.length, String(presentation.slides.insert).slice(0, 800));
