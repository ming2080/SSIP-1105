/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面大屏视图
 * 对应源码路径: src/yxkj-v8.html
 * 支持普通控制台大屏与展厅展示（默认全屏不退出、仅码头船舶项目自动轮播、与驾驶舱触摸互切）
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  RotateCw, 
  ArrowLeft, 
  Tv, 
  SlidersHorizontal,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface WorkfaceScreenViewProps {
  onExit?: () => void;
  onNavigateToConfig?: () => void;
  onNavigateToMonitor?: () => void;
  onNavigateToDashboard?: () => void;
  exhibitionMode?: boolean;
  pierOnly?: boolean;
  autoPlayShips?: boolean;
  onSwitchToDashboard?: () => void;
}

export function WorkfaceScreenView({
  onExit,
  onNavigateToConfig,
  onNavigateToDashboard,
  exhibitionMode = false,
  pierOnly = false,
  autoPlayShips = false,
  onSwitchToDashboard
}: WorkfaceScreenViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitHint, setShowExitHint] = useState(true);
  const [iframeKey, setIframeKey] = useState<number>(() => Date.now());
  const [isScreenSwitchOpen, setIsScreenSwitchOpen] = useState(false);
  const [screenSwitchLastInteractAt, setScreenSwitchLastInteractAt] = useState<number>(0);

  const touchScreenSwitch = useCallback(() => {
    setScreenSwitchLastInteractAt(Date.now());
  }, []);

  // 展厅右下角双屏切换栏：无操作 10 秒后自动滑回右下角收起（与驾驶舱一致）
  useEffect(() => {
    if (!exhibitionMode || !onSwitchToDashboard || !isScreenSwitchOpen) return;
    const timer = window.setTimeout(() => {
      setIsScreenSwitchOpen(false);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [exhibitionMode, onSwitchToDashboard, isScreenSwitchOpen, screenSwitchLastInteractAt]);

  // 监听 iframe 内部空白区域轻触事件，联动滑出/收起右下角切换栏（与驾驶舱一致）
  useEffect(() => {
    if (!exhibitionMode || !onSwitchToDashboard) return;
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === 'exhibition_toggle_screen_switch') {
        setIsScreenSwitchOpen(prev => {
          const next = !prev;
          if (next) setScreenSwitchLastInteractAt(Date.now());
          return next;
        });
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [exhibitionMode, onSwitchToDashboard]);

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (exhibitionMode) params.set('exhibition', '1');
    if (pierOnly || exhibitionMode) params.set('pierOnly', '1');
    if (autoPlayShips || exhibitionMode) params.set('autoPlayShips', '1');
    if (exhibitionMode) params.set('hideTopFs', '1');
    params.set('t', String(iframeKey));
    return `/yxkj-v8.html?${params.toString()}`;
  }, [exhibitionMode, pierOnly, autoPlayShips, iframeKey]);

  // 退出并返回原系统页面（仅非展厅模式下允许）
  const handleExit = useCallback(() => {
    if (exhibitionMode) return;
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
  }, [exhibitionMode, onExit, onNavigateToDashboard, onNavigateToConfig]);

  // 打开时默认为全屏显示 (既有 100vw x 100vh 满屏，也主动触发原生全屏)
  useEffect(() => {
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
      } catch {
        // 浏览器若因无前置交互阻止自动原生全屏，组件本身已采取 fixed inset-0 100vw x 100vh 沉浸式占满全屏
      }
    };

    const timer = setTimeout(requestAutoFullscreen, 60);
    const loadTimer = setTimeout(() => setIsLoading(false), 1200);
    const hintTimer = setTimeout(() => setShowExitHint(false), 3500);

    return () => {
      clearTimeout(timer);
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

  // 快捷键监听：普通模式 ESC 退出大屏；展厅展示模式默认大屏不退出系统
  useEffect(() => {
    if (exhibitionMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          handleExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exhibitionMode, handleExit]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else if (!exhibitionMode) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };

  const handleOpenNewTab = () => {
    window.open(iframeSrc, '_blank');
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-50 flex flex-col bg-[#00060f] overflow-hidden select-none"
    >
      {/* 顶部悬浮控制栏：仅普通控制台模式显示；展厅双屏切换统一采用右下角单独滑出，与驾驶舱保持完全一致 */}
      {!exhibitionMode ? (
        <div className="absolute top-3 right-4 z-40 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/40 shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_15px_rgba(0,229,255,0.25)] transition-all hover:bg-slate-900/98">
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-700/80">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]" />
            <span className="text-xs font-bold text-cyan-300 font-mono tracking-wider flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>作业看板 · 全屏监控</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full text-xs font-medium transition-colors cursor-pointer"
            title={isFullscreen ? '退出原生全屏' : '进入原生全屏模式'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{isFullscreen ? '退出全屏' : '全屏'}</span>
          </button>

          <button
            type="button"
            onClick={handleReload}
            className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full transition-colors cursor-pointer"
            title="重新载入大屏数据"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="p-1 text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/15 rounded-full transition-colors cursor-pointer"
            title="在新浏览器标签页中打开独立大屏"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

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
      ) : onSwitchToDashboard ? (
        <>
          {/* 右下角收起态侧边滑出拉手（仅保留左箭头，与展厅驾驶舱样式及交互完全一致） */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsScreenSwitchOpen(true);
              touchScreenSwitch();
            }}
            className={`fixed bottom-5 right-0 z-50 flex items-center justify-center pl-2.5 pr-2 py-3 rounded-l-full bg-[#041936]/92 hover:bg-[#082b5c] backdrop-blur-xl border-y border-l border-cyan-400/60 text-cyan-100 hover:text-white shadow-[-6px_4px_24px_rgba(0,0,0,0.75),0_0_16px_rgba(0,210,255,0.28)] transition-all duration-300 ease-out cursor-pointer active:scale-95 group ${
              isScreenSwitchOpen
                ? 'translate-x-full opacity-0 pointer-events-none'
                : 'translate-x-0 opacity-100 pointer-events-auto'
            }`}
            title="点击展开大屏切换"
          >
            <ChevronLeft className="w-4 h-4 text-[#00d2ff] group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* 右下角滑出态：驾驶舱 / 作业面大屏切换胶囊（与展厅驾驶舱样式及交互完全一致） */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              touchScreenSwitch();
            }}
            onMouseDown={touchScreenSwitch}
            onTouchStart={touchScreenSwitch}
            className={`fixed bottom-5 right-4 z-50 transition-all duration-300 ease-out ${
              isScreenSwitchOpen
                ? 'translate-x-0 opacity-100 pointer-events-auto'
                : 'translate-x-[120%] opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5 bg-[#03152d]/95 backdrop-blur-xl p-1.5 rounded-full border border-cyan-400/65 shadow-[0_12px_36px_rgba(0,0,0,0.88),0_0_24px_rgba(0,210,255,0.35)]">
              <button
                type="button"
                onClick={() => {
                  touchScreenSwitch();
                  onSwitchToDashboard();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-cyan-200 hover:text-white hover:bg-cyan-500/20 text-xs font-extrabold tracking-wide active:scale-95 transition-all cursor-pointer"
                title="触摸切换回驾驶舱独立全屏视图"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>驾驶舱</span>
              </button>
              <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-extrabold tracking-wide shadow-[0_0_14px_rgba(0,210,255,0.55)]">
                <Tv className="w-3.5 h-3.5" />
                <span>作业面大屏</span>
              </span>
              <button
                type="button"
                onClick={() => setIsScreenSwitchOpen(false)}
                className="w-8 h-8 rounded-full bg-[#0b2447]/80 hover:bg-[#133b6e] border border-[#1f4a7c] hover:border-cyan-400/60 text-[#8ab4f8] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95 ml-0.5"
                title="收起至右下角"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* 顶部中央淡入浮动操作指引提示 */}
      {showExitHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-cyan-500/40 text-cyan-200 text-xs px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-fadeIn pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>
            {exhibitionMode
              ? '已进入展厅全屏作业看板 · 仅显示部署码头船舶项目并自动轮播切换'
              : <>已进入作业面全屏大屏监控 · 按 <b>ESC</b> 键或点击右上角可随时退出返回</>}
          </span>
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
            {exhibitionMode
              ? '展厅独立全屏展示大盘 · 部署码头船舶自动轮播'
              : '全屏 1920x1080 空间数字孪生监控大盘'}
          </div>
        </div>
      )}

      {/* 大屏核心 iframe 渲染区：100% 满屏无缝嵌入 */}
      <iframe
        key={iframeKey}
        ref={iframeRef}
        src={iframeSrc}
        onLoad={() => setIsLoading(false)}
        className="w-full h-full border-0 bg-[#00060f] flex-1"
        title="智慧船厂在建船舶安全监控系统"
        allow="fullscreen"
      />
    </div>
  );
}
