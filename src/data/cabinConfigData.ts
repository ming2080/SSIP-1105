/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 船舶项目船舱配置与进出人员统计规则数据模型
 * 业务定位：
 * 1. 船舶项目各舱室进出规则设定（多低频激励器与触发模式关联）
 * 2. 统计进入船舱的人员总数及人员花名册
 * 3. 关联作业面大屏的“舱内密集人员数”及空间视图“船舱人员”标签
 */

export interface ExciterDeviceOption {
  id: string;
  code: string;
  name: string;
  location: string;
  floor?: string;
  modelLevel?: string;
  status: '在线' | '离线';
  frequency?: string; // 125KHz 低频门禁 / 2.4GHz / UWB
  coverageRange?: string; // 1.5m ~ 5.0m
}

export interface CabinRuleEntry {
  ruleName: string;
  enabled: boolean;
  detectionMode: 'single_exciter' | 'dual_sequence' | 'signal_rssi';
  associatedDeviceIds: string[]; // 关联的多个激励器设备ID
  debounceSeconds: number;       // 防抖过滤秒数
  description?: string;
}

export interface CabinRuleExit {
  ruleName: string;
  enabled: boolean;
  detectionMode: 'single_exciter' | 'dual_sequence' | 'auto_timeout';
  associatedDeviceIds: string[]; // 关联的多个激励器设备ID
  autoExitHours: number;         // 超时自动出舱小时数
  description?: string;
}

export interface CabinPersonnelItem {
  id: string;
  workerId: string;       // 工号
  name: string;           // 姓名
  team: string;           // 班组
  trade: string;          // 工种
  tagCode: string;        // 标签编号
  phone: string;          // 电话
  location: string;       // 所在船舱位置
  cabinId: string;        // 关联船舱ID
  projectId: string;      // 关联船舶项目ID
  projectName: string;    // 船舶项目名称
  entryTime: string;      // 进入时间
  durationMinutes: number;// 停留分钟数
  duration: string;       // 停留时间展示 (如 "1小时25分")
  status: '在舱作业中' | '停留超时' | '异常闯入' | '关注状态';
  triggeredExciterCode: string; // 触发激励器编码
  triggeredExciterName: string; // 触发激励器名称
}

export interface CabinConfigItem {
  id: string;
  projectId: string;
  projectName: string;
  cabinId: string;
  cabinCode: string;
  cabinName: string;
  modelLevel: string;     // deck | middle | bottom | engine
  modelLevelName: string; // 甲板层 | 中舱层 | 底舱层 | 机舱区
  volume?: number;        // 容积 m³
  capacityLimit: number;  // 定员上限
  denseThreshold: number; // 密集判定门限，默认3人
  maxStayMinutes: number; // 最长滞留预警分钟数，默认120分钟
  entryRule: CabinRuleEntry;
  exitRule: CabinRuleExit;
  currentPersonnelCount: number; // 根据进出规则统计的当前有效在舱人数
  updatedAt: string;
}

