import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ship, 
  Calendar, 
  Building2, 
  Layers, 
  Check, 
  Lock, 
  Sparkles, 
  FileText, 
  Anchor,
  Compass,
  Info,
  Activity
} from 'lucide-react';

// 8 款主流船型模板库（与船模管理 3D 数模完全对齐）
export interface ShipTypeOption {
  id: string;
  name: string;
  category: string;
  typeCode: string;
  parameters: {
    loa: string;
    beam: string;
    depth: string;
    draft: string;
    displacement: string;
    speed: string;
    power: string;
  };
}

export const SHIP_TYPE_OPTIONS: ShipTypeOption[] = [
  {
    id: 'M-001',
    name: '17.4万m³ 薄膜型大型LNG船',
    category: '清洁能源运输',
    typeCode: 'HULL-LNG-174',
    parameters: {
      loa: '295.0',
      beam: '45.0',
      depth: '26.25',
      draft: '11.5',
      displacement: '118,000 吨',
      speed: '19.5 节',
      power: '双燃料低速机+轴带发电机'
    }
  },
  {
    id: 'M-002',
    name: '24,000 TEU 超大型集装箱船',
    category: '集装箱班轮',
    typeCode: 'HULL-BOX-240',
    parameters: {
      loa: '399.9',
      beam: '61.5',
      depth: '33.2',
      draft: '16.5',
      displacement: '240,000 吨',
      speed: '22.0 节',
      power: 'WinGD 11X92DF 双燃料主机'
    }
  },
  {
    id: 'M-003',
    name: '30万吨 VLCC 超大型原油船',
    category: '液体散货',
    typeCode: 'HULL-VLCC-300',
    parameters: {
      loa: '333.0',
      beam: '60.0',
      depth: '30.0',
      draft: '20.5',
      displacement: '348,000 吨',
      speed: '15.5 节',
      power: '低速柴油机 + 脱硫塔系统'
    }
  },
  {
    id: 'M-004',
    name: '82,000 DWT 卡姆萨尔型散货船',
    category: '干散货运输',
    typeCode: 'HULL-BULK-082',
    parameters: {
      loa: '229.0',
      beam: '32.26',
      depth: '20.35',
      draft: '14.45',
      displacement: '98,000 吨',
      speed: '14.2 节',
      power: 'MAN B&W 6S60ME 柴油机'
    }
  },
  {
    id: 'M-005',
    name: '75M 动力定位平台供应船',
    category: '海洋工程',
    typeCode: 'HULL-PSV-075',
    parameters: {
      loa: '75.0',
      beam: '16.8',
      depth: '7.5',
      draft: '6.0',
      displacement: '4,200 吨',
      speed: '13.5 节',
      power: '柴电全回转电力推进系统'
    }
  },
  {
    id: 'M-006',
    name: '69.8M 海上风电运维工作船',
    category: '海上风电装备',
    typeCode: 'HULL-SOV-070',
    parameters: {
      loa: '69.8',
      beam: '16.0',
      depth: '6.8',
      draft: '5.2',
      displacement: '3,100 吨',
      speed: '16.0 节',
      power: '混合动力 + 蓄电池储能'
    }
  },
  {
    id: 'M-007',
    name: '37米 多用途海洋工程支持船',
    category: '海工辅助',
    typeCode: 'HULL-AHTS-037',
    parameters: {
      loa: '37.0',
      beam: '10.4',
      depth: '4.5',
      draft: '3.5',
      displacement: '950 吨',
      speed: '12.0 节',
      power: '双机双桨常规柴油动力'
    }
  },
  {
    id: 'M-008',
    name: '18500 DWT 绿色节能油化船',
    category: '特种危化运输',
    typeCode: 'HULL-CHEM-185',
    parameters: {
      loa: '149.8',
      beam: '24.0',
      depth: '13.2',
      draft: '9.8',
      displacement: '25,600 吨',
      speed: '14.0 节',
      power: '电控二冲程低速柴油机'
    }
  }
];

// 建造船厂所在区域 / 6 个停泊位选项常量
export const BERTH_AREA_OPTIONS = [
  '1号船台（2万吨船台）',
  '2号码头 (移动码头)',
  '3号码头 (移动码头)',
  '4号浮动码头 (移动码头)',
  '5号码头 (移动码头 - 小型船只)',
  '6号船台（平船台）'
] as const;

