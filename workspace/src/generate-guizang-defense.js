const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const workspace = path.resolve(__dirname, '..');
const templatePath = path.join(workspace, 'guizang_skill', 'template-swiss.html');
const outputPath = path.join(workspace, '答辩PPT_归藏瑞士风.html');

const total = 16;

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chrome(left, right) {
  return `
    <div class="chrome-min">
      <div class="l">${left}</div>
      <div class="r">${right}</div>
    </div>`;
}

function pageNum(n) {
  return `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

function card(num, title, body, accent = false) {
  const color = accent ? 'var(--accent)' : 'var(--text-primary)';
  const border = accent ? '2px solid var(--accent)' : '1px solid var(--border-subtle)';
  return `
    <div data-anim="card" style="border-top:${border};padding-top:2.1vh">
      <div style="font-family:var(--sans);font-weight:200;font-size:min(4vw,7vh);line-height:.9;color:${color};margin-bottom:1.6vh">${num}</div>
      <h3 style="font-weight:400;font-size:max(17px,1.55vw);line-height:1.22;margin-bottom:1vh;color:${color}">${title}</h3>
      <p style="font-weight:300;font-size:max(12px,.9vw);line-height:1.62;color:var(--text-secondary)">${body}</p>
    </div>`;
}

function kpi(value, label, note, accent = false) {
  return `
    <div data-anim="kpi" style="border-top:1px solid ${accent ? 'var(--accent)' : 'var(--border-subtle)'};padding-top:1.6vh">
      <div style="font-family:var(--mono);font-size:11px;letter-spacing:.18em;color:var(--text-helper);text-transform:uppercase;margin-bottom:1vh">${label}</div>
      <div style="font-family:var(--sans);font-weight:200;font-size:min(5.6vw,9.6vh);line-height:.9;color:${accent ? 'var(--accent)' : 'var(--text-primary)'};letter-spacing:-.035em">${value}</div>
      <div style="font-weight:300;font-size:max(12px,.9vw);line-height:1.5;color:var(--text-secondary);margin-top:1vh">${note}</div>
    </div>`;
}

function img(src, alt, fit = 'cover') {
  return `<img src="${src}" alt="${esc(alt)}" style="width:100%;height:100%;object-fit:${fit};object-position:center center;display:block">`;
}

const slides = `
<section class="slide accent" data-layout="S01" data-animate="hero">
  <div class="canvas-card">
    <canvas class="ascii-bg" aria-hidden="true"></canvas>
    ${chrome('SZU · MASTER DEFENSE', `${pageNum(1)} · LASER WELDING OCT`)}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:2.6vh">
      <div data-anim="kicker" class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em">CUDA RECONSTRUCTION · SEMANTIC SEGMENTATION</div>
      <h1 data-anim="title" style="align-self:start;font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:min(8.2vw,14.5vh);line-height:.98;letter-spacing:-.025em;color:#fff">激光焊接 OCT 图像<br/>重建与分割</h1>
      <div data-anim="bottom" style="display:grid;grid-template-rows:auto auto;gap:1.6vh;border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
        <div class="lead" style="max-width:62ch;color:rgba(255,255,255,.86);font-weight:300">基于 CUDA 加速后处理与改进 DeepLabV3+ 的匙孔区域语义分割方法研究</div>
        <div style="display:flex;justify-content:space-between;align-items:end">
          <div class="t-meta" style="color:rgba(255,255,255,.62)">谢智捷 · 深圳大学 · 指导教师：万明明</div>
          <div class="t-meta" style="color:rgba(255,255,255,.62)">硕士学位论文答辩</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="slide split" data-layout="S03" data-animate="split-statement">
  <div class="canvas-card">
    <div class="split-half">
      <div class="half b-ink" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        ${chrome('PROBLEM STATEMENT', pageNum(2))}
        <div data-anim="statement">
          <div class="t-meta" style="color:rgba(255,255,255,.62);letter-spacing:.22em;margin-bottom:2vh">ONE SENTENCE</div>
          <h2 style="font-weight:200;font-size:min(7.5vw,13vh);line-height:.96;letter-spacing:-.025em;color:#fff">在线熔深测量<br/>卡在两处</h2>
        </div>
        <div class="t-meta" style="color:rgba(255,255,255,.58)">NOISE · LATENCY · BOUNDARY</div>
      </div>
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        ${chrome('WHY IT MATTERS', '02 ISSUES')}
        <div data-anim="rules" style="display:flex;flex-direction:column;gap:0">
          ${card('01', '后处理计算量大', 'SD-OCT 从干涉谱到深度图像需要光谱整形、背景扣除、K 线性化、FFT、幅值提取等步骤，CPU 串行处理难以匹配 82 kHz A 扫采集速率。')}
          ${card('02', '匙孔区域难分割', '焊接 OCT 图像存在散斑噪声、对比度低、边界模糊和细长结构断裂，传统阈值或通用网络直接迁移稳定性不足。', true)}
        </div>
        <div class="t-meta" style="text-align:right;color:var(--text-helper)">→ 两条线：重建加速 + 分割精度</div>
      </div>
    </div>
  </div>
</section>

<section class="slide grey" data-layout="S11" data-animate="timeline">
  <div class="canvas-card">
    ${chrome('AGENDA', pageNum(3))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:5vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.3vh">
        <div class="t-meta">DEFENSE MAP</div>
        <h2 style="font-weight:200;font-size:min(5.8vw,10.2vh);line-height:.98;letter-spacing:-.025em">答辩结构</h2>
      </div>
      <div data-anim="timeline" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;align-items:stretch">
        ${['背景与问题','数据与技术基础','CUDA 加速重建','双注意力分割','总结与展望'].map((t, i) => `
          <div style="border-top:2px solid ${i === 2 || i === 3 ? 'var(--accent)' : 'var(--border-subtle)'};padding-top:2vh;display:flex;flex-direction:column;justify-content:space-between;min-height:34vh">
            <div style="font-family:var(--sans);font-weight:200;font-size:min(4.8vw,8.4vh);line-height:.9;color:${i === 2 || i === 3 ? 'var(--accent)' : 'var(--text-primary)'}">${String(i + 1).padStart(2, '0')}</div>
            <div style="font-size:max(17px,1.45vw);font-weight:400;line-height:1.25">${t}</div>
          </div>`).join('')}
      </div>
      <div class="t-meta" style="color:var(--text-helper)">从工业需求出发，落到可复现的算法设计与实验指标。</div>
    </div>
  </div>
</section>

<section class="slide" data-layout="S08" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome('BACKGROUND', pageNum(4))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">INDUSTRIAL MOTIVATION</div>
        <h2 style="font-weight:200;font-size:min(5.4vw,9.4vh);line-height:.98;letter-spacing:-.025em">为什么选择 OCT 监测焊接熔深</h2>
      </div>
      <div class="duo-compare" data-anim="compare" style="display:grid;grid-template-columns:1fr 1px 1fr;gap:2.6vw;align-items:stretch">
        <div style="display:flex;flex-direction:column;gap:2vh">
          <div class="t-cat">OFFLINE INSPECTION</div>
          <h3 style="font-size:max(24px,2.2vw);font-weight:300;line-height:1.18">金相切片、超声等焊后检测反馈滞后</h3>
          <p style="font-size:max(13px,1vw);line-height:1.65;color:var(--text-secondary);font-weight:300">熔深过浅导致接头强度不足，过深可能引发烧穿或变形。焊后检测破坏性强、效率低，无法满足规模化生产的实时质检和闭环控制。</p>
        </div>
        <div style="background:var(--border-subtle)"></div>
        <div style="display:flex;flex-direction:column;gap:2vh">
          <div class="t-cat" style="color:var(--accent)">OCT ONLINE MONITORING</div>
          <h3 style="font-size:max(24px,2.2vw);font-weight:300;line-height:1.18;color:var(--accent)">主动测量匙孔底部反射，直接获取深度结构</h3>
          <p style="font-size:max(13px,1vw);line-height:1.65;color:var(--text-secondary);font-weight:300">OCT 具备非接触、微米级轴向分辨率和高速成像能力，可穿透焊接烟尘与金属蒸汽，为熔深在线测量提供几何依据。</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="slide grey" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card">
    ${chrome('SOURCE IMAGE', pageNum(5))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 44vh auto;gap:3vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">OCT KEYHOLE SAMPLE</div>
        <h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.98;letter-spacing:-.025em">难点来自图像本身</h2>
      </div>
      <div data-anim="image" data-image-slot="s22-hero-21x9" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:var(--paper);overflow:hidden">${img('../figure/cp1/fig1-1a_raw.png', '原始 OCT 图像', 'contain')}</div>
        <div style="background:var(--paper);overflow:hidden">${img('../figure/cp1/fig1-1b_annotated.png', '标注 OCT 图像', 'contain')}</div>
      </div>
      <div data-anim="kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${card('A', '散斑噪声强', '随机颗粒纹理降低信噪比，扰动局部特征响应。')}
        ${card('B', '边界对比度低', '匙孔与背景过渡区域模糊，轮廓定位不稳定。', true)}
        ${card('C', '结构细长易断裂', '目标跨越多区域，需要全局连续性判断。')}
      </div>
    </div>
  </div>
</section>

<section class="slide" data-layout="S14" data-animate="system">
  <div class="canvas-card">
    ${chrome('CUDA PIPELINE', pageNum(6))}
    <div style="flex:1;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4vw;align-items:center">
      <div data-anim="left" style="display:flex;flex-direction:column;gap:2vh">
        <div class="t-meta">SD-OCT POST-PROCESSING</div>
        <h2 style="font-weight:200;font-size:min(5.6vw,9.8vh);line-height:.98;letter-spacing:-.025em">8 步后处理<br/>全程驻留 GPU</h2>
        <p style="font-size:max(13px,1vw);line-height:1.7;color:var(--text-secondary);font-weight:300">将类型转换、光谱整形、背景扣除、K 线性化、色差补偿、FFT、幅值提取、帧合并移植到 CUDA，并让中间数据直接在设备端传递。</p>
      </div>
      <div data-anim="loop" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
        ${['Type Convert','Gaussian Normalize','Background Subtract','K Linearization','Dispersion Comp.','Batch FFT','Amplitude Map','Frame Merge'].map((t, i) => `
          <div style="min-height:9vh;border-top:2px solid ${i === 3 || i === 5 ? 'var(--accent)' : 'var(--border-subtle)'};padding:1.3vh 0">
            <div class="t-meta" style="color:${i === 3 || i === 5 ? 'var(--accent)' : 'var(--text-helper)'}">${String(i + 1).padStart(2, '0')}</div>
            <div style="font-weight:400;font-size:max(13px,1vw);margin-top:.6vh">${t}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="slide dark" data-layout="S20" data-animate="kpi-tower">
  <div class="canvas-card">
    ${chrome('RECONSTRUCTION RESULT', pageNum(7))}
    <div style="flex:1;padding:0;display:grid;grid-template-columns:1.05fr 1fr;gap:4vw;align-items:end">
      <div data-anim="title" style="display:flex;flex-direction:column;gap:2vh">
        <div class="t-meta" style="color:rgba(255,255,255,.62)">CUDA PERFORMANCE</div>
        <h2 style="font-weight:200;font-size:min(6.2vw,10.8vh);line-height:.96;letter-spacing:-.025em;color:#fff">1350k<br/>A-line/s</h2>
        <p style="font-size:max(13px,1vw);line-height:1.65;color:rgba(255,255,255,.74);font-weight:300">RTX 4090D，M=1000，端到端约 742 μs；远高于 82 kHz 光谱仪采集速率。</p>
      </div>
      <div data-anim="ledger" style="display:flex;flex-direction:column;gap:2.2vh">
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:1.8vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">VS MATLAB</div>
          <div style="font-size:min(4.4vw,7.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">117×</div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:1.8vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">VS C++ CPU</div>
          <div style="font-size:min(4.4vw,7.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">71×</div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:1.8vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">M=50 UNIFIED MEMORY</div>
          <div style="font-size:min(4.4vw,7.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">1.62×</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="slide grey" data-layout="S16" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome('DATASET', pageNum(8))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">SELF-BUILT WELDING OCT DATASET</div>
        <h2 style="font-weight:200;font-size:min(5.4vw,9.4vh);line-height:.98;letter-spacing:-.025em">训练数据围绕真实焊接场景构建</h2>
      </div>
      <div data-anim="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${kpi('912', 'TRAIN IMAGES', '像素级标注训练图像', true)}
        ${kpi('228', 'TEST IMAGES', '独立测试集图像')}
        ${kpi('2', 'CLASSES', '背景 / 匙孔目标')}
        ${card('P1', '采集', '覆盖不同激光功率与焊接速度下的匙孔形态。')}
        ${card('P2', '预处理', '裁剪、灰度归一化、直方图均衡化，提高标注可辨性。')}
        ${card('P3', '增强', '翻转、旋转、亮度/对比度扰动和高斯噪声，模拟工况变化。', true)}
      </div>
    </div>
  </div>
</section>

<section class="slide" data-layout="S17" data-animate="system">
  <div class="canvas-card">
    ${chrome('MODEL DESIGN', pageNum(9))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:3.4vh">
      <div data-anim="head" style="display:grid;grid-template-columns:1fr .75fr;gap:4vw;align-items:end">
        <div>
          <div class="t-meta">IMPROVED DEEPLABV3+</div>
          <h2 style="font-weight:200;font-size:min(5.2vw,9vh);line-height:.98;letter-spacing:-.025em;margin-top:1.2vh">编码重结构<br/>解码重细节</h2>
        </div>
        <p style="font-size:max(13px,1vw);line-height:1.65;color:var(--text-secondary);font-weight:300">以 DeepLabV3+ 为基线，在 ASPP 后加入 TR 全局注意力模块，在解码融合处加入 SAE 空间感知增强模块，配合 BCE+Dice 混合损失。</p>
      </div>
      <div data-anim="diagram" style="background:var(--paper);height:50vh;overflow:hidden;display:flex;align-items:center;justify-content:center">
        ${img('../figure/cp4/fig4-2_improved_model_structure.png', '改进模型整体结构', 'contain')}
      </div>
    </div>
  </div>
</section>

<section class="slide" data-layout="S08" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome('DUAL ATTENTION', pageNum(10))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">TR + SAE</div>
        <h2 style="font-weight:200;font-size:min(5.4vw,9.4vh);line-height:.98;letter-spacing:-.025em">两个模块分别解决不同错误</h2>
      </div>
      <div data-anim="compare" style="display:grid;grid-template-columns:1fr 1px 1fr;gap:2.6vw">
        <div>
          <div class="t-cat" style="color:var(--accent)">TR · TRANSFORMER ROUTING</div>
          <h3 style="font-size:max(24px,2.1vw);font-weight:300;line-height:1.18;margin:2vh 0">解决细长结构断裂</h3>
          <p style="font-size:max(13px,1vw);line-height:1.65;color:var(--text-secondary);font-weight:300">区域级路由先筛选 Top-K 相关窗口，再做 token 级注意力计算，在可控开销下建立长距离依赖；窗口平均也对局部散斑噪声有平滑作用。</p>
          <div style="margin-top:3vh;height:22vh;background:var(--paper);overflow:hidden">${img('../figure/cp4/fig4-4_bilevel_attention.png', '双层路由注意力机制', 'contain')}</div>
        </div>
        <div style="background:var(--border-subtle)"></div>
        <div>
          <div class="t-cat">SAE · SPATIAL AWARENESS</div>
          <h3 style="font-size:max(24px,2.1vw);font-weight:300;line-height:1.18;margin:2vh 0">解决边界定位不稳</h3>
          <p style="font-size:max(13px,1vw);line-height:1.65;color:var(--text-secondary);font-weight:300">坐标注意力沿水平和垂直方向编码位置信息，再经特征精炼与多基数通道注意力突出边界相关响应。</p>
          <div style="margin-top:3vh;height:22vh;background:var(--paper);overflow:hidden">${img('../figure/cp4/fig4-5_sae_module.png', 'SAE 模块结构', 'contain')}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="slide grey" data-layout="S21" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome('KEY HYPERPARAMETERS', pageNum(11))}
    <div style="flex:1;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4vw;align-items:stretch">
      <div data-anim="left" style="display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta">ROUTING SPARSITY</div>
          <h2 style="font-weight:200;font-size:min(5.6vw,9.8vh);line-height:.98;letter-spacing:-.025em;margin-top:1.2vh">TopK = 4<br/>是精度效率拐点</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
          ${kpi('0.911', 'mIoU', 'TopK=4 最优', true)}
          ${kpi('12.4ms', 'INFERENCE', '低于 TopK=6/8')}
        </div>
      </div>
      <div data-anim="right" style="display:flex;flex-direction:column;justify-content:space-between">
        <div>
          <div class="t-meta">LOSS DESIGN</div>
          <h3 style="font-size:max(25px,2.2vw);font-weight:300;line-height:1.2;margin-top:1.2vh">BCE + Dice<br/>等权整体放大 2 倍</h3>
          <p style="font-size:max(13px,1vw);line-height:1.65;color:var(--text-secondary);font-weight:300;margin-top:2vh">BCE 提供稳定逐像素梯度，Dice 直接优化区域重叠度；在类别不平衡的 OCT 二分类任务中，λ1=λ2=2.0 取得 mIoU 与 HD95 同时最优。</p>
        </div>
        <div style="border-top:2px solid var(--accent);padding-top:2vh">
          <div style="font-family:var(--mono);letter-spacing:.18em;font-size:11px;color:var(--accent);margin-bottom:1vh">SELECTED</div>
          <div style="font-size:max(18px,1.5vw);font-weight:400">窗口大小 S=4 · TopK=4 · 注意力头数 8 · BCE/Dice=(2,2)</div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="slide" data-layout="S15" data-animate="grid-reveal">
  <div class="canvas-card">
    ${chrome('ABLATION', pageNum(12))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr auto;gap:3.4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">MODULE CONTRIBUTION</div>
        <h2 style="font-weight:200;font-size:min(5.4vw,9.4vh);line-height:.98;letter-spacing:-.025em">消融实验验证互补性</h2>
      </div>
      <div data-anim="matrix" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
        ${[
          ['Baseline','0.851','DeepLabV3+'],
          ['+TR','0.884','+3.9%'],
          ['+SAE','0.901','+5.9%'],
          ['TR+SAE','0.911','+7.1%']
        ].map((r, i) => `
          <div style="background:${i === 3 ? 'var(--accent)' : 'var(--grey-1)'};color:${i === 3 ? 'var(--accent-on)' : 'var(--text-primary)'};padding:2.2vh 1.4vw;min-height:30vh;display:flex;flex-direction:column;justify-content:space-between">
            <div class="t-meta" style="color:${i === 3 ? 'rgba(255,255,255,.72)' : 'var(--text-helper)'}">${r[0]}</div>
            <div style="font-size:min(5.8vw,10vh);font-weight:200;line-height:.9;letter-spacing:-.035em">${r[1]}</div>
            <div style="font-size:max(14px,1vw);font-weight:300;line-height:1.45">${r[2]}</div>
          </div>`).join('')}
      </div>
      <div data-anim="bottom" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;border-top:1px solid var(--border-subtle);padding-top:2vh">
        <p style="font-size:max(13px,1vw);line-height:1.6;color:var(--text-secondary);font-weight:300">TR 主要改善全局连续性，SAE 对边界精度贡献更突出。</p>
        <p style="font-size:max(13px,1vw);line-height:1.6;color:var(--text-secondary);font-weight:300">组合模型 HD95 从 12.22 降至 10.68，边界误差降低 12.6%。</p>
      </div>
    </div>
  </div>
</section>

<section class="slide grey" data-layout="S07" data-animate="bar-chart">
  <div class="canvas-card">
    ${chrome('COMPARISON', pageNum(13))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 1fr;gap:4vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">MAINSTREAM METHODS</div>
        <h2 style="font-weight:200;font-size:min(5.4vw,9.4vh);line-height:.98;letter-spacing:-.025em">本文方法 mIoU 最高</h2>
      </div>
      <div data-anim="bars" style="display:flex;flex-direction:column;gap:1.6vh">
        ${[
          ['UNet', 0.805],
          ['UNet++', 0.751],
          ['ResUNet', 0.721],
          ['TransUNet', 0.810],
          ['DeepLabV3+', 0.851],
          ['本文方法', 0.911]
        ].map(([name, value]) => `
          <div style="display:grid;grid-template-columns:1.2fr 6fr .8fr;gap:16px;align-items:center">
            <div style="font-size:max(14px,1.05vw);font-weight:400">${name}</div>
            <div style="height:4.8vh;background:var(--border-subtle);position:relative">
              <div style="height:100%;width:${(value * 100).toFixed(1)}%;background:${name === '本文方法' ? 'var(--accent)' : 'var(--ink)'}"></div>
            </div>
            <div style="font-family:var(--mono);font-size:max(14px,1.05vw);color:${name === '本文方法' ? 'var(--accent)' : 'var(--text-secondary)'}">${value.toFixed(3)}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="slide" data-layout="S22" data-animate="image-hero">
  <div class="canvas-card">
    ${chrome('VISUAL EVIDENCE', pageNum(14))}
    <div style="flex:1;padding:0;display:grid;grid-template-rows:auto 48vh auto;gap:3vh">
      <div data-anim="head" style="display:flex;flex-direction:column;gap:1.2vh">
        <div class="t-meta">SEGMENTATION RESULT</div>
        <h2 style="font-weight:200;font-size:min(5.2vw,9.2vh);line-height:.98;letter-spacing:-.025em">可视化结果体现全局与边界协同</h2>
      </div>
      <div data-anim="image" data-image-slot="s22-hero-21x9" style="display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(2,1fr);gap:12px;overflow:hidden">
        ${[
          ['原始 OCT', '../figure/cp4/4-3/origin.png'],
          ['人工标签', '../figure/cp4/4-3/label.png'],
          ['TransUNet', '../figure/cp4/4-3/transunet.png'],
          ['本文方法', '../figure/cp4/4-3/sae.png']
        ].map(([label, src]) => `
          <div style="background:var(--paper);display:grid;grid-template-rows:1fr auto;min-width:0;overflow:hidden">
            <div style="overflow:hidden">${img(src, label, 'contain')}</div>
            <div class="t-meta" style="padding-top:.9vh;color:${label === '本文方法' ? 'var(--accent)' : 'var(--text-helper)'}">${label}</div>
          </div>`).join('')}
      </div>
      <div data-anim="kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${kpi('0.826', 'TARGET IOU', '较基线 +16.3%', true)}
        ${kpi('10.68', 'HD95', '较基线 -12.6%')}
        ${kpi('-53.3%', 'MEMORY VS TRANSUNET', '9107 MB vs 19530 MB')}
      </div>
    </div>
  </div>
</section>

<section class="slide dark" data-layout="S20" data-animate="kpi-tower">
  <div class="canvas-card">
    ${chrome('FINAL RESULTS', pageNum(15))}
    <div style="flex:1;padding:0;display:grid;grid-template-columns:1fr 1.1fr;gap:4vw;align-items:end">
      <div data-anim="left" style="display:flex;flex-direction:column;gap:2vh">
        <div class="t-meta" style="color:rgba(255,255,255,.62)">SUMMARY KPI</div>
        <h2 style="font-weight:200;font-size:min(6.4vw,11.2vh);line-height:.96;letter-spacing:-.025em;color:#fff">0.911<br/>mIoU</h2>
        <p style="font-size:max(13px,1vw);line-height:1.65;color:rgba(255,255,255,.74);font-weight:300">在自建焊接 OCT 数据集上，改进模型在综合精度、目标类别 IoU 和边界误差三项指标上同时优于基线。</p>
      </div>
      <div data-anim="right" style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">BASELINE LIFT</div>
          <div style="font-size:min(5vw,8.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">+7.1%</div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">TARGET IOU</div>
          <div style="font-size:min(5vw,8.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">+16.3%</div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">BOUNDARY HD95</div>
          <div style="font-size:min(5vw,8.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">-12.6%</div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.22);padding-top:2vh">
          <div class="t-meta" style="color:rgba(255,255,255,.55)">SPECKLE ROBUST</div>
          <div style="font-size:min(5vw,8.6vh);font-weight:200;color:var(--accent-bright);line-height:.95">5.9%</div>
          <p style="font-size:12px;color:rgba(255,255,255,.62);line-height:1.45;margin-top:.8vh">σ²=0.10 衰减幅度</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="slide split" data-layout="S10" data-animate="split-statement">
  <div class="canvas-card">
    <div class="split-half">
      <div class="half b-accent" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between;position:relative;overflow:hidden">
        <canvas class="ascii-bg" aria-hidden="true"></canvas>
        ${chrome(pageNum(16), 'Q&A')}
        <div data-anim="manifesto" style="display:flex;flex-direction:column;gap:2vh;position:relative;z-index:1">
          <div class="t-meta" style="color:rgba(255,255,255,.78);letter-spacing:.22em;margin-bottom:1.6vh">CONCLUSION</div>
          <h2 style="font-size:min(7.2vw,12.6vh);line-height:.96;letter-spacing:-.025em;font-weight:200;color:#fff">谢谢各位老师<br/>请批评指正</h2>
        </div>
        <div class="t-meta" style="color:rgba(255,255,255,.62);position:relative;z-index:1">谢智捷 · 深圳大学</div>
      </div>
      <div class="half" style="padding:5.6vh 3.6vw 4.4vh;justify-content:space-between">
        ${chrome('OUTLOOK', '03 DIRECTIONS')}
        <div data-anim="rules" style="display:flex;flex-direction:column;gap:0">
          ${card('01', '降低 PCR 共享内存占用', '尝试混合精度或分段求解，提高每个 SM 的活跃 block 数。')}
          ${card('02', '扩充材料与工艺参数', '增强模型在未见工况下的泛化能力。')}
          ${card('03', '端到端工程部署', '串联 GPU 重建与语义分割，实现从干涉谱到分割结果的闭环处理。', true)}
        </div>
        <div class="t-meta" style="color:var(--text-helper);text-align:right">END OF DEFENSE</div>
      </div>
    </div>
  </div>
</section>`;

const template = fs.readFileSync(templatePath, 'utf8');
const deckStart = template.indexOf('<div id="deck">');
const deckEnd = template.indexOf('</div>\n\n<div id="nav"></div>', deckStart);

if (deckStart === -1 || deckEnd === -1) {
  throw new Error('Cannot locate deck region in guizang Swiss template.');
}

let html = template.slice(0, deckStart)
  + `<div id="deck">\n${slides}\n</div>`
  + template.slice(deckEnd + '</div>'.length);

html = html.replace(
  '<title>[必填] 替换为 PPT 标题 · Deck Title</title>',
  '<title>激光焊接 OCT 图像重建与语义分割方法研究 · 答辩 PPT</title>'
);

html = html.replace(
  '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>\n<script>lucide.createIcons();</script>',
  '<script>window.lucide={createIcons(){}};</script>'
);

html = html.replace(
  `let motion;
try {
  motion = await import('./assets/motion.min.js');
} catch(e1) {
  try {
    motion = await import('https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm');
  } catch(e2) {
    console.warn('[motion] local + CDN both failed, disabling animations', e1, e2);
    document.querySelectorAll('[data-anim]').forEach(el=>{el.style.opacity='1';el.style.transform='none'});
    document.querySelectorAll('[data-animate="pipeline"] [data-anim]').forEach(el=>el.style.opacity='1');
  }
}`,
  `const motion = null;
document.querySelectorAll('[data-anim]').forEach(el=>{el.style.opacity='1';el.style.transform='none'});
document.querySelectorAll('[data-animate="pipeline"] [data-anim]').forEach(el=>el.style.opacity='1');`
);

html = html.replaceAll('[必填]', '');
html = html.replaceAll('替换为 PPT 标题 · Deck Title', '激光焊接 OCT 图像重建与语义分割方法研究');

fs.writeFileSync(outputPath, html, 'utf8');
console.log(outputPath);
