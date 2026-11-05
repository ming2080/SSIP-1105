import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public/assets');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 精品工业级带黄色安全帽人员定位图标 (超清透明 PNG)
// 适配大屏与移动端高DPI，保证在 24px-128px 下极致清晰、辨识度极高
const createPinSvg = (theme = 'cyan') => {
  const isAlert = theme === 'alert';
  const primaryLight = isAlert ? '#ff4d4f' : '#00f2fe';
  const primaryMain = isAlert ? '#f5222d' : '#00c0fa';
  const primaryDark = isAlert ? '#820014' : '#024b86';
  const glowColor = isAlert ? 'rgba(255, 77, 79, 0.65)' : 'rgba(0, 242, 254, 0.65)';
  const pinTipColor = isAlert ? '#ff7875' : '#67e8f9';

  return `
<svg width="256" height="256" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 定位水滴外发光与立体阴影 -->
    <filter id="pin-glow-${theme}" x="-30%" y="-20%" width="160%" height="150%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="${glowColor}" />
    </filter>

    <!-- 定位外壳渐变 -->
    <linearGradient id="pin-outer-grad-${theme}" x1="64" y1="4" x2="64" y2="124" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${primaryLight}" />
      <stop offset="35%" stop-color="${primaryMain}" />
      <stop offset="75%" stop-color="${primaryDark}" />
      <stop offset="100%" stop-color="#03162b" />
    </linearGradient>

    <!-- 针体金属发光边框 -->
    <linearGradient id="pin-border-grad-${theme}" x1="24" y1="6" x2="104" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="45%" stop-color="${primaryLight}" />
      <stop offset="100%" stop-color="${primaryMain}" />
    </linearGradient>

    <!-- 亮黄色工业安全帽渐变 (高对比亮黄 -> 工业深黄) -->
    <linearGradient id="helmet-gold" x1="64" y1="20" x2="64" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFF76A" />
      <stop offset="35%" stop-color="#FFCA00" />
      <stop offset="85%" stop-color="#FF9500" />
      <stop offset="100%" stop-color="#E06D00" />
    </linearGradient>

    <!-- 安全帽反光条 -->
    <linearGradient id="silver-stripe" x1="38" y1="36" x2="90" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.8"/>
    </linearGradient>

    <!-- 脸部健康肤色 -->
    <linearGradient id="skin-tone" x1="64" y1="48" x2="64" y2="66" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FED7AA" />
      <stop offset="100%" stop-color="#FB923C" />
    </linearGradient>

    <!-- 工装深海蓝防护服 -->
    <linearGradient id="workwear-blue" x1="64" y1="66" x2="64" y2="92" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0f2b48" />
    </linearGradient>
  </defs>

  <!-- 1. 定位针外形 (Pin Base) -->
  <g filter="url(#pin-glow-${theme})">
    <!-- 水滴外轮廓：上圆下尖，指向 (64, 122) -->
    <path d="M 64 6 
             C 34 6, 14 26, 14 56 
             C 14 78, 42 102, 64 122 
             C 86 102, 114 78, 114 56 
             C 114 26, 94 6, 64 6 Z" 
          fill="url(#pin-outer-grad-${theme})" 
          stroke="url(#pin-border-grad-${theme})" 
          stroke-width="3" 
          stroke-linejoin="round" />

    <!-- 内部深邃科技视窗底衬 -->
    <ellipse cx="64" cy="54" rx="40" ry="40" fill="#031528" fill-opacity="0.94" stroke="${primaryLight}" stroke-opacity="0.5" stroke-width="1.5" />
    <circle cx="64" cy="54" r="35" stroke="#38bdf8" stroke-width="0.75" stroke-dasharray="3 4" stroke-opacity="0.5" fill="none" />
  </g>

  <!-- 2. 人员与安全帽特写 -->
  <g id="worker-figure">
    <!-- 身体/工装肩膀 -->
    <path d="M 32 87 
             C 32 72, 44 64, 64 64 
             C 84 64, 96 72, 96 87 
             C 88 91, 76 93, 64 93 
             C 52 93, 40 91, 32 87 Z" 
          fill="url(#workwear-blue)" 
          stroke="${primaryLight}" 
          stroke-width="1.2" />

    <!-- 高亮安全反光背心条 (带荧光绿条) -->
    <path d="M 46 66 L 53 87" stroke="#4ADE80" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 82 66 L 75 87" stroke="#4ADE80" stroke-width="3.5" stroke-linecap="round" />
    <path d="M 37 81 C 48 85, 80 85, 91 81" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-opacity="0.95" />

    <!-- 脖颈 -->
    <rect x="58" y="55" width="12" height="12" rx="3" fill="url(#skin-tone)" />

    <!-- 头部轮廓 (圆润脸型) -->
    <circle cx="64" cy="52" r="14" fill="url(#skin-tone)" />

    <!-- 工业护目镜 (黑色镜框 + 蓝天科技反光晶面) -->
    <rect x="49" y="47" width="30" height="9" rx="4.5" fill="#0B132B" stroke="#000000" stroke-width="0.8"/>
    <ellipse cx="56.5" cy="51.5" rx="5.5" ry="3" fill="#38BDF8" />
    <ellipse cx="71.5" cy="51.5" rx="5.5" ry="3" fill="#38BDF8" />
    <ellipse cx="58" cy="50.5" rx="2" ry="1.2" fill="#FFFFFF" fill-opacity="0.9" />
    <ellipse cx="73" cy="50.5" rx="2" ry="1.2" fill="#FFFFFF" fill-opacity="0.9" />

    <!-- 3. 黄色安全帽 (极具辨识度的工业安全硬帽) -->
    <g id="hard-hat">
      <!-- 安全帽主球冠 -->
      <path d="M 36 43 
               C 36 21, 48 16, 64 16 
               C 80 16, 92 21, 92 43 
               Z" 
            fill="url(#helmet-gold)" />

      <!-- 安全帽顶部纵向加强脊 (Hard hat top ridge) -->
      <path d="M 61 16 C 61 16, 64 15, 67 16 L 67 42 L 61 42 Z" fill="#FFFBEB" />
      <path d="M 64 16 L 64 42" stroke="#B45309" stroke-width="1.2" />

      <!-- 安全帽侧面横向加固筋 -->
      <path d="M 40 34 C 48 30, 80 30, 88 34" stroke="#B45309" stroke-width="1.2" fill="none" stroke-linecap="round" />

      <!-- 银白色反光条 (带立体弧度) -->
      <path d="M 40 37 C 48 33, 80 33, 88 37" stroke="url(#silver-stripe)" stroke-width="3" fill="none" stroke-linecap="round" />

      <!-- 安全帽翻边大帽檐 (Brim) -->
      <path d="M 30 43 
               C 30 38.5, 46 41, 64 41 
               C 82 41, 98 38.5, 98 43 
               C 98 46.5, 82 48.5, 64 48.5 
               C 46 48.5, 30 46.5, 30 43 Z" 
            fill="#FFB703" 
            stroke="#C2410C" 
            stroke-width="1.2" />

      <!-- 帽檐上沿反光线 -->
      <path d="M 35 43.5 C 47 45.5, 81 45.5, 93 43.5" stroke="#FFFBEB" stroke-width="1.5" fill="none" />
    </g>
  </g>

  <!-- 3. 定位针尖部发光光标 (指向坐标点) -->
  <circle cx="64" cy="120" r="3.5" fill="#FFFFFF" />
  <circle cx="64" cy="120" r="6" stroke="${pinTipColor}" stroke-width="1.5" />
</svg>
`;
};

