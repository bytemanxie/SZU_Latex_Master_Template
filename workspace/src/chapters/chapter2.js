/**
 * 第二章：相关技术基础
 */

const { COLORS, STYLES, CHAPTERS, FIGURE_PATHS } = require('../config');
const { addChapterEntry, createContentSlide, addWhiteBox, addBottomBox, addPlaceholder } = require('../templates');

const CHAPTER = CHAPTERS[2];
const LABEL = `${CHAPTER.num} ${CHAPTER.title}`;

/**
 * 添加CNN基础组件页
 */
function addCNNBasicsSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'CNN基础组件');
    
    // 卷积层
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 2.1);
    slide.addText('卷积层 (Convolution)', { 
        x: 0.5, y: 1.05, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.RED 
    });
    addPlaceholder(slide, pptx, 0.6, 1.38, 4.1, 1.0, '待补充：卷积操作示意图');
    slide.addText('通过卷积核在输入特征图上滑动，提取局部特征。参数共享降低计算量，局部连接保留空间结构。', { 
        x: 0.5, y: 2.45, w: 4.3, h: 0.58, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // 池化层
    addWhiteBox(slide, pptx, 5.1, 1, 4.5, 2.1);
    slide.addText('池化层 (Pooling)', { 
        x: 5.2, y: 1.05, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.RED 
    });
    addPlaceholder(slide, pptx, 5.3, 1.38, 4.1, 1.0, '待补充：池化操作示意图');
    slide.addText('下采样操作，降低特征图分辨率。最大池化保留显著特征，平均池化保留全局信息，增强平移不变性。', { 
        x: 5.2, y: 2.45, w: 4.3, h: 0.58, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // 底部 - CNN核心特性
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.25, w: 9.2, h: 1.15, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('CNN核心特性', { 
        x: 0.6, y: 3.35, w: 8.8, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE 
    });
    
    const cnnFeatures = [
        { title: '局部连接', desc: '每个神经元只连接输入的局部区域' },
        { title: '权值共享', desc: '同一卷积核在整个特征图上共享' },
        { title: '层级特征', desc: '浅层提取边缘，深层提取语义' }
    ];
    cnnFeatures.forEach((f, i) => {
        const x = 0.6 + i * 3.05;
        slide.addText(f.title, { 
            x: x, y: 3.68, w: 2.9, h: 0.22, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.GREEN 
        });
        slide.addText(f.desc, { 
            x: x, y: 3.92, w: 2.9, h: 0.4, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
        });
    });
    
    return slide;
}

/**
 * 添加经典分割网络页
 */
function addClassicNetworksSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '经典语义分割网络');
    
    // FCN
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 3.2);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0.4, y: 1, w: 0.04, h: 3.2, 
        fill: { color: COLORS.RED } 
    });
    slide.addText('FCN (2015)', { 
        x: 0.5, y: 1.05, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY 
    });
    slide.addText('首个端到端语义分割网络', { 
        x: 0.5, y: 1.35, w: 4.3, h: 0.2, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
    });
    addPlaceholder(slide, pptx, 0.6, 1.6, 4.2, 2.0, '待补充：FCN网络结构图');
    slide.addText('• 将全连接层替换为卷积层  • 支持任意尺寸输入  • 跳跃连接融合多尺度特征', { 
        x: 0.5, y: 3.7, w: 4.3, h: 0.4, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // U-Net
    addWhiteBox(slide, pptx, 5.1, 1, 4.5, 3.2);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 5.1, y: 1, w: 0.04, h: 3.2, 
        fill: { color: COLORS.RED } 
    });
    slide.addText('U-Net (2015)', { 
        x: 5.2, y: 1.05, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY 
    });
    slide.addText('编码器-解码器对称结构', { 
        x: 5.2, y: 1.35, w: 4.3, h: 0.2, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
    });
    addPlaceholder(slide, pptx, 5.3, 1.6, 4.1, 2.0, '待补充：U-Net网络结构图');
    slide.addText('• 对称编码器-解码器结构  • 跳跃连接保留细节信息  • 适合小样本医学图像分割', { 
        x: 5.2, y: 3.7, w: 4.3, h: 0.4, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // 发展脉络
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 4.3, w: 9.2, h: 0.55, 
        fill: { color: COLORS.SLATE } 
    });
    slide.addText('发展脉络: FCN → U-Net → DeepLab系列 → Transformer融合', { 
        x: 0.6, y: 4.35, w: 8.8, h: 0.2, 
        fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.WHITE 
    });
    slide.addText('关键技术演进：全卷积化 → 编码器-解码器 → 空洞卷积/ASPP → 注意力机制', { 
        x: 0.6, y: 4.58, w: 8.8, h: 0.2, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.GREEN 
    });
    
    return slide;
}

