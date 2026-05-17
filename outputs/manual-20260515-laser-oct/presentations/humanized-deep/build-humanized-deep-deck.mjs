import fs from "node:fs/promises";
import path from "node:path";
import { PresentationFile, FileBlob } from "/Users/xiezhijie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const WORKSPACE = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/humanized-deep";
const INPUT = "/Users/xiezhijie/Documents/SZU_Latex_Master_Template/outputs/manual-20260515-laser-oct/presentations/diagram-enhance/output/激光焊接OCT论文答辩_流程图增强版.pptx";
const OUTPUT_DIR = path.join(WORKSPACE, "output");
const PREVIEW_DIR = path.join(WORKSPACE, "preview");
const OUTPUT = path.join(OUTPUT_DIR, "激光焊接OCT论文答辩_去AI味_细化版.pptx");

const W = 1280;
const H = 720;

const C = {
  bg: "#F7F4EE",
  ink: "#182326",
  muted: "#5C635F",
  line: "#D8D2C7",
  teal: "#0E7C86",
  teal2: "#DCEFF0",
  red: "#D94F3D",
  red2: "#F8E1D8",
  gold: "#B88A2D",
  gold2: "#F3E7C8",
  green: "#4F7F52",
  green2: "#E1EBD9",
  white: "#FFFFFF",
  dark: "#233033",
};

async function saveBlobToFile(blob, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  if (blob && typeof blob.arrayBuffer === "function") {
    await fs.writeFile(outputPath, Buffer.from(await blob.arrayBuffer()));
    return;
  }
  if (blob instanceof Uint8Array || Buffer.isBuffer(blob)) {
    await fs.writeFile(outputPath, Buffer.from(blob));
    return;
  }
  throw new Error("Expected a Blob or Uint8Array.");
}

function line(fill = "#00000000", width = 0) {
  return { style: "solid", fill, width };
}

function rect(slide, x, y, width, height, fill = "#00000000", stroke = "#00000000", strokeWidth = 0) {
  const shape = slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width, height },
    fill,
    line: line(stroke, strokeWidth),
  });
  return shape;
}

function triangleGlyph(slide, x, y, width, height, fill = C.teal) {
  const shape = slide.shapes.add({
    geometry: "rightArrow",
    position: { left: x, top: y, width, height },
    fill,
    line: line(fill, 0),
  });
  return shape;
}

function addSvg(slide, svg, x, y, width, height, alt = "") {
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
  const image = slide.images.add({ dataUrl, fit: "contain", alt });
  image.position = { left: x, top: y, width, height };
  return image;
}

function text(slide, value, x, y, width, height, opts = {}) {
  const shape = rect(slide, x, y, width, height, opts.fill ?? "#00000000", opts.stroke ?? "#00000000", opts.strokeWidth ?? 0);
  shape.text = value;
  shape.text.fontSize = opts.size ?? 20;
  shape.text.color = opts.color ?? C.ink;
  shape.text.bold = Boolean(opts.bold);
  shape.text.typeface = opts.face ?? "PingFang SC";
  shape.text.alignment = opts.align ?? "left";
  shape.text.verticalAlignment = opts.valign ?? "top";
  shape.text.insets = opts.insets ?? { left: 0, right: 0, top: 0, bottom: 0 };
  return shape;
}

function title(slide, section, value, pageMark) {
  rect(slide, 0, 0, W, H, C.bg);
  rect(slide, 0, 0, 74, H, C.dark);
  rect(slide, 74, 0, 6, H, C.teal);
  text(slide, section, 104, 38, 220, 24, { size: 17, bold: true, color: C.teal, face: "Aptos" });
  text(slide, value, 104, 70, 900, 76, { size: 32, bold: true, color: C.ink, face: "Songti SC" });
  text(slide, pageMark, 1105, 640, 92, 34, { size: 20, bold: true, color: C.teal, face: "Aptos", align: "right" });
}

function card(slide, x, y, width, height, fill = C.white, stroke = C.line) {
  rect(slide, x, y, width, height, fill, stroke, 1);
}

function tag(slide, value, x, y, width, fill = C.teal2, color = C.teal) {
  rect(slide, x, y, width, 30, fill, fill, 0);
  text(slide, value, x + 12, y + 5, width - 24, 22, { size: 14, bold: true, color, face: "PingFang SC" });
}

function arrow(slide, x, y, width, color = C.teal, label = "") {
  rect(slide, x, y + 13, width - 26, 4, color, color, 0);
  triangleGlyph(slide, x + width - 28, y + 5, 22, 20, color);
  if (label) text(slide, label, x, y + 26, width, 20, { size: 12, color: C.muted, align: "center" });
}

function bullet(slide, value, x, y, width, opts = {}) {
  rect(slide, x, y + 8, 7, 7, opts.color ?? C.teal, opts.color ?? C.teal, 0);
  text(slide, value, x + 18, y, width - 18, opts.height ?? 34, { size: opts.size ?? 16, color: opts.textColor ?? C.ink, face: "PingFang SC" });
}

function codeLine(slide, value, x, y, width) {
  rect(slide, x, y, width, 36, "#F1EEE7", "#D6D0C4", 1);
  text(slide, value, x + 12, y + 8, width - 24, 20, { size: 13, color: C.dark, face: "Aptos Mono" });
}

