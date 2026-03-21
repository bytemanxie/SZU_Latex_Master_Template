const pptxgen = require('pptxgenjs');
const path = require('path');
const html2pptx = require('/Users/xiezhijie/Documents/SZU_Latex_Master_Template/.claude/skills/pptx/scripts/html2pptx.js');

async function main() {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    pptx.title = 'TR模块结构图（水平）';

    const htmlFile = path.join(__dirname, 'slide_horizontal.html');
    await html2pptx(htmlFile, pptx);

    const outputPath = path.join(__dirname, 'fig3-3_tr_module_horizontal.pptx');
    await pptx.writeFile({ fileName: outputPath });
    console.log('已保存:', outputPath);
}

main().catch(console.error);
