import React from 'react';

export type BerthCategory = 'berth_pier' | 'berth_slipway';

export type SlotShipTypeAllowed = 'large_and_small' | 'small_only';

export interface OccupiedShip {
  id: string;
  name: string;
  shipType: string;
  shipCode: string;
  stage: string;
  startDate: string; // 占用起始日期，格式 YYYY-MM-DD
  endDate: string;   // 占用截止日期，格式 YYYY-MM-DD
  isSmallShip?: boolean;
}

export interface BerthSubSlot {
  slotId: string; // 唯一标识，如 'berth-1-slot-1'
  slotNumber: number; // 顺序号 1, 2, 3
  slotName: string; // 如 '1号位', '2号位', '3号位'
  allowedType: SlotShipTypeAllowed; // 'large_and_small' (可停大船/小船) | 'small_only' (仅限小船)
  allowedTypeLabel: string; // '大船 / 小船' | '仅限小船'
  isOccupied: boolean; // 是否被占用
  occupiedShip?: OccupiedShip; // 占用船舶信息
}

export interface BerthAreaConfig {
  id: string;
  code: number; // 1 ~ 6
  name: string; // 完整名称
  shortName: string; // 简短名称
  category: BerthCategory;
  categoryName: string; // '移动码头' | '平船台'
  maxCapacity: number; // 容量上限
  ruleDescription: string; // 规则文字说明
  restrictionNote?: string; // 特殊限制说明
  isSmallShipOnly?: boolean; // 整个区域是否仅限小船
  // 二级停泊位列表
  slots: BerthSubSlot[];
  // 在 1:1 船厂俯视背景图中的绝对百分比位置 (Top, Left, Width, Height)
  rect: {
    top: number; // %
    left: number; // %
    width: number; // %
    height: number; // %
  };
  // 标签定位偏移
  labelPos: {
    top: number; // %
    left: number; // %
  };
}

// 时间重叠判断函数：判断两段日期区间 [startA, endA] 与 [startB, endB] 是否存在交集重叠
export function isDateRangeOverlap(startA?: string, endA?: string, startB?: string, endB?: string): boolean {
  if (!startA || !endA || !startB || !endB) return true; // 缺失日期时保守视为冲突
  return startA <= endB && endA >= startB;
}

