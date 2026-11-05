/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 船模管理数据源与持久化存储服务
 */

import lngModelBg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerModelBg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerModelBg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkModelBg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';
import psvModelBg from '@/src/assets/images/psv_3d_model_1787972977692.jpg';
import workboatModelBg from '@/src/assets/images/workboat_3d_model_1787972992279.jpg';
import supportModelBg from '@/src/assets/images/support_3d_model_1787973007774.jpg';
import chemTankerModelBg from '@/src/assets/images/chemical_tanker_3d_1787973019008.jpg';

export interface ShipLayer {
  id: string;
  name: string;
  code: string;
  elevationRange: string;
  description: string;
}

export interface ShipModel {
  id: string;
  name: string;
  type: string;
  shipScale: '大型' | '小型';
  description: string;
  thumbnail: string;
  lodLevel: string;
  meshCount: string;
  compartments: number;
  parameters: {
    loa: string;
    beam: string;
    depth: string;
    draft: string;
    power: string;
    displacement: string;
    speed: string;
  };
  features: string[];
  layers: ShipLayer[];
}

export const initialMockShipModels: ShipModel[] = [
  {
    id: 'M-001',
    name: '17.4万m³ 薄膜型大型LNG船',
    type: 'LNG液化天然气船',
    shipScale: '大型',
    description: '采用 GTT NO96 薄膜型绝热货舱系统，具有高安全、低蒸发率的 3D 全舱段高精度数字孪生模型。',
    thumbnail: lngModelBg,
    lodLevel: 'LOD 400 (施工级)',
    meshCount: '1,280,000 面',
    compartments: 4,
    parameters: { 
      loa: '295.0', 
      beam: '45.0', 
      depth: '26.25', 
      draft: '11.5', 
      power: '双燃料低速机+轴带发电机',
      displacement: '118,000 吨',
      speed: '19.5 节'
    },
    features: ['3D 绝热层空间网格', '密闭货舱受限空间定位', '超低温泄漏监测点位'],
    layers: [
      { id: 'L-01', name: '甲板层 (主甲板/露天作业区)', code: 'DECK-01', elevationRange: '+18.5m ~ +26.25m', description: '露天系泊与吊装作业主区域' },
      { id: 'L-02', name: '货舱层 (NO.1-4 LNG货舱)', code: 'HOLD-02', elevationRange: '+2.0m ~ +18.5m', description: 'GTT NO96 绝热薄膜密闭舱段' },
      { id: 'L-03', name: '机舱层 (双燃料主机及辅机)', code: 'ENG-03', elevationRange: '-5.0m ~ +2.0m', description: '动力推进与气体压缩机房' },
      { id: 'L-04', name: '双层底及压载舱', code: 'BALLAST-04', elevationRange: '-12.0m ~ -5.0m', description: '水舱与结构支撑底层' }
    ]
  },
  {
    id: 'M-002',
    name: '24,000 TEU 超大型集装箱船',
    type: '超大型集装箱船',
    shipScale: '大型',
    description: '全球顶级装载量集装箱船 3D 模型，完整包含 24 层集装箱导轨架、系泊甲板及双岛式上层建筑网格。',
    thumbnail: containerModelBg,
    lodLevel: 'LOD 350',
    meshCount: '1,860,000 面',
    compartments: 12,
    parameters: { 
      loa: '399.9', 
      beam: '61.5', 
      depth: '33.2', 
      draft: '16.5', 
      power: 'WinGD 11X92DF 双燃料主机',
      displacement: '240,000 吨',
      speed: '22.0 节'
    },
    features: ['箱位 3D 空间坐标系', '舷边防落水警戒网格', '主机舱多层拓扑'],
    layers: [
      { id: 'L-01', name: '驾驶甲板与生活区', code: 'BRG-01', elevationRange: '+25.0m ~ +33.2m', description: '船长室与导航指挥中心' },
      { id: 'L-02', name: '集装箱绑扎甲板区', code: 'DECK-02', elevationRange: '+12.0m ~ +25.0m', description: '甲板箱位及锁具作业面' },
      { id: 'L-03', name: '货舱内部导轨架层', code: 'HOLD-03', elevationRange: '-5.0m ~ +12.0m', description: '舱内蜂窝状导轨支撑结构' },
      { id: 'L-04', name: '机舱与泵间底层', code: 'ENG-04', elevationRange: '-15.0m ~ -5.0m', description: '超大功率柴油机与推进轴系' }
    ]
  },
  {
    id: 'M-003',
    name: '30万吨 VLCC 超大型原油船',
    type: '超大型油轮 (VLCC)',
    shipScale: '大型',
    description: '双壳双底结构 3D 数字模型，精细刻画 15 个货油舱、双层底压载舱及主甲板复杂管系走线。',
    thumbnail: tankerModelBg,
    lodLevel: 'LOD 400',
    meshCount: '1,450,000 面',
    compartments: 15,
    parameters: { 
      loa: '333.0', 
      beam: '60.0', 
      depth: '30.0', 
      draft: '20.5', 
      power: '低速柴油机 + 脱硫塔系统',
      displacement: '348,000 吨',
      speed: '15.5 节'
    },
    features: ['货油管系 3D BIM 路由', '惰性气体密闭舱监测', '防爆区域立体电子围栏'],
    layers: [
      { id: 'L-01', name: '主甲板及管汇作业区', code: 'DECK-01', elevationRange: '+20.0m ~ +30.0m', description: '原油装卸管路与惰性气体系统' },
      { id: 'L-02', name: '货油舱中层区 (1-15舱)', code: 'OIL-02', elevationRange: '0.0m ~ +20.0m', description: '双壳原油储藏密闭舱段' },
      { id: 'L-03', name: '机舱及泵舱底层', code: 'ENG-03', elevationRange: '-10.0m ~ 0.0m', description: '深井泵控制与动力舱' }
    ]
  },
  {
    id: 'M-004',
    name: '82,000 DWT 卡姆萨尔型散货船',
    type: '卡姆萨尔型散货船',
    shipScale: '大型',
    description: '标准节能型大开口散货船 3D 孪生数模，包含 7 个独立货舱、液压舱盖及船台搭载分段基准点。',
    thumbnail: bulkModelBg,
    lodLevel: 'LOD 300',
    meshCount: '920,000 面',
    compartments: 7,
    parameters: { 
      loa: '229.0', 
      beam: '32.26', 
      depth: '20.35', 
      draft: '14.45', 
      power: 'MAN B&W 6S60ME 柴油机',
      displacement: '98,000 吨',
      speed: '14.2 节'
    },
    features: ['船台分段搭载对位基准', '大舱临边登高作业防护', '装载应力模拟网格'],
    layers: [
      { id: 'L-01', name: '主甲板与舱盖作业面', code: 'DECK-01', elevationRange: '+14.0m ~ +20.35m', description: '液压舱盖与锚机平台' },
      { id: 'L-02', name: '散货货舱区 (1-7舱)', code: 'HOLD-02', elevationRange: '-2.0m ~ +14.0m', description: '大开口散货装载空间' },
      { id: 'L-03', name: '机舱底层', code: 'ENG-03', elevationRange: '-8.0m ~ -2.0m', description: '主机与发电机组舱' }
    ]
  },
  {
    id: 'M-005',
    name: '75M 动力定位平台供应船',
    type: '平台供应船 (PSV)',
    shipScale: '小型',
    description: '配备 DP-2 动力定位系统，具备 650㎡ 开阔后甲板与散装泥浆/燃油输送系统 3D 数字仿真体。',
    thumbnail: psvModelBg,
    lodLevel: 'LOD 350',
    meshCount: '850,000 面',
    compartments: 6,
    parameters: { 
      loa: '75.0', 
      beam: '16.8', 
      depth: '7.5', 
      draft: '6.0', 
      power: '柴电全回转电力推进系统',
      displacement: '4,200 吨',
      speed: '13.5 节'
    },
    features: ['开阔甲板作业人员热力图', 'DP动力定位基站网络', '泥浆舱受限空间进出许可'],
    layers: [
      { id: 'L-01', name: '后甲板开阔作业区', code: 'DECK-01', elevationRange: '+4.0m ~ +7.5m', description: '散装物料与吊装区' },
      { id: 'L-02', name: '泥浆舱与干舱区', code: 'MUD-02', elevationRange: '-1.0m ~ +4.0m', description: '钻井泥浆及散装水泥舱' },
      { id: 'L-03', name: '全回转推进机舱', code: 'ENG-03', elevationRange: '-5.0m ~ -1.0m', description: '电力推进电机舱' }
    ]
  },
  {
    id: 'M-006',
    name: '69.8M 海上风电运维工作船',
    type: '风电运维船 (SOV)',
    shipScale: '小型',
    description: '双体高速耐波浪船型 3D 渲染模型，集成 3D 波浪补偿登乘栈桥与海上物资吊装回转吊机。',
    thumbnail: workboatModelBg,
    lodLevel: 'LOD 400',
    meshCount: '1,120,000 面',
    compartments: 5,
    parameters: { 
      loa: '69.8', 
      beam: '16.0', 
      depth: '6.8', 
      draft: '5.2', 
      power: '混合动力 + 蓄电池储能',
      displacement: '3,100 吨',
      speed: '16.0 节'
    },
    features: ['3D 动态波浪补偿栈桥联动', '风场运维人员登乘轨迹', '离岸作业高精度定位'],
    layers: [
      { id: 'L-01', name: '波浪补偿栈桥平台层', code: 'BRG-01', elevationRange: '+4.5m ~ +6.8m', description: '人员登乘风机塔筒缓冲平台' },
      { id: 'L-02', name: '运维人员舱室与甲板', code: 'ACCOM-02', elevationRange: '0.0m ~ +4.5m', description: '技术人员休息与装备库' },
      { id: 'L-03', name: '双体混合动力机舱', code: 'ENG-03', elevationRange: '-4.0m ~ 0.0m', description: '双体柴电与储能电池舱' }
    ]
  },
  {
    id: 'M-007',
    name: '37米 多用途海洋工程支持船',
    type: '多用途支持船 (AHTS)',
    shipScale: '小型',
    description: '灵活的多功能近海工作船 3D 模型，支持拖拽、抛锚、潜水支持及小规模物资补给。',
    thumbnail: supportModelBg,
    lodLevel: 'LOD 300',
    meshCount: '640,000 面',
    compartments: 4,
    parameters: { 
      loa: '37.0', 
      beam: '10.4', 
      depth: '4.5', 
      draft: '3.5', 
      power: '双机双桨常规柴油动力',
      displacement: '950 吨',
      speed: '12.0 节'
    },
    features: ['拖缆机作业危险警戒弧区', '潜水作业支持定位', '多模式锚泊姿态显示'],
    layers: [
      { id: 'L-01', name: '拖缆与锚机甲板层', code: 'DECK-01', elevationRange: '+2.0m ~ +4.5m', description: '甲板拖曳作业区' },
      { id: 'L-02', name: '常规机舱底层', code: 'ENG-02', elevationRange: '-3.0m ~ +2.0m', description: '柴油主机舱' }
    ]
  },
  {
    id: 'M-008',
    name: '18500 DWT 绿色节能油化船',
    type: '不锈钢化学品船',
    shipScale: '小型',
    description: 'IMO II 类化学品船 3D 高精度模型，具备独立双相不锈钢货舱、深井泵及全船防爆监测感知节点。',
    thumbnail: chemTankerModelBg,
    lodLevel: 'LOD 350',
    meshCount: '1,180,000 面',
    compartments: 14,
    parameters: { 
      loa: '149.8', 
      beam: '24.0', 
      depth: '13.2', 
      draft: '9.8', 
      power: '电控二冲程低速柴油机',
      displacement: '25,600 吨',
      speed: '14.0 节'
    },
    features: ['2205双相不锈钢舱壁三维网格', '有毒有害化学气体扩散模拟', '洗舱作业人员实时跟踪'],
    layers: [
      { id: 'L-01', name: '化学品主甲板管汇层', code: 'DECK-01', elevationRange: '+9.0m ~ +13.2m', description: '不锈钢输送管路与洗舱机' },
      { id: 'L-02', name: '不锈钢货舱区 (1-14舱)', code: 'HOLD-02', elevationRange: '0.0m ~ +9.0m', description: 'IMO II类独立货舱' },
      { id: 'L-03', name: '低速机舱底层', code: 'ENG-03', elevationRange: '-6.0m ~ 0.0m', description: '动力舱' }
    ]
  }
];

const SHIP_MODELS_STORAGE_KEY = 'smart_shipyard_ship_models';

export function getStoredShipModels(): ShipModel[] {
  try {
    const raw = localStorage.getItem(SHIP_MODELS_STORAGE_KEY);
    if (!raw) return initialMockShipModels;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMockShipModels;
  } catch {
    return initialMockShipModels;
  }
}

export function saveStoredShipModels(models: ShipModel[]): void {
  try {
    localStorage.setItem(SHIP_MODELS_STORAGE_KEY, JSON.stringify(models));
  } catch {
    // ignore
  }
}
