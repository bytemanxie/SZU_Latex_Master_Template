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
        '数据集与预处理方法'
    ]);
    
    // 内容页
    addCNNBasicsSlide(pptx);
    addClassicNetworksSlide(pptx);
    addDeepLabV3PlusSlide(pptx);
    addDataAugmentationSlide(pptx);
}

module.exports = {
    build,
    addCNNBasicsSlide,
    addClassicNetworksSlide,
    addDeepLabV3PlusSlide,
    addDataAugmentationSlide,
};
