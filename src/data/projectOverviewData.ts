// 在建造船项目进度与关键里程碑专业数据模型

export interface ShipbuildingMilestone {
  id: string;
  name: string; // 里程碑名称（如：钢板开工切割、船台安放龙骨、主船体总装合拢、出坞下水、系泊试验、海上试航、完工交付）
  englishName: string; // Steel Cutting, Keel Laying, Hull Assembly, Undocking / Launch, Mooring Trials, Sea Trials, Delivery
  plannedDate: string; // 计划达成日期
  actualDate?: string; // 实际达成日期 (若已完成)
  status: 'completed' | 'in_progress' | 'upcoming' | 'delayed'; // 状态: 已按期达成 | 攻坚进行中 | 计划准备中 | 延期预警
  progressPercent: number; // 0 - 100
  keyDeliverable: string; // 关键产出物 / 交付成果
  inspector: string; // 验收船级社与总质检工程师
  checklistCount: { total: number; passed: number }; // 检验单项
  notes?: string; // 施工攻坚备注
}

export interface DisciplineProgress {
  name: string; // 专业分项名称（如：结构搭载、管系舾装、电气与自动化、涂装防腐、动力及调试）
  progress: number; // 0 - 100
  plannedProgress: number; // 计划进度
  status: 'ahead' | 'on_track' | 'lagging';
}

export interface ActiveShipbuildingProject {
  id: string; // 项目唯一编号，如 PRJ-2026-LNG01
  shipCode: string; // 船体代号 / 标段船体号，如 HULL-LNG-174
  name: string; // 项目船名
  shipType: string; // 船舶类型
  shipCategory: 'LNG/清洁能源' | '超大型集装箱' | 'VLCC油轮' | '大吨位散货' | '海工支持' | '特种化学品';
  status: 'planning' | 'in_progress' | 'completed' | 'suspended';
  statusLabel: string; // 如 '船台合拢中', '系泊电气调试', '坞内总段合拢', '水下舾装', '开工准备'
  overallProgress: number; // 综合进度百分比 (0 - 100)
  plannedProgress: number; // 计划综合进度
  healthStatus: 'ahead' | 'normal' | 'warning'; // 进度健康度: 进度超前 | 正常可控 | 工期受阻预警
  startDate: string; // 开工日期
  deliveryDate: string; // 约定交付日期
  remainingDays: number; // 交付倒计时天数
  dockingArea: string; // 所在船坞 / 船台
  berthType: '平船台' | '大型干船坞' | '舾装码头' | '修造船台';
  manager: string; // 建造项目总长
  chiefEngineer: string; // 总工程师
  classificationSociety: string; // 合作船级社 (DNV, CCS, ABS, BV, LR)
  owner: string; // 船东客户 (如：中远海运、马士基航运、招商轮船、法国达飞)
  description: string;
  parameters: {
    loa: string; // 船长 (m)
    beam: string; // 型宽 (m)
    depth: string; // 型深 (m)
    draft: string; // 设计吃水 (m)
    displacement: string; // 排水量 / 载重吨 DWT
    speed: string; // 设计航速 (节)
    power: string; // 主机推进功率
  };
  metrics: {
    workersOnSite: number; // 现场在场施工总人数
    specialOperationWorkers: number; // 特种作业人员 (探伤/高空/受限密闭/焊工)
    activeSensors: number; // 活跃物联传感与基站数
    safetyConsecutiveDays: number; // 安全无事故生产天数
    unresolvedRisks: number; // 待闭环风险项
  };
  disciplines: DisciplineProgress[]; // 专业分项进度
  milestones: ShipbuildingMilestone[]; // 七大关键造船里程碑节点
}

