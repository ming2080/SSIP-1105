import { AlarmLevel } from '@/src/types/alarmRecord';

// 时间跨度类型
export type AnalyticsTimeRange = 'today' | 'week' | 'month' | 'quarter';

// 空间与区域筛选类型
export type AnalyticsZoneScope = 'all' | 'dock_1' | 'dock_2' | 'workshop' | 'coating' | 'wharf';

// 1. 告警配置策略与触发类型关联数据
export interface PolicyTriggerMetric {
  policyId: number;
  policyName: string;
  policyType: string; // 触发告警类型
  version: string;
  category: 'person' | 'environment' | 'device';
  triggerCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  avgResponseSeconds: number; // 平均响应时长
  avgResolveMinutes: number;  // 平均闭环时长
  falseAlarmRate: number;     // 误报率 %
  escalationCount: number;    // 触发多级超时升级次数
  status: '启用' | '禁用';
  sensitivity: '适中' | '过敏' | '迟钝';
  recommendation: string;     // 策略优化建议
}

// 2. 告警设备检测与监测效能数据
export interface DeviceDetectionMetric {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  deviceCode: string;
  location: string;
  zone: AnalyticsZoneScope;
  zoneName: string;
  detectCount: number;        // 检测告警数量
  filteredNoise: number;      // 算法过滤杂波/伪告警数
  onlineRate: number;         // 在线率 %
  calibrationStatus: '正常' | '待标定' | '临期警告';
  healthScore: number;        // 健康评分 0-100
  lastAlarmTime: string;
  primaryAlarmType: string;
}

// 3. 预防安全事件发生的概率与风险阻断数据
export interface IncidentPreventionMetric {
  id: string;
  hazardType: string;         // 危险源/潜在事故类别
  targetZone: string;         // 涉及重点工区
  mitigatedCount: number;     // 成功阻断潜在险情起数
  preventionRate: number;     // 事故预防阻断率 %
  incidentProbabilityDrop: number; // 相比未设防时安全事故发生概率下降 %
  avoidedLossAmount: string;  // 避免潜在财产与工伤损失估算
  barrierLevel: '一类重大' | '二类重点' | '三类常规';
  keySafeguard: string;       // 核心防护机制与手段
}

// 4. 施工班组与第一响应人效能排行
export interface TeamEfficiencyRank {
  rank: number;
  teamName: string;
  leadPerson: string;
  assignedZone: string;
  receivedCount: number;
  mttaSeconds: number;        // 平均确认响应时间
  mttrMinutes: number;        // 平均处理闭环时间
  escalationCount: number;    // 超时升级次数
  slaComplianceRate: number;  // SLA 达标率 %
  score: number;              // 综合能效评分
}

// 5. 24小时触发时段走势
export interface HourlyTrendPoint {
  hour: string;
  high: number;
  medium: number;
  low: number;
  total: number;
  mttaSeconds: number;
}

// 6. 安全防御漏斗
export interface PreventionFunnelStep {
  step: string;
  count: number;
  percentage: number;
  subText: string;
}

// 区域映射选项
export const ZONE_SCOPE_OPTIONS: { id: AnalyticsZoneScope; label: string; subLabel: string }[] = [
  { id: 'all', label: '全厂区综合', subLabel: '全部工区与在建船舶' },
  { id: 'dock_1', label: '1号造船台 (H1821A)', subLabel: '17.4万方LNG特种船标段' },
  { id: 'dock_2', label: '2号造船坞 (H2400)', subLabel: '24000TEU大型集装箱船' },
  { id: 'workshop', label: '分段结构加工车间', subLabel: '总装焊接与胎架组装区' },
  { id: 'coating', label: '涂装特种作业区', subLabel: '密闭喷砂与特种防腐房' },
  { id: 'wharf', label: '舾装码头水上调试区', subLabel: '系泊试验与动力试车区' }
];

