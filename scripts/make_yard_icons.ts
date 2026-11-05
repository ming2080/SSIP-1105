import sharp from 'sharp';

async function generateFinalStrips() {
  const configs = [
    {
      id: 1,
      name: 'yard_icon_1_final.png',
      pureFile: 'public/assets/overview_icons/yard_pure_1.png',
      color: '#00e5ff',
      colorDark: '#0284c7'
    },
    {
      id: 2,
      name: 'yard_icon_2_final.png',
      pureFile: 'public/assets/overview_icons/yard_pure_2.png',
      color: '#ff9100',
      colorDark: '#ea580c'
    },
    {
      id: 3,
      name: 'yard_icon_3_final.png',
      pureFile: 'public/assets/overview_icons/yard_pure_3.png',
      color: '#4da6ff',
      colorDark: '#2563eb'
    },
    {
      id: 4,
      name: 'yard_icon_4_final.png',
      pureFile: 'public/assets/overview_icons/yard_pure_4.png',
      color: '#1fe08a',
      colorDark: '#059669'
    }
  ];

  const W = 210, H = 52;

  for (const c of configs) {
    // 读取 pure 图标，高度 50px
    const pureBuf = await sharp(c.pureFile)
      .resize({ height: 50, fit: 'inside' })
      .png()
      .toBuffer();

    const pureMeta = await sharp(pureBuf).metadata();
    const iconW = pureMeta.width || 64;
    const iconH = pureMeta.height || 50;

    // 纯图形科技光效装饰（无任何字体依赖）
    const svgOverlay = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gLine_${c.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${c.color}" stop-opacity="0.95"/>
          <stop offset="70%" stop-color="${c.color}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${c.color}" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="gFill_${c.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${c.color}" stop-opacity="0.18"/>
          <stop offset="60%" stop-color="${c.colorDark}" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="${c.color}" stop-opacity="0.0"/>
        </linearGradient>
        <filter id="glow_${c.id}" x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- 横向微光条带底衬 -->
      <path d="M 6 5 L ${W - 12} 5 Q ${W - 4} 5 ${W - 4} 13 L ${W - 4} ${H - 13} Q ${W - 4} ${H - 5} ${W - 12} ${H - 5} L 6 ${H - 5} Z"
            fill="url(#gFill_${c.id})"
            stroke="${c.color}"
            stroke-width="0.8"
            stroke-opacity="0.25" />

      <!-- 底部主发光导轨 -->
      <path d="M ${iconW + 8} ${H - 8} L ${W - 16} ${H - 8}" stroke="url(#gLine_${c.id})" stroke-width="2.2" filter="url(#glow_${c.id})" />
      <polygon points="${W - 16},${H - 11} ${W - 7},${H - 8} ${W - 16},${H - 5}" fill="${c.color}" opacity="0.9" />

      <!-- 顶部科技刻度标尺 -->
      <line x1="${iconW + 10}" y1="12" x2="${W - 24}" y2="12" stroke="url(#gLine_${c.id})" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.75" />
      <polygon points="${W - 22},9 ${W - 14},12 ${W - 22},15" fill="${c.color}" opacity="0.8" />

      <!-- 中间动态脉冲波与数据点阵 -->
      <polyline points="${iconW + 16},26 ${iconW + 36},26 ${iconW + 44},18 ${iconW + 52},34 ${iconW + 60},22 ${iconW + 68},28 ${iconW + 76},26 ${W - 28},26"
                fill="none"
                stroke="${c.color}"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.8"
                filter="url(#glow_${c.id})" />

      <!-- 数据流微粒子 -->
      <circle cx="${iconW + 88}" cy="26" r="2" fill="${c.color}" opacity="0.9"/>
      <circle cx="${iconW + 108}" cy="26" r="1.5" fill="${c.color}" opacity="0.7"/>
      <circle cx="${iconW + 128}" cy="26" r="1.8" fill="${c.color}" opacity="0.8"/>

      <!-- 科技网格阵列点 -->
      <g opacity="0.45" fill="${c.color}">
        <circle cx="${iconW + 20}" cy="38" r="1"/>
        <circle cx="${iconW + 32}" cy="38" r="1"/>
        <circle cx="${iconW + 44}" cy="38" r="1"/>
        <circle cx="${iconW + 56}" cy="38" r="1"/>
        <circle cx="${iconW + 68}" cy="38" r="1"/>
        <circle cx="${iconW + 80}" cy="38" r="1"/>
        <circle cx="${iconW + 92}" cy="38" r="1"/>
        <circle cx="${iconW + 104}" cy="38" r="1"/>
        <circle cx="${iconW + 116}" cy="38" r="1"/>
        <circle cx="${iconW + 128}" cy="38" r="1"/>
      </g>
    </svg>
    `;

    const svgBuffer = Buffer.from(svgOverlay);

    const topPos = Math.max(0, Math.round((H - iconH) / 2));
    await sharp(svgBuffer)
      .composite([
        {
          input: pureBuf,
          left: 4,
          top: topPos
        }
      ])
      .png()
      .toFile(`public/assets/overview_icons/${c.name}`);

    console.log(`Generated pure graphic strip ${c.name}`);
  }
}

generateFinalStrips();
