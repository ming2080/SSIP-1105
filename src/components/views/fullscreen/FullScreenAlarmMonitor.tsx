import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Wind, 
  Radio, 
  Clock, 
  Users, 
  Ship, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Volume2, 
  VolumeX, 
  Eye, 
  CheckCircle2, 
  Cpu, 
  Building2, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Camera, 
  Zap, 
  Compass, 
  Layers, 
  Waves,
  RefreshCw,
  BellRing
} from 'lucide-react';

import lngModelBg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerModelBg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerModelBg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkModelBg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';
import chemTankerModelBg from '@/src/assets/images/chemical_tanker_3d_1787973019008.jpg';
import shipyardAerialMap from '@/src/assets/images/shipyard_aerial_map_1787975544073.jpg';

export interface FocusZoneAlarm {
  id: string;
  level: 'high' | 'medium' | 'low';
  type: string;
  location: string;
  timeAgo: string;
  detail: string;
  sensorValue?: string;
  threshold?: string;
  responder: string;
  status: '处置中' | '已核实' | '已闭环';
  soundAlarmActive: boolean;
}

export interface FocusZoneSensor {
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  threshold: string;
  trend: 'up' | 'down' | 'stable';
}

export interface FocusZoneData {
  id: string;
  code: string;
  name: string;
  subTitle: string;
  projectCode: string;
  projectName: string;
  dangerLevel: '特级高危' | '一级高危' | '二级重点';
  dangerLevelColor: string;
  workerCount: number;
  safetyOfficer: string;
  contactPhone: string;
  bgImage: string;
  zoneType: '船台特种船' | '造船坞大舱' | '构件总装车间' | '特种涂装密闭房' | '舾装水上码头';
  description: string;
  keyHazards: string[];
  activeAlarms: FocusZoneAlarm[];
  sensors: FocusZoneSensor[];
  safetyDevices: {
    baseStationCount: number;
    cameraCount: number;
    alarmSirenActive: boolean;
    ventilationActive: boolean;
    rfidGateStatus: string;
  };
  spatialCoordinates: { x: number; y: number }[];
}

