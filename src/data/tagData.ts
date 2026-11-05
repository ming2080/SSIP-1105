/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 定位标签数据管理服务
 * 管理船厂 UWB/RFID 定位标签档案及收发状态
 * 支持与人员管理模块（PersonnelManagement / TagIssueModal）的双向实时联动
 */

export type BatteryLevel = 'normal' | 'low'; // 电量信息只有两种：1. 正常电量  2. 低电量

export interface LocationTagItem {
  id: string;
  tagCode: string; // 标签编码 (如 2, FF260805, UWB-1001)
  tagStatus: 'used' | 'unused'; // 标签状态: 已使用 (蓝字) | 未使用 (红字)
  empId?: string; // 绑定的人员工号/empID
  personName?: string; // 绑定的人员姓名，未绑定为 '-'
  deptName?: string; // 人员所属部门
  batteryLevel?: BatteryLevel | null; // 电量情况: normal(正常电量) | low(低电量) | null(-) 由设备上报产生，不可手动创建编辑
  deviceStatus: 'online' | 'offline'; // 设备状态: 在线 | 离线 由设备上报产生，不可手动创建编辑
  lastUpdateTime?: string; // 最后更新时间 (如 2026-09-15 11:12:34)
  remark?: string; // 备注
}

export const TAGS_STORAGE_KEY = 'shipyard_location_tags';

// 初始定位标签数据（包含附图所示示例及正常/低电量上报示范）
export const INITIAL_TAG_ITEMS: LocationTagItem[] = [
  {
    id: 'TAG-INIT-001',
    tagCode: '2',
    tagStatus: 'unused',
    personName: '-',
    batteryLevel: null,
    deviceStatus: 'offline',
    lastUpdateTime: '',
    remark: '附图预置未绑定标签'
  },
  {
    id: 'TAG-INIT-002',
    tagCode: 'FF260805',
    tagStatus: 'used',
    empId: 'EMP-1004',
    personName: 'FF260805',
    deptName: '制造部//船体装配二班',
    batteryLevel: null,
    deviceStatus: 'offline',
    lastUpdateTime: '2026-09-15 11:12:34',
    remark: '附图预置已绑定标签'
  },
  {
    id: 'TAG-INIT-003',
    tagCode: 'UWB-1001',
    tagStatus: 'used',
    empId: 'EMP-1001',
    personName: '陈建国',
    deptName: '制造部//船体电焊一组',
    batteryLevel: 'normal',
    deviceStatus: 'online',
    lastUpdateTime: '2026-09-15 10:45:12',
    remark: '标准防爆工牌卡'
  },
  {
    id: 'TAG-INIT-004',
    tagCode: 'UWB-1002',
    tagStatus: 'used',
    empId: 'EMP-1002',
    personName: '林少伟',
    deptName: '制造部//船体电焊一组',
    batteryLevel: 'low', // 演示低电量红字
    deviceStatus: 'online',
    lastUpdateTime: '2026-09-15 10:50:08',
    remark: '标准防爆工牌卡'
  },
  {
    id: 'TAG-INIT-005',
    tagCode: 'UWB-1003',
    tagStatus: 'used',
    empId: 'EMP-1003',
    personName: '张志强',
    deptName: '制造部//船体装配二班',
    batteryLevel: 'normal',
    deviceStatus: 'online',
    lastUpdateTime: '2026-09-15 09:30:25',
    remark: '安全帽型定位卡'
  },
  {
    id: 'TAG-INIT-006',
    tagCode: 'UWB-2021',
    tagStatus: 'unused',
    personName: '-',
    batteryLevel: 'normal',
    deviceStatus: 'offline',
    lastUpdateTime: '2026-09-14 16:20:00',
    remark: '高精度防爆工牌备用库'
  },
  {
    id: 'TAG-INIT-007',
    tagCode: 'UWB-2022',
    tagStatus: 'unused',
    personName: '-',
    batteryLevel: 'low', // 演示备用库低电量预警
    deviceStatus: 'offline',
    lastUpdateTime: '2026-09-14 16:20:00',
    remark: '高精度防爆工牌备用库'
  },
  {
    id: 'TAG-INIT-008',
    tagCode: 'UWB-2025',
    tagStatus: 'unused',
    personName: '-',
    batteryLevel: 'normal',
    deviceStatus: 'offline',
    lastUpdateTime: '2026-09-13 14:10:00',
    remark: '安全帽内置定位卡'
  },
  {
    id: 'TAG-INIT-009',
    tagCode: 'UWB-2028',
    tagStatus: 'unused',
    personName: '-',
    batteryLevel: 'normal',
    deviceStatus: 'offline',
    lastUpdateTime: '2026-09-13 14:10:00',
    remark: '高精度工牌卡备用'
  },
  {
    id: 'TAG-INIT-010',
    tagCode: 'TAG-9011',
    tagStatus: 'used',
    empId: 'EMP-1005',
    personName: '王大锤',
    deptName: '机电工程部//主电缆敷设班',
    batteryLevel: 'normal',
    deviceStatus: 'online',
    lastUpdateTime: '2026-09-15 11:05:18',
    remark: '船坞专用定位卡'
  },
  {
    id: 'TAG-INIT-011',
    tagCode: 'TAG-9015',
    tagStatus: 'unused',
    personName: '-',
    batteryLevel: null,
    deviceStatus: 'offline',
    lastUpdateTime: '',
    remark: '备用定位标签'
  }
];

