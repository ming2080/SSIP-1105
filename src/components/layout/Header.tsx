import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  KeyRound, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  Layers,
  Smartphone,
  Tv,
  X
} from 'lucide-react';

interface HeaderProps {
  title: string;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

export function Header({ title, currentUser, onLogout }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部自动关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white/95 backdrop-blur-md relative z-30 shrink-0 select-none shadow-2xs">
      
      {/* 操作提示 Toast */}
      {toastMessage && (
        <div className="absolute top-16 right-6 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xl border border-slate-700 z-50 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 左侧：页面标题与当前系统导航位置 */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase border-l-3 border-blue-600 pl-2.5 flex items-center gap-2">
          <span>{title}</span>
        </h2>
        <span className="text-[11px] text-slate-400 hidden md:inline-block">
          | 智慧船厂综合管控平台
        </span>
      </div>

      {/* 右侧：功能搜索、通知、设置及【账号登录信息】 */}
      <div className="flex items-center gap-3">
        


        {/* 移动端入口快捷按钮 */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigate_mobile_alarm', { detail: { alarmId: 'ALM-20260906-001' } }));
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
          title="移动端"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>移动端</span>
        </button>

        {/* 隐藏顶部大屏监控按钮 (对应页面与功能保留以备后期使用) */}
        {/* 
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'workface_screen' } }));
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-cyan-300 rounded-lg text-xs font-bold border border-cyan-800/80 shadow-sm transition-all cursor-pointer active:scale-95 group"
          title="进入作业面大屏安全监控系统 (src/yxkj-v8.html)"
        >
          <Tv className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="text-white">大屏监控</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        </button>
        */}

        {/* 消息通知中心 */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsUserMenuOpen(false);
            }}
            className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="通知中心"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
          </button>

          {/* 通知弹层 */}
          {isNotificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">系统通知 (3条未读)</span>
                <button 
                  onClick={() => triggerToast('已全部标记为已读')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  全部已读
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                  <div className="flex items-center justify-between text-blue-800 font-semibold mb-0.5">
                    <span>1号造船台 电子围栏</span>
                    <span className="text-[10px] text-slate-400 font-mono">10:42</span>
                  </div>
                  <p className="text-[11px] text-slate-600">合拢焊接工段作业人员安全帽穿戴规范已确认。</p>
                </div>
                <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                  <div className="flex items-center justify-between text-amber-800 font-semibold mb-0.5">
                    <span>气体传感器检测</span>
                    <span className="text-[10px] text-slate-400 font-mono">09:15</span>
                  </div>
                  <p className="text-[11px] text-slate-600">3号码头 VLCC 压载舱通风环境恢复正常。</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold mb-0.5">
                    <span>船模数据同步</span>
                    <span className="text-[10px] text-slate-400 font-mono">08:30</span>
                  </div>
                  <p className="text-[11px] text-slate-500">17.4万m³ LNG 船 3D 模型分段数据更新完毕。</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 帮助中心按钮 */}
        <button 
          onClick={() => triggerToast('已打开智慧船厂操作指南与技术手册')}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="帮助手册"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* 垂直分割线 */}
        <div className="h-5 w-px bg-slate-200 mx-1"></div>

        {/* 核心需求：右上角账号登录信息（头像与名称展示） */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotificationOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100/90 transition-all border border-transparent hover:border-slate-200 cursor-pointer group"
            title="点击查看账号信息"
          >
            {/* 头像区域（带在线状态绿点） */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span>管</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-2xs"></span>
            </div>

            {/* 名称与角色展示 */}
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>{currentUser?.name?.split(' ')[0] || '系统管理员'}</span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight font-medium">
                {currentUser?.role || '超级管理员'}
              </div>
            </div>

            {/* 下拉小箭头 */}
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* 用户信息与操作下拉菜单 */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn text-slate-700">
              
              {/* 用户信息卡片头部 */}
              <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-100 mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                    <span>{currentUser?.role?.[0] || '管'}</span>
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || '系统管理员'}</h4>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.username || 'admin'}@shipyard.cn</p>
                    <div className="inline-flex items-center gap-1 mt-1 bg-blue-100/70 text-blue-700 text-[10px] px-1.5 py-0.2 rounded font-medium">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span>{currentUser?.role || '总控中心 · 最高权限'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 菜单列表 */}
              <div className="space-y-0.5 text-xs">
                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>个人中心</span>
                </button>

                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    triggerToast('已进入系统安全策略与鉴权配置');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors text-left"
                >
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>修改登录密码</span>
                </button>

                <button 
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    triggerToast('已为您调取近期系统操作审计日志');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>操作日志与审计</span>
                </button>
              </div>

              {/* 分割线与退出登录 */}
              <div className="my-1 border-t border-slate-100"></div>

              <button 
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    triggerToast('已安全退出当前会话');
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left text-xs font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 个人中心信息弹窗 */}
      {showProfileModal && (
        <div 
          onClick={() => setShowProfileModal(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-slate-700"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">账号登录信息详情</h3>
                  <p className="text-[11px] text-slate-400">查看当前登录操作员身份与权限</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">用户姓名</span>
                <span className="font-bold text-slate-800">系统管理员 (张工)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">工号编号</span>
                <span className="font-mono text-slate-800 font-bold">SH-2026-8801</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">所属部门</span>
                <span className="text-slate-800 font-medium">工程技术与安全管理部</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">系统角色</span>
                <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  超级管理员 (全部模块管控)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">登录状态</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 在线就绪
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400">本次登录时间</span>
                <span className="font-mono text-slate-600">2026-08-28 08:30:15</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-blue-500/20"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}

