import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  PenTool, 
  Plus, 
  Radio, 
  Check, 
  AlertCircle, 
  Trash2,
  Cpu,
  Layers,
  ChevronDown,
  Building2,
  Ship,
  Sparkles,
  Link,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export interface FenceData {
  id: string;
  code: string;
  name: string;
  scopeType: 'yard' | 'project'; // 归属范围：厂区公共 vs 项目工程
  yardArea?: string; // 厂区功能分区
  projectId?: string; // 关联造船项目ID (选择关联船舶项目时必填)
  projectName: string; // 显示名称
  projectPhase?: string; // 关联工程阶段 (选择关联船舶项目时必填)
  projectSection?: string; // 关联船体舱段/部位 (选择关联船舶项目时必填)
  modelLevel?: string; // 船型 3D BIM 模型分层代码 ('deck' | 'middle' | 'bottom' | 'engine' | 'bridge')
  modelLevelName?: string; // 船型模型分层名称
  type: string;
  color: string;
  shape: string;
  points: string;
  status: 'active' | 'inactive';
  dangerLevel: 'high' | 'medium' | 'low';
  deviceIds: string[];
  devices: { id: string; name: string; type: string; status: string }[];
  todayViolations: number;
}

interface CreateFenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fence: FenceData) => void;
  onStartDrawing?: (tempConfig: Partial<FenceData>) => void;
  currentProjectId?: string;
  drawnPoints?: string;
}

// 预设颜色池
const COLOR_OPTIONS = [
  { label: '珊瑚红 (高危)', value: '#ef4444' },
  { label: '金黄色 (预警)', value: '#f59e0b' },
  { label: '霓虹紫 (吊装)', value: '#d946ef' },
  { label: '青蓝色 (水域)', value: '#06b6d4' },
  { label: '翠绿色 (安全)', value: '#10b981' },
  { label: '科技蓝 (作业)', value: '#3b82f6' },
];

// 可用造船项目列表
const PROJECT_OPTIONS = [
  { id: 'PRJ-2026-LNG01', name: '17.4万m³ 薄膜型大型LNG船', code: 'HULL-LNG-174', shipType: 'LNG船' },
  { id: 'PRJ-2026-CTN02', name: '24000TEU 超大型集装箱船', code: 'HULL-CTN-240', shipType: '集装箱船' },
  { id: 'PRJ-2026-VLCC03', name: '30万吨级 超大型原油船(VLCC)', code: 'HULL-VLCC-300', shipType: '原油船' },
  { id: 'PRJ-2026-BULK04', name: '8.2万吨 卡姆萨尔型散货船', code: 'HULL-BULK-082', shipType: '散货船' },
];

// 厂区功能分区列表
const YARD_AREA_OPTIONS = [
  '全厂通用公共区域',
  '1#大型船台合拢滑道区',
  '2#干船坞总装区',
  '3号码头舾装泊位',
  '龙门吊核心起重作业带',
  '钢材下料与分段预处理车间',
  '涂装防腐与危化品库区',
  '管业加工与机加总装车间'
];

// 船型模型分层选项 (造船项目二级选择)
export const FENCE_MODEL_LAYER_OPTIONS = [
  { id: 'deck', name: '甲板层', fullName: '甲板层 (主甲板/露天作业区)' },
  { id: 'middle', name: '中舱层', fullName: '中舱层 (货舱上部/中层平台)' },
  { id: 'bottom', name: '底舱层', fullName: '底舱层 (双层底/压载密闭舱)' },
  { id: 'engine', name: '机舱区', fullName: '机舱动力区 (主机/辅机与管系舱)' },
  { id: 'bridge', name: '驾驶台', fullName: '驾驶台 (上层建筑/驾控生活区)' }
];

// 施工工程阶段列表
const PROJECT_PHASE_OPTIONS = [
  '请选择施工阶段',
  '分段制作与预装配',
  '船体合拢与主结构搭载',
  '密闭空间与绝热层铺设',
  '主甲板管系与电气舾装',
  '密闭舱室涂装与动火作业',
  '下水系泊调试阶段',
  '航行试验与交付阶段'
];

// 船体部位/舱段列表
const PROJECT_SECTION_OPTIONS = [
  '请选择船体舱段/部位',
  '全船通用作业面',
  '1#~4#液货舱 / 密闭舱室',
  '主甲板及管架区域',
  '机舱双层底及泵舱区',
  '艏楼与导轨架安装区',
  '驾驶甲板与上层建筑',
  '货油舱及压载舱'
];

