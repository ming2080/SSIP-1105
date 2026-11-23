/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 展厅展示 - 驾驶舱（展示）独立全屏交互视图
 * 核心能力：
 * 1. 默认独立全屏页面，无返回业务管理后台按钮；
 * 2. 支持主楼可触摸交互模式下在「驾驶舱」与「作业面大屏」之间来回无缝切换；
 * 3. 任何时候界面无操作超过 5 分钟（300 秒）自动返回「驾驶舱（展示）」厂区首页。
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2 } from 'lucide-react';
import { Dashboard } from '../Dashboard';
import { WorkfaceScreenView } from '../workface/WorkfaceScreenView';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 分钟无操作自动复位

export function ExhibitionDashboardView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'workface'>('dashboard');
  const [resetHomeSignal, setResetHomeSignal] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const idleTimerRef = useRef<number | null>(null);
  const lastMoveSignalRef = useRef<number>(0);

  // 进入独立全屏页面时自动请求原生全屏（浏览器受限时仍由 fixed inset-0 w-screen h-screen 兜底全屏）
  const requestNativeFullscreen = useCallback(async () => {
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
      // ignore if browser requires user gesture
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      requestNativeFullscreen();
    }, 60);

    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [requestNativeFullscreen]);

  // 超时复位：切回驾驶舱并回到厂区首页
  const resetToYardHome = useCallback(() => {
    setActiveScreen('dashboard');
    setResetHomeSignal(prev => prev + 1);
  }, []);

  const scheduleIdleReset = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      resetToYardHome();
    }, IDLE_TIMEOUT_MS);
  }, [resetToYardHome]);

  // 全局交互监测（包含当前页面触摸/鼠标/按键以及作业面大屏 iframe 内部操作转发）
  useEffect(() => {
    scheduleIdleReset();

    const handleImmediateActivity = () => {
      scheduleIdleReset();
    };

    const handleThrottledActivity = () => {
      const now = Date.now();
      if (now - lastMoveSignalRef.current < 1000) return;
      lastMoveSignalRef.current = now;
      scheduleIdleReset();
    };

    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'exhibition_user_activity') {
        scheduleIdleReset();
      }
    };

    const immediateEvents = ['pointerdown', 'touchstart', 'mousedown', 'wheel', 'keydown', 'click'];
    const throttledEvents = ['mousemove', 'touchmove'];

    immediateEvents.forEach(ev => window.addEventListener(ev, handleImmediateActivity, { passive: true, capture: true }));
    throttledEvents.forEach(ev => window.addEventListener(ev, handleThrottledActivity, { passive: true, capture: true }));
    window.addEventListener('message', handleIframeMessage);

    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      immediateEvents.forEach(ev => window.removeEventListener(ev, handleImmediateActivity, { capture: true }));
      throttledEvents.forEach(ev => window.removeEventListener(ev, handleThrottledActivity, { capture: true }));
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [scheduleIdleReset]);

  const handleSwitchScreen = (target: 'dashboard' | 'workface') => {
    scheduleIdleReset();
    requestNativeFullscreen();
    setActiveScreen(target);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-50 bg-[#020c1b] overflow-hidden select-none"
    >
      {/* 主页：驾驶舱独立全屏视图（无返回系统按钮，顶栏内置触摸双屏互切，超时自动回归厂区首页） */}
      <div className={activeScreen === 'dashboard' ? 'w-full h-full relative' : 'hidden'}>
        <Dashboard
          exhibitionMode={true}
          resetHomeSignal={resetHomeSignal}
          onExhibitionSwitchWorkface={() => handleSwitchScreen('workface')}
        />

        {!isFullscreen && (
          <button
            type="button"
            onClick={requestNativeFullscreen}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#041936]/85 hover:bg-[#092b5a] text-cyan-200 border border-[#00d2ff]/45 text-[11px] font-semibold shadow-lg backdrop-blur-md cursor-pointer transition-all active:scale-95"
            title="开启浏览器原生全屏展示"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>进入全屏展示</span>
          </button>
        )}
      </div>

      {/* 次页：作业面大屏独立展示视图（支持触摸一键切换回驾驶舱，仅展示码头船舶自动轮播） */}
      {activeScreen === 'workface' && (
        <WorkfaceScreenView
          exhibitionMode={true}
          pierOnly={true}
          autoPlayShips={true}
          onSwitchToDashboard={() => handleSwitchScreen('dashboard')}
        />
      )}
    </div>
  );
}
