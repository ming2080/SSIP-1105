/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 智慧船厂 - 船舶项目登船点配置与上下船感应规则数据模型
 * 业务定位：
 * 1. 按船舶登录口（登船点）成对配置地面与船上感应激励器设备。
 * 2. 具备方向性识别规则：地面 -> 船上 判定为登船，船上 -> 地面 判定为下船。
 * 3. 支持单艘船舶配置多个登船点，每个登船点均由地面点位和船上点位配对组成。
 */

import { MOCK_EXCITER_DEVICES } from './cabinConfigData';

export type BoardingDirectionMode = 'bidirectional' | 'board_only' | 'disembark_only';

export interface BoardingExciterOption {
  id: string;
  code: string;
  name: string;
  location: string;
  status: '在线' | '离线';
  frequency?: string;
  coverageRange?: string;
  projectId?: string;
  projectName?: string;
}

export interface BoardingPointConfigItem {
  id: string;
  projectId: string;
  code: string;              // 登船点编号，如 GATE-01
  name: string;              // 登船点名称，如 1# 左舷主登船梯口
  locationDesc: string;      // 登录口位置描述
  enabled: boolean;          // 是否启用该登船点上下船统计规则
  directionMode: BoardingDirectionMode; // 方向性判定规则模式
  sequenceWindowSec: number; // 配对顺序触发有效时间窗（秒）
  groundDeviceIds: string[]; // 地面点位关联的激励器设备ID列表
  shipDeviceIds: string[];   // 船上点位关联的激励器设备ID列表
  updatedAt: string;
}

export const DIRECTION_MODE_OPTIONS: {
  value: BoardingDirectionMode;
  label: string;
  shortLabel: string;
  boardActive: boolean;
  disembarkActive: boolean;
  ruleSummary: string;
}[] = [
  {
    value: 'bidirectional',
    label: '双向识别（标准）',
    shortLabel: '双向：登船 / 下船',
    boardActive: true,
    disembarkActive: true,
    ruleSummary: '地面 → 船上 判定为登船；船上 → 地面 判定为下船'
  },
  {
    value: 'board_only',
    label: '单向登船通道',
    shortLabel: '单向：仅登船',
    boardActive: true,
    disembarkActive: false,
    ruleSummary: '仅启用 地面 → 船上 判定为登船（逆向不计入下船）'
  },
  {
    value: 'disembark_only',
    label: '单向下船通道',
    shortLabel: '单向：仅下船',
    boardActive: false,
    disembarkActive: true,
    ruleSummary: '仅启用 船上 → 地面 判定为下船（逆向不计入登船）'
  }
];

export const BOARDING_POINTS_STORAGE_KEY = 'ship_boarding_points_v1';
export const SHARED_EXCITERS_STORAGE_KEY = 'iot_exciter_devices_v1';

