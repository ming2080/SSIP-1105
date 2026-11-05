import React, { useState, useEffect, useRef } from 'react';
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

// 智慧船厂现场 IoT 传感器与数字孪生空间节点配置
interface DataNode {
  id: string;
  label: string;
  code: string;
  baseX: number; // 0 - 100 比例
  baseY: number; // 0 - 100 比例
  depth: number; // 视差位移乘数
  floatPhase: number;
  floatSpeed: number;
  size: number;
  color: string;
  status: 'active' | 'synced' | 'online';
}

const SHIPYARD_DATA_NODES: DataNode[] = [
  { id: 'n1', label: '1号船坞·三维基站', code: 'UWB-DK01', baseX: 16, baseY: 22, depth: 28, floatPhase: 0, floatSpeed: 0.0012, size: 5, color: '#0284c7', status: 'online' },
  { id: 'n2', label: '2号龙门吊·风速载荷', code: 'CRANE-T800', baseX: 34, baseY: 15, depth: 36, floatPhase: 1.8, floatSpeed: 0.0016, size: 4, color: '#06b6d4', status: 'synced' },
  { id: 'n3', label: 'H1851A·双层底压载舱', code: 'CONF-T04', baseX: 44, baseY: 38, depth: 45, floatPhase: 3.2, floatSpeed: 0.0014, size: 5, color: '#3b82f6', status: 'active' },
  { id: 'n4', label: '机舱主柴油机台位', code: 'MCR-E01', baseX: 12, baseY: 72, depth: 22, floatPhase: 4.1, floatSpeed: 0.0011, size: 4, color: '#0ea5e9', status: 'online' },
  { id: 'n5', label: '涂装车间·VOC气体监测', code: 'GAS-P08', baseX: 52, baseY: 80, depth: 32, floatPhase: 2.4, floatSpeed: 0.0015, size: 4, color: '#0284c7', status: 'synced' },
  { id: 'n6', label: '数字化调度指挥中枢', code: 'RTK-HQ', baseX: 78, baseY: 14, depth: 40, floatPhase: 5.0, floatSpeed: 0.0013, size: 6, color: '#0284c7', status: 'active' },
  { id: 'n7', label: '3号码头·在建散货船', code: 'AIS-H1890', baseX: 88, baseY: 35, depth: 30, floatPhase: 1.2, floatSpeed: 0.0017, size: 4, color: '#06b6d4', status: 'online' },
  { id: 'n8', label: '舾装码头·高空防坠落', code: 'SAFE-R09', baseX: 72, baseY: 68, depth: 25, floatPhase: 3.7, floatSpeed: 0.0012, size: 4, color: '#38bdf8', status: 'synced' },
];

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 鼠标位置与平滑插值追踪（生成科技感视差与轻柔流动）
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const [nodesPosition, setNodesPosition] = useState<{ id: string; x: number; y: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

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

  // 鼠标移动监听与科技数据节点高帧率平滑插值微漂动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1920;
      const h = window.innerHeight || 1080;
      // 归一化为 -0.5 ~ 0.5 之间
      mousePos.current = {
        x: (e.clientX / w) - 0.5,
        y: (e.clientY / h) - 0.5
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let startTime = performance.now();
    const updateNodes = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      // 惯性平滑插值 (Lerp: 0.05 权重) 营造如水下/太空中柔和漂移的视差悬浮感
      smoothMouse.current.x += (mousePos.current.x - smoothMouse.current.x) * 0.045;
      smoothMouse.current.y += (mousePos.current.y - smoothMouse.current.y) * 0.045;

      const updated = SHIPYARD_DATA_NODES.map((node) => {
        // 自主轻柔波形浮动
        const floatX = Math.sin(node.floatPhase + elapsed * node.floatSpeed) * 8;
        const floatY = Math.cos(node.floatPhase + elapsed * node.floatSpeed * 1.2) * 8;
        
        // 随鼠标移动带来的视差漂动 (结合节点深度 depth)
        const parallaxX = smoothMouse.current.x * node.depth;
        const parallaxY = smoothMouse.current.y * node.depth;

        return {
          id: node.id,
          x: node.baseX + (parallaxX + floatX) / 16,
          y: node.baseY + (parallaxY + floatY) / 10
        };
      });

      setNodesPosition(updated);
      animFrameRef.current = requestAnimationFrame(updateNodes);
    };

    animFrameRef.current = requestAnimationFrame(updateNodes);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
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
      
      {/* 1. 丰富宏大的智慧船厂数字化背景：多阶流线波浪、远景造船龙门吊与船坞剪影微光、数字孪生坐标网格、罗盘雷达扫描环与全厂拓扑网络 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* 底层 1：超细微数字孪生网格坐标系 (微弱蓝灰色，提供工业数字化基底) */}
        <div 
          className="absolute inset-0 opacity-[0.28] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(2, 132, 199, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(2, 132, 199, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 90%)'
          }}
        />

        {/* 底层 2：左上角深海柔和科技光晕 */}
        <div 
          className="absolute -top-[18%] -left-[10%] w-[65%] h-[72%] rounded-full opacity-70 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(214,234,252,0.6) 42%, transparent 75%)',
            filter: 'blur(45px)',
          }}
        />

        {/* 底层 3：右上角微型海事雷达与航向罗盘刻度扫描环 (微光高质感) */}
        <svg 
          className="absolute top-[3%] right-[2%] w-[420px] h-[420px] pointer-events-none opacity-30 text-blue-500" 
          viewBox="0 0 300 300"
          fill="none"
        >
          {/* 雷达同心圆 */}
          <circle cx="150" cy="150" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
          <circle cx="150" cy="150" r="105" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <circle cx="150" cy="150" r="70" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
          <circle cx="150" cy="150" r="35" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          {/* 十字方位轴 */}
          <line x1="150" y1="5" x2="150" y2="295" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
          <line x1="5" y1="150" x2="295" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
          {/* 45度刻度光标 */}
          <line x1="51" y1="51" x2="249" y2="249" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
          <line x1="51" y1="249" x2="249" y2="51" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
          <circle cx="150" cy="150" r="3" fill="currentColor" opacity="0.6" />
        </svg>

        {/* 底层 4：远景造船基地标志性万吨级龙门吊与船坞微光剪影（营造船厂空间安全管控专属氛围） */}
        <svg 
          className="absolute bottom-[16%] left-[2%] w-[580px] h-[190px] pointer-events-none opacity-[0.22] text-[#0284c7]" 
          viewBox="0 0 600 200"
          fill="none"
        >
          {/* 远景大跨度造车龙门吊 1 */}
          <path d="M 60 190 L 85 70 L 220 70 L 245 190" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 70 H 255" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 85 70 L 105 130 H 200 L 220 70" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
          <path d="M 152 70 V 125" stroke="currentColor" strokeWidth="1.8" />
          <rect x="144" y="125" width="16" height="10" rx="2" fill="currentColor" opacity="0.7" />
          <circle cx="152" cy="65" r="3" fill="#38bdf8" />

          {/* 远景桁架吊车 2 */}
          <path d="M 280 190 L 295 95 L 390 95 L 405 190" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 270 95 H 415" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 342 95 V 140" stroke="currentColor" strokeWidth="1.4" />
          <rect x="336" y="140" width="12" height="8" rx="1.5" fill="currentColor" opacity="0.6" />

          {/* 在建船舶龙骨线剪影 */}
          <path d="M 430 190 L 450 155 L 530 155 L 565 170 L 575 190" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <line x1="470" y1="155" x2="470" y2="135" stroke="currentColor" strokeWidth="1.5" />
          <line x1="500" y1="155" x2="500" y2="130" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* 底层 5：全屏工业物联网拓扑连线与多重感知脉冲节点 */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-55" 
          viewBox="0 0 1440 900" 
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* 左侧向右延伸的感知主干 */}
          <path d="M 60 360 H 240 L 320 440 H 460" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.45" />
          <path d="M 180 220 V 320 L 240 380 V 540" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
          
          {/* 右侧管控中心网络 */}
          <path d="M 820 100 L 980 100 L 1090 180 H 1280 L 1380 250" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="5 7" opacity="0.65" />
          <path d="M 1090 180 V 340 L 1190 410 V 580" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 5" opacity="0.5" />
          <path d="M 1280 180 L 1360 120" stroke="#06b6d4" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.4" />
          <path d="M 940 45 L 1040 125 V 240" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />

          {/* 活跃感知传感器节点（带发光圆环） */}
          <g>
            <circle cx="980" cy="100" r="4" fill="#38bdf8" />
            <circle cx="980" cy="100" r="7" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />
          </g>
          <g>
            <circle cx="1090" cy="180" r="4.5" fill="#0284c7" />
            <circle cx="1090" cy="180" r="8" stroke="#0284c7" strokeWidth="1" opacity="0.5" />
          </g>
          <g>
            <circle cx="1190" cy="410" r="3.5" fill="#38bdf8" />
            <circle cx="1190" cy="410" r="6" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5" />
          </g>
          <circle cx="1280" cy="180" r="3" fill="#06b6d4" opacity="0.8" />
          <circle cx="1380" cy="250" r="3" fill="#0284c7" opacity="0.7" />
          <circle cx="940" cy="45" r="2.5" fill="#38bdf8" opacity="0.75" />
          <circle cx="240" cy="440" r="3" fill="#0284c7" opacity="0.6" />
          <circle cx="320" cy="440" r="3" fill="#38bdf8" opacity="0.7" />
        </svg>

        {/* 底层 6：左下角至右侧大跨度层次丰富的流线型波浪光带（层叠3重贝塞尔曲面，波澜壮阔） */}
        <svg 
          className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none"
          viewBox="0 0 1440 400" 
          fill="none"
          preserveAspectRatio="none"
        >
          {/* 最底层主海澜弧线 */}
          <path 
            d="M -60 210 Q 320 310 720 280 T 1500 370 L 1500 450 L -60 450 Z" 
            fill="url(#bottomDeepWaveGrad)" 
            opacity="0.65"
          />
          {/* 中间层水动力流线羽翼 */}
          <path 
            d="M -60 150 Q 280 250 640 260 T 1480 340 L 1480 450 L -60 450 Z" 
            fill="url(#bottomMainWaveGrad)" 
            opacity="0.85"
          />
          {/* 表层高光流线切丝 1 */}
          <path 
            d="M -60 145 Q 280 245 640 255 T 1480 335" 
            stroke="url(#highlightLineGrad1)" 
            strokeWidth="3"
            opacity="0.65"
          />
          {/* 表层次级动感光丝 2 */}
          <path 
            d="M -40 100 Q 340 210 760 220 T 1460 310" 
            stroke="url(#highlightLineGrad2)" 
            strokeWidth="1.8"
            strokeDasharray="8 6"
            opacity="0.5"
          />
          
          <defs>
            <linearGradient id="bottomDeepWaveGrad" x1="0" y1="210" x2="1200" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a3cbf5" stopOpacity="0.7" />
              <stop offset="0.5" stopColor="#c5ddf7" stopOpacity="0.45" />
              <stop offset="1" stopColor="#e8f1fa" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="bottomMainWaveGrad" x1="0" y1="150" x2="1000" y2="380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b9d7f7" stopOpacity="0.8" />
              <stop offset="0.55" stopColor="#d2e5f9" stopOpacity="0.5" />
              <stop offset="1" stopColor="#e8f1fa" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="highlightLineGrad1" x1="0" y1="145" x2="1400" y2="335" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.3" stopColor="#7dd3fc" stopOpacity="0.85" />
              <stop offset="0.7" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="1" stopColor="#93c5fd" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="highlightLineGrad2" x1="0" y1="100" x2="1400" y2="310" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="0.6" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="1" stopColor="#bae6fd" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>

        {/* 底层 7：右侧柔和工业光球漫射 */}
        <div className="absolute top-[22%] right-[5%] w-[480px] h-[480px] rounded-full bg-sky-400/12 blur-[120px]" />

        {/* 核心亮点：随鼠标移动缓慢视差漂动的「智慧船厂科技感数据节点」光效 */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {nodesPosition.map((pos) => {
            const nodeMeta = SHIPYARD_DATA_NODES.find(n => n.id === pos.id);
            if (!nodeMeta) return null;

            return (
              <div
                key={pos.id}
                className="absolute transition-transform will-change-transform flex items-center gap-2 group select-none pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* 节点外层多重动态微光发光晕 */}
                <div className="relative flex items-center justify-center">
                  {/* 扩散脉冲波纹 */}
                  <div 
                    className="absolute rounded-full animate-ping opacity-35"
                    style={{
                      width: `${nodeMeta.size * 5}px`,
                      height: `${nodeMeta.size * 5}px`,
                      backgroundColor: nodeMeta.color,
                      animationDuration: '3.5s',
                    }}
                  />
                  {/* 稳定呼吸光晕 */}
                  <div 
                    className="absolute rounded-full blur-[3px] opacity-75"
                    style={{
                      width: `${nodeMeta.size * 3.5}px`,
                      height: `${nodeMeta.size * 3.5}px`,
                      backgroundColor: nodeMeta.color,
                    }}
                  />
                  {/* 核心高亮晶体光点 */}
                  <div 
                    className="relative rounded-full shadow-xs"
                    style={{
                      width: `${nodeMeta.size * 1.6}px`,
                      height: `${nodeMeta.size * 1.6}px`,
                      backgroundColor: '#ffffff',
                      border: `1.8px solid ${nodeMeta.color}`,
                    }}
                  />
                </div>

                {/* 节点数字化遥测标签（半透明轻盈气泡，展示工业实名与工位编码） */}
                <div className="hidden md:flex flex-col items-start px-2 py-0.5 rounded-md bg-white/70 backdrop-blur-xs border border-sky-200/60 shadow-2xs text-[10px] leading-tight opacity-75 transition-opacity">
                  <div className="flex items-center gap-1 font-mono text-[9px] text-sky-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{nodeMeta.code}</span>
                  </div>
                  <span className="text-slate-600 font-medium whitespace-nowrap text-[10px]">
                    {nodeMeta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
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

