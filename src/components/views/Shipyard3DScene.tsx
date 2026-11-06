import React, { useEffect, useRef, useState } from 'react';
import { ShipModelLevel } from './Dashboard';
import { Layers, RotateCcw, Compass } from 'lucide-react';

interface Shipyard3DSceneProps {
  viewScope: 'yard' | 'project';
  projectId?: string;
  selectedModelLevel: ShipModelLevel;
  onBackgroundClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

export function Shipyard3DScene({
  viewScope,
  projectId = 'prj-001',
  selectedModelLevel = 'all',
  onBackgroundClick,
  className = ''
}: Shipyard3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 18, y: -25 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 鼠标拖拽控制三维旋转视角
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation(prev => ({
      x: Math.max(-10, Math.min(50, prev.x - deltaY * 0.2)),
      y: (prev.y + deltaX * 0.3) % 360
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Canvas 绘制 3D 拟态网格与数字孪生船坞/船体空间
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.015;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 + 30;

      ctx.clearRect(0, 0, w, h);

      // 背景深海径向光晕
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.65);
      bgGrad.addColorStop(0, '#062040');
      bgGrad.addColorStop(0.5, '#031429');
      bgGrad.addColorStop(1, '#010912');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(cx, cy);

      const radX = (rotation.x * Math.PI) / 180;
      const radY = ((rotation.y + (isDragging.current ? 0 : Math.sin(time * 0.3) * 2)) * Math.PI) / 180;

      // 简易 3D 透视投影投影器
      const project = (x: number, y: number, z: number) => {
        // 先绕 Y 轴旋转
        const cosY = Math.cos(radY);
        const sinY = Math.sin(radY);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // 再绕 X 轴旋转
        const cosX = Math.cos(radX);
        const sinX = Math.sin(radX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const distance = 800;
        const fov = distance / (distance + z2 + 400);
        return {
          px: x1 * fov,
          py: y2 * fov,
          depth: z2
        };
      };

      // 1. 绘制三维地面空间网格 (Dock Grid)
      ctx.strokeStyle = 'rgba(0, 210, 255, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 500;
      const step = 50;

      for (let x = -gridSize; x <= gridSize; x += step) {
        const p1 = project(x, 120, -gridSize);
        const p2 = project(x, 120, gridSize);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }
      for (let z = -gridSize; z <= gridSize; z += step) {
        const p1 = project(-gridSize, 120, z);
        const p2 = project(gridSize, 120, z);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      // 2. 动态扫描光波 (Digital Sweep Radar)
      const sweepZ = Math.sin(time) * 400;
      const sp1 = project(-450, 120, sweepZ);
      const sp2 = project(450, 120, sweepZ);
      const sweepGrad = ctx.createLinearGradient(sp1.px, sp1.py, sp2.px, sp2.py);
      sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      sweepGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.45)');
      sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sp1.px, sp1.py);
      ctx.lineTo(sp2.px, sp2.py);
      ctx.stroke();

      // 3. 绘制 3D 船舶线框体 (Digital Hull Framework)
      const hullHeight = viewScope === 'project' ? 140 : 80;
      const hullLength = viewScope === 'project' ? 360 : 260;
      const hullWidth = viewScope === 'project' ? 110 : 80;

      // 判断分层高亮
      const isDeck = selectedModelLevel === 'all' || selectedModelLevel === 'deck';
      const isMiddle = selectedModelLevel === 'all' || selectedModelLevel === 'middle';
      const isBottom = selectedModelLevel === 'all' || selectedModelLevel === 'bottom';
      const isEngine = selectedModelLevel === 'all' || selectedModelLevel === 'engine';
      const isBridge = selectedModelLevel === 'all' || selectedModelLevel === 'bridge';

      const drawHullSection = (yOffset: number, scaleY: number, color: string, alpha: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.fillStyle = color.replace(')', `, ${alpha * 0.15})`).replace('rgb', 'rgba');

        // 顶圈
        const topPts = [
          project(-hullLength, yOffset - scaleY, 0),
          project(-hullLength * 0.6, yOffset - scaleY, -hullWidth),
          project(hullLength * 0.7, yOffset - scaleY, -hullWidth),
          project(hullLength, yOffset - scaleY, 0),
          project(hullLength * 0.7, yOffset - scaleY, hullWidth),
          project(-hullLength * 0.6, yOffset - scaleY, hullWidth)
        ];

        ctx.beginPath();
        topPts.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // 底圈
        const botPts = [
          project(-hullLength * 0.9, yOffset + scaleY, 0),
          project(-hullLength * 0.5, yOffset + scaleY, -hullWidth * 0.6),
          project(hullLength * 0.65, yOffset + scaleY, -hullWidth * 0.6),
          project(hullLength * 0.9, yOffset + scaleY, 0),
          project(hullLength * 0.65, yOffset + scaleY, hullWidth * 0.6),
          project(-hullLength * 0.5, yOffset + scaleY, hullWidth * 0.6)
        ];

        ctx.beginPath();
        botPts.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.px, p.py);
          else ctx.lineTo(p.px, p.py);
        });
        ctx.closePath();
        ctx.stroke();

        // 竖肋骨连线
        for (let i = 0; i < topPts.length; i++) {
          ctx.beginPath();
          ctx.moveTo(topPts[i].px, topPts[i].py);
          ctx.lineTo(botPts[i].px, botPts[i].py);
          ctx.stroke();
        }
      };