export const ACTIVE_SHIPBUILDING_PROJECTS: ActiveShipbuildingProject[] = [
  {
    id: 'PRJ-2026-LNG01',
    shipCode: 'HULL-LNG-174',
    name: '17.4万m³ 薄膜型大型LNG船 1号舰',
    shipType: '清洁能源运输船',
    shipCategory: 'LNG/清洁能源',
    status: 'in_progress',
    statusLabel: '大合拢与绝热合拢',
    overallProgress: 45.8,
    plannedProgress: 44.0,
    healthStatus: 'ahead',
    startDate: '2026-03-01',
    deliveryDate: '2027-08-30',
    remainingDays: 335,
    dockingArea: '1号船台 (2万吨平船台)',
    berthType: '平船台',
    manager: '王建国 (建造总长)',
    chiefEngineer: '陈远 (总工艺师)',
    classificationSociety: 'DNV / CCS (双船级)',
    owner: '中远海运能源运输 (COSCO SHIPPING Energy)',
    description: '采用法国 GTT NO96 薄膜型货物围护绝热系统，搭载 WinGD 双燃料低速主机与再液化智能管理单元。',
    parameters: {
      loa: '295.0',
      beam: '45.0',
      depth: '26.25',
      draft: '11.5',
      displacement: '118,000 吨 (17.4万m³液容)',
      speed: '19.5 节',
      power: 'WinGD 5X72DF 双燃料低速机 + 轴发'
    },
    metrics: {
      workersOnSite: 186,
      specialOperationWorkers: 74,
      activeSensors: 52,
      safetyConsecutiveDays: 382,
      unresolvedRisks: 1
    },
    disciplines: [
      { name: '船体结构搭载', progress: 82.5, plannedProgress: 80.0, status: 'ahead' },
      { name: '货舱绝热装配', progress: 42.0, plannedProgress: 40.0, status: 'ahead' },
      { name: '低温管系舾装', progress: 38.6, plannedProgress: 36.0, status: 'ahead' },
      { name: '电气仪表工程', progress: 31.4, plannedProgress: 32.0, status: 'on_track' },
      { name: '涂装防腐工程', progress: 54.0, plannedProgress: 52.0, status: 'ahead' },
      { name: '动力系统总装', progress: 28.0, plannedProgress: 25.0, status: 'ahead' },
    ],
    milestones: [
      {
        id: 'MS-LNG-01',
        name: '钢板切割开工',
        englishName: 'Steel Cutting',
        plannedDate: '2026-03-01',
        actualDate: '2026-03-01',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '完成首批3000吨殷瓦钢及高强船体板智能数控下料。',
        inspector: 'DNV驻厂验船师 赵天成',
        checklistCount: { total: 42, passed: 42 },
        notes: '数控切割精度达标率 99.8%，获船东代表全优签署。'
      },
      {
        id: 'MS-LNG-02',
        name: '船台安放龙骨',
        englishName: 'Keel Laying',
        plannedDate: '2026-05-15',
        actualDate: '2026-05-12',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '龙骨基准P0分段平船台精准落墩就位，船体基准线校正完成。',
        inspector: 'CCS高级验船师 郭立',
        checklistCount: { total: 38, passed: 38 },
        notes: '较原计划提前3天完成龙骨安放仪式，三维激光测量公差 < 1.2mm。'
      },
      {
        id: 'MS-LNG-03',
        name: '主船体大合拢',
        englishName: 'Hull Assembly',
        plannedDate: '2026-10-20',
        status: 'in_progress',
        progressPercent: 68,
        keyDeliverable: '艏舯艉各总段龙门吊抬吊合龙焊接，1/2/3号液货舱双层底贯通。',
        inspector: 'DNV / CCS 联合检验组',
        checklistCount: { total: 86, passed: 58 },
        notes: '正在攻坚1号货舱主绝热箱二次屏壁自动化焊接与无损探伤检验。'
      },
      {
        id: 'MS-LNG-04',
        name: '船舶出坞下水',
        englishName: 'Launching / Undocking',
        plannedDate: '2026-12-18',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '完成船体外板水线下涂装、海底阀门试压，平船台滑道平稳入水。',
        inspector: '船厂总建造部 / DNV验船师',
        checklistCount: { total: 54, passed: 0 },
        notes: '计划滑道移位前完成主船体密闭性气密试验。'
      },
      {
        id: 'MS-LNG-05',
        name: '系泊综合调试',
        englishName: 'Mooring Trials',
        plannedDate: '2027-04-10',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '3号码头系泊通电、低速机静载动车、绝热舱液氮冷却冷试。',
        inspector: '调试技术中心 / 船东试车监造组',
        checklistCount: { total: 110, passed: 0 },
        notes: '重点筹备液化天然气燃气供应系统 (FGSS) 安全联锁及ESD紧急切断。'
      },
      {
        id: 'MS-LNG-06',
        name: '海上试航试验',
        englishName: 'Sea Trials',
        plannedDate: '2027-07-05',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '外海全负荷航速、操舵回转、EEDI能效指数、气体试航(Gas Trial)。',
        inspector: '船级社全要素试航测试团',
        checklistCount: { total: 95, passed: 0 },
        notes: '包含常温常规试航与零下163℃低温货物围护实货测试。'
      },
      {
        id: 'MS-LNG-07',
        name: '完工交付命名',
        englishName: 'Delivery',
        plannedDate: '2027-08-30',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '签署船舶交接书、全套法定证书发放、命名交付首航。',
        inspector: '船东代表团、船级社法定验船代表',
        checklistCount: { total: 60, passed: 0 },
        notes: '交付后将投入卡塔尔至中国沿海清洁能源长协航线营运。'
      }
    ]
  },
  {
    id: 'PRJ-2026-BOX12',
    shipCode: 'HULL-BOX-240',
    name: '24,000 TEU 超大型集装箱船',
    shipType: '集装箱班轮',
    shipCategory: '超大型集装箱',
    status: 'in_progress',
    statusLabel: '系泊试验与电气调试',
    overallProgress: 88.5,
    plannedProgress: 89.0,
    healthStatus: 'normal',
    startDate: '2025-08-15',
    deliveryDate: '2026-12-25',
    remainingDays: 87,
    dockingArea: '2号码头 (水下舾装码头)',
    berthType: '舾装码头',
    manager: '李海波 (项目总监)',
    chiefEngineer: '张明 (起重总工)',
    classificationSociety: 'ABS / DNV',
    owner: '地中海航运公司 (MSC Mediterranean Shipping)',
    description: '载箱量达 24,116 标准箱的深海巨轮，配备混流式脱硫塔、智能能效控制及超大容量冷藏箱插座系统。',
    parameters: {
      loa: '399.9',
      beam: '61.5',
      depth: '33.2',
      draft: '16.5',
      displacement: '240,000 吨 (24,000 TEU)',
      speed: '22.0 节',
      power: 'WinGD 11X92DF 65,000kW 主机'
    },
    metrics: {
      workersOnSite: 142,
      specialOperationWorkers: 46,
      activeSensors: 68,
      safetyConsecutiveDays: 412,
      unresolvedRisks: 0
    },
    disciplines: [
      { name: '船体结构搭载', progress: 100, plannedProgress: 100, status: 'on_track' },
      { name: '集装箱导轨系统', progress: 96.5, plannedProgress: 95.0, status: 'ahead' },
      { name: '机舱管系脱硫系统', progress: 91.0, plannedProgress: 92.0, status: 'on_track' },
      { name: '电气自动化联调', progress: 85.0, plannedProgress: 84.0, status: 'ahead' },
      { name: '甲板舾装与涂装', progress: 88.0, plannedProgress: 88.0, status: 'on_track' },
      { name: '系泊动车试验', progress: 71.0, plannedProgress: 75.0, status: 'lagging' },
    ],
    milestones: [
      {
        id: 'MS-BOX-01',
        name: '钢板切割开工',
        englishName: 'Steel Cutting',
        plannedDate: '2025-08-15',
        actualDate: '2025-08-15',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '主船体万吨高强结构钢数字化智能成型加工完毕。',
        inspector: 'ABS驻厂验船师 马丁·舒尔茨',
        checklistCount: { total: 48, passed: 48 },
      },
      {
        id: 'MS-BOX-02',
        name: '船台安放龙骨',
        englishName: 'Keel Laying',
        plannedDate: '2025-11-20',
        actualDate: '2025-11-18',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '2号造船坞底坑龙骨基准分段入坞落座，全船定位基准确立。',
        inspector: 'ABS / DNV 联合验船组',
        checklistCount: { total: 52, passed: 52 },
      },
      {
        id: 'MS-BOX-03',
        name: '主船体大合拢',
        englishName: 'Hull Assembly',
        plannedDate: '2026-03-30',
        actualDate: '2026-03-28',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '双龙门吊联合吊装完成驾驶岛、烟囱岛及首部巨型球鼻艏对接合拢。',
        inspector: 'ABS首席驻厂代表',
        checklistCount: { total: 120, passed: 120 },
      },
      {
        id: 'MS-BOX-04',
        name: '船舶出坞下水',
        englishName: 'Launching / Undocking',
        plannedDate: '2026-05-30',
        actualDate: '2026-05-29',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '2号干船坞注水浮起，安全拖带移泊至东区2号舾装码头。',
        inspector: '船厂安全总监 / 港口引航站',
        checklistCount: { total: 64, passed: 64 },
      },
      {
        id: 'MS-BOX-05',
        name: '系泊综合调试',
        englishName: 'Mooring Trials',
        plannedDate: '2026-09-30',
        status: 'in_progress',
        progressPercent: 78,
        keyDeliverable: '主机低速试车、辅机发电机并网试验、脱硫洗涤塔闭环中和测试。',
        inspector: 'ABS试车验船师 / 调试工区',
        checklistCount: { total: 98, passed: 76 },
        notes: '正在排查3号冷藏箱分电箱绝缘低报问题，预计2天内完成清零。'
      },
      {
        id: 'MS-BOX-06',
        name: '海上试航试验',
        englishName: 'Sea Trials',
        plannedDate: '2026-11-10',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '东海开阔水域为期7天常规航行测试，全船振动噪声、满载回转操纵。',
        inspector: 'ABS综合试航专家团',
        checklistCount: { total: 88, passed: 0 },
      },
      {
        id: 'MS-BOX-07',
        name: '完工交付命名',
        englishName: 'Delivery',
        plannedDate: '2026-12-25',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: 'MSC船东签字命名接收，入列亚欧顶级干线快航航次。',
        inspector: '地中海航运公司高管交付代表团',
        checklistCount: { total: 55, passed: 0 },
      }
    ]
  },
  {
    id: 'PRJ-2026-TANK02',
    shipCode: 'HULL-VLCC-300',
    name: '30万吨 VLCC 超大型原油船',
    shipType: '液体散货运输',
    shipCategory: 'VLCC油轮',
    status: 'in_progress',
    statusLabel: '水下舾装与管系试压',
    overallProgress: 68.2,
    plannedProgress: 72.0,
    healthStatus: 'warning',
    startDate: '2025-11-10',
    deliveryDate: '2027-03-20',
    remainingDays: 172,
    dockingArea: '3号码头 (重型液体码头)',
    berthType: '舾装码头',
    manager: '张明 (建造总长)',
    chiefEngineer: '刘工 (轮机总工程师)',
    classificationSociety: 'CCS / ABS',
    owner: '招商局轮船 (China Merchants Energy Shipping)',
    description: '30万载重吨新一代节能环保型超大型原油轮，配置轴带发电机系统及特涂耐酸洗涤舱。',
    parameters: {
      loa: '333.0',
      beam: '60.0',
      depth: '30.0',
      draft: '20.5',
      displacement: '348,000 吨 (30万 DWT)',
      speed: '15.5 节',
      power: 'MAN B&W 7G80ME-C9.5 主机'
    },
    metrics: {
      workersOnSite: 98,
      specialOperationWorkers: 38,
      activeSensors: 44,
      safetyConsecutiveDays: 310,
      unresolvedRisks: 2
    },
    disciplines: [
      { name: '船体结构工程', progress: 95.0, plannedProgress: 98.0, status: 'on_track' },
      { name: '货油及洗舱管系', progress: 58.0, plannedProgress: 66.0, status: 'lagging' },
      { name: '惰性气体系统', progress: 62.0, plannedProgress: 65.0, status: 'on_track' },
      { name: '机舱管路安装', progress: 74.0, plannedProgress: 75.0, status: 'on_track' },
      { name: '货舱特涂防腐', progress: 48.0, plannedProgress: 56.0, status: 'lagging' },
      { name: '电气控制系统', progress: 70.0, plannedProgress: 72.0, status: 'on_track' },
    ],
    milestones: [
      {
        id: 'MS-VLCC-01',
        name: '钢板切割开工',
        englishName: 'Steel Cutting',
        plannedDate: '2025-11-10',
        actualDate: '2025-11-10',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '超厚船用宽厚钢板智能下料，分段拼板自动角焊。',
        inspector: 'CCS验船师 郭立',
        checklistCount: { total: 40, passed: 40 },
      },
      {
        id: 'MS-VLCC-02',
        name: '船台安放龙骨',
        englishName: 'Keel Laying',
        plannedDate: '2026-02-18',
        actualDate: '2026-02-18',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '干船坞主底舱分段起吊就位，龙骨合拢检测合格。',
        inspector: 'CCS / ABS',
        checklistCount: { total: 45, passed: 45 },
      },
      {
        id: 'MS-VLCC-03',
        name: '主船体大合拢',
        englishName: 'Hull Assembly',
        plannedDate: '2026-06-25',
        actualDate: '2026-06-29',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '30万吨级船体大接缝焊接，15座主货油舱及压载舱密封成型。',
        inspector: 'CCS验船师团队',
        checklistCount: { total: 105, passed: 105 },
      },
      {
        id: 'MS-VLCC-04',
        name: '船舶出坞下水',
        englishName: 'Launching / Undocking',
        plannedDate: '2026-08-15',
        actualDate: '2026-08-20',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '干船坞放水浮运，移泊至3号码头开展深水水下舾装。',
        inspector: '船厂建造总长与港口引航员',
        checklistCount: { total: 58, passed: 58 },
      },
      {
        id: 'MS-VLCC-05',
        name: '系泊综合调试',
        englishName: 'Mooring Trials',
        plannedDate: '2026-11-30',
        status: 'in_progress',
        progressPercent: 42,
        keyDeliverable: '主货油泵汽轮机驱动试验、惰性气体防爆系统及货舱密闭试漏。',
        inspector: 'CCS驻厂试验组',
        checklistCount: { total: 92, passed: 39 },
        notes: '【工期预警】高温油漆喷涂受台风多雨天气影响工期滞后4天，已增加抽湿加温设备抢工。'
      },
      {
        id: 'MS-VLCC-06',
        name: '海上试航试验',
        englishName: 'Sea Trials',
        plannedDate: '2027-02-15',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '重载深水试航、应急倒车倒车制动、无人机舱UMS24小时连续航行。',
        inspector: '船级社全科试航团队',
        checklistCount: { total: 80, passed: 0 },
      },
      {
        id: 'MS-VLCC-07',
        name: '完工交付命名',
        englishName: 'Delivery',
        plannedDate: '2027-03-20',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '招商轮船交船接印，开启中东-远东原油超级运输航次。',
        inspector: '招商轮船监造团与CCS',
        checklistCount: { total: 50, passed: 0 },
      }
    ]
  },
  {
    id: 'PRJ-2026-BULK04',
    shipCode: 'HULL-BULK-082',
    name: '82,000 DWT 卡姆萨尔型散货船',
    shipType: '干散货运输船',
    shipCategory: '大吨位散货',
    status: 'in_progress',
    statusLabel: '船台总段合拢搭载',
    overallProgress: 32.4,
    plannedProgress: 31.0,
    healthStatus: 'ahead',
    startDate: '2026-01-15',
    deliveryDate: '2026-12-30',
    remainingDays: 92,
    dockingArea: '6号船台 (平船台)',
    berthType: '平船台',
    manager: '陈远 (搭载主任)',
    chiefEngineer: '周建 (船体主管)',
    classificationSociety: 'BV / CCS',
    owner: '国银金融租赁 (CDB Financial Leasing)',
    description: '新一代宽体浅吃水绿色环保卡姆萨尔型散货船，符合国际海事组织 EEDI Phase III 最高能效指标。',
    parameters: {
      loa: '229.0',
      beam: '32.26',
      depth: '20.35',
      draft: '14.45',
      displacement: '98,000 吨 (82,000 DWT)',
      speed: '14.2 节',
      power: 'MAN B&W 6S60ME-C10.5 柴油机'
    },
    metrics: {
      workersOnSite: 78,
      specialOperationWorkers: 26,
      activeSensors: 32,
      safetyConsecutiveDays: 256,
      unresolvedRisks: 0
    },
    disciplines: [
      { name: '船体总段装配', progress: 58.0, plannedProgress: 55.0, status: 'ahead' },
      { name: '舱口围与双层底', progress: 45.0, plannedProgress: 42.0, status: 'ahead' },
      { name: '机舱管路预装', progress: 24.0, plannedProgress: 24.0, status: 'on_track' },
      { name: '电气电缆敷设', progress: 16.0, plannedProgress: 15.0, status: 'ahead' },
      { name: '全船防腐涂装', progress: 28.0, plannedProgress: 26.0, status: 'ahead' },
      { name: '甲板起重机械', progress: 20.0, plannedProgress: 20.0, status: 'on_track' },
    ],
    milestones: [
      {
        id: 'MS-BULK-01',
        name: '钢板切割开工',
        englishName: 'Steel Cutting',
        plannedDate: '2026-01-15',
        actualDate: '2026-01-15',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '散货船首批高拉力钢板智能坡口数控成型切割完毕。',
        inspector: 'BV驻厂验船师',
        checklistCount: { total: 32, passed: 32 },
      },
      {
        id: 'MS-BULK-02',
        name: '船台安放龙骨',
        englishName: 'Keel Laying',
        plannedDate: '2026-03-25',
        actualDate: '2026-03-22',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '6号平船台龙骨分段就位，滑道基准水平测量达标。',
        inspector: 'BV / CCS 联合验收',
        checklistCount: { total: 35, passed: 35 },
      },
      {
        id: 'MS-BULK-03',
        name: '主船体大合拢',
        englishName: 'Hull Assembly',
        plannedDate: '2026-07-20',
        status: 'in_progress',
        progressPercent: 52,
        keyDeliverable: '7座货舱大开口分段吊装、艉部机舱总段合龙定位。',
        inspector: 'BV驻厂船体工程师',
        checklistCount: { total: 72, passed: 38 },
        notes: '目前进入第4号货舱顶边舱吊装，高空防坠网已全覆盖落实。'
      },
      {
        id: 'MS-BULK-04',
        name: '船舶出坞下水',
        englishName: 'Launching / Undocking',
        plannedDate: '2026-09-25',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '滑道下水重力释放入江，安全靠泊舾装码头。',
        inspector: '船厂滑道下水领导小组',
        checklistCount: { total: 46, passed: 0 },
      },
      {
        id: 'MS-BULK-05',
        name: '系泊综合调试',
        englishName: 'Mooring Trials',
        plannedDate: '2026-11-15',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '液压舱盖开关试验、大功率锚绞机拉力试验、主机系泊动车。',
        inspector: 'BV试车验船师',
        checklistCount: { total: 68, passed: 0 },
      },
      {
        id: 'MS-BULK-06',
        name: '海上试航试验',
        englishName: 'Sea Trials',
        plannedDate: '2026-12-05',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '主机测速标定、惯性冲程与抛锚制动试验。',
        inspector: '国银金租船东代表与BV',
        checklistCount: { total: 60, passed: 0 },
      },
      {
        id: 'MS-BULK-07',
        name: '完工交付命名',
        englishName: 'Delivery',
        plannedDate: '2026-12-30',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '正式交船，挂五星红旗起航投入太平洋粮食/矿石航线。',
        inspector: '买方与建造方授权签字人',
        checklistCount: { total: 45, passed: 0 },
      }
    ]
  },
  {
    id: 'PRJ-2026-CHEM01',
    shipCode: 'HULL-CHEM-025',
    name: '25,000 DWT 双相不锈钢特种化学品船',
    shipType: '特种危化品船',
    shipCategory: '特种化学品',
    status: 'in_progress',
    statusLabel: '特种不锈钢合拢焊接',
    overallProgress: 18.5,
    plannedProgress: 18.0,
    healthStatus: 'normal',
    startDate: '2026-05-10',
    deliveryDate: '2027-09-15',
    remainingDays: 351,
    dockingArea: '4号船台 (平船台)',
    berthType: '平船台',
    manager: '赵工 (特种船舶总长)',
    chiefEngineer: '孙技师 (焊接与材料专家)',
    classificationSociety: 'DNV / LR',
    owner: '思多而特液货 (Stolt-Nielsen Tankers)',
    description: '装配2205型双相不锈钢货液舱，满足IMO II型特种化学品无缝隔离与高危物料运输安全标准。',
    parameters: {
      loa: '168.0',
      beam: '26.8',
      depth: '14.2',
      draft: '9.8',
      displacement: '32,000 吨 (25,000 DWT)',
      speed: '14.5 节',
      power: 'MAN B&W 6S50ME-C 智能电控主机'
    },
    metrics: {
      workersOnSite: 64,
      specialOperationWorkers: 32,
      activeSensors: 36,
      safetyConsecutiveDays: 141,
      unresolvedRisks: 0
    },
    disciplines: [
      { name: '不锈钢货舱分段', progress: 35.0, plannedProgress: 34.0, status: 'ahead' },
      { name: '特种管道预制', progress: 22.0, plannedProgress: 20.0, status: 'ahead' },
      { name: '机舱外壳搭载', progress: 18.0, plannedProgress: 18.0, status: 'on_track' },
      { name: '特种焊接无损探伤', progress: 28.0, plannedProgress: 28.0, status: 'on_track' },
      { name: '电气管网铺设', progress: 8.0, plannedProgress: 8.0, status: 'on_track' },
      { name: '特种泵阀采购', progress: 40.0, plannedProgress: 40.0, status: 'on_track' },
    ],
    milestones: [
      {
        id: 'MS-CHEM-01',
        name: '钢板切割开工',
        englishName: 'Steel Cutting',
        plannedDate: '2026-05-10',
        actualDate: '2026-05-10',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '双相不锈钢进口板材清洁恒温激光开料完成。',
        inspector: 'DNV材料专员',
        checklistCount: { total: 36, passed: 36 },
      },
      {
        id: 'MS-CHEM-02',
        name: '船台安放龙骨',
        englishName: 'Keel Laying',
        plannedDate: '2026-07-30',
        actualDate: '2026-07-28',
        status: 'completed',
        progressPercent: 100,
        keyDeliverable: '4号船台双层底不锈钢首合龙分段精确定位铺设。',
        inspector: 'DNV / LR',
        checklistCount: { total: 40, passed: 40 },
      },
      {
        id: 'MS-CHEM-03',
        name: '主船体大合拢',
        englishName: 'Hull Assembly',
        plannedDate: '2026-12-10',
        status: 'in_progress',
        progressPercent: 30,
        keyDeliverable: '24个独立不锈钢化学品舱体无铁素体污染合拢组装。',
        inspector: 'DNV特种船舶检验处',
        checklistCount: { total: 84, passed: 25 },
      },
      {
        id: 'MS-CHEM-04',
        name: '船舶出坞下水',
        englishName: 'Launching / Undocking',
        plannedDate: '2027-02-28',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '下水入江移入舾装码头深孔舾装。',
        inspector: '船厂建造总工程师',
        checklistCount: { total: 50, passed: 0 },
      },
      {
        id: 'MS-CHEM-05',
        name: '系泊综合调试',
        englishName: 'Mooring Trials',
        plannedDate: '2027-06-15',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '深井货油泵注水联调试验与酸洗钝化处理。',
        inspector: '船东代表与DNV',
        checklistCount: { total: 75, passed: 0 },
      },
      {
        id: 'MS-CHEM-06',
        name: '海上试航试验',
        englishName: 'Sea Trials',
        plannedDate: '2027-08-10',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '全工况航速测定、操舵及特种消防演练。',
        inspector: '试航联合专家组',
        checklistCount: { total: 65, passed: 0 },
      },
      {
        id: 'MS-CHEM-07',
        name: '完工交付命名',
        englishName: 'Delivery',
        plannedDate: '2027-09-15',
        status: 'upcoming',
        progressPercent: 0,
        keyDeliverable: '国际远洋高标准化学品船完工签署交付。',
        inspector: '思多而特船东首席高管',
        checklistCount: { total: 52, passed: 0 },
      }
    ]
  }
];

export interface ProjectOverviewKPIs {
  totalActiveProjects: number; // 当前在建船舶重点工程
  averageProgress: number; // 全厂在建船舶平均建造进度 (%)
  onTimeMilestoneRate: number; // 关键节点按期达成率 (%)
  totalWorkersOnSite: number; // 现场在场作业总人数
  totalInConstructionDwt: string; // 在建总运力 / 载重吨
  safeOperationDays: number; // 连续安全生产天数
  upcomingMilestonesThisMonth: number; // 本月攻坚关键里程碑数
}

export const YARD_PROJECT_OVERVIEW_KPIS: ProjectOverviewKPIs = {
  totalActiveProjects: 5,
  averageProgress: 50.7,
  onTimeMilestoneRate: 96.8,
  totalWorkersOnSite: 518,
  totalInConstructionDwt: '782,000 DWT',
  safeOperationDays: 428,
  upcomingMilestonesThisMonth: 3
};
