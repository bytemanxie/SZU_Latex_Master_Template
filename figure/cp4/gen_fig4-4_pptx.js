const pptxgen = require('pptxgenjs');
const path = require('path');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
const slide = pptx.addSlide();

const FS = 9, FONT = '宋体', FEN = 'Times New Roman', TXT = '1A1A1A';
const ARR = '555555';

function addTxt(x, y, w, h, txt, opts = {}) {
    slide.addText(txt, {
        x, y, w, h, align: opts.align || 'center', valign: opts.valign || 'middle',
        fontSize: opts.fs || FS, fontFace: opts.font || FONT, color: opts.color || TXT,
        bold: opts.bold || false,
    });
}
function addLine(x1, y1, x2, y2, arrow) {
    const o = {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
        line: { color: ARR, width: 1.2 },
    };
    if (x2 < x1) o.flipH = true;
    if (y2 < y1) o.flipV = true;
    if (arrow) o.line.endArrowType = 'triangle';
    slide.addShape(pptx.shapes.LINE, o);
}

// ===== Section 1: Window Partition =====
const gridX = 0.6, gridY = 0.8, cellS = 0.32, gridN = 4;
const gridW = cellS * gridN;

for (let r = 0; r < gridN; r++) {
    for (let c = 0; c < gridN; c++) {
        const isQuery = (r === 0 && c === 2);
        slide.addShape(pptx.shapes.RECTANGLE, {
            x: gridX + c * cellS, y: gridY + r * cellS, w: cellS, h: cellS,
            fill: { color: isQuery ? 'FF6B6B' : 'FFFFFF' },
            line: { color: 'AAAAAA', width: 0.6 },
        });
    }
}
addTxt(gridX, gridY + gridW + 0.08, gridW, 0.24, '窗口划分');

// ===== Arrow 1 → 2 =====
const arr1X = gridX + gridW + 0.2;
addLine(arr1X, gridY + gridW / 2, arr1X + 0.6, gridY + gridW / 2, true);

// ===== Section 2: Sparse Selection =====
const g2X = arr1X + 0.85, g2Y = gridY;

for (let r = 0; r < gridN; r++) {
    for (let c = 0; c < gridN; c++) {
        const isQuery = (r === 0 && c === 2);
        const isSelected = (r === 0 && c === 1) || (r === 0 && c === 3) || (r === 1 && c === 2) || (r === 1 && c === 1);
        let fill = 'FFFFFF';
        if (isQuery) fill = 'FF6B6B';
        else if (isSelected) fill = '8BC48A';
        slide.addShape(pptx.shapes.RECTANGLE, {
            x: g2X + c * cellS, y: g2Y + r * cellS, w: cellS, h: cellS,
            fill: { color: fill },
            line: { color: 'AAAAAA', width: 0.6 },
        });
    }
}
addTxt(g2X, g2Y + gridW + 0.08, gridW, 0.24, '稀疏选择');
addTxt(g2X, g2Y + gridW + 0.28, gridW, 0.2, '(TopK 路由)', { font: FEN, color: '888888' });

// ===== Arrow 2 → 3 =====
const arr2X = g2X + gridW + 0.2;
addLine(arr2X, g2Y + gridW / 2, arr2X + 0.6, g2Y + gridW / 2, true);

// ===== Section 3: Attention box =====
const attX = arr2X + 0.8, attY = gridY - 0.1, attW = 1.6, attH = gridW + 0.2;

slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: attX, y: attY, w: attW, h: attH,
    fill: { color: 'F0F7FF' }, line: { color: '4A90D9', width: 1.0 },
    rectRadius: 0.08,
});

const lineH = 0.28;
let ty = attY + 0.15;
addTxt(attX, ty, attW, lineH, 'Q × K', { font: FEN });
ty += lineH;
addTxt(attX, ty, attW, 0.12, '↓', { font: FEN, color: '888888' });
ty += 0.14;
addTxt(attX, ty, attW, lineH, 'Softmax', { font: FEN });
ty += lineH;
addTxt(attX, ty, attW, 0.12, '↓', { font: FEN, color: '888888' });
ty += 0.14;
addTxt(attX, ty, attW, lineH, 'A × V', { font: FEN });

addTxt(attX, attY + attH + 0.08, attW, 0.24, '局部注意力');

// ===== Legend =====
const lgX = attX + attW + 0.4, lgY = gridY + 0.1;

addTxt(lgX, lgY - 0.05, 1.5, 0.22, '图例', { bold: true, align: 'left' });

slide.addShape(pptx.shapes.RECTANGLE, {
    x: lgX, y: lgY + 0.22, w: 0.2, h: 0.2,
    fill: { color: 'FF6B6B' }, line: { color: 'AAAAAA', width: 0.5 },
});
addTxt(lgX + 0.28, lgY + 0.22, 1.0, 0.2, '查询窗口', { align: 'left' });

slide.addShape(pptx.shapes.RECTANGLE, {
    x: lgX, y: lgY + 0.5, w: 0.2, h: 0.2,
    fill: { color: '8BC48A' }, line: { color: 'AAAAAA', width: 0.5 },
});
addTxt(lgX + 0.28, lgY + 0.5, 1.0, 0.2, '被选中窗口', { align: 'left' });

slide.addShape(pptx.shapes.RECTANGLE, {
    x: lgX, y: lgY + 0.78, w: 0.2, h: 0.2,
    fill: { color: 'FFFFFF' }, line: { color: 'AAAAAA', width: 0.5 },
});
addTxt(lgX + 0.28, lgY + 0.78, 1.0, 0.2, '忽略窗口', { align: 'left' });

// ===== Bottom labels =====
const botY = gridY + gridW + 0.65;
addTxt(gridX - 0.2, botY, gridW + g2X - gridX + gridW + 0.4, 0.22,
    '← 第一层：区域级路由（粗粒度）→', { color: '4A90D9' });
addTxt(attX - 0.2, botY, attW + 0.4, 0.22,
    '← 第二层：令牌级注意力（细粒度）→', { color: '4A90D9' });

// ===== QKV labels =====
const qlX = attX + attW + 0.4, qlY = attY + attH / 2 - 0.3;
addTxt(qlX, qlY, 1.8, 0.18, 'Q: 查询向量 (Query)', { align: 'left', font: FEN });
addTxt(qlX, qlY + 0.2, 1.8, 0.18, 'K: 键向量 (Key)', { align: 'left', font: FEN });
addTxt(qlX, qlY + 0.4, 1.8, 0.18, 'V: 值向量 (Value)', { align: 'left', font: FEN });
addTxt(qlX, qlY + 0.6, 1.8, 0.18, 'A: 注意力权重', { align: 'left', font: FEN });

const outPath = path.join(__dirname, 'fig4-4_bilevel_attention.pptx');
pptx.writeFile({ fileName: outPath }).then(() => console.log('已保存:', outPath));
