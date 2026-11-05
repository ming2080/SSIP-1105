/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理：三维空间作业面区域划定与基站空间圈定模态框
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  Sparkles, 
  PenTool, 
  Square, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Radio, 
  ShieldAlert,
  Maximize2,
  Undo2,
  Box,
  Layers
} from 'lucide-react';

interface BaseStationSpatial {
  id: string;
  name: string;
  code: string;
  type: string;
  x: number; // 0 - 100 percentage in 3D grid
  y: number; // 0 - 100 percentage in 3D grid
  elevation?: string;
}

interface Workface3DSpatialDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (result: {
    coordinatesText: string;
    points: { x: number; y: number }[];
    coveredBaseStationIds: string[];
    areaSize: string;
    perimeter: string;
  }) => void;
  areaType: string;
  areaColor: string;
  areaShape: string;
  projectName?: string;
  zoneName?: string;
  subAreaName?: string;
  levelName?: string;
  elevation?: string;
  candidateBaseStations: { id: string; name: string; code: string; type: string }[];
  initialPoints?: { x: number; y: number }[];
}

export function Workface3DSpatialDrawModal({
  isOpen,
  onClose,
  onSave,
  areaType = '作业区',
  areaColor = '#ef4444',
  areaShape = '自定义',
  projectName,
  zoneName,
  subAreaName,
  levelName,
  elevation = '+8.0m ~ +16.0m',
  candidateBaseStations,
  initialPoints
}: Workface3DSpatialDrawModalProps) {
  // 视口相机模式: 'perspective' 3D透视 | 'top' 2D/3D正顶俯视
  const [viewMode, setViewMode] = useState<'perspective' | 'top'>('perspective');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationAngle, setRotationAngle] = useState<number>(15); // degrees
  const [drawMode, setDrawMode] = useState<'polygon' | 'rectangle'>('rectangle');
  
  // 3D 绘图点集 (0 - 100 坐标百分比)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [activeHandleIndex, setActiveHandleIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const canvasSvgRef = useRef<SVGSVGElement | null>(null);

  // 映射候选基站在三维网格中的固定物理空间坐标 (预设散布于船台及甲板空间)
  const spatialBaseStations: BaseStationSpatial[] = useMemo(() => {
    const defaultCoords = [
      { id: 'BS-LNG-01', x: 30, y: 35 },
      { id: 'BS-LNG-02', x: 42, y: 65 },
      { id: 'BS-BOX-01', x: 68, y: 30 },
      { id: 'BS-ENG-01', x: 35, y: 55 },
      { id: 'BS-PCTC-01', x: 80, y: 50 },
      { id: 'BS-BULK-01', x: 22, y: 40 },
      { id: 'BS-WIND-01', x: 55, y: 72 },
      { id: 'BS-SUP-01', x: 75, y: 25 },
      { id: 'BS-CRANE-01', x: 48, y: 45 }
    ];

    return candidateBaseStations.map((bs, idx) => {
      const coord = defaultCoords.find(c => c.id === bs.id) || {
        x: 20 + ((idx * 17) % 65),
        y: 25 + ((idx * 19) % 55)
      };
      return {
        ...bs,
        x: coord.x,
        y: coord.y,
        elevation: elevation || '+16.0m'
      };
    });
  }, [candidateBaseStations, elevation]);

  // 初始化已有或默认点
  useEffect(() => {
    if (isOpen) {
      if (areaShape === '多边形') {
        setDrawMode('polygon');
      } else {
        setDrawMode('rectangle');
      }
      if (initialPoints && initialPoints.length >= 3) {
        setPoints(initialPoints);
      } else {
        // 默认生成标准框选
        setPoints([
          { x: 25.4, y: 25.8 },
          { x: 58.2, y: 25.8 },
          { x: 58.2, y: 68.4 },
          { x: 25.4, y: 68.4 }
        ]);
      }
    }
  }, [isOpen, initialPoints, areaShape]);

  // 判断基站点是否落入当前圈定多边形内 (Ray casting algorithm)
  const isPointInPolygon = (pt: { x: number; y: number }, poly: { x: number; y: number }[]) => {
    if (poly.length < 3) return false;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > pt.y) !== (yj > pt.y)) &&
        (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // 识别当前被圈定的基站清单
  const coveredBaseStations = useMemo(() => {
    if (points.length < 3) return [];
    return spatialBaseStations.filter(bs => isPointInPolygon({ x: bs.x, y: bs.y }, points));
  }, [points, spatialBaseStations]);

  // 格式化输出坐标文本: 如 "[25.4, 25.8  45.2, 25.8  45.2, 68.4  25.4, 68.4]"
  const coordinatesText = useMemo(() => {
    if (points.length === 0) return '未设定坐标';
    return `[${points.map(p => `${p.x.toFixed(1)}, ${p.y.toFixed(1)}`).join('  ')}]`;
  }, [points]);

  // 计算面积与周长
  const metrics = useMemo(() => {
    if (points.length < 3) return { area: '0 ㎡', perimeter: '0 m' };
    const realWidth = 120; // 物理米
    const realHeight = 60; // 物理米
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
    return {
      area: `${Math.round(Math.abs(areaSum) / 2).toLocaleString()} ㎡`,
      perimeter: `${Math.round(periSum)} m`
    };
  }, [points]);

  if (!isOpen) return null;

  // 坐标转换
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!canvasSvgRef.current) return { x: 0, y: 0 };
    const rect = canvasSvgRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeHandleIndex !== null) return;
    const coords = getSvgCoordinates(e);

    if (drawMode === 'rectangle') {
      const w = 36;
      const h = 32;
      const left = Math.max(8, coords.x - w / 2);
      const top = Math.max(10, coords.y - h / 2);
      setPoints([
        { x: left, y: top },
        { x: left + w, y: top },
        { x: left + w, y: top + h },
        { x: left, y: top + h }
      ]);
    } else {
      if (points.length >= 8) return;
      setPoints([...points, coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e);
    setHoverPos(coords);

    if (activeHandleIndex !== null && points[activeHandleIndex]) {
      const newPoints = [...points];
      newPoints[activeHandleIndex] = coords;
      setPoints(newPoints);
    }
  };

  // 一键自适应当前工位
  const handleAutoPreset = () => {
    setPoints([
      { x: 22.0, y: 22.0 },
      { x: 65.0, y: 22.0 },
      { x: 65.0, y: 70.0 },
      { x: 22.0, y: 70.0 }
    ]);
  };

  // 撤销上一个节点
  const handleUndoPoint = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };

  // 清空点集
  const handleClear = () => {
    setPoints([]);
  };

  // 完成三维绘制并返回
  const handleComplete = () => {
    onSave({
      coordinatesText,
      points,
      coveredBaseStationIds: coveredBaseStations.map(b => b.id),
      areaSize: metrics.area,
      perimeter: metrics.perimeter
    });
    onClose();
  };

  const pointsSvgStr = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 overflow-hidden animate-in fade-in duration-150">
      <div 
        className="bg-[#0b101d] rounded-2xl border border-slate-800 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部导航与空间信息头 */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              <Box className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>三维空间作业面区域划定</span>
                <span 
                  className="px-2 py-0.5 rounded text-[11px] font-semibold text-white border border-white/20"
                  style={{ backgroundColor: areaColor }}
                >
                  {areaType}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50 font-mono">
                  3D BIM 数字孪生协同
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>空间参照：{projectName || zoneName || '东南造船厂区'}</span>
                <span>·</span>
                <span>层级/工位：{levelName || subAreaName || '主甲板层'}</span>
                <span>·</span>
                <span className="text-cyan-400 font-bold">标高范围：{elevation}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleComplete}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>完成三维绘制并返回</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 核心操作主区：三维视口 + 交互画布 */}
        <div className="flex-1 relative overflow-hidden bg-[#070b14] flex flex-col">
          {/* 悬浮三维视口控制器 */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 rounded-xl p-1.5 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'perspective' ? 'top' : 'perspective')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'perspective' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{viewMode === 'perspective' ? '3D透视视角' : '2D正顶视图'}</span>
            </button>

            <div className="w-[1px] h-4 bg-slate-700" />

            <button
              type="button"
              onClick={() => setDrawMode('rectangle')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                drawMode === 'rectangle' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>标准矩形框</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawMode('polygon')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                drawMode === 'polygon' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>多边形自由打点</span>
            </button>

            <div className="w-[1px] h-4 bg-slate-700" />

            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="放大视口"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              title="缩小视口"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 右上角三维坐标与指北针 HUD */}
          <div className="absolute top-4 right-4 z-20 bg-slate-900/90 border border-slate-700/70 rounded-xl px-3 py-2 shadow-xl backdrop-blur-md text-[11px] font-mono space-y-1">
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400 animate-spin" />
                <span>三维空间轴</span>
              </span>
              <span className="text-slate-400">Z: {elevation}</span>
            </div>
            {hoverPos && (
              <div className="text-slate-300">
                光标坐标：X {((hoverPos.x / 100) * 120).toFixed(1)}m · Y {((hoverPos.y / 100) * 60).toFixed(1)}m
              </div>
            )}
            <div className="text-slate-400 text-[10px]">
              圈定状态：{coveredBaseStations.length > 0 ? `已挂载 ${coveredBaseStations.length} 台主基站` : '未覆盖基站'}
            </div>
          </div>

          {/* 3D 渲染画布 */}
          <div 
            className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center p-4"
            style={{
              perspective: viewMode === 'perspective' ? '1200px' : 'none'
            }}
          >
            {/* 三维倾斜平面容器 */}
            <div
              className="w-full max-w-4xl h-[420px] relative transition-transform duration-300 ease-out select-none shadow-2xl rounded-2xl border border-cyan-500/20 bg-[#060a14]"
              style={{
                transform: viewMode === 'perspective' 
                  ? `scale(${zoomLevel}) rotateX(${rotationAngle}deg) rotateZ(0deg)` 
                  : `scale(${zoomLevel}) rotateX(0deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* 空间网格三维底图 (3D Digital Twin Grid) */}
              <div 
                className="absolute inset-0 opacity-25 pointer-events-none rounded-2xl"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #06b6d4 1px, transparent 1px),
                    linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* 船舶船体/船台三维立体轮廓投影 */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                {/* 3D 深度投影底板 */}
                <path d="M 5 20 Q 50 10 95 20 L 95 80 Q 50 90 5 80 Z" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
                <line x1="25" y1="18" x2="25" y2="82" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="50" y1="15" x2="50" y2="85" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="75" y1="18" x2="75" y2="82" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
                <text x="7" y="28" fill="#38bdf8" fontSize="2.8" fontFamily="monospace">SPATIAL-BIM-SECTION-01</text>
              </svg>

              {/* 绘制交互 SVG */}
              <svg
                ref={canvasSvgRef}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setActiveHandleIndex(null)}
                onMouseLeave={() => {
                  setActiveHandleIndex(null);
                  setHoverPos(null);
                }}
              >
                {/* 圈定多边形 */}
                {points.length >= 3 && (
                  <g>
                    {/* 半透明填充 (根据用户选定的区域颜色 areaColor) */}
                    <polygon
                      points={pointsSvgStr}
                      fill={areaColor}
                      fillOpacity="0.25"
                      stroke={areaColor}
                      strokeWidth="1.2"
                      strokeDasharray="3,1.5"
                    />

                    {/* 立体光晕边缘 */}
                    <polygon
                      points={pointsSvgStr}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.4"
                    />

                    {/* 区域中心标定标签 */}
                    {(() => {
                      const cx = points.reduce((acc, p) => acc + p.x, 0) / points.length;
                      const cy = points.reduce((acc, p) => acc + p.y, 0) / points.length;
                      return (
                        <g pointerEvents="none">
                          <rect 
                            x={cx - 18} 
                            y={cy - 4.5} 
                            width="36" 
                            height="9" 
                            rx="2" 
                            fill="#0b101d"
                            stroke={areaColor}
                            strokeWidth="0.5"
                          />
                          <text
                            x={cx}
                            y={cy + 1.6}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="3.2"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {areaType} · {metrics.area}
                          </text>
                        </g>
                      );
                    })()}

                    {/* 顶点 Handles */}
                    {points.map((pt, idx) => (
                      <g
                        key={idx}
                        className="cursor-move"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveHandleIndex(idx);
                        }}
                      >
                        <circle cx={pt.x} cy={pt.y} r="2.5" fill={areaColor} fillOpacity="0.4" className="animate-ping" />
                        <circle cx={pt.x} cy={pt.y} r="1.6" fill="#ffffff" stroke={areaColor} strokeWidth="0.8" />
                        <text x={pt.x + 2} y={pt.y - 2} fill="#ffffff" fontSize="2.5" fontFamily="monospace" fontWeight="bold">
                          P{idx + 1}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* 鼠标准星 */}
                {hoverPos && (
                  <g pointerEvents="none">
                    <line x1={hoverPos.x} y1="0" x2={hoverPos.x} y2="100" stroke="#38bdf8" strokeWidth="0.25" strokeDasharray="1,2" />
                    <line x1="0" y1={hoverPos.y} x2="100" y2={hoverPos.y} stroke="#38bdf8" strokeWidth="0.25" strokeDasharray="1,2" />
                    <circle cx={hoverPos.x} cy={hoverPos.y} r="1" fill="#38bdf8" />
                  </g>
                )}
              </svg>

              {/* 三维实体基站对象渲染 (3D Physical Base Station Towers) */}
              <div className="absolute inset-0 pointer-events-none z-15">
                {spatialBaseStations.map(bs => {
                  const isCovered = coveredBaseStations.some(c => c.id === bs.id);
                  return (
                    <div
                      key={bs.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-auto"
                      style={{
                        left: `${bs.x}%`,
                        top: `${bs.y}%`
                      }}
                    >
                      {/* 基站天线辐射动画圈 */}
                      <div className={`w-8 h-8 rounded-full border absolute -top-1 animate-ping opacity-30 ${
                        isCovered ? 'border-emerald-400 bg-emerald-500/20' : 'border-blue-400 bg-blue-500/10'
                      }`} />

                      {/* 基站硬件节点图标 */}
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border shadow-lg transition-transform ${
                        isCovered 
                          ? 'bg-emerald-600 border-emerald-400 text-white scale-110 ring-2 ring-emerald-400/50' 
                          : 'bg-slate-900 border-slate-600 text-slate-300'
                      }`}>
                        <Radio className="w-3.5 h-3.5" />
                      </div>

                      {/* 基站悬浮铭牌 */}
                      <div className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap shadow-md flex items-center gap-1 border ${
                        isCovered 
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 font-bold' 
                          : 'bg-slate-900/80 text-slate-300 border-slate-700'
                      }`}>
                        <span>{bs.name}</span>
                        <span className="text-[8px] opacity-70">({bs.code})</span>
                        {isCovered && <span className="text-emerald-400 font-bold">✓已圈定</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 底部悬浮控制与坐标反馈栏 */}
          <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400">框选范围坐标：</span>
                <span className="text-cyan-300 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {coordinatesText}
                </span>
              </div>

              <div>
                <span className="text-slate-400">标定面积：</span>
                <span className="text-white font-mono font-bold">{metrics.area}</span>
              </div>

              <div>
                <span className="text-slate-400">已自动圈定主基站：</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {coveredBaseStations.length} 台
                </span>
                {coveredBaseStations.length > 0 && (
                  <span className="text-slate-400 font-mono text-[11px] ml-1">
                    ({coveredBaseStations.map(b => b.name).join('、')})
                  </span>
                )}
              </div>
            </div>

            {/* 操作快捷按钮组 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndoPoint}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="撤销上一个控制点"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>撤销节点</span>
              </button>

              <button
                type="button"
                onClick={handleAutoPreset}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="一键自适应铺满当前工位标准范围"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>一键匹配工位</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="清空当前所有绘制"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清空重绘</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
