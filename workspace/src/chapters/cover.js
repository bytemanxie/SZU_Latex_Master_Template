/**
 * 封面和目录模块
 */

const { COLORS, METADATA, TOC_ITEMS } = require('../config');

/**
 * 添加封面页
 */
function addCoverSlide(pptx) {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.NAVY };
    
    // 顶部和底部装饰线
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0, y: 0, w: '100%', h: 0.1, 
        fill: { color: COLORS.SILVER } 
    });
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0, y: 5.53, w: '100%', h: 0.1, 
        fill: { color: COLORS.SILVER } 
    });
    
    // 学校名称
    slide.addText('深 圳 大 学 硕 士 学 位 论 文 答 辩', { 
        x: 0, y: 1.5, w: '100%', h: 0.5, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 18, color: COLORS.SILVER 
    });
    
    // 论文标题
    slide.addText(METADATA.title, { 
        x: 0.5, y: 2.2, w: 9, h: 1, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 28, bold: true, color: COLORS.WHITE 
    });
    
    // 副标题
    slide.addText(METADATA.subject, { 
        x: 0, y: 3.3, w: '100%', h: 0.4, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 14, color: COLORS.SILVER 
    });
    
    // 答辩人信息
    slide.addText(`答辩人：${METADATA.author}        导师：${METADATA.advisor}`, { 
        x: 0, y: 3.9, w: '100%', h: 0.4, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 14, color: COLORS.WHITE 
    });
    
    // 日期
    slide.addText(METADATA.date, { 
        x: 0, y: 4.5, w: '100%', h: 0.4, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 12, color: COLORS.SILVER 
    });
    
    // 演讲稿
    slide.addNotes(`【开场白】
尊敬的各位老师，下午好！我是来自电子与信息工程学院的硕士研究生谢智捷，我的导师是万明明教授。非常感谢各位老师在百忙之中参加我的学位论文答辩。

【论文题目介绍】
我的论文题目是《基于改进DeepLabV3+的OCT图像语义分割方法》。

【研究背景简述】
激光焊接是现代精密制造中的关键工艺，而焊接质量的实时检测一直是工业界关注的难题。光学相干断层扫描（OCT）技术能够实时获取焊接熔池的深度信息，为焊接质量在线监测提供了可能。然而，OCT图像存在散斑噪声严重、目标边界模糊等挑战，传统分割方法难以满足精度要求。

【本文工作概述】
本文针对这些问题，在经典的DeepLabV3+语义分割模型基础上，提出了两个创新模块：TR模块用于增强全局上下文建模能力，SAE模块用于改善边界分割质量。实验结果表明，改进后的模型在自建焊接OCT数据集上取得了显著的性能提升。

【过渡】
下面，我将按照目录的顺序，向各位老师详细汇报我的研究工作。`);
    
    return slide;
}

/**
 * 添加目录页
 */
function addTocSlide(pptx) {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.OFFWHITE };
    
    // 左侧装饰条
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0, y: 0, w: 0.1, h: '100%', 
        fill: { color: COLORS.NAVY } 
    });
    
    // 标题
    slide.addText('目 录', { 
        x: 0.5, y: 0.3, w: 9, h: 0.6, 
        fontFace: 'Arial', fontSize: 24, bold: true, color: COLORS.NAVY 
    });
    
    // 标题下划线
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0.5, y: 0.85, w: 2, h: 0.04, 
        fill: { color: COLORS.SILVER } 
    });
    
    // 目录项
    TOC_ITEMS.forEach((item, i) => {
        const y = 1.2 + i * 0.8;
        
        // 编号圆圈
        slide.addShape(pptx.shapes.OVAL, { 
            x: 0.6, y: y, w: 0.5, h: 0.5, 
            fill: { color: COLORS.NAVY } 
        });
        slide.addText(item.num, { 
            x: 0.6, y: y, w: 0.5, h: 0.5, 
            align: 'center', valign: 'middle', 
            fontFace: 'Arial', fontSize: 16, bold: true, color: COLORS.WHITE 
        });
        
        // 目录文字
        slide.addText(item.text, { 
            x: 1.3, y: y + 0.1, w: 7, h: 0.4, 
            fontFace: 'Arial', fontSize: 18, color: COLORS.SLATE 
        });
    });
    
    // 演讲稿
    slide.addNotes(`【目录介绍】
我的汇报将分为五个部分：

【第一部分：研究背景与意义】
首先，我将介绍激光焊接OCT检测的技术背景、当前面临的主要挑战，以及本研究的意义和目标。

【第二部分：相关技术基础】
然后，介绍本研究涉及的关键技术，包括卷积神经网络基础、经典语义分割网络（如FCN、U-Net、DeepLabV3+）、数据集构建过程以及评估指标。

【第三部分：基于全局注意力的模型改进——TR模块】
这是本文的第一个核心创新。我将详细介绍为什么需要全局注意力机制，以及TR模块是如何借鉴BiFormer的双层路由注意力思想来增强全局上下文建模能力的。

【第四部分：基于空间感知增强的模型优化——SAE模块】
这是本文的第二个核心创新。我将介绍SAE模块如何结合坐标注意力和通道注意力来增强边界分割精度，以及TR和SAE两个模块的协同效应。

【第五部分：总结与展望】
最后，我将总结本文的主要贡献和创新点，并对未来工作进行展望。

【过渡】
下面，让我们首先进入第一部分——研究背景与意义。`);
    
    return slide;
}

/**
 * 构建封面和目录
 */
function build(pptx) {
    addCoverSlide(pptx);
    addTocSlide(pptx);
}

module.exports = {
    build,
    addCoverSlide,
    addTocSlide,
};
