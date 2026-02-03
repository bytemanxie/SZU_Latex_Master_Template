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
    
    // 演讲稿
    slide.addNotes(`【改进动机：空间位置信息不足】

这一页分析为什么需要在第三章TR模块基础上，继续引入SAE模块。

【承接第三章】

首先回顾一下第三章的成果：
- TR模块增强了全局上下文建模能力
- mIoU从0.851提升到0.884（+3.9%）
- 细长结构的分割更加完整

但是，观察实验结果发现：
- 边界区域的分割精度仍有提升空间
- 特别是熔深区域与背景的过渡地带
- 这正是第四章要解决的问题

【左侧：解码器的局限性】

为什么边界分割不够精确？主要原因是解码器存在以下问题：

1. 空间位置信息丢失
   - 在编码器的下采样过程中，空间分辨率逐渐降低
   - 虽然有跳跃连接，但位置信息仍然不够精确
   - 解码器只知道"有目标"，但不清楚"精确边界在哪"

2. 通道权重均匀分配
   - 特征图有很多通道（如560个）
   - 不是所有通道对分割都同样重要
   - 有些通道包含边界信息，有些包含背景信息
   - 应该让重要的通道有更大的权重

3. 缺乏方向性感知
   - 熔深区域是细长结构，有明确的方向
   - 需要感知水平和垂直方向的位置信息
   - 传统卷积对方向不敏感

4. 边界模糊区域处理不佳
   - OCT图像的边界本身就模糊
   - 需要增强模型对边界的判别能力

【右侧：解决方案——SAE模块】

SAE是Spatial-Aware Enhancement的缩写，意为"空间感知增强"。

SAE模块的设计思路：
1. 坐标注意力：编码H和W两个方向的位置信息
2. 通道注意力：突出判别性强的特征通道
3. 双重机制协同：空间+通道双重增强

【核心思想】

在解码器端（特征融合之后）引入SAE模块，增强对目标边界的感知能力。

【过渡】
下面详细介绍SAE模块的具体设计。`);
    
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
    
    // 演讲稿（详细解释坐标注意力和通道注意力）
    slide.addNotes(`【SAE模块：局部细节增强】

这一页详细介绍SAE模块的两个核心组件：坐标注意力和通道注意力。

【坐标注意力 (Coordinate Attention)】

坐标注意力来自CVPR 2021的论文"Coordinate Attention for Efficient Mobile Network Design"。

核心思想：将空间位置信息编码到注意力权重中。

工作流程：
1. X方向平均池化：对每一行做平均，得到 C×H×1 的特征
2. Y方向平均池化：对每一列做平均，得到 C×1×W 的特征
3. 拼接：将两个方向的特征拼接，得到 C×1×(H+W)
4. 卷积：通过1×1卷积学习通道间关系
5. 分割：将特征分成两部分，分别对应H和W方向
6. 激活：通过Sigmoid得到注意力权重 a_h 和 a_w
7. 重加权：F_out = F × σ(a_h) × σ(a_w)

公式：F_out = F × σ(a_h) × σ(a_w)

为什么有效：
- 传统的SE模块只有通道注意力，丢失了空间信息
- 坐标注意力保留了位置信息
- 对于细长结构，可以感知目标的方向和位置

【通道注意力 (Channel Attention)】

通道注意力基于经典的SE（Squeeze-and-Excitation）模块。

SE模块的工作流程：
1. Squeeze（压缩）：全局平均池化，将H×W压缩为1×1
   - 输入：C×H×W → 输出：C×1×1
   - 每个通道得到一个统计值
   
2. Excitation（激发）：两个全连接层学习通道关系
   - FC1：C → C/r（降维，r是reduction ratio，本文r=4）
   - ReLU激活
   - FC2：C/r → C（升维回原通道数）
   - Sigmoid激活，得到通道权重 s
   
3. Scale（重标定）：F_out = F × σ(s)
   - 用学到的权重对原始特征进行加权

公式：F_out = F × σ(s)

本文的改进：
- 使用4分支并行处理
- 增加了特征的多样性
- 更好地捕获不同层次的通道关系

【SAE模块的参数设置】

- 输入通道数：560（解码器融合后的通道数）
- Reduction ratio：4（通道注意力的降维比例）
- 4分支并行：增强特征多样性
- mIoU提升：+5.9%（从0.851到0.901）

【主要作用】

SAE模块的三个主要作用：
1. 增强空间位置信息编码：知道边界在哪里
2. 强化判别性特征通道响应：哪些特征重要
3. 改善细长结构与模糊边界分割：提高边界精度

【过渡】
下面看改进模型的整体结构。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【改进模型整体结构】

这一页展示TR模块和SAE模块在整个网络中的位置，以及它们如何协同工作。

【整体架构】

改进后的模型由以下部分组成：

1. 编码器（Encoder）
   - 骨干网络：ResNet18-V1c
   - 下采样4次，分辨率从512→256→128→64→32→16
   - 提取多尺度特征

2. ASPP模块
   - 位置：编码器输出后
   - 输入：16×16×512的特征图
   - 输出：16×16×2560的多尺度特征

3. TR模块（第三章提出）
   - 位置：ASPP输出后
   - 输入：16×16×2560
   - 作用：增强全局上下文建模
   - 双层路由注意力 + TopK选择

4. 解码器（Decoder）
   - 上采样：16→32→128
   - 与编码器浅层特征融合
   - 跳跃连接保留细节信息

5. SAE模块（第四章提出）
   - 位置：解码器特征融合后
   - 输入：128×128×560
   - 作用：增强局部细节与边界分割
   - 坐标注意力 + 通道注意力

6. 输出头
   - 128→512上采样
   - 得到最终分割结果

【三个卡片：模块位置与作用】

卡片1：TR模块位置
- 在ASPP输出后
- 处理16×16的低分辨率特征
- 这个阶段适合做全局建模（特征图小，计算量可控）

卡片2：SAE模块位置
- 在解码器融合后
- 处理128×128的高分辨率特征
- 这个阶段适合做局部增强（需要精细的空间信息）

卡片3：协同效应
- TR负责全局语义理解：理解整体结构
- SAE负责局部细节增强：精确边界位置
- 两者互补，共同提升分割性能

【设计考量】

为什么把TR放在编码端，SAE放在解码端？
- 编码端特征图小（16×16），适合计算量大的全局注意力
- 解码端特征图大（128×128），需要空间位置信息
- 这样的设计在性能和效率之间取得平衡

【过渡】
下面通过综合消融实验验证两个模块的效果。`);
    
    return slide;
}

