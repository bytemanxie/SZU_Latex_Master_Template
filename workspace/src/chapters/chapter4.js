/**
 * 第四章：基于空间感知增强的模型优化（SAE模块）
 * 
 * 本章聚焦于SAE模块，并展示双模块协同效果：
 * - 问题：空间位置信息丢失，边界分割不精确
 * - 方案：坐标注意力 + 通道注意力
 * - 实验：
 *   - 仅SAE模块消融（mIoU: 0.851 → 0.901，+5.9%）
 *   - 双模块协同（mIoU: 0.911，+7.1%）
 *   - 与主流方法全面对比
 *   - 可视化分析
 */

const { COLORS, STYLES, CHAPTERS, FIGURE_PATHS } = require('../config');
const { addChapterEntry, createContentSlide, addWhiteBox, addBottomBox, addPlaceholder, addMetricCard } = require('../templates');

const CHAPTER = CHAPTERS[4];
const LABEL = `${CHAPTER.num} ${CHAPTER.title}`;

/**
 * 添加SAE模块改进动机页
 */
function addSAEMotivationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '改进动机：空间位置信息不足');
    
    // 承接第三章
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 1, w: 9.2, h: 0.7, 
        fill: { color: COLORS.SLATE } 
    });
    slide.addText('承接第三章', { 
        x: 0.6, y: 1.08, w: 1.5, h: 0.25, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    slide.addText('TR模块增强了全局上下文建模，mIoU提升3.9%。但在边界分割精度方面仍有改进空间。', { 
        x: 0.6, y: 1.38, w: 8.8, h: 0.28, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
    });
    
    // 问题分析
    addWhiteBox(slide, pptx, 0.4, 1.9, 4.5, 1.7);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0.4, y: 1.9, w: 4.5, h: 0.04, 
        fill: { color: COLORS.RED } 
    });
    slide.addText('解码器的局限性', { 
        x: 0.5, y: 2, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    
    const problems = [
        '• 空间位置信息在下采样中逐渐丢失',
        '• 通道权重均匀分配，未区分重要性',
        '• 缺乏对细长结构的方向性感知',
        '• 边界模糊区域分割精度不足'
    ];
    problems.forEach((p, i) => {
        slide.addText(p, { 
            x: 0.5, y: 2.35 + i * 0.3, w: 4.3, h: 0.28, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    // 解决方案
    addWhiteBox(slide, pptx, 5.1, 1.9, 4.5, 1.7);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 5.1, y: 1.9, w: 4.5, h: 0.04, 
        fill: { color: COLORS.GREEN } 
    });
    slide.addText('解决方案：SAE模块', { 
        x: 5.2, y: 2, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    
    const solutions = [
        '• 坐标注意力：H/W方向位置编码',
        '• 通道注意力：突出判别性通道',
        '• 空间-通道双重增强机制',
        '• 显著改善边界分割质量'
    ];
    solutions.forEach((s, i) => {
        slide.addText(s, { 
            x: 5.2, y: 2.35 + i * 0.3, w: 4.3, h: 0.28, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    // 底部
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.8, w: 9.2, h: 0.6,
        title: null,
        content: '核心思想：在解码器端引入空间感知增强模块，通过坐标注意力和通道注意力的协同作用，增强模型对目标边界的感知能力。'
    });
    
    return slide;
}

/**
 * 添加SAE模块结构页
 */
function addSAEModuleSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'SAE模块：局部细节增强');
    
    // 左侧 - 坐标注意力
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 0.95);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0.4, y: 1, w: 0.04, h: 0.95, 
        fill: { color: COLORS.RED } 
    });
    slide.addText('坐标注意力 (Coordinate Attention)', { 
        x: 0.5, y: 1.05, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED 
    });
    slide.addText('沿H和W方向池化，编码空间位置信息。1×1卷积学习位置相关注意力权重。', { 
        x: 0.5, y: 1.28, w: 4.3, h: 0.35, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.5, y: 1.65, w: 4.3, h: 0.25, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('F_out = F × σ(a_h) × σ(a_w)', { 
        x: 0.5, y: 1.65, w: 4.3, h: 0.25, 
        align: 'center', valign: 'middle', 
        fontFace: 'Times New Roman', fontSize: 9, color: COLORS.WHITE 
    });
    
    // 通道注意力
    addWhiteBox(slide, pptx, 0.4, 2.05, 4.5, 0.95);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0.4, y: 2.05, w: 0.04, h: 0.95, 
        fill: { color: COLORS.RED } 
    });
    slide.addText('通道注意力 (Channel Attention)', { 
        x: 0.5, y: 2.1, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.RED 
    });
    slide.addText('基于SE模块，全局平均池化提取通道统计信息，4分支并行处理后重标定。', { 
        x: 0.5, y: 2.33, w: 4.3, h: 0.35, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.5, y: 2.7, w: 4.3, h: 0.25, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('F_out = F × σ(s)', { 
        x: 0.5, y: 2.7, w: 4.3, h: 0.25, 
        align: 'center', valign: 'middle', 
        fontFace: 'Times New Roman', fontSize: 9, color: COLORS.WHITE 
    });
    
    // 效果框
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.1, w: 4.5, h: 1.3, 
        fill: { color: COLORS.SLATE } 
    });
    slide.addText('主要作用', { 
        x: 0.5, y: 3.15, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    const saeEffects = ['• 增强空间位置信息编码', '• 强化判别性特征通道响应', '• 改善细长结构与模糊边界分割'];
    saeEffects.forEach((e, i) => {
        slide.addText(e, { 
            x: 0.5, y: 3.4 + i * 0.22, w: 4.3, h: 0.2, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
        });
    });
    slide.addText('参数: 输入560 | Reduction=4 | 4分支 | mIoU提升: +5.9%', { 
        x: 0.5, y: 4.1, w: 4.3, h: 0.22, 
        fontFace: 'Arial', fontSize: 8, bold: true, color: COLORS.GREEN 
    });
    
    // 右侧 - SAE模块结构图
    addWhiteBox(slide, pptx, 5.05, 1, 4.55, 3.4);
    slide.addText('SAE模块结构图', { 
        x: 5.15, y: 1.05, w: 4.35, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp4}/sae_diagram/fig4-1_sae_module.png`, x: 5.9, y: 1.35, w: 1.85, h: 2.95 });
    
    return slide;
}

/**
 * 添加改进模型整体结构页
 */
function addOverallArchitectureSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '改进模型整体结构');
    
    // 架构图
    addWhiteBox(slide, pptx, 0.4, 0.95, 9.2, 2.55);
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-5_improved_model_structure.png`, x: 2.1, y: 1.02, w: 5.8, h: 2.4 });
    
    // 特性卡片
    const featureCards = [
        { title: 'TR模块位置', desc: 'ASPP输出后，16×16×2560特征图，增强全局上下文建模。', color: COLORS.RED },
        { title: 'SAE模块位置', desc: '解码器融合后，128×128×560特征图，增强局部细节与边界。', color: COLORS.GREEN },
        { title: '协同效应', desc: 'TR全局语义 + SAE局部细节，互补提升整体分割性能。', color: COLORS.NAVY }
    ];
    
    featureCards.forEach((card, i) => {
        const x = 0.4 + i * 3.15;
        addWhiteBox(slide, pptx, x, 3.6, 3, 0.85);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 3.6, w: 0.04, h: 0.85, 
            fill: { color: card.color } 
        });
        slide.addText(card.title, { 
            x: x + 0.15, y: 3.65, w: 2.7, h: 0.25, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.desc, { 
            x: x + 0.15, y: 3.92, w: 2.7, h: 0.48, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    return slide;
}

/**
 * 添加综合消融实验页
 */
function addComprehensiveAblationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '综合消融实验');
    
    // 消融实验表格
    slide.addTable([
        [
            { text: '配置', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'TR', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'SAE', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mIoU', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mAcc', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mDice', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '提升', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['DeepLabV3+ (基线)', '-', '-', '0.851', '0.923', '0.913', '-'],
        ['+ TR (第三章)', '✓', '-', '0.884', '0.941', '0.935', { text: '+3.9%', options: { color: COLORS.GREEN, bold: true } }],
        ['+ SAE', '-', '✓', '0.901', '0.948', '0.945', { text: '+5.9%', options: { color: COLORS.GREEN, bold: true } }],
        [
            { text: '+ TR + SAE (本文)', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '✓', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '✓', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.911', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.956', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.951', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '+7.1%', options: { fill: { color: 'E8F5E9' }, color: COLORS.GREEN, bold: true } }
        ]
    ], { 
        x: 0.4, y: 1, w: 9.2, h: 1.8, 
        colW: [2.2, 0.8, 0.8, 1.1, 1.1, 1.1, 1.1], 
        fontSize: 10, align: 'center', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    // 分析卡片
    const analysisCards = [
        { title: 'SAE模块贡献', desc: 'mIoU提升5.9%，主要作用于局部特征增强，显著改善边界分割精度。参数效率高（+25MB）。' },
        { title: 'TR模块贡献', desc: 'mIoU提升3.9%，增强全局上下文理解，建立长距离依赖关系，有效抑制噪声干扰。' },
        { title: '协同效应', desc: '双模块组合提升7.1%，全局（TR）与局部（SAE）信息增强互补，实现更优综合性能。' }
    ];
    
    analysisCards.forEach((card, i) => {
        const x = 0.4 + i * 3.15;
        addWhiteBox(slide, pptx, x, 3, 3, 1.4);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 3, w: 3, h: 0.04, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(card.title, { 
            x: x + 0.1, y: 3.1, w: 2.8, h: 0.35, 
            fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.desc, { 
            x: x + 0.1, y: 3.45, w: 2.8, h: 0.9, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    return slide;
}

/**
 * 添加对比实验页
 */
function addComparisonSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '与主流方法对比');
    
    // 对比表格
    slide.addTable([
        [
            { text: '模型', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mIoU', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mAcc', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mDice', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '目标IoU', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'HD95', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '参数量', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['UNet', '0.805', '0.878', '0.880', '0.620', '15.23', '30MB'],
        ['UNet++', '0.751', '0.905', '0.837', '-', '-', '8.8MB'],
        ['ResUNet', '0.721', '0.788', '0.810', '-', '-', '13MB'],
        ['TransUNet', '0.810', '0.963', '0.884', '0.632', '-', '219MB'],
        ['DeepLabV3+ (基线)', '0.851', '0.923', '0.913', '0.710', '12.22', '95MB'],
        [
            { text: '本文方法', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.911', options: { fill: { color: 'E8F5E9' }, color: COLORS.RED, bold: true } },
            { text: '0.956', options: { fill: { color: 'E8F5E9' }, color: COLORS.RED, bold: true } },
            { text: '0.951', options: { fill: { color: 'E8F5E9' }, color: COLORS.RED, bold: true } },
            { text: '0.826', options: { fill: { color: 'E8F5E9' }, color: COLORS.RED, bold: true } },
            { text: '10.68', options: { fill: { color: 'E8F5E9' }, color: COLORS.RED, bold: true } },
            { text: '420MB', options: { fill: { color: 'E8F5E9' }, bold: true } }
        ]
    ], { 
        x: 0.4, y: 0.95, w: 9.2, h: 2.2, 
        colW: [2, 1.1, 1.1, 1.1, 1.2, 1, 1.2], 
        fontSize: 9, align: 'center', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    // 性能指标汇总
    const summaryMetrics = [
        { value: '+7.1%', label: 'mIoU 提升', compare: 'vs DeepLabV3+' },
        { value: '+16.3%', label: '目标IoU 提升', compare: 'vs DeepLabV3+' },
        { value: '+13.2%', label: 'mIoU 提升', compare: 'vs UNet' },
        { value: '-12.6%', label: 'HD95 降低', compare: '边界更精确' }
    ];
    
    summaryMetrics.forEach((m, i) => {
        const x = 0.4 + i * 2.35;
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
            x, y: 3.4, w: 2.2, h: 1.05, 
            fill: { color: COLORS.NAVY } 
        });
        slide.addText(m.value, { 
            x, y: 3.5, w: 2.2, h: 0.4, 
            align: 'center', fontFace: 'Arial', fontSize: 20, bold: true, color: COLORS.GREEN 
        });
        slide.addText(m.label, { 
            x, y: 3.9, w: 2.2, h: 0.25, 
            align: 'center', fontFace: 'Arial', fontSize: 9, color: COLORS.SILVER 
        });
        slide.addText(m.compare, { 
            x, y: 4.15, w: 2.2, h: 0.2, 
            align: 'center', fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
        });
    });
    
    return slide;
}

/**
 * 添加可视化对比页
 */
function addVisualizationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '可视化对比（细长结构场景）');
    
    // 图像网格
    const visImages = [
        { file: 'origin.png', label: '原始图像' },
        { file: 'label.png', label: 'Ground Truth' },
        { file: 'unet.png', label: 'UNet' },
        { file: 'unetpp.png', label: 'UNet++' },
        { file: 'resunet.png', label: 'ResUNet' },
        { file: 'transunet.png', label: 'TransUNet' },
        { file: 'v3plus.png', label: 'DeepLabV3+' },
        { file: 'tr.png', label: '+TR (Ours)' },
        { file: 'sae.png', label: '+SAE (Ours)' },
        { file: 'all.png', label: '+Both (Ours)', highlight: true }
    ];
    
    const imgW = 1.72, imgH = 1.0;
    const startX = 0.5, startY = 0.92;
    const gapX = 0.08, gapY = 0.12;
    
    visImages.forEach((img, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = startX + col * (imgW + gapX);
        const y = startY + row * (imgH + gapY + 0.18);
        
        slide.addImage({ path: `${FIGURE_PATHS.cp4}/4-3/${img.file}`, x, y, w: imgW, h: imgH });
        
        if (img.highlight) {
            slide.addShape(pptx.shapes.RECTANGLE, { 
                x: x - 0.02, y: y - 0.02, w: imgW + 0.04, h: imgH + 0.04, 
                line: { color: COLORS.GREEN, width: 2.5 }, 
                fill: { type: 'none' } 
            });
        }
        
        const labelColor = img.highlight ? COLORS.GREEN : (img.label.includes('Ours') ? COLORS.RED : COLORS.SLATE);
        const labelBold = img.label.includes('Ours') || img.highlight;
        slide.addText(img.label, { 
            x, y: y + imgH + 0.02, w: imgW, h: 0.16, 
            align: 'center', fontFace: 'Arial', fontSize: 8, color: labelColor, bold: labelBold 
        });
    });
    
    // 底部总结
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.65, w: 9.2, h: 0.75, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('可视化结论', { 
        x: 0.6, y: 3.7, w: 8.8, h: 0.2, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    slide.addText('本文方法（+Both）在细长结构分割任务中表现最优：边界更清晰（SAE增强空间感知，HD95↓12.6%）、细长结构更完整（TR建立长程依赖）、噪声抑制更好（双重注意力协同）', { 
        x: 0.6, y: 3.92, w: 8.8, h: 0.45, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
    });
    
    return slide;
}

/**
 * 添加实验结论页
 */
function addExperimentConclusionSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '实验结论');
    
    // 关键指标
    const keyMetrics = [
        { value: '0.911', label: 'mIoU', improve: '+7.1% vs 基线' },
        { value: '0.826', label: '目标 IoU', improve: '+16.3% vs 基线' },
        { value: '10.68', label: 'HD95', improve: '-12.6% 边界更精确' },
        { value: '10.5', label: 'FPS', improve: '满足实时需求' }
    ];
    
    keyMetrics.forEach((m, i) => {
        const x = 0.4 + i * 2.4;
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
            x, y: 1, w: 2.2, h: 1.3, 
            fill: { color: COLORS.NAVY } 
        });
        slide.addText(m.value, { 
            x, y: 1.15, w: 2.2, h: 0.5, 
            align: 'center', fontFace: 'Arial', fontSize: 26, bold: true, color: COLORS.GREEN 
        });
        slide.addText(m.label, { 
            x, y: 1.65, w: 2.2, h: 0.25, 
            align: 'center', fontFace: 'Arial', fontSize: 10, color: COLORS.SILVER 
        });
        slide.addText(m.improve, { 
            x, y: 1.9, w: 2.2, h: 0.25, 
            align: 'center', fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
        });
    });
    
    // 核心结论
    addWhiteBox(slide, pptx, 0.4, 2.5, 9.2, 1.9);
    slide.addText('核心结论', { 
        x: 0.6, y: 2.6, w: 8.8, h: 0.35, 
        fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.NAVY 
    });
    
    const conclusions = [
        { title: '分割精度显著提升', desc: 'mIoU达到0.911，相比基线提升7.1%，相比UNet提升13.2%，验证了双重注意力机制的有效性。' },
        { title: '边界质量明显改善', desc: 'HD95降至10.68，SAE模块有效增强了边界分割精度，对细长结构和模糊边界处理效果显著。' },
        { title: '效率-性能平衡良好', desc: '相比TransUNet，内存减少53.3%，速度提升39.1%，在保持高性能的同时具有更好的实用性。' }
    ];
    
    conclusions.forEach((c, i) => {
        const x = 0.5 + i * 3.1;
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
            x, y: 3, w: 2.9, h: 1.25, 
            fill: { color: COLORS.OFFWHITE } 
        });
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 3, w: 0.04, h: 1.25, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(c.title, { 
            x: x + 0.1, y: 3.08, w: 2.7, h: 0.3, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
        });
        slide.addText(c.desc, { 
            x: x + 0.1, y: 3.4, w: 2.7, h: 0.8, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    return slide;
}

/**
 * 构建第四章所有幻灯片
 */
function build(pptx) {
    // 章节入口页
    addChapterEntry(pptx, CHAPTER.num, CHAPTER.title, [
        'SAE模块设计动机与原理',
        '改进模型整体架构',
        '综合消融实验',
        '与主流方法对比',
        '可视化分析'
    ]);
    
    // 内容页
    addSAEMotivationSlide(pptx);
    addSAEModuleSlide(pptx);
    addOverallArchitectureSlide(pptx);
    addComprehensiveAblationSlide(pptx);
    addComparisonSlide(pptx);
    addVisualizationSlide(pptx);
    addExperimentConclusionSlide(pptx);
}

module.exports = {
    build,
    addSAEMotivationSlide,
    addSAEModuleSlide,
    addOverallArchitectureSlide,
    addComprehensiveAblationSlide,
    addComparisonSlide,
    addVisualizationSlide,
    addExperimentConclusionSlide,
};
