import { TrajectoryPoint } from './mockPersonnel';

// 阶段人员信息模型
export interface PhasePersonnel {
  id: string;
  name: string;
  role: string;
  department: string;
  isProjectMember: boolean; // true: 项目组固定成员, false: 外来/外协/非参与流动人员
  category: '项目组核心' | '特种作业' | '外协施工' | '安全监护' | '临时访客/外来人员' | '邻近工段流动';
  locatorId: string;
  helmetColor: 'yellow' | 'red' | 'blue' | 'white' | 'orange';
  status: '在场作业' | '短暂停留' | '已离场' | '违规预警';
  entryTime: string;
  exitTime?: string;
  stayDuration: string;
  currentLocation: string;
  accessAuthorized: boolean; // 是否拥有本阶段区域准入权限
  phone: string;
  battery: number;
  heartRate: number;
  trajectory: TrajectoryPoint[];
  alertsCount: number;
  alerts: {
    id: string;
    time: string;
    level: '高' | '中' | '低';
    type: string;
    description: string;
    status: '已处理' | '待处理' | '已消除';
  }[];
}

// 阶段设备信息模型 (定位感知 + 环境监测)
export interface PhaseDevice {
  id: string;
  name: string;
  category: 'positioning' | 'environmental' | 'alarm';
  categoryLabel: '定位基站设施' | '环境监测传感' | '联动预警终端';
  type: string; // 如 '高精度定位主基站', '4合1防爆气体检测仪', '低频激励器', '智能防爆烟感', '高分贝声光报警器'
  code: string;
  location: string; // 安装工位/舱段，如 '主甲板 SEC-A102', '1号货舱液货绝热区'
  zone: string;
  status: 'online' | 'offline' | 'warning';
  installedDate: string;
  battery?: number;
  signalStrength?: string; // 如 '-65 dBm (极佳)'
  telemetry?: {
    gasName?: string;
    gasValue?: string;
    standardLimit?: string;
    temperature?: string;
    humidity?: string;
    statusText?: string;
  };
  maintainer: string;
}

// 阶段围栏信息模型
export interface PhaseFence {
  id: string;
  code: string;
  name: string;
  type: '吊装警戒区' | '密闭舱受限空间' | '高空悬吊防护' | '防落水隔离' | '动火作业区';
  dimension: '平面电子围栏' | '三维立体空间网格';
  dangerLevel: '高' | '中' | '低';
  location: string;
  ruleDesc: string; // 管控规则
  boundDevices: string[];
  todayViolations: number;
  events: {
    id: string;
    time: string;
    personName: string;
    personId: string;
    isProjectMember: boolean;
    eventType: '非法擅入' | '停留超时' | '脱离安全绳' | '气体越限作业' | '未佩戴安全帽';
    level: '高' | '中' | '低';
    handler: string;
    status: '已处置' | '处置中' | '自动复位';
    notes: string;
  }[];
}

// 阶段告警策略配置与日志模型
export interface PhaseAlarmPolicy {
  id: string;
  name: string;
  type: string;
  version: string; // 如 'V1', 'V2', 'V3'
  level: '高' | '中' | '低';
  isGlobal: boolean; // true 全局生效, false 项目专属
  conditionText: string;
  notifyMechanism: string;
  status: '已启用' | '已暂停';
  logs: {
    id: string;
    time: string;
    triggerSource: string; // 人员或设备
    content: string;
    level: '高' | '中' | '低';
    status: '已处理' | '待处理' | '系统恢复';
    processor: string;
    actionTaken: string;
  }[];
}

// 项目完整阶段版本模型
export interface ProjectPhaseVersionData {
  versionId: string; // 'V1.0', 'V2.1', 'V3.0'
  versionCode: string; // 'v1', 'v2', 'v3'
  phaseTitle: string; // '大接缝合拢与密闭舱焊接'
  status: 'active' | 'archived' | 'planned';
  startDate: string;
  endDate: string;
  berthInfo: {
    code: number;
    name: string;
    categoryName: string;
    transferType: string;
    dockRule?: string;
  };
  craftGoal: string; // 阶段建造工艺核心目标
  safetySummary: string; // 安全管理重点
  personnel: PhasePersonnel[];
  devices: PhaseDevice[];
  fences: PhaseFence[];
  alarmPolicies: PhaseAlarmPolicy[];
}

