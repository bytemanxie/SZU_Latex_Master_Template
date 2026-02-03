/**
 * PPT 通用模板函数
 * 提供章节页、内容页等可复用的模板
 */

const { COLORS, STYLES } = require('./config');

/**
 * 添加章节入口页
 * @param {Object} pptx - pptxgen 实例
 * @param {string} num - 章节编号，如 '01'
 * @param {string} title - 章节标题
 * @param {Array} highlights - 本章要点列表
 * @param {string} notes - 可选的演讲稿
 */
function addChapterEntry(pptx, num, title, highlights = [], notes = '') {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.NAVY };
    
    // 顶部和底部装饰线
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0, y: 0, w: '100%', h: 0.08, 
        fill: { color: COLORS.SILVER } 
    });
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0, y: 5.55, w: '100%', h: 0.08, 
        fill: { color: COLORS.SILVER } 
    });
    
    // 大章节编号
    slide.addText(num, { 
        x: 0.5, y: 1.2, w: 2, h: 1.5, 
        fontFace: 'Arial', fontSize: 80, bold: true, color: COLORS.SLATE 
    });
    
    // 章节标题
    slide.addText(title, { 
        x: 2.5, y: 1.6, w: 7, h: 0.8, 
        fontFace: 'Arial', fontSize: 32, bold: true, color: COLORS.WHITE 
    });
    
    // 标题下装饰线
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 2.5, y: 2.5, w: 3, h: 0.04, 
        fill: { color: COLORS.RED } 
    });
    
    // 要点列表
    if (highlights && highlights.length > 0) {
        highlights.forEach((h, i) => {
            slide.addText('• ' + h, { 
                x: 2.5, y: 2.8 + i * 0.4, w: 6.5, h: 0.35, 
                fontFace: 'Arial', fontSize: 14, color: COLORS.SILVER 
            });
        });
    }
    
    // 添加演讲稿
    if (notes) {
        slide.addNotes(notes);
    }
    
    return slide;
}

/**
 * 创建标准内容页
 * @param {Object} pptx - pptxgen 实例
 * @param {string} chapterLabel - 章节标签，如 '01 研究背景与意义'
 * @param {string} pageTitle - 页面标题
 */
function createContentSlide(pptx, chapterLabel, pageTitle) {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.OFFWHITE };
    
    // 左侧装饰条
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x: 0, y: 0, w: 0.1, h: '100%', 
        fill: { color: COLORS.NAVY } 
    });
    
    // 章节标签
    slide.addText(chapterLabel, { 
        x: 0.4, y: 0.2, w: 5, h: 0.3, 
        fontFace: 'Arial', fontSize: 11, color: COLORS.SILVER 
    });
    
    // 页面标题
    slide.addText(pageTitle, { 
        x: 0.4, y: 0.5, w: 9, h: 0.5, 
        ...STYLES.title 
    });
    
    return slide;
}

/**
 * 添加卡片组件
 * @param {Object} slide - 幻灯片对象
 * @param {Object} pptx - pptxgen 实例
 * @param {Object} options - 卡片配置
 */
function addCard(slide, pptx, options) {
    const { x, y, w, h, title, desc, accentColor = COLORS.RED } = options;
    
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x, y, w, h, 
        fill: { color: COLORS.WHITE }, 
        shadow: { type: 'outer', blur: 2, offset: 1, angle: 45, opacity: 0.15 } 
    });
    
    // 左侧强调线
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x, y, w: 0.04, h, 
        fill: { color: accentColor } 
    });
    
    if (title) {
        slide.addText(title, { 
            x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.28, 
            fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
        });
    }
    
    if (desc) {
        slide.addText(desc, { 
            x: x + 0.15, y: y + 0.38, w: w - 0.3, h: h - 0.5, 
            fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE 
        });
    }
}

/**
 * 添加数字圆形徽章
 */
function addNumberBadge(slide, pptx, x, y, num, size = 0.5) {
    slide.addShape(pptx.shapes.OVAL, { 
        x, y, w: size, h: size, 
        fill: { color: COLORS.NAVY } 
    });
    slide.addText(num, { 
        x, y, w: size, h: size, 
        align: 'center', valign: 'middle', 
        fontFace: 'Arial', fontSize: 14, bold: true, color: COLORS.WHITE 
    });
}

/**
 * 添加底部信息框
 */
function addBottomBox(slide, pptx, options) {
    const { x = 0.4, y = 3.6, w = 9.2, h = 0.8, title, content, bgColor = COLORS.NAVY } = options;
    
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x, y, w, h, 
        fill: { color: bgColor } 
    });
    
    if (title) {
        slide.addText(title, { 
            x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.25, 
            fontFace: 'Arial', fontSize: 10, bold: true, color: COLORS.WHITE 
        });
    }
    
    if (content) {
        slide.addText(content, { 
            x: x + 0.2, y: y + 0.38, w: w - 0.4, h: h - 0.5, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
        });
    }
}

/**
 * 添加占位符框（用于待补充的图片）
 */
function addPlaceholder(slide, pptx, x, y, w, h, text) {
    slide.addShape(pptx.shapes.RECTANGLE, { 
        x, y, w, h, 
        fill: { color: 'E0E0E0' }, 
        line: { color: 'AAAAAA', dashType: 'dash' } 
    });
    slide.addText(text, { 
        x, y, w, h, 
        align: 'center', valign: 'middle', 
        fontFace: 'Arial', fontSize: 9, color: '666666' 
    });
}

/**
 * 添加白色内容框
 */
function addWhiteBox(slide, pptx, x, y, w, h) {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x, y, w, h, 
        fill: { color: COLORS.WHITE }, 
        shadow: { type: 'outer', blur: 2, offset: 1, angle: 45, opacity: 0.15 } 
    });
}

/**
 * 添加指标卡片（用于展示性能数据）
 */
function addMetricCard(slide, pptx, x, y, w, h, options) {
    const { value, label, sublabel } = options;
    
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x, y, w, h, 
        fill: { color: COLORS.NAVY } 
    });
    
    slide.addText(value, { 
        x, y: y + 0.1, w, h: 0.5, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 24, bold: true, color: COLORS.GREEN 
    });
    
    slide.addText(label, { 
        x, y: y + 0.6, w, h: 0.25, 
        align: 'center', 
        fontFace: 'Arial', fontSize: 10, color: COLORS.SILVER 
    });
    
    if (sublabel) {
        slide.addText(sublabel, { 
            x, y: y + 0.85, w, h: 0.2, 
            align: 'center', 
            fontFace: 'Arial', fontSize: 8, color: COLORS.WHITE 
        });
    }
}

module.exports = {
    addChapterEntry,
    createContentSlide,
    addCard,
    addNumberBadge,
    addBottomBox,
    addPlaceholder,
    addWhiteBox,
    addMetricCard,
};
