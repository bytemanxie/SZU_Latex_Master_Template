const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
const slide = pptx.addSlide();

const FS = 9, FEN = 'Times New Roman', TXT = '333333';
const FILL = 'DDEAF6', BD = '5B9BD5';
const ARR = '666666';

const BH = 0.46, GAP = 0.14, CIR = 0.28;
const cy = 5.625 / 2;

function box(x, w, txt) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: cy - BH / 2, w, h: BH,
        fill: { color: FILL }, line: { color: BD, width: 0.8 }, rectRadius: 0.04,
    });
    slide.addText(txt, {
        x, y: cy - BH / 2, w, h: BH,
        align: 'center', valign: 'middle', fontSize: FS, fontFace: FEN, color: TXT,
    });
}
function sbox(x, y, w, h, txt) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w, h,
        fill: { color: FILL }, line: { color: BD, width: 0.7 }, rectRadius: 0.03,
    });
    slide.addText(txt, {
        x, y, w, h,
        align: 'center', valign: 'middle', fontSize: FS, fontFace: FEN, color: TXT,
    });
}
function cir(cx, txt) {
    slide.addShape(pptx.shapes.OVAL, {
        x: cx - CIR / 2, y: cy - CIR / 2, w: CIR, h: CIR,
        fill: { color: 'FFFFFF' }, line: { color: '999999', width: 0.8 },
    });
    slide.addText(txt, {
        x: cx - CIR / 2, y: cy - CIR / 2, w: CIR, h: CIR,
        align: 'center', valign: 'middle', fontSize: 9, fontFace: FEN, color: TXT, bold: true,
    });
}
function L(x1, y1, x2, y2, arr) {
    const o = {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
        line: { color: ARR, width: 0.7 },
    };
    if (x2 < x1) o.flipH = true;
    if (y2 < y1) o.flipV = true;
    if (arr) o.line.endArrowType = 'triangle';
    slide.addShape(pptx.shapes.LINE, o);
}

let x = 0.1;
slide.addText('Input', { x, y: cy - 0.1, w: 0.4, h: 0.2, fontSize: FS, fontFace: FEN, color: '999999', align: 'center', valign: 'middle' });
x += 0.42;

// Coordinate Attention
const xA = x; L(x, cy, x + GAP, cy, true); x += GAP;
box(x, 1.1, 'Coordinate\nAttention'); x += 1.1;
L(x, cy, x + GAP, cy, false); x += GAP;
const xP1 = x + CIR / 2; cir(xP1, '+'); x += CIR;

// skip 1: xA 下方绕过 CA → (+)1
const s1 = cy + BH / 2 + 0.26;
L(xA, cy, xA, s1, false);
L(xA, s1, xP1, s1, false);
L(xP1, s1, xP1, cy + CIR / 2, true);

L(x, cy, x + GAP, cy, true); x += GAP;

// Conv + Conv
const xB = x;
box(x, 0.85, 'Conv 3×3\nBN+ReLU'); x += 0.85;
L(x, cy, x + GAP, cy, true); x += GAP;
box(x, 0.85, 'Conv 3×3\nBN+ReLU'); x += 0.85;
L(x, cy, x + GAP, cy, false); x += GAP;
const xP2 = x + CIR / 2; cir(xP2, '+'); x += CIR;

// skip 2: xB 上方绕过 Conv+Conv → (+)2
const s2 = cy - BH / 2 - 0.26;
L(xB, cy, xB, s2, false);
L(xB, s2, xP2, s2, false);
L(xP2, s2, xP2, cy - CIR / 2, true);

L(x, cy, x + GAP, cy, true); x += GAP;

// GAP
box(x, 0.5, 'GAP'); x += 0.5;
const fanX = x + 0.1;
L(x, cy, fanX, cy, false);

// 4 FC
const fcW = 0.32, fcH = 0.25, fcGap = 0.05;
const fcX = fanX + 0.18;
const totalH = 4 * fcH + 3 * fcGap;
const fcTop = cy - totalH / 2;

for (let i = 0; i < 4; i++) {
    const fy = fcTop + i * (fcH + fcGap);
    sbox(fcX, fy, fcW, fcH, 'FC');
    L(fanX, cy, fcX, fy + fcH / 2, false);
}

const fanInX = fcX + fcW + 0.18;
for (let i = 0; i < 4; i++) {
    const fy = fcTop + i * (fcH + fcGap) + fcH / 2;
    L(fcX + fcW, fy, fanInX, cy, false);
}
x = fanInX;
L(x, cy, x + GAP, cy, true); x += GAP;

// Concat → FC → Sigmoid → (×)
box(x, 0.6, 'Concat'); x += 0.6;
L(x, cy, x + GAP, cy, true); x += GAP;

box(x, 0.35, 'FC'); x += 0.35;
L(x, cy, x + GAP, cy, true); x += GAP;

box(x, 0.6, 'Sigmoid'); x += 0.6;
L(x, cy, x + GAP, cy, false); x += GAP;

const xM = x + CIR / 2; cir(xM, '×'); x += CIR;
L(x, cy, x + GAP, cy, true); x += GAP;

slide.addText('Output', { x, y: cy - 0.1, w: 0.45, h: 0.2, fontSize: FS, fontFace: FEN, color: '999999', align: 'center', valign: 'middle' });

const outPath = path.join(__dirname, 'fig4-5_sae_module.pptx');
pptx.writeFile({ fileName: outPath }).then(() => console.log('已保存:', outPath));
