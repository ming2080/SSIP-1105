import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertTriangle
} from 'lucide-react';

interface LoginProps {
  onLogin: (userInfo?: { username: string; role: string; name: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 减弱动效偏好 (优先读取 localStorage，其次读取系统 prefers-reduced-motion)
  const [reduceMotion] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shipyard_reduce_motion');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  // 初始化检查记住的账号
  useEffect(() => {
    const savedUser = localStorage.getItem('shipyard_remembered_user');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  // 提交登录逻辑（严格保留原有业务逻辑）
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('请输入用户名或工号');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('请输入登录口令');
      return;
    }

    setIsLoading(true);

    // 记住账号处理
    if (rememberMe) {
      localStorage.setItem('shipyard_remembered_user', username.trim());
    } else {
      localStorage.removeItem('shipyard_remembered_user');
    }

    // 鉴权延迟模拟与角色分配
    setTimeout(() => {
      setIsLoading(false);
      let role = '系统管理员';
      let name = '张工 (系统管理员)';

      const lower = username.toLowerCase();
      if (lower.includes('safe') || username.includes('安全')) {
        role = '安全总监';
        name = '陈志强 (安全总监)';
      } else if (lower.includes('inspect') || username.includes('巡检')) {
        role = '当班安全员';
        name = '李伟 (当班安全员)';
      } else if (lower.includes('remote') || username.includes('远程')) {
        role = '远程安全员';
        name = '王敏 (远程安全员)';
      }

      onLogin({ username: username.trim(), role, name });
    }, 450);
  };

  // 快捷体验账号填充
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden select-none bg-[#e8f1fa] font-sans flex flex-col justify-between text-slate-800 ${reduceMotion ? 'reduce-motion-active' : ''}`}>
      
      {/* 1. 背景科技柔光与弧形波浪光带（严格还原效果图中的大弧度流线与电路脉络） */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* 左上角大弧度科技光波 */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[58%] h-[68%] rounded-full opacity-60 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85) 0%, rgba(210,230,250,0.5) 45%, transparent 72%)',
            filter: 'blur(40px)',
          }}
        />

        {/* 左下角至底部优雅流线弧形波浪带 */}
        <svg 
          className="absolute bottom-0 left-0 w-[65%] h-[32%] pointer-events-none opacity-70"
          viewBox="0 0 1000 400" 
          fill="none"
          preserveAspectRatio="none"
        >
          <path 
            d="M -50 180 Q 280 280 580 320 T 1050 400 L 1050 450 L -50 450 Z" 
            fill="url(#bottomWaveGrad)" 
            opacity="0.8"
          />
          <path 
            d="M -50 120 Q 240 230 620 280 T 1020 370" 
            stroke="url(#lineWaveGrad)" 
            strokeWidth="3.5"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="bottomWaveGrad" x1="0" y1="200" x2="800" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b6d5f4" stopOpacity="0.75" />
              <stop offset="0.6" stopColor="#cde2f8" stopOpacity="0.45" />
              <stop offset="1" stopColor="#e8f1fa" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineWaveGrad" x1="0" y1="120" x2="1000" y2="350" gradientUnits="userSpaceOnUse">
              <stop stopColor="#93c5fd" stopOpacity="0.8" />
              <stop offset="1" stopColor="#bae6fd" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* 右上角及全局浅色工业数字拓扑电路光丝与脉冲节点 */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-45" 
          viewBox="0 0 1440 900" 
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M 850 120 L 1050 120 L 1180 200 H 1380" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.65" />
          <path d="M 1180 200 V 380 L 1260 440" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 5" opacity="0.45" />
          <path d="M 980 60 L 1100 150 V 280" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <circle cx="1050" cy="120" r="3.5" fill="#38bdf8" opacity="0.85" />
          <circle cx="1180" cy="200" r="4" fill="#0284c7" opacity="0.8" />
          <circle cx="1260" cy="440" r="3" fill="#38bdf8" opacity="0.75" />
          <circle cx="980" cy="60" r="3" fill="#06b6d4" opacity="0.7" />
        </svg>