// 基础策略配置与触发效能数据集
export const RAW_POLICY_METRICS: PolicyTriggerMetric[] = [
  {
    policyId: 1,
    policyName: '1号船台密闭舱气体浓度多级告警',
    policyType: '气体告警',
    version: 'V2',
    category: 'environment',
    triggerCount: 46,
    highCount: 5,
    mediumCount: 18,
    lowCount: 23,
    avgResponseSeconds: 68,
    avgResolveMinutes: 11.2,
    falseAlarmRate: 1.2,
    escalationCount: 2,
    status: '启用',
    sensitivity: '适中',
    recommendation: '阻断多起缺氧窒息风险，策略运行稳健，建议保持当前两级阈值。'
  },
  {
    policyId: 2,
    policyName: '涂装喷砂特种防爆区人员违规进入',
    policyType: '人员进入',
    version: 'V2',
    category: 'person',
    triggerCount: 54,
    highCount: 4,
    mediumCount: 22,
    lowCount: 28,
    avgResponseSeconds: 52,
    avgResolveMinutes: 8.5,
    falseAlarmRate: 2.1,
    escalationCount: 1,
    status: '启用',
    sensitivity: '适中',
    recommendation: '门禁联动声光警报响应极快，有效拦截非防爆装备作业人员。'
  },
  {
    policyId: 3,
    policyName: '动火合拢区智能烟感与初期火焰',
    policyType: '烟感告警',
    version: 'V3',
    category: 'environment',
    triggerCount: 38,
    highCount: 6,
    mediumCount: 15,
    lowCount: 17,
    avgResponseSeconds: 45,
    avgResolveMinutes: 9.8,
    falseAlarmRate: 2.8,
    escalationCount: 2,
    status: '启用',
    sensitivity: '过敏',
    recommendation: '氩弧焊强光偶发误触双光谱，建议将持续确认帧数微调由2秒升至3秒。'
  },
  {
    policyId: 4,
    policyName: '船坞高空脚手架未戴安全帽识别',
    policyType: '安全帽脱落',
    version: 'V1',
    category: 'person',
    triggerCount: 62,
    highCount: 1,
    mediumCount: 19,
    lowCount: 42,
    avgResponseSeconds: 74,
    avgResolveMinutes: 5.6,
    falseAlarmRate: 1.5,
    escalationCount: 0,
    status: '启用',
    sensitivity: '适中',
    recommendation: '高空防坠安全防护成效显著，班组习惯改进明显，违章率环比降40%。'
  },
  {
    policyId: 5,
    policyName: '易燃易爆品仓库周边违规吸烟',
    policyType: '厂区吸烟',
    version: 'V1',
    category: 'person',
    triggerCount: 12,
    highCount: 2,
    mediumCount: 7,
    lowCount: 3,
    avgResponseSeconds: 38,
    avgResolveMinutes: 12.0,
    falseAlarmRate: 0.8,
    escalationCount: 1,
    status: '启用',
    sensitivity: '适中',
    recommendation: '零容忍高危策略，AI视觉微小烟气识别率达99.1%，杜绝引燃源。'
  },
  {
    policyId: 6,
    policyName: '双层底受限狭小舱室作业超时停留',
    policyType: '异常停留',
    version: 'V2',
    category: 'person',
    triggerCount: 41,
    highCount: 0,
    mediumCount: 14,
    lowCount: 27,
    avgResponseSeconds: 88,
    avgResolveMinutes: 16.4,
    falseAlarmRate: 3.2,
    escalationCount: 3,
    status: '启用',
    sensitivity: '适中',
    recommendation: '定位标签工牌静止超25分钟自动报警，成功预防热衰竭与疲劳晕厥。'
  },
  {
    policyId: 7,
    policyName: '龙门吊行走立体警戒区人员闯入',
    policyType: '人员进入',
    version: 'V3',
    category: 'person',
    triggerCount: 29,
    highCount: 3,
    mediumCount: 11,
    lowCount: 15,
    avgResponseSeconds: 42,
    avgResolveMinutes: 4.8,
    falseAlarmRate: 1.0,
    escalationCount: 0,
    status: '启用',
    sensitivity: '适中',
    recommendation: '电子围栏与吊机急停声光互锁，无一次重机盲区侵入事件遗漏。'
  },
  {
    policyId: 8,
    policyName: '机舱管路有限空间作业人员异常停留',
    policyType: '异常停留',
    version: 'V2',
    category: 'person',
    triggerCount: 32,
    highCount: 1,
    mediumCount: 11,
    lowCount: 20,
    avgResponseSeconds: 76,
    avgResolveMinutes: 12.8,
    falseAlarmRate: 1.6,
    escalationCount: 1,
    status: '启用',
    sensitivity: '适中',
    recommendation: '针对有限空间作业超时实施动态阶梯告警，防范热衰竭与疲劳晕厥险情。'
  },
  {
    policyId: 9,
    policyName: '起重重吊作业下方警戒带玩手机',
    policyType: '厂区玩手机',
    version: 'V1',
    category: 'person',
    triggerCount: 27,
    highCount: 0,
    mediumCount: 8,
    lowCount: 19,
    avgResponseSeconds: 82,
    avgResolveMinutes: 6.2,
    falseAlarmRate: 2.4,
    escalationCount: 0,
    status: '启用',
    sensitivity: '迟钝',
    recommendation: '部分遮挡角度抓拍召回率略低，建议在下个版本升级手部骨骼微姿态识别。'
  },
  {
    policyId: 10,
    policyName: '重点施工作业面安全员脱岗告警',
    policyType: '安全员脱岗告警',
    version: 'V1',
    category: 'person',
    triggerCount: 22,
    highCount: 4,
    mediumCount: 12,
    lowCount: 6,
    avgResponseSeconds: 38,
    avgResolveMinutes: 5.4,
    falseAlarmRate: 0.9,
    escalationCount: 1,
    status: '启用',
    sensitivity: '适中',
    recommendation: '与加班单及特种作业票据深度联动，精准监测安全员离开监护区，大幅压降监护真空期。'
  }
];

