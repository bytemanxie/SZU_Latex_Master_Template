/**
 * 第一章：研究背景与意义
 */

const { COLORS, STYLES, CHAPTERS, FIGURE_PATHS } = require('../config');
const { addChapterEntry, createContentSlide, addCard, addBottomBox, addWhiteBox } = require('../templates');

const CHAPTER = CHAPTERS[1];
const LABEL = `${CHAPTER.num} ${CHAPTER.title}`;

/**
 * 添加研究背景页
 */
function addBackgroundSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '研究背景');
    
    // 左侧 - 文字卡片
    const bgCards = [
        { title: '激光焊接技术', desc: '高精度、高效率，广泛应用于航空航天、汽车制造等精密领域。' },
        { title: 'OCT检测技术', desc: '非接触、微米级分辨率、实时成像，是熔池检测重要手段。' },
        { title: '语义分割需求', desc: '精确提取熔池区域是实现焊接质量在线检测的关键。' }
    ];
    
    bgCards.forEach((card, i) => {
        const y = 1.05 + i * 0.7;
        addWhiteBox(slide, pptx, 0.4, y, 4.3, 0.6);
        slide.addText(card.title, { 
            x: 0.55, y: y + 0.05, w: 4, h: 0.25, 
            fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
        });
        slide.addText(card.desc, { 
            x: 0.55, y: y + 0.3, w: 4, h: 0.25, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    });
    
    // 右侧 - OCT图像示例
    addWhiteBox(slide, pptx, 4.9, 1.05, 4.7, 2.1);
    slide.addText('OCT图像示例', { 
        x: 5, y: 1.1, w: 4.5, h: 0.25, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.NAVY 
    });
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-8a_raw.png`, x: 5.05, y: 1.4, w: 2.15, h: 1.45 });
    slide.addImage({ path: `${FIGURE_PATHS.cp2}/fig2-8b_mask.png`, x: 7.3, y: 1.4, w: 2.15, h: 1.45 });
    slide.addText('(a) 原始OCT图像', { 
        x: 5.05, y: 2.88, w: 2.15, h: 0.2, 
        align: 'center', fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    slide.addText('(b) 标注掩码', { 
        x: 7.3, y: 2.88, w: 2.15, h: 0.2, 
        align: 'center', fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
    });
    
    // 底部 - 核心需求
    addBottomBox(slide, pptx, {
        x: 0.4, y: 3.25, w: 9.2, h: 1.15,
        title: '核心需求',
        content: '开发一种能够精确分割OCT图像中熔池区域的深度学习方法，支持激光焊接过程的实时质量监测与反馈控制。'
    });
    
    // 演讲稿
    slide.addNotes(`【研究背景介绍】

【激光焊接技术】
激光焊接是现代精密制造中的核心工艺之一。与传统焊接方法相比，激光焊接具有能量密度高、热影响区小、焊接速度快、变形小等优点，因此广泛应用于航空航天、汽车制造、电子元器件等对焊接质量要求极高的领域。

在激光焊接过程中，焊接熔深是衡量焊接质量的关键参数。熔深过浅会导致焊接强度不足，熔深过深则可能造成焊穿等缺陷。因此，实时监测焊接熔深对于保证焊接质量至关重要。

【OCT检测技术】
光学相干断层扫描（Optical Coherence Tomography，简称OCT）是一种基于低相干干涉原理的高分辨率成像技术。OCT技术最早应用于医学眼科成像，近年来被引入到工业检测领域。

OCT在激光焊接检测中的优势包括：
1. 非接触式测量，不会干扰焊接过程
2. 微米级的轴向分辨率，可以精确测量熔深
3. 成像速度快，可以实现实时在线检测

【右侧图像说明】
右边展示的是焊接OCT图像的示例。图(a)是原始OCT图像，可以看到图像中存在明显的散斑噪声，熔池区域（图中较亮的细长结构）与背景的边界比较模糊。图(b)是对应的人工标注掩码，白色区域代表熔深目标。

【核心需求】
我们的核心需求是开发一种能够从OCT图像中精确分割出熔池区域的深度学习方法，这将为激光焊接的实时质量监测和闭环控制提供技术支撑。

【过渡】
然而，要实现这一目标，我们面临着一些具体的技术挑战，下面我来详细介绍。`);
    
    return slide;
}

/**
 * 添加问题与挑战页
 */
function addChallengesSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '问题与挑战');
    
    // 挑战卡片
    const challenges = [
        { num: '01', title: '散斑噪声干扰', desc: 'OCT成像原理导致大量散斑噪声，干扰目标识别与边界定位。传统滤波方法难以有效去噪。' },
        { num: '02', title: '边界模糊', desc: '熔池与基材过渡区域边界模糊，难以精确刻画细长结构。需要增强边界感知能力。' },
        { num: '03', title: '对比度不足', desc: '目标与背景灰度对比度较低，易导致欠分割或过分割。需要更强的特征判别能力。' }
    ];
    
    challenges.forEach((ch, i) => {
        const x = 0.4 + i * 3.15;
        addWhiteBox(slide, pptx, x, 1.0, 3, 1.9);
        
        // 顶部红色线条
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x: x, y: 1.0, w: 3, h: 0.04, 
            fill: { color: COLORS.RED } 
        });
        
        // 编号圆圈
        slide.addShape(pptx.shapes.OVAL, { 
            x: x + 1.15, y: 1.15, w: 0.7, h: 0.7, 
            fill: { color: COLORS.NAVY } 
        });
        slide.addText(ch.num, { 
            x: x + 1.15, y: 1.15, w: 0.7, h: 0.7, 
            align: 'center', valign: 'middle', 
            fontFace: 'Arial', fontSize: 18, bold: true, color: COLORS.WHITE 
        });
        
        slide.addText(ch.title, { 
            x: x + 0.1, y: 1.95, w: 2.8, h: 0.3, 
            align: 'center', fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY 
        });
        slide.addText(ch.desc, { 
            x: x + 0.1, y: 2.3, w: 2.8, h: 0.55, 
            align: 'center', fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    // 底部 - 现有方法局限性与解决思路
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 3.1, w: 9.2, h: 1.3, 
        fill: { color: COLORS.SLATE } 
    });
    slide.addText('现有方法局限性与解决思路', { 
        x: 0.6, y: 3.2, w: 8.8, h: 0.28, 
        fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.WHITE 
    });
    slide.addText('传统基于卷积的分割模型受限于局部感受野，难以同时满足全局语义理解与边界精确刻画的需求。', { 
        x: 0.6, y: 3.52, w: 8.8, h: 0.35, 
        fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
    });
    slide.addText('解决思路：引入注意力机制，增强全局上下文建模（TR模块）与局部细节表征能力（SAE模块）。', { 
        x: 0.6, y: 3.9, w: 8.8, h: 0.35, 
        fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.GREEN 
    });
    
    // 演讲稿
    slide.addNotes(`【问题与挑战】

OCT图像的语义分割面临三个主要挑战：

【挑战一：散斑噪声干扰】
散斑噪声是OCT成像原理固有的问题。OCT利用低相干光的干涉原理成像，当光波在散射介质中传播时，会产生随机的干涉斑点，形成所谓的散斑噪声。

散斑噪声的特点是：
- 呈颗粒状分布，与有用信号混杂
- 传统的线性滤波难以有效去除（因为会同时模糊边缘）
- 信噪比较低，影响特征提取的准确性

【挑战二：边界模糊】
熔池区域与基材之间的过渡区域边界往往比较模糊，没有清晰的分界线。此外，熔深区域通常呈现细长的结构特点，纵横比可能达到1:10甚至更高。

这种细长结构给分割带来的困难是：
- 需要模型具有较大的感受野来理解整体结构
- 边界像素数量较多，对边界分割精度要求高
- 容易出现断裂或过度平滑的问题

【挑战三：对比度不足】
OCT图像中目标区域与背景区域的灰度对比度较低，这是因为：
- 熔池金属与周围材料的光学特性差异不大
- 成像过程中的衰减导致深层信号较弱

低对比度容易导致模型的欠分割（漏检）或过分割（误检）。

【现有方法的局限性】
传统的基于卷积神经网络的分割模型，如U-Net、DeepLabV3+等，受限于卷积操作的局部性，感受野范围有限。这导致：
- 难以建立长距离依赖关系，无法有效理解细长结构的整体语义
- 边界区域缺乏精确的空间位置信息

【本文的解决思路】
针对这些问题，本文提出引入双重注意力机制：
- TR模块：基于Transformer的全局注意力，增强长程依赖建模
- SAE模块：空间感知增强，改善边界分割质量

【过渡】
下面我来介绍本研究的具体意义和目标。`);
    
    return slide;
}

/**
 * 添加研究意义与目标页
 */
function addSignificanceSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '研究意义与目标');
    
    // 意义卡片
    const significances = [
        { num: '1', title: '理论意义', desc: '探索全局与局部注意力机制在语义分割中的协同作用，为编码器-解码器架构的改进提供新思路。' },
        { num: '2', title: '技术价值', desc: '提出TR模块与SAE模块的双重注意力增强策略，在可控计算开销下提升分割精度与边界质量。' },
        { num: '3', title: '应用前景', desc: '为激光焊接、医学影像等领域的OCT图像分析提供高精度分割解决方案，推动智能制造发展。' }
    ];
    
    significances.forEach((sig, i) => {
        const y = 1.1 + i * 1.1;
        
        // 编号方块
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
            x: 0.4, y: y, w: 0.45, h: 0.45, 
            fill: { color: COLORS.NAVY } 
        });
        slide.addText(sig.num, { 
            x: 0.4, y: y, w: 0.45, h: 0.45, 
            align: 'center', valign: 'middle', 
            fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE 
        });
        
        slide.addText(sig.title, { 
            x: 1, y: y, w: 4.5, h: 0.35, 
            fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.NAVY 
        });
        slide.addText(sig.desc, { 
            x: 1, y: y + 0.35, w: 4.5, h: 0.7, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    // 右侧 - 研究目标框
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 5.8, y: 1.1, w: 3.8, h: 3.3, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText('研究目标', { 
        x: 6, y: 1.3, w: 3.4, h: 0.4, 
        fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE 
    });
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 6, y: 1.7, w: 3.4, h: 0.02, 
        fill: { color: COLORS.SILVER } 
    });
    
    const goals = [
        '1. 设计TR模块增强全局上下文建模能力',
        '2. 设计SAE模块改善边界分割质量',
        '3. 实现mIoU指标显著提升',
        '4. 保持推理效率满足实时需求'
    ];
    goals.forEach((g, i) => {
        slide.addText(g, { 
            x: 6, y: 1.9 + i * 0.55, w: 3.4, h: 0.5, 
            fontFace: 'Arial', fontSize: 10, color: COLORS.WHITE 
        });
    });
    
    // 演讲稿
    slide.addNotes(`【研究意义与目标】

【理论意义】
从理论研究的角度，本文探索了全局注意力与局部注意力在语义分割任务中的协同作用机制。

具体来说：
- 研究了Transformer注意力机制在编码器端增强全局语义理解的作用
- 探索了坐标注意力和通道注意力在解码器端增强边界感知的方法
- 分析了两种注意力机制的互补特性和协同效应

这些研究为编码器-解码器架构的改进提供了新的思路，具有一定的理论参考价值。

【技术价值】
从技术创新的角度，本文提出了两个核心模块：

TR模块（Transformer Routing）：
- 借鉴BiFormer的双层路由注意力思想
- 通过区域级路由和TopK稀疏选择降低计算复杂度
- 在可控的计算开销下实现全局上下文建模

SAE模块（Spatial-Aware Enhancement）：
- 结合坐标注意力编码空间位置信息
- 结合通道注意力突出判别性特征
- 显著改善边界分割质量

【应用前景】
本研究的成果具有广泛的应用前景：

1. 在激光焊接领域：可以实现焊接熔深的实时在线检测，支持焊接质量的闭环控制
2. 在医学影像领域：OCT技术广泛用于眼科成像，本文方法可以推广到视网膜层分割等任务
3. 在工业检测领域：裂缝检测、缺陷检测等任务也可以借鉴本文的方法

【研究目标】
基于以上分析，本文设定了四个具体的研究目标：
1. 设计TR模块，增强模型对全局上下文的建模能力
2. 设计SAE模块，改善模型对目标边界的分割质量
3. 在自建数据集上实现mIoU指标的显著提升
4. 保持合理的推理效率，满足潜在的实时应用需求

【过渡】
在开始介绍具体的技术方案之前，我先简要介绍一下本研究涉及的相关技术基础。`);
    
    return slide;
}

/**
 * 构建第一章所有幻灯片
 */
function build(pptx) {
    // 章节入口页
    addChapterEntry(pptx, CHAPTER.num, CHAPTER.title, [
        '激光焊接与OCT检测技术背景',
        '现有方法的问题与挑战',
        '本文研究意义与目标'
    ], `【第一章：研究背景与意义】

这一章我将从三个方面展开介绍：

首先是研究背景。我会介绍激光焊接技术的重要性、OCT检测技术的基本原理和优势，以及为什么需要用语义分割方法来处理OCT图像。

然后是问题与挑战。OCT图像存在散斑噪声、边界模糊、对比度低等特点，给精确分割带来了很大的困难。现有的分割方法在处理这些问题时存在局限性。

最后是研究意义与目标。我会说明本研究在理论、技术和应用三个层面的意义，并给出本文的具体研究目标。

【过渡】
下面先来看研究背景。`);
    
    // 内容页
    addBackgroundSlide(pptx);
    addChallengesSlide(pptx);
    addSignificanceSlide(pptx);
}

module.exports = {
    build,
    addBackgroundSlide,
    addChallengesSlide,
    addSignificanceSlide,
};
