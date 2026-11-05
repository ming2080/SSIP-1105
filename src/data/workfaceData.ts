/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理数据源与持久化存储服务
 */

export interface WorkfacePersonnel {
  id: string;
  name: string;
  role: string;
  team: string;
  tagId: string;
  entryTime: string;
  stayDuration: string;
  heartRate: number;
  battery: number;
  status: 'normal' | 'warning';
}

export interface WorkfaceBaseStation {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'online' | 'offline';
  ip: string;
  coverage: string;
  signalLossTime?: number;
}

export interface WorkfaceGasDetector {
  id: string;
  sn: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  readings: {
    o2: string;   // 氧气 %VOL
    ch4: string;  // 可燃气体 %LEL
    co: string;   // 一氧化碳 ppm
    h2s: string;  // 硫化氢 ppm
  };
  lastUpdate: string;
}

export interface WorkfaceCamera {
  id: string;
  name: string;
  type: '防爆云台球机' | '防爆布控球' | 'AI抓拍枪机';
  status: 'online' | 'offline';
  rtspUrl: string;
  currentChannel: string;
}

export interface WorkfaceAlarmDevice {
  id: string;
  name: string;
  type: '防爆声光报警器' | '现场广播喇叭';
  status: 'online' | 'offline';
  lastTestTime: string;
}

// 作业面归属区域类型: 船厂厂区 | 造船项目
export type WorkfaceBelongingType = 'yard' | 'project';

// 东南造船基地平面图二级区域定义
export interface YardSubArea {
  id: string;
  name: string;
  specs: string; // 面积/尺寸/起重规格等，解析自东南造船基地平面图
  description?: string;
}

// 东南造船基地平面图一级功能分区
export interface YardZone {
  id: string;
  name: string;
  code: string;
  description: string;
  subAreas: YardSubArea[];
}

// 东南造船基地平面图完整区域解析数据
export const SOUTHEAST_SHIPYARD_ZONES: YardZone[] = [
  {
    id: 'zone_assembly_block',
    name: '总装焊与分段建造区',
    code: 'SEC-ASSY',
    description: '船体巨型分段总组焊接与拼装平台区',
    subAreas: [
      { id: 'sa_assy_platform_1', name: '总组装焊平台一', specs: '121m×30m=3630㎡', description: '配置电装仓库与半成品库，用于大型分段总组' },
      { id: 'sa_assy_platform_2', name: '总组装焊平台二', specs: '300m×22m=6600㎡', description: '配置GN=300T龙门吊跨距S=72m/Hr=60m，露天总装焊区' },
      { id: 'sa_block_16t', name: '分段大组区16T', specs: '33m×232m=7656㎡', description: '配置GN=16T双梁行车，双梁双钩' },
      { id: 'sa_block_10t', name: '分段大组区10T', specs: '33m×232m=7656㎡', description: '配置GN=10T双梁行车' },
      { id: 'sa_block_32t', name: '分段大组区32T', specs: '22m×134m=2948㎡', description: '配置GN=32T龙门吊' },
      { id: 'sa_mfg_inner_field', name: '制造部内场车间', specs: '9360㎡', description: '大型结构件组对拼装内场' },
      { id: 'sa_mfg_inner_side', name: '制造部内场边跨', specs: '钢构拼装与打磨区', description: '构件预装与打磨' }
    ]
  },
  {
    id: 'zone_berth_quay',
    name: '船台船坞与码头作业区',
    code: 'SEC-BERTH',
    description: '造船台、干船坞与舾装靠泊码头区',
    subAreas: [
      { id: 'sa_berth_128', name: '128船台', specs: '120m×30m×16m×20.6m', description: '有效长度200m，配置60T/22m起重机与GN=32T门吊' },
      { id: 'sa_berth_100', name: '100船台', specs: '106m×24m×16m', description: '配置GN=32T/GN=20T门吊' },
      { id: 'sa_quay_new_outfit', name: '新舾装码头', specs: '120m×20m=2400㎡', description: '大型船舶靠泊、舾装与系统系泊调试' },
      { id: 'sa_quay_outfit', name: '舾装码头', specs: '109m×12m=1308㎡', description: '船舶中段舾装与设备吊装' },
      { id: 'sa_quay_float_1', name: '浮动码头一区', specs: '10m×13m (40T/24.5m)', description: '工程辅助作业驳船靠泊' },
      { id: 'sa_quay_float_2', name: '浮动码头二区', specs: '36m×8m=288㎡', description: '浮动作业平台' },
      { id: 'sa_basin_gate', name: '港池与船坞门区', specs: '宽21.5米港池', description: '港池下水通道、船坞门及江边5T绞车房' }
    ]
  },
  {
    id: 'zone_workshop',
    name: '加工与制造车间区',
    code: 'SEC-SHOP',
    description: '下料数控切割、预处理及管件机加车间',
    subAreas: [
      { id: 'sa_cnc_cut', name: '数控激光与等离子切割区', specs: '20000W激光切割机/SDQ-7.0数控等离子', description: '高精度钢板数控下料与坡口加工' },
      { id: 'sa_steel_preheat', name: '钢板库与预处理流水线', specs: 'GN=5T行车 / 抛丸流水线', description: '板材抛丸除锈、喷底漆与烘干' },
      { id: 'sa_pipe_process', name: '集配部管加工车间', specs: '1403㎡', description: '数控弯管、冷拔管件下料与成型' },
      { id: 'sa_machining', name: '机加工车间', specs: '1403㎡', description: '大型车床、铣床、钻床及轴系加工' },
      { id: 'sa_cold_work', name: '集配冷作车间', specs: '900㎡', description: '型钢冷弯、折弯校正与铆工预拼装' },
      { id: 'sa_pipe_welding', name: '管焊接车间', specs: '550㎡', description: '高压管系氩弧焊、法兰对焊' },
      { id: 'sa_pickling', name: '酸洗车间', specs: '230㎡', description: '管件化学酸洗钝化处理' },
      { id: 'sa_ship_repair', name: '修船车间', specs: '1080㎡', description: '船体变形矫正与翻修' },
      { id: 'sa_lofting', name: '放样楼', specs: '739㎡', description: '船舶型线放样与数控套料系统' }
    ]
  },
  {
    id: 'zone_paint',
    name: '涂装与表面处理区',
    code: 'SEC-PAINT',
    description: '密闭喷砂涂装车间与露天二次除锈堆场',
    subAreas: [
      { id: 'sa_paint_workshop', name: '涂装车间', specs: '5071㎡', description: '密闭高压喷砂除锈与无气喷涂' },
      { id: 'sa_paint_yard', name: '露天分段涂装堆场', specs: '分段防腐二次涂装场地', description: '露天分段二次补漆与干燥' },
      { id: 'sa_simple_paint', name: '简易涂装房', specs: '63㎡', description: '小型构件与舾装件快速喷涂' },
      { id: 'sa_paint_store', name: '涂装临时仓库', specs: '50㎡', description: '特种防腐漆、稀释剂与喷枪备件' }
    ]
  },
  {
    id: 'zone_storage',
    name: '仓储与露天堆场区',
    code: 'SEC-STORE',
    description: '分段储备、原材料与机电设备立体仓库',
    subAreas: [
      { id: 'sa_block_yard_lease', name: '分段堆场 (技校租用土地)', specs: '20000㎡ (约30亩)', description: '巨型分段中转与合拢前储备堆场' },
      { id: 'sa_aisle_60t', name: '60T过道堆位', specs: '14m×232m=3248㎡', description: '主航道重载分段转运堆位' },
      { id: 'sa_steel_plate_yard', name: '露天钢板堆场', specs: '3500㎡', description: '原材料钢板到货、倒运理料与检验' },
      { id: 'sa_pipe_yard', name: '管子堆场', specs: '露天管材分类堆放区', description: '无缝钢管、不锈钢管分类储放' },
      { id: 'sa_elec_mech_wh', name: '机电仓库', specs: '2160㎡', description: '大型电气控制屏、动力辅机与泵组' },
      { id: 'sa_semi_wh', name: '半成品库', specs: '709㎡', description: '下料半成品与预组装构件' },
      { id: 'sa_general_wh', name: '综合仓库', specs: '590㎡', description: '标准五金件、紧固件与辅材' },
      { id: 'sa_elec_temp_wh', name: '电装临时仓库', specs: '527㎡', description: '特种电缆与电气接线辅料' },
      { id: 'sa_hazard_wh', name: '危险品仓库 / 危废库', specs: '120㎡', description: '工业气瓶、油料及危废品严格专管' }
    ]
  },
  {
    id: 'zone_power_facility',
    name: '动力保障与公用设施区',
    code: 'SEC-POWER',
    description: '全厂变配电、动力气源、天然气与特种消防',
    subAreas: [
      { id: 'sa_power_main', name: '总配电房', specs: '206㎡ (10kV变电总站)', description: '全厂主变配电与双回路供电中枢' },
      { id: 'sa_substations', name: '分变电所 (2#/3#/4#/6#变电房)', specs: '车间就地变电房', description: '保障各施工车间动力用电' },
      { id: 'sa_air_compress', name: '空压机房群 (3号/6变)', specs: '集中压缩气源站', description: '全厂气动工具与喷涂气源' },
      { id: 'sa_gas_station', name: '天然气调压站与气站', specs: '工业天然气管道供给', description: '数控切割气源与加热管道' },
      { id: 'sa_oil_station', name: '集中油站', specs: '柴油与机油储备', description: '大型门吊与厂区车辆动力油料' },
      { id: 'sa_fire_pool', name: '消防水池与应急泵站', specs: '特种消防蓄水池', description: '厂区高压消防水网中枢' }
    ]
  },
  {
    id: 'zone_office_living',
    name: '综合办公与生活保障区',
    code: 'SEC-OFFICE',
    description: '指挥中心、设计院、品质检测与员工生活区',
    subAreas: [
      { id: 'sa_office_general', name: '综合办公大楼', specs: '1584㎡', description: '生产运营调度、安全监察指挥中心' },
      { id: 'sa_office_main', name: '主办公大楼', specs: '3050㎡ / 3111㎡', description: '工程设计院、行政及商务管理' },
      { id: 'sa_office_qa_paint', name: '品保部与涂装部办公楼', specs: '800㎡', description: '质检检测室与探伤评片室' },
      { id: 'sa_office_debug', name: '码头调试科办公室', specs: '207㎡', description: '系泊试验与试航指挥调度' },
      { id: 'sa_office_dist', name: '集配办公楼', specs: '230㎡', description: '物流集配调度与物资核验' },
      { id: 'sa_canteen', name: '职工食堂', specs: '1599㎡', description: '就餐保障区' },
      { id: 'sa_dormitory', name: '专家楼与集体宿舍', specs: '1777㎡', description: '专家公寓与现场值班宿舍' }
    ]
  }
];