function miniGrid(slide, x, y, cols, rows, cell, active = []) {
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const key = `${r},${c}`;
      const fill = active.includes(key) ? C.red : "#FFFFFF";
      rect(slide, x + c * cell, y + r * cell, cell - 4, cell - 4, fill, active.includes(key) ? C.red : "#AFC3C6", 1);
    }
  }
}

function shapeText(shape) {
  if (!shape?.text) return "";
  const value = String(shape.text);
  return value === "[object Object]" ? "" : value;
}

function replaceDeckText(presentation) {
  const replacements = new Map([
    ["从干涉谱到匙孔掩膜：把在线监测链路中“算不动”和“分不准”的问题拆开解决。", "这项工作围绕一条链路展开：先把 OCT 图像实时重建出来，再把匙孔区域稳定分出来。"],
    ["熔深在线测量不能只看得到，还必须算得快、分得稳。", "熔深要在线测，关键是两件事：重建要跟上采集，分割要扛得住噪声。"],
    ["干涉谱到深度图像需经过 8 个后处理步骤，CPU 串行无法匹配 82 kHz A 扫。", "8 步后处理较长，CPU 串行难匹配 82 kHz A 扫。"],
    ["散斑噪声、边界模糊、目标与背景对比低，使匙孔区域难稳定提取。", "散斑强、边界弱，匙孔区域不容易稳定提取。"],
    ["焊接闭环控制需要毫秒级反馈，分割误差会直接传递到熔深估计。", "闭环控制需要毫秒级反馈，分割误差会传到熔深估计。"],
    ["答辩主线：实时重建链路 + 高精度匙孔语义分割。", "后面的汇报按两条线展开：CUDA 重建和匙孔分割。"],
    ["OCT 图像采集系统可以被讲成“光源、干涉、探测、焊接匙孔”四个部分。", "OCT 采集这部分，可以拆成光源、干涉、探测和焊接匙孔四个环节。"],
    ["参考光与样品反射光在分束器处形成干涉，传感器获得光谱干涉信号。", "参考光和样品反射光重新合束后形成干涉，传感器记录光谱信号。"],
    ["这张图用于说明：OCT 是主动探测深度结构，不只是表面视觉监测。", "这张图主要说明一点：OCT 看的是深度结构，不只是表面图像。"],
    ["技术路线把采集、重建、标注和分割串成一条在线监测链。", "整条路线从采集开始，到重建、标注、分割，最后回到熔深估计。"],
    ["从 OCT 采集到匙孔掩膜，是一条“光谱数据 → 重建图像 → 语义分割”的处理链。", "从 OCT 采集到匙孔掩膜，中间要经过光谱数据、重建图像和语义分割三步。"],
    ["自建焊接 OCT 数据集把任务定义为像素级匙孔提取。", "数据集只围绕一个任务建：在 OCT 图像里逐像素标出匙孔区域。"],
    ["8 步 SD-OCT 后处理全部迁移到 GPU，瓶颈集中在 K 线性化与 FFT。", "SD-OCT 后处理有 8 步，其中 K 线性化和 FFT 最容易拖慢在线链路。"],
    ["设计重点不是单个 kernel 更快，而是整条链路不被串行求解、显式拷贝和全局同步拖住。", "这里关注的不是某一个 kernel，而是整条重建链路的等待和搬运开销。"],
    ["CUDA 配图重点讲清楚：数据留在 GPU，kernel 串成流水线，PCR 解决串行瓶颈。", "这页重点讲三件事：数据留在 GPU，kernel 串起来跑，PCR 改掉串行求解。"],
    ["PCR 把 K 线性化中的串行三对角求解改成 11 层并行迭代。", "K 线性化原来卡在三对角求解，PCR 把它拆成 11 层并行迭代。"],
    ["CUDA 重建速率达到 1351k A-line/s，远高于 82 kHz 采集速率。", "M=1000 时，CUDA 重建速率已经高于 82 kHz 的采集需求。"],
    ["结果说明：GPU 后处理不再是采集链路的吞吐瓶颈，后续可把注意力转向小批量延迟与闭环同步。", "这说明吞吐量已经够用，真正要继续压的是小批量延迟和闭环同步。"],
    ["细粒度 B 扫下，统一内存把固定拷贝与同步开销压下来。", "B 扫越小，固定拷贝和同步越显眼，统一内存的收益也越明显。"],
    ["OCT 图像的三个视觉难点，直接决定了 TR 与 SAE 的分工。", "TR 和 SAE 的分工，来自 OCT 图像本身的几个难点。"],
    ["设计原则：不要把 OCT 当普通二分类图像处理，而要把噪声、形态和边界问题放进网络结构。", "所以这里不是单纯换一个分割网络，而是把噪声、形态和边界问题放进结构设计。"],
    ["改进 DeepLabV3+ 的核心是编码端重结构、解码端重细节。", "对 DeepLabV3+ 的改动主要在两处：编码端补全局结构，解码端修边界细节。"],
    ["这不是简单堆模块：TR 解决“细长结构是否连贯”，SAE 解决“边界是否落准”。", "这样分工比较清楚：TR 看整体是否连贯，SAE 看边界是否落准。"],
    ["TR 用 TopK 区域路由保留长程依赖，同时避免全局注意力的二次开销。", "TR 先筛相关区域，再做注意力计算，避免全图 token 直接两两计算。"],
    ["SAE 在解码端把空间位置和通道选择用于边界精炼。", "SAE 放在解码端，用位置和通道权重把边界再收紧。"],
    ["消融结果显示：TR 与 SAE 联合使用在区域和边界指标上同时最优。", "消融结果比较直接：TR 和 SAE 合起来，区域指标和边界指标都最好。"],
    ["与主流分割模型相比，本文方法取得最高 mIoU 和目标类别 IoU。", "和几类常用分割模型相比，本文方法在 mIoU 和目标 IoU 上都排第一。"],
    ["可视化对比能看出：连续性来自 TR，边界锐度来自 SAE。", "可视化里能看到：TR 主要补连续性，SAE 主要修边界。"],
    ["双重注意力在强散斑下衰减更小，同时比 TransUNet 更省显存。", "散斑加重后，本文方法掉得更慢；显存也明显低于 TransUNet。"],
    ["两条方法链最终服务于同一个工程目标：在线、稳定地估计熔深。", "最后还是回到工程目标：在线、稳定地拿到熔深信息。"],
    ["本文贡献可以归纳为三点：实时重建、鲁棒分割、工程验证。", "这篇工作的贡献，我按三件事来汇报。"],
    ["这三点分别对应答辩时最关键的三个问题：能不能实时、能不能分准、证据是否充分。", "这三点对应三个问题：能不能实时，能不能分准，实验够不够支撑结论。"],
    ["后续工作应集中在更低资源占用、更强泛化和端到端部署。", "后续主要补三件事：更省资源、更多工况、端到端串起来跑。"],
    ["展望的重点不是换一个更大的模型，而是围绕产线实时性和跨工况可靠性继续收敛。", "后续重点不是单纯换大模型，而是继续贴近产线实时性和跨工况可靠性。"],
    ["感谢各位老师批评指正", "感谢各位老师，请批评指正"],
    ["从工程链路看：GPU 重建解决吞吐，双重注意力解决弱边界分割，两者共同服务在线熔深监测。", "从链路上看，GPU 重建解决吞吐问题，TR+SAE 分割解决弱边界问题，最后都服务在线熔深监测。"],
  ]);

  let changed = 0;
  for (const slide of presentation.slides.items) {
    for (const shape of slide.shapes.items) {
      const current = shapeText(shape);
      if (!current) continue;
      for (const [from, to] of replacements) {
        if (current.includes(from)) {
          shape.text.replace(from, to);
          changed += 1;
        }
      }
    }
  }
  return changed;
}

