/**
 * 致谢和Q&A页面
 */

const { COLORS, METADATA } = require('../config');

/**
 * 添加致谢页
 */
function addThanksSlide(pptx) {
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
    
    // 标题
    slide.addText('致 谢', { 
        x: 0, y: 1.5, w: '100%', h: 0.6, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 36, bold: true, color: COLORS.WHITE 
    });
    
    // 致谢内容框
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 2.5, y: 2.3, w: 5, h: 2.2, 
        fill: { color: COLORS.SLATE, transparency: 50 } 
    });
    
    slide.addText(`感谢导师${METADATA.advisor}教授的悉心指导`, { 
        x: 2.7, y: 2.5, w: 4.6, h: 0.4, 
        align: 'center', fontFace: 'Arial', fontSize: 14, color: COLORS.WHITE 
    });
    slide.addText('感谢实验室同学们的帮助与支持', { 
        x: 2.7, y: 2.95, w: 4.6, h: 0.4, 
        align: 'center', fontFace: 'Arial', fontSize: 14, color: COLORS.WHITE 
    });
    slide.addText('感谢答辩委员会各位老师的宝贵意见', { 
        x: 2.7, y: 3.4, w: 4.6, h: 0.4, 
        align: 'center', fontFace: 'Arial', fontSize: 14, color: COLORS.WHITE 
    });
    
    // 分隔线
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 4.25, y: 3.95, w: 1.5, h: 0.03, 
        fill: { color: COLORS.SILVER } 
    });
    
    // 学校信息
    slide.addText(`${METADATA.company} · 电子与信息工程学院`, { 
        x: 2.7, y: 4.1, w: 4.6, h: 0.3, 
        align: 'center', fontFace: 'Arial', fontSize: 12, color: COLORS.SILVER 
    });
    slide.addText(METADATA.date, { 
        x: 2.7, y: 4.4, w: 4.6, h: 0.3, 
        align: 'center', fontFace: 'Arial', fontSize: 12, color: COLORS.SILVER 
    });
    
    // 演讲稿
    slide.addNotes(`【致谢】

【致谢词】

首先，我要衷心感谢我的导师万明明教授。在三年的研究生学习期间，万老师在学术研究、论文写作和课题实施等方面给予了我悉心的指导。万老师严谨的治学态度、渊博的专业知识和敬业的精神深深影响着我，为我今后的学习和工作树立了榜样。

其次，感谢实验室的各位师兄师姐和同学们。在科研过程中，大家互相帮助、共同讨论，帮助我解决了很多技术难题。特别感谢提供焊接实验数据支持的团队成员。

同时，感谢深圳大学提供的良好科研环境和实验条件，让我能够顺利完成研究工作。

最后，感谢答辩委员会的各位老师，在百忙之中抽出时间参加我的论文答辩，并提出宝贵的意见和建议。各位老师的指导将帮助我进一步完善论文，也为我今后的研究指明了方向。

谢谢大家！`);
    
    return slide;
}

/**
 * 添加Q&A页
 */
function addQASlide(pptx) {
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
    
    // Q&A标题
    slide.addText('Q & A', { 
        x: 0, y: 2, w: '100%', h: 0.8, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 48, bold: true, color: COLORS.WHITE 
    });
    
    // 副标题
    slide.addText('请各位老师批评指正', { 
        x: 0, y: 2.9, w: '100%', h: 0.4, 
        align: 'center', fontFace: 'Arial', fontSize: 18, color: COLORS.SILVER 
    });
    
    // 答辩人信息
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 2.8, y: 3.6, w: 4.4, h: 0.6, 
        fill: { color: COLORS.SLATE, transparency: 50 } 
    });
    slide.addText(`答辩人：${METADATA.author}  |  导师：${METADATA.advisor}`, { 
        x: 2.8, y: 3.6, w: 4.4, h: 0.6, 
        align: 'center', valign: 'middle', 
        fontFace: 'Arial', fontSize: 12, color: COLORS.WHITE 
    });
    
    // 演讲稿
    slide.addNotes(`【Q&A 环节】

我的汇报到此结束，感谢各位老师的耐心聆听。

【准备回答的问题】

以下是可能被问到的问题及回答要点：

1. 为什么选择DeepLabV3+作为基线模型？
   - DeepLabV3+是当前最先进的语义分割模型之一
   - ASPP模块和编码器-解码器结构适合改进
   - 有成熟的开源实现，便于复现

2. TR模块的计算开销如何？
   - 通过TopK稀疏选择，计算量减少约75%
   - 在RTX 4090上，增加约15%的推理时间
   - 性能提升3.9%，是值得的trade-off

3. 为什么SAE模块的贡献比TR模块大？
   - OCT图像的主要难点是边界模糊
   - SAE模块专门针对边界分割设计
   - 坐标注意力有效编码了位置信息

4. 数据集规模较小，如何保证泛化能力？
   - 使用了5倍数据增强
   - 采用交叉验证评估
   - 在测试集上的性能稳定
   - 未来计划扩展数据集

5. 如何进行模型轻量化？
   - 知识蒸馏：用大模型指导小模型
   - 模型剪枝：去除冗余参数
   - 量化：降低精度
   - 是未来工作的重点方向

【结束语】

请各位老师批评指正，我会认真听取意见，进一步完善论文。

谢谢！`);
    
    return slide;
}

/**
 * 构建结束页面
 */
function build(pptx) {
    addQASlide(pptx);
}

module.exports = {
    build,
    addThanksSlide,
    addQASlide,
};
