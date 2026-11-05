export interface TrajectoryPoint {
  time: string; // e.g. '08:00:12'
  timestamp?: string; // e.g. '2026-08-29 08:00:12'
  location: string;
  zone: string;
  duration: string;
  status: 'normal' | 'alert' | 'entrance' | 'idle' | 'transition';
  domain?: 'shipyard' | 'vessel' | 'transition';
  // 厂区全景图坐标 (百分比 0-100)
  shipyardPos?: {
    x: number;
    y: number;
    areaName: string;
  };
  // 项目船体内部坐标 (百分比 0-100)
  vesselPos?: {
    x: number;
    y: number;
    deck: string;
    compartment: string;
    projectId: string;
  };
  isCrossDomain?: boolean; // 是否发生跨厂区-项目模型空间跨域行为
  crossDescription?: string; // 跨域动作说明
  x: number; // 当前通用坐标
  y: number;
}

export interface DetailedPersonnel {
  id: string;
  name: string;
  gender: 'male' | 'female';
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'warning';
  locatorId: string; // 定位基站分配标签ID
  projectId: string; // 关联 MOCK_PROJECTS ID
  projectName: string;
  shipType: string;
  dockingArea: string;
  helmetColor: 'yellow' | 'red' | 'blue' | 'white' | 'orange';
  avatarBg: string;
  avatarText: string;
  phone: string;
  heartRate: number;
  battery: number;
  sosState: boolean;
  workDuration: string;
  entryTime: string;
  // 厂区全景图坐标 (百分比 0-100)
  shipyardPos: {
    x: number;
    y: number;
    areaName: string;
    subArea: string;
  };
  // 项目船体内部坐标 (百分比 0-100 及 舱段标号)
  vesselPos: {
    deck: string; // 甲板层级，如 "主甲板 (Deck 1)", "货舱双层底", "机舱底层", "驾驶甲板"
    section: string; // 分段号，如 "C201", "A102", "B304"
    compartment: string; // 舱室名称，如 "压载水舱#2", "货舱合拢口#4", "主机安装位"
    x: number;
    y: number;
    z: number; // 高度坐标
  };
  trajectory: TrajectoryPoint[];
}

export const WORKER_ROLE_OPTIONS = [
  '安全部长',
  '油漆工',
  '调度',
  '安全主管',
  '安全员',
  '装配工',
  '电工',
  '钢筋工',
  '电焊工',
  '装修工'
] as const;

export type WorkerRole = typeof WORKER_ROLE_OPTIONS[number];

export const WORKER_TEAM_OPTIONS = [
  '搭载部',
  '涂装部',
  '机电部',
  '船装部',
  '安全环保部',
  '船体电焊班组',
  '船体打磨班组',
  '船体装配班组',
  '喷涂班组'
] as const;

export type WorkerTeam = typeof WORKER_TEAM_OPTIONS[number];

