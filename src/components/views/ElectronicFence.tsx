import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  Ship, 
  Building2, 
  Layers, 
  Search, 
  Radio, 
  CheckCircle2, 
  Flame, 
  Volume2, 
  Eye, 
  EyeOff, 
  PenTool, 
  Trash2, 
  RefreshCw,
  Info,
  Maximize2,
  Filter,
  Check,
  ChevronDown,
  Link,
  ShieldCheck,
  Boxes,
  Anchor
} from 'lucide-react';
import { CreateFenceModal, FenceData, FENCE_MODEL_LAYER_OPTIONS } from './CreateFenceModal';

// 导入船模背景图
import lngModelBg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerModelBg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerModelBg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkModelBg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';

// 预设项目配置
interface ProjectConfig {
  id: string;
  name: string;
  code: string;
  shipType: string;
  phase: string;
  progress: number;
  bgImage: string;
}

const PROJECTS_CONFIG: ProjectConfig[] = [
  { id: 'yard', name: '东南造船厂 (厂区全景)', code: 'YARD-01', shipType: '厂区全貌', phase: '全区通览', progress: 100, bgImage: '/assets/shipyard_wide_bg.jpg' },
  { id: 'PRJ-2026-LNG01', name: '17.4万m³ 薄膜型大型LNG船', code: 'HULL-LNG-174', shipType: 'LNG船', phase: '合拢焊接', progress: 45, bgImage: lngModelBg },
  { id: 'PRJ-2026-CTN02', name: '24000TEU 超大型集装箱船', code: 'HULL-CTN-240', shipType: '集装箱船', phase: '系泊试验', progress: 85, bgImage: containerModelBg },
  { id: 'PRJ-2026-VLCC03', name: '30万吨级 超大型原油船(VLCC)', code: 'HULL-VLCC-300', shipType: '原油船', phase: '密闭涂装', progress: 60, bgImage: tankerModelBg },
  { id: 'PRJ-2026-BULK04', name: '8.2万吨 卡姆萨尔型散货船', code: 'HULL-BULK-082', shipType: '散货船', phase: '分段搭载', progress: 30, bgImage: bulkModelBg },
];

const SHIP_PROJECTS = PROJECTS_CONFIG.filter(p => p.id !== 'yard');

// 初始内置电子围栏数据池 (包含厂区公共和船舶项目关联)
const INITIAL_FENCES: FenceData[] = [
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
    color: '#10b981',
    shape: '多边形',
    points: '6.3,5.0 20.6,5.0 23.9,16.5 10.7,17.6 6.3,13.8',
    status: 'active',
    dangerLevel: 'low',
    deviceIds: [],
    devices: [],
    todayViolations: 0
  },

  // 2. LNG船项目关联围栏 (弱关联特定造船工程项目)
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

// 实时越界告警流水模拟数据
interface ViolationAlert {
  id: string;
  time: string;
  fenceName: string;
  fenceCode: string;
  personName: string;
  personCode: string;
  duration: string;
  status: 'unhandled' | 'broadcasted' | 'handled';
}

const INITIAL_ALERTS: ViolationAlert[] = [
  {
    id: 'ALT-01',
    time: '10:42:15',
    fenceName: '龙门吊核心起重作业警戒区',
    fenceCode: 'EF-2026-001',
    personName: '刘强',
    personCode: 'EMP-042',
    duration: '45s',
    status: 'unhandled'
  },
  {
    id: 'ALT-02',
    time: '09:28:40',
    fenceName: '1#液货舱绝热合拢受限空间',
    fenceCode: 'EF-LNG-001',
    personName: '王建国',
    personCode: 'EMP-018',
    duration: '1m 15s',
    status: 'broadcasted'
  },
  {
    id: 'ALT-03',
    time: '08:12:30',
    fenceName: '3号码头舾装泊位水域管制区',
    fenceCode: 'EF-2026-003',
    personName: '张伟',
    personCode: 'EMP-015',
    duration: '1m 20s',
    status: 'handled'
  }
];

