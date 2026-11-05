import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  RotateCw, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode,
  MessageSquare,
  Maximize2
} from 'lucide-react';
import { MobileAlarmApp } from './MobileAlarmApp';
import { MobileQrCodePanel } from './MobileQrCodePanel';

interface MobileDeviceSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarmId?: string;
  onOpenFullScreenMobile?: (alarmId?: string) => void;
}

export function MobileDeviceSimulatorModal({
  isOpen,
  onClose,
  alarmId = 'ALM-20260906-001',
  onOpenFullScreenMobile
}: MobileDeviceSimulatorModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = `${window.location.origin}${window.location.pathname}?view=m_alarm&id=${alarmId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl h-[92vh] max-h-[860px] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 左侧扫码与操作面板 (在宽屏下展示完整扫码与快捷操作) */}
        <div className="hidden md:flex w-80 bg-slate-800/90 border-r border-slate-700/80 p-5 flex-col justify-between text-slate-300 overflow-y-auto">
          <MobileQrCodePanel 
            alarmId={alarmId}
            className="w-full border-none shadow-none bg-transparent p-0"
          />

          {onOpenFullScreenMobile && (
            <div className="pt-3 border-t border-slate-700/70 mt-3">
              <button
                onClick={() => {
                  onOpenFullScreenMobile(alarmId);
                  onClose();
                }}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>独立全屏手机网页模式</span>
              </button>
            </div>
          )}
        </div>

        {/* 右侧手机外壳真机仿真区 */}
        <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-3 relative overflow-hidden">
          
          {/* 右上角关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 手机外壳 (拟真现代智能手机造型) */}
          <div className="w-[380px] h-[96%] max-h-[780px] bg-slate-900 rounded-[3rem] p-3 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-slate-700/80 flex flex-col relative">
            
            {/* 手机听筒与前置打孔摄像头 (灵动岛效果) */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>

            {/* 手机屏幕主视图 */}
            <div className="flex-1 w-full bg-slate-50 rounded-[2.2rem] overflow-hidden flex flex-col relative z-20">
              <MobileAlarmApp 
                initialAlarmId={alarmId}
                isSimulatorMode={true}
                onExitToPc={onClose}
              />
            </div>

            {/* 手机底部 Home Indicator 触控横条 */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2 mb-0.5 z-40 opacity-70" />
          </div>

        </div>

      </div>
    </div>
  );
}