/**
 * 获取本地存储的定位标签数据
 */
export function getStoredTags(): LocationTagItem[] {
  try {
    const saved = localStorage.getItem(TAGS_STORAGE_KEY);
    if (saved) {
      const parsed: any[] = JSON.parse(saved);
      // 兼容历史老数据格式：若存在旧的 battery 数字，则自动映射为 normal/low
      return parsed.map(item => {
        let batteryLevel: BatteryLevel | null = item.batteryLevel ?? null;
        if (batteryLevel === undefined || batteryLevel === null) {
          if (typeof item.battery === 'number') {
            batteryLevel = item.battery < 20 ? 'low' : 'normal';
          }
        }
        return {
          ...item,
          batteryLevel
        };
      });
    }
  } catch (err) {
    console.error('Failed to parse tags from localStorage', err);
  }

  // 初次加载时保存预置数据
  saveStoredTags(INITIAL_TAG_ITEMS);
  return INITIAL_TAG_ITEMS;
}

/**
 * 保存定位标签数据并触发全局事件广播
 */
export function saveStoredTags(tags: LocationTagItem[]): void {
  try {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
    window.dispatchEvent(new CustomEvent('tags_updated', { detail: tags }));
  } catch (err) {
    console.error('Failed to save tags to localStorage', err);
  }
}

/**
 * 获取可用于发放给人员的空闲定位标签
 */
export function getAvailableTags(): LocationTagItem[] {
  const allTags = getStoredTags();
  return allTags.filter(t => t.tagStatus === 'unused');
}

/**
 * 从人员收发动作同步更新标签池（在人员发卡、换卡、解绑时调用）
 */
export function syncTagOnPersonnelIssue(
  action: 'bind' | 'unbind' | 'change',
  empId: string,
  personName: string,
  newTagCode?: string,
  oldTagCode?: string
): void {
  const currentTags = getStoredTags();
  const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
  let hasChanged = false;

  let updatedTags = currentTags.map(tag => {
    // 如果是解绑或者换卡，将旧标签释放置为未使用
    if (oldTagCode && tag.tagCode === oldTagCode) {
      hasChanged = true;
      return {
        ...tag,
        tagStatus: 'unused' as const,
        empId: undefined,
        personName: '-',
        lastUpdateTime: nowStr,
        deviceStatus: 'offline' as const
      };
    }
    // 如果绑定新卡，将新标签置为已使用
    if (newTagCode && tag.tagCode === newTagCode) {
      hasChanged = true;
      return {
        ...tag,
        tagStatus: 'used' as const,
        empId,
        personName,
        lastUpdateTime: nowStr
      };
    }
    return tag;
  });

  // 如果绑定的新标签不在当前池中，自动为系统新增该标签
  if (newTagCode && !currentTags.some(t => t.tagCode === newTagCode)) {
    hasChanged = true;
    updatedTags.push({
      id: `TAG-${Date.now()}`,
      tagCode: newTagCode,
      tagStatus: 'used',
      empId,
      personName,
      batteryLevel: 'normal',
      deviceStatus: 'online',
      lastUpdateTime: nowStr,
      remark: '人员管理发卡自动登记'
    });
  }

  if (hasChanged) {
    saveStoredTags(updatedTags);
  }
}

/**
 * 从定位标签管理端同步更新人员档案（在标签端发卡、解绑、改码时调用）
 */
export function syncPersonnelOnTagChange(
  tagCode: string,
  action: 'bind' | 'unbind' | 'code_changed',
  targetEmpId?: string,
  newTagCode?: string
): void {
  try {
    const saved = localStorage.getItem('shipyard_personnel_list');
    if (!saved) return;
    const personnelList = JSON.parse(saved);
    let changed = false;

    const updatedList = personnelList.map((person: any) => {
      // 1. 解绑 (支持标签卡号匹配或人员工号精准匹配)
      if (action === 'unbind') {
        const isTagMatch = person.tagCode && person.tagCode.trim().toLowerCase() === tagCode.trim().toLowerCase();
        const isEmpMatch = Boolean(targetEmpId && person.empID === targetEmpId);
        if (isTagMatch || isEmpMatch) {
          changed = true;
          return {
            ...person,
            tagStatus: 'unbound',
            tagCode: undefined,
            tagBattery: undefined,
            tagBindTime: undefined
          };
        }
      }

      // 2. 标签编码变更
      if (action === 'code_changed' && person.tagCode === tagCode && newTagCode) {
        changed = true;
        return {
          ...person,
          tagCode: newTagCode
        };
      }

      // 3. 绑定至某人
      if (action === 'bind' && targetEmpId && person.empID === targetEmpId) {
        changed = true;
        return {
          ...person,
          tagStatus: 'bound',
          tagCode,
          tagBattery: 88,
          tagBindTime: new Date().toLocaleString('zh-CN', { hour12: false })
        };
      }

      return person;
    });

    if (changed) {
      localStorage.setItem('shipyard_personnel_list', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('personnel_updated', { detail: updatedList }));
    }
  } catch (err) {
    console.error('Failed to sync personnel from tag operation', err);
  }
}
