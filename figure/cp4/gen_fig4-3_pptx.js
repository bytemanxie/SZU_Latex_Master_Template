const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
const slide = pptx.addSlide();

const FS = 9, FEN = 'Times New Roman', TXT = '333333';
const FILL = 'DDEAF6', BD = '5B9BD5';
const BRA_FILL = 'C5D9F1', BRA_BD = '4472C4';
const ARR = '666666';

const BH = 0.5, GAP = 0.18, CIR = 0.3;
const cy = 5.625 / 2;

function box(x, w, txt, opts = {}) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y: cy - BH / 2, w, h: BH,
        fill: { color: opts.fill || FILL }, line: { color: opts.bd || BD, width: 0.8 },
        rectRadius: 0.04,
    });
    slide.addText(txt, {
        x, y: cy - BH / 2, w, h: BH,
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
        align: 'center', valign: 'middle', fontSize: 10, fontFace: FEN, color: TXT, bold: true,
    });
}
function L(x1, y1, x2, y2, arr) {
    const o = {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
        line: { color: ARR, width: 0.8 },
    };
    if (x2 < x1) o.flipH = true;
    if (y2 < y1) o.flipV = true;
    if (arr) o.line.endArrowType = 'triangle';
    slide.addShape(pptx.shapes.LINE, o);
}

let x = 0.3;
slide.addText('Input', { x, y: cy - 0.1, w: 0.45, h: 0.2, fontSize: FS, fontFace: FEN, color: '999999', align: 'center', valign: 'middle' });
x += 0.5;

// DWConv
const xA = x; L(x, cy, x + GAP, cy, true); x += GAP;
box(x, 1.1, 'DWConv 3×3'); x += 1.1;
L(x, cy, x + GAP, cy, false); x += GAP;
const xP1 = x + CIR / 2; cir(xP1, '+'); x += CIR;

// skip 1: xA 上方绕过 DWConv → (+)1
const s1 = cy - BH / 2 - 0.28;
L(xA, cy, xA, s1, false);
L(xA, s1, xP1, s1, false);
L(xP1, s1, xP1, cy - CIR / 2, true);

L(x, cy, x + GAP, cy, true); x += GAP;

// LN1 + BRA
const xB = x;
box(x, 0.5, 'LN'); x += 0.5;
L(x, cy, x + GAP, cy, true); x += GAP;
box(x, 1.5, 'Bi-level Routing\nAttention', { fill: BRA_FILL, bd: BRA_BD }); x += 1.5;
L(x, cy, x + GAP, cy, false); x += GAP;
const xP2 = x + CIR / 2; cir(xP2, '+'); x += CIR;

// skip 2: xB 下方绕过 LN+BRA → (+)2
const s2 = cy + BH / 2 + 0.28;
L(xB, cy, xB, s2, false);
L(xB, s2, xP2, s2, false);
L(xP2, s2, xP2, cy + CIR / 2, true);

L(x, cy, x + GAP, cy, true); x += GAP;

// LN2 + MLP
const xC = x;
box(x, 0.5, 'LN'); x += 0.5;
L(x, cy, x + GAP, cy, true); x += GAP;
box(x, 0.7, 'MLP'); x += 0.7;
L(x, cy, x + GAP, cy, false); x += GAP;
const xP3 = x + CIR / 2; cir(xP3, '+'); x += CIR;

// skip 3: xC 上方绕过 LN+MLP → (+)3
L(xC, cy, xC, s1, false);
L(xC, s1, xP3, s1, false);
L(xP3, s1, xP3, cy - CIR / 2, true);

L(x, cy, x + GAP, cy, true); x += GAP;
slide.addText('Output', { x, y: cy - 0.1, w: 0.5, h: 0.2, fontSize: FS, fontFace: FEN, color: '999999', align: 'center', valign: 'middle' });

const outPath = path.join(__dirname, 'fig4-3_tr_module.pptx');
pptx.writeFile({ fileName: outPath }).then(() => console.log('已保存:', outPath));