export const MOCK_PERSONNEL_LIST: DetailedPersonnel[] = [
  {
    id: 'EMP-001',
    name: '王建国',
    gender: 'male',
    role: '电焊工',
    department: '船体电焊一组',
    status: 'active',
    locatorId: 'TAG-LOC-1001',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipType: '清洁能源运输',
    dockingArea: '东南造船厂',
    helmetColor: 'yellow',
    avatarBg: 'bg-amber-500',
    avatarText: '王',
    phone: '138****6821',
    heartRate: 78,
    battery: 92,
    sosState: false,
    workDuration: '3小时45分',
    entryTime: '08:00:12',
    shipyardPos: {
      x: 32,
      y: 42,
      areaName: '东南造船厂 1号船台',
      subArea: '艏部分段搭载区 (Datum P0)'
    },
    vesselPos: {
      deck: '主甲板 (Main Deck)',
      section: 'SEC-A102 (合拢口#2)',
      compartment: '1号货舱主绝热箱焊接区',
      x: 42,
      y: 48,
      z: 14.5
    },
    trajectory: [
      { 
        time: '08:00:12', 
        timestamp: '2026-08-29 08:00:12',
        location: '厂区1号安检主门禁', 
        zone: '厂区门禁区', 
        duration: '2分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 12, y: 78, areaName: '厂区1号主门禁通道' },
        x: 12, 
        y: 78 
      },
      { 
        time: '08:20:15', 
        timestamp: '2026-08-29 08:20:15',
        location: '钢结构分段总拼二车间 (班前早会与工具领取)', 
        zone: '厂区车间区', 
        duration: '20分', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 22, y: 64, areaName: '钢结构总装二车间' },
        x: 22, 
        y: 64 
      },
      { 
        time: '08:45:00', 
        timestamp: '2026-08-29 08:45:00',
        location: '1号造船台·1号LNG船舷梯登船口 (跨域登船)', 
        zone: '船台登船通道', 
        duration: '10分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '由厂区地面经1号造船台登船舷梯，跨入 PRJ-2026-LNG01 船舶三维模型主甲板',
        shipyardPos: { x: 30, y: 46, areaName: '1号造船台登船舷梯' },
        vesselPos: { x: 22, y: 68, deck: '主甲板登船舷梯口', compartment: '艉部登船通道', projectId: 'PRJ-2026-LNG01' },
        x: 30, 
        y: 46 
      },
      { 
        time: '09:15:30', 
        timestamp: '2026-08-29 09:15:30',
        location: 'PRJ-2026-LNG01 艏部分段 SEC-A102 (主甲板合拢口)', 
        zone: '船舶模型·主甲板作业区', 
        duration: '1h 15m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 32, y: 42, areaName: '1号造船台' },
        vesselPos: { x: 42, y: 48, deck: '主甲板 (Main Deck)', compartment: 'SEC-A102 (合拢口#2)', projectId: 'PRJ-2026-LNG01' },
        x: 42, 
        y: 48 
      },
      { 
        time: '10:30:20', 
        timestamp: '2026-08-29 10:30:20',
        location: 'PRJ-2026-LNG01 1号货舱主绝热箱焊接位 (密闭空间作业)', 
        zone: '船舶模型·特种密闭舱', 
        duration: '1h 20m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 32, y: 42, areaName: '1号造船台' },
        vesselPos: { x: 48, y: 46, deck: '货舱绝热箱层', compartment: '1号货舱主绝热箱焊接位', projectId: 'PRJ-2026-LNG01' },
        x: 48, 
        y: 46 
      },
      { 
        time: '13:40:00', 
        timestamp: '2026-08-29 13:40:00',
        location: 'PRJ-2026-LNG01 2号货舱外围脚手架检测面', 
        zone: '船舶模型·高空合拢区', 
        duration: '45分', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 34, y: 40, areaName: '1号造船台' },
        vesselPos: { x: 55, y: 52, deck: '2号货舱外板', compartment: '2号货舱大接缝焊缝检验位', projectId: 'PRJ-2026-LNG01' },
        x: 55, 
        y: 52 
      },
      { 
        time: '15:10:00', 
        timestamp: '2026-08-29 15:10:00',
        location: 'PRJ-2026-LNG01 1号货舱焊接位 (持续作业)', 
        zone: '船舶模型·特种密闭舱', 
        duration: '1h 10m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 32, y: 42, areaName: '1号造船台' },
        vesselPos: { x: 42, y: 48, deck: '主甲板 (Main Deck)', compartment: 'SEC-A102 (合拢口#2)', projectId: 'PRJ-2026-LNG01' },
        x: 42, 
        y: 48 
      }
    ]
  },
  {
    id: 'EMP-002',
    name: '李海波',
    gender: 'male',
    role: '安全主管',
    department: '船坞码头安全督查巡检组',
    status: 'active',
    locatorId: 'TAG-LOC-1002',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipType: '清洁能源运输',
    dockingArea: '东南造船厂',
    helmetColor: 'red',
    avatarBg: 'bg-rose-500',
    avatarText: '李',
    phone: '139****7723',
    heartRate: 82,
    battery: 88,
    sosState: false,
    workDuration: '4小时10分',
    entryTime: '07:45:00',
    shipyardPos: {
      x: 35,
      y: 40,
      areaName: '东南造船厂 1号船台',
      subArea: '1号船台防爆高空警戒区'
    },
    vesselPos: {
      deck: '甲板2层 (Upper Deck)',
      section: 'SEC-B204 (生活区外围)',
      compartment: '高空立体作业安全监护网',
      x: 58,
      y: 35,
      z: 22.0
    },
    trajectory: [
      { 
        time: '07:45:00', 
        timestamp: '2026-08-29 07:45:00',
        location: '船厂总控安全门禁', 
        zone: '厂区门禁区', 
        duration: '5分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 15, y: 80, areaName: '厂区总控安全门禁' },
        x: 15, 
        y: 80 
      },
      { 
        time: '08:20:00', 
        timestamp: '2026-08-29 08:20:00',
        location: '1号造船台地面消防与应急通道', 
        zone: '厂区通道区', 
        duration: '40分', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 28, y: 55, areaName: '1号船台消防通道' },
        x: 28, 
        y: 55 
      },
      { 
        time: '09:00:00', 
        timestamp: '2026-08-29 09:00:00',
        location: '1号造船台登船步梯通道 (跨域登船巡检)', 
        zone: '船台登船通道', 
        duration: '10分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '巡检由地面通道跨入 PRJ-2026-LNG01 船舶货舱及上层生活甲板',
        shipyardPos: { x: 33, y: 44, areaName: '1号造船台登船梯' },
        vesselPos: { x: 28, y: 65, deck: '主甲板艉部', compartment: '登船通道', projectId: 'PRJ-2026-LNG01' },
        x: 33, 
        y: 44 
      },
      { 
        time: '09:30:00', 
        timestamp: '2026-08-29 09:30:00',
        location: 'PRJ-2026-LNG01 货舱密闭空间气体监测点', 
        zone: '船舶模型·受限空间', 
        duration: '1h 30m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 35, y: 40, areaName: '东南造船厂 1号船台' },
        vesselPos: { x: 45, y: 42, deck: '1号货舱底层', compartment: '气体采样监测仪巡检位', projectId: 'PRJ-2026-LNG01' },
        x: 45, 
        y: 42 
      },
      { 
        time: '11:15:00', 
        timestamp: '2026-08-29 11:15:00',
        location: 'PRJ-2026-LNG01 生活区高空作业防护绳点位', 
        zone: '船舶模型·立体警戒区', 
        duration: '45分', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 35, y: 40, areaName: '东南造船厂 1号船台' },
        vesselPos: { x: 58, y: 35, deck: '甲板2层 (Upper Deck)', compartment: 'SEC-B204 高空监护网', projectId: 'PRJ-2026-LNG01' },
        x: 58, 
        y: 35 
      },
      { 
        time: '14:20:00', 
        timestamp: '2026-08-29 14:20:00',
        location: 'PRJ-2026-LNG01 驾驶台导航室电气接地巡查', 
        zone: '船舶模型·驾驶区', 
        duration: '50分', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 35, y: 40, areaName: '东南造船厂 1号船台' },
        vesselPos: { x: 72, y: 32, deck: '驾驶甲板', compartment: '驾驶台安防巡检位', projectId: 'PRJ-2026-LNG01' },
        x: 72, 
        y: 32 
      }
    ]
  },
  {
    id: 'EMP-003',
    name: '张明',
    gender: 'male',
    role: '调度',
    department: '起重吊装组',
    status: 'active',
    locatorId: 'TAG-LOC-1003',
    projectId: 'PRJ-2026-BOX12',
    projectName: '24,000 TEU 超大型集装箱船',
    shipType: '集装箱班轮',
    dockingArea: '马尾造船厂',
    helmetColor: 'blue',
    avatarBg: 'bg-blue-600',
    avatarText: '张',
    phone: '137****1109',
    heartRate: 75,
    battery: 95,
    sosState: false,
    workDuration: '3小时10分',
    entryTime: '08:30:00',
    shipyardPos: {
      x: 72,
      y: 30,
      areaName: '马尾造船厂 1号码头',
      subArea: '1000吨重型龙门吊下操作区'
    },
    vesselPos: {
      deck: '甲板艏楼区 (Forecastle)',
      section: 'SEC-C101 (锚泊甲板)',
      compartment: '1号系泊绞缆机基座调试区',
      x: 25,
      y: 50,
      z: 18.0
    },
    trajectory: [
      { 
        time: '08:30:00', 
        timestamp: '2026-08-29 08:30:00',
        location: '1号码头东区安防门禁', 
        zone: '厂区门禁区', 
        duration: '3分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 65, y: 48, areaName: '1号码头东区入口' },
        x: 65, 
        y: 48 
      },
      { 
        time: '09:00:00', 
        timestamp: '2026-08-29 09:00:00',
        location: '东区1000t龙门吊地面总控操作台', 
        zone: '厂区指挥区', 
        duration: '1h 10m', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 70, y: 35, areaName: '1号码头龙门吊地面指挥台' },
        x: 70, 
        y: 35 
      },
      { 
        time: '10:15:00', 
        timestamp: '2026-08-29 10:15:00',
        location: '1号码头集装箱船艏楼舷梯口 (跨域登船)', 
        zone: '码头登船通道', 
        duration: '10分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '由1号码头吊机指挥台跨入 PRJ-2026-BOX12 24000TEU集装箱船模型艏楼甲板',
        shipyardPos: { x: 71, y: 28, areaName: '1号码头舾装舷梯' },
        vesselPos: { x: 18, y: 52, deck: '艏楼舷梯口', compartment: '艏楼登船通道', projectId: 'PRJ-2026-BOX12' },
        x: 71, 
        y: 28 
      },
      { 
        time: '10:40:00', 
        timestamp: '2026-08-29 10:40:00',
        location: 'PRJ-2026-BOX12 艏楼甲板系泊绞缆机安装位', 
        zone: '船舶模型·舾装调试区', 
        duration: '1h 20m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 72, y: 30, areaName: '马尾造船厂 1号码头' },
        vesselPos: { x: 25, y: 50, deck: '甲板艏楼区 (Forecastle)', compartment: 'SEC-C101 绞缆机基座', projectId: 'PRJ-2026-BOX12' },
        x: 25, 
        y: 50 
      }
    ]
  },
  {
    id: 'EMP-004',
    name: '陈志强',
    gender: 'male',
    role: '油漆工',
    department: '特种喷涂一组',
    status: 'active',
    locatorId: 'TAG-LOC-1004',
    projectId: 'PRJ-2026-TANK02',
    projectName: '30万吨 VLCC 超大型原油船',
    shipType: '液体散货',
    dockingArea: '冠海造船厂',
    helmetColor: 'orange',
    avatarBg: 'bg-orange-500',
    avatarText: '陈',
    phone: '136****5562',
    heartRate: 86,
    battery: 65,
    sosState: false,
    workDuration: '2小时45分',
    entryTime: '08:45:00',
    shipyardPos: {
      x: 82,
      y: 65,
      areaName: '冠海造船厂 3号码头',
      subArea: 'VLCC 压载舱密闭涂装区'
    },
    vesselPos: {
      deck: '货舱双层底 (Double Bottom)',
      section: 'SEC-D04 (4号压载边舱)',
      compartment: '环氧防腐涂装受限空间',
      x: 65,
      y: 60,
      z: 3.5
    },
    trajectory: [
      { 
        time: '08:45:00', 
        timestamp: '2026-08-29 08:45:00',
        location: '3号码头水下舾装闸口', 
        zone: '厂区门禁区', 
        duration: '5分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 75, y: 75, areaName: '3号码头闸口' },
        x: 75, 
        y: 75 
      },
      { 
        time: '09:10:00', 
        timestamp: '2026-08-29 09:10:00',
        location: '厂区专用涂料防爆调配站', 
        zone: '厂区调配区', 
        duration: '25分', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 78, y: 68, areaName: '防爆涂料调配站' },
        x: 78, 
        y: 68 
      },
      { 
        time: '09:40:00', 
        timestamp: '2026-08-29 09:40:00',
        location: '3号码头 VLCC 舷梯登船通道 (跨域登船)', 
        zone: '码头登船通道', 
        duration: '15分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '由码头涂料站携带防爆喷涂装备跨入 PRJ-2026-TANK02 VLCC 原油船内部双层底',
        shipyardPos: { x: 80, y: 64, areaName: '3号码头登船舷梯' },
        vesselPos: { x: 30, y: 65, deck: '主甲板4号舱口', compartment: '下舱通道', projectId: 'PRJ-2026-TANK02' },
        x: 80, 
        y: 64 
      },
      { 
        time: '10:10:00', 
        timestamp: '2026-08-29 10:10:00',
        location: 'PRJ-2026-TANK02 4号压载边舱底层防腐施工位', 
        zone: '船舶模型·受限空间涂装', 
        duration: '1h 30m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 82, y: 65, areaName: '冠海造船厂 3号码头' },
        vesselPos: { x: 65, y: 60, deck: '货舱双层底 (Double Bottom)', compartment: 'SEC-D04 (4号压载边舱)', projectId: 'PRJ-2026-TANK02' },
        x: 65, 
        y: 60 
      }
    ]
  },
  {
    id: 'EMP-005',
    name: '周晓琳',
    gender: 'female',
    role: '电工',
    department: '气割与等离子切割组',
    status: 'active',
    locatorId: 'TAG-LOC-1005',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipType: '清洁能源运输',
    dockingArea: '东南造船厂',
    helmetColor: 'white',
    avatarBg: 'bg-emerald-600',
    avatarText: '周',
    phone: '135****9082',
    heartRate: 74,
    battery: 98,
    sosState: false,
    workDuration: '3小时20分',
    entryTime: '08:15:00',
    shipyardPos: {
      x: 30,
      y: 45,
      areaName: '东南造船厂 1号船台',
      subArea: '机舱分段总组区'
    },
    vesselPos: {
      deck: '机舱平台层 (Engine Platform)',
      section: 'SEC-E01 (辅机发电机舱)',
      compartment: '1号发电机控制屏柜配线',
      x: 75,
      y: 45,
      z: 8.0
    },
    trajectory: [
      { 
        time: '08:15:00', 
        timestamp: '2026-08-29 08:15:00',
        location: '1号造船台门禁', 
        zone: '厂区门禁区', 
        duration: '5分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 20, y: 75, areaName: '1号造船台门禁' },
        x: 20, 
        y: 75 
      },
      { 
        time: '08:40:00', 
        timestamp: '2026-08-29 08:40:00',
        location: '船台机电设备检测室', 
        zone: '厂区检测室', 
        duration: '30分', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 25, y: 55, areaName: '机电检测室' },
        x: 25, 
        y: 55 
      },
      { 
        time: '09:10:00', 
        timestamp: '2026-08-29 09:10:00',
        location: '1号造船台艉部机舱舷梯口 (跨域登船)', 
        zone: '船台登船通道', 
        duration: '10分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '由机电设备检测室跨入 PRJ-2026-LNG01 船舶机舱平台层',
        shipyardPos: { x: 29, y: 47, areaName: '机舱登船口' },
        vesselPos: { x: 68, y: 48, deck: '机舱上层', compartment: '机舱通道', projectId: 'PRJ-2026-LNG01' },
        x: 29, 
        y: 47 
      },
      { 
        time: '09:30:00', 
        timestamp: '2026-08-29 09:30:00',
        location: 'PRJ-2026-LNG01 辅机发电机舱电气控制柜', 
        zone: '船舶模型·高压调试区', 
        duration: '2h 10m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 30, y: 45, areaName: '东南造船厂 1号船台' },
        vesselPos: { x: 75, y: 45, deck: '机舱平台层 (Engine Platform)', compartment: 'SEC-E01 (辅机发电机舱)', projectId: 'PRJ-2026-LNG01' },
        x: 75, 
        y: 45 
      }
    ]
  },
  {
    id: 'EMP-006',
    name: '赵国庆',
    gender: 'male',
    role: '装配工',
    department: '船体装配二班',
    status: 'active',
    locatorId: 'TAG-LOC-1006',
    projectId: 'PRJ-2026-BULK04',
    projectName: '82,000 DWT 卡姆萨尔型散货船',
    shipType: '干散货运输',
    dockingArea: '东南造船厂',
    helmetColor: 'yellow',
    avatarBg: 'bg-amber-600',
    avatarText: '赵',
    phone: '138****3329',
    heartRate: 80,
    battery: 84,
    sosState: false,
    workDuration: '4小时00分',
    entryTime: '07:50:00',
    shipyardPos: {
      x: 48,
      y: 52,
      areaName: '东南造船厂 2号船台',
      subArea: '2号造船台中部分段合拢区'
    },
    vesselPos: {
      deck: '主甲板 (Upper Deck)',
      section: 'SEC-M301 (3号货舱横舱壁)',
      compartment: '3号大开口货舱上口框装配',
      x: 50,
      y: 50,
      z: 16.0
    },
    trajectory: [
      { 
        time: '07:50:00', 
        timestamp: '2026-08-29 07:50:00',
        location: '2号船台大门安检门禁', 
        zone: '厂区门禁区', 
        duration: '5分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 40, y: 80, areaName: '2号船台大门' },
        x: 40, 
        y: 80 
      },
      { 
        time: '08:10:00', 
        timestamp: '2026-08-29 08:10:00',
        location: '散货船分段拼装备料工位', 
        zone: '厂区装配区', 
        duration: '1h 10m', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 45, y: 65, areaName: '2号船台备料区' },
        x: 45, 
        y: 65 
      },
      { 
        time: '09:20:00', 
        timestamp: '2026-08-29 09:20:00',
        location: '2号造船台散货船主舷梯口 (跨域登船)', 
        zone: '船台登船通道', 
        duration: '10分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '由2号船台拼装工位跨入 PRJ-2026-BULK04 散货船3号货舱主结构模型',
        shipyardPos: { x: 47, y: 55, areaName: '2号船台登船梯' },
        vesselPos: { x: 35, y: 55, deck: '主甲板通道', compartment: '3号货舱口', projectId: 'PRJ-2026-BULK04' },
        x: 47, 
        y: 55 
      },
      { 
        time: '09:50:00', 
        timestamp: '2026-08-29 09:50:00',
        location: 'PRJ-2026-BULK04 3号货舱横向加强隔壁定位点', 
        zone: '船舶模型·搭载定位', 
        duration: '1h 40m', 
        status: 'normal', 
        domain: 'vessel',
        shipyardPos: { x: 48, y: 52, areaName: '东南造船厂 2号船台' },
        vesselPos: { x: 50, y: 50, deck: '主甲板 (Upper Deck)', compartment: 'SEC-M301 (3号货舱横舱壁)', projectId: 'PRJ-2026-BULK04' },
        x: 50, 
        y: 50 
      }
    ]
  },
  {
    id: 'EMP-007',
    name: '孙浩',
    gender: 'male',
    role: '安全员',
    department: '船坞码头安全督查巡检组',
    status: 'warning',
    locatorId: 'TAG-LOC-1007',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipType: '清洁能源运输',
    dockingArea: '东南造船厂',
    helmetColor: 'yellow',
    avatarBg: 'bg-yellow-500',
    avatarText: '孙',
    phone: '139****4418',
    heartRate: 108, // 心率偏高报警
    battery: 45,
    sosState: false,
    workDuration: '3小时50分',
    entryTime: '08:05:00',
    shipyardPos: {
      x: 33,
      y: 43,
      areaName: '东南造船厂 1号船台',
      subArea: 'LNG深冷绝热管路敷设位'
    },
    vesselPos: {
      deck: '低温管廊平台 (Cryo Trunk)',
      section: 'SEC-T02 (气相总管段)',
      compartment: 'BOG 再液化管路法兰安装区',
      x: 48,
      y: 46,
      z: 19.5
    },
    trajectory: [
      { 
        time: '08:05:00', 
        timestamp: '2026-08-29 08:05:00',
        location: '1号造船台入场门禁', 
        zone: '厂区门禁区', 
        duration: '3分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 20, y: 75, areaName: '1号造船台门禁' },
        x: 20, 
        y: 75 
      },
      { 
        time: '08:30:00', 
        timestamp: '2026-08-29 08:30:00',
        location: '不锈钢低温管材堆场 (领取特种管件)', 
        zone: '厂区管材区', 
        duration: '30分', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 26, y: 60, areaName: '低温管材堆场' },
        x: 26, 
        y: 60 
      },
      { 
        time: '09:05:00', 
        timestamp: '2026-08-29 09:05:00',
        location: '1号造船台管廊提升吊笼口 (跨域登船)', 
        zone: '船台登船通道', 
        duration: '10分', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '由低温管材堆场经吊笼跨入 PRJ-2026-LNG01 船舶低温管廊平台',
        shipyardPos: { x: 31, y: 45, areaName: '管廊吊笼口' },
        vesselPos: { x: 40, y: 46, deck: '管廊上层平台', compartment: '管系安装区', projectId: 'PRJ-2026-LNG01' },
        x: 31, 
        y: 45 
      },
      { 
        time: '09:25:00', 
        timestamp: '2026-08-29 09:25:00',
        location: 'PRJ-2026-LNG01 低温管廊作业面 (静止时间较长预警)', 
        zone: '船舶模型·高空管系区', 
        duration: '2h 15m', 
        status: 'alert', 
        domain: 'vessel',
        shipyardPos: { x: 33, y: 43, areaName: '东南造船厂 1号船台' },
        vesselPos: { x: 48, y: 46, deck: '低温管廊平台 (Cryo Trunk)', compartment: 'SEC-T02 (气相总管段)', projectId: 'PRJ-2026-LNG01' },
        x: 48, 
        y: 46 
      }
    ]
  },
  {
    id: 'EMP-008',
    name: '刘勇',
    gender: 'male',
    role: '安全部长',
    department: '船坞码头安全督查巡检组',
    status: 'inactive',
    locatorId: 'TAG-LOC-1008',
    projectId: 'PRJ-2026-PSV01',
    projectName: '75M 动力定位平台供应船 (DP-2)',
    shipType: '海洋工程',
    dockingArea: '马尾造船厂',
    helmetColor: 'white',
    avatarBg: 'bg-slate-400',
    avatarText: '刘',
    phone: '133****9912',
    heartRate: 0,
    battery: 100,
    sosState: false,
    workDuration: '已完工交付',
    entryTime: '离场归档',
    shipyardPos: {
      x: 60,
      y: 25,
      areaName: '马尾造船厂 2号码头',
      subArea: '已离场/设备入库'
    },
    vesselPos: {
      deck: '驾驶台 (Bridge)',
      section: 'SEC-NAV01 (DP控制台)',
      compartment: '全回转舵桨控制台',
      x: 30,
      y: 50,
      z: 15.0
    },
    trajectory: [
      { 
        time: '08:00:00', 
        timestamp: '2026-08-29 08:00:00',
        location: '2号码头西区系泊闸口', 
        zone: '厂区门禁区', 
        duration: '5分', 
        status: 'entrance', 
        domain: 'shipyard',
        shipyardPos: { x: 55, y: 35, areaName: '2号码头闸口' },
        x: 55, 
        y: 35 
      },
      { 
        time: '08:30:00', 
        timestamp: '2026-08-29 08:30:00',
        location: 'PSV交船验收签署现场 (跨域登船交验)', 
        zone: '船舶模型·驾驶区', 
        duration: '1h', 
        status: 'transition', 
        domain: 'transition',
        isCrossDomain: true,
        crossDescription: '跨入 PRJ-2026-PSV01 平台供应船驾驶台完成交验',
        shipyardPos: { x: 60, y: 25, areaName: '马尾造船厂 2号码头' },
        vesselPos: { x: 30, y: 50, deck: '驾驶台 (Bridge)', compartment: 'SEC-NAV01', projectId: 'PRJ-2026-PSV01' },
        x: 60, 
        y: 25 
      },
      { 
        time: '09:45:00', 
        timestamp: '2026-08-29 09:45:00',
        location: '归还高精度定位终端手环至库房', 
        zone: '厂区库房', 
        duration: '10分', 
        status: 'normal', 
        domain: 'shipyard',
        shipyardPos: { x: 10, y: 85, areaName: '定位设备库房' },
        x: 10, 
        y: 85 
      }
    ]
  },
  {
    id: 'EMP-009',
    name: '黄德胜',
    gender: 'male',
    role: '钢筋工',
    department: '大合拢搭载班',
    status: 'active',
    locatorId: 'TAG-LOC-1009',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipType: '清洁能源运输',
    dockingArea: '东南造船厂',
    helmetColor: 'yellow',
    avatarBg: 'bg-amber-700',
    avatarText: '黄',
    phone: '137****8890',
    heartRate: 85,
    battery: 89,
    sosState: false,
    workDuration: '3小时15分',
    entryTime: '08:10:00',
    shipyardPos: {
      x: 36,
      y: 44,
      areaName: '东南造船厂 1号船台',
      subArea: '船体加强结构支撑区'
    },
    vesselPos: {
      deck: '主甲板 (Main Deck)',
      section: 'SEC-A104 (支撑梁架)',
      compartment: '液货舱底加强筋网格区',
      x: 46,
      y: 52,
      z: 12.0
    },
    trajectory: [
      {
        time: '08:10:00',
        timestamp: '2026-08-29 08:10:00',
        location: '1号船台主通道门禁',
        zone: '厂区门禁区',
        duration: '5分',
        status: 'entrance',
        domain: 'shipyard',
        shipyardPos: { x: 18, y: 76, areaName: '1号船台主通道' },
        x: 18,
        y: 76
      },
      {
        time: '08:45:00',
        timestamp: '2026-08-29 08:45:00',
        location: '钢结构预制加工车间',
        zone: '厂区加工区',
        duration: '40分',
        status: 'normal',
        domain: 'shipyard',
        shipyardPos: { x: 26, y: 62, areaName: '钢结构车间' },
        x: 26,
        y: 62
      },
      {
        time: '09:30:00',
        timestamp: '2026-08-29 09:30:00',
        location: 'PRJ-2026-LNG01 货舱加强筋绑扎区',
        zone: '船舶模型·搭载区',
        duration: '2小时',
        status: 'normal',
        domain: 'vessel',
        shipyardPos: { x: 36, y: 44, areaName: '东南造船厂 1号船台' },
        vesselPos: { x: 46, y: 52, deck: '主甲板 (Main Deck)', compartment: 'SEC-A104', projectId: 'PRJ-2026-LNG01' },
        x: 46,
        y: 52
      }
    ]
  },
  {
    id: 'EMP-010',
    name: '钱学林',
    gender: 'male',
    role: '装修工',
    department: '高压打砂除锈班',
    status: 'active',
    locatorId: 'TAG-LOC-1010',
    projectId: 'PRJ-2026-BOX12',
    projectName: '24,000 TEU 超大型集装箱船',
    shipType: '集装箱班轮',
    dockingArea: '马尾造船厂',
    helmetColor: 'blue',
    avatarBg: 'bg-teal-600',
    avatarText: '钱',
    phone: '136****2234',
    heartRate: 76,
    battery: 91,
    sosState: false,
    workDuration: '2小时50分',
    entryTime: '08:35:00',
    shipyardPos: {
      x: 70,
      y: 32,
      areaName: '马尾造船厂 1号码头',
      subArea: '上层建筑生活区舾装'
    },
    vesselPos: {
      deck: '生活区3层 (Accommodation Deck 3)',
      section: 'SEC-L302 (高级船员居住舱)',
      compartment: '生活区绝热防火内装工程区',
      x: 60,
      y: 42,
      z: 24.0
    },
    trajectory: [
      {
        time: '08:35:00',
        timestamp: '2026-08-29 08:35:00',
        location: '1号码头生活区专用舷梯口',
        zone: '厂区门禁区',
        duration: '5分',
        status: 'entrance',
        domain: 'shipyard',
        shipyardPos: { x: 68, y: 46, areaName: '生活区舷梯口' },
        x: 68,
        y: 46
      },
      {
        time: '09:15:00',
        timestamp: '2026-08-29 09:15:00',
        location: 'PRJ-2026-BOX12 上层建筑生活区居室装潢施工位',
        zone: '船舶模型·生活区内装',
        duration: '2小时10分',
        status: 'normal',
        domain: 'vessel',
        shipyardPos: { x: 70, y: 32, areaName: '马尾造船厂 1号码头' },
        vesselPos: { x: 60, y: 42, deck: '生活区3层 (Accommodation Deck 3)', compartment: 'SEC-L302', projectId: 'PRJ-2026-BOX12' },
        x: 60,
        y: 42
      }
    ]
  },
  {
    id: 'EMP-011',
    name: '吴建业',
    gender: 'male',
    role: '装配工',
    department: '船体打磨班组',
    status: 'active',
    locatorId: 'TAG-LOC-1011',
    projectId: 'PRJ-2026-BULK04',
    projectName: '82,000 DWT 卡姆萨尔型散货船',
    shipType: '干散货运输',
    dockingArea: '东南造船厂',
    helmetColor: 'yellow',
    avatarBg: 'bg-indigo-600',
    avatarText: '吴',
    phone: '139****5511',
    heartRate: 79,
    battery: 87,
    sosState: false,
    workDuration: '3小时40分',
    entryTime: '07:55:00',
    shipyardPos: {
      x: 46,
      y: 50,
      areaName: '东南造船厂 2号船台',
      subArea: '散货船横隔板打磨修边工位'
    },
    vesselPos: {
      deck: '主甲板 (Upper Deck)',
      section: 'SEC-M202 (2号货舱打磨点)',
      compartment: '横隔壁焊道打磨抛光区',
      x: 48,
      y: 48,
      z: 15.0
    },
    trajectory: [
      {
        time: '07:55:00',
        timestamp: '2026-08-29 07:55:00',
        location: '2号船台打磨作业安全检录口',
        zone: '厂区门禁区',
        duration: '5分',
        status: 'entrance',
        domain: 'shipyard',
        shipyardPos: { x: 38, y: 78, areaName: '2号船台检录口' },
        x: 38,
        y: 78
      },
      {
        time: '08:30:00',
        timestamp: '2026-08-29 08:30:00',
        location: 'PRJ-2026-BULK04 2号货舱焊道抛光位',
        zone: '船舶模型·打磨区',
        duration: '2小时30分',
        status: 'normal',
        domain: 'vessel',
        shipyardPos: { x: 46, y: 50, areaName: '东南造船厂 2号船台' },
        vesselPos: { x: 48, y: 48, deck: '主甲板 (Upper Deck)', compartment: 'SEC-M202', projectId: 'PRJ-2026-BULK04' },
        x: 48,
        y: 48
      }
    ]
  },
  {
    id: 'EMP-012',
    name: '郑立伟',
    gender: 'male',
    role: '油漆工',
    department: '涂装部',
    status: 'active',
    locatorId: 'TAG-LOC-1012',
    projectId: 'PRJ-2026-TANK02',
    projectName: '30万吨 VLCC 超大型原油船',
    shipType: '液体散货',
    dockingArea: '冠海造船厂',
    helmetColor: 'orange',
    avatarBg: 'bg-amber-600',
    avatarText: '郑',
    phone: '135****6618',
    heartRate: 83,
    battery: 93,
    sosState: false,
    workDuration: '3小时05分',
    entryTime: '08:25:00',
    shipyardPos: {
      x: 80,
      y: 62,
      areaName: '冠海造船厂 3号码头',
      subArea: 'VLCC 艏部外板防污涂装区'
    },
    vesselPos: {
      deck: '外板水下区 (Outer Hull Waterline)',
      section: 'SEC-B01 (球鼻艏外板)',
      compartment: '硅树脂防污漆喷涂工位',
      x: 20,
      y: 60,
      z: 6.0
    },
    trajectory: [
      {
        time: '08:25:00',
        timestamp: '2026-08-29 08:25:00',
        location: '3号码头涂装安检站',
        zone: '厂区门禁区',
        duration: '5分',
        status: 'entrance',
        domain: 'shipyard',
        shipyardPos: { x: 74, y: 72, areaName: '3号码头涂装安检' },
        x: 74,
        y: 72
      },
      {
        time: '09:00:00',
        timestamp: '2026-08-29 09:00:00',
        location: 'PRJ-2026-TANK02 球鼻艏外板高空吊篮喷涂位',
        zone: '船舶模型·外板涂装',
        duration: '2小时15分',
        status: 'normal',
        domain: 'vessel',
        shipyardPos: { x: 80, y: 62, areaName: '冠海造船厂 3号码头' },
        vesselPos: { x: 20, y: 60, deck: '外板水下区 (Outer Hull Waterline)', compartment: 'SEC-B01', projectId: 'PRJ-2026-TANK02' },
        x: 20,
        y: 60
      }
    ]
  }
];