// 预设系统可选的低频/微功率激励器设备库
export const MOCK_EXCITER_DEVICES: ExciterDeviceOption[] = [
  {
    id: 'EXC-LNG-01',
    code: 'EX-01-A',
    name: '1#液货舱人孔直梯进舱激励器',
    location: '1#液货舱主甲板人孔口直梯处',
    floor: '主甲板',
    modelLevel: 'deck',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '1.8m 舱口精确定界'
  },
  {
    id: 'EXC-LNG-02',
    code: 'EX-01-B',
    name: '1#液货舱内梯下口出舱激励器',
    location: '1#液货舱内梯底部休息平台',
    floor: '中舱层',
    modelLevel: 'middle',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.0m 阶梯感应'
  },
  {
    id: 'EXC-LNG-03',
    code: 'EX-02-A',
    name: '双层底压载舱主入舱通道激励器',
    location: '双层底左舷水密检修人孔门',
    floor: '底舱层',
    modelLevel: 'bottom',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '1.5m 门禁区'
  },
  {
    id: 'EXC-LNG-04',
    code: 'EX-02-B',
    name: '双层底压载舱备用排气口出舱激励器',
    location: '双层底右舷通气孔检修通道',
    floor: '底舱层',
    modelLevel: 'bottom',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.2m'
  },
  {
    id: 'EXC-LNG-05',
    code: 'EX-03-A',
    name: '机舱底层动力区人孔进舱激励器',
    location: '主机基座下方管隧入口处',
    floor: '机舱底层',
    modelLevel: 'engine',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m 舱门通道'
  },
  {
    id: 'EXC-LNG-06',
    code: 'EX-03-B',
    name: '机舱底层集油井检修通道激励器',
    location: '集油井防爆水密门外侧',
    floor: '机舱底层',
    modelLevel: 'engine',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '1.8m'
  },
  {
    id: 'EXC-LNG-07',
    code: 'EX-04-A',
    name: '艏尖隔舱水密检修孔进出一体激励器',
    location: '艏尖舱纵隔壁人孔直爬梯',
    floor: '底舱层',
    modelLevel: 'bottom',
    status: '在线',
    frequency: '125KHz/蓝牙混合',
    coverageRange: '3.0m'
  },
  {
    id: 'EXC-LNG-08',
    code: 'EX-04-B',
    name: '隔离空舱临时工艺观察孔激励器',
    location: '货舱间隔离空舱顶板工艺孔',
    floor: '中舱层',
    modelLevel: 'middle',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '1.5m'
  }
];

// 项目默认初始船舱规则列表
export const INITIAL_PROJECT_CABINS: Record<string, CabinConfigItem[]> = {
  'PRJ-2026-LNG01': [
    {
      id: 'CC-LNG-01',
      projectId: 'PRJ-2026-LNG01',
      projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
      cabinId: 'WF-LNG-001',
      cabinCode: 'CS-LNG-01',
      cabinName: '1#液货舱双层底压载舱',
      modelLevel: 'bottom',
      modelLevelName: '底舱层 (双层底/压载密闭舱)',
      volume: 4800,
      capacityLimit: 12,
      denseThreshold: 3,
      maxStayMinutes: 120,
      entryRule: {
        ruleName: '人孔直梯进舱感应规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-01', 'EXC-LNG-03'],
        debounceSeconds: 3,
        description: '当人员佩戴定位标签进入人孔直梯有效场强区时，自动判定为进舱'
      },
      exitRule: {
        ruleName: '人孔直梯出舱与离开规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-02', 'EXC-LNG-04'],
        autoExitHours: 6,
        description: '感应到出舱激励器或离开舱室基站信号超时未响应时结算出舱'
      },
      currentPersonnelCount: 6,
      updatedAt: '2026-10-29 17:30:00'
    },
    {
      id: 'CC-LNG-02',
      projectId: 'PRJ-2026-LNG01',
      projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
      cabinId: 'WF-LNG-002',
      cabinCode: 'CS-LNG-02',
      cabinName: 'NO.96薄膜型绝热液货舱',
      modelLevel: 'middle',
      modelLevelName: '中舱层 (货舱上部/中层平台)',
      volume: 6200,
      capacityLimit: 14,
      denseThreshold: 3,
      maxStayMinutes: 90,
      entryRule: {
        ruleName: '绝热舱气闸门进舱感应规则',
        enabled: true,
        detectionMode: 'dual_sequence',
        associatedDeviceIds: ['EXC-LNG-01'],
        debounceSeconds: 2,
        description: '气闸门内侧激励器触发，确认为施工入舱'
      },
      exitRule: {
        ruleName: '气闸门逆向出舱规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-02'],
        autoExitHours: 4,
        description: '出气闸门感应后自动扣减在舱人数'
      },
      currentPersonnelCount: 8,
      updatedAt: '2026-10-29 17:35:00'
    },
    {
      id: 'CC-LNG-03',
      projectId: 'PRJ-2026-LNG01',
      projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
      cabinId: 'WF-LNG-003',
      cabinCode: 'CS-LNG-03',
      cabinName: '机舱底层动力区集油井',
      modelLevel: 'engine',
      modelLevelName: '机舱动力区 (主机/辅机与管系舱)',
      volume: 480,
      capacityLimit: 6,
      denseThreshold: 3,
      maxStayMinutes: 60,
      entryRule: {
        ruleName: '水密防爆门进舱判定规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-05'],
        debounceSeconds: 3,
        description: '进入集油井前门槛感应触发'
      },
      exitRule: {
        ruleName: '集油井离开出舱规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-06'],
        autoExitHours: 3,
        description: '离开防爆通道结算出舱'
      },
      currentPersonnelCount: 4,
      updatedAt: '2026-10-29 17:40:00'
    },
    {
      id: 'CC-LNG-04',
      projectId: 'PRJ-2026-LNG01',
      projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
      cabinId: 'WF-LNG-004',
      cabinCode: 'CS-LNG-04',
      cabinName: '艏尖隔舱及隔离空舱',
      modelLevel: 'bottom',
      modelLevelName: '底舱层 (双层底/压载密闭舱)',
      volume: 1200,
      capacityLimit: 5,
      denseThreshold: 3,
      maxStayMinutes: 90,
      entryRule: {
        ruleName: '艏尖舱直爬梯进舱规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-07'],
        debounceSeconds: 3,
        description: '直爬梯口低频激励器触发'
      },
      exitRule: {
        ruleName: '艏尖舱离开结算规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-07', 'EXC-LNG-08'],
        autoExitHours: 4,
        description: '感应离开通道判定出舱'
      },
      currentPersonnelCount: 0,
      updatedAt: '2026-10-29 17:42:00'
    }
  ]
};

