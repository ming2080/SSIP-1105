import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  User, 
  FileEdit,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  Video,
  Trash2,
  Paperclip,
  FileCheck
} from 'lucide-react';
import { AlarmEventRecord, AlarmAttachment } from '@/src/types/alarmRecord';

interface AlarmSimpleProcessModalProps {
  isOpen: boolean;
  record: AlarmEventRecord | null;
  onClose: () => void;
  onSubmit: (
    recordId: string, 
    status: 'closed' | 'false_alarm' | 'pending', 
    handler: string, 
    notes: string,
    attachments?: AlarmAttachment[]
  ) => void;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export function AlarmSimpleProcessModal({
  isOpen,
  record,
  onClose,
  onSubmit
}: AlarmSimpleProcessModalProps) {
  const [status, setStatus] = useState<'closed' | 'false_alarm' | 'pending'>('closed');
  const [handler, setHandler] = useState('安全管理员-林峰');
  const [notes, setNotes] = useState('现场已排查整改，危险隐患已排除，恢复正常作业。');
  const [attachments, setAttachments] = useState<AlarmAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (record) {
      setStatus(record.processStatus === 'closed' ? 'closed' : 'closed');
      setHandler(record.handler && record.handler !== '待安全员接单签收' ? record.handler : '安全管理员-林峰');
      setNotes(record.correctiveActions || '现场已排查整改，危险隐患已排除，恢复正常作业。');
      setAttachments(record.attachments || []);
      setUploadError(null);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 处理文件加入
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const newAttachments: AlarmAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 验证大小不超过 50MB
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`文件「${file.name}」大小为 ${formatFileSize(file.size)}，已超过 50MB 上传限制！`);
        continue;
      }

      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);
      const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);

      if (!isVideo && !isImage) {
        setUploadError(`文件「${file.name}」格式不支持，仅支持上传图片或视频附件！`);
        continue;
      }

      const blobUrl = URL.createObjectURL(file);
      const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      newAttachments.push({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        url: blobUrl,
        size: formatFileSize(file.size),
        uploadTime: nowStr
      });
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  // 快捷添加模拟整改照片/视频
  const handleAddSampleAttachment = (type: 'image' | 'video') => {
    setUploadError(null);
    const nowStr = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    if (type === 'image') {
      setAttachments(prev => [
        ...prev,
        {
          id: `sample-img-${Date.now()}`,
          name: '现场安全整改达标抓拍图.jpg',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
          size: '2.4 MB',
          uploadTime: nowStr
        }
      ]);
    } else {
      setAttachments(prev => [
        ...prev,
        {
          id: `sample-vid-${Date.now()}`,
          name: '现场通风置换复测录像.mp4',
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          size: '14.8 MB',
          uploadTime: nowStr
        }
      ]);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(record.id, status, handler, notes, attachments);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 text-slate-700 font-sans animate-scaleUp my-auto flex flex-col max-h-[92vh]"
      >
        {/* 顶部标题：统一为“告警信息处理：” */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>告警信息处理：</span>
                <span className="text-xs font-semibold text-blue-600 font-mono">[{record.id}]</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {record.policyName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 处理表单主体 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* 处理结论选择 */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              处理结果选择 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('closed')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'closed' 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>标记为已处理</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('false_alarm')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'false_alarm' 
                    ? 'bg-slate-100 border-slate-400 text-slate-800 ring-2 ring-slate-300' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>标记为误报消除</span>
              </button>
            </div>
          </div>

          {/* 处理责任人 */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              处理责任人 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={handler}
                onChange={(e) => setHandler(e.target.value)}
                required
                placeholder="请输入处理责任人姓名"
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* 处置情况说明 (按要求修改名称) */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              处置情况说明
            </label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="请输入现场处置情况、排查整改过程或防范措施说明..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-500 bg-white resize-none text-xs"
            />
          </div>

          {/* 现场处理图片或视频附件上传 (支持图片/视频，最大不超过50MB) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>处理图片或视频附件上传</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                支持图片/视频，单个最大不超过 50MB
              </span>
            </div>

            {/* 拖拽/点击上传区域 */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*,video/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  点击或将图片/视频拖拽到此处上传
                </div>
                <div className="text-[11px] text-slate-400">
                  支持 JPG、PNG、WEBP、MP4、MOV 等格式 (单文件 ≤ 50MB)
                </div>
              </div>
            </div>

            {/* 快速体验样例按钮 */}
            <div className="flex items-center justify-end gap-2 mt-1.5">
              <span className="text-[10px] text-slate-400">快速示范:</span>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('image')}
                className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3" />
                + 插入示例整改照片
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleAddSampleAttachment('video')}
                className="text-[11px] text-purple-600 hover:text-purple-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Video className="w-3 h-3" />
                + 插入示例排查视频
              </button>
            </div>

            {/* 错误提示 */}
            {uploadError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* 已上传附件列表 */}
            {attachments.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>已添加现场附件 ({attachments.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {attachments.map((att) => (
                    <div 
                      key={att.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {att.type === 'video' ? (
                          <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <Video className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={att.name}>
                            {att.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-mono">{att.size}</span>
                            <span>•</span>
                            <span>{att.type === 'video' ? '现场视频' : '现场照片'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                        title="移除此附件"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮栏 */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              保存处理记录
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

