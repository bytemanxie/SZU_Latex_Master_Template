/**
 * PPT 配置文件
 * 包含配色方案、字体样式等公共配置
 */

// 配色方案
const COLORS = {
    NAVY: '1C2833',      // 深蓝色 - 主色调
    SLATE: '2E4053',     // 石板灰 - 次要色
    SILVER: 'AAB7B8',    // 银色 - 装饰色
    OFFWHITE: 'F4F6F6',  // 米白色 - 背景色
    RED: 'E74C3C',       // 红色 - 强调色
    GREEN: '27AE60',     // 绿色 - 成功/提升
    WHITE: 'FFFFFF',     // 白色
};

// 字体样式
const STYLES = {
    title: { fontFace: 'Arial', fontSize: 24, bold: true, color: COLORS.NAVY },
    subtitle: { fontFace: 'Arial', fontSize: 14, color: COLORS.SLATE },
    body: { fontFace: 'Arial', fontSize: 11, color: COLORS.SLATE },
    small: { fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE },
    caption: { fontFace: 'Arial', fontSize: 8, color: COLORS.SLATE },
};

// PPT 元数据
const METADATA = {
    author: '谢智捷',
    title: '基于改进DeepLabV3+的OCT图像语义分割方法',
    subject: '硕士学位论文答辩',
    company: '深圳大学',
    date: '2026年2月',
    advisor: '万明明',
};

// 章节配置
const CHAPTERS = {
    1: { num: '01', title: '研究背景与意义' },
    2: { num: '02', title: '相关技术基础' },
    3: { num: '03', title: '基于全局注意力的模型改进' },  // TR模块
    4: { num: '04', title: '基于空间感知增强的模型优化' }, // SAE模块
    5: { num: '05', title: '总结与展望' },
};

// 目录项
const TOC_ITEMS = [
    { num: '1', text: '研究背景与意义' },
    { num: '2', text: '相关技术基础' },
    { num: '3', text: '基于全局注意力的模型改进（TR模块）' },
    { num: '4', text: '基于空间感知增强的模型优化（SAE模块）' },
    { num: '5', text: '总结与展望' },
];

// 图片路径配置（相对于 workspace/ 目录，即运行 node src/index.js 时的 cwd）
const FIGURE_PATHS = {
    base: '../figure',
    cp2: '../figure/cp2',
    cp3: '../figure/cp3',
    cp4: '../figure/cp4',
};

module.exports = {
    COLORS,
    STYLES,
    METADATA,
    CHAPTERS,
    TOC_ITEMS,
    FIGURE_PATHS,
};
