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
    
    // 演讲稿
    slide.addNotes(`【创新点总结】

这一页总结本文的三个主要创新点。

【创新点一：TR模块——全局上下文增强】

核心思想：
- 借鉴BiFormer的双层路由注意力
- 在ASPP之后引入全局注意力机制

技术特点：
- 区域级路由：将特征图划分为窗口，计算窗口间相似度
- Top-K稀疏选择：每个窗口只与K个最相关的邻居交互
- 双层计算：先粗粒度路由，再细粒度注意力

贡献：
- mIoU提升3.9%（从0.851到0.884）
- 计算量相比标准Transformer减少约75%
- 有效解决了细长结构分割时的断裂问题

【创新点二：SAE模块——局部细节增强】

核心思想：
- 结合坐标注意力和通道注意力
- 在解码器端增强边界分割能力

技术特点：
- 坐标注意力：沿H和W方向编码位置信息
- 通道注意力：基于SE模块突出判别性通道
- 空间-通道双重增强

贡献：
- mIoU提升5.9%（从0.851到0.901）
- HD95降低12.6%（从12.22到10.68）
- 显著改善了边界分割精度

【创新点三：双重注意力协同机制】

核心思想：
- TR负责全局语义建模
- SAE负责局部细节增强
- 两者协同工作，互为补充

设计考量：
- TR放在编码端（低分辨率，适合全局建模）
- SAE放在解码端（高分辨率，需要位置信息）

贡献：
- 组合后mIoU提升7.1%（从0.851到0.911）
- 目标IoU提升16.3%（从0.710到0.826）
- 产生了超越单模块使用的协同效应

【总结】

这三个创新点形成了一个完整的改进方案：
- 问题分析 → 模块设计 → 实验验证
- 全局 + 局部 → 协同增强
- 在多个指标上取得了显著提升

【过渡】
下面介绍本研究的不足与未来工作展望。`);
    
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
    
    // 演讲稿
    slide.addNotes(`【工作展望】

这一页客观分析本研究的不足，并提出未来工作的方向。

【现有不足】

本研究存在以下局限性：

1. 参数量较大（420MB）
   - TR模块引入了Transformer结构，增加了参数
   - SAE模块虽然轻量，但总体参数量仍较大
   - 在资源受限的边缘设备上部署困难

2. 数据集规模有限
   - 自建数据集仅228张原始图像
   - 虽然通过增强扩充到1140张
   - 但与大规模数据集相比仍然较小
   - 可能影响模型的泛化能力

3. 仅针对二分类任务
   - 本文只考虑背景/熔深两类
   - 实际应用中可能需要多类别分割
   - 例如：不同类型的焊接缺陷

【未来工作方向】

方向一：模型轻量化
- 知识蒸馏：用大模型指导小模型学习
- 模型剪枝：去除冗余参数
- 量化：将浮点数转为低精度整数
- 目标：在保持性能的同时减少模型大小和计算量

方向二：数据集扩展
- 收集更多样化的焊接OCT图像
- 涵盖不同焊接参数、材料、条件
- 考虑引入半监督或自监督学习
- 减少对标注数据的依赖

方向三：多任务学习
- 语义分割 + 缺陷检测联合建模
- 分割 + 熔深值预测
- 共享特征提取，任务间互补
- 提高模型的实用价值

方向四：应用拓展
- 医学OCT图像：视网膜层分割、病变检测
- 工业检测：裂缝检测、表面缺陷检测
- 其他成像模态：超声图像、X射线图像
- 验证方法的通用性

【结语】

虽然存在一些不足，但本研究的核心方法——双重注意力机制——具有良好的通用性和扩展性。我相信通过后续的研究工作，这些不足可以逐步改善。

以上就是我的全部汇报内容，感谢各位老师的耐心聆听。`);
    
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
    ], `【第五章：总结与展望】

最后一章，我将对全文进行总结，并展望未来的工作方向。

主要包括两个部分：

第一部分是创新点总结，归纳本文的三个主要贡献：
- TR模块：全局上下文增强
- SAE模块：局部细节增强
- 双重注意力协同机制

第二部分是工作展望，客观分析研究的不足，并提出改进方向：
- 模型轻量化
- 数据集扩展
- 多任务学习
- 应用拓展

【过渡】
首先来看创新点总结。`);
    
    // 内容页
    addInnovationsSlide(pptx);
    addOutlookSlide(pptx);
}

module.exports = {
    build,
    addInnovationsSlide,
    addOutlookSlide,
};
