const path = require('path');
const { chromium } = require('playwright');

const workspace = path.resolve(__dirname, '..');
const htmlPath = path.join(workspace, '答辩PPT_归藏瑞士风.html');
const qaDir = path.join(workspace, 'qa_guizang');
const fs = require('fs');

fs.mkdirSync(qaDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  const targets = [1, 5, 9, 14, 16];
  for (const i of targets) {
    await page.goto(`file://${htmlPath}?slide=${i}`);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(qaDir, `slide-${String(i).padStart(2, '0')}.png`), fullPage: false });
  }

  await browser.close();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`Screenshots written to ${qaDir}`);
})();