// 围栏类型
const FENCE_TYPES = ['作业区', '禁入区', '危险区', '受限空间', '仓储区', '吊装警戒区'];

// 围栏形状
const FENCE_SHAPES = ['自定义', '多边形', '矩形', '圆形'];

// 候选硬件设备库 (带地图百分比坐标，用于根据绘制圈定围栏范围自动生成/识别关联设备)
export interface DeviceCandidate {
  id: string;
  name: string;
  type: string;
  status: string;
  x: number;
  y: number;
  zone: string;
}

const CANDIDATE_HARDWARE_DEVICES: DeviceCandidate[] = [
  { id: 'DEV-BS-01', name: '1#船台高精度定位主基站', type: '定位基站', status: '在线', x: 28, y: 32, zone: '1#船台合拢区' },
  { id: 'DEV-BS-02', name: '龙门吊G-01作业面基站', type: '定位基站', status: '在线', x: 42, y: 28, zone: '龙门吊起重带' },
  { id: 'DEV-GAS-01', name: '2#密闭货舱四合一气体检测仪', type: '气体检测仪', status: '在线', x: 35, y: 38, zone: '密闭舱室作业区' },
  { id: 'DEV-ALM-01', name: '大件吊装防碰高分贝声光报警器', type: '声光报警器', status: '在线', x: 30, y: 40, zone: '吊装警戒区' },
  { id: 'DEV-BS-03', name: '舾装码头水域微基站', type: '定位基站', status: '在线', x: 62, y: 72, zone: '3号码头泊位' },
  { id: 'DEV-GAS-02', name: '涂装车间VOC气体分析仪', type: '气体检测仪', status: '在线', x: 18, y: 65, zone: '涂装防腐车间' },
  { id: 'DEV-CAM-01', name: '全景AI高清晰度防护监控球机', type: 'AI监控枪机', status: '在线', x: 32, y: 30, zone: '围栏卡口监控' },
  { id: 'DEV-ENV-01', name: '多功能舱内温湿度微气象仪', type: '环境检测仪', status: '在线', x: 40, y: 42, zone: '舱内微气候' },
  { id: 'DEV-BS-04', name: '2#干船坞总装区对讲网关基站', type: '定位基站', status: '在线', x: 50, y: 45, zone: '干船坞总装区' },
  { id: 'DEV-ALM-02', name: '受限空间人员出入红外卡口广播器', type: '声光报警器', status: '在线', x: 25, y: 35, zone: '舱口通行控制' },
  { id: 'DEV-BS-05', name: '钢材下料车间定位微基站', type: '定位基站', status: '在线', x: 75, y: 25, zone: '钢材下料加工区' },
  { id: 'DEV-GAS-03', name: '管业车间易燃气体巡检仪', type: '气体检测仪', status: '在线', x: 80, y: 30, zone: '管业车间' }
];

// 解析坐标字符串为点的数组 [{x, y}]
function parsePointsString(pointsStr?: string): { x: number; y: number }[] {
  if (!pointsStr) return [];
  return pointsStr
    .trim()
    .split(/\s+/)
    .map(p => {
      const [x, y] = p.split(',').map(Number);
      return { x: Number(x) || 0, y: Number(y) || 0 };
    })
    .filter(pt => !isNaN(pt.x) && !isNaN(pt.y));
}

// 判断点 (x,y) 是否在绘制围栏圈定的多边形内部或在其缓冲范围内
function isDeviceInDrawnFence(
  dev: DeviceCandidate,
  polygon: { x: number; y: number }[]
): boolean {
  if (polygon.length < 3) return false;

  // 1. Ray Casting 算法几何包容判断
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > dev.y) !== (yj > dev.y)) &&
        (dev.x < (xj - xi) * (dev.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  if (inside) return true;

  // 2. 考虑绘制框缓冲容差 (5% 坐标缓冲区间)
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const pt of polygon) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  const buffer = 5;
  return (
    dev.x >= minX - buffer &&
    dev.x <= maxX + buffer &&
    dev.y >= minY - buffer &&
    dev.y <= maxY + buffer
  );
}