// 设备检测告警排行与监控网络状态
export const RAW_DEVICE_DETECTION_METRICS: DeviceDetectionMetric[] = [
  {
    deviceId: 'DEV-GT-01',
    deviceName: '防爆型固定式可燃气体探测仪',
    deviceType: '固定式多参数气体探测仪',
    deviceCode: 'GT-G04-A',
    location: '1号造船台 · 1#液货舱底舱隔舱',
    zone: 'dock_1',
    zoneName: '1号造船台 (LNG船)',
    detectCount: 48,
    filteredNoise: 1420,
    onlineRate: 99.8,
    calibrationStatus: '正常',
    healthScore: 98,
    lastAlarmTime: '10分钟前',
    primaryAlarmType: '可燃气体超标 (CH4/VOC)'
  },
  {
    deviceId: 'DEV-CAM-08',
    deviceName: '合拢区AI双光谱热成像球机',
    deviceType: '工业级双光谱视觉安防相机',
    deviceCode: 'IPC-DS-08B',
    location: '2号造船坞 · 艏部右舷脚手架',
    zone: 'dock_2',
    zoneName: '2号造船坞 (集装箱船)',
    detectCount: 56,
    filteredNoise: 3890,
    onlineRate: 99.5,
    calibrationStatus: '正常',
    healthScore: 96,
    lastAlarmTime: '24分钟前',
    primaryAlarmType: '未佩戴安全帽 / 异常动火烟雾'
  },
  {
    deviceId: 'DEV-GT-02',
    deviceName: '便携式泵吸四合一气体变送器',
    deviceType: '防爆型便携气体检测仪',
    deviceCode: 'PGT-P12-C',
    location: '涂装特种作业区 · 密闭涂料调配室',
    zone: 'coating',
    zoneName: '涂装特种作业区',
    detectCount: 39,
    filteredNoise: 980,
    onlineRate: 98.9,
    calibrationStatus: '正常',
    healthScore: 95,
    lastAlarmTime: '45分钟前',
    primaryAlarmType: 'TVOC挥发性有机溶剂超限'
  },
  {
    deviceId: 'DEV-FENCE-03',
    deviceName: '450T龙门吊周界微波对射光栅',
    deviceType: '重型工程机械安全围栏探测器',
    deviceCode: 'FNC-CR-03',
    location: '1号造船台 · 轨道南北主干线',
    zone: 'dock_1',
    zoneName: '1号造船台 (LNG船)',
    detectCount: 31,
    filteredNoise: 2150,
    onlineRate: 100.0,
    calibrationStatus: '正常',
    healthScore: 99,
    lastAlarmTime: '1小时前',
    primaryAlarmType: '吊机作业盲区违规穿越'
  },
  {
    deviceId: 'DEV-SMK-15',
    deviceName: '激光极早期吸气式感烟探测器',
    deviceType: '极早期微颗粒感烟系统',
    deviceCode: 'VESDA-015',
    location: '分段结构车间 · 焊接二区胎架',
    zone: 'workshop',
    zoneName: '分段结构加工车间',
    detectCount: 42,
    filteredNoise: 3200,
    onlineRate: 99.2,
    calibrationStatus: '正常',
    healthScore: 94,
    lastAlarmTime: '2小时前',
    primaryAlarmType: '电缆沟初期过热热解烟雾'
  },
  {
    deviceId: 'DEV-UWB-B04',
    deviceName: '高精度防爆UWB定位微基站',
    deviceType: '厘米级高精室内定位基站',
    deviceCode: 'BS-UWB-04X',
    location: '舾装码头 · 轮机舱水下机舱区',
    zone: 'wharf',
    zoneName: '舾装码头水上调试区',
    detectCount: 26,
    filteredNoise: 870,
    onlineRate: 99.7,
    calibrationStatus: '正常',
    healthScore: 97,
    lastAlarmTime: '3小时前',
    primaryAlarmType: '工牌防拆脱卸 / 密闭超时停留'
  },
  {
    deviceId: 'DEV-CAM-14',
    deviceName: '防爆广角全景红外全天候摄像仪',
    deviceType: '全防爆高清全景摄像仪',
    deviceCode: 'EX-IPC-14A',
    location: '危险化学品仓库 · 气体储罐区',
    zone: 'coating',
    zoneName: '涂装特种作业区',
    detectCount: 18,
    filteredNoise: 1640,
    onlineRate: 99.4,
    calibrationStatus: '待标定',
    healthScore: 91,
    lastAlarmTime: '5小时前',
    primaryAlarmType: '违规吸烟火星识别'
  },
  {
    deviceId: 'DEV-GT-07',
    deviceName: '激光遥测甲烷气体云成像探测仪',
    deviceType: '长距离遥测光谱仪',
    deviceCode: 'TDLS-07M',
    location: '1号造船台 · 液化气罐安装平台',
    zone: 'dock_1',
    zoneName: '1号造船台 (LNG船)',
    detectCount: 15,
    filteredNoise: 2890,
    onlineRate: 99.1,
    calibrationStatus: '正常',
    healthScore: 97,
    lastAlarmTime: '昨天',
    primaryAlarmType: '微量法兰泄漏预警'
  }
];