        {/* 右侧微光环境漫射 */}
        <div className="absolute top-[18%] right-[8%] w-[460px] h-[460px] rounded-full bg-blue-400/10 blur-[110px]" />
      </div>

      {/* 2. 中部核心交互区域（与参考图完全一致的双列布局） */}
      <main className="relative z-20 flex-1 w-full px-6 sm:px-12 lg:px-16 xl:px-20 py-4 sm:py-6 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 max-w-[1560px] mx-auto min-h-0">
        
        {/* 左侧展示区：标题栏左对齐、专属竖线隔断，下方立体船厂场景 */}
        <div className="flex-1 w-full max-w-[620px] xl:max-w-[700px] flex flex-col items-start justify-center py-2 select-none z-20">
          
          {/* 左侧标题群（左对齐，徽标 + 细竖线分割 + 中文主标/英文副标） */}
          <div className="flex items-center gap-4 sm:gap-5 mb-5 sm:mb-7">
            {/* 徽标主体（保留用户指定之流线型破浪船体 Logo） */}
            <div className="relative group shrink-0 flex items-center justify-center">
              <div className="absolute -inset-2 rounded-2xl bg-cyan-400/25 blur-md group-hover:bg-cyan-400/40 transition-all pointer-events-none" />
              <img 
                src="/assets/aistudio/image_1e3c698f.png" 
                alt="智慧船厂安全管控平台徽标" 
                className="relative z-10 w-13 h-auto sm:w-15 max-h-13 sm:max-h-15 object-contain drop-shadow-[0_4px_12px_rgba(2,132,199,0.32)] select-none pointer-events-none transform group-hover:scale-105 transition-transform duration-300" 
              />
            </div>

            {/* 优雅深蓝微细竖向分隔线 */}
            <div className="w-[1.5px] h-11 sm:h-13 bg-[#0d3b7a]/35 rounded-full" />

