import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Camera, 
  Video, 
  Image as ImageIcon, 
  Trash2, 
  Activity,
  Play,
  X,
  Plus
} from 'lucide-react';
import { AlarmEventRecord, AlarmAttachment } from '@/src/types/alarmRecord';
import { MobileUserInfo } from './MobileAuthView';
import { MobileProcessSubmitParams } from '@/src/data/alarmStorage';

interface MobileAlarmProcessViewProps {
  alarmRecord: AlarmEventRecord;
  currentUser: MobileUserInfo;
  onLogout: () => void;
  onSubmitSuccess: (params: MobileProcessSubmitParams) => void;
}

// 预设现场照片与视频示例
const PRESET_ATTACHMENTS: AlarmAttachment[] = [
  {
    id: 'att-mock-1',
    name: '现场强排通风排险照片.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    size: '2.4 MB',
    uploadTime: '刚刚'
  },
  {
    id: 'att-mock-2',
    name: '气体检测仪复测归零凭证.png',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    size: '1.8 MB',
    uploadTime: '刚刚'
  },
  {
    id: 'att-mock-3',
    name: '液货舱排险后全景视频.mp4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    size: '11.5 MB',
    uploadTime: '刚刚'
  }
];

export function MobileAlarmProcessView({
  alarmRecord,
  currentUser,
  onLogout,
  onSubmitSuccess
}: MobileAlarmProcessViewProps) {
  // 1. 处置类型
  const [releaseType, setReleaseType] = useState<'hazard_cleared' | 'false_alarm_cleared'>('hazard_cleared');

  // 2. 原因分析与处置措施 (需求3：已移除快捷提示语)
  const [causeSummary, setCauseSummary] = useState(
    alarmRecord.causeAnalysis || '现场受限空间内通风管路受外力挤压导致排风受阻，焊接保护气产生微量集聚。'
  );
  const [measureSummary, setMeasureSummary] = useState(
    alarmRecord.correctiveActions || '已开启备用防爆轴流风机强排通风，更换耐磨密封圈；经气体检测仪复测已恢复0ppm基线。'
  );
  const [retestMetrics, setRetestMetrics] = useState(
    alarmRecord.policyType.includes('气体') ? '气体检测仪4点复测：0.0 ppm (正常)' : '现场安全复核：隐患已排除'
  );

  // 3. 现场照片与视频凭证 (需求4：大框增加点位添加，缩略图预览与删除，加号选择拍照/录像/相册)
  const [attachments, setAttachments] = useState<AlarmAttachment[]>([
    PRESET_ATTACHMENTS[0],
    PRESET_ATTACHMENTS[1]
  ]);

  // 控制添加获取方式弹出菜单
  const [showUploadPicker, setShowUploadPicker] = useState(false);

  // 媒体预览源图/视频模态框
  const [previewMedia, setPreviewMedia] = useState<AlarmAttachment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 文件上传原生引用
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AlarmAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const isVid = fileType === 'video' || file.type.startsWith('video/');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

      newAttachments.push({
        id: `att-upload-${Date.now()}-${i}`,
        name: file.name,
        type: isVid ? 'video' : 'image',
        url: url,
        size: `${sizeMB} MB`,
        uploadTime: '刚刚'
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = '';
    setShowUploadPicker(false);
  };

  const handleRemoveAttachment = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // 手机号无分隔符
  const rawPhone = (alarmRecord.handlerPhone || '13988219901').replace(/-/g, '');
  const userPhone = (currentUser.phone || '13988219901').replace(/-/g, '');

  const handleSubmit = () => {
    setErrorMessage(null);
    if (!causeSummary.trim()) {
      setErrorMessage('请输入现场排查原因');
      return;
    }
    if (!measureSummary.trim()) {
      setErrorMessage('请输入处置排险措施');
      return;
    }
    if (attachments.length === 0) {
      setErrorMessage('请至少上传1张现场照片或视频凭证');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // 需求2：已移除签名，不传 signatureUrl
      onSubmitSuccess({
        alarmId: alarmRecord.id,
        handlerName: currentUser.name,
        handlerPhone: userPhone,
        handlerDept: currentUser.dept,
        releaseType,
        causeSummary,
        measureSummary,
        retestMetrics,
        attachments
      });
    }, 400);
  };

  return (
    <div className="min-h-full bg-slate-100 flex flex-col justify-between text-slate-800 pb-8">
      
      {/* 顶部极简导航 */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>告警处理</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">
                {alarmRecord.currentLevel}级
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {alarmRecord.id}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-semibold">{currentUser.name}</span>
          <button
            onClick={onLogout}
            className="text-[11px] text-slate-500 px-2 py-0.5 rounded bg-slate-100 cursor-pointer"
          >
            切换
          </button>
        </div>
      </div>

      {/* 主体核心表单内容 */}
      <div className="px-4 py-3 space-y-3 max-w-md mx-auto w-full">

        {/* 1. 告警核心信息 */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 leading-snug">
              {alarmRecord.policyName}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
              待处理
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">{alarmRecord.areaName}</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{alarmRecord.triggerTime.split(' ')[1] || alarmRecord.triggerTime}</span>
            </div>

            <div className="flex items-center gap-1.5 truncate col-span-2">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{alarmRecord.targetPerson || '在岗人员'}</span>
              <span className="text-slate-400">·</span>
              <a 
                href={`tel:${rawPhone}`}
                className="text-blue-600 font-mono font-semibold flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{rawPhone}</span>
              </a>
            </div>
          </div>

          {/* 实测值与设定阈值 */}
          <div className="p-2 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-red-800">
              <Activity className="w-4 h-4 text-red-600" />
              <span className="font-bold font-mono">{alarmRecord.currentValue}</span>
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              阈值: {alarmRecord.thresholdValue}
            </div>
          </div>
        </div>

        {/* 2. 核心处理表单 */}
        <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200 space-y-3.5">
          
          {/* 处置结论单选 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              处置结论
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReleaseType('hazard_cleared')}
                className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                  releaseType === 'hazard_cleared'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-700 bg-white'
                }`}
              >
                现场排险达标
              </button>

              <button
                type="button"
                onClick={() => setReleaseType('false_alarm_cleared')}
                className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                  releaseType === 'false_alarm_cleared'
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-slate-200 text-slate-700 bg-white'
                }`}
              >
                核验误报消除
              </button>
            </div>
          </div>

          {/* 现场排查与原因分析 (需求3：已彻底移除快捷提示语) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              现场排查原因
            </label>
            <textarea
              rows={2}
              value={causeSummary}
              onChange={(e) => setCauseSummary(e.target.value)}
              placeholder="请输入现场实际排查情况与原因"
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 处置措施 (需求3：已彻底移除快捷提示语) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              处置排险措施
            </label>
            <textarea
              rows={2}
              value={measureSummary}
              onChange={(e) => setMeasureSummary(e.target.value)}
              placeholder="说明现场排险通风、人员撤离或设备修复措施"
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 现场复测指标 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              复测指标
            </label>
            <input
              type="text"
              value={retestMetrics}
              onChange={(e) => setRetestMetrics(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 现场拍照 / 视频 (需求4：大框增加点位添加，缩略图预览与删除，点加号选择拍照/录像/相册) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                现场拍照与视频 ({attachments.length})
              </label>
            </div>

            {/* 隐藏的真实文件 Input */}
            <input 
              type="file" 
              ref={photoInputRef}
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'image')}
              className="hidden"
            />
            <input 
              type="file" 
              ref={videoInputRef}
              accept="video/*"
              capture="environment"
              onChange={(e) => handleFileChange(e, 'video')}
              className="hidden"
            />
            <input 
              type="file" 
              ref={albumInputRef}
              accept="image/*,video/*"
              multiple
              onChange={(e) => handleFileChange(e, 'image')}
              className="hidden"
            />

            {/* 大框网格：缩略图列表 + 大框增加点位 */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* 已添加的照片与视频缩略图 */}
              {attachments.map((att) => (
                <div 
                  key={att.id}
                  onClick={() => setPreviewMedia(att)}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer shadow-2xs"
                  title="点击查看源图/视频"
                >
                  {att.type === 'video' ? (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white relative">
                      <video src={att.url} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={att.url} 
                      alt={att.name} 
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" 
                    />
                  )}

                  {/* 类型标识条 */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                    {att.type === 'video' ? '视频' : '照片'}
                  </div>

                  {/* 需求4：当鼠标移到图片或视频缩略图时显示删除按钮，支持移除已经选择或拍摄的图片 */}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveAttachment(att.id, e)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-all cursor-pointer z-10 active:scale-95"
                    title="移除该文件"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* 需求4：大框增加点位（点击加号大框弹出拍照、录像、相册选择） */}
              <button
                type="button"
                onClick={() => setShowUploadPicker(true)}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/80 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 transition-all cursor-pointer select-none active:scale-98 group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 flex items-center justify-center shadow-2xs">
                  <Plus className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                </div>
                <span className="text-[11px] font-medium">添加照片/视频</span>
              </button>
            </div>

          </div>

          {/* 需求2：已彻底移除处置人签名栏 */}

        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-1.5">
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* 提交按钮：快速处理解除 */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
            isSubmitting
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98'
          }`}
        >
          {isSubmitting ? '正在处理解除...' : '确认解除告警'}
        </button>

      </div>

      {/* 需求4：点加号添加时选择获取方式的底部动作菜单 (拍照 / 录像 / 相册) */}
      {showUploadPicker && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-3 animate-in fade-in duration-150"
          onClick={() => setShowUploadPicker(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">选择获取方式</span>
              <button
                onClick={() => setShowUploadPicker(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="py-3 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-blue-700 transition-colors cursor-pointer active:scale-95"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs font-bold">现场拍照</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="py-3 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-indigo-700 transition-colors cursor-pointer active:scale-95"
              >
                <Video className="w-5 h-5" />
                <span className="text-xs font-bold">现场录像</span>
              </button>

              <button
                type="button"
                onClick={() => albumInputRef.current?.click()}
                className="py-3 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-700 transition-colors cursor-pointer active:scale-95"
              >
                <ImageIcon className="w-5 h-5" />
                <span className="text-xs font-bold">本地相册</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowUploadPicker(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold mt-2 cursor-pointer"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 媒体预览弹窗 (需求4：点击缩略图查看源图/播放源视频) */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            className="w-full max-w-sm bg-slate-900 text-white rounded-2xl overflow-hidden p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-semibold truncate">{previewMedia.name}</span>
              <button 
                onClick={() => setPreviewMedia(null)}
                className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-[200px]">
              {previewMedia.type === 'video' ? (
                <video src={previewMedia.url} controls autoPlay className="w-full max-h-[320px] object-contain" />
              ) : (
                <img src={previewMedia.url} alt={previewMedia.name} className="w-full max-h-[320px] object-contain" />
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>{previewMedia.type === 'video' ? '视频凭据' : '照片凭据'} · {previewMedia.size}</span>
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
