import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  Plus, 
  Radio, 
  Trash2,
  X, 
  Flame,
  Volume2,
  Video,
  Calendar,
  Layers,
  Cpu,
  Tv,
  AlertTriangle,
  Ship,
  Info,
  MapPin,
  Crosshair,
  Building2,
  Compass,
  Check,
  Link,
  ShieldAlert
} from 'lucide-react';
import { MOCK_PROJECTS } from '@/src/data/mockProjects';
import { getStoredWorkfaces, WorkfaceRecord } from '@/src/data/workfaceData';

export type DeviceTab = 'main_station' | 'exciter' | 'gas_detector' | 'alarm' | 'camera';

// 关联作业面与船舶有限空间项定义 (支持多选、动态增删)
export interface DeviceAssociatedWorkface {
  id: string;               // 关联唯一ID
  type: 'workface' | 'confinedSpace'; // 类型: 全厂通用作业面 | 船舶工程有限空间
  workfaceId?: string;      // 作业面/空间ID
  name: string;             // 作业面/舱室名称
  code?: string;            // 编号 (如 WF-SEC-01)
  projectId?: string;       // 工程项目ID (若为有限空间)
  projectName?: string;     // 工程项目名称 (若为有限空间)
  modelLevel?: string;      // 船体分层ID (若为有限空间)
  modelLevelName?: string;  // 船体分层名称 (若为有限空间)
  yardZone?: string;        // 厂区功能分区名称 (若为全厂作业面)
  yardSubArea?: string;     // 厂区车间/工位名称 (若为全厂作业面)
  electricFence?: string;   // 关联电子围栏编号
}

// BIM 3D 模型分层定义
export interface ModelLayerOption {
  id: string; // 'deck' | 'middle' | 'bottom' | 'engine' | 'bridge'
  name: string;
  fullName: string;
  elevation: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotBg: string;
}

export const MODEL_LAYER_OPTIONS: ModelLayerOption[] = [
  {
    id: 'deck',
    name: '甲板层',
    fullName: '甲板层 (主甲板/露天作业区)',
    elevation: '+18.5m ~ +24.0m',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dotBg: 'bg-emerald-500'
  },
  {
    id: 'middle',
    name: '中舱层',
    fullName: '中舱层 (货舱上部/中层平台)',
    elevation: '+8.0m ~ +18.5m',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700',
    badgeBorder: 'border-sky-200',
    dotBg: 'bg-sky-500'
  },
  {
    id: 'bottom',
    name: '底舱层',
    fullName: '底舱层 (双层底/压载密闭舱)',
    elevation: '0.0m ~ +8.0m',
    badgeBg: 'bg-fuchsia-50',
    badgeText: 'text-fuchsia-700',
    badgeBorder: 'border-fuchsia-200',
    dotBg: 'bg-fuchsia-500'
  },
  {
    id: 'engine',
    name: '机舱区',
    fullName: '机舱动力区 (主机/辅机与管系舱)',
    elevation: '-2.0m ~ +12.0m',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dotBg: 'bg-amber-500'
  },
  {
    id: 'bridge',
    name: '驾驶台',
    fullName: '驾驶台 (上层建筑/驾控生活区)',
    elevation: '+24.0m ~ +36.0m',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    dotBg: 'bg-purple-500'
  }
];

export function getLayerOption(levelId?: string): ModelLayerOption | undefined {
  return MODEL_LAYER_OPTIONS.find(l => l.id === levelId);
}

// 定位衰减系数 (0~31) 对应覆盖范围半径距离 (50米递减到1米)
export function getCoverageRadiusByAttenuation(coeffStrOrNum: string | number): number {
  const coeff = Math.max(0, Math.min(31, Number(coeffStrOrNum) || 0));
  return Math.round(50 - (coeff * 49 / 31));
}

// 全厂作业面候选库 (选择“全厂通用设备”场景时关联，参考东南造船基地平面图与作业面管理)
export interface YardWorkfaceOption {
  id: string;
  code: string;
  name: string;
  zone: string;
  subArea: string;
  safetyOfficer: string;
  fenceCode: string;
  defaultPosition?: { x: number; y: number; z: number };
}

export const YARD_WORKFACE_OPTIONS: YardWorkfaceOption[] = [
  { id: 'WF-YARD-001', code: 'WF-SEC-01', name: '总组装焊平台一巨型分段拼对总组面', zone: '总装焊与分段建造区', subArea: '总组装焊平台一', safetyOfficer: '林海波', fenceCode: 'EF-SEC-01', defaultPosition: { x: 380.5, y: 0.02, z: -260.4 } },
  { id: 'WF-YARD-002', code: 'WF-SEC-02', name: '5071㎡涂装车间密闭喷砂除锈特涂面', zone: '涂装与表面处理区', subArea: '涂装车间', safetyOfficer: '郑文杰', fenceCode: 'EF-SEC-02', defaultPosition: { x: 410.2, y: 2.50, z: -310.8 } },
  { id: 'WF-YARD-003', code: 'WF-SEC-03', name: '128船台滑道搭载总装作业面', zone: '船台船坞与码头作业区', subArea: '128船台', safetyOfficer: '张立峰', fenceCode: 'EF-SEC-03', defaultPosition: { x: 290.0, y: 0.05, z: -180.0 } },
  { id: 'WF-YARD-004', code: 'WF-SEC-04', name: '100船台大合拢搭载作业面', zone: '船台船坞与码头作业区', subArea: '100船台', safetyOfficer: '陈志强', fenceCode: 'EF-SEC-04', defaultPosition: { x: 275.4, y: 0.02, z: -150.2 } },
  { id: 'WF-YARD-005', code: 'WF-SEC-05', name: '新舾装码头水上系泊调试作业面', zone: '船台船坞与码头作业区', subArea: '新舾装码头', safetyOfficer: '周卫国', fenceCode: 'EF-SEC-05', defaultPosition: { x: 190.8, y: 0.00, z: -95.6 } },
  { id: 'WF-YARD-006', code: 'WF-SEC-06', name: '制造部内场数控激光切割与下料面', zone: '加工与制造车间区', subArea: '数控切割区', safetyOfficer: '李建军', fenceCode: 'EF-SEC-06', defaultPosition: { x: 450.6, y: 1.20, z: -350.0 } },
  { id: 'WF-YARD-007', code: 'WF-SEC-07', name: '集配部管件冷拔加工及氩弧焊接面', zone: '加工与制造车间区', subArea: '管加工车间', safetyOfficer: '黄伟峰', fenceCode: 'EF-SEC-07', defaultPosition: { x: 420.0, y: 1.00, z: -320.0 } },
  { id: 'WF-YARD-008', code: 'WF-SEC-08', name: '全厂公共区域通用监管作业面', zone: '综合厂区', subArea: '主干道路网', safetyOfficer: '赵大鹏', fenceCode: 'EF-SEC-08', defaultPosition: { x: 350.0, y: 0.00, z: -200.0 } }
];

// 1. 主基站类型
export interface BaseStationDevice {
  id: string;
  seq: number;
  code: string;           // 基站编码
  name: string;           // 基站名称
  associationType?: 'global' | 'project'; // 关联模式: 全厂通用设备 | 造船项目
  projectId?: string;     // 项目ID (如 PRJ-2026-LNG01)
  project: string;        // 所属项目或全厂通用
  modelLevel?: string;    // 模型分层 (deck | middle | bottom | engine | bridge)
  modelLevelName?: string;// 模型分层名称
  workfaceId?: string;    // 关联作业面ID (全厂通用设备)
  workfaceName?: string;  // 关联作业面名称
  confinedSpaceName?: string; // 关联有限空间名称
  associatedWorkfaces?: DeviceAssociatedWorkface[]; // 扩展多作业面/有限空间关联列表
  status: '在线' | '离线'; // 基站状态
  recycleStatus: string;  // 基站回收状态（设备安装、已回收、维护中、待安装、临时撤场、拟拆除等）
  location: string;       // 安装位置
  floor?: string;         // 安装楼层
  signalLossTime?: number | string; // 信号丢失时间 (分钟)
  attenuationCoeff?: number | string; // 衰减系数
  coverageRange?: number | string; // 覆盖范围 (m)
  positionX?: number;     // 安装位置X轴
  positionY?: number;     // 安装位置Y轴
  positionZ?: number;     // 安装位置Z轴
  installationSite?: string; // 基站安装场所 (室外/室内/舱内/船台/码头)
  auxPositioning: '是' | '否'; // 辅助定位
  electricFence?: string; // 电子围栏
  lastUpdated?: string;   // 最后更新时间
  ipAddress?: string;     // IP地址
  macAddress?: string;    // MAC地址
  firmwareVersion?: string; // 固件版本
}

// 2. 气体探测器类型
export interface GasDetectorDevice {
  id: string;
  seq: number;
  createdAt: string;       // 创建时间
  sn: string;              // 设备SN
  name: string;            // 设备名称
  associationType?: 'global' | 'project'; // 关联模式: 全厂通用设备 | 造船项目
  projectId?: string;     // 项目ID
  project: string;         // 所属项目或全厂通用
  modelLevel?: string;    // 模型分层
  modelLevelName?: string;// 模型分层名称
  workfaceId?: string;    // 关联作业面ID (全厂通用设备)
  workfaceName?: string;  // 关联作业面名称
  confinedSpaceName?: string; // 关联有限空间名称
  associatedWorkfaces?: DeviceAssociatedWorkface[]; // 扩展多作业面/有限空间关联列表
  location: string;        // 安装位置
  floor?: string;          // 安装楼层
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  installationSite?: string;
  electricFence?: string;
}

// 3. 声光报警器类型
export interface AlarmDevice {
  id: string;
  seq: number;
  createdAt: string;       // 创建时间
  sn: string;              // 设备SN
  name: string;            // 设备名称
  associationType?: 'global' | 'project'; // 关联模式: 全厂通用设备 | 造船项目
  projectId?: string;     // 项目ID
  project: string;         // 所属项目或全厂通用
  modelLevel?: string;    // 模型分层
  modelLevelName?: string;// 模型分层名称
  workfaceId?: string;    // 关联作业面ID (全厂通用设备)
  workfaceName?: string;  // 关联作业面名称
  confinedSpaceName?: string; // 关联有限空间名称
  associatedWorkfaces?: DeviceAssociatedWorkface[]; // 扩展多作业面/有限空间关联列表
  location: string;        // 安装位置
  floor?: string;          // 安装楼层
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  installationSite?: string;
  electricFence?: string;
}

// 4. 摄像头类型
export interface CameraDevice {
  id: string;
  seq: number;
  code: string;            // 设备编码 (如 test-003)
  name: string;            // 设备名称 (如 香烟识别摄像头)
  modelCategory: string;   // 模型类别 (如 --)
  apiUrl: string;          // API接口
  associationType?: 'global' | 'project'; // 关联模式: 全厂通用设备 | 造船项目
  projectId?: string;     // 项目ID
  project: string;         // 所属项目或全厂通用
  modelLevel?: string;    // 模型分层
  modelLevelName?: string;// 模型分层名称
  workfaceId?: string;    // 关联作业面ID (全厂通用设备)
  workfaceName?: string;  // 关联作业面名称
  confinedSpaceName?: string; // 关联有限空间名称
  associatedWorkfaces?: DeviceAssociatedWorkface[]; // 扩展多作业面/有限空间关联列表
  createdAt: string;       // 创建时间
  isStreaming: boolean;    // 推流状态 (true: 推流中, false: 停止推流)
  rtspUrl?: string;        // RTSP视频流
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  installationSite?: string;
  electricFence?: string;
}

// 激励器设备类型 (与主基站业务要素完全一致)
export interface ExciterDevice extends BaseStationDevice {}

// 初始数据：激励器
const initialExciters: ExciterDevice[] = [
  {
    id: 'EX-01',
    seq: 1,
    code: 'EX-CODE-01',
    name: '1#液货舱激励器',
    associationType: 'project',
    projectId: 'PRJ-2026-LNG01',
    project: '17.4万m³ 薄膜型大型LNG船 1号舰',
    modelLevel: 'middle',
    modelLevelName: '中舱层 (货舱上部/中层平台)',
    status: '在线',
    recycleStatus: '设备安装',
    location: '1#液货舱左舷',
    floor: '2',
    signalLossTime: 3,
    attenuationCoeff: '0',
    coverageRange: '40',
    positionX: 350.20,
    positionY: 10.10,
    positionZ: -150.40,
    installationSite: '舱内',
    auxPositioning: '是',
    electricFence: 'EF-LNG-CS01',
    lastUpdated: '2026-09-01 10:15:20',
    ipAddress: '192.168.10.151',
    macAddress: '22:6D:7E:CD:5B:E1',
    firmwareVersion: 'v1.2.0'
  },
  {
    id: 'EX-02',
    seq: 2,
    code: 'EX-CODE-02',
    name: '机舱动力区激励器',
    associationType: 'global',
    projectId: '',
    project: '全厂通用设备',
    modelLevel: 'all',
    modelLevelName: '全厂公共区域',
    workfaceId: 'WF-YARD-001',
    workfaceName: '总组装焊平台一巨型分段拼对总组面',
    status: '在线',
    recycleStatus: '设备安装',
    location: '机舱中央集控室',
    floor: '1',
    signalLossTime: 0,
    attenuationCoeff: '0',
    coverageRange: '50',
    positionX: 280.10,
    positionY: 5.40,
    positionZ: -90.20,
    installationSite: '室内',
    auxPositioning: '是',
    electricFence: 'EF-SEC-01',
    lastUpdated: '2026-09-01 11:00:00',
    ipAddress: '192.168.10.152',
    macAddress: '22:6D:7E:CD:5B:E2',
    firmwareVersion: 'v1.2.0'
  }
];