function slideText(slide) {
  return slide.shapes.items.map(shapeText).join("\n");
}

function findSlide(presentation, needle) {
  const slide = presentation.slides.items.find((candidate) => slideText(candidate).includes(needle));
  if (!slide) throw new Error(`Cannot find slide containing: ${needle}`);
  return slide;
}

function insertAfter(presentation, needle) {
  const base = findSlide(presentation, needle);
  return presentation.slides.insert({ after: base }).slide;
}

function polishOctAcquisitionSample(presentation) {
  const slide = findSlide(presentation, "OCT 采集这部分");
  const removeIds = new Set(["43", "44", "45", "46", "47", "48"]);
  for (const shape of [...slide.shapes.items]) {
    if (removeIds.has(shape.id)) shape.delete();
  }

  // Keep this part deliberately plain: a native PPT line schematic is closer to
  // the paper figure style than a standalone illustrative image.
  rect(slide, 346, 586, 160, 3, "#2F5C8A", "#2F5C8A", 0);
  rect(slide, 346, 590, 160, 8, "#E7DED0", "#E7DED0", 0);
  rect(slide, 436, 586, 34, 12, C.bg, C.bg, 0);

  text(slide, "↓", 443, 548, 24, 36, { size: 32, bold: true, color: C.red, align: "center", face: "Aptos" });
  rect(slide, 453, 584, 2, 72, "#D94F3D", "#D94F3D", 0);

  const blue = "#2F5C8A";
  rect(slide, 435, 590, 3, 22, blue, blue, 0);
  rect(slide, 438, 612, 3, 20, blue, blue, 0);
  rect(slide, 442, 632, 3, 18, blue, blue, 0);
  rect(slide, 448, 650, 14, 3, blue, blue, 0);
  rect(slide, 468, 590, 3, 22, blue, blue, 0);
  rect(slide, 465, 612, 3, 20, blue, blue, 0);
  rect(slide, 461, 632, 3, 18, blue, blue, 0);
}

function deleteSlideContaining(presentation, needle) {
  const slide = presentation.slides.items.find((candidate) => slideText(candidate).includes(needle));
  if (!slide) return false;
  slide.delete();
  return true;
}

function cleanupProductionNotes(presentation) {
  let removed = 0;
  const patterns = [
    /^Source:/,
    /^新增/,
    /^讲解建议/,
    /^Defense deck generated/,
  ];
  for (const slide of presentation.slides.items) {
    for (const shape of [...slide.shapes.items]) {
      const value = shapeText(shape).replace(/\s+/g, " ").trim();
      if (patterns.some((pattern) => pattern.test(value))) {
        shape.delete();
        removed += 1;
      }
    }
  }
  return removed;
}