// 造船项目二级楼层位置解析数据
export const PROJECT_FLOOR_OPTIONS = [
  { id: 'deck', name: '主甲板层', code: 'DECK-01', elevation: '+16.0m ~ +22.0m', description: '01主甲板/露天甲板/安全主通道' },
  { id: 'middle', name: '中舱货油/货舱层', code: 'HOLD-02', elevation: '+8.0m ~ +16.0m', description: '液货舱/集装箱导轨架/隔离空舱' },
  { id: 'bottom', name: '双层底舱/底舱层', code: 'DB-01', elevation: '0.0m ~ +5.0m', description: '双层底压载舱/内底板/管隧密闭区' },
  { id: 'engine', name: '机舱动力区', code: 'ER-01', elevation: '-2.0m ~ +12.0m', description: '双燃料主机平台/辅机间/集控室' },
  { id: 'bridge', name: '驾驶台及生活楼', code: 'BRG-01', elevation: '+22.0m ~ +36.0m', description: '罗经甲板/驾驶驾控台/船员居住舱' }
];

export interface WorkfaceAreaDefinition {
  areaType: string;         // 区域类型: '作业区' | '重保管控区' | '高危警戒区' | '临时施工区'
  areaColor: string;        // 区域颜色: 如 '#ef4444'
  areaShape: string;        // 区域形状: '自定义' | '标准矩形' | '圆形范围'
  coordinatesText?: string; // 框选坐标系文本: 如 "[25.4, 25.8  45.2, 25.8  45.2, 68.4  25.4, 68.4]"
  points: { x: number; y: number }[];
  areaSize?: string;        // 标定面积: 如 "3,630 ㎡"
  perimeter?: string;       // 周长: 如 "302 m"
}

export interface WorkfaceFence {
  type: 'polygon' | 'rectangle';
  points: { x: number; y: number }[]; // 坐标点 (0-100相对百分比)
  area?: string;                      // 面积如 3,630 ㎡
  perimeter?: string;                 // 周长如 302 m
  status?: 'active' | 'warning' | 'normal';
}

export interface SafetyOfficerItem {
  id: string;
  name: string;
  phone: string;
  department: string;
  role: string;
  certNumber: string;
  tagCode?: string;
}

export const SHIPYARD_SAFETY_OFFICERS: SafetyOfficerItem[] = [
  { id: 'SO-01', name: '周卫国', phone: '13812345601', department: '安全环保班组', role: '注册安全工程师', certNumber: 'SA-2024-001', tagCode: 'TAG-SO-01' },
  { id: 'SO-02', name: '李建军', phone: '13912345602', department: '造船一部安监组', role: '专职安全员', certNumber: 'SA-2024-015', tagCode: 'TAG-SO-02' },
  { id: 'SO-03', name: '王振华', phone: '13712345603', department: '涂装防腐班组', role: '现场安质监护员', certNumber: 'SA-2025-008', tagCode: 'TAG-SO-03' },
  { id: 'SO-04', name: '陈志强', phone: '13612345604', department: '制造部安全组', role: '一级动火监护员', certNumber: 'SA-2023-042', tagCode: 'TAG-SO-04' },
  { id: 'SO-05', name: '张海波', phone: '13512345605', department: '集配部安质组', role: '受限空间监护员', certNumber: 'SA-2024-089', tagCode: 'TAG-SO-05' },
  { id: 'SO-06', name: '刘晓明', phone: '13812345606', department: '造船二部安监组', role: '注册安全工程师', certNumber: 'SA-2024-031', tagCode: 'TAG-SO-06' },
  { id: 'SO-07', name: '黄伟峰', phone: '13912345607', department: '安全环保班组', role: '高空防坠监护员', certNumber: 'SA-2025-012', tagCode: 'TAG-SO-07' },
  { id: 'SO-08', name: '赵大鹏', phone: '13712345608', department: '船坞管委会组', role: '特种设备专职安全员', certNumber: 'SA-2024-077', tagCode: 'TAG-SO-08' },
  { id: 'SO-09', name: '孙敏华', phone: '13612345609', department: '造船一部安监组', role: '现场安监员', certNumber: 'SA-2025-034', tagCode: 'TAG-SO-09' },
  { id: 'SO-10', name: '吴承志', phone: '13512345610', department: '品质保卫组', role: '无损探伤防护员', certNumber: 'SA-2023-018', tagCode: 'TAG-SO-10' }
];

export interface WorkfaceRecord {
  id: string;                     // 唯一标识 (如 WF-2026-001)
  code: string;                   // 作业面编号
  name: string;                   // 作业面名称
  
  // 作业面类型: 有限空间 | 通用作业面
  workfaceType?: '有限空间' | '通用作业面';

  // 归属区域类型: 船厂厂区 | 建造船模选择 (原造船项目)
  belongingType: WorkfaceBelongingType;
  
  // 1. 若为船厂厂区 (yard)
  yardZoneId?: string;            // 一级厂区区域ID (如 zone_assembly_block)
  yardZoneName?: string;          // 一级厂区区域名称 (如 总装焊与分段建造区)
  yardSubAreaId?: string;         // 二级具体工位/车间ID (如 sa_assy_platform_1)
  yardSubAreaName?: string;       // 二级具体工位/车间名称 (如 总组装焊平台一)
  yardSpecs?: string;             // 平面图解析规格 (如 121m×30m=3630㎡)
  
