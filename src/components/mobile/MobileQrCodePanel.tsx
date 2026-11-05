import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  Smartphone, 
  ExternalLink, 
  Camera, 
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

interface MobileQrCodePanelProps {
  alarmId: string;
  className?: string;
  isCompact?: boolean;
}

export function MobileQrCodePanel({
  alarmId,
  className = '',
  isCompact = false
}: MobileQrCodePanelProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<boolean>(false);

  // 构造移动端真实访问链接
  const mobileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?view=m_alarm&id=${encodeURIComponent(alarmId || 'ALM-20260906-001')}`
    : `https://shipyard-monitor.local/?view=m_alarm&id=${alarmId}`;

  // 生成高清可扫码 QR Code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(mobileUrl, {
      width: isCompact ? 160 : 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrCodeDataUrl(dataUrl);
          setGenerationError(false);
        }
      })
      .catch((err) => {
        console.error('QR code generate error:', err);
        if (isMounted) setGenerationError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [mobileUrl, isCompact]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInNewWindow = () => {
    window.open(mobileUrl, '_blank');
  };

  return (
    <div className={`bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-5 text-slate-200 flex flex-col shadow-2xl select-none ${className}`}>
      
      {/* 头部标题区域 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>手机扫码查看</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              实时同步
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            用手机查看真实移动端H5界面
          </p>
        </div>
      </div>

      {/* 二维码展示卡片 */}
      <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center justify-center relative group">
        
        {/* 二维码主画面 */}
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200/20 relative">
          {qrCodeDataUrl ? (
            <img 
              src={qrCodeDataUrl} 
              alt="移动端页面二维码" 
              className="w-40 h-40 object-contain rounded-lg"
            />
          ) : (
            <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-400 text-xs">
              <QrCode className="w-10 h-10 animate-pulse text-slate-500 mb-2" />
              <span>生成二维码中...</span>
            </div>
          )}

          {/* 中心微型装饰图标 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-md pointer-events-none">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>

        {/* 扫码指引说明 */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Camera className="w-3 h-3 text-blue-400" />
            <span>微信 / 浏览器 / 手机相机 扫一扫</span>
          </div>
        </div>
      </div>

      {/* 当前目标工单标识 */}
      <div className="mt-3 px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">当前告警工单:</span>
        <span className="font-mono text-blue-400 font-bold text-[11px]">{alarmId}</span>
      </div>

      {/* 快捷操作区：复制链接 / 新窗口打开 */}
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-2 px-3 bg-slate-700/80 hover:bg-slate-700 text-slate-100 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-600/70 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">链接已复制到剪贴板</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>复制手机端访问链接</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleOpenInNewWindow}
          className="w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all border border-blue-500/30 cursor-pointer"
        >
          <ExternalLink className="w-3 h-3 text-blue-400" />
          <span>在PC新标签页中打开</span>
        </button>
      </div>

      {/* 底部使用提示 */}
      <div className="mt-4 pt-3 border-t border-slate-700/70 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>
          在手机上可体验真实相机拍照、视频录制、现场排险填报及回执查看，与PC大屏全真联动。
        </span>
      </div>

    </div>
  );
}