// 6 个全新可停泊区域的配置定义（严格按照用户规则与数据标准）
export const BERTH_AREAS: BerthAreaConfig[] = [
  {
    id: 'berth-1',
    code: 1,
    name: '1号码头（新码头）',
    shortName: '1号码头（新码头）',
    category: 'berth_pier',
    categoryName: '移动码头',
    maxCapacity: 3,
    ruleDescription: '共3个停泊位，可停3艘船。同一位置只可停一艘大船或一艘小船。',
    restrictionNote: '1号码头（新码头）：深水综合舾装码头，配置重型岸吊与高压岸电，同一位置可停1艘大船或1艘小船',
    isSmallShipOnly: false,
    rect: {
      top: 0.8,
      left: 63.5,
      width: 18.2,
      height: 21.8
    },
    labelPos: {
      top: 11.2,
      left: 74.5
    },
    slots: [
      {
        slotId: 'berth-1-slot-1',
        slotNumber: 1,
        slotName: '1号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: true,
        occupiedShip: {
          id: 'PRJ-2026-CTN03',
          name: '15000TEU 大型集装箱船',
          shipType: '大型集装箱船',
          shipCode: 'HULL-CTN-150',
          stage: '系泊调试',
          startDate: '2026-05-15',
          endDate: '2027-02-28'
        }
      },
      {
        slotId: 'berth-1-slot-2',
        slotNumber: 2,
        slotName: '2号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: true,
        occupiedShip: {
          id: 'PRJ-2026-PSV01',
          name: '75M 动力定位平台供应船',
          shipType: '海洋工程PSV',
          shipCode: 'HULL-PSV-075',
          stage: '交船交付',
          startDate: '2026-07-01',
          endDate: '2026-12-31',
          isSmallShip: true
        }
      },
      {
        slotId: 'berth-1-slot-3',
        slotNumber: 3,
        slotName: '3号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: false
      }
    ]
  },
  {
    id: 'berth-2',
    code: 2,
    name: '2号码头',
    shortName: '2号码头',
    category: 'berth_pier',
    categoryName: '移动码头',
    maxCapacity: 1,
    ruleDescription: '共1个号位，只能停泊一艘小船。',
    restrictionNote: '2号码头：专用小型泊位，仅限停泊1艘小船（如拖轮、工作艇、PSV等），严禁停泊大船',
    isSmallShipOnly: true,
    rect: {
      top: 34.5,
      left: 76.5,
      width: 7.2,
      height: 7.2
    },
    labelPos: {
      top: 38.0,
      left: 80.0
    },
    slots: [
      {
        slotId: 'berth-2-slot-1',
        slotNumber: 1,
        slotName: '1号位',
        allowedType: 'small_only',
        allowedTypeLabel: '仅限小船',
        isOccupied: false
      }
    ]
  },
  {
    id: 'berth-3',
    code: 3,
    name: '3号码头 (旧码头)',
    shortName: '3号码头 (旧码头)',
    category: 'berth_pier',
    categoryName: '移动码头',
    maxCapacity: 2,
    ruleDescription: '共2个停泊位，可停2艘船。同一位置只可停一艘大船或一艘小船。',
    restrictionNote: '3号码头（旧码头）：水下舾装与管系试压深水作业区，共2个泊位，同一位置可停1艘大船或1艘小船',
    isSmallShipOnly: false,
    rect: {
      top: 42.8,
      left: 78.0,
      width: 15.0,
      height: 18.8
    },
    labelPos: {
      top: 52.0,
      left: 84.0
    },
    slots: [
      {
        slotId: 'berth-3-slot-1',
        slotNumber: 1,
        slotName: '1号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: true,
        occupiedShip: {
          id: 'PRJ-2026-TANK02',
          name: '30万吨 VLCC 超大型原油船',
          shipType: '超大型原油船',
          shipCode: 'HULL-VLCC-300',
          stage: '水下舾装',
          startDate: '2026-08-01',
          endDate: '2027-03-15'
        }
      },
      {
        slotId: 'berth-3-slot-2',
        slotNumber: 2,
        slotName: '2号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: false
      }
    ]
  },
  {
    id: 'berth-4',
    code: 4,
    name: '4号码头 (浮动码头)',
    shortName: '4号码头 (浮动码头)',
    category: 'berth_pier',
    categoryName: '浮动码头',
    maxCapacity: 2,
    ruleDescription: '共2个停泊位，可停2艘船。同一位置只可停一艘大船或一艘小船。',
    restrictionNote: '4号码头（浮动码头）：自适应潮位系泊作业区，共2个泊位，同一位置可停1艘大船或1艘小船',
    isSmallShipOnly: false,
    rect: {
      top: 67.5,
      left: 89.8,
      width: 9.5,
      height: 17.2
    },
    labelPos: {
      top: 79.5,
      left: 95.0
    },
    slots: [
      {
        slotId: 'berth-4-slot-1',
        slotNumber: 1,
        slotName: '1号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: true,
        occupiedShip: {
          id: 'PRJ-2026-CHEM01',
          name: '18500 DWT 绿色油化船',
          shipType: '特种化学品船',
          shipCode: 'HULL-CHEM-185',
          stage: '管系试压',
          startDate: '2026-04-01',
          endDate: '2026-11-30'
        }
      },
      {
        slotId: 'berth-4-slot-2',
        slotNumber: 2,
        slotName: '2号位',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: false
      }
    ]
  },
  {
    id: 'berth-5',
    code: 5,
    name: '2万吨船台',
    shortName: '2万吨船台',
    category: 'berth_slipway',
    categoryName: '船台',
    maxCapacity: 2,
    ruleDescription: '可停泊两艘小船或1艘大船。当停1艘大船时不能再停其他船，如果停一艘小船时可再停一艘小船。',
    restrictionNote: '2万吨船台：重型总装船台。停1艘大船时独占全船台（互斥锁定其他位）；停小船时最多可容纳2艘小船',
    isSmallShipOnly: false,
    rect: {
      top: 85.8,
      left: 44.0,
      width: 44.5,
      height: 4.2
    },
    labelPos: {
      top: 87.8,
      left: 77.0
    },
    slots: [
      {
        slotId: 'berth-5-slot-1',
        slotNumber: 1,
        slotName: '1号位 (总装主位)',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船(独占) / 小船',
        isOccupied: true,
        occupiedShip: {
          id: 'PRJ-2026-LNG01',
          name: '17.4万m³ 大型LNG船 1号舰',
          shipType: '大型LNG船',
          shipCode: 'HULL-LNG-174',
          stage: '合拢焊接',
          startDate: '2026-03-01',
          endDate: '2026-10-31',
          isSmallShip: false // 大船占用，导致2万吨船台互斥
        }
      },
      {
        slotId: 'berth-5-slot-2',
        slotNumber: 2,
        slotName: '2号位 (小船副位)',
        allowedType: 'large_and_small',
        allowedTypeLabel: '小船 / 大船(独占)',
        isOccupied: false
      }
    ]
  },
  {
    id: 'berth-6',
    code: 6,
    name: '平船台',
    shortName: '平船台',
    category: 'berth_slipway',
    categoryName: '平船台',
    maxCapacity: 4,
    ruleDescription: '共4个停泊位：a. 停泊4艘小船；b. 停泊2艘大船+2艘小船（注意：停泊出现2艘大船时只能并排停放）；c. 停泊1艘大船+3艘小船。',
    restrictionNote: '平船台：共4个停泊位，支持三种灵活搭载组合（4小船 / 2大船并排+2小船 / 1大船+3小船）',
    isSmallShipOnly: false,
    rect: {
      top: 31.0,
      left: 41.0,
      width: 22.2,
      height: 19.8
    },
    labelPos: {
      top: 42.5,
      left: 49.0
    },
    slots: [
      {
        slotId: 'berth-6-slot-1',
        slotNumber: 1,
        slotName: '1号位 (并排主位A)',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船(并排) / 小船',
        isOccupied: true,
        occupiedShip: {
          id: 'PRJ-2026-BULK04',
          name: '82,000 DWT 散货船',
          shipType: '大型散货船',
          shipCode: 'HULL-BULK-082',
          stage: '船台搭载',
          startDate: '2026-06-15',
          endDate: '2027-01-20',
          isSmallShip: false
        }
      },
      {
        slotId: 'berth-6-slot-2',
        slotNumber: 2,
        slotName: '2号位 (并排主位B)',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船(并排) / 小船',
        isOccupied: false
      },
      {
        slotId: 'berth-6-slot-3',
        slotNumber: 3,
        slotName: '3号位 (合拢工位C)',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: false
      },
      {
        slotId: 'berth-6-slot-4',
        slotNumber: 4,
        slotName: '4号位 (搭载工位D)',
        allowedType: 'large_and_small',
        allowedTypeLabel: '大船 / 小船',
        isOccupied: false
      }
    ]
  }
];