  // 2. 若为建造船模选择 (原造船项目 project)
  shipModelId?: string;           // 关联网格船模ID (如 M-001)
  shipModelName?: string;         // 关联船模名称 (如 17.4万m³ 薄膜型大型LNG船)
  shipModelType?: string;         // 关联船模类型 (如 LNG液化天然气船)
  shipModelLayerId?: string;      // 船模型分层ID (如 L-02)
  shipModelLayerName?: string;    // 船模型分层名称 (如 货舱层 (NO.1-4 LNG货舱))
  
  projectId?: string;             // 所属项目ID (如 PRJ-2026-LNG01)
  projectName?: string;           // 所属项目名称
  shipCode?: string;              // 船体编码 (如 HULL-LNG-174)
  dockingArea?: string;           // 泊位 / 船台 (如 东南造船厂 1号造船台)
  modelLevel?: 'deck' | 'middle' | 'bottom' | 'engine' | 'bridge' | string; // 二级楼层/分层位置ID
  modelLevelName?: string;        // 二级楼层/分层位置名称
  elevation?: string;             // 标高范围 (如 +8.0m ~ +18.5m)
  volume?: string;                // 容积 (m³)，如 "1280" 或 "850"
  
  // 引用关联的在线在建项目ID/名称列表
  linkedProjectIds?: string[];
  linkedProjectNames?: string[];
  
  // 作业面区域划定数据
  areaDefinition?: WorkfaceAreaDefinition;
  fence?: WorkfaceFence;

  workType: '合拢焊接' | '密闭舱室作业' | '高空涂装' | '管系装配' | '电气舾装' | '探伤质检' | '通用作业';
  riskLevel: '重大风险(红)' | '较大风险(橙)' | '一般风险(黄)' | '低风险(蓝)';
  status: 'active' | 'paused' | 'completed' | 'draft' | '允许作业' | '禁止进入' | '作业中' | '空闲中' | '禁入中'; // 运行状态: 允许作业 | 禁止进入
  
  // 安全与责任人 (支持多安全员)
  safetyOfficer: string;          // 责任安全员 (多个以顿号或逗号连接)
  safetyOfficerPhone: string;     // 手机号码
  safetyOfficers?: SafetyOfficerItem[]; // 多个责任安全员实体清单
  teamName: string;               // 施工班组
  teamLeader: string;             // 班组长
  teamLeaderPhone: string;        // 班组长电话
  capacityLimit?: number;         // 定员上限 (人, 可选)
  currentPersonnelCount: number;  // 当前在场人数
  currentPersonnel: WorkfacePersonnel[]; // 实时作业人员清单
  
  // 设备绑定
  boundBaseStations: WorkfaceBaseStation[];
  boundGasDetectors: WorkfaceGasDetector[];
  boundCameras: WorkfaceCamera[];
  boundAlarms: WorkfaceAlarmDevice[];
  
  // 计划与时段 (可选)
  startDate?: string;             // 开工日期
  endDate?: string;               // 竣工/完工日期
  dailyWorkHours?: string;        // 作业时段 (如 08:00 - 21:30)
  