// 预设登船点配套低频激励器候选库（覆盖码头/船台地面侧与船体甲板侧）
export const BOARDING_EXCITER_CATALOG: BoardingExciterOption[] = [
  {
    id: 'EX-04',
    code: 'EX-BOARD-02',
    name: '左舷主舷梯地面侧激励器',
    location: '左舷登船舷梯下口（船台地面侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m 梯口界定',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰'
  },
  {
    id: 'EX-03',
    code: 'EX-BOARD-01',
    name: '左舷主舷梯船上侧激励器',
    location: '左舷登船舷梯上口（主甲板侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m 梯口界定',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰'
  },
  {
    id: 'EX-BP-03',
    code: 'EX-BOARD-03',
    name: '船艉施工通道地面侧激励器',
    location: '船艉临时登船梯下端（船台地面侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.0m 梯口界定',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰'
  },
  {
    id: 'EX-BP-04',
    code: 'EX-BOARD-04',
    name: '船艉施工通道船上侧激励器',
    location: '船艉临时登船梯上端（艉甲板侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.0m 梯口界定',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰'
  },
  {
    id: 'EX-BP-05',
    code: 'EX-BOARD-05',
    name: '右舷备用舷梯地面侧激励器',
    location: '右舷登船梯下口（地面通道侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.2m'
  },
  {
    id: 'EX-BP-06',
    code: 'EX-BOARD-06',
    name: '右舷备用舷梯船上侧激励器',
    location: '右舷登船梯上口（主甲板侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.2m'
  },
  {
    id: 'EX-BP-07',
    code: 'EX-BOARD-07',
    name: '2号码头主舷梯地面侧激励器',
    location: '2号码头1#舷梯下口（码头地面侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m',
    projectId: 'PRJ-2026-BOX12',
    projectName: '24,000 TEU 超大型集装箱船'
  },
  {
    id: 'EX-BP-08',
    code: 'EX-BOARD-08',
    name: '2号码头主舷梯船上侧激励器',
    location: '2号码头1#舷梯上口（集装箱船甲板侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m',
    projectId: 'PRJ-2026-BOX12',
    projectName: '24,000 TEU 超大型集装箱船'
  },
  {
    id: 'EX-BP-09',
    code: 'EX-BOARD-09',
    name: '3号码头舾装舷梯地面侧激励器',
    location: '3号码头登船梯下口（码头地面侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m',
    projectId: 'PRJ-2026-TANK02',
    projectName: '30万吨 VLCC 超大型原油船'
  },
  {
    id: 'EX-BP-10',
    code: 'EX-BOARD-10',
    name: '3号码头舾装舷梯船上侧激励器',
    location: '3号码头登船梯上口（VLCC甲板侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '2.5m',
    projectId: 'PRJ-2026-TANK02',
    projectName: '30万吨 VLCC 超大型原油船'
  },
  {
    id: 'EX-BP-11',
    code: 'EX-BOARD-11',
    name: '船艏脚手架梯道地面侧激励器',
    location: '船艏施工脚手架底层入口（地面侧）',
    status: '在线',
    frequency: '125KHz 低频门禁',
    coverageRange: '1.8m'
  },
  {
    id: 'EX-BP-12',
    code: 'EX-BOARD-12',
    name: '船艏脚手架梯道船上侧激励器',
    location: '船艏施工脚手架顶层入口（船艏甲板侧）',
    status: '离线',
    frequency: '125KHz 低频门禁',
    coverageRange: '1.8m'
  }
];

