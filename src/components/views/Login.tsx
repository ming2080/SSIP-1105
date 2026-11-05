import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertTriangle, 
  ShieldCheck, 
  X,
  CheckCircle2,
  Layers
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
  const [showForgotModal, setShowForgotModal] = useState(false);

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
    <div className={`relative w-screen h-screen overflow-hidden select-none bg-gradient-to-br from-[#dbe5f1] via-[#edf3f8] to-[#d4e1ee] font-sans flex flex-col justify-between text-slate-800 ${reduceMotion ? 'reduce-motion-active' : ''}`}>
      
      {/* 1. 背景科技互联微光与融合纹理（与附图的 tech-link 风格自然融合） */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* 左侧柔和科技光晕 */}
        <div className="absolute top-[20%] left-[8%] w-[520px] h-[520px] rounded-full bg-cyan-400/12 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[22%] w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-[90px]" />
        
        {/* 背景轻量科技电路拓扑微光连线 */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40" 
          viewBox="0 0 1440 900" 
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M 80 420 H 320 L 400 500 H 680" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.6" />
          <path d="M 220 180 V 320 L 300 400 V 620" stroke="#0284c7" strokeWidth="1" strokeDasharray="3 5" opacity="0.45" />
          <path d="M 520 260 L 640 380 H 760" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 5" opacity="0.5" />
          <circle cx="400" cy="500" r="3.5" fill="#06b6d4" opacity="0.8" />
          <circle cx="300" cy="400" r="3" fill="#0284c7" opacity="0.7" />
          <circle cx="640" cy="380" r="3.5" fill="#38bdf8" opacity="0.75" />
        </svg>

        {/* 边缘微光过渡 */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#dbe7f2]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#d5e3f0]/70 to-transparent" />
      </div>

      {/* 2. 顶部明亮品牌导航条 */}
      <header className="relative z-20 w-full px-6 sm:px-10 lg:px-14 pt-3 pb-2.5 flex items-center justify-between border-b border-blue-200/50 bg-white/80 backdrop-blur-md shadow-2xs">
        
        {/* 左侧品牌区 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
            <Layers className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">
                智慧船厂
              </span>
              <span className="text-[11px] font-semibold text-blue-600 tracking-wider font-mono hidden sm:inline-block border-l border-slate-300 pl-2">
                DIGITAL SHIPYARD
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/90 font-mono">
                PRO V2.6
              </span>
            </div>
            <span className="text-[10px] text-slate-500 tracking-wider font-normal">
              数字化船厂管理平台
            </span>
          </div>
        </div>
      </header>

      {/* 3. 中部核心区域：左侧插图适中比例（改为原先三分之二）及双语标题，右侧登录表单 */}
      <main className="relative z-20 flex-1 w-full px-6 sm:px-10 lg:px-14 py-3 sm:py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-12 max-w-[1500px] mx-auto min-h-0">
        
        {/* 左侧展示区：双语系统标题与三分之二适中比例居中的 3D 智慧船厂插画，与明亮背景无缝融合，无任何边框/底卡 */}
        <div className="flex-1 w-full max-w-[580px] xl:max-w-[640px] flex flex-col items-center justify-center text-center py-1 select-none z-20">
          
          {/* 左侧文字：中文深蓝、英文浅蓝，标题互不重叠且不与插图重叠 */}
          <div className="space-y-1.5 mb-4 sm:mb-5 w-full">
            <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-black tracking-tight text-[#0f3875] leading-tight drop-shadow-xs">
              智慧船厂 数字化安全管控平台
            </h1>
            <p className="text-xs sm:text-sm xl:text-base font-semibold text-[#0284c7] tracking-wider font-mono">
              Smart Shipyard Digital Safety Control Platform
            </p>
          </div>

          {/* 左侧插画：尺寸为三分之二比例，边缘采用光学高斯模糊漫反射与多重渐变柔化遮罩，与背景完全无缝融为一体 */}
          <div className="relative w-full max-w-[480px] xl:max-w-[540px] 2xl:max-w-[580px] flex items-center justify-center">
            
            {/* 底层 1：环境漫反射光晕，消除任何色彩断层 */}
            <div 
              className="absolute -inset-10 pointer-events-none -z-20 rounded-full"
              style={{
                background: 'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(215, 232, 248, 0.8) 0%, rgba(222, 235, 247, 0.45) 50%, transparent 85%)',
                filter: 'blur(28px)',
              }}
            />

            {/* 底层 2：原图大半径边缘高斯模糊层，使插图色调自然散开渗透到底色中，彻底打散边缘硬度 */}
            <div 
              className="absolute inset-0 pointer-events-none -z-10 overflow-visible"
              style={{
                filter: 'blur(32px)',
                opacity: 0.7,
                transform: 'scale(1.1)',
              }}
            >
              <img 
                src="/assets/v4_large.jpg" 
                alt="" 
                className="w-full h-full object-contain mx-auto block" 
              />
            </div>

            {/* 表层：高清核心主体，边缘通过多阶平滑三次曲线径向衰减，与底层模糊层完全融合 */}
            <img 
              src="/assets/v4_large.jpg" 
              alt="智慧船厂 数字化安全管控平台场景" 
              className="relative z-10 w-full h-auto max-h-[330px] sm:max-h-[370px] xl:max-h-[410px] 2xl:max-h-[440px] object-contain mx-auto block select-none pointer-events-none" 
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000000 28%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.25) 74%, rgba(0,0,0,0.05) 86%, transparent 95%)',
                maskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000000 28%, rgba(0,0,0,0.92) 44%, rgba(0,0,0,0.62) 60%, rgba(0,0,0,0.25) 74%, rgba(0,0,0,0.05) 86%, transparent 95%)',
              }}
            />
          </div>

        </div>

        {/* 右侧交互登录卡片：明亮通透、干净专业，完整保留所有登录能力 */}
        <div className="w-full md:w-[410px] shrink-0 mx-auto lg:mx-0">
          <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(30,58,138,0.12),0_2px_8px_rgba(0,0,0,0.03)] border border-white/90 overflow-hidden text-left transition-all">
            
            {/* 顶端清爽蓝色装饰条 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500" />

            {/* 卡片头部 */}
            <div className="flex flex-col items-center justify-center text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                欢迎登录
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 tracking-wide">
                智慧船厂空间数字化管理平台
              </p>
            </div>

            {/* 错误提示 */}
            {errorMessage && (
              <div className="mb-3 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 登录表单 */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 用户名/工号 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  账号名称 / 工号
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入工号或用户名"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/80 hover:bg-white focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                  />
                </div>
              </div>

              {/* 密码输入框 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  登录口令
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入登录口令"
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/80 hover:bg-white focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                    title={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 记住账号与忘记密码 */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500/30 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium">记住当前账号</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
                >
                  忘记密码?
                </button>
              </div>

              {/* 登录操作主按钮 */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>身份验证中...</span>
                    </div>
                  ) : (
                    <>
                      <span>安全登录系统</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 快速体验角色一键切换 */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 font-medium">
                <span>体验演示账号（点击快速填入）:</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', '123456')}
                  className={`px-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer border ${
                    username === 'admin' 
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  管理员
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('safety', '123456')}
                  className={`px-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer border ${
                    username === 'safety' 
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  安全总监
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('inspector', '123456')}
                  className={`px-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer border ${
                    username === 'inspector' 
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  当班安全员
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('remote_safe', '123456')}
                  className={`px-1 py-1 rounded text-[10px] font-medium transition-all cursor-pointer border ${
                    username === 'remote_safe' 
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  远程安全员
                </button>
              </div>

              {/* 游客直接免密进入通道 */}
              <div className="mt-2.5 text-center">
                <button
                  type="button"
                  onClick={() => onLogin({ username: 'admin', role: '系统管理员', name: '张工 (系统管理员)' })}
                  className="text-[10px] font-medium text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>游客直接免密进入工作台</span>
                  <span>➔</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* 4. 底部微型版权声明栏 */}
      <footer className="relative z-20 w-full px-6 sm:px-10 py-2.5 flex items-center justify-between text-[10px] text-slate-600 border-t border-blue-200/50 bg-white/60 backdrop-blur-xs">
        <div>
          <span>© 2026 智慧船厂数字化协同与在建船舶安全管控系统 All Rights Reserved.</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>三维立体协同平台</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>安全生产管控底座</span>
          </span>
        </div>
      </footer>

      {/* 忘记密码引导弹窗 */}
      {showForgotModal && (
        <div 
          onClick={() => setShowForgotModal(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 text-slate-800 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">密码找回与重置服务</h3>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 py-1">
              <p>为了保障智慧船厂工业数据机密性，系统密码重置遵循安保审计流程：</p>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">数字化管控中心内线:</span>
                  <span className="font-mono font-bold text-slate-800">8806 / 8808</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">安全值班主任专线:</span>
                  <span className="font-mono font-bold text-slate-800">138-0580-9988</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">演示环境默认口令:</span>
                  <span className="font-mono font-bold text-blue-600">123456</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                您也可以直接点击登录卡片下方预设角色（管理员、安全总监、当班安全员、远程安全员）或“游客直接免密进入”。
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

