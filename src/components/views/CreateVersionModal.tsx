import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Ship, 
  MapPin, 
  Check, 
  AlertTriangle, 
  Clock,
  Info,
  Lock,
  Edit,
  Users,
  Search,
  UserCheck,
  Filter,
  CheckCircle2,
  Anchor
} from 'lucide-react';
import { BerthPicker } from './BerthPicker';
import { 
  BERTH_AREAS, 
  BerthAreaConfig, 
  checkIsSmallShip,
  checkSlotAvailability 
} from '@/src/data/berthData';
import { MOCK_PERSONNEL_LIST, DetailedPersonnel } from '@/src/data/mockPersonnel';

// 施工阶段标准预设列表
export const CONSTRUCTION_PHASE_PRESETS = [
  '分段总组与平船台合拢',
  '水下舾装与管系试压',
  '机舱动力安装与电气集控',
  '船体涂装与绝缘敷设',
  '码头系泊试验与工况调试',
  '出海试航与航行操纵试验',
  '前期开工与钢板下料切割',
  '竣工验收与交船归档',
  '船体合拢移位与坞内检修'
];

export const PROJECT_STATUS_OPTIONS = [
  { value: 'planning', label: '前期规划中', badgeBg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'in_progress', label: '施工进行中', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'temporary_departure', label: '临时离港', badgeBg: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'completed', label: '已竣工交船', badgeBg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'suspended', label: '暂停施工', badgeBg: 'bg-rose-50 text-rose-700 border-rose-200' }
] as const;

export type ProjectStatusType = typeof PROJECT_STATUS_OPTIONS[number]['value'];

export interface VersionPayload {
  id: string;
  title: string;
  versionNumber: string;
  phaseName: string;
  startDate: string;
  endDate?: string;
  sync: boolean;
  status: 'active' | 'archived';
  projectStatus?: ProjectStatusType; // 该版本生效时的项目施工状态
  hasAssociatedData?: boolean; // 生效后是否已产生关联的数据（如人员定位轨迹、告警等）
  // 人员关联字段
  associatedPersonnelIds?: string[];
  associatedPersonnelCount?: number;
  // 移泊相关字段
  enableBerthTransfer: boolean;
  berthId?: string;
  berthCode?: number;
  berthName?: string;
  berthSlotNumber?: number;
  berthCategoryName?: string;
  transferType?: string;
  transferNotes?: string;
  details?: React.ReactNode;
}

interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (version: VersionPayload) => void;
  projectName?: string;
  shipType?: string;
  editVersion?: VersionPayload | null;
  previousProjectStatus?: ProjectStatusType; // 上个阶段版本的项目施工状态（用于新建继承）
}