export const FOCUS_ZONES: FocusZoneData[] = [
  {
    id: 'zone-1',
    code: 'DOCK-SLIP-01',
    name: '1号造船台 (H1821A 标段)',
    subTitle: '17.4万m³ 薄膜型大型LNG船建造区',
    projectCode: 'PRJ-2026-LNG01',
    projectName: '17.4万m³ 薄膜型大型LNG船 1号舰',
    dangerLevel: '特级高危',
    dangerLevelColor: 'from-rose-600 to-red-600',
    workerCount: 128,
    safetyOfficer: '张振国 (特种作业安全督导长)',
    contactPhone: '138-1890-5501',
    bgImage: lngModelBg,
    zoneType: '船台特种船',
    description: '绝热货舱空间受限，采用 GTT NO96 绝热薄膜密闭结构。全舱配备低温探头、氧气微压在线监测与声光联动装置。',
    keyHazards: ['绝热货舱缺氧窒息', '低温气体管系微渗', '高处临边绑扎坠落', '密闭舱出入单人超时'],
    activeAlarms: [
      {
        id: 'ALM-LNG-001',
        level: 'high',
        type: '受限空间氧气偏低告警',
        location: 'NO.2 货舱底层左舷 14# 绝热箱隔舱',
        timeAgo: '1分钟前',
        detail: '氧浓度传感器监测到含氧量下降至安全临界阈值以下，有窒息风险。',
        sensorValue: '18.2% Vol',
        threshold: '< 19.5% Vol',
        responder: '安监一队-李强 (已到达现场)',
        status: '处置中',
        soundAlarmActive: true
      },
      {
        id: 'ALM-LNG-002',
        level: 'medium',
        type: '高空主甲板未佩戴防护帽',
        location: '甲板层 24# 肋位露天管系作业区',
        timeAgo: '4分钟前',
        detail: 'AI识别摄像头捕捉到施工人员在起吊吊臂下方未佩戴黄色安全帽。',
        sensorValue: 'AI置信度 96.8%',
        threshold: '规范穿戴 100%',
        responder: '起重指挥员-赵海 (喊话提醒)',
        status: '处置中',
        soundAlarmActive: false
      },
      {
        id: 'ALM-LNG-003',
        level: 'medium',
        type: '受限空间作业人员超时滞留',
        location: 'NO.3 货舱中层绝热层检修作业面',
        timeAgo: '9分钟前',
        detail: '焊工作业组 2 人连续密闭作业超 180 分钟，触发防疲劳轮岗阈值。',
        sensorValue: '时长 192 分钟',
        threshold: '单次 ≤ 180分钟',
        responder: '调度中心-王鹏 (呼叫轮换)',
        status: '已核实',
        soundAlarmActive: false
      }
    ],
    sensors: [
      { name: 'O₂ 氧气浓度', value: '18.2', unit: '%Vol', status: 'danger', threshold: '≥19.5%', trend: 'down' },
      { name: '可燃气 (LEL)', value: '0.0', unit: '%LEL', status: 'normal', threshold: '<20%', trend: 'stable' },
      { name: 'CO 一氧化碳', value: '8.4', unit: 'ppm', status: 'normal', threshold: '<24ppm', trend: 'stable' },
      { name: '舱温 / 湿度', value: '25.6', unit: '℃/60%', status: 'normal', threshold: '<35℃', trend: 'stable' }
    ],
    safetyDevices: {
      baseStationCount: 8,
      cameraCount: 6,
      alarmSirenActive: true,
      ventilationActive: true,
      rfidGateStatus: '严格门禁·双向互锁'
    },
    spatialCoordinates: [{ x: 38, y: 44 }, { x: 42, y: 48 }, { x: 35, y: 52 }]
  },
  {
    id: 'zone-2',
    code: 'DRY-DOCK-02',
    name: '2号造船坞 (H2400 标段)',
    subTitle: '24,000 TEU 超大型集装箱船搭载区',
    projectCode: 'PRJ-2026-BOX02',
    projectName: '24000TEU 超大型集装箱船 2号舰',
    dangerLevel: '一级高危',
    dangerLevelColor: 'from-amber-600 to-orange-600',
    workerCount: 215,
    safetyOfficer: '孙志诚 (总装船坞安环督办)',
    contactPhone: '139-2244-8802',
    bgImage: containerModelBg,
    zoneType: '造船坞大舱',
    description: '船长近400米，当前进行多层集装箱导轨架整体高空吊装、主船体合拢埋弧焊及双岛式上层建筑搭载。',
    keyHazards: ['龙门吊交叉回转盲区', '高空40m临边坠落', '合拢明火热工火星飞溅', '狭长走道物料挤占'],
    activeAlarms: [
      {
        id: 'ALM-BOX-001',
        level: 'high',
        type: '重型龙门吊起吊警戒区闯入',
        location: '舯部 18# 贝位 800t 龙门吊垂直投影面',
        timeAgo: '2分钟前',
        detail: '吊装主梁正在起吊大总段，地面有 2 名工件清理人员进入声光警戒区。',
        sensorValue: '越界距离 3.2m',
        threshold: '严禁进入',
        responder: '地面安全哨兵-陈国栋 (立即阻拦)',
        status: '处置中',
        soundAlarmActive: true
      },
      {
        id: 'ALM-BOX-002',
        level: 'medium',
        type: '主机舱高空热工焊接飞火预警',
        location: '机舱上部平台 E层 92# 肋骨',
        timeAgo: '6分钟前',
        detail: '红外双光谱探头检测到电焊火花掉落至下层可燃防护网边缘。',
        sensorValue: '表面热温 78℃',
        threshold: '< 65℃',
        responder: '防灭火机动员-周杰 (出水湿润)',
        status: '已核实',
        soundAlarmActive: false
      },
      {
        id: 'ALM-BOX-003',
        level: 'low',
        type: '应急消防通道物料违规占压',
        location: '坞底左舷主运输斜坡道入口',
        timeAgo: '12分钟前',
        detail: '焊材转运拖车临时停泊占压消防应急车道。',
        sensorValue: '占用宽度 60%',
        threshold: '畅通 100%',
        responder: '坞内交管-刘军 (督促挪移)',
        status: '已闭环',
        soundAlarmActive: false
      }
    ],
    sensors: [
      { name: '瞬时高空风速', value: '8.6', unit: 'm/s', status: 'warning', threshold: '<12m/s', trend: 'up' },
      { name: '天车测距防撞', value: '38.4', unit: 'm', status: 'normal', threshold: '>20m', trend: 'stable' },
      { name: '吊装静应力', value: '620', unit: 't', status: 'normal', threshold: '<720t', trend: 'stable' },
      { name: '烟雾光电密度', value: '0.02', unit: 'dB/m', status: 'normal', threshold: '<0.15', trend: 'stable' }
    ],
    safetyDevices: {
      baseStationCount: 14,
      cameraCount: 10,
      alarmSirenActive: true,
      ventilationActive: true,
      rfidGateStatus: '人员实名进出核验'
    },
    spatialCoordinates: [{ x: 55, y: 38 }, { x: 58, y: 46 }, { x: 52, y: 42 }]
  },
  {
    id: 'zone-3',
    code: 'WORK-SHOP-03',
    name: '分段制造总装加工车间',
    subTitle: '重型构件立体翻身与立体组焊中心',
    projectCode: 'PRJ-2026-FAB03',
    projectName: '立体大型总段精密建造胎架工程',
    dangerLevel: '二级重点',
    dangerLevelColor: 'from-blue-600 to-indigo-600',
    workerCount: 186,
    safetyOfficer: '何建平 (制造车间主任工程师)',
    contactPhone: '137-9912-3304',
    bgImage: bulkModelBg,
    zoneType: '构件总装车间',
    description: '配备大吨位桥式起重机与多功能液压柔性翻身胎架，开展大型钢结构总段立体对位组装与埋弧自动焊。',
    keyHazards: ['重型分段翻身失稳', '桥式行车重物高空悬垂', '密集埋弧焊弧光与粉尘', '工位交叉机械碰撞'],
    activeAlarms: [
      {
        id: 'ALM-FAB-001',
        level: 'medium',
        type: 'A-05总段液压翻身胎架禁入区触发',
        location: '车间第 3 跨跨中 12 号柔性定位胎架',
        timeAgo: '3分钟前',
        detail: '液压顶升倾角翻身过程中，红外安全防护光幕被装配钳工误遮挡。',
        sensorValue: '光幕切断 1 点',
        threshold: '翻身中禁入',
        responder: '胎架操作员-马成龙 (暂停翻身)',
        status: '处置中',
        soundAlarmActive: true
      },
      {
        id: 'ALM-FAB-002',
        level: 'low',
        type: '焊接集中区 PM2.5 颗粒物偏高',
        location: '车间北跨 6-8 号双丝埋弧焊工位',
        timeAgo: '8分钟前',
        detail: '连续自动焊烟雾瞬时扩散，触发环境传感器轻度超限，已联动开启负压风门。',
        sensorValue: '165 μg/m³',
        threshold: '< 150 μg/m³',
        responder: '暖通值班员-钱飞 (风机增档)',
        status: '已闭环',
        soundAlarmActive: false
      }
    ],
    sensors: [
      { name: '车间粉尘 PM2.5', value: '165', unit: 'μg/m³', status: 'warning', threshold: '<150', trend: 'down' },
      { name: '天车三维防撞', value: '45.0', unit: 'm', status: 'normal', threshold: '>25m', trend: 'stable' },
      { name: '地基沉降位移', value: '0.8', unit: 'mm', status: 'normal', threshold: '<3.0mm', trend: 'stable' },
      { name: '工频噪声声级', value: '78.5', unit: 'dB', status: 'normal', threshold: '<85dB', trend: 'stable' }
    ],
    safetyDevices: {
      baseStationCount: 10,
      cameraCount: 8,
      alarmSirenActive: false,
      ventilationActive: true,
      rfidGateStatus: '智能光幕防越界联动'
    },
    spatialCoordinates: [{ x: 26, y: 58 }, { x: 30, y: 62 }, { x: 24, y: 64 }]
  },
  {
    id: 'zone-4',
    code: 'COAT-ZONE-04',
    name: '特种涂装密闭防腐区',
    subTitle: '1/2号喷砂喷漆密闭特种防爆作业房',
    projectCode: 'PRJ-2026-COAT',
    projectName: '全封闭高压无气喷涂与防腐工程',
    dangerLevel: '特级高危',
    dangerLevelColor: 'from-rose-600 to-red-600',
    workerCount: 42,
    safetyOfficer: '郑德荣 (特种涂装安全官)',
    contactPhone: '136-4556-9908',
    bgImage: chemTankerModelBg,
    zoneType: '特种涂装密闭房',
    description: '采用全密闭正压长管供气系统与防爆电气设施，处理大面积重防腐涂料与环氧树脂高压无气喷涂。',
    keyHazards: ['VOC挥发性有机物积聚爆燃', '非防爆手机/电气火花', '密闭排风联锁骤降', '静电集聚放电'],
    activeAlarms: [
      {
        id: 'ALM-COAT-001',
        level: 'high',
        type: '2号喷涂密闭房 VOC 挥发物浓度超限',
        location: '2号特种喷漆房南侧底部抽风口',
        timeAgo: '1分钟前',
        detail: '持续高压无气喷漆导致空间内总碳氢挥发浓度骤升，已启动一级防爆应急强排。',
        sensorValue: '482 mg/m³',
        threshold: '< 400 mg/m³',
        responder: '安防联动控制室 (已自动切入强排风)',
        status: '处置中',
        soundAlarmActive: true
      },
      {
        id: 'ALM-COAT-002',
        level: 'medium',
        type: '防爆禁区检测到未隔爆移动终端信号',
        location: '1号喷漆房更衣缓冲间入室门',
        timeAgo: '5分钟前',
        detail: '激励器探测到未经防爆认证的智能手环/手机蓝牙信号，存在静电与火花引燃风险。',
        sensorValue: 'RF 2.4GHz 信号',
        threshold: '严禁携带入室',
        responder: '安检守卫-丁志刚 (现场暂扣存柜)',
        status: '已闭环',
        soundAlarmActive: false
      }
    ],
    sensors: [
      { name: '总 VOC 浓度', value: '482', unit: 'mg/m³', status: 'danger', threshold: '<400', trend: 'up' },
      { name: '二甲苯气体', value: '18.4', unit: 'ppm', status: 'warning', threshold: '<20ppm', trend: 'up' },
      { name: '负压抽风压差', value: '-35.2', unit: 'Pa', status: 'normal', threshold: '<-25Pa', trend: 'stable' },
      { name: '静电接地阻抗', value: '4.2', unit: 'Ω', status: 'normal', threshold: '<10Ω', trend: 'stable' }
    ],
    safetyDevices: {
      baseStationCount: 6,
      cameraCount: 4,
      alarmSirenActive: true,
      ventilationActive: true,
      rfidGateStatus: '防爆静电释放门禁'
    },
    spatialCoordinates: [{ x: 68, y: 28 }, { x: 72, y: 32 }]
  },
  {
    id: 'zone-5',
    code: 'WHARF-BERTH-05',
    name: '舾装码头水上调试区',
    subTitle: '1号码头泊位系泊试验与主机试车区',
    projectCode: 'PRJ-2026-SEA05',
    projectName: '30万吨 VLCC 超大型油轮系泊调试标段',
    dangerLevel: '一级高危',
    dangerLevelColor: 'from-amber-600 to-orange-600',
    workerCount: 94,
    safetyOfficer: '曹晓东 (码头试车指挥长)',
    contactPhone: '135-7788-1205',
    bgImage: tankerModelBg,
    zoneType: '舾装水上码头',
    description: '船体已出坞靠泊码头进行系泊试验，开展全船动力管系高压冲洗、柴油主机慢速试车及配电变压器调试。',
    keyHazards: ['码头临边无护栏落水', '夜间未批准登船滞留', '高压岸电电缆破损漏电', '系缆桩张力过载断缆'],
    activeAlarms: [
      {
        id: 'ALM-WHARF-001',
        level: 'high',
        type: '码头3#系缆桩临水边缘防落水雷达触发',
        location: '1号码头 3# 岸基缆桩临海面 0.8 米处',
        timeAgo: '2分钟前',
        detail: '潮位上涨，系泊巡视人员弯腰解缆时身体探出护舷边缘且未挂系安全绳。',
        sensorValue: '生命雷达告警',
        threshold: '安全距离 ≥ 1.5m',
        responder: '码头安全员-王建波 (已前往现场拉回)',
        status: '处置中',
        soundAlarmActive: true
      },
      {
        id: 'ALM-WHARF-002',
        level: 'medium',
        type: '高压岸电接电箱围栏受限越界',
        location: '码头变电站岸电电缆供电区',
        timeAgo: '11分钟前',
        detail: '登船人员误入高压电缆临时盘绕区，触发激光光栅警戒。',
        sensorValue: '越界进入',
        threshold: '持特种证入内',
        responder: '电工组长-程龙 (检查放行)',
        status: '已闭环',
        soundAlarmActive: false
      }
    ],
    sensors: [
      { name: '瞬时潮位高度', value: '+3.15', unit: 'm', status: 'normal', threshold: '<+4.5m', trend: 'up' },
      { name: '系缆张力传感器', value: '42.8', unit: 't', status: 'normal', threshold: '<80t', trend: 'stable' },
      { name: '岸电绝缘阻抗', value: '25.0', unit: 'MΩ', status: 'normal', threshold: '>2.0MΩ', trend: 'stable' },
      { name: '水流速与涌浪', value: '0.65', unit: 'knots', status: 'normal', threshold: '<2.0knots', trend: 'stable' }
    ],
    safetyDevices: {
      baseStationCount: 9,
      cameraCount: 8,
      alarmSirenActive: true,
      ventilationActive: false,
      rfidGateStatus: '水上登乘栈桥闸机'
    },
    spatialCoordinates: [{ x: 80, y: 55 }, { x: 84, y: 60 }]
  }
];