function fitProblemCards(presentation) {
  const slide = findSlide(presentation, "PROBLEM");
  const compactBodies = [
    "8 步后处理较长",
    "散斑强、边界弱",
    "闭环控制需要毫秒级反馈",
  ];
  let adjusted = 0;
  for (const shape of slide.shapes.items) {
    const value = shapeText(shape);
    if (!compactBodies.some((needle) => value.includes(needle))) continue;
    const frame = shape.frame;
    shape.position = {
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: 40,
    };
    shape.text.fontSize = 12;
    shape.text.insets = { left: 0, right: 0, top: 0, bottom: 0 };
    adjusted += 1;
  }
  return adjusted;
}

function restyleRouteArrows(presentation) {
  const slide = findSlide(presentation, "ROUTE");
  let removed = 0;
  for (const shape of [...slide.shapes.items]) {
    const value = shapeText(shape).trim();
    const frame = shape.frame;
    const isRouteArrowText = value === ">" && frame.top >= 300 && frame.top <= 340;
    const isOldFinalLine = !value && frame.left >= 990 && frame.left <= 1000 && frame.top >= 325 && frame.top <= 335;
    if (isRouteArrowText || isOldFinalLine) {
      shape.delete();
      removed += 1;
    }
  }

  const y = 329;
  const arrows = [
    { x: 218, w: 42, color: C.teal },
    { x: 414, w: 42, color: C.teal },
    { x: 610, w: 42, color: C.teal },
    { x: 806, w: 42, color: C.teal },
    { x: 994, w: 42, color: C.red },
  ];
  for (const arrowSpec of arrows) {
    rect(slide, arrowSpec.x, y, arrowSpec.w - 16, 3, arrowSpec.color, arrowSpec.color, 0);
    triangleGlyph(slide, arrowSpec.x + arrowSpec.w - 18, y - 8, 20, 20, arrowSpec.color);
  }
  return removed;
}

function normalizeRouteLead(presentation) {
  const slide = findSlide(presentation, "ROUTE");
  const shape = slide.shapes.items.find((item) => shapeText(item).includes("整条路线从采集开始"));
  if (!shape) return false;
  shape.text = "整条路线从采集开始，到重建、标注、分割，最后回到熔深估计。";
  shape.text.fontSize = 32;
  shape.text.bold = true;
  shape.text.color = C.ink;
  shape.text.typeface = "Songti SC";
  shape.text.alignment = "left";
  shape.text.verticalAlignment = "top";
  shape.text.insets = { left: 0, right: 0, top: 0, bottom: 0 };
  return true;
}

function drawChapterCover(slide, part, titleText, subtitle, accent, kind) {
  rect(slide, 0, 0, W, H, C.bg);
  rect(slide, 0, 0, 74, H, C.dark);
  rect(slide, 74, 0, 6, H, accent);
  text(slide, `PART ${part}`, 104, 74, 160, 26, { size: 18, bold: true, color: accent, face: "Aptos" });
  text(slide, titleText, 104, 118, 560, 74, { size: 40, bold: true, color: C.ink, face: "Songti SC" });
  text(slide, subtitle, 108, 224, 530, 68, { size: 18, color: C.muted, face: "PingFang SC" });
  rect(slide, 104, 340, 460, 3, accent, accent, 0);
  text(slide, part, 1000, 498, 170, 112, { size: 96, bold: true, color: accent, face: "Aptos", align: "right" });

  if (kind === "oct") {
    rect(slide, 740, 192, 310, 3, "#2F5C8A", "#2F5C8A", 0);
    rect(slide, 740, 196, 310, 11, "#E7DED0", "#E7DED0", 0);
    text(slide, "↓", 875, 126, 34, 48, { size: 42, bold: true, color: C.red, face: "Aptos", align: "center" });
    rect(slide, 890, 170, 3, 128, C.red, C.red, 0);
    rect(slide, 860, 196, 6, 44, "#2F5C8A", "#2F5C8A", 0);
    rect(slide, 866, 240, 6, 42, "#2F5C8A", "#2F5C8A", 0);
    rect(slide, 872, 282, 40, 6, "#2F5C8A", "#2F5C8A", 0);
    rect(slide, 918, 196, 6, 44, "#2F5C8A", "#2F5C8A", 0);
    rect(slide, 912, 240, 6, 42, "#2F5C8A", "#2F5C8A", 0);
  } else if (kind === "gpu") {
    card(slide, 700, 170, 160, 120, "#FFFFFF", C.line);
    text(slide, "CPU", 742, 214, 76, 34, { size: 28, bold: true, color: C.teal, face: "Aptos", align: "center" });
    arrow(slide, 882, 214, 112, accent, "kernel");
    card(slide, 1020, 160, 170, 140, C.red2, "#E7B4AA");
    text(slide, "GPU", 1060, 204, 92, 34, { size: 30, bold: true, color: C.red, face: "Aptos", align: "center" });
    for (let i = 0; i < 18; i += 1) rect(slide, 1046 + (i % 6) * 18, 250 + Math.floor(i / 6) * 16, 8, 8, C.red, C.red, 0);
  } else if (kind === "network") {
    const points = [[760, 206], [900, 150], [900, 260], [1040, 206], [1130, 206]];
    points.forEach(([x, y], i) => {
      rect(slide, x, y, 34, 34, i === 3 ? C.red : accent, i === 3 ? C.red : accent, 0);
    });
    [[794, 223, 106], [934, 167, 106], [934, 277, 106], [1074, 223, 56]].forEach(([x, y, w]) => rect(slide, x, y, w, 3, "#8FA3A5", "#8FA3A5", 0));
    text(slide, "TR", 880, 310, 70, 26, { size: 20, bold: true, color: C.red, face: "Aptos", align: "center" });
    text(slide, "SAE", 1020, 310, 82, 26, { size: 20, bold: true, color: C.gold, face: "Aptos", align: "center" });
  } else if (kind === "results") {
    const bars = [
      [760, 276, 64, C.teal],
      [850, 244, 96, C.red],
      [940, 202, 138, C.gold],
      [1030, 164, 176, C.green],
    ];
    rect(slide, 720, 350, 430, 3, "#8FA3A5", "#8FA3A5", 0);
    bars.forEach(([x, y, h, color]) => rect(slide, x, y, 48, h, color, color, 0));
    text(slide, "mIoU 0.911", 748, 398, 160, 28, { size: 22, bold: true, color: C.teal, face: "Aptos" });
    text(slide, "HD95 10.68", 958, 398, 170, 28, { size: 22, bold: true, color: C.red, face: "Aptos" });
  }
}

