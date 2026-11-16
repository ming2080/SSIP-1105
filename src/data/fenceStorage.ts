/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 电子围栏共享数据源与持久化存储服务
 * 用于打通「电子围栏管理」与「告警策略配置（如人员超员关联电子围栏上限人数）」
 */

export interface FenceData {
  id: string;
  code: string;
  name: string;
  scopeType: 'yard' | 'project'; // 归属范围：厂区公共 vs 项目工程
  yardArea?: string; // 厂区功能分区
  projectId?: string; // 关联造船项目ID
  projectName: string; // 显示名称
  projectPhase?: string; // 关联工程阶段
  projectSection?: string; // 关联船体舱段/部位
  modelLevel?: string; // 船型 3D BIM 模型分层代码 ('deck' | 'middle' | 'bottom' | 'engine' | 'bridge')
  modelLevelName?: string; // 船型模型分层名称
  type: string;
  maxCapacity?: number; // 区域上限人数（定员上限，用于人员超员告警判定）
  color: string;
  shape: string;
  points: string;
  status: 'active' | 'inactive';
  dangerLevel: 'high' | 'medium' | 'low';
  deviceIds: string[];
  devices: { id: string; name: string; type: string; status: string }[];
  todayViolations: number;
}

const FENCE_STORAGE_KEY = 'shipyard_electronic_fences_v1';

