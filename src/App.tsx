/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Login } from './components/views/Login';
import { MobileAlarmApp } from './components/mobile/MobileAlarmApp';

export interface UserSession {
  username: string;
  role: string;
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('shipyard_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 是否处于独立移动端 H5 模式 (通过URL参数 ?view=m_alarm 或事件切换)
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'mobile' || params.get('view') === 'm_alarm' || window.location.hash.includes('m_alarm');
    } catch {
      return false;
    }
  });

  const [mobileAlarmId, setMobileAlarmId] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || 'ALM-20260906-001';
    } catch {
      return 'ALM-20260906-001';
    }
  });

  // 全局移动端导航事件监听
  useEffect(() => {
    const handleNavigateMobile = (e: any) => {
      if (e.detail?.alarmId) {
        setMobileAlarmId(e.detail.alarmId);
      }
      setIsMobileMode(true);
    };
    window.addEventListener('navigate_mobile_alarm', handleNavigateMobile);
    return () => window.removeEventListener('navigate_mobile_alarm', handleNavigateMobile);
  }, []);

  // 全局退出登录事件监听，方便跨组件解耦通信
  useEffect(() => {
    const handleGlobalLogout = () => {
      handleLogout();
    };
    window.addEventListener('app_logout', handleGlobalLogout);
    return () => window.removeEventListener('app_logout', handleGlobalLogout);
  }, []);

  const handleLogin = (userInfo?: any) => {
    const user: UserSession = (userInfo && typeof userInfo.username === 'string')
      ? { username: userInfo.username, role: userInfo.role || '系统管理员', name: userInfo.name || '张工 (系统管理员)' }
      : { 
          username: 'admin', 
          role: '系统管理员', 
          name: '张工 (系统管理员)' 
        };
    setCurrentUser(user);
    try {
      localStorage.setItem('shipyard_session_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('shipyard_session_user');
    } catch {
      // ignore
    }
  };

  // 1. 如果处于独立移动端H5模式 (无论是手机浏览器打开还是PC端点击切换)
  if (isMobileMode) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-slate-900">
        <MobileAlarmApp
          initialAlarmId={mobileAlarmId}
          onExitToPc={() => {
            setIsMobileMode(false);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('mode');
              url.searchParams.delete('view');
              window.history.replaceState({}, '', url.toString());
            } catch {
              // ignore
            }
          }}
        />
      </div>
    );
  }

  // 2. PC端未登录时展示精美登录页
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // 3. PC端已登录进入主系统
  return (
    <Layout 
      currentUser={currentUser} 
      onLogout={handleLogout} 
    />
  );
}

