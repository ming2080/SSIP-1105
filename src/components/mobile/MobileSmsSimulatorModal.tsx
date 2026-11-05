import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';
import { SmsNotificationRecord } from '@/src/types/alarmRecord';

interface MobileSmsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sms: SmsNotificationRecord;
  onOpenLink: (url: string) => void;
}

export function MobileSmsSimulatorModal({
  isOpen,
  onClose,
  sms,
  onOpenLink
}: MobileSmsSimulatorModalProps) {
  if (!isOpen) return null;

  const cleanRecipientPhone = (sms.recipientPhone || '').replace(/-/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 短信头部 */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              信
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">智慧船厂安监平台</div>
              <div className="text-[10px] text-slate-400 font-mono">106988920110</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 短信详情与消息气泡 */}
        <div className="p-4 bg-slate-100 flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="text-center mb-2">
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                {sms.sentAt.split(' ')[1] || '10:42'}
              </span>
            </div>

            {/* 短信气泡 */}
            <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 text-slate-800 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {sms.type === 'alarm_released' ? '【告警解除通知】' : '【紧急告警通知】'}
                </span>
              </div>

              <p className="text-slate-700 whitespace-pre-wrap text-xs">
                {sms.content}
              </p>

              {sms.actionUrl && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onOpenLink(sms.actionUrl!);
                      onClose();
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <span>点击打开处理链接</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-2 text-right">
              <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>{sms.recipientName} {cleanRecipientPhone}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            关闭
          </button>
          {sms.actionUrl && (
            <button
              onClick={() => {
                onOpenLink(sms.actionUrl!);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer flex items-center gap-1"
            >
              <span>立即处理</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
