/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理：可视化电子围栏绘制与标定交互组件
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Square, 
  Pentagon, 
  RotateCcw, 
  Maximize2, 
  ShieldAlert, 
  Crosshair, 
  CheckCircle2,
  HelpCircle,
  Move,
  Sparkles
} from 'lucide-react';
import { WorkfaceFence } from '@/src/data/workfaceData';

interface WorkfaceFenceDrawerProps {
  belongingType: 'yard' | 'project';
  zoneName: string;
  subAreaName: string;
  specs?: string;
  projectName?: string;
  levelName?: string;
  elevation?: string;
  fence: WorkfaceFence;
  onChange: (fence: WorkfaceFence) => void;
}

export function WorkfaceFenceDrawer({
  belongingType,
  zoneName,
  subAreaName,
  specs,
  projectName,
  levelName,
  elevation,
  fence,
  onChange
}: WorkfaceFenceDrawerProps) {
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeHandleIndex, setActiveHandleIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('可拖拽控制点微调边界，或点击按钮一键自适应标准工位');

  const svgRef = useRef<SVGSVGElement | null>(null);

  // 初始化默认点集（若无点或点数不足）
  useEffect(() => {
    if (!fence.points || fence.points.length < 3) {
      applyPresetFence();
    }
  }, [subAreaName, levelName]);

  // 计算多边形面积与周长估算 (假定画布代表 150m x 80m 的真实物理空间)
  const calculateMetrics = (points: { x: number; y: number }[]) => {
    if (!points || points.length < 3) {
      return { area: '0 ㎡', perimeter: '0 m' };
    }
    const realWidth = 150; // meters
    const realHeight = 80; // meters

    // 多边形面积计算 (Shoelace formula)
    let areaSum = 0;
    let periSum = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % n];
      const x1 = (p1.x / 100) * realWidth;
      const y1 = (p1.y / 100) * realHeight;
      const x2 = (p2.x / 100) * realWidth;
      const y2 = (p2.y / 100) * realHeight;

      areaSum += x1 * y2 - x2 * y1;
      periSum += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    const calculatedArea = Math.round(Math.abs(areaSum) / 2);
    const calculatedPerimeter = Math.round(periSum);

    return {
      area: `${calculatedArea.toLocaleString()} ㎡`,
      perimeter: `${calculatedPerimeter} m`
    };
  };

  // 一键自适应填入标准工位电子围栏
  const applyPresetFence = () => {
    let presetPoints: { x: number; y: number }[];

    if (belongingType === 'yard') {
      // 厂区总装焊/船台标准矩形工位
      presetPoints = [
        { x: 18, y: 20 },
        { x: 82, y: 20 },
        { x: 82, y: 76 },
        { x: 18, y: 76 }
      ];
    } else {
      // 造船项目船体分层仿形多边形
      presetPoints = [
        { x: 16, y: 32 },
        { x: 74, y: 22 },
        { x: 86, y: 48 },
        { x: 74, y: 74 },
        { x: 16, y: 64 }
      ];
    }

    const metrics = calculateMetrics(presetPoints);
    onChange({
      type: belongingType === 'yard' ? 'rectangle' : 'polygon',
      points: presetPoints,
      area: specs && specs.includes('㎡') ? specs.split('=')[1] || metrics.area : metrics.area,
      perimeter: metrics.perimeter,
      status: 'active'
    });
    setStatusMessage('已一键加载工位标准电子围栏，拖拽端点可局部微调');
  };

  // 重置/清除当前围栏
  const handleClearFence = () => {
    onChange({
      type: drawMode,
      points: [],
      area: '0 ㎡',
      perimeter: '0 m',
      status: 'normal'
    });
    setStatusMessage('已清空电子围栏，请在网格中点击绘制新边界');
  };

  // 坐标转换：屏幕坐标转为 SVG 相对百分比 (0 - 100)
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  // 鼠标移动追踪
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e);
    setMousePos(coords);

    // 如果正在拖拽控制点
    if (activeHandleIndex !== null && fence.points && fence.points[activeHandleIndex]) {
      const newPoints = [...fence.points];
      newPoints[activeHandleIndex] = coords;
      const metrics = calculateMetrics(newPoints);
      onChange({
        ...fence,
        points: newPoints,
        area: metrics.area,
        perimeter: metrics.perimeter,
        status: 'active'
      });
    }
  };

  // 点击画布绘制新点
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // 如果刚结束拖拽，忽略点击
    if (activeHandleIndex !== null) return;

    const coords = getSvgCoordinates(e);
    const currentPoints = fence.points || [];

    if (drawMode === 'rectangle') {
      // 矩形模式：点击时生成居中标准矩形或重新框选
      const w = 40;
      const h = 32;
      const left = Math.max(5, coords.x - w / 2);
      const top = Math.max(8, coords.y - h / 2);
      const newPoints = [
        { x: left, y: top },
        { x: left + w, y: top },
        { x: left + w, y: top + h },
        { x: left, y: top + h }
      ];
      const metrics = calculateMetrics(newPoints);
      onChange({
        type: 'rectangle',
        points: newPoints,
        area: metrics.area,
        perimeter: metrics.perimeter,
        status: 'active'
      });
      setStatusMessage('已重新设定矩形围栏边界');
    } else {
      // 多边形模式：最多8个控制点
      if (currentPoints.length >= 8) {
        setStatusMessage('控制点已达上限 (8点)，拖动节点调整形状即可');
        return;
      }
      const newPoints = [...currentPoints, coords];
      const metrics = calculateMetrics(newPoints);
      onChange({
        type: 'polygon',
        points: newPoints,
        area: metrics.area,
        perimeter: metrics.perimeter,
        status: 'active'
      });
      setStatusMessage(`已添加第 ${newPoints.length} 个围栏控制点`);
    }
  };

  // 点集转 SVG polygon points 字符串
  const pointsString = (fence.points || [])
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 select-none text-slate-200">
      {/* 顶部标题与控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <Crosshair className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>电子围栏可视化标定空间</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                实时防越界联动
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {belongingType === 'yard' 
                ? `东南造船基地厂区网格 · ${zoneName} · ${subAreaName}`
                : `船舶三维工程坐标系 · ${projectName || '船舶项目'} · ${levelName || '分层'} (${elevation || '标高'})`}
            </div>
          </div>
        </div>

        {/* 交互工具按钮组 */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setDrawMode('rectangle');
              setStatusMessage('已切换为矩形围栏模式，点击画布可快速居中放置');
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              drawMode === 'rectangle'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Square className="w-3 h-3" />
            <span>矩形围栏</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDrawMode('polygon');
              setStatusMessage('已切换为多边形模式，点击网格可连续添加折线控制点');
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              drawMode === 'polygon'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Pentagon className="w-3 h-3" />
            <span>多边形仿形</span>
          </button>

          <button
            type="button"
            onClick={applyPresetFence}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 cursor-pointer transition-colors"
            title="根据当前所选工位规格一键自适应生成标准围栏"
          >
            <Sparkles className="w-3 h-3" />
            <span>一键自适应</span>
          </button>

          <button
            type="button"
            onClick={handleClearFence}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer transition-colors"
            title="清空当前围栏"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 核心画布区域：工业蓝图底图与交互式 SVG 电子围栏 */}
      <div className="relative w-full h-56 bg-[#090d16] rounded-lg border border-slate-800 overflow-hidden shadow-inner group">
        {/* 背景工程网格 (CAD Blueprint Grid) */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #38bdf8 1px, transparent 1px),
              linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />

        {/* 辅助刻度线与标尺说明 */}
        <div className="absolute top-1.5 left-2 text-[9px] font-mono text-cyan-500/60 pointer-events-none flex items-center gap-2">
          <span>0m</span>
          <span>···· 30m ····</span>
          <span>···· 60m ····</span>
          <span>···· 90m ····</span>
          <span>···· 120m ····</span>
          <span>150m</span>
        </div>

        <div className="absolute right-2 top-2 text-[9px] font-mono text-slate-500 pointer-events-none">
          比例尺: 1:200 · 坐标原点 (0,0)
        </div>

        {/* 衬底示意：船舶型线或车间工位轮廓底图 */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          {belongingType === 'yard' ? (
            // 厂区总装平台与轨道龙门吊轮廓
            <g stroke="#38bdf8" strokeWidth="0.6" fill="none">
              <rect x="10" y="14" width="80" height="72" strokeDasharray="2,2" />
              <line x1="10" y1="50" x2="90" y2="50" strokeDasharray="4,4" />
              <line x1="30" y1="14" x2="30" y2="86" />
              <line x1="70" y1="14" x2="70" y2="86" />
              <text x="12" y="24" fill="#38bdf8" fontSize="3" fontFamily="monospace">SEC-WORKSTATION-MAIN</text>
            </g>
          ) : (
            // 造船工程船体甲板/分段型线轮廓
            <g stroke="#38bdf8" strokeWidth="0.7" fill="none">
              <path d="M 8 36 Q 50 16 92 36 L 92 64 Q 50 84 8 64 Z" />
              <line x1="30" y1="28" x2="30" y2="72" strokeDasharray="2,2" />
              <line x1="50" y1="24" x2="50" y2="76" strokeDasharray="2,2" />
              <line x1="70" y1="28" x2="70" y2="72" strokeDasharray="2,2" />
              <text x="12" y="44" fill="#38bdf8" fontSize="3" fontFamily="monospace">HULL-SECTION-FRAME</text>
            </g>
          )}
        </svg>

        {/* 交互式电子围栏 SVG 画布 */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setActiveHandleIndex(null)}
          onMouseLeave={() => {
            setActiveHandleIndex(null);
            setMousePos(null);
          }}
        >
          {/* 已绘制的闭合电子围栏区域 */}
          {fence.points && fence.points.length >= 3 && (
            <g>
              {/* 围栏半透明警戒发光填充 */}
              <polygon
                points={pointsString}
                className="fill-blue-500/25 stroke-blue-400 transition-all duration-75"
                strokeWidth="1.2"
                strokeDasharray="3,1.5"
              />

              {/* 危险/管控边界警戒斜纹条纹光晕 */}
              <polygon
                points={pointsString}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.6"
              />

              {/* 围栏中心标签 */}
              {(() => {
                const centerX = fence.points.reduce((acc, p) => acc + p.x, 0) / fence.points.length;
                const centerY = fence.points.reduce((acc, p) => acc + p.y, 0) / fence.points.length;
                return (
                  <g pointerEvents="none">
                    <rect 
                      x={centerX - 16} 
                      y={centerY - 4.5} 
                      width="32" 
                      height="9" 
                      rx="2" 
                      className="fill-slate-900/90 stroke-blue-500/60"
                      strokeWidth="0.4"
                    />
                    <text
                      x={centerX}
                      y={centerY + 1.5}
                      textAnchor="middle"
                      className="fill-cyan-300 font-mono text-[3.2px] font-bold"
                    >
                      {fence.area || '管控围栏'} · {subAreaName}
                    </text>
                  </g>
                );
              })()}

              {/* 控制点 Handle (可拖拽微调顶点) */}
              {fence.points.map((pt, idx) => (
                <g 
                  key={idx} 
                  className="cursor-move"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setActiveHandleIndex(idx);
                  }}
                >
                  {/* 外发光圈 */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="2.8"
                    className="fill-blue-400/40 animate-ping opacity-60"
                  />
                  {/* 主控制点 */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="1.8"
                    className={`transition-colors ${
                      activeHandleIndex === idx 
                        ? 'fill-amber-400 stroke-white' 
                        : 'fill-cyan-400 stroke-slate-950'
                    }`}
                    strokeWidth="0.6"
                  />
                  {/* 序号标签 */}
                  <text
                    x={pt.x + 2.5}
                    y={pt.y - 2.5}
                    fontSize="2.8"
                    className="fill-slate-300 font-mono font-bold select-none pointer-events-none"
                  >
                    P{idx + 1}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 鼠标准星与动态指示 */}
          {mousePos && (
            <g pointerEvents="none">
              <line x1={mousePos.x} y1="0" x2={mousePos.x} y2="100" stroke="#38bdf8" strokeWidth="0.3" strokeDasharray="1,2" />
              <line x1="0" y1={mousePos.y} x2="100" y2={mousePos.y} stroke="#38bdf8" strokeWidth="0.3" strokeDasharray="1,2" />
              <circle cx={mousePos.x} cy={mousePos.y} r="1.2" fill="#38bdf8" />
            </g>
          )}
        </svg>

        {/* 悬浮坐标指示气泡 */}
        {mousePos && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] font-mono text-cyan-400 pointer-events-none backdrop-blur-xs flex items-center gap-2">
            <span>X: {((mousePos.x / 100) * 150).toFixed(1)}m</span>
            <span>Y: {((mousePos.y / 100) * 80).toFixed(1)}m</span>
          </div>
        )}
      </div>

      {/* 底部指标与状态反馈 */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <div>
            <span className="text-slate-400">围栏标定面积：</span>
            <span className="text-cyan-300 font-mono font-bold">{fence.area || '3,630 ㎡'}</span>
          </div>
          <div>
            <span className="text-slate-400">边界周长：</span>
            <span className="text-slate-200 font-mono">{fence.perimeter || '302 m'}</span>
          </div>
          <div>
            <span className="text-slate-400">控制节点数：</span>
            <span className="text-slate-200 font-mono">{fence.points?.length || 0} 点</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>定员超限/越界脱岗声光联动已就绪</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 italic">
          💡 {statusMessage}
        </div>
      </div>
    </div>
  );
}
