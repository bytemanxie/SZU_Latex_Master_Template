const pptxgen = require('pptxgenjs');
const path = require('path');
const html2pptx = require(path.resolve(__dirname, '../../.claude/skills/pptx/scripts/html2pptx.js'));

async function main() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  await html2pptx(path.resolve(__dirname, 'sae_module_diagram.html'), pptx);

  const outPath = path.resolve(__dirname, 'fig4-5_sae_module.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log('Created:', outPath);
}

main().catch(err => { console.error(err); process.exit(1); });