// 纯安全帽人员图标 (无外层定位针，专门用于徽标、按钮或点位内部)
const createWorkerOnlySvg = () => `
<svg width="256" height="256" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="worker-shadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="rgba(255, 179, 0, 0.45)"/>
    </filter>

    <linearGradient id="h-gold" x1="64" y1="12" x2="64" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFF76A" />
      <stop offset="30%" stop-color="#FFD000" />
      <stop offset="85%" stop-color="#FF9500" />
      <stop offset="100%" stop-color="#E06D00" />
    </linearGradient>

    <linearGradient id="h-stripe" x1="36" y1="36" x2="92" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E2E8F0" />
      <stop offset="50%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#CBD5E1" />
    </linearGradient>

    <linearGradient id="sk-tone" x1="64" y1="46" x2="64" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FED7AA" />
      <stop offset="100%" stop-color="#FB923C" />
    </linearGradient>

    <linearGradient id="ww-blue" x1="64" y1="68" x2="64" y2="116" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#082f49" />
    </linearGradient>
  </defs>

  <g filter="url(#worker-shadow)">
    <!-- 身体/工装 -->
    <path d="M 20 116 
             C 20 90, 36 78, 64 78 
             C 92 78, 108 90, 108 116 Z" 
          fill="url(#ww-blue)" 
          stroke="#38BDF8" 
          stroke-width="2" />

    <!-- 荧光反光条 (安全马甲标志) -->
    <path d="M 38 80 L 48 116" stroke="#4ADE80" stroke-width="5" stroke-linecap="round" />
    <path d="M 90 80 L 80 116" stroke="#4ADE80" stroke-width="5" stroke-linecap="round" />
    <path d="M 28 104 C 44 110, 84 110, 100 104" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-opacity="0.95" />

    <!-- 领口与脖颈 -->
    <rect x="56" y="66" width="16" height="18" rx="4" fill="url(#sk-tone)" />

    <!-- 脸部 -->
    <circle cx="64" cy="60" r="17" fill="url(#sk-tone)" />

    <!-- 护目镜 -->
    <rect x="47" y="54" width="34" height="11" rx="5.5" fill="#0B132B" stroke="#000000" stroke-width="1"/>
    <ellipse cx="55.5" cy="59.5" rx="6" ry="3.5" fill="#38BDF8" />
    <ellipse cx="72.5" cy="59.5" rx="6" ry="3.5" fill="#38BDF8" />
    <ellipse cx="57" cy="58" rx="2.5" ry="1.5" fill="#FFFFFF" fill-opacity="0.9" />
    <ellipse cx="74" cy="58" rx="2.5" ry="1.5" fill="#FFFFFF" fill-opacity="0.9" />

    <!-- 安全帽 -->
    <!-- 安全帽球冠 -->
    <path d="M 31 50 
             C 31 22, 46 14, 64 14 
             C 82 14, 97 22, 97 50 
             Z" 
          fill="url(#h-gold)" />

    <!-- 纵向加强脊 -->
    <path d="M 60 14 C 60 14, 64 12.5, 68 14 L 68 48 L 60 48 Z" fill="#FFFBEB" />
    <path d="M 64 14 L 64 48" stroke="#B45309" stroke-width="1.5" />

    <!-- 反光微晶条 -->
    <path d="M 36 40 C 47 35, 81 35, 92 40" stroke="url(#h-stripe)" stroke-width="4" stroke-linecap="round" />

    <!-- 标志性外翘大帽檐 -->
    <path d="M 23 50 
             C 23 44, 43 46.5, 64 46.5 
             C 85 46.5, 105 44, 105 50 
             C 105 54.5, 85 57.5, 64 57.5 
             C 43 57.5, 23 54.5, 23 50 Z" 
          fill="#FFB703" 
          stroke="#C2410C" 
          stroke-width="1.5" />
    <path d="M 28 50.5 C 44 53, 84 53, 100 50.5" stroke="#FFFBEB" stroke-width="2" fill="none" />
  </g>
</svg>
`;

