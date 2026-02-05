/**
 * 模块结构图生成器
 * 
 * 使用 pptxgenjs API 绘制 TR 模块和 SAE 模块的横向结构图
 * 用于替换论文中占据整页的纵向图片
 */

const pptxgen = require('pptxgenjs');
const path = require('path');

// 复用颜色配置
const COLORS = {
    NAVY: '1C2833',      // 深蓝色 - 主色调
    SLATE: '2E4053',     // 石板灰 - 次要色
    SILVER: 'AAB7B8',    // 银色 - 装饰色
    OFFWHITE: 'F4F6F6',  // 米白色 - 背景色
    RED: 'E74C3C',       // 红色 - 强调色
    GREEN: '27AE60',     // 绿色 - 成功/提升
    WHITE: 'FFFFFF',     // 白色
    BLUE: '3498DB',      // 蓝色 - 输入/输出
    ORANGE: 'E67E22',    // 橙色 - 中间过程
    PURPLE: '9B59B6',    // 紫色 - 注意力
    YELLOW: 'F1C40F',    // 黄色 - 高亮
    LIGHTBLUE: 'AED6F1', // 浅蓝色
    LIGHTGREEN: 'A9DFBF',// 浅绿色
    LIGHTRED: 'F5B7B1',  // 浅红色
    LIGHTORANGE: 'FAD7A0',// 浅橙色
    LIGHTPURPLE: 'D7BDE2',// 浅紫色
};

/**
 * 绘制箭头（使用三角形 + 线条模拟）
 */
function drawArrow(slide, pptx, x1, y1, x2, y2, color = COLORS.SLATE, lineWidth = 1.5) {
    // 绘制线条
    slide.addShape(pptx.shapes.LINE, {
        x: x1, y: y1,
        w: x2 - x1, h: y2 - y1,
        line: { color: color, width: lineWidth, endArrowType: 'triangle' }
    });
}

/**
 * 绘制模块框
 */
function drawModuleBox(slide, pptx, x, y, w, h, label, sublabel, fillColor, borderColor = null) {
    // 绘制圆角矩形
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x, y, w, h,
        fill: { color: fillColor },
        line: borderColor ? { color: borderColor, width: 1.5 } : { color: fillColor, width: 0 },
        rectRadius: 0.1
    });
    
    // 主标签
    slide.addText(label, {
        x, y: y + h * 0.15, w, h: h * 0.4,
        align: 'center', valign: 'middle',
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE
    });
    
    // 副标签（如果有）
    if (sublabel) {
        slide.addText(sublabel, {
            x, y: y + h * 0.55, w, h: h * 0.35,
            align: 'center', valign: 'middle',
            fontFace: 'Arial', fontSize: 7, color: COLORS.WHITE
        });
    }
}

/**
 * 绘制简单文本框
 */
function drawTextBox(slide, x, y, w, h, text, fontSize = 8, color = COLORS.SLATE, bold = false) {
    slide.addText(text, {
        x, y, w, h,
        align: 'center', valign: 'middle',
        fontFace: 'Arial', fontSize, color, bold
    });
}

/**
 * 绘制 TR 模块横向结构图
 * 展示完整的 Transformer Block 结构：Attention + FFN，各带残差连接
 */