/**
 * 添加DeepLabV3+基线模型页
 */
function addDeepLabV3PlusSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'DeepLabV3+ 基线模型');
    
    // 左侧 - 特性列表
    const features = [
        { title: '编码器-解码器架构', desc: 'ResNet18-V1c骨干网络，解码器融合高低层特征。' },
        { title: 'ASPP模块', desc: '空洞率(1,12,24,36)并行卷积，多尺度上下文。' },
        { title: '深度可分离卷积', desc: '降低计算复杂度，提高推理效率。' },
        { title: '基线性能', desc: 'mIoU: 0.851 | 目标IoU: 0.710 | HD95: 12.22' }
    ];
    
    features.forEach((f, i) => {
        const y = 1.0 + i * 0.58;
        addWhiteBox(slide, pptx, 0.4, y, 3.9, 0.52);
        slide.addText(f.title, { 
            x: 0.5, y: y + 0.05, w: 3.7, h: 0.2, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
        });
        slide.addText(f.desc, { 
            x: 0.5, y: y + 0.26, w: 3.7, h: 0.22, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 右侧 - DeepLabV3+ 结构图
    addWhiteBox(slide, pptx, 4.5, 1.0, 5.1, 3.4);
    slide.addText('DeepLabV3+ 网络结构', { 
        x: 4.6, y: 1.05, w: 4.9, h: 0.3, 
        align: 'center', fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-5_deeplabv3plus_structure.png`, x: 4.6, y: 1.4, w: 4.9, h: 2.9 });
    
    return slide;
}

/**
 * 添加数据集构建流程页
 */
function addDatasetConstructionSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '数据集构建流程');
    
    // 流程图区域
    addWhiteBox(slide, pptx, 0.4, 1, 9.2, 1.1);
    slide.addText('构建流程：采集 → 预处理 → 标注 → 增强 → 划分', { 
        x: 0.5, y: 1.05, w: 9, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    
    // 流程步骤
    const steps = [
        { icon: '📷', label: 'OCT采集', color: COLORS.RED },
        { icon: '→', label: '', color: COLORS.SILVER },
        { icon: '🔧', label: '预处理', color: COLORS.NAVY },
        { icon: '→', label: '', color: COLORS.SILVER },
        { icon: '🏷️', label: 'LabelMe标注', color: COLORS.GREEN },
        { icon: '→', label: '', color: COLORS.SILVER },
        { icon: '📈', label: '数据增强', color: COLORS.RED },
        { icon: '→', label: '', color: COLORS.SILVER },
        { icon: '📊', label: '集合划分', color: COLORS.NAVY }
    ];
    
    steps.forEach((s, i) => {
        const x = 0.6 + i * 1.0;
        if (s.icon === '→') {
            slide.addText('→', { 
                x, y: 1.4, w: 0.5, h: 0.5, 
                align: 'center', valign: 'middle', 
                fontFace: 'Arial', fontSize: 18, color: COLORS.SILVER 
            });
        } else {
            slide.addText(s.icon, { 
                x, y: 1.35, w: 0.8, h: 0.3, 
                align: 'center', fontFace: 'Arial', fontSize: 16 
            });
            slide.addText(s.label, { 
                x: x - 0.15, y: 1.65, w: 1.1, h: 0.35, 
                align: 'center', fontFace: 'Arial', fontSize: 7, color: s.color, bold: true 
            });
        }
    });
    
    // 详细步骤卡片（左侧两个）
    const processCards = [
        { 
            title: '图像采集', 
            desc: '真实激光焊接实验平台\n采集焊接过程OCT图像\n原始分辨率1000×200',
            color: COLORS.RED
        },
        { 
            title: '预处理流程', 
            desc: '裁剪感兴趣区域(200×200)\n中值滤波去噪(3×3)\n直方图均衡化增强对比度\n尺寸调整至512×512',
            color: COLORS.NAVY
        }
    ];
    
    processCards.forEach((card, i) => {
        const x = 0.4 + i * 2.35;
        addWhiteBox(slide, pptx, x, 2.2, 2.2, 1.4);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 2.2, w: 2.2, h: 0.04, 
            fill: { color: card.color } 
        });
        slide.addText(card.title, { 
            x: x + 0.1, y: 2.3, w: 2, h: 0.28, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.desc, { 
            x: x + 0.1, y: 2.6, w: 2, h: 0.95, 
            fontFace: 'Arial', fontSize: 7, color: COLORS.SLATE 
        });
    });
    
    // 数据标注卡片（右侧，带图片）
    addWhiteBox(slide, pptx, 5.1, 2.2, 4.5, 1.4);
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 5.1, y: 2.2, w: 4.5, h: 0.04, 
        fill: { color: COLORS.GREEN } 
    });
    slide.addText('数据标注（LabelMe）', { 
        x: 5.2, y: 2.3, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addText('• 逐像素标注熔深线段\n• 二分类：目标/背景\n• 双人交叉验证', { 
        x: 5.2, y: 2.6, w: 1.8, h: 0.9, 
        fontFace: 'Arial', fontSize: 7, color: COLORS.SLATE 
    });
    // 添加LabelMe标注界面截图
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-7_labelme_interface.png`, x: 7.1, y: 2.55, w: 2.4, h: 1.0 });
    
    // 数据集统计表格（数据来源：experiment-data.mdc）
    slide.addTable([
        [
            { text: '数据集', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '原始图像数', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '增强后数量', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '占比', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['训练集', '182', '912', '80%'],
        ['测试集', '46', '228', '20%'],
        [
            { text: '总计', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '228', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '1140', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '100%', options: { fill: { color: 'E8F5E9' }, bold: true } }
        ]
    ], { 
        x: 0.4, y: 3.75, w: 9.2, h: 0.6, 
        colW: [2.3, 2.3, 2.3, 2.3], 
        fontSize: 9, align: 'center', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    return slide;
}

/**
 * 添加评估指标说明页
 */
function addMetricsExplanationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '评估指标说明');
    
    // 核心指标卡片
    const metrics = [
        { 
            name: 'mIoU', 
            fullName: '平均交并比',
            formula: 'mIoU = (1/k) Σ (TP/(TP+FP+FN))',
            desc: '核心指标，衡量预测与真实区域的重叠程度。值越高表示分割越准确。',
            color: COLORS.RED
        },
        { 
            name: 'mAcc', 
            fullName: '平均准确率',
            formula: 'mAcc = (1/k) Σ (TP/(TP+FN))',
            desc: '各类别准确率的平均值，反映分类正确性。',
            color: COLORS.NAVY
        },
        { 
            name: 'mDice', 
            fullName: 'Dice系数',
            formula: 'Dice = 2|A∩B| / (|A|+|B|)',
            desc: '与IoU类似，更关注区域重叠，对不平衡数据敏感。',
            color: COLORS.GREEN
        },
        { 
            name: 'HD95', 
            fullName: 'Hausdorff距离',
            formula: 'HD95 = 95th percentile',
            desc: '边界精度指标，衡量预测边界与真实边界的最大偏差，值越小越好。',
            color: COLORS.RED
        }
    ];
    
    metrics.forEach((m, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 0.4 + col * 4.7;
        const y = 1 + row * 1.65;
        
        addWhiteBox(slide, pptx, x, y, 4.5, 1.55);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y, w: 0.04, h: 1.55, 
            fill: { color: m.color } 
        });
        
        // 指标名称
        slide.addText(m.name, { 
            x: x + 0.15, y: y + 0.05, w: 1.2, h: 0.35, 
            fontFace: 'Arial', fontSize: 16, bold: true, color: m.color 
        });
        slide.addText(m.fullName, { 
            x: x + 1.4, y: y + 0.1, w: 2.9, h: 0.25, 
            fontFace: 'Arial', fontSize: 10, color: COLORS.SLATE 
        });
        
        // 公式框
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
            x: x + 0.15, y: y + 0.45, w: 4.2, h: 0.4, 
            fill: { color: COLORS.OFFWHITE } 
        });
        slide.addText(m.formula, { 
            x: x + 0.15, y: y + 0.45, w: 4.2, h: 0.4, 
            align: 'center', valign: 'middle', 
            fontFace: 'Times New Roman', fontSize: 10, color: COLORS.NAVY 
        });
        
        // 说明
        slide.addText(m.desc, { 
            x: x + 0.15, y: y + 0.95, w: 4.2, h: 0.55, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 底部 - 效率指标
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 4.35, w: 9.2, h: 0.55, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('效率指标', { 
        x: 0.6, y: 4.4, w: 1.2, h: 0.2, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    slide.addText('Params（参数量）：模型复杂度   |   FPS（帧率）：推理速度，满足实时性要求（≥10 FPS）', { 
        x: 0.6, y: 4.62, w: 8.8, h: 0.22, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.SILVER 
    });
    
    return slide;
}

/**
 * 添加数据增强策略页
 */
function addDataAugmentationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '数据增强策略');
    
    // 数据增强图像网格
    const augImages = [
        { file: 'fig2-9a_original.png', label: '(a) 原始图像' },
        { file: null, label: '(b) 水平翻转', placeholder: '待补充：水平翻转图' },
        { file: 'fig2-9c_rotate.png', label: '(c) 随机旋转' },
        { file: 'fig2-9d_brightness.png', label: '(d) 亮度调整' },
        { file: 'fig2-9e_contrast.png', label: '(e) 对比度调整' },
        { file: 'fig2-9f_noise.png', label: '(f) 添加噪声' }
    ];
    
    const augW = 2.9, augH = 1.0;
    augImages.forEach((img, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.5 + col * 3.1;
        const y = 1.0 + row * 1.35;
        
        if (img.file) {
            slide.addImage({ path: `${FIGURE_PATHS.cp2}/${img.file}`, x, y, w: augW, h: augH });
        } else {
            addPlaceholder(slide, pptx, x, y, augW, augH, img.placeholder);
        }
        slide.addText(img.label, { 
            x, y: y + augH + 0.02, w: augW, h: 0.2, 
            align: 'center', fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 底部总结
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.55, w: 9.2, h: 0.85,
        title: '数据增强目的',
        content: '扩充训练样本多样性，提高模型泛化能力。通过几何变换（翻转、旋转）和光度变换（亮度、对比度、噪声）模拟不同采集条件，增强模型对OCT图像变化的鲁棒性。'
    });
    
    return slide;
}

/**
 * 构建第二章所有幻灯片
 */
function build(pptx) {
    // 章节入口页
    addChapterEntry(pptx, CHAPTER.num, CHAPTER.title, [
        'CNN基础组件与原理',
        '经典语义分割网络',
        'DeepLabV3+基线模型',
        '数据集构建与评估指标'
    ]);
    
    // 内容页
    addCNNBasicsSlide(pptx);
    addClassicNetworksSlide(pptx);
    addDeepLabV3PlusSlide(pptx);
    addDatasetConstructionSlide(pptx);  // 新增：数据集构建
    addMetricsExplanationSlide(pptx);   // 新增：评估指标
    addDataAugmentationSlide(pptx);
}

module.exports = {
    build,
    addCNNBasicsSlide,
    addClassicNetworksSlide,
    addDeepLabV3PlusSlide,
    addDatasetConstructionSlide,
    addMetricsExplanationSlide,
    addDataAugmentationSlide,
};