// 预防安全事件发生的概率与风险阻断效能
export const RAW_INCIDENT_PREVENTIONS: IncidentPreventionMetric[] = [
  {
    id: 'PREV-01',
    hazardType: '密闭舱室窒息与急性中毒事故',
    targetZone: '1号船台底舱 / 双层底隔舱',
    mitigatedCount: 46,
    preventionRate: 99.8,
    incidentProbabilityDrop: 94.5,
    avoidedLossAmount: '约 850 万元',
    barrierLevel: '一类重大',
    keySafeguard: '高灵敏度防爆气体连续探测 + 氧气不足声光强制通风联动 + 智能手环心率静止报警'
  },
  {
    id: 'PREV-02',
    hazardType: '涂装密闭空间可燃气体燃爆与火灾',
    targetZone: '涂装车间 / 液货舱喷砂防腐房',
    mitigatedCount: 38,
    preventionRate: 99.6,
    incidentProbabilityDrop: 91.2,
    avoidedLossAmount: '约 1,200 万元',
    barrierLevel: '一类重大',
    keySafeguard: 'TVOC防爆探测器自动联锁断电 + 极早期吸气式烟感 + 违规火源/静电吸烟抓拍'
  },
  {
    id: 'PREV-03',
    hazardType: '高空脚手架坠落及物体打击事故',
    targetZone: '2号船坞艏艉脚手架 / 舷外作业',
    mitigatedCount: 62,
    preventionRate: 98.9,
    incidentProbabilityDrop: 86.8,
    avoidedLossAmount: '约 450 万元',
    barrierLevel: '二类重点',
    keySafeguard: 'AI视觉全天候未戴安全帽秒级识别 + UWB临边危险高度滞留震动警告'
  },
  {
    id: 'PREV-04',
    hazardType: '重型龙门吊与构件转运挤压碰擦',
    targetZone: '造船台主干轨道 / 450T门机盲区',
    mitigatedCount: 29,
    preventionRate: 100.0,
    incidentProbabilityDrop: 96.0,
    avoidedLossAmount: '约 600 万元',
    barrierLevel: '一类重大',
    keySafeguard: '门机运行轨迹动态电子围栏 + 声光穿透式警示广播 + 行人入侵自动降速避险'
  },
  {
    id: 'PREV-05',
    hazardType: '夜间违规疲劳作业与人员失联晕厥',
    targetZone: '深舱隔舱 / 轮机轴系狭长通道',
    mitigatedCount: 41,
    preventionRate: 99.2,
    incidentProbabilityDrop: 89.4,
    avoidedLossAmount: '约 280 万元',
    barrierLevel: '二类重点',
    keySafeguard: 'UWB高精防拆工牌 + 密闭空间25分钟静止无位移预警 + 值班安全员超时升级'
  },
  {
    id: 'PREV-06',
    hazardType: '无特种作业资质人员跨区违章作业',
    targetZone: '分段合拢焊接区 / 高压变配电房',
    mitigatedCount: 35,
    preventionRate: 98.7,
    incidentProbabilityDrop: 82.5,
    avoidedLossAmount: '约 160 万元',
    barrierLevel: '三类常规',
    keySafeguard: '人员工种与电子围栏白名单严格匹配 + 未报备闯入5秒内向班组长手机推送'
  }
];

