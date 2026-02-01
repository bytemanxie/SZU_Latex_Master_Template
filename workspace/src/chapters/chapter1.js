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
    ]);
    
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