async function build() {
  console.log('正在生成最新优化版带安全帽人员定位透明 PNG 图标...');

  // 1. 标准科技蓝定位大头针 (用于驾驶舱人员定位点位)
  await sharp(Buffer.from(createPinSvg('cyan')))
    .resize(160, 160)
    .png()
    .toFile(path.join(publicDir, 'personnel_pin_helmet.png'));

  // 2. 警报红人员定位大头针 (用于告警状态作业人员点位)
  await sharp(Buffer.from(createPinSvg('alert')))
    .resize(160, 160)
    .png()
    .toFile(path.join(publicDir, 'personnel_pin_helmet_alert.png'));

  // 3. 纯安全帽工人半身透明小图标 (用于小徽标、人员列表标签及微型点位)
  await sharp(Buffer.from(createWorkerOnlySvg()))
    .resize(128, 128)
    .png()
    .toFile(path.join(publicDir, 'personnel_helmet_worker.png'));

  // 同步复制到 dist/assets
  const distDir = path.resolve('dist/assets');
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(path.join(publicDir, 'personnel_pin_helmet.png'), path.join(distDir, 'personnel_pin_helmet.png'));
    fs.copyFileSync(path.join(publicDir, 'personnel_pin_helmet_alert.png'), path.join(distDir, 'personnel_pin_helmet_alert.png'));
    fs.copyFileSync(path.join(publicDir, 'personnel_helmet_worker.png'), path.join(distDir, 'personnel_helmet_worker.png'));
    console.log('✓ 成功同步至 dist/assets 生产目录');
  }

  console.log('✓ 所有带安全帽人员定位透明 PNG 图标生成完毕！');
}

build().catch(console.error);
