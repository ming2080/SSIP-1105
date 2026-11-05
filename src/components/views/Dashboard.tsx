import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  User, 
  Users, 
  AlertTriangle, 
  Bell, 
  Search, 
  Maximize, 
  MapPin, 
  Cloud, 
  Activity, 
  Server, 
  Radio, 
  Crosshair, 
  Layers, 
  Cpu, 
  Compass,
  LogOut,
  Eye,
  EyeOff,
  Ship,
  Building2,
  ChevronDown,
  Anchor,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Gauge,
  Wifi,
  Volume2,
  Wind,
  BatteryCharging,
  Zap,
  Info,
  Shield,
  Clock,
  Sparkles,
  Camera,
  TrendingUp,
  X,
  Tv
} from 'lucide-react';
import { ViewType } from '@/src/types';

// 设备细分类型定义 (对应设备管理列表4分类: 主基站、气体探测器、声光报警器、摄像头)
export type DeviceCategoryType = 'all' | 'main_station' | 'gas_detector' | 'alarm' | 'camera';

// 造船项目3D模型层次定义 (底舱、中舱、甲板、机舱区、驾驶台、全船透视)
export type ShipModelLevel = 'all' | 'deck' | 'middle' | 'bottom' | 'engine' | 'bridge';

export interface ShipModelLevelOption {
  id: ShipModelLevel;
  name: string;
  shortName: string;
  description: string;
  elevation: string;
  color: string;
}

export const SHIP_MODEL_LEVELS: ShipModelLevelOption[] = [
  { id: 'all', name: '全船透视 (全部层级)', shortName: '全船透视', description: '全船多层三维透视全览', elevation: '全标高', color: '#00d2ff' },
  { id: 'deck', name: '甲板层 (主甲板/露天区)', shortName: '甲板层', description: '主甲板、管系与露天舾装作业区', elevation: '+18.5m ~ +24.0m', color: '#00e676' },
  { id: 'middle', name: '中舱层 (货舱/中层平台)', shortName: '中舱层', description: '货舱上部、通道走廊与隔离空舱', elevation: '+8.0m ~ +18.5m', color: '#38bdf8' },
  { id: 'bottom', name: '底舱层 (双层底/压载舱)', shortName: '底舱层', description: '双层底、压载水舱与龙骨密闭区', elevation: '0.0m ~ +8.0m', color: '#d946ef' },
  { id: 'engine', name: '机舱动力区 (主机/发电机)', shortName: '机舱区', description: '主机动力舱、集控室与辅机平台', elevation: '-2.0m ~ +12.0m', color: '#f59e0b' },
  { id: 'bridge', name: '驾驶台 (上层建筑/生活区)', shortName: '驾驶台', description: '驾控室、罗经甲板与上层生活楼', elevation: '+24.0m ~ +36.0m', color: '#a855f7' },
];

// 空间电子围栏区域接口 (对应附图的多边形分区与状态浮标，并与电子围栏模块保持配置一致)
export interface SpatialElectronicFence {
  id: string;
  name: string;
  code: string;
  scopeType?: 'yard' | 'project';
  projectId?: string;
  projectName?: string;
  type?: string;
  dangerLevel?: 'high' | 'medium' | 'low';
  points: string; // SVG 0 0 100 100 坐标百分比多边形
  strokeColor: string;
  fillColor: string;
  labelX: number; // 标签百分比坐标
  labelY: number;
  statusBadge?: {
    x: number;
    y: number;
    title: string;
    subText: string;
    statusColor?: string;
  };
  details: {
    areaType: string;
    securityLevel: string;
    allowedRoles: string;
    maxCapacity: number;
    currentOccupancy: number;
  };
  devices?: { id: string; name: string; type: string; status: string }[];
  todayViolations?: number;
}

// 空间定位设备实体接口 (包含经纬度/坐标、信号覆盖半径与监测参数)
export interface SpatialDevice {
  id: string;
  name: string;
  category: 'main_station' | 'gas_detector' | 'alarm' | 'camera';
  categoryLabel: string;
  code: string;
  location: string;
  top: string;
  left: string;
  status: 'online' | 'warning' | 'offline';
  coverageRadius: number; // 像素覆盖半径
  coverageColor: string; // 覆盖波纹主色
  battery: string;
  frequency: string;
  valueText?: string;
  power?: string;
}

// 空间定位人员实体接口 (包含人员基本定位信息与冒泡坐标)
export interface SpatialWorkerDetail {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'alarm' | string;
  location: string;
  top?: string;
  left?: string;
  baseStation?: string;
  projectName?: string;
  time?: string;
  battery?: string;
  signalPower?: string;
  phone?: string;
  company?: string;
  wearables?: string[];
  area?: string;
  workerRef?: YardWorkerPoint;
}

// 紧急安全告警实体接口 (用于触发告警时的明显提示窗)
export interface ActiveAlarmData {
  id: string;
  time: string;
  name: string;
  workerId?: string;
  role?: string;
  reason: string;
  location: string;
  projectName: string;
  dangerLevel: 'high' | 'medium' | 'low';
  category?: 'person' | 'environment' | 'device';
  categoryLabel?: string;
  gasReading?: string;
  deviceLinked?: string;
  status: 'pending' | 'handling' | 'resolved';
}

// 驾驶舱实时告警信息数据接口 (涵盖人员行为违规与环境气体/温度检测异常)
export interface DashboardAlertItem {
  id?: string;
  time: string;
  name: string;
  workerId?: string;
  role?: string;
  category: 'person' | 'environment' | 'device';
  categoryLabel: string;
  reason: string;
  location: string;
  dangerLevel: 'high' | 'medium' | 'low';
  gasReading?: string;
  deviceLinked?: string;
  status?: 'pending' | 'handling' | 'resolved';
}

// 导入船模背景图
import lngModelBg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerModelBg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerModelBg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkModelBg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';

// 圆角科技风格面板容器组件
const SciFiPanel: React.FC<{ 
  title: string; 
  icon?: React.ReactNode; 
  extra?: React.ReactNode;
  children: React.ReactNode; 
  className?: string;
  bodyClassName?: string;
}> = ({ title, icon, extra, children, className = '', bodyClassName = '' }) => (
  <div 
    onClick={(e) => e.stopPropagation()} 
    className={`relative bg-[#061833]/85 border border-[#1f4a7c]/80 flex flex-col backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(31,74,124,0.35)] rounded-2xl overflow-hidden shrink-0 transition-all duration-300 ${className}`}
  >
    {/* 四个圆角发光弧线微光装饰 */}
    <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#00d2ff]/80 rounded-tl-lg pointer-events-none z-20"></div>
    <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#00d2ff]/80 rounded-tr-lg pointer-events-none z-20"></div>
    <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#00d2ff]/80 rounded-bl-lg pointer-events-none z-20"></div>
    <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#00d2ff]/80 rounded-br-lg pointer-events-none z-20"></div>

    {/* 面板顶部标题栏 */}
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f4a7c]/60 bg-gradient-to-r from-[#0c315e]/80 via-[#0a264a]/50 to-transparent relative z-10 whitespace-nowrap">
      <div className="flex items-center gap-2">
        <div className="text-[#00d2ff] flex items-center justify-center shrink-0">
          {icon || <div className="w-2 h-2 bg-[#00d2ff] rounded-full"></div>}
        </div>
        <h3 className="text-[#e2f1ff] text-[13px] font-bold tracking-wider drop-shadow-[0_0_6px_rgba(0,210,255,0.4)] whitespace-nowrap">
          {title}
        </h3>
      </div>
      
      <div className="flex items-center gap-1.5 shrink-0">
        {extra || null}
      </div>
    </div>

    {/* 面板内容区域 */}
    <div className={`flex-1 p-3 overflow-hidden flex flex-col relative z-10 ${bodyClassName}`}>
      {children}
    </div>
  </div>
);

// 造船项目配置接口
interface ProjectDashboardConfig {
  id: string;
  name: string;
  shipType: string;
  shipCode: string;
  phase: string;
  progress: number;
  dockingArea: string;
  manager: string;
  version: string;
  bgImage: string;
  totalPersonnel: number;
  onDutyPersonnel: number;
  offDutyPersonnel: number;
  alarmPersonnel: number;
  distributionData: { name: string; value: number; max: number }[];
  typeData: { name: string; value: number; color: string; count?: number }[];
  trendData: { time: string; 在岗人数: number; 报警人数: number }[];
  deviceSummary: { total: number; online: number; offline: number; fault: number };
  deviceList: { id: string; type: string; status: string; location: string; statusColor: string; dotColor: string }[];
  alerts: DashboardAlertItem[];
  featuredWorker: { name: string; id: string; role: string; location: string; time: string; status: string };
  markers: { id: string; role: string; name: string; type: 'online' | 'offline' | 'alarm'; top: string; left: string }[];
  fences: { label: string; location: string; top: string; left: string; width: string; height: string }[];
  kpis: { label: string; value: string; change: string; isUp: boolean; icon: any; iconBg: string }[];
}