// 施工班组与第一响应人效能排行
export const RAW_TEAM_EFFICIENCY: TeamEfficiencyRank[] = [
  {
    rank: 1,
    teamName: '结构建造三队 (合拢组)',
    leadPerson: '陈建国',
    assignedZone: '1号造船台 (LNG船)',
    receivedCount: 68,
    mttaSeconds: 46,
    mttrMinutes: 8.4,
    escalationCount: 1,
    slaComplianceRate: 98.9,
    score: 98.5
  },
  {
    rank: 2,
    teamName: '船坞综合安监快速响应班',
    leadPerson: '林峰',
    assignedZone: '2号造船坞 (集装箱船)',
    receivedCount: 74,
    mttaSeconds: 52,
    mttrMinutes: 9.1,
    escalationCount: 2,
    slaComplianceRate: 98.2,
    score: 97.4
  },
  {
    rank: 3,
    teamName: '涂装防腐特种工程队',
    leadPerson: '周伟东',
    assignedZone: '涂装特种作业区',
    receivedCount: 49,
    mttaSeconds: 58,
    mttrMinutes: 10.6,
    escalationCount: 1,
    slaComplianceRate: 97.6,
    score: 96.2
  },
  {
    rank: 4,
    teamName: '舾装管系调试二组',
    leadPerson: '王海清',
    assignedZone: '舾装码头水上调试区',
    receivedCount: 36,
    mttaSeconds: 76,
    mttrMinutes: 13.5,
    escalationCount: 2,
    slaComplianceRate: 95.8,
    score: 93.8
  },
  {
    rank: 5,
    teamName: '钢结构分段铆焊一部',
    leadPerson: '张富贵',
    assignedZone: '分段结构加工车间',
    receivedCount: 52,
    mttaSeconds: 84,
    mttrMinutes: 14.8,
    escalationCount: 3,
    slaComplianceRate: 94.5,
    score: 92.1
  },
  {
    rank: 6,
    teamName: '外协脚手架搭设施工队',
    leadPerson: '刘立强',
    assignedZone: '全厂脚手架作业面',
    receivedCount: 49,
    mttaSeconds: 110,
    mttrMinutes: 18.2,
    escalationCount: 5,
    slaComplianceRate: 91.2,
    score: 87.6
  }
];

