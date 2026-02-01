/**
 * PPT 主入口文件
 * 
 * 按照论文结构组装各章节生成完整PPT：
 * - 封面和目录
 * - 第一章：研究背景与意义
 * - 第二章：相关技术基础
 * - 第三章：基于全局注意力的模型改进（TR模块）
 * - 第四章：基于空间感知增强的模型优化（SAE模块 + 综合实验）
 * - 第五章：总结与展望
 * - 致谢和Q&A
 */

const pptxgen = require('pptxgenjs');
const path = require('path');

// 导入配置
const { METADATA } = require('./config');

// 导入各章节模块
const cover = require('./chapters/cover');
const chapter1 = require('./chapters/chapter1');
const chapter2 = require('./chapters/chapter2');
const chapter3 = require('./chapters/chapter3');
const chapter4 = require('./chapters/chapter4');
const chapter5 = require('./chapters/chapter5');
const ending = require('./chapters/ending');

/**
 * 生成PPT
 */
function generatePPT() {
    console.log('开始生成PPT...\n');
    
    // 创建PPT实例
    const pptx = new pptxgen();
    
    // 设置PPT属性
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = METADATA.author;
    pptx.title = METADATA.title;
    pptx.subject = METADATA.subject;
    pptx.company = METADATA.company;
    
    // 按章节顺序构建幻灯片
    console.log('构建封面和目录...');
    cover.build(pptx);
    
    console.log('构建第一章：研究背景与意义...');
    chapter1.build(pptx);
    
    console.log('构建第二章：相关技术基础...');
    chapter2.build(pptx);
    
    console.log('构建第三章：基于全局注意力的模型改进（TR模块）...');
    chapter3.build(pptx);
    
    console.log('构建第四章：基于空间感知增强的模型优化（SAE模块）...');
    chapter4.build(pptx);
    
    console.log('构建第五章：总结与展望...');
    chapter5.build(pptx);
    
    console.log('构建致谢和Q&A...');
    ending.build(pptx);
    
    // 保存文件
    const outputPath = path.join(__dirname, '..', '答辩PPT_模块化版.pptx');
    
    pptx.writeFile({ fileName: outputPath })
        .then(() => {
            console.log('\n✓ PPT生成成功！');
            console.log(`  输出文件: ${outputPath}`);
            console.log('\n=== PPT结构概览 ===');
            console.log('封面 + 目录: 2页');
            console.log('第一章（研究背景）: 4页');
            console.log('第二章（技术基础）: 5页');
            console.log('第三章（TR模块）: 8页 ← 聚焦全局注意力改进');
            console.log('第四章（SAE模块）: 8页 ← 聚焦局部增强 + 综合实验');
            console.log('第五章（总结展望）: 3页');
            console.log('致谢 + Q&A: 2页');
            console.log('-------------------');
            console.log('总计: 约32页\n');
        })
        .catch(err => {
            console.error('生成PPT时出错:', err);
            process.exit(1);
        });
}

// 运行
generatePPT();