// 初始内置电子围栏数据池 (包含厂区公共和船舶项目关联，含区域上限人数)
export const INITIAL_FENCES: FenceData[] = [
  // 1. 厂区公共围栏 (属于厂区设施，全厂通用)
  {
    id: 'FENCE-YARD-01',
    code: 'EF-2026-001',
    name: '龙门吊核心起重作业警戒区',
    scopeType: 'yard',
    yardArea: '龙门吊核心起重作业带',
    projectId: 'yard',
    projectName: '东南造船厂 (龙门吊作业带)',
    type: '吊装警戒区',
    maxCapacity: 12,
    color: '#d946ef',
    shape: '多边形',
    points: '24.3,22.6 41.9,15.6 50.2,25.4 54.6,36.6 48.5,37.7 28.2,36.6 25.4,25.6',
    status: 'active',
    dangerLevel: 'high',
    deviceIds: ['DEV-BS-02', 'DEV-ALM-01'],
    devices: [
      { id: 'DEV-BS-02', name: '龙门吊G-01作业面基站', type: '定位基站', status: '在线' },
      { id: 'DEV-ALM-01', name: '大件吊装防碰高分贝声光报警器', type: '声光报警器', status: '在线' }
    ],
    todayViolations: 2
  },
  {
    id: 'FENCE-YARD-02',
    code: 'EF-2026-002',
    name: '钢材下料与分段预处理区',
    scopeType: 'yard',
    yardArea: '钢材下料与分段预处理车间',
    projectId: 'yard',
    projectName: '东南造船厂 (钢材下料车间)',
    type: '作业区',
    maxCapacity: 25,
    color: '#f59e0b',
    shape: '多边形',
    points: '26.9,56.9 49.4,57.7 54.4,69.0 61.0,79.7 27.4,82.8 25.8,69.6',
    status: 'active',
    dangerLevel: 'medium',
    deviceIds: ['DEV-BS-01'],
    devices: [
      { id: 'DEV-BS-01', name: '1#船台高精度定位主基站', type: '定位基站', status: '在线' }
    ],
    todayViolations: 0
  },
  {
    id: 'FENCE-YARD-03',
    code: 'EF-2026-003',
    name: '3号码头舾装泊位水域管制区',
    scopeType: 'yard',
    yardArea: '3号码头舾装泊位',
    projectId: 'yard',
    projectName: '东南造船厂 (3号码头)',
    type: '禁入区',
    maxCapacity: 15,
    color: '#06b6d4',
    shape: '多边形',
    points: '71.7,23.7 83.2,18.7 88.2,39.6 75.0,47.3 70.0,35.2',
    status: 'active',
    dangerLevel: 'high',
    deviceIds: ['DEV-BS-03'],
    devices: [
      { id: 'DEV-BS-03', name: '舾装码头水域微基站', type: '定位基站', status: '在线' }
    ],
    todayViolations: 1
  },
  {
    id: 'FENCE-YARD-04',
    code: 'EF-2026-004',
    name: '1#船台分段合拢滑道作业区',
    scopeType: 'yard',
    yardArea: '1#大型船台合拢滑道区',
    projectId: 'yard',
    projectName: '东南造船厂 (1#船台)',
    type: '作业区',
    maxCapacity: 30,
    color: '#10b981',
    shape: '多边形',
    points: '6.3,5.0 20.6,5.0 23.9,16.5 10.7,17.6 6.3,13.8',
    status: 'active',
    dangerLevel: 'low',
    deviceIds: [],
    devices: [],
    todayViolations: 0
  },

  // 2. LNG船项目关联围栏
  {
    id: 'FENCE-LNG-01',
    code: 'EF-LNG-001',
    name: '1#液货舱绝热合拢受限空间',
    scopeType: 'project',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船',
    projectPhase: '密闭空间与绝热层铺设',
    projectSection: '1#~4#液货舱 / 密闭舱室',
    modelLevel: 'bottom',
    modelLevelName: '底舱层 (双层底/压载密闭舱)',
    type: '受限空间',
    maxCapacity: 8,
    color: '#06b6d4',
    shape: '多边形',
    points: '16,28 34,28 38,54 14,54',
    status: 'active',
    dangerLevel: 'high',
    deviceIds: ['DEV-GAS-01'],
    devices: [
      { id: 'DEV-GAS-01', name: '2#密闭货舱四合一气体检测仪', type: '气体检测仪', status: '在线' }
    ],
    todayViolations: 3
  },
  {
    id: 'FENCE-LNG-02',
    code: 'EF-LNG-002',
    name: '主甲板高压管路动火作业区',
    scopeType: 'project',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船',
    projectPhase: '主甲板管系与电气舾装',
    projectSection: '主甲板及管架区域',
    modelLevel: 'deck',
    modelLevelName: '甲板层 (主甲板/露天作业区)',
    type: '危险区',
    maxCapacity: 18,
    color: '#ef4444',
    shape: '多边形',
    points: '40,24 64,24 68,52 36,52',
    status: 'active',
    dangerLevel: 'high',
    deviceIds: ['DEV-ALM-01'],
    devices: [
      { id: 'DEV-ALM-01', name: '大件吊装防碰高分贝声光报警器', type: '声光报警器', status: '在线' }
    ],
    todayViolations: 1
  },

  // 3. 集装箱船项目关联围栏
  {
    id: 'FENCE-CTN-01',
    code: 'EF-CTN-001',
    name: '艏楼导轨架安装禁区',
    scopeType: 'project',
    projectId: 'PRJ-2026-CTN02',
    projectName: '24000TEU 超大型集装箱船',
    projectPhase: '船体合拢与主结构搭载',
    projectSection: '艏楼与导轨架安装区',
    modelLevel: 'deck',
    modelLevelName: '甲板层 (主甲板/露天作业区)',
    type: '禁入区',
    maxCapacity: 10,
    color: '#f59e0b',
    shape: '多边形',
    points: '18,30 38,30 42,58 15,58',
    status: 'active',
    dangerLevel: 'medium',
    deviceIds: [],
    devices: [],
    todayViolations: 0
  },

  // 4. VLCC原油船项目关联围栏
  {
    id: 'FENCE-VLCC-01',
    code: 'EF-VLCC-001',
    name: '泵舱与货油舱受限空间',
    scopeType: 'project',
    projectId: 'PRJ-2026-VLCC03',
    projectName: '30万吨级 超大型原油船(VLCC)',
    projectPhase: '密闭舱室涂装与动火作业',
    projectSection: '机舱双层底及泵舱区',
    modelLevel: 'engine',
    modelLevelName: '机舱动力区 (主机/辅机与管系舱)',
    type: '受限空间',
    maxCapacity: 10,
    color: '#ef4444',
    shape: '多边形',
    points: '32,26 62,26 65,56 30,56',
    status: 'active',
    dangerLevel: 'high',
    deviceIds: ['DEV-GAS-02'],
    devices: [
      { id: 'DEV-GAS-02', name: '涂装车间VOC气体分析仪', type: '气体检测仪', status: '在线' }
    ],
    todayViolations: 2
  },

  // 5. 散货船项目关联围栏
  {
    id: 'FENCE-BULK-01',
    code: 'EF-BULK-001',
    name: '船台大件总组吊装警戒',
    scopeType: 'project',
    projectId: 'PRJ-2026-BULK04',
    projectName: '8.2万吨 卡姆萨尔型散货船',
    projectPhase: '分段制作与预装配',
    projectSection: '全船通用作业面',
    modelLevel: 'middle',
    modelLevelName: '中舱层 (货舱上部/中层平台)',
    type: '吊装警戒区',
    maxCapacity: 16,
    color: '#d946ef',
    shape: '多边形',
    points: '22,25 58,25 62,55 20,55',
    status: 'active',
    dangerLevel: 'high',
    deviceIds: ['DEV-ALM-01'],
    devices: [
      { id: 'DEV-ALM-01', name: '大件吊装防碰高分贝声光报警器', type: '声光报警器', status: '在线' }
    ],
    todayViolations: 0
  }
];

export function getStoredFences(): FenceData[] {
  try {
    const raw = localStorage.getItem(FENCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f: FenceData) => ({
          ...f,
          maxCapacity: typeof f.maxCapacity === 'number' && f.maxCapacity > 0 ? f.maxCapacity : 20
        }));
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored fences, using initial fences', e);
  }
  try {
    localStorage.setItem(FENCE_STORAGE_KEY, JSON.stringify(INITIAL_FENCES));
  } catch {
    // ignore
  }
  return INITIAL_FENCES;
}

export function saveStoredFences(fences: FenceData[]): void {
  try {
    localStorage.setItem(FENCE_STORAGE_KEY, JSON.stringify(fences));
    window.dispatchEvent(new CustomEvent('shipyard_fences_updated', { detail: { fences } }));
  } catch (e) {
    console.error('Failed to save fences', e);
  }
}
