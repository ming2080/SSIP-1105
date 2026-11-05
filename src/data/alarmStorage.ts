import { AlarmEventRecord, SmsNotificationRecord, AlarmReleaseReceipt, AlarmAttachment } from '@/src/types/alarmRecord';
import { INITIAL_ALARM_RECORDS } from './alarmRecordData';

const ALARM_STORAGE_KEY = 'shipyard_alarm_records';
const SMS_STORAGE_KEY = 'shipyard_sms_records';
const RECEIPTS_STORAGE_KEY = 'shipyard_alarm_receipts';

// 初始化初始短信列表，包括已触发的告警短信
const INITIAL_SMS_RECORDS: SmsNotificationRecord[] = [
  {
    id: 'SMS-20260906-001',
    alarmId: 'ALM-20260906-001',
    type: 'alarm_triggered',
    recipientName: '林峰',
    recipientPhone: '13988219901',
    recipientRole: '车间安全主任',
    content: '【智慧船厂安监平台】紧急告警：[1号造船台·1#液货舱底舱隔舱] 触发 [1号船台密闭舱气体浓度多级告警]，当前浓度19.4 ppm超标(阈值15.0 ppm)，已升至中级告警，请立即核实并排险处置！处理链接：',
    actionUrl: '/m/alarm-process?id=ALM-20260906-001',
    sentAt: '2026-09-06 20:41:12',
    deliveryStatus: 'delivered'
  },
  {
    id: 'SMS-20260906-002',
    alarmId: 'ALM-20260906-001',
    type: 'alarm_triggered',
    recipientName: '陈建国',
    recipientPhone: '13800123456',
    recipientRole: '当班区域安全员',
    content: '【智慧船厂安监平台】告警通知：[1号造船台·1#液货舱底舱隔舱] 触发低级气体浓度告警，监测值16.2 ppm，请速前往现场查看。处理链接：',
    actionUrl: '/m/alarm-process?id=ALM-20260906-001',
    sentAt: '2026-09-06 20:38:12',
    deliveryStatus: 'delivered'
  },
  {
    id: 'SMS-20260906-003',
    alarmId: 'ALM-20260906-002',
    type: 'alarm_triggered',
    recipientName: '应急指挥中心值班员',
    recipientPhone: '13699998888',
    recipientRole: '厂级安全总监',
    content: '【智慧船厂安监平台】高危红线告警：[2号船坞·4号坞墩深基坑边缘] 识别到人员[刘强]擅入高空临边红线禁区，请立即处置！处理链接：',
    actionUrl: '/m/alarm-process?id=ALM-20260906-002',
    sentAt: '2026-09-06 20:45:00',
    deliveryStatus: 'delivered'
  }
];

export function getStoredAlarmRecords(): AlarmEventRecord[] {
  try {
    const raw = localStorage.getItem(ALARM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored alarm records, falling back to initial data', e);
  }
  // 初次加载存入 localStorage
  try {
    localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(INITIAL_ALARM_RECORDS));
  } catch {
    // ignore
  }
  return INITIAL_ALARM_RECORDS;
}

export function saveAlarmRecords(records: AlarmEventRecord[]): void {
  try {
    localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(records));
    // 派发自定义全局事件，使得在同一个 tab 内其他组件也能瞬时感知
    window.dispatchEvent(new CustomEvent('shipyard_alarm_updated', { detail: { records } }));
  } catch (e) {
    console.error('Failed to save alarm records', e);
  }
}

export function getAlarmRecordById(id: string): AlarmEventRecord | undefined {
  const records = getStoredAlarmRecords();
  return records.find(r => r.id === id);
}

export function getStoredSmsRecords(alarmId?: string): SmsNotificationRecord[] {
  let list: SmsNotificationRecord[] = INITIAL_SMS_RECORDS;
  try {
    const raw = localStorage.getItem(SMS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } else {
      localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(INITIAL_SMS_RECORDS));
    }
  } catch (e) {
    console.warn('Failed to load SMS records', e);
  }
  if (alarmId) {
    return list.filter(s => s.alarmId === alarmId);
  }
  return list;
}