function addChapterCovers(presentation) {
  const covers = [];
  const cover1 = presentation.slides.insert({ after: presentation.slides.getItem(0) }).slide;
  drawChapterCover(cover1, "01", "研究背景与技术路线", "从焊接 OCT 采集出发，先把问题、数据和整体链路讲清楚。", C.teal, "oct");
  covers.push(cover1);

  const cover2 = insertAfter(presentation, "评价指标覆盖区域重叠");
  drawChapterCover(cover2, "02", "OCT 图像实时重建", "围绕 SD-OCT 后处理，把 K 线性化、FFT 和数据搬运放到 GPU 端解决。", C.red, "gpu");
  covers.push(cover2);

  const cover3 = insertAfter(presentation, "B 扫越小");
  drawChapterCover(cover3, "03", "TR-SAE 语义分割方法", "编码端补全局结构，解码端修边界细节，目标是稳定提取匙孔区域。", C.gold, "network");
  covers.push(cover3);

  const cover4 = insertAfter(presentation, "SAE 模块：在解码端把位置");
  drawChapterCover(cover4, "04", "实验结果与部署展望", "用消融、对比、鲁棒性和效率实验验证方法是否真的可用。", C.green, "results");
  covers.push(cover4);
  return covers;
}

function drawCudaFramework(slide) {
  title(slide, "05B GPU/CUDA", "GPU/CUDA 计算框架：CPU 管流程，GPU 批量执行 kernel。", "05B");

  card(slide, 104, 162, 280, 330);
  tag(slide, "Host / CPU", 124, 184, 124, C.teal2, C.teal);
  text(slide, "控制流 + 数据准备", 124, 230, 220, 28, { size: 22, bold: true, face: "Songti SC" });
  bullet(slide, "从采集卡拿到原始干涉谱", 124, 282, 228);
  bullet(slide, "分配显存或统一内存", 124, 330, 228);
  bullet(slide, "按顺序发起 kernel 调用", 124, 378, 228);
  codeLine(slide, "kernel<<<grid, block>>>(...)", 124, 430, 220);

  arrow(slide, 404, 260, 128, C.red, "launch / sync");
  arrow(slide, 404, 350, 128, C.teal, "H2D / D2H");

  card(slide, 548, 162, 628, 330);
  tag(slide, "Device / GPU", 568, 184, 142, C.red2, C.red);
  text(slide, "Grid 由多个 Block 组成，Block 里再展开线程。", 568, 228, 350, 24, { size: 17, color: C.muted });
  rect(slide, 568, 266, 370, 174, "#F6FAFA", "#AFC3C6", 1);
  text(slide, "Grid", 580, 276, 70, 22, { size: 14, bold: true, color: C.teal, face: "Aptos" });
  for (let i = 0; i < 4; i += 1) {
    const bx = 598 + (i % 2) * 160;
    const by = 310 + Math.floor(i / 2) * 64;
    rect(slide, bx, by, 126, 48, "#FFFFFF", "#AFC3C6", 1);
    text(slide, `Block ${i}`, bx + 10, by + 7, 60, 16, { size: 11, bold: true, color: C.teal, face: "Aptos" });
    for (let t = 0; t < 8; t += 1) {
      rect(slide, bx + 74 + (t % 4) * 10, by + 10 + Math.floor(t / 4) * 14, 6, 6, C.red, C.red, 0);
    }
  }

  card(slide, 966, 266, 174, 174, "#FFFDF8", "#E3C982");
  text(slide, "执行单位", 986, 286, 100, 24, { size: 17, bold: true, face: "Songti SC", color: C.gold });
  bullet(slide, "Thread 处理局部数据", 986, 328, 132, { size: 13, height: 28, color: C.gold });
  bullet(slide, "Warp = 32 threads", 986, 372, 132, { size: 13, height: 28, color: C.gold });
  bullet(slide, "SM 调度多个 warp", 986, 416, 132, { size: 13, height: 28, color: C.gold });

  text(slide, "和本文 OCT 重建的关系", 104, 526, 320, 28, { size: 21, bold: true, face: "Songti SC" });
  bullet(slide, "A-scan、k 值插值点、FFT 批处理都能映射到并行线程。", 104, 582, 460, { height: 34 });
  bullet(slide, "PCR 用 block 内共享内存保存三对角系数，避免每轮都访问全局内存。", 104, 628, 520, { height: 34 });

  const memX = 620;
  text(slide, "存储层次", memX, 526, 150, 26, { size: 22, bold: true, face: "Songti SC" });
  const mem = [
    ["Register", "线程私有，最快"],
    ["Shared", "block 内共享，PCR 重点使用"],
    ["Constant / RO", "节点和信号读取更适合缓存"],
    ["Global", "容量大，但访存最慢"],
  ];
  mem.forEach(([name, note], i) => {
    const x = memX + i * 120;
    rect(slide, x, 572, 104, 78, i === 0 ? C.teal2 : i === 1 ? C.red2 : i === 2 ? C.gold2 : "#EFECE5", "#D6D0C4", 1);
    text(slide, name, x + 8, 584, 88, 18, { size: 12, bold: true, color: i === 1 ? C.red : i === 2 ? C.gold : C.teal, face: "Aptos" });
    text(slide, note, x + 8, 608, 88, 34, { size: 10, color: C.muted });
  });
}