interface FullScreenAlarmMonitorProps {
  onExit: () => void;
}

export function FullScreenAlarmMonitor({ onExit }: FullScreenAlarmMonitorProps) {
  // 当前轮播区域索引
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // 是否自动轮播
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  // 轮播间隔（秒）
  const [intervalSec, setIntervalSec] = useState<number>(8);
  // 倒计时百分比 (0 - 100)
  const [progressPercent, setProgressPercent] = useState<number>(0);
  // 是否浏览器原生全屏
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(false);
  // 报警声效是否开启 (仅做视觉模拟指示)
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  // 实时时钟
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const activeZone = FOCUS_ZONES[currentIndex];

  // 全厂总统计聚合计算
  const globalSummary = useMemo(() => {
    let totalWorkers = 0;
    let highAlarms = 0;
    let mediumAlarms = 0;
    let lowAlarms = 0;

    FOCUS_ZONES.forEach(z => {
      totalWorkers += z.workerCount;
      z.activeAlarms.forEach(a => {
        if (a.level === 'high') highAlarms++;
        else if (a.level === 'medium') mediumAlarms++;
        else lowAlarms++;
      });
    });

    return {
      totalZones: FOCUS_ZONES.length,
      totalWorkers,
      totalAlarms: highAlarms + mediumAlarms + lowAlarms,
      highAlarms,
      mediumAlarms,
      lowAlarms,
      preventionRate: '99.4%',
      avgResponseTime: '21秒'
    };
  }, []);

  // 实时时钟更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`;
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 轮播计时器与进度条
  useEffect(() => {
    if (!isPlaying) {
      setProgressPercent(0);
      return;
    }

    const stepMs = 100;
    const totalMs = intervalSec * 1000;
    let elapsedMs = 0;

    const intervalTimer = setInterval(() => {
      elapsedMs += stepMs;
      const pct = Math.min(100, (elapsedMs / totalMs) * 100);
      setProgressPercent(pct);

      if (elapsedMs >= totalMs) {
        elapsedMs = 0;
        setCurrentIndex(prev => (prev + 1) % FOCUS_ZONES.length);
      }
    }, stepMs);

    return () => clearInterval(intervalTimer);
  }, [isPlaying, intervalSec, currentIndex]);

  // 键盘快捷键支持 (ESC退出，空格暂停/播放，左右方向键换屏)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => (prev + 1) % FOCUS_ZONES.length);
        setProgressPercent(0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => (prev - 1 + FOCUS_ZONES.length) % FOCUS_ZONES.length);
        setProgressPercent(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // 切换浏览器原生全屏
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsBrowserFullscreen(true);
      }).catch(() => {
        setIsBrowserFullscreen(false);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsBrowserFullscreen(false);
        }).catch(() => {});
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070c19] text-slate-100 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-300">
      
      {/* 顶部微型轮播进度条 (全局顶部荧光扫描线) */}
      <div className="w-full h-1 bg-slate-900/80 relative shrink-0 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 1. 大屏指挥中心专属头部 (科技感硬核顶栏) */}
      <header className="px-5 py-2.5 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-transparent border-b border-cyan-900/40 flex items-center justify-between shrink-0 relative z-20 backdrop-blur-md">
        
        {/* 左侧：指挥中心标题与动态状态指示灯 */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 uppercase">
                智慧船厂指挥中心 · 重点区域安全告警监控大屏
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono tracking-wider">
                LIVE 7×24H 实时轮播
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>数字孪生全域感知</span>
              </span>
              <span>•</span>
              <span>高危工区实时联动布控</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono">第 {currentIndex + 1} / {FOCUS_ZONES.length} 核心标段</span>
            </div>
          </div>
        </div>

        {/* 中间：全域宏观态势微指标胶囊 */}
        <div className="hidden xl:flex items-center gap-5 bg-slate-950/70 border border-slate-800/80 px-4 py-1.5 rounded-2xl shadow-inner font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-sans">在场人员:</span>
            <span className="text-emerald-400 font-bold text-sm">{globalSummary.totalWorkers}</span>
            <span className="text-[10px] text-slate-500">人</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-sans">未闭环警情:</span>
            <span className="text-rose-400 font-bold text-sm">{globalSummary.totalAlarms}</span>
            <span className="text-[10px] text-rose-500">起 (高危{globalSummary.highAlarms})</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-sans">风险阻断率:</span>
            <span className="text-cyan-400 font-bold text-sm">{globalSummary.preventionRate}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] font-sans">平均处置时效:</span>
            <span className="text-amber-400 font-bold text-sm">{globalSummary.avgResponseTime}</span>
          </div>
        </div>

        {/* 右侧：轮播控制器、全屏按钮与退出 */}
        <div className="flex items-center gap-3">
          {/* 时钟显示 */}
          <div className="text-right hidden sm:block font-mono">
            <div className="text-sm font-extrabold text-cyan-300 tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              {currentTime || '12:00:00'}
            </div>
            <div className="text-[10px] text-slate-400">
              {currentDate || '2026年10月19日'}
            </div>
          </div>

          <div className="h-7 w-px bg-slate-800 hidden sm:block" />

          {/* 轮播播放 / 暂停控制器 */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={() => {
                setCurrentIndex(prev => (prev - 1 + FOCUS_ZONES.length) % FOCUS_ZONES.length);
                setProgressPercent(0);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="切换到上一个区域 (方向左键)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(prev => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
              title="空格键播放/暂停轮播"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden md:inline font-mono">{Math.ceil(intervalSec * (1 - progressPercent / 100))}s</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden md:inline">已暂停</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setCurrentIndex(prev => (prev + 1) % FOCUS_ZONES.length);
                setProgressPercent(0);
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="切换到下一个区域 (方向右键)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 轮播频率选择 (5s / 8s / 15s) */}
          <select
            value={intervalSec}
            onChange={(e) => {
              setIntervalSec(Number(e.target.value));
              setProgressPercent(0);
            }}
            className="hidden lg:block bg-slate-900 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-2 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            title="选择轮播切换频率"
          >
            <option value={5}>轮播: 5秒</option>
            <option value={8}>轮播: 8秒 (推荐)</option>
            <option value={15}>轮播: 15秒</option>
            <option value={30}>轮播: 30秒</option>
          </select>

          {/* 浏览器原生全屏切换 */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="切换浏览器全屏"
          >
            {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* 退出全屏监控模式按钮 */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-900/30 hover:scale-105 active:scale-95 cursor-pointer"
            title="退出大屏监控，返回标准控制台 (快捷键 ESC)"
          >
            <X className="w-4 h-4" />
            <span>退出监控</span>
          </button>
        </div>
      </header>

      {/* 2. 重点区域导航轮播标签条 (高亮当前活动工区，支持一键点选) */}
      <div className="px-5 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between gap-3 overflow-x-auto shrink-0 z-10 backdrop-blur-xs">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>重点工区轮播看板:</span>
          </span>

          {FOCUS_ZONES.map((zone, idx) => {
            const isActive = idx === currentIndex;
            const hasHighAlarm = zone.activeAlarms.some(a => a.level === 'high');

            return (
              <button
                key={zone.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgressPercent(0);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-900/80 to-indigo-900/80 text-white border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold scale-[1.02]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
                <span>{zone.name}</span>

                {/* 活跃告警徽章 */}
                {zone.activeAlarms.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    hasHighAlarm 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {zone.activeAlarms.length}警
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span>提示: 按 <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">空格</kbd> 暂停轮播，按 <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">ESC</kbd> 退出大屏</span>
        </div>
      </div>

      {/* 3. 大屏核心看板视口 (三栏网格布局) */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden relative">

        {/* 背景轻度科技网格与微光效果 */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        {/* ========== 左侧栏 (3.5 列): 重点区域概况、物理环境与多维安全指标 ========== */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3.5 z-10 overflow-y-auto pr-0.5">
          
          {/* 卡片 1: 重点区域核心信息 & 风险等级 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
            {/* 顶部色彩光效条 */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${activeZone.dangerLevelColor}`} />

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    {activeZone.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r ${activeZone.dangerLevelColor}`}>
                    {activeZone.dangerLevel}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1 tracking-wide">
                  {activeZone.name}
                </h2>
                <div className="text-xs text-slate-400 font-medium">
                  {activeZone.subTitle}
                </div>
              </div>

              {/* 在场人员大数字徽章 */}
              <div className="text-right bg-slate-950/80 border border-slate-800 px-3 py-2 rounded-xl shrink-0 font-mono">
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>实时在场人员</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 leading-none mt-1">
                  {activeZone.workerCount} <span className="text-xs text-slate-400 font-normal">人</span>
                </div>
              </div>
            </div>

            {/* 描述说明 */}
            <p className="text-xs text-slate-300/90 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 mb-3">
              {activeZone.description}
            </p>

            {/* 核心危险源标签 */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>受控核心安全风险隐患:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeZone.keyHazards.map((hazard, hIdx) => (
                  <span 
                    key={hIdx} 
                    className="px-2 py-0.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/70 rounded-md text-[11px] font-medium transition-colors"
                  >
                    ⚠ {hazard}
                  </span>
                ))}
              </div>
            </div>

            {/* 现场安保责任工程师 */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>责任安全官: <strong className="text-slate-200">{activeZone.safetyOfficer}</strong></span>
              </span>
              <span className="font-mono text-cyan-400">{activeZone.contactPhone}</span>
            </div>
          </div>

          {/* 卡片 2: 现场环境安全与气体传感矩阵 (数字仪表盘) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                <Flame className="w-4 h-4 text-cyan-400" />
                <span>实时环境与特种物料传感态势</span>
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>毫秒级遥测</span>
              </span>
            </div>

            {/* 4 宫格传感器动态看板 */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              {activeZone.sensors.map((sensor, sIdx) => {
                const isDanger = sensor.status === 'danger';
                const isWarning = sensor.status === 'warning';

                return (
                  <div 
                    key={sIdx}
                    className={`p-3 rounded-xl border relative overflow-hidden transition-all ${
                      isDanger
                        ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-500/70'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{sensor.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{sensor.threshold}</span>
                    </div>

                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className={`text-2xl font-black ${
                        isDanger ? 'text-rose-400 animate-pulse' : isWarning ? 'text-amber-400' : 'text-cyan-300'
                      }`}>
                        {sensor.value}
                      </span>
                      <span className="text-xs text-slate-400">{sensor.unit}</span>
                    </div>

                    {/* 状态徽章 */}
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${
                        isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {isDanger ? '● 超标警报' : isWarning ? '● 临界预警' : '● 正常受控'}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {sensor.trend === 'up' ? '↗ 上升' : sensor.trend === 'down' ? '↘ 下降' : '→ 平稳'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 智能联动控制设备状态卡片 */}
            <div className="mt-auto bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>现场自动化联动设备状态</span>
                <span className="text-emerald-400 font-mono text-[10px]">ALL ONLINE</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400">主基站组</div>
                  <div className="text-cyan-400 font-bold font-mono text-xs mt-0.5">{activeZone.safetyDevices.baseStationCount} 台在线</div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400">声光报警器</div>
                  <div className={`font-bold font-mono text-xs mt-0.5 ${activeZone.safetyDevices.alarmSirenActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {activeZone.safetyDevices.alarmSirenActive ? '鸣响告警中' : '全天候待命'}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400">防爆强排风</div>
                  <div className={`font-bold font-mono text-xs mt-0.5 ${activeZone.safetyDevices.ventilationActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {activeZone.safetyDevices.ventilationActive ? '全功率运转' : '常态待机'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 中间栏 (4.5 列): 3D 数字孪生多层视口、空间坐标与热力态势 ========== */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3.5 z-10">
          
          {/* 3D 孪生投影视口卡片 */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md relative flex flex-col">
            
            {/* 视口顶部工具条 */}
            <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">
                  3D 空间立体数字孪生与定位感知视口
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-950 text-cyan-300 border border-cyan-800/60 rounded text-[10px] font-mono">
                  BIM LOD400
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded text-[10px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>RTK 实时追踪中</span>
                </span>
              </div>
            </div>

            {/* 3D 模型与热力主画面 */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center min-h-[320px]">
              
              {/* 底图: 当前工区高精度 3D 渲染图 */}
              <img 
                src={activeZone.bgImage} 
                alt={activeZone.name}
                className="w-full h-full object-cover opacity-60 filter brightness-95 contrast-110"
              />

              {/* 空间暗色覆层与径向扫描光 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,12,25,0.8)_85%)] pointer-events-none" />

              {/* 动态 3D 网格坐标线 */}
              <div className="absolute inset-0 border border-cyan-500/20 m-4 rounded-xl pointer-events-none">
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-500/70">
                  SEC-3D // COORD: X: 407.49 Y: 0.02 Z: -296.85
                </div>
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-slate-500">
                  GRID: 10m × 10m SPATIAL MESH
                </div>
              </div>

              {/* 动态闪烁的告警坐标点 (模拟雷达标定) */}
              {activeZone.activeAlarms.map((alm, aIdx) => {
                const pos = activeZone.spatialCoordinates[aIdx % activeZone.spatialCoordinates.length] || { x: 50, y: 50 };
                const isHigh = alm.level === 'high';

                return (
                  <div 
                    key={alm.id}
                    className="absolute z-20 group cursor-pointer"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-75 ${
                        isHigh ? 'bg-rose-500' : 'bg-amber-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[10px] font-bold text-white shadow-lg ${
                        isHigh ? 'bg-rose-600 shadow-rose-500/50' : 'bg-amber-500 shadow-amber-500/50'
                      }`}>
                        !
                      </span>
                    </div>

                    {/* 悬浮或常驻告警气泡 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900/95 border border-cyan-500/60 text-white px-2.5 py-1.5 rounded-lg shadow-xl text-[10px] whitespace-nowrap backdrop-blur-md pointer-events-none font-sans">
                      <div className="font-bold flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`}></span>
                        <span>{alm.type}</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[9px] mt-0.5">{alm.location}</div>
                    </div>
                  </div>
                );
              })}

              {/* 视口左下角：现场 AI 视频识别与快照缩略图 */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700/80 p-2 rounded-xl backdrop-blur-md flex items-center gap-2.5 shadow-lg">
                <div className="w-16 h-10 bg-slate-950 rounded-lg overflow-hidden relative border border-slate-800">
                  <img src={shipyardAerialMap} alt="AI Snapshot" className="w-full h-full object-cover" />
                  <div className="absolute top-0.5 left-0.5 bg-rose-600 text-white font-mono text-[8px] px-1 rounded">
                    REC
                  </div>
                </div>
                <div className="text-[10px]">
                  <div className="font-bold text-slate-200 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    <span>AI 视口识别点位</span>
                  </div>
                  <div className="text-slate-400 font-mono">CAM-04 (未戴帽/明火分析中)</div>
                </div>
              </div>

              {/* 视口右下角：人员热力聚集提示 */}
              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl backdrop-blur-md text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>实时在场人员轨迹热力已锁定</span>
              </div>
            </div>

            {/* 视口底部：应急联动处置实时日志条 */}
            <div className="px-4 py-2 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <BellRing className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
                <span className="font-bold text-cyan-300">应急联动处置响应流:</span>
                <span className="text-slate-300 truncate max-w-md">
                  {activeZone.activeAlarms[0]?.responder || '全场安全巡逻组常态巡更中'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                最新指令同步正常
              </span>
            </div>
          </div>
        </div>

        {/* ========== 右侧栏 (4 列): 重点区域活跃告警实时流与响应处置闭环 ========== */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3.5 z-10 overflow-y-auto">
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex-1 flex flex-col">
            
            {/* 标题 */}
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  当前区域实时高危告警 ({activeZone.activeAlarms.length} 起)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                动态排查中
              </span>
            </div>

            {/* 告警卡片列表 */}
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
              {activeZone.activeAlarms.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mb-2" />
                  <p className="text-xs font-bold text-slate-300">当前区域无未闭环告警</p>
                  <p className="text-[11px] text-slate-500 mt-1">各项传感器与防护网均在安全阈值内</p>
                </div>
              ) : (
                activeZone.activeAlarms.map((alarm, idx) => {
                  const isHigh = alarm.level === 'high';
                  const isMedium = alarm.level === 'medium';

                  return (
                    <div 
                      key={alarm.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isHigh 
                          ? 'bg-rose-950/40 border-rose-600/80 shadow-md shadow-rose-950/40' 
                          : isMedium
                          ? 'bg-amber-950/30 border-amber-500/60'
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      {/* 告警头部 */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isHigh 
                              ? 'bg-rose-600 text-white' 
                              : isMedium 
                              ? 'bg-amber-500 text-slate-950' 
                              : 'bg-blue-600 text-white'
                          }`}>
                            {isHigh ? '一级高危' : isMedium ? '二级中危' : '三级常规'}
                          </span>
                          <span className="font-bold text-xs text-white">
                            {alarm.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {alarm.timeAgo}
                        </span>
                      </div>

                      {/* 位置 */}
                      <div className="text-[11px] text-cyan-300/90 font-medium flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{alarm.location}</span>
                      </div>

                      {/* 详细描述 */}
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        {alarm.detail}
                      </p>

                      {/* 遥测数值与阈值对比 */}
                      {alarm.sensorValue && (
                        <div className="flex items-center justify-between bg-slate-900/90 px-2 py-1 rounded-md text-[10px] font-mono mb-2 border border-slate-800">
                          <span className="text-slate-400">实测读数: <strong className="text-rose-400 font-bold">{alarm.sensorValue}</strong></span>
                          <span className="text-slate-500">安全阈值: {alarm.threshold}</span>
                        </div>
                      )}

                      {/* 处置第一响应人与状态 */}
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/80">
                        <span className="text-slate-400 truncate max-w-[170px]">
                          👮 {alarm.responder}
                        </span>
                        <span className={`font-bold px-1.5 py-0.2 rounded ${
                          alarm.status === '处置中' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {alarm.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 底部阻断率与今日安全达成 */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 shrink-0">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">今日全厂险情主动阻断率</span>
                <span className="text-emerald-400 font-bold font-mono">99.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full w-[99.4%]" />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>阻断潜在险情 48 起</span>
                <span>零重大事故持续 426 天</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* 4. 底部微型轮播状态栏 */}
      <footer className="h-7 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between text-[11px] text-slate-400 shrink-0 z-20 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Radio className="w-3 h-3 text-cyan-400" />
            <span>轮播状态: {isPlaying ? `正在轮播 (${intervalSec}秒/区域)` : '轮播已暂停'}</span>
          </span>
          <span>|</span>
          <span>当前显示: {activeZone.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>大屏分辨率自适应: 100% 视口满屏</span>
          <span>|</span>
          <button 
            onClick={onExit}
            className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
          >
            [按 ESC 退出全屏监控]
          </button>
        </div>
      </footer>

    </div>
  );
}
