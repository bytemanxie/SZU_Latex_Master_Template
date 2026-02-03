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
    
    // 空洞卷积对比图（图片850x329，宽高比2.58:1）
    addWhiteBox(slide, pptx, 0.4, 1, 9.2, 1.85);
    slide.addText('不同空洞率的卷积对比', { 
        x: 0.5, y: 1.05, w: 9, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    // 保持宽高比2.58:1，w=3.6, h=1.4
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-1_dilated_conv.png`, x: 3.2, y: 1.35, w: 3.6, h: 1.4 });
    
    // 说明卡片
    const dilatedCards = [
        { title: '普通卷积 (rate=1)', desc: '标准3×3卷积，感受野3×3，仅捕获局部特征。' },
        { title: '空洞卷积 (rate=2)', desc: '在卷积核元素间插入空洞，感受野扩大到5×5。' },
        { title: '空洞卷积 (rate=3)', desc: '感受野进一步扩大到7×7，无需增加参数量。' }
    ];
    
    dilatedCards.forEach((card, i) => {
        const x = 0.4 + i * 3.15;
        addWhiteBox(slide, pptx, x, 3.0, 3, 0.85);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y: 3.0, w: 0.04, h: 0.85, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(card.title, { 
            x: x + 0.1, y: 3.05, w: 2.8, h: 0.25, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.desc, { 
            x: x + 0.1, y: 3.32, w: 2.8, h: 0.5, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 底部总结
    addBottomBox(slide, pptx, {
        x: 0.4, y: 4.0, w: 9.2, h: 0.45,
        title: null,
        content: '核心优势：在不增加参数量和计算量的情况下扩大感受野，捕获更大范围的上下文信息，适合密集预测任务。'
    });
    
    // 演讲稿
    slide.addNotes(`【空洞卷积原理】

在介绍TR模块之前，我先回顾一下DeepLabV3+中使用的关键技术——空洞卷积。

【什么是空洞卷积】

空洞卷积（Atrous Convolution），也叫膨胀卷积（Dilated Convolution），是一种扩大感受野的技术。

与普通卷积的区别：
- 普通卷积：卷积核元素紧密排列，比如3×3卷积核覆盖3×3的区域
- 空洞卷积：在卷积核元素之间插入"空洞"（零值），扩大覆盖范围

【空洞率（Dilation Rate）】

空洞率r决定了元素之间的间隔：
- r=1：普通卷积，无空洞，感受野 = (k-1)×1 + 1 = k（对于3×3是3）
- r=2：每个元素间隔1个像素，感受野 = (k-1)×2 + 1（对于3×3是5）
- r=3：每个元素间隔2个像素，感受野 = (k-1)×3 + 1（对于3×3是7）

一般公式：感受野 = (k-1)×r + 1，其中k是卷积核大小

【图示说明】

看图中的三个例子：
- 左：rate=1，标准3×3卷积，蓝色点直接相邻，感受野3×3
- 中：rate=2，蓝色点之间有1个空隙，感受野扩大到5×5
- 右：rate=3，蓝色点之间有2个空隙，感受野扩大到7×7

【核心优势】

空洞卷积的关键优势：
1. 扩大感受野：不需要增加卷积核大小就能看到更大范围
2. 保持分辨率：不需要池化下采样，保留更多空间信息
3. 参数不变：3×3空洞卷积的参数量与普通3×3卷积相同

【为什么重要】

在语义分割中，我们需要：
- 理解全局上下文（需要大感受野）
- 保留精细的空间信息（需要高分辨率）

空洞卷积完美地平衡了这两个需求。

【过渡】
DeepLabV3+将多个不同空洞率的卷积并行使用，这就是ASPP模块。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【ASPP模块详解】

ASPP是Atrous Spatial Pyramid Pooling的缩写，中文叫"空洞空间金字塔池化"。

【设计思想】

ASPP的核心思想是：用不同空洞率的卷积并行处理同一个输入，然后将结果融合。这样可以同时捕获多个尺度的上下文信息。

【五个并行分支】

本文使用的ASPP包含5个并行分支：

1. 1×1卷积（rate=1）
   - 作用：提取点级特征
   - 感受野：1×1，最精细的局部信息
   - 参数量最少

2. 3×3空洞卷积（rate=12）
   - 感受野：(3-1)×12+1 = 25
   - 捕获中等范围的上下文

3. 3×3空洞卷积（rate=24）
   - 感受野：(3-1)×24+1 = 49
   - 捕获较大范围的上下文

4. 3×3空洞卷积（rate=36）
   - 感受野：(3-1)×36+1 = 73
   - 捕获全局级别的上下文

5. 全局平均池化
   - 对整个特征图做平均
   - 编码图像级的全局信息
   - 然后上采样到原始大小

【特征融合】

5个分支的输出在通道维度上拼接（Concatenate），然后通过1×1卷积融合，得到最终的ASPP输出。

【ASPP的优势】

1. 多尺度感知：不同分支捕获不同尺度的信息
2. 并行计算：各分支独立计算，效率高
3. 有效融合：concat+1×1卷积实现信息融合

【ASPP的局限性】

虽然ASPP可以捕获多尺度信息，但仍存在局限：
- 感受野仍然是局部的，最大也就73×73
- 难以建立真正的长距离依赖
- 对于细长结构（如熔深区域），不同位置之间的关联建模不够

【过渡】
这正是我们引入TR模块的动机，下面详细分析改进的必要性。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【改进动机：全局上下文建模不足】

这一页分析为什么需要在DeepLabV3+基础上引入TR模块。

【左侧：ASPP模块的局限性】

虽然ASPP已经很强大了，但在处理OCT图像时存在几个问题：

1. 感受野仍然受限
   - 即使rate=36的空洞卷积，感受野也只有73×73
   - 对于512×512的输入图像，这只覆盖约14%的区域
   - 无法建立图像左上角和右下角之间的联系

2. 局部性的本质没有改变
   - 卷积操作本质上还是局部操作
   - 每个位置只能看到其邻域内的信息
   - 需要很多层堆叠才能传递远距离信息

3. OCT图像的特殊性
   - 熔深区域通常是细长结构
   - 纵横比可达1:10甚至更高
   - 需要同时理解结构的头部、中部和尾部

【右侧：解决方案——TR模块】

针对这些问题，我们提出引入TR（Transformer Routing）模块：

1. 引入Transformer注意力机制
   - 注意力机制可以直接计算任意两个位置之间的关系
   - 不受距离限制，天然支持长距离依赖

2. 双层路由降低复杂度
   - 标准Transformer的复杂度是O(n²)，n是序列长度
   - 对于512×512图像，n=262144，计算量巨大
   - 双层路由将其降低到可接受的水平

3. TopK稀疏选择
   - 不是所有位置都需要关注
   - 只选择最相关的K个位置计算注意力
   - 大幅减少计算量

【核心思想总结】

我们的核心思想是：
- 在ASPP之后插入TR模块
- 借鉴BiFormer论文的双层路由注意力
- 通过区域级路由和TopK选择实现高效全局建模

复杂度从O(n²)降低到O(n²×k/p²)，其中k是TopK的K值，p是窗口数量。

【过渡】
下面详细介绍TR模块的具体设计。`);
    
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
    slide.addText('区域级路由 + Token级注意力两阶段计算，保持全局建模能力同时降低计算复杂度。', { 
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
    
    // 右侧 - TR模块结构图
    addWhiteBox(slide, pptx, 5.05, 1, 4.55, 3.4);
    slide.addText('TR模块结构图', { 
        x: 5.15, y: 1.05, w: 4.35, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-3_tr_module.png`, x: 6.05, y: 1.35, w: 1.7, h: 2.95 });
    
    // 演讲稿
    slide.addNotes(`【TR模块：全局上下文增强】

这一页介绍TR模块的整体设计。TR是Transformer Routing的缩写。

【双层路由注意力（来自BiFormer）】

TR模块的核心思想借鉴自BiFormer论文提出的双层路由注意力（Bi-level Routing Attention）。

"双层"指的是两个阶段：
1. 第一层：区域级路由（Region-level Routing）
   - 将特征图划分为若干窗口
   - 计算窗口之间的相关性矩阵
   - 为每个窗口选择最相关的K个邻居窗口

2. 第二层：Token级注意力（Token-level Attention）
   - 只在选中的窗口对之间计算细粒度的注意力
   - 标准的Query-Key-Value注意力机制

这种设计的巧妙之处在于：
- 区域级路由的计算量很小（窗口数量少）
- Token级注意力只在少量窗口对之间计算
- 但仍然保持了全局建模能力（任意窗口都可能被选中）

【Top-K稀疏选择策略】

Top-K选择是降低复杂度的关键：
- K通常设置为4或8
- 每个查询窗口只与K个最相关的窗口交互
- 计算量减少约75%（如果K=4，窗口数=16）

为什么可以这样做？
- 因为注意力权重通常是稀疏的
- 大部分权重集中在少数几个相关位置
- 其他位置的权重接近零，可以忽略

【作用效果】

TR模块的三个主要作用：
1. 增强长程依赖建模：直接建立远距离位置之间的联系
2. 提升目标结构与上下文表征：更好地理解细长结构的整体
3. 有效抑制散斑噪声：通过全局上下文滤除局部噪声

【过渡】
下面看TR模块的详细计算流程。`);
    
    return slide;
}

