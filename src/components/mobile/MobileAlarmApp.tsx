import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  MessageSquare, 
  ShieldAlert, 
  RotateCw, 
  ArrowLeft, 
  ListFilter,
  CheckCircle2,
  ChevronDown,
  QrCode,
  X
} from 'lucide-react';
import { AlarmEventRecord, SmsNotificationRecord, AlarmReleaseReceipt } from '@/src/types/alarmRecord';
import { 
  getStoredAlarmRecords, 
  getAlarmRecordById, 
  getStoredSmsRecords, 
  processAndReleaseAlarmFromH5, 
  MobileProcessSubmitParams,
  getAlarmReceipt,
  subscribeAlarmChanges
} from '@/src/data/alarmStorage';
import { MobileAuthView, MobileUserInfo } from './MobileAuthView';
import { MobileAlarmProcessView } from './MobileAlarmProcessView';
import { MobileAlarmReceiptView } from './MobileAlarmReceiptView';
import { MobileSmsSimulatorModal } from './MobileSmsSimulatorModal';
import { MobileQrCodePanel } from './MobileQrCodePanel';

interface MobileAlarmAppProps {
  initialAlarmId?: string;
  onExitToPc?: () => void;
  isSimulatorMode?: boolean; // 是否处于PC仿真器内
}