export function addSmsRecord(sms: SmsNotificationRecord): void {
  try {
    const list = getStoredSmsRecords();
    const updated = [sms, ...list];
    localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('shipyard_sms_updated', { detail: { sms } }));
  } catch (e) {
    console.error('Failed to save SMS record', e);
  }
}

export function getStoredReceipts(): Record<string, AlarmReleaseReceipt> {
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load receipts', e);
  }
  return {};
}

export function getAlarmReceipt(alarmId: string): AlarmReleaseReceipt | undefined {
  const receipts = getStoredReceipts();
  if (receipts[alarmId]) return receipts[alarmId];

  // 检查告警对象自身是否包含
  const record = getAlarmRecordById(alarmId);
  return record?.releaseReceipt;
}

export function saveAlarmReceipt(receipt: AlarmReleaseReceipt): void {
  try {
    const receipts = getStoredReceipts();
    receipts[receipt.alarmId] = receipt;
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(receipts));
  } catch (e) {
    console.error('Failed to save receipt', e);
  }
}

/**
 * 核心流程 3 & 4 & 5:
 * 处理人员在手机移动端 H5 提交现场处理并解除告警：
 * 1. 更新告警状态为 closed (已处理，告警解除)
 * 2. 写入现场处置信息、现场照片/视频凭据与电子签名
 * 3. 追加流转历史节点 (工作流轨迹)
 * 4. 生成规范的《告警解除通知回执单》
 * 5. 自动向相关人员发送【告警解除短信通知】
 * 6. 同步更新并广播至全局，使得 PC 告警列表实时刷新显示“已处理”
 */
export interface MobileProcessSubmitParams {
  alarmId: string;
  handlerName: string;
  handlerPhone: string;
  handlerDept?: string;
  releaseType: 'hazard_cleared' | 'false_alarm_cleared' | 'emergency_escalated';
  causeSummary: string;
  measureSummary: string;
  retestMetrics?: string;
  attachments: AlarmAttachment[];
  signatureUrl?: string;
}