// 初始数据：主基站
const initialBaseStations: BaseStationDevice[] = [
  {
    id: 'BS-01',
    seq: 1,
    code: 'BS-SEC-01',
    name: '1#船台高精度定位主基站',
    associationType: 'global',
    projectId: '',
    project: '全厂通用设备',
    modelLevel: 'all',
    modelLevelName: '全厂公共区域',
    workfaceId: 'WF-YARD-001',
    workfaceName: '总组装焊平台一巨型分段拼对总组面',
    status: '在线',
    recycleStatus: '设备安装',
    location: '1#船台合拢区',
    floor: '',
    signalLossTime: 5,
    attenuationCoeff: '0',
    coverageRange: '50',
    positionX: 380.50,
    positionY: 0.02,
    positionZ: -260.40,
    installationSite: '室外',
    auxPositioning: '否',
    electricFence: 'EF-SEC-01',
    lastUpdated: '2026-08-29 21:19:43',
    ipAddress: '192.168.10.111',
    macAddress: '11:5D:6D:BC:4A:D7',
    firmwareVersion: 'v2.4.12'
  },
  {
    id: 'BS-02',
    seq: 2,
    code: '115D6DBC4AD7593354',
    name: '7号船台基站',
    associationType: 'project',
    projectId: 'PRJ-2026-LNG01',
    project: '17.4万m³ 薄膜型大型LNG船 1号舰',
    modelLevel: 'bottom',
    modelLevelName: '底舱层 (双层底/压载密闭舱)',
    status: '在线',
    recycleStatus: '设备安装',
    location: '2万吨船台尾段',
    floor: '5',
    signalLossTime: 0,
    attenuationCoeff: '0',
    coverageRange: '50',
    positionX: 312.50,
    positionY: 12.80,
    positionZ: -180.20,
    installationSite: '舱内',
    auxPositioning: '是',
    electricFence: 'EF-LNG-CS02',
    lastUpdated: '2026-08-29 21:17:38',
    ipAddress: '192.168.10.107',
    macAddress: '11:5D:6D:BC:33:54',
    firmwareVersion: 'v2.4.12'
  },
  {
    id: 'BS-03',
    seq: 3,
    code: '115D6DBC4AD7595354',
    name: '5（使用中）',
    associationType: 'project',
    projectId: 'PRJ-2026-BOX12',
    project: '24,000 TEU 超大型集装箱船',
    modelLevel: 'engine',
    modelLevelName: '机舱动力区 (主机/辅机与管系舱)',
    status: '离线',
    recycleStatus: '设备安装',
    location: '机电仓库',
    floor: '5',
    signalLossTime: 5,
    attenuationCoeff: '0',
    coverageRange: '50',
    positionX: 240.50,
    positionY: 4.00,
    positionZ: -110.00,
    auxPositioning: '是',
    electricFence: 'EF-BOX-CS02',
    lastUpdated: '2026-08-29 21:03:17',
    ipAddress: '192.168.10.105',
    macAddress: '11:5D:6D:BC:53:54',
    firmwareVersion: 'v2.4.10'
  },
  {
    id: 'BS-04',
    seq: 4,
    code: '115D6DBC4AD7595754',
    name: '8',
    associationType: 'global',
    projectId: '',
    project: '全厂通用设备',
    modelLevel: 'all',
    modelLevelName: '全厂公共区域',
    workfaceId: 'WF-YARD-005',
    workfaceName: '新舾装码头水上系泊调试作业面',
    status: '离线',
    recycleStatus: '临时撤场',
    location: '登船口',
    floor: '5',
    signalLossTime: 0,
    attenuationCoeff: '0',
    coverageRange: '50m',
    positionX: 190.80,
    positionY: 0.00,
    positionZ: -95.60,
    auxPositioning: '否',
    electricFence: 'EF-SEC-05',
    lastUpdated: '2026-08-29 21:05:00',
    ipAddress: '192.168.10.108',
    macAddress: '11:5D:6D:BC:57:54',
    firmwareVersion: 'v2.4.08'
  },
  {
    id: 'BS-05',
    seq: 5,
    code: '115D6DBC4AD7594A54',
    name: '13',
    associationType: 'project',
    projectId: 'PRJ-2026-TANK02',
    project: '30万吨 VLCC 超大型原油船',
    modelLevel: 'deck',
    modelLevelName: '甲板层 (主甲板/露天作业区)',
    status: '离线',
    recycleStatus: '设备安装',
    location: '4号浮动码头路口',
    floor: '5',
    signalLossTime: 19,
    attenuationCoeff: '19',
    coverageRange: '23m',
    positionX: 330.00,
    positionY: 9.00,
    positionZ: -160.00,
    auxPositioning: '是',
    electricFence: 'EF-TANK-CS01',
    lastUpdated: '2026-08-29 21:09:37',
    ipAddress: '192.168.10.113',
    macAddress: '11:5D:6D:BC:4A:54',
    firmwareVersion: 'v2.4.12'
  },
  {
    id: 'BS-06',
    seq: 6,
    code: '115D6DBC4AD7591752',
    name: '15',
    associationType: 'global',
    projectId: '',
    project: '全厂通用设备',
    workfaceId: 'WF-YARD-008',
    workfaceName: '全厂公共区域通用监管作业面',
    status: '在线',
    recycleStatus: '设备安装',
    location: '北区办公楼',
    floor: '5',
    signalLossTime: 19,
    attenuationCoeff: '19',
    coverageRange: '23m',
    positionX: 350.00,
    positionY: 0.00,
    positionZ: -200.00,
    auxPositioning: '是',
    electricFence: 'EF-SEC-08',
    lastUpdated: '2026-08-29 21:17:42',
    ipAddress: '192.168.10.115',
    macAddress: '11:5D:6D:BC:17:52',
    firmwareVersion: 'v2.4.12'
  },
  {
    id: 'BS-07',
    seq: 7,
    code: '115D6DBC4AD7595654',
    name: '14',
    associationType: 'project',
    projectId: 'PRJ-2026-LNG01',
    project: '17.4万m³ 薄膜型大型LNG船 1号舰',
    modelLevel: 'middle',
    modelLevelName: '中舱层 (货舱上部/中层平台)',
    status: '在线',
    recycleStatus: '设备安装',
    location: '一号轨道路口',
    floor: '5',
    signalLossTime: 19,
    attenuationCoeff: '19',
    coverageRange: '23m',
    positionX: 350.20,
    positionY: 10.10,
    positionZ: -150.40,
    auxPositioning: '是',
    electricFence: 'EF-LNG-CS01',
    lastUpdated: '2026-08-29 21:21:33',
    ipAddress: '192.168.10.114',
    macAddress: '11:5D:6D:BC:56:54',
    firmwareVersion: 'v2.4.12'
  },
  {
    id: 'BS-08',
    seq: 8,
    code: '115D6DBC4AD7595454',
    name: '16',
    associationType: 'project',
    projectId: 'PRJ-2026-BULK04',
    project: '82,000 DWT 卡姆萨尔型散货船',
    modelLevel: 'bridge',
    modelLevelName: '驾驶台 (上层建筑/驾控生活区)',
    status: '在线',
    recycleStatus: '设备安装',
    location: '露天专焊10T中',
    floor: '5',
    signalLossTime: 19,
    attenuationCoeff: '19',
    coverageRange: '23m',
    positionX: 280.00,
    positionY: 6.00,
    positionZ: -120.00,
    auxPositioning: '是',
    electricFence: 'EF-BULK-CS01',
    lastUpdated: '2026-08-29 21:20:01',
    ipAddress: '192.168.10.116',
    macAddress: '11:5D:6D:BC:54:54',
    firmwareVersion: 'v2.4.11'
  }
];

