const pptxgen = require('pptxgenjs');
const path = require('path');

async function createTRModulePPT() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = 'TR模块结构图';
    pptx.author = 'Auto Generated';

    // 创建幻灯片
    const slide = pptx.addSlide();
    
    // 设置背景
    slide.background = { color: 'FFFFFF' };

    // 标题
    slide.addText('图 3-3 TR 模块结构图', {
        x: 0.5, y: 0.2, w: 9, h: 0.5,
        fontSize: 20, bold: true, color: '1a1a2e',
        align: 'center'
    });

    // 定义位置和尺寸常量
    const leftX = 1.8;  // 左侧流程图X起点
    const boxW = 2.2;   // 框宽度
    const boxH = 0.45;  // 框高度
    const arrowH = 0.25; // 箭头间距
    let currentY = 0.75; // 当前Y位置

    // ========== 输入框 ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: boxH,
        fill: { color: 'E8F4F8' },
        line: { color: '4A90A4', width: 1.5 },
        rectRadius: 0.1
    });
    slide.addText('输入特征 (N,C,H,W)', {
        x: leftX, y: currentY, w: boxW, h: boxH,
        fontSize: 10, bold: true, color: '1565C0',
        align: 'center', valign: 'middle'
    });
    currentY += boxH;

    // 箭头
    slide.addText('↓', {
        x: leftX, y: currentY, w: boxW, h: arrowH,
        fontSize: 12, color: '333333', align: 'center', valign: 'middle'
    });
    currentY += arrowH;

    // ========== 位置编码 ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: 0.55,
        fill: { color: 'FCE4EC' },
        line: { color: 'C2185B', width: 1.5 },
        rectRadius: 0.1
    });
    slide.addText([
        { text: '位置编码\n', options: { fontSize: 10, bold: true, color: '880E4F' } },
        { text: 'DWConv 3×3', options: { fontSize: 8, color: '666666' } }
    ], {
        x: leftX, y: currentY, w: boxW, h: 0.55,
        align: 'center', valign: 'middle'
    });
    currentY += 0.55;

    // 箭头 + 残差
    slide.addText('↓ +残差', {
        x: leftX, y: currentY, w: boxW, h: arrowH,
        fontSize: 10, color: '333333', align: 'center', valign: 'middle'
    });
    currentY += arrowH;

    // ========== LayerNorm 1 ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: 0.35,
        fill: { color: 'E8F5E9' },
        line: { color: '388E3C', width: 1.5 },
        rectRadius: 0.08
    });
    slide.addText('LayerNorm', {
        x: leftX, y: currentY, w: boxW, h: 0.35,
        fontSize: 9, bold: true, color: '2E7D32',
        align: 'center', valign: 'middle'
    });
    currentY += 0.35;

    // 箭头
    slide.addText('↓', {
        x: leftX, y: currentY, w: boxW, h: 0.2,
        fontSize: 12, color: '333333', align: 'center', valign: 'middle'
    });
    currentY += 0.2;

    // ========== 双层路由注意力 ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: 0.65,
        fill: { color: 'E3F2FD' },
        line: { color: '1976D2', width: 2 },
        rectRadius: 0.1
    });
    slide.addText([
        { text: '双层路由注意力\n', options: { fontSize: 10, bold: true, color: '0D47A1' } },
        { text: 'Bi-Level Routing Attention', options: { fontSize: 7, color: '555555' } }
    ], {
        x: leftX, y: currentY, w: boxW, h: 0.65,
        align: 'center', valign: 'middle'
    });
    currentY += 0.65;

    // 箭头
    slide.addText('↓', {
        x: leftX, y: currentY, w: boxW, h: 0.2,
        fontSize: 12, color: '333333', align: 'center', valign: 'middle'
    });
    currentY += 0.2;

    // ========== 加号圆圈 1 ==========
    const addX = leftX + boxW/2 - 0.15;
    slide.addShape(pptx.shapes.OVAL, {
        x: addX, y: currentY, w: 0.3, h: 0.3,
        fill: { color: 'FFEB3B' },
        line: { color: 'F57F17', width: 1.5 }
    });
    slide.addText('+', {
        x: addX, y: currentY, w: 0.3, h: 0.3,
        fontSize: 14, bold: true, color: '333333',
        align: 'center', valign: 'middle'
    });
    currentY += 0.3;

    // 箭头 残差连接
    slide.addText('↓ 残差连接', {
        x: leftX, y: currentY, w: boxW, h: 0.22,
        fontSize: 8, color: '666666', align: 'center', valign: 'middle'
    });
    currentY += 0.22;

    // ========== LayerNorm 2 ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: 0.35,
        fill: { color: 'E8F5E9' },
        line: { color: '388E3C', width: 1.5 },
        rectRadius: 0.08
    });
    slide.addText('LayerNorm', {
        x: leftX, y: currentY, w: boxW, h: 0.35,
        fontSize: 9, bold: true, color: '2E7D32',
        align: 'center', valign: 'middle'
    });
    currentY += 0.35;

    // 箭头
    slide.addText('↓', {
        x: leftX, y: currentY, w: boxW, h: 0.2,
        fontSize: 12, color: '333333', align: 'center', valign: 'middle'
    });
    currentY += 0.2;

    // ========== MLP ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: 0.55,
        fill: { color: 'F3E5F5' },
        line: { color: '7B1FA2', width: 1.5 },
        rectRadius: 0.1
    });
    slide.addText([
        { text: 'MLP\n', options: { fontSize: 10, bold: true, color: '4A148C' } },
        { text: 'Linear → GELU → Linear', options: { fontSize: 7, color: '666666' } }
    ], {
        x: leftX, y: currentY, w: boxW, h: 0.55,
        align: 'center', valign: 'middle'
    });
    currentY += 0.55;

    // 箭头
    slide.addText('↓', {
        x: leftX, y: currentY, w: boxW, h: 0.2,
        fontSize: 12, color: '333333', align: 'center', valign: 'middle'
    });
    currentY += 0.2;

    // ========== 加号圆圈 2 ==========
    slide.addShape(pptx.shapes.OVAL, {
        x: addX, y: currentY, w: 0.3, h: 0.3,
        fill: { color: 'FFEB3B' },
        line: { color: 'F57F17', width: 1.5 }
    });
    slide.addText('+', {
        x: addX, y: currentY, w: 0.3, h: 0.3,
        fontSize: 14, bold: true, color: '333333',
        align: 'center', valign: 'middle'
    });
    currentY += 0.3;

    // 箭头 残差连接
    slide.addText('↓ 残差连接', {
        x: leftX, y: currentY, w: boxW, h: 0.22,
        fontSize: 8, color: '666666', align: 'center', valign: 'middle'
    });
    currentY += 0.22;

    // ========== 输出框 ==========
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: leftX, y: currentY, w: boxW, h: boxH,
        fill: { color: 'E8F4F8' },
        line: { color: '4A90A4', width: 1.5 },
        rectRadius: 0.1
    });
    slide.addText('输出特征 (N,C,H,W)', {
        x: leftX, y: currentY, w: boxW, h: boxH,
        fontSize: 10, bold: true, color: '1565C0',
        align: 'center', valign: 'middle'
    });

    // ========== 右侧说明框 ==========
    const rightX = 5.2;
    const detailY = 0.9;
    const detailW = 4.3;
    const detailH = 4.2;

    // 背景框
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: rightX, y: detailY, w: detailW, h: detailH,
        fill: { color: 'FAFAFA' },
        line: { color: 'DDDDDD', width: 1 },
        rectRadius: 0.15
    });

    // 说明内容
    let detailCurrentY = detailY + 0.15;
    const detailItemH = 0.95;
    const detailPadding = 0.15;

    // ① 位置编码
    slide.addText([
        { text: '① 位置编码\n', options: { fontSize: 11, bold: true, color: 'C2185B' } },
        { text: '深度可分离卷积 (groups=dim)\nkernel_size=3, padding=1', options: { fontSize: 9, color: '555555' } }
    ], {
        x: rightX + detailPadding, y: detailCurrentY, w: detailW - 0.3, h: detailItemH,
        valign: 'top'
    });
    detailCurrentY += detailItemH;

    // ② 双层路由注意力
    slide.addText([
        { text: '② 双层路由注意力\n', options: { fontSize: 11, bold: true, color: '1976D2' } },
        { text: '• 区域划分: n_win=4 (4×4窗口)\n• TopK路由: k=4 (选择4个相关窗口)\n• 多头注意力: num_heads=8\n• 复杂度: O(n²×k/p²)', options: { fontSize: 9, color: '555555' } }
    ], {
        x: rightX + detailPadding, y: detailCurrentY, w: detailW - 0.3, h: 1.1,
        valign: 'top'
    });
    detailCurrentY += 1.15;

    // ③ MLP 前馈网络
    slide.addText([
        { text: '③ MLP 前馈网络\n', options: { fontSize: 11, bold: true, color: '7B1FA2' } },
        { text: '• Linear(dim → 4×dim)\n• GELU 激活函数\n• Linear(4×dim → dim)', options: { fontSize: 9, color: '555555' } }
    ], {
        x: rightX + detailPadding, y: detailCurrentY, w: detailW - 0.3, h: 0.9,
        valign: 'top'
    });
    detailCurrentY += 0.95;

    // ④ 残差连接
    slide.addText([
        { text: '④ 残差连接\n', options: { fontSize: 11, bold: true, color: 'F57F17' } },
        { text: '注意力和MLP分支均使用残差连接\n防止梯度消失，增强特征传递', options: { fontSize: 9, color: '555555' } }
    ], {
        x: rightX + detailPadding, y: detailCurrentY, w: detailW - 0.3, h: 0.8,
        valign: 'top'
    });

    // 保存文件
    const outputPath = path.join(__dirname, 'fig3-3_tr_module.pptx');
    await pptx.writeFile({ fileName: outputPath });
    console.log('PPT created successfully:', outputPath);
}

createTRModulePPT().catch(console.error);