function drawForwardPlacement(slide) {
  title(slide, "10A MODEL FLOW", "TR 和 SAE 分别放在网络里最需要它们的位置。", "10A");

  const nodes = [
    { label: "输入 OCT\n512×512", x: 98, w: 118, fill: "#FFFFFF" },
    { label: "ResNet18\n编码特征", x: 248, w: 132, fill: C.teal2 },
    { label: "ASPP\n5 分支拼接\nC=2560", x: 412, w: 140, fill: C.teal2 },
    { label: "TR\n全局结构", x: 584, w: 122, fill: C.red2 },
    { label: "1×1 bottleneck\nC=512", x: 738, w: 142, fill: "#FFFFFF" },
    { label: "上采样 +\n浅层 C=48", x: 912, w: 134, fill: C.gold2 },
    { label: "concat\nC=560", x: 1078, w: 98, fill: "#FFFFFF" },
  ];
  nodes.forEach((node, i) => {
    card(slide, node.x, 214, node.w, 118, node.fill);
    text(slide, node.label, node.x + 10, 242, node.w - 20, 64, { size: 18, bold: i === 3, color: i === 3 ? C.red : C.ink, face: "Songti SC", align: "center", valign: "middle" });
    if (i < nodes.length - 1) arrow(slide, node.x + node.w + 12, 258, 48, C.teal);
  });

  rect(slide, 248, 366, 458, 54, C.teal2, C.teal2, 0);
  text(slide, "编码端：先把弱纹理里的长程结构找出来", 268, 382, 410, 24, { size: 18, bold: true, color: C.teal, face: "Songti SC" });
  rect(slide, 912, 366, 264, 54, C.gold2, C.gold2, 0);
  text(slide, "解码端：再把上采样后的边界收紧", 932, 382, 222, 24, { size: 18, bold: true, color: C.gold, face: "Songti SC" });

  card(slide, 254, 468, 330, 142);
  text(slide, "TR 放在 ASPP 之后", 274, 490, 220, 26, { size: 21, bold: true, face: "Songti SC", color: C.red });
  bullet(slide, "此时语义最强，适合做区域级关系建模。", 274, 536, 270, { size: 14, height: 28 });
  bullet(slide, "S=4、TopK=4，在精度和推理时间之间最稳。", 274, 574, 270, { size: 14, height: 28 });

  card(slide, 696, 468, 330, 142);
  text(slide, "SAE 放在特征融合后", 716, 490, 230, 26, { size: 21, bold: true, face: "Songti SC", color: C.gold });
  bullet(slide, "这里同时有浅层位置细节和高层语义。", 716, 536, 270, { size: 14, height: 28, color: C.gold });
  bullet(slide, "适合做坐标注意力、局部精炼和通道选择。", 716, 574, 280, { size: 14, height: 28, color: C.gold });

  card(slide, 104, 620, 960, 42, "#FFFFFF", "#D6D0C4");
  text(slide, "一句话讲法：TR 负责“看整体结构是否连上”，SAE 负责“看边界有没有落准”。", 128, 631, 860, 20, { size: 17, color: C.ink, face: "Songti SC" });
}

