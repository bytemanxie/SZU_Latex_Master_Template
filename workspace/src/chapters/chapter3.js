/**
 * 第三章：基于全局注意力的模型改进（TR模块）
 * 
 * 本章聚焦于TR模块，讲述完整的故事线：
 * - 问题：ASPP感受野有限，难以建立长距离依赖
 * - 方案：引入双层路由注意力（BiFormer思想）
 * - 实验：仅TR模块的消融结果（mIoU: 0.851 → 0.884，+3.9%）
 */

const { COLORS, STYLES, CHAPTERS, FIGURE_PATHS } = require('../config');
const { addChapterEntry, createContentSlide, addWhiteBox, addBottomBox, addPlaceholder, addMetricCard } = require('../templates');

const CHAPTER = CHAPTERS[3];
const LABEL = `${CHAPTER.num} ${CHAPTER.title}`;

/**
 * 添加空洞卷积原理页
 */
function addDilatedConvSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '空洞卷积原理');
    
    // 空洞卷积对比图
    addWhiteBox(slide, pptx, 0.4, 1, 9.2, 1.6);
    slide.addText('不同空洞率的卷积对比', { 
        x: 0.5, y: 1.05, w: 9, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-1_dilated_conv.png`, x: 1.5, y: 1.35, w: 7, h: 1.15 });
    
    // 说明卡片
    const dilatedCards = [
        { title: '普通卷积 (rate=1)', desc: '标准3×3卷积，感受野3×3，仅捕获局部特征。' },
        { title: '空洞卷积 (rate=2)', desc: '在卷积核元素间插入空洞，感受野扩大到5×5。' },
        { title: '空洞卷积 (rate=3)', desc: '感受野进一步扩大到7×7，无需增加参数量。' }
    ];
    
    dilatedCards.forEach((card, i) => {
        const x = 0.4 + i * 3.15;
        addWhiteBox(slide, pptx, x, 2.75, 3, 0.95);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 2.75, w: 0.04, h: 0.95, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(card.title, { 
            x: x + 0.1, y: 2.8, w: 2.8, h: 0.28, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.desc, { 
            x: x + 0.1, y: 3.1, w: 2.8, h: 0.55, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 底部总结
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.85, w: 9.2, h: 0.55,
        title: null,
        content: '核心优势：在不增加参数量和计算量的情况下扩大感受野，捕获更大范围的上下文信息，适合密集预测任务。'
    });
    
    return slide;
}

/**
 * 添加ASPP模块详解页
 */
function addASPPSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'ASPP模块详解');
    
    // 左侧 - ASPP解释
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 3.4);
    slide.addText('空洞空间金字塔池化', { 
        x: 0.5, y: 1.05, w: 4.3, h: 0.3, 
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.RED 
    });
    slide.addText('Atrous Spatial Pyramid Pooling', { 
        x: 0.5, y: 1.35, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 9, italic: true, color: COLORS.SLATE 
    });
    
    slide.addText('并行分支结构：', { 
        x: 0.5, y: 1.7, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    
    const asppBranches = [
        '• 1×1卷积（rate=1）：提取点级特征',
        '• 3×3卷积（rate=12）：捕获中等范围',
        '• 3×3卷积（rate=24）：捕获较大范围',
        '• 3×3卷积（rate=36）：捕获全局范围',
        '• 全局平均池化：编码图像级特征'
    ];
    asppBranches.forEach((b, i) => {
        slide.addText(b, { 
            x: 0.5, y: 1.95 + i * 0.28, w: 4.3, h: 0.26, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // ASPP作用框
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.5, y: 3.45, w: 4.3, h: 0.85, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('作用', { 
        x: 0.6, y: 3.5, w: 4.1, h: 0.22, 
        fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.WHITE 
    });
    slide.addText('通过不同空洞率的并行卷积，在多个尺度上捕获上下文信息，增强对不同大小目标的分割能力。', { 
        x: 0.6, y: 3.75, w: 4.1, h: 0.5, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
    });
    
    // 右侧 - ASPP结构图
    addWhiteBox(slide, pptx, 5.05, 1, 4.55, 3.4);
    slide.addText('ASPP模块结构', { 
        x: 5.15, y: 1.05, w: 4.35, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-2_aspp_module.png`, x: 5.3, y: 1.35, w: 4, h: 2.95 });
    
    return slide;
}