// 预设在舱人员明细数据
export const INITIAL_CABIN_PERSONNEL: CabinPersonnelItem[] = [
  {
    id: 'CP-01',
    workerId: 'EMP-0821',
    name: '赵铁柱',
    team: '焊装一班',
    trade: '高压焊工',
    tagCode: 'TAG-UWB-9012',
    phone: '138-5126-0471',
    location: '1#液货舱双层底压载舱',
    cabinId: 'CC-LNG-01',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 15:20:14',
    durationMinutes: 135,
    duration: '2小时15分',
    status: '停留超时',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-02',
    workerId: 'EMP-0824',
    name: '钱海生',
    team: '焊装一班',
    trade: '装配工',
    tagCode: 'TAG-UWB-9015',
    phone: '139-0602-8834',
    location: '1#液货舱双层底压载舱',
    cabinId: 'CC-LNG-01',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 15:45:00',
    durationMinutes: 110,
    duration: '1小时50分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-03',
    workerId: 'EMP-0829',
    name: '孙建军',
    team: '管系三班',
    trade: '管工',
    tagCode: 'TAG-UWB-9022',
    phone: '137-9921-3360',
    location: '1#液货舱双层底压载舱',
    cabinId: 'CC-LNG-01',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:10:30',
    durationMinutes: 85,
    duration: '1小时25分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-04',
    workerId: 'EMP-0831',
    name: '李文斌',
    team: '管系三班',
    trade: '管工',
    tagCode: 'TAG-UWB-9033',
    phone: '136-7530-2218',
    location: '1#液货舱双层底压载舱',
    cabinId: 'CC-LNG-01',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:12:10',
    durationMinutes: 83,
    duration: '1小时23分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-05',
    workerId: 'EMP-0835',
    name: '周国强',
    team: '焊装一班',
    trade: '高压焊工',
    tagCode: 'TAG-UWB-9041',
    phone: '135-5948-7702',
    location: '1#液货舱双层底压载舱',
    cabinId: 'CC-LNG-01',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:30:00',
    durationMinutes: 65,
    duration: '1小时05分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-02-A',
    triggeredExciterName: '双层底压载舱主入舱通道激励器'
  },
  {
    id: 'CP-06',
    workerId: 'EMP-0838',
    name: '吴志刚',
    team: '检验五班',
    trade: '质检员',
    tagCode: 'TAG-UWB-9048',
    phone: '138-0501-6645',
    location: '1#液货舱双层底压载舱',
    cabinId: 'CC-LNG-01',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:45:15',
    durationMinutes: 50,
    duration: '50分钟',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-02-A',
    triggeredExciterName: '双层底压载舱主入舱通道激励器'
  },
  {
    id: 'CP-07',
    workerId: 'EMP-0842',
    name: '郑永胜',
    team: '涂装二班',
    trade: '特涂工',
    tagCode: 'TAG-UWB-9055',
    phone: '137-0698-9150',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 15:50:00',
    durationMinutes: 105,
    duration: '1小时45分',
    status: '停留超时',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-08',
    workerId: 'EMP-0845',
    name: '王大海',
    team: '涂装二班',
    trade: '特涂工',
    tagCode: 'TAG-UWB-9060',
    phone: '136-1600-4287',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:00:20',
    durationMinutes: 95,
    duration: '1小时35分',
    status: '停留超时',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-09',
    workerId: 'EMP-0849',
    name: '冯玉明',
    team: '涂装二班',
    trade: '辅助工',
    tagCode: 'TAG-UWB-9066',
    phone: '139-5917-2036',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:15:00',
    durationMinutes: 80,
    duration: '1小时20分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-10',
    workerId: 'EMP-0853',
    name: '陈立新',
    team: '电气四班',
    trade: '电工',
    tagCode: 'TAG-UWB-9072',
    phone: '135-9906-5519',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:20:10',
    durationMinutes: 75,
    duration: '1小时15分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-11',
    workerId: 'EMP-0856',
    name: '褚长青',
    team: '电气四班',
    trade: '电工',
    tagCode: 'TAG-UWB-9078',
    phone: '138-6012-7743',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:25:00',
    durationMinutes: 70,
    duration: '1小时10分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-12',
    workerId: 'EMP-0860',
    name: '卫东升',
    team: '焊装一班',
    trade: '装配工',
    tagCode: 'TAG-UWB-9085',
    phone: '137-7455-0912',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:35:40',
    durationMinutes: 60,
    duration: '1小时00分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-13',
    workerId: 'EMP-0864',
    name: '蒋光辉',
    team: '焊装一班',
    trade: '高压焊工',
    tagCode: 'TAG-UWB-9091',
    phone: '138-2233-4455',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:40:00',
    durationMinutes: 55,
    duration: '55分钟',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-14',
    workerId: 'EMP-0868',
    name: '沈万山',
    team: '检验五班',
    trade: '质检员',
    tagCode: 'TAG-UWB-9098',
    phone: '139-3344-5566',
    location: 'NO.96薄膜型绝热液货舱',
    cabinId: 'CC-LNG-02',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:50:12',
    durationMinutes: 45,
    duration: '45分钟',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-01-A',
    triggeredExciterName: '1#液货舱人孔直梯进舱激励器'
  },
  {
    id: 'CP-15',
    workerId: 'EMP-0872',
    name: '韩春林',
    team: '管系三班',
    trade: '管工',
    tagCode: 'TAG-UWB-9105',
    phone: '137-4455-6677',
    location: '机舱底层动力区集油井',
    cabinId: 'CC-LNG-03',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:30:20',
    durationMinutes: 65,
    duration: '1小时05分',
    status: '停留超时',
    triggeredExciterCode: 'EX-03-A',
    triggeredExciterName: '机舱底层动力区人孔进舱激励器'
  },
  {
    id: 'CP-16',
    workerId: 'EMP-0876',
    name: '杨福贵',
    team: '管系三班',
    trade: '钳工',
    tagCode: 'TAG-UWB-9112',
    phone: '136-5566-7788',
    location: '机舱底层动力区集油井',
    cabinId: 'CC-LNG-03',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:35:10',
    durationMinutes: 60,
    duration: '1小时00分',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-03-A',
    triggeredExciterName: '机舱底层动力区人孔进舱激励器'
  },
  {
    id: 'CP-17',
    workerId: 'EMP-0880',
    name: '朱天成',
    team: '电气四班',
    trade: '电工',
    tagCode: 'TAG-UWB-9118',
    phone: '135-6677-8899',
    location: '机舱底层动力区集油井',
    cabinId: 'CC-LNG-03',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 16:55:00',
    durationMinutes: 40,
    duration: '40分钟',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-03-A',
    triggeredExciterName: '机舱底层动力区人孔进舱激励器'
  },
  {
    id: 'CP-18',
    workerId: 'EMP-0885',
    name: '秦学军',
    team: '焊装一班',
    trade: '高压焊工',
    tagCode: 'TAG-UWB-9125',
    phone: '138-7788-9900',
    location: '机舱底层动力区集油井',
    cabinId: 'CC-LNG-03',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    entryTime: '2026-10-29 17:05:30',
    durationMinutes: 30,
    duration: '30分钟',
    status: '在舱作业中',
    triggeredExciterCode: 'EX-03-A',
    triggeredExciterName: '机舱底层动力区人孔进舱激励器'
  }
];

