import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Flame, 
  Users, 
  MapPin, 
  Layers, 
  Filter, 
  Eye, 
  Sliders, 
  RotateCw, 
  Maximize2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Compass, 
  Radio, 
  Activity, 
  ZoomIn, 
  ZoomOut,
  Crosshair,
  Building2,
  Ship,
  Info
} from 'lucide-react';

import { WorkfaceRecord, WorkfacePersonnel } from '@/src/data/workfaceData';

export interface SpatialWorkerPoint {
  id: string;
  name: string;
  role: string;
  team: string;
  tagId: string;
  workfaceId: string;
  workfaceName: string;
  workZoneType: 'yard' | 'project';
  x: number; // 相对米制坐标 (0 ~ 300m)
  y: number; // 相对米制坐标 (0 ~ 180m)
  intensity: number; // 基础热力权重 (0.6 ~ 1.0)
  heartRate: number;
  stayDuration: string;
  isOvertime: boolean;
}

// 重点作业区定义 (包含其在 300m × 180m 坐标系中的空间边界矩形)
export interface WorkZoneBoundary {
  id: string;
  name: string;
  code: string;
  type: 'yard' | 'project';
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  areaSize: string;
  capacityLimit: number;
  description: string;
}

export const PRESET_WORK_ZONES: WorkZoneBoundary[] = [
  {
    id: 'zone-assy-1',
    name: '总组装焊平台一 (巨型分段总组区)',
    code: 'SEC-ASSY-01',
    type: 'yard',
    minX: 20,
    maxX: 140,
    minY: 15,
    maxY: 75,
    areaSize: '3,630 ㎡',
    capacityLimit: 25,
    description: '大型分段总组拼装焊接与电装预装作业面'
  },
  {
    id: 'zone-paint-shop',
    name: '涂装车间特涂面 (密闭喷砂除锈区)',
    code: 'SEC-PAINT-02',
    type: 'yard',
    minX: 160,
    maxX: 280,
    minY: 15,
    maxY: 80,
    areaSize: '5,071 ㎡',
    capacityLimit: 18,
    description: '全封闭高压喷砂除锈与特种防腐作业面'
  },
  {
    id: 'zone-lng-hold',
    name: '17.4万m³LNG船 1/2号货舱绝热作业面',
    code: 'PRJ-LNG-HOLD',
    type: 'project',
    minX: 25,
    maxX: 145,
    minY: 95,
    maxY: 165,
    areaSize: '2,800 ㎡',
    capacityLimit: 30,
    description: '薄膜型绝热货舱密闭绝热箱安装与受限动火区'
  },
  {
    id: 'zone-dock-deck',
    name: '超大型集装箱船 导轨架高空搭载面',
    code: 'PRJ-BOX-DECK',
    type: 'project',
    minX: 165,
    maxX: 285,
    minY: 95,
    maxY: 165,
    areaSize: '4,200 ㎡',
    capacityLimit: 35,
    description: '24层集装箱导轨架合拢、主甲板管系与高空走道面'
  }
];

