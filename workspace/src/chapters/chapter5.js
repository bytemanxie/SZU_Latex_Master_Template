/**
 * 第五章：总结与展望
 */

const { COLORS, STYLES, CHAPTERS } = require('../config');
const { addChapterEntry, createContentSlide, addWhiteBox } = require('../templates');

const CHAPTER = CHAPTERS[5];
const LABEL = `${CHAPTER.num} ${CHAPTER.title}`;

/**
 * 添加创新点总结页
 */
function addInnovationsSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '创新点总结');
    
    const innovations = [
        { 
            num: '1', 
            title: 'TR模块：全局上下文增强', 
            desc: '提出基于双层路由注意力的TR模块，通过Top-K稀疏选择策略在可控计算开销下增强长程依赖建模能力，有效提升对目标整体结构与上下文关系的表征。', 
            result: '贡献：mIoU提升3.9%，计算量减少75%' 
        },
        { 
            num: '2', 
            title: 'SAE模块：局部细节增强', 
            desc: '设计结合坐标注意力与通道注意力的SAE模块，通过编码空间位置信息和强化判别性通道响应，显著改善细长结构与模糊边界处的分割质量。', 
            result: '贡献：mIoU提升5.9%，HD95降低12.6%' 
        },
        { 
            num: '3', 
            title: '双重注意力协同机制', 
            desc: 'TR模块负责全局语义建模，SAE模块负责局部细节增强，两者在编码器-解码器框架内协同工作，产生超越单模块使用的协同效应。', 
            result: '贡献：组合提升7.1%，目标IoU提升16.3%' 
        }
    ];
    
    innovations.forEach((inn, i) => {
        const y = 1 + i * 1.35;
        addWhiteBox(slide, pptx, 0.4, y, 9.2, 1.25);
        
        // 编号圆圈
        slide.addShape(pptx.shapes.OVAL, { 
            x: 0.55, y: y + 0.35, w: 0.5, h: 0.5, 
            fill: { color: COLORS.RED } 
        });
        slide.addText(inn.num, { 
            x: 0.55, y: y + 0.35, w: 0.5, h: 0.5, 
            align: 'center', valign: 'middle', 
            fontFace: 'Arial', fontSize: 18, bold: true, color: COLORS.WHITE 
        });
        
        slide.addText(inn.title, { 
            x: 1.2, y: y + 0.1, w: 8.2, h: 0.35, 
            fontFace: 'Arial', fontSize: 13, bold: true, color: COLORS.NAVY 
        });
        slide.addText(inn.desc, { 
            x: 1.2, y: y + 0.45, w: 8.2, h: 0.45, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
        slide.addText(inn.result, { 
            x: 1.2, y: y + 0.9, w: 8.2, h: 0.25, 
            fontFace: 'Arial', fontSize: 9, bold: true, color: COLORS.GREEN 
        });
    });
    
    return slide;
}

/**
 * 添加工作展望页
 */
function addOutlookSlide(pptx) {
    const slide = createContentSlide(pptx, LABEL, '工作展望');
    
    // 现有不足
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { 
        x: 0.4, y: 1, w: 4.6, h: 1.4, 
        fill: { color: COLORS.SLATE } 
    });
    slide.addText('现有不足', { 
        x: 0.6, y: 1.1, w: 4.2, h: 0.35, 
        fontFace: 'Arial', fontSize: 12, bold: true, color: COLORS.WHITE 
    });
    
    const limitations = [
        '1. 参数量较大（420MB），部署成本较高',
        '2. 数据集规模有限，泛化能力待验证',
        '3. 仅针对二分类任务，多类别扩展待研究'
    ];
    limitations.forEach((l, i) => {
        slide.addText(l, { 
            x: 0.6, y: 1.5 + i * 0.28, w: 4.2, h: 0.26, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.WHITE 
        });
    });
    
    // 未来工作
    const futures = [
        { title: '模型轻量化', desc: '探索知识蒸馏、模型剪枝、量化等技术，在保持性能的同时降低模型复杂度。' },
        { title: '数据集扩展', desc: '收集更多不同焊接条件下的OCT图像，构建更大规模、更多样化的数据集。' },
        { title: '多任务学习', desc: '将语义分割与焊接缺陷检测、熔深预测等任务联合建模。' },
        { title: '应用拓展', desc: '将方法推广至医学OCT图像分析、裂缝检测等领域。' }
    ];
    
    futures.forEach((f, i) => {
        const col = i < 2 ? 0 : 1;
        const row = i % 2;
        const x = col === 0 ? 0.4 : 5.2;
        const y = col === 0 ? 2.6 + row * 1.05 : 1 + row * 1.05;
        
        addWhiteBox(slide, pptx, x, y, 4.6, 0.95);
        slide.addShape(pptx.shapes.RECTANGLE, { 
            x, y, w: 0.04, h: 0.95, 
            fill: { color: COLORS.NAVY } 
        });
        slide.addText(f.title, { 
            x: x + 0.15, y: y + 0.1, w: 4.3, h: 0.3, 
            fontFace: 'Arial', fontSize: 11, bold: true, color: COLORS.NAVY 
        });
        slide.addText(f.desc, { 
            x: x + 0.15, y: y + 0.4, w: 4.3, h: 0.5, 
            fontFace: 'Arial', fontSize: 9, color: COLORS.SLATE 
        });
    });
    
    return slide;
}

/**
 * 构建第五章所有幻灯片
 */
function build(pptx) {
    // 章节入口页
    addChapterEntry(pptx, CHAPTER.num, CHAPTER.title, [
        '研究工作总结',
        '创新点归纳',
        '未来工作展望'
    ]);
    
    // 内容页
    addInnovationsSlide(pptx);
    addOutlookSlide(pptx);
}

module.exports = {
    build,
    addInnovationsSlide,
    addOutlookSlide,
};