/**
 * 添加改进动机页 - TR模块引入的理由
 */
function addMotivationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '改进动机：全局上下文建模不足');
    
    // 问题分析
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 2.2);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0.4, y: 1, w: 4.5, h: 0.04, 
        fill: { color: COLORS.RED } 
    });
    slide.addText('ASPP模块的局限性', { 
        x: 0.5, y: 1.1, w: 4.3, h: 0.3, 
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY 
    });
    
    const limitations = [
        '• 感受野受限于空洞卷积的局部性',
        '• 仅覆盖特征图的局部区域',
        '• 难以建立长距离依赖关系',
        '• OCT图像中熔深区域呈细长结构',
        '• 纵横比可达1:10以上，跨越多区域'
    ];
    limitations.forEach((l, i) => {
        slide.addText(l, { 
            x: 0.5, y: 1.5 + i * 0.32, w: 4.3, h: 0.3, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    // 解决方案
    addWhiteBox(slide, pptx, 5.1, 1, 4.5, 2.2);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 5.1, y: 1, w: 4.5, h: 0.04, 
        fill: { color: COLORS.GREEN } 
    });
    slide.addText('解决方案：TR模块', { 
        x: 5.2, y: 1.1, w: 4.3, h: 0.3, 
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY 
    });
    
    const solutions = [
        '• 引入Transformer注意力机制',
        '• 建立全局长距离依赖关系',
        '• 双层路由降低计算复杂度',
        '• TopK稀疏选择提高效率',
        '• 增强对细长结构的理解能力'
    ];
    solutions.forEach((s, i) => {
        slide.addText(s, { 
            x: 5.2, y: 1.5 + i * 0.32, w: 4.3, h: 0.3, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    // 底部 - 核心思想
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.4, w: 9.2, h: 1.0,
        title: '核心思想',
        content: '在ASPP模块之后引入TR（Transformer Routing）全局注意力模块，借鉴BiFormer的双层路由注意力思想，通过区域级路由和TopK选择机制，在保持全局建模能力的同时将计算复杂度从O(n²)降低到O(n²×k/p²)。'
    });
    
    return slide;
}

/**
 * 添加TR模块结构页
 */
function addTRModuleSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'TR模块：全局上下文增强');
    
    // 左侧 - 描述
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 0.85);
    slide.addText('双层路由注意力 (BiFormer)', { 
        x: 0.5, y: 1.05, w: 4.3, h: 0.25, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED 
    });
    slide.addText('区域级路由 + 令牌级注意力两阶段计算，保持全局建模能力同时降低计算复杂度。', { 
        x: 0.5, y: 1.32, w: 4.3, h: 0.48, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    addWhiteBox(slide, pptx, 0.4, 1.95, 4.5, 0.7);
    slide.addText('Top-K稀疏选择策略', { 
        x: 0.5, y: 2, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addText('每个窗口仅与Top-K最相关窗口计算注意力，复杂度降低约75%。', { 
        x: 0.5, y: 2.22, w: 4.3, h: 0.38, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    addWhiteBox(slide, pptx, 0.4, 2.75, 4.5, 0.7);
    slide.addText('作用效果', { 
        x: 0.5, y: 2.8, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addText('增强长程依赖建模，提升目标结构与上下文表征，有效抑制散斑噪声。', { 
        x: 0.5, y: 3.02, w: 4.3, h: 0.38, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // 参数配置框
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.55, w: 4.5, h: 0.85, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('关键参数配置', { 
        x: 0.5, y: 3.6, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.WHITE 
    });
    slide.addText('输入维度: 2560 | 窗口大小: 4×4\nTopK: 4 | 窗口数: 16 | mIoU提升: +3.9%', { 
        x: 0.5, y: 3.85, w: 4.3, h: 0.5, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
    });
    
    // 右侧 - TR模块结构图
    addWhiteBox(slide, pptx, 5.05, 1, 4.55, 3.4);
    slide.addText('TR模块结构图', { 
        x: 5.15, y: 1.05, w: 4.35, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-3_tr_module.png`, x: 6.05, y: 1.35, w: 1.7, h: 2.95 });
    
    return slide;
}

/**
 * 添加TR模块详细原理页
 */
function addTRDetailSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'TR模块详细原理');
    
    // 三个占位框
    // 区域级路由
    addWhiteBox(slide, pptx, 0.4, 1, 2.95, 2.3);
    slide.addText('区域级路由', { 
        x: 0.5, y: 1.05, w: 2.75, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED 
    });
    addPlaceholder(slide, pptx, 0.55, 1.35, 2.65, 1.5, '待补充：\n区域级路由示意图');
    slide.addText('将特征图划分为S×S区域，计算区域间相关性', { 
        x: 0.5, y: 2.9, w: 2.75, h: 0.35, 
        align: 'center', fontFace: 'Arial', fontSize: 7, color: COLORS.SLATE 
    });
    
    // 令牌级注意力
    addWhiteBox(slide, pptx, 3.52, 1, 2.95, 2.3);
    slide.addText('令牌级注意力', { 
        x: 3.62, y: 1.05, w: 2.75, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED 
    });
    addPlaceholder(slide, pptx, 3.67, 1.35, 2.65, 1.5, '待补充：\n令牌级注意力计算图');
    slide.addText('在选定区域内进行细粒度注意力计算', { 
        x: 3.62, y: 2.9, w: 2.75, h: 0.35, 
        align: 'center', fontFace: 'Arial', fontSize: 7, color: COLORS.SLATE 
    });
    
    // Top-K稀疏选择
    addWhiteBox(slide, pptx, 6.65, 1, 2.95, 2.3);
    slide.addText('Top-K稀疏选择', { 
        x: 6.75, y: 1.05, w: 2.75, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED 
    });
    addPlaceholder(slide, pptx, 6.8, 1.35, 2.65, 1.5, '待补充：\nTop-K选择策略图');
    slide.addText('每个查询仅关注K个最相关区域', { 
        x: 6.75, y: 2.9, w: 2.75, h: 0.35, 
        align: 'center', fontFace: 'Arial', fontSize: 7, color: COLORS.SLATE 
    });
    
    // 底部 - 计算流程
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.45, w: 9.2, h: 0.95, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('双层路由注意力计算流程', { 
        x: 0.6, y: 3.5, w: 8.8, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    slide.addText('输入特征 → 区域划分(S×S) → 区域级路由矩阵 → Top-K选择 → 令牌级注意力 → 特征聚合 → 输出特征', { 
        x: 0.6, y: 3.75, w: 8.8, h: 0.25, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.GREEN 
    });
    slide.addText('复杂度：O(S²HW/S² + K·HW·C) = O(HW(S² + KC))，相比全局注意力O(H²W²)显著降低', { 
        x: 0.6, y: 4.05, w: 8.8, h: 0.25, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
    });
    
    return slide;
}

/**
 * 添加实验设置页
 */
function addExperimentSetupSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '实验设置');
    
    // 实验环境配置表
    slide.addText('实验环境配置', { 
        x: 0.4, y: 1, w: 4.4, h: 0.3, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    
    slide.addTable([
        [
            { text: '配置项', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '配置信息', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['操作系统', 'Ubuntu 20.04 LTS'],
        ['GPU', 'NVIDIA RTX 4090 (24GB)'],
        ['CPU', 'Intel i7-13700KF'],
        ['内存', '64GB DDR5'],
        ['深度学习框架', 'PyTorch 1.13 + CUDA 11.7'],
        ['分割框架', 'MMSegmentation 0.x']
    ], { 
        x: 0.4, y: 1.35, w: 4.4, h: 2.1, 
        colW: [1.6, 2.8], 
        fontSize: 9, align: 'left', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    // 训练参数配置表
    slide.addText('训练参数配置', { 
        x: 5.2, y: 1, w: 4.4, h: 0.3, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    
    slide.addTable([
        [
            { text: '参数', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '设置值', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['输入尺寸', '512 × 512'],
        ['批量大小', '8'],
        ['总迭代次数', '20,000'],
        ['优化器', 'AdamW'],
        ['初始学习率', '6e-5'],
        ['学习率策略', 'PolyLR (power=0.9)'],
        ['权重衰减', '0.01'],
        ['损失函数', 'BCE + Dice (1:1)']
    ], { 
        x: 5.2, y: 1.35, w: 4.4, h: 2.45, 
        colW: [1.8, 2.6], 
        fontSize: 9, align: 'left', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    // 底部说明
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.95, w: 9.2, h: 0.5,
        title: null,
        content: '损失函数采用二元交叉熵损失（BCE）与Dice损失的加权组合：L = λ₁×L_BCE + λ₂×L_Dice，其中λ₁=λ₂=1，两者优势互补，BCE关注像素分类，Dice关注区域重叠。'
    });
    
    return slide;
}

/**
 * 添加TR模块可视化对比页
 */
function addTRVisualizationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'TR模块可视化对比（细长结构场景）');
    
    // 图像网格 - 使用 cp3/3-6/slender and long/ 目录下的图片
    const visImages = [
        { file: 'origin.png', label: '原始图像' },
        { file: 'label.png', label: 'Ground Truth' },
        { file: 'Unet.png', label: 'UNet' },
        { file: 'Unetpp.png', label: 'UNet++' },
        { file: 'resunet.png', label: 'ResUNet' },
        { file: 'transunet.png', label: 'TransUNet' },
        { file: 'deeplabv3.png', label: 'DeepLabV3+' },
        { file: 'tr.png', label: '+TR (本章方法)', highlight: true }
    ];
    
    const imgW = 2.1, imgH = 1.3;
    const startX = 0.5, startY = 0.95;
    const gapX = 0.15, gapY = 0.08;
    
    visImages.forEach((img, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = startX + col * (imgW + gapX);
        const y = startY + row * (imgH + gapY + 0.2);
        
        slide.addImage({ path: `${FIGURE_PATHS.cp3}/3-6/slender and long/${img.file}`, x, y, w: imgW, h: imgH });
        
        if (img.highlight) {
            slide.addShape(pptx.shapes.RECTANGLE, { 
                x: x - 0.02, y: y - 0.02, w: imgW + 0.04, h: imgH + 0.04, 
                line: { color: COLORS.GREEN, width: 2.5 }, 
                fill: { type: 'none' } 
            });
        }
        
        const labelColor = img.highlight ? COLORS.GREEN : (img.label === 'DeepLabV3+' ? COLORS.RED : COLORS.SLATE);
        const labelBold = img.highlight || img.label === 'DeepLabV3+';
        slide.addText(img.label, { 
            x, y: y + imgH + 0.02, w: imgW, h: 0.18, 
            align: 'center', fontFace: 'Arial', fontSize: 9, color: labelColor, bold: labelBold 
        });
    });
    
    // 底部分析结论
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.75, w: 9.2, h: 0.7, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('可视化分析', { 
        x: 0.6, y: 3.8, w: 8.8, h: 0.2, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    slide.addText('引入TR模块后（绿框），细长结构分割更完整：①全局注意力建立长距离依赖，有效抑制断裂问题；②相比基线DeepLabV3+，边界连续性明显改善；③长程上下文建模有效抑制散斑噪声干扰。', { 
        x: 0.6, y: 4.02, w: 8.8, h: 0.4, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
    });
    
    return slide;
}

/**
 * 添加TR模块消融实验页
 */
function addTRAblationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'TR模块消融实验');
    
    // 消融实验表格
    slide.addTable([
        [
            { text: '配置', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'TR模块', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mIoU', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mAcc', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mDice', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '提升', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['DeepLabV3+ (基线)', '-', '0.851', '0.923', '0.913', '-'],
        [
            { text: 'DeepLabV3+ + TR', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '✓', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.884', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.941', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.935', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '+3.9%', options: { fill: { color: 'E8F5E9' }, color: COLORS.GREEN, bold: true } }
        ]
    ], { 
        x: 0.4, y: 1, w: 9.2, h: 1.2, 
        colW: [3, 1.2, 1.2, 1.2, 1.2, 1.4], 
        fontSize: 10, align: 'center', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    // 分析卡片
    const analysisCards = [
        { 
            title: 'mIoU提升', 
            value: '+3.9%',
            desc: '从0.851提升到0.884，验证了全局注意力机制对分割性能的有效提升。'
        },
        { 
            title: '全局建模能力增强', 
            value: '长距离依赖',
            desc: 'TR模块建立了特征图不同区域之间的长距离依赖关系，有效捕获全局上下文。'
        },
        { 
            title: '计算效率优化', 
            value: '-75%计算量',
            desc: 'TopK路由机制将注意力计算复杂度降低约75%，在性能和效率间取得平衡。'
        }
    ];
    
    analysisCards.forEach((card, i) => {
        const x = 0.4 + i * 3.15;
        addWhiteBox(slide, pptx, x, 2.4, 3, 1.5);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 2.4, w: 3, h: 0.04, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(card.title, { 
            x: x + 0.1, y: 2.5, w: 2.8, h: 0.28, 
            fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.value, { 
            x: x + 0.1, y: 2.8, w: 2.8, h: 0.35, 
            fontFace: 'Arial', fontSize: 16, bold: true, color: COLORS.GREEN 
        });
        slide.addText(card.desc, { 
            x: x + 0.1, y: 3.2, w: 2.8, h: 0.65, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 底部结论
    addBottomBox(slide, pptx, {
        x: 0.4, y: 4.05, w: 9.2, h: 0.4,
        title: null,
        content: '结论：TR模块有效增强了全局上下文建模能力，为后续SAE模块的局部增强奠定基础。'
    });
    
    return slide;
}

/**
 * 添加本章小结页
 */
function addChapterSummarySlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '本章小结');
    
    // 主要贡献
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 1, w: 9.2, h: 3.4, 
        fill: { color: COLORS.WHITE }, 
        shadow: { type: 'outer', blur: 2, offset: 1, angle: 45, opacity: 0.15 } 
    });
    
    slide.addText('本章主要贡献', { 
        x: 0.6, y: 1.1, w: 8.8, h: 0.4, 
        fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.NAVY 
    });
    
    const contributions = [
        {
            num: '1',
            title: '分析了DeepLabV3+在OCT图像分割中的局限性',
            desc: 'ASPP模块感受野有限，难以建立长距离依赖，对细长结构的熔深区域分割效果不佳。'
        },
        {
            num: '2',
            title: '提出了TR（Transformer Routing）全局注意力模块',
            desc: '借鉴BiFormer的双层路由注意力思想，通过区域级路由和TopK选择实现高效全局建模。'
        },
        {
            num: '3',
            title: '通过实验验证了TR模块的有效性',
            desc: '消融实验表明，引入TR模块后mIoU从0.851提升至0.884（+3.9%），全局语义理解能力显著增强。'
        }
    ];
    
    contributions.forEach((c, i) => {
        const y = 1.6 + i * 1.0;
        
        slide.addShape(pptx.shapes.OVAL, { 
            x: 0.7, y: y, w: 0.4, h: 0.4, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(c.num, { 
            x: 0.7, y: y, w: 0.4, h: 0.4, 
            align: 'center', valign: 'middle', 
            fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE 
        });
        
        slide.addText(c.title, { 
            x: 1.3, y: y, w: 8, h: 0.35, 
            fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
        });
        slide.addText(c.desc, { 
            x: 1.3, y: y + 0.38, w: 8, h: 0.55, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    return slide;
}

/**
 * 构建第三章所有幻灯片
 */
function build(pptx) {
    // 章节入口页
    addChapterEntry(pptx, CHAPTER.num, CHAPTER.title, [
        '空洞卷积与ASPP模块原理',
        '改进动机：全局上下文建模不足',
        'TR模块：双层路由注意力设计',
        '实验设置与消融验证',
        'TR模块可视化对比'
    ]);
    
    // 内容页
    addDilatedConvSlide(pptx);
    addASPPSlide(pptx);
    addMotivationSlide(pptx);
    addTRModuleSlide(pptx);
    addTRDetailSlide(pptx);
    addExperimentSetupSlide(pptx);    // 新增：实验设置
    addTRAblationSlide(pptx);
    addTRVisualizationSlide(pptx);    // 新增：TR可视化对比
    addChapterSummarySlide(pptx);
}

module.exports = {
    build,
    addDilatedConvSlide,
    addASPPSlide,
    addMotivationSlide,
    addTRModuleSlide,
    addTRDetailSlide,
    addExperimentSetupSlide,
    addTRAblationSlide,
    addTRVisualizationSlide,
    addChapterSummarySlide,
};