            {/* 标题文字：中文深蓝（Bold 28-36px），英文浅蓝等宽无衬线（Semibold） */}
            <div className="flex flex-col justify-center text-left">
              <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-black tracking-tight text-[#0f3875] leading-tight">
                智慧船厂 数字化安全管控平台
              </h1>
              <p className="text-xs sm:text-sm xl:text-[15px] font-semibold text-[#0284c7] tracking-wide font-sans mt-1">
                Smart Shipyard Digital Safety Control Platform
              </p>
            </div>
          </div>

          {/* 左侧 3D 智慧船厂场景插画（保持不变，自然融入背景） */}
          <div className="relative w-full max-w-[520px] xl:max-w-[580px] flex items-center justify-center -ml-2">
            
            {/* 底层漫反射光晕 */}
            <div 
              className="absolute -inset-10 pointer-events-none -z-20 rounded-full"
              style={{
                background: 'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(215, 232, 248, 0.85) 0%, rgba(222, 235, 247, 0.5) 50%, transparent 85%)',
                filter: 'blur(28px)',
              }}
            />

            {/* 底层大半径高斯模糊融合 */}
            <div 
              className="absolute inset-0 pointer-events-none -z-10 overflow-visible"
              style={{
                filter: 'blur(32px)',
                opacity: 0.68,
                transform: 'scale(1.1)',
              }}
            >
              <img 
                src="/assets/v4_large.jpg" 
                alt="" 
                className="w-full h-full object-contain mx-auto block" 
              />
            </div>

            {/* 表层插画 */}
            <img 
              src="/assets/v4_large.jpg" 
              alt="智慧船厂 数字化安全管控平台场景" 
              className="relative z-10 w-full h-auto max-h-[350px] sm:max-h-[390px] xl:max-h-[430px] object-contain mx-auto block select-none pointer-events-none" 
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000000 28%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.25) 74%, rgba(0,0,0,0.05) 86%, transparent 95%)',
                maskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000000 28%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.25) 74%, rgba(0,0,0,0.05) 86%, transparent 95%)',
              }}
            />
          </div>

        </div>

        {/* 右侧交互登录卡片：完全复刻参考图的精致圆角、纯白磨砂与专业表单样式 */}
        <div className="w-full sm:w-[430px] lg:w-[440px] xl:w-[450px] shrink-0 mx-auto lg:mx-0">
          <div className="relative rounded-[22px] bg-white/95 backdrop-blur-xl px-7 py-8 sm:px-8 sm:py-9 shadow-[0_18px_50px_rgba(28,68,135,0.14),0_2px_10px_rgba(0,0,0,0.03)] border border-white overflow-hidden text-left transition-all">
            
            {/* 顶端清爽蓝色装饰细条 */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

            {/* 卡片头部：欢迎登录与短下划线标识，副标紧凑居中 */}
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <div className="relative inline-block pb-1">
                <h2 className="text-2xl sm:text-[26px] font-black text-[#1e293b] tracking-tight">
                  欢迎登录
                </h2>
                {/* 欢迎登录字样下方的特征装饰短蓝线 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-600 rounded-full" />
              </div>
              <p className="text-[12px] text-slate-500 mt-2 font-medium tracking-wide">
                智慧船厂空间数字化管理平台
              </p>
            </div>

            {/* 错误提示 */}
            {errorMessage && (
              <div className="mb-4 px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 账号名称 / 工号 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  账号名称 / 工号
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <User className="w-[18px] h-[18px] stroke-[1.8]" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入工号或用户名"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-white hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all font-medium"
                  />
                </div>
              </div>

              {/* 登录口令 */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  登录口令
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-[18px] h-[18px] stroke-[1.8]" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入登录口令"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-white hover:border-slate-300 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                    title={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 记住当前账号 */}
              <div className="flex items-center text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500/25 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium">记住当前账号</span>
                </label>
              </div>

              {/* 安全登录系统主按钮（高饱和度纯粹科技蓝，右侧白色右箭头） */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg bg-[#0266e8] hover:bg-[#0057c7] active:bg-[#004bb0] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>身份验证中...</span>
                    </div>
                  ) : (
                    <>
                      <span>安全登录系统</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 体验演示账号（胶囊卡片样式，选中态高亮，完全参照效果图） */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-600 mb-2 font-medium">
                体验演示账号（点击快速登入）：
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', '123456')}
                  className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer border text-center ${
                    username === 'admin' 
                      ? 'bg-blue-50 text-blue-600 border-blue-400 font-bold shadow-2xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  管理员
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('safety', '123456')}
                  className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer border text-center ${
                    username === 'safety' 
                      ? 'bg-blue-50 text-blue-600 border-blue-400 font-bold shadow-2xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  安全总监
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('inspector', '123456')}
                  className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer border text-center ${
                    username === 'inspector' 
                      ? 'bg-blue-50 text-blue-600 border-blue-400 font-bold shadow-2xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  当班安全员
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('remote_safe', '123456')}
                  className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all cursor-pointer border text-center ${
                    username === 'remote_safe' 
                      ? 'bg-blue-50 text-blue-600 border-blue-400 font-bold shadow-2xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  远程安全员
                </button>
              </div>

              {/* 游客直接免密进入工作台通道 */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => onLogin({ username: 'admin', role: '系统管理员', name: '张工 (系统管理员)' })}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>游客直接免密进入工作台</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* 3. 底部版权信息：居中显示，精简专注 */}
      <footer className="relative z-20 w-full px-6 sm:px-10 py-3 flex items-center justify-center text-center text-[11px] text-slate-500 border-t border-blue-200/50 bg-white/60 backdrop-blur-xs">
        <span className="tracking-wide">
          © 2026 智慧船厂数字化协同与在建船舶安全管控系统 All Rights Reserved.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;中福云信息科技有限公司&nbsp;&nbsp;&nbsp;提供技术支持
        </span>
      </footer>

    </div>
  );
}