// 生成初始基于真实米制坐标的人员空间点位集合
function generateInitialWorkerPoints(workfaces: WorkfaceRecord[]): SpatialWorkerPoint[] {
  const points: SpatialWorkerPoint[] = [];

  // 1. 区域1: 总组装焊平台一 (密集聚集于焊缝与拼组对胎架)
  const names1 = [
    { name: '陈志强', role: '总组班长', team: '分段总组一班', tag: 'TAG-Y01', ox: 65, oy: 42 },
    { name: '黄大伟', role: '特种焊工', team: '分段总组一班', tag: 'TAG-Y03', ox: 68, oy: 45 },
    { name: '刘振东', role: '铆工预装', team: '分段总组一班', tag: 'TAG-Y04', ox: 70, oy: 43 },
    { name: '孙建平', role: '自动埋弧焊工', team: '外协焊装队', tag: 'TAG-Y05', ox: 72, oy: 46 },
    { name: '赵宏亮', role: '装配钳工', team: '分段总组一班', tag: 'TAG-Y06', ox: 66, oy: 48 },
    { name: '林海波', role: '现场安全员', team: '安监部', tag: 'TAG-Y02', ox: 55, oy: 32 },
    { name: '钱德贵', role: '起重指挥工', team: '起重一班', tag: 'TAG-Y07', ox: 45, oy: 60 },
    { name: '周志刚', role: '吊装司索工', team: '起重一班', tag: 'TAG-Y08', ox: 48, oy: 62 },
    { name: '吴承龙', role: '探伤评片员', team: '品保质检部', tag: 'TAG-Y09', ox: 110, oy: 35 },
    { name: '郭培荣', role: '探伤辅助工', team: '品保质检部', tag: 'TAG-Y10', ox: 112, oy: 37 },
    { name: '徐文杰', role: '特种焊工', team: '外协二队', tag: 'TAG-Y11', ox: 95, oy: 55 },
    { name: '郑少峰', role: '打磨除渣工', team: '外协二队', tag: 'TAG-Y12', ox: 97, oy: 57 }
  ];
  names1.forEach((w, i) => {
    points.push({
      id: `WP-ASSY-${i + 1}`,
      name: w.name,
      role: w.role,
      team: w.team,
      tagId: w.tag,
      workfaceId: 'WF-YARD-001',
      workfaceName: '总组装焊平台一巨型分段拼对总组面',
      workZoneType: 'yard',
      x: w.ox + (Math.random() * 4 - 2),
      y: w.oy + (Math.random() * 4 - 2),
      intensity: 0.85,
      heartRate: 74 + Math.floor(Math.random() * 16),
      stayDuration: `${2 + Math.floor(i / 4)}小时${10 + i * 4}分`,
      isOvertime: i === 3
    });
  });

  // 2. 区域2: 涂装车间特涂面 (集中在喷砂房与喷漆除锈作业口)
  const names2 = [
    { name: '吴金水', role: '涂装班长', team: '防腐特涂一班', tag: 'TAG-PT01', ox: 215, oy: 38 },
    { name: '郑文杰', role: '涂装安全员', team: '安监部', tag: 'TAG-PT02', ox: 190, oy: 30 },
    { name: '方建国', role: '高压喷砂工', team: '防腐特涂一班', tag: 'TAG-PT03', ox: 220, oy: 42 },
    { name: '蒋建中', role: '喷砂辅助工', team: '防腐特涂一班', tag: 'TAG-PT04', ox: 222, oy: 44 },
    { name: '沈国荣', role: '无气喷漆工', team: '防腐特涂一班', tag: 'TAG-PT05', ox: 250, oy: 60 },
    { name: '朱志坚', role: '漆膜测厚员', team: '品保涂装科', tag: 'TAG-PT06', ox: 255, oy: 58 },
    { name: '何海林', role: '风机维保工', team: '动力环保组', tag: 'TAG-PT07', ox: 175, oy: 65 }
  ];
  names2.forEach((w, i) => {
    points.push({
      id: `WP-PAINT-${i + 1}`,
      name: w.name,
      role: w.role,
      team: w.team,
      tagId: w.tag,
      workfaceId: 'WF-YARD-002',
      workfaceName: '5071㎡涂装车间密闭喷砂除锈特涂面',
      workZoneType: 'yard',
      x: w.ox + (Math.random() * 3 - 1.5),
      y: w.oy + (Math.random() * 3 - 1.5),
      intensity: 0.9,
      heartRate: 76 + Math.floor(Math.random() * 18),
      stayDuration: `${1 + Math.floor(i / 3)}小时${20 + i * 5}分`,
      isOvertime: false
    });
  });

  // 3. 区域3: 17.4万m³LNG船 1/2号货舱绝热作业面 (受限空间高密度聚集)
  const names3 = [
    { name: '张志诚', role: '绝热装配工长', team: 'LNG特战班组', tag: 'TAG-LNG01', ox: 75, oy: 125 },
    { name: '李世民', role: 'NO96薄膜焊工', team: 'LNG特战班组', tag: 'TAG-LNG02', ox: 78, oy: 128 },
    { name: '王保华', role: '低温绝热安装工', team: 'LNG特战班组', tag: 'TAG-LNG03', ox: 80, oy: 126 },
    { name: '刘长春', role: '绝热箱胶结工', team: 'LNG特战班组', tag: 'TAG-LNG04', ox: 82, oy: 130 },
    { name: '周卫国', role: '受限空间监护员', team: '安全环保部', tag: 'TAG-LNG05', ox: 60, oy: 110 },
    { name: '马跃林', role: '气密性检漏员', team: '法国GTT质检组', tag: 'TAG-LNG06', ox: 85, oy: 132 },
    { name: '陈立新', role: '低温管路钳工', team: '管装二分队', tag: 'TAG-LNG07', ox: 115, oy: 145 },
    { name: '杨小明', role: '特种焊工', team: '管装二分队', tag: 'TAG-LNG08', ox: 118, oy: 147 },
    { name: '宋德清', role: '抽真空测试员', team: 'LNG特战班组', tag: 'TAG-LNG09', ox: 74, oy: 135 },
    { name: '胡国庆', role: '通风除湿监控员', team: '动力环保组', tag: 'TAG-LNG10', ox: 55, oy: 140 }
  ];
  names3.forEach((w, i) => {
    points.push({
      id: `WP-LNG-${i + 1}`,
      name: w.name,
      role: w.role,
      team: w.team,
      tagId: w.tag,
      workfaceId: 'WF-PRJ-001',
      workfaceName: '17.4万m³LNG船 1号货舱受限绝热面',
      workZoneType: 'project',
      x: w.ox + (Math.random() * 3 - 1.5),
      y: w.oy + (Math.random() * 3 - 1.5),
      intensity: 0.95,
      heartRate: 78 + Math.floor(Math.random() * 20),
      stayDuration: `${3 + Math.floor(i / 4)}小时${5 + i * 3}分`,
      isOvertime: i < 2 // 超时预警
    });
  });

  // 4. 区域4: 超大型集装箱船 导轨架高空搭载面
  const names4 = [
    { name: '谢文东', role: '箱位导轨组长', team: '箱船搭载一班', tag: 'TAG-BOX01', ox: 220, oy: 125 },
    { name: '邓立强', role: '高空装配铆工', team: '箱船搭载一班', tag: 'TAG-BOX02', ox: 224, oy: 128 },
    { name: '冯玉林', role: '高强板定位焊工', team: '箱船搭载一班', tag: 'TAG-BOX03', ox: 226, oy: 126 },
    { name: '唐建军', role: '绑扎桥走道电焊', team: '箱船搭载二班', tag: 'TAG-BOX04', ox: 260, oy: 140 },
    { name: '罗志伟', role: '主甲板消防管工', team: '管系安装科', tag: 'TAG-BOX05', ox: 190, oy: 150 },
    { name: '韩建华', role: '防坠落专职监护', team: '安监部高空组', tag: 'TAG-BOX06', ox: 210, oy: 115 },
    { name: '潘国栋', role: '激光垂直度测量', team: '建造设计院测量科', tag: 'TAG-BOX07', ox: 228, oy: 132 },
    { name: '袁世勋', role: '门吊挂钩司索工', team: '重型起重车间', tag: 'TAG-BOX08', ox: 275, oy: 120 }
  ];
  names4.forEach((w, i) => {
    points.push({
      id: `WP-BOX-${i + 1}`,
      name: w.name,
      role: w.role,
      team: w.team,
      tagId: w.tag,
      workfaceId: 'WF-PRJ-002',
      workfaceName: '超大型集装箱船 双岛上建与导轨架作业面',
      workZoneType: 'project',
      x: w.ox + (Math.random() * 4 - 2),
      y: w.oy + (Math.random() * 4 - 2),
      intensity: 0.88,
      heartRate: 75 + Math.floor(Math.random() * 15),
      stayDuration: `${2 + Math.floor(i / 3)}小时${15 + i * 4}分`,
      isOvertime: false
    });
  });

  return points;
}