const CABIN_CONFIGS_STORAGE_KEY = 'ship_cabin_configs_v1';
const CABIN_PERSONNEL_STORAGE_KEY = 'ship_cabin_personnel_v1';

// 读取指定项目的船舱配置
export const getStoredCabinConfigs = (projectId: string): CabinConfigItem[] => {
  try {
    const raw = localStorage.getItem(CABIN_CONFIGS_STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, CabinConfigItem[]> = JSON.parse(raw);
      if (parsed[projectId] && parsed[projectId].length > 0) {
        return parsed[projectId];
      }
    }
  } catch (err) {
    console.error('Failed to load stored cabin configs', err);
  }

  // 兜底返回默认配置
  return INITIAL_PROJECT_CABINS[projectId] || [
    {
      id: `CC-${projectId}-01`,
      projectId: projectId,
      projectName: '船舶工程',
      cabinId: `WF-${projectId}-01`,
      cabinCode: 'CS-01',
      cabinName: '1#主压载水舱',
      modelLevel: 'bottom',
      modelLevelName: '底舱层 (双层底/压载密闭舱)',
      volume: 3600,
      capacityLimit: 10,
      denseThreshold: 3,
      maxStayMinutes: 120,
      entryRule: {
        ruleName: '人孔直梯进舱感应规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-01'],
        debounceSeconds: 3
      },
      exitRule: {
        ruleName: '人孔直梯出舱结算规则',
        enabled: true,
        detectionMode: 'single_exciter',
        associatedDeviceIds: ['EXC-LNG-02'],
        autoExitHours: 6
      },
      currentPersonnelCount: 4,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
  ];
};