export function MobileAlarmApp({
  initialAlarmId = 'ALM-20260906-001',
  onExitToPc,
  isSimulatorMode = false
}: MobileAlarmAppProps) {
  // 当前告警列表
  const [alarmRecords, setAlarmRecords] = useState<AlarmEventRecord[]>(getStoredAlarmRecords());
  const [selectedAlarmId, setSelectedAlarmId] = useState<string>(initialAlarmId);

  // 移动端当前登录用户 (从 localStorage 读取)
  const [mobileUser, setMobileUser] = useState<MobileUserInfo | null>(() => {
    try {
      const saved = localStorage.getItem('shipyard_mobile_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 当前处理完毕的回执对象与短信发送列表
  const [activeReceipt, setActiveReceipt] = useState<AlarmReleaseReceipt | null>(null);
  const [sentSmsList, setSentSmsList] = useState<SmsNotificationRecord[]>([]);

  // 短信弹窗模拟器
  const [previewingSms, setPreviewingSms] = useState<SmsNotificationRecord | null>(null);

  // 移动端扫码弹窗 (小屏幕触发)
  const [showMobileQrModal, setShowMobileQrModal] = useState<boolean>(false);

  // 实时订阅告警数据变动
  useEffect(() => {
    const unsubscribe = subscribeAlarmChanges((records) => {
      setAlarmRecords(records);
    });
    return unsubscribe;
  }, []);

  // 监听当前选中的告警记录
  const currentRecord = alarmRecords.find(r => r.id === selectedAlarmId) || alarmRecords[0];

  // 检查是否已有回执
  useEffect(() => {
    if (currentRecord) {
      const receipt = getAlarmReceipt(currentRecord.id);
      if (receipt && (currentRecord.processStatus === 'closed' || currentRecord.processStatus === 'false_alarm')) {
        setActiveReceipt(receipt);
        const relatedSms = getStoredSmsRecords(currentRecord.id).filter(s => s.type === 'alarm_released');
        setSentSmsList(relatedSms);
      } else {
        setActiveReceipt(null);
      }
    }
  }, [currentRecord]);

  // 登录成功
  const handleLoginSuccess = (user: MobileUserInfo) => {
    setMobileUser(user);
    try {
      localStorage.setItem('shipyard_mobile_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  // 退出登录
  const handleLogout = () => {
    setMobileUser(null);
    try {
      localStorage.removeItem('shipyard_mobile_user');
    } catch {
      // ignore
    }
  };

  // 提交处理并生成回执
  const handleProcessSubmit = (params: MobileProcessSubmitParams) => {
    const result = processAndReleaseAlarmFromH5(params);
    setActiveReceipt(result.receipt);
    setSentSmsList(result.sentSmsList);
  };

  // 模拟收到告警短信
  const handleSimulateIncomingSms = () => {
    if (!currentRecord) return;
    const smsId = `SMS-SIM-${Date.now().toString().slice(-4)}`;
    const phoneNo = (mobileUser?.phone || currentRecord.handlerPhone || '13988219901').replace(/-/g, '');
    const mockSms: SmsNotificationRecord = {
      id: smsId,
      alarmId: currentRecord.id,
      type: 'alarm_triggered',
      recipientName: mobileUser?.name || '林峰',
      recipientPhone: phoneNo,
      recipientRole: '车间安全责任人',
      content: `【智慧船厂安监平台】紧急告警：[${currentRecord.areaName}] 触发 [${currentRecord.policyName}]，当前指标${currentRecord.currentValue}，请立即点击链接核实并排险处置！处理链接：`,
      actionUrl: `/m/alarm-process?id=${currentRecord.id}`,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      deliveryStatus: 'delivered'
    };
    setPreviewingSms(mockSms);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-800 select-none overflow-x-hidden">
      
      {/* 顶部手机状态模拟条 / 快捷操作栏 (当不是嵌入小手机时展示便捷工具) */}
      {!isSimulatorMode && (
        <div className="bg-slate-800 text-slate-200 px-4 py-2 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-white">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>移动端H5前端处理模块</span>
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
              专为手机移动浏览器优化
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 切换目标告警工单 */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">切换工单:</span>
              <select
                value={selectedAlarmId}
                onChange={(e) => {
                  setSelectedAlarmId(e.target.value);
                  setActiveReceipt(null);
                }}
                className="bg-slate-700 text-white text-[11px] px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer max-w-[150px] truncate"
              >
                {alarmRecords.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.policyName.slice(0, 10)}... [{r.processStatus === 'closed' ? '已处理' : '待处理'}]
                  </option>
                ))}
              </select>
            </div>

            {/* 模拟收到短信按钮 */}
            <button
              onClick={handleSimulateIncomingSms}
              className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3 h-3" />
              <span>模拟收到告警短信</span>
            </button>

            {/* 手机扫码弹窗按钮 (在小屏幕下可唤起二维码弹窗) */}
            <button
              onClick={() => setShowMobileQrModal(true)}
              className="flex md:hidden items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-slate-600"
              title="手机扫码在真机上体验"
            >
              <QrCode className="w-3 h-3 text-blue-400" />
              <span>扫码真机体验</span>
            </button>

            {/* 返回PC后台 */}
            {onExitToPc && (
              <button
                onClick={onExitToPc}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-slate-600"
              >
                <Monitor className="w-3 h-3" />
                <span>返回PC后台</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 主工作区：左侧提供常驻 QR Code 二维码，中间展示移动端H5视图 */}
      <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden relative min-h-0 gap-6 lg:gap-10">
        
        {/* 桌面端/宽屏：移动端页面左侧提供常驻 QR code 二维码 */}
        {!isSimulatorMode && (
          <div className="hidden md:flex shrink-0 w-72 lg:w-80 h-full max-h-[760px] flex-col justify-center">
            <MobileQrCodePanel 
              alarmId={selectedAlarmId}
              className="w-full"
            />
          </div>
        )}

        {/* 手机视口主容器 (限制在移动端典型宽度以提供最佳真实手机比例) */}
        <div className="w-full max-w-md h-full max-h-[820px] bg-slate-50 flex flex-col overflow-y-auto shadow-2xl relative min-h-0 rounded-none md:rounded-3xl border-0 md:border-4 border-slate-700/80">
        
        {/* 1. 未登录移动端会话：展示移动端专属登录页 (支持短信验证码 / 密码) */}
        {!mobileUser ? (
          <MobileAuthView
            alarmRecord={currentRecord}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : activeReceipt ? (
          /* 3. 已处理完成：展示《告警解除通知回执》及短信发送通知 */
          <MobileAlarmReceiptView
            receipt={activeReceipt}
            sentSmsList={sentSmsList}
            onBackToAlarmList={() => {
              setActiveReceipt(null);
            }}
            onGoToPcView={onExitToPc}
            onPreviewSms={(sms) => setPreviewingSms(sms)}
          />
        ) : currentRecord ? (
          /* 2. 已登录且待处理：展示现场告警信息处理表单 */
          <MobileAlarmProcessView
            alarmRecord={currentRecord}
            currentUser={mobileUser}
            onLogout={handleLogout}
            onSubmitSuccess={handleProcessSubmit}
          />
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            暂无指定的告警工单
          </div>
        )}

        </div>
      </div>

      {/* 小屏扫码二维码弹窗 */}
      {showMobileQrModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowMobileQrModal(false)}
        >
          <div 
            className="w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMobileQrModal(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-600 shadow-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <MobileQrCodePanel alarmId={selectedAlarmId} />
          </div>
        </div>
      )}

      {/* 收到短信模拟弹窗 */}
      {previewingSms && (
        <MobileSmsSimulatorModal
          isOpen={true}
          sms={previewingSms}
          onClose={() => setPreviewingSms(null)}
          onOpenLink={(url) => {
            // 打开链接：解析出告警 ID 并聚焦
            const match = url.match(/id=([A-Z0-9-]+)/);
            if (match && match[1]) {
              setSelectedAlarmId(match[1]);
              setActiveReceipt(null);
            }
          }}
        />
      )}

    </div>
  );
}