function drawTrDetails(slide) {
  title(slide, "10B TR MODULE", "TR 模块：先按区域筛选相关窗口，再做稀疏注意力。", "10B");

  card(slide, 104, 166, 184, 170, C.white);
  text(slide, "ASPP 输出", 128, 188, 120, 24, { size: 20, bold: true, color: C.teal, face: "Songti SC" });
  text(slide, "64×64 特征图", 128, 224, 110, 20, { size: 15, color: C.muted });
  miniGrid(slide, 128, 262, 4, 4, 26, ["0,1", "1,1", "1,2", "2,2"]);
  text(slide, "S=4 → 16 个区域\n每个区域约 16×16", 128, 286, 132, 44, { size: 12, color: C.muted, align: "right" });

  arrow(slide, 306, 244, 70, C.teal);
  card(slide, 394, 166, 180, 170, C.teal2);
  text(slide, "Q K V 投影", 416, 190, 128, 24, { size: 20, bold: true, color: C.teal, face: "Songti SC" });
  bullet(slide, "窗口划分", 416, 236, 120, { size: 14, height: 26 });
  bullet(slide, "区域平均 Q/K", 416, 274, 130, { size: 14, height: 26 });
  text(slide, "先做粗筛，压住局部散斑噪声。", 416, 308, 128, 18, { size: 12, color: C.muted });

  arrow(slide, 592, 244, 70, C.red);
  card(slide, 680, 166, 210, 170, C.red2);
  text(slide, "TopK 路由", 704, 190, 130, 24, { size: 20, bold: true, color: C.red, face: "Songti SC" });
  text(slide, "相似度矩阵", 704, 232, 86, 18, { size: 13, color: C.muted });
  miniGrid(slide, 704, 260, 4, 4, 18, ["0,2", "1,1", "2,2", "3,0"]);
  text(slide, "TopK=4\n只取最相关区域", 790, 262, 76, 42, { size: 13, bold: true, color: C.red, face: "Songti SC" });

  arrow(slide, 908, 244, 70, C.teal);
  card(slide, 996, 166, 180, 170, C.white);
  text(slide, "稀疏注意力", 1018, 190, 126, 24, { size: 20, bold: true, color: C.teal, face: "Songti SC" });
  bullet(slide, "收集路由区域 K/V", 1018, 236, 132, { size: 14, height: 26 });
  bullet(slide, "8 heads 做 token 注意力", 1018, 274, 132, { size: 14, height: 26 });
  bullet(slide, "LCE: 5×5 DWConv", 1018, 312, 132, { size: 14, height: 26 });

  card(slide, 104, 390, 334, 190, C.white);
  text(slide, "Transformer Block 内部", 128, 412, 210, 24, { size: 21, bold: true, face: "Songti SC" });
  const blockSteps = [
    ["CPE", "3×3 depthwise conv\n补位置编码"],
    ["BRA", "Bi-level Routing Attention\n先路由再注意力"],
    ["FFN", "线性扩展 + DWConv + GELU\n再线性压回"],
  ];
  blockSteps.forEach(([name, note], i) => {
    rect(slide, 128 + i * 94, 462, 78, 70, i === 1 ? C.red2 : C.teal2, "#D6D0C4", 1);
    text(slide, name, 138 + i * 94, 474, 58, 18, { size: 16, bold: true, color: i === 1 ? C.red : C.teal, align: "center", face: "Aptos" });
    text(slide, note, 132 + i * 94, 500, 70, 28, { size: 9, color: C.muted, align: "center" });
    if (i < 2) text(slide, "+", 208 + i * 94, 486, 18, 18, { size: 18, bold: true, color: C.muted, face: "Aptos" });
  });
  text(slide, "残差连接贯穿各步，避免只靠注意力重新学习全部特征。", 128, 548, 270, 20, { size: 13, color: C.muted });

  card(slide, 488, 390, 688, 190, C.white);
  text(slide, "TopK 敏感性：4 是精度和速度的折中点", 512, 412, 390, 24, { size: 21, bold: true, face: "Songti SC" });
  const rows = [
    ["TopK", "2", "4", "6", "8"],
    ["mIoU", "0.897", "0.911", "0.910", "0.906"],
    ["HD95", "11.86", "10.68", "10.72", "10.91"],
    ["推理 ms", "11.2", "12.4", "14.1", "16.0"],
  ];
  rows.forEach((row, r) => {
    row.forEach((cell, c) => {
      const x = 512 + c * 118;
      const y = 462 + r * 28;
      const highlight = c === 2 && r > 0;
      rect(slide, x, y, 108, 24, r === 0 ? "#EFECE5" : highlight ? C.red2 : "#FFFFFF", "#D6D0C4", 1);
      text(slide, cell, x + 8, y + 4, 92, 16, { size: 12, bold: r === 0 || highlight, color: highlight ? C.red : C.ink, align: "center", face: "Aptos" });
    });
  });
  bullet(slide, "TopK 过小，长程区域拿不够；TopK 过大，计算增加但精度不再提升。", 512, 594, 560, { size: 15, height: 34, color: C.red });
}