export function ElectronicFence() {
  // 当前视图模式 ('yard' 厂区全景 vs 'project' 造船项目)
  const [mapViewMode, setMapViewMode] = useState<'yard' | 'project'>('yard');
  // 当前选中的造船项目ID (默认第一个造船项目)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(SHIP_PROJECTS[0].id);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  // 🎯 造船项目二级分层选择状态 ('all' | 'deck' | 'middle' | 'bottom' | 'engine' | 'bridge')
  const [selectedModelLevel, setSelectedModelLevel] = useState<string>('all');
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);

  const [fences, setFences] = useState<FenceData[]>(INITIAL_FENCES);
  const [selectedFenceId, setSelectedFenceId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'yard' | 'project'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [alerts, setAlerts] = useState<ViolationAlert[]>(INITIAL_ALERTS);
  const [broadcastTip, setBroadcastTip] = useState<string | null>(null);

  // 绘制模式相关状态
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawnPointsArray, setDrawnPointsArray] = useState<{ x: number; y: number }[]>([]);
  const [tempDrawingConfig, setTempDrawingConfig] = useState<Partial<FenceData> | null>(null);

  // 获取当前生效项目/全景配置
  const currentProject = mapViewMode === 'yard' 
    ? (PROJECTS_CONFIG.find(p => p.id === 'yard') || PROJECTS_CONFIG[0])
    : (PROJECTS_CONFIG.find(p => p.id === selectedProjectId) || SHIP_PROJECTS[0]);

  // 当前视图对应的围栏列表 (如果在厂区视图则展示所有厂区围栏，如果在项目视图则展示该造船项目及其分层专属围栏)
  const currentViewFences = fences.filter(f => {
    if (mapViewMode === 'yard') {
      return f.scopeType === 'yard' || !f.projectId || f.projectId === 'yard';
    }
    const matchesProject = f.projectId === currentProject.id || (f.scopeType === 'project' && f.projectId === currentProject.id);
    const matchesLayer = selectedModelLevel === 'all' || !f.modelLevel || f.modelLevel === selectedModelLevel;
    return matchesProject && matchesLayer;
  });

  // 过滤后的列表 (结合搜索、归属范围、类型与分层)
  const filteredFences = fences.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                          f.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          (f.projectName && f.projectName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                          (f.projectPhase && f.projectPhase.toLowerCase().includes(searchKeyword.toLowerCase())) ||
                          (f.modelLevelName && f.modelLevelName.toLowerCase().includes(searchKeyword.toLowerCase()));
    const matchesScope = scopeFilter === 'all' || f.scopeType === scopeFilter;
    const matchesType = typeFilter === 'all' || f.type === typeFilter;
    const matchesLayer = selectedModelLevel === 'all' || scopeFilter === 'yard' || !f.modelLevel || f.modelLevel === selectedModelLevel;
    return matchesSearch && matchesScope && matchesType && matchesLayer;
  });

  // 选中的围栏对象
  const activeFence = fences.find(f => f.id === selectedFenceId) || null;

  // 新增围栏确认回调
  const handleCreateConfirm = (newFence: FenceData) => {
    setFences(prev => [newFence, ...prev]);
    setSelectedFenceId(newFence.id);
    if (newFence.scopeType === 'project' && newFence.projectId && newFence.projectId !== 'yard') {
      setMapViewMode('project');
      setSelectedProjectId(newFence.projectId);
    } else if (newFence.scopeType === 'yard') {
      setMapViewMode('yard');
    }
    setIsDrawingMode(false);
    setDrawnPointsArray([]);
  };

  // 开始在地图上绘制围栏
  const handleStartDrawing = (tempConfig: Partial<FenceData>) => {
    setTempDrawingConfig(tempConfig);
    setIsCreateModalOpen(false);
    setIsDrawingMode(true);
    setDrawnPointsArray([]);
  };

  // 地图点击打点 (绘制多边形)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isProjectDropdownOpen) {
      setIsProjectDropdownOpen(false);
    }
    if (!isDrawingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setDrawnPointsArray(prev => [...prev, { x, y }]);
  };

  // 完成绘制
  const handleFinishDrawing = () => {
    if (drawnPointsArray.length < 3) {
      alert('请在地图上至少点击3个点以构成闭合围栏多边形！');
      return;
    }
    setIsDrawingMode(false);
    setIsCreateModalOpen(true);
  };

  // 取消绘制
  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setDrawnPointsArray([]);
    setIsCreateModalOpen(true);
  };

  // 广播驱离处理
  const handleBroadcastEviction = (alertItem: ViolationAlert) => {
    setAlerts(prev => prev.map(a => a.id === alertItem.id ? { ...a, status: 'broadcasted' } : a));
    setBroadcastTip(`已向人员【${alertItem.personName} (${alertItem.personCode})】下发防爆定位手环高频震动及区域声光广播！`);
    setTimeout(() => {
      setBroadcastTip(null);
    }, 4000);
  };

  // 人工处理
  const handleMarkHandled = (alertItem: ViolationAlert) => {
    setAlerts(prev => prev.map(a => a.id === alertItem.id ? { ...a, status: 'handled' } : a));
  };

  // 删除围栏
  const handleDeleteFence = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除该电子围栏策略吗？')) {
      setFences(prev => prev.filter(f => f.id !== id));
      if (selectedFenceId === id) {
        setSelectedFenceId(null);
      }
    }
  };

  // 切换围栏生效状态
  const handleToggleFenceStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFences(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: f.status === 'active' ? 'inactive' : 'active'
        };
      }
      return f;
    }));
  };

  return (
    <div className="flex h-full gap-3 select-none">
      {/* 广播驱离全局浮动提示 */}
      {broadcastTip && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-5 py-2.5 rounded-lg shadow-xl border border-blue-500/50 flex items-center gap-2.5 text-xs animate-fadeIn backdrop-blur-md">
          <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="font-medium">{broadcastTip}</span>
        </div>
      )}

      {/* ===================== 左侧：电子围栏策略列表 ===================== */}
      <div className="w-80 bg-white shadow-sm border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0">
        {/* 1. 顶部标题栏 + 【+ 增加围栏】按钮 */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              电子围栏策略 ({filteredFences.length})
            </h3>
          </div>
          
          {/* 🎯 增加围栏功能按钮 */}
          <button 
            type="button"
            onClick={() => {
              setIsDrawingMode(false);
              setDrawnPointsArray([]);
              setIsCreateModalOpen(true);
            }}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-md text-xs font-medium inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            title="增加电子围栏"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>增加围栏</span>
          </button>
        </div>

        {/* 2. 搜索与多维度筛选器 (支持归属范围与类型) */}
        <div className="p-2.5 border-b border-slate-100 bg-white space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索围栏名称/编号/项目/阶段..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 归属范围切换胶囊：全部 / 厂区公共 / 项目工程 */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`flex-1 py-1 rounded-md text-center font-medium transition-colors cursor-pointer ${
                scopeFilter === 'all' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              全部范围
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('yard')}
              className={`flex-1 py-1 rounded-md text-center font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                scopeFilter === 'yard' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>厂区公共</span>
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('project')}
              className={`flex-1 py-1 rounded-md text-center font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                scopeFilter === 'project' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Ship className="w-3 h-3" />
              <span>项目工程</span>
            </button>
          </div>

          {/* 围栏类型筛选 */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
            {['all', '作业区', '禁入区', '危险区', '受限空间', '吊装警戒区'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors font-medium cursor-pointer ${
                  typeFilter === type
                    ? 'bg-blue-100 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {type === 'all' ? '全部类型' : type}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 围栏策略卡片列表 */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
          {filteredFences.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>当前筛选条件暂无匹配的电子围栏</p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 text-blue-600 hover:underline inline-flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3" /> 点击立即创建
              </button>
            </div>
          ) : (
            filteredFences.map((fence) => {
              const isSelected = selectedFenceId === fence.id;
              return (
                <div 
                  key={fence.id}
                  onClick={() => {
                    setSelectedFenceId(fence.id);
                    if (fence.scopeType === 'project') {
                      setMapViewMode('project');
                      if (fence.projectId && fence.projectId !== 'yard') {
                        setSelectedProjectId(fence.projectId);
                      }
                    } else {
                      setMapViewMode('yard');
                    }
                  }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'bg-blue-50/70 border-blue-400 shadow-md ring-1 ring-blue-400/50' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* 卡片头部：名称与管控等级 */}
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: fence.color }}
                      ></span>
                      <span className="font-bold text-slate-800 text-xs truncate">
                        {fence.name}
                      </span>
                    </div>

                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                      fence.dangerLevel === 'high' 
                        ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : fence.dangerLevel === 'medium'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {fence.type}
                    </span>
                  </div>

                  {/* 🎯 归属与项目关联信息展示 */}
                  <div className="mb-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{fence.code}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-sans font-medium ${
                        fence.scopeType === 'yard'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {fence.scopeType === 'yard' ? <Building2 className="w-2.5 h-2.5" /> : <Ship className="w-2.5 h-2.5" />}
                        <span>{fence.scopeType === 'yard' ? '厂区公共' : '项目工程'}</span>
                      </span>
                    </div>

                    {/* 归属详情标注 */}
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 truncate flex-wrap">
                      {fence.scopeType === 'yard' ? (
                        <span className="text-slate-500 truncate">
                          区域: <strong className="text-slate-700 font-medium">{fence.yardArea || '全厂公共区域'}</strong>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 truncate flex-wrap">
                          <span className="text-slate-500 truncate">
                            项目: <strong className="text-blue-700 font-medium">{fence.projectName}</strong>
                          </span>
                          {fence.modelLevelName && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-medium shrink-0">
                              <Layers className="w-2.5 h-2.5 text-cyan-600" />
                              <span>{fence.modelLevelName.split(' ')[0]}</span>
                            </span>
                          )}
                          {fence.projectPhase && <span className="text-slate-400 font-normal">· {fence.projectPhase}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 关联设备信息 & 今日越界统计 */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFenceStatus(fence.id, e)}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors cursor-pointer ${
                          fence.status === 'active' 
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                            : 'text-slate-400 bg-slate-100 border border-slate-200'
                        }`}
                        title="切换生效状态"
                      >
                        {fence.status === 'active' ? '✓ 生效中' : '✕ 已停用'}
                      </button>
                      <span className="text-slate-400 text-[10px]">
                        设备: <strong className="text-slate-700">{fence.devices.length}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px]">
                        越界: <span className={`font-mono font-bold ${fence.todayViolations > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{fence.todayViolations}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteFence(fence.id, e)}
                        className="text-slate-300 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        title="删除围栏"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===================== 右侧：地图看板与实时告警流水 ===================== */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 h-full">
        {/* 1. 电子围栏地图 (支持加载驾驶舱高清背景图 + 船厂与项目视图切换) */}
        <div className="flex-1 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-[#020b14] relative flex flex-col min-h-[380px]">
          {/* 🎯 顶部工具条：驾驶舱风格「厂区全景」/「造船项目」双视图切换栏与项目专属选择器 */}
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2 flex-wrap">
            {/* 视图双切换胶囊按钮 */}
            <div className="flex items-center bg-[#071d3d]/90 p-0.5 rounded-full border border-[#1f4a7c] shadow-[0_0_16px_rgba(0,210,255,0.25)] backdrop-blur-md">
              {/* 厂区全景按钮 */}
              <button
                type="button"
                onClick={() => {
                  setMapViewMode('yard');
                  setIsProjectDropdownOpen(false);
                  setSelectedFenceId(null);
                }}
                className={`px-3.5 py-1 text-xs font-bold tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  mapViewMode === 'yard'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_14px_rgba(0,210,255,0.7)]'
                    : 'text-[#8ab4f8] hover:text-white hover:bg-[#0c315e]/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>厂区全景</span>
              </button>

              {/* 造船项目按钮 */}
              <button
                type="button"
                onClick={() => {
                  setMapViewMode('project');
                  // 只有当选择造船项目时才显示项目选择，默认切换为第一个项目
                  if (!selectedProjectId || selectedProjectId === 'yard') {
                    setSelectedProjectId(SHIP_PROJECTS[0].id);
                  }
                  setSelectedFenceId(null);
                }}
                className={`px-3.5 py-1 text-xs font-bold tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  mapViewMode === 'project'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_14px_rgba(0,210,255,0.7)]'
                    : 'text-[#8ab4f8] hover:text-white hover:bg-[#0c315e]/50'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>造船项目</span>
              </button>
            </div>

            {/* 🎯 当处于“造船项目”视图时，展示一级造船项目选择胶囊与二级模型分层选择胶囊 */}
            {mapViewMode === 'project' && (
              <>
                {/* 1. 一级：造船项目选择器 */}
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProjectDropdownOpen(!isProjectDropdownOpen);
                      setIsLayerDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 bg-[#0a264a]/90 hover:bg-[#0f3466] border border-[#00d2ff]/80 px-3.5 py-1 rounded-full text-xs text-[#e2f1ff] shadow-[0_0_14px_rgba(0,210,255,0.35)] transition-all duration-200 cursor-pointer backdrop-blur-md"
                  >
                    <Anchor className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span className="font-bold text-[#00d2ff]">{currentProject.name}</span>
                    <span className="text-[10px] bg-blue-500/20 text-[#8ab4f8] px-1.5 py-0.5 rounded border border-blue-400/30">
                      {currentProject.phase}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#00d2ff] transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 科技感项目下拉弹窗 */}
                  {isProjectDropdownOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 left-0 w-80 bg-[#061833]/98 border border-[#00d2ff] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(0,210,255,0.4)] backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      <div className="text-[10px] font-bold text-[#8ab4f8] px-2.5 py-1 border-b border-blue-900/60 mb-1 flex items-center justify-between">
                        <span>选择在建造船项目模型</span>
                        <span className="font-mono text-cyan-400">共 {SHIP_PROJECTS.length} 个项目</span>
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                        {SHIP_PROJECTS.map((proj) => {
                          const isCurrentActive = proj.id === currentProject.id;
                          return (
                            <div
                              key={proj.id}
                              onClick={() => {
                                setSelectedProjectId(proj.id);
                                setIsProjectDropdownOpen(false);
                                setSelectedFenceId(null);
                              }}
                              className={`p-2 rounded-xl cursor-pointer transition-all border ${
                                isCurrentActive
                                  ? 'bg-blue-600/30 border-[#00d2ff] text-white shadow-sm'
                                  : 'bg-[#0a264a]/60 border-transparent text-slate-300 hover:bg-[#0f3466] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="font-bold text-xs text-[#00d2ff] truncate">{proj.name}</span>
                                <span className="text-[9px] bg-blue-500/20 text-[#8ab4f8] px-1.5 py-0.2 rounded border border-blue-400/30">
                                  {proj.phase}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>编号: {proj.code} · {proj.shipType}</span>
                                <span className="font-mono text-emerald-400">进度: {proj.progress}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. 二级：造船项目 3D BIM 模型分层选择器胶囊 */}
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLayerDropdownOpen(!isLayerDropdownOpen);
                      setIsProjectDropdownOpen(false);
                    }}
                    className="flex items-center gap-1.5 bg-[#0a264a]/90 hover:bg-[#0f3466] border border-cyan-400/70 px-3 py-1 rounded-full text-xs text-[#e2f1ff] shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all duration-200 cursor-pointer backdrop-blur-md"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[#8ab4f8]">模型分层:</span>
                    <span className="font-bold text-cyan-300">
                      {selectedModelLevel === 'all' 
                        ? '全部分层' 
                        : FENCE_MODEL_LAYER_OPTIONS.find(l => l.id === selectedModelLevel)?.name || '全部分层'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${isLayerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* 分层下拉选择框 (自适应文本宽度) */}
                  {isLayerDropdownOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 left-0 w-max min-w-full bg-[#061833]/98 border border-cyan-400/80 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(0,229,255,0.3)] backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 whitespace-nowrap"
                    >
                      <div className="text-[10px] font-bold text-[#8ab4f8] px-2 py-1 border-b border-blue-900/60 mb-1 flex items-center justify-between gap-4 whitespace-nowrap">
                        <span>造船项目 BIM 二级模型分层</span>
                        <span className="text-cyan-400">3D空间围栏</span>
                      </div>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModelLevel('all');
                            setIsLayerDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                            selectedModelLevel === 'all'
                              ? 'bg-blue-600/40 border border-cyan-400 text-white font-bold'
                              : 'text-slate-300 hover:bg-[#0f3466] hover:text-white'
                          }`}
                        >
                          <span>🌐 全部模型分层</span>
                          {selectedModelLevel === 'all' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>

                        {FENCE_MODEL_LAYER_OPTIONS.map((layer) => {
                          const isSelected = selectedModelLevel === layer.id;
                          return (
                            <button
                              key={layer.id}
                              type="button"
                              onClick={() => {
                                setSelectedModelLevel(layer.id);
                                setIsLayerDropdownOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600/40 border border-cyan-400 text-white font-bold'
                                  : 'text-slate-300 hover:bg-[#0f3466] hover:text-white'
                              }`}
                            >
                              <div>
                                <span className="font-bold text-cyan-300 mr-1.5">[{layer.name}]</span>
                                <span className="text-[11px] text-slate-400">{layer.fullName.split(' ')[1] || ''}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 统计提示胶囊 */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/85 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-300 backdrop-blur-md shadow-md">
              <span className="text-slate-400">当前管控围栏:</span>
              <span className="font-mono font-bold text-cyan-400">{currentViewFences.length}</span>
              <span className="text-slate-500">处</span>
            </div>
          </div>

          {/* 右上角地图控制工具栏 */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            {isDrawingMode ? (
              <div className="bg-amber-950/90 border border-amber-500/80 rounded-lg p-1.5 flex items-center gap-2 text-amber-200 text-xs shadow-xl backdrop-blur-md animate-fadeIn">
                <span className="font-bold flex items-center gap-1 px-1">
                  <PenTool className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  已定点: <strong className="font-mono text-white">{drawnPointsArray.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleFinishDrawing}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  完成绘制
                </button>
                <button
                  type="button"
                  onClick={() => setDrawnPointsArray([])}
                  className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition-colors cursor-pointer"
                >
                  重置
                </button>
                <button
                  type="button"
                  onClick={handleCancelDrawing}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 flex items-center gap-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    handleStartDrawing({ 
                      projectId: mapViewMode === 'yard' ? 'yard' : selectedProjectId,
                      scopeType: mapViewMode === 'yard' ? 'yard' : 'project'
                    });
                  }}
                  className="px-2.5 py-1.5 text-xs text-cyan-300 hover:text-white hover:bg-cyan-500/20 rounded flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                  title="在地图上绘制新围栏"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>绘制多边形</span>
                </button>
              </div>
            )}
          </div>

          {/* 🎯 地图渲染容器 (加载驾驶舱高清背景图) */}
          <div 
            onClick={handleMapClick}
            className={`w-full h-full relative overflow-hidden flex items-center justify-center ${
              isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            {/* 高清背景底图 */}
            <img 
              src={currentProject.bgImage} 
              alt={currentProject.name} 
              className="w-full h-full object-cover object-center select-none pointer-events-none transition-all duration-700"
            />

            {/* 科幻微光栅格层 */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020b14]/60 via-transparent to-[#020b14]/30 pointer-events-none"></div>

            {/* 绘制模式交互提示层 */}
            {isDrawingMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-amber-300 px-4 py-2 rounded-full border border-amber-500/60 shadow-2xl backdrop-blur-md text-xs font-medium flex items-center gap-2 pointer-events-none">
                <PenTool className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>点击底图任意位置添加围栏顶点（至少3点闭合），完成后点击右上角【完成绘制】</span>
              </div>
            )}

            {/* ===================== SVG 矢量多边形电子围栏图层 ===================== */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="ef-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 渲染当前视图下的所有已保存电子围栏 */}
              {currentViewFences.map((fence) => {
                const isSelected = selectedFenceId === fence.id;
                return (
                  <g 
                    key={fence.id}
                    className="cursor-pointer pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFenceId(fence.id);
                    }}
                  >
                    <polygon
                      points={fence.points}
                      fill={fence.status === 'active' ? (isSelected ? `${fence.color}55` : `${fence.color}33`) : 'rgba(100, 116, 139, 0.15)'}
                      stroke={fence.status === 'active' ? fence.color : '#94a3b8'}
                      strokeWidth={isSelected ? '0.9' : '0.6'}
                      strokeDasharray={fence.status === 'active' ? 'none' : '1.5,1.5'}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter="url(#ef-glow)"
                      className="transition-all duration-300 hover:opacity-90 hover:stroke-white"
                    />
                  </g>
                );
              })}

              {/* 绘制模式下的实时折线/多边形轨迹 */}
              {isDrawingMode && drawnPointsArray.length > 0 && (
                <g className="pointer-events-none">
                  {drawnPointsArray.length >= 3 && (
                    <polygon
                      points={drawnPointsArray.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(59, 130, 246, 0.35)"
                      stroke="#3b82f6"
                      strokeWidth="0.8"
                      strokeDasharray="2,1"
                    />
                  )}
                  <polyline
                    points={drawnPointsArray.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="0.8"
                    strokeDasharray="1.5,1"
                  />
                  {drawnPointsArray.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="1"
                      fill="#00e5ff"
                      stroke="#ffffff"
                      strokeWidth="0.3"
                    />
                  ))}
                </g>
              )}
            </svg>

            {/* 围栏标牌浮标与信息卡片 */}
            {currentViewFences.map((fence) => {
              if (fence.status !== 'active') return null;
              // 计算多边形质心或中心坐标
              const pts = fence.points.split(' ').map(p => {
                const [x, y] = p.split(',').map(Number);
                return { x, y };
              });
              const avgX = pts.reduce((acc, cur) => acc + cur.x, 0) / pts.length;
              const avgY = pts.reduce((acc, cur) => acc + cur.y, 0) / pts.length;
              const isSelected = selectedFenceId === fence.id;

              return (
                <div
                  key={fence.id}
                  className="absolute pointer-events-auto z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105"
                  style={{ top: `${avgY}%`, left: `${avgX}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFenceId(fence.id);
                  }}
                >
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md border cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900/95 text-white border-blue-400 ring-2 ring-blue-400/60 shadow-[0_0_16px_rgba(59,130,246,0.6)]' 
                      : 'bg-slate-900/80 text-slate-200 border-slate-600/70 hover:border-white'
                  }`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fence.color }}></span>
                    <span className="whitespace-nowrap">{fence.name}</span>
                    {fence.todayViolations > 0 && (
                      <span className="bg-rose-600 text-white text-[9px] px-1 rounded font-mono">
                        {fence.todayViolations}越界
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 选中围栏的高亮详情侧边浮窗 */}
            {activeFence && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-3 right-3 z-30 w-80 bg-slate-900/92 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md text-white text-xs space-y-3 animate-fadeIn"
              >
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: activeFence.color }}></span>
                    <span className="font-bold text-sm text-slate-100 truncate">{activeFence.name}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedFenceId(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 block">围栏编号</span>
                    <span className="font-mono text-slate-200">{activeFence.code}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">围栏类型</span>
                    <span className="text-cyan-400 font-semibold">{activeFence.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">归属层级</span>
                    <span className="text-slate-200 flex items-center gap-1 font-medium">
                      {activeFence.scopeType === 'yard' ? (
                        <>
                          <Building2 className="w-3 h-3 text-amber-400" />
                          <span>厂区公共设施</span>
                        </>
                      ) : (
                        <>
                          <Ship className="w-3 h-3 text-blue-400" />
                          <span>船舶工程项目</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">今日越界</span>
                    <span className="font-mono font-bold text-rose-400">{activeFence.todayViolations} 次</span>
                  </div>
                </div>

                {/* 关联项目/厂区详细信息 */}
                <div className="bg-slate-800/80 rounded-lg p-2.5 text-[11px] space-y-1 border border-slate-700/60">
                  {activeFence.scopeType === 'yard' ? (
                    <div>
                      <span className="text-slate-400">所属厂区功能区：</span>
                      <span className="text-slate-200 font-medium">{activeFence.yardArea || '全厂通用区域'}</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <span className="text-slate-400">关联船舶工程：</span>
                        <span className="text-blue-300 font-medium">{activeFence.projectName}</span>
                      </div>
                      {activeFence.modelLevelName && (
                        <div>
                          <span className="text-slate-400">船型 3D BIM 分层：</span>
                          <span className="text-cyan-300 font-bold">{activeFence.modelLevelName}</span>
                        </div>
                      )}
                      {activeFence.projectPhase && (
                        <div>
                          <span className="text-slate-400">关联施工阶段：</span>
                          <span className="text-slate-200">{activeFence.projectPhase}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 关联硬件设备 */}
                <div className="pt-1 border-t border-slate-700/70">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1.5">
                    <span>关联硬件监测/报警设备</span>
                    <span className="text-slate-300 font-mono">{activeFence.devices.length} 台</span>
                  </div>
                  {activeFence.devices.length === 0 ? (
                    <span className="text-slate-500 text-[11px]">暂无绑定硬件设备</span>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {activeFence.devices.map(d => (
                        <div key={d.id} className="flex items-center justify-between bg-slate-800/80 px-2 py-1 rounded text-[10px]">
                          <span className="text-slate-300 truncate">{d.name}</span>
                          <span className="text-emerald-400 shrink-0 font-mono">在线</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. 实时越界告警流水 */}
        <div className="h-44 bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden flex flex-col shrink-0">
          <div className="bg-rose-50/80 px-3.5 py-2 border-b border-rose-100 flex items-center justify-between shrink-0">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-rose-600 mr-1.5" />
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                实时越界告警流水 ({alerts.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              联动广播驱离与手环强制高频振动
            </span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr className="text-slate-500 uppercase">
                  <th className="py-2 px-3 font-medium">报警时间</th>
                  <th className="py-2 px-3 font-medium">报警围栏</th>
                  <th className="py-2 px-3 font-medium">涉及人员</th>
                  <th className="py-2 px-3 font-medium">持续时间</th>
                  <th className="py-2 px-3 font-medium">处理状态</th>
                  <th className="py-2 px-3 font-medium text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {alerts.map((alertItem) => (
                  <tr 
                    key={alertItem.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      alertItem.status === 'unhandled' ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-bold text-rose-700 whitespace-nowrap">
                      {alertItem.time}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {alertItem.fenceName} <span className="text-[10px] text-slate-400 font-mono">({alertItem.fenceCode})</span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-800 whitespace-nowrap">
                      {alertItem.personName} <span className="font-mono text-[10px] text-rose-600">({alertItem.personCode})</span>
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                      {alertItem.duration}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {alertItem.status === 'unhandled' ? (
                        <span className="text-rose-700 font-bold text-[10px] bg-rose-100 border border-rose-200 px-2 py-0.5 rounded">
                          未处理
                        </span>
                      ) : alertItem.status === 'broadcasted' ? (
                        <span className="text-blue-700 font-bold text-[10px] bg-blue-100 border border-blue-200 px-2 py-0.5 rounded">
                          已广播驱离
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                          人工消警已处置
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {alertItem.status === 'unhandled' && (
                          <button 
                            type="button"
                            onClick={() => handleBroadcastEviction(alertItem)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded text-[10px] font-medium transition-colors shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>广播驱离</span>
                          </button>
                        )}
                        {alertItem.status !== 'handled' && (
                          <button 
                            type="button"
                            onClick={() => handleMarkHandled(alertItem)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer"
                          >
                            标记处理
                          </button>
                        )}
                        {alertItem.status === 'handled' && (
                          <span className="text-emerald-600 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已归档
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================== 🎯 新增电子围栏模态弹窗 ===================== */}
      <CreateFenceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateConfirm}
        onStartDrawing={handleStartDrawing}
        currentProjectId={mapViewMode === 'yard' ? 'yard' : selectedProjectId}
        drawnPoints={drawnPointsArray.length >= 3 ? drawnPointsArray.map(p => `${p.x},${p.y}`).join(' ') : undefined}
      />
    </div>
  );
}
