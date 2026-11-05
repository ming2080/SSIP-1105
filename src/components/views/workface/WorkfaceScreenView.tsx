/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面大屏视图
 * 对应源码路径: src/yxkj-v8.html
 * 涵盖：有限空间与重点区域大屏安全监控系统、默认全屏显示、真实全屏切换、新窗口独立打开、返回控制台与配置台账联动
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  RotateCw, 
  ArrowLeft, 
  Tv, 
  SlidersHorizontal,
  LayoutDashboard
} from 'lucide-react';

export interface WorkfaceScreenViewProps {
  onExit?: () => void;
  onNavigateToConfig?: () => void;
  onNavigateToMonitor?: () => void;
  onNavigateToDashboard?: () => void;
}

export function WorkfaceScreenView({
  onExit,
  onNavigateToConfig,
  onNavigateToMonitor,
  onNavigateToDashboard
}: WorkfaceScreenViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitHint, setShowExitHint] = useState(true);
  const [iframeKey, setIframeKey] = useState<number>(() => Date.now());

  // 退出并返回原系统页面
  const handleExit = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (_) {}

    if (onExit) {
      onExit();
    } else if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else if (onNavigateToConfig) {
      onNavigateToConfig();
    }
  }, [onExit, onNavigateToDashboard, onNavigateToConfig]);

  // 打开时默认为全屏显示 (既有 100vw x 100vh 满屏，也主动触发原生全屏)
  useEffect(() => {
    let timer: any = null;
    const requestAutoFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          if (containerRef.current?.requestFullscreen) {
            await containerRef.current.requestFullscreen();
          } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
            await (containerRef.current as any).webkitRequestFullscreen();
          } else if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          }
        }
      } catch (err) {
        // 浏览器若因无前置交互阻止自动原生全屏，组件本身已采取 fixed inset-0 100vw x 100vh 沉浸式占满全屏
      }
    };

    // 延迟 60ms 确保容器完全挂载渲染就绪
    timer = setTimeout(requestAutoFullscreen, 60);

    // 1.2秒超时强制隐藏 loading，保障 iframe 顺畅呈现
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // 3.5秒后自动淡出退出提示
    const hintTimer = setTimeout(() => {
      setShowExitHint(false);
    }, 3500);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(loadTimer);
      clearTimeout(hintTimer);
    };
  }, []);

  // 监听浏览器全屏状态变动
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 快捷键监听：ESC 退出大屏模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 当未处于浏览器原生全屏状态（或原生全屏退出后），再次按 ESC 或初次按 ESC 可直接返回系统后台
        if (!document.fullscreenElement) {
          handleExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  // 切换原生全屏
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 刷新大屏
  const handleReload = () => {
    setIsLoading(true);
    const newKey = Date.now();
    setIframeKey(newKey);
    if (iframeRef.current) {
      iframeRef.current.src = `/yxkj-v8.html?t=${newKey}`;
    }
  };

  // 新窗口独立打开
  const handleOpenNewTab = () => {
    window.open(`/yxkj-v8.html?t=${Date.now()}`, '_blank');
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-50 flex flex-col bg-[#00060f] overflow-hidden select-none"
    >
      {/* 顶部悬浮控制栏 (极简半透明玻璃拟态胶囊) */}
      <div className="absolute top-3 right-4 z-40 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/40 shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_15px_rgba(0,229,255,0.25)] transition-all hover:bg-slate-900/98">
        
        {/* 系统标题徽标 */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-700/80">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
          <span className="text-xs font-bold text-cyan-300 font-mono tracking-wider flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>作业看板 · 全屏监控</span>
          </span>
        </div>

        {/* 切换全屏 / 窗口 */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full text-xs font-medium transition-colors cursor-pointer"
          title={isFullscreen ? '退出原生全屏' : '进入原生全屏模式'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px]">{isFullscreen ? '退出全屏' : '全屏'}</span>
        </button>

        {/* 刷新大屏数据 */}
        <button
          type="button"
          onClick={handleReload}
          className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full transition-colors cursor-pointer"
          title="重新载入大屏数据"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* 新标签页独立打开 */}
        <button
          type="button"
          onClick={handleOpenNewTab}
          className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full transition-colors cursor-pointer"
          title="在新浏览器标签页中打开独立大屏"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* 返回区域划分台账 */}
        {onNavigateToConfig && (
          <button
            type="button"
            onClick={onNavigateToConfig}
            className="flex items-center gap-1 px-2 py-1 border-l border-slate-700/80 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="返回区域划分台账"
          >
            <SlidersHorizontal className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">区域划分</span>
          </button>
        )}

        {/* 退出大屏 / 返回控制台 */}
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 border-l border-slate-700/80 text-xs font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-500/15 rounded-full transition-colors cursor-pointer"
          title="退出大屏模式，返回业务控制台 (快捷键 ESC)"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>返回控制台</span>
        </button>
      </div>

      {/* 顶部中央淡入浮动操作指引提示 */}
      {showExitHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-cyan-500/40 text-cyan-200 text-xs px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>已进入作业面全屏大屏监控 · 按 <b>ESC</b> 键或点击右上角可随时退出返回</span>
        </div>
      )}

      {/* 加载骨架占位 */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#00060f] z-30 text-cyan-400">
          <div className="relative w-14 h-14 flex items-center justify-center mb-4">
            <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <Tv className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-base font-bold tracking-widest text-slate-100">
            正在载入智慧船厂在建船舶安全监控系统...
          </div>
          <div className="text-xs text-cyan-400/70 font-mono mt-1.5">
            全屏 1920x1080 空间数字孪生监控大盘 · SOURCE: yxkj-v8.html
          </div>
        </div>
      )}

      {/* 大屏核心 iframe 渲染区：100% 满屏无缝嵌入 */}
      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={`/yxkj-v8.html?t=${iframeKey}`}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 bg-[#00060f] flex-1"
        title="智慧船厂在建船舶安全监控系统"
        allow="fullscreen"
      />
    </div>
  );
}
