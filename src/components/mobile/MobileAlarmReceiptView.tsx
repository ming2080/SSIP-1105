import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Play, 
  X,
  Monitor
} from 'lucide-react';
import { AlarmReleaseReceipt, SmsNotificationRecord, AlarmAttachment } from '@/src/types/alarmRecord';

interface MobileAlarmReceiptViewProps {
  receipt: AlarmReleaseReceipt;
  sentSmsList?: SmsNotificationRecord[];
  onBackToAlarmList: () => void;
  onGoToPcView?: () => void;
  onPreviewSms?: (sms: SmsNotificationRecord) => void;
}

export function MobileAlarmReceiptView({
  receipt,
  onBackToAlarmList,
  onGoToPcView
}: MobileAlarmReceiptViewProps) {
  const [copied, setCopied] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<AlarmAttachment | null>(null);

  const handleCopyReceiptNo = () => {
    navigator.clipboard.writeText(receipt.receiptNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanHandlerPhone = (receipt.handlerPhone || '').replace(/-/g, '');

  return (
    <div className="min-h-full bg-slate-100 text-slate-800 pb-8 flex flex-col justify-between">
      
      {/* 顶部手机端导航条 */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={onBackToAlarmList}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <span className="text-xs font-bold text-slate-900">解除通知回执</span>
        {onGoToPcView ? (
          <button
            onClick={onGoToPcView}
            className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC同步</span>
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* 成功状态横幅 */}
      <div className="px-4 pt-3 pb-1 max-w-md mx-auto w-full">
        <div className="p-3 bg-emerald-600 text-white rounded-xl flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-bold">告警已解除 · 处置完成</h2>
            <div className="text-[10px] text-emerald-100 font-mono mt-0.5">
              回执号: {receipt.receiptNo}
            </div>
          </div>
          <button
            onClick={handleCopyReceiptNo}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-[10px] flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>
      </div>

      {/* 回执核心内容卡片 */}
      <div className="px-4 space-y-3 max-w-md mx-auto w-full">
        
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">解除对象</span>
            <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">{receipt.alarmTitle}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">告警单号</span>
            <span className="font-mono text-slate-700">{receipt.alarmId}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">发生区域</span>
            <span className="text-slate-700 text-right truncate max-w-[200px]">{receipt.areaName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">解除时间</span>
            <span className="font-mono text-slate-800">{receipt.releasedAt}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">处置结论</span>
            <span className="font-bold text-emerald-700">
              {receipt.releaseTypeLabel}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">复测指标</span>
            <span className="font-mono text-emerald-700 font-bold">{receipt.retestMetrics}</span>
          </div>

          <div className="pt-1">
            <span className="text-slate-500 block mb-0.5">现场排查原因:</span>
            <p className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
              {receipt.causeSummary}
            </p>
          </div>

          <div className="pt-1">
            <span className="text-slate-500 block mb-0.5">处置排险措施:</span>
            <p className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
              {receipt.measureSummary}
            </p>
          </div>

          {/* 现场凭据缩略图 */}
          {receipt.attachments && receipt.attachments.length > 0 && (
            <div className="pt-1">
              <span className="text-slate-500 block mb-1">
                现场凭据 ({receipt.attachments.length}个):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {receipt.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setPreviewMedia(att)}
                    className="aspect-square rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200 cursor-pointer"
                  >
                    {att.type === 'video' ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                        <Play className="w-5 h-5 text-white/90" />
                      </div>
                    ) : (
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-0.5 text-[9px] text-white text-center">
                      {att.type === 'video' ? '视频' : '照片'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 处置人信息 (需求2：已移除签名栏，仅保留简洁责任人姓名及无分隔符手机号) */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">处置责任人</span>
            <span className="font-semibold text-slate-800 font-mono">
              {receipt.handlerName} {cleanHandlerPhone && `(${cleanHandlerPhone})`}
            </span>
          </div>

        </div>

        {/* 底部按钮 (需求1：已删除解除短信通知明细区域) */}
        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={onBackToAlarmList}
            className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer text-center"
          >
            返回告警
          </button>
          {onGoToPcView && (
            <button
              onClick={onGoToPcView}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer text-center"
            >
              PC端查看
            </button>
          )}
        </div>

      </div>

      {/* 媒体预览弹窗 */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="w-full max-w-sm bg-slate-900 text-white rounded-xl overflow-hidden p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold truncate">{previewMedia.name}</span>
              <button 
                onClick={() => setPreviewMedia(null)}
                className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden bg-black flex items-center justify-center min-h-[200px]">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls autoPlay className="w-full max-h-[300px] object-contain" />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.name} className="w-full max-h-[300px] object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
