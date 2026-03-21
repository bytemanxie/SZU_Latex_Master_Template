const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.defineLayout({ name: 'CUSTOM', width: 5, height: 10 });
pptx.layout = 'CUSTOM';

const slide = pptx.addSlide();
slide.background = { color: 'FFFFFF' };

const cx = 2.5;
const blockW = 2.2;
const blockH = 0.45;
const lnH = 0.32;
const circR = 0.22;
const skipX = cx + blockW / 2 + 0.45;

const bgW = 3.6;
const bgH = 8.2;
const bgX = cx - bgW / 2;
const bgY = 0.8;

slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: bgX, y: bgY, w: bgW, h: bgH,
  fill: { color: 'F5ECD7' },
  line: { color: 'F5ECD7', width: 0 },
  rectRadius: 0.25
});

const blue = 'D6E4F0';
const blueBorder = 'B0C4DE';
const textOpts = { fontFace: 'Arial', fontSize: 11, color: '333333', align: 'center', valign: 'middle' };

function drawBlock(y, w, h, lines) {
  const x = cx - w / 2;
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: blue },
    line: { color: blueBorder, width: 0.75 },
    rectRadius: 0.06
  });
  if (lines.length === 1) {
    slide.addText(lines[0], { x, y, w, h, ...textOpts });
  } else {
    const combined = lines.map((t, i) => ({
      text: t + (i < lines.length - 1 ? '\n' : ''),
      options: { fontFace: 'Arial', fontSize: 11, color: '333333' }
    }));
    slide.addText(combined, { x, y, w, h, align: 'center', valign: 'middle', lineSpacingMultiple: 0.9 });
  }
  return { x, y, w, h, cx: x + w / 2, top: y, bot: y + h };
}

function drawAddCircle(y) {
  const d = circR * 2;
  slide.addShape(pptx.shapes.OVAL, {
    x: cx - circR, y: y - circR, w: d, h: d,
    fill: { color: 'FFFFFF' },
    line: { color: '333333', width: 1.2 }
  });
  slide.addText('+', {
    x: cx - circR, y: y - circR, w: d, h: d,
    fontFace: 'Arial', fontSize: 14, bold: true, color: '333333',
    align: 'center', valign: 'middle'
  });
  return { cx, cy: y, top: y - circR, bot: y + circR };
}

function drawArrow(x1, y1, x2, y2) {
  slide.addShape(pptx.shapes.LINE, {
    x: x1, y: y1, w: x2 - x1 || 0.001, h: y2 - y1 || 0.001,
    line: { color: '333333', width: 1.5 },
    lineHead: y2 < y1 ? 'arrow' : 'none',
    lineTail: y2 > y1 ? 'none' : 'none'
  });
}

function drawVLine(x, y1, y2) {
  slide.addShape(pptx.shapes.LINE, {
    x, y: Math.min(y1, y2), w: 0.001, h: Math.abs(y2 - y1),
    line: { color: '333333', width: 1.5 }
  });
}

function drawHLine(x1, x2, y) {
  slide.addShape(pptx.shapes.LINE, {
    x: Math.min(x1, x2), y, w: Math.abs(x2 - x1), h: 0.001,
    line: { color: '333333', width: 1.5 }
  });
}

function drawArrowHead(x, y, dir) {
  if (dir === 'up') {
    slide.addShape(pptx.shapes.LINE, {
      x: x - 0.06, y: y + 0.08, w: 0.06, h: 0.08,
      line: { color: '333333', width: 1.5 }
    });
    slide.addShape(pptx.shapes.LINE, {
      x: x, y: y + 0.08, w: 0.06, h: 0.08,
      line: { color: '333333', width: 1.5 }
    });
  } else if (dir === 'left') {
    slide.addShape(pptx.shapes.LINE, {
      x: x, y: y - 0.06, w: 0.08, h: 0.06,
      line: { color: '333333', width: 1.5 }
    });
    slide.addShape(pptx.shapes.LINE, {
      x: x, y: y, w: 0.08, h: 0.06,
      line: { color: '333333', width: 1.5 }
    });
  }
}

const gap = 0.15;
const arrowGap = 0.12;

let curY = 8.6;

slide.addText('Input Feature', {
  x: cx - 0.6, y: curY, w: 1.2, h: 0.2,
  fontFace: 'Arial', fontSize: 8, italic: true, color: '888888', align: 'center'
});

curY -= 0.3;
drawVLine(cx, curY + 0.25, curY);

curY -= blockH;
const dwconv = drawBlock(curY, blockW, blockH, ['DWConv 3×3']);

curY -= arrowGap;
drawVLine(cx, dwconv.top, curY);

curY -= circR;
const add1 = drawAddCircle(curY);

const skip1BotY = dwconv.bot + 0.15;
drawHLine(cx, skipX, skip1BotY);
drawVLine(skipX, skip1BotY, add1.cy);
drawHLine(skipX, add1.cx + circR, add1.cy);
drawArrowHead(add1.cx + circR, add1.cy, 'left');

curY = add1.top - arrowGap;
drawVLine(cx, add1.top, curY);

curY -= lnH;
const ln1 = drawBlock(curY, 1.4, lnH, ['LN']);

curY -= arrowGap;
drawVLine(cx, ln1.top, curY);

curY -= 0.55;
const bra = drawBlock(curY, 2.4, 0.55, ['Bi-level Routing', 'Attention']);

curY -= arrowGap;
drawVLine(cx, bra.top, curY);

curY -= circR;
const add2 = drawAddCircle(curY);

const skip2BotY = add1.top - 0.02;
const skip2X = skipX + 0.3;
drawHLine(cx, skip2X, skip2BotY);
drawVLine(skip2X, skip2BotY, add2.cy);
drawHLine(skip2X, add2.cx + circR, add2.cy);
drawArrowHead(add2.cx + circR, add2.cy, 'left');

curY = add2.top - arrowGap;
drawVLine(cx, add2.top, curY);

curY -= lnH;
const ln2 = drawBlock(curY, 1.4, lnH, ['LN']);

curY -= arrowGap;
drawVLine(cx, ln2.top, curY);

curY -= blockH;
const mlp = drawBlock(curY, blockW, blockH, ['MLP']);

curY -= arrowGap;
drawVLine(cx, mlp.top, curY);

curY -= circR;
const add3 = drawAddCircle(curY);

const skip3BotY = add2.top - 0.02;
const skip3X = skip2X;
drawHLine(cx, skip3X, skip3BotY);
drawVLine(skip3X, skip3BotY, add3.cy);
drawHLine(skip3X, add3.cx + circR, add3.cy);
drawArrowHead(add3.cx + circR, add3.cy, 'left');

curY = add3.top - arrowGap;
drawVLine(cx, add3.top, curY);

const outY = curY - 0.15;
drawVLine(cx, curY, outY);
drawArrowHead(cx, outY, 'up');

slide.addText('Output Feature', {
  x: cx - 0.6, y: outY - 0.25, w: 1.2, h: 0.2,
  fontFace: 'Arial', fontSize: 8, italic: true, color: '888888', align: 'center'
});

const outPath = '/Users/xiezhijie/Documents/SZU_Latex_Master_Template/figure/cp4/fig4-3_tr_module.pptx';
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('Created:', outPath);
}).catch(err => {
  console.error('Error:', err);
});