function drawTRModule(pptx) {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.WHITE };
    
    // 布局参数
    const boxH = 0.55;
    const ioBoxW = 0.9;
    const smallBoxW = 0.85;
    const moduleW = 1.4;
    const arrowLen = 0.18;
    const baseY = 1.15;
    const lineColor = COLORS.NAVY;
    const lineWidth = 1.5;
    
    let curX = 0.25;
    
    // ========== 输入 ==========
    drawModuleBox(slide, pptx, curX, baseY, ioBoxW, boxH, 'Input', 'H×W×C', COLORS.BLUE);
    curX += ioBoxW;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen, baseY + boxH/2, lineColor);
    curX += arrowLen + 0.05;
    
    // ========== DWConv (位置编码) ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: curX, y: baseY, w: smallBoxW, h: boxH,
        fill: { color: COLORS.SLATE },
        rectRadius: 0.08
    });
    drawTextBox(slide, curX, baseY + 0.1, smallBoxW, 0.2, 'DWConv', 9, COLORS.WHITE, true);
    drawTextBox(slide, curX, baseY + 0.3, smallBoxW, 0.2, 'PE', 8, COLORS.SILVER);
    
    curX += smallBoxW;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen, baseY + boxH/2, lineColor);
    curX += arrowLen + 0.05;
    
    // ========== 第一个残差块：LN + BRA + Add ==========
    const block1StartX = curX - 0.1;
    
    // LayerNorm 1
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: curX, y: baseY, w: smallBoxW * 0.8, h: boxH,
        fill: { color: COLORS.ORANGE },
        rectRadius: 0.08
    });
    drawTextBox(slide, curX, baseY + 0.15, smallBoxW * 0.8, 0.25, 'LN', 9, COLORS.WHITE, true);
    
    curX += smallBoxW * 0.8;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen * 0.8, baseY + boxH/2, lineColor);
    curX += arrowLen * 0.8 + 0.05;
    
    // Bi-level Routing Attention
    const braX = curX;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: braX, y: baseY - 0.03, w: moduleW, h: boxH + 0.06,
        fill: { color: 'D5F5E3' },
        line: { color: COLORS.GREEN, width: 2 },
        rectRadius: 0.1
    });
    drawTextBox(slide, braX, baseY + 0.05, moduleW, 0.22, 'Bi-level Routing', 9, COLORS.NAVY, true);
    drawTextBox(slide, braX, baseY + 0.27, moduleW, 0.22, 'Attention', 9, COLORS.NAVY, true);
    
    curX = braX + moduleW;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen * 0.8, baseY + boxH/2, lineColor);
    curX += arrowLen * 0.8 + 0.05;
    
    // Add 1 (第一个加号)
    const add1X = curX;
    slide.addShape(pptx.shapes.OVAL, {
        x: add1X, y: baseY + boxH/2 - 0.13, w: 0.26, h: 0.26,
        fill: { color: COLORS.YELLOW },
        line: { color: COLORS.NAVY, width: 1.5 }
    });
    drawTextBox(slide, add1X, baseY + boxH/2 - 0.13, 0.26, 0.26, '+', 12, COLORS.NAVY, true);
    
    // 第一个残差连接线
    const res1Y = baseY + boxH + 0.2;
    slide.addShape(pptx.shapes.LINE, {
        x: block1StartX, y: baseY + boxH/2,
        w: 0, h: res1Y - baseY - boxH/2,
        line: { color: lineColor, width: lineWidth }
    });
    slide.addShape(pptx.shapes.LINE, {
        x: block1StartX, y: res1Y,
        w: add1X + 0.13 - block1StartX, h: 0,
        line: { color: lineColor, width: lineWidth }
    });
    slide.addShape(pptx.shapes.LINE, {
        x: add1X + 0.13, y: res1Y,
        w: 0, h: -(res1Y - baseY - boxH/2 + 0.13),
        line: { color: lineColor, width: lineWidth }
    });
    
    curX = add1X + 0.26;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen * 0.8, baseY + boxH/2, lineColor);
    curX += arrowLen * 0.8 + 0.05;
    
    // ========== 第二个残差块：LN + MLP + Add ==========
    const block2StartX = curX - 0.1;
    
    // LayerNorm 2
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: curX, y: baseY, w: smallBoxW * 0.8, h: boxH,
        fill: { color: COLORS.ORANGE },
        rectRadius: 0.08
    });
    drawTextBox(slide, curX, baseY + 0.15, smallBoxW * 0.8, 0.25, 'LN', 9, COLORS.WHITE, true);
    
    curX += smallBoxW * 0.8;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen * 0.8, baseY + boxH/2, lineColor);
    curX += arrowLen * 0.8 + 0.05;
    
    // MLP / FFN
    const mlpX = curX;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: mlpX, y: baseY - 0.03, w: smallBoxW, h: boxH + 0.06,
        fill: { color: 'D6EAF8' },
        line: { color: COLORS.BLUE, width: 2 },
        rectRadius: 0.1
    });
    drawTextBox(slide, mlpX, baseY + 0.12, smallBoxW, 0.25, 'MLP', 10, COLORS.NAVY, true);
    
    curX = mlpX + smallBoxW;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen * 0.8, baseY + boxH/2, lineColor);
    curX += arrowLen * 0.8 + 0.05;
    
    // Add 2 (第二个加号)
    const add2X = curX;
    slide.addShape(pptx.shapes.OVAL, {
        x: add2X, y: baseY + boxH/2 - 0.13, w: 0.26, h: 0.26,
        fill: { color: COLORS.YELLOW },
        line: { color: COLORS.NAVY, width: 1.5 }
    });
    drawTextBox(slide, add2X, baseY + boxH/2 - 0.13, 0.26, 0.26, '+', 12, COLORS.NAVY, true);
    
    // 第二个残差连接线
    slide.addShape(pptx.shapes.LINE, {
        x: block2StartX, y: baseY + boxH/2,
        w: 0, h: res1Y - baseY - boxH/2,
        line: { color: lineColor, width: lineWidth }
    });
    slide.addShape(pptx.shapes.LINE, {
        x: block2StartX, y: res1Y,
        w: add2X + 0.13 - block2StartX, h: 0,
        line: { color: lineColor, width: lineWidth }
    });
    slide.addShape(pptx.shapes.LINE, {
        x: add2X + 0.13, y: res1Y,
        w: 0, h: -(res1Y - baseY - boxH/2 + 0.13),
        line: { color: lineColor, width: lineWidth }
    });
    
    curX = add2X + 0.26;
    drawArrow(slide, pptx, curX + 0.03, baseY + boxH/2, curX + arrowLen, baseY + boxH/2, lineColor);
    curX += arrowLen + 0.05;
    
    // ========== 输出 ==========
    drawModuleBox(slide, pptx, curX, baseY, ioBoxW, boxH, 'Output', 'H×W×C', COLORS.BLUE);
    
    return slide;
}