// 判断船型是否属于小型船只（例如拖轮、工作艇、AHTS、PSV等）
export function checkIsSmallShip(shipNameOrType?: string): boolean {
  if (!shipNameOrType) return false;
  const lower = shipNameOrType.toLowerCase();
  return (
    lower.includes('拖轮') ||
    lower.includes('tug') ||
    lower.includes('工作船') ||
    lower.includes('工作艇') ||
    lower.includes('海工辅助') ||
    lower.includes('支持船') ||
    lower.includes('ahts') ||
    lower.includes('psv') ||
    lower.includes('小船') ||
    lower.includes('小型')
  );
}

export interface SlotAvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  isMutualExcluded?: boolean; // 是否因组合规则被互斥锁定
  badgeText?: string;
}

// 针对 6 个区域的特定组合规则进行深度可用性与冲突判断
export function checkSlotAvailability(
  berth: BerthAreaConfig,
  slotNumber: number,
  isCurrentShipSmall: boolean,
  selfOccupiedSlotNumber?: number | null // 编辑时若当前占用了该位，可排除自身
): SlotAvailabilityResult {
  const targetSlot = berth.slots.find(s => s.slotNumber === slotNumber);
  if (!targetSlot) {
    return { isAvailable: false, reason: '泊位不存在' };
  }

  // 1. 若当前泊位已被实际占用（且不是编辑时的自身）
  const isOccupiedByOther = targetSlot.isOccupied && (selfOccupiedSlotNumber !== slotNumber);
  if (isOccupiedByOther) {
    return {
      isAvailable: false,
      reason: `【${targetSlot.slotName}】已被船舶【${targetSlot.occupiedShip?.name || '在泊船舶'}】占用`,
      badgeText: '已被占用'
    };
  }

  // 2. 区域 2 (2号码头)：只能停泊一艘小船
  if (berth.id === 'berth-2') {
    if (!isCurrentShipSmall) {
      return {
        isAvailable: false,
        reason: '2号码头为专用小型泊位，只能停泊一艘小船，大型船舶禁止停入',
        badgeText: '仅限小船'
      };
    }
  }

  // 3. 区域 5 (2万吨船台)：可停两艘小船或1艘大船。当停1艘大船时不能再停其他船，如果停一艘小船时可再停一艘小船。
  if (berth.id === 'berth-5') {
    const otherSlots = berth.slots.filter(s => s.slotNumber !== slotNumber && (selfOccupiedSlotNumber !== s.slotNumber));
    const hasLargeShipOccupying = otherSlots.some(s => s.isOccupied && s.occupiedShip?.isSmallShip === false);
    const hasAnyShipOccupying = otherSlots.some(s => s.isOccupied);

    // 如果其他位置已有大船在泊，则 2万吨船台整体已被独占
    if (hasLargeShipOccupying) {
      return {
        isAvailable: false,
        isMutualExcluded: true,
        reason: '2万吨船台当前已有大船在泊（大船独占全船台），不可停靠其他船舶',
        badgeText: '大船独占互斥'
      };
    }

    // 如果当前要停入的是大船，且船台内已有任何船舶（无论大船小船）
    if (!isCurrentShipSmall && hasAnyShipOccupying) {
      return {
        isAvailable: false,
        isMutualExcluded: true,
        reason: '2万吨船台停泊大船时需独占全船台，当前已有其他船舶在泊，无法停入',
        badgeText: '大船需独占'
      };
    }
  }

  // 4. 区域 6 (平船台)：共4个停泊位
  // 组合规则：a.停4艘小船；b.停2艘大船+2艘小船(2艘大船只能并排停放，即1号位和2号位)；c.停1艘大船+3艘小船
  if (berth.id === 'berth-6') {
    const occupiedSlots = berth.slots.filter(s => s.isOccupied && (selfOccupiedSlotNumber !== s.slotNumber));
    const largeShipCount = occupiedSlots.filter(s => s.occupiedShip && s.occupiedShip.isSmallShip === false).length;
    const smallShipCount = occupiedSlots.filter(s => s.occupiedShip && s.occupiedShip.isSmallShip === true).length;
    const totalOccupied = occupiedSlots.length;

    if (!isCurrentShipSmall) {
      // 当前要停放大船
      if (largeShipCount >= 2) {
        return {
          isAvailable: false,
          isMutualExcluded: true,
          reason: '平船台最多仅允许停泊 2 艘大船（当前已有2艘大船），不可再停入大船',
          badgeText: '大船满额(限2艘)'
        };
      }

      // 若已有1艘大船，且试图停入第2艘大船：2艘大船只能并排停放在 1号位与 2号位
      if (largeShipCount === 1) {
        if (slotNumber !== 1 && slotNumber !== 2) {
          return {
            isAvailable: false,
            isMutualExcluded: true,
            reason: '规则限制：平船台停泊 2 艘大船时只能并排停放在 1号位与 2号位，3/4号位不可停第2艘大船',
            badgeText: '大船仅限1/2号并排'
          };
        }
      }

      // 容量上限校验：若已有 1大船 + 3小船 (总数4)，不可再停
      if (totalOccupied >= 4) {
        return {
          isAvailable: false,
          reason: '平船台 4 个停泊位已全部占满',
          badgeText: '已满额'
        };
      }
    } else {
      // 当前要停放小船
      if (totalOccupied >= 4) {
        return {
          isAvailable: false,
          reason: '平船台 4 个停泊位已全部占满（已达4艘小船上限）',
          badgeText: '已满额'
        };
      }
    }
  }

  // 5. 通用类型限制（如标为 small_only 的泊位不可停大船）
  if (targetSlot.allowedType === 'small_only' && !isCurrentShipSmall) {
    return {
      isAvailable: false,
      reason: `【${targetSlot.slotName}】为小型泊位，仅限小船停泊`,
      badgeText: '仅限小船'
    };
  }

  return { isAvailable: true };
}