export function processAndReleaseAlarmFromH5(params: MobileProcessSubmitParams): {
  record: AlarmEventRecord;
  receipt: AlarmReleaseReceipt;
  sentSmsList: SmsNotificationRecord[];
} {
  const records = getStoredAlarmRecords();
  const targetIndex = records.findIndex(r => r.id === params.alarmId);
  if (targetIndex === -1) {
    throw new Error(`找不到编号为 ${params.alarmId} 的告警记录`);
  }

  const current = records[targetIndex];
  const now = new Date();
  const nowStr = now.toISOString().replace('T', ' ').substring(0, 19);
  const dateNum = nowStr.substring(0, 10).replace(/-/g, '');
  const receiptNo = `REL-${dateNum}-${String(Math.floor(1000 + Math.random() * 9000))}`;

  // 1. 拟定解除短信通知对象名单
  const defaultRecipients = [
    {
      name: current.currentNotifyTarget ? current.currentNotifyTarget.split('-')[1] || current.currentNotifyTarget : '车间安全主任 (林峰)',
      role: '车间安全主管',
      phone: (current.handlerPhone || '13988219901').replace(/-/g, '')
    },
    {
      name: '陈建国',
      role: '当班区域安全员',
      phone: '13800123456'
    },
    {
      name: '应急指挥中心',
      role: '厂级安全值班室',
      phone: '13699998888'
    }
  ];

  // 2. 生成告警解除通知短信
  const releaseTypeLabel = 
    params.releaseType === 'hazard_cleared' ? '现场排险达标·告警解除' :
    params.releaseType === 'false_alarm_cleared' ? '现场核验误报消除' : '紧急上报指挥中心';

  const sentSmsList: SmsNotificationRecord[] = defaultRecipients.map((rec, idx) => {
    const smsId = `SMS-REL-${dateNum}-${String(Math.floor(1000 + Math.random() * 9000))}-${idx + 1}`;
    const smsContent = `【智慧船厂安监平台】告警解除通知：位于[${current.areaName}]的[${current.policyName}](单号:${current.id})已由现场处置人[${params.handlerName}]完成处置(${releaseTypeLabel})，现场复测恢复安全基线，告警已正式解除！回执单号：${receiptNo}`;

    const smsRecord: SmsNotificationRecord = {
      id: smsId,
      alarmId: current.id,
      type: 'alarm_released',
      recipientName: rec.name,
      recipientPhone: rec.phone,
      recipientRole: rec.role,
      content: smsContent,
      sentAt: nowStr,
      deliveryStatus: 'delivered'
    };
    addSmsRecord(smsRecord);
    return smsRecord;
  });

  // 3. 构建解除通知回执
  const receipt: AlarmReleaseReceipt = {
    receiptNo,
    alarmId: current.id,
    alarmTitle: current.policyName,
    areaName: current.areaName,
    projectName: current.projectName,
    releasedAt: nowStr,
    handlerName: params.handlerName,
    handlerPhone: params.handlerPhone,
    handlerDept: params.handlerDept || current.personDept || '总装建造车间安环科',
    releaseType: params.releaseType,
    releaseTypeLabel,
    causeSummary: params.causeSummary,
    measureSummary: params.measureSummary,
    retestMetrics: params.retestMetrics || (current.policyType.includes('气体') ? '气体检测仪复测：浓度降至 0 ppm (达标)' : '现场安全复查合格'),
    signatureUrl: params.signatureUrl,
    attachments: params.attachments,
    notifiedPersons: sentSmsList.map(s => ({
      name: s.recipientName,
      role: s.recipientRole,
      phone: s.recipientPhone,
      smsContent: s.content,
      status: 'delivered',
      time: nowStr
    }))
  };

  saveAlarmReceipt(receipt);

  // 4. 追加流转日志
  const newWorkflowLog = {
    id: `step-${current.workflowLogs.length + 1}`,
    stepName: '移动端H5现场排险闭环解除',
    operator: `${params.handlerName} (移动端)`,
    role: '现场安全工程师',
    department: params.handlerDept || '现场安全应急组',
    time: nowStr,
    action: `通过手机H5端完成现场核查处置，生成解除通知回执(${receiptNo})，已自动发送短信通知相关人员。`,
    comment: `处置说明：${params.measureSummary}。复测指标：${receipt.retestMetrics}`,
    status: 'completed' as const
  };

  // 5. 更新目标告警记录并写回存储
  const updatedRecord: AlarmEventRecord = {
    ...current,
    processStatus: params.releaseType === 'false_alarm_cleared' ? 'false_alarm' : 'closed',
    isRealtime: false,
    resolvedTime: nowStr,
    closedTime: nowStr,
    handler: `${params.handlerName} (移动H5现场处理)`,
    handlerPhone: params.handlerPhone,
    causeAnalysis: params.causeSummary,
    correctiveActions: params.measureSummary,
    reviewNotes: `现场已出具解除回执单[${receiptNo}]，解除短信已全量送达`,
    attachments: [
      ...(current.attachments || []),
      ...params.attachments
    ],
    releaseReceipt: receipt,
    workflowLogs: [
      ...current.workflowLogs.map(l => ({ ...l, status: 'completed' as const })),
      newWorkflowLog
    ]
  };

  records[targetIndex] = updatedRecord;
  saveAlarmRecords(records);

  return {
    record: updatedRecord,
    receipt,
    sentSmsList
  };
}

/**
 * 监听告警数据变动 (支持组件内 useEffect 自动同步)
 */
export function subscribeAlarmChanges(callback: (records: AlarmEventRecord[]) => void): () => void {
  const handler = () => {
    callback(getStoredAlarmRecords());
  };
  window.addEventListener('shipyard_alarm_updated', handler);
  window.addEventListener('storage', (e) => {
    if (e.key === ALARM_STORAGE_KEY) {
      handler();
    }
  });
  return () => {
    window.removeEventListener('shipyard_alarm_updated', handler);
  };
}