/**
 * 添加综合消融实验页
 */
function addComprehensiveAblationSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '综合消融实验');
    
    // 消融实验表格 - 增加 HD95 列
    slide.addTable([
        [
            { text: '配置', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'TR', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'SAE', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mIoU', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'mDice', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: 'HD95↓', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } },
            { text: '提升', options: { fill: { color: COLORS.NAVY }, color: COLORS.WHITE, bold: true } }
        ],
        ['DeepLabV3+ (基线)', '-', '-', '0.851', '0.913', '12.22', '-'],
        ['+ TR (第三章)', '✓', '-', '0.884', '0.935', '11.89', { text: '+3.9%', options: { color: COLORS.GREEN, bold: true } }],
        ['+ SAE', '-', '✓', '0.901', '0.945', { text: '11.45', options: { color: COLORS.GREEN } }, { text: '+5.9%', options: { color: COLORS.GREEN, bold: true } }],
        [
            { text: '+ TR + SAE (本文)', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '✓', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '✓', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.911', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '0.951', options: { fill: { color: 'E8F5E9' }, bold: true } },
            { text: '10.68', options: { fill: { color: 'E8F5E9' }, color: COLORS.RED, bold: true } },
            { text: '+7.1%', options: { fill: { color: 'E8F5E9' }, color: COLORS.GREEN, bold: true } }
        ]
    ], { 
        x: 0.4, y: 1, w: 9.2, h: 1.8, 
        colW: [2.2, 0.7, 0.7, 1.1, 1.1, 1.1, 1.3], 
        fontSize: 10, align: 'center', valign: 'middle', 
        border: { pt: 0.5, color: 'E0E0E0' } 
    });
    
    // 分析卡片 - 更新内容，强调 HD95
    const analysisCards = [
        { title: 'SAE模块贡献', desc: 'mIoU+5.9%, HD95从12.22降至11.45\n主要作用于边界分割精度提升\n坐标注意力增强空间位置感知' },
        { title: 'TR模块贡献', desc: 'mIoU+3.9%, HD95从12.22降至11.89\n增强全局上下文理解\n长距离依赖有效抑制噪声' },
        { title: '协同效应', desc: 'mIoU+7.1%, HD95降至10.68 (-12.6%)\n全局(TR)+局部(SAE)互补\n边界精度与区域完整性双提升' }
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
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 演讲稿
    slide.addNotes(`【综合消融实验】

这一页展示了完整的消融实验结果，验证每个模块的贡献以及它们的协同效应。

【实验设计】

对比四个配置：
1. DeepLabV3+（基线）：不添加任何改进
2. + TR：只添加TR模块（第三章方法）
3. + SAE：只添加SAE模块（本章方法）
4. + TR + SAE：同时添加两个模块（本文完整方法）

【表格数据分析】

观察表格中的数据：

基线性能：
- mIoU: 0.851, mDice: 0.913, HD95: 12.22

添加TR模块后：
- mIoU: 0.884 (+3.9%)
- mDice: 0.935
- HD95: 11.89（边界距离略有改善）

添加SAE模块后：
- mIoU: 0.901 (+5.9%)  ← SAE单独贡献更大！
- mDice: 0.945
- HD95: 11.45（边界距离明显改善）

同时添加TR和SAE：
- mIoU: 0.911 (+7.1%)
- mDice: 0.951
- HD95: 10.68（最佳边界精度！）

【重要发现】

1. SAE模块的贡献大于TR模块
   - SAE: +5.9% vs TR: +3.9%
   - 说明边界分割是主要瓶颈

2. HD95指标显著改善
   - 基线: 12.22 → 最终: 10.68
   - 降低12.6%，边界精度大幅提升
   - 这证明了SAE模块确实增强了边界分割能力

3. 存在协同效应
   - TR(+3.9%) + SAE(+5.9%) = +9.8%（独立相加）
   - 实际: +7.1%
   - 虽然不是简单叠加，但组合效果仍然最优
   - 两个模块各有侧重，互为补充

【三个分析卡片】

卡片1：SAE模块贡献
- mIoU提升5.9%，是最大的单模块贡献
- HD95从12.22降到11.45
- 主要改善边界分割精度
- 坐标注意力编码位置信息是关键

卡片2：TR模块贡献
- mIoU提升3.9%
- HD95从12.22降到11.89
- 主要增强全局上下文理解
- 对细长结构的完整性有帮助

卡片3：协同效应
- 最终mIoU达到0.911
- HD95降至10.68，是所有配置中最低的
- TR负责全局，SAE负责局部
- 边界精度与区域完整性双重提升

【过渡】
下面与其他主流方法进行全面对比。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【与主流方法对比】

这一页将本文方法与多个主流语义分割模型进行全面对比。

【对比方法介绍】

1. UNet（2015）：经典的编码器-解码器结构
2. UNet++（2018）：密集跳跃连接的改进UNet
3. ResUNet：带残差连接的UNet
4. TransUNet（2021）：融合Transformer的UNet
5. DeepLabV3+：本文的基线模型

【表格数据分析】

按mIoU排序：
1. 本文方法: 0.911（最高）
2. DeepLabV3+: 0.851
3. TransUNet: 0.810
4. UNet: 0.805
5. UNet++: 0.751
6. ResUNet: 0.721

关键观察：

1. 本文方法取得最优性能
   - mIoU: 0.911，超过所有对比方法
   - 目标IoU: 0.826，比基线提升16.3%
   - HD95: 10.68，边界精度最好

2. 与基线DeepLabV3+对比
   - mIoU: +7.1%（0.851→0.911）
   - 目标IoU: +16.3%（0.710→0.826）
   - HD95: -12.6%（12.22→10.68）

3. 与TransUNet对比
   - TransUNet虽然也用了Transformer
   - 但参数量达到219MB，而且训练困难
   - 本文方法性能更好（0.911 vs 0.810）

【四个性能提升卡片】

卡片1：+7.1% mIoU提升（vs DeepLabV3+）
- 这是最核心的指标
- 证明了双重注意力机制的有效性

卡片2：+16.3% 目标IoU提升（vs DeepLabV3+）
- 目标IoU是熔深区域的IoU
- 这个提升说明模型对目标的检测能力显著增强

卡片3：+13.2% mIoU提升（vs UNet）
- 对比经典方法的提升幅度更大
- 说明本文方法在OCT图像分割上具有优势

卡片4：-12.6% HD95降低
- 边界精度的核心指标
- SAE模块的主要贡献

【关于参数量】

本文方法的参数量是420MB，确实较大。这是因为：
- TR模块引入了额外的Transformer结构
- SAE模块增加了注意力计算

但相比TransUNet（219MB）：
- 性能更好（0.911 vs 0.810）
- 训练更稳定

参数量大是一个可以接受的trade-off，因为：
- 当前GPU内存足够支持
- 推理速度仍可接受（10.5 FPS）
- 未来可以通过知识蒸馏等方法压缩

【过渡】
下面通过可视化对比直观展示分割效果。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【可视化对比——细长结构场景】

这一页通过10张可视化结果，直观展示不同方法的分割效果。

【图像布局】

第一排（5张）：
1. 原始图像：输入的OCT图像
2. Ground Truth：人工标注的真实标签
3. UNet：经典UNet的分割结果
4. UNet++：改进UNet的结果
5. ResUNet：残差UNet的结果

第二排（5张）：
6. TransUNet：Transformer+UNet的结果
7. DeepLabV3+：基线模型的结果
8. +TR (Ours)：只添加TR模块
9. +SAE (Ours)：只添加SAE模块
10. +Both (Ours)：同时添加两个模块（绿框高亮）

【观察要点】

请各位老师注意以下几个区域：

1. 细长结构的连续性
   - UNet、UNet++：出现明显断裂
   - DeepLabV3+：有轻微断裂
   - +TR：结构更连续
   - +Both：最完整

2. 边界的清晰度
   - 传统方法：边界模糊
   - +SAE：边界更清晰
   - +Both：边界最精确

3. 噪声抑制
   - 传统方法：背景有误检
   - +TR：噪声抑制较好
   - +Both：背景最干净

【各方法的问题】

- UNet：结构断裂，边界模糊
- UNet++：改善有限
- ResUNet：效果一般
- TransUNet：有改善但不稳定
- DeepLabV3+：细长结构有时断裂
- +TR：结构完整性好，但边界可以更精确
- +SAE：边界精确，但结构有时断裂
- +Both：结合两者优势，效果最佳

【本文方法的优势】

+Both（绿框高亮）的三个优势：
1. 边界更清晰：SAE的坐标注意力增强了空间感知
2. 细长结构更完整：TR建立了长距离依赖
3. 噪声抑制更好：双重注意力协同过滤噪声

【定量对应】

可视化观察与定量指标一致：
- 边界清晰 → HD95降低12.6%
- 结构完整 → 目标IoU提升16.3%
- 整体更好 → mIoU提升7.1%

【过渡】
最后，总结本章的实验结论。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【实验结论】

这一页总结第四章的核心实验结论。

【四个关键指标】

上方展示了四个最重要的性能指标：

1. mIoU = 0.911
   - 平均交并比，核心评估指标
   - 相比基线提升7.1%
   - 这是一个显著的提升

2. 目标IoU = 0.826
   - 熔深区域的IoU
   - 相比基线提升16.3%
   - 说明对目标的检测能力大幅增强

3. HD95 = 10.68
   - 95%豪斯多夫距离
   - 相比基线降低12.6%
   - 边界分割精度显著改善

4. FPS = 10.5
   - 每秒处理帧数
   - 在RTX 4090上测试
   - 基本满足实时应用需求

【三个核心结论】

结论1：分割精度显著提升
- mIoU从0.851提升到0.911
- 相比UNet提升13.2%
- 验证了双重注意力机制的有效性
- TR和SAE各有贡献，组合效果最优

结论2：边界质量明显改善
- HD95从12.22降到10.68
- 降低了12.6%
- SAE模块是主要贡献者
- 坐标注意力有效编码了空间位置信息
- 对细长结构和模糊边界的处理效果显著

结论3：效率-性能平衡良好
- 相比TransUNet：
  - 内存减少53.3%（420MB vs 898MB）
  - 速度提升39.1%
  - 性能更好（0.911 vs 0.810）
- 在保持高性能的同时具有更好的实用性

【总结】

本章的主要贡献：
1. 提出了SAE模块，结合坐标注意力和通道注意力
2. 验证了TR和SAE模块的协同效应
3. 在多个指标上取得了最优性能

【承上启下】

至此，本文的两个核心创新模块都已介绍完毕：
- 第三章：TR模块 → 全局上下文增强
- 第四章：SAE模块 → 局部细节增强

两个模块协同工作，使得改进后的DeepLabV3+在OCT图像分割任务上取得了显著的性能提升。

【过渡】
下面进入最后一章，对全文进行总结与展望。`);
    
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
    ], `【第四章：基于空间感知增强的模型优化】

接下来进入本文的第二个核心创新章节——SAE模块的设计与综合实验。

这一章的逻辑是：

首先，分析第三章TR模块的不足之处——虽然增强了全局建模能力，但边界分割精度仍有提升空间。

然后，提出SAE模块（Spatial-Aware Enhancement），它结合了坐标注意力和通道注意力两种机制，专门用于增强边界分割能力。

接着，展示改进模型的整体架构，说明TR和SAE两个模块如何协同工作。

最后，通过综合消融实验、与主流方法对比、以及可视化分析，全面验证改进方法的有效性。

【关键结论预告】
- SAE模块单独贡献：mIoU +5.9%
- TR+SAE组合：mIoU +7.1%
- HD95（边界距离）降低12.6%

【过渡】
首先分析SAE模块的设计动机。`);
    
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