export function CreateVersionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  projectName = '17.4万m³ 薄膜型大型LNG船 1号舰',
  shipType = '清洁能源运输',
  editVersion = null,
  previousProjectStatus
}: CreateVersionModalProps) {
  const isEdit = !!editVersion;
  const isHistoricalArchived = isEdit && editVersion?.status === 'archived';

  // 基础信息
  const [versionNumber, setVersionNumber] = useState('V3.0');
  const [phaseName, setPhaseName] = useState('水下舾装与管系试压');
  const [startDate, setStartDate] = useState('2026-11-01T08:00:00');
  const [sync, setSync] = useState(true);
  
  // 项目施工状态（满足需求：每个版本可设置，新建时第一个版本默认选择第一个项目状态，后续继承上个阶段的状态）
  const [projectStatus, setProjectStatus] = useState<ProjectStatusType>('planning');

  // 人员关联归属选择状态
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);
  const [personnelSearchKey, setPersonnelSearchKey] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // 移泊配置
  const [selectedBerthId, setSelectedBerthId] = useState<string>('berth-3'); // 默认3号码头
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number | null>(2); // 默认2号位(空闲)

  // 错误提示
  const [errorMsg, setErrorMsg] = useState('');

  // 是否已关联产生数据（锁定开始生效时间）
  const hasAssociatedData = isEdit ? !!editVersion?.hasAssociatedData : false;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (editVersion) {
        setVersionNumber(editVersion.versionNumber || 'V1.0');
        setPhaseName(editVersion.phaseName || CONSTRUCTION_PHASE_PRESETS[0]);
        // 格式化 datetime-local 控件的初始值 (保留到秒 HH:mm:ss)
        const rawStart = editVersion.startDate || '2026-11-01 08:00:00';
        let formattedLocal = rawStart.includes('T') 
          ? rawStart 
          : rawStart.replace(' ', 'T');
        if (formattedLocal.length === 16) {
          formattedLocal += ':00';
        }
        setStartDate(formattedLocal);
        setSync(editVersion.sync ?? true);
        setSelectedBerthId(editVersion.berthId || 'berth-3');
        setSelectedSlotNumber(editVersion.berthSlotNumber ?? 2);
        
        // 设置施工状态：已有版本的施工状态，或者上个版本的施工状态，否则默认 'planning'
        setProjectStatus(editVersion.projectStatus || previousProjectStatus || 'planning');

        // 加载编辑阶段的人员关联归属
        if (editVersion.associatedPersonnelIds && editVersion.associatedPersonnelIds.length > 0) {
          setSelectedPersonnelIds(editVersion.associatedPersonnelIds);
        } else {
          // 默认选择归属于本造船项目的人员
          const projectWorkers = MOCK_PERSONNEL_LIST.filter(p => 
            p.projectName === projectName || p.projectId?.includes('LNG') || p.projectId?.includes('PRJ')
          );
          setSelectedPersonnelIds(projectWorkers.map(p => p.id));
        }
      } else {
        setVersionNumber('V3.0');
        setPhaseName('水下舾装与管系试压');
        setStartDate('2026-11-01T08:00');
        setSync(true);
        setSelectedBerthId('berth-3');
        setSelectedSlotNumber(2);

        // 新建版本状态控制逻辑（满足需求）：
        // 如果有上个阶段版本的状态（previousProjectStatus），后续版本默认继承上个阶段的状态
        // 如果没有上个阶段版本的状态，视为第一个版本，默认选择第一个项目状态（'planning' - 前期规划中）
        if (previousProjectStatus) {
          setProjectStatus(previousProjectStatus);
        } else {
          setProjectStatus('planning'); // 第一个项目状态
        }

        // 新增阶段时，自动预选归属于当前造船工程项目的人员
        const projectWorkers = MOCK_PERSONNEL_LIST.filter(p => 
          p.projectName === projectName || p.projectId?.includes('LNG') || p.projectId?.includes('PRJ')
        );
        const defaultIds = projectWorkers.length > 0 
          ? projectWorkers.map(p => p.id) 
          : MOCK_PERSONNEL_LIST.slice(0, 12).map(p => p.id);
        setSelectedPersonnelIds(defaultIds);
      }
    }
  }, [isOpen, editVersion, previousProjectStatus, projectName]);

  if (!isOpen) return null;

  const selectedBerth = BERTH_AREAS.find(b => b.id === selectedBerthId) || BERTH_AREAS[0];
  const isSmallShip = checkIsSmallShip(projectName) || checkIsSmallShip(shipType);
  const is2BerthViolation = selectedBerth.id === 'berth-2' && !isSmallShip;

  // 人员筛选过滤逻辑
  const filteredPersonnelList = MOCK_PERSONNEL_LIST.filter(person => {
    const matchesSearch = !personnelSearchKey.trim() || 
      person.name.includes(personnelSearchKey) ||
      person.id.toLowerCase().includes(personnelSearchKey.toLowerCase()) ||
      person.role.includes(personnelSearchKey) ||
      person.department.includes(personnelSearchKey);

    const matchesDept = departmentFilter === 'all' || person.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  // 切换人员选择
  const togglePersonnelSelection = (personId: string) => {
    if (isHistoricalArchived) return;
    setSelectedPersonnelIds(prev => 
      prev.includes(personId) ? prev.filter(id => id !== personId) : [...prev, personId]
    );
  };

  // 全选/取消全选
  const handleSelectAllPersonnel = () => {
    if (isHistoricalArchived) return;
    const currentFilteredIds = filteredPersonnelList.map(p => p.id);
    const allSelected = currentFilteredIds.every(id => selectedPersonnelIds.includes(id));
    if (allSelected) {
      // 取消当前筛选出的列表
      setSelectedPersonnelIds(prev => prev.filter(id => !currentFilteredIds.includes(id)));
    } else {
      // 增加当前筛选出的列表
      const combined = new Set([...selectedPersonnelIds, ...currentFilteredIds]);
      setSelectedPersonnelIds(Array.from(combined));
    }
  };

  const handleClearPersonnel = () => {
    if (isHistoricalArchived) return;
    setSelectedPersonnelIds([]);
  };

  const handleSelectBerth = (berth: BerthAreaConfig, slotNum?: number) => {
    setSelectedBerthId(berth.id);
    setSelectedSlotNumber(slotNum ?? null);
    if (errorMsg) setErrorMsg('');
  };

  const handleSave = () => {
    if (isHistoricalArchived) {
      setErrorMsg('历史阶段版本属于归档历史记录，不允许直接修改！');
      return;
    }
    if (!versionNumber.trim()) {
      setErrorMsg('请输入版本代号（如 V3.0）');
      return;
    }
    if (!phaseName.trim()) {
      setErrorMsg('请选择施工阶段全称');
      return;
    }
    if (!startDate) {
      setErrorMsg('请在基本属性栏中设置开始生效时间点');
      return;
    }

    // 当选择“已竣工交船”或“临时离港”时，不需要校验所选停泊位，并且停泊位将被自动释放
    const isCompletedStatus = projectStatus === 'completed';
    const isTemporaryDeparture = projectStatus === 'temporary_departure';
    const isNoBerthRequired = isCompletedStatus || isTemporaryDeparture;

    if (!isNoBerthRequired) {
      // 校验所选泊位：按照6个区域的全新规则与组合约束进行深度校验
      if (!selectedSlotNumber) {
        setErrorMsg('请在厂区停泊位中选择一个空闲且满足规则的二级具体泊位');
        return;
      }
      
      // 编辑时允许维持自己当前占用的泊位
      const selfSlot = (isEdit && editVersion?.berthId === selectedBerth.id) ? editVersion?.berthSlotNumber : null;
      const availResult = checkSlotAvailability(selectedBerth, selectedSlotNumber, isSmallShip, selfSlot);
      
      if (!availResult.isAvailable) {
        setErrorMsg(`无法保存停泊位移泊规划：${availResult.reason || '当前选定的泊位不符合停泊组合规则，请重新选择！'}`);
        return;
      }
    }

    const fullTitle = `${versionNumber.trim()} - ${phaseName.trim()}`;
    const formattedStartDate = startDate.includes('T') 
      ? startDate.replace('T', ' ') + (startDate.split('T')[1]?.length === 5 ? ':00' : '')
      : startDate;

    const savedPayload: VersionPayload = {
      id: isEdit && editVersion ? editVersion.id : `v-${Date.now()}`,
      title: fullTitle,
      versionNumber: versionNumber.trim(),
      phaseName: phaseName.trim(),
      startDate: formattedStartDate,
      endDate: isEdit ? editVersion?.endDate : '生效中',
      sync: isCompletedStatus ? false : sync,
      status: isEdit && editVersion ? editVersion.status : 'active', // 任何新建版本直接成为当前最新活跃版本！
      projectStatus, // 保存当前阶段设定的项目施工状态
      hasAssociatedData,
      associatedPersonnelIds: isCompletedStatus ? [] : selectedPersonnelIds,
      associatedPersonnelCount: isCompletedStatus ? 0 : selectedPersonnelIds.length,
      enableBerthTransfer: !isNoBerthRequired,
      berthId: isNoBerthRequired ? undefined : selectedBerth.id,
      berthCode: isNoBerthRequired ? undefined : selectedBerth.code,
      berthName: isCompletedStatus 
        ? '已竣工交付离厂' 
        : isTemporaryDeparture 
          ? '临时离港 (停泊位已自动释放)' 
          : selectedBerth.name,
      berthSlotNumber: isNoBerthRequired ? undefined : (selectedSlotNumber || undefined),
      berthCategoryName: isCompletedStatus 
        ? '已自动解绑' 
        : isTemporaryDeparture 
          ? '停泊位已释放' 
          : selectedBerth.categoryName
    };

    onSave(savedPayload);
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[94vh] border border-slate-200 text-slate-700 font-sans overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600">
              {isEdit ? <Edit className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>{isEdit ? '编辑阶段版本信息' : '新增阶段版本与停泊位移泊规划'}</span>
                <span className="text-xs font-normal text-slate-400 font-mono">({projectName})</span>
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit 
                  ? '修改阶段版本基本信息、施工阶段全称、归属项目人员及停泊位规划' 
                  : '设置开始生效时间点、施工阶段属性、关联归属项目的人员团队，并配置停泊位移泊'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-[13px]">
          
          {/* 历史版本禁止编辑强提示 */}
          {isHistoricalArchived && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn shadow-2xs">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong>历史阶段版本禁止编辑：</strong>
                当前选中的施工阶段为已结案归档的历史阶段，阶段版本信息、关联人员及停泊位规则禁止修改。
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 1. 阶段基础信息与时间设置栏 */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">1</span>
              <h3 className="text-slate-800 font-bold text-sm">阶段版本基本属性与生效时间</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 版本号 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span><span className="text-red-500 mr-1">*</span>版本代号</span>
                  {isEdit && <span className="text-[10px] text-amber-600 font-medium">固定不可改</span>}
                </label>
                <input 
                  type="text" 
                  value={versionNumber}
                  onChange={e => setVersionNumber(e.target.value)}
                  disabled={isEdit || isHistoricalArchived}
                  placeholder="如 V3.0 或 V2.2" 
                  className={`w-full px-3 py-2 border rounded-xl text-sm font-mono font-bold transition-all placeholder-slate-400 ${
                    isEdit || isHistoricalArchived
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed' 
                      : 'bg-white text-indigo-700 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {isEdit && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                    版本号不允许修改
                  </p>
                )}
              </div>

              {/* 施工阶段全称：下拉选择预设值 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span><span className="text-red-500 mr-1">*</span>施工阶段全称</span>
                  {isEdit && (
                    <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      编辑时不可变更
                    </span>
                  )}
                </label>
                <select
                  value={phaseName}
                  onChange={e => setPhaseName(e.target.value)}
                  disabled={isEdit || isHistoricalArchived}
                  className={`w-full px-3 py-2 border rounded-xl text-sm font-medium transition-all ${
                    isEdit || isHistoricalArchived
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer'
                  }`}
                >
                  {CONSTRUCTION_PHASE_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                {isEdit && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                    施工阶段不允许修改
                  </p>
                )}
              </div>

              {/* 项目施工状态切换与继承配置 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span><span className="text-red-500 mr-1">*</span>项目施工状态</span>
                  {isEdit && (
                    <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      编辑时不可变更
                    </span>
                  )}
                  {!isEdit && previousProjectStatus && (
                    <span className="text-[10px] text-blue-600 font-medium bg-blue-50 border border-blue-200/80 px-1 rounded">继承上个阶段</span>
                  )}
                  {!isEdit && !previousProjectStatus && (
                    <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 border border-emerald-200/80 px-1 rounded">首版本默认状态</span>
                  )}
                </label>
                <select
                  value={projectStatus}
                  onChange={e => setProjectStatus(e.target.value as ProjectStatusType)}
                  disabled={isEdit || isHistoricalArchived}
                  className={`w-full px-3 py-2 border rounded-xl text-sm font-bold transition-all ${
                    isEdit || isHistoricalArchived
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer'
                  }`}
                >
                  {PROJECT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {isEdit && (
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                    项目施工状态不允许修改
                  </p>
                )}
              </div>

              {/* 开始生效时间点（支持选择日期和时间） */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span><span className="text-red-500 mr-1">*</span>开始生效时间点</span>
                  </span>
                  {hasAssociatedData && <span className="text-[10px] text-amber-600 font-bold">已锁定</span>}
                </label>
                <input 
                  type="datetime-local" 
                  step="1"
                  value={startDate}
                  disabled={hasAssociatedData || isHistoricalArchived}
                  onChange={e => {
                    setStartDate(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold transition-all ${
                    hasAssociatedData || isHistoricalArchived
                      ? 'bg-amber-50/80 text-amber-900 border-amber-300/80 cursor-not-allowed' 
                      : 'bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer'
                  }`}
                />
              </div>
            </div>

            {/* 如果关联产生数据，则显示锁定提醒 */}
            {hasAssociatedData ? (
              <div className="p-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 animate-fadeIn">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-amber-950 font-bold">开始生效时间已锁定：</strong>
                  该版本设置的开始生效时间后关联的设备或电子围栏已产生数据（如人员定位轨迹、实时/历史告警信息等），因此开始生效时间不允许修改。
                </div>
              </div>
            ) : projectStatus === 'completed' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200/90 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 leading-relaxed w-full">
                  <strong className="block text-emerald-950 font-bold text-xs flex items-center gap-1.5">
                    <span>竣工说明：</span>
                    <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">已竣工交船与结案归档</span>
                  </strong>
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    本项目已竣工，不允许创建新的阶段，所有本项目绑定的人员、设备和电子围栏设置已解除关联。
                  </p>
                </div>
              </div>
            ) : projectStatus === 'temporary_departure' ? (
              <div className="p-3 bg-sky-50 border border-sky-200/90 rounded-xl text-xs text-sky-900 flex items-start gap-2.5 animate-fadeIn">
                <Anchor className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5 leading-relaxed w-full">
                  <strong className="block text-sky-950 font-bold text-xs flex items-center gap-1.5">
                    <span>临时离港说明：</span>
                    <span className="bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded text-[10px] font-bold">厂区停泊位已自动释放</span>
                  </strong>
                  <p className="text-xs text-sky-800 font-medium leading-relaxed">
                    当前阶段选择【临时离港】状态（如出海试航、避风或临时调离），本项目原占用的厂区停泊位已自动释放并空出，供厂区其他船舶调度停靠使用。
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>周期关联规则：</strong>创建新阶段版本后，新周期的【开始生效时间点】减 1 秒即自动作为上个施工阶段的【计划结束时间点】。
                </span>
              </div>
            )}

            {/* 自动关联配置开关：仅在非竣工交船状态下展示 */}
            {projectStatus !== 'completed' && (
              <div className={`flex items-start gap-2.5 p-3.5 border rounded-xl shadow-2xs transition-all ${
                isEdit || isHistoricalArchived
                  ? 'bg-slate-100/90 border-slate-200/90 cursor-not-allowed opacity-80'
                  : 'bg-white border-slate-200/90'
              }`}>
                <input 
                  type="checkbox" 
                  id="sync-checkbox"
                  checked={sync}
                  disabled={isEdit || isHistoricalArchived}
                  onChange={e => setSync(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 accent-blue-600 mt-0.5 shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <label 
                  htmlFor="sync-checkbox" 
                  className={`text-xs leading-relaxed w-full ${
                    isEdit || isHistoricalArchived ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className={isEdit || isHistoricalArchived ? 'text-slate-600 font-bold' : 'text-slate-900 font-bold'}>
                      开启自动关联：上阶段绑定的设备与电子围栏设置继续延用。
                    </strong>
                    {(isEdit || isHistoricalArchived) && (
                      <span className="text-[10px] text-amber-700 font-medium bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        编辑时不可变更
                      </span>
                    )}
                  </div>
                  <span className={`block text-[11px] mt-0.5 ${isEdit || isHistoricalArchived ? 'text-slate-400' : 'text-slate-500'}`}>
                    勾选后，新阶段版本生效时将自动续用并沿用上一施工阶段绑定的防爆定位基站、受限空间气体传感终端与电子围栏安全防区。
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* 仅在非竣工交船状态下展示区域2与区域3配置项 */}
          {projectStatus !== 'completed' && (
            <>
              {/* 2. 👥 项目关联人员选择与归属调整（需求项1新增） */}
              <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/40 p-4 rounded-2xl border border-indigo-200/80 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">2</span>
                    <div>
                      <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>项目关联人员（归属项目人员选择与调整）</span>
                        </span>
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100/90 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                          已选择 {selectedPersonnelIds.length} 名人员归属本项目
                        </span>
                      </h3>
                    </div>
                  </div>

                  {!isHistoricalArchived && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllPersonnel}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        {filteredPersonnelList.length > 0 && filteredPersonnelList.every(p => selectedPersonnelIds.includes(p.id)) ? '取消当页选中' : '全选当前筛选人员'}
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPersonnel}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        清空选择
                      </button>
                    </div>
                  )}
                </div>

                {/* 搜索与部门快捷筛选栏 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-2 rounded-xl border border-slate-200/80">
                  <div className="relative sm:col-span-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      value={personnelSearchKey}
                      disabled={isHistoricalArchived}
                      onChange={e => setPersonnelSearchKey(e.target.value)}
                      placeholder="检索姓名、工号(EMP-xxx)、工种角色或部门..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <select
                      value={departmentFilter}
                      disabled={isHistoricalArchived}
                      onChange={e => setDepartmentFilter(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="all">全部部门班组</option>
                      <option value="船体电焊班组">船体电焊班组</option>
                      <option value="搭载部">搭载部</option>
                      <option value="涂装部">涂装部</option>
                      <option value="机电部">机电部</option>
                      <option value="船装部">船装部</option>
                      <option value="安全环保部">安全环保部</option>
                      <option value="船体打磨班组">船体打磨班组</option>
                      <option value="船体装配班组">船体装配班组</option>
                      <option value="喷涂班组">喷涂班组</option>
                    </select>
                  </div>
                </div>

                {/* 人员选择网格（带多选及归属项目标签指示） */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1">
                  {filteredPersonnelList.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-dashed border-slate-200">
                      未匹配到人员，请切换部门或清空检索关键词
                    </div>
                  ) : (
                    filteredPersonnelList.map(person => {
                      const isSelected = selectedPersonnelIds.includes(person.id);
                      return (
                        <div 
                          key={person.id}
                          onClick={() => togglePersonnelSelection(person.id)}
                          className={`p-2.5 rounded-xl border transition-all select-none flex items-start gap-2.5 ${
                            isHistoricalArchived ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                          } ${
                            isSelected
                              ? 'bg-indigo-50/90 border-indigo-300 ring-1 ring-indigo-400/50 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-slate-800 truncate">{person.name}</span>
                              <span className="font-mono text-[10px] text-slate-400 shrink-0">{person.id}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-600">
                              <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-medium">{person.role}</span>
                              <span className="text-slate-400 truncate">{person.department}</span>
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-1 text-[10px]">
                              <span className="font-mono text-slate-400">{person.locatorId}</span>
                              <span className={`px-1.5 py-0.2 rounded font-medium ${
                                isSelected 
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold' 
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {isSelected ? '已关联归属' : '未关联'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 3. 🎯 核心移泊规划：轮船模型移泊至厂区新停泊位 */}
              {projectStatus === 'temporary_departure' ? (
                <div className="bg-gradient-to-br from-sky-50 via-slate-50 to-blue-50/50 p-4 rounded-2xl border border-sky-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">3</span>
                    <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                      <span>厂区停泊位自动释放</span>
                      <span className="text-xs font-semibold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full">
                        无需占用厂区泊位
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-7">
                    当前阶段设定为【临时离港】状态（如出海试航、避风或临时出厂），系统已自动将之前占用的厂区停泊位解绑并释放为空闲状态供其他船舶调度停靠。在下一阶段重新选择厂区施工状态时可再重新规划移泊。
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50/50 via-slate-50 to-indigo-50/30 p-4 rounded-2xl border border-blue-200 space-y-4">
                  
                  {/* 标题 */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">3</span>
                      <div>
                        <h3 className="text-slate-900 font-bold text-sm flex items-center gap-2">
                          <span>船厂厂区停泊场景与移泊规划</span>
                          <span className="text-xs font-normal text-cyan-700 bg-cyan-100/70 border border-cyan-200 px-2 py-0.5 rounded-full">
                            占用状态与船型匹配校验
                          </span>
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-1">
                    
                    {/* 嵌入 停泊位可视化选择组件 */}
                    <BerthPicker
                      startDate={startDate}
                      selectedBerthId={selectedBerthId}
                      selectedSlotNumber={selectedSlotNumber}
                      onSelectBerth={handleSelectBerth}
                      shipName={projectName}
                      shipType={shipType}
                    />

                    {/* 2号码头小型船只规则限制强提示 */}
                    {is2BerthViolation && (
                      <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-0.5">2号码头专用船型规则提示：</strong>
                          当前选择的【2号码头】为小型船舶专属泊位（规则：共1个号位，只能停泊一艘小船）。当前项目为【{shipType} - {projectName}】，若为大型主船体，请选择1号码头(新码头)、3号码头(旧码头)、4号码头(浮动码头)、2万吨船台或平船台。
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
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
            onClick={handleSave} 
            disabled={isHistoricalArchived}
            className={`px-6 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
              isHistoricalArchived
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-98 cursor-pointer'
            }`}
          >
            <Check className="w-4 h-4" /> 
            <span>{isHistoricalArchived ? '历史版本只读（禁止编辑）' : isEdit ? '保存阶段版本修改' : '保存阶段版本并应用移泊规划'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}