export function CreateFenceModal({
  isOpen,
  onClose,
  onConfirm,
  onStartDrawing,
  currentProjectId = 'yard',
  drawnPoints,
}: CreateFenceModalProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [fenceCode, setFenceCode] = useState('');
  const [fenceName, setFenceName] = useState('');
  
  // 归属类型 (必选项)：'yard' (厂区公共) 或 'project' (关联船舶项目)
  const [scopeType, setScopeType] = useState<'yard' | 'project'>(currentProjectId === 'yard' ? 'yard' : 'project');
  const [yardArea, setYardArea] = useState<string>('全厂通用公共区域');
  const [projectId, setProjectId] = useState<string>(currentProjectId === 'yard' ? 'PRJ-2026-LNG01' : currentProjectId);
  const [modelLevel, setModelLevel] = useState<string>('deck'); // 船型模型分层 (造船项目二级选择)
  const [projectPhase, setProjectPhase] = useState<string>('船体合拢与主结构搭载');
  const [projectSection, setProjectSection] = useState<string>('全船通用作业面');
  
  const [fenceType, setFenceType] = useState('作业区');
  const [fenceColor, setFenceColor] = useState('#ef4444');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [fenceShape, setFenceShape] = useState('自定义');
  
  // 根据绘制圈定范围自动生成的关联设备列表
  const [associatedDevices, setAssociatedDevices] = useState<DeviceCandidate[]>([]);
  const [isDeviceSelectOpen, setIsDeviceSelectOpen] = useState(false);

  // 表单校验状态
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. 初始化弹窗数据与编码
  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setFenceCode(`EF-2026-${randomNum}`);
      if (currentProjectId === 'yard') {
        setScopeType('yard');
      } else {
        setScopeType('project');
        setProjectId(currentProjectId);
      }
      setIsSubmitted(false);
    }
  }, [isOpen, currentProjectId]);

  // 2. 根据绘制围栏圈定的范围坐标自动显示变化生成的设备列表 (需求2)
  useEffect(() => {
    if (!isOpen) return;
    
    const activePointsStr = drawnPoints || '25,25 45,25 48,45 22,45';
    const polygon = parsePointsString(activePointsStr);
    
    if (polygon.length >= 3) {
      const autoDetected = CANDIDATE_HARDWARE_DEVICES.filter(dev => 
        isDeviceInDrawnFence(dev, polygon)
      );
      // 如果框选范围内存在设备，自动更新匹配；若无匹配则显示范围附近的前2台兜底设备
      if (autoDetected.length > 0) {
        setAssociatedDevices(autoDetected);
      } else {
        setAssociatedDevices(CANDIDATE_HARDWARE_DEVICES.slice(0, 2));
      }
    } else {
      setAssociatedDevices(CANDIDATE_HARDWARE_DEVICES.slice(0, 3));
    }
  }, [isOpen, drawnPoints]);

  if (!isOpen) return null;

  // 校验逻辑
  const isNameEmpty = !fenceName.trim();
  const isProjectIdEmpty = scopeType === 'project' && (!projectId || !projectId.trim());
  const isProjectPhaseEmpty = scopeType === 'project' && (!projectPhase || !projectPhase.trim() || projectPhase.includes('请选择'));
  const isModelLevelEmpty = scopeType === 'project' && !modelLevel;

  const showNameError = isSubmitted && isNameEmpty;
  const showProjectIdError = isSubmitted && isProjectIdEmpty;
  const showProjectPhaseError = isSubmitted && isProjectPhaseEmpty;
  const showModelLevelError = isSubmitted && isModelLevelEmpty;

  const handleConfirm = () => {
    setIsSubmitted(true);
    
    // 当选择关联船舶项目时，校验关联表单项为必填项
    if (isNameEmpty || isProjectIdEmpty || isProjectPhaseEmpty || isModelLevelEmpty) {
      return;
    }

    const selectedProj = PROJECT_OPTIONS.find(p => p.id === projectId);
    const projectName = scopeType === 'yard' 
      ? `东南造船厂 (厂区公共区域)`
      : (selectedProj ? selectedProj.name : '造船工程项目');

    const selectedLayer = FENCE_MODEL_LAYER_OPTIONS.find(l => l.id === modelLevel);

    const newFence: FenceData = {
      id: `FENCE-${Date.now()}`,
      code: fenceCode,
      name: fenceName.trim(),
      scopeType: scopeType,
      yardArea: scopeType === 'yard' ? yardArea : undefined,
      projectId: scopeType === 'project' ? projectId : 'yard',
      projectName: projectName,
      projectPhase: scopeType === 'project' ? projectPhase : undefined,
      projectSection: scopeType === 'project' ? projectSection : undefined,
      modelLevel: scopeType === 'project' ? modelLevel : undefined,
      modelLevelName: scopeType === 'project' ? (selectedLayer ? selectedLayer.fullName : '甲板层') : undefined,
      type: fenceType,
      color: fenceColor,
      shape: fenceShape,
      points: drawnPoints || '25,25 45,25 48,45 22,45',
      status: 'active',
      dangerLevel: fenceType === '禁入区' || fenceType === '危险区' || fenceType === '吊装警戒区' ? 'high' : fenceType === '受限空间' ? 'medium' : 'low',
      deviceIds: associatedDevices.map(d => d.id),
      devices: associatedDevices,
      todayViolations: 0
    };

    onConfirm(newFence);
    handleClose();
  };

  const handleClose = () => {
    setFenceName('');
    setAssociatedDevices([]);
    setIsSubmitted(false);
    setIsColorPickerOpen(false);
    setIsDeviceSelectOpen(false);
    onClose();
  };

  const handleDrawClick = () => {
    if (onStartDrawing) {
      onStartDrawing({
        code: fenceCode,
        name: fenceName,
        scopeType,
        yardArea,
        projectId: scopeType === 'project' ? projectId : 'yard',
        projectPhase,
        projectSection,
        type: fenceType,
        color: fenceColor,
        shape: fenceShape
      });
    }
  };

  const toggleDeviceSelection = (device: DeviceCandidate) => {
    if (associatedDevices.some(d => d.id === device.id)) {
      setAssociatedDevices(associatedDevices.filter(d => d.id !== device.id));
    } else {
      setAssociatedDevices([...associatedDevices, device]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn select-none">
      <div 
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ${
          isMaximized ? 'w-full h-full max-w-none rounded-none' : 'w-full max-w-2xl max-h-[92vh]'
        }`}
      >
        {/* 弹窗头部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
            <h2 className="text-base font-bold text-slate-800 tracking-wide">新增电子围栏</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title={isMaximized ? "还原" : "最大化"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 弹窗内容表单区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
          {/* 1. 围栏编号 */}
          <div className="flex items-center">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 shrink-0">
              围栏编号
            </label>
            <div className="flex-1">
              <input
                type="text"
                disabled
                value={fenceCode}
                placeholder="围栏编号无需输入系统自动生成"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-500 font-mono text-sm placeholder:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* 2. 围栏名称 (必填) */}
          <div className="flex items-start">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 pt-2 shrink-0">
              <span className="text-rose-500 font-bold mr-1">*</span>围栏名称
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={fenceName}
                onChange={(e) => setFenceName(e.target.value)}
                placeholder="请输入围栏名称，例如：1#液货舱密闭作业区 / 龙门吊警戒带"
                className={`w-full px-3.5 py-2 bg-white border rounded-md text-slate-800 text-sm focus:outline-none transition-colors ${
                  showNameError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                }`}
              />
              {showNameError && (
                <div className="text-rose-500 text-xs mt-1 font-normal flex items-center gap-1">
                  <span>围栏名称不能为空</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. 🎯 归属范围 (需求1：打红星号，为必选项) */}
          <div className="flex items-start">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 pt-2 shrink-0">
              <span className="text-rose-500 font-bold mr-1">*</span>归属范围
            </label>
            <div className="flex-1 space-y-3">
              {/* 归属范围选项 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  onClick={() => setScopeType('yard')}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                    scopeType === 'yard'
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                    scopeType === 'yard' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                      <span>厂区公共区域 / 设施</span>
                      {scopeType === 'yard' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">当前生效</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      属于船厂公共作业区（如船台、码头、龙门吊区等），全厂通用
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setScopeType('project')}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                    scopeType === 'project'
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                    scopeType === 'project' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Ship className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                      <span>关联船舶工程项目</span>
                      <span className="text-[10px] text-rose-600 bg-rose-50 font-bold px-1 rounded border border-rose-200">必填3项关联</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      定向关联具体船舶工程，联动施工阶段与舱段部位
                    </p>
                  </div>
                </div>
              </div>

              {/* 展开的关联详情表单块 */}
              {scopeType === 'yard' ? (
                /* 厂区公共区域配置 (已删除细化功能分区选择) */
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2 text-xs text-slate-600 animate-fadeIn">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>厂区公共围栏对进入该物理区域的所有在厂人员与作业班组通用生效，无需再细化选择功能区域。</span>
                </div>
              ) : (
                /* 关联船舶工程项目配置 (需求1：选择关联船舶项目时，三个关联表单项改为必填项，并打上红色星号) */
                <div className="bg-blue-50/40 border border-blue-200 rounded-lg p-3.5 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-b border-blue-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Link className="w-4 h-4 text-blue-600" />
                      <span>船舶工程关联必填信息 (关联模式下3项均为必填)</span>
                    </div>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
                      * 包含3个必填项
                    </span>
                  </div>

                  {/* 1) 关联造船项目 (必填，带红星号) */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center">
                      <span className="text-rose-500 font-bold mr-1">*</span>关联造船项目
                    </label>
                    <div className="relative">
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className={`w-full px-3 py-1.5 bg-white border rounded-md text-xs text-slate-800 focus:outline-none transition-colors appearance-none cursor-pointer pr-8 ${
                          showProjectIdError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      >
                        {PROJECT_OPTIONS.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.name} ({proj.shipType})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {showProjectIdError && (
                      <p className="text-rose-500 text-[11px] mt-1 font-normal">请选择关联的造船项目</p>
                    )}
                  </div>

                  {/* 2) 关联施工阶段 & 3) 船体舱段与 3D BIM 模型分层 (二级选择合并，显示分层数据) */}
                  <div className="grid grid-cols-2 gap-3 pt-0.5">
                    {/* 关联施工阶段 */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center">
                        <span className="text-rose-500 font-bold mr-1">*</span>关联施工阶段
                      </label>
                      <div className="relative">
                        <select
                          value={projectPhase}
                          onChange={(e) => setProjectPhase(e.target.value)}
                          className={`w-full px-2.5 py-1.5 bg-white border rounded-md text-xs text-slate-800 focus:outline-none transition-colors appearance-none cursor-pointer pr-7 truncate ${
                            showProjectPhaseError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-300 focus:border-blue-500'
                          }`}
                        >
                          {PROJECT_PHASE_OPTIONS.map((phase) => (
                            <option key={phase} value={phase}>
                              {phase}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {showProjectPhaseError && (
                        <p className="text-rose-500 text-[11px] mt-1 font-normal">请选择工程施工阶段</p>
                      )}
                    </div>

                    {/* 3D BIM 模型分层 */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span className="flex items-center">
                          <span className="text-rose-500 font-bold mr-1">*</span>模型分层 (3D BIM)
                        </span>
                        <span className="text-[10px] text-blue-600 font-normal">二级立体选择</span>
                      </label>
                      <div className="relative">
                        <select
                          value={modelLevel}
                          onChange={(e) => {
                            const val = e.target.value;
                            setModelLevel(val);
                            const matchedLayer = FENCE_MODEL_LAYER_OPTIONS.find(l => l.id === val);
                            if (matchedLayer) {
                              setProjectSection(matchedLayer.fullName);
                            }
                          }}
                          className={`w-full px-2.5 py-1.5 bg-white border rounded-md text-xs text-slate-800 focus:outline-none transition-colors appearance-none cursor-pointer pr-7 truncate font-medium ${
                            showModelLevelError ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-blue-300 focus:border-blue-500 bg-blue-50/20'
                          }`}
                        >
                          {FENCE_MODEL_LAYER_OPTIONS.map((layer) => (
                            <option key={layer.id} value={layer.id}>
                              {layer.fullName}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {showModelLevelError && (
                        <p className="text-rose-500 text-[11px] mt-1 font-normal">请选择模型分层</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4. 围栏类型 (必填) */}
          <div className="flex items-center">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 shrink-0">
              <span className="text-rose-500 font-bold mr-1">*</span>围栏类型
            </label>
            <div className="flex-1 relative">
              <select
                value={fenceType}
                onChange={(e) => setFenceType(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer pr-9"
              >
                {FENCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 5. 围栏颜色 (必填) */}
          <div className="flex items-center">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 shrink-0">
              <span className="text-rose-500 font-bold mr-1">*</span>围栏颜色
            </label>
            <div className="flex-1 relative">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className="w-9 h-9 rounded-md border border-slate-300 flex items-center justify-center p-1 cursor-pointer shadow-sm hover:border-slate-400 transition-colors relative"
                  style={{ backgroundColor: fenceColor }}
                  title="选择颜色"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                </button>
                <span className="text-xs text-slate-500 font-mono">{fenceColor}</span>
              </div>

              {/* 颜色下拉选择盘 */}
              {isColorPickerOpen && (
                <div className="absolute left-0 top-11 z-30 bg-white border border-slate-200 rounded-lg shadow-xl p-2 flex gap-2 animate-fadeIn">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => {
                        setFenceColor(col.value);
                        setIsColorPickerOpen(false);
                      }}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
                        fenceColor === col.value ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: col.value }}
                      title={col.label}
                    >
                      {fenceColor === col.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. 围栏形状 (必填) */}
          <div className="flex items-center">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 shrink-0">
              <span className="text-rose-500 font-bold mr-1">*</span>围栏形状
            </label>
            <div className="flex-1 relative">
              <select
                value={fenceShape}
                onChange={(e) => setFenceShape(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-md text-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer pr-9"
              >
                {FENCE_SHAPES.map((shape) => (
                  <option key={shape} value={shape}>
                    {shape}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 7. 绘制围栏 (必填按钮) */}
          <div className="flex items-center">
            <label className="w-24 text-right pr-4 font-medium text-slate-600 shrink-0">
              <span className="text-rose-500 font-bold mr-1">*</span>绘制围栏
            </label>
            <div className="flex-1 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDrawClick}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium inline-flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>绘制围栏</span>
              </button>
              {drawnPoints ? (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> 空间多边形坐标已就绪
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  点击按钮可在地图底图上点击绘制围栏轮廓
                </span>
              )}
            </div>
          </div>

          {/* 分割线 */}
          <div className="pt-2 border-t border-slate-100"></div>

          {/* 8. 🎯 关联设备信息 (需求2：根据绘制围栏圈定的范围自动显示变化生成的设备列表) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">关联设备信息</h3>
                <span className="text-[11px] text-blue-700 bg-blue-50 font-semibold px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  图形圈定自动挂载
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDeviceSelectOpen(!isDeviceSelectOpen)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200/60 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isDeviceSelectOpen ? '收起设备选择' : '手动增减设备'}</span>
              </button>
            </div>

            {/* 自动识别匹配提示条 */}
            <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
                <span>
                  系统已根据围栏圈定范围坐标 <strong className="font-mono text-blue-700 font-bold">[{drawnPoints || '25,25 45,25...'}]</strong> 自动识别并挂载 <strong className="text-indigo-700 font-bold text-sm px-1">{associatedDevices.length}</strong> 台作业设备
                </span>
              </div>
            </div>

            {/* 可手动勾选备选设备面板 */}
            {isDeviceSelectOpen && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 animate-fadeIn">
                <div className="text-xs font-semibold text-slate-600 mb-1.5">可补充或勾选其他硬件设备：</div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {CANDIDATE_HARDWARE_DEVICES.map((dev) => {
                    const isSelected = associatedDevices.some(d => d.id === dev.id);
                    return (
                      <div
                        key={dev.id}
                        onClick={() => toggleDeviceSelection(dev)}
                        className={`p-2 rounded-md border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate font-medium">{dev.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <span className="text-[10px] text-slate-500 font-mono">{dev.type}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 根据圈定范围自动生成的关联设备列表 */}
            {associatedDevices.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-20 h-20 mb-2 relative flex items-center justify-center opacity-80">
                  <svg className="w-16 h-16 text-slate-300" viewBox="0 0 100 100" fill="none">
                    <path d="M50 15 L85 35 L50 55 L15 35 Z" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.5" />
                    <path d="M15 35 L50 55 L50 90 L15 70 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                    <path d="M85 35 L50 55 L50 90 L85 70 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                  </svg>
                </div>
                <p className="text-xs text-slate-400 font-medium">当前圈定范围内未检测到硬件设备，可手动添加</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {associatedDevices.map((dev) => (
                  <div 
                    key={dev.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-lg text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-bold text-slate-800">{dev.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({dev.id})</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> 围栏圈定自动生成
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        {dev.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleDeviceSelection(dev)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="移除关联"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 弹窗底部按钮栏 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0 rounded-b-xl">
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm transition-colors active:scale-95 cursor-pointer"
          >
            确定
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium transition-colors cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