/**
 * 绘制 SAE 模块横向结构图
 */
function drawSAEModule(pptx) {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.WHITE };
    
    // 布局参数
    const startX = 0.2;
    const boxH = 0.45;
    const boxW = 0.75;
    const smallBoxW = 0.6;
    const arrowGap = 0.08;
    const baseY = 0.5;      // 坐标注意力分支 Y
    const baseY2 = 1.55;    // 通道注意力分支 Y
    
    // ========== 输入框 ==========
    let curX = startX;
    const inputY = 1.0;
    
    // 输入特征图
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: curX, y: inputY, w: boxW, h: 0.8,
        fill: { color: COLORS.BLUE },
        line: { color: COLORS.BLUE, width: 0 },
        rectRadius: 0.1
    });
    drawTextBox(slide, curX, inputY + 0.15, boxW, 0.25, 'Input', 10, COLORS.WHITE, true);
    drawTextBox(slide, curX, inputY + 0.45, boxW, 0.25, 'H×W×C', 8, COLORS.WHITE);
    
    // 分叉箭头
    curX += boxW;
    // 上分支箭头
    slide.addShape(pptx.shapes.LINE, {
        x: curX + 0.02, y: inputY + 0.4,
        w: 0.25, h: -0.5,
        line: { color: COLORS.GREEN, width: 1.5, endArrowType: 'triangle' }
    });
    // 下分支箭头
    slide.addShape(pptx.shapes.LINE, {
        x: curX + 0.02, y: inputY + 0.4,
        w: 0.25, h: 0.5,
        line: { color: COLORS.RED, width: 1.5, endArrowType: 'triangle' }
    });
    
    curX += 0.35;
    
    // ========== 上分支：坐标注意力 ==========
    let coordX = curX;
    
    // 分支标题
    slide.addText('Coordinate Attention', {
        x: coordX - 0.1, y: baseY - 0.35, w: 3.5, h: 0.3,
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.GREEN
    });
    
    // H 方向池化
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: coordX, y: baseY, w: smallBoxW, h: boxH,
        fill: { color: COLORS.GREEN },
        rectRadius: 0.08
    });
    drawTextBox(slide, coordX, baseY, smallBoxW, boxH * 0.5, 'AvgPool', 8, COLORS.WHITE, true);
    drawTextBox(slide, coordX, baseY + boxH * 0.45, smallBoxW, boxH * 0.5, '(H-dir)', 7, COLORS.WHITE);
    
    // W 方向池化
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: coordX, y: baseY + boxH + 0.28, w: smallBoxW, h: boxH,
        fill: { color: COLORS.GREEN },
        rectRadius: 0.08
    });
    drawTextBox(slide, coordX, baseY + boxH + 0.28, smallBoxW, boxH * 0.5, 'AvgPool', 8, COLORS.WHITE, true);
    drawTextBox(slide, coordX, baseY + boxH + 0.28 + boxH * 0.45, smallBoxW, boxH * 0.5, '(W-dir)', 7, COLORS.WHITE);
    
    // 箭头
    coordX += smallBoxW;
    drawArrow(slide, pptx, coordX + 0.02, baseY + boxH/2, coordX + arrowGap + 0.12, baseY + boxH/2, COLORS.GREEN);
    drawArrow(slide, pptx, coordX + 0.02, baseY + boxH * 1.5 + 0.28, coordX + arrowGap + 0.12, baseY + boxH * 1.5 + 0.28, COLORS.GREEN);
    coordX += arrowGap + 0.15;
    
    // Concat
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: coordX, y: baseY + boxH * 0.4, w: smallBoxW * 0.8, h: boxH * 1.5,
        fill: { color: '1ABC9C' },
        rectRadius: 0.08
    });
    drawTextBox(slide, coordX, baseY + boxH * 0.4, smallBoxW * 0.8, boxH * 1.5, 'Concat', 8, COLORS.WHITE, true);
    
    // 箭头
    coordX += smallBoxW * 0.8;
    drawArrow(slide, pptx, coordX + 0.02, baseY + boxH, coordX + arrowGap + 0.12, baseY + boxH, COLORS.GREEN);
    coordX += arrowGap + 0.15;
    
    // Conv 1x1
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: coordX, y: baseY + boxH * 0.55, w: smallBoxW * 0.8, h: boxH * 1.2,
        fill: { color: '16A085' },
        rectRadius: 0.08
    });
    drawTextBox(slide, coordX, baseY + boxH * 0.55, smallBoxW * 0.8, boxH * 0.6, 'Conv', 8, COLORS.WHITE, true);
    drawTextBox(slide, coordX, baseY + boxH * 1.1, smallBoxW * 0.8, boxH * 0.6, '1×1', 7, COLORS.WHITE);
    
    // 箭头
    coordX += smallBoxW * 0.8;
    drawArrow(slide, pptx, coordX + 0.02, baseY + boxH, coordX + arrowGap + 0.12, baseY + boxH, COLORS.GREEN);
    coordX += arrowGap + 0.15;
    
    // Split + Sigmoid
    // 上分支 Sigmoid (H)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: coordX, y: baseY + 0.05, w: smallBoxW * 0.7, h: boxH * 0.9,
        fill: { color: '27AE60' },
        rectRadius: 0.08
    });
    drawTextBox(slide, coordX, baseY + 0.05, smallBoxW * 0.7, boxH * 0.9, 'σ(aₕ)', 8, COLORS.WHITE, true);
    
    // 下分支 Sigmoid (W)
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: coordX, y: baseY + boxH + 0.35, w: smallBoxW * 0.7, h: boxH * 0.9,
        fill: { color: '27AE60' },
        rectRadius: 0.08
    });
    drawTextBox(slide, coordX, baseY + boxH + 0.35, smallBoxW * 0.7, boxH * 0.9, 'σ(aᵥ)', 8, COLORS.WHITE, true);
    
    const coordEndX = coordX + smallBoxW * 0.7;
    
    // ========== 下分支：通道注意力 ==========
    let chanX = curX;
    
    // 分支标题
    slide.addText('Channel Attention (SE)', {
        x: chanX - 0.1, y: baseY2 + boxH + 0.35, w: 3.5, h: 0.3,
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED
    });
    
    // GAP
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: chanX, y: baseY2, w: smallBoxW, h: boxH,
        fill: { color: COLORS.RED },
        rectRadius: 0.08
    });
    drawTextBox(slide, chanX, baseY2, smallBoxW, boxH * 0.5, 'GAP', 8, COLORS.WHITE, true);
    drawTextBox(slide, chanX, baseY2 + boxH * 0.45, smallBoxW, boxH * 0.5, 'Global', 6, COLORS.WHITE);
    
    // 箭头
    chanX += smallBoxW;
    drawArrow(slide, pptx, chanX + 0.02, baseY2 + boxH/2, chanX + arrowGap + 0.12, baseY2 + boxH/2, COLORS.RED);
    chanX += arrowGap + 0.15;
    
    // FC 降维
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: chanX, y: baseY2, w: smallBoxW * 0.7, h: boxH,
        fill: { color: 'C0392B' },
        rectRadius: 0.08
    });
    drawTextBox(slide, chanX, baseY2, smallBoxW * 0.7, boxH * 0.5, 'FC', 8, COLORS.WHITE, true);
    drawTextBox(slide, chanX, baseY2 + boxH * 0.45, smallBoxW * 0.7, boxH * 0.5, 'C→C/r', 6, COLORS.WHITE);
    
    // 箭头
    chanX += smallBoxW * 0.7;
    drawArrow(slide, pptx, chanX + 0.02, baseY2 + boxH/2, chanX + arrowGap + 0.08, baseY2 + boxH/2, COLORS.RED);
    chanX += arrowGap + 0.1;
    
    // ReLU
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: chanX, y: baseY2, w: smallBoxW * 0.6, h: boxH,
        fill: { color: COLORS.ORANGE },
        rectRadius: 0.08
    });
    drawTextBox(slide, chanX, baseY2, smallBoxW * 0.6, boxH, 'ReLU', 8, COLORS.WHITE, true);
    
    // 箭头
    chanX += smallBoxW * 0.6;
    drawArrow(slide, pptx, chanX + 0.02, baseY2 + boxH/2, chanX + arrowGap + 0.08, baseY2 + boxH/2, COLORS.RED);
    chanX += arrowGap + 0.1;
    
    // FC 升维
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: chanX, y: baseY2, w: smallBoxW * 0.7, h: boxH,
        fill: { color: 'C0392B' },
        rectRadius: 0.08
    });
    drawTextBox(slide, chanX, baseY2, smallBoxW * 0.7, boxH * 0.5, 'FC', 8, COLORS.WHITE, true);
    drawTextBox(slide, chanX, baseY2 + boxH * 0.45, smallBoxW * 0.7, boxH * 0.5, 'C/r→C', 6, COLORS.WHITE);
    
    // 箭头
    chanX += smallBoxW * 0.7;
    drawArrow(slide, pptx, chanX + 0.02, baseY2 + boxH/2, chanX + arrowGap + 0.08, baseY2 + boxH/2, COLORS.RED);
    chanX += arrowGap + 0.1;
    
    // Sigmoid
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: chanX, y: baseY2, w: smallBoxW * 0.6, h: boxH,
        fill: { color: 'E74C3C' },
        rectRadius: 0.08
    });
    drawTextBox(slide, chanX, baseY2, smallBoxW * 0.6, boxH, 'σ(s)', 8, COLORS.WHITE, true);
    
    const chanEndX = chanX + smallBoxW * 0.6;
    
    // ========== 融合部分 ==========
    const fuseX = Math.max(coordEndX, chanEndX) + 0.3;
    
    // 从坐标注意力分支连线到乘法节点
    slide.addShape(pptx.shapes.LINE, {
        x: coordEndX + 0.02, y: baseY + boxH * 0.5,
        w: fuseX - coordEndX - 0.02, h: inputY - baseY - boxH * 0.1,
        line: { color: COLORS.GREEN, width: 1.5, endArrowType: 'triangle' }
    });
    slide.addShape(pptx.shapes.LINE, {
        x: coordEndX + 0.02, y: baseY + boxH * 1.8,
        w: fuseX - coordEndX - 0.02, h: inputY + 0.4 - baseY - boxH * 1.8,
        line: { color: COLORS.GREEN, width: 1.5, endArrowType: 'triangle' }
    });
    
    // 从通道注意力分支连线
    slide.addShape(pptx.shapes.LINE, {
        x: chanEndX + 0.02, y: baseY2 + boxH/2,
        w: fuseX - chanEndX - 0.02, h: inputY + 0.4 - baseY2 - boxH/2,
        line: { color: COLORS.RED, width: 1.5, endArrowType: 'triangle' }
    });
    
    // 乘法节点
    slide.addShape(pptx.shapes.OVAL, {
        x: fuseX, y: inputY + 0.1, w: 0.6, h: 0.6,
        fill: { color: COLORS.PURPLE },
        line: { color: COLORS.PURPLE, width: 0 }
    });
    drawTextBox(slide, fuseX, inputY + 0.1, 0.6, 0.6, '⊗', 16, COLORS.WHITE, true);
    drawTextBox(slide, fuseX - 0.1, inputY + 0.75, 0.8, 0.2, 'Element-wise', 6, COLORS.SLATE);
    drawTextBox(slide, fuseX - 0.1, inputY + 0.92, 0.8, 0.2, 'Multiply', 6, COLORS.SLATE);
    
    // 输出箭头
    drawArrow(slide, pptx, fuseX + 0.6 + 0.02, inputY + 0.4, fuseX + 0.9, inputY + 0.4, COLORS.SLATE);
    
    // 输出框
    const outputX = fuseX + 0.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: outputX, y: inputY, w: boxW, h: 0.8,
        fill: { color: COLORS.BLUE },
        line: { color: COLORS.BLUE, width: 0 },
        rectRadius: 0.1
    });
    drawTextBox(slide, outputX, inputY + 0.15, boxW, 0.25, 'Output', 10, COLORS.WHITE, true);
    drawTextBox(slide, outputX, inputY + 0.45, boxW, 0.25, 'H×W×C', 8, COLORS.WHITE);
    
    return slide;
}