/**
 * 添加TR模块详细原理页
 */
function addTRDetailSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, 'TR模块详细原理');
    
    // 双层路由注意力示意图（图片2036x920，宽高比2.21:1）
    addWhiteBox(slide, pptx, 0.4, 1, 9.2, 2.35);
    slide.addText('双层路由注意力机制 (Bi-level Routing Attention)', { 
        x: 0.5, y: 1.05, w: 9, h: 0.25, 
        align: 'center', fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
    });
    // 保持宽高比2.21:1，w=8.0, h=3.62 → 调整为适合框高度 h=1.75, w=3.87
    slide.addImage({ path: `${FIGURE_PATHS.cp3}/fig3-4_bilevel_attention.png`, x: 2.55, y: 1.38, w: 4.9, h: 1.85 });
    
    // 底部 - 计算流程
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.5, w: 9.2, h: 0.95, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('双层路由注意力计算流程', { 
        x: 0.6, y: 3.55, w: 8.8, h: 0.22, 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
    });
    slide.addText('输入特征 → 区域划分(S×S) → 区域级路由矩阵 → Top-K选择 → Token级注意力 → 特征聚合 → 输出特征', { 
        x: 0.6, y: 3.8, w: 8.8, h: 0.25, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.GREEN 
    });
    slide.addText('复杂度：O(S²HW/S² + K·HW·C) = O(HW(S² + KC))，相比全局注意力O(H²W²)显著降低', { 
        x: 0.6, y: 4.1, w: 8.8, h: 0.25, 
        fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
    });
    
    // 演讲稿（详细解释BiFormer图）
    slide.addNotes(`【TR模块详细原理——双层路由注意力】

这张图是本文TR模块的核心原理图，来自BiFormer论文。我来详细解释双层路由注意力的计算流程。

【看图左侧：输入特征图的区域划分】

首先，输入特征图大小为H×W，被划分为S×S个窗口（图中的红色和黑色网格）：
- 图中展示的例子：4×4 = 16个窗口
- 每个窗口大小为 (H/S) × (W/S)
- 红色边框的是当前查询窗口

【第一层：区域级路由】

1. 对每个窗口计算一个区域级表示
   - 通常使用窗口内所有token的平均值
   - 得到S² = 16个区域向量

2. 计算区域级路由矩阵
   - 计算16×16的相似度矩阵
   - 相似度 = Query区域向量 × Key区域向量的点积

3. Top-K选择
   - 对每一行取Top-K个最大值
   - 选出与当前窗口最相关的K个邻居窗口
   - 图中K=4，所以每个窗口选4个邻居

【图中的gather操作】

"gather"是这个算法的精髓：
- 根据Top-K索引，从全局Key和Value中"聚集"相关的token
- K^g 和 V^g 就是聚集后的Key和Value
- 维度从 HW/S² × C 变成 kHW/S² × C
- 只保留被选中窗口的token

【第二层：Token级注意力计算】

现在我们有：
- Q矩阵：当前窗口的查询向量，维度 HW/S² × C
- K^g矩阵：被选中邻居的Key向量，维度 kHW/S² × C
- V^g矩阵：被选中邻居的Value向量，维度 kHW/S² × C

标准注意力计算：
1. mm & softmax：计算 softmax(Q × K^g^T / √d)，得到注意力矩阵A
2. mm：计算 A × V^g，得到输出O

【注意力矩阵A的解释】

A的维度是 HW/S² × kHW/S²：
- 行：当前窗口的每个token
- 列：被选中邻居窗口的所有token
- 绿色的格子表示一个注意力权重值

【复杂度分析】

底部的公式说明了复杂度：

1. 区域级路由：O(S⁴)，因为要计算S²×S²的相似度矩阵，很小
2. Token级注意力：O(K × HW × C)，只计算K个邻居

总复杂度：O(HW(S² + KC))

对比标准全局注意力O(H²W²)：
- 假设H=W=512，C=256，S=4，K=4
- 全局注意力：512² × 512² ≈ 69 billion
- 双层路由：512×512×(16 + 4×256) ≈ 268 million
- 减少了约250倍！

【核心优势总结】

1. 保持全局建模能力：任意两个区域都可能建立连接
2. 计算高效：通过稀疏选择大幅降低计算量
3. 动态路由：相关性是学习出来的，可以适应不同输入

【过渡】
接下来介绍实验设置和消融实验结果。`);
    
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
        ['深度学习框架', 'PyTorch 1.13 + CUDA 11.7']
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
    
    // 演讲稿
    slide.addNotes(`【实验设置】

这一页介绍本研究的实验环境和训练配置。

【实验环境配置（左表）】

硬件环境：
- GPU：NVIDIA RTX 4090，显存24GB
  - 这是目前消费级最强的GPU之一
  - 足够训练大多数深度学习模型
- CPU：Intel i7-13700KF
- 内存：64GB DDR5
- 操作系统：Ubuntu 20.04 LTS

软件环境：
- 深度学习框架：PyTorch 1.13
- CUDA版本：11.7
- 基于MMSegmentation工具箱开发

【训练参数配置（右表）】

1. 输入尺寸：512×512
   - 与预处理后的图像尺寸一致
   - 较大的输入有助于保留细节

2. 批量大小：8
   - 受限于GPU显存
   - 使用了梯度累积技术等效增大batch

3. 总迭代次数：20,000
   - 大约相当于100个epoch
   - 足够模型收敛

4. 优化器：AdamW
   - Adam的改进版本，加入了权重衰减
   - 更适合Transformer类模型

5. 初始学习率：6e-5
   - 较小的学习率，训练更稳定
   - 配合预训练权重使用

6. 学习率策略：PolyLR (power=0.9)
   - 多项式衰减：lr = init_lr × (1 - iter/max_iter)^power
   - 平滑地降低学习率

7. 权重衰减：0.01
   - 正则化项，防止过拟合

【损失函数设计】

采用BCE + Dice的组合损失：
L = λ₁×L_BCE + λ₂×L_Dice，λ₁=λ₂=1

为什么这样设计：
- BCE（二元交叉熵）：关注每个像素的分类准确性
- Dice损失：关注预测区域与真实区域的整体重叠度

两者互补：
- BCE对所有像素一视同仁
- Dice对小目标更友好，因为它看比例而非绝对数量

【过渡】
下面看TR模块的消融实验结果。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【TR模块可视化对比——细长结构场景】

这一页通过可视化对比，直观展示TR模块的效果。选取的是一个典型的细长结构场景。

【图像说明】

第一排（4张）：
1. 原始图像：输入的OCT图像，可以看到有一条细长的熔深区域
2. Ground Truth：人工标注的真实标签
3. UNet：经典的U型网络结果
4. UNet++：UNet的改进版本

第二排（4张）：
5. ResUNet：带残差连接的UNet
6. TransUNet：引入Transformer的UNet
7. DeepLabV3+：本文的基线模型（红色标注）
8. +TR（本章方法）：添加TR模块后的结果（绿框高亮）

【对比分析】

观察DeepLabV3+（红色标注）和+TR（绿框）的对比：

问题1：断裂现象
- DeepLabV3+在细长结构的某些位置出现断裂
- 因为局部卷积难以理解整体结构
- +TR后，结构变得更加连续完整
- 这是因为TR模块建立了长距离依赖

问题2：边界模糊
- DeepLabV3+的边界有些位置不够清晰
- +TR后，边界的连续性有所改善
- 但边界精度还有进一步提升的空间（这是第四章SAE模块的任务）

问题3：噪声干扰
- OCT图像背景中有散斑噪声
- 局部处理容易被噪声干扰
- 全局注意力通过上下文信息能更好地滤除噪声

【与其他方法的对比】

- UNet、UNet++、ResUNet：传统编码器-解码器结构，效果一般
- TransUNet：虽然也用了Transformer，但计算量很大，收敛较慢
- DeepLabV3+：已经是很强的基线
- +TR：在基线基础上进一步提升

【小结】

可视化对比证明了TR模块的三个作用：
1. 有效抑制断裂问题
2. 改善边界连续性
3. 抑制散斑噪声干扰

【过渡】
下面对本章内容做一个小结。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【TR模块消融实验】

这一页展示TR模块的消融实验结果。消融实验的目的是验证单个模块的有效性。

【实验设置】

对比两个配置：
1. DeepLabV3+（基线）：原始模型，不加任何改进
2. DeepLabV3+ + TR：在ASPP后面添加TR模块

【实验结果分析】

看上方的表格：

基线模型性能：
- mIoU: 0.851
- mAcc: 0.923
- mDice: 0.913

添加TR模块后：
- mIoU: 0.884（提升3.9%）
- mAcc: 0.941（提升1.8个百分点）
- mDice: 0.935（提升2.2个百分点）

【三个分析卡片详解】

卡片1：mIoU提升+3.9%
- 这是最核心的指标
- 从0.851提升到0.884
- 说明TR模块确实提升了分割质量
- 对于分割任务，3.9%的提升是相当显著的

卡片2：全局建模能力增强
- TR模块的作用是建立长距离依赖
- 让模型能够"看到"更远的区域
- 对于细长的熔深结构特别有效
- 结构头部和尾部可以相互"看到"

卡片3：计算效率优化
- 虽然引入了额外计算，但通过TopK机制优化
- 计算量仅增加25%左右
- 相比标准Transformer减少了约75%的计算
- 在性能和效率之间取得了良好的平衡

【实验结论】

TR模块有效增强了全局上下文建模能力：
1. 定量上：mIoU提升3.9%
2. 定性上：对细长结构的分割更完整

但是，TR模块主要增强的是全局语义理解，对于边界精度的提升有限。这为我们后续引入SAE模块提供了动机。

【过渡】
下面通过可视化对比来直观展示TR模块的效果。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【本章小结】

本章是论文的第一个核心创新章节，主要贡献有三点：

【贡献一：问题分析】

分析了DeepLabV3+在OCT图像分割中的局限性：
- ASPP模块的感受野仍然受限于空洞卷积的局部性
- 即使最大的空洞率rate=36，感受野也只有73×73
- 难以建立真正的长距离依赖
- 对于细长结构的熔深区域，这种局限性尤为明显

这个分析为引入TR模块提供了理论依据。

【贡献二：方法创新】

提出了TR（Transformer Routing）全局注意力模块：
- 借鉴BiFormer的双层路由注意力思想
- 第一层：区域级路由，计算窗口间相关性
- 第二层：Token级注意力，在选中的窗口对间计算
- TopK稀疏选择机制，只关注最相关的K个邻居
- 计算复杂度从O(n²)降低到O(n×k)

关键设计点：
- 窗口划分：将特征图分成S×S个窗口
- 路由矩阵：计算窗口级相似度
- 稀疏选择：每个窗口只选K个邻居

【贡献三：实验验证】

消融实验验证了TR模块的有效性：
- mIoU从0.851提升到0.884（+3.9%）
- mAcc从0.923提升到0.941
- mDice从0.913提升到0.935

可视化分析表明：
- 细长结构分割更完整
- 断裂现象明显减少
- 噪声抑制效果改善

【承上启下】

TR模块主要增强了全局语义理解能力，但边界分割精度仍有提升空间。

这引出了第四章的工作：设计SAE模块来增强边界分割质量。

【过渡】
下面进入第四章，介绍本文的第二个核心创新——SAE模块。`);
    
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
    ], `【第三章：基于全局注意力的模型改进】

接下来进入本文的第一个核心创新章节——TR模块的设计与实验。

这一章我将按照以下逻辑展开：

首先，回顾空洞卷积和ASPP模块的原理，这是DeepLabV3+的核心技术。

然后，分析ASPP模块在OCT图像分割中的局限性——主要是全局上下文建模能力不足。

接着，详细介绍我们提出的TR模块，它借鉴了BiFormer论文的双层路由注意力思想，能够高效地建立全局长距离依赖。

最后，通过消融实验和可视化对比，验证TR模块的有效性。

【关键结论预告】
引入TR模块后，mIoU从0.851提升到0.884，提升了3.9%。细长结构的分割变得更加完整。

【过渡】
首先来看空洞卷积的原理。`);
    
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