// 预设全量多阶段工程数据字典 (针对 LNG、集装箱、VLCC原油、散货、PSV海工、三用工作船、风电运维、化学品船等全部支持历史归档全要素)
export const PROJECT_PHASE_DATABASE: Record<string, ProjectPhaseVersionData[]> = {
  'PRJ-2026-LNG01': [
    {
      versionId: 'V1.0',
      versionCode: 'v1',
      phaseTitle: '分段搭载与船台总组阶段',
      status: 'archived',
      startDate: '2026-03-01',
      endDate: '2026-06-15',
      berthInfo: {
        code: 1,
        name: '1号船台 (2万吨平船台)',
        categoryName: '平船台',
        transferType: '分段总组就位',
        dockRule: '分段就位期间严禁无关人员进入滑道下沿'
      },
      craftGoal: '完成艏艉各分段立体定位及底部基准总组搭载，构建主船体龙骨线。',
      safetySummary: '重点防范重型分段吊装碰撞、船台滑道高处跌落及多工种交叉作业冲突。',
      personnel: [
        {
          id: 'EMP-001',
          name: '王建国',
          role: '特种电焊工',
          department: '搭载一部 (合拢班)',
          isProjectMember: true,
          category: '特种作业',
          locatorId: 'TAG-LOC-1001',
          helmetColor: 'yellow',
          status: '已离场',
          entryTime: '08:00:10',
          exitTime: '17:30:00',
          stayDuration: '9小时30分',
          currentLocation: '1号船台龙骨总组位 (已归档)',
          accessAuthorized: true,
          phone: '138****6821',
          battery: 95,
          heartRate: 76,
          trajectory: [
            { time: '08:00:10', location: '1号船台南门禁闸机', zone: '门禁区', duration: '2分', status: 'entrance', x: 18, y: 80 },
            { time: '08:20:00', location: '1号船台分段预装平台', zone: '预装平台', duration: '1h 10m', status: 'normal', x: 28, y: 65 },
            { time: '10:00:00', location: '龙骨基准段P0对接位', zone: '龙骨搭载区', duration: '3h 30m', status: 'normal', x: 40, y: 50 },
            { time: '14:30:00', location: '底部分段自动焊工位', zone: '焊接作业面', duration: '2h 45m', status: 'normal', x: 45, y: 48 },
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'EMP-018',
          name: '孙立强',
          role: '外协脚手架搭设工',
          department: '宏达工程外协班组',
          isProjectMember: false,
          category: '外协施工',
          locatorId: 'TAG-LOC-1018',
          helmetColor: 'orange',
          status: '已离场',
          entryTime: '09:15:20',
          exitTime: '16:00:00',
          stayDuration: '6小时45分',
          currentLocation: '船台外侧脚手架区',
          accessAuthorized: true,
          phone: '135****4421',
          battery: 82,
          heartRate: 84,
          trajectory: [
            { time: '09:15:20', location: '1号船台外协临时通道', zone: '门禁通道', duration: '5分', status: 'entrance', x: 15, y: 85 },
            { time: '09:30:00', location: '1号船台右舷外板排栅', zone: '外板高空架', duration: '2h 15m', status: 'normal', x: 25, y: 70 },
            { time: '13:00:00', location: '舯部分段高空系挂点', zone: '高空防护区', duration: '3h 00m', status: 'normal', x: 38, y: 55 },
          ],
          alertsCount: 1,
          alerts: [
            {
              id: 'ALT-V1-01',
              time: '2026-04-12 11:20:10',
              level: '中',
              type: '高空防跌落预警',
              description: '在舯部外板脚手架作业时安全绳挂钩未紧锁传感器报警',
              status: '已处理'
            }
          ]
        },
        {
          id: 'VIS-901',
          name: '赵天成 (船东验船师)',
          role: 'DNV船级社驻厂监造',
          department: 'DNV船级社监造组',
          isProjectMember: false,
          category: '临时访客/外来人员',
          locatorId: 'TAG-VIS-0901',
          helmetColor: 'white',
          status: '已离场',
          entryTime: '10:00:00',
          exitTime: '11:45:00',
          stayDuration: '1小时45分',
          currentLocation: '船台质检验收区',
          accessAuthorized: true,
          phone: '136****9988',
          battery: 98,
          heartRate: 72,
          trajectory: [
            { time: '10:00:00', location: '船厂综合服务中心安检口', zone: '安检区', duration: '5分', status: 'entrance', x: 10, y: 90 },
            { time: '10:15:00', location: '1号船台观摩走廊', zone: '观摩区', duration: '20分', status: 'normal', x: 20, y: 75 },
            { time: '10:45:00', location: '分段焊缝探伤验收点', zone: '质检验收区', duration: '50分', status: 'normal', x: 35, y: 60 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-BS-01',
          name: '1#船台高精度定位主基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '高精度定位主基站 (防爆型)',
          code: 'BS-LOC-01',
          location: '1号船台东侧立柱 #P01',
          zone: '船台地面定位层',
          status: 'online',
          installedDate: '2026-03-01',
          signalStrength: '-62 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-BS-02',
          name: '1号船台分段预组区基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '分段微定位基站',
          code: 'BS-LOC-02',
          location: '1号船台西侧滑道控制房',
          zone: '预装平台定位网',
          status: 'online',
          installedDate: '2026-03-02',
          signalStrength: '-68 dBm (良好)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-ENV-01',
          name: '船台焊接烟尘综合监测仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '粉尘VOC与温湿度综合探头',
          code: 'ENV-DUST-01',
          location: '1号船台龙骨主焊接带',
          zone: '焊接作业区',
          status: 'online',
          installedDate: '2026-03-05',
          telemetry: {
            gasName: '焊接粉尘 / 颗粒物',
            gasValue: '35 ug/m³',
            standardLimit: '≤ 150 ug/m³',
            temperature: '22.5 ℃',
            humidity: '58% RH',
            statusText: '优良达标'
          },
          maintainer: '安环部-周主管'
        }
      ],
      fences: [
        {
          id: 'FNC-V1-01',
          code: 'EF-V1-001',
          name: '1号船台分段大合拢起吊警戒区',
          type: '吊装警戒区',
          dimension: '平面电子围栏',
          dangerLevel: '高',
          location: '1号船台P0基准滑道',
          ruleDesc: '吊装启动前触发声光报警，非起重特种操作人员严禁进入该警戒范围',
          boundDevices: ['DEV-BS-01', 'DEV-BS-02'],
          todayViolations: 0,
          events: [
            {
              id: 'EVT-V1-01',
              time: '2026-04-05 14:10:00',
              personName: '外协焊工-陈某',
              personId: 'EMP-088',
              isProjectMember: false,
              eventType: '非法擅入',
              level: '高',
              handler: '安全巡检员-李海波',
              status: '已处置',
              notes: '吊装前鸣笛警告，该人员横穿滑道，已现场制止并安全劝离。'
            }
          ]
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-V1-01',
          name: '起重吊装红线禁区擅入告警',
          type: '进入危险区域',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '未携带起重指挥特种卡人员进入吊装警戒围栏且持续 > 2秒',
          notifyMechanism: '现场声光报警 + 语音播报 + 发送专职安监员手机',
          status: '已启用',
          logs: [
            {
              id: 'LOG-V1-01',
              time: '2026-04-05 14:10:02',
              triggerSource: 'EMP-088 (陈某)',
              content: '未授权闯入1号船台分段大合拢起吊警戒区',
              level: '高',
              status: '已处理',
              processor: '安全巡检员-李海波',
              actionTaken: '现场劝离，并开展二级安全违章通报考核。'
            }
          ]
        }
      ]
    },
    {
      versionId: 'V2.1',
      versionCode: 'v2',
      phaseTitle: '大接缝合拢与密闭液货舱焊接',
      status: 'active', // 当前生效阶段
      startDate: '2026-06-16',
      endDate: '2026-10-30',
      berthInfo: {
        code: 1,
        name: '1号船台 (2万吨平船台)',
        categoryName: '平船台',
        transferType: '平船台总装合拢',
        dockRule: '进入1号船台需穿戴特种绝缘防爆装备，进入LNG货舱需携带4合1检测卡'
      },
      craftGoal: '完成薄膜型LNG货舱主绝热箱二次屏壁装配、货舱密闭性焊缝探伤及机舱总段管路贯通。',
      safetySummary: '极高风险等级！严格管控密闭舱受限空间有毒可燃气体浓度、动火作业防爆及高空立体交叉防坠落。',
      personnel: [
        {
          id: 'EMP-001',
          name: '王建国',
          role: '特种电焊工 (班组长)',
          department: '搭载一部 (LNG合拢班)',
          isProjectMember: true,
          category: '特种作业',
          locatorId: 'TAG-LOC-1001',
          helmetColor: 'yellow',
          status: '在场作业',
          entryTime: '08:00:12',
          stayDuration: '3小时45分',
          currentLocation: '1号货舱主绝热箱焊接区 (SEC-A102)',
          accessAuthorized: true,
          phone: '138****6821',
          battery: 92,
          heartRate: 78,
          trajectory: [
            { time: '08:00:12', location: '1号造船台人员安检门禁', zone: '门禁区', duration: '2分', status: 'entrance', x: 18, y: 78 },
            { time: '08:15:30', location: '1号船台工具备品间 (领取防爆氩弧焊机)', zone: '仓储区', duration: '15分', status: 'normal', x: 26, y: 65 },
            { time: '08:45:00', location: '1号LNG船 艏部分段A102 (主甲板登船梯)', zone: '合拢登船梯', duration: '45分', status: 'normal', x: 36, y: 52 },
            { time: '09:30:00', location: '1号液货舱主绝热箱焊接工位', zone: '密闭舱特种作业区', duration: '2h 15m', status: 'normal', x: 44, y: 46 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'EMP-002',
          name: '李海波',
          role: '专职安全总监工',
          department: '安环质检部',
          isProjectMember: true,
          category: '安全监护',
          locatorId: 'TAG-LOC-1002',
          helmetColor: 'red',
          status: '在场作业',
          entryTime: '07:45:00',
          stayDuration: '4小时00分',
          currentLocation: '1号造船台立体安监巡逻道 (生活区外围)',
          accessAuthorized: true,
          phone: '139****7723',
          battery: 88,
          heartRate: 82,
          trajectory: [
            { time: '07:45:00', location: '船厂总控安全门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 12, y: 82 },
            { time: '08:20:00', location: '1号造船台消防应急泵站', zone: '消防通道', duration: '35分', status: 'normal', x: 22, y: 60 },
            { time: '09:10:00', location: '1号LNG船 货舱密闭气体监测点', zone: '受限空间监测口', duration: '1h 10m', status: 'normal', x: 42, y: 44 },
            { time: '10:30:15', location: '生活区高空立体作业安全监护网', zone: '高空监护区', duration: '1h 15m', status: 'normal', x: 55, y: 36 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'EMP-005',
          name: '刘强',
          role: '绝热箱装配技师',
          department: '绝热绝缘工程处',
          isProjectMember: true,
          category: '特种作业',
          locatorId: 'TAG-LOC-1005',
          helmetColor: 'yellow',
          status: '在场作业',
          entryTime: '08:30:00',
          stayDuration: '3小时15分',
          currentLocation: '2号货舱双层底压载水舱 (SEC-C201)',
          accessAuthorized: true,
          phone: '136****5501',
          battery: 79,
          heartRate: 85,
          trajectory: [
            { time: '08:30:00', location: '1号船台登船通道', zone: '登船通道', duration: '5分', status: 'entrance', x: 20, y: 72 },
            { time: '08:50:00', location: '2号货舱人孔密闭门进入口', zone: '密闭人孔', duration: '10分', status: 'normal', x: 38, y: 50 },
            { time: '09:00:00', location: '2号货舱双层底绝热定位板施工位', zone: '受限空间作业区', duration: '2h 45m', status: 'normal', x: 48, y: 42 }
          ],
          alertsCount: 1,
          alerts: [
            {
              id: 'ALT-V2-01',
              time: '2026-08-28 10:15:30',
              level: '中',
              type: '密闭舱滞留超时',
              description: '在2号货舱双层底单次作业持续达 135 分钟，触及 120 分钟阶段防疲劳轮岗阈值',
              status: '已处理'
            }
          ]
        },
        {
          id: 'EMP-042',
          name: '张伟 (邻近工段)',
          role: '涂装除锈工',
          department: '涂装分厂 (2号船台分队)',
          isProjectMember: false, // 非本项目成员
          category: '邻近工段流动',
          locatorId: 'TAG-LOC-1042',
          helmetColor: 'yellow',
          status: '违规预警',
          entryTime: '10:10:00',
          stayDuration: '35分',
          currentLocation: '1号船台2号坞吊装立体防爆禁区边缘',
          accessAuthorized: false, // 未获得LNG高危特种区准入
          phone: '137****3382',
          battery: 65,
          heartRate: 92,
          trajectory: [
            { time: '10:10:00', location: '2号船台连接公共主干道', zone: '公共通道', duration: '10分', status: 'entrance', x: 60, y: 70 },
            { time: '10:25:00', location: '1号船台吊装作业临时隔离网', zone: '警戒边缘', duration: '15分', status: 'normal', x: 50, y: 58 },
            { time: '10:40:12', location: '1号船台 吊装立体禁区未授权闯入点', zone: '重型吊装禁区', duration: '10分', status: 'alert', x: 46, y: 48 }
          ],
          alertsCount: 1,
          alerts: [
            {
              id: 'ALT-V2-02',
              time: '2026-08-28 10:42:00',
              level: '高',
              type: '未授权闯入危险区',
              description: '非LNG工程持证人员私自越过1号龙门吊防爆作业警戒带',
              status: '已处理'
            }
          ]
        },
        {
          id: 'VIS-902',
          name: '林建德 (法国GTT技术专家)',
          role: 'GTT技术授权代表',
          department: 'GTT低温绝热工程专家组',
          isProjectMember: false,
          category: '临时访客/外来人员',
          locatorId: 'TAG-VIS-0902',
          helmetColor: 'white',
          status: '在场作业',
          entryTime: '09:00:00',
          stayDuration: '2小时45分',
          currentLocation: '1号货舱二次屏壁绝热样箱检测位',
          accessAuthorized: true,
          phone: '139****1122',
          battery: 94,
          heartRate: 74,
          trajectory: [
            { time: '09:00:00', location: 'LNG建造指挥部专家门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 10, y: 88 },
            { time: '09:20:00', location: '1号船台专家观摩通道', zone: '专用通道', duration: '20分', status: 'normal', x: 25, y: 68 },
            { time: '09:50:00', location: '1号货舱密闭登舱人孔梯', zone: '货舱登梯', duration: '15分', status: 'normal', x: 38, y: 52 },
            { time: '10:15:00', location: '二次屏壁绝热箱焊接现场', zone: '工艺验收工位', duration: '1h 30m', status: 'normal', x: 45, y: 46 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-BS-01',
          name: '1#船台高精度定位主基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '高精度定位主基站 (防爆认证 Ex d IIC T6)',
          code: 'BS-LOC-01',
          location: '1号船台东侧立柱 #P01',
          zone: '船台地面三维定位层',
          status: 'online',
          installedDate: '2026-03-01',
          signalStrength: '-60 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-BS-03',
          name: 'LNG 1号货舱密闭空间微基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '密闭舱室内微功率定位基站 (Ex ia IIC)',
          code: 'BS-LOC-LNG01',
          location: '1号货舱人孔顶盖内侧 (SEC-A102)',
          zone: '1号液货绝热舱内',
          status: 'online',
          installedDate: '2026-06-18',
          signalStrength: '-65 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-BS-04',
          name: 'LNG 2号货舱双层底定位微基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '低频激励与三维定位基站一体机',
          code: 'BS-LOC-LNG02',
          location: '2号货舱双层底压载水舱 (SEC-C201)',
          zone: '2号货舱底层',
          status: 'online',
          installedDate: '2026-06-20',
          signalStrength: '-70 dBm (良好)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-ENV-02',
          name: '1号货舱4合1防爆多气体在线分析仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '4合1防爆气体在线监测仪 (CO/H2S/O2/EX)',
          code: 'ENV-GAS-4IN1-01',
          location: '1号液货舱绝热作业面 (底部汇流排)',
          zone: '受限空间核心区',
          status: 'online',
          installedDate: '2026-06-16',
          telemetry: {
            gasName: '可燃气EX 0% | 氧气O2 20.9% | CO 2ppm | H2S 0ppm',
            gasValue: '氧气 20.9% (正常安全)',
            standardLimit: 'O2: 19.5%~23.5% | EX < 1% LEL',
            temperature: '23.8 ℃',
            humidity: '52% RH',
            statusText: '气体环境安全绿标'
          },
          maintainer: '安环部-周主管'
        },
        {
          id: 'DEV-ENV-03',
          name: '2号货舱双层底甲烷与防爆可燃气检测仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '红外防爆可燃气体探测探头',
          code: 'ENV-GAS-CH4-02',
          location: '2号货舱下层人孔拐角',
          zone: '双层底受限空间',
          status: 'online',
          installedDate: '2026-06-18',
          telemetry: {
            gasName: '可燃气体 (EX)',
            gasValue: '0.0 %LEL',
            standardLimit: '< 5 %LEL',
            temperature: '24.1 ℃',
            humidity: '55% RH',
            statusText: '正常无泄漏'
          },
          maintainer: '安环部-周主管'
        },
        {
          id: 'DEV-ALM-01',
          name: '1号船台防爆高分贝声光联动报警器',
          category: 'alarm',
          categoryLabel: '联动预警终端',
          type: '防爆声光联动报警器 (120dB + 爆闪红光)',
          code: 'ALM-AUDIO-01',
          location: '1号船台龙门吊立柱及登船口',
          zone: '应急告警联动网络',
          status: 'online',
          installedDate: '2026-06-16',
          signalStrength: '-58 dBm (极强)',
          maintainer: '动力安保处-钱工'
        }
      ],
      fences: [
        {
          id: 'FNC-V2-01',
          code: 'EF-LNG-001',
          name: '1号LNG船 密闭液货舱受限空间立体防爆网',
          type: '密闭舱受限空间',
          dimension: '三维立体空间网格',
          dangerLevel: '高',
          location: '1号液货绝热舱 (SEC-A102 / 295m~220m)',
          ruleDesc: '实行「一人一卡一审批」：未经气体检测合格严禁进入；单次连续作业严禁超 120 分钟；舱外需设专职安全监护人。',
          boundDevices: ['DEV-BS-03', 'DEV-ENV-02', 'DEV-ALM-01'],
          todayViolations: 1,
          events: [
            {
              id: 'EVT-V2-01',
              time: '2026-08-28 08:12:00',
              personName: '张伟 (焊工)',
              personId: 'EMP-015',
              isProjectMember: true,
              eventType: '气体越限作业',
              level: '高',
              handler: '安全工程师-林峰',
              status: '已处置',
              notes: '货舱底部CO局部累积达 18 ppm，系统触发防爆排风机强排，人员已安全疏散，30分钟后复测合格重返。'
            }
          ]
        },
        {
          id: 'FNC-V2-02',
          code: 'EF-LNG-002',
          name: '1号造船台 龙门吊大件立体吊装防碰警戒区',
          type: '吊装警戒区',
          dimension: '三维立体空间网格',
          dangerLevel: '高',
          location: '1号船台全回转大吊作业面',
          ruleDesc: '吊钩下方15米立体半径内禁止一切非起重指挥人员停留；吊装期间联动声光预警。',
          boundDevices: ['DEV-BS-01', 'DEV-ALM-01'],
          todayViolations: 1,
          events: [
            {
              id: 'EVT-V2-02',
              time: '2026-08-28 10:42:15',
              personName: '刘强 (涂装工)',
              personId: 'EMP-042',
              isProjectMember: false,
              eventType: '非法擅入',
              level: '高',
              handler: '起重指挥员-张明',
              status: '已处置',
              notes: '邻近工段人员穿越吊装警戒隔离线，已远程声光报警并由现场督导带离现场。'
            }
          ]
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-V2-01',
          name: 'LNG货舱受限空间气体浓度异常多级联动告警',
          type: '气体告警',
          version: 'V2',
          level: '高',
          isGlobal: false,
          conditionText: '可燃气 EX ≥ 5% LEL 或 氧气 O2 < 19.5% 或 CO ≥ 20 ppm 持续 3 秒',
          notifyMechanism: '0秒触发舱内防爆声光 + 10秒推送安监值班大屏 + 30秒短信通知生产副总',
          status: '已启用',
          logs: [
            {
              id: 'LOG-V2-01',
              time: '2026-08-28 08:12:00',
              triggerSource: 'DEV-ENV-02 (4合1气体仪)',
              content: '1号船台LNG密闭液货舱CO瞬时浓度达 18 ppm，接近一级警戒阈值',
              level: '高',
              status: '已处理',
              processor: '安全工程师-林峰',
              actionTaken: '自动联锁开启应急通风风机，全舱人员有序撤出，排风置换后恢复作业。'
            }
          ]
        },
        {
          id: 'POL-V2-02',
          name: '密闭舱室作业人员防疲劳超时告警',
          type: '受限空间滞留',
          version: 'V1',
          level: '中',
          isGlobal: false,
          conditionText: '人员在密闭受限空间内连续滞留时间 ≥ 120 分钟',
          notifyMechanism: '手环震动蜂鸣提醒人员轮岗 + 监护人App弹窗提示',
          status: '已启用',
          logs: [
            {
              id: 'LOG-V2-02',
              time: '2026-08-28 10:15:30',
              triggerSource: 'EMP-005 (刘强)',
              content: '在2号货舱双层底压载水舱作业达 125 分钟触发超时预警',
              level: '中',
              status: '已处理',
              processor: '现场监护员-周斌',
              actionTaken: '监护员通过对讲机呼叫，安排接替班组换岗，人员顺利出舱休息。'
            }
          ]
        },
        {
          id: 'POL-V2-03',
          name: '重型吊装立体红线区域未授权闯入告警',
          type: '进入危险区域',
          version: 'V2',
          level: '高',
          isGlobal: true,
          conditionText: '非起重特种操作人员进入龙门吊立体警戒围栏且持续 > 2秒',
          notifyMechanism: '大分贝警笛鸣响 + 吊车司机室控制屏高亮闪烁',
          status: '已启用',
          logs: [
            {
              id: 'LOG-V2-03',
              time: '2026-08-28 10:42:00',
              triggerSource: 'EMP-042 (张伟)',
              content: '闯入1号船台2号坞吊装防爆立体警戒区',
              level: '高',
              status: '已处理',
              processor: '起重指挥员-张明',
              actionTaken: '现场即刻暂停起吊作业，巡检员将人员护送离开，并进行安全复训。'
            }
          ]
        }
      ]
    },
    {
      versionId: 'V3.0',
      versionCode: 'v3',
      phaseTitle: '下水舾装与系泊电气系统调试',
      status: 'planned',
      startDate: '2026-11-01',
      endDate: '2027-02-28',
      berthInfo: {
        code: 3,
        name: '3号码头 (东区水下舾装码头)',
        categoryName: '移动码头',
        transferType: '出坞下水系泊调试',
        dockRule: '船舶靠泊3号码头需配置防落水浮动定位信标与岸电防漏电监控'
      },
      craftGoal: '完成LNG货物围护系统冷却试验、低速双燃料主机系泊试车及电气自动化全船联锁测试。',
      safetySummary: '重点防范临水作业人员落水、高压岸电通电调试触电及低温管路冷试氮气窒息。',
      personnel: [
        {
          id: 'EMP-007',
          name: '陈远',
          role: '电气调试总工程师',
          department: '调试技术中心',
          isProjectMember: true,
          category: '项目组核心',
          locatorId: 'TAG-LOC-1007',
          helmetColor: 'blue',
          status: '在场作业',
          entryTime: '08:30:00',
          stayDuration: '规划编制中',
          currentLocation: '3号码头电气调试预备室',
          accessAuthorized: true,
          phone: '138****9901',
          battery: 100,
          heartRate: 75,
          trajectory: [
            { time: '08:30:00', location: '3号码头登船门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 20, y: 75 },
            { time: '09:00:00', location: '配电中心集控台', zone: '电气控制室', duration: '2h 00m', status: 'normal', x: 60, y: 45 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-BS-05',
          name: '3号码头舾装水域防爆主基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '沿岸水域远距离定位基站 (覆盖500m)',
          code: 'BS-LOC-DOCK3',
          location: '3号码头东侧系缆桩 #D02',
          zone: '系泊码头水陆定位层',
          status: 'online',
          installedDate: '2026-10-25',
          signalStrength: '-64 dBm (极佳)',
          maintainer: '智能化运行中心'
        },
        {
          id: 'DEV-ENV-04',
          name: '低温货管氮气置换纯度监测仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '低温管路在线氧含量与露点分析仪',
          code: 'ENV-GAS-O2-N2',
          location: '3号码头管系加注法兰处',
          zone: '低温试验区',
          status: 'online',
          installedDate: '2026-10-28',
          telemetry: {
            gasName: '氮气纯度 / 露点',
            gasValue: '露点 -55 ℃ (超干)',
            standardLimit: '露点 < -45 ℃',
            temperature: '18.2 ℃',
            humidity: '40% RH',
            statusText: '管道氮气干燥就绪'
          },
          maintainer: '调试工程处'
        }
      ],
      fences: [
        {
          id: 'FNC-V3-01',
          code: 'EF-V3-001',
          name: '3号码头 临水舷边防落水隔离警戒带',
          type: '防落水隔离',
          dimension: '平面电子围栏',
          dangerLevel: '高',
          location: '3号码头前沿5米系泊作业带',
          ruleDesc: '靠近码头边缘必须正确穿戴防落水救生定位腰带；严禁单人夜间临水作业。',
          boundDevices: ['DEV-BS-05'],
          todayViolations: 0,
          events: []
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-V3-01',
          name: '临水作业人员落水姿态与水浸即时报警',
          type: '超出活动范围',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '定位手环触发水浸电极导通或发生高度骤降坠入水体范围',
          notifyMechanism: '码头声光警笛大作 + 救援快艇自动呼叫 + 广播全频通报',
          status: '已启用',
          logs: []
        }
      ]
    }
  ],

  // 24,000 TEU 超大型集装箱船 (支持 PRJ-2026-BOX12 与 PRJ-2026-CTN02)
  'PRJ-2026-CTN02': [
    {
      versionId: 'V1.0',
      versionCode: 'v1',
      phaseTitle: '总段吊装搭载与船坞大合拢',
      status: 'archived',
      startDate: '2026-01-10',
      endDate: '2026-05-30',
      berthInfo: {
        code: 2,
        name: '2号造船坞 (大型干船坞)',
        categoryName: '大型干船坞',
        transferType: '船坞分段大合拢',
        dockRule: '双龙门吊联合抬吊作业期间船坞底坑人员必须清场至安全防空洞'
      },
      craftGoal: '完成24排集装箱双岛式结构、机舱大分段总装及首部球鼻艏对接合拢。',
      safetySummary: '重点防范千吨级龙门吊联动抬吊碰撞、坞底受限空间积水漏电及高处坠落。',
      personnel: [
        {
          id: 'EMP-003',
          name: '张明',
          role: '重型起重指挥总长',
          department: '搭载二部 (起重合拢工段)',
          isProjectMember: true,
          category: '特种作业',
          locatorId: 'TAG-LOC-1003',
          helmetColor: 'blue',
          status: '已离场',
          entryTime: '08:00:00',
          exitTime: '17:45:00',
          stayDuration: '9小时45分',
          currentLocation: '2号坞指挥塔 (已归档)',
          accessAuthorized: true,
          phone: '137****1109',
          battery: 90,
          heartRate: 75,
          trajectory: [
            { time: '08:00:00', location: '2号船坞主门禁闸机', zone: '门禁区', duration: '5分', status: 'entrance', x: 15, y: 82 },
            { time: '08:30:00', location: '2号船坞东侧龙门吊司机室登梯口', zone: '吊车通道', duration: '20分', status: 'normal', x: 30, y: 68 },
            { time: '09:00:00', location: '2号坞800吨龙门吊主梁指挥台', zone: '高空起重指挥区', duration: '4h 30m', status: 'normal', x: 52, y: 44 },
            { time: '14:00:00', location: '船坞底坑分段接缝合拢复核点', zone: '坞底大接缝', duration: '3h 15m', status: 'normal', x: 48, y: 55 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'EMP-029',
          name: '徐振华',
          role: '双龙门吊主操作手',
          department: '起重运输分厂',
          isProjectMember: true,
          category: '特种作业',
          locatorId: 'TAG-LOC-1029',
          helmetColor: 'yellow',
          status: '已离场',
          entryTime: '08:15:00',
          exitTime: '17:30:00',
          stayDuration: '9小时15分',
          currentLocation: '800吨1号龙门吊驾驶室',
          accessAuthorized: true,
          phone: '139****3341',
          battery: 88,
          heartRate: 76,
          trajectory: [
            { time: '08:15:00', location: '2号船坞西门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 18, y: 80 },
            { time: '08:40:00', location: '龙门吊垂直电梯轿厢', zone: '起重立柱', duration: '15分', status: 'normal', x: 32, y: 64 },
            { time: '09:00:00', location: '800吨龙门吊1号操作室', zone: '起重司机室', duration: '7h 30m', status: 'normal', x: 50, y: 40 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'VIS-911',
          name: '马丁·舒尔茨 (地中海航运MSC监造代表)',
          role: '船东首席监造专家',
          department: 'MSC集装箱建造监造组',
          isProjectMember: false,
          category: '临时访客/外来人员',
          locatorId: 'TAG-VIS-0911',
          helmetColor: 'white',
          status: '已离场',
          entryTime: '09:30:00',
          exitTime: '12:00:00',
          stayDuration: '2小时30分',
          currentLocation: '2号船坞VIP观摩平台',
          accessAuthorized: true,
          phone: '138****7711',
          battery: 96,
          heartRate: 74,
          trajectory: [
            { time: '09:30:00', location: '船坞综合指挥中心安检处', zone: '安检区', duration: '10分', status: 'entrance', x: 12, y: 88 },
            { time: '10:00:00', location: '2号船坞总装观礼平台', zone: '观礼台', duration: '1h 00m', status: 'normal', x: 28, y: 70 },
            { time: '11:10:00', location: '集装箱导轨段冷试样板间', zone: '样板检测区', duration: '45分', status: 'normal', x: 42, y: 58 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-BS-DOCK02',
          name: '2号船坞高精度定位基站网 #A',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '全天候干船坞立体定位基站',
          code: 'BS-BOX-DOCK02',
          location: '2号船坞坞墙东侧中段立柱',
          zone: '干船坞三维定位网',
          status: 'online',
          installedDate: '2026-01-10',
          signalStrength: '-60 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-ENV-DOCK02',
          name: '2号坞底多参数环境气体监测站',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '4合1防爆气体与温湿度在线监测探头',
          code: 'ENV-BOX-02',
          location: '2号坞底坑排水集水井旁',
          zone: '坞底受限区',
          status: 'online',
          installedDate: '2026-01-12',
          telemetry: {
            gasName: '可燃气 / 硫化氢 / 氧气',
            gasValue: '氧气 20.8% (达标安全)',
            standardLimit: 'O2 ≥ 19.5%',
            temperature: '21.5 ℃',
            humidity: '62% RH',
            statusText: '气体安全'
          },
          maintainer: '安环部-周主管'
        },
        {
          id: 'DEV-ALM-DOCK02',
          name: '船坞双龙门吊防碰联锁声光报警器',
          category: 'alarm',
          categoryLabel: '联动预警终端',
          type: '激光防撞与声光报警一体化终端',
          code: 'ALM-CRANE-02',
          location: '800吨双龙门吊大梁安全防护端',
          zone: '重型起重防碰系统',
          status: 'online',
          installedDate: '2026-01-10',
          signalStrength: '-56 dBm (极强)',
          maintainer: '动力设备处-刘工'
        }
      ],
      fences: [
        {
          id: 'FNC-BOX-V1-01',
          code: 'EF-BOX-001',
          name: '2号船坞双吊联动大件合拢警戒区',
          type: '吊装警戒区',
          dimension: '三维立体空间网格',
          dangerLevel: '高',
          location: '2号船坞合拢中段区域',
          ruleDesc: '双吊抬运总段期间，投影下方及周边20米立体空间清场，违规进入立即声光告警。',
          boundDevices: ['DEV-BS-DOCK02', 'DEV-ALM-DOCK02'],
          todayViolations: 0,
          events: [
            {
              id: 'EVT-BOX-V1-01',
              time: '2026-03-20 15:30:00',
              personName: '外协脚手架工-刘某',
              personId: 'EMP-077',
              isProjectMember: false,
              eventType: '非法擅入',
              level: '高',
              handler: '安全巡检员-张明',
              status: '已处置',
              notes: '吊装抬吊期间擅自进入坞底合拢区捡拾工具，已现场制止并做安全扣分。'
            }
          ]
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-BOX-V1-01',
          name: '大件抬吊红线禁区擅入即时告警',
          type: '进入危险区域',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '非起重指挥持卡人员进入合拢立体警戒网且持续 > 2秒',
          notifyMechanism: '司机室高亮红光闪烁 + 现场高分贝鸣笛',
          status: '已启用',
          logs: [
            {
              id: 'LOG-BOX-V1-01',
              time: '2026-03-20 15:30:05',
              triggerSource: 'EMP-077 (刘某)',
              content: '未授权闯入2号船坞双吊联动大件合拢警戒区',
              level: '高',
              status: '已处理',
              processor: '安全巡检员-张明',
              actionTaken: '紧急叫停起吊微调，现场人员撤离后复工。'
            }
          ]
        }
      ]
    },
    {
      versionId: 'V2.0',
      versionCode: 'v2',
      phaseTitle: '下水系泊电气调试与脱硫塔联调',
      status: 'active',
      startDate: '2026-06-01',
      endDate: '2027-02-15',
      berthInfo: {
        code: 1,
        name: '1号码头 (东区舾装码头)',
        categoryName: '舾装码头',
        transferType: '下水系泊调试',
        dockRule: '登船作业必须双向刷卡，高空集装箱导轨作业必须佩戴双钩防坠器'
      },
      craftGoal: '脱硫系统、双燃料主机低速试车、集装箱导轨冷态精度测量及全船冷箱插座联调。',
      safetySummary: '重点防范高空防坠落、脱硫塔碱液泄漏、有毒化学品监控及岸电高压触电。',
      personnel: [
        {
          id: 'EMP-003',
          name: '张明',
          role: '起重总指挥',
          department: '搭载二部 (起重工段)',
          isProjectMember: true,
          category: '项目组核心',
          locatorId: 'TAG-LOC-1003',
          helmetColor: 'blue',
          status: '在场作业',
          entryTime: '08:30:00',
          stayDuration: '3小时10分',
          currentLocation: '1号码头 24000箱位导轨测试平台',
          accessAuthorized: true,
          phone: '137****1109',
          battery: 95,
          heartRate: 75,
          trajectory: [
            { time: '08:30:00', location: '1号码头入口闸机', zone: '门禁区', duration: '5分', status: 'entrance', x: 20, y: 75 },
            { time: '09:00:00', location: '集装箱导轨架 12号贝位', zone: '导轨高空区', duration: '2h 30m', status: 'normal', x: 60, y: 40 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'VIS-903',
          name: '外来技术员-吴工 (瓦锡兰)',
          role: '脱硫塔外协技术支持',
          department: '瓦锡兰环境技术部',
          isProjectMember: false,
          category: '外协施工',
          locatorId: 'TAG-VIS-0903',
          helmetColor: 'orange',
          status: '在场作业',
          entryTime: '09:00:00',
          stayDuration: '2小时40分',
          currentLocation: '烟囱脱硫塔安装层',
          accessAuthorized: true,
          phone: '139****8822',
          battery: 88,
          heartRate: 80,
          trajectory: [
            { time: '09:00:00', location: '1号码头外协报备点', zone: '门禁区', duration: '10分', status: 'entrance', x: 20, y: 75 },
            { time: '09:30:00', location: '主机烟道脱硫塔喷淋层', zone: '脱硫系统区', duration: '2h 00m', status: 'normal', x: 75, y: 35 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-BS-BOX01',
          name: '1号码头集装箱船专用基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '高精度长距定位基站',
          code: 'BS-BOX-01',
          location: '1号码头主岸吊顶部',
          zone: '码头空域定位网',
          status: 'online',
          installedDate: '2026-06-01',
          signalStrength: '-62 dBm (极佳)',
          maintainer: '集装箱建造工区'
        },
        {
          id: 'DEV-ENV-BOX01',
          name: '脱硫塔SO2与碱液挥发环境监测仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '二氧化硫与酸碱雾气检测探头',
          code: 'ENV-SO2-01',
          location: '烟囱脱硫塔排气口',
          zone: '环保监测点',
          status: 'online',
          installedDate: '2026-06-02',
          telemetry: {
            gasName: 'SO2 / 碱雾浓度',
            gasValue: '0.2 ppm (微量合格)',
            standardLimit: 'SO2 < 2 ppm',
            temperature: '26.0 ℃',
            humidity: '60% RH',
            statusText: '达标'
          },
          maintainer: '安环部-周主管'
        }
      ],
      fences: [
        {
          id: 'FNC-BOX-01',
          code: 'EF-BOX-001',
          name: '集装箱导轨高空防坠立体警戒区',
          type: '高空悬吊防护',
          dimension: '三维立体空间网格',
          dangerLevel: '高',
          location: '甲板上部12~24贝位',
          ruleDesc: '高度超过 2 米必须双钩系挂五点式安全带',
          boundDevices: ['DEV-BS-BOX01'],
          todayViolations: 0,
          events: []
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-BOX-01',
          name: '高空防坠安全钩脱挂即时告警',
          type: '超出活动范围',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '离地高度 > 2m 且双钩未系挂传感器断开持续 > 5秒',
          notifyMechanism: '手环震动 + 现场高音喇叭提醒',
          status: '已启用',
          logs: []
        }
      ]
    }
  ],

  // 30万吨级 VLCC 超大型原油船 (PRJ-2026-VLCC03)
  'PRJ-2026-VLCC03': [
    {
      versionId: 'V1.0',
      versionCode: 'v1',
      phaseTitle: '双层底货油舱总段装配阶段',
      status: 'archived',
      startDate: '2026-02-01',
      endDate: '2026-06-20',
      berthInfo: {
        code: 2,
        name: '2号造船坞 (大型干船坞)',
        categoryName: '大型干船坞',
        transferType: '坞内双层底总装',
        dockRule: '进入原油货油舱双层底必须进行强制持续机械强制通风'
      },
      craftGoal: '完成30万吨VLCC全部15个大型货油舱双层底纵骨连续焊接及气密性打压试验。',
      safetySummary: '受限空间缺氧、双层底狭小空间人员疲劳及动火特种作业安全管控。',
      personnel: [
        {
          id: 'EMP-061',
          name: '周华强',
          role: '双层底装配技师',
          department: '船体装配一部',
          isProjectMember: true,
          category: '特种作业',
          locatorId: 'TAG-LOC-2061',
          helmetColor: 'yellow',
          status: '已离场',
          entryTime: '08:10:00',
          exitTime: '17:20:00',
          stayDuration: '9小时10分',
          currentLocation: '3号货油舱双层底骨架位 (已归档)',
          accessAuthorized: true,
          phone: '138****2299',
          battery: 92,
          heartRate: 77,
          trajectory: [
            { time: '08:10:00', location: '2号船坞安检门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 16, y: 80 },
            { time: '08:30:00', location: '3号货舱人孔口', zone: '受限空间入口', duration: '15分', status: 'normal', x: 35, y: 62 },
            { time: '09:00:00', location: '3号油舱双层底纵骨焊接段', zone: '双层底核心舱', duration: '3h 30m', status: 'normal', x: 50, y: 48 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: 'EMP-062',
          name: '郑国强',
          role: '受限空间专职监护员',
          department: '安全监督保障部',
          isProjectMember: true,
          category: '安全监护',
          locatorId: 'TAG-LOC-2062',
          helmetColor: 'red',
          status: '已离场',
          entryTime: '08:00:00',
          exitTime: '17:30:00',
          stayDuration: '9小时30分',
          currentLocation: '3号货舱人孔监护站',
          accessAuthorized: true,
          phone: '139****5512',
          battery: 95,
          heartRate: 78,
          trajectory: [
            { time: '08:00:00', location: '2号船坞主门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 16, y: 80 },
            { time: '08:20:00', location: '受限空间通风机站', zone: '通风设备区', duration: '20分', status: 'normal', x: 30, y: 65 },
            { time: '08:45:00', location: '3号货舱外监护台', zone: '监护责任区', duration: '8h 00m', status: 'normal', x: 45, y: 52 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-VLCC-BS01',
          name: 'VLCC双层底防爆微基站 #1',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '密闭金属双层底低频激励微基站',
          code: 'BS-VLCC-01',
          location: '3号货舱双层底人孔壁面',
          zone: '双层底定位网',
          status: 'online',
          installedDate: '2026-02-01',
          signalStrength: '-64 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: 'DEV-VLCC-ENV01',
          name: '双层底多点氧气可燃气巡检仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '防爆型多点气体实时变送器',
          code: 'ENV-VLCC-GAS01',
          location: '3号货油舱底排气口',
          zone: '密闭舱气体监测区',
          status: 'online',
          installedDate: '2026-02-02',
          telemetry: {
            gasName: '可燃气 / 氧气 / CO',
            gasValue: '氧气 20.9% | EX 0.0%',
            standardLimit: 'O2: 19.5%~23.5%',
            temperature: '22.0 ℃',
            humidity: '55% RH',
            statusText: '气体达标安全'
          },
          maintainer: '安环部-周主管'
        }
      ],
      fences: [
        {
          id: 'FNC-VLCC-01',
          code: 'EF-VLCC-001',
          name: '货油舱双层底受限空间立体防护网',
          type: '密闭舱受限空间',
          dimension: '三维立体空间网格',
          dangerLevel: '高',
          location: '3号货油舱双层底区域',
          ruleDesc: '进入人员必须持有受限空间动火作业票，连续作业超2小时必须换岗休息',
          boundDevices: ['DEV-VLCC-BS01', 'DEV-VLCC-ENV01'],
          todayViolations: 0,
          events: []
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-VLCC-01',
          name: '双层底缺氧与可燃气浓积联动告警',
          type: '气体告警',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: 'O2 < 19.5% 或 EX ≥ 5% LEL 触发声光报警并联锁切断动火气源',
          notifyMechanism: '舱内外声光报警 + 生产指挥中心弹窗',
          status: '已启用',
          logs: []
        }
      ]
    },
    {
      versionId: 'V2.0',
      versionCode: 'v2',
      phaseTitle: '主甲板管系敷设与惰气系统调试',
      status: 'active',
      startDate: '2026-06-21',
      endDate: '2027-01-15',
      berthInfo: {
        code: 2,
        name: '2号码头 (大型油船舾装泊位)',
        categoryName: '舾装码头',
        transferType: '码头管系总装与调试',
        dockRule: '主甲板实施全面防火防静电管制，禁止携带非防爆电子产品'
      },
      craftGoal: '完成全船洗舱管系、货油透气管系、惰气发生系统及装卸油总集管贯通水压试验。',
      safetySummary: '惰性气体调试防窒息、高压管系试压爆裂防伤人及防静电接地监控。',
      personnel: [
        {
          id: 'EMP-063',
          name: '黄建军',
          role: '管系试压高级工程师',
          department: '舾装二部 (管装工段)',
          isProjectMember: true,
          category: '项目组核心',
          locatorId: 'TAG-LOC-2063',
          helmetColor: 'blue',
          status: '在场作业',
          entryTime: '08:20:00',
          stayDuration: '3小时30分',
          currentLocation: '主甲板 货油集管阀门总站',
          accessAuthorized: true,
          phone: '138****9988',
          battery: 94,
          heartRate: 76,
          trajectory: [
            { time: '08:20:00', location: '2号码头登船门禁', zone: '门禁区', duration: '5分', status: 'entrance', x: 20, y: 78 },
            { time: '08:50:00', location: '主甲板惰气发生机房', zone: '机房区', duration: '1h 10m', status: 'normal', x: 45, y: 55 },
            { time: '10:10:00', location: '货油主集管法兰测试台', zone: '管系试压区', duration: '1h 40m', status: 'normal', x: 65, y: 42 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: 'DEV-VLCC-BS02',
          name: '2号码头油船舾装防爆主基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '长距离防爆无线定位基站',
          code: 'BS-VLCC-02',
          location: '2号码头防浪堤立柱',
          zone: '码头甲板立体覆盖网',
          status: 'online',
          installedDate: '2026-06-21',
          signalStrength: '-61 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        }
      ],
      fences: [
        {
          id: 'FNC-VLCC-02',
          code: 'EF-VLCC-002',
          name: '主甲板高压管系试压警戒区',
          type: '动火作业区',
          dimension: '平面电子围栏',
          dangerLevel: '高',
          location: '主甲板中后段管系带',
          ruleDesc: '管系打压期间无关人员禁止在打压法兰10米范围内走动',
          boundDevices: ['DEV-VLCC-BS02'],
          todayViolations: 0,
          events: []
        }
      ],
      alarmPolicies: [
        {
          id: 'POL-VLCC-02',
          name: '高压试压警戒区越界声光预警',
          type: '进入危险区域',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '人员闯入试压警戒区持续 > 3秒',
          notifyMechanism: '现场声光报警 + 试压泵站自动泄压停机',
          status: '已启用',
          logs: []
        }
      ]
    }
  ]
};

// 辅助根据项目 ID 智能生成全套历史与当前阶段全要素数据（确保任何历史归档版本均包含完整人员、设备、围栏与告警）
export function getProjectPhases(projectId: string): ProjectPhaseVersionData[] {
  // 如果数据库中已有精确匹配
  if (PROJECT_PHASE_DATABASE[projectId]) {
    return PROJECT_PHASE_DATABASE[projectId];
  }

  // 针对项目编码别名映射（例如 PRJ-2026-BOX12 与 PRJ-2026-CTN02）
  if (projectId.includes('BOX') || projectId.includes('CTN') || projectId.includes('集装箱')) {
    return PROJECT_PHASE_DATABASE['PRJ-2026-CTN02'];
  }
  if (projectId.includes('VLCC') || projectId.includes('TANK') || projectId.includes('原油') || projectId.includes('油轮')) {
    return PROJECT_PHASE_DATABASE['PRJ-2026-VLCC03'];
  }
  if (projectId.includes('LNG') || projectId.includes('天然气') || projectId.includes('清洁能源')) {
    return PROJECT_PHASE_DATABASE['PRJ-2026-LNG01'];
  }

  // 针对散货船、海工船、工作船等提供专业、非空的阶段工程数据模板
  const projTag = projectId.split('-')[2] || 'GEN';

  return [
    {
      versionId: 'V1.0',
      versionCode: 'v1',
      phaseTitle: '分段搭载与船台总组阶段 (已归档)',
      status: 'archived',
      startDate: '2026-01-01',
      endDate: '2026-05-15',
      berthInfo: {
        code: 1,
        name: '标准造船台 (2号平船台)',
        categoryName: '平船台',
        transferType: '分段搭载总组',
        dockRule: '分段就位期间严禁无关人员进入滑道下沿'
      },
      craftGoal: '完成艏艉各分段立体定位及底部基准总组搭载，构建主船体龙骨线。',
      safetySummary: '重点防范重型分段吊装碰撞、船台滑道高处跌落及多工种交叉作业冲突。',
      personnel: [
        {
          id: `EMP-${projTag}-01`,
          name: '赵强 (焊工组长)',
          role: '特种电焊技师',
          department: '建造一部 (合拢班)',
          isProjectMember: true,
          category: '特种作业',
          locatorId: `TAG-LOC-${projTag}01`,
          helmetColor: 'yellow',
          status: '已离场',
          entryTime: '08:00:00',
          exitTime: '17:30:00',
          stayDuration: '9小时30分',
          currentLocation: '船台龙骨合拢工位 (历史已归档)',
          accessAuthorized: true,
          phone: '138****1001',
          battery: 90,
          heartRate: 76,
          trajectory: [
            { time: '08:00:00', location: '船台主门禁闸机', zone: '门禁区', duration: '5分', status: 'entrance', x: 18, y: 80 },
            { time: '08:30:00', location: '分段预装平台', zone: '预装平台', duration: '1h 30m', status: 'normal', x: 32, y: 64 },
            { time: '10:30:00', location: '龙骨基准段合拢位', zone: '合拢作业面', duration: '3h 30m', status: 'normal', x: 50, y: 50 },
            { time: '14:30:00', location: '主接缝焊缝复查点', zone: '质检区', duration: '2h 30m', status: 'normal', x: 45, y: 48 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: `EMP-${projTag}-02`,
          name: '孙海林',
          role: '安全巡检监护员',
          department: '安环质检部',
          isProjectMember: true,
          category: '安全监护',
          locatorId: `TAG-LOC-${projTag}02`,
          helmetColor: 'red',
          status: '已离场',
          entryTime: '07:50:00',
          exitTime: '17:40:00',
          stayDuration: '9小时50分',
          currentLocation: '船台安全监护站',
          accessAuthorized: true,
          phone: '139****2002',
          battery: 95,
          heartRate: 78,
          trajectory: [
            { time: '07:50:00', location: '总控安检门禁', zone: '门禁区', duration: '10分', status: 'entrance', x: 15, y: 82 },
            { time: '08:20:00', location: '船台巡逻通道', zone: '巡检通道', duration: '4h 00m', status: 'normal', x: 28, y: 60 },
            { time: '13:00:00', location: '高空防坠安全网监护点', zone: '高空防护区', duration: '4h 00m', status: 'normal', x: 48, y: 45 }
          ],
          alertsCount: 1,
          alerts: [
            {
              id: `ALT-${projTag}-V1-01`,
              time: '2026-03-15 10:20:00',
              level: '中',
              type: '未佩戴安全绳预警',
              description: '外协作业人员在高空脚手架横向移动未双钩系挂',
              status: '已处理'
            }
          ]
        },
        {
          id: `VIS-${projTag}-01`,
          name: '周维明 (船级社验船师)',
          role: 'CCS船级社驻厂监造',
          department: 'CCS检验组',
          isProjectMember: false,
          category: '临时访客/外来人员',
          locatorId: `TAG-VIS-${projTag}01`,
          helmetColor: 'white',
          status: '已离场',
          entryTime: '09:00:00',
          exitTime: '11:30:00',
          stayDuration: '2小时30分',
          currentLocation: '分段探伤验收区',
          accessAuthorized: true,
          phone: '136****3003',
          battery: 98,
          heartRate: 74,
          trajectory: [
            { time: '09:00:00', location: '专家服务中心通道', zone: '门禁区', duration: '5分', status: 'entrance', x: 12, y: 88 },
            { time: '09:30:00', location: '船台主观摩台', zone: '观摩台', duration: '45分', status: 'normal', x: 25, y: 70 },
            { time: '10:30:00', location: '龙骨焊缝探伤点', zone: '验收工位', duration: '50分', status: 'normal', x: 42, y: 55 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: `DEV-BS-${projTag}01`,
          name: '船台高精度定位主基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '高精度防爆定位主基站',
          code: `BS-${projTag}-01`,
          location: '船台东侧立柱 #P01',
          zone: '船台三维定位网',
          status: 'online',
          installedDate: '2026-01-01',
          signalStrength: '-62 dBm (极佳)',
          maintainer: '智能制造工区-李工'
        },
        {
          id: `DEV-ENV-${projTag}01`,
          name: '焊接烟尘与粉尘环境监测仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '多参数粉尘与VOC环境检测探头',
          code: `ENV-${projTag}-01`,
          location: '船台焊接主作业区',
          zone: '焊接区',
          status: 'online',
          installedDate: '2026-01-05',
          telemetry: {
            gasName: '焊接烟尘 / VOC',
            gasValue: '42 ug/m³',
            standardLimit: '≤ 150 ug/m³',
            temperature: '23.0 ℃',
            humidity: '56% RH',
            statusText: '优良达标'
          },
          maintainer: '安环部-周主管'
        },
        {
          id: `DEV-ALM-${projTag}01`,
          name: '船台防爆高分贝声光报警器',
          category: 'alarm',
          categoryLabel: '联动预警终端',
          type: '声光联动报警器 (120dB)',
          code: `ALM-${projTag}-01`,
          location: '船台吊车立柱',
          zone: '联动警报网',
          status: 'online',
          installedDate: '2026-01-01',
          signalStrength: '-58 dBm (极强)',
          maintainer: '动力安保处'
        }
      ],
      fences: [
        {
          id: `FNC-${projTag}-V1-01`,
          code: `EF-${projTag}-001`,
          name: '船台重型总段吊装大合拢警戒区',
          type: '吊装警戒区',
          dimension: '平面电子围栏',
          dangerLevel: '高',
          location: '船台合拢中心滑道',
          ruleDesc: '起吊启动前鸣笛警示，未经起重持证许可严禁擅入警戒红线',
          boundDevices: [`DEV-BS-${projTag}01`, `DEV-ALM-${projTag}01`],
          todayViolations: 0,
          events: [
            {
              id: `EVT-${projTag}-V1-01`,
              time: '2026-03-10 14:15:00',
              personName: '外协脚手架工-王某',
              personId: `EMP-${projTag}-099`,
              isProjectMember: false,
              eventType: '非法擅入',
              level: '高',
              handler: '安全员-孙海林',
              status: '已处置',
              notes: '吊运期间横穿隔离区，已现场制止劝离并记安全考核。'
            }
          ]
        }
      ],
      alarmPolicies: [
        {
          id: `POL-${projTag}-V1-01`,
          name: '起重吊装红线危险区擅入告警',
          type: '进入危险区域',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '非起重操作卡人员进入警戒区持续 > 2秒',
          notifyMechanism: '现场声光鸣笛 + 短信推送巡检员',
          status: '已启用',
          logs: [
            {
              id: `LOG-${projTag}-V1-01`,
              time: '2026-03-10 14:15:02',
              triggerSource: `EMP-${projTag}-099`,
              content: '擅自闯入重型总段吊装大合拢警戒区',
              level: '高',
              status: '已处理',
              processor: '安全员-孙海林',
              actionTaken: '现场劝离，进行安全复训。'
            }
          ]
        }
      ]
    },
    {
      versionId: 'V2.0',
      versionCode: 'v2',
      phaseTitle: '船体合拢与管系舾装阶段',
      status: 'active',
      startDate: '2026-05-16',
      endDate: '2026-11-30',
      berthInfo: {
        code: 1,
        name: '标准造船台 (2号平船台)',
        categoryName: '平船台',
        transferType: '平船台总装合拢',
        dockRule: '进入作业区域人员必须正确穿戴防爆定位手环及个人防护装备'
      },
      craftGoal: '大接缝焊接、全船管系预装、密闭舱室打压测试及机舱设备贯通。',
      safetySummary: '受限空间气体监控、动火防火防爆与高空立体交叉作业准入管制。',
      personnel: [
        {
          id: `EMP-${projTag}-101`,
          name: '赵强',
          role: '特种电焊技师',
          department: '建造一部 (合拢班)',
          isProjectMember: true,
          category: '特种作业',
          locatorId: `TAG-LOC-${projTag}101`,
          helmetColor: 'yellow',
          status: '在场作业',
          entryTime: '08:00:00',
          stayDuration: '3小时20分',
          currentLocation: '主甲板 合拢作业区',
          accessAuthorized: true,
          phone: '138****0001',
          battery: 90,
          heartRate: 78,
          trajectory: [
            { time: '08:00:00', location: '船台门禁闸机', zone: '门禁区', duration: '5分', status: 'entrance', x: 20, y: 80 },
            { time: '08:30:00', location: '合拢口作业位', zone: '焊接作业区', duration: '2h 50m', status: 'normal', x: 50, y: 50 }
          ],
          alertsCount: 0,
          alerts: []
        },
        {
          id: `EMP-${projTag}-102`,
          name: '李海波',
          role: '专职安全员',
          department: '安环部',
          isProjectMember: true,
          category: '安全监护',
          locatorId: `TAG-LOC-${projTag}102`,
          helmetColor: 'red',
          status: '在场作业',
          entryTime: '07:45:00',
          stayDuration: '3小时35分',
          currentLocation: '船台巡逻安全通道',
          accessAuthorized: true,
          phone: '139****0002',
          battery: 88,
          heartRate: 80,
          trajectory: [
            { time: '07:45:00', location: '门禁闸机', zone: '门禁区', duration: '5分', status: 'entrance', x: 15, y: 82 },
            { time: '08:15:00', location: '高空防坠巡检点', zone: '安全监护区', duration: '3h 00m', status: 'normal', x: 45, y: 45 }
          ],
          alertsCount: 0,
          alerts: []
        }
      ],
      devices: [
        {
          id: `DEV-${projTag}-01`,
          name: '主船台定位基站',
          category: 'positioning',
          categoryLabel: '定位基站设施',
          type: '高精度定位主基站',
          code: `BS-${projTag}-01`,
          location: '船台立柱 #P02',
          zone: '船台区',
          status: 'online',
          installedDate: '2026-05-16',
          signalStrength: '-65 dBm',
          maintainer: '设备工程部'
        },
        {
          id: `DEV-${projTag}-02`,
          name: '环境多气体检测仪',
          category: 'environmental',
          categoryLabel: '环境监测传感',
          type: '4合1防爆气体检测仪',
          code: `ENV-${projTag}-02`,
          location: '货舱人孔口',
          zone: '货舱区',
          status: 'online',
          installedDate: '2026-05-18',
          telemetry: {
            gasName: '可燃气 / 氧气 / CO',
            gasValue: '氧气 20.9% (正常达标)',
            temperature: '23 ℃',
            humidity: '50%'
          },
          maintainer: '安环部'
        }
      ],
      fences: [
        {
          id: `FNC-${projTag}-01`,
          code: `EF-${projTag}-001`,
          name: '船台高危动火与吊装警戒区',
          type: '动火作业区',
          dimension: '平面电子围栏',
          dangerLevel: '高',
          location: '船台总装作业区',
          ruleDesc: '需持有特种作业动火票并穿戴防爆手环方可进入',
          boundDevices: [`DEV-${projTag}-01`],
          todayViolations: 0,
          events: []
        }
      ],
      alarmPolicies: [
        {
          id: `POL-${projTag}-01`,
          name: '危险区域擅入告警',
          type: '进入危险区域',
          version: 'V1',
          level: '高',
          isGlobal: true,
          conditionText: '未授权人员靠近危险作业区持续 > 3秒',
          notifyMechanism: '声光报警 + 短信推送安监员',
          status: '已启用',
          logs: []
        }
      ]
    }
  ];
}