export const SHIPYARD_AREA_OPTIONS = BERTH_AREA_OPTIONS;

export type ShipyardArea = typeof SHIPYARD_AREA_OPTIONS[number];

// 常用建造阶段枚举
export const SHIPBUILDING_PHASE_OPTIONS = [
  '分段搭载',
  '合拢焊接',
  '密闭涂装',
  '水下舾装',
  '系泊试验',
  '交船交付'
] as const;

export type ShipbuildingPhase = typeof SHIPBUILDING_PHASE_OPTIONS[number];

/**
 * 提取并解析版本号各段数值（例如 "V2.1" -> [2, 1], "V1.0 (分段)" -> [1, 0]）
 */
export function parseVersionNumbers(verStr: string): number[] {
  if (!verStr) return [1, 0];
  const cleaned = verStr.replace(/^[vV]/, '').replace(/[\(（].*?[\)）]/g, '').trim();
  const match = cleaned.match(/^(\d+(\.\d+)*)/);
  if (!match) return [1, 0];
  return match[1].split('.').map(n => parseInt(n, 10) || 0);
}

/**
 * 比较两个版本号:
 * > 0 : v1 > v2
 * === 0 : v1 === v2
 * < 0 : v1 < v2
 */
export function compareVersionNumbers(v1: string, v2: string): number {
  const p1 = parseVersionNumbers(v1);
  const p2 = parseVersionNumbers(v2);
  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 !== num2) {
      return num1 - num2;
    }
  }
  return 0;
}