  // 安全防护与规范
  safetyMeasures: string[];       // 现场管控措施
  description: string;            // 作业面描述与工艺说明
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'smart_shipyard_workfaces_v3';

export const INITIAL_WORKFACES: WorkfaceRecord[] = [
  // === 厂区作业面 (依据东南造船基地平面图区域解析) ===
  {
    id: 'WF-YARD-001',
    code: 'WF-SEC-01',
    name: '总组装焊平台一巨型分段拼对总组面',
    belongingType: 'yard',
    yardZoneId: 'zone_assembly_block',
    yardZoneName: '总装焊与分段建造区',
    yardSubAreaId: 'sa_assy_platform_1',
    yardSubAreaName: '总组装焊平台一',
    yardSpecs: '121m×30m=3630㎡',
    workType: '合拢焊接',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '林海波',
    safetyOfficerPhone: '13859012301',
    teamName: '总装分厂-分段总组一班',
    teamLeader: '陈志强',
    teamLeaderPhone: '13959012302',
    capacityLimit: 15,
    currentPersonnelCount: 9,
    currentPersonnel: [
      { id: 'PY01', name: '陈志强', role: '总组班长', team: '分段总组一班', tagId: 'TAG-YARD-01', entryTime: '07:50', stayDuration: '3小时10分', heartRate: 78, battery: 95, status: 'normal' },
      { id: 'PY02', name: '林海波', role: '现场安全员', team: '安监部', tagId: 'TAG-YARD-02', entryTime: '08:00', stayDuration: '3小时00分', heartRate: 75, battery: 98, status: 'normal' },
      { id: 'PY03', name: '黄大伟', role: '特种焊工', team: '分段总组一班', tagId: 'TAG-YARD-03', entryTime: '08:10', stayDuration: '2小时50分', heartRate: 83, battery: 86, status: 'normal' },
      { id: 'PY04', name: '刘振东', role: '铆工预装', team: '分段总组一班', tagId: 'TAG-YARD-04', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 80, battery: 91, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-SEC-01', name: '总装焊平台一1#UWB基站', code: 'DEV-BS-Y01', type: '定位基站', status: 'online', ip: '192.168.10.101', coverage: '45m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-Y01', sn: 'GAS-SEC-01', name: '总组平台一四合一气体监测仪', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '3 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' }
    ],
    boundCameras: [
      { id: 'CAM-Y01', name: '总组装焊平台一全景AI球机', type: '防爆云台球机', status: 'online', rtspUrl: 'rtsp://192.168.10.211:554/live/stream1', currentChannel: 'CH-11' }
    ],
    boundAlarms: [
      { id: 'ALM-Y01', name: '总组平台起吊预警声光器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-29 08:30' }
    ],
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    dailyWorkHours: '08:00 - 21:00',
    safetyMeasures: [
      '大型分段拼装翻身吊运期间划定半径20米立体警戒圈',
      '龙门吊起吊主钩垂直投影下方严禁人员走动与停留',
      '特种焊接动火必须配备专职监护人及便携干粉灭火器'
    ],
    description: '东南造船基地总组装焊平台一（3630㎡），承担散货船及集装箱船巨型总段合拢拼装焊接工程。',
    createdAt: '2026-09-01 08:00:00',
    updatedAt: '2026-09-30 08:30:00'
  },
  {
    id: 'WF-YARD-002',
    code: 'WF-SEC-02',
    name: '5071㎡涂装车间密闭喷砂除锈特涂面',
    belongingType: 'yard',
    yardZoneId: 'zone_paint',
    yardZoneName: '涂装与表面处理区',
    yardSubAreaId: 'sa_paint_workshop',
    yardSubAreaName: '涂装车间',
    yardSpecs: '5071㎡ (密闭高压喷砂除锈与喷涂)',
    workType: '高空涂装',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '郑文杰',
    safetyOfficerPhone: '13859012303',
    teamName: '涂装分厂-防腐特涂一班',
    teamLeader: '吴金水',
    teamLeaderPhone: '13959012304',
    capacityLimit: 10,
    currentPersonnelCount: 6,
    currentPersonnel: [
      { id: 'PY11', name: '吴金水', role: '涂装班长', team: '防腐特涂一班', tagId: 'TAG-YARD-11', entryTime: '08:00', stayDuration: '3小时00分', heartRate: 81, battery: 90, status: 'normal' },
      { id: 'PY12', name: '郑文杰', role: '涂装安全员', team: '安监部', tagId: 'TAG-YARD-12', entryTime: '08:05', stayDuration: '2小时55分', heartRate: 76, battery: 96, status: 'normal' },
      { id: 'PY13', name: '方建国', role: '高压喷砂工', team: '防腐特涂一班', tagId: 'TAG-YARD-13', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 85, battery: 84, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-SEC-02', name: '涂装车间防爆定位基站', code: 'DEV-BS-Y02', type: '定位基站', status: 'online', ip: '192.168.10.102', coverage: '40m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-Y02', sn: 'GAS-SEC-02', name: '涂装车间有机溶剂VOC及可燃气体探头', status: 'online', readings: { o2: '20.8%', ch4: '1% LEL', co: '4 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' }
    ],
    boundCameras: [
      { id: 'CAM-Y02', name: '涂装车间防爆红外布控球机', type: '防爆布控球', status: 'online', rtspUrl: 'rtsp://192.168.10.212:554/live/stream1', currentChannel: 'CH-12' }
    ],
    boundAlarms: [
      { id: 'ALM-Y02', name: '涂装溶剂超标联动防爆声光器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-28 14:00' }
    ],
    startDate: '2026-09-10',
    endDate: '2026-11-20',
    dailyWorkHours: '08:00 - 18:00',
    safetyMeasures: [
      '涂装作业全过程开启强排风防爆除尘系统',
      'VOC挥发性有机溶剂及可燃气体浓度超标(>10%LEL)自动切断电源并报警',
      '进场作业人员必须佩戴正压送风防毒面具与防静电作业服'
    ],
    description: '东南造船基地5071㎡密闭涂装车间，进行大型船体分段高压无气喷涂与特种耐腐蚀涂层工艺。',
    createdAt: '2026-09-10 08:00:00',
    updatedAt: '2026-09-30 08:30:00'
  },
  {
    id: 'WF-YARD-003',
    code: 'WF-SEC-03',
    name: '128船台滑道搭载总装作业面',
    belongingType: 'yard',
    yardZoneId: 'zone_berth_quay',
    yardZoneName: '船台船坞与码头作业区',
    yardSubAreaId: 'sa_berth_128',
    yardSubAreaName: '128船台',
    yardSpecs: '120m×30m×16m×20.6m (有效长度200m)',
    workType: '合拢焊接',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '张立峰',
    safetyOfficerPhone: '13859012305',
    teamName: '船台分厂-船台搭载装焊队',
    teamLeader: '宋海龙',
    teamLeaderPhone: '13959012306',
    capacityLimit: 20,
    currentPersonnelCount: 11,
    currentPersonnel: [],
    boundBaseStations: [
      { id: 'BS-SEC-03', name: '128船台门机高点定位基站', code: 'DEV-BS-Y03', type: '定位基站', status: 'online', ip: '192.168.10.103', coverage: '50m半径' },
    ],
    boundGasDetectors: [],
    boundCameras: [
      { id: 'CAM-Y03', name: '128船台60T起重机全景球机', type: '防爆云台球机', status: 'online', rtspUrl: 'rtsp://192.168.10.213:554/live/stream1', currentChannel: 'CH-13' }
    ],
    boundAlarms: [],
    startDate: '2026-08-01',
    endDate: '2026-12-15',
    dailyWorkHours: '08:00 - 21:00',
    safetyMeasures: [
      '船台滑道临边设置标准双道防护栏杆与防坠落安全网',
      '两台门式起重机协同抬吊必须执行专人同频指挥',
      '合拢口焊缝打磨必须佩戴防护眼罩与阻燃手套'
    ],
    description: '东南造船基地128船台（有效长度200m），配置60T/22m起重机与门吊，进行船舶主体合拢搭载。',
    createdAt: '2026-08-01 08:00:00',
    updatedAt: '2026-09-30 08:30:00'
  },
  // === 造船项目作业面 (工程船舶与二级分层楼层联动) ===
  {
    id: 'WF-2026-001',
    code: 'WF-LNG-01',
    name: '1#液货舱绝热合拢作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-001',
    shipModelName: '17.4万m³ 薄膜型大型LNG船',
    shipModelType: 'LNG液化天然气船',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipCode: 'HULL-LNG-174',
    dockingArea: '东南造船厂 1号造船台',
    modelLevel: 'middle',
    modelLevelName: '中舱货油/货舱层',
    elevation: '+8.0m ~ +18.5m (绝热箱主合拢区)',
    workType: '合拢焊接',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '周卫国',
    safetyOfficerPhone: '13812345601',
    teamName: '船体二分厂-绝热结构合拢班',
    teamLeader: '赵宏',
    teamLeaderPhone: '13955667788',
    capacityLimit: 12,
    currentPersonnelCount: 7,
    currentPersonnel: [
      { id: 'P01', name: '赵宏', role: '绝热装配工', team: '绝热合拢班', tagId: 'TAG-UWB-901', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 78, battery: 92, status: 'normal' },
      { id: 'P02', name: '钱大勇', role: '特种焊工', team: '绝热合拢班', tagId: 'TAG-UWB-902', entryTime: '08:20', stayDuration: '2小时40分', heartRate: 85, battery: 88, status: 'normal' },
      { id: 'P03', name: '周卫国', role: '当班安全员', team: '安监部', tagId: 'TAG-UWB-903', entryTime: '08:05', stayDuration: '2小时55分', heartRate: 74, battery: 96, status: 'normal' },
      { id: 'P04', name: '李强', role: '氩弧焊工', team: '绝热合拢班', tagId: 'TAG-UWB-904', entryTime: '08:30', stayDuration: '2小时30分', heartRate: 82, battery: 85, status: 'normal' },
      { id: 'P05', name: '孙学文', role: '合拢校正工', team: '绝热合拢班', tagId: 'TAG-UWB-905', entryTime: '08:45', stayDuration: '2小时15分', heartRate: 79, battery: 90, status: 'normal' },
      { id: 'P06', name: '吴建军', role: '装配钳工', team: '绝热合拢班', tagId: 'TAG-UWB-906', entryTime: '09:00', stayDuration: '2小时00分', heartRate: 88, battery: 79, status: 'normal' },
      { id: 'P07', name: '郑立明', role: '探伤无损检测员', team: '质检部', tagId: 'TAG-UWB-907', entryTime: '09:10', stayDuration: '1小时50分', heartRate: 75, battery: 94, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-LNG-01', name: '1#液货舱合拢作业面基站', code: 'DEV-BS-05', type: '防爆UWB主基站', status: 'online', ip: '192.168.10.21', coverage: '35m半径' },
      { id: 'BS-LNG-02', name: 'LNG艉部合拢辅助基站', code: 'DEV-BS-07', type: '从基站', status: 'online', ip: '192.168.10.22', coverage: '25m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-01', sn: 'GAS-LNG-101', name: '1#液货舱防爆四合一气体监测仪', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '4 ppm', h2s: '0.0 ppm' }, lastUpdate: '1分钟前' },
      { id: 'GAS-02', sn: 'GAS-LNG-102', name: '底板汇流排移动式可燃气体探头', status: 'online', readings: { o2: '20.8%', ch4: '2% LEL', co: '6 ppm', h2s: '0.1 ppm' }, lastUpdate: '30秒前' },
    ],
    boundCameras: [
      { id: 'CAM-01', name: '1#绝热合拢高点AI防爆球机', type: '防爆云台球机', status: 'online', rtspUrl: 'rtsp://192.168.10.201:554/live/stream1', currentChannel: 'CH-01' },
      { id: 'CAM-02', name: '舱口人员进出识别布控球', type: '防爆布控球', status: 'online', rtspUrl: 'rtsp://192.168.10.202:554/live/stream1', currentChannel: 'CH-02' },
    ],
    boundAlarms: [
      { id: 'ALM-DEV-01', name: '1#舱口防爆声光报警器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-28 16:30' },
    ],
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    dailyWorkHours: '08:00 - 20:30',
    safetyMeasures: [
      '进舱前强制轴流风机通风30分钟以上',
      '作业全过程开启4合1便携及固定式气体连续在线监测',
      '入舱人员必须100%佩戴本安型防爆定位工牌',
      '动火作业需专职安全员(周卫国)现场全时旁站监护',
      '舱外专设应急呼叫喇叭与快速逃生绳梯'
    ],
    description: '负责首座17.4万方LNG运输船1号货舱绝热箱主结构装配与次屏蔽层双面氩弧焊合拢，属于船厂一级高危作业面。',
    createdAt: '2026-09-01 08:00:00',
    updatedAt: '2026-09-30 08:45:12'
  },
  {
    id: 'WF-2026-002',
    code: 'WF-BOX-02',
    name: '10#箱位导轨架垂直吊装作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-002',
    shipModelName: '24,000 TEU 超大型集装箱船',
    shipModelType: '超大型集装箱船',
    projectId: 'PRJ-2026-BOX12',
    projectName: '24,000 TEU 超大型集装箱船',
    shipCode: 'HULL-BOX-240',
    dockingArea: '马尾造船厂 6号船台（平船台）',
    modelLevel: 'deck',
    modelLevelName: '甲板层',
    elevation: '+18.5m ~ +32.0m (甲板上部导轨区)',
    workType: '合拢焊接',
    riskLevel: '较大风险(橙)',
    status: 'active',
    safetyOfficer: '李建明',
    safetyOfficerPhone: '13812345602',
    teamName: '总装分厂-导轨精密装配组',
    teamLeader: '王敏',
    teamLeaderPhone: '13866778899',
    capacityLimit: 10,
    currentPersonnelCount: 5,
    currentPersonnel: [
      { id: 'P11', name: '王敏', role: '装配钳工', team: '导轨装配组', tagId: 'TAG-UWB-911', entryTime: '08:00', stayDuration: '3小时00分', heartRate: 80, battery: 94, status: 'normal' },
      { id: 'P12', name: '李建明', role: '专职安全员', team: '安监部', tagId: 'TAG-UWB-912', entryTime: '08:05', stayDuration: '2小时55分', heartRate: 76, battery: 97, status: 'normal' },
      { id: 'P13', name: '陈国平', role: '起重指挥司索工', team: '起重作业班', tagId: 'TAG-UWB-913', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 84, battery: 89, status: 'normal' },
      { id: 'P14', name: '何海林', role: '电焊工', team: '导轨装配组', tagId: 'TAG-UWB-914', entryTime: '08:30', stayDuration: '2小时30分', heartRate: 81, battery: 82, status: 'normal' },
      { id: 'P15', name: '丁志远', role: '测量定位工', team: '质检部', tagId: 'TAG-UWB-915', entryTime: '08:50', stayDuration: '2小时10分', heartRate: 77, battery: 91, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-BOX-01', name: '10#箱位导轨作业面基站', code: 'DEV-BS-08', type: '超宽带UWB主基站', status: 'online', ip: '192.168.10.31', coverage: '40m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-03', sn: 'GAS-BOX-201', name: '10#箱位固定式气体监测仪', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '2 ppm', h2s: '0.0 ppm' }, lastUpdate: '2分钟前' },
    ],
    boundCameras: [
      { id: 'CAM-03', name: '6号船台龙门吊吊运全景球机', type: '防爆云台球机', status: 'online', rtspUrl: 'rtsp://192.168.10.203:554/live/stream1', currentChannel: 'CH-03' },
    ],
    boundAlarms: [
      { id: 'ALM-DEV-02', name: '导轨架起吊垂直投影声光报警器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-29 09:00' },
    ],
    startDate: '2026-09-10',
    endDate: '2026-10-25',
    dailyWorkHours: '08:00 - 18:00',
    safetyMeasures: [
      '起重吊装期间，起吊作业垂直投影下方严禁任何人员滞留（UWB电子围栏实时联动）',
      '高空测量作业人员必须全程系挂双大钩五点式安全带',
      '司索指挥必须持有特种设备作业资格证且带对讲机实时呼叫'
    ],
    description: '大型集装箱船箱位导轨架垂直度激光标定与锁紧焊接作业，吊运荷载大、交叉高空作业密集。',
    createdAt: '2026-09-10 08:30:00',
    updatedAt: '2026-09-30 08:30:00'
  },
  {
    id: 'WF-2026-003',
    code: 'WF-LNG-03',
    name: '艉部主推进机舱管系装配面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-001',
    shipModelName: '17.4万m³ 薄膜型大型LNG船',
    shipModelType: 'LNG液化天然气船',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipCode: 'HULL-LNG-174',
    dockingArea: '东南造船厂 1号造船台',
    modelLevel: 'engine',
    modelLevelName: '机舱区',
    elevation: '-2.0m ~ +12.0m (双燃料主机平台)',
    workType: '管系装配',
    riskLevel: '较大风险(橙)',
    status: 'active',
    safetyOfficer: '孙志刚',
    safetyOfficerPhone: '13812345603',
    teamName: '动力分厂-管装一班',
    teamLeader: '许开明',
    teamLeaderPhone: '13799881122',
    capacityLimit: 15,
    currentPersonnelCount: 8,
    currentPersonnel: [
      { id: 'P21', name: '许开明', role: '管系班长', team: '管装一班', tagId: 'TAG-UWB-921', entryTime: '08:00', stayDuration: '3小时00分', heartRate: 80, battery: 90, status: 'normal' },
      { id: 'P22', name: '孙志刚', role: '机舱安全员', team: '安监部', tagId: 'TAG-UWB-922', entryTime: '08:05', stayDuration: '2小时55分', heartRate: 75, battery: 95, status: 'normal' },
      { id: 'P23', name: '刘成才', role: '高压管焊工', team: '管装一班', tagId: 'TAG-UWB-923', entryTime: '08:10', stayDuration: '2小时50分', heartRate: 86, battery: 83, status: 'normal' },
      { id: 'P24', name: '张宝林', role: '管道装配钳工', team: '管装一班', tagId: 'TAG-UWB-924', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 83, battery: 87, status: 'normal' },
      { id: 'P25', name: '方宏博', role: '法兰打磨工', team: '管装一班', tagId: 'TAG-UWB-925', entryTime: '08:25', stayDuration: '2小时35分', heartRate: 87, battery: 78, status: 'normal' },
      { id: 'P26', name: '郭海波', role: '机舱电工', team: '电气车间', tagId: 'TAG-UWB-926', entryTime: '08:35', stayDuration: '2小时25分', heartRate: 79, battery: 92, status: 'normal' },
      { id: 'P27', name: '沈建华', role: '热处理质检', team: '质检部', tagId: 'TAG-UWB-927', entryTime: '08:45', stayDuration: '2小时15分', heartRate: 73, battery: 96, status: 'normal' },
      { id: 'P28', name: '吴小峰', role: '配管辅助工', team: '管装一班', tagId: 'TAG-UWB-928', entryTime: '08:50', stayDuration: '2小时10分', heartRate: 81, battery: 86, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-ENG-01', name: '机舱作业面基站', code: 'LNG-BS-W02', type: '防爆UWB主基站', status: 'online', ip: '192.168.10.23', coverage: '30m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-04', sn: 'GAS-ENG-101', name: '机舱双燃料低位气体探头', status: 'online', readings: { o2: '20.7%', ch4: '1% LEL', co: '5 ppm', h2s: '0.0 ppm' }, lastUpdate: '1分钟前' },
    ],
    boundCameras: [
      { id: 'CAM-04', name: '机舱中层平台监控枪机', type: 'AI抓拍枪机', status: 'online', rtspUrl: 'rtsp://192.168.10.204:554/live/stream1', currentChannel: 'CH-04' },
    ],
    boundAlarms: [
      { id: 'ALM-DEV-03', name: '机舱出入口声光报警器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-27 11:20' },
    ],
    startDate: '2026-08-15',
    endDate: '2026-11-20',
    dailyWorkHours: '08:00 - 21:00',
    safetyMeasures: [
      '双燃料天然气供气管线法兰螺栓扭矩打点核验',
      '机舱底层积水和油气浓度必须每日每班开工前书面交底记录',
      '现场配备两台手提式干粉及二氧化碳灭火器'
    ],
    description: 'WinGD双燃料主机进气单元、高低压燃气汇流排及压载水处理管系合拢安装。',
    createdAt: '2026-08-15 08:00:00',
    updatedAt: '2026-09-30 08:20:00'
  },
  {
    id: 'WF-2026-004',
    code: 'WF-PCTC-04',
    name: '艉部滚装跳板液压铰链安装面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-003',
    shipModelName: '30万吨 VLCC 超大型原油船',
    shipModelType: '超大型油轮 (VLCC)',
    projectId: 'PRJ-2026-PCTC05',
    projectName: '7,000 车位双燃料 PCTC 滚装船',
    shipCode: 'HULL-PCTC-700',
    dockingArea: '东南造船厂 舾装码头1#泊位',
    modelLevel: 'deck',
    modelLevelName: '甲板层',
    elevation: '+12.0m ~ +18.0m (艉部跳板平台)',
    workType: '电气舾装',
    riskLevel: '一般风险(黄)',
    status: 'active',
    safetyOfficer: '刘涛',
    safetyOfficerPhone: '13812345604',
    teamName: '舾装分厂-液压系统班',
    teamLeader: '高振',
    teamLeaderPhone: '13911223344',
    capacityLimit: 8,
    currentPersonnelCount: 4,
    currentPersonnel: [
      { id: 'P31', name: '高振', role: '液压班长', team: '液压系统班', tagId: 'TAG-UWB-931', entryTime: '08:20', stayDuration: '2小时40分', heartRate: 76, battery: 93, status: 'normal' },
      { id: 'P32', name: '刘涛', role: '安全巡检员', team: '安监部', tagId: 'TAG-UWB-932', entryTime: '08:25', stayDuration: '2小时35分', heartRate: 74, battery: 95, status: 'normal' },
      { id: 'P33', name: '朱卫东', role: '液压调试工', team: '液压系统班', tagId: 'TAG-UWB-933', entryTime: '08:30', stayDuration: '2小时30分', heartRate: 79, battery: 88, status: 'normal' },
      { id: 'P34', name: '陆平', role: '电气接线工', team: '电气车间', tagId: 'TAG-UWB-934', entryTime: '08:40', stayDuration: '2小时20分', heartRate: 75, battery: 91, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-PCTC-01', name: '滚装跳板作业面基站', code: 'PCTC-BS-W01', type: '定位基站', status: 'online', ip: '192.168.10.45', coverage: '30m半径' },
    ],
    boundGasDetectors: [],
    boundCameras: [
      { id: 'CAM-05', name: '艉部跳板抓拍AI摄像机', type: 'AI抓拍枪机', status: 'online', rtspUrl: 'rtsp://192.168.10.205:554/live/stream1', currentChannel: 'CH-05' },
    ],
    boundAlarms: [
      { id: 'ALM-DEV-04', name: '跳板动载升降警戒声光器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-26 14:00' },
    ],
    startDate: '2026-09-15',
    endDate: '2026-10-31',
    dailyWorkHours: '08:00 - 18:30',
    safetyMeasures: [
      '跳板液压启闭测试时，严禁人员踏上跳板活动面',
      '码头靠泊侧设置防落水救生圈与防坠安全网',
      '电气接线需完全断电挂牌锁止(LOTO)'
    ],
    description: '负责7000车位滚装船重载艉跳板液压铰链就位紧固、油缸试压与电气控制箱调试。',
    createdAt: '2026-09-15 09:00:00',
    updatedAt: '2026-09-30 08:10:00'
  },
  {
    id: 'WF-2026-005',
    code: 'WF-BULK-05',
    name: '1#货舱双层底压载密闭舱探伤面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-004',
    shipModelName: '82,000 DWT 卡姆萨尔型散货船',
    shipModelType: '卡姆萨尔型散货船',
    projectId: 'PRJ-2026-BULK08',
    projectName: '82,000 DWT 卡姆萨尔型散货船',
    shipCode: 'HULL-BULK-082',
    dockingArea: '马尾造船厂 2号船坞',
    modelLevel: 'bottom',
    modelLevelName: '底舱层',
    elevation: '0.0m ~ +4.5m (双层底内板狭窄密闭区)',
    workType: '密闭舱室作业',
    riskLevel: '重大风险(红)',
    status: 'paused',
    safetyOfficer: '韩伟',
    safetyOfficerPhone: '13812345605',
    teamName: '质检分厂-射线超声探伤组',
    teamLeader: '宋建国',
    teamLeaderPhone: '13877665544',
    capacityLimit: 6,
    currentPersonnelCount: 0,
    currentPersonnel: [],
    boundBaseStations: [
      { id: 'BS-BULK-01', name: '1#大舱舷梯口作业面基站', code: 'BULK-BS-W01', type: '防爆UWB主基站', status: 'online', ip: '192.168.10.51', coverage: '25m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-05', sn: 'GAS-BLK-301', name: '双层底压载舱气体在线监测仪', status: 'warning', readings: { o2: '19.4%', ch4: '0% LEL', co: '8 ppm', h2s: '0.0 ppm' }, lastUpdate: '5分钟前' },
    ],
    boundCameras: [
      { id: 'CAM-06', name: '舱口防爆监护球机', type: '防爆布控球', status: 'online', rtspUrl: 'rtsp://192.168.10.206:554/live/stream1', currentChannel: 'CH-06' },
    ],
    boundAlarms: [
      { id: 'ALM-DEV-05', name: '密闭舱口缺氧联动声光器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-28 10:00' },
    ],
    startDate: '2026-09-20',
    endDate: '2026-10-15',
    dailyWorkHours: '08:30 - 17:30',
    safetyMeasures: [
      '由于氧气浓度监测值微降至19.4%，系统已自动告警并置为“暂停作业”状态',
      '密闭受限空间必须执行作业票审批制，严格做到“先通风、再检测、后作业”',
      '探伤探头射线下发期间划定5米警戒辐射屏蔽区'
    ],
    description: '散货船底部压载双层底骨架无损探伤NDT作业，因受限空间通风维护现处于受控暂停状态。',
    createdAt: '2026-09-20 09:30:00',
    updatedAt: '2026-09-30 07:50:00'
  },
  {
    id: 'WF-2026-006',
    code: 'WF-WIND-06',
    name: '3#桩腿50m高空升降平台合拢作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-006',
    shipModelName: '69.8M 海上风电运维工作船',
    shipModelType: '风电运维船 (SOV)',
    projectId: 'PRJ-2026-WIND03',
    projectName: '海上风电自升式安装平台',
    shipCode: 'HULL-WIND-03',
    dockingArea: '东南造船厂 4号船台',
    modelLevel: 'bridge',
    modelLevelName: '驾驶台',
    elevation: '+45.0m ~ +58.0m (超高空自升式桩腿节点)',
    workType: '高空涂装',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '杨广',
    safetyOfficerPhone: '13812345606',
    teamName: '特种工程分厂-高空钢构队',
    teamLeader: '黄伟',
    teamLeaderPhone: '13933445566',
    capacityLimit: 8,
    currentPersonnelCount: 3,
    currentPersonnel: [
      { id: 'P41', name: '黄伟', role: '高空合拢焊工', team: '高空钢构队', tagId: 'TAG-UWB-941', entryTime: '08:10', stayDuration: '2小时50分', heartRate: 88, battery: 91, status: 'normal' },
      { id: 'P42', name: '杨广', role: '专职高空安全员', team: '安监部', tagId: 'TAG-UWB-942', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 77, battery: 96, status: 'normal' },
      { id: 'P43', name: '马超', role: '防腐涂装工', team: '高空钢构队', tagId: 'TAG-UWB-943', entryTime: '08:30', stayDuration: '2小时30分', heartRate: 84, battery: 85, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-WIND-01', name: '桩腿高空作业面基站', code: 'WIND-BS-W01', type: '定位基站', status: 'online', ip: '192.168.10.61', coverage: '30m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-06', sn: 'GAS-WND-401', name: '桩腿平台气体检测仪', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '1 ppm', h2s: '0.0 ppm' }, lastUpdate: '1分钟前' },
    ],
    boundCameras: [
      { id: 'CAM-07', name: '风电桩腿高点AI云台摄像机', type: '防爆云台球机', status: 'online', rtspUrl: 'rtsp://192.168.10.207:554/live/stream1', currentChannel: 'CH-07' },
    ],
    boundAlarms: [
      { id: 'ALM-DEV-06', name: '高空防坠失联联动声光器', type: '现场广播喇叭', status: 'online', lastTestTime: '2026-09-25 15:00' },
    ],
    startDate: '2026-09-18',
    endDate: '2026-11-10',
    dailyWorkHours: '08:00 - 17:30',
    safetyMeasures: [
      '高空特种作业必须穿戴五点双大钩安全带，挂钩状态受智能传感监测',
      '风速超过6级(10.8m/s)或大雾阵雨天气立即停止室外高空作业',
      '上下爬梯必须使用自锁防坠器'
    ],
    description: '海上自升式风电安装平台桩腿高空插销箱就位、超高强钢齿条焊后修磨及特涂作业。',
    createdAt: '2026-09-18 08:30:00',
    updatedAt: '2026-09-30 08:05:00'
  },
  {
    id: 'WF-2026-007',
    code: 'WF-SUP-07',
    name: '上层建筑综合生活区电气舾装面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-007',
    shipModelName: '37米 多用途海洋工程支持船',
    shipModelType: '多用途支持船 (AHTS)',
    projectId: 'PRJ-2026-SUP02',
    projectName: '海洋石油大马力深水三用工作船 (AHTS)',
    shipCode: 'HULL-AHTS-02',
    dockingArea: '东南造船厂 舾装码头2#泊位',
    modelLevel: 'bridge',
    modelLevelName: '驾驶台',
    elevation: '+24.0m ~ +36.0m (驾控台与生活舱)',
    workType: '电气舾装',
    riskLevel: '低风险(蓝)',
    status: 'draft',
    safetyOfficer: '张勇',
    safetyOfficerPhone: '13812345607',
    teamName: '电气分厂-通导仪表组',
    teamLeader: '赵振宇',
    teamLeaderPhone: '13822334455',
    capacityLimit: 12,
    currentPersonnelCount: 0,
    currentPersonnel: [],
    boundBaseStations: [
      { id: 'BS-SUP-01', name: '驾驶台通导作业面基站', code: 'DEV-BS-09', type: '定位基站', status: 'online', ip: '192.168.10.72', coverage: '25m半径' },
    ],
    boundGasDetectors: [],
    boundCameras: [],
    boundAlarms: [],
    startDate: '2026-10-08',
    endDate: '2026-11-25',
    dailyWorkHours: '08:00 - 18:00',
    safetyMeasures: [
      '通导精密雷达、航向仪、雷达屏等设备防尘防静电保护',
      '电缆拉敷禁止锋利钢结构直接刮擦磨损绝缘层',
      '生活区装修严格禁火'
    ],
    description: '三用工作船上层建筑驾控雷达台、DP动态定位集成柜及船员舱室电气装配。',
    createdAt: '2026-09-25 14:00:00',
    updatedAt: '2026-09-25 14:00:00'
  },
  {
    id: 'WF-2026-008',
    code: 'WF-LNG-08',
    name: '艏楼压载水泵房与锚绞机作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-001',
    shipModelName: '17.4万m³ 薄膜型大型LNG船',
    shipModelType: 'LNG液化天然气船',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipCode: 'HULL-LNG-174',
    dockingArea: '东南造船厂 1号造船台',
    modelLevel: 'deck',
    modelLevelName: '甲板层',
    elevation: '+18.5m ~ +24.0m (艏楼甲板)',
    workType: '通用作业',
    riskLevel: '一般风险(黄)',
    status: 'completed',
    safetyOfficer: '周卫国',
    safetyOfficerPhone: '13812345601',
    teamName: '船体二分厂-甲板总装班',
    teamLeader: '钱进',
    teamLeaderPhone: '13944556677',
    capacityLimit: 10,
    currentPersonnelCount: 0,
    currentPersonnel: [],
    boundBaseStations: [
      { id: 'BS-LNG-03', name: '艏楼作业面基站', code: 'LNG-BS-W03', type: '定位基站', status: 'online', ip: '192.168.10.24', coverage: '30m半径' },
    ],
    boundGasDetectors: [],
    boundCameras: [],
    boundAlarms: [],
    startDate: '2026-08-01',
    endDate: '2026-09-25',
    dailyWorkHours: '08:00 - 18:00',
    safetyMeasures: [
      '锚绞机底座研磨找平及地脚螺栓紧固',
      '液压管路清洁度酸洗钝化处理',
      '作业已全部验收合格并归档'
    ],
    description: '艏楼甲板锚链筒对中、绞盘液压马达固定安装工程，现已完成验收。',
    createdAt: '2026-08-01 08:00:00',
    updatedAt: '2026-09-25 17:30:00'
  },
  {
    id: 'WF-2026-009',
    code: 'WF-LNG-09',
    name: '2#液货舱次屏蔽层薄膜氩弧焊作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-001',
    shipModelName: '17.4万m³ 薄膜型大型LNG船',
    shipModelType: 'LNG液化天然气船',
    projectId: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipCode: 'HULL-LNG-174',
    dockingArea: '东南造船厂 1号造船台',
    modelLevel: 'middle',
    modelLevelName: '中舱货油/货舱层',
    elevation: '+8.0m ~ +18.5m (绝热箱主合拢区)',
    volume: '1450',
    workType: '合拢焊接',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '周卫国',
    safetyOfficerPhone: '13812345601',
    teamName: '船体二分厂-薄膜特种焊接组',
    teamLeader: '张建军',
    teamLeaderPhone: '13988776655',
    capacityLimit: 10,
    currentPersonnelCount: 6,
    currentPersonnel: [
      { id: 'P51', name: '张建军', role: '薄膜焊班长', team: '薄膜特种焊接组', tagId: 'TAG-UWB-951', entryTime: '08:00', stayDuration: '3小时00分', heartRate: 82, battery: 90, status: 'normal' },
      { id: 'P52', name: '李强', role: '殷瓦钢特种焊工', team: '薄膜特种焊接组', tagId: 'TAG-UWB-952', entryTime: '08:10', stayDuration: '2小时50分', heartRate: 86, battery: 85, status: 'normal' },
      { id: 'P53', name: '周卫国', role: '当班安全员', team: '安监部', tagId: 'TAG-UWB-953', entryTime: '08:05', stayDuration: '2小时55分', heartRate: 75, battery: 97, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-LNG-04', name: '2#液货舱作业面主基站', code: 'LNG-BS-W04', type: '定位基站', status: 'online', ip: '192.168.10.25', coverage: '35m半径' },
    ],
    boundGasDetectors: [
      { id: 'GAS-07', sn: 'GAS-LNG-201', name: '2#舱防爆四合一气体检测仪', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '3 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' }
    ],
    boundCameras: [
      { id: 'CAM-08', name: '2#货舱AI防爆监控球机', type: '防爆云台球机', status: 'online', rtspUrl: 'rtsp://192.168.10.208:554/live/stream1', currentChannel: 'CH-08' }
    ],
    boundAlarms: [
      { id: 'ALM-DEV-07', name: '2#舱口防爆声光报警器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-29 10:00' }
    ],
    startDate: '2026-09-15',
    endDate: '2026-12-10',
    dailyWorkHours: '08:00 - 20:00',
    safetyMeasures: [
      '殷瓦钢焊接全过程保持氦气检漏与正压送风',
      '作业人员佩戴本安型定位手环与防毒面具',
      '舱外设专职看火人与应急救援绳索'
    ],
    description: '负责2#液货舱0.7mm薄膜次屏蔽层密封性手弧与自动氩弧焊接装配工程。',
    createdAt: '2026-09-15 08:30:00',
    updatedAt: '2026-09-30 09:00:00'
  },
  {
    id: 'WF-2026-010',
    code: 'WF-BOX-10',
    name: '主推进主机缸盖与高压燃气管路装配面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-002',
    shipModelName: '24,000 TEU 超大型集装箱船',
    shipModelType: '超大型集装箱船',
    projectId: 'PRJ-2026-BOX12',
    projectName: '24,000 TEU 超大型集装箱船',
    shipCode: 'HULL-BOX-240',
    dockingArea: '马尾造船厂 6号船台（平船台）',
    modelLevel: 'engine',
    modelLevelName: '机舱区',
    elevation: '-2.0m ~ +12.0m (WinGD双燃料主机上部)',
    volume: '2100',
    workType: '管系装配',
    riskLevel: '较大风险(橙)',
    status: 'active',
    safetyOfficer: '李建明',
    safetyOfficerPhone: '13812345602',
    teamName: '机电分厂-轮机安装一班',
    teamLeader: '宋海波',
    teamLeaderPhone: '13911225566',
    capacityLimit: 12,
    currentPersonnelCount: 5,
    currentPersonnel: [
      { id: 'P61', name: '宋海波', role: '轮机安装班长', team: '轮机安装一班', tagId: 'TAG-UWB-961', entryTime: '08:00', stayDuration: '3小时00分', heartRate: 79, battery: 92, status: 'normal' },
      { id: 'P62', name: '王伟', role: '高压管路装配工', team: '轮机安装一班', tagId: 'TAG-UWB-962', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 83, battery: 88, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-BOX-02', name: '主机平台UWB主基站', code: 'DEV-BS-10', type: '定位基站', status: 'online', ip: '192.168.10.32', coverage: '30m半径' }
    ],
    boundGasDetectors: [
      { id: 'GAS-08', sn: 'GAS-BOX-202', name: '主机舱高位气体检测仪', status: 'online', readings: { o2: '20.8%', ch4: '0% LEL', co: '4 ppm', h2s: '0.0 ppm' }, lastUpdate: '1分钟前' }
    ],
    boundCameras: [
      { id: 'CAM-09', name: '主机上部平台枪机', type: 'AI抓拍枪机', status: 'online', rtspUrl: 'rtsp://192.168.10.209:554/live/stream1', currentChannel: 'CH-09' }
    ],
    boundAlarms: [],
    startDate: '2026-09-20',
    endDate: '2026-11-15',
    dailyWorkHours: '08:00 - 18:00',
    safetyMeasures: [
      '高压燃气管路双壁管法兰扭矩拉伸器校验',
      '主机吊运缸盖期间下方禁入',
      '现场设置干粉灭火器及通风设备'
    ],
    description: 'WinGD 11X92DF 双燃料主机11个缸盖吊装就位与高压LNG燃气喷射管汇合拢装配。',
    createdAt: '2026-09-20 08:00:00',
    updatedAt: '2026-09-30 08:30:00'
  },
  {
    id: 'WF-2026-011',
    code: 'WF-VLCC-11',
    name: '货油泵舱防爆泵组与管汇试压作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-003',
    shipModelName: '30万吨 VLCC 超大型原油船',
    shipModelType: '超大型油轮 (VLCC)',
    projectId: 'PRJ-2026-TANK02',
    projectName: '30万吨 VLCC 超大型原油船',
    shipCode: 'HULL-VLCC-300',
    dockingArea: '冠海造船厂 3号干船坞',
    modelLevel: 'bottom',
    modelLevelName: '底舱层',
    elevation: '0.0m ~ +8.0m (货油泵舱底部密闭区)',
    volume: '1850',
    workType: '管系装配',
    riskLevel: '重大风险(红)',
    status: 'active',
    safetyOfficer: '陈明',
    safetyOfficerPhone: '13812345608',
    teamName: '管道分厂-高压管试压队',
    teamLeader: '刘国强',
    teamLeaderPhone: '13922334488',
    capacityLimit: 8,
    currentPersonnelCount: 4,
    currentPersonnel: [
      { id: 'P71', name: '刘国强', role: '试压队长', team: '高压管试压队', tagId: 'TAG-UWB-971', entryTime: '08:30', stayDuration: '2小时30分', heartRate: 80, battery: 91, status: 'normal' },
      { id: 'P72', name: '陈明', role: '泵舱安全监护员', team: '安监部', tagId: 'TAG-UWB-972', entryTime: '08:25', stayDuration: '2小时35分', heartRate: 76, battery: 95, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-VLCC-01', name: '货油泵舱定位基站', code: 'DEV-BS-11', type: '定位基站', status: 'online', ip: '192.168.10.41', coverage: '25m半径' }
    ],
    boundGasDetectors: [
      { id: 'GAS-09', sn: 'GAS-VLCC-301', name: '泵舱VOC及可燃气在线分析仪', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '2 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' }
    ],
    boundCameras: [
      { id: 'CAM-10', name: '货油泵舱防爆布控球机', type: '防爆布控球', status: 'online', rtspUrl: 'rtsp://192.168.10.210:554/live/stream1', currentChannel: 'CH-10' }
    ],
    boundAlarms: [
      { id: 'ALM-DEV-08', name: '泵舱高压试压警戒声光器', type: '防爆声光报警器', status: 'online', lastTestTime: '2026-09-28 15:30' }
    ],
    startDate: '2026-09-22',
    endDate: '2026-11-20',
    dailyWorkHours: '08:00 - 18:30',
    safetyMeasures: [
      '泵舱受限密闭空间进入前轴流排风30分钟',
      '水压试压保压2.5MPa期间划定隔离警戒线',
      '全程连续监测VOC与硫化氢气体'
    ],
    description: '30万吨VLCC货油泵舱大型防爆螺杆泵组安装、2.5MPa货油总管水压强度与气密性试验。',
    createdAt: '2026-09-22 08:30:00',
    updatedAt: '2026-09-30 08:45:00'
  },
  {
    id: 'WF-2026-012',
    code: 'WF-PCTC-12',
    name: 'C型LNG双燃料储罐舱预装作业面',
    workfaceType: '有限空间',
    belongingType: 'project',
    shipModelId: 'M-005',
    shipModelName: '17.5万吨 PCTC双燃料汽车运输船',
    shipModelType: '汽车运输船 (PCTC)',
    projectId: 'PRJ-2026-PCTC05',
    projectName: '17.5万吨 PCTC双燃料汽车运输船',
    shipCode: 'HULL-PCTC-175',
    dockingArea: '东南造船厂 2号码头',
    modelLevel: 'middle',
    modelLevelName: '中舱货油/货舱层',
    elevation: '+8.0m ~ +18.5m (罐体舱处)',
    volume: '980',
    workType: '合拢焊接',
    riskLevel: '较大风险(橙)',
    status: 'active',
    safetyOfficer: '刘涛',
    safetyOfficerPhone: '13812345604',
    teamName: '特种车间-双燃料罐装组',
    teamLeader: '吴强',
    teamLeaderPhone: '13933221100',
    capacityLimit: 10,
    currentPersonnelCount: 3,
    currentPersonnel: [
      { id: 'P81', name: '吴强', role: '双燃料调试组长', team: '双燃料罐装组', tagId: 'TAG-UWB-981', entryTime: '08:15', stayDuration: '2小时45分', heartRate: 78, battery: 94, status: 'normal' },
      { id: 'P82', name: '刘涛', role: '专职安全巡检', team: '安监部', tagId: 'TAG-UWB-982', entryTime: '08:20', stayDuration: '2小时40分', heartRate: 74, battery: 98, status: 'normal' },
    ],
    boundBaseStations: [
      { id: 'BS-PCTC-02', name: '双燃料储罐舱基站', code: 'DEV-BS-12', type: '定位基站', status: 'online', ip: '192.168.10.46', coverage: '30m半径' }
    ],
    boundGasDetectors: [
      { id: 'GAS-10', sn: 'GAS-PCTC-401', name: 'C型罐区可燃气监测探头', status: 'online', readings: { o2: '20.9%', ch4: '0% LEL', co: '2 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' }
    ],
    boundCameras: [],
    boundAlarms: [],
    startDate: '2026-09-25',
    endDate: '2026-11-30',
    dailyWorkHours: '08:00 - 18:00',
    safetyMeasures: [
      '低温双层不锈钢管路氩弧焊接与真空保压',
      '冷罐绝热层防潮防火隔离',
      '双燃料气体泄漏一级预警联动'
    ],
    description: 'PCTC汽车运输船C型独立LNG双燃料储罐与冷箱管路鞍座就位锁紧工程。',
    createdAt: '2026-09-25 09:00:00',
    updatedAt: '2026-09-30 08:15:00'
  }
];

export function getStoredWorkfaces(): WorkfaceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          ...item,
          belongingType: item.belongingType || (item.yardZoneId ? 'yard' : 'project'),
          workfaceType: item.belongingType === 'yard' ? '通用作业面' : (item.workfaceType || '有限空间')
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load workfaces from localStorage', e);
  }
  return INITIAL_WORKFACES;
}

export function saveStoredWorkfaces(list: WorkfaceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save workfaces to localStorage', e);
  }
}
