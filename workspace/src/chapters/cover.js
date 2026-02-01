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