export interface CreatedProjectData {
  id: string;
  name: string;
  shipType: string;
  shipCode: string;
  status: 'planning' | 'in_progress' | 'completed' | 'suspended';
  progress: number;
  startDate: string;
  endDate: string;
  manager: string;
  dockingArea: string;
  datum?: string;
  phase: string;
  version: string;
  devices?: string;
  fence?: string;
  personnel?: number;
  description?: string;
  parameters: {
    loa: string;
    beam: string;
    depth: string;
    draft: string;
    displacement: string;
    speed: string;
    power: string;
  };
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (project: CreatedProjectData) => void;
  initialData?: CreatedProjectData | null;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit, initialData }: CreateProjectModalProps) {
  const isEditMode = !!initialData;

  // 1. 系统自动生成的项目编码（不可修改）
  const [projectCode, setProjectCode] = useState('');
  
  // 2. 项目基本信息
  const [projectName, setProjectName] = useState('');
  const [selectedShipId, setSelectedShipId] = useState<string>('M-001');
  // 建造阶段与版本号分开存储
  const [phase, setPhase] = useState<string>('分段搭载');
  const [version, setVersion] = useState<string>('V1.0');
  const [historyVersion, setHistoryVersion] = useState<string>('V1.0');

  const [manager, setManager] = useState('张建国');
  const [status, setStatus] = useState<'planning' | 'in_progress' | 'completed' | 'suspended'>('planning');
  const [progress, setProgress] = useState<number>(0);

  // 3. 项目周期起止时间
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2027-12-31');

  // 4. 建造船厂所在区域 / 停泊位
  const [dockingArea, setDockingArea] = useState<string>('1号船台（2万吨船台）');

  // 5. 项目描述（非必填）
  const [description, setDescription] = useState('');

  // 6. 船型参数配置（随轮船类型联动）
  const [loa, setLoa] = useState('295.0');
  const [beam, setBeam] = useState('45.0');
  const [depth, setDepth] = useState('26.25');
  const [draft, setDraft] = useState('11.5');
  const [displacement, setDisplacement] = useState('118,000 吨');
  const [speed, setSpeed] = useState('19.5 节');
  const [power, setPower] = useState('双燃料低速机+轴带发电机');

  // 表单错误提示
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // 编辑模式：回填已有数据
        setProjectCode(initialData.id);
        setProjectName(initialData.name);
        setManager(initialData.manager || '张建国');
        setStartDate(initialData.startDate || '2026-09-01');
        setEndDate(initialData.endDate || '2027-12-31');
        
        // 回填船厂区域/停泊位
        const validArea = initialData.dockingArea || '1号船台（2万吨船台）';
        setDockingArea(validArea);
        
        // 分离建造阶段与版本号
        const rawVer = initialData.version || 'V1.0';
        const cleanVer = rawVer.replace(/[\(（].*?[\)）]/g, '').trim() || 'V1.0';
        const matchedPhase = initialData.phase || '分段搭载';
        setPhase(matchedPhase);
        setVersion(cleanVer);
        setHistoryVersion(cleanVer);

        setStatus(initialData.status || 'in_progress');
        setProgress(initialData.progress ?? 0);
        setDescription(initialData.description || '');

        // 匹配轮船类型
        const matched = SHIP_TYPE_OPTIONS.find(
          s => s.typeCode === initialData.shipCode || s.name === initialData.shipType || s.category === initialData.shipType
        );
        if (matched) {
          setSelectedShipId(matched.id);
        }

        if (initialData.parameters) {
          setLoa(initialData.parameters.loa || '295.0');
          setBeam(initialData.parameters.beam || '45.0');
          setDepth(initialData.parameters.depth || '26.25');
          setDraft(initialData.parameters.draft || '11.5');
          setDisplacement(initialData.parameters.displacement || '118,000 吨');
          setSpeed(initialData.parameters.speed || '19.5 节');
          setPower(initialData.parameters.power || '双燃料低速机+轴带发电机');
        }
      } else {
        // 新建模式：自动生成全新项目编码
        const year = new Date().getFullYear();
        const randNum = Math.floor(100 + Math.random() * 900);
        const generatedCode = `PRJ-${year}-${randNum}`;
        setProjectCode(generatedCode);
        setProjectName('');
        // 新建时版本号初始默认为 V1.0，建造阶段初始默认为 分段搭载
        setPhase('分段搭载');
        setVersion('V1.0');
        setHistoryVersion('V1.0');
        setManager('张建国');
        setStartDate('2026-09-01');
        setEndDate('2027-12-31');
        setDockingArea('1号船台（2万吨船台）');
        setDescription('');
        setStatus('planning');
        setProgress(0);

        handleShipTypeChange('M-001', true);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialData]);

  // 当轮船类型改变时，自动将船型参数同步填入下方（仅在新建模式允许切换）
  const handleShipTypeChange = (shipId: string, isDefault = false) => {
    if (isEditMode) return; // 编辑模式锁定
    setSelectedShipId(shipId);
    const ship = SHIP_TYPE_OPTIONS.find(s => s.id === shipId);
    if (ship) {
      setLoa(ship.parameters.loa);
      setBeam(ship.parameters.beam);
      setDepth(ship.parameters.depth);
      setDraft(ship.parameters.draft);
      setDisplacement(ship.parameters.displacement);
      setSpeed(ship.parameters.speed);
      setPower(ship.parameters.power);
      if (!isEditMode && (!projectName || isDefault)) {
        setProjectName(`${ship.name} 首制船`);
      }
    }
  };

  if (!isOpen) return null;

  const currentShip = SHIP_TYPE_OPTIONS.find(s => s.id === selectedShipId) || SHIP_TYPE_OPTIONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setErrorMsg('请输入项目名称');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg('请选择项目周期的起止时间');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('项目开始日期不能晚于竣工结束日期');
      return;
    }

    const payload: CreatedProjectData = {
      id: projectCode,
      name: projectName.trim(),
      shipType: currentShip.category,
      shipCode: currentShip.typeCode,
      status: status,
      progress: progress,
      startDate: startDate,
      endDate: endDate,
      manager: manager,
      dockingArea: dockingArea,
      datum: initialData?.datum || 'Datum P0 (X:0, Z:0)',
      phase: initialData?.phase || phase || '分段搭载',
      version: initialData?.version || version || 'V1.0',
      devices: initialData?.devices || '读卡(10) 激励(4) 四合一(6) 烟感(12)',
      fence: initialData?.fence || '船台施工安全立体围栏',
      personnel: initialData?.personnel ?? 0,
      description: description.trim(),
      parameters: {
        loa,
        beam,
        depth,
        draft,
        displacement,
        speed,
        power
      }
    };

    if (onSubmit) {
      onSubmit(payload);
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] border border-slate-200 text-slate-700 font-sans overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isEditMode ? '编辑造船工程项目' : '新建造船工程项目'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode ? '修改项目基本属性、建造周期、所属区域与技术参数' : '配置项目基本属性、周期排程、建造船厂区域及船模参数'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-[13px]">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center justify-between">
              <span>{errorMsg}</span>
              <button 
                type="button" 
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section 1: 项目基本信息 */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">1</span>
              <h3 className="text-slate-800 font-bold text-sm">项目基本信息</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 项目编码（系统自动生成，不可修改） */}
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="text-red-500">*</span>项目编码
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-blue-500" /> 系统自动生成（不可修改）
                  </span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={projectCode}
                    readOnly
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-700 cursor-not-allowed select-all"
                  />
                  <Sparkles className="w-4 h-4 text-blue-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* 项目名称 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-1">*</span>项目名称
                </label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="如：17.4万m³ 薄膜型大型LNG船 2号船" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400" 
                />
              </div>

              {/* 轮船类型（关联船模类型列表选择，编辑时不可修改） */}
              <div>
                <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <span className="text-red-500">*</span>轮船类型
                  </span>
                  {isEditMode ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-normal text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3 text-amber-600" /> 编辑时不可修改
                    </span>
                  ) : (
                    <span className="text-[11px] font-normal text-slate-400">自动同步 3D 船模参数</span>
                  )}
                </label>
                {isEditMode ? (
                  <div className="relative">
                    <input 
                      type="text"
                      value={`${currentShip.name} (${currentShip.category})`}
                      disabled
                      readOnly
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed pr-9 shadow-2xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <select 
                    value={selectedShipId} 
                    onChange={(e) => handleShipTypeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {SHIP_TYPE_OPTIONS.map((ship) => (
                      <option key={ship.id} value={ship.id}>
                        {ship.name} ({ship.category})
                      </option>
                    ))}
                  </select>
                )}
                {isEditMode && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    当前工程已关联 {currentShip.typeCode} 船体几何基准及分段数模，轮船类型已锁定。
                  </p>
                )}
              </div>

              {/* 建造负责人 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-1">*</span>造船项目负责人
                </label>
                <input 
                  type="text" 
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="请输入负责人姓名" 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                />
              </div>

              {/* 建造船厂所在区域（6 个停泊位选择） */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  <span className="text-red-500 mr-1">*</span>建造船厂所在区域 / 停泊位
                </label>
                <select 
                  value={dockingArea}
                  onChange={(e) => setDockingArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  {BERTH_AREA_OPTIONS.map((berth) => (
                    <option key={berth} value={berth}>
                      {berth}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 项目周期起止时间 */}
            <div className="pt-2">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-red-500 mr-1">*</span>项目周期起止时间
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="text-[11px] text-slate-500 block mb-1">开工/搭载开始日期</span>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <span className="text-[11px] text-slate-500 block mb-1">计划竣工/交船日期</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 项目描述（非必填） */}
            <div className="pt-2">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  项目描述 <span className="text-slate-400 font-normal">(非必填)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">{description.length} / 300</span>
              </label>
              <textarea 
                rows={3}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Section 2: 船型参数配置（全部不可编辑，随选择的轮船类型联动） */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                <h3 className="text-slate-800 font-bold text-sm">船型主尺度与关键参数配置</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> 标准数模参数（只读）
                </span>
                <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 已关联：{currentShip.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">总长 LOA (米)</label>
                <input 
                  type="text" 
                  value={loa}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">型宽 Beam (米)</label>
                <input 
                  type="text" 
                  value={beam}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">型深 Depth (米)</label>
                <input 
                  type="text" 
                  value={depth}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">设计吃水 Draft (米)</label>
                <input 
                  type="text" 
                  value={draft}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">排水量</label>
                <input 
                  type="text" 
                  value={displacement}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">设计航速</label>
                <input 
                  type="text" 
                  value={speed}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">主机及推进形式</label>
                <input 
                  type="text" 
                  value={power}
                  readOnly
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-not-allowed select-all" 
                />
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end items-center gap-3 shrink-0 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
          >
            取消
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-98"
          >
            <Check className="w-4 h-4" /> {isEditMode ? '保存修改' : '确认创建项目并绑定数模'}
          </button>
        </div>
      </div>
    </div>
  );
}