// 获取系统全量可用激励器设备列表（合并设备管理同步的激励器 + 登船点专用激励器 + 舱室激励器）
export const getAllAvailableExciterDevices = (): BoardingExciterOption[] => {
  const map = new Map<string, BoardingExciterOption>();

  // 1. 优先读取设备管理模块同步的实时激励器列表
  try {
    const raw = localStorage.getItem(SHARED_EXCITERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item && item.id) {
            map.set(item.id, {
              id: item.id,
              code: item.code || item.id,
              name: item.name || `激励器 ${item.id}`,
              location: item.location || '未填写安装位置',
              status: item.status === '离线' ? '离线' : '在线',
              coverageRange: item.coverageRange ? `${String(item.coverageRange).replace(/m$/i, '')}m` : undefined,
              projectId: item.projectId,
              projectName: item.project
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('Failed to read synced exciter devices', err);
  }

  // 2. 补充登船点专用预置激励器
  BOARDING_EXCITER_CATALOG.forEach(dev => {
    if (!map.has(dev.id)) {
      map.set(dev.id, dev);
    }
  });

  // 3. 补充通用舱室激励器库
  MOCK_EXCITER_DEVICES.forEach(dev => {
    if (!map.has(dev.id)) {
      map.set(dev.id, {
        id: dev.id,
        code: dev.code,
        name: dev.name,
        location: dev.location,
        status: dev.status,
        frequency: dev.frequency,
        coverageRange: dev.coverageRange
      });
    }
  });

  return Array.from(map.values());
};

// 同步设备管理中的激励器列表到共享存储
export const syncExcitersToSharedStorage = (exciters: any[]) => {
  try {
    localStorage.setItem(SHARED_EXCITERS_STORAGE_KEY, JSON.stringify(exciters));
  } catch (err) {
    console.error('Failed to sync exciters to shared storage', err);
  }
};

// 预置各船舶项目默认登船点配置
export const INITIAL_PROJECT_BOARDING_POINTS: Record<string, BoardingPointConfigItem[]> = {
  'PRJ-2026-LNG01': [
    {
      id: 'BP-LNG-01',
      projectId: 'PRJ-2026-LNG01',
      code: 'GATE-01',
      name: '1# 左舷主登船梯口',
      locationDesc: '1号船台左舷中段主登船舷梯（人员常规上下船主通道）',
      enabled: true,
      directionMode: 'bidirectional',
      sequenceWindowSec: 30,
      groundDeviceIds: ['EX-04'],
      shipDeviceIds: ['EX-03'],
      updatedAt: '2026-10-29 17:20:00'
    },
    {
      id: 'BP-LNG-02',
      projectId: 'PRJ-2026-LNG01',
      code: 'GATE-02',
      name: '2# 船艉施工登船通道',
      locationDesc: '1号船台船艉舾装脚手架登船梯口',
      enabled: true,
      directionMode: 'bidirectional',
      sequenceWindowSec: 30,
      groundDeviceIds: ['EX-BP-03'],
      shipDeviceIds: ['EX-BP-04'],
      updatedAt: '2026-10-29 17:25:00'
    }
  ],
  'PRJ-2026-BOX12': [
    {
      id: 'BP-BOX-01',
      projectId: 'PRJ-2026-BOX12',
      code: 'GATE-01',
      name: '1# 2号码头主登船梯口',
      locationDesc: '2号码头左舷舾装主舷梯登录口',
      enabled: true,
      directionMode: 'bidirectional',
      sequenceWindowSec: 30,
      groundDeviceIds: ['EX-BP-07'],
      shipDeviceIds: ['EX-BP-08'],
      updatedAt: '2026-10-29 16:40:00'
    }
  ],
  'PRJ-2026-TANK02': [
    {
      id: 'BP-TANK-01',
      projectId: 'PRJ-2026-TANK02',
      code: 'GATE-01',
      name: '1# 3号码头主登船梯口',
      locationDesc: '3号码头舾装登船主舷梯',
      enabled: true,
      directionMode: 'bidirectional',
      sequenceWindowSec: 30,
      groundDeviceIds: ['EX-BP-09'],
      shipDeviceIds: ['EX-BP-10'],
      updatedAt: '2026-10-29 16:15:00'
    }
  ]
};

// 读取指定船舶项目的登船点配置列表
export const getStoredBoardingPoints = (projectId: string): BoardingPointConfigItem[] => {
  try {
    const raw = localStorage.getItem(BOARDING_POINTS_STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, BoardingPointConfigItem[]> = JSON.parse(raw);
      if (Array.isArray(parsed[projectId])) {
        return parsed[projectId];
      }
    }
  } catch (err) {
    console.error('Failed to load stored boarding points', err);
  }

  if (INITIAL_PROJECT_BOARDING_POINTS[projectId]) {
    return INITIAL_PROJECT_BOARDING_POINTS[projectId].map(item => ({
      ...item,
      groundDeviceIds: [...item.groundDeviceIds],
      shipDeviceIds: [...item.shipDeviceIds]
    }));
  }

  return [
    {
      id: `BP-${projectId}-01`,
      projectId,
      code: 'GATE-01',
      name: '1# 主登船梯口',
      locationDesc: '船舶主舷梯人员上下船登录口',
      enabled: true,
      directionMode: 'bidirectional',
      sequenceWindowSec: 30,
      groundDeviceIds: ['EX-BP-05'],
      shipDeviceIds: ['EX-BP-06'],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
  ];
};

// 保存指定船舶项目的登船点配置列表
export const saveStoredBoardingPoints = (projectId: string, list: BoardingPointConfigItem[]) => {
  try {
    let all: Record<string, BoardingPointConfigItem[]> = {};
    const raw = localStorage.getItem(BOARDING_POINTS_STORAGE_KEY);
    if (raw) {
      all = JSON.parse(raw);
    }
    all[projectId] = list;
    localStorage.setItem(BOARDING_POINTS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to save boarding points', err);
  }
};