/**
 * 主函数：生成模块结构图 PPT
 */
function generateFigures() {
    console.log('开始生成模块结构图 PPT...\n');
    
    // 创建 PPT 实例
    const pptx = new pptxgen();
    
    // 设置为宽屏比例，方便绘制横向图
    pptx.layout = 'LAYOUT_WIDE';  // 13.33" x 7.5"
    pptx.defineLayout({ name: 'FIGURE', width: 10, height: 3.3 });
    pptx.layout = 'FIGURE';
    
    pptx.author = '谢智捷';
    pptx.title = '模块结构图';
    pptx.subject = 'TR模块和SAE模块横向结构图';
    
    console.log('绘制 TR 模块结构图...');
    drawTRModule(pptx);
    
    console.log('绘制 SAE 模块结构图...');
    drawSAEModule(pptx);
    
    // 保存文件
    const outputPath = path.join(__dirname, '..', '模块结构图.pptx');
    
    pptx.writeFile({ fileName: outputPath })
        .then(() => {
            console.log('\n✓ 模块结构图 PPT 生成成功！');
            console.log(`  输出文件: ${outputPath}`);
            console.log('\n=== 使用说明 ===');
            console.log('1. 打开生成的 PPT 文件');
            console.log('2. 选择每页幻灯片，右键导出为 PNG（建议分辨率 300 DPI）');
            console.log('3. 保存为:');
            console.log('   - 第 1 页 → figure/cp3/fig3-3_tr_module_horizontal.png');
            console.log('   - 第 2 页 → figure/cp4/sae_diagram/fig4-1_sae_module_horizontal.png');
            console.log('4. 更新 LaTeX 文件中的图片引用\n');
        })
        .catch(err => {
            console.error('生成 PPT 时出错:', err);
            process.exit(1);
        });
}

// 运行
generateFigures();
