import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Smartphone, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle
} from 'lucide-react';
import { AlarmEventRecord } from '@/src/types/alarmRecord';

export interface MobileUserInfo {
  name: string;
  phone: string;
  role: string;
  empId: string;
  dept: string;
  loginMethod: 'password' | 'sms_code';
}

interface MobileAuthViewProps {
  alarmRecord?: AlarmEventRecord;
  onLoginSuccess: (user: MobileUserInfo) => void;
}

export function MobileAuthView({ onLoginSuccess }: MobileAuthViewProps) {
  // 需求4：默认显示账号密码登录页，可选短信验证码登录
  const [authMode, setAuthMode] = useState<'pwd' | 'sms'>('pwd');

  // 账号密码登录表单
  const [username, setUsername] = useState('linfeng');
  const [password, setPassword] = useState('123456');

  // 短信验证码登录表单 (需求5：手机号不加分隔符)
  const [phone, setPhone] = useState('13988219901');
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [simulatedSmsToast, setSimulatedSmsToast] = useState<string | null>(null);

  // 错误提示
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 倒计时逻辑
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 发送短信验证码
  const handleSendCode = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      setErrorMessage('请输入正确的11位手机号');
      return;
    }
    setErrorMessage(null);
    setIsSendingCode(true);

    setTimeout(() => {
      setIsSendingCode(false);
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setCountdown(60);
      setSmsCode(generatedCode);
      setSimulatedSmsToast(`验证码：${generatedCode}，5分钟内有效`);
      
      setTimeout(() => {
        setSimulatedSmsToast(null);
      }, 5000);
    }, 300);
  };

  // 提交登录
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (authMode === 'pwd') {
      if (!username.trim() || !password.trim()) {
        setErrorMessage('请输入账号和密码');
        return;
      }
      const matchedUser: MobileUserInfo = {
        name: username === 'linfeng' ? '林峰' : username,
        phone: '13988219901',
        role: '车间安全主任',
        empId: 'EMP-SAF-008',
        dept: '总装建造车间安环科',
        loginMethod: 'password'
      };
      onLoginSuccess(matchedUser);
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 11) {
        setErrorMessage('请输入正确的11位手机号');
        return;
      }
      if (!smsCode.trim() || smsCode.length < 4) {
        setErrorMessage('请输入短信验证码');
        return;
      }

      const matchedUser: MobileUserInfo = {
        name: cleanPhone.includes('8821') ? '林峰' : cleanPhone.includes('0012') ? '陈建国' : '现场安全员',
        phone: cleanPhone,
        role: cleanPhone.includes('8821') ? '车间安全主任' : '当班安全员',
        empId: cleanPhone.includes('8821') ? 'EMP-SAF-008' : 'EMP-SAF-019',
        dept: '总装建造车间安环科',
        loginMethod: 'sms_code'
      };

      onLoginSuccess(matchedUser);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-slate-50 text-slate-800">
      
      {/* 验证码接收弹窗横幅 */}
      {simulatedSmsToast && (
        <div className="sticky top-2 z-50 px-4 animate-in slide-in-from-top duration-200">
          <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 font-bold">{simulatedSmsToast}</span>
            <span className="text-[10px] text-slate-400">已自动填入</span>
          </div>
        </div>
      )}

      {/* 顶部简洁标题 */}
      <div className="px-5 pt-8 pb-6 bg-blue-700 text-white shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldAlert className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-tight">
              告警应急处置平台
            </h1>
            <p className="text-xs text-blue-100 mt-0.5">
              现场移动端快速通道
            </p>
          </div>
        </div>
      </div>

      {/* 登录主体表单区 */}
      <div className="flex-1 px-5 pt-6 pb-6 max-w-md mx-auto w-full">
        
        {/* 需求2 & 4：两种登录方式切换 Tab，默认显示账号密码登录 */}
        <div className="bg-slate-200 p-1 rounded-xl flex items-center mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('pwd');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'pwd'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>账号密码登录</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('sms');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'sms'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>短信验证码登录</span>
          </button>
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'pwd' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  账号
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入账号"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  手机号
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入11位手机号"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  短信验证码
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="请输入验证码"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={countdown > 0 || isSendingCode}
                    onClick={handleSendCode}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      countdown > 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-98'
                    }`}
                  >
                    {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 需求3：按钮只要显示登录即可，尽量快速处理 */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer mt-6"
          >
            登录
          </button>
        </form>

      </div>

      <div className="h-6" />

    </div>
  );
}
