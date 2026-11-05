export type AlarmLevel = '低' | '中' | '高';

export type AlarmProcessStatus = 
  | 'pending'     // 待响应 / 倒计时升级中
  | 'processing'  // 处理中 / 已接单排查
  | 'recovered'   // 已恢复 / 指标正常待复核
  | 'closed'      // 已闭环 / 整改完成已归档
  | 'false_alarm';// 误报消除

export interface AlarmAttachment {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: string;
  uploadTime: string;
}

export interface AlarmWorkflowStep {
  id: string;
  stepName: string;
  operator: string;
  role: string;
  department: string;
  time: string;
  action: string;
  comment?: string;
  status: 'completed' | 'current' | 'pending';
  attachments?: string[];
}

export interface AlarmUpgradeLevelPlan {
  level: AlarmLevel;
  target: string;
  countdown: string; // 如 '10分钟', '5分钟', '最高级别无需升级'
  status: 'passed' | 'active' | 'pending';
  triggeredAt?: string;
}

export interface AlarmEventRecord {
  id: string; // 如 'ALM-20260906-001'
  policyId: number;
  policyName: string; // 对应告警策略名称，如 '1号船台密闭舱气体浓度多级告警'
  policyVersion: string; // 如 'V2'
  policyType: string; // 策略类型：人员进入 / 气体告警 / 安全帽脱落 / 厂区吸烟 / 厂区玩手机 / 异常停留 / 烟感告警 (严格7类)
  projectName: string; // 关联造船工程项目或空
  projectType?: 'shipbuilding' | 'none'; // 项目关联情况：造船项目关联 vs 无项目关联 (厂区范围内)
  isRealtime: boolean; // 是否当前实时未闭环告警 (true: 实时告警, false: 历史告警)

  // 关联设备配置 (用于环境检测告警)
  deviceName?: string; // 关联设备名称，如 '防爆型固定式可燃气体探测仪'
  deviceCode?: string; // 设备唯一编号，如 'GT-G04-A'
  deviceType?: string; // 设备类型，如 '在线传感器 / 激光气体遥测仪'

  // 策略条件与触发数值
  conditionDesc: string; // 规则表达式说明，如 '可燃气体浓度 > 15 ppm'
  currentValue: string; // 当前遥测值，如 '18.6 ppm'
  thresholdValue: string; // 阈值，如 '15.0 ppm'
  unit?: string;

  // 区域范围配置 (对应表单：作业面 / 有限空间 / 电子围栏 严格3类)
  areaType: string; // 区域类型：作业面、有限空间、电子围栏
  areaName: string; // 指定区域名称，如 '1号船台搭载作业面 (185段)'
  areaConditions: Array<{ type: string; relation: string; target: string }>;

  // 人员范围配置 (对应表单)
  targetPerson: string; // 涉事人员姓名，如 '张伟'
  personId: string; // 工号，如 'EMP-015'
  personRole: string; // 工种，如 '焊接工'
  personDept: string; // 班组，如 '外协结构二队'
  personConditions: Array<{ scope: string; relation: string; target: string }>;

  // 告警级别与多级联动升级配置 (对应表单)
  initialLevel: AlarmLevel;
  currentLevel: AlarmLevel;
  currentNotifyTarget: string; // 当前通知对象，如 '车间安全主任-林峰'
  upgradeStatus: 'normal' | 'upgrading' | 'upgraded' | 'suppressed' | 'max';
  upgradeCountdownSeconds: number; // 剩余秒数
  upgradePlans: AlarmUpgradeLevelPlan[]; // 低、中、高升级链

  // 通知方式与周期 (对应表单)
  notifyWays: string[]; // ['声光报警通知', '发送短信通知']
  soundLightStatus: 'active' | 'muted' | 'normal';
  smsNoticeCount: number;
  repeatInterval: '不重复' | '重复告警';
  effectivePeriod: '自定义' | '永久';

  // 时间维度
  triggerTime: string; // 发生时间
  durationStr: string; // 持续时间，如 '持续 24分钟'
  resolvedTime?: string; // 恢复正常时间
  closedTime?: string; // 闭环归档时间

  // 处理状态与流程
  processStatus: AlarmProcessStatus;
  handler?: string; // 处理人
  handlerPhone?: string;
  causeAnalysis?: string; // 原因分析
  correctiveActions?: string; // 处置整改措施
  reviewNotes?: string; // 复核审核意见
  attachments?: AlarmAttachment[]; // 现场处理上传的图片或视频附件 (最大50MB)
  workflowLogs: AlarmWorkflowStep[]; // 表单流转审批轨迹
  releaseReceipt?: AlarmReleaseReceipt; // 现场处理生成的解除回执
}

export interface SmsNotificationRecord {
  id: string;
  alarmId: string;
  type: 'alarm_triggered' | 'alarm_upgraded' | 'alarm_released' | 'auth_code';
  recipientName: string;
  recipientPhone: string;
  recipientRole: string;
  content: string;
  actionUrl?: string;
  sentAt: string;
  deliveryStatus: 'sent' | 'delivered' | 'failed';
}

export interface AlarmReleaseReceipt {
  receiptNo: string;
  alarmId: string;
  alarmTitle: string;
  areaName: string;
  projectName?: string;
  releasedAt: string;
  handlerName: string;
  handlerPhone: string;
  handlerDept: string;
  releaseType: 'hazard_cleared' | 'false_alarm_cleared' | 'emergency_escalated';
  releaseTypeLabel: string;
  causeSummary: string;
  measureSummary: string;
  retestMetrics?: string;
  signatureUrl?: string;
  attachments: AlarmAttachment[];
  notifiedPersons: Array<{
    name: string;
    role: string;
    phone: string;
    smsContent?: string;
    status: 'delivered' | 'sent';
    time: string;
  }>;
}