// 保存指定项目的船舱配置
export const saveStoredCabinConfigs = (projectId: string, list: CabinConfigItem[]) => {
  try {
    let allConfigs: Record<string, CabinConfigItem[]> = {};
    const raw = localStorage.getItem(CABIN_CONFIGS_STORAGE_KEY);
    if (raw) {
      allConfigs = JSON.parse(raw);
    }
    allConfigs[projectId] = list;
    localStorage.setItem(CABIN_CONFIGS_STORAGE_KEY, JSON.stringify(allConfigs));

    // 同步更新统计总在舱人数
    const totalInCabin = list.reduce((acc, c) => acc + (c.currentPersonnelCount || 0), 0);
    localStorage.setItem(`ship_cabin_total_${projectId}`, String(totalInCabin));
  } catch (err) {
    console.error('Failed to save cabin configs', err);
  }
};

// 读取在舱人员列表
export const getStoredCabinPersonnel = (projectId?: string): CabinPersonnelItem[] => {
  try {
    const raw = localStorage.getItem(CABIN_PERSONNEL_STORAGE_KEY);
    if (raw) {
      const parsed: CabinPersonnelItem[] = JSON.parse(raw);
      if (projectId) {
        return parsed.filter(p => p.projectId === projectId);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load stored cabin personnel', err);
  }

  if (projectId) {
    return INITIAL_CABIN_PERSONNEL.filter(p => p.projectId === projectId);
  }
  return INITIAL_CABIN_PERSONNEL;
};

// 保存在舱人员列表
export const saveStoredCabinPersonnel = (list: CabinPersonnelItem[]) => {
  try {
    localStorage.setItem(CABIN_PERSONNEL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save cabin personnel', err);
  }
};