// 初始数据：气体探测器 (包含地图三维坐标与关联作业面/工程项目)
const initialGasDetectors: GasDetectorDevice[] = [
  { id: 'GD-01', seq: 1, createdAt: '2026-08-20 14:32:59', sn: '866833080749440', name: '机舱双燃料气体在线探头', associationType: 'project', projectId: 'PRJ-2026-LNG01', project: '17.4万m³ 薄膜型大型LNG船 1号舰', modelLevel: 'engine', modelLevelName: '机舱动力区 (主机/辅机与管系舱)', location: '517-9号船机舱', floor: '', positionX: 312.50, positionY: 12.80, positionZ: -180.20, electricFence: 'EF-LNG-CS02' },
  { id: 'GD-02', seq: 2, createdAt: '2026-08-20 14:32:46', sn: '866833080749051', name: '1#液货舱防爆四合一气体监测仪', associationType: 'project', projectId: 'PRJ-2026-LNG01', project: '17.4万m³ 薄膜型大型LNG船 1号舰', modelLevel: 'bottom', modelLevelName: '底舱层 (双层底/压载密闭舱)', location: '1#液货舱底板', floor: '', positionX: 350.20, positionY: 10.10, positionZ: -150.40, electricFence: 'EF-LNG-CS01' },
  { id: 'GD-03', seq: 3, createdAt: '2026-08-20 14:32:32', sn: '866833080749630', name: '10#箱位下部受限空间监测探头', associationType: 'project', projectId: 'PRJ-2026-BOX12', project: '24,000 TEU 超大型集装箱船', modelLevel: 'engine', modelLevelName: '机舱动力区 (主机/辅机与管系舱)', location: '平船台机舱', floor: '', positionX: 260.00, positionY: 3.50, positionZ: -140.00, electricFence: 'EF-BOX-CS01' },
  { id: 'GD-04', seq: 4, createdAt: '2026-08-20 14:32:17', sn: '866833080748954', name: '制造内场激光切割氧气浓度仪', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-006', workfaceName: '制造部内场数控激光切割与下料面', location: '预处理车间', floor: '', positionX: 450.60, positionY: 1.20, positionZ: -350.00, electricFence: 'EF-SEC-06' },
  { id: 'GD-05', seq: 5, createdAt: '2026-08-20 14:31:56', sn: '866833080749267', name: '货油舱洗舱深井可燃气体探头', associationType: 'project', projectId: 'PRJ-2026-TANK02', project: '30万吨 VLCC 超大型原油船', modelLevel: 'engine', modelLevelName: '机舱动力区 (主机/辅机与管系舱)', location: '628-7机舱', floor: '', positionX: 330.00, positionY: 9.00, positionZ: -160.00, electricFence: 'EF-TANK-CS01' },
  { id: 'GD-06', seq: 6, createdAt: '2026-08-20 14:31:41', sn: '866833080749283', name: '双层底边压载舱氧含量探头', associationType: 'project', projectId: 'PRJ-2026-TANK02', project: '30万吨 VLCC 超大型原油船', modelLevel: 'bottom', modelLevelName: '底舱层 (双层底/压载密闭舱)', location: '628-8机舱', floor: '', positionX: 310.00, positionY: 2.00, positionZ: -130.00, electricFence: 'EF-TANK-CS02' },
  { id: 'GD-07', seq: 7, createdAt: '2026-08-20 14:31:26', sn: '866833080749689', name: '艏楼压载泵舱防爆监测仪', associationType: 'project', projectId: 'PRJ-2026-LNG01', project: '17.4万m³ 薄膜型大型LNG船 1号舰', modelLevel: 'middle', modelLevelName: '中舱层 (货舱上部/中层平台)', location: '716-10机舱', floor: '', positionX: 395.00, positionY: 18.50, positionZ: -280.00, electricFence: 'EF-LNG-CS03' },
  { id: 'GD-08', seq: 8, createdAt: '2026-08-20 14:31:12', sn: '866833080909333', name: '涂装车间VOC与可燃气体检测仪', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-002', workfaceName: '5071㎡涂装车间密闭喷砂除锈特涂面', location: '涂装车间', floor: '', positionX: 410.20, positionY: 2.50, positionZ: -310.80, electricFence: 'EF-SEC-02' },
  { id: 'GD-09', seq: 9, createdAt: '2026-08-20 14:30:58', sn: '866833080749341', name: '危化品库特种气体泄漏巡检仪', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-008', workfaceName: '全厂公共区域通用监管作业面', location: '危化品仓库', floor: '', positionX: 350.00, positionY: 0.00, positionZ: -200.00, electricFence: 'EF-SEC-08' },
  { id: 'GD-10', seq: 10, createdAt: '2026-08-20 14:30:42', sn: '866833080749317', name: '散货船大舱舷侧隔舱氧量探头', associationType: 'project', projectId: 'PRJ-2026-BULK04', project: '82,000 DWT 卡姆萨尔型散货船', modelLevel: 'engine', modelLevelName: '机舱动力区 (主机/辅机与管系舱)', location: '14500-3机舱', floor: '', positionX: 280.00, positionY: 6.00, positionZ: -120.00, electricFence: 'EF-BULK-CS01' }
];

// 初始数据：声光报警器 (包含地图三维坐标与关联作业面/工程项目)
const initialAlarms: AlarmDevice[] = [
  { id: 'AL-01', seq: 1, createdAt: '2026-08-20 14:35:57', sn: '867655086345884', name: '机舱出入口缺氧联动防爆报警器', associationType: 'project', projectId: 'PRJ-2026-LNG01', project: '17.4万m³ 薄膜型大型LNG船 1号舰', modelLevel: 'engine', modelLevelName: '机舱动力区', location: '145-3机舱', floor: '', positionX: 312.50, positionY: 12.80, positionZ: -180.20, electricFence: 'EF-LNG-CS02' },
  { id: 'AL-02', seq: 2, createdAt: '2026-08-20 14:35:29', sn: '867655086341883', name: '1#舱口受限空间警戒广播器', associationType: 'project', projectId: 'PRJ-2026-LNG01', project: '17.4万m³ 薄膜型大型LNG船 1号舰', modelLevel: 'middle', modelLevelName: '中舱层', location: '519-1机舱', floor: '', positionX: 350.20, positionY: 10.10, positionZ: -150.40, electricFence: 'EF-LNG-CS01' },
  { id: 'AL-03', seq: 3, createdAt: '2026-08-20 14:35:17', sn: '867655086341560', name: '洗舱深井动火警戒声光联动器', associationType: 'project', projectId: 'PRJ-2026-TANK02', project: '30万吨 VLCC 超大型原油船', modelLevel: 'engine', modelLevelName: '机舱动力区', location: '628-7机舱', floor: '', positionX: 330.00, positionY: 9.00, positionZ: -160.00, electricFence: 'EF-TANK-CS01' },
  { id: 'AL-04', seq: 4, createdAt: '2026-08-20 14:35:05', sn: '867655085879206', name: '集配部管件焊接高分贝警报器', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-007', workfaceName: '集配部管件冷拔加工及氩弧焊接面', location: '气瓶集中存放区', floor: '', positionX: 420.00, positionY: 1.00, positionZ: -320.00, electricFence: 'EF-SEC-07' },
  { id: 'AL-05', seq: 5, createdAt: '2026-08-20 14:34:51', sn: '867655086346148', name: '总组平台一吊运防碰声光器', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-001', workfaceName: '总组装焊平台一巨型分段拼对总组面', location: '总组装焊平台一', floor: '', positionX: 380.50, positionY: 0.02, positionZ: -260.40, electricFence: 'EF-SEC-01' },
  { id: 'AL-06', seq: 6, createdAt: '2026-08-20 14:34:40', sn: '867655086344929', name: '集装箱导轨高空坠落声光告警器', associationType: 'project', projectId: 'PRJ-2026-BOX12', project: '24,000 TEU 超大型集装箱船', modelLevel: 'deck', modelLevelName: '甲板层', location: '716-10机舱', floor: '', positionX: 260.00, positionY: 3.50, positionZ: -140.00, electricFence: 'EF-BOX-CS01' },
  { id: 'AL-07', seq: 7, createdAt: '2026-08-20 14:34:27', sn: '867655085878844', name: '双层底边舱狭窄作业撤离喇叭', associationType: 'project', projectId: 'PRJ-2026-TANK02', project: '30万吨 VLCC 超大型原油船', modelLevel: 'bottom', modelLevelName: '底舱层', location: '628-8机舱', floor: '', positionX: 310.00, positionY: 2.00, positionZ: -130.00, electricFence: 'EF-TANK-CS02' },
  { id: 'AL-08', seq: 8, createdAt: '2026-08-20 14:34:14', sn: '867655086346221', name: '128船台滑道搭载警戒声光器', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-003', workfaceName: '128船台滑道搭载总装作业面', location: '128船台滑道', floor: '', positionX: 290.00, positionY: 0.05, positionZ: -180.00, electricFence: 'EF-SEC-03' },
  { id: 'AL-09', seq: 9, createdAt: '2026-08-20 14:33:59', sn: '867655086347864', name: '新舾装码头水上动火警戒器', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-005', workfaceName: '新舾装码头水上系泊调试作业面', location: '新舾装码头', floor: '', positionX: 190.80, positionY: 0.00, positionZ: -95.60, electricFence: 'EF-SEC-05' },
  { id: 'AL-10', seq: 10, createdAt: '2026-08-19 14:49:25', sn: '867655086345926', name: '涂装防爆车间溶剂超标联动器', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-002', workfaceName: '5071㎡涂装车间密闭喷砂除锈特涂面', location: '涂装车间', floor: '', positionX: 410.20, positionY: 2.50, positionZ: -310.80, electricFence: 'EF-SEC-02' }
];

// 初始数据：摄像头 (包含地图三维坐标与关联作业面/工程项目)
const initialCameras: CameraDevice[] = [
  { id: 'CAM-01', seq: 1, code: 'CAM-SEC-01', name: '总组平台一AI防爆全景球机', modelCategory: '违章吸烟与火灾检测', apiUrl: 'http://192.168.205.110:7571', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-001', workfaceName: '总组装焊平台一巨型分段拼对总组面', createdAt: '2026-06-10 16:49:35', isStreaming: true, rtspUrl: 'rtsp://192.168.205.110:554/live/smoke_01', positionX: 380.50, positionY: 0.02, positionZ: -260.40, electricFence: 'EF-SEC-01' },
  { id: 'CAM-02', seq: 2, code: 'CAM-LNG-02', name: '1#液货舱绝热合拢高点监控球机', modelCategory: '安全帽/劳保穿戴识别', apiUrl: 'http://192.168.205.110:7570', associationType: 'project', projectId: 'PRJ-2026-LNG01', project: '17.4万m³ 薄膜型大型LNG船 1号舰', modelLevel: 'middle', modelLevelName: '中舱层', createdAt: '2026-05-13 13:47:20', isStreaming: true, rtspUrl: 'rtsp://192.168.205.110:554/live/helmet_01', positionX: 350.20, positionY: 10.10, positionZ: -150.40, electricFence: 'EF-LNG-CS01' },
  { id: 'CAM-03', seq: 3, code: 'CAM-SEC-03', name: '128船台滑道搭载高清监控枪机', modelCategory: '手机违规使用抓拍', apiUrl: 'http://192.168.205.110:7572', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-003', workfaceName: '128船台滑道搭载总装作业面', createdAt: '2026-05-13 13:47:04', isStreaming: true, rtspUrl: 'rtsp://192.168.205.110:554/live/phone_01', positionX: 290.00, positionY: 0.05, positionZ: -180.00, electricFence: 'EF-SEC-03' },
  { id: 'CAM-04', seq: 4, code: 'CAM-BOX-04', name: '10#箱位下部受限空间红外布控球', modelCategory: '未穿戴防护检测', apiUrl: 'http://192.168.205.110:7573', associationType: 'project', projectId: 'PRJ-2026-BOX12', project: '24,000 TEU 超大型集装箱船', modelLevel: 'bottom', modelLevelName: '底舱层', createdAt: '2026-05-10 11:20:15', isStreaming: true, rtspUrl: 'rtsp://192.168.205.110:554/live/vest_01', positionX: 260.00, positionY: 3.50, positionZ: -140.00, electricFence: 'EF-BOX-CS01' },
  { id: 'CAM-05', seq: 5, code: 'CAM-PAINT-05', name: '涂装车间密闭防爆烟火识别摄像机', modelCategory: '火灾烟雾识别', apiUrl: 'http://192.168.205.110:7574', associationType: 'global', projectId: '', project: '全厂通用设备', workfaceId: 'WF-YARD-002', workfaceName: '5071㎡涂装车间密闭喷砂除锈特涂面', createdAt: '2026-04-28 09:30:00', isStreaming: false, rtspUrl: 'rtsp://192.168.205.110:554/live/fire_01', positionX: 410.20, positionY: 2.50, positionZ: -310.80, electricFence: 'EF-SEC-02' }
];

export function DeviceManagement() {
  // 当前激活的设备 Tab 页 (主基站 | 气体探测器 | 声光报警器 | 摄像头)
  const [activeTab, setActiveTab] = useState<DeviceTab>('main_station');

  // 数据列表状态
  const [baseStations, setBaseStations] = useState<BaseStationDevice[]>(initialBaseStations);
  const [exciters, setExciters] = useState<ExciterDevice[]>(initialExciters);
  const [gasDetectors, setGasDetectors] = useState<GasDetectorDevice[]>(initialGasDetectors);
  const [alarms, setAlarms] = useState<AlarmDevice[]>(initialAlarms);
  const [cameras, setCameras] = useState<CameraDevice[]>(initialCameras);

  // 1. 搜索条件
  const [searchCode, setSearchCode] = useState<string>('');        // 设备编码/SN/设备名称
  const [selectedProject, setSelectedProject] = useState<string>(''); // 所属项目
  const [selectedModelLevel, setSelectedModelLevel] = useState<string>(''); // 模型分层
  const [startDate, setStartDate] = useState<string>('');          // 开始日期（摄像头专用）
  const [endDate, setEndDate] = useState<string>('');            // 结束日期（摄像头专用）

  // 生效的查询条件
  const [activeQuery, setActiveQuery] = useState({
    code: '',
    project: '',
    modelLevel: '',
    startDate: '',
    endDate: ''
  });

  // 模态框与选中的设备
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | 'preview' | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);
  const [mapViewDevice, setMapViewDevice] = useState<any | null>(null);

  // 表单校验与提示状态
  const [formError, setFormError] = useState<string | null>(null);

  // 表单临时编辑状态
  const [formFields, setFormFields] = useState<Record<string, any>>({});

  // 实时同步加载系统作业面数据
  const [storedWorkfaces, setStoredWorkfaces] = useState<WorkfaceRecord[]>(() => {
    try {
      return getStoredWorkfaces();
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        setStoredWorkfaces(getStoredWorkfaces());
      } catch {}
    };
    window.addEventListener('workfaces_updated', handleUpdate);
    return () => window.removeEventListener('workfaces_updated', handleUpdate);
  }, []);

  // 全厂作业面候选库 (整合系统存储与内置全厂作业面)
  const allYardOptions = useMemo(() => {
    const fromStorage = storedWorkfaces
      .filter(w => w.belongingType === 'yard')
      .map(w => ({
        id: w.id,
        code: w.code,
        name: w.name,
        zone: w.yardZoneName || '总装焊与分段建造区',
        subArea: w.yardSubAreaName || '标准工位',
        safetyOfficer: w.safetyOfficer || '',
        fenceCode: `EF-${w.code?.replace('WF-', '') || 'SEC-01'}`
      }));
    const seen = new Set(fromStorage.map(y => y.id));
    const merged = [...fromStorage];
    YARD_WORKFACE_OPTIONS.forEach(opt => {
      if (!seen.has(opt.id)) {
        merged.push(opt);
      }
    });
    return merged;
  }, [storedWorkfaces]);

  // 模态框中动态增删关联作业面/有限空间的表单状态
  const [isAddingAssoc, setIsAddingAssoc] = useState<boolean>(false);
  const [newAssocType, setNewAssocType] = useState<'workface' | 'confinedSpace'>('workface');
  const [newYardWfId, setNewYardWfId] = useState<string>(YARD_WORKFACE_OPTIONS[0].id);
  const [newPrjId, setNewPrjId] = useState<string>(MOCK_PROJECTS[0].id);
  const [newModelLevel, setNewModelLevel] = useState<string>(MODEL_LAYER_OPTIONS[1].id);
  const [newSpaceName, setNewSpaceName] = useState<string>('');

  // 添加关联作业面/有限空间
  const handleAddAssociation = () => {
    const currentAssocs: DeviceAssociatedWorkface[] = formFields.associatedWorkfaces || [];

    if (newAssocType === 'workface') {
      const matched = allYardOptions.find(w => w.id === newYardWfId) || allYardOptions[0];
      if (currentAssocs.some(a => a.type === 'workface' && (a.workfaceId === matched.id || a.name === matched.name))) {
        setFormError(`作业面【${matched.name}】已在关联列表中，请勿重复添加`);
        return;
      }
      const newAssoc: DeviceAssociatedWorkface = {
        id: `assoc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'workface',
        workfaceId: matched.id,
        name: matched.name,
        code: matched.code,
        yardZone: matched.zone,
        yardSubArea: matched.subArea,
        electricFence: matched.fenceCode || 'EF-SEC-01'
      };
      const updated = [...currentAssocs, newAssoc];
      setFormFields({
        ...formFields,
        associatedWorkfaces: updated,
        ...(updated.length === 1 ? {
          associationType: 'global',
          project: '全厂通用设备',
          projectId: '',
          modelLevel: 'all',
          modelLevelName: '全厂公共区域',
          workfaceId: newAssoc.workfaceId,
          workfaceName: newAssoc.name,
          electricFence: newAssoc.electricFence
        } : {})
      });
    } else {
      const prj = MOCK_PROJECTS.find(p => p.id === newPrjId) || MOCK_PROJECTS[0];
      const layerOpt = MODEL_LAYER_OPTIONS.find(l => l.id === newModelLevel) || MODEL_LAYER_OPTIONS[1];
      const spaceName = newSpaceName.trim() || `${layerOpt.name}密闭舱室作业面`;

      if (currentAssocs.some(a => a.type === 'confinedSpace' && a.projectId === prj.id && a.name === spaceName)) {
        setFormError(`有限空间【${spaceName}】已在关联列表中，请勿重复添加`);
        return;
      }

      const newAssoc: DeviceAssociatedWorkface = {
        id: `assoc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'confinedSpace',
        name: spaceName,
        code: `CS-${prj.id.slice(-4)}-0${currentAssocs.length + 1}`,
        projectId: prj.id,
        projectName: prj.name,
        modelLevel: layerOpt.id,
        modelLevelName: layerOpt.fullName,
        electricFence: `EF-${prj.id.slice(-5)}-CS0${currentAssocs.length + 1}`
      };

      const updated = [...currentAssocs, newAssoc];
      setFormFields({
        ...formFields,
        associatedWorkfaces: updated,
        ...(updated.length === 1 ? {
          associationType: 'project',
          projectId: newAssoc.projectId,
          project: newAssoc.projectName,
          modelLevel: newAssoc.modelLevel,
          modelLevelName: newAssoc.modelLevelName,
          confinedSpaceName: newAssoc.name,
          electricFence: newAssoc.electricFence
        } : {})
      });
      setNewSpaceName('');
    }

    setFormError(null);
    setIsAddingAssoc(false);
  };

  // 移除关联作业面/有限空间
  const handleRemoveAssociation = (assocId: string) => {
    const currentAssocs: DeviceAssociatedWorkface[] = formFields.associatedWorkfaces || [];
    const updated = currentAssocs.filter(a => a.id !== assocId);
    
    // 更新首项基准属性
    const nextPrimary = updated[0];
    let syncFields: Record<string, any> = {};
    if (nextPrimary) {
      if (nextPrimary.type === 'workface') {
        syncFields = {
          associationType: 'global',
          project: '全厂通用设备',
          projectId: '',
          modelLevel: 'all',
          modelLevelName: '全厂公共区域',
          workfaceId: nextPrimary.workfaceId,
          workfaceName: nextPrimary.name,
          electricFence: nextPrimary.electricFence
        };
      } else {
        syncFields = {
          associationType: 'project',
          projectId: nextPrimary.projectId,
          project: nextPrimary.projectName,
          modelLevel: nextPrimary.modelLevel,
          modelLevelName: nextPrimary.modelLevelName,
          confinedSpaceName: nextPrimary.name,
          electricFence: nextPrimary.electricFence
        };
      }
    }

    setFormFields({
      ...formFields,
      associatedWorkfaces: updated,
      ...syncFields
    });
  };

  // 顶部筛选与表单用到的全量项目列表
  const projectOptions = useMemo(() => {
    return [
      '全厂通用设备',
      ...MOCK_PROJECTS.map(p => p.name)
    ];
  }, []);

  // 点击“查询/搜索”
  const handleSearch = () => {
    setActiveQuery({
      code: searchCode.trim(),
      project: selectedProject,
      modelLevel: selectedModelLevel,
      startDate,
      endDate
    });
  };

  // 点击“重置”
  const handleReset = () => {
    setSearchCode('');
    setSelectedProject('');
    setSelectedModelLevel('');
    setStartDate('');
    setEndDate('');
    setActiveQuery({
      code: '',
      project: '',
      modelLevel: '',
      startDate: '',
      endDate: ''
    });
  };

  // 过滤后的主基站数据
  const filteredBaseStations = useMemo(() => {
    return baseStations.filter(d => {
      const matchCode = !activeQuery.code || 
        d.code.toLowerCase().includes(activeQuery.code.toLowerCase()) || 
        d.name.toLowerCase().includes(activeQuery.code.toLowerCase());
      const matchProject = !activeQuery.project || 
        d.project === activeQuery.project || 
        d.projectId === activeQuery.project ||
        d.associatedWorkfaces?.some(a => a.projectName === activeQuery.project || a.projectId === activeQuery.project);
      const matchModelLevel = !activeQuery.modelLevel || 
        d.modelLevel === activeQuery.modelLevel ||
        d.associatedWorkfaces?.some(a => a.modelLevel === activeQuery.modelLevel);
      return matchCode && matchProject && matchModelLevel;
    });
  }, [baseStations, activeQuery]);

  // 过滤后的激励器数据
  const filteredExciters = useMemo(() => {
    return exciters.filter(d => {
      const matchCode = !activeQuery.code || 
        d.code.toLowerCase().includes(activeQuery.code.toLowerCase()) || 
        d.name.toLowerCase().includes(activeQuery.code.toLowerCase());
      const matchProject = !activeQuery.project || 
        d.project === activeQuery.project || 
        d.projectId === activeQuery.project ||
        d.associatedWorkfaces?.some(a => a.projectName === activeQuery.project || a.projectId === activeQuery.project);
      const matchModelLevel = !activeQuery.modelLevel || 
        d.modelLevel === activeQuery.modelLevel ||
        d.associatedWorkfaces?.some(a => a.modelLevel === activeQuery.modelLevel);
      return matchCode && matchProject && matchModelLevel;
    });
  }, [exciters, activeQuery]);

  // 过滤后的气体探测器数据
  const filteredGasDetectors = useMemo(() => {
    return gasDetectors.filter(d => {
      const matchSn = !activeQuery.code || 
        d.sn.toLowerCase().includes(activeQuery.code.toLowerCase()) || 
        d.name.toLowerCase().includes(activeQuery.code.toLowerCase());
      const matchProject = !activeQuery.project || 
        d.project === activeQuery.project || 
        d.projectId === activeQuery.project ||
        d.associatedWorkfaces?.some(a => a.projectName === activeQuery.project || a.projectId === activeQuery.project);
      const matchModelLevel = !activeQuery.modelLevel || 
        d.modelLevel === activeQuery.modelLevel ||
        d.associatedWorkfaces?.some(a => a.modelLevel === activeQuery.modelLevel);
      return matchSn && matchProject && matchModelLevel;
    });
  }, [gasDetectors, activeQuery]);

  // 过滤后的声光报警器数据
  const filteredAlarms = useMemo(() => {
    return alarms.filter(d => {
      const matchSn = !activeQuery.code || 
        d.sn.toLowerCase().includes(activeQuery.code.toLowerCase()) || 
        d.name.toLowerCase().includes(activeQuery.code.toLowerCase());
      const matchProject = !activeQuery.project || 
        d.project === activeQuery.project || 
        d.projectId === activeQuery.project ||
        d.associatedWorkfaces?.some(a => a.projectName === activeQuery.project || a.projectId === activeQuery.project);
      const matchModelLevel = !activeQuery.modelLevel || 
        d.modelLevel === activeQuery.modelLevel ||
        d.associatedWorkfaces?.some(a => a.modelLevel === activeQuery.modelLevel);
      return matchSn && matchProject && matchModelLevel;
    });
  }, [alarms, activeQuery]);

  // 过滤后的摄像头数据
  const filteredCameras = useMemo(() => {
    return cameras.filter(d => {
      const matchName = !activeQuery.code || 
        d.name.toLowerCase().includes(activeQuery.code.toLowerCase()) || 
        d.code.toLowerCase().includes(activeQuery.code.toLowerCase());
      const matchProject = !activeQuery.project || 
        d.project === activeQuery.project || 
        d.projectId === activeQuery.project ||
        d.associatedWorkfaces?.some(a => a.projectName === activeQuery.project || a.projectId === activeQuery.project);
      const matchModelLevel = !activeQuery.modelLevel || 
        d.modelLevel === activeQuery.modelLevel ||
        d.associatedWorkfaces?.some(a => a.modelLevel === activeQuery.modelLevel);
      let matchDate = true;
      if (activeQuery.startDate && d.createdAt < activeQuery.startDate) matchDate = false;
      if (activeQuery.endDate && d.createdAt > activeQuery.endDate + ' 23:59:59') matchDate = false;
      return matchName && matchProject && matchModelLevel && matchDate;
    });
  }, [cameras, activeQuery]);

  // 切换分类 Tab
  const handleTabChange = (tab: DeviceTab) => {
    setActiveTab(tab);
    handleReset();
  };

  // 切换推流状态
  const toggleCameraStreaming = (camId: string) => {
    setCameras(prev => prev.map(c => c.id === camId ? { ...c, isStreaming: !c.isStreaming } : c));
  };

  // 打开新增模态框
  const handleOpenCreate = () => {
    setFormError(null);
    setIsAddingAssoc(false);
    setNewSpaceName('');

    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const defaultAssociation = 'project';
    const defaultProjId = MOCK_PROJECTS[0].id;
    const defaultProjName = MOCK_PROJECTS[0].name;
    const defaultWf = allYardOptions[0] || YARD_WORKFACE_OPTIONS[0];

    const initialAssocs: DeviceAssociatedWorkface[] = [{
      id: `assoc-${Date.now()}-1`,
      type: 'confinedSpace',
      name: '1#液货舱绝热合拢面',
      code: 'WF-LNG-01',
      projectId: defaultProjId,
      projectName: defaultProjName,
      modelLevel: 'middle',
      modelLevelName: MODEL_LAYER_OPTIONS[1].fullName,
      electricFence: 'EF-LNG-CS01'
    }];

    const commonBase = {
      associationType: defaultAssociation,
      projectId: defaultProjId,
      project: defaultProjName,
      modelLevel: 'middle',
      modelLevelName: MODEL_LAYER_OPTIONS[1].fullName,
      workfaceId: defaultWf.id,
      workfaceName: defaultWf.name,
      confinedSpaceName: '1#液货舱绝热合拢面',
      associatedWorkfaces: initialAssocs,
      positionX: 350.20,
      positionY: 10.10,
      positionZ: -150.40,
      electricFence: 'EF-LNG-CS01',
      installationSite: '舱内'
    };

    if (activeTab === 'main_station' || activeTab === 'exciter') {
      setFormFields({
        ...commonBase,
        code: activeTab === 'exciter' ? `EX-DEV-${Date.now().toString().slice(-4)}` : `BS-DEV-${Date.now().toString().slice(-4)}`,
        name: activeTab === 'exciter' ? '1#液货舱激励器' : '1#液货舱主基站',
        status: '在线',
        location: '1#液货舱左舷',
        floor: '2',
        recycleStatus: '设备安装',
        signalLossTime: 5,
        attenuationCoeff: '0',
        coverageRange: '50',
        auxPositioning: '是'
      });
    } else if (activeTab === 'gas_detector') {
      const randomSn = '866833080' + Math.floor(100050 + Math.random() * 899900);
      setFormFields({
        ...commonBase,
        createdAt: timeStr,
        sn: randomSn,
        name: '液货舱四合一在线环境监测探头',
        location: '1#液货舱合拢面底部',
        floor: '2'
      });
    } else if (activeTab === 'alarm') {
      const randomSn = '867655086' + Math.floor(100050 + Math.random() * 899900);
      setFormFields({
        ...commonBase,
        createdAt: timeStr,
        sn: randomSn,
        name: '应急预警防爆声光器',
        location: '1#液货舱进出卡口',
        floor: '2'
      });
    } else if (activeTab === 'camera') {
      setFormFields({
        ...commonBase,
        code: `CAM-AI-${1000 + cameras.length + 1}`,
        name: '人员出入AI识别布控球',
        modelCategory: '安全帽/劳保穿戴识别',
        apiUrl: `http://192.168.205.110:${7570 + cameras.length}`,
        createdAt: timeStr,
        isStreaming: true,
        rtspUrl: `rtsp://192.168.205.110:554/live/cam_${cameras.length + 1}`,
        location: '1#液货舱舱口平台'
      });
    }
    setModalMode('create');
  };

  // 打开编辑模态框
  const handleOpenEdit = (item: any) => {
    setFormError(null);
    setIsAddingAssoc(false);
    setNewSpaceName('');
    setSelectedDevice(item);

    const isGlobal = item.associationType === 'global' || item.project === '全厂通用设备';
    const targetPrjId = item.projectId || (MOCK_PROJECTS.find(p => p.name === item.project)?.id || MOCK_PROJECTS[0].id);
    const targetPrjName = item.project || (isGlobal ? '全厂通用设备' : MOCK_PROJECTS[0].name);

    let initialAssocs: DeviceAssociatedWorkface[] = [];
    if (item.associatedWorkfaces && Array.isArray(item.associatedWorkfaces) && item.associatedWorkfaces.length > 0) {
      initialAssocs = item.associatedWorkfaces.map((a: any) => ({ ...a }));
    } else {
      if (isGlobal) {
        const matchedWf = allYardOptions.find(w => w.id === item.workfaceId || w.name === item.workfaceName) || allYardOptions[0];
        initialAssocs = [{
          id: `assoc-${Date.now()}-1`,
          type: 'workface',
          workfaceId: matchedWf.id,
          name: item.workfaceName || matchedWf.name,
          code: matchedWf.code,
          yardZone: matchedWf.zone,
          yardSubArea: matchedWf.subArea,
          electricFence: item.electricFence || matchedWf.fenceCode
        }];
      } else {
        const prj = MOCK_PROJECTS.find(p => p.id === item.projectId || p.name === item.project) || MOCK_PROJECTS[0];
        const layerOpt = getLayerOption(item.modelLevel) || MODEL_LAYER_OPTIONS[1];
        initialAssocs = [{
          id: `assoc-${Date.now()}-1`,
          type: 'confinedSpace',
          name: item.confinedSpaceName || `${layerOpt.name}密闭舱室作业面`,
          code: `CS-${prj.id.slice(-4)}-01`,
          projectId: prj.id,
          projectName: prj.name,
          modelLevel: layerOpt.id,
          modelLevelName: layerOpt.fullName,
          electricFence: item.electricFence || 'EF-LNG-CS01'
        }];
      }
    }

    setFormFields({
      ...item,
      associationType: isGlobal ? 'global' : 'project',
      projectId: isGlobal ? '' : targetPrjId,
      project: targetPrjName,
      modelLevel: item.modelLevel || 'middle',
      modelLevelName: item.modelLevelName || getLayerOption(item.modelLevel)?.fullName || MODEL_LAYER_OPTIONS[1].fullName,
      workfaceId: item.workfaceId || (isGlobal ? allYardOptions[0]?.id : undefined),
      workfaceName: item.workfaceName || (isGlobal ? allYardOptions[0]?.name : undefined),
      confinedSpaceName: item.confinedSpaceName || (initialAssocs.find(a => a.type === 'confinedSpace')?.name || ''),
      associatedWorkfaces: initialAssocs,
      code: item.code ?? '',
      name: item.name ?? '',
      location: item.location ?? '',
      floor: item.floor ?? '',
      recycleStatus: item.recycleStatus ?? '设备安装',
      signalLossTime: item.signalLossTime ?? 5,
      attenuationCoeff: item.attenuationCoeff ?? '0',
      coverageRange: item.coverageRange ?? '50',
      positionX: item.positionX ?? 350.20,
      positionY: item.positionY ?? 10.10,
      positionZ: item.positionZ ?? -150.40,
      installationSite: item.installationSite ?? '舱内',
      auxPositioning: item.auxPositioning ?? '否',
      electricFence: item.electricFence || (isGlobal ? 'EF-SEC-01' : 'EF-LNG-01'),
      sn: item.sn ?? '',
      modelCategory: item.modelCategory ?? '--',
      apiUrl: item.apiUrl ?? '',
      rtspUrl: item.rtspUrl ?? ''
    });
    setModalMode('edit');
  };

  // 打开详情模态框
  const handleOpenDetail = (item: any) => {
    setSelectedDevice(item);
    setModalMode('detail');
  };

  // 保存新增或修改
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 校验三维坐标是否为空 (当变更关联造船工程项目或船型分层时坐标会被清空为 null，若未重新在地图上采集则做为空判断)
    const isCoordsEmpty = 
      formFields.positionX === null || formFields.positionX === undefined || formFields.positionX === '' ||
      formFields.positionY === null || formFields.positionY === undefined || formFields.positionY === '' ||
      formFields.positionZ === null || formFields.positionZ === undefined || formFields.positionZ === '' ||
      isNaN(Number(formFields.positionX)) || isNaN(Number(formFields.positionY)) || isNaN(Number(formFields.positionZ));

    if (isCoordsEmpty) {
      setFormError('⚠️ 关联造船工程项目或船型分层变更后坐标已清空，需要重新采集坐标信息！请点击“地图添加/更新关联 (坐标)”在地图上进行定位采集。');
      return;
    }
    
    // 计算最终关联模式与造船项目（以首个关联项为基准，兼顾系统全局联动）
    const finalAssocs: DeviceAssociatedWorkface[] = formFields.associatedWorkfaces || [];

    let assocType: 'global' | 'project' = 'global';
    let finalProjectId = '';
    let finalProjectName = '全厂通用设备';
    let finalModelLevel = 'all';
    let finalModelLevelName = '全厂公共区域';
    let finalWorkfaceId: string | undefined = undefined;
    let finalWorkfaceName: string | undefined = undefined;
    let finalConfinedSpaceName: string | undefined = undefined;
    let finalElectricFence = 'EF-SEC-01';

    if (finalAssocs.length > 0) {
      const primary = finalAssocs[0];
      if (primary.type === 'workface') {
        assocType = 'global';
        finalProjectId = '';
        finalProjectName = '全厂通用设备';
        finalModelLevel = 'all';
        finalModelLevelName = '全厂公共区域';
        finalWorkfaceId = primary.workfaceId;
        finalWorkfaceName = primary.name;
        finalElectricFence = primary.electricFence || 'EF-SEC-01';
      } else {
        assocType = 'project';
        finalProjectId = primary.projectId || MOCK_PROJECTS[0].id;
        finalProjectName = primary.projectName || MOCK_PROJECTS[0].name;
        finalModelLevel = primary.modelLevel || 'middle';
        finalModelLevelName = primary.modelLevelName || MODEL_LAYER_OPTIONS[1].fullName;
        finalWorkfaceId = primary.workfaceId;
        finalWorkfaceName = primary.name;
        finalConfinedSpaceName = primary.name;
        finalElectricFence = primary.electricFence || 'EF-LNG-CS01';
      }
    } else {
      assocType = formFields.associationType || (formFields.project === '全厂通用设备' ? 'global' : 'project');
      const isGlobal = assocType === 'global';
      if (isGlobal) {
        const matchedWf = allYardOptions.find(w => w.id === formFields.workfaceId) || allYardOptions[0];
        finalWorkfaceId = matchedWf.id;
        finalWorkfaceName = matchedWf.name;
        finalElectricFence = formFields.electricFence || 'EF-SEC-01';
      } else {
        const selectedPrj = MOCK_PROJECTS.find(p => p.id === formFields.projectId) || 
                            MOCK_PROJECTS.find(p => p.name === formFields.project) || 
                            MOCK_PROJECTS[0];
        finalProjectId = selectedPrj.id;
        finalProjectName = selectedPrj.name;
        const layerOpt = getLayerOption(formFields.modelLevel) || MODEL_LAYER_OPTIONS[0];
        finalModelLevel = layerOpt.id;
        finalModelLevelName = layerOpt.fullName;
        finalElectricFence = formFields.electricFence || 'EF-PRJ-01';
      }
    }

    if (activeTab === 'main_station' || activeTab === 'exciter') {
      const setList = activeTab === 'main_station' ? setBaseStations : setExciters;
      const listData = activeTab === 'main_station' ? baseStations : exciters;
      const prefix = activeTab === 'main_station' ? 'BS' : 'EX';
      if (modalMode === 'create') {
        const newItem: BaseStationDevice = {
          id: `${prefix}-${Date.now().toString().slice(-4)}`,
          seq: listData.length + 1,
          code: formFields.code || '',
          name: formFields.name || '',
          associationType: assocType,
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          status: formFields.status || '在线',
          recycleStatus: formFields.recycleStatus || '设备安装',
          location: formFields.location || '测试',
          floor: formFields.floor || '',
          signalLossTime: formFields.signalLossTime ?? 5,
          attenuationCoeff: formFields.attenuationCoeff ?? '0',
          coverageRange: formFields.coverageRange ?? '50',
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          installationSite: formFields.installationSite || '舱内',
          auxPositioning: formFields.auxPositioning || '否',
          electricFence: finalElectricFence,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19),
          ipAddress: `192.168.10.${100 + listData.length}`,
          macAddress: `11:5D:6D:BC:${Math.floor(10+Math.random()*89)}:${Math.floor(10+Math.random()*89)}`,
          firmwareVersion: 'v2.4.12'
        };
        setList([newItem, ...listData]);
      } else if (modalMode === 'edit' && selectedDevice) {
        setList(prev => prev.map(d => d.id === selectedDevice.id ? { 
          ...d, 
          ...formFields, 
          associationType: assocType, 
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          installationSite: formFields.installationSite || '舱内',
          electricFence: finalElectricFence
        } : d));
      }
    } else if (activeTab === 'gas_detector') {
      if (modalMode === 'create') {
        const newItem: GasDetectorDevice = {
          id: `GD-${Date.now().toString().slice(-4)}`,
          seq: gasDetectors.length + 1,
          createdAt: formFields.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
          sn: formFields.sn || '',
          name: formFields.name || formFields.sn || '',
          associationType: assocType,
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          location: formFields.location || '',
          floor: formFields.floor || '',
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          installationSite: formFields.installationSite || '舱内',
          electricFence: finalElectricFence
        };
        setGasDetectors([newItem, ...gasDetectors]);
      } else if (modalMode === 'edit' && selectedDevice) {
        setGasDetectors(prev => prev.map(d => d.id === selectedDevice.id ? { 
          ...d, 
          ...formFields, 
          associationType: assocType, 
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          electricFence: finalElectricFence
        } : d));
      }
    } else if (activeTab === 'alarm') {
      if (modalMode === 'create') {
        const newItem: AlarmDevice = {
          id: `AL-${Date.now().toString().slice(-4)}`,
          seq: alarms.length + 1,
          createdAt: formFields.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
          sn: formFields.sn || '',
          name: formFields.name || formFields.sn || '',
          associationType: assocType,
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          location: formFields.location || '',
          floor: formFields.floor || '',
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          installationSite: formFields.installationSite || '舱内',
          electricFence: finalElectricFence
        };
        setAlarms([newItem, ...alarms]);
      } else if (modalMode === 'edit' && selectedDevice) {
        setAlarms(prev => prev.map(d => d.id === selectedDevice.id ? { 
          ...d, 
          ...formFields, 
          associationType: assocType, 
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          electricFence: finalElectricFence
        } : d));
      }
    } else if (activeTab === 'camera') {
      if (modalMode === 'create') {
        const newItem: CameraDevice = {
          id: `CAM-${Date.now().toString().slice(-4)}`,
          seq: cameras.length + 1,
          code: formFields.code || '',
          name: formFields.name || '',
          modelCategory: formFields.modelCategory || '--',
          apiUrl: formFields.apiUrl || '',
          associationType: assocType,
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          createdAt: formFields.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
          isStreaming: formFields.isStreaming !== undefined ? formFields.isStreaming : true,
          rtspUrl: formFields.rtspUrl || '',
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          installationSite: formFields.installationSite || '舱内',
          electricFence: finalElectricFence
        };
        setCameras([newItem, ...cameras]);
      } else if (modalMode === 'edit' && selectedDevice) {
        setCameras(prev => prev.map(d => d.id === selectedDevice.id ? { 
          ...d, 
          ...formFields, 
          associationType: assocType, 
          projectId: finalProjectId,
          project: finalProjectName,
          modelLevel: finalModelLevel,
          modelLevelName: finalModelLevelName,
          workfaceId: finalWorkfaceId,
          workfaceName: finalWorkfaceName,
          confinedSpaceName: finalConfinedSpaceName,
          associatedWorkfaces: finalAssocs,
          positionX: Number(formFields.positionX ?? 350.20),
          positionY: Number(formFields.positionY ?? 10.10),
          positionZ: Number(formFields.positionZ ?? -150.40),
          electricFence: finalElectricFence
        } : d));
      }
    }
    setModalMode(null);
    setSelectedDevice(null);
  };

  // 执行删除操作
  const confirmDelete = () => {
    if (!deleteTargetId) return;
    if (activeTab === 'gas_detector') {
      setGasDetectors(prev => prev.filter(d => d.id !== deleteTargetId));
    } else if (activeTab === 'alarm') {
      setAlarms(prev => prev.filter(d => d.id !== deleteTargetId));
    } else if (activeTab === 'camera') {
      setCameras(prev => prev.filter(d => d.id !== deleteTargetId));
    } else if (activeTab === 'main_station') {
      setBaseStations(prev => prev.filter(d => d.id !== deleteTargetId));
    } else if (activeTab === 'exciter') {
      setExciters(prev => prev.filter(d => d.id !== deleteTargetId));
    }
    setDeleteTargetId(null);
    setModalMode(null);
    setSelectedDevice(null);
  };

  // 表格单元格渲染器 1：厂区通用 / 关联项目 (不再显示作业面信息)
  const renderProjectCell = (device: {
    associationType?: 'global' | 'project';
    projectId?: string;
    project: string;
    workfaceName?: string;
  }) => {
    const isGlobal = device.associationType === 'global' || device.project === '全厂通用设备';
    if (isGlobal) {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            🏢 全厂通用
          </span>
        </div>
      );
    }

    const fullName = `${device.projectId ? '[' + device.projectId + '] ' : ''}${device.project}`;

    return (
      <div className="flex flex-col items-center gap-1 max-w-[190px] mx-auto">
        <div 
          className="flex items-center justify-center gap-1.5 max-w-[180px] mx-auto overflow-hidden cursor-default" 
          title={fullName}
        >
          <Ship className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          {device.projectId && (
            <span className="font-mono text-sky-700 font-bold text-[10px] bg-sky-100/80 px-1 py-0.2 rounded shrink-0">
              {device.projectId}
            </span>
          )}
          <span className="truncate text-slate-800 font-medium text-xs">{device.project}</span>
        </div>
      </div>
    );
  };

  // 表格单元格渲染器 2：船型分层
  const renderLayerCell = (device: {
    associationType?: 'global' | 'project';
    project: string;
    modelLevel?: string;
    modelLevelName?: string;
  }) => {
    const isGlobal = device.associationType === 'global' || device.project === '全厂通用设备';
    if (isGlobal) {
      return <span className="text-slate-400 font-mono text-xs">-</span>;
    }

    const layer = getLayerOption(device.modelLevel);
    if (layer) {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${layer.badgeBg} ${layer.badgeText} ${layer.badgeBorder}`}>
          <Layers className="w-3 h-3 shrink-0" />
          <span>{layer.name}</span>
        </span>
      );
    }

    if (device.modelLevelName) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Layers className="w-3 h-3" />
          <span>{device.modelLevelName}</span>
        </span>
      );
    }

    return <span className="text-slate-400 font-mono text-xs">-</span>;
  };

  return (
    <div className="flex flex-col gap-3 h-full bg-slate-50/50 p-1 font-sans text-slate-800">
      
      {/* 1. 顶部设备类型 Tab 切换栏 */}
      <div className="bg-white border border-slate-200/90 rounded-lg px-4 shadow-2xs flex items-center">
        <div className="flex items-center gap-8 border-b-0 text-sm font-medium">
          {/* 选项卡 1: 主基站 */}
          <button
            onClick={() => handleTabChange('main_station')}
            className={`py-3 px-1.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'main_station'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>主基站</span>
          </button>

          {/* 选项卡: 激励器 */}
          <button
            onClick={() => handleTabChange('exciter')}
            className={`py-3 px-1.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'exciter'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>激励器</span>
          </button>

          {/* 选项卡 2: 气体探测器 */}
          <button
            onClick={() => handleTabChange('gas_detector')}
            className={`py-3 px-1.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'gas_detector'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>气体探测器</span>
          </button>

          {/* 选项卡 3: 声光报警器 */}
          <button
            onClick={() => handleTabChange('alarm')}
            className={`py-3 px-1.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'alarm'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>声光报警器</span>
          </button>

          {/* 选项卡 4: 摄像头 */}
          <button
            onClick={() => handleTabChange('camera')}
            className={`py-3 px-1.5 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'camera'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>摄像头</span>
          </button>
        </div>
      </div>

      {/* 2. 顶部查询与筛选面板 */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-5 text-xs text-slate-700">
          
          {/* 条件 1：编码/SN/设备名称 */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium whitespace-nowrap">
              {activeTab === 'main_station' && '设备编码'}
              {activeTab === 'exciter' && '设备编码'}
              {activeTab === 'gas_detector' && '设备SN'}
              {activeTab === 'alarm' && '设备SN'}
              {activeTab === 'camera' && '设备名称'}
            </span>
            <input 
              type="text" 
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                activeTab === 'main_station' ? '请输入设备编码' :
                activeTab === 'exciter' ? '请输入设备编码' :
                activeTab === 'gas_detector' ? '请输入设备SN' :
                activeTab === 'alarm' ? '请输入设备SN' : '请输入设备名称'
              }
              className="w-48 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all"
            />
          </div>

          {/* 条件 2：所属项目 */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium whitespace-nowrap">所属项目</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-48 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all cursor-pointer"
            >
              <option value="">全部造船项目</option>
              {projectOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* 条件 3：模型分层（新增精准分层筛选） */}
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium whitespace-nowrap">模型分层</span>
            <select
              value={selectedModelLevel}
              onChange={(e) => setSelectedModelLevel(e.target.value)}
              className="w-48 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all cursor-pointer"
            >
              <option value="">全部模型分层</option>
              {MODEL_LAYER_OPTIONS.map(l => (
                <option key={l.id} value={l.id}>
                  📐 {l.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* 条件 4：创建时间（摄像头Tab专属） */}
          {activeTab === 'camera' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium whitespace-nowrap">创建时间</span>
              <div className="flex items-center border border-slate-300 rounded px-2 py-1 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs text-slate-700 outline-none bg-transparent w-28"
                  placeholder="开始日期"
                />
                <span className="mx-1 text-slate-400">-</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs text-slate-700 outline-none bg-transparent w-28"
                  placeholder="结束日期"
                />
              </div>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 操作与新增区域 */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-2.5 px-3.5 shadow-2xs flex justify-between items-center">
        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-1.5 bg-blue-50/80 hover:bg-blue-100/90 text-blue-600 border border-blue-200/80 rounded font-medium text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
          <span>新增设备</span>
        </button>

        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-4">
          <span>
            共找到 <strong className="text-blue-600 font-bold">
              {activeTab === 'main_station' && filteredBaseStations.length}
              {activeTab === 'exciter' && filteredExciters.length}
              {activeTab === 'gas_detector' && filteredGasDetectors.length}
              {activeTab === 'alarm' && filteredAlarms.length}
              {activeTab === 'camera' && filteredCameras.length}
            </strong> 台设备
          </span>
          {(activeTab === 'main_station' || activeTab === 'exciter') && (
            <>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                在线: {activeTab === 'main_station' ? filteredBaseStations.filter(d => d.status === '在线').length : filteredExciters.filter(d => d.status === '在线').length}
              </span>
              <span className="hidden sm:inline flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                离线: {activeTab === 'main_station' ? filteredBaseStations.filter(d => d.status === '离线').length : filteredExciters.filter(d => d.status === '离线').length}
              </span>
            </>
          )}
          {activeTab === 'camera' && (
            <>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                推流中: {filteredCameras.filter(d => d.isStreaming).length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 4. 数据表格区域 */}
      <div className="bg-white border border-slate-200/90 rounded-lg shadow-2xs overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
          
          {/* TAB 1: 主基站表格 */}
          {activeTab === 'main_station' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-medium">
                <tr>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-12 border-r border-slate-100">序号</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">基站编码</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">基站名称</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[160px]">厂区通用/关联项目</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[100px]">船型分层</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">基站状态</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">状态</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">安装位置</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">覆盖范围</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">辅助定位</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">最后更新</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[120px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filteredBaseStations.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      暂无符合条件的主基站设备记录
                    </td>
                  </tr>
                ) : (
                  filteredBaseStations.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-50">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-800 text-[11px] whitespace-nowrap border-r border-slate-50">{device.code}</td>
                      <td className="py-2.5 px-3 text-center text-slate-800 font-medium whitespace-nowrap border-r border-slate-50">{device.name}</td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderProjectCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderLayerCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-50">
                        {device.status === '在线' ? (
                          <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">在线</span>
                        ) : (
                          <span className="text-rose-600 font-bold text-[11px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">离线</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap border-r border-slate-50">{device.recycleStatus}</td>
                      <td className="py-2.5 px-3 text-center text-slate-800 whitespace-nowrap border-r border-slate-50">{device.location}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 text-[11px] border-r border-slate-50">{device.coverageRange || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap border-r border-slate-50">{device.auxPositioning}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px] whitespace-nowrap border-r border-slate-50">{device.lastUpdated || '-'}</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setMapViewDevice(device)} className="text-emerald-600 hover:text-emerald-800 font-bold hover:underline text-[11px] cursor-pointer inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>查看</span>
                          </button>
                          <button onClick={() => handleOpenEdit(device)} className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px] cursor-pointer">编辑</button>
                          <button onClick={() => setDeleteTargetId(device.id)} className="text-rose-500 hover:text-rose-700 font-medium hover:underline text-[11px] cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB: 激励器表格 */}
          {activeTab === 'exciter' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-medium">
                <tr>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-12 border-r border-slate-100">序号</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">激励器编码</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">激励器名称</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[160px]">厂区通用/关联项目</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[100px]">船型分层</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">激励器状态</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">状态</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">安装位置</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">覆盖范围</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">辅助定位</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">最后更新</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[120px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filteredExciters.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      暂无符合条件的激励器设备记录
                    </td>
                  </tr>
                ) : (
                  filteredExciters.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-50">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-800 text-[11px] whitespace-nowrap border-r border-slate-50">{device.code}</td>
                      <td className="py-2.5 px-3 text-center text-slate-800 font-medium whitespace-nowrap border-r border-slate-50">{device.name}</td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderProjectCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderLayerCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-50">
                        {device.status === '在线' ? (
                          <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">在线</span>
                        ) : (
                          <span className="text-rose-600 font-bold text-[11px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">离线</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap border-r border-slate-50">{device.recycleStatus}</td>
                      <td className="py-2.5 px-3 text-center text-slate-800 whitespace-nowrap border-r border-slate-50">{device.location}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600 text-[11px] border-r border-slate-50">{device.coverageRange || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap border-r border-slate-50">{device.auxPositioning}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px] whitespace-nowrap border-r border-slate-50">{device.lastUpdated || '-'}</td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setMapViewDevice(device)} className="text-emerald-600 hover:text-emerald-800 font-bold hover:underline text-[11px] cursor-pointer inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>查看</span>
                          </button>
                          <button onClick={() => handleOpenEdit(device)} className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px] cursor-pointer">编辑</button>
                          <button onClick={() => setDeleteTargetId(device.id)} className="text-rose-500 hover:text-rose-700 font-medium hover:underline text-[11px] cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: 气体探测器表格 */}
          {activeTab === 'gas_detector' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-medium">
                <tr>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-12 border-r border-slate-100">序号</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">创建时间</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">设备SN</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[160px]">厂区通用/关联项目</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[100px]">船型分层</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">安装位置</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[140px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filteredGasDetectors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      暂无气体探测器数据记录
                    </td>
                  </tr>
                ) : (
                  filteredGasDetectors.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-50">{idx + 1}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600 text-[11px] whitespace-nowrap border-r border-slate-50">{device.createdAt}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-800 text-[11px] whitespace-nowrap border-r border-slate-50">{device.sn}</td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderProjectCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderLayerCell(device)}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-800 whitespace-nowrap border-r border-slate-50">{device.location}</td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setMapViewDevice(device)} className="text-emerald-600 hover:text-emerald-800 font-bold hover:underline text-[11px] cursor-pointer inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>查看</span>
                          </button>
                          <button onClick={() => handleOpenDetail(device)} className="text-slate-600 hover:text-slate-800 font-medium hover:underline text-[11px] cursor-pointer">详情</button>
                          <button onClick={() => handleOpenEdit(device)} className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px] cursor-pointer">编辑</button>
                          <button onClick={() => setDeleteTargetId(device.id)} className="text-rose-500 hover:text-rose-700 font-medium hover:underline text-[11px] cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: 声光报警器表格 */}
          {activeTab === 'alarm' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-medium">
                <tr>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-12 border-r border-slate-100">序号</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">创建时间</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">设备SN</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[160px]">厂区通用/关联项目</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[100px]">船型分层</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">安装位置</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[140px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filteredAlarms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      暂无声光报警器数据记录
                    </td>
                  </tr>
                ) : (
                  filteredAlarms.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-50">{idx + 1}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600 text-[11px] whitespace-nowrap border-r border-slate-50">{device.createdAt}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-800 text-[11px] whitespace-nowrap border-r border-slate-50">{device.sn}</td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderProjectCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderLayerCell(device)}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-800 whitespace-nowrap border-r border-slate-50">{device.location}</td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setMapViewDevice(device)} className="text-emerald-600 hover:text-emerald-800 font-bold hover:underline text-[11px] cursor-pointer inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>查看</span>
                          </button>
                          <button onClick={() => handleOpenDetail(device)} className="text-slate-600 hover:text-slate-800 font-medium hover:underline text-[11px] cursor-pointer">详情</button>
                          <button onClick={() => handleOpenEdit(device)} className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px] cursor-pointer">编辑</button>
                          <button onClick={() => setDeleteTargetId(device.id)} className="text-rose-500 hover:text-rose-700 font-medium hover:underline text-[11px] cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: 摄像头表格 */}
          {activeTab === 'camera' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-medium">
                <tr>
                  <th className="py-2.5 px-2 text-center whitespace-nowrap w-12 border-r border-slate-100">序号</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">设备编码</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">设备名称</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100">AI模型类别</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[160px]">厂区通用/关联项目</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap border-r border-slate-100 min-w-[100px]">船型分层</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">API接口</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap border-r border-slate-100">创建时间</th>
                  <th className="py-2.5 px-4 text-center whitespace-nowrap min-w-[200px]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filteredCameras.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      暂无摄像头设备记录
                    </td>
                  </tr>
                ) : (
                  filteredCameras.map((device, idx) => (
                    <tr key={device.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-50">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-800 text-[11px] whitespace-nowrap border-r border-slate-50">{device.code}</td>
                      <td className="py-2.5 px-4 text-center text-slate-800 font-medium whitespace-nowrap border-r border-slate-50">{device.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px] whitespace-nowrap border-r border-slate-50">{device.modelCategory}</td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderProjectCell(device)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-50">
                        {renderLayerCell(device)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-sky-700 text-[11px] whitespace-nowrap border-r border-slate-50">{device.apiUrl}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-slate-600 text-[11px] whitespace-nowrap border-r border-slate-50">{device.createdAt}</td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedDevice(device); setModalMode('preview'); }} className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px] cursor-pointer">画面</button>
                          <button 
                            onClick={() => toggleCameraStreaming(device.id)} 
                            className={`${device.isStreaming ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-600 hover:text-emerald-700'} font-medium hover:underline text-[11px] cursor-pointer`}
                          >
                            {device.isStreaming ? '停止推流' : '开启推流'}
                          </button>
                          <button onClick={() => handleOpenEdit(device)} className="text-sky-600 hover:text-sky-800 font-medium hover:underline text-[11px] cursor-pointer">编辑</button>
                          <button onClick={() => setMapViewDevice(device)} className="text-emerald-600 hover:text-emerald-800 font-bold hover:underline text-[11px] cursor-pointer inline-flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>查看</span>
                          </button>
                          <button onClick={() => setDeleteTargetId(device.id)} className="text-rose-500 hover:text-rose-700 font-medium hover:underline text-[11px] cursor-pointer">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>

        {/* 底部页码统计 */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center shrink-0">
          <span>
            显示 1 到 {
              activeTab === 'main_station' ? filteredBaseStations.length :
              activeTab === 'exciter' ? filteredExciters.length :
              activeTab === 'gas_detector' ? filteredGasDetectors.length :
              activeTab === 'alarm' ? filteredAlarms.length : filteredCameras.length
            } 条，共 {
              activeTab === 'main_station' ? filteredBaseStations.length :
              activeTab === 'exciter' ? filteredExciters.length :
              activeTab === 'gas_detector' ? filteredGasDetectors.length :
              activeTab === 'alarm' ? filteredAlarms.length : filteredCameras.length
            } 条设备数据
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            <button className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">上一页</button>
            <button className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold">1</button>
            <button className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-400 cursor-not-allowed">下一页</button>
          </div>
        </div>
      </div>

      {/* 5. 新增 / 编辑 模态框 (包含造船项目及 3D BIM 模型分层关联配置，支持扩展增删多个作业面或有限空间) */}
      {(modalMode === 'create' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {(activeTab === 'main_station' || activeTab === 'exciter') && <Radio className="w-4 h-4 text-blue-600" />}
                {activeTab === 'gas_detector' && <Flame className="w-4 h-4 text-amber-500" />}
                {activeTab === 'alarm' && <Volume2 className="w-4 h-4 text-rose-500" />}
                {activeTab === 'camera' && <Video className="w-4 h-4 text-sky-600" />}
                <span>
                  {modalMode === 'create' ? `新增${
                    activeTab === 'main_station' ? '主基站设备' :
                    activeTab === 'exciter' ? '激励器设备' :
                    activeTab === 'gas_detector' ? '气体探测器' :
                    activeTab === 'alarm' ? '声光报警器' : '识别摄像头'
                  }` : `编辑设备参数：${formFields.code || formFields.sn || formFields.name}`}
                </span>
              </h3>
              <button 
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* [可扩展关联作业面与船舶有限空间管理区] */}
              <div className="bg-slate-50/90 rounded-xl border border-slate-200/90 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-blue-100 text-blue-700">
                      <Layers className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-slate-800 font-bold text-xs">
                          关联作业面 / 有限空间
                        </label>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-semibold">
                          已配置 {(formFields.associatedWorkfaces || []).length} 处空间
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        支持为当前设备灵活关联多处全厂作业面或船舶工程分层舱位，可动态增删扩展
                      </p>
                    </div>
                  </div>

                  {!isAddingAssoc && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAssoc(true)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加作业面 / 空间</span>
                    </button>
                  )}
                </div>

                {/* 动态添加抽屉/表单框 */}
                {isAddingAssoc && (
                  <div className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-xs space-y-3 animate-in fade-in zoom-in-98 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        添加新的关联作业面 / 船舶有限空间
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAssoc(false);
                          setNewSpaceName('');
                        }}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 选择添加类型 */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setNewAssocType('workface')}
                        className={`py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newAssocType === 'workface'
                            ? 'bg-white text-purple-700 shadow-xs border border-purple-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>🏢 全厂通用作业面</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAssocType('confinedSpace')}
                        className={`py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newAssocType === 'confinedSpace'
                            ? 'bg-white text-sky-700 shadow-xs border border-sky-200'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Ship className="w-3.5 h-3.5 text-blue-600" />
                        <span>🚢 船舶工程有限空间</span>
                      </button>
                    </div>

                    {/* 类型 1：全厂通用作业面选择 */}
                    {newAssocType === 'workface' && (
                      <div className="space-y-2">
                        <label className="block text-slate-700 font-semibold text-[11px]">
                          选择全厂作业面及对应电子围栏 <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={newYardWfId || allYardOptions[0]?.id}
                          onChange={(e) => setNewYardWfId(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-purple-500 bg-white cursor-pointer"
                        >
                          {allYardOptions.map(wf => (
                            <option key={wf.id} value={wf.id}>
                              🏢 [{wf.code}] {wf.name} (工位: {wf.subArea} | 围栏: {wf.fenceCode})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 类型 2：船舶工程有限空间选择 */}
                    {newAssocType === 'confinedSpace' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                              所属造船工程项目 <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={newPrjId || MOCK_PROJECTS[0].id}
                              onChange={(e) => setNewPrjId(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                            >
                              {MOCK_PROJECTS.map(prj => (
                                <option key={prj.id} value={prj.id}>
                                  🚢 [{prj.id}] {prj.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                              模型分层区域 <span className="text-rose-500">*</span>
                            </label>
                            <select
                              value={newModelLevel || 'middle'}
                              onChange={(e) => setNewModelLevel(e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                            >
                              {MODEL_LAYER_OPTIONS.map(layer => (
                                <option key={layer.id} value={layer.id}>
                                  📐 {layer.fullName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-semibold text-[11px] mb-1">
                            有限空间 / 舱位作业面名称 (可选，留空将自动生成标准舱室名)
                          </label>
                          <input
                            type="text"
                            value={newSpaceName}
                            onChange={(e) => setNewSpaceName(e.target.value)}
                            placeholder="如: 1#液货舱双层底密闭空间 / 2#压载舱"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAssoc(false);
                          setNewSpaceName('');
                        }}
                        className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs cursor-pointer"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAssociation}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>确认添加至关联列表</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 已关联空间列表 */}
                <div className="space-y-1.5">
                  {(!formFields.associatedWorkfaces || formFields.associatedWorkfaces.length === 0) ? (
                    <div className="p-3 text-center bg-white rounded-lg border border-dashed border-slate-200 text-slate-400 text-xs">
                      暂未关联作业面或有限空间，请点击上方“添加作业面 / 空间”进行配置
                    </div>
                  ) : (
                    formFields.associatedWorkfaces.map((assoc: DeviceAssociatedWorkface, index: number) => {
                      const isFirst = index === 0;
                      return (
                        <div
                          key={assoc.id}
                          className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-200 transition-colors shadow-2xs group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            {assoc.type === 'workface' ? (
                              <span className="p-1 rounded bg-purple-50 text-purple-600 shrink-0">
                                <Building2 className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="p-1 rounded bg-sky-50 text-blue-600 shrink-0">
                                <Ship className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 text-xs truncate">
                                  {assoc.name}
                                </span>
                                {assoc.code && (
                                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                    {assoc.code}
                                  </span>
                                )}
                                {isFirst && (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                                    主关联
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 truncate">
                                {assoc.type === 'workface' ? (
                                  <>
                                    <span>工位: {assoc.yardSubArea || '厂区车间'}</span>
                                    <span>•</span>
                                    <span className="font-mono text-purple-700">围栏: {assoc.electricFence}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-blue-700 font-medium">项目: {assoc.projectName}</span>
                                    <span>•</span>
                                    <span className="text-sky-700">分层: {assoc.modelLevelName}</span>
                                    <span>•</span>
                                    <span className="font-mono text-emerald-700">围栏: {assoc.electricFence}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveAssociation(assoc.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="移除此关联空间"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* [模态表单 1] 主基站 / 激励器 特定属性 */}
              {(activeTab === 'main_station' || activeTab === 'exciter') && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* 1. 基站编码 */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        基站编码 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.code || ''}
                        onChange={(e) => setFormFields({ ...formFields, code: e.target.value })}
                        placeholder="请输入基站编码，如: 测试"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {/* 2. 基站名称 */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        基站名称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.name || ''}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        placeholder="请输入基站名称，如: 123"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* 3. 基站安装位置 */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        基站安装位置 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.location || ''}
                        onChange={(e) => {
                          const newLoc = e.target.value;
                          setFormFields({
                            ...formFields,
                            location: newLoc,
                            electricFence: formFields.electricFence || (newLoc ? `${newLoc}-围栏` : '517-9')
                          });
                        }}
                        placeholder="请输入安装具体位置，如: 测试"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* 5. 设备回收状态 */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">设备回收状态</label>
                      <select
                        value={formFields.recycleStatus || '设备安装'}
                        onChange={(e) => setFormFields({ ...formFields, recycleStatus: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                      >
                        <option value="设备安装">设备安装</option>
                        <option value="已回收">已回收</option>
                        <option value="维护中">维护中</option>
                        <option value="待安装">待安装</option>
                        <option value="临时撤场">临时撤场</option>
                        <option value="拟拆除">拟拆除</option>
                      </select>
                    </div>

                    {/* 6. 信号丢失时间（步进器）与 辅助定位 (同第一行) */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">信号丢失时间 (分钟)</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setFormFields({ ...formFields, signalLossTime: Math.max(0, (Number(formFields.signalLossTime) || 0) - 1) })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-l text-slate-700 font-bold"
                        >
                          —
                        </button>
                        <input
                          type="number"
                          value={formFields.signalLossTime ?? 5}
                          onChange={(e) => setFormFields({ ...formFields, signalLossTime: Number(e.target.value) })}
                          className="w-full text-center py-1 border-t border-b border-slate-300 text-xs font-mono font-bold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setFormFields({ ...formFields, signalLossTime: (Number(formFields.signalLossTime) || 0) + 1 })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-r text-slate-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 辅助定位 (与信号丢失时间同行) */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">辅助定位</label>
                      <select
                        value={formFields.auxPositioning || '否'}
                        onChange={(e) => setFormFields({ ...formFields, auxPositioning: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer font-medium text-slate-800"
                      >
                        <option value="否">否</option>
                        <option value="是">是</option>
                      </select>
                    </div>

                    {/* 7. 定位衰减系数 (0~31) 与 8. 覆盖范围 (同行) */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">定位衰减系数</label>
                      <select
                        value={String(formFields.attenuationCoeff ?? '0')}
                        onChange={(e) => {
                          const newCoeff = e.target.value;
                          const newCoverage = String(getCoverageRadiusByAttenuation(newCoeff));
                          setFormFields({
                            ...formFields,
                            attenuationCoeff: newCoeff,
                            coverageRange: newCoverage
                          });
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer font-mono"
                      >
                        {Array.from({ length: 32 }, (_, i) => (
                          <option key={i} value={String(i)}>
                            {i} (对应 {getCoverageRadiusByAttenuation(i)} 米)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                        <span>覆盖范围</span>
                        <span className="text-[11px] font-normal text-slate-400">（衰减系数联动）</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={`${getCoverageRadiusByAttenuation(formFields.attenuationCoeff ?? 0)}`}
                          placeholder="50"
                          className="w-full pl-2.5 pr-7 py-1.5 border border-slate-200 bg-slate-100 rounded text-xs text-slate-500 font-mono font-bold cursor-not-allowed select-none"
                        />
                        <span className="absolute right-2.5 text-slate-400 text-xs font-bold pointer-events-none">m</span>
                      </div>
                    </div>


                  </div>
                </div>
              )}

              {/* [模态表单 2] 气体探测器特定属性 */}
              {activeTab === 'gas_detector' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        设备SN编号 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.sn || ''}
                        onChange={(e) => setFormFields({ ...formFields, sn: e.target.value, name: formFields.name || `气体探测器-${e.target.value}` })}
                        placeholder="如: 866833080749440"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        设备名称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.name || ''}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        placeholder="如: 1#液货舱四合一气体探测器"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        安装具体位置 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.location || ''}
                        onChange={(e) => setFormFields({ ...formFields, location: e.target.value })}
                        placeholder="如: 1#液货舱下部隔板"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">安装场所</label>
                      <select
                        value={formFields.installationSite || '舱内'}
                        onChange={(e) => setFormFields({ ...formFields, installationSite: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                      >
                        <option value="舱内">舱内 (密闭/受限空间)</option>
                        <option value="室外">室外 (露天甲板/船台)</option>
                        <option value="室内">室内 (车间/泵房)</option>
                        <option value="码头">码头 (系泊舾装作业区)</option>
                      </select>
                    </div>

                  </div>
                </div>
              )}

              {/* [模态表单 3] 声光报警器特定属性 */}
              {activeTab === 'alarm' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        设备SN编号 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.sn || ''}
                        onChange={(e) => setFormFields({ ...formFields, sn: e.target.value, name: formFields.name || `声光报警器-${e.target.value}` })}
                        placeholder="如: 867655086345884"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        设备名称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.name || ''}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        placeholder="如: 机舱应急声光告警器"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        安装具体位置 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.location || ''}
                        onChange={(e) => setFormFields({ ...formFields, location: e.target.value })}
                        placeholder="如: 机舱二层辅机平台"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">安装场所</label>
                      <select
                        value={formFields.installationSite || '舱内'}
                        onChange={(e) => setFormFields({ ...formFields, installationSite: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                      >
                        <option value="舱内">舱内 (密闭动力舱)</option>
                        <option value="室外">室外 (主甲板/船台)</option>
                        <option value="室内">室内 (车间/集控室)</option>
                        <option value="码头">码头 (舾装泊位)</option>
                      </select>
                    </div>

                  </div>
                </div>
              )}

              {/* [模态表单 4] 摄像头特定属性 */}
              {activeTab === 'camera' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        设备编码 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.code || ''}
                        onChange={(e) => setFormFields({ ...formFields, code: e.target.value })}
                        placeholder="如: test-003"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        设备名称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formFields.name || ''}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        placeholder="如: 香烟识别摄像头"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">AI模型类别</label>
                      <input
                        type="text"
                        value={formFields.modelCategory || ''}
                        onChange={(e) => setFormFields({ ...formFields, modelCategory: e.target.value })}
                        placeholder="如: 未穿戴防护检测 / 吸烟识别"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">安装具体位置</label>
                      <input
                        type="text"
                        value={formFields.location || ''}
                        onChange={(e) => setFormFields({ ...formFields, location: e.target.value })}
                        placeholder="如: 1#液货舱人孔口"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">API接口URL</label>
                      <input
                        type="text"
                        value={formFields.apiUrl || ''}
                        onChange={(e) => setFormFields({ ...formFields, apiUrl: e.target.value })}
                        placeholder="如: http://192.168.205.110:7571"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* [统一地图三维空间定位与地图关联拾取卡片] */}
              <div className="p-3.5 bg-gradient-to-br from-slate-900 to-cyan-950 rounded-xl text-white border border-cyan-800/80 shadow-md space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ring-1 ring-cyan-400/50 hover:ring-cyan-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-cyan-200" />
                    <span>🗺️ 点击地图添加/更新关联 (坐标)</span>
                  </button>

                  {(formFields.positionX !== null && formFields.positionX !== undefined) && (
                    <span className="text-emerald-300 text-[11px] font-medium flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-700/60">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>已关联定位坐标信息</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">安装位置X轴 (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formFields.positionX ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : Number(e.target.value);
                        setFormFields({ ...formFields, positionX: val });
                        if (val !== null) setFormError(null);
                      }}
                      placeholder="未采集"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">安装位置Y轴 (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formFields.positionY ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : Number(e.target.value);
                        setFormFields({ ...formFields, positionY: val });
                        if (val !== null) setFormError(null);
                      }}
                      placeholder="未采集"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">安装位置Z轴 (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formFields.positionZ ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : Number(e.target.value);
                        setFormFields({ ...formFields, positionZ: val });
                        if (val !== null) setFormError(null);
                      }}
                      placeholder="未采集"
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-bold focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 text-xs"
                    />
                  </div>
                </div>

                {/* 点击地图添加/返回后展示关联的作业面/工程项目与电子围栏信息 (纯信息展示) */}
                <div className="pt-2 border-t border-cyan-900/60 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px] shrink-0">关联作业面/工程:</span>
                    <span className="font-bold text-amber-300 text-[11px] truncate">
                      {formFields.associatedWorkfaces && formFields.associatedWorkfaces.length > 0
                        ? `${formFields.associatedWorkfaces[0].name}${formFields.associatedWorkfaces.length > 1 ? ` (等 ${formFields.associatedWorkfaces.length} 处空间)` : ''}`
                        : (formFields.associationType === 'global' ? (formFields.workfaceName || '全厂通用作业面') : (formFields.project || '造船工程项目'))}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px] shrink-0">关联电子围栏:</span>
                    <span className="font-mono font-bold text-emerald-400 text-[11px] truncate">
                      🛡️ {formFields.electricFence || (formFields.associationType === 'global' ? 'EF-SEC-01' : 'EF-PRJ-01')}
                    </span>
                  </div>
                </div>


              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{formError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[11px] shrink-0 transition-colors shadow-2xs"
                  >
                    立即在地图采集坐标
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode(null);
                    setFormError(null);
                  }}
                  className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer shadow-2xs"
                >
                  保存提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. 详情 Modal 弹窗 */}
      {modalMode === 'detail' && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-sm">
                  {(activeTab === 'main_station' || activeTab === 'exciter') && (activeTab === 'exciter' ? '激励器设备详情' : '基站设备详情')}
                  {activeTab === 'gas_detector' && '气体探测器参数详情'}
                  {activeTab === 'alarm' && '声光报警器状态详情'}
                  {activeTab === 'camera' && '智能摄像头详细配置'}
                </span>
              </div>
              <button 
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              
              {/* 核心参数列表 */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">唯一识别码：</span>
                  <span className="font-bold text-slate-900">{selectedDevice.code || selectedDevice.sn || selectedDevice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">设备名称：</span>
                  <span className="font-bold text-blue-700">{selectedDevice.name}</span>
                </div>
              </div>

              {/* 造船工程项目与空间关联卡片 (支持多作业面/有限空间清单展示) */}
              <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/90 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    关联作业面与船舶有限空间
                  </span>
                  {selectedDevice.associatedWorkfaces && selectedDevice.associatedWorkfaces.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      已关联 {selectedDevice.associatedWorkfaces.length} 处空间
                    </span>
                  ) : (
                    selectedDevice.associationType === 'global' || selectedDevice.project === '全厂通用设备' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        全厂通用配置
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        指定项目 3D 绑定
                      </span>
                    )
                  )}
                </div>

                {selectedDevice.associatedWorkfaces && selectedDevice.associatedWorkfaces.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedDevice.associatedWorkfaces.map((assoc: any, idx: number) => (
                      <div key={assoc.id || idx} className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {assoc.type === 'workface' ? (
                              <span className="p-0.5 bg-purple-50 text-purple-700 rounded"><Building2 className="w-3.5 h-3.5" /></span>
                            ) : (
                              <span className="p-0.5 bg-sky-50 text-blue-600 rounded"><Ship className="w-3.5 h-3.5" /></span>
                            )}
                            <span className="font-bold text-slate-800 text-xs">{assoc.name}</span>
                            {assoc.code && <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">{assoc.code}</span>}
                          </div>
                          {idx === 0 && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              主关联
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                          {assoc.type === 'workface' ? (
                            <>
                              <span>工位: {assoc.yardSubArea || '厂区车间'}</span>
                              <span>•</span>
                              <span className="font-mono text-purple-700">围栏: {assoc.electricFence}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-blue-700 font-medium">项目: {assoc.projectName}</span>
                              <span>•</span>
                              <span className="text-sky-700">分层: {assoc.modelLevelName}</span>
                              <span>•</span>
                              <span className="font-mono text-emerald-700">围栏: {assoc.electricFence}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  selectedDevice.associationType === 'global' || selectedDevice.project === '全厂通用设备' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">关联全厂作业面：</span>
                        <span className="font-bold text-purple-800">{selectedDevice.workfaceName || '全厂通用作业面'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">联动电子围栏：</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🛡️ {selectedDevice.electricFence || 'EF-SEC-01'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">工程项目编码及名称：</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded text-[11px]">
                            {selectedDevice.projectId || 'PRJ'}
                          </span>
                          <span>{selectedDevice.project}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">船型模型分层：</span>
                        {(() => {
                          const l = getLayerOption(selectedDevice.modelLevel);
                          return l ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${l.badgeBg} ${l.badgeText} ${l.badgeBorder}`}>
                              <Layers className="w-3.5 h-3.5" />
                              <span>{l.fullName}</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-800">{selectedDevice.modelLevelName || '通用视角'}</span>
                          );
                        })()}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">关联有限空间：</span>
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          🔒 {selectedDevice.confinedSpaceName || '标准工程舱室'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">联动电子围栏：</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🛡️ {selectedDevice.electricFence || 'EF-LNG-CS01'}
                        </span>
                      </div>
                    </div>
                  )
                )}

                <div className="pt-1.5 border-t border-slate-200/60 flex justify-between items-center font-mono text-[11px]">
                  <span className="text-slate-500 font-sans">物理三维坐标：</span>
                  <span className="text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    X: {selectedDevice.positionX ?? 350.2}, Y: {selectedDevice.positionY ?? 10.1}, Z: {selectedDevice.positionZ ?? -150.4}
                  </span>
                </div>
              </div>

              {/* 其他补充参数 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {(activeTab === 'main_station' || activeTab === 'exciter') && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">回收状态：</span><span className="font-medium text-slate-800">{selectedDevice.recycleStatus}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">安装位置：</span><span className="font-medium text-slate-800">{selectedDevice.location}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">覆盖范围：</span><span className="font-mono text-blue-600 font-bold">{selectedDevice.coverageRange || '23m'}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">辅助定位：</span><span className="font-medium text-slate-800">{selectedDevice.auxPositioning}</span></div>
                  </>
                )}

                {activeTab === 'gas_detector' && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">安装位置：</span><span className="font-medium text-slate-800">{selectedDevice.location || '未设定'}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">创建时间：</span><span className="font-mono text-slate-800">{selectedDevice.createdAt}</span></div>
                  </>
                )}

                {activeTab === 'alarm' && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">安装位置：</span><span className="font-medium text-slate-800">{selectedDevice.location || '未设定'}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">创建时间：</span><span className="font-mono text-slate-800">{selectedDevice.createdAt}</span></div>
                  </>
                )}

                {activeTab === 'camera' && (
                  <>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">模型类别：</span><span className="font-mono text-slate-800">{selectedDevice.modelCategory}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5"><span className="text-slate-500">推流状态：</span><span className={`font-bold ${selectedDevice.isStreaming ? 'text-emerald-600' : 'text-slate-400'}`}>{selectedDevice.isStreaming ? '推流中' : '已停止'}</span></div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5 col-span-2"><span className="text-slate-500">API接口：</span><span className="font-mono text-sky-700">{selectedDevice.apiUrl}</span></div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <button
                  onClick={() => { setDeleteTargetId(selectedDevice.id); }}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除设备</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(selectedDevice)}
                    className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded text-xs font-medium cursor-pointer"
                  >
                    编辑参数
                  </button>
                  <button
                    onClick={() => setModalMode(null)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    关闭窗口
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. 摄像头视频流预览 Preview 模态框 */}
      {modalMode === 'preview' && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-800 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tv className="w-4.5 h-4.5 text-sky-400 animate-pulse" />
                <span className="font-bold text-sm">{selectedDevice.name} - 实时画质画面</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                  1080P / 60fps
                </span>
              </div>
              <button 
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-sky-950 to-slate-900 flex flex-col items-center justify-center">
                  <div className="w-full h-full opacity-30 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>

                <div className="absolute top-1/4 left-1/3 w-36 h-36 border-2 border-emerald-400 rounded bg-emerald-500/10 flex flex-col justify-between p-1">
                  <span className="text-[10px] bg-emerald-600 text-white font-mono px-1 rounded self-start">
                    {selectedDevice.name.includes('香烟') ? '吸烟检测 98%' : selectedDevice.name.includes('安全帽') ? '安全帽佩戴 OK' : '目标AI追踪中'}
                  </span>
                  <span className="text-[9px] text-emerald-300 font-mono self-end">ID: 8092</span>
                </div>

                <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center gap-2 backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>REC | {new Date().toISOString().replace('T', ' ').substring(0, 19)}</span>
                </div>

                <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 backdrop-blur-xs">
                  {selectedDevice.apiUrl}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-1">
                <span>RTSP: {selectedDevice.rtspUrl || 'rtsp://192.168.205.110:554/live/stream'}</span>
                <button
                  onClick={() => setModalMode(null)}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-sans rounded text-xs transition-colors cursor-pointer"
                >
                  退出预览
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. 二次删除确认 模态框 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">确认删除设备记录？</h4>
                <p className="text-slate-500 text-xs mt-0.5">该操作无法撤销，设备将被移出系统名册。</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium cursor-pointer shadow-2xs"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. 可视化定位设备安装位置地图拾取器 Modal (调整为全屏 100vw * 100vh) */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-screen h-screen overflow-hidden animate-in fade-in duration-200">
          <div className="bg-slate-950 w-full h-full flex flex-col overflow-hidden">
            {/* 顶栏 Header */}
            <div className="px-6 py-3.5 bg-slate-900 border-b border-cyan-900/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-400">
                  <Crosshair className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base flex items-center gap-2.5">
                    可视化设备坐标拾取器
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                      {formFields.associationType === 'global' ? '全厂场景 / 船厂地图' : '造船项目 / 船型模型'}
                    </span>
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">在 {formFields.associationType === 'global' ? '东南造船厂厂区地图' : `[${formFields.project || '造船项目'}] 3D/2D 船型视角`} 任意位置点击即可拾取 X, Y, Z 三维坐标</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(false)}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>确认采用当前地图坐标</span>
                </button>
                <button
                  onClick={() => setIsMapPickerOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 拾取控制及信息栏 */}
            <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
              <div className="flex items-center flex-wrap gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">关联场景模式:</span>
                  <span className={`font-bold px-2.5 py-1 rounded border ${formFields.associationType === 'global' ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-cyan-950 text-cyan-300 border-cyan-800'}`}>
                    {formFields.associationType === 'global' ? '🏢 全厂场景 (厂区平面图)' : '🚢 造船工程项目 (船型3D/2D模型)'}
                  </span>
                </div>
                {formFields.associationType === 'global' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">关联作业面:</span>
                      <span className="font-bold text-purple-300 bg-slate-950 px-2.5 py-1 rounded border border-purple-900">
                        {formFields.workfaceName || YARD_WORKFACE_OPTIONS[0].name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">联动电子围栏:</span>
                      <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-emerald-900">
                        🛡️ {formFields.electricFence || 'EF-SEC-01'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">绑定造船工程:</span>
                      <span className="font-bold text-sky-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        {formFields.project || '517-9号 13000TEU集装箱船'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">BIM分层:</span>
                      <span className="font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        {formFields.modelLevelName || '甲板层'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">联动电子围栏:</span>
                      <span className="font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-emerald-900">
                        🛡️ {formFields.electricFence || 'EF-LNG-CS01'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-cyan-300 bg-slate-950 px-4 py-1.5 rounded-lg border border-cyan-900/80 shadow-inner">
                <span className="text-slate-400 font-sans">抓取坐标:</span>
                <span>X: <strong className="text-white text-sm">{formFields.positionX ?? 407.49}</strong></span>
                <span>Y: <strong className="text-white text-sm">{formFields.positionY ?? 0.02}</strong></span>
                <span>Z: <strong className="text-white text-sm">{formFields.positionZ ?? -296.85}</strong></span>
              </div>
            </div>

            {/* 地图/模型 交互绘图视窗 */}
            <div 
              className="relative flex-1 bg-slate-950 overflow-hidden cursor-crosshair group flex items-center justify-center select-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) - rect.width / 2) * 1.5;
                const clickZ = ((e.clientY - rect.top) - rect.height / 2) * 1.5;
                setFormFields({
                  ...formFields,
                  positionX: Number(clickX.toFixed(2)),
                  positionY: Number((formFields.positionY || 0.02).toFixed(2)),
                  positionZ: Number(clickZ.toFixed(2))
                });
              }}
            >
              {/* 3D 精细物理网格背景 */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-60"></div>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:160px_160px] opacity-40"></div>

              {/* 极坐标中心轴 */}
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-cyan-500/20 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-cyan-500/20 pointer-events-none"></div>

              {/* ---------------- 场景 1: 全厂场景 - 船厂全景地图背景 ---------------- */}
              {formFields.associationType === 'global' ? (
                <div className="absolute inset-10 border border-emerald-500/30 rounded-3xl pointer-events-none overflow-hidden bg-slate-900/40 backdrop-blur-3xs flex flex-col justify-between p-6">
                  {/* 厂区顶栏标识 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-emerald-400 font-bold">
                      <Building2 className="w-4 h-4" />
                      <span>东南造船厂 - 厂区全景平面图 (全厂公共区域)</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                      比例尺 1:5000 | 覆盖面积 1,200,000 m²
                    </div>
                  </div>

                  {/* 船厂各功能区矢量插图背景 */}
                  <div className="relative flex-1 my-4 grid grid-cols-12 grid-rows-6 gap-3 opacity-80">
                    {/* 海域 & 舾装码头 (左侧) */}
                    <div className="col-span-3 row-span-6 bg-cyan-950/40 border border-cyan-800/60 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-cyan-900/30 font-black text-6xl rotate-90 select-none">
                        OUT FITTING BERTH
                      </div>
                      <div>
                        <div className="text-cyan-300 font-bold text-xs flex items-center gap-1">
                          <Ship className="w-4 h-4 text-cyan-400" />
                          <span>1#~4# 舾装码头 (海域)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">深水停泊区 | 浮吊作业点</p>
                      </div>
                      <div className="space-y-1.5 text-[10px] text-cyan-200/80 font-mono">
                        <div className="p-1.5 bg-cyan-900/30 rounded border border-cyan-700/40">⚓ 1号泊位 (13000TEU靠泊中)</div>
                        <div className="p-1.5 bg-cyan-900/30 rounded border border-cyan-700/40">⚓ 2号泊位 (散货船舾装中)</div>
                        <div className="p-1.5 bg-cyan-900/30 rounded border border-cyan-700/40">⚓ 3号/4号 备用码头</div>
                      </div>
                    </div>

                    {/* 船坞区 (中部) */}
                    <div className="col-span-5 row-span-4 bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-bold text-xs flex items-center gap-1">
                          <Compass className="w-4 h-4 text-amber-400" />
                          1号/2号 船坞总装区 (Dry Dock)
                        </span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                          600t 龙门吊轨道覆盖
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 my-2">
                        <div className="h-20 bg-slate-900/90 rounded border border-dashed border-amber-500/40 p-2 flex flex-col justify-between">
                          <span className="text-[10px] text-amber-200 font-mono font-bold">1号大船坞 (30万吨)</span>
                          <span className="text-[9px] text-slate-500">搭载合拢主战场</span>
                        </div>
                        <div className="h-20 bg-slate-900/90 rounded border border-dashed border-amber-500/40 p-2 flex flex-col justify-between">
                          <span className="text-[10px] text-amber-200 font-mono font-bold">2号中船坞 (15万吨)</span>
                          <span className="text-[9px] text-slate-500">半潜浮箱阶段</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">包含主基站BS-001/002基站分布区</span>
                    </div>

                    {/* 加工及涂装车间 (右侧) */}
                    <div className="col-span-4 row-span-6 bg-slate-850/60 border border-slate-700/80 rounded-xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="text-indigo-300 font-bold text-xs flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          制造加工与涂装车间群
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">钢材下料 / 小组立 / 喷砂涂装区</p>
                      </div>

                      <div className="space-y-1.5 text-[10px] text-slate-300">
                        <div className="p-2 bg-slate-900/80 rounded border border-slate-700">🏭 钢材切割加工车间 (1号楼)</div>
                        <div className="p-2 bg-slate-900/80 rounded border border-slate-700">🎨 封闭式喷砂涂装车间 (2号楼)</div>
                        <div className="p-2 bg-slate-900/80 rounded border border-slate-700">📦 舾装件及管件仓库 (3号楼)</div>
                        <div className="p-2 bg-slate-900/80 rounded border border-slate-700">🏢 厂区综合行政办公楼</div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">厂区北门入口 / 围栏隔离网</div>
                    </div>

                    {/* 厂区道路网 (下方) */}
                    <div className="col-span-5 row-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-slate-300 font-bold text-xs">厂区交通主干道 & 运输轨道</span>
                        <p className="text-[10px] text-slate-500">平板运输车 / 模块车通行主通道</p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">R-ROAD-01</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                      全厂场景模式：点击厂区图任意位置定位设备
                    </span>
                    <span className="font-mono text-slate-500">东南造船厂 3D 智慧物联网基座</span>
                  </div>
                </div>
              ) : (
                /* ---------------- 场景 2: 造船工程项目 - 船型结构 3D/2D CAD 模型图背景 ---------------- */
                <div className="absolute inset-10 border border-cyan-500/30 rounded-3xl pointer-events-none overflow-hidden bg-slate-900/40 backdrop-blur-3xs flex flex-col justify-between p-6">
                  {/* 船舶项目顶栏标识 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-cyan-300 font-bold">
                      <Ship className="w-4 h-4 text-cyan-400" />
                      <span>{formFields.project || '517-9号 13000TEU集装箱船'} - 3D CAD 数字孪生船型模型</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800 font-bold">
                        当前分层: {formFields.modelLevelName || '甲板层'}
                      </span>
                    </div>
                  </div>

                  {/* 船体矢量 Blueprint 结构背景 */}
                  <div className="relative flex-1 my-4 flex items-center justify-center">
                    {/* 船外形线 (Bulbous Bow -> Stern) */}
                    <div className="w-full h-48 border-2 border-cyan-400/50 rounded-[120px_20px_20px_100px] bg-cyan-950/20 backdrop-blur-2xs relative p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                      {/* 船头 (Bow) */}
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-xs font-mono rotate-90">
                        ◀ 球鼻艏 (BOW) #240
                      </div>

                      {/* 船尾 (Stern) */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-xs font-mono -rotate-90">
                        船艉 (STERN) #0 ▶
                      </div>

                      {/* 肋骨编号网格线 */}
                      <div className="absolute inset-x-12 inset-y-0 flex justify-between opacity-30 pointer-events-none">
                        {Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className="h-full border-r border-dashed border-cyan-400 flex flex-col justify-between text-[8px] font-mono text-cyan-300 pl-0.5 pt-1">
                            <span>#{220 - i * 20}</span>
                            <span>FR-{i + 1}</span>
                          </div>
                        ))}
                      </div>

                      {/* 货舱及舱室划分 */}
                      <div className="relative z-10 grid grid-cols-6 gap-2 my-auto px-10">
                        <div className="h-24 bg-slate-900/80 rounded border border-cyan-500/30 p-2 flex flex-col justify-between text-center">
                          <span className="text-[10px] font-bold text-cyan-300">1# 货舱区</span>
                          <span className="text-[9px] text-slate-500">HOLD 01</span>
                        </div>
                        <div className="h-24 bg-slate-900/80 rounded border border-cyan-500/30 p-2 flex flex-col justify-between text-center">
                          <span className="text-[10px] font-bold text-cyan-300">2# 货舱区</span>
                          <span className="text-[9px] text-slate-500">HOLD 02</span>
                        </div>
                        <div className="h-24 bg-slate-900/80 rounded border border-cyan-500/30 p-2 flex flex-col justify-between text-center">
                          <span className="text-[10px] font-bold text-cyan-300">3# 货舱区</span>
                          <span className="text-[9px] text-slate-500">HOLD 03</span>
                        </div>
                        <div className="h-24 bg-amber-950/40 rounded border border-amber-500/50 p-2 flex flex-col justify-between text-center">
                          <span className="text-[10px] font-bold text-amber-300">驾驶楼/上层建筑</span>
                          <span className="text-[9px] text-amber-200/80">BRIDGE DECK</span>
                        </div>
                        <div className="h-24 bg-slate-900/80 rounded border border-cyan-500/30 p-2 flex flex-col justify-between text-center">
                          <span className="text-[10px] font-bold text-cyan-300">4# 货舱区</span>
                          <span className="text-[9px] text-slate-500">HOLD 04</span>
                        </div>
                        <div className="h-24 bg-slate-900/80 rounded border border-cyan-500/30 p-2 flex flex-col justify-between text-center">
                          <span className="text-[10px] font-bold text-rose-300">机舱 (ENGINE)</span>
                          <span className="text-[9px] text-rose-400">ME-01</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <MapPin className="w-3.5 h-3.5" />
                      船模型视角：点击船体区域拾取分层具体安装坐标
                    </span>
                    <span className="font-mono text-slate-500">LOA: 335m | Beam: 51m | Depth: 30m</span>
                  </div>
                </div>
              )}

              {/* 点击高亮指针标记 */}
              <div 
                className="absolute z-30 transition-all duration-150 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `calc(50% + ${(formFields.positionX ?? 407.49) / 1.5}px)`,
                  top: `calc(50% + ${(formFields.positionZ ?? -296.85) / 1.5}px)`
                }}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/30 border-2 border-cyan-400 animate-ping absolute -inset-1"></div>
                  <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-[0_0_20px_#06b6d4]">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="mt-1.5 bg-slate-900/95 text-cyan-300 border border-cyan-500/70 text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap flex flex-col items-center gap-0.5">
                    <div>X: {formFields.positionX ?? 407.49}, Y: {formFields.positionY ?? 0.02}, Z: {formFields.positionZ ?? -296.85}</div>
                    <div className="text-[10px] text-amber-300 font-sans font-medium flex items-center gap-1.5">
                      <span>{formFields.associationType === 'global' ? `🏢 ${formFields.workfaceName || '全厂通用作业面'}` : `🚢 ${formFields.project || '造船工程项目'}`}</span>
                      <span className="text-slate-500">|</span>
                      <span className="text-emerald-400 font-mono">🛡️ {formFields.electricFence || (formFields.associationType === 'global' ? 'EF-SEC-01' : 'EF-PRJ-01')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-6 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono shadow-xl pointer-events-none flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>💡 提示：点击上图任意位置可精准抓取设备安装坐标 (X, Y, Z)</span>
              </div>
            </div>

            {/* 底部确认栏 */}
            <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0 text-xs">
              <span className="text-slate-400">
                当前准备更新三维定位坐标: <strong className="text-cyan-300 font-mono">X={formFields.positionX ?? 407.49}, Y={formFields.positionY ?? 0.02}, Z={formFields.positionZ ?? -296.85}</strong>
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(false)}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg shadow-cyan-600/30 transition-all"
                >
                  确认保存当前地图坐标
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. 查看操作切换到地图界面 & 弹窗显示设备详细信息 */}
      {mapViewDevice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl border border-sky-500/30 overflow-hidden flex flex-col h-[85vh]">
            {/* 地图驾驶舱顶部 Header */}
            <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                  <MapPin className="w-5 h-5 text-sky-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    {mapViewDevice.name} — 地图物理关联视角
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                      {mapViewDevice.status || '在线工作'}
                    </span>
                  </h3>
                  <p className="text-slate-400 text-xs">实时切换至地图界面，展示设备空间绝对坐标及绑定场景</p>
                </div>
              </div>

              <button
                onClick={() => setMapViewDevice(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 主界面：双栏，左侧全景地图视角，右侧详细参数弹窗卡片 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 左侧：可视化 3D/2D 地图窗口 (与编辑/新增点位采集地图视角完全同步) */}
              <div className="flex-1 relative bg-slate-950 border-r border-slate-800 overflow-hidden flex items-center justify-center select-none">
                {/* 3D 网格透视底纹 */}
                <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>

                {/* 视角与场景类型标识卡片 */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-sky-500/40 text-xs font-mono text-cyan-300 shadow-xl flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>🌐 模式: <strong className="text-white">{mapViewDevice.associationType === 'global' ? '全厂通用场景' : '造船项目场景'}</strong></span>
                    <span className="text-slate-600">|</span>
                    {mapViewDevice.associationType === 'global' ? (
                      <>
                        <span>作业面: <strong className="text-purple-300">{mapViewDevice.workfaceName || '全厂通用作业面'}</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>围栏: <strong className="text-emerald-400 font-mono">🛡️ {mapViewDevice.electricFence || 'EF-SEC-01'}</strong></span>
                      </>
                    ) : (
                      <>
                        <span>分层: <strong className="text-amber-300">{mapViewDevice.modelLevelName || '甲板层'}</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>有限空间: <strong className="text-rose-300">{mapViewDevice.confinedSpaceName || '受限密闭舱室'}</strong></span>
                        <span className="text-slate-600">|</span>
                        <span>围栏: <strong className="text-emerald-400 font-mono">🛡️ {mapViewDevice.electricFence || 'EF-LNG-CS01'}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* 背景场景图 1: 全厂通用模式 -> 船厂全景平面图 */}
                {(mapViewDevice.associationType === 'global' || mapViewDevice.project === '全厂通用设备') ? (
                  <div className="relative w-[780px] h-[480px] border-2 border-purple-500/40 rounded-2xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-950 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
                    {/* 厂区地图头部标语 */}
                    <div className="flex justify-between items-center border-b border-purple-500/30 pb-2">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span>🏢 东南造船厂 - 厂区全景平面图 (全厂公共区域)</span>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400/80">SCALE: 1:2000 | AREA: 1.2 km²</span>
                    </div>

                    {/* 厂区各功能区域简图 */}
                    <div className="grid grid-cols-3 gap-3 flex-1 my-3 text-[11px] font-mono">
                      <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-2.5 flex flex-col justify-between text-purple-300/80">
                        <span className="font-bold text-purple-300">1# ~ 4# 舾装码头区 (海域)</span>
                        <div className="space-y-1 text-[10px] text-slate-400">
                          <div>· 停泊船只: 517-9号 / 145-3号</div>
                          <div>· 门座起重机 #1 ~ #4</div>
                        </div>
                      </div>
                      <div className="bg-sky-900/10 border border-sky-500/20 rounded-lg p-2.5 flex flex-col justify-between text-sky-300/80">
                        <span className="font-bold text-sky-300">1号/2号 船坞总装区 (Dry Dock)</span>
                        <div className="space-y-1 text-[10px] text-slate-400">
                          <div>· 龙门吊 (600T) 轨道覆盖</div>
                          <div>· 坞门泵房控制中心</div>
                        </div>
                      </div>
                      <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-2.5 flex flex-col justify-between text-emerald-300/80">
                        <span className="font-bold text-emerald-300">制造加工与涂装车间群</span>
                        <div className="space-y-1 text-[10px] text-slate-400">
                          <div>· 钢材切割加工厂</div>
                          <div>· 自动化喷砂涂装车间</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-purple-500/30 pt-2">
                      <span className="flex items-center gap-1 text-purple-300">
                        <MapPin className="w-3.5 h-3.5" />
                        厂区平面图：展示全厂通用设备绝对位置标记
                      </span>
                      <span className="font-mono text-slate-500">SE SOUTHEAST SHIPYARD MAIN MAP</span>
                    </div>
                  </div>
                ) : (
                  /* 背景场景图 2: 造船项目模式 -> 3D CAD 船模型图 */
                  <div className="relative w-[820px] h-[480px] border-2 border-sky-500/40 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950/30 to-slate-950 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
                    {/* 船体 CAD 模型头部 */}
                    <div className="flex justify-between items-center border-b border-sky-500/30 pb-2">
                      <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                        <Ship className="w-4 h-4 text-cyan-400" />
                        <span>🚢 3D CAD 数字孪生船型模型 — {mapViewDevice.project || MOCK_PROJECTS[0].name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono border border-sky-500/40">
                        当前分层: {mapViewDevice.modelLevelName || '甲板层'}
                      </span>
                    </div>

                    {/* 船型侧视三维网格骨架 */}
                    <div className="relative flex-1 my-3 border border-sky-500/20 rounded-xl bg-slate-950/60 p-3 flex flex-col justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:28px_28px]"></div>

                      {/* 船头/船尾/舱室 结构分布 */}
                      <div className="relative z-10 flex justify-between items-center h-full text-[10px] font-mono">
                        <div className="w-24 h-full border-r border-dashed border-sky-500/30 p-2 flex flex-col justify-between bg-sky-500/5 text-sky-400">
                          <span className="font-bold">球鼻艏 (Bow)</span>
                          <span className="text-slate-500">#240 肋骨</span>
                        </div>
                        <div className="flex-1 h-full px-4 flex justify-between items-center text-slate-400">
                          <div className="border-r border-sky-500/20 h-full flex flex-col justify-center px-2">1# 货舱 (HOLD 01)</div>
                          <div className="border-r border-sky-500/20 h-full flex flex-col justify-center px-2">2# 货舱 (HOLD 02)</div>
                          <div className="border-r border-sky-500/20 h-full flex flex-col justify-center px-2">3# 货舱 (HOLD 03)</div>
                          <div className="border-r border-sky-500/20 h-full flex flex-col justify-center px-2">4# 货舱 (HOLD 04)</div>
                        </div>
                        <div className="w-28 h-full border-l border-dashed border-sky-500/30 p-2 flex flex-col justify-between bg-sky-500/5 text-sky-400">
                          <span className="font-bold">上层建筑/机舱</span>
                          <span className="text-slate-500">#0 艉柱 (Stern)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <MapPin className="w-3.5 h-3.5" />
                        船模型视角：实时全景展示设备具体安装三维绝对坐标
                      </span>
                      <span className="font-mono text-slate-500">LOA: 335m | Beam: 51m | Depth: 30m</span>
                    </div>
                  </div>
                )}

                {/* 坐标定位指针标记 */}
                <div 
                  className="absolute z-30 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `calc(50% + ${(mapViewDevice.positionX ?? 407.49) / 1.5}px)`,
                    top: `calc(50% + ${(mapViewDevice.positionZ ?? -296.85) / 1.5}px)`
                  }}
                >
                  <div className="relative flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/30 border-2 border-cyan-400 animate-ping absolute -inset-1"></div>
                    <div className="w-9 h-9 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-[0_0_25px_#06b6d4]">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="mt-1.5 bg-slate-900/95 text-cyan-300 border border-cyan-500/80 text-xs font-mono font-bold px-3 py-1 rounded-lg shadow-2xl whitespace-nowrap flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>X: {mapViewDevice.positionX ?? 407.49}, Y: {mapViewDevice.positionY ?? 0.02}, Z: {mapViewDevice.positionZ ?? -296.85}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-6 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono shadow-xl pointer-events-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>🌐 物理视角已与编辑地图采集点位视角完全同步 | 绝对空间坐标展示</span>
                </div>
              </div>

              {/* 右侧：设备详细参数弹窗面板 */}
              <div className="w-80 bg-slate-900 p-5 border-l border-slate-800 overflow-y-auto space-y-4 text-xs text-slate-300">
                <div className="pb-3 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm mb-1">{mapViewDevice.name}</h4>
                  <p className="text-slate-400 text-[11px] font-mono">编码: {mapViewDevice.code || mapViewDevice.sn}</p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1 font-mono">
                    <span className="text-slate-500 text-[10px] block">项目关联模式</span>
                    <span className="text-sky-400 font-bold block">{mapViewDevice.project || '全厂通用设备'}</span>
                  </div>

                  {mapViewDevice.associationType === 'global' ? (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-purple-900/60 space-y-1">
                      <span className="text-slate-500 text-[10px] block">关联全厂作业面</span>
                      <span className="text-purple-300 font-bold block">{mapViewDevice.workfaceName || '全厂通用作业面'}</span>
                    </div>
                  ) : (
                    <>
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1 font-mono">
                        <span className="text-slate-500 text-[10px] block">3D BIM 模型分层</span>
                        <span className="text-amber-300 font-bold block">{mapViewDevice.modelLevelName || '甲板层'}</span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-rose-900/60 space-y-1">
                        <span className="text-slate-500 text-[10px] block">关联有限空间 (受限舱室)</span>
                        <span className="text-rose-300 font-bold block">{mapViewDevice.confinedSpaceName || '标准工程舱室'}</span>
                      </div>
                    </>
                  )}

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-900/60 space-y-1 font-mono text-cyan-300">
                    <span className="text-slate-500 text-[10px] block">三维空间坐标 (X / Y / Z)</span>
                    <span className="font-bold text-xs">
                      X: {mapViewDevice.positionX ?? 350.2}, Y: {mapViewDevice.positionY ?? 10.1}, Z: {mapViewDevice.positionZ ?? -150.4}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="text-slate-500 text-[10px] block">设备属性要素明细</span>
                    <div className="flex justify-between text-slate-400">
                      <span>安装场所:</span>
                      <strong className="text-white">{mapViewDevice.installationSite || '室外'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>回收状态:</span>
                      <strong className="text-emerald-400">{mapViewDevice.recycleStatus || '设备安装'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>信号丢失:</span>
                      <strong className="text-white">{mapViewDevice.signalLossTime ?? 5} 分钟</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>联动电子围栏:</span>
                      <strong className="text-cyan-300 font-mono">{mapViewDevice.electricFence || (mapViewDevice.associationType === 'global' ? 'EF-SEC-01' : 'EF-LNG-CS01')}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => setMapViewDevice(null)}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    返回设备管理表单
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