// 24小时告警与响应峰值分布
export const RAW_HOURLY_TREND: HourlyTrendPoint[] = [
  { hour: '00:00', high: 0, medium: 1, low: 3, total: 4, mttaSeconds: 98 },
  { hour: '02:00', high: 0, medium: 1, low: 2, total: 3, mttaSeconds: 105 },
  { hour: '04:00', high: 1, medium: 2, low: 2, total: 5, mttaSeconds: 112 },
  { hour: '06:00', high: 0, medium: 1, low: 4, total: 5, mttaSeconds: 85 },
  { hour: '08:00', high: 2, medium: 8, low: 18, total: 28, mttaSeconds: 62 },
  { hour: '10:00', high: 4, medium: 16, low: 35, total: 55, mttaSeconds: 54 },
  { hour: '12:00', high: 1, medium: 5, low: 12, total: 18, mttaSeconds: 70 },
  { hour: '14:00', high: 5, medium: 19, low: 42, total: 66, mttaSeconds: 58 },
  { hour: '16:00', high: 3, medium: 18, low: 46, total: 67, mttaSeconds: 60 },
  { hour: '18:00', high: 1, medium: 9, low: 24, total: 34, mttaSeconds: 75 },
  { hour: '20:00', high: 1, medium: 6, low: 20, total: 27, mttaSeconds: 82 },
  { hour: '22:00', high: 0, medium: 3, low: 13, total: 16, mttaSeconds: 90 }
];

