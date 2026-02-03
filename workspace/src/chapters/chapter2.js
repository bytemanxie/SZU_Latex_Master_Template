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
    
    // 卷积层（图片850x507，宽高比1.68:1）
    addWhiteBox(slide, pptx, 0.4, 1, 4.5, 2.1);
    slide.addText('卷积层 (Convolution)', { 
        x: 0.5, y: 1.05, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.RED 
    });
    // 卷积操作示意图：w=3.0, h=3.0/1.68=1.79 → 太高，调整为 w=1.7, h=1.0
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-1_conv_operation.png`, x: 1.8, y: 1.35, w: 1.7, h: 1.0 });
    slide.addText('通过卷积核在输入特征图上滑动，提取局部特征。参数共享降低计算量，局部连接保留空间结构。', { 
        x: 0.5, y: 2.45, w: 4.3, h: 0.58, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // 池化层（图片517x451，宽高比1.15:1，接近正方形）
    addWhiteBox(slide, pptx, 5.1, 1, 4.5, 2.1);
    slide.addText('池化层 (Pooling)', { 
        x: 5.2, y: 1.05, w: 4.3, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.RED 
    });
    // 池化操作示意图：w=1.15, h=1.0 保持比例
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-2_pooling_operation.png`, x: 6.7, y: 1.35, w: 1.15, h: 1.0 });
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
    
    // 演讲稿
    slide.addNotes(`【CNN基础组件】

这一页我来介绍卷积神经网络的两个核心组件：卷积层和池化层。

【卷积层 - 特征提取的核心】

卷积层是CNN最重要的组件，它通过卷积运算从输入图像中提取特征。

工作原理：
1. 使用一个小的卷积核（比如3×3）在输入特征图上滑动
2. 在每个位置计算卷积核与对应区域的点积，得到一个输出值
3. 滑动完成后，生成一张新的特征图（Feature Map）

数学表达式：
y(i,j) = Σ_m Σ_n x(i+m, j+n) × w(m,n) + b

其中x是输入，w是卷积核权重，b是偏置。

【卷积层的两个关键特性】
1. 参数共享：同一个卷积核在整个图像上使用相同的参数，大大减少了参数量
2. 局部连接：每个输出只与输入的局部区域相关，保留了空间结构信息

【池化层 - 降维与抽象】

池化层的作用是对特征图进行下采样，降低分辨率。

两种常见的池化方式：
1. 最大池化（Max Pooling）：取窗口内的最大值，保留最显著的特征
2. 平均池化（Average Pooling）：取窗口内的平均值，保留全局信息

池化的好处：
- 减少计算量和参数量
- 增加特征的平移不变性
- 扩大后续层的感受野

【CNN的三个核心特性】
底部总结了CNN的三个核心特性：
1. 局部连接：每个神经元只关注局部区域，而不是整个输入
2. 权值共享：减少参数量，提高训练效率
3. 层级特征：浅层提取边缘、纹理等低级特征，深层提取语义等高级特征

【过渡】
基于这些基础组件，研究者们设计了各种语义分割网络，下面我来介绍几个经典的架构。`);
    
    return slide;
}

/**
 * 添加经典分割网络页
 */
function addClassicNetworksSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '经典语义分割网络');
    
    // FCN（图片428x222，宽高比1.93:1）
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
    // FCN结构图：宽高比1.93:1，设置 w=3.8, h=1.97
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-3_fcn_structure.png`, x: 0.7, y: 1.6, w: 3.8, h: 1.97 });
    slide.addText('• 将全连接层替换为卷积层  • 支持任意尺寸输入  • 跳跃连接融合多尺度特征', { 
        x: 0.5, y: 3.7, w: 4.3, h: 0.4, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // U-Net（图片906x675，宽高比1.34:1）
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
    // UNet结构图：宽高比1.34:1，设置 w=2.68, h=2.0
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-4_unet_structure.png`, x: 5.95, y: 1.6, w: 2.68, h: 2.0 });
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
    
    // 演讲稿
    slide.addNotes(`【经典语义分割网络】

这一页介绍两个里程碑式的语义分割网络：FCN和U-Net。

【FCN - 全卷积网络（2015）】

FCN是第一个真正意义上的端到端语义分割网络，由Jonathan Long等人在2015年提出。

核心创新：
1. 用卷积层替代全连接层
   - 传统分类网络最后有全连接层，只能输出固定大小的向量
   - FCN将全连接层替换为1×1卷积，可以输出任意大小的特征图
   
2. 支持任意尺寸输入
   - 由于全部是卷积操作，网络可以接受任意大小的图像
   
3. 跳跃连接（Skip Connections）
   - 将不同深度的特征图融合
   - 结合深层的语义信息和浅层的位置信息

FCN有几个变体：FCN-32s、FCN-16s、FCN-8s，数字表示上采样的倍数。

【U-Net - 编码器-解码器结构（2015）】

U-Net由Olaf Ronneberger等人提出，最初用于医学图像分割。

核心设计：
1. 对称的U型结构
   - 左边是编码器（下采样路径）：逐步提取特征，降低分辨率
   - 右边是解码器（上采样路径）：逐步恢复分辨率
   
2. 跳跃连接（Skip Connections）
   - 将编码器每一层的特征直接拼接到解码器对应层
   - 保留了精细的位置信息，有助于精确分割边界

U-Net的优势：
- 在小样本数据集上表现优异
- 特别适合医学图像分割任务
- 结构简洁，易于理解和改进

【发展脉络】
语义分割网络的发展经历了几个阶段：
全卷积化（FCN）→ 编码器-解码器（U-Net）→ 空洞卷积/ASPP（DeepLab）→ 注意力机制（Transformer）

本文的改进正是沿着这条脉络，在DeepLabV3+基础上引入注意力机制。

【过渡】
下面详细介绍本文选择的基线模型——DeepLabV3+。`);
    
    return slide;
}

/**
 * 添加DeepLabV3+基线模型页
 */