function drawSaeDetails(slide) {
  title(slide, "11B SAE MODULE", "SAE 模块：在解码端把位置、局部细节和通道权重合起来。", "11B");

  card(slide, 104, 178, 162, 128, C.white);
  text(slide, "融合特征", 128, 202, 100, 24, { size: 21, bold: true, color: C.teal, face: "Songti SC" });
  text(slide, "高层语义 + 浅层细节\nconcat 后 C=560", 128, 246, 100, 42, { size: 14, color: C.muted, align: "center" });
  arrow(slide, 280, 232, 70, C.teal);

  const stages = [
    { no: "01", title: "坐标注意力", color: C.teal, fill: C.teal2, x: 370, note: "H/W 一维池化\n共享 1×1 conv\n拆成 gh / gw" },
    { no: "02", title: "特征精炼", color: C.red, fill: C.red2, x: 596, note: "3×3 Conv-BN-ReLU ×2\n残差补回局部细节\n减轻上采样毛刺" },
    { no: "03", title: "多基数 SE", color: C.gold, fill: C.gold2, x: 822, note: "GAP\n4 个 FC 分支\nconcat 后 sigmoid" },
  ];
  stages.forEach((stage, i) => {
    card(slide, stage.x, 166, 182, 164, stage.fill, "#D6D0C4");
    text(slide, stage.no, stage.x + 18, 190, 34, 26, { size: 18, bold: true, color: stage.color, face: "Aptos" });
    text(slide, stage.title, stage.x + 58, 190, 96, 26, { size: 19, bold: true, color: stage.color, face: "Songti SC" });
    text(slide, stage.note, stage.x + 22, 234, 138, 72, { size: 14, color: C.ink, align: "center", valign: "middle" });
    if (i < stages.length - 1) arrow(slide, stage.x + 188, 232, 48, stage.color);
  });
  arrow(slide, 1022, 232, 62, C.gold);
  card(slide, 1102, 178, 74, 128, C.white);
  text(slide, "分类器", 1116, 214, 46, 22, { size: 16, bold: true, color: C.ink, face: "Songti SC", align: "center" });
  text(slide, "匙孔\n掩膜", 1118, 252, 42, 38, { size: 15, color: C.muted, align: "center" });

  card(slide, 104, 390, 330, 190, C.white);
  text(slide, "为什么 SAE 放在这里", 128, 414, 230, 24, { size: 22, bold: true, face: "Songti SC" });
  bullet(slide, "浅层特征：边界位置更清楚。", 128, 464, 260, { size: 14, height: 28 });
  bullet(slide, "高层特征：语义判断更稳定。", 128, 508, 260, { size: 14, height: 28 });
  bullet(slide, "融合后再注意力：同时利用位置与语义。", 128, 552, 276, { size: 14, height: 28 });

  card(slide, 474, 390, 330, 190, C.white);
  text(slide, "三个子模块各做一件事", 498, 414, 240, 24, { size: 22, bold: true, face: "Songti SC" });
  bullet(slide, "坐标注意力：保留水平/垂直位置信息。", 498, 464, 270, { size: 14, height: 28, color: C.teal });
  bullet(slide, "特征精炼：用局部卷积修边界。", 498, 508, 270, { size: 14, height: 28, color: C.red });
  bullet(slide, "多基数 SE：提高边界相关通道权重。", 498, 552, 270, { size: 14, height: 28, color: C.gold });

  card(slide, 844, 390, 332, 190, C.white);
  text(slide, "实验上能看到的变化", 868, 414, 230, 24, { size: 22, bold: true, face: "Songti SC" });
  rect(slide, 872, 466, 124, 72, C.red2, C.red2, 0);
  text(slide, "+5.9%", 892, 480, 84, 28, { size: 24, bold: true, color: C.red, face: "Aptos", align: "center" });
  text(slide, "单独 SAE\nmIoU 提升", 890, 512, 86, 22, { size: 12, color: C.muted, align: "center" });
  rect(slide, 1018, 466, 124, 72, C.teal2, C.teal2, 0);
  text(slide, "10.68", 1038, 480, 84, 28, { size: 24, bold: true, color: C.teal, face: "Aptos", align: "center" });
  text(slide, "TR+SAE\nHD95", 1038, 512, 84, 22, { size: 12, color: C.muted, align: "center" });
  text(slide, "结论不是“注意力越多越好”，而是模块放在边界信息最集中的位置。", 868, 558, 260, 34, { size: 14, color: C.ink });
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(PREVIEW_DIR, { recursive: true });
  const presentation = await PresentationFile.importPptx(await FileBlob.load(INPUT));
  const replacements = replaceDeckText(presentation);
  const problemCardsAdjusted = fitProblemCards(presentation);
  polishOctAcquisitionSample(presentation);
  const routeArrowsRemoved = restyleRouteArrows(presentation);
  const routeLeadNormalized = normalizeRouteLead(presentation);

  const cuda = insertAfter(presentation, "这页重点讲三件事");
  drawCudaFramework(cuda);

  const forward = insertAfter(presentation, "对 DeepLabV3+ 的改动主要在两处");
  drawForwardPlacement(forward);

  const tr = insertAfter(presentation, "TR 先筛相关区域");
  drawTrDetails(tr);

  const sae = insertAfter(presentation, "SAE 放在解码端");
  drawSaeDetails(sae);

  const covers = addChapterCovers(presentation);
  const notesRemoved = cleanupProductionNotes(presentation);

  const inserted = [cuda, forward, tr, sae, ...covers];
  for (let i = 0; i < inserted.length; i += 1) {
    const preview = await presentation.export({ slide: inserted[i], format: "png", scale: 1 });
    await saveBlobToFile(preview, path.join(PREVIEW_DIR, `new-slide-${i + 1}.png`));
  }

  const deletedContributions = deleteSlideContaining(presentation, "这篇工作的贡献");

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(OUTPUT);
  const stat = await fs.stat(OUTPUT);
  console.log(JSON.stringify({
    input: INPUT,
    output: OUTPUT,
    outputBytes: stat.size,
    slideCount: presentation.slides.items.length,
    replacements,
    problemCardsAdjusted,
    routeArrowsRemoved,
    routeLeadNormalized,
    notesRemoved,
    chapterCovers: covers.length,
    deletedContributions,
    previewDir: PREVIEW_DIR,
  }, null, 2));
}

await main();