// 计算不同过滤条件下的动态分析数据
export function getFilteredAlarmAnalytics(
  timeRange: AnalyticsTimeRange,
  zoneScope: AnalyticsZoneScope,
  levelFilter: string
) {
  // 根据时间范围调节倍率
  let multiplier = 1.0;
  if (timeRange === 'today') multiplier = 0.22;
  else if (timeRange === 'week') multiplier = 0.55;
  else if (timeRange === 'month') multiplier = 1.0;
  else if (timeRange === 'quarter') multiplier = 2.85;

  // 1. 过滤策略指标
  let filteredPolicies = RAW_POLICY_METRICS.map(p => {
    let pCount = Math.round(p.triggerCount * multiplier);
    let hCount = Math.round(p.highCount * multiplier);
    let mCount = Math.round(p.mediumCount * multiplier);
    let lCount = Math.max(0, pCount - hCount - mCount);

    if (levelFilter === '高') {
      pCount = hCount;
      mCount = 0;
      lCount = 0;
    } else if (levelFilter === '中') {
      pCount = mCount;
      hCount = 0;
      lCount = 0;
    } else if (levelFilter === '低') {
      pCount = lCount;
      hCount = 0;
      mCount = 0;
    }

    return {
      ...p,
      triggerCount: pCount,
      highCount: hCount,
      mediumCount: mCount,
      lowCount: lCount
    };
  }).filter(p => p.triggerCount > 0 || levelFilter === '');

  // 2. 过滤设备指标
  let filteredDevices = RAW_DEVICE_DETECTION_METRICS.filter(d => {
    if (zoneScope !== 'all' && d.zone !== zoneScope) return false;
    return true;
  }).map(d => ({
    ...d,
    detectCount: Math.round(d.detectCount * multiplier)
  })).sort((a, b) => b.detectCount - a.detectCount);

  // 3. 统计汇总 KPI
  const totalAlerts = filteredPolicies.reduce((acc, curr) => acc + curr.triggerCount, 0);
  const totalHigh = filteredPolicies.reduce((acc, curr) => acc + curr.highCount, 0);
  const totalMedium = filteredPolicies.reduce((acc, curr) => acc + curr.mediumCount, 0);
  const totalLow = filteredPolicies.reduce((acc, curr) => acc + curr.lowCount, 0);

  // 平均响应时长 (秒)
  const weightedMtta = Math.round(
    filteredPolicies.reduce((acc, curr) => acc + curr.avgResponseSeconds * curr.triggerCount, 0) /
    (totalAlerts || 1)
  );

  // 平均闭环处置时长 (分)
  const weightedMttr = Number((
    filteredPolicies.reduce((acc, curr) => acc + curr.avgResolveMinutes * curr.triggerCount, 0) /
    (totalAlerts || 1)
  ).toFixed(1));

  // 总体防范成功率
  const incidentPreventionRate = 99.42;

  // 避免严重事故起数
  const totalMitigatedIncidents = Math.round(
    RAW_INCIDENT_PREVENTIONS.reduce((acc, curr) => acc + curr.mitigatedCount, 0) * multiplier
  );

  // 避免潜在损失估算合计
  const estimatedAvoidedLoss = timeRange === 'quarter' 
    ? '约 3,540 万元' 
    : timeRange === 'month' 
      ? '约 1,280 万元' 
      : timeRange === 'week' 
        ? '约 310 万元' 
        : '约 65 万元';

  // 策略类型聚合 (用于图表)
  const typeMap: Record<string, { count: number; high: number; medium: number; low: number }> = {};
  filteredPolicies.forEach(p => {
    if (!typeMap[p.policyType]) {
      typeMap[p.policyType] = { count: 0, high: 0, medium: 0, low: 0 };
    }
    typeMap[p.policyType].count += p.triggerCount;
    typeMap[p.policyType].high += p.highCount;
    typeMap[p.policyType].medium += p.mediumCount;
    typeMap[p.policyType].low += p.lowCount;
  });

  const typeDistributionData = Object.keys(typeMap).map(type => ({
    name: type,
    value: typeMap[type].count,
    high: typeMap[type].high,
    medium: typeMap[type].medium,
    low: typeMap[type].low,
    rate: Number(((typeMap[type].count / (totalAlerts || 1)) * 100).toFixed(1))
  })).sort((a, b) => b.value - a.value);

  // 设备类型聚合
  const deviceTypeMap: Record<string, number> = {};
  filteredDevices.forEach(d => {
    deviceTypeMap[d.deviceType] = (deviceTypeMap[d.deviceType] || 0) + d.detectCount;
  });
  const deviceTypeData = Object.keys(deviceTypeMap).map(name => ({
    name,
    count: deviceTypeMap[name]
  })).sort((a, b) => b.count - a.count);

  // 24小时走势
  const hourlyTrend = RAW_HOURLY_TREND.map(h => ({
    ...h,
    high: Math.round(h.high * (multiplier < 1 ? multiplier * 1.5 : multiplier * 0.8)),
    medium: Math.round(h.medium * (multiplier < 1 ? multiplier * 1.5 : multiplier * 0.8)),
    low: Math.round(h.low * (multiplier < 1 ? multiplier * 1.5 : multiplier * 0.8)),
    total: Math.round(h.total * (multiplier < 1 ? multiplier * 1.5 : multiplier * 0.8))
  }));

  // 风险阻断漏斗模型
  const funnelSteps: PreventionFunnelStep[] = [
    {
      step: '物联网传感全量遥测',
      count: Math.round(18400 * multiplier),
      percentage: 100,
      subText: '包括气体传感器、热成像、UWB定位心跳等持续感知'
    },
    {
      step: '智能策略规则命中判定',
      count: totalAlerts,
      percentage: Number(((totalAlerts / (Math.round(18400 * multiplier) || 1)) * 100).toFixed(1)),
      subText: '过滤日常扰动噪声，命中精准策略规则'
    },
    {
      step: '声光互锁与分级实时推送',
      count: totalAlerts,
      percentage: 100,
      subText: '3秒内推达现场第一责任人并启动分级升级机制'
    },
    {
      step: '一线班组到场干预与排查',
      count: Math.round(totalAlerts * 0.988),
      percentage: 98.8,
      subText: '平均 1分18秒 到位介入，落实通风/隔离/佩戴防护'
    },
    {
      step: '重特大险情零转化闭环',
      count: 0,
      percentage: 0,
      subText: '成功阻断险情扩散，重特大安全事故转化为 0'
    }
  ];

  return {
    kpi: {
      totalAlerts,
      totalHigh,
      totalMedium,
      totalLow,
      weightedMtta,
      weightedMttr,
      incidentPreventionRate,
      totalMitigatedIncidents,
      estimatedAvoidedLoss,
      policyCount: RAW_POLICY_METRICS.length,
      activePolicyCount: filteredPolicies.length,
      deviceOnlineRate: 99.4,
      slaComplianceRate: 98.2,
      falseAlarmAverage: 1.8
    },
    policyMetrics: filteredPolicies,
    deviceMetrics: filteredDevices,
    typeDistributionData,
    deviceTypeData,
    incidentPreventions: RAW_INCIDENT_PREVENTIONS,
    teamEfficiency: RAW_TEAM_EFFICIENCY,
    hourlyTrend,
    funnelSteps
  };
}
