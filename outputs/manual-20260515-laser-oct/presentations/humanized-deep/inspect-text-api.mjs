import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const input = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/diagram-enhance/output/激光焊接OCT论文答辩_流程图增强版.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(input));
const shape = presentation.slides.getItem(1).shapes.getItem(4);
const text = shape.text;
console.log("text string", String(text));
console.log("text own keys", Object.keys(text));
console.log("text proto", Object.getOwnPropertyNames(Object.getPrototypeOf(text)));
console.log("font size", text.fontSize, "color", text.color, "bold", text.bold, "typeface", text.typeface, "alignment", text.alignment);
console.log("set length", text.set.length, String(text.set).slice(0, 800));
console.log("replace length", text.replace.length, String(text.replace).slice(0, 800));
