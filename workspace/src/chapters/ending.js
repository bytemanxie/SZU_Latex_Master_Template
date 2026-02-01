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
    slide.addText(`答辩人：${METADATA.author}  |  导师：${METADATA.advisor} 老师`, { 
        x: 2.8, y: 3.6, w: 4.4, h: 0.6, 
        align: 'center', valign: 'middle', 
        fontFace: 'Arial', fontSize: 12, color: COLORS.WHITE 
    });
    
    return slide;
}

/**
 * 构建结束页面
 */
function build(pptx) {
    addThanksSlide(pptx);
    addQASlide(pptx);
}

module.exports = {
    build,
    addThanksSlide,
    addQASlide,
};