// 4大造船项目详细孪生数据 (与电子围栏模块保持项目ID、围栏及设备关联严格一致)
const projectListConfig: ProjectDashboardConfig[] = [
  {
    id: 'PRJ-2026-LNG01',
    name: '17.4万m³ 薄膜型大型LNG船',
    shipType: 'LNG船',
    shipCode: 'HULL-LNG-174',
    phase: '合拢焊接',
    progress: 45,
    dockingArea: '东南造船厂',
    manager: '王建国',
    version: 'V2.1 (合拢合口焊接)',
    bgImage: lngModelBg,
    totalPersonnel: 186,
    onDutyPersonnel: 178,
    offDutyPersonnel: 8,
    alarmPersonnel: 3,
    distributionData: [
      { name: '1#液货舱', value: 52, max: 60 },
      { name: '2#液货舱', value: 46, max: 60 },
      { name: '合拢分段区', value: 38, max: 60 },
      { name: '主甲板管系', value: 24, max: 60 },
      { name: '机舱底部', value: 16, max: 60 },
      { name: '艏楼甲板', value: 10, max: 60 },
    ],
    typeData: [
      { name: '焊工技师', value: 42.5, color: '#00d2ff' },
      { name: '装配钳工', value: 26.8, color: '#00e676' },
      { name: '探伤质检', value: 18.2, color: '#ffb300' },
      { name: '安全巡检', value: 12.5, color: '#f4511e' },
    ],
    trendData: [
      { time: '00:00', 在岗人数: 28, 报警人数: 1 },
      { time: '04:00', 在岗人数: 20, 报警人数: 0 },
      { time: '08:00', 在岗人数: 165, 报警人数: 12 },
      { time: '12:00', 在岗人数: 178, 报警人数: 18 },
      { time: '16:00', 在岗人数: 172, 报警人数: 14 },
      { time: '20:00', 在岗人数: 85, 报警人数: 4 },
      { time: '24:00', 在岗人数: 30, 报警人数: 1 },
    ],
    deviceSummary: { total: 52, online: 49, offline: 2, fault: 1 },
    deviceList: [
      { id: 'LNG-BS-M01', type: '主甲板网关主基站', status: '在线', location: '主甲板中控室顶', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'LNG-BS-W01', type: '合拢作业面基站', status: '在线', location: '1#绝热箱合拢位', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'LNG-GAS-01', type: '四合一气体检测仪', status: '在线', location: '2#密闭货舱通道', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'LNG-ALM-01', type: '吊装防碰声光报警', status: '在线', location: '主甲板吊运口', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'LNG-BS-W02', type: '机舱作业面基站', status: '在线', location: '艉部主推进机舱', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'LNG-BS-W03', type: '艏楼作业面基站', status: '离线', location: '艏楼压载舱', statusColor: 'text-[#ffb300]', dotColor: 'bg-[#ffb300]' },
    ],
    alerts: [
      { id: 'ALT-LNG-01', time: '10:28', name: 'LNG-GAS-01(气体仪)', category: 'environment', categoryLabel: '环境气体', reason: '1#密闭液货舱氧含量不足(17.9%缺氧)', location: '1#液货舱绝热合拢段', dangerLevel: 'high', gasReading: 'O₂: 17.9% (下限19.5%)', deviceLinked: 'LNG-GAS-01 & 声光报警器', status: 'pending' },
      { id: 'ALT-LNG-02', time: '10:14', name: '王亮 (高级焊工)', role: '合拢焊工', workerId: 'LNG-W12', category: 'person', categoryLabel: '人员违规', reason: '动火作业未设专职看火人', location: '主甲板合拢段管架', dangerLevel: 'high', gasReading: '动火温度 280℃', deviceLinked: 'AI高清摄像头CAM-02', status: 'handling' },
      { id: 'ALT-LNG-03', time: '09:55', name: 'LNG-GAS-02(探头)', category: 'environment', categoryLabel: '环境气体', reason: '2#罐体通道可燃气浓度偏高(16%LEL)', location: '2#罐体密闭通道', dangerLevel: 'high', gasReading: 'LEL: 16% (偏高警告)', deviceLinked: 'LNG-GAS-02 固定探测器', status: 'pending' },
      { id: 'ALT-LNG-04', time: '09:42', name: '赵宏 (装配工)', role: '绝热装配工', workerId: 'LNG-W03', category: 'person', categoryLabel: '人员违规', reason: '未佩戴防爆定位手环', location: '2#罐体通道', dangerLevel: 'medium', gasReading: '定位手环离线脱落', deviceLinked: '合拢作业面基站', status: 'resolved' },
      { id: 'ALT-LNG-05', time: '09:30', name: '陈兵 (探伤员)', role: '探伤技师', workerId: 'LNG-W08', category: 'person', categoryLabel: '人员违规', reason: '超出受限空间许可作业时间', location: '主泵舱底部', dangerLevel: 'medium', gasReading: '连续在舱 185分钟', deviceLinked: '受限空间门禁系统', status: 'resolved' },
      { id: 'ALT-LNG-06', time: '09:15', name: 'LNG-GAS-03(探头)', category: 'environment', categoryLabel: '环境气体', reason: '双层底压载水舱硫化氢检出(8.5ppm)', location: '双层底压载水舱', dangerLevel: 'medium', gasReading: 'H₂S: 8.5ppm', deviceLinked: '双层底防爆检测仪', status: 'resolved' },
    ],
    featuredWorker: {
      name: '张三 (组长)',
      id: 'LNG20260421',
      role: '高级焊接技师',
      location: '1#液货舱绝热合拢段',
      time: '2026-08-28 10:30:30',
      status: '在岗施工'
    },
    markers: [
      { id: 'LNG-W1', role: '合拢焊工', name: '张三', type: 'online', top: '26%', left: '38%' },
      { id: 'LNG-W2', role: '探伤员', name: '李四', type: 'online', top: '35%', left: '28%' },
      { id: 'LNG-W3', role: '绝热装配工', name: '王五', type: 'online', top: '30%', left: '52%' },
      { id: 'LNG-W4', role: '安全巡检员', name: '赵六', type: 'online', top: '22%', left: '66%' },
      { id: 'LNG-W5', role: '打磨工', name: '钱七', type: 'alarm', top: '48%', left: '42%' },
      { id: 'LNG-W6', role: '机舱电工', name: '孙八', type: 'offline', top: '40%', left: '60%' },
      { id: 'LNG-W7', role: '起重指挥工', name: '周九', type: 'online', top: '18%', left: '48%' },
    ],
    fences: [
      { label: '1#液货舱绝热合拢受限空间', location: '1#液货舱/合拢口', top: '28%', left: '22%', width: '95px', height: '55px' },
      { label: '主甲板高压管路动火作业区', location: '主甲板管系区域', top: '24%', left: '50%', width: '105px', height: '55px' }
    ],
    kpis: [
      { label: '船上作业总数', value: '186', change: '+3.8%', isUp: true, icon: Users, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '在岗施工人数', value: '178', change: '+4.2%', isUp: true, icon: User, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '受限空间违规', value: '3', change: '-25.0%', isUp: false, icon: AlertTriangle, iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' },
      { label: '船载传感器数', value: '52', change: '+5.0%', isUp: true, icon: Cpu, iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' },
      { label: '合拢焊接进度', value: '45.0%', change: '+1.5%', isUp: true, icon: Activity, iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' },
      { label: '气体监测达标率', value: '99.8%', change: '+0.2%', isUp: true, icon: Compass, iconBg: 'bg-indigo-500/30 text-[#8ab4f8] border-indigo-500/40' },
    ]
  },
  {
    id: 'PRJ-2026-CTN02',
    name: '24000TEU 超大型集装箱船',
    shipType: '集装箱船',
    shipCode: 'HULL-CTN-240',
    phase: '系泊试验',
    progress: 85,
    dockingArea: '马尾造船厂',
    manager: '李海波',
    version: 'V3.0 (系泊电气调试)',
    bgImage: containerModelBg,
    totalPersonnel: 142,
    onDutyPersonnel: 136,
    offDutyPersonnel: 6,
    alarmPersonnel: 2,
    distributionData: [
      { name: '集装箱导轨架', value: 48, max: 55 },
      { name: '驾驶甲板楼', value: 34, max: 55 },
      { name: '主推进主机舱', value: 28, max: 55 },
      { name: '首侧推机舱', value: 16, max: 55 },
      { name: '系泊绞缆甲板', value: 16, max: 55 },
    ],
    typeData: [
      { name: '电气调试', value: 38.6, color: '#00d2ff' },
      { name: '轮机调试', value: 32.4, color: '#00e676' },
      { name: '涂装补漆', value: 16.5, color: '#ffb300' },
      { name: '船东代表', value: 12.5, color: '#f4511e' },
    ],
    trendData: [
      { time: '00:00', 在岗人数: 15, 报警人数: 0 },
      { time: '04:00', 在岗人数: 10, 报警人数: 0 },
      { time: '08:00', 在岗人数: 120, 报警人数: 4 },
      { time: '12:00', 在岗人数: 136, 报警人数: 8 },
      { time: '16:00', 在岗人数: 130, 报警人数: 5 },
      { time: '20:00', 在岗人数: 55, 报警人数: 1 },
      { time: '24:00', 在岗人数: 18, 报警人数: 0 },
    ],
    deviceSummary: { total: 60, online: 58, offline: 2, fault: 0 },
    deviceList: [
      { id: 'CTN-BS-M01', type: '驾驶室顶甲板主基站', status: '在线', location: '驾驶室顶甲板', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'CTN-BS-W01', type: '导轨架作业面基站', status: '在线', location: '10#箱位导轨架', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'CTN-ALM-01', type: '落水防溺报警器', status: '在线', location: '艏艉系泊舷梯', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'CTN-BS-W02', type: '中控室作业基站', status: '在线', location: '电气中控室', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'CTN-GAS-01', type: '通风气体检测仪', status: '在线', location: '主机舱集控室', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
    ],
    alerts: [
      { id: 'ALT-CTN-01', time: '10:22', name: '刘东 (电气工)', role: '电气工', workerId: 'CTN-W05', category: 'person', categoryLabel: '人员违规', reason: '舷侧临水高空作业未挂安全绳', location: '右舷艉甲板临水区', dangerLevel: 'high', gasReading: '高空防坠钩未锁止', deviceLinked: 'CTN-ALM-01 落水报警', status: 'pending' },
      { id: 'ALT-CTN-02', time: '10:05', name: 'CTN-GAS-01(VOC仪)', category: 'environment', categoryLabel: '环境气体', reason: '主机舱封闭涂装VOC挥发物超标(78mg/m³)', location: '主机舱双层底涂装段', dangerLevel: 'high', gasReading: 'VOC: 78mg/m³ (限值50)', deviceLinked: 'CTN-GAS-01 气体仪', status: 'pending' },
      { id: 'ALT-CTN-03', time: '09:40', name: '郭凯 (调试主管)', role: '调试工程师', workerId: 'CTN-W02', category: 'person', categoryLabel: '人员违规', reason: '高压配电屏带电调试未设警示牌', location: '配电控制中心', dangerLevel: 'medium', gasReading: '安全警示隔离缺失', deviceLinked: '中控室作业基站', status: 'handling' },
      { id: 'ALT-CTN-04', time: '09:18', name: 'CTN-GAS-02(探头)', category: 'environment', categoryLabel: '环境气体', reason: '首侧推机舱密闭舱段含氧量偏低(18.5%)', location: '首侧推机舱底部', dangerLevel: 'high', gasReading: 'O₂: 18.5% (轻度缺氧)', deviceLinked: '通风气体检测仪', status: 'resolved' },
      { id: 'ALT-CTN-05', time: '08:52', name: '王敏 (导轨装配工)', role: '装配钳工', workerId: 'CTN-W04', category: 'person', categoryLabel: '人员违规', reason: '进入导轨架起吊垂直坠物禁区', location: '10#箱位导轨架下方', dangerLevel: 'high', gasReading: 'UWB越界 2.2m', deviceLinked: '导轨架作业面基站', status: 'resolved' },
    ],
    featuredWorker: {
      name: '李海波 (主管)',
      id: 'CTN20260901',
      role: '系泊调试总师',
      location: '集控室主配电盘区',
      time: '2026-08-28 10:15:20',
      status: '带电调试'
    },
    markers: [
      { id: 'CTN-W1', role: '调试总师', name: '李海波', type: 'online', top: '24%', left: '70%' },
      { id: 'CTN-W2', role: '轮机调试工', name: '郑华', type: 'online', top: '38%', left: '48%' },
      { id: 'CTN-W3', role: '系泊工', name: '吴磊', type: 'online', top: '48%', left: '20%' },
      { id: 'CTN-W4', role: '导轨装配工', name: '王敏', type: 'alarm', top: '34%', left: '32%' },
      { id: 'CTN-W5', role: '电气工', name: '杨光', type: 'online', top: '30%', left: '56%' },
      { id: 'CTN-W6', role: '防坠巡检员', name: '刘强', type: 'online', top: '44%', left: '74%' },
      { id: 'CTN-W7', role: '验船师', name: '陈思远', type: 'offline', top: '20%', left: '62%' },
    ],
    fences: [
      { label: '艏楼导轨架安装禁区', location: '艏楼导轨安装面', top: '30%', left: '26%', width: '100px', height: '50px' },
      { label: '舷侧临水高空防坠警戒区', location: '舷侧临水边缘', top: '32%', left: '55%', width: '105px', height: '48px' }
    ],
    kpis: [
      { label: '调试人员总数', value: '142', change: '+2.1%', isUp: true, icon: Users, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '在岗调试人数', value: '136', change: '+3.0%', isUp: true, icon: User, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '高空防坠预警', value: '2', change: '-50.0%', isUp: false, icon: AlertTriangle, iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' },
      { label: '调试传感器数', value: '60', change: '+4.0%', isUp: true, icon: Cpu, iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' },
      { label: '系泊试验进度', value: '85.0%', change: '+0.5%', isUp: true, icon: Activity, iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' },
      { label: '临水边缘安全率', value: '100%', change: '0.0%', isUp: true, icon: Compass, iconBg: 'bg-indigo-500/30 text-[#8ab4f8] border-indigo-500/40' },
    ]
  },
  {
    id: 'PRJ-2026-VLCC03',
    name: '30万吨级 超大型原油船(VLCC)',
    shipType: '原油船',
    shipCode: 'HULL-VLCC-300',
    phase: '密闭涂装',
    progress: 60,
    dockingArea: '冠海造船厂',
    manager: '张明',
    version: 'V4.0 (试航前管系试压)',
    bgImage: tankerModelBg,
    totalPersonnel: 98,
    onDutyPersonnel: 94,
    offDutyPersonnel: 4,
    alarmPersonnel: 1,
    distributionData: [
      { name: '货油管系总管', value: 36, max: 40 },
      { name: '主甲板阀门段', value: 25, max: 40 },
      { name: '惰性气体机舱', value: 18, max: 40 },
      { name: '居住楼生活区', value: 15, max: 40 },
    ],
    typeData: [
      { name: '管系技工', value: 45.0, color: '#00d2ff' },
      { name: '压力测试', value: 25.0, color: '#00e676' },
      { name: '油漆防腐', value: 18.0, color: '#ffb300' },
      { name: '验船师', value: 12.0, color: '#f4511e' },
    ],
    trendData: [
      { time: '00:00', 在岗人数: 12, 报警人数: 0 },
      { time: '04:00', 在岗人数: 8, 报警人数: 0 },
      { time: '08:00', 在岗人数: 88, 报警人数: 3 },
      { time: '12:00', 在岗人数: 94, 报警人数: 5 },
      { time: '16:00', 在岗人数: 90, 报警人数: 3 },
      { time: '20:00', 在岗人数: 40, 报警人数: 1 },
      { time: '24:00', 在岗人数: 15, 报警人数: 0 },
    ],
    deviceSummary: { total: 44, online: 42, offline: 2, fault: 0 },
    deviceList: [
      { id: 'VLCC-BS-M01', type: '货油中控主基站', status: '在线', location: '主甲板中控楼', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'VLCC-GAS-01', type: '泵舱VOC气体分析仪', status: '在线', location: '货油泵舱底段', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'VLCC-BS-W01', type: '隔舱防爆基站', status: '在线', location: '1号隔离舱段', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'VLCC-ALM-01', type: '管汇高压报警器', status: '在线', location: '甲板货油管汇处', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
    ],
    alerts: [
      { id: 'ALT-VLCC-01', time: '10:28', name: 'VLCC-GAS-01(VOC仪)', category: 'environment', categoryLabel: '环境气体', reason: '货油泵舱VOC易燃气体浓度超标(89mg/m³)', location: '货油泵舱底部受限区', dangerLevel: 'high', gasReading: 'VOC: 89mg/m³ | LEL: 12%', deviceLinked: 'VLCC-GAS-01 分析仪', status: 'pending' },
      { id: 'ALT-VLCC-02', time: '10:15', name: 'VLCC-GAS-02(硫化氢仪)', category: 'environment', categoryLabel: '环境气体', reason: '1号隔离舱H₂S硫化氢气体超标预警(15.2ppm)', location: '1号隔舱下部管廊', dangerLevel: 'high', gasReading: 'H₂S: 15.2ppm (阈值10ppm)', deviceLinked: '隔舱防爆基站联动', status: 'pending' },
      { id: 'ALT-VLCC-03', time: '10:05', name: '陈明 (管工技师)', role: '管系技工', workerId: 'VLCC-W03', category: 'person', categoryLabel: '人员违规', reason: '货油总管2.5MPa高压试压区违规逗留', location: '主甲板左舷管架段', dangerLevel: 'high', gasReading: '高压试压保压警戒中', deviceLinked: '管汇高压报警器', status: 'handling' },
      { id: 'ALT-VLCC-04', time: '09:35', name: '刘小军 (涂装工)', role: '油漆防腐工', workerId: 'VLCC-W04', category: 'person', categoryLabel: '人员违规', reason: '密闭双层底受限空间静止超时(12min)', location: '双层底防腐涂装区', dangerLevel: 'high', gasReading: '静止 12分40秒 (防昏迷跌落)', deviceLinked: '防爆定位手环', status: 'resolved' },
      { id: 'ALT-VLCC-05', time: '09:10', name: 'VLCC-GAS-03(氧气仪)', category: 'environment', categoryLabel: '环境气体', reason: '惰性气体机舱氧含量异常下降(18.1%)', location: '惰性气体机舱', dangerLevel: 'high', gasReading: 'O₂: 18.1%', deviceLinked: '货油中控主基站', status: 'resolved' },
    ],
    featuredWorker: {
      name: '张明 (项目经理)',
      id: 'VLCC20251110',
      role: 'VLCC建造总管',
      location: '主甲板货油管汇处',
      time: '2026-08-28 09:50:12',
      status: '现场核验'
    },
    markers: [
      { id: 'VLCC-W1', role: '建造总管', name: '张明', type: 'online', top: '28%', left: '60%' },
      { id: 'VLCC-W2', role: '试压工程师', name: '宋超', type: 'online', top: '38%', left: '76%' },
      { id: 'VLCC-W3', role: '泵舱管工', name: '周志强', type: 'online', top: '44%', left: '46%' },
      { id: 'VLCC-W4', role: '防腐涂装工', name: '刘小军', type: 'alarm', top: '32%', left: '34%' },
      { id: 'VLCC-W5', role: '双层底焊工', name: '吴峰', type: 'online', top: '46%', left: '26%' },
      { id: 'VLCC-W6', role: '外籍验船师', name: 'Hans', type: 'offline', top: '24%', left: '78%' },
    ],
    fences: [
      { label: '泵舱与货油舱受限空间', location: '机舱双层底及泵舱区', top: '28%', left: '46%', width: '95px', height: '55px' },
      { label: '主甲板货油总管高压试压区', location: '主甲板高压管段', top: '30%', left: '74%', width: '90px', height: '48px' }
    ],
    kpis: [
      { label: '涂装作业人数', value: '98', change: '+1.2%', isUp: true, icon: Users, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '在岗施工人数', value: '94', change: '+2.0%', isUp: true, icon: User, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '试压安全告警', value: '1', change: '-66.7%', isUp: false, icon: AlertTriangle, iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' },
      { label: '在线传感器', value: '42', change: '+2.4%', isUp: true, icon: Cpu, iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' },
      { label: '密闭涂装进度', value: '60.0%', change: '+3.0%', isUp: true, icon: Activity, iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' },
      { label: '管系试压合格率', value: '100%', change: '0.0%', isUp: true, icon: Compass, iconBg: 'bg-indigo-500/30 text-[#8ab4f8] border-indigo-500/40' },
    ]
  },
  {
    id: 'PRJ-2026-BULK04',
    name: '8.2万吨 卡姆萨尔型散货船',
    shipType: '散货船',
    shipCode: 'HULL-BULK-082',
    phase: '分段搭载',
    progress: 30,
    dockingArea: '东南造船厂',
    manager: '陈远',
    version: 'V1.3 (分段总组搭载)',
    bgImage: bulkModelBg,
    totalPersonnel: 76,
    onDutyPersonnel: 72,
    offDutyPersonnel: 4,
    alarmPersonnel: 2,
    distributionData: [
      { name: '1#大舱分段', value: 28, max: 35 },
      { name: '2#大舱分段', value: 24, max: 35 },
      { name: '艉部机舱总组', value: 12, max: 35 },
      { name: '双层底压载舱', value: 8, max: 35 },
    ],
    typeData: [
      { name: '船台铆焊', value: 50.0, color: '#00d2ff' },
      { name: '起重吊装', value: 25.0, color: '#00e676' },
      { name: '分段校正', value: 15.0, color: '#ffb300' },
      { name: '安全监督', value: 10.0, color: '#f4511e' },
    ],
    trendData: [
      { time: '00:00', 在岗人数: 8, 报警人数: 0 },
      { time: '04:00', 在岗人数: 5, 报警人数: 0 },
      { time: '08:00', 在岗人数: 68, 报警人数: 2 },
      { time: '12:00', 在岗人数: 72, 报警人数: 4 },
      { time: '16:00', 在岗人数: 70, 报警人数: 3 },
      { time: '20:00', 在岗人数: 30, 报警人数: 1 },
      { time: '24:00', 在岗人数: 10, 报警人数: 0 },
    ],
    deviceSummary: { total: 32, online: 30, offline: 2, fault: 0 },
    deviceList: [
      { id: 'BULK-BS-M01', type: '船台总组主基站', status: '在线', location: '2号船台搭载总控', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'BULK-BS-W01', type: '大舱舷梯基站', status: '在线', location: '1#大舱舷梯口', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'BULK-GAS-01', type: '压载舱气体检测仪', status: '在线', location: '双层底压载舱', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'BULK-ALM-01', type: '大件吊装防碰警报', status: '在线', location: '总组吊装龙门架', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
    ],
    alerts: [
      { id: 'ALT-BULK-01', time: '10:18', name: 'BULK-GAS-01(气体仪)', category: 'environment', categoryLabel: '环境气体', reason: '双层底压载舱含氧量严重不足(17.6%缺氧)', location: '双层底压载水舱狭小段', dangerLevel: 'high', gasReading: 'O₂: 17.6% (严重缺氧)', deviceLinked: 'BULK-GAS-01 气体仪', status: 'pending' },
      { id: 'ALT-BULK-02', time: '09:50', name: '孙强 (船台铆工)', role: '船台铆工', workerId: 'BULK-W06', category: 'person', categoryLabel: '人员违规', reason: '大件分段吊装回转半径内违规停留', location: '2#大舱总组搭载区', dangerLevel: 'high', gasReading: '吊运防碰传感器抓拍', deviceLinked: '总组吊装龙门架基站', status: 'handling' },
      { id: 'ALT-BULK-03', time: '09:22', name: '王利 (结构焊工)', role: '合拢焊工', workerId: 'BULK-W03', category: 'person', categoryLabel: '人员违规', reason: '船台高空搭载作业安全带未牢固锁止', location: '1#大舱舷梯登高位', dangerLevel: 'high', gasReading: '防坠手环状态异常', deviceLinked: '大舱舷梯基站', status: 'resolved' },
      { id: 'ALT-BULK-04', time: '08:45', name: 'BULK-GAS-02(探头)', category: 'environment', categoryLabel: '环境气体', reason: '艉部机舱总组焊接切割易燃气体微泄漏', location: '艉部机舱总组区', dangerLevel: 'medium', gasReading: 'LEL: 9%', deviceLinked: '船台总组主基站', status: 'resolved' },
    ],
    featuredWorker: {
      name: '陈远 (搭载长)',
      id: 'BULK20260115',
      role: '船台总搭载工程师',
      location: '1#货舱基座定位点',
      time: '2026-08-28 09:35:40',
      status: '吊装对位'
    },
    markers: [
      { id: 'BULK-W1', role: '总搭载工', name: '陈远', type: 'online', top: '24%', left: '40%' },
      { id: 'BULK-W2', role: '吊车指挥', name: '赵刚', type: 'online', top: '20%', left: '54%' },
      { id: 'BULK-W3', role: '结构焊接工', name: '王利', type: 'alarm', top: '34%', left: '26%' },
      { id: 'BULK-W4', role: '分段校正工', name: '钱大明', type: 'online', top: '44%', left: '62%' },
      { id: 'BULK-W5', role: '探伤质检员', name: '孙建军', type: 'online', top: '38%', left: '72%' },
      { id: 'BULK-W6', role: '船台铆工', name: '周成', type: 'offline', top: '48%', left: '36%' },
    ],
    fences: [
      { label: '船台大件总组吊装警戒', location: '2号船台搭载区', top: '24%', left: '38%', width: '105px', height: '55px' },
      { label: '双层底压载舱密闭作业区', location: '双层底压载舱', top: '30%', left: '70%', width: '95px', height: '50px' }
    ],
    kpis: [
      { label: '船台搭载人数', value: '76', change: '+2.7%', isUp: true, icon: Users, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '在岗施工人数', value: '72', change: '+3.1%', isUp: true, icon: User, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '吊装区域告警', value: '2', change: '0.0%', isUp: true, icon: AlertTriangle, iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' },
      { label: '在线定位设备', value: '30', change: '+3.4%', isUp: true, icon: Cpu, iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' },
      { label: '分段总组进度', value: '30.0%', change: '+2.0%', isUp: true, icon: Activity, iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' },
      { label: '高空防坠合格率', value: '99.5%', change: '+0.5%', isUp: true, icon: Compass, iconBg: 'bg-indigo-500/30 text-[#8ab4f8] border-indigo-500/40' },
    ]
  },
  {
    id: 'PRJ-2026-PCTC05',
    name: '17.5万吨 PCTC双燃料汽车运输船',
    shipType: '汽车运输船',
    shipCode: 'HULL-PCTC-175',
    phase: '舾装系统调试',
    progress: 72,
    dockingArea: '2号码头 (停放舾装)',
    manager: '吴强',
    version: 'V2.4 (滚装滚卸系统调试)',
    bgImage: containerModelBg,
    totalPersonnel: 115,
    onDutyPersonnel: 108,
    offDutyPersonnel: 7,
    alarmPersonnel: 1,
    distributionData: [
      { name: '甲板滚装区', value: 38, max: 45 },
      { name: 'LNG双燃料罐', value: 28, max: 45 },
      { name: '主推进主机舱', value: 24, max: 45 },
      { name: '驾驶甲板楼', value: 18, max: 45 },
    ],
    typeData: [
      { name: '舾装电工', value: 40.0, color: '#00d2ff' },
      { name: '液压调试', value: 30.0, color: '#00e676' },
      { name: '防腐涂装', value: 18.0, color: '#ffb300' },
      { name: '验船师', value: 12.0, color: '#f4511e' },
    ],
    trendData: [
      { time: '00:00', 在岗人数: 12, 报警人数: 0 },
      { time: '04:00', 在岗人数: 8, 报警人数: 0 },
      { time: '08:00', 在岗人数: 98, 报警人数: 2 },
      { time: '12:00', 在岗人数: 108, 报警人数: 3 },
      { time: '16:00', 在岗人数: 102, 报警人数: 1 },
      { time: '20:00', 在岗人数: 45, 报警人数: 0 },
      { time: '24:00', 在岗人数: 15, 报警人数: 0 },
    ],
    deviceSummary: { total: 48, online: 46, offline: 2, fault: 0 },
    deviceList: [
      { id: 'PCTC-BS-M01', type: '2号码头舾装主基站', status: '在线', location: '2号码头中控塔', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'PCTC-BS-W01', type: '滚装跳板作业面基站', status: '在线', location: '艉部滚装跳板', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'PCTC-GAS-01', type: '双燃料气体检测仪', status: '在线', location: 'LNG双燃料罐区', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'PCTC-ALM-01', type: '液压坡道声光警报器', status: '在线', location: '甲板活动坡道', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
    ],
    alerts: [
      { id: 'ALT-PCTC-01', time: '10:20', name: 'PCTC-GAS-01(双燃料仪)', category: 'environment', categoryLabel: '环境气体', reason: 'LNG双燃料储罐区可燃气微泄漏预警(14%LEL)', location: 'C型LNG双燃料储罐区', dangerLevel: 'high', gasReading: 'LEL: 14% (一级预警)', deviceLinked: 'PCTC-GAS-01 检测仪', status: 'pending' },
      { id: 'ALT-PCTC-02', time: '10:12', name: '周杰 (液压调试工)', role: '液压工', workerId: 'PCTC-W02', category: 'person', categoryLabel: '人员违规', reason: '液压跳板联动升降动作区未经许可进入', location: '3#滚装甲板跳板口', dangerLevel: 'high', gasReading: '防碰雷达持续触发', deviceLinked: '液压坡道声光警报器', status: 'handling' },
      { id: 'ALT-PCTC-03', time: '09:40', name: 'PCTC-GAS-02(尾气探头)', category: 'environment', categoryLabel: '环境气体', reason: '封闭滚装车库调试车辆尾气CO超标(58ppm)', location: '5#封闭滚装甲板', dangerLevel: 'medium', gasReading: 'CO: 58ppm (标准≤30ppm)', deviceLinked: '2号码头舾装主基站', status: 'resolved' },
      { id: 'ALT-PCTC-04', time: '09:05', name: '刘涛 (安全巡检)', role: '安全巡检员', workerId: 'PCTC-W04', category: 'person', categoryLabel: '人员违规', reason: '未按防爆要求佩戴防爆对讲机与工牌', location: '艉部跳板液压泵站', dangerLevel: 'medium', gasReading: '防爆合规性检查不合格', deviceLinked: '滚装跳板作业面基站', status: 'resolved' },
    ],
    featuredWorker: {
      name: '吴强 (调试组长)',
      id: 'PCTC20260308',
      role: '滚装系统调试总师',
      location: '艉部跳板液压泵站',
      time: '2026-08-28 10:05:18',
      status: '带压测试'
    },
    markers: [
      { id: 'PCTC-W1', role: '调试总师', name: '吴强', type: 'online', top: '26%', left: '72%' },
      { id: 'PCTC-W2', role: '液压工', name: '郑力', type: 'online', top: '38%', left: '48%' },
      { id: 'PCTC-W3', role: '舾装电工', name: '马超', type: 'online', top: '44%', left: '28%' },
      { id: 'PCTC-W4', role: '安全巡检员', name: '刘涛', type: 'alarm', top: '32%', left: '56%' },
    ],
    fences: [
      { label: '艉部滚装跳板液压测试警戒区', location: '艉部滚装跳板', top: '28%', left: '60%', width: '100px', height: '50px' },
      { label: 'LNG双燃料罐密闭管制区', location: 'C型LNG储罐区', top: '32%', left: '30%', width: '95px', height: '48px' }
    ],
    kpis: [
      { label: '舾装调试人数', value: '115', change: '+1.8%', isUp: true, icon: Users, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '在岗施工人数', value: '108', change: '+2.5%', isUp: true, icon: User, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '滚装测试告警', value: '1', change: '-50.0%', isUp: false, icon: AlertTriangle, iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' },
      { label: '在线定位设备', value: '46', change: '+4.2%', isUp: true, icon: Cpu, iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' },
      { label: '舾装调试进度', value: '72.0%', change: '+1.0%', isUp: true, icon: Activity, iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' },
      { label: '滚装跳板合格率', value: '100%', change: '0.0%', isUp: true, icon: Compass, iconBg: 'bg-indigo-500/30 text-[#8ab4f8] border-indigo-500/40' },
    ]
  },
  {
    id: 'PRJ-2026-WIND06',
    name: '1500吨 自升式海上风电安装船',
    shipType: '风电安装船',
    shipCode: 'HULL-WIND-1500',
    phase: '桩腿合拢搭设',
    progress: 52,
    dockingArea: '4号造船台 (停放搭载)',
    manager: '徐立',
    version: 'V1.8 (自升桩腿吊装合拢)',
    bgImage: lngModelBg,
    totalPersonnel: 88,
    onDutyPersonnel: 82,
    offDutyPersonnel: 6,
    alarmPersonnel: 2,
    distributionData: [
      { name: '4#自升桩腿区', value: 32, max: 40 },
      { name: '1200T绕桩起重机', value: 26, max: 40 },
      { name: 'DP2动力定位舱', value: 14, max: 40 },
      { name: '甲板风机堆存区', value: 10, max: 40 },
    ],
    typeData: [
      { name: '重型起重', value: 42.0, color: '#00d2ff' },
      { name: '高空合拢焊工', value: 32.0, color: '#00e676' },
      { name: '液压插桩调试', value: 16.0, color: '#ffb300' },
      { name: '质检安全', value: 10.0, color: '#f4511e' },
    ],
    trendData: [
      { time: '00:00', 在岗人数: 10, 报警人数: 0 },
      { time: '04:00', 在岗人数: 6, 报警人数: 0 },
      { time: '08:00', 在岗人数: 78, 报警人数: 2 },
      { time: '12:00', 在岗人数: 82, 报警人数: 4 },
      { time: '16:00', 在岗人数: 76, 报警人数: 2 },
      { time: '20:00', 在岗人数: 30, 报警人数: 1 },
      { time: '24:00', 在岗人数: 12, 报警人数: 0 },
    ],
    deviceSummary: { total: 38, online: 36, offline: 2, fault: 0 },
    deviceList: [
      { id: 'WIND-BS-M01', type: '4号船台风电搭载主基站', status: '在线', location: '4号船台塔吊顶', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'WIND-BS-W01', type: '桩腿高空作业面基站', status: '在线', location: '3#桩腿50m平台', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'WIND-GAS-01', type: '密闭管廊气体分析仪', status: '在线', location: '桩腿升降机构管廊', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
      { id: 'WIND-ALM-01', type: '1200T绕桩吊防碰报警器', status: '在线', location: '绕桩起重机吊臂', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
    ],
    alerts: [
      { id: 'ALT-WIND-01', time: '10:35', name: '黄伟 (高空焊工)', role: '高空合拢焊工', workerId: 'WIND-W02', category: 'person', categoryLabel: '人员违规', reason: '3#自升桩腿50m高空作业未双钩挂扣', location: '3#桩腿50m高空平台', dangerLevel: 'high', gasReading: '高空防坠传感器失联', deviceLinked: '桩腿高空作业面基站', status: 'pending' },
      { id: 'ALT-WIND-02', time: '10:18', name: 'WIND-GAS-01(分析仪)', category: 'environment', categoryLabel: '环境气体', reason: '桩腿升降机构密闭管廊含氧量不足(18.3%)', location: '桩腿升降机构密闭管廊', dangerLevel: 'high', gasReading: 'O₂: 18.3% (偏低警告)', deviceLinked: 'WIND-GAS-01 气体仪', status: 'handling' },
      { id: 'ALT-WIND-03', time: '09:45', name: '高飞 (起重工)', role: '起重工', workerId: 'WIND-W03', category: 'person', categoryLabel: '人员违规', reason: '1200T绕桩起重机旋转盲区违规穿越', location: '主绕桩起重机基座旋转带', dangerLevel: 'high', gasReading: '旋转雷达防碰抓拍', deviceLinked: '1200T绕桩吊防碰报警器', status: 'resolved' },
      { id: 'ALT-WIND-04', time: '09:10', name: 'WIND-GAS-02(探头)', category: 'environment', categoryLabel: '环境气体', reason: '4#桩腿高空合拢焊接燃气管压差偏高预警', location: '4#桩腿合拢作业面', dangerLevel: 'medium', gasReading: '燃气管压差 +15%', deviceLinked: '4号船台风电主基站', status: 'resolved' },
    ],
    featuredWorker: {
      name: '徐立 (总工程师)',
      id: 'WIND20260512',
      role: '桩腿合拢工程师',
      location: '1200T绕桩吊基座',
      time: '2026-08-28 10:20:45',
      status: '垂直测量'
    },
    markers: [
      { id: 'WIND-W1', role: '总工程师', name: '徐立', type: 'online', top: '24%', left: '50%' },
      { id: 'WIND-W2', role: '高空焊工', name: '高飞', type: 'alarm', top: '18%', left: '34%' },
      { id: 'WIND-W3', role: '起重指挥', name: '陈兵', type: 'online', top: '36%', left: '65%' },
      { id: 'WIND-W4', role: '升降机构调试', name: '孙跃', type: 'online', top: '46%', left: '40%' },
    ],
    fences: [
      { label: '自升桩腿50m高空合拢警戒区', location: '3#、4#自升桩腿', top: '22%', left: '32%', width: '105px', height: '52px' },
      { label: '1200T绕桩起重机旋转警戒区', location: '主绕桩起重机', top: '28%', left: '55%', width: '95px', height: '50px' }
    ],
    kpis: [
      { label: '桩腿搭设人数', value: '88', change: '+3.2%', isUp: true, icon: Users, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '在岗施工人数', value: '82', change: '+3.8%', isUp: true, icon: User, iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' },
      { label: '高空防坠告警', value: '2', change: '0.0%', isUp: true, icon: AlertTriangle, iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' },
      { label: '在线定位设备', value: '36', change: '+2.8%', isUp: true, icon: Cpu, iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' },
      { label: '桩腿合拢进度', value: '52.0%', change: '+1.5%', isUp: true, icon: Activity, iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' },
      { label: '垂直对位合格率', value: '100%', change: '0.0%', isUp: true, icon: Compass, iconBg: 'bg-indigo-500/30 text-[#8ab4f8] border-indigo-500/40' },
    ]
  }
];

// 6个停泊区域 (编号1~6) 移动码头与平船台配置 (只保留编号、名称与占用情况)
export const DOCK_ZONES_CONFIG = [
  {
    dockId: 'ZONE-01',
    zoneNumber: 1,
    dockName: '1号船台（2万吨船台）',
    maxCapacity: 2,
    currentCount: 1,
    top: '10%',
    left: '68%',
    borderColor: '#00d2ff',
    glowColor: 'rgba(0, 210, 255, 0.22)'
  },
  {
    dockId: 'ZONE-02',
    zoneNumber: 2,
    dockName: '2号码头',
    maxCapacity: 3,
    currentCount: 2,
    top: '23%',
    left: '68%',
    borderColor: '#ffb300',
    glowColor: 'rgba(255, 179, 0, 0.22)'
  },
  {
    dockId: 'ZONE-03',
    zoneNumber: 3,
    dockName: '3号码头',
    maxCapacity: 2,
    currentCount: 1,
    top: '43%',
    left: '68%',
    borderColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.22)'
  },
  {
    dockId: 'ZONE-04',
    zoneNumber: 4,
    dockName: '4号浮动码头',
    maxCapacity: 2,
    currentCount: 1,
    top: '56%',
    left: '68%',
    borderColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.22)'
  },
  {
    dockId: 'ZONE-05',
    zoneNumber: 5,
    dockName: '5号码头',
    maxCapacity: 1,
    currentCount: 1,
    top: '69%',
    left: '68%',
    borderColor: '#00e676',
    glowColor: 'rgba(0, 230, 118, 0.22)'
  },
  {
    dockId: 'ZONE-06',
    zoneNumber: 6,
    dockName: '6号船台（平船台）',
    maxCapacity: 3,
    currentCount: 1,
    top: '82%',
    left: '68%',
    borderColor: '#f4511e',
    glowColor: 'rgba(244, 81, 30, 0.22)'
  }
];

// 6个区域下的在建造船项目与港作船只数据 (去掉了区域和码头信息)
export const IN_CONSTRUCTION_SHIP_PARKINGS = [
  {
    projectId: 'PRJ-2026-LNG01',
    name: '17.4万m³ 薄膜型大型LNG船',
    zoneNumber: 1,
    phase: '合拢焊接',
    progress: 45,
    badgeColor: '#00d2ff',
    workers: 186
  },
  {
    projectId: 'PRJ-2026-PCTC05',
    name: '17.5万吨 PCTC双燃料汽车船',
    zoneNumber: 2,
    phase: '舾装系统调试',
    progress: 72,
    badgeColor: '#ffb300',
    workers: 115
  },
  {
    projectId: 'PRJ-2026-BULK04',
    name: '8.2万吨 卡姆萨尔型散货船',
    zoneNumber: 2,
    phase: '分段搭载',
    progress: 30,
    badgeColor: '#00e676',
    workers: 76
  },
  {
    projectId: 'PRJ-2026-CTN02',
    name: '24000TEU 超大型集装箱船',
    zoneNumber: 3,
    phase: '系泊试验',
    progress: 85,
    badgeColor: '#38bdf8',
    workers: 142
  },
  {
    projectId: 'PRJ-2026-WIND06',
    name: '1500吨 自升式风电安装船',
    zoneNumber: 4,
    phase: '桩腿合拢搭设',
    progress: 52,
    badgeColor: '#a855f7',
    workers: 88
  },
  {
    projectId: 'TUG-2026-01',
    name: '5000马力 港作拖轮 (海工拖01)',
    zoneNumber: 5,
    phase: '驻泊护航巡备',
    progress: 100,
    badgeColor: '#00e676',
    workers: 12,
    isTugboat: true
  },
  {
    projectId: 'PRJ-2026-VLCC03',
    name: '30万吨级 超大型原油船(VLCC)',
    zoneNumber: 6,
    phase: '密闭涂装',
    progress: 60,
    badgeColor: '#f4511e',
    workers: 98
  }
];

// 厂区视图的数据 (当日累计班组分布)
const yardDistributionData = [
  { name: '安全环保部', value: 48, max: 350 },
  { name: '搭载部', value: 286, max: 350 },
  { name: '船装部', value: 165, max: 350 },
  { name: '机电部', value: 142, max: 350 },
  { name: '船体电焊班组', value: 320, max: 350 },
  { name: '喷涂班组', value: 118, max: 350 },
  { name: '船体装配班组', value: 210, max: 350 },
  { name: '涂装部', value: 132, max: 350 },
  { name: '船体打磨班组', value: 95, max: 350 },
];

const yardTypeData = [
  { name: '管理人员', value: 12.3, count: 158, color: '#00b4d8' },
  { name: '技术人员', value: 28.7, count: 368, color: '#00d26a' },
  { name: '作业人员', value: 45.6, count: 586, color: '#ffc107' },
  { name: '外包人员', value: 13.4, count: 172, color: '#ff7849' },
];

// 近7日告警趋势数据 (展示人员违规与环境气体事件合计数趋势)
const yardAlarmTrendData = [
  { day: '08-29', 人员告警: 6, 环境告警: 4, 告警总数: 10 },
  { day: '08-30', 人员告警: 9, 环境告警: 5, 告警总数: 14 },
  { day: '08-31', 人员告警: 4, 环境告警: 3, 告警总数: 7 },
  { day: '09-01', 人员告警: 11, 环境告警: 7, 告警总数: 18 },
  { day: '09-02', 人员告警: 8, 环境告警: 4, 告警总数: 12 },
  { day: '09-03', 人员告警: 7, 环境告警: 5, 告警总数: 12 },
  { day: '09-04', 人员告警: 5, 环境告警: 3, 告警总数: 8 },
];

const projectAlarmTrendMap: Record<string, { day: string; 人员告警: number; 环境告警: number; 告警总数: number }[]> = {
  'PRJ-2026-LNG01': [
    { day: '08-29', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '08-30', 人员告警: 4, 环境告警: 2, 告警总数: 6 },
    { day: '08-31', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
    { day: '09-01', 人员告警: 5, 环境告警: 3, 告警总数: 8 },
    { day: '09-02', 人员告警: 3, 环境告警: 2, 告警总数: 5 },
    { day: '09-03', 人员告警: 4, 环境告警: 1, 告警总数: 5 },
    { day: '09-04', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
  ],
  'PRJ-2026-BOX02': [
    { day: '08-29', 人员告警: 3, 环境告警: 2, 告警总数: 5 },
    { day: '08-30', 人员告警: 5, 环境告警: 3, 告警总数: 8 },
    { day: '08-31', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '09-01', 人员告警: 6, 环境告警: 4, 告警总数: 10 },
    { day: '09-02', 人员告警: 4, 环境告警: 2, 告警总数: 6 },
    { day: '09-03', 人员告警: 3, 环境告警: 3, 告警总数: 6 },
    { day: '09-04', 人员告警: 3, 环境告警: 1, 告警总数: 4 },
  ],
  'PRJ-2026-TANK03': [
    { day: '08-29', 人员告警: 1, 环境告警: 2, 告警总数: 3 },
    { day: '08-30', 人员告警: 3, 环境告警: 1, 告警总数: 4 },
    { day: '08-31', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '09-01', 人员告警: 4, 环境告警: 3, 告警总数: 7 },
    { day: '09-02', 人员告警: 2, 环境告警: 2, 告警总数: 4 },
    { day: '09-03', 人员告警: 3, 环境告警: 1, 告警总数: 4 },
    { day: '09-04', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
  ],
  'PRJ-2026-BULK04': [
    { day: '08-29', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '08-30', 人员告警: 3, 环境告警: 2, 告警总数: 5 },
    { day: '08-31', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
    { day: '09-01', 人员告警: 4, 环境告警: 2, 告警总数: 6 },
    { day: '09-02', 人员告警: 3, 环境告警: 1, 告警总数: 4 },
    { day: '09-03', 人员告警: 2, 环境告警: 2, 告警总数: 4 },
    { day: '09-04', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
  ],
  'PRJ-2026-CAR05': [
    { day: '08-29', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
    { day: '08-30', 人员告警: 2, 环境告警: 2, 告警总数: 4 },
    { day: '08-31', 人员告警: 1, 环境告警: 0, 告警总数: 1 },
    { day: '09-01', 人员告警: 3, 环境告警: 2, 告警总数: 5 },
    { day: '09-02', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '09-03', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '09-04', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
  ],
  'PRJ-2026-WIND06': [
    { day: '08-29', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
    { day: '08-30', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '08-31', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
    { day: '09-01', 人员告警: 3, 环境告警: 2, 告警总数: 5 },
    { day: '09-02', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '09-03', 人员告警: 2, 环境告警: 1, 告警总数: 3 },
    { day: '09-04', 人员告警: 1, 环境告警: 1, 告警总数: 2 },
  ],
};

const yardAlerts: DashboardAlertItem[] = [
  { id: 'ALT-YD-01', time: '10:25', name: 'GD-02(硫化氢探头)', category: 'environment', categoryLabel: '环境气体', reason: 'H₂S硫化氢浓度超标(18.5ppm)', location: '519-1机舱底', dangerLevel: 'high', gasReading: 'H₂S: 18.5ppm (超标85%)', deviceLinked: 'GD-02 固定式探测仪', status: 'pending' },
  { id: 'ALT-YD-02', time: '10:18', name: 'GD-01(四合一气体仪)', category: 'environment', categoryLabel: '环境气体', reason: '密闭液货舱氧含量不足(17.8%缺氧)', location: '2#液货舱下层', dangerLevel: 'high', gasReading: 'O₂: 17.8% (下限19.5%)', deviceLinked: 'GD-01 便携式气体仪', status: 'pending' },
  { id: 'ALT-YD-03', time: '10:15', name: '张三 (组长)', role: '高级焊接技师', workerId: 'YD-W01', category: 'person', categoryLabel: '人员违规', reason: '未佩戴安全帽进入作业区', location: '2#船台搭载区', dangerLevel: 'medium', gasReading: 'AI视觉抓拍识别', deviceLinked: 'CAM-02 安全帽抓拍相机', status: 'handling' },
  { id: 'ALT-YD-04', time: '09:58', name: 'GD-03(VOC分析仪)', category: 'environment', categoryLabel: '环境气体', reason: '涂装车间VOC有机挥发物超标(86mg/m³)', location: '涂装车间3区', dangerLevel: 'high', gasReading: 'VOC: 86mg/m³ (限值50)', deviceLinked: 'GD-03 气体分析仪', status: 'pending' },
  { id: 'ALT-YD-05', time: '09:45', name: '李四 (装配工)', role: '装配钳工', workerId: 'YD-W04', category: 'person', categoryLabel: '人员违规', reason: '进入龙门吊大件吊装禁区', location: '1号码头吊运口', dangerLevel: 'high', gasReading: 'UWB越界 1.8m', deviceLinked: 'DEV-ALM-01 防碰报警器', status: 'handling' },
  { id: 'ALT-YD-06', time: '09:32', name: '王五 (打磨工)', role: '打磨技工', workerId: 'YD-W09', category: 'person', categoryLabel: '人员违规', reason: '受限空间作业静止超时(15min)', location: '机舱双层底', dangerLevel: 'high', gasReading: '静止 15分20秒 (防跌落昏迷)', deviceLinked: '防爆定位手环', status: 'resolved' },
  { id: 'ALT-YD-07', time: '09:20', name: 'FT-01(可燃气探头)', category: 'environment', categoryLabel: '环境气体', reason: '主甲板管架LEL可燃气达22%', location: '主甲板高压管路', dangerLevel: 'high', gasReading: 'LEL: 22% (临界报警)', deviceLinked: 'FT-01 探头联动声光', status: 'resolved' },
  { id: 'ALT-YD-08', time: '09:05', name: '赵六 (起重指挥)', role: '起重指挥工', workerId: 'YD-W15', category: 'person', categoryLabel: '人员违规', reason: '超出规定活动警戒范围', location: '总装车间东跨', dangerLevel: 'medium', gasReading: '越界 3.5m', deviceLinked: 'BS-01 (11号主基站)', status: 'resolved' },
  { id: 'ALT-YD-09', time: '08:50', name: '钱七 (油漆工)', role: '油漆防腐工', workerId: 'YD-W18', category: 'person', categoryLabel: '人员违规', reason: '未佩戴防爆定位手环进入油漆舱', location: '145-3油漆舱', dangerLevel: 'medium', gasReading: '定位手环离线脱落', deviceLinked: 'AL-01 防爆声光警报', status: 'resolved' },
  { id: 'ALT-YD-10', time: '08:35', name: '孙八 (电工)', role: '电气技工', workerId: 'YD-W22', category: 'person', categoryLabel: '人员违规', reason: '高压配电调试未设安全防护栏', location: '集控配电室', dangerLevel: 'medium', gasReading: 'AI工况识别违章', deviceLinked: 'CAM-01 智能摄像头', status: 'resolved' },
  { id: 'ALT-YD-11', time: '08:15', name: 'TH-04(温感探头)', category: 'environment', categoryLabel: '环境气体', reason: '合拢段动火温度异常过高(320℃)', location: '1#船台合拢口', dangerLevel: 'high', gasReading: 'Temp: 320℃ (动火无看火人)', deviceLinked: 'DEV-ALM-02 防撞报警器', status: 'resolved' },
];

const yardDeviceTypes = [
  { name: '主基站', value: 218, color: '#00d2ff' },
  { name: '气体探测器', value: 162, color: '#00e676' },
  { name: '声光报警器', value: 132, color: '#ff9800' },
];

const yardDeviceList = [
  { id: 'BS-01 (11号主基站)', type: '主基站', status: '在线', location: '制造部边跨路口', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
  { id: 'BS-02 (7号主基站)', type: '主基站', status: '在线', location: '2万吨船台尾段', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
  { id: 'BS-03 (5号主基站)', type: '主基站', status: '在线', location: '1号龙门吊立柱', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
  { id: 'BS-04 (12号主基站)', type: '主基站', status: '在线', location: '涂装车间3区入口', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
  { id: 'BS-05 (3号主基站)', type: '主基站', status: '在线', location: '分段搭载平台东', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
  { id: 'BS-06 (8号主基站)', type: '主基站', status: '离线', location: '机电仓库顶层', statusColor: 'text-[#ffb300]', dotColor: 'bg-[#ffb300]' },
  { id: 'BS-07 (2号主基站)', type: '主基站', status: '在线', location: '艏部合拢口高架', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' },
  { id: 'BS-08 (15号主基站)', type: '主基站', status: '在线', location: '4号浮动码头路口', statusColor: 'text-[#00e676]', dotColor: 'bg-[#00e676]' }
];

// 厂区全景图空间电子围栏多边形定义 (尺寸缩减为原来的一半 50%，保持中心位置与高精度贴合)
const YARD_ELECTRONIC_FENCES: SpatialElectronicFence[] = [
  // 1. 龙门吊作业区 (紫色霓虹发光多边形，紧凑贴合龙门吊主梁与分段搭载区)
  {
    id: 'FENCE-YARD-01',
    name: '龙门吊核心起重作业警戒区',
    code: 'EF-2026-001',
    scopeType: 'yard',
    type: 'crane',
    dangerLevel: 'high',
    points: '31.1,26.3 40,22.8 44.1,27.7 46.3,33.3 43.3,33.9 33.1,33.3 31.7,27.8',
    strokeColor: '#d946ef',
    fillColor: 'rgba(217, 70, 239, 0.28)',
    labelX: 38,
    labelY: 30,
    statusBadge: {
      x: 38,
      y: 20,
      title: '龙门吊G-01: 起重防碰警戒中',
      subText: '作业状态: 正常',
      statusColor: '#00e676'
    },
    details: {
      areaType: '大型起重重型作业警戒区',
      securityLevel: '一级严控警戒 (声光联动 + 防碰传感器)',
      allowedRoles: '起重指挥工、龙门吊司机、合拢焊工',
      maxCapacity: 50,
      currentOccupancy: 28
    },
    devices: [
      { id: 'DEV-BS-01', name: '龙门吊主梁中枢基站', type: '定位基站', status: 'online' },
      { id: 'DEV-ALM-01', name: '龙门吊吊运防碰声光报警器', type: '声光报警器', status: 'online' }
    ],
    todayViolations: 3
  },

  // 2. 钢材与预处理厂区 (暖金黄色霓虹发光多边形，紧凑贴合预处理下料切割区)
  {
    id: 'FENCE-YARD-02',
    name: '钢材下料与分段预处理区',
    code: 'EF-2026-002',
    scopeType: 'yard',
    type: 'assembly',
    dangerLevel: 'medium',
    points: '34,64 45.2,64.3 47.7,70 51,75.3 34.2,76.9 33.4,70.3',
    strokeColor: '#f59e0b',
    fillColor: 'rgba(245, 158, 11, 0.25)',
    labelX: 41,
    labelY: 71,
    statusBadge: {
      x: 41,
      y: 60,
      title: '预处理下料流水线',
      subText: '自动化切割开工率: 92%',
      statusColor: '#00e5ff'
    },
    details: {
      areaType: '钢材堆存与智能预处理车间',
      securityLevel: '二级管控区域 (红外+定位基站)',
      allowedRoles: '数控切割工、行车吊运工、质检员',
      maxCapacity: 80,
      currentOccupancy: 45
    },
    devices: [
      { id: 'DEV-BS-03', name: '预处理总厂区主基站', type: '定位基站', status: 'online' },
      { id: 'DEV-GAS-01', name: '钢材车间防爆气体监测仪', type: '气体检测仪', status: 'online' },
      { id: 'DEV-ALM-02', name: '钢材运输通道防撞报警器', type: '声光报警器', status: 'online' }
    ],
    todayViolations: 2
  },

  // 3. 3号码头舾装泊位 & S105轮 (青蓝色霓虹发光多边形，紧凑贴合右侧舾装船体泊位)
  {
    id: 'FENCE-YARD-03',
    name: '3号码头舾装泊位水域管制区',
    code: 'EF-2026-003',
    scopeType: 'yard',
    type: 'dock',
    dangerLevel: 'high',
    points: '74.3,28.9 80.1,26.4 82.6,36.8 76,40.6 73.5,34.6',
    strokeColor: '#06b6d4',
    fillColor: 'rgba(6, 182, 212, 0.26)',
    labelX: 77,
    labelY: 34,
    statusBadge: {
      x: 77,
      y: 22,
      title: 'S105轮: 设备维护完成 85%',
      subText: '作业状态: 正常',
      statusColor: '#00e676'
    },
    details: {
      areaType: '深水舾装码头及靠泊船体作业面',
      securityLevel: '特级防跌落/防溺水管控区',
      allowedRoles: '舾装管系工、电气调试工程师、登船检查员',
      maxCapacity: 60,
      currentOccupancy: 34
    },
    devices: [
      { id: 'DEV-BS-02', name: '3号码头枢纽主基站', type: '定位基站', status: 'online' },
      { id: 'DEV-BS-06', name: 'S105轮甲板舾装基站', type: '作业面基站', status: 'online' }
    ],
    todayViolations: 0
  },

  // 4. 1号船台分段合拢区 (翠绿色霓虹发光多边形，紧凑贴合左上方船台滑道搭载区)
  {
    id: 'FENCE-YARD-04',
    name: '1#船台分段合拢滑道作业区',
    code: 'EF-2026-004',
    scopeType: 'yard',
    type: 'hull',
    dangerLevel: 'medium',
    points: '10.2,8.5 17.3,8.5 18.9,14.3 12.3,14.8 10.2,12.9',
    strokeColor: '#10b981',
    fillColor: 'rgba(16, 185, 129, 0.24)',
    labelX: 14,
    labelY: 12,
    statusBadge: {
      x: 14,
      y: 6,
      title: '1#船台分段合拢区',
      subText: '精度偏差: ±2mm (优)',
      statusColor: '#10b981'
    },
    details: {
      areaType: '船体主干分段搭载合拢船台',
      securityLevel: '一级受限空间/高空防坠管控',
      allowedRoles: '船体装配工、合拢焊工、探伤工程师',
      maxCapacity: 40,
      currentOccupancy: 19
    },
    devices: [
      { id: 'DEV-BS-05', name: '1#船台合拢作业面基站', type: '作业面基站', status: 'online' },
      { id: 'DEV-GAS-02', name: '龙门吊合拢舱段气体仪', type: '气体检测仪', status: 'online' }
    ],
    todayViolations: 1
  }
];

// 单船/分段各项目的专属空间电子围栏定义 (尺寸缩减为原来的一半 50%)
const PROJECT_ELECTRONIC_FENCES: Record<string, SpatialElectronicFence[]> = {
  'PRJ-2026-LNG01': [
    {
      id: 'FENCE-LNG-01',
      name: '1#液货舱绝热合拢受限空间',
      code: 'EF-LNG-001',
      scopeType: 'project',
      projectId: 'PRJ-2026-LNG01',
      projectName: '17.4万m³ 薄膜型大型LNG船',
      dangerLevel: 'high',
      points: '20.5,35 29.5,35 31.5,48 19.5,48',
      strokeColor: '#06b6d4',
      fillColor: 'rgba(6, 182, 212, 0.26)',
      labelX: 25,
      labelY: 42,
      statusBadge: {
        x: 25,
        y: 28,
        title: '1#货舱绝热箱合拢',
        subText: '含氧量 20.9% 正常',
        statusColor: '#00e676'
      },
      details: {
        areaType: 'LNG船液货舱受限密闭空间',
        securityLevel: '特级密闭空间/有毒有害气体持续监控',
        allowedRoles: '绝热层焊接技师、装配钳工、安全员',
        maxCapacity: 30,
        currentOccupancy: 12
      },
      devices: [
        { id: 'LNG-GAS-01', name: '2#液货舱受限空间气体仪', type: '气体检测仪', status: 'online' },
        { id: 'LNG-BS-W01', name: '1#液货舱合拢作业面基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 2
    },
    {
      id: 'FENCE-LNG-02',
      name: '主甲板高压管路动火作业区',
      code: 'EF-LNG-002',
      scopeType: 'project',
      projectId: 'PRJ-2026-LNG01',
      projectName: '17.4万m³ 薄膜型大型LNG船',
      dangerLevel: 'high',
      points: '46,31 58,31 60,45 44,45',
      strokeColor: '#ef4444',
      fillColor: 'rgba(239, 68, 68, 0.25)',
      labelX: 52,
      labelY: 38,
      statusBadge: {
        x: 52,
        y: 24,
        title: '主甲板动火监控',
        subText: '专职看火人: 在岗',
        statusColor: '#00e676'
      },
      details: {
        areaType: '主甲板高压LNG管路与合拢动火区',
        securityLevel: '一级动火严格管控区 (双人专岗)',
        allowedRoles: '持动火证焊工、专职看火人、安全监督',
        maxCapacity: 25,
        currentOccupancy: 14
      },
      devices: [
        { id: 'LNG-ALM-01', name: '甲板吊装防碰声光报警器', type: '声光报警器', status: 'online' },
        { id: 'LNG-BS-M01', name: 'LNG船主甲板网关主基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 1
    }
  ],
  'PRJ-2026-CTN02': [
    {
      id: 'FENCE-CTN-01',
      name: '艏楼导轨架安装禁区',
      code: 'EF-CTN-001',
      scopeType: 'project',
      projectId: 'PRJ-2026-CTN02',
      projectName: '24000TEU 超大型集装箱船',
      dangerLevel: 'medium',
      points: '23,37 33,37 35,51 21.5,51',
      strokeColor: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.25)',
      labelX: 28,
      labelY: 44,
      statusBadge: {
        x: 28,
        y: 30,
        title: '导轨垂直度校正',
        subText: '偏差: ±1.2mm 达标',
        statusColor: '#00e676'
      },
      details: {
        areaType: '超大型集装箱导轨架起吊与垂直安装禁区',
        securityLevel: '二级落物防砸严控区',
        allowedRoles: '导轨装配钳工、起重指挥工、质检员',
        maxCapacity: 20,
        currentOccupancy: 8
      },
      devices: [
        { id: 'CTN-BS-W01', name: '10#箱位导轨作业面基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 0
    },
    {
      id: 'FENCE-CTN-02',
      name: '舷侧临水高空防坠警戒区',
      code: 'EF-CTN-002',
      scopeType: 'project',
      projectId: 'PRJ-2026-CTN02',
      projectName: '24000TEU 超大型集装箱船',
      dangerLevel: 'high',
      points: '51,36 68,36 66,49 49,49',
      strokeColor: '#00e5ff',
      fillColor: 'rgba(0, 229, 255, 0.24)',
      labelX: 58,
      labelY: 44,
      statusBadge: {
        x: 58,
        y: 28,
        title: '舷侧临水边缘防坠',
        subText: '安全绳挂扣率: 100%',
        statusColor: '#00e676'
      },
      details: {
        areaType: '高空舷侧与落水防溺高危管制区',
        securityLevel: '特级防坠落/防溺水联动报警',
        allowedRoles: '舾装调试工、电气工、安全巡检员',
        maxCapacity: 35,
        currentOccupancy: 18
      },
      devices: [
        { id: 'CTN-ALM-01', name: '艏艉系泊舷梯落水报警器', type: '声光报警器', status: 'online' },
        { id: 'CTN-BS-M01', name: '驾驶室顶甲板主基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 2
    }
  ],
  'PRJ-2026-VLCC03': [
    {
      id: 'FENCE-VLCC-01',
      name: '泵舱与货油舱受限空间',
      code: 'EF-VLCC-001',
      scopeType: 'project',
      projectId: 'PRJ-2026-VLCC03',
      projectName: '30万吨级 超大型原油船(VLCC)',
      dangerLevel: 'high',
      points: '39.5,33.5 54.5,33.5 56,48.5 38.5,48.5',
      strokeColor: '#ef4444',
      fillColor: 'rgba(239, 68, 68, 0.25)',
      labelX: 47,
      labelY: 41,
      statusBadge: {
        x: 47,
        y: 26,
        title: '货油泵舱封闭涂装',
        subText: 'VOC气体浓度: 达标',
        statusColor: '#00e676'
      },
      details: {
        areaType: '货油泵舱及双层底防腐涂装受限空间',
        securityLevel: '特级受限空间 (VOC挥发物与易燃气体监测)',
        allowedRoles: '货油管系工、防腐涂装工、安全员',
        maxCapacity: 25,
        currentOccupancy: 11
      },
      devices: [
        { id: 'VLCC-GAS-01', name: '货油泵舱防爆气体检测仪', type: '气体检测仪', status: 'online' },
        { id: 'VLCC-BS-W01', name: '1号隔舱防爆定位基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 1
    },
    {
      id: 'FENCE-VLCC-02',
      name: '主甲板货油总管高压试压区',
      code: 'EF-VLCC-002',
      scopeType: 'project',
      projectId: 'PRJ-2026-VLCC03',
      projectName: '30万吨级 超大型原油船(VLCC)',
      dangerLevel: 'medium',
      points: '69.5,34 81.5,34 80.5,46 68.5,46',
      strokeColor: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.25)',
      labelX: 75,
      labelY: 40,
      statusBadge: {
        x: 75,
        y: 26,
        title: '总管水压试验 2.5MPa',
        subText: '保压中: 无泄漏',
        statusColor: '#00e676'
      },
      details: {
        areaType: '主甲板超高压货油管系水压气密试验区',
        securityLevel: '二级高压禁入警戒',
        allowedRoles: '试压工程师、管工主管、验船师',
        maxCapacity: 15,
        currentOccupancy: 5
      },
      devices: [
        { id: 'VLCC-ALM-01', name: '货油管汇试压声光报警器', type: '声光报警器', status: 'online' },
        { id: 'VLCC-BS-M01', name: '货油控制中心主基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 0
    }
  ],
  'PRJ-2026-BULK04': [
    {
      id: 'FENCE-BULK-01',
      name: '船台大件总组吊装警戒',
      code: 'EF-BULK-001',
      scopeType: 'project',
      projectId: 'PRJ-2026-BULK04',
      projectName: '8.2万吨 卡姆萨尔型散货船',
      dangerLevel: 'high',
      points: '31,32.5 49,32.5 51,47.5 30,47.5',
      strokeColor: '#d946ef',
      fillColor: 'rgba(217, 70, 239, 0.28)',
      labelX: 40,
      labelY: 40,
      statusBadge: {
        x: 40,
        y: 24,
        title: '大舱总组分段吊装',
        subText: '警戒半径: 30米',
        statusColor: '#00e676'
      },
      details: {
        areaType: '船台总组分段整体吊装与精准对位区',
        securityLevel: '一级吊装重型警戒',
        allowedRoles: '船台铆焊工、吊装总指挥、校正工',
        maxCapacity: 30,
        currentOccupancy: 15
      },
      devices: [
        { id: 'BULK-BS-M01', name: '2号船台大件总组主基站', type: '定位基站', status: 'online' },
        { id: 'BULK-ALM-01', name: '船台大件吊装防碰报警器', type: '声光报警器', status: 'online' }
      ],
      todayViolations: 2
    },
    {
      id: 'FENCE-BULK-02',
      name: '双层底压载舱密闭作业区',
      code: 'EF-BULK-002',
      scopeType: 'project',
      projectId: 'PRJ-2026-BULK04',
      projectName: '8.2万吨 卡姆萨尔型散货船',
      dangerLevel: 'medium',
      points: '65.5,34.5 77.5,34.5 76.5,47.5 64.5,47.5',
      strokeColor: '#10b981',
      fillColor: 'rgba(16, 185, 129, 0.24)',
      labelX: 71,
      labelY: 41,
      statusBadge: {
        x: 71,
        y: 26,
        title: '双层底焊缝探伤',
        subText: 'X射线探伤中',
        statusColor: '#00e676'
      },
      details: {
        areaType: '散货船狭小双层底压载水舱作业区',
        securityLevel: '一级受限空间管控',
        allowedRoles: '探伤员、合拢焊工、安全员',
        maxCapacity: 18,
        currentOccupancy: 7
      },
      devices: [
        { id: 'BULK-GAS-01', name: '双层底压载舱气体检测仪', type: '气体检测仪', status: 'online' },
        { id: 'BULK-BS-W01', name: '1#大舱舷梯口作业面基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 0
    }
  ],
  'PRJ-2026-PCTC05': [
    {
      id: 'FENCE-PCTC-01',
      name: '艉部滚装跳板液压测试警戒区',
      code: 'EF-PCTC-001',
      scopeType: 'project',
      projectId: 'PRJ-2026-PCTC05',
      projectName: '17.5万吨 PCTC双燃料汽车运输船',
      dangerLevel: 'high',
      points: '33.5,35 52.5,35 54.5,49 31.5,49',
      strokeColor: '#f59e0b',
      fillColor: 'rgba(245, 158, 11, 0.25)',
      labelX: 43,
      labelY: 42,
      statusBadge: {
        x: 43,
        y: 26,
        title: '跳板收放测试',
        subText: '液压 21MPa 正常',
        statusColor: '#00e676'
      },
      details: {
        areaType: '汽车运输船艉部重型滚装跳板调试区',
        securityLevel: '一级机械联动防碾压/防坠警戒',
        allowedRoles: '滚装调试工、液压钳工、安全员',
        maxCapacity: 25,
        currentOccupancy: 10
      },
      devices: [
        { id: 'PCTC-ALM-01', name: '液压坡道声光警报器', type: '声光报警器', status: 'online' },
        { id: 'PCTC-BS-W01', name: '滚装跳板作业面基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 1
    }
  ],
  'PRJ-2026-WIND06': [
    {
      id: 'FENCE-WIND-01',
      name: '自升桩腿50m高空合拢警戒区',
      code: 'EF-WIND-001',
      scopeType: 'project',
      projectId: 'PRJ-2026-WIND06',
      projectName: '1500吨 自升式海上风电安装船',
      dangerLevel: 'high',
      points: '29,29.5 46.5,29.5 48,44.5 28,44.5',
      strokeColor: '#a855f7',
      fillColor: 'rgba(168, 85, 247, 0.26)',
      labelX: 38,
      labelY: 37,
      statusBadge: {
        x: 38,
        y: 22,
        title: '3#桩腿高空搭设',
        subText: '双钩绳索安全率 100%',
        statusColor: '#00e676'
      },
      details: {
        areaType: '自升式风电安装船高空桁架桩腿合拢区',
        securityLevel: '特级高空防坠落管制区',
        allowedRoles: '高空合拢焊工、重型起重指挥、安全监督',
        maxCapacity: 20,
        currentOccupancy: 8
      },
      devices: [
        { id: 'WIND-ALM-01', name: '1200T绕桩吊防碰报警器', type: '声光报警器', status: 'online' },
        { id: 'WIND-BS-W01', name: '桩腿高空作业面基站', type: '定位基站', status: 'online' }
      ],
      todayViolations: 2
    }
  ]
};

// 厂区全景图空间人员定位点位 (对应绿色圆形小人徽标，支持同一工位重叠人员独立列表)
export interface YardWorkerPoint {
  id: string;
  name: string;
  role: string;
  area: string;
  top: string;
  left: string;
  status: '在岗' | '告警' | '离线';
  avatarBg?: string;
  personId?: string; // 关联 mockPersonnel EMP-xxx
}

const YARD_SPATIAL_WORKERS: YardWorkerPoint[] = [
  // 1. 龙门吊作业区人员点位
  { id: 'W-01', name: '李强', role: '起重指挥', area: '龙门吊作业区', top: '19%', left: '12.5%', status: '在岗', avatarBg: 'bg-emerald-500', personId: 'EMP-003' },
  { id: 'W-02', name: '王伟', role: '龙门吊司机', area: '龙门吊作业区', top: '16.5%', left: '23%', status: '在岗', avatarBg: 'bg-blue-600', personId: 'EMP-001' },
  { id: 'W-03', name: '张三', role: '合拢焊工', area: '龙门吊作业区', top: '16.5%', left: '33%', status: '在岗', avatarBg: 'bg-cyan-600', personId: 'EMP-001' },
  // 龙门吊同一位置重叠聚焦人员 (聚焦 3 人)
  { id: 'W-04A', name: '赵六', role: '装配钳工', area: '龙门吊作业区', top: '38.5%', left: '31%', status: '在岗', avatarBg: 'bg-amber-500', personId: 'EMP-006' },
  { id: 'W-04B', name: '刘洋', role: '电焊工', area: '龙门吊作业区', top: '38.5%', left: '31%', status: '在岗', avatarBg: 'bg-indigo-600', personId: 'EMP-001' },
  { id: 'W-04C', name: '王鹏', role: '起重辅助工', area: '龙门吊作业区', top: '38.5%', left: '31%', status: '在岗', avatarBg: 'bg-teal-600', personId: 'EMP-003' },
  { id: 'W-05', name: '孙敏', role: '探伤工程师', area: '龙门吊作业区', top: '30.5%', left: '23%', status: '在岗', avatarBg: 'bg-teal-600', personId: 'EMP-002' },

  // 2. 钢材与预处理厂区人员点位
  { id: 'W-06', name: '陈建国', role: '数控切割工', area: '钢材预处理厂区', top: '58%', left: '22%', status: '在岗', avatarBg: 'bg-blue-500', personId: 'EMP-006' },
  // 钢材预处理同一点位重叠人员
  { id: 'W-07A', name: '周志强', role: '行车吊运工', area: '钢材预处理厂区', top: '58%', left: '38%', status: '在岗', avatarBg: 'bg-purple-600', personId: 'EMP-003' },
  { id: 'W-07B', name: '郑浩', role: '钢板质检员', area: '钢材预处理厂区', top: '58%', left: '38%', status: '在岗', avatarBg: 'bg-sky-600', personId: 'EMP-002' },
  { id: 'W-08', name: '吴凯', role: '流水线操作工', area: '钢材预处理厂区', top: '63%', left: '48%', status: '在岗', avatarBg: 'bg-emerald-600', personId: 'EMP-006' },
  { id: 'W-10', name: '黄海', role: '预处理喷砂工', area: '钢材预处理厂区', top: '82%', left: '45%', status: '在岗', avatarBg: 'bg-amber-600', personId: 'EMP-004' },
  { id: 'W-11', name: '周华', role: '物料转运工', area: '钢材预处理厂区', top: '74%', left: '60%', status: '在岗', avatarBg: 'bg-slate-600', personId: 'EMP-003' },

  // 3. S105轮及3号码头人员点位
  { id: 'W-12', name: '钱亮', role: '舾装管系工', area: 'S105轮舾装泊位', top: '27%', left: '72%', status: '在岗', avatarBg: 'bg-cyan-500', personId: 'EMP-005' },
  { id: 'W-13', name: '徐峰', role: '电气调试工', area: 'S105轮舾装泊位', top: '38%', left: '75%', status: '在岗', avatarBg: 'bg-blue-600', personId: 'EMP-005' },
  { id: 'W-14', name: '马涛', role: '船检工程师', area: 'S105轮舾装泊位', top: '45%', left: '79%', status: '在岗', avatarBg: 'bg-indigo-500', personId: 'EMP-002' },

  // 4. 1#船台分段区人员点位
  { id: 'W-15', name: '杨光', role: '船台装配工', area: '1#船台分段区', top: '12%', left: '8%', status: '在岗', avatarBg: 'bg-emerald-500', personId: 'EMP-006' },
  { id: 'W-16', name: '方舟', role: '结构焊工', area: '1#船台分段区', top: '22%', left: '16%', status: '在岗', avatarBg: 'bg-orange-600', personId: 'EMP-001' },
];

// 厂区全景图空间设备标定数据 (精准对应各建筑实物位置)
const YARD_SPATIAL_DEVICES: SpatialDevice[] = [
  // 1. 主基站 (广域高功率骨干节点)
  {
    id: 'DEV-BS-MAIN-01',
    name: '龙门吊主梁中枢基站',
    category: 'main_station',
    categoryLabel: '主基站',
    code: 'BS-M-01',
    location: '龙门吊立柱顶端与轨道中枢',
    top: '22%',
    left: '34%',
    status: 'online',
    coverageRadius: 100,
    coverageColor: '#00d2ff',
    battery: '外接供电 100%',
    frequency: '无线信道 CH2 (高精频段)',
    power: '28dBm (覆盖 R:150m)',
    valueText: '骨干同步中 · 信号优秀'
  },
  {
    id: 'DEV-BS-MAIN-02',
    name: '3号码头枢纽主基站',
    category: 'main_station',
    categoryLabel: '主基站',
    code: 'BS-M-02',
    location: '3号码头舾装指挥塔顶',
    top: '38%',
    left: '70%',
    status: 'online',
    coverageRadius: 110,
    coverageColor: '#00d2ff',
    battery: '外接供电 100%',
    frequency: '无线信道 CH5 (高精频段)',
    power: '30dBm (覆盖 R:160m)',
    valueText: '骨干同步中 · 信号优秀'
  },
  {
    id: 'DEV-BS-MAIN-03',
    name: '预处理总厂区主基站',
    category: 'main_station',
    categoryLabel: '主基站',
    code: 'BS-M-03',
    location: '钢材厂房屋脊中央天线塔',
    top: '64%',
    left: '36%',
    status: 'online',
    coverageRadius: 105,
    coverageColor: '#00d2ff',
    battery: '外接供电 100%',
    frequency: '无线信道 CH2 (高精频段)',
    power: '28dBm (覆盖 R:140m)',
    valueText: '骨干同步中 · 信号优秀'
  },

  // 2. 作业面基站 (归类为主基站)
  {
    id: 'DEV-BS-WORK-01',
    name: '数控下料切割工位主基站',
    category: 'main_station',
    categoryLabel: '主基站',
    code: 'BS-W-01',
    location: '智能下料流水线支架',
    top: '62%',
    left: '44%',
    status: 'online',
    coverageRadius: 75,
    coverageColor: '#00d2ff',
    battery: '94% (太阳能/锂电)',
    frequency: '无线信道 CH5 (高精频段)',
    power: '18dBm (覆盖 R:90m)',
    valueText: '挂载终端: 16台 · 测距精度 ±10cm'
  },
  {
    id: 'DEV-BS-WORK-02',
    name: '1#船台合拢作业主基站',
    category: 'main_station',
    categoryLabel: '主基站',
    code: 'BS-W-02',
    location: '1号码头船台外板支架',
    top: '16%',
    left: '18%',
    status: 'online',
    coverageRadius: 70,
    coverageColor: '#00d2ff',
    battery: '88% (锂电池)',
    frequency: '无线信道 CH2 (高精频段)',
    power: '18dBm (覆盖 R:85m)',
    valueText: '挂载终端: 22台 · 测距精度 ±10cm'
  },
  {
    id: 'DEV-BS-WORK-03',
    name: 'S105轮甲板舾装主基站',
    category: 'main_station',
    categoryLabel: '主基站',
    code: 'BS-W-03',
    location: 'S105轮舾装主甲板挂篮',
    top: '42%',
    left: '77%',
    status: 'online',
    coverageRadius: 65,
    coverageColor: '#00d2ff',
    battery: '96%',
    frequency: '无线信道 CH3 (高精频段)',
    power: '16dBm (覆盖 R:80m)',
    valueText: '挂载终端: 14台 · 测距精度 ±10cm'
  },

  // 3. 气体检测仪 (密闭与受限空间气体传感)
  {
    id: 'DEV-GAS-01',
    name: '钢材车间防爆气体探测器',
    category: 'gas_detector',
    categoryLabel: '气体探测器',
    code: 'GAS-01',
    location: '预处理下料切割下风口',
    top: '72%',
    left: '30%',
    status: 'online',
    coverageRadius: 55,
    coverageColor: '#00e676',
    battery: '98%',
    frequency: 'LoraWAN 470MHz',
    power: '检测半径 45m',
    valueText: '可燃气: 0%LEL | VOC: 正常 | 达标'
  },
  {
    id: 'DEV-GAS-02',
    name: '龙门吊合拢舱段气体探测器',
    category: 'gas_detector',
    categoryLabel: '气体探测器',
    code: 'GAS-02',
    location: '合拢分段底舱通风口',
    top: '32%',
    left: '26%',
    status: 'online',
    coverageRadius: 55,
    coverageColor: '#00e676',
    battery: '91%',
    frequency: 'LoraWAN 470MHz',
    power: '检测半径 45m',
    valueText: 'O₂: 20.9% | CO: 0ppm | 达标'
  },

  // 4. 声光报警器 (吊装高危防碰与超距预警)
  {
    id: 'DEV-ALM-01',
    name: '龙门吊吊运防碰声光报警器',
    category: 'alarm',
    categoryLabel: '声光报警器',
    code: 'ALM-01',
    location: '龙门吊主小车吊钩滑道',
    top: '17%',
    left: '46%',
    status: 'online',
    coverageRadius: 65,
    coverageColor: '#ff9800',
    battery: '100%',
    frequency: 'Zigbee 2.4GHz',
    power: '声光覆盖 80m',
    valueText: '吊装警戒中 · 状态正常'
  },
  {
    id: 'DEV-ALM-02',
    name: '钢材运输通道防撞警报器',
    category: 'alarm',
    categoryLabel: '声光报警器',
    code: 'ALM-02',
    location: '预处理主干道路口道闸',
    top: '52%',
    left: '52%',
    status: 'online',
    coverageRadius: 60,
    coverageColor: '#ff9800',
    battery: '100%',
    frequency: 'Zigbee 2.4GHz',
    power: '声光覆盖 70m',
    valueText: '车辆穿行声光联动正常'
  },

  // 5. 摄像头 (AI智慧安防与违规识别)
  {
    id: 'DEV-CAM-01',
    name: '香烟与烟火识别摄像头',
    category: 'camera',
    categoryLabel: '摄像头',
    code: 'CAM-01',
    location: '制造部边跨高危烟火监控点',
    top: '28%',
    left: '42%',
    status: 'online',
    coverageRadius: 55,
    coverageColor: '#a855f7',
    battery: '市电 100%',
    frequency: 'RTSP 4K/30fps',
    power: '视场角 110°',
    valueText: 'AI吸烟/明火检测使能 · 运行正常'
  },
  {
    id: 'DEV-CAM-02',
    name: '登船安全帽识别摄像头',
    category: 'camera',
    categoryLabel: '摄像头',
    code: 'CAM-02',
    location: '2万吨船台登船天梯口',
    top: '15%',
    left: '24%',
    status: 'online',
    coverageRadius: 50,
    coverageColor: '#a855f7',
    battery: '市电 100%',
    frequency: 'RTSP 1080P',
    power: '视场角 90°',
    valueText: '安全帽/反光衣穿戴识别正常'
  }
];

// 造船项目船模内部空间定位设备标定数据 (各造船项目具备差异化的设备数量、安装物理点位及监测参数)
const PROJECT_SPATIAL_DEVICES: Record<string, SpatialDevice[]> = {
  'PRJ-2026-LNG01': [
    {
      id: 'LNG-BS-M01',
      name: 'LNG船主甲板网关主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'LNG-M01',
      location: 'LNG主甲板中央控制室顶',
      top: '24%',
      left: '48%',
      status: 'online',
      coverageRadius: 130,
      coverageColor: '#00d2ff',
      battery: '100%',
      frequency: '无线信道 CH2 (高精频段)',
      power: '覆盖全船中段',
      valueText: '船载主网关 · 信号强'
    },
    {
      id: 'LNG-BS-W01',
      name: '1#液货舱合拢主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'LNG-W01',
      location: '1#绝热箱合拢施工位',
      top: '32%',
      left: '32%',
      status: 'online',
      coverageRadius: 85,
      coverageColor: '#00d2ff',
      battery: '92%',
      frequency: '无线信道 CH5',
      power: '覆盖 1#货舱全段',
      valueText: '人员精确定位中 ±10cm'
    },
    {
      id: 'LNG-BS-W02',
      name: '机舱管路主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'LNG-W02',
      location: '艉部主推进机舱',
      top: '38%',
      left: '68%',
      status: 'online',
      coverageRadius: 80,
      coverageColor: '#00d2ff',
      battery: '90%',
      frequency: '无线信道 CH5',
      power: '覆盖机舱及泵舱',
      valueText: '人员精确定位中'
    },
    {
      id: 'LNG-GAS-01',
      name: '2#液货舱受限空间气体探测器',
      category: 'gas_detector',
      categoryLabel: '气体探测器',
      code: 'LNG-G01',
      location: '2#密闭货舱底部通道',
      top: '46%',
      left: '36%',
      status: 'online',
      coverageRadius: 65,
      coverageColor: '#10b981',
      battery: '88%',
      frequency: 'LoraWAN 470MHz',
      power: '监测半径 50m',
      valueText: 'O₂: 20.9% | CO: 0ppm | 达标'
    },
    {
      id: 'LNG-ALM-01',
      name: '甲板吊装防碰声光报警器',
      category: 'alarm',
      categoryLabel: '声光报警器',
      code: 'LNG-A01',
      location: '主甲板吊运口',
      top: '22%',
      left: '35%',
      status: 'online',
      coverageRadius: 75,
      coverageColor: '#f59e0b',
      battery: '100%',
      frequency: 'Zigbee',
      power: '声光覆盖 80m',
      valueText: '龙门吊防碰预警中'
    },
    {
      id: 'LNG-BS-W03',
      name: '艏楼压载舱主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'LNG-W03',
      location: '艏楼压载水舱入孔',
      top: '30%',
      left: '20%',
      status: 'online',
      coverageRadius: 70,
      coverageColor: '#00d2ff',
      battery: '95%',
      frequency: '无线信道 CH3',
      power: '覆盖 艏楼隔离段',
      valueText: '通道人员出入计数'
    }
  ],
  'PRJ-2026-CTN02': [
    {
      id: 'CTN-BS-M01',
      name: '驾驶室顶甲板主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'CTN-M01',
      location: '集装箱船驾驶甲板上层',
      top: '25%',
      left: '72%',
      status: 'online',
      coverageRadius: 135,
      coverageColor: '#00d2ff',
      battery: '100%',
      frequency: '无线信道 CH1 (骨干网)',
      power: '覆盖生活楼及艉甲板',
      valueText: '主干网络正常 · 信号满格'
    },
    {
      id: 'CTN-BS-W01',
      name: '10#箱位导轨主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'CTN-W01',
      location: '10#贝位导轨架垂直面',
      top: '36%',
      left: '36%',
      status: 'online',
      coverageRadius: 85,
      coverageColor: '#00d2ff',
      battery: '94%',
      frequency: '无线信道 CH4',
      power: '覆盖 8#-12#箱位货舱',
      valueText: '导轨装配钳工高精度定位'
    },
    {
      id: 'CTN-BS-W02',
      name: '电气中控室主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'CTN-W02',
      location: '主配电板与电气集控室',
      top: '32%',
      left: '54%',
      status: 'online',
      coverageRadius: 75,
      coverageColor: '#00d2ff',
      battery: '96%',
      frequency: '无线信道 CH4',
      power: '覆盖 配电控制室',
      valueText: '带电调试受控监管'
    },
    {
      id: 'CTN-ALM-01',
      name: '艏艉系泊舷梯落水报警器',
      category: 'alarm',
      categoryLabel: '声光报警器',
      code: 'CTN-A01',
      location: '右舷系泊甲板临水通道',
      top: '48%',
      left: '19%',
      status: 'online',
      coverageRadius: 70,
      coverageColor: '#00e5ff',
      battery: '100%',
      frequency: 'Zigbee 2.4G',
      power: '临水光栅警戒 35m',
      valueText: '临水防坠落监测中'
    },
    {
      id: 'CTN-GAS-01',
      name: '主机舱通风气体探测器',
      category: 'gas_detector',
      categoryLabel: '气体探测器',
      code: 'CTN-G01',
      location: '主推进主机舱底排风道',
      top: '42%',
      left: '46%',
      status: 'online',
      coverageRadius: 60,
      coverageColor: '#10b981',
      battery: '90%',
      frequency: 'LoraWAN 470MHz',
      power: '监测半径 40m',
      valueText: '可燃气 0% | 氧气 21.0%'
    }
  ],
  'PRJ-2026-VLCC03': [
    {
      id: 'VLCC-BS-M01',
      name: '货油控制中心主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'VLCC-M01',
      location: '主甲板货油中控室',
      top: '28%',
      left: '62%',
      status: 'online',
      coverageRadius: 140,
      coverageColor: '#00d2ff',
      battery: '100%',
      frequency: '防爆本安信道 CH6',
      power: '覆盖中艉货油主甲板',
      valueText: '本安防爆主网关'
    },
    {
      id: 'VLCC-GAS-01',
      name: '货油泵舱防爆气体探测器',
      category: 'gas_detector',
      categoryLabel: '气体探测器',
      code: 'VLCC-G01',
      location: '货油泵舱封闭底层',
      top: '42%',
      left: '45%',
      status: 'online',
      coverageRadius: 70,
      coverageColor: '#10b981',
      battery: '85%',
      frequency: 'Lora 470MHz 防爆',
      power: '连续气体巡测 50m',
      valueText: 'VOC: 0.2ppm | 易燃气: 0%'
    },
    {
      id: 'VLCC-BS-W01',
      name: '1号隔舱防爆主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'VLCC-W01',
      location: '1号隔离空舱顶板',
      top: '34%',
      left: '32%',
      status: 'online',
      coverageRadius: 80,
      coverageColor: '#00d2ff',
      battery: '91%',
      frequency: '无线信道 CH6',
      power: '覆盖 1#-2#隔舱',
      valueText: '密闭隔舱人员在岗'
    },
    {
      id: 'VLCC-ALM-01',
      name: '货油管汇试压声光报警器',
      category: 'alarm',
      categoryLabel: '声光报警器',
      code: 'VLCC-A01',
      location: '甲板货油高压管汇端部',
      top: '25%',
      left: '76%',
      status: 'online',
      coverageRadius: 65,
      coverageColor: '#f59e0b',
      battery: '100%',
      frequency: 'Zigbee 本安',
      power: '高压试压警戒 50m',
      valueText: '试压保压警戒状态'
    },
    {
      id: 'VLCC-BS-W02',
      name: '艉部双层底主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'VLCC-W02',
      location: '艉部双层底压载通道',
      top: '48%',
      left: '26%',
      status: 'online',
      coverageRadius: 75,
      coverageColor: '#00d2ff',
      battery: '89%',
      frequency: '无线信道 CH6',
      power: '覆盖 双层底涂装区',
      valueText: '涂装施工人员核准中'
    }
  ],
  'PRJ-2026-BULK04': [
    {
      id: 'BULK-BS-M01',
      name: '2号船台大件总组主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'BULK-M01',
      location: '2号船台搭载总控支架',
      top: '22%',
      left: '42%',
      status: 'online',
      coverageRadius: 125,
      coverageColor: '#00d2ff',
      battery: '100%',
      frequency: '无线信道 CH3',
      power: '覆盖 散货船搭载滑道',
      valueText: '总搭载骨干网'
    },
    {
      id: 'BULK-BS-W01',
      name: '1#大舱舷梯口主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'BULK-W01',
      location: '1#大货舱舷梯口通道',
      top: '35%',
      left: '28%',
      status: 'online',
      coverageRadius: 80,
      coverageColor: '#00d2ff',
      battery: '93%',
      frequency: '无线信道 CH3',
      power: '覆盖 1#货舱内壁',
      valueText: '大舱结构焊接定位'
    },
    {
      id: 'BULK-GAS-01',
      name: '双层底压载舱气体探测器',
      category: 'gas_detector',
      categoryLabel: '气体探测器',
      code: 'BULK-G01',
      location: '散货船双层底压载舱',
      top: '46%',
      left: '64%',
      status: 'online',
      coverageRadius: 65,
      coverageColor: '#10b981',
      battery: '92%',
      frequency: 'LoraWAN 470MHz',
      power: '监测半径 45m',
      valueText: '含氧量 20.9% | 无有害气体'
    },
    {
      id: 'BULK-ALM-01',
      name: '船台大件吊装防碰报警器',
      category: 'alarm',
      categoryLabel: '声光报警器',
      code: 'BULK-A01',
      location: '总组吊装龙门吊主横梁',
      top: '20%',
      left: '52%',
      status: 'online',
      coverageRadius: 75,
      coverageColor: '#f59e0b',
      battery: '100%',
      frequency: 'Zigbee 2.4G',
      power: '吊运警戒 70m',
      valueText: '分段吊运对位预警'
    },
    {
      id: 'BULK-BS-W02',
      name: '艉部分段搭载主基站',
      category: 'main_station',
      categoryLabel: '主基站',
      code: 'BULK-W02',
      location: '艉部总组段合拢口',
      top: '38%',
      left: '74%',
      status: 'online',
      coverageRadius: 70,
      coverageColor: '#38bdf8',
      battery: '88%',
      frequency: '无线信道 CH3',
      power: '覆盖 艉段总组区',
      valueText: '探伤与合拢监控'
    }
  ]
};

interface DashboardProps {
  onExit?: () => void;
  onNavigate?: (view: ViewType, extra?: { personId?: string; autoPlay?: boolean; projectId?: string; viewScope?: 'yard' | 'project' }) => void;
  initialProjectId?: string;
  initialViewScope?: 'yard' | 'project';
}

export function Dashboard({ onExit, onNavigate, initialProjectId, initialViewScope }: DashboardProps) {
  // 核心视图切换状态：'yard' (厂区) | 'project' (造船项目)
  const [viewScope, setViewScope] = useState<'yard' | 'project'>(initialViewScope || (initialProjectId ? 'project' : 'yard'));
  
  // 选中的造船项目 (从项目管理列表中获取)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || 'PRJ-2026-LNG01');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // 监听外部传入的项目切换 (如项目总览看板跳转)
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
      setViewScope(initialViewScope || 'project');
    }
  }, [initialProjectId, initialViewScope]);

  // 选中的造船项目3D模型层次 (如底舱、中舱、甲板等轮船分层信息)
  const [selectedModelLevel, setSelectedModelLevel] = useState<ShipModelLevel>('all');
  const [showModelLevelMenu, setShowModelLevelMenu] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchKey, setSearchKey] = useState('');
  
  // 综合搜索类型定义 (仅保留人员与设备两种分类)
  type SearchTargetType = 'personnel' | 'device';
  const [searchTargetType, setSearchTargetType] = useState<SearchTargetType>('personnel');
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] = useState(false);
  const [selectedShipDetail, setSelectedShipDetail] = useState<any | null>(null);

  // 面板显隐控制状态 (默认展示，点击背景滑动隐藏)
  const [isPanelsVisible, setIsPanelsVisible] = useState(true);

  // 图层显隐与细分控制状态 (人员分布默认开启，设备分布默认关闭，船只分布默认关闭)
  const [showPersonnelLayer, setShowPersonnelLayer] = useState<boolean>(true);
  const [showDeviceLayer, setShowDeviceLayer] = useState<boolean>(false);
  const [showFenceLayer, setShowFenceLayer] = useState<boolean>(true);
  const [showShipDistributionLayer, setShowShipDistributionLayer] = useState<boolean>(false);
  const [selectedDeviceCategory, setSelectedDeviceCategory] = useState<DeviceCategoryType>('all');
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState<SpatialDevice | null>(null);
  const [selectedFenceDetail, setSelectedFenceDetail] = useState<SpatialElectronicFence | null>(null);
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<SpatialWorkerDetail | null>(null);
  const [selectedWorkerCluster, setSelectedWorkerCluster] = useState<{
    area: string;
    top: string;
    left: string;
    workers: YardWorkerPoint[];
  } | null>(null);
  const [activeAlarmModalData, setActiveAlarmModalData] = useState<ActiveAlarmData | null>(null);
  const [isAlarmListModalOpen, setIsAlarmListModalOpen] = useState(false);
  const [alarmCategoryFilter, setAlarmCategoryFilter] = useState<'all' | 'person' | 'environment'>('all');
  const [alarmNoticeToast, setAlarmNoticeToast] = useState<string | null>(null);

  // 轮播滚动 Refs
  const alertsScrollRef = useRef<HTMLDivElement>(null);
  const [isAlertsHovered, setIsAlertsHovered] = useState(false);

  // 获取当前选中的造船项目配置
  const currentProject = projectListConfig.find(p => p.id === selectedProjectId) || projectListConfig[0];

  // 时钟更新定时器
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. 实时预警列表平滑自动轮播
  useEffect(() => {
    if (isAlertsHovered) return;
    const interval = setInterval(() => {
      const el = alertsScrollRef.current;
      if (!el) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ top: 32, behavior: 'smooth' });
      }
    }, 2800);
    return () => clearInterval(interval);
  }, [isAlertsHovered]);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    const weeks = ['日', '一', '二', '三', '四', '五', '六'];
    const week = weeks[date.getDay()];
    return `${y}-${m}-${d} ${h}:${min}:${s} 星期${week}`;
  };

  // 点击背景图切换面板显隐 (优先保障位于背景图之上的具体组件与定位点位事件，若有打开的弹窗优先关闭弹窗)
  const handleBackgroundClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDeviceDetail || selectedFenceDetail || selectedWorkerDetail || selectedShipDetail || selectedWorkerCluster || activeAlarmModalData || isAlarmListModalOpen || isProjectDropdownOpen || isSearchTypeDropdownOpen) {
      setIsProjectDropdownOpen(false);
      setIsSearchTypeDropdownOpen(false);
      setSelectedDeviceDetail(null);
      setSelectedFenceDetail(null);
      setSelectedWorkerDetail(null);
      setSelectedShipDetail(null);
      setSelectedWorkerCluster(null);
      setActiveAlarmModalData(null);
      setIsAlarmListModalOpen(false);
      return;
    }
    setIsPanelsVisible(prev => !prev);
  };

  // 综合搜索并冒泡定位执行逻辑 (支持人员、设备、区域、船只)
  const handleSearch = () => {
    const kw = searchKey.trim().toLowerCase();
    if (!kw) {
      setAlarmNoticeToast('请输入搜索关键字');
      setTimeout(() => setAlarmNoticeToast(null), 3000);
      return;
    }

    // 关闭已有各类弹窗
    setIsSearchTypeDropdownOpen(false);
    setSelectedWorkerDetail(null);
    setSelectedDeviceDetail(null);
    setSelectedFenceDetail(null);
    setSelectedShipDetail(null);
    setSelectedWorkerCluster(null);

    if (searchTargetType === 'personnel') {
      // 1. 人员搜索：仅按姓名和工号条件匹配
      let foundWorker: any = null;
      let targetScope: 'yard' | 'project' = viewScope;
      let targetProj: any = null;

      // 厂区人员点位匹配 (姓名、工号/编号)
      const yardMatch = YARD_SPATIAL_WORKERS.find(w => 
        w.name.toLowerCase().includes(kw) || 
        (w.personId && w.personId.toLowerCase().includes(kw)) ||
        w.id.toLowerCase().includes(kw)
      );

      // 各造船项目人员点位匹配 (姓名、工号/编号)
      let projMatch: any = null;
      let projMatchOwner: any = null;
      for (const prj of projectListConfig) {
        const m = prj.markers.find(marker => 
          marker.name.toLowerCase().includes(kw) || 
          marker.id.toLowerCase().includes(kw) ||
          ((marker as any).personId && (marker as any).personId.toLowerCase().includes(kw))
        );
        if (m) {
          projMatch = m;
          projMatchOwner = prj;
          break;
        }
      }

      // 根据当前视图优先级确定目标
      if (viewScope === 'yard') {
        if (yardMatch) {
          foundWorker = yardMatch;
          targetScope = 'yard';
        } else if (projMatch) {
          foundWorker = projMatch;
          targetScope = 'project';
          targetProj = projMatchOwner;
        }
      } else {
        if (projMatch && projMatchOwner.id === selectedProjectId) {
          foundWorker = projMatch;
          targetScope = 'project';
          targetProj = projMatchOwner;
        } else if (projMatch) {
          foundWorker = projMatch;
          targetScope = 'project';
          targetProj = projMatchOwner;
        } else if (yardMatch) {
          foundWorker = yardMatch;
          targetScope = 'yard';
        }
      }

      if (foundWorker) {
        if (targetScope === 'project') {
          setViewScope('project');
          if (targetProj) setSelectedProjectId(targetProj.id);
          setShowPersonnelLayer(true);
          setSelectedWorkerDetail({
            id: foundWorker.id,
            name: foundWorker.name,
            role: foundWorker.role,
            company: '船体装配作业部',
            phone: '138-1234-5678',
            location: `${targetProj?.name || currentProject.name} - ${foundWorker.role}作业区`,
            baseStation: `${foundWorker.role}基站`,
            battery: '95%',
            signalPower: '-64 dBm',
            status: foundWorker.type === 'alarm' ? 'alarm' : 'online',
            top: foundWorker.top,
            left: foundWorker.left,
            workerRef: foundWorker
          });
          setAlarmNoticeToast(`已定位到人员：${foundWorker.name} (${foundWorker.role})`);
        } else {
          setViewScope('yard');
          setShowPersonnelLayer(true);
          setSelectedWorkerDetail({
            id: foundWorker.id,
            name: foundWorker.name,
            role: foundWorker.role,
            company: '造船工程一部',
            phone: '139-2345-6789',
            location: foundWorker.area,
            baseStation: '厂区主基站',
            battery: '98%',
            signalPower: '-62 dBm',
            status: foundWorker.status === '告警' ? 'alarm' : 'online',
            top: foundWorker.top,
            left: foundWorker.left,
            workerRef: foundWorker
          });
          setAlarmNoticeToast(`已定位到人员：${foundWorker.name} (${foundWorker.role})`);
        }
      } else {
        setAlarmNoticeToast(`未找到姓名或工号包含「${kw}」的人员`);
      }
    } else if (searchTargetType === 'device') {
      // 2. 设备搜索：按设备名称和编号匹配
      let matchedDev: SpatialDevice | null = null;
      let targetScope: 'yard' | 'project' = viewScope;
      let targetProj: any = null;

      const yardDevMatch = YARD_SPATIAL_DEVICES.find(d => 
        d.name.toLowerCase().includes(kw) || 
        d.code.toLowerCase().includes(kw) || 
        d.id.toLowerCase().includes(kw)
      );

      let projDevMatch: SpatialDevice | null = null;
      let projDevOwner: any = null;
      for (const prj of projectListConfig) {
        const devs = PROJECT_SPATIAL_DEVICES[prj.id] || [];
        const d = devs.find(item => 
          item.name.toLowerCase().includes(kw) || 
          item.code.toLowerCase().includes(kw) || 
          item.id.toLowerCase().includes(kw)
        );
        if (d) {
          projDevMatch = d;
          projDevOwner = prj;
          break;
        }
      }

      if (viewScope === 'yard') {
        if (yardDevMatch) {
          matchedDev = yardDevMatch;
          targetScope = 'yard';
        } else if (projDevMatch) {
          matchedDev = projDevMatch;
          targetScope = 'project';
          targetProj = projDevOwner;
        }
      } else {
        if (projDevMatch && projDevOwner.id === selectedProjectId) {
          matchedDev = projDevMatch;
          targetScope = 'project';
          targetProj = projDevOwner;
        } else if (projDevMatch) {
          matchedDev = projDevMatch;
          targetScope = 'project';
          targetProj = projDevOwner;
        } else if (yardDevMatch) {
          matchedDev = yardDevMatch;
          targetScope = 'yard';
        }
      }

      if (matchedDev) {
        if (targetScope === 'project') {
          setViewScope('project');
          if (targetProj) setSelectedProjectId(targetProj.id);
        } else {
          setViewScope('yard');
        }
        setShowDeviceLayer(true);
        setSelectedDeviceCategory('all');
        setSelectedDeviceDetail(matchedDev);
        setAlarmNoticeToast(`已定位到设备：${matchedDev.name} (${matchedDev.code})`);
      } else {
        setAlarmNoticeToast(`未找到名称或编号包含「${kw}」的设备`);
      }
    }
    setTimeout(() => setAlarmNoticeToast(null), 3500);
  };

  // 动态获取当前背景图 (使用最新上传的宽屏版素材，保持等比例与清晰度不拉伸)
  const currentBackgroundImage = viewScope === 'yard' ? '/assets/shipyard_wide_bg.jpg' : currentProject.bgImage;

  // 动态获取当前数据流
  const currentDistribution = viewScope === 'yard' ? yardDistributionData : currentProject.distributionData;
  const currentTypeData = viewScope === 'yard' ? yardTypeData : currentProject.typeData;
  const currentAlarmTrendData = viewScope === 'yard' 
    ? yardAlarmTrendData 
    : (projectAlarmTrendMap[currentProject.id] || yardAlarmTrendData);
  const currentAlerts = viewScope === 'yard' ? yardAlerts : currentProject.alerts;
  const currentDeviceSummary = viewScope === 'yard' ? { total: 512, online: 485, offline: 27, fault: 8 } : currentProject.deviceSummary;
  
  // 动态获取当前设备类型统计 (包含台数与占比)
  const currentDeviceTypes = useMemo(() => {
    if (viewScope === 'yard') {
      const total = 512;
      return yardDeviceTypes.map(d => ({
        ...d,
        percent: ((d.value / total) * 100).toFixed(1)
      }));
    }
    const total = currentDeviceSummary.total || 50;
    const bsCount = Math.round(total * 0.44);
    const gasCount = Math.round(total * 0.32);
    const alarmCount = Math.max(1, total - bsCount - gasCount);
    return [
      { name: '主基站', value: bsCount, color: '#00d2ff', percent: ((bsCount / total) * 100).toFixed(1) },
      { name: '气体探测器', value: gasCount, color: '#00e676', percent: ((gasCount / total) * 100).toFixed(1) },
      { name: '声光报警器', value: alarmCount, color: '#ff9800', percent: ((alarmCount / total) * 100).toFixed(1) },
    ];
  }, [viewScope, currentDeviceSummary.total]);

  const currentDeviceList = viewScope === 'yard' ? yardDeviceList : currentProject.deviceList;
  const currentTotal = viewScope === 'yard' ? 1284 : currentProject.totalPersonnel;
  const currentOnDuty = viewScope === 'yard' ? 1248 : currentProject.onDutyPersonnel;
  const currentOffDuty = viewScope === 'yard' ? 36 : currentProject.offDutyPersonnel;
  const currentAlarmCount = viewScope === 'yard' ? 8 : currentProject.alarmPersonnel;

  // 实时告警信息三种数据统计：今日告警数、已处理数、未处理数
  const todayAlertCount = currentAlerts.length;
  const handledAlertCount = useMemo(() => currentAlerts.filter(a => a.status === 'resolved').length, [currentAlerts]);
  const unhandledAlertCount = todayAlertCount - handledAlertCount;

  // 告警信息排序：
  // 1. 未处理（status !== 'resolved'）固定排在前面，已处理（status === 'resolved'）排在后面
  // 2. 未处理告警中，按严重程度从高到低（high > medium > low）固定排序
  // 3. 严重程度相同时，按时间点先后排序（最新时间排前面）
  // 4. 已处理告警内部，同样按时间倒序排在末尾
  const sortedCurrentAlerts = useMemo(() => {
    const dangerPriority: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    return [...currentAlerts].sort((a, b) => {
      const aResolved = a.status === 'resolved';
      const bResolved = b.status === 'resolved';

      // 未处理排前面，已处理排后面
      if (!aResolved && bResolved) return -1;
      if (aResolved && !bResolved) return 1;

      // 如果同为未处理：先比严重程度高低
      if (!aResolved && !bResolved) {
        const pA = dangerPriority[a.dangerLevel || 'medium'] || 2;
        const pB = dangerPriority[b.dangerLevel || 'medium'] || 2;
        if (pA !== pB) {
          return pB - pA;
        }
        // 严重程度相同，按时间降序（最新在上）
        return (b.time || '').localeCompare(a.time || '');
      }

      // 如果同为已处理：按时间倒序
      return (b.time || '').localeCompare(a.time || '');
    });
  }, [currentAlerts]);

  // 动态获取当前空间定位设备
  const allCurrentSpatialDevices = viewScope === 'yard' 
    ? YARD_SPATIAL_DEVICES 
    : (PROJECT_SPATIAL_DEVICES[currentProject.id] || YARD_SPATIAL_DEVICES);

  const activeFilteredDevices = allCurrentSpatialDevices.filter(dev => {
    if (selectedDeviceCategory === 'all') return true;
    return dev.category === selectedDeviceCategory;
  });

  // 动态获取当前电子围栏
  const currentFences = viewScope === 'yard' 
    ? YARD_ELECTRONIC_FENCES 
    : (PROJECT_ELECTRONIC_FENCES[currentProject.id] || []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#020b14] text-[#e2f1ff] overflow-hidden flex flex-col font-sans select-none"
    >
      
      {/* 1. 3D 全景/船模背景图 (明确设置为 z-0 基层，按页面同高设置尺寸宽屏显示) */}
      <div 
        onClick={handleBackgroundClick}
        className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center bg-[#020b14] pointer-events-auto transition-all duration-700 cursor-pointer"
        title={isPanelsVisible ? "点击背景空白处可收起所有数据面板" : "点击背景可展开数据面板"}
      >
        <img 
          key={currentBackgroundImage}
          src={currentBackgroundImage} 
          alt={viewScope === 'yard' ? '智慧船厂全景' : currentProject.name} 
          className="w-full h-full min-h-screen object-cover object-center select-none animate-fadeIn transition-all duration-700 pointer-events-none"
          style={{ imageRendering: '-webkit-optimize-contrast' }}
        />
        {/* 造船项目视角专属的科幻光栅与蓝图微光覆层 */}
        {viewScope === 'project' && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b14]/70 via-transparent to-[#020b14]/40 pointer-events-none"></div>
        )}
      </div>

      {/* ===================== 全画幅空间矢量标定图层 (全屏百分比对齐背景图) ===================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        
        {/* 🎯 造船项目视角下若选择了特定模型分层，显示在顶部视图切换栏下方的半透明科技风层级指示HUD (避免被视图切换遮挡，同时居于顶部中轴线正下方) */}
        {viewScope === 'project' && selectedModelLevel !== 'all' && (
          <div className="absolute top-[90px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-3 bg-[#061833]/92 border border-[#00e5ff]/80 px-4 py-1.5 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.4)] backdrop-blur-md animate-fadeIn select-none">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
              style={{ 
                backgroundColor: SHIP_MODEL_LEVELS.find(l => l.id === selectedModelLevel)?.color || '#00e5ff',
                boxShadow: `0 0 10px ${SHIP_MODEL_LEVELS.find(l => l.id === selectedModelLevel)?.color || '#00e5ff'}`
              }}
            />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#8ab4f8]">当前3D模型分层:</span>
              <span className="font-bold text-white">
                {SHIP_MODEL_LEVELS.find(l => l.id === selectedModelLevel)?.name}
              </span>
            </div>
            <div className="w-[1px] h-3 bg-[#1f4a7c]/80 mx-0.5" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedModelLevel('all');
              }}
              className="text-[11px] text-[#8ab4f8] hover:text-[#00e5ff] px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#00e5ff]/10 transition-colors cursor-pointer border border-[#1f4a7c]/60 hover:border-[#00e5ff]/60 flex items-center gap-1"
              title="切换为全船透视"
            >
              <span>恢复全船透视</span>
            </button>
          </div>
        )}

        {/* 1. 空间电子围栏多边形与工业作业状态浮标图层 (受 showFenceLayer 开关控制) */}
        {showFenceLayer && (
          <div className="absolute inset-0 pointer-events-none">
            {/* SVG 多边形矢量图层 (确保 SVG 本身透传点位，而 polygon 精准响应单击与发光悬停) */}
            <svg 
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none' }}
            >
              <defs>
                <filter id="fence-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {currentFences.map((fence) => (
                <g 
                  key={fence.id}
                  className="cursor-pointer group pointer-events-auto"
                  style={{ pointerEvents: 'all' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFenceDetail(prev => prev?.id === fence.id ? null : fence);
                  }}
                >
                  {/* 多边形区域 (半透明彩色填充 + 发光霓虹边框，仅保留区域展示与单击查看详情) */}
                  <polygon
                    points={fence.points}
                    fill={fence.fillColor}
                    stroke={fence.strokeColor}
                    strokeWidth="0.45"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter="url(#fence-glow-filter)"
                    className="transition-all duration-300 group-hover:opacity-95 group-hover:stroke-white cursor-pointer pointer-events-auto"
                    style={{ pointerEvents: 'all' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFenceDetail(prev => prev?.id === fence.id ? null : fence);
                    }}
                  >
                    <title>{`点击查看电子围栏详情`}</title>
                  </polygon>
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* 2. 设备图层与信号覆盖范围 (受 showDeviceLayer 开关控制) */}
        {showDeviceLayer && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-100">
            {activeFilteredDevices.map((dev) => (
              <div 
                key={dev.id}
                className="absolute pointer-events-auto transition-all z-20 group -translate-x-1/2 -translate-y-1/2 p-2"
                style={{ top: dev.top, left: dev.left }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceDetail(prev => prev?.id === dev.id ? null : dev);
                }}
              >
                {/* 📡 动态信号覆盖范围光圈 (带脉冲扫描波纹与范围标尺) */}
                <div 
                  className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-700"
                  style={{
                    width: `${dev.coverageRadius * 2}px`,
                    height: `${dev.coverageRadius * 2}px`,
                    top: '50%',
                    left: '50%',
                  }}
                >
                  {/* 背景半透明径向辐射色 */}
                  <div 
                    className="absolute inset-0 rounded-full border border-dashed opacity-60 transition-all duration-500 group-hover:opacity-95"
                    style={{
                      background: `radial-gradient(circle, ${dev.coverageColor}38 0%, ${dev.coverageColor}18 55%, transparent 75%)`,
                      borderColor: `${dev.coverageColor}99`,
                      boxShadow: `0 0 20px ${dev.coverageColor}33`,
                    }}
                  />

                  {/* 动态扩散脉冲动画波纹 (Radar Ping) */}
                  <div 
                    className="absolute inset-0 rounded-full border animate-ping opacity-35"
                    style={{ borderColor: dev.coverageColor, animationDuration: '3.5s' }}
                  />

                  {/* 信号覆盖范围半径标尺悬浮提示 */}
                  <div 
                    className="absolute bottom-1 right-2 text-[9px] font-mono px-1 rounded bg-[#030e1d]/80 text-[#8ab4f8] border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    覆盖 R:{dev.coverageRadius}m
                  </div>
                </div>

                {/* 📍 设备核心发光图标徽标 */}
                <div 
                  className="relative w-7 h-7 rounded-full border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-130"
                  style={{
                    backgroundColor: dev.coverageColor,
                    boxShadow: `0 0 16px ${dev.coverageColor}, inset 0 0 6px rgba(255,255,255,0.7)`
                  }}
                  title={`点击查看设备: ${dev.name} (${dev.categoryLabel})`}
                >
                  {dev.category === 'main_station' && <Radio className="w-3.5 h-3.5 text-white" />}
                  {dev.category === 'gas_detector' && <Wind className="w-3.5 h-3.5 text-white" />}
                  {dev.category === 'alarm' && <Volume2 className="w-3.5 h-3.5 text-white" />}
                  {dev.category === 'camera' && <Camera className="w-3.5 h-3.5 text-white" />}
                </div>

                {/* 设备简易悬浮标签 (悬停时显现) */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-30">
                  <div className="bg-[#061833]/95 border border-[#00d2ff]/80 text-[10px] text-white px-2 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]"></span>
                    <span>{dev.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. 人员定位点位 (受 showPersonnelLayer 开关控制) */}
        {showPersonnelLayer && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-100">
            {viewScope === 'yard' ? (
              // 厂区人员点位：根据坐标分组，若出现人员聚焦，点位椭圆带出尖图标上显示聚焦人数
              (() => {
                const groupedMap = new Map<string, YardWorkerPoint[]>();
                YARD_SPATIAL_WORKERS.forEach(w => {
                  const key = `${w.top}_${w.left}`;
                  if (!groupedMap.has(key)) {
                    groupedMap.set(key, []);
                  }
                  groupedMap.get(key)!.push(w);
                });

                return Array.from(groupedMap.entries()).map(([key, workers]) => {
                  const firstWorker = workers[0];
                  const isClustered = workers.length > 1;

                  return (
                    <div 
                      key={key}
                      className="absolute pointer-events-auto z-20 group/marker cursor-pointer -translate-x-1/2 -translate-y-full flex flex-col items-center"
                      style={{ top: firstWorker.top, left: firstWorker.left }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isClustered) {
                          // 点击人员聚焦聚合点：弹出聚焦人员列表
                          setSelectedWorkerDetail(null);
                          setSelectedWorkerCluster(prev => (prev?.top === firstWorker.top && prev?.left === firstWorker.left) ? null : {
                            area: firstWorker.area,
                            top: firstWorker.top,
                            left: firstWorker.left,
                            workers: workers
                          });
                        } else {
                          // 单个工人：直接显示详细信息气泡
                          setSelectedWorkerCluster(null);
                          const targetId = `W-2026-${firstWorker.id}`;
                          setSelectedWorkerDetail(prev => prev?.id === targetId ? null : {
                            id: targetId,
                            name: firstWorker.name,
                            role: firstWorker.role,
                            status: firstWorker.status === '在岗' ? 'online' : 'alarm',
                            location: firstWorker.area,
                            projectName: '厂区全景作业区',
                            time: formatDate(currentTime),
                            battery: '95%',
                            signalPower: '-64 dBm (优秀)',
                            phone: '138-1234-5678',
                            company: '江南造船总装一厂',
                            wearables: ['防爆UWB定位手环 #HB-092', '智能安全帽传感器'],
                            top: firstWorker.top,
                            left: firstWorker.left,
                            workerRef: firstWorker
                          });
                        }
                      }}
                    >
                      {/* 🎯 定位人员图标：点位椭圆带出尖设计 (聚焦显示聚焦人数，单人显示人员图标) */}
                      <div className="relative flex flex-col items-center transition-all duration-300 group-hover/marker:scale-125 select-none">
                        {/* 椭圆主体 */}
                        <div 
                          className={`flex items-center justify-center border-2 border-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                            isClustered
                              ? 'min-w-[34px] px-2 h-[25px] rounded-full bg-gradient-to-b from-[#00f0ff] via-[#0099ff] to-[#0055d4] text-white shadow-[0_0_14px_rgba(0,210,255,0.85)]'
                              : firstWorker.status === '告警'
                                ? 'w-7 h-[25px] rounded-full bg-gradient-to-b from-[#ff5252] via-[#e53935] to-[#b71c1c] text-white shadow-[0_0_14px_rgba(255,23,68,0.85)] animate-pulse'
                                : 'w-7 h-[25px] rounded-full bg-gradient-to-b from-[#00e676] via-[#00c853] to-[#007e33] text-white shadow-[0_0_12px_rgba(0,230,118,0.85)]'
                          }`}
                        >
                          {isClustered ? (
                            /* 聚焦情况显示聚焦的人数 */
                            <div className="flex items-center gap-0.5 leading-none">
                              <Users className="w-3 h-3 text-white shrink-0 mr-0.5" />
                              <span className="font-mono text-xs font-black text-white tracking-tight">{workers.length}</span>
                            </div>
                          ) : (
                            <User className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>

                        {/* 椭圆底部出尖设计 (倒三角平滑尖端向下指向地面坐标) */}
                        <div 
                          className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-[1px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] ${
                            isClustered
                              ? 'border-t-[#0055d4]'
                              : firstWorker.status === '告警'
                                ? 'border-t-[#b71c1c]'
                                : 'border-t-[#007e33]'
                          }`}
                        />

                        {/* 地面微光波纹/投影光斑 */}
                        <div className="relative -mt-[1px] flex items-center justify-center">
                          <div 
                            className={`w-2.5 h-1 rounded-full blur-[0.5px] ${
                              isClustered 
                                ? 'bg-[#00f0ff]/80 shadow-[0_0_8px_#00f0ff]' 
                                : firstWorker.status === '告警'
                                  ? 'bg-[#ff1744]/80 shadow-[0_0_8px_#ff1744]'
                                  : 'bg-[#00e676]/80 shadow-[0_0_8px_#00e676]'
                            }`} 
                          />
                          {isClustered && (
                            <div className="absolute w-4 h-1.5 rounded-full border border-[#00f0ff]/70 animate-ping opacity-60" />
                          )}
                        </div>
                      </div>

                      {/* 人员悬浮快速标签 */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-all duration-200 z-50">
                        <div className="bg-[#061833]/95 border border-[#00d2ff] text-[10px] text-white px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
                          {isClustered ? (
                            <div className="flex items-center gap-1 font-medium">
                              <span className="text-[#00e5ff] font-bold">人员聚焦 {workers.length} 人：</span>
                              <span className="text-white">{workers.map(w => w.name).join('、')}</span>
                              <span className="text-cyan-300/80">({firstWorker.area})</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 font-medium">
                              <span className="text-[#00e676] font-bold">{firstWorker.name}</span>
                              <span className="text-[#8ab4f8]">({firstWorker.role} · {firstWorker.area})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              (() => {
                const projGrouped = new Map<string, typeof currentProject.markers>();
                currentProject.markers.forEach(m => {
                  const key = `${m.top}_${m.left}`;
                  if (!projGrouped.has(key)) {
                    projGrouped.set(key, []);
                  }
                  projGrouped.get(key)!.push(m);
                });

                return Array.from(projGrouped.entries()).map(([key, pMarkers]) => {
                  const firstMarker = pMarkers[0];
                  const isClustered = pMarkers.length > 1;

                  return (
                    <div 
                      key={key}
                      className="absolute pointer-events-auto z-20 group/marker cursor-pointer -translate-x-1/2 -translate-y-full flex flex-col items-center"
                      style={{ top: firstMarker.top, left: firstMarker.left }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (firstMarker.type === 'alarm') {
                          setActiveAlarmModalData({
                            id: `ALERT-${firstMarker.id}`,
                            time: formatDate(currentTime).split(' ')[1],
                            name: firstMarker.name,
                            workerId: firstMarker.id,
                            role: firstMarker.role,
                            reason: `${firstMarker.role}作业面未佩戴防护且触及禁入警戒线`,
                            location: `${currentProject.name} - ${firstMarker.role}作业区`,
                            projectName: currentProject.name,
                            dangerLevel: 'high',
                            gasReading: '氧气 18.2% (偏低警告) | 可燃气 0%LEL',
                            deviceLinked: 'LNG-GAS-01 气体检测仪 & 龙门吊防碰声光报警器',
                            status: 'pending'
                          });
                        }
                        setSelectedWorkerDetail(prev => prev?.id === firstMarker.id ? null : {
                          id: firstMarker.id,
                          name: firstMarker.name,
                          role: firstMarker.role,
                          status: firstMarker.type,
                          location: `${currentProject.name} - ${firstMarker.role}作业面`,
                          projectName: currentProject.name,
                          time: formatDate(currentTime),
                          battery: firstMarker.type === 'offline' ? '12% (低电)' : '88%',
                          signalPower: '-68 dBm (良好)',
                          phone: '139-8765-4321',
                          company: `${currentProject.shipType}建造工程部`,
                          wearables: ['防爆定位手环', '气密作业感知徽章'],
                          top: firstMarker.top,
                          left: firstMarker.left
                        });
                      }}
                    >
                      {/* 🎯 定位人员图标：点位椭圆带出尖设计 */}
                      <div className="relative flex flex-col items-center transition-all duration-300 group-hover/marker:scale-125 select-none">
                        {/* 椭圆主体 */}
                        <div 
                          className={`flex items-center justify-center border-2 border-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                            isClustered
                              ? 'min-w-[34px] px-2 h-[25px] rounded-full bg-gradient-to-b from-[#00f0ff] via-[#0099ff] to-[#0055d4] text-white shadow-[0_0_14px_rgba(0,210,255,0.85)]'
                              : firstMarker.type === 'alarm'
                                ? 'w-7 h-[25px] rounded-full bg-gradient-to-b from-[#ff5252] via-[#e53935] to-[#b71c1c] text-white shadow-[0_0_14px_rgba(255,23,68,0.85)] animate-pulse'
                                : firstMarker.type === 'offline'
                                  ? 'w-7 h-[25px] rounded-full bg-gradient-to-b from-[#ffb300] via-[#fb8c00] to-[#e65100] text-white shadow-[0_0_10px_rgba(255,179,0,0.7)]'
                                  : 'w-7 h-[25px] rounded-full bg-gradient-to-b from-[#00e676] via-[#00c853] to-[#007e33] text-white shadow-[0_0_12px_rgba(0,230,118,0.85)]'
                          }`}
                        >
                          {isClustered ? (
                            <div className="flex items-center gap-0.5 leading-none">
                              <Users className="w-3 h-3 text-white shrink-0 mr-0.5" />
                              <span className="font-mono text-xs font-black text-white tracking-tight">{pMarkers.length}</span>
                            </div>
                          ) : (
                            <User className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>

                        {/* 椭圆底部出尖设计 */}
                        <div 
                          className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] -mt-[1px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] ${
                            isClustered
                              ? 'border-t-[#0055d4]'
                              : firstMarker.type === 'alarm'
                                ? 'border-t-[#b71c1c]'
                                : firstMarker.type === 'offline'
                                  ? 'border-t-[#e65100]'
                                  : 'border-t-[#007e33]'
                          }`}
                        />

                        {/* 地面微光 */}
                        <div className="relative -mt-[1px] flex items-center justify-center">
                          <div 
                            className={`w-2.5 h-1 rounded-full blur-[0.5px] ${
                              isClustered
                                ? 'bg-[#00f0ff]/80 shadow-[0_0_8px_#00f0ff]'
                                : firstMarker.type === 'alarm'
                                  ? 'bg-[#ff1744]/80 shadow-[0_0_8px_#ff1744]'
                                  : firstMarker.type === 'offline'
                                    ? 'bg-[#ffb300]/80 shadow-[0_0_8px_#ffb300]'
                                    : 'bg-[#00e676]/80 shadow-[0_0_8px_#00e676]'
                            }`} 
                          />
                          {isClustered && (
                            <div className="absolute w-4 h-1.5 rounded-full border border-[#00f0ff]/70 animate-ping opacity-60" />
                          )}
                        </div>
                      </div>

                      {/* 悬停信息浮层 */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-all duration-200 z-50">
                        <div className="bg-[#061833]/95 border border-[#00d2ff] text-[10px] text-white px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1 backdrop-blur-md">
                          {isClustered ? (
                            <span className="text-[#00e5ff] font-bold">人员聚焦 {pMarkers.length} 人：{pMarkers.map(m => m.name).join('、')}</span>
                          ) : (
                            <>
                              <span className="text-[#00e676] font-bold">{firstMarker.name}</span>
                              <span className="text-[#8ab4f8]">({firstMarker.role})</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        )}

        {/* 4. 6个停泊区域 (编号1~6) 精简图层 (仅在全景模式 viewScope === 'yard' 下显示) */}
        {viewScope === 'yard' && showShipDistributionLayer && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-100">
            {DOCK_ZONES_CONFIG.map((dock) => {
              const zoneShips = IN_CONSTRUCTION_SHIP_PARKINGS.filter((s) => s.zoneNumber === dock.zoneNumber);
              return (
                <div 
                  key={dock.dockId}
                  className="absolute pointer-events-auto flex flex-col items-start select-none transition-all duration-300"
                  style={{
                    top: dock.top,
                    left: dock.left
                  }}
                >
                  {/* 1) 码头精简主体条：只留编号、名称和当前占用情况 */}
                  <div 
                    className="rounded-full bg-[#061833]/95 border px-3 py-1 text-xs flex items-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.85)] backdrop-blur-md"
                    style={{
                      borderColor: dock.borderColor,
                      boxShadow: `0 0 14px ${dock.glowColor}`
                    }}
                  >
                    {/* 编号 */}
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[11px] text-white shrink-0 shadow"
                      style={{ backgroundColor: dock.borderColor }}
                    >
                      {dock.zoneNumber}
                    </span>

                    {/* 名称 */}
                    <span className="font-bold text-white text-xs">{dock.dockName}</span>

                    {/* 当前占用情况 */}
                    <span className="bg-[#00e676]/20 text-[#00e676] text-[10px] px-2 py-0.5 rounded-full border border-[#00e676]/40 font-bold font-mono">
                      {dock.currentCount}/{dock.maxCapacity}艘
                    </span>
                  </div>

                  {/* 2) 造船项目与码头信息条缩进跟进显示 */}
                  {zoneShips.length > 0 && (
                    <div className="ml-3.5 pl-2.5 border-l-2 border-dashed border-[#8ab4f8]/40 mt-1 flex flex-col gap-1.5">
                      {zoneShips.map((ship) => {
                        const isSelected = viewScope === 'project' && currentProject.id === ship.projectId;
                        return (
                          <div 
                            key={ship.projectId}
                            className={`bg-[#061833]/92 border hover:border-[#00d2ff] rounded-xl px-2.5 py-1.5 text-xs backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.7)] flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
                              isSelected ? 'ring-2 ring-[#00d2ff] bg-[#0c2e5a]' : ''
                            }`}
                            style={{ borderColor: isSelected ? '#00d2ff' : `${ship.badgeColor}88` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (ship.isTugboat) {
                                const targetProj = projectListConfig.find(p => p.id === 'PRJ-2026-PCTC05');
                                if (targetProj) {
                                  setSelectedProjectId(targetProj.id);
                                  setViewScope('project');
                                }
                                return;
                              }
                              const existProj = projectListConfig.find(p => p.id === ship.projectId);
                              if (existProj) {
                                setSelectedProjectId(ship.projectId);
                                setViewScope('project');
                              }
                            }}
                            title="点击查看项目详情"
                          >
                            <Ship className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                            <span className="font-bold text-white text-xs truncate max-w-[165px]">{ship.name}</span>
                            <span className="text-[#00e676] font-mono font-bold text-[10px] whitespace-nowrap">
                              {ship.progress}% ({ship.phase})
                            </span>
                            <span className="text-gray-300 font-mono text-[10px] whitespace-nowrap">
                              {ship.workers}人在岗
                            </span>
                            {isSelected && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 font-medium">
                                当前孪生
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 📋 4. 点击电子围栏弹出的详情卡片 (精简化：保留名称标题、所属项目、围栏类型、创建时间、关联布设设备) */}
        {selectedFenceDetail && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute top-24 left-1/2 -translate-x-1/2 w-84 bg-[#061833]/96 border backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.85)] z-50 animate-fadeIn pointer-events-auto"
            style={{ borderColor: selectedFenceDetail.strokeColor, boxShadow: `0 0 28px ${selectedFenceDetail.strokeColor}55` }}
          >
            {/* 标题栏 (名称标题) */}
            <div className="flex items-center justify-between border-b border-[#1f4a7c]/80 pb-2.5 mb-3">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ 
                    backgroundColor: `${selectedFenceDetail.strokeColor}22`, 
                    borderColor: selectedFenceDetail.strokeColor,
                    color: selectedFenceDetail.strokeColor
                  }}
                >
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white leading-tight truncate">{selectedFenceDetail.name}</h4>
                  <span className="text-[10px] text-[#8ab4f8] font-mono">{selectedFenceDetail.code}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedFenceDetail(null)}
                className="text-[#8ab4f8] hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer shrink-0 ml-1"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 精简详情主体 */}
            <div className="space-y-2 text-xs">
              {/* 所属项目 */}
              <div className="flex justify-between items-center bg-[#092244]/60 px-3 py-2 rounded-xl border border-[#19426f]/60">
                <span className="text-[#8ab4f8] shrink-0 mr-2">所属项目</span>
                <span className="font-semibold text-white truncate max-w-[180px]">
                  {selectedFenceDetail.scopeType === 'yard' ? '全域厂区综合项目' : (selectedFenceDetail.projectName || '造船项目专属区')}
                </span>
              </div>

              {/* 围栏类型 */}
              <div className="flex justify-between items-center bg-[#092244]/60 px-3 py-2 rounded-xl border border-[#19426f]/60">
                <span className="text-[#8ab4f8] shrink-0 mr-2">围栏类型</span>
                <span className="font-medium text-[#00e5ff] truncate max-w-[180px]">
                  {selectedFenceDetail.type === 'dock' ? '深水舾装码头水域围栏' :
                   selectedFenceDetail.type === 'crane' ? '起重吊装防碰警戒围栏' :
                   selectedFenceDetail.type === 'assembly' ? '钢材切割下料作业围栏' :
                   selectedFenceDetail.type === 'hull' ? '船台分段合拢警戒围栏' :
                   selectedFenceDetail.name.includes('受限') || selectedFenceDetail.name.includes('密闭') ? '受限空间安全管控围栏' :
                   selectedFenceDetail.name.includes('动火') ? '特级动火作业监控围栏' :
                   selectedFenceDetail.name.includes('高空') || selectedFenceDetail.name.includes('防坠') ? '高空防坠安全管控围栏' :
                   '生产安全立体电子围栏'}
                </span>
              </div>

              {/* 创建时间 */}
              <div className="flex justify-between items-center bg-[#092244]/60 px-3 py-2 rounded-xl border border-[#19426f]/60">
                <span className="text-[#8ab4f8] shrink-0 mr-2">创建时间</span>
                <span className="font-mono text-[#e2f1ff] text-[11px]">
                  2026-03-12 09:00:00
                </span>
              </div>

              {/* 电子围栏关联布设设备 (保留) */}
              {selectedFenceDetail.devices && selectedFenceDetail.devices.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#1f4a7c]/60">
                  <div className="flex items-center justify-between text-[11px] text-[#8ab4f8] mb-2">
                    <span className="font-medium">电子围栏关联布设设备 ({selectedFenceDetail.devices.length}):</span>
                    <span className="text-[#00e676] text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">在线运行中</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedFenceDetail.devices.map((dev) => (
                      <div key={dev.id} className="flex items-center justify-between bg-[#092244]/90 px-3 py-2 rounded-xl border border-[#19426f] text-xs">
                        <div className="flex items-center gap-1.5 truncate mr-2">
                          <Radio className="w-3 h-3 text-[#00e5ff] shrink-0" />
                          <span className="text-white font-mono truncate">{dev.name}</span>
                        </div>
                        <span className="text-[#00e5ff] text-[10px] shrink-0 px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30 font-medium">
                          {dev.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 📱 5. 点击空间设备弹出的冒泡参数卡片 (靠近元件位置显示，点击实现开关) */}
        {selectedDeviceDetail && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute z-50 animate-fadeIn pointer-events-auto transition-all duration-200"
            style={{
              top: selectedDeviceDetail.top,
              left: selectedDeviceDetail.left,
              transform: 'translate(-50%, -100%)',
              marginTop: '-18px'
            }}
          >
            <div className="w-80 bg-[#061833]/95 border border-[#00e5ff] backdrop-blur-xl rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(0,229,255,0.35)] relative text-[#e2f1ff]">
              {/* 向下指向的冒泡小小三角 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#061833] border-r border-b border-[#00e5ff] rotate-45"></div>

              <div className="flex items-center justify-between border-b border-[#1f4a7c]/80 pb-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
                    style={{ 
                      backgroundColor: `${selectedDeviceDetail.coverageColor}22`, 
                      borderColor: selectedDeviceDetail.coverageColor,
                      color: selectedDeviceDetail.coverageColor
                    }}
                  >
                    {selectedDeviceDetail.category === 'main_station' && <Radio className="w-4 h-4" />}
                    {selectedDeviceDetail.category === 'gas_detector' && <Wind className="w-4 h-4" />}
                    {selectedDeviceDetail.category === 'alarm' && <Volume2 className="w-4 h-4" />}
                    {selectedDeviceDetail.category === 'camera' && <Camera className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white leading-none truncate">{selectedDeviceDetail.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/40 flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse"></span>
                        在线
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8ab4f8] font-mono block mt-0.5">{selectedDeviceDetail.code} · {selectedDeviceDetail.categoryLabel}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDeviceDetail(null)}
                  className="text-[#8ab4f8] hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer shrink-0 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8]">安装物理位置:</span>
                  <span className="text-white font-medium truncate max-w-[170px]">{selectedDeviceDetail.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8]">覆盖指标:</span>
                  <span className="font-mono text-[#00e5ff] font-bold">{selectedDeviceDetail.power || `R: ${selectedDeviceDetail.coverageRadius}m 范围`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8]">电池/供电:</span>
                  <span className="font-mono text-[#00e676]">{selectedDeviceDetail.battery}</span>
                </div>
                {selectedDeviceDetail.valueText && (
                  <div className="mt-2 pt-1.5 border-t border-[#1f4a7c]/60 bg-[#092244]/70 p-2 rounded-lg">
                    <div className="text-[10px] text-[#8ab4f8]">实时监测/负载信息:</div>
                    <div className="text-xs font-mono font-bold text-white mt-0.5">{selectedDeviceDetail.valueText}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 👤 6. 点击人员头像弹出的冒泡定位卡片 (靠近元件位置显示，无蒙层，点击实现开关) */}
        {selectedWorkerDetail && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute z-50 animate-fadeIn pointer-events-auto transition-all duration-200 select-none"
            style={{
              top: selectedWorkerDetail.top || '40%',
              left: selectedWorkerDetail.left || '50%',
              transform: 'translate(-50%, -100%)',
              marginTop: '-36px'
            }}
          >
            <div className="w-80 bg-[#061833]/95 border-2 border-[#00e676] rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(0,230,118,0.35)] backdrop-blur-xl relative text-[#e2f1ff]">
              {/* 向下指向的冒泡小三角 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#061833] border-r border-b border-[#00e676] rotate-45"></div>

              {/* 标题栏 */}
              <div className="flex items-center justify-between border-b border-[#1f4a7c] pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00e676]/20 border border-[#00e676] flex items-center justify-center text-[#00e676] shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none flex items-center gap-1.5">
                      <span>{selectedWorkerDetail.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                        selectedWorkerDetail.status === 'alarm' || selectedWorkerDetail.status === '告警'
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {selectedWorkerDetail.status === 'alarm' || selectedWorkerDetail.status === '告警' ? '🔴 告警' : '🟢 在岗'}
                      </span>
                    </h3>
                    <p className="text-[10px] text-[#8ab4f8] mt-0.5 font-mono">
                      工号: {selectedWorkerDetail.id} · {selectedWorkerDetail.role}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedWorkerDetail(null)}
                  className="text-[#8ab4f8] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 内容 */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8]">班组组织:</span>
                  <span className="text-white font-medium">{selectedWorkerDetail.company || '造船施工一部'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8]">联系电话:</span>
                  <span className="text-white font-mono">{selectedWorkerDetail.phone || '138-1234-5678'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                    当前位置:
                  </span>
                  <span className="font-bold text-[#00e5ff] truncate max-w-[170px]">{selectedWorkerDetail.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8ab4f8]">关联基站:</span>
                  <span className="text-white font-mono text-[10px]">{selectedWorkerDetail.baseStation || `${selectedWorkerDetail.location.split(' ')[0] || '厂区'}主基站`}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#1f4a7c]/60 text-[10px]">
                  <span className="text-[#8ab4f8]">终端电量: <strong className="text-[#00e676] font-mono">{selectedWorkerDetail.battery || '95%'}</strong></span>
                  <span className="text-[#8ab4f8] flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-[#00e5ff]" />
                    <strong className="text-[#00e5ff] font-mono">{selectedWorkerDetail.signalPower || '-64 dBm'}</strong>
                  </span>
                </div>
              </div>

              {/* 轨迹回放 */}
              <div className="mt-2.5 pt-2 border-t border-[#1f4a7c]">
                <button
                  onClick={() => {
                    const personId = selectedWorkerDetail.workerRef?.personId || 'EMP-001';
                    if (onNavigate) {
                      onNavigate('personnel', { personId, autoPlay: true });
                    } else {
                      setAlarmNoticeToast(`已调取【${selectedWorkerDetail.name}】今日作业行动轨迹`);
                      setTimeout(() => setAlarmNoticeToast(null), 3000);
                    }
                  }}
                  className="w-full py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400 text-xs font-bold text-[#00e5ff] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                >
                  <Crosshair className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>查看轨迹回放</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 👥 7. 点击重叠人员聚焦位弹出的重叠人员列表浮窗 */}
        {selectedWorkerCluster && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute z-50 animate-fadeIn pointer-events-auto transition-all duration-200 select-none"
            style={{
              top: selectedWorkerCluster.top || '40%',
              left: selectedWorkerCluster.left || '50%',
              transform: 'translate(-50%, -100%)',
              marginTop: '-36px'
            }}
          >
            <div className="w-88 bg-[#061833]/95 border-2 border-cyan-400 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(0,210,255,0.35)] backdrop-blur-xl relative text-[#e2f1ff]">
              {/* 向下指向的冒泡小三角 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#061833] border-r border-b border-cyan-400 rotate-45"></div>

              {/* 标题栏 */}
              <div className="flex items-center justify-between border-b border-[#1f4a7c] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none flex items-center gap-1.5">
                      <span>同位聚焦人员列表</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.2 rounded-full font-mono font-bold">
                        {selectedWorkerCluster.workers.length} 人
                      </span>
                    </h3>
                    <p className="text-[10px] text-cyan-300/80 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{selectedWorkerCluster.area}</span>
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedWorkerCluster(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 重叠人员列表卡片 */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedWorkerCluster.workers.map((worker) => (
                  <div 
                    key={worker.id}
                    className="p-2.5 rounded-xl bg-[#0a2347]/70 border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#0e2f5e]/90 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* 头像 */}
                      <div className={`w-8 h-8 rounded-full ${worker.avatarBg || 'bg-blue-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/40 shadow-sm`}>
                        {worker.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">{worker.name}</span>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                            {worker.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          状态: <span className="text-emerald-400 font-semibold">{worker.status}</span> · 工号: {worker.id}
                        </p>
                      </div>
                    </div>

                    {/* 点击查看轨迹跳转按钮 */}
                    <button
                      onClick={() => {
                        const personId = worker.personId || 'EMP-001';
                        if (onNavigate) {
                          onNavigate('personnel', { personId, autoPlay: true });
                        } else {
                          setAlarmNoticeToast(`跳转查看【${worker.name}】定位轨迹`);
                          setTimeout(() => setAlarmNoticeToast(null), 3000);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-[11px] font-bold text-cyan-300 transition-all cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap hover:shadow-[0_0_10px_rgba(0,210,255,0.4)]"
                      title="点击跳转到人员定位页面并自动播放历史轨迹"
                    >
                      <Crosshair className="w-3 h-3 text-cyan-300" />
                      <span>查看轨迹</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 🚢 8. 搜索船只或选中船只弹出的冒泡定位详情卡片 */}
        {selectedShipDetail && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute z-50 animate-fadeIn pointer-events-auto transition-all duration-200 select-none"
            style={{
              top: selectedShipDetail.top || '38%',
              left: selectedShipDetail.left || '50%',
              transform: 'translate(-50%, -100%)',
              marginTop: '-18px'
            }}
          >
            <div className="w-80 bg-[#061833]/95 border border-[#00e5ff] backdrop-blur-xl rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(0,229,255,0.35)] relative text-[#e2f1ff]">
              {/* 向下指向的冒泡小三角 */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#061833] border-r border-b border-[#00e5ff] rotate-45"></div>

              {/* 标题栏 */}
              <div className="flex items-center justify-between border-b border-[#1f4a7c]/80 pb-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/20 border border-[#00e5ff] flex items-center justify-center text-[#00e5ff] shrink-0">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white leading-none truncate">{selectedShipDetail.name}</h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/40 flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse"></span>
                        在建
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8ab4f8] font-mono block mt-0.5">
                      {selectedShipDetail.shipType} · {selectedShipDetail.hullNumber || selectedShipDetail.id}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedShipDetail(null)}
                  className="text-[#8ab4f8] hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer shrink-0 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 船只建造与状态概览 */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center bg-[#092244]/70 px-2.5 py-1.5 rounded-lg border border-[#19426f]/60">
                  <span className="text-[#8ab4f8]">建造阶段 / 进度:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#00e676] font-bold">{selectedShipDetail.phase}</span>
                    <span className="text-[#00e5ff] font-mono font-bold">{selectedShipDetail.progress}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div className="bg-[#092244]/60 rounded-lg p-1.5 border border-[#19426f]/40 text-center">
                    <div className="text-[10px] text-[#8ab4f8]">在岗工人</div>
                    <div className="text-xs font-mono font-bold text-[#00d2ff] mt-0.5">{selectedShipDetail.totalPersonnel}人</div>
                  </div>
                  <div className="bg-[#092244]/60 rounded-lg p-1.5 border border-[#19426f]/40 text-center">
                    <div className="text-[10px] text-[#8ab4f8]">在线设备</div>
                    <div className="text-xs font-mono font-bold text-[#00e676] mt-0.5">{selectedShipDetail.deviceCount || 48}台</div>
                  </div>
                  <div className="bg-[#092244]/60 rounded-lg p-1.5 border border-[#19426f]/40 text-center">
                    <div className="text-[10px] text-[#8ab4f8]">告警事件</div>
                    <div className="text-xs font-mono font-bold text-[#ff1744] mt-0.5">{selectedShipDetail.alarmCount || 0}起</div>
                  </div>
                </div>

                {selectedShipDetail.client && (
                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-[#8ab4f8]">委托客户:</span>
                    <span className="text-white font-medium truncate max-w-[170px]">{selectedShipDetail.client}</span>
                  </div>
                )}
              </div>

              {/* 底部操作栏 */}
              <div className="mt-2.5 pt-2 border-t border-[#1f4a7c]/60 flex items-center justify-between">
                <span className="text-[10px] text-[#8ab4f8]">
                  {viewScope === 'yard' ? '全景锚定泊位' : '当前全船3D孪生'}
                </span>
                <button
                  onClick={() => {
                    setSelectedProjectId(selectedShipDetail.id);
                    setViewScope('project');
                    setSelectedShipDetail(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-[0_0_10px_rgba(0,210,255,0.4)] cursor-pointer"
                >
                  进入该船3D孪生
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🚨 告警明显提示窗 (触发告警时弹出) */}
        {activeAlarmModalData && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
          >
            <div className="w-full max-w-lg bg-[#0b121e]/95 border-2 border-red-500 rounded-3xl p-6 shadow-[0_0_60px_rgba(239,68,68,0.7)] relative backdrop-blur-2xl text-white overflow-hidden">
              
              {/* 警示斜纹装饰 */}
              <div className="absolute top-0 left-0 right-0 h-2 bg.repeating-linear-gradient(45deg,#ef4444,#ef4444_12px,#1e293b_12px,#1e293b_24px)]"></div>
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

              {/* 标题 */}
              <div className="flex items-start justify-between border-b border-red-500/40 pb-4 mb-4 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce shrink-0">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold tracking-wider text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                        紧急安全告警提示
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                        HIGH-RISK ALARM
                      </span>
                    </div>
                    <p className="text-xs text-red-300/80 mt-0.5">
                      感知网络检测到现场触发重大安防风险，请立即进行处置与对讲！
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveAlarmModalData(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 内容详情 */}
              <div className="space-y-3">
                
                {/* 告警事件 */}
                <div className="bg-red-950/40 border border-red-500/50 p-3.5 rounded-2xl">
                  <div className="text-xs text-red-300 font-medium">违规告警原因:</div>
                  <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                    <span className="text-amber-300">{activeAlarmModalData.reason}</span>
                  </div>
                </div>

                {/* 信息网格 */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#09182d] p-3 rounded-xl border border-[#173863]">
                    <div className="text-slate-400 text-[11px]">告警人员</div>
                    <div className="text-white font-bold text-sm mt-0.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#00d2ff]" />
                      <span>{activeAlarmModalData.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({activeAlarmModalData.role})</span>
                    </div>
                  </div>

                  <div className="bg-[#09182d] p-3 rounded-xl border border-[#173863]">
                    <div className="text-slate-400 text-[11px]">触发时间</div>
                    <div className="text-[#00e5ff] font-mono font-bold text-sm mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#00e5ff]" />
                      <span>{activeAlarmModalData.time}</span>
                    </div>
                  </div>

                  <div className="bg-[#09182d] p-3 rounded-xl border border-[#173863]">
                    <div className="text-slate-400 text-[11px]">触发位置舱段</div>
                    <div className="text-amber-200 font-bold mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{activeAlarmModalData.location}</span>
                    </div>
                  </div>

                  <div className="bg-[#09182d] p-3 rounded-xl border border-[#173863]">
                    <div className="text-slate-400 text-[11px]">所属造船项目</div>
                    <div className="text-white font-medium mt-0.5 truncate">
                      {activeAlarmModalData.projectName || currentProject.name}
                    </div>
                  </div>
                </div>

                {/* 传感器环境与设备 */}
                <div className="bg-[#09182d] p-3 rounded-xl border border-[#173863] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">气体监测传感器读数:</span>
                    <span className="font-mono font-bold text-red-400">
                      {activeAlarmModalData.gasReading || '氧气 18.2% (偏低警告) | 可燃气 0%'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">现场联动设备:</span>
                    <span className="text-[#00e5ff] font-medium">
                      {activeAlarmModalData.deviceLinked || 'LNG-GAS-01 气体检测仪 & 声光报警器'}
                    </span>
                  </div>
                </div>

              </div>

              {/* 处置按钮 */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-700/80">
                <button
                  onClick={() => {
                    setAlarmNoticeToast(`已对区域【${activeAlarmModalData.location}】发出高音广播避险对讲！`);
                    setTimeout(() => setAlarmNoticeToast(null), 3500);
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-xs font-bold text-amber-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>现场紧急广播</span>
                </button>

                <button
                  onClick={() => {
                    setAlarmNoticeToast(`告警【${activeAlarmModalData.reason}】已确认处置并归档解除。`);
                    setActiveAlarmModalData(null);
                    setTimeout(() => setAlarmNoticeToast(null), 3500);
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>确认并清除告警</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 📋 当天实时告警信息全量列表弹窗 (点击更多时打开) */}
        {isAlarmListModalOpen && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-fadeIn pointer-events-auto select-none"
          >
            <div className="w-full max-w-5xl h-[84vh] bg-[#071326]/98 border-2 border-red-500/70 rounded-3xl p-6 shadow-[0_0_70px_rgba(239,68,68,0.45)] relative backdrop-blur-2xl text-white flex flex-col overflow-hidden">
              
              {/* 顶部警示发光饰条 */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>

              {/* 1. 弹窗头部 */}
              <div className="flex items-start justify-between border-b border-[#1f4a7c]/80 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
                        <span>今日实时告警信息台账</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-500/60 text-red-300 font-mono font-bold">
                          {viewScope === 'yard' ? '厂区全域综合感知' : `${currentProject.name} 专属告警`}
                        </span>
                      </h2>
                    </div>
                    <p className="text-xs text-[#8ab4f8] mt-1">
                      全天候汇聚人员不安全行为违章、密闭受限空间有害气体异常超标、高危防坠/防撞联动告警数据
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAlarmListModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                  title="关闭弹窗"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 2. 统计卡片条 */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 mb-4 shrink-0">
                <div className="bg-[#0b2447]/80 border border-[#1f4a7c] p-2.5 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] text-[#8ab4f8]">今日告警总量</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">{todayAlertCount} <span className="text-xs text-[#8ab4f8] font-normal">起</span></div>
                </div>
                <div className="bg-red-950/40 border border-red-500/50 p-2.5 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] text-red-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span>未处理告警数</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-red-400 mt-1">
                    {unhandledAlertCount} <span className="text-xs text-red-300/80 font-normal">起</span>
                  </div>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/40 p-2.5 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>已处理告警数</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {handledAlertCount} <span className="text-xs text-emerald-300/80 font-normal">起</span>
                  </div>
                </div>
                <div className="bg-amber-950/30 border border-amber-500/40 p-2.5 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] text-amber-300">处置响应中</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {currentAlerts.filter(a => a.status === 'handling').length} <span className="text-xs text-amber-300/80 font-normal">起</span>
                  </div>
                </div>
                <div className="bg-[#0b2447]/80 border border-cyan-500/40 p-2.5 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] text-cyan-300 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>有害气体/环境</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {currentAlerts.filter(a => a.category === 'environment').length} <span className="text-xs text-cyan-300/80 font-normal">起</span>
                  </div>
                </div>
                <div className="bg-[#0b2447]/80 border border-indigo-500/40 p-2.5 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] text-indigo-300 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>人员违规行为</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                    {currentAlerts.filter(a => a.category === 'person').length} <span className="text-xs text-indigo-300/80 font-normal">起</span>
                  </div>
                </div>
              </div>

              {/* 3. 告警分类筛选器 */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0 bg-[#091b35]/70 p-2 rounded-2xl border border-[#1f4a7c]/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAlarmCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      alarmCategoryFilter === 'all'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        : 'bg-[#0f2d57]/60 text-[#8ab4f8] hover:text-white hover:bg-[#153a6e]'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>全部告警 ({currentAlerts.length})</span>
                  </button>

                  <button
                    onClick={() => setAlarmCategoryFilter('environment')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      alarmCategoryFilter === 'environment'
                        ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-400'
                        : 'bg-[#0f2d57]/60 text-[#8ab4f8] hover:text-white hover:bg-[#153a6e]'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5 text-cyan-300" />
                    <span>环境与有害气体 ({currentAlerts.filter(a => a.category === 'environment').length})</span>
                  </button>

                  <button
                    onClick={() => setAlarmCategoryFilter('person')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      alarmCategoryFilter === 'person'
                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400'
                        : 'bg-[#0f2d57]/60 text-[#8ab4f8] hover:text-white hover:bg-[#153a6e]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-indigo-300" />
                    <span>人员违规行为 ({currentAlerts.filter(a => a.category === 'person').length})</span>
                  </button>
                </div>

                <div className="text-xs text-[#8ab4f8] font-mono">
                  数据更新时间: <span className="text-[#00e5ff] font-bold">{formatDate(currentTime).split(' ')[1]}</span>
                </div>
              </div>

              {/* 4. 全天告警信息表格列表 (未处理告警排在前面，已处理排在后面) */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#1f4a7c]">
                {sortedCurrentAlerts
                  .filter(alert => {
                    if (alarmCategoryFilter === 'all') return true;
                    return alert.category === alarmCategoryFilter;
                  })
                  .map((alert, idx) => {
                    const isEnv = alert.category === 'environment';
                    const isPending = alert.status === 'pending';
                    const isHandling = alert.status === 'handling';
                    return (
                      <div 
                        key={alert.id || idx}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isPending 
                            ? 'bg-gradient-to-r from-red-950/40 via-[#0b2447]/90 to-[#071a35] border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.15)]' 
                            : isHandling 
                            ? 'bg-[#0b2447]/80 border-amber-500/40' 
                            : 'bg-[#081d3a]/60 border-[#1f4a7c]/60 opacity-90'
                        }`}
                      >
                        {/* 左侧主体信息 */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* 图标 */}
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                            isEnv 
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                              : 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                          }`}>
                            {isEnv ? <Wind className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* 顶部标头 */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* 时间 */}
                              <span className="font-mono text-xs text-[#00e5ff] font-bold bg-[#00e5ff]/10 px-2 py-0.5 rounded-md border border-[#00e5ff]/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{alert.time}</span>
                              </span>

                              {/* 类别标签 */}
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                                isEnv 
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-600' 
                                  : 'bg-indigo-950 text-indigo-300 border-indigo-600'
                              }`}>
                                {isEnv ? '环境气体异常' : '人员违规告警'}
                              </span>

                              {/* 等级标签 */}
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                alert.dangerLevel === 'high'
                                  ? 'bg-red-500/30 text-red-300 border border-red-500'
                                  : 'bg-amber-500/30 text-amber-300 border border-amber-500'
                              }`}>
                                {alert.dangerLevel === 'high' ? '特级高危' : '中危警戒'}
                              </span>

                              {/* 主体名称 */}
                              <span className="text-xs font-bold text-white">
                                {alert.name} {alert.role ? `(${alert.role})` : ''}
                              </span>
                            </div>

                            {/* 告警内容 */}
                            <div className="text-sm font-bold text-[#ffd54f] mt-1.5 flex items-center gap-1.5 flex-wrap">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{alert.reason}</span>
                            </div>

                            {/* 详细指标与关联设备 */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8ab4f8] mt-1.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>位置: <strong className="text-slate-200">{alert.location}</strong></span>
                              </span>

                              {alert.gasReading && (
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <span>监测读数: <strong className="text-red-400 font-mono">{alert.gasReading}</strong></span>
                                </span>
                              )}

                              {alert.deviceLinked && (
                                <span className="flex items-center gap-1">
                                  <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>联动设备: <strong className="text-[#00e5ff]">{alert.deviceLinked}</strong></span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 右侧处置状态与操作按钮 */}
                        <div className="flex md:flex-col items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1f4a7c]/60">
                          {/* 状态徽章 */}
                          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                            isPending 
                              ? 'bg-red-500/20 text-red-400 border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
                              : isHandling 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              isPending ? 'bg-red-500' : isHandling ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}></div>
                            <span>{isPending ? '待处置' : isHandling ? '处置中' : '已解除'}</span>
                          </div>

                          {/* 联动操作按钮 */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setActiveAlarmModalData({
                                  id: alert.id || `ALERT-${idx + 1}`,
                                  time: alert.time,
                                  name: alert.name,
                                  workerId: alert.workerId || `W-${idx + 1}`,
                                  role: alert.role || (isEnv ? '环境传感器' : '施工人员'),
                                  reason: alert.reason,
                                  location: alert.location,
                                  projectName: viewScope === 'yard' ? '江南造船厂区' : currentProject.name,
                                  dangerLevel: alert.dangerLevel || 'high',
                                  gasReading: alert.gasReading || '监测异常超标',
                                  deviceLinked: alert.deviceLinked || '现场声光报警仪与中枢系统',
                                  status: alert.status || 'pending'
                                });
                              }}
                              className="px-3 py-1 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500 text-xs font-bold text-red-300 transition-all cursor-pointer flex items-center gap-1 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>处置详情</span>
                            </button>

                            <button
                              onClick={() => {
                                setAlarmNoticeToast(`已对【${alert.location}】发出应急广播并通知安全员进行处置！`);
                                setTimeout(() => setAlarmNoticeToast(null), 3500);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500 text-xs font-bold text-amber-300 transition-all cursor-pointer flex items-center gap-1"
                              title="现场紧急广播对讲"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>广播</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* 5. 底部栏 */}
              <div className="mt-4 pt-3 border-t border-[#1f4a7c]/80 flex items-center justify-between text-xs text-[#8ab4f8] shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#00e5ff]" />
                  <span>告警闭环规则：环境监测指标恢复正常范围或安全监督员现场复核后，告警将自动归档解除。</span>
                </div>

                <button
                  onClick={() => setIsAlarmListModalOpen(false)}
                  className="px-5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  关闭列表
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 📢 顶部 Toast 操作提示 */}
        {alarmNoticeToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#00d2ff] text-[#031326] px-5 py-2 rounded-full font-bold text-xs shadow-[0_0_25px_rgba(0,210,255,0.8)] border border-white animate-fadeIn flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-4 h-4 text-blue-900 animate-spin" />
            <span>{alarmNoticeToast}</span>
          </div>
        )}
      </div>

      {/* 2. 顶部 Header 栏 */}
      <header 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-40 h-[82px] flex items-start justify-between px-6 pt-2 bg-gradient-to-b from-[#031326]/95 via-[#031326]/60 to-transparent shrink-0 cursor-default"
      >
        
        {/* 左侧：「返回系统」按钮与搜索查询输入框 */}
        <div className="flex items-center gap-2.5 pt-2 whitespace-nowrap shrink-0">
          <button 
            onClick={() => {
              if (onExit) {
                onExit();
              } else if (onNavigate) {
                onNavigate('projects');
              }
            }}
            className="flex items-center gap-1.5 text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border border-[#00d2ff]/80 px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-[0_0_14px_rgba(0,210,255,0.4)] hover:shadow-[0_0_20px_rgba(0,210,255,0.7)] whitespace-nowrap shrink-0 cursor-pointer"
            title="返回系统主菜单"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="font-medium whitespace-nowrap">返回系统</span>
          </button>

          {/* 综合类型搜索框：仅保留人员与设备两种分类 */}
          <div className="relative flex items-center bg-[#071d3d]/90 border border-[#1f4a7c] focus-within:border-[#00d2ff] rounded-full p-0.5 shadow-[inset_0_0_8px_rgba(0,0,0,0.4),0_0_10px_rgba(0,210,255,0.15)] transition-all">
            {/* 搜索类型下拉选择器 */}
            <div className="relative">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchTypeDropdownOpen(prev => !prev);
                }}
                className="flex items-center gap-1 bg-[#0b2b52] hover:bg-[#0f386b] text-[#00d2ff] px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer select-none"
                title="切换搜索目标分类"
              >
                {searchTargetType === 'personnel' ? <Users className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                <span>
                  {searchTargetType === 'personnel' ? '人员' : '设备'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSearchTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 下拉菜单 (仅保留 人员 与 设备) */}
              {isSearchTypeDropdownOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full mt-1.5 left-0 w-28 bg-[#061833]/98 border border-[#00d2ff] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.85),0_0_16px_rgba(0,210,255,0.3)] py-1 z-50 animate-fadeIn backdrop-blur-xl select-none"
                >
                  {[
                    { type: 'personnel' as SearchTargetType, label: '人员', icon: Users },
                    { type: 'device' as SearchTargetType, label: '设备', icon: Cpu },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => {
                        setSearchTargetType(opt.type);
                        setIsSearchTypeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between hover:bg-[#0f386b] cursor-pointer transition-colors ${
                        searchTargetType === opt.type ? 'text-[#00e5ff] font-bold bg-[#00e5ff]/15' : 'text-[#8ab4f8]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <opt.icon className="w-3 h-3 text-[#00d2ff]" />
                        <span>{opt.label}</span>
                      </div>
                      {searchTargetType === opt.type && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 输入框：人员按姓名/工号搜索，设备按名称/编号搜索 */}
            <input 
              type="text" 
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder={
                searchTargetType === 'personnel' 
                  ? '按姓名/工号搜索...' 
                  : '按名称/编号搜索...'
              }
              className="bg-transparent border-none pl-2.5 pr-1.5 py-1 text-xs text-[#e2f1ff] focus:outline-none w-36 focus:w-48 transition-all placeholder-[#476582]"
            />

            {/* 搜索/回车按钮 */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-6 h-6 rounded-full bg-[#00d2ff]/15 hover:bg-[#00d2ff] text-[#00d2ff] hover:text-[#061833] flex items-center justify-center transition-all mr-0.5 cursor-pointer shrink-0"
              title="按回车或点击定位搜索"
            >
              <Search className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 中间：标题与“厂区/造船项目”双视图切换栏 */}
        <div className="flex-1 flex flex-col items-center px-2">
          
          {/* 主标题底座 */}
          <div className="relative px-16 py-1 flex items-center justify-center whitespace-nowrap">
            {/* 科技梯形光效底框 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0d3b6f]/85 to-transparent [clip-path:polygon(0_0,100%_0,85%_100%,15%_100%)] border-b-2 border-[#00d2ff]"></div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent"></div>
            
            <h1 className="relative z-10 text-[25px] font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#dbeafe] to-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.85)] whitespace-nowrap">
              智慧船厂驾驶舱
            </h1>
          </div>

          {/* “厂区” 与 “造船项目” 视图切换 & 项目下拉选择器 */}
          <div className="flex items-center gap-3 mt-1.5 whitespace-nowrap relative">
            
            {/* 视图双切换胶囊按钮 */}
            <div className="flex items-center bg-[#071d3d]/90 p-0.5 rounded-full border border-[#1f4a7c] shadow-[0_0_16px_rgba(0,210,255,0.25)]">
              {/* 厂区视图按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewScope('yard');
                  setIsProjectDropdownOpen(false);
                }}
                className={`px-4 py-1 text-[12px] font-bold tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  viewScope === 'yard'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_14px_rgba(0,210,255,0.7)]'
                    : 'text-[#8ab4f8] hover:text-white hover:bg-[#0c315e]/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>厂区全景</span>
              </button>

              {/* 造船项目视图按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setViewScope('project');
                  setShowModelLevelMenu(true);
                }}
                className={`px-4 py-1 text-[12px] font-bold tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  viewScope === 'project'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_14px_rgba(0,210,255,0.7)]'
                    : 'text-[#8ab4f8] hover:text-white hover:bg-[#0c315e]/50'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>造船项目</span>
              </button>
            </div>

            {/* 当处于“造船项目”视图时，调取项目管理中的项目名称列表供实时切换 (模型分层选择已移至图层控制) */}
            {viewScope === 'project' && (
              <div className="flex items-center gap-2">
                {/* 1. 项目选择器 */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProjectDropdownOpen(!isProjectDropdownOpen);
                    }}
                    className="flex items-center gap-2 bg-[#0a264a]/90 hover:bg-[#0f3466] border border-[#00d2ff]/80 px-3.5 py-1 rounded-full text-xs text-[#e2f1ff] shadow-[0_0_14px_rgba(0,210,255,0.35)] transition-all duration-200 cursor-pointer"
                  >
                    <Anchor className="w-3 h-3 text-[#00d2ff]" />
                    <span className="font-bold text-[#00d2ff]">{currentProject.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#00d2ff] transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 项目下拉选择弹窗菜单 */}
                  {isProjectDropdownOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-1.5 left-0 w-80 bg-[#061833]/95 border border-[#00d2ff] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(0,210,255,0.4)] backdrop-blur-xl p-2 z-50 animate-fadeIn"
                    >
                      <div className="text-[10px] font-bold text-[#8ab4f8] px-2.5 py-1 uppercase tracking-wider border-b border-[#1f4a7c]/60 mb-1 flex items-center justify-between">
                        <span>选择造船项目模型</span>
                        <span className="text-[#00d2ff]">共 {projectListConfig.length} 个在建项目</span>
                      </div>

                      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                        {projectListConfig.map((prj) => {
                          const isSelected = prj.id === selectedProjectId;
                          return (
                            <div
                              key={prj.id}
                              onClick={() => {
                                setSelectedProjectId(prj.id);
                                setIsProjectDropdownOpen(false);
                              }}
                              className={`p-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#19528f]/90 to-[#0c315e]/90 border border-[#00d2ff] shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                                  : 'hover:bg-[#0b2447] border border-transparent hover:border-[#1f4a7c]'
                              }`}
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <Ship className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#00d2ff]' : 'text-[#8ab4f8]'}`} />
                                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#e2f1ff]'}`}>
                                    {prj.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-[#8ab4f8] mt-1">
                                  <span>{prj.shipCode}</span>
                                  <span>·</span>
                                  <span className="text-[#00d2ff]">{prj.dockingArea}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-[11px] font-mono font-bold text-[#00e676]">{prj.progress}%</div>
                                <span className="text-[9px] text-[#557696]">{prj.phase}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 右侧：时间日期与天气、「触发告警信息」按钮、全景模式按钮(仅图标)、管理员标识 */}
        <div className="flex justify-end items-center gap-3 pt-2 whitespace-nowrap shrink-0">
          
          {/* 时间、日期与天气 */}
          <div className="flex items-center text-[12px] text-[#8ab4f8] font-mono tracking-wide whitespace-nowrap">
            <span className="whitespace-nowrap">{formatDate(currentTime)}</span>
            <span className="ml-2.5 flex items-center text-[#00d2ff] whitespace-nowrap">
              <Cloud className="w-3.5 h-3.5 mr-1 text-[#00d2ff] shrink-0" /> 25°C 晴
            </span>
          </div>

          {/* 📺 作业面大屏链接按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigate) {
                onNavigate('workface_screen');
              }
              window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'workface_screen' } }));
            }}
            className="px-3 py-1 text-xs font-bold border border-[#00d2ff]/80 bg-gradient-to-r from-[#06244d] via-[#0d3b6f] to-[#082046] text-[#00d2ff] hover:text-white hover:border-[#00e676] hover:shadow-[0_0_14px_rgba(0,230,118,0.5)] rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_12px_rgba(0,210,255,0.4)] active:scale-95 group"
            title="进入作业看板安全监控系统"
          >
            <Tv className="w-3.5 h-3.5 text-[#00d2ff] group-hover:scale-110 group-hover:text-[#00e676] transition-transform animate-pulse" />
            <span>作业看板</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] group-hover:bg-[#00e676] shadow-[0_0_6px_#00d2ff]"></span>
          </button>

          {/* 🚨 触发告警信息按钮 (与左侧查询框互换位置) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveAlarmModalData({
                id: `ALERT-EMERGENCY-${Date.now()}`,
                time: formatDate(currentTime).split(' ')[1],
                name: '李强 (组长)',
                workerId: 'LNG20260421',
                role: '高级焊接技师',
                reason: '1#液货舱绝热合拢受限空间气体指标异常',
                location: '1#液货舱绝热合拢受限空间底部',
                projectName: currentProject.name,
                dangerLevel: 'high',
                gasReading: '氧气 17.8% (严重偏低) | 可燃气 0%LEL',
                deviceLinked: 'LNG-GAS-01 气体检测仪 & 龙门吊防碰报警器',
                status: 'pending'
              });
            }}
            className="px-3 py-1 text-xs border border-red-500 bg-red-600/30 text-red-300 hover:bg-red-600 hover:text-white rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse"
            title="触发紧急告警明显提示窗"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="font-bold">触发告警信息</span>
          </button>

          <div className="h-4 w-px bg-[#1f4a7c]/60"></div>

          {/* 全景模式按钮 (去掉文字，只保留图标) */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsPanelsVisible(!isPanelsVisible);
            }}
            className={`w-7 h-7 flex items-center justify-center border rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isPanelsVisible 
                ? 'border-[#1f4a7c] bg-[#0b2447]/70 text-[#8ab4f8] hover:text-white hover:border-[#00d2ff]' 
                : 'border-[#00d2ff] bg-[#00d2ff]/20 text-[#00d2ff] animate-pulse shadow-[0_0_10px_rgba(0,210,255,0.4)]'
            }`}
            title={isPanelsVisible ? "全景模式 (隐藏全部数据面板)" : "显示全部数据面板"}
          >
            {isPanelsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* 管理员标识 */}
          <div className="flex items-center gap-1.5 text-xs text-[#e2f1ff] border border-[#1f4a7c] bg-[#0b2447]/70 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
            <div className="w-4 h-4 rounded-full bg-[#103a68] flex items-center justify-center border border-[#00d2ff] shrink-0">
              <User className="w-2.5 h-2.5 text-[#00d2ff]" />
            </div>
            <span className="tracking-wide whitespace-nowrap font-medium">管理员</span>
          </div>
        </div>
      </header>

      {/* 3. 核心大屏布局（带平滑滑动隐藏/展开动效与动态数据联动） */}
      <div className="relative z-30 flex-1 flex gap-3 px-4 pb-3 overflow-hidden pointer-events-none">
        
        {/* 🎯 人员分布 / 设备分布 浮动图层控制工具面板 (精美工业数字孪生科技风) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`absolute top-[175px] z-40 flex items-start gap-2 select-none pointer-events-auto transition-all duration-500 ease-in-out ${
            isPanelsVisible ? 'left-[350px]' : 'left-4'
          }`}
        >
          {/* 图层控制核心面板 */}
          <div className="bg-[#061833]/92 border border-[#00d2ff]/40 rounded-2xl p-2 shadow-[0_12px_32px_rgba(0,0,0,0.7),0_0_20px_rgba(0,210,255,0.15)] backdrop-blur-xl flex flex-col gap-1.5 w-[130px]">
            {/* 面板头部 */}
            <div className="flex items-center justify-between pb-1 border-b border-[#1f4a7c]/60 px-1 mb-0.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#e2f1ff] tracking-wider">
                <Layers className="w-3 h-3 text-[#00d2ff]" />
                <span>图层</span>
              </div>
              <span className="text-[8px] font-mono text-[#00e5ff] bg-[#00e5ff]/10 px-1 py-0.2 rounded border border-[#00e5ff]/30">
                {viewScope === 'yard' ? '全景' : '造船'}
              </span>
            </div>

            {/* 0. 模型分层 (仅在造船项目视角 viewScope === 'project' 时显示) */}
            {viewScope === 'project' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModelLevelMenu(prev => !prev);
                }}
                className={`w-full px-2 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-1 cursor-pointer transition-all duration-200 ${
                  showModelLevelMenu || selectedModelLevel !== 'all'
                    ? 'bg-gradient-to-r from-[#00d2ff]/25 to-[#0b2447]/90 border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]' 
                    : 'bg-[#0b2447]/40 border-[#1f4a7c]/60 text-[#8ab4f8] hover:border-[#00d2ff]/60 hover:text-white'
                }`}
                title="点击展开/切换造船项目3D模型分层"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className={`w-3.5 h-3.5 shrink-0 ${showModelLevelMenu || selectedModelLevel !== 'all' ? 'text-[#00e5ff]' : 'text-[#8ab4f8]'}`} />
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-medium whitespace-nowrap text-[11px] leading-tight">模型分层</span>
                    <span className="text-[9px] text-[#00e5ff] font-bold truncate max-w-[54px]">
                      {SHIP_MODEL_LEVELS.find(l => l.id === selectedModelLevel)?.shortName || '全船透视'}
                    </span>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${selectedModelLevel !== 'all' ? 'bg-[#00e676] shadow-[0_0_6px_#00e676]' : 'bg-[#00e5ff]'}`} />
              </button>
            )}

            {/* 1. 人员 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPersonnelLayer(prev => !prev);
              }}
              className={`w-full px-2 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all duration-200 ${
                showPersonnelLayer 
                  ? 'bg-gradient-to-r from-[#00d2ff]/25 to-[#0b2447]/90 border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]' 
                  : 'bg-[#0b2447]/40 border-[#1f4a7c]/60 text-[#8ab4f8] hover:border-[#00d2ff]/60 hover:text-white'
              }`}
              title={showPersonnelLayer ? "点击隐藏人员分布" : "点击显示人员分布"}
            >
              <div className="flex items-center gap-1.5">
                <Users className={`w-3.5 h-3.5 ${showPersonnelLayer ? 'text-[#00e5ff]' : 'text-[#8ab4f8]'}`} />
                <span className="font-medium whitespace-nowrap">人员</span>
              </div>
              {/* 科技平滑开关 */}
              <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${
                showPersonnelLayer ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]' : 'bg-[#1b2b36]'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-[#061833] shadow transform transition-transform duration-200 ${
                  showPersonnelLayer ? 'translate-x-2.5' : 'translate-x-0'
                }`} />
              </div>
            </button>

            {/* 2. 设备 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeviceLayer(prev => !prev);
              }}
              className={`w-full px-2 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all duration-200 ${
                showDeviceLayer 
                  ? 'bg-gradient-to-r from-[#00d2ff]/25 to-[#0b2447]/90 border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]' 
                  : 'bg-[#0b2447]/40 border-[#1f4a7c]/60 text-[#8ab4f8] hover:border-[#00d2ff]/60 hover:text-white'
              }`}
              title={showDeviceLayer ? "点击隐藏设备分布" : "点击展开设备分布与类型查询"}
            >
              <div className="flex items-center gap-1.5">
                <Cpu className={`w-3.5 h-3.5 ${showDeviceLayer ? 'text-[#00e5ff]' : 'text-[#8ab4f8]'}`} />
                <span className="font-medium whitespace-nowrap">设备</span>
              </div>
              <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${
                showDeviceLayer ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]' : 'bg-[#1b2b36]'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-[#061833] shadow transform transition-transform duration-200 ${
                  showDeviceLayer ? 'translate-x-2.5' : 'translate-x-0'
                }`} />
              </div>
            </button>

            {/* 3. 区域 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowFenceLayer(prev => !prev);
              }}
              className={`w-full px-2 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all duration-200 ${
                showFenceLayer 
                  ? 'bg-gradient-to-r from-[#00d2ff]/25 to-[#0b2447]/90 border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]' 
                  : 'bg-[#0b2447]/40 border-[#1f4a7c]/60 text-[#8ab4f8] hover:border-[#00d2ff]/60 hover:text-white'
              }`}
              title={showFenceLayer ? "点击隐藏区域划分" : "点击显示区域划分"}
            >
              <div className="flex items-center gap-1.5">
                <Layers className={`w-3.5 h-3.5 ${showFenceLayer ? 'text-[#00e5ff]' : 'text-[#8ab4f8]'}`} />
                <span className="font-medium whitespace-nowrap">区域</span>
              </div>
              <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${
                showFenceLayer ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]' : 'bg-[#1b2b36]'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-[#061833] shadow transform transition-transform duration-200 ${
                  showFenceLayer ? 'translate-x-2.5' : 'translate-x-0'
                }`} />
              </div>
            </button>

            {/* 4. 船只 (仅在全景视角 viewScope === 'yard' 时显示) */}
            {viewScope === 'yard' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShipDistributionLayer(prev => !prev);
                }}
                className={`w-full px-2 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-1.5 cursor-pointer transition-all duration-200 ${
                  showShipDistributionLayer 
                    ? 'bg-gradient-to-r from-[#00d2ff]/25 to-[#0b2447]/90 border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.25)]' 
                    : 'bg-[#0b2447]/40 border-[#1f4a7c]/60 text-[#8ab4f8] hover:border-[#00d2ff]/60 hover:text-white'
                }`}
                title={showShipDistributionLayer ? "点击隐藏6个在建项目船只停放分布" : "点击显示6个在建项目船只停放分布"}
              >
                <div className="flex items-center gap-1.5">
                  <Ship className={`w-3.5 h-3.5 ${showShipDistributionLayer ? 'text-[#00e5ff]' : 'text-[#8ab4f8]'}`} />
                  <span className="font-medium whitespace-nowrap">船只</span>
                </div>
                <div className={`w-6 h-3.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${
                  showShipDistributionLayer ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]' : 'bg-[#1b2b36]'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full bg-[#061833] shadow transform transition-transform duration-200 ${
                    showShipDistributionLayer ? 'translate-x-2.5' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            )}
          </div>

          {/* 🎯 当点击设备分布时再出现二级类型菜单查询，显示对应的设备信息 */}
          {showDeviceLayer && (
            <div 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-[#12363b]/95 border border-[#00e5ff]/60 rounded-xl p-2 min-w-[104px] shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_16px_rgba(0,229,255,0.25)] backdrop-blur-md flex flex-col gap-1 animate-fadeIn transition-all duration-200"
            >
              <div className="text-[10px] text-[#8ab4f8] px-2 py-0.5 font-medium border-b border-[#1f4a7c]/60 mb-0.5 flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#00e5ff]" />
                <span>设备分类筛选</span>
              </div>

              {/* 全部 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceCategory('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedDeviceCategory === 'all'
                    ? 'text-[#00e5ff] font-bold bg-[#00e5ff]/20 border border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-[#d0e5ea] hover:text-white hover:bg-white/10'
                }`}
              >
                <span>全部</span>
                {selectedDeviceCategory === 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span>
                )}
              </button>

              {/* 主基站 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceCategory('main_station');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedDeviceCategory === 'main_station'
                    ? 'text-[#00e5ff] font-bold bg-[#00e5ff]/20 border border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-[#d0e5ea] hover:text-white hover:bg-white/10'
                }`}
              >
                <span>主基站</span>
                {selectedDeviceCategory === 'main_station' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span>
                )}
              </button>

              {/* 气体探测器 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceCategory('gas_detector');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedDeviceCategory === 'gas_detector'
                    ? 'text-[#00e5ff] font-bold bg-[#00e5ff]/20 border border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-[#d0e5ea] hover:text-white hover:bg-white/10'
                }`}
              >
                <span>气体探测器</span>
                {selectedDeviceCategory === 'gas_detector' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span>
                )}
              </button>

              {/* 声光报警器 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceCategory('alarm');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedDeviceCategory === 'alarm'
                    ? 'text-[#00e5ff] font-bold bg-[#00e5ff]/20 border border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-[#d0e5ea] hover:text-white hover:bg-white/10'
                }`}
              >
                <span>声光报警器</span>
                {selectedDeviceCategory === 'alarm' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span>
                )}
              </button>

              {/* 摄像头 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeviceCategory('camera');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs text-left font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedDeviceCategory === 'camera'
                    ? 'text-[#00e5ff] font-bold bg-[#00e5ff]/20 border border-[#00e5ff]/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-[#d0e5ea] hover:text-white hover:bg-white/10'
                }`}
              >
                <span>摄像头</span>
                {selectedDeviceCategory === 'camera' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]"></span>
                )}
              </button>
            </div>
          )}

          {/* 🎯 当处于造船项目且展开模型分层时，在图层控制面板右侧弹出模型分层切换选择面板 */}
          {viewScope === 'project' && showModelLevelMenu && (
            <div 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-[#061833]/95 border border-[#00e5ff] rounded-2xl p-2.5 min-w-[245px] shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(0,229,255,0.35)] backdrop-blur-xl flex flex-col gap-1.5 animate-fadeIn z-50 whitespace-nowrap"
            >
              <div className="text-[11px] font-bold text-[#8ab4f8] px-2 py-1 border-b border-[#1f4a7c]/60 mb-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span className="text-white font-bold">造船项目模型分层</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModelLevelMenu(false)}
                  className="text-[#8ab4f8] hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="收起分层面板"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {SHIP_MODEL_LEVELS.map((lvl) => {
                  const isSelected = lvl.id === selectedModelLevel;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        setSelectedModelLevel(lvl.id);
                        setShowModelLevelMenu(false);
                      }}
                      className={`p-2 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#00d2ff]/25 to-[#0c315e]/90 border border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)] text-white'
                          : 'hover:bg-[#0b2447] border border-transparent hover:border-[#1f4a7c] text-[#8ab4f8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" 
                          style={{ backgroundColor: lvl.color, color: lvl.color }}
                        ></span>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#00e5ff]' : 'text-[#e2f1ff]'}`}>
                            {lvl.name}
                          </span>
                          <span className="text-[10px] text-[#8ab4f8]/80 mt-0.5">
                            {lvl.elevation} · {lvl.description}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#00e5ff] shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 快捷重置按钮 */}
              {selectedModelLevel !== 'all' && (
                <div className="pt-1 mt-1 border-t border-[#1f4a7c]/40 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModelLevel('all');
                      setShowModelLevelMenu(false);
                    }}
                    className="text-[10px] text-[#00e5ff] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>恢复全船透视</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* ===================== 左侧面板 (向左滑入/滑出) ===================== */}
        <div 
          className={`w-[330px] flex flex-col gap-2 shrink-0 transition-all duration-500 ease-in-out relative pointer-events-auto ${
            isPanelsVisible ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 pointer-events-none'
          }`}
        >
          
          {/* 左1: 人员到岗概览 */}
          <SciFiPanel 
            title={viewScope === 'yard' ? "人员到岗概览" : `${currentProject.shipType}人员到岗概览`}
            icon={<Crosshair className="w-3.5 h-3.5" />}
            className="h-[142px]"
          >
            <div className="flex items-center h-full gap-3">
              {/* 左侧人员大头像光环 */}
              <div className="flex flex-col items-center justify-center pl-1 shrink-0">
                <div className="w-14 h-14 rounded-full border-2 border-[#00d2ff] shadow-[0_0_16px_rgba(0,210,255,0.45)] flex items-center justify-center bg-[#071d3d] relative">
                  <div className="absolute inset-1 rounded-full border border-dashed border-[#00d2ff]/50 animate-spin" style={{ animationDuration: '12s' }}></div>
                  <User className="w-7 h-7 text-[#00d2ff]" />
                </div>
                <div className="mt-1 text-[11px] text-[#8ab4f8] whitespace-nowrap">
                  人员总数 <span className="text-[#00d2ff] font-bold font-mono text-sm ml-0.5">{currentTotal}</span>
                </div>
              </div>

              {/* 右侧2行状态卡片 */}
              <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                <div className="flex items-center justify-between bg-[#0b2447]/90 border border-[#1e4976]/80 px-2.5 py-1.5 rounded-xl whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8ab4f8] whitespace-nowrap">
                    <div className="w-4 h-4 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0">
                      <Users className="w-2.5 h-2.5 text-[#00d2ff]" />
                    </div>
                    <span className="whitespace-nowrap">实到人数</span>
                  </div>
                  <span className="font-mono text-[#00d2ff] font-bold text-sm whitespace-nowrap ml-1">{currentOnDuty}</span>
                </div>

                <div className="flex items-center justify-between bg-[#0b2447]/90 border border-[#1e4976]/80 px-2.5 py-1.5 rounded-xl whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8ab4f8] whitespace-nowrap">
                    <div className="w-4 h-4 rounded-full bg-amber-500/30 flex items-center justify-center shrink-0">
                      <User className="w-2.5 h-2.5 text-[#ffb300]" />
                    </div>
                    <span className="whitespace-nowrap">未到人数</span>
                  </div>
                  <span className="font-mono text-[#ffb300] font-bold text-sm whitespace-nowrap ml-1">{currentOffDuty}</span>
                </div>
              </div>
            </div>
          </SciFiPanel>

          {/* 左2: 部门/班组分布 (流动条与数据区科技蓝风格统一) */}
          <SciFiPanel 
            title="部门/班组分布"
            icon={<Layers className="w-3.5 h-3.5" />}
            className="flex-1 min-h-[230px]"
          >
            <div className="flex flex-col gap-2 h-full overflow-y-auto pr-1 custom-scrollbar justify-start pt-1">
              {currentDistribution.map((item, index) => {
                const percent = Math.min(100, Math.max(6, (item.value / item.max) * 100));
                return (
                  <div key={index} className="flex items-center text-[11px] whitespace-nowrap bg-[#0b2447]/60 hover:bg-[#0f3466]/80 rounded-xl px-2.5 py-1.5 border border-[#1e4976]/60 transition-all group">
                    <div className="flex items-center gap-1.5 w-24 shrink-0 whitespace-nowrap truncate">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] shadow-[0_0_6px_#00d2ff] group-hover:scale-125 transition-transform shrink-0"></div>
                      <span className="text-[#8ab4f8] group-hover:text-white truncate font-medium">{item.name}</span>
                    </div>

                    {/* 流动条样式与数据区统一 */}
                    <div className="flex-1 h-2.5 bg-[#061833] mx-2 rounded-full overflow-hidden border border-[#19426f] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] relative p-[1px]">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#0284c7] via-[#00a8e8] to-[#00d2ff] relative transition-all duration-500 shadow-[0_0_8px_rgba(0,210,255,0.7)]"
                        style={{ width: `${percent}%` }}
                      >
                        {/* 流动微光脉冲 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        {/* 流光端部发光球 */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff,0_0_12px_#00d2ff]"></div>
                      </div>
                    </div>

                    {/* 人数数据 */}
                    <div className="w-12 text-right font-mono text-[#00d2ff] group-hover:text-white shrink-0 font-bold whitespace-nowrap">
                      {item.value}<span className="text-[10px] text-[#8ab4f8] ml-0.5 font-normal">人</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SciFiPanel>

          {/* 左3: 人员结构分布 */}
          <SciFiPanel 
            title="人员结构分布"
            icon={<Users className="w-3.5 h-3.5" />}
            className="h-[175px] shrink-0"
          >
            <div className="flex items-center h-full">
              {/* 环形图 */}
              <div className="w-[120px] h-full relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentTypeData}
                      innerRadius={28}
                      outerRadius={44}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {currentTypeData.map((entry, index) => (
                        <Cell key={`cell-type-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none whitespace-nowrap">
                  <span className="text-base font-bold font-mono text-white leading-none">{currentTotal}</span>
                  <span className="text-[9px] text-[#8ab4f8] mt-0.5">总人数</span>
                </div>
              </div>

              {/* 图例 */}
              <div className="flex-1 flex flex-col gap-1.5 justify-center pl-2 min-w-0">
                {currentTypeData.map((item, index) => {
                  const count = item.count ?? Math.round((item.value / 100) * currentTotal);
                  return (
                    <div key={index} className="flex items-center justify-between text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[#8ab4f8] whitespace-nowrap">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span className="whitespace-nowrap">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono whitespace-nowrap ml-1">
                        <span className="text-[#00d2ff] font-bold">{count}<span className="text-[10px] text-[#8ab4f8] font-normal ml-0.5">人</span></span>
                        <span className="text-[#8ab4f8] text-[10px]">({item.value}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SciFiPanel>

        </div>

        {/* ===================== 中间全景/船模交互与悬浮数据概览 ===================== */}
        <div className="flex-1 flex flex-col relative min-w-0 pointer-events-none">
          
          {/* 中间上层漫游控制 */}
          <div className="flex-1 relative">
            {/* 隐藏数据面板状态下的全景漫游提示气泡 */}
            {!isPanelsVisible && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#061833]/90 border border-[#00d2ff] backdrop-blur-md px-5 py-2 rounded-full shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2.5 text-sm text-[#e2f1ff] animate-bounce z-30 pointer-events-auto">
                <Eye className="w-4 h-4 text-[#00d2ff]" />
                <span>
                  {viewScope === 'yard' ? '厂区全景漫游模式' : `${currentProject.name} 3D孪生漫游模式`} · 点击任意背景区域即可恢复数据面板
                </span>
              </div>
            )}

          </div>

          {/* 底部：今日数据概览横幅 (向下滑入/滑出，圆角风格) */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`w-full bg-[#061833]/85 border border-[#1f4a7c]/80 backdrop-blur-md rounded-2xl p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(31,74,124,0.35)] relative shrink-0 transition-all duration-500 ease-in-out cursor-default pointer-events-auto ${
              isPanelsVisible ? 'translate-y-0 opacity-100' : 'translate-y-[140%] opacity-0 pointer-events-none'
            }`}
          >
            {/* 四角圆润发光装饰 */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#00d2ff]/80 rounded-tl-lg pointer-events-none"></div>
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#00d2ff]/80 rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#00d2ff]/80 rounded-bl-lg pointer-events-none"></div>
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#00d2ff]/80 rounded-br-lg pointer-events-none"></div>

            {/* 标题栏 */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1f4a7c]/60 px-1 whitespace-nowrap">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Activity className="w-3.5 h-3.5 text-[#00d2ff] shrink-0" />
                <span className="text-xs font-bold text-[#e2f1ff] tracking-wider whitespace-nowrap">
                  {viewScope === 'yard' ? '厂区今日数据概览' : `${currentProject.name} 今日数据概览`}
                </span>
              </div>
            </div>

            {/* 数据概览维度列表 (厂区4维度 / 项目5维度) */}
            <div className={`grid ${viewScope === 'yard' ? 'grid-cols-4' : 'grid-cols-5'} divide-x divide-[#1f4a7c]/60 pt-0.5`}>
              {(viewScope === 'yard' ? [
                { 
                  label: '实时在场人数', 
                  value: `${currentOnDuty.toLocaleString()} 人`, 
                  icon: Users,
                  iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' 
                },
                { 
                  label: '安装设备数', 
                  value: `${currentDeviceSummary.total} 台`, 
                  icon: Cpu,
                  iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' 
                },
                { 
                  label: '电子围栏个数及事件数', 
                  value: `${(YARD_ELECTRONIC_FENCES || []).length} 个 / 12 起`, 
                  icon: ShieldAlert,
                  iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' 
                },
                { 
                  label: '告警信息数', 
                  value: `${currentAlarmCount} 起`, 
                  icon: Bell,
                  iconBg: 'bg-red-500/30 text-[#ff1744] border-red-500/40' 
                },
              ] : [
                { 
                  label: '当前项目阶段信息', 
                  value: `${currentProject.phase}`, 
                  icon: Clock,
                  iconBg: 'bg-emerald-500/30 text-[#00e676] border-emerald-500/40' 
                },
                { 
                  label: '实时在场人数', 
                  value: `${currentOnDuty} 人`, 
                  icon: Users,
                  iconBg: 'bg-blue-600/30 text-[#00d2ff] border-blue-500/40' 
                },
                { 
                  label: '安装设备数', 
                  value: `${currentDeviceSummary.total} 台`, 
                  icon: Cpu,
                  iconBg: 'bg-cyan-500/30 text-[#00d2ff] border-cyan-500/40' 
                },
                { 
                  label: '电子围栏个数及事件数', 
                  value: `${(PROJECT_ELECTRONIC_FENCES[currentProject.id] || []).length || 3} 个 / ${currentProject.alerts.length} 起`, 
                  icon: ShieldAlert,
                  iconBg: 'bg-amber-500/30 text-[#ffb300] border-amber-500/40' 
                },
                { 
                  label: '告警信息数', 
                  value: `${currentProject.alarmPersonnel} 起`, 
                  icon: Bell,
                  iconBg: 'bg-red-500/30 text-[#ff1744] border-red-500/40' 
                },
              ]).map((item, idx) => (
                <div key={idx} className="flex flex-col px-3 first:pl-1 last:pr-1 whitespace-nowrap min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8ab4f8] whitespace-nowrap">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                      <item.icon className="w-2.5 h-2.5" />
                    </div>
                    <span className="whitespace-nowrap truncate">{item.label}</span>
                  </div>

                  <div className="text-base font-bold font-mono text-[#e2f1ff] mt-1 tracking-tight whitespace-nowrap truncate">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ===================== 右侧面板 (向右滑入/滑出) ===================== */}
        <div 
          className={`w-[330px] flex flex-col gap-2 shrink-0 transition-all duration-500 ease-in-out pointer-events-auto ${
            isPanelsVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
          }`}
        >
          
          {/* 右1: 实时告警信息 (支持环境气体与人员违规检测，支持自动平滑轮播与弹窗展开) */}
          <SciFiPanel 
            title={viewScope === 'yard' ? "实时告警信息" : `${currentProject.shipType}实时告警信息`}
            icon={<ShieldAlert className="w-3.5 h-3.5 text-[#ff1744]" />}
            extra={
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAlarmListModalOpen(true);
                }}
                className="text-[11px] text-[#00d2ff] hover:text-white hover:underline cursor-pointer whitespace-nowrap bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 px-1.5 py-0.5 rounded border border-[#00d2ff]/30 transition-all flex items-center gap-0.5"
                title="查看今日全量告警信息列表"
              >
                <span>更多</span>
                <span>&gt;</span>
              </button>
            }
            className="h-[200px]"
          >
            {/* 今日预警统计：改为三种数据统计（今日告警数、已处理数、未处理数） */}
            <div className="text-[11px] mb-1.5 pb-1.5 border-b border-[#1f4a7c]/40 flex items-center justify-between whitespace-nowrap gap-1">
              <div className="flex items-center gap-1">
                <span className="text-[#8ab4f8]">今日告警:</span>
                <span className="text-white font-bold font-mono text-xs">{todayAlertCount}</span>
                <span className="text-[10px] text-[#8ab4f8]">起</span>
              </div>
              <div className="flex items-center gap-1 bg-red-950/60 px-1.5 py-0.5 rounded-md border border-red-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                <span className="text-red-300 text-[10px]">未处理:</span>
                <span className="text-red-400 font-bold font-mono text-xs">{unhandledAlertCount}</span>
                <span className="text-[9px] text-red-300/70">起</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-emerald-300 text-[10px]">已处理:</span>
                <span className="text-emerald-400 font-bold font-mono text-xs">{handledAlertCount}</span>
                <span className="text-[9px] text-emerald-300/70">起</span>
              </div>
            </div>

            {/* 告警自动轮播列表 (未处理告警按严重程度与时间优先固定排在前面，已处理告警排在后面) */}
            <div 
              ref={alertsScrollRef}
              onMouseEnter={() => setIsAlertsHovered(true)}
              onMouseLeave={() => setIsAlertsHovered(false)}
              className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin scrollbar-thumb-[#1f4a7c] scroll-smooth"
            >
              {sortedCurrentAlerts.map((alert, idx) => {
                const isEnv = alert.category === 'environment';
                const isResolved = alert.status === 'resolved';
                return (
                  <div 
                    key={alert.id || idx} 
                    className={`flex items-center text-[11px] py-1 px-2 rounded-xl border transition-colors whitespace-nowrap cursor-pointer group ${
                      isResolved 
                        ? 'bg-[#081d3a]/50 hover:bg-[#0b2447] border-[#1a4473]/40 opacity-75' 
                        : alert.dangerLevel === 'high'
                        ? 'bg-[#0b2447]/90 hover:bg-[#0f3466] border-red-500/40 hover:border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.15)]'
                        : 'bg-[#0b2447]/90 hover:bg-[#0f3466] border-amber-500/40 hover:border-amber-500'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAlarmModalData({
                        id: alert.id || `ALERT-${idx + 1}`,
                        time: alert.time,
                        name: alert.name,
                        workerId: alert.workerId || `W-${idx + 1}`,
                        role: alert.role || (isEnv ? '环境探测设备' : '作业人员'),
                        reason: alert.reason,
                        location: alert.location,
                        projectName: viewScope === 'yard' ? '江南造船厂区' : currentProject.name,
                        dangerLevel: alert.dangerLevel || 'high',
                        gasReading: alert.gasReading || (isEnv ? '环境超标警报' : 'AI违章抓拍'),
                        deviceLinked: alert.deviceLinked || '现场声光报警仪与中枢系统',
                        status: alert.status || 'pending'
                      });
                    }}
                  >
                    {/* 分类小图标与状态指示 */}
                    {isResolved ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1 shrink-0" />
                    ) : isEnv ? (
                      <Wind className="w-3 h-3 text-cyan-400 mr-1 shrink-0 animate-pulse" />
                    ) : (
                      <Bell className="w-3 h-3 text-[#ff1744] mr-1 shrink-0 animate-bounce" />
                    )}

                    {/* 状态徽章：未处理 / 已处理 */}
                    <span className={`text-[9px] px-1 py-0.2 rounded mr-1 font-bold shrink-0 ${
                      isResolved
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : alert.dangerLevel === 'high'
                        ? 'bg-red-950 text-red-300 border border-red-500/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}>
                      {isResolved ? '已处理' : '未处理'}
                    </span>

                    {/* 类别微标签 */}
                    <span className={`text-[9px] px-1 py-0.2 rounded mr-1 font-medium shrink-0 ${
                      isEnv 
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-indigo-950/70 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {isEnv ? '环境' : '人员'}
                    </span>

                    {/* 时间 */}
                    <span className="font-mono text-[#8ab4f8] w-9 shrink-0 whitespace-nowrap">{alert.time}</span>

                    {/* 主体 */}
                    <span className="w-14 truncate text-[#e2f1ff] font-medium shrink-0 whitespace-nowrap" title={alert.name}>
                      {alert.name}
                    </span>

                    {/* 告警内容 */}
                    <span className={`flex-1 truncate px-1 whitespace-nowrap font-medium ${
                      isResolved ? 'text-slate-300' : 'text-[#ffb300] group-hover:text-white'
                    }`} title={alert.reason}>
                      {alert.reason}
                    </span>

                    {/* 位置 */}
                    <span className="text-[#8ab4f8] shrink-0 text-right text-[10px] whitespace-nowrap max-w-[55px] truncate" title={alert.location}>
                      {alert.location}
                    </span>
                  </div>
                );
              })}
            </div>
          </SciFiPanel>

          {/* 右2: 近7日告警趋势 (右上角“人员与环境事件合计数字眼”已删除) */}
          <SciFiPanel 
            title="近7日告警趋势" 
            icon={<TrendingUp className="w-3.5 h-3.5 text-[#ff1744]" />}
            className="h-[185px] shrink-0"
          >
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentAlarmTrendData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlarmTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff1744" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#ff1744" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#19426f" vertical={false} />
                  <XAxis dataKey="day" stroke="#8ab4f8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8ab4f8" fontSize={9} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(6, 24, 51, 0.95)', border: '1px solid #ff1744', color: '#e2f1ff', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value: any, name: any) => [`${value} 起`, name]}
                    labelFormatter={(label: any) => `日期: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="告警总数" 
                    stroke="#ff1744" 
                    fillOpacity={1} 
                    fill="url(#colorAlarmTotal)" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#ff1744', stroke: '#ffffff', strokeWidth: 1 }} 
                    activeDot={{ r: 5, fill: '#ff1744', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SciFiPanel>

          {/* 右3: 设备总览 */}
          <SciFiPanel 
            title="设备总览"
            icon={<Cpu className="w-3.5 h-3.5" />}
            className="flex-1 min-h-[220px]"
          >
            {/* 上半部4个状态指标 (圆角小徽章) */}
            <div className="grid grid-cols-4 gap-1.5 pb-2 mb-1.5 border-b border-[#1f4a7c]/50">
              {[
                { label: '设备总数', value: currentDeviceSummary.total, color: 'text-[#00d2ff]', bg: 'border-[#00d2ff]/40 bg-[#00d2ff]/10', icon: Server },
                { label: '在线设备', value: currentDeviceSummary.online, color: 'text-[#00e676]', bg: 'border-[#00e676]/40 bg-[#00e676]/10', icon: Activity },
                { label: '离线设备', value: currentDeviceSummary.offline, color: 'text-[#8ab4f8]', bg: 'border-[#8ab4f8]/40 bg-[#8ab4f8]/10', icon: Radio },
                { label: '在线率', value: `${((currentDeviceSummary.online / (currentDeviceSummary.total || 1)) * 100).toFixed(1)}%`, color: 'text-[#00e676]', bg: 'border-[#00e676]/40 bg-[#00e676]/10', icon: CheckCircle2 },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center p-1.5 rounded-xl bg-[#0b2447]/60 border border-[#19426f] whitespace-nowrap min-w-0">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center mb-0.5 shrink-0 ${stat.bg}`}>
                    <stat.icon className={`w-3 h-3 ${stat.color}`} />
                  </div>
                  <div className={`text-sm font-mono font-bold leading-tight whitespace-nowrap ${stat.color}`}>{stat.value}</div>
                  <div className="text-[9px] text-[#557696] mt-0.5 whitespace-nowrap truncate">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* 下半部：设备类型统计环形图 */}
            <div className="text-[11px] text-[#8ab4f8] mb-0.5 font-medium whitespace-nowrap">设备类型统计</div>
            <div className="flex-1 flex items-center">
              <div className="w-[115px] h-full relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentDeviceTypes}
                      innerRadius={26}
                      outerRadius={40}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {currentDeviceTypes.map((entry, index) => (
                        <Cell key={`cell-dev-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none whitespace-nowrap">
                  <span className="text-base font-bold font-mono text-white leading-none">{currentDeviceSummary.total}</span>
                  <span className="text-[9px] text-[#8ab4f8] mt-0.5">总设备数</span>
                </div>
              </div>

              {/* 图例 */}
              <div className="flex-1 flex flex-col gap-1.5 justify-center pl-1 min-w-0">
                {currentDeviceTypes.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-[11px] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[#8ab4f8] whitespace-nowrap">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                      <span className="whitespace-nowrap">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono whitespace-nowrap ml-1">
                      <span className="text-[#00d2ff] font-bold">{item.value}<span className="text-[10px] text-[#8ab4f8] font-normal ml-0.5">台</span></span>
                      <span className="text-[#8ab4f8] text-[10px]">({item.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SciFiPanel>

        </div>

      </div>

    </div>
  );
}