      // 底舱 (Bottom)
      if (isBottom) {
        drawHullSection(70, 25, 'rgb(0, 229, 255)', selectedModelLevel === 'bottom' ? 0.9 : 0.3);
      }
      // 中舱 (Middle)
      if (isMiddle) {
        drawHullSection(15, 25, 'rgb(0, 210, 255)', selectedModelLevel === 'middle' ? 0.9 : 0.25);
      }
      // 甲板层 (Deck)
      if (isDeck) {
        drawHullSection(-40, 25, 'rgb(56, 189, 248)', selectedModelLevel === 'deck' ? 0.95 : 0.3);
      }

      // 驾驶台建筑 (Bridge)
      if (isBridge) {
        const bp1 = project(hullLength * 0.3, -95, -35);
        const bp2 = project(hullLength * 0.55, -95, -35);
        const bp3 = project(hullLength * 0.55, -95, 35);
        const bp4 = project(hullLength * 0.3, -95, 35);
        ctx.strokeStyle = selectedModelLevel === 'bridge' ? '#00e676' : 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bp1.px, bp1.py);
        ctx.lineTo(bp2.px, bp2.py);
        ctx.lineTo(bp3.px, bp3.py);
        ctx.lineTo(bp4.px, bp4.py);
        ctx.closePath();
        ctx.stroke();
      }

      // 4. 船厂起重龙门吊空间标识 (Crane Landmarks)
      if (viewScope === 'yard') {
        const craneX = -320;
        const cp1 = project(craneX, -160, -220);
        const cp2 = project(craneX, -160, 220);
        const cpBase1 = project(craneX, 120, -220);
        const cpBase2 = project(craneX, 120, 220);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cpBase1.px, cpBase1.py);
        ctx.lineTo(cp1.px, cp1.py);
        ctx.lineTo(cp2.px, cp2.py);
        ctx.lineTo(cpBase2.px, cpBase2.py);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText('1200T GOLIATH CRANE', cp1.px + 10, cp1.py - 10);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [rotation, viewScope, selectedModelLevel]);

  return (
    <div 
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        // 如果是点击而非拖动，触发外层背景点击
        if (!isDragging.current && onBackgroundClick) {
          onBackgroundClick();
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* 3D 控制角标与提示 */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 bg-[#020b14]/75 border border-[#00d2ff]/40 px-3 py-1 rounded-full text-[10px] text-[#8ab4f8] backdrop-blur-md">
        <Compass className="w-3.5 h-3.5 text-[#00e5ff] animate-spin" style={{ animationDuration: '10s' }} />
        <span>可按住鼠标左键任意旋转 3D 数字孪生空间</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setRotation({ x: 18, y: -25 });
          }}
          className="pointer-events-auto text-[#00e5ff] hover:text-white flex items-center gap-0.5 ml-1 cursor-pointer font-bold"
          title="重置视角"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置视角</span>
        </button>
      </div>
    </div>
  );
}