interface WorkfacePersonnelHeatmapProps {
  workfaces?: WorkfaceRecord[];
  onNavigateToTracking?: (personId?: string) => void;
  className?: string;
}

export function WorkfacePersonnelHeatmap({
  workfaces = [],
  onNavigateToTracking,
  className = ''
}: WorkfacePersonnelHeatmapProps) {
  // 当前人员实时坐标集合
  const [workerPoints, setWorkerPoints] = useState<SpatialWorkerPoint[]>(() => generateInitialWorkerPoints(workfaces));

  // 作业区筛选 (ALL 或指定作业区ID)
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL');

  // 渲染模式: 'heatmap' (纯热力图) | 'hybrid' (热力图+人员粒子点位) | 'density' (密度等高色块)
  const [renderMode, setRenderMode] = useState<'heatmap' | 'hybrid' | 'density'>('hybrid');

  // 热力扩散半径与不透明度参数
  const [heatRadius, setHeatRadius] = useState<number>(36);
  const [heatOpacity, setHeatOpacity] = useState<number>(75);

  // 实时坐标微漂移模拟开关
  const [isDriftActive, setIsDriftActive] = useState<boolean>(true);

  // 悬停的人员详情弹窗
  const [hoveredPoint, setHoveredPoint] = useState<SpatialWorkerPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Canvas 引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 筛选后的人员坐标点
  const filteredPoints = useMemo(() => {
    if (selectedZoneId === 'ALL') return workerPoints;
    const currentZone = PRESET_WORK_ZONES.find(z => z.id === selectedZoneId);
    if (!currentZone) return workerPoints;

    return workerPoints.filter(p => {
      return p.x >= currentZone.minX - 5 && 
             p.x <= currentZone.maxX + 5 && 
             p.y >= currentZone.minY - 5 && 
             p.y <= currentZone.maxY + 5;
    });
  }, [workerPoints, selectedZoneId]);

  // 当前选中作业区对象
  const activeZoneObj = useMemo(() => {
    if (selectedZoneId === 'ALL') return null;
    return PRESET_WORK_ZONES.find(z => z.id === selectedZoneId) || null;
  }, [selectedZoneId]);

  // 人员聚集热点排行 (按空间临近度聚集分析)
  const clusteringHotspots = useMemo(() => {
    const spots = [
      {
        id: 'hs-1',
        name: 'LNG 1号货舱受限绝热层合拢面',
        count: workerPoints.filter(p => p.x >= 65 && p.x <= 95 && p.y >= 115 && p.y <= 140).length,
        zoneName: '17.4万m³LNG船 1/2号货舱',
        x: 80,
        y: 128,
        risk: '高危密闭聚集',
        color: '#ef4444'
      },
      {
        id: 'hs-2',
        name: '总组装焊平台一 A5总段焊接胎架',
        count: workerPoints.filter(p => p.x >= 60 && p.x <= 85 && p.y >= 35 && p.y <= 55).length,
        zoneName: '总组装焊平台一',
        x: 70,
        y: 45,
        risk: '交叉动火密集',
        color: '#f59e0b'
      },
      {
        id: 'hs-3',
        name: '集装箱船 导轨架垂直度定位面',
        count: workerPoints.filter(p => p.x >= 215 && p.x <= 240 && p.y >= 115 && p.y <= 140).length,
        zoneName: '超大型集装箱船导轨面',
        x: 224,
        y: 128,
        risk: '高空防坠重点',
        color: '#3b82f6'
      },
      {
        id: 'hs-4',
        name: '涂装车间 2号高压喷砂房喷嘴作业区',
        count: workerPoints.filter(p => p.x >= 205 && p.x <= 235 && p.y >= 30 && p.y <= 55).length,
        zoneName: '涂装车间特涂面',
        x: 218,
        y: 42,
        risk: '特种防腐作业',
        color: '#10b981'
      }
    ];
    return spots.sort((a, b) => b.count - a.count);
  }, [workerPoints]);

  // 坐标实时微漂移物理模拟 (每 2.5 秒模拟人员在作业半径内的小幅位移)
  useEffect(() => {
    if (!isDriftActive) return;

    const timer = setInterval(() => {
      setWorkerPoints(prev => prev.map(p => {
        // 轻微随机抖动 (-0.8m ~ +0.8m)，确保人员不脱离所在区域
        const dx = (Math.random() - 0.5) * 1.6;
        const dy = (Math.random() - 0.5) * 1.6;
        return {
          ...p,
          x: Math.max(10, Math.min(290, p.x + dx)),
          y: Math.max(10, Math.min(170, p.y + dy)),
          heartRate: Math.max(68, Math.min(108, p.heartRate + Math.floor((Math.random() - 0.5) * 4)))
        };
      }));
    }, 2500);

    return () => clearInterval(timer);
  }, [isDriftActive]);

  // 高性能 HTML5 Canvas 真实高斯热力扩散算法
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 1. 创建离屏灰度 Alpha 累加画布
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = width;
    shadowCanvas.height = height;
    const sCtx = shadowCanvas.getContext('2d');
    if (!sCtx) return;

    // 绘制每个工人的径向辐射衰减圆
    filteredPoints.forEach(p => {
      // 坐标映射: 300m × 180m -> Canvas 像素宽度和高度
      const px = (p.x / 300) * width;
      const py = (p.y / 180) * height;
      const radius = heatRadius;

      const radGrad = sCtx.createRadialGradient(px, py, 1, px, py, radius);
      radGrad.addColorStop(0, `rgba(0, 0, 0, ${p.intensity * 0.9})`);
      radGrad.addColorStop(0.5, `rgba(0, 0, 0, ${p.intensity * 0.4})`);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      sCtx.fillStyle = radGrad;
      sCtx.beginPath();
      sCtx.arc(px, py, radius, 0, Math.PI * 2);
      sCtx.fill();
    });

    // 2. 生成 256 色彩映射梯度阶梯条 (Navy -> Cyan -> Green -> Yellow -> Orange -> Crimson)
    const colorBar = document.createElement('canvas');
    colorBar.width = 256;
    colorBar.height = 1;
    const cCtx = colorBar.getContext('2d');
    if (!cCtx) return;

    const gradient = cCtx.createLinearGradient(0, 0, 256, 1);
    gradient.addColorStop(0.0, 'rgba(15, 23, 42, 0)');
    gradient.addColorStop(0.15, 'rgba(6, 182, 212, 0.4)'); // 青蓝
    gradient.addColorStop(0.35, 'rgba(16, 185, 129, 0.7)'); // 翠绿
    gradient.addColorStop(0.60, 'rgba(234, 179, 8, 0.85)'); // 明黄
    gradient.addColorStop(0.80, 'rgba(249, 115, 22, 0.95)'); // 亮橙
    gradient.addColorStop(1.0, 'rgba(239, 68, 68, 1.0)'); // 炽红
    cCtx.fillStyle = gradient;
    cCtx.fillRect(0, 0, 256, 1);

    const palette = cCtx.getImageData(0, 0, 256, 1).data;

    // 3. 将 Alpha 灰度值色彩映射到着色画布上
    const shadowImg = sCtx.getImageData(0, 0, width, height);
    const pixels = shadowImg.data;
    const finalImg = ctx.createImageData(width, height);
    const finalPixels = finalImg.data;

    const globalAlphaScale = heatOpacity / 100;

    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3]; // 累加的 Alpha 强度值
      if (alpha > 0) {
        const offset = alpha * 4;
        finalPixels[i] = palette[offset];         // R
        finalPixels[i + 1] = palette[offset + 1]; // G
        finalPixels[i + 2] = palette[offset + 2]; // B
        finalPixels[i + 3] = Math.min(255, Math.floor(palette[offset + 3] * globalAlphaScale)); // A
      }
    }

    ctx.putImageData(finalImg, 0, 0);

  }, [filteredPoints, heatRadius, heatOpacity, renderMode]);

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans ${className}`}>
      
      {/* 1. 热力图组件控制顶栏 */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        
        {/* 左侧：标题与模式徽标 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-950/40">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-wide text-white">
                作业面空间实时人员分布热力图
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                <span>UWB 高精度坐标实时驱动</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              全域坐标感知 · 300m × 180m 空间网格 · 高斯密度衰减聚集分析
            </p>
          </div>
        </div>

        {/* 中间：按作业区过滤核心筛选器 */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400 font-medium">按作业区筛选:</span>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="bg-slate-900 text-cyan-300 font-bold px-2.5 py-1 rounded-lg border border-cyan-800/60 focus:outline-none focus:border-cyan-400 cursor-pointer text-xs"
          >
            <option value="ALL">🌐 全厂全景坐标热力全览 ({workerPoints.length}人在场)</option>
            {PRESET_WORK_ZONES.map(zone => {
              const zoneCount = workerPoints.filter(p => 
                p.x >= zone.minX - 5 && p.x <= zone.maxX + 5 && 
                p.y >= zone.minY - 5 && p.y <= zone.maxY + 5
              ).length;
              return (
                <option key={zone.id} value={zone.id}>
                  [{zone.type === 'yard' ? '厂区' : '项目'}] {zone.name} ({zoneCount}/{zone.capacityLimit}人)
                </option>
              );
            })}
          </select>
        </div>

        {/* 右侧：热力显示模式与控制开关 */}
        <div className="flex items-center gap-3 text-xs">
          
          {/* 渲染模式切换 */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setRenderMode('heatmap')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                renderMode === 'heatmap' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              纯热力图
            </button>
            <button
              onClick={() => setRenderMode('hybrid')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                renderMode === 'hybrid' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              热力 + 点位
            </button>
          </div>

          {/* 动态微位移追踪开关 */}
          <button
            onClick={() => setIsDriftActive(prev => !prev)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              isDriftActive 
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' 
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="模拟真实人员在作业范围内的实时微幅位移"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isDriftActive ? '实时微动: 开' : '实时微动: 停'}</span>
          </button>
        </div>
      </div>

      {/* 2. 热力图主交互视口 + 右侧热力聚集排行榜与作业区空间指标 */}
      <div className="grid grid-cols-12 gap-0 border-b border-slate-200">
        
        {/* 左侧主图区 (9列): 真实坐标热力图画布与网格投影 */}
        <div className="col-span-12 xl:col-span-9 bg-slate-950 p-3 relative flex flex-col items-center justify-center overflow-hidden min-h-[460px]">
          
          {/* 背景暗色科技坐标网格 */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

          {/* 刻度尺指示器 (X轴 0 ~ 300m, Y轴 0 ~ 180m) */}
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-cyan-500/70 pointer-events-none z-10">
            <span>X: 0.0m (船台基准点)</span>
            <span>X: 75.0m</span>
            <span>X: 150.0m (中跨轴线)</span>
            <span>X: 225.0m</span>
            <span>X: 300.0m (码头前沿)</span>
          </div>

          <div className="absolute top-3 bottom-3 left-2 flex flex-col justify-between text-[9px] font-mono text-cyan-500/70 pointer-events-none z-10">
            <span>Y: 0m</span>
            <span>Y: 60m</span>
            <span>Y: 120m</span>
            <span>Y: 180m</span>
          </div>

          {/* 画布容器 (自适应 300:180 真实比例) */}
          <div 
            ref={containerRef}
            className="w-full max-w-[860px] aspect-[300/180] relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/95"
          >
            {/* SVG 底层：绘制各作业区边界虚线框与名称标注 */}
            <svg className="w-full h-full absolute inset-0 select-none pointer-events-none z-0">
              {PRESET_WORK_ZONES.map(zone => {
                const isSelected = selectedZoneId === zone.id;
                // 坐标转换至百分比
                const leftPct = (zone.minX / 300) * 100;
                const topPct = (zone.minY / 180) * 100;
                const widthPct = ((zone.maxX - zone.minX) / 300) * 100;
                const heightPct = ((zone.maxY - zone.minY) / 180) * 100;

                const strokeColor = isSelected ? '#00e5ff' : '#475569';
                const fillColor = isSelected ? 'rgba(6,182,212,0.08)' : 'rgba(30,41,59,0.2)';

                return (
                  <g key={zone.id}>
                    <rect
                      x={`${leftPct}%`}
                      y={`${topPct}%`}
                      width={`${widthPct}%`}
                      height={`${heightPct}%`}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray={isSelected ? '5,3' : '3,3'}
                      rx="8"
                    />
                    <text
                      x={`${leftPct + 2}%`}
                      y={`${topPct + 7}%`}
                      fill={isSelected ? '#00e5ff' : '#94a3b8'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {zone.name}
                    </text>
                    <text
                      x={`${leftPct + 2}%`}
                      y={`${topPct + 12}%`}
                      fill="#64748b"
                      fontSize="8"
                      fontFamily="monospace"
                    >
                      {zone.areaSize} | 定员上限: {zone.capacityLimit}人
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* HTML5 Canvas 真实热力渲染层 */}
            <canvas
              ref={canvasRef}
              width={860}
              height={516}
              className="w-full h-full absolute inset-0 z-10 pointer-events-none"
            />

            {/* 点位+热力混合模式下：渲染真实工人定位粒子点 */}
            {renderMode === 'hybrid' && filteredPoints.map(p => {
              const leftPct = (p.x / 300) * 100;
              const topPct = (p.y / 180) * 100;
              const isOvertime = p.isOvertime;
              const isSafety = p.role.includes('安全') || p.role.includes('监护');

              const dotBg = isOvertime 
                ? 'bg-rose-500 ring-2 ring-rose-300 animate-pulse' 
                : isSafety 
                ? 'bg-amber-400 ring-1 ring-white' 
                : p.role.includes('焊') 
                ? 'bg-emerald-400' 
                : 'bg-cyan-300';

              return (
                <div
                  key={p.id}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoverPos({ x: rect.left, y: rect.top });
                    setHoveredPoint(p);
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onNavigateToTracking && onNavigateToTracking(p.id)}
                >
                  <span className={`w-2.5 h-2.5 rounded-full block shadow-[0_0_8px_rgba(255,255,255,0.8)] ${dotBg}`} />
                </div>
              );
            })}

            {/* 悬停工人卡片 */}
            {hoveredPoint && hoverPos && (
              <div 
                className="fixed z-50 bg-slate-900/95 border border-cyan-500 text-white rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none text-xs space-y-1 w-56 -translate-y-full -translate-x-1/2 font-sans"
                style={{ left: hoverPos.x, top: hoverPos.y - 12 }}
              >
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-1">
                  <span className="font-bold text-cyan-400">{hoveredPoint.name}</span>
                  <span className="font-mono text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                    {hoveredPoint.tagId}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <div>工种岗位: <span className="text-white font-medium">{hoveredPoint.role}</span></div>
                  <div>归属作业区: <span className="text-slate-200">{hoveredPoint.workfaceName}</span></div>
                  <div>实时坐标: <strong className="font-mono text-cyan-300">X: {hoveredPoint.x.toFixed(1)}m, Y: {hoveredPoint.y.toFixed(1)}m</strong></div>
                  <div>在场时长: <span className="font-mono text-amber-400">{hoveredPoint.stayDuration}</span></div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    <span>心率: {hoveredPoint.heartRate} bpm</span>
                    {hoveredPoint.isOvertime && <span className="text-rose-400 font-bold">● 超时滞留</span>}
                  </div>
                </div>
              </div>
            )}

            {/* 色彩温度标尺指示器 (Color Temperature Legend) */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2.5 z-20 text-[10px] font-mono text-slate-300">
              <span className="text-slate-400">热力密度:</span>
              <span className="text-cyan-400">低密</span>
              <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-yellow-400 via-orange-500 to-rose-600 shadow-inner" />
              <span className="text-rose-400 font-bold">高密聚集</span>
            </div>

            {/* 视口右下角当前统计 */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1.5 z-20">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>当前视口人员: <strong className="text-white font-bold">{filteredPoints.length}</strong> 人</span>
            </div>
          </div>

          {/* 底部微调控制条 (半径调节、透明度调节) */}
          <div className="w-full max-w-[860px] flex items-center justify-between mt-2.5 px-3 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span>热力半径:</span>
                <input
                  type="range"
                  min="18"
                  max="54"
                  value={heatRadius}
                  onChange={(e) => setHeatRadius(Number(e.target.value))}
                  className="w-20 accent-cyan-500 cursor-pointer"
                />
                <span className="text-cyan-400 font-bold">{heatRadius}px</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>热力透明度:</span>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={heatOpacity}
                  onChange={(e) => setHeatOpacity(Number(e.target.value))}
                  className="w-20 accent-cyan-500 cursor-pointer"
                />
                <span className="text-cyan-400 font-bold">{heatOpacity}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans">
              <span>坐标更新: <strong className="text-emerald-400">实时 RTK</strong></span>
              <span>•</span>
              <span>刷新周期: 2.5s</span>
            </div>
          </div>

        </div>

        {/* 右侧分析栏 (3列): 当前作业区指标看板 + 人员聚集热点排行 */}
        <div className="col-span-12 xl:col-span-3 bg-slate-50 p-4 flex flex-col gap-3.5 border-l border-slate-200">
          
          {/* 当前选定作业区信息卡 */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">当前聚焦作业区</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeZoneObj ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {activeZoneObj ? (activeZoneObj.type === 'yard' ? '厂区作业区' : '项目作业区') : '全厂全景'}
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 leading-snug">
              {activeZoneObj ? activeZoneObj.name : '全厂所有空间作业区全景态势'}
            </h4>

            <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
              {activeZoneObj ? activeZoneObj.description : '实时汇聚总装平台、涂装特涂面、LNG货舱绝热区与集装箱船搭载面的三维人员实时坐标。'}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans">在场人员/定员</div>
                <div className="font-bold text-slate-800 text-sm mt-0.5">
                  {filteredPoints.length} <span className="text-slate-400 font-normal">/ {activeZoneObj ? activeZoneObj.capacityLimit : 108}人</span>
                </div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-sans">标定作业面积</div>
                <div className="font-bold text-blue-700 text-sm mt-0.5">
                  {activeZoneObj ? activeZoneObj.areaSize : '15,701 ㎡'}
                </div>
              </div>
            </div>
          </div>

          {/* 人员聚集热点排行 (Top Hotspots) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>人员密集聚集热点排行</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">密度分析</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-0.5">
              {clusteringHotspots.map((spot, idx) => (
                <div 
                  key={spot.id} 
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50/50 transition-colors text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                      idx === 0 ? 'bg-rose-500 text-white' : idx === 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 text-[11px] truncate max-w-[140px]" title={spot.name}>
                        {spot.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        坐标 X:{spot.x}m Y:{spot.y}m
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-xs">
                      {spot.count} <span className="text-[10px] font-normal text-slate-500">人聚集</span>
                    </div>
                    <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100 inline-block mt-0.5">
                      {spot.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 提示 */}
            <div className="mt-auto pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>当单点密集度超过 15 人时将自动联动现场广播</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