function addDeepLabV3PlusSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'DeepLabV3+ 网络结构');
    
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
    
    // 演讲稿
    slide.addNotes(`【DeepLabV3+ 网络结构】

DeepLabV3+是Google团队提出的DeepLab系列的最新版本，也是本文选择的基线模型。

【为什么选择DeepLabV3+】
1. 在多个公开数据集上取得了优异的分割性能
2. 结合了空洞卷积和编码器-解码器架构的优势
3. 有成熟的开源实现，便于复现和改进

【网络结构详解】

看右边的结构图，DeepLabV3+主要由三部分组成：

1. 编码器（Encoder）
   - 骨干网络：本文使用ResNet18-V1c
   - ASPP模块：空洞空间金字塔池化

2. ASPP模块
   - 包含多个并行分支：1×1卷积 + 空洞卷积（rate=12,24,36）+ 全局平均池化
   - 空洞率(1,12,24,36)表示卷积核元素之间的间隔
   - 目的：在不同尺度上捕获上下文信息

3. 解码器（Decoder）
   - 将ASPP输出上采样4倍
   - 与编码器浅层特征拼接
   - 再上采样4倍得到最终分割结果

【基线性能】
在我们的焊接OCT数据集上，原始DeepLabV3+的性能为：
- mIoU: 0.851（平均交并比）
- 目标IoU: 0.710（熔深区域的IoU）
- HD95: 12.22（边界距离指标）

这个性能已经不错，但仍有提升空间，特别是：
- 对细长结构的分割不够完整
- 边界区域存在模糊

【本文改进位置】
- TR模块：插入在ASPP之后，增强全局上下文建模
- SAE模块：插入在解码器融合之后，增强边界分割精度

【过渡】
在介绍具体改进之前，我先介绍一下本研究使用的数据集。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【数据集构建流程】

由于公开的焊接OCT数据集较少，本研究构建了自己的数据集。整个流程分为五个步骤。

【步骤一：OCT图像采集】
- 数据来源：真实的激光焊接实验平台
- 采集方式：在焊接过程中实时采集OCT图像
- 原始分辨率：1000×200像素
- 采集内容：不同焊接参数条件下的熔池图像

【步骤二：预处理】
预处理包含四个子步骤：

1. 裁剪感兴趣区域（ROI）
   - 将原始1000×200图像裁剪为200×200
   - 聚焦于包含熔深信息的核心区域

2. 中值滤波去噪
   - 使用3×3的中值滤波器
   - 抑制OCT图像中的散斑噪声
   - 相比均值滤波，中值滤波能更好地保留边缘

3. 直方图均衡化
   - 增强图像对比度
   - 使熔池区域与背景更加区分明显

4. 尺寸调整
   - 将图像resize到512×512
   - 满足深度学习模型的输入要求

【步骤三：数据标注】
- 标注工具：LabelMe（MIT开发的开源标注工具）
- 标注方式：逐像素标注熔深线段区域
- 标注类别：二分类（目标/背景）
- 质量控制：双人交叉验证，确保标注一致性

右边展示的是LabelMe的标注界面截图。

【步骤四：数据集统计】
从底部的表格可以看到：
- 原始图像共228张
- 按照80%:20%划分为训练集和测试集
- 训练集182张，测试集46张
- 经过数据增强后，训练集扩充到912张，测试集228张
- 增强后总计1140张图像

【过渡】
数据增强是扩充数据集的重要手段，下面具体介绍我们采用的增强策略。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【评估指标说明】

语义分割任务需要多个指标来全面评估模型性能。本研究使用四个主要指标。

【mIoU - 平均交并比】（最重要的指标）

计算公式：mIoU = (1/k) × Σ(TP / (TP + FP + FN))

其中：
- k是类别数（本任务k=2，背景和目标）
- TP（True Positive）：正确预测为目标的像素数
- FP（False Positive）：错误预测为目标的像素数（实际是背景）
- FN（False Negative）：漏检的目标像素数（实际是目标但预测为背景）

直观理解：
- IoU衡量预测区域与真实区域的重叠程度
- mIoU是所有类别IoU的平均值
- 值范围[0,1]，越高越好
- 本文基线mIoU=0.851，改进后达到0.911

【mAcc - 平均准确率】

计算公式：mAcc = (1/k) × Σ(TP / (TP + FN))

- 衡量每个类别的召回率（Recall）
- 关注"漏检"问题
- 本文基线mAcc=0.923，改进后达到0.956

【mDice - Dice系数】

计算公式：Dice = 2|A∩B| / (|A| + |B|) = 2TP / (2TP + FP + FN)

- 与IoU类似，但对区域重叠更敏感
- 在医学图像分割中广泛使用
- Dice和IoU的关系：Dice = 2×IoU / (1 + IoU)
- 本文基线mDice=0.913，改进后达到0.951

【HD95 - 95%豪斯多夫距离】（边界指标）

计算方法：
- 计算预测边界上每个点到真实边界的最短距离
- 取95%分位数（排除极端异常值）

直观理解：
- 衡量预测边界与真实边界的偏差
- 值越小表示边界越精确
- 单位是像素
- 本文基线HD95=12.22，改进后降至10.68（降低12.6%）

【指标选择的考量】
- mIoU：综合评估整体分割质量
- mAcc：关注目标区域的检出率
- mDice：与医学图像领域接轨
- HD95：专门评估边界分割精度

【过渡】
以上就是本研究涉及的相关技术基础。下面进入第三章，介绍本文的第一个核心创新——TR模块。`);
    
    return slide;
}

/**
 * 添加数据增强策略页
 */
function addDataAugmentationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '数据增强策略');
    
    // 数据增强图像网格（图片800x495，宽高比1.62:1）
    const augImages = [
        { file: 'fig2-9a_original.png', label: '(a) 原始图像' },
        { file: 'fig2-9b_hflip.png', label: '(b) 水平翻转' },
        { file: 'fig2-9c_rotate.png', label: '(c) 随机旋转' },
        { file: 'fig2-9d_brightness.png', label: '(d) 亮度调整' },
        { file: 'fig2-9e_contrast.png', label: '(e) 对比度调整' },
        { file: 'fig2-9f_noise.png', label: '(f) 添加噪声' }
    ];
    
    // 保持宽高比1.62:1，w=2.6, h=1.0
    const augW = 2.6, augH = 1.0;
    augImages.forEach((img, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.7 + col * 3.0;
        const y = 1.0 + row * 1.3;
        
        slide.addImage({ path: `${FIGURE_PATHS.cp2}/${img.file}`, x, y, w: augW, h: augH });
        slide.addText(img.label, { 
            x, y: y + augH + 0.02, w: augW, h: 0.2, 
            align: 'center', fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 底部总结
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.65, w: 9.2, h: 0.75,
        title: '数据增强目的',
        content: '扩充训练样本多样性，提高模型泛化能力。通过几何变换（翻转、旋转）和光度变换（亮度、对比度、噪声）模拟不同采集条件，增强模型对OCT图像变化的鲁棒性。'
    });
    
    // 演讲稿
    slide.addNotes(`【数据增强策略】

数据增强是深度学习中扩充训练数据的重要技术，可以有效提高模型的泛化能力。

【为什么需要数据增强】
1. 原始数据集规模有限（仅228张图像）
2. 深度学习模型需要大量数据才能充分训练
3. 增强可以模拟不同的采集条件，提高模型鲁棒性

【具体增强策略】

本研究采用了两类增强方法：

一、几何变换类：
1. 水平翻转（图b）
   - 以0.5的概率随机翻转
   - 模拟不同的扫描方向

2. 随机旋转（图c）
   - 在[-15°, +15°]范围内随机旋转
   - 模拟图像采集角度的微小变化

二、光度变换类：
3. 亮度调整（图d）
   - 在[0.8, 1.2]范围内随机调整
   - 模拟不同的光照条件

4. 对比度调整（图e）
   - 在[0.8, 1.2]范围内随机调整
   - 增强模型对低对比度图像的适应能力

5. 添加高斯噪声（图f）
   - 以一定概率添加噪声
   - 增强模型的抗噪能力

【增强效果】
从图中可以看到，每种增强都保持了熔深区域的基本结构，同时引入了合理的变化。

【增强策略的实现】
- 采用在线增强方式：每个epoch随机应用增强
- 使用PyTorch的transforms和albumentations库
- 增强概率和参数经过调优

【数据增强的效果】
通过5倍增强，训练集从182张扩充到912张，有效缓解了过拟合问题。

【过渡】
最后，我来介绍本研究使用的评估指标。`);
    
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
        'DeepLabV3+网络结构',
        '数据集构建与增强',
        '评估指标'
    ], `【第二章：相关技术基础】

在介绍本文的核心创新之前，我先简要回顾一下相关的技术基础，主要包括五个方面：

1. CNN基础组件：卷积层和池化层的工作原理
2. 经典语义分割网络：FCN和U-Net的设计思想
3. DeepLabV3+网络结构：本文选择的基线模型
4. 数据集构建：自建焊接OCT数据集的构建过程
5. 评估指标：mIoU、mAcc、mDice、HD95等指标的定义

这部分内容我会相对简略地介绍，重点放在与本文改进相关的部分。

【过渡】
首先来看CNN的基础组件。`);
    
    // 内容页（调整后的顺序）
    addCNNBasicsSlide(pptx);
    addClassicNetworksSlide(pptx);
    addDeepLabV3PlusSlide(pptx);
    addDatasetConstructionSlide(pptx);
    addDataAugmentationSlide(pptx);
    addMetricsExplanationSlide(pptx);   // 评估指标移到最后
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
