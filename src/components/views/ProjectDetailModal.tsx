import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Ship, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Layers, 
  Radio, 
  Users, 
  FileText, 
  Compass, 
  Cpu, 
  Clock, 
  Edit, 
  GitBranch, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
  Footprints,
  ShieldAlert,
  BellRing,
  Wifi,
  Anchor,
  Flame,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ExternalLink,
  Shield,
  Gauge,
  Thermometer,
  Wind,
  Navigation,
  Check,
  Eye,
  Play
} from 'lucide-react';
import { CreatedProjectData } from './CreateProjectModal';
import { 
  getProjectPhases, 
  ProjectPhaseVersionData, 
  PhasePersonnel, 
  PhaseDevice, 
  PhaseFence, 
  PhaseAlarmPolicy 
} from '@/src/data/projectPhaseData';

interface ProjectDetailModalProps {
  isOpen: boolean;
  project: CreatedProjectData | null;
  onClose: () => void;
  onEdit?: (project: CreatedProjectData) => void;
  onOpenVersions?: (projectId: string) => void;
}

export function ProjectDetailModal({ 
  isOpen, 
  project, 
  onClose, 
  onEdit, 
  onOpenVersions 
}: ProjectDetailModalProps) {
  // 获取该项目的阶段版本数据 (只包含历史阶段版本与当前阶段版本，不显示计划版本)
  const phaseList = useMemo(() => {
    if (!project?.id) return [];
    return getProjectPhases(project.id).filter(p => p.status !== 'planned');
  }, [project?.id]);

  // 当前选中的阶段版本 (默认选中当前生效 active 的阶段，否则选第一个)
  const defaultVersionCode = useMemo(() => {
    const activePhase = phaseList.find(p => p.status === 'active');
    return activePhase ? activePhase.versionCode : (phaseList[0]?.versionCode || 'v1');
  }, [phaseList]);

  const [selectedVersionCode, setSelectedVersionCode] = useState<string>(defaultVersionCode);

  useEffect(() => {
    if (defaultVersionCode) {
      setSelectedVersionCode(defaultVersionCode);
    }
  }, [defaultVersionCode]);
  
  // 选中的阶段详情
  const currentPhase: ProjectPhaseVersionData = useMemo(() => {
    return phaseList.find(p => p.versionCode === selectedVersionCode) || phaseList[0];
  }, [phaseList, selectedVersionCode]);

  // 当前激活的子视图 Tab: 'overview' | 'personnel' | 'devices' | 'fences' | 'alarms'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'personnel' | 'devices' | 'fences' | 'alarms'>('overview');

  // 人员子视图筛选与选中 (需求：仅保留“全部人员”和“触发告警”两个过滤标签)
  const [personnelFilter, setPersonnelFilter] = useState<'all' | 'alert'>('all');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // 日期与时间段筛选状态 (支持按日期，某天，某个时间段的信息查询)
  const [queryDate, setQueryDate] = useState<string>('');
  const [startTimeFilter, setStartTimeFilter] = useState<string>('');
  const [endTimeFilter, setEndTimeFilter] = useState<string>('');

  // 设备子视图筛选
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'positioning' | 'environmental' | 'alarm'>('all');

  // 围栏子视图选中的围栏与违规记录展开状态
  const [selectedFenceId, setSelectedFenceId] = useState<string | null>(null);
  const [expandedFenceIds, setExpandedFenceIds] = useState<Record<string, boolean>>({});

  const toggleFenceExpand = (fenceId: string) => {
    setExpandedFenceIds(prev => ({
      ...prev,
      [fenceId]: !prev[fenceId]
    }));
  };

  // 告警子视图选中的策略
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null);

  // 选中的人员详情
  const selectedPerson = useMemo(() => {
    if (!currentPhase?.personnel) return null;
    if (selectedPersonId) {
      return currentPhase.personnel.find(p => p.id === selectedPersonId) || currentPhase.personnel[0] || null;
    }
    return currentPhase.personnel[0] || null;
  }, [currentPhase, selectedPersonId]);

  // 筛选后的人员列表 (仅全部人员与触发告警)
  const filteredPersonnel = useMemo(() => {
    if (!currentPhase?.personnel) return [];
    return currentPhase.personnel.filter(p => {
      if (personnelFilter === 'alert') return p.alertsCount > 0;
      return true;
    });
  }, [currentPhase, personnelFilter]);

  // 根据时间范围筛选轨迹记录
  const filteredTrajectory = useMemo(() => {
    if (!selectedPerson?.trajectory) return [];
    return selectedPerson.trajectory.filter(pt => {
      if (startTimeFilter && pt.time < startTimeFilter) return false;
      if (endTimeFilter && pt.time > endTimeFilter) return false;
      return true;
    });
  }, [selectedPerson, startTimeFilter, endTimeFilter]);

  // 跳转至人员定位页面播放轨迹
  const handlePlayTrajectoryInPage = (personId: string) => {
    window.dispatchEvent(new CustomEvent('navigate_view', {
      detail: {
        view: 'personnel',
        personId: personId,
        autoPlay: true
      }
    }));
    onClose();
  };

  // 筛选后的设备列表
  const filteredDevices = useMemo(() => {
    if (!currentPhase?.devices) return [];
    if (deviceFilter === 'all') return currentPhase.devices;
    return currentPhase.devices.filter(d => d.category === deviceFilter);
  }, [currentPhase, deviceFilter]);

  if (!isOpen || !project) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            施工进行中
          </span>
        );
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
            <Clock className="w-3 h-3 text-blue-500" />
            前期规划中
          </span>
        );
      case 'temporary_departure':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
            <Anchor className="w-3 h-3 text-sky-500 animate-pulse" />
            临时离港
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-3 h-3 text-purple-500" />
            已竣工交船
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            暂停施工
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0">
            {status}
          </span>
        );
    }
  };

  const getPhaseStatusBadge = (status: 'active' | 'archived' | 'planned') => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          当前生效施工阶段
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
        <Check className="w-3 h-3 text-slate-500" />
        历史归档阶段
      </span>
    );
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col h-[94vh] border border-slate-200 text-slate-700 font-sans overflow-hidden"
      >
        {/* ================= 1. 顶部项目核心信息横幅 (需求1：项目编码，项目名称标题和当前状态同行，副标题仅含工程负责人与停泊位信息) ================= */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              {/* 第一行：项目编码、项目名称标题、当前状态 */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/80">
                  {project.id} ({project.shipCode})
                </span>
                <h2 className="text-base font-bold text-slate-900 leading-none">
                  {project.name}
                </h2>
                {getStatusBadge(project.status)}
              </div>
              
              {/* 第二行副标题：工程负责人、停泊位信息，不显示基准空间原点等其他信息 */}
              <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                <span>工程负责人：<strong className="text-slate-800 font-semibold">{project.manager}</strong></span>
                <span>•</span>
                <span>停泊位信息：<strong className="text-blue-700 font-semibold">{currentPhase?.berthInfo?.name || project.dockingArea}</strong></span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onClose();
                if (onEdit) onEdit(project);
              }}
              className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              编辑项目
            </button>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= 2. 阶段版本快捷切换器与时序流 ================= */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 shrink-0 mr-1">
              <GitBranch className="w-4 h-4 text-blue-600" />
              建造阶段版本：
            </span>
            {phaseList.map((ph) => {
              const isSelected = ph.versionCode === selectedVersionCode;
              return (
                <button
                  key={ph.versionCode}
                  onClick={() => {
                    setSelectedVersionCode(ph.versionCode);
                    setSelectedPersonId(null);
                    setSelectedFenceId(null);
                    setSelectedAlarmId(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-[#1677ff] text-white border-blue-600 shadow-sm shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-700'
                  }`}>
                    {ph.versionId}
                  </span>
                  <span>{ph.phaseTitle}</span>
                  {ph.status === 'active' && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300 ring-2 ring-white/50' : 'bg-emerald-500 animate-pulse'}`}></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {getPhaseStatusBadge(currentPhase?.status || 'active')}
            <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {currentPhase?.startDate} ~ {currentPhase?.endDate}
            </span>
          </div>
        </div>

        {/* ================= 3. 阶段版本关联信息子导航 TAB ================= */}
        <div className="flex border-b border-slate-200 bg-white px-6 shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-600" />
            阶段全景与船舶总览
          </button>

          <button
            onClick={() => setActiveSubTab('personnel')}
            className={`py-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeSubTab === 'personnel'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            关联人员与轨迹分析
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-full font-mono border border-indigo-200">
              {currentPhase?.personnel?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('devices')}
            className={`py-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeSubTab === 'devices'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4 text-emerald-600" />
            新增定位与环境监测设备
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-mono border border-emerald-200">
              {currentPhase?.devices?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('fences')}
            className={`py-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeSubTab === 'fences'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            电子围栏与事件流水
            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded-full font-mono border border-amber-200">
              {currentPhase?.fences?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('alarms')}
            className={`py-3 px-4 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
              activeSubTab === 'alarms'
                ? 'border-blue-600 text-blue-600 bg-blue-50/30'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BellRing className="w-4 h-4 text-rose-600" />
            告警配置与审计日志
            <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded-full font-mono border border-rose-200">
              {currentPhase?.alarmPolicies?.length || 0}
            </span>
          </button>
        </div>

        {/* ================= 4. Tab 内容区域 ================= */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: 阶段全景与船舶总览 */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 阶段四大核心要素指标卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => setActiveSubTab('personnel')}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-indigo-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">在场/关联人员</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {currentPhase.personnel.length} <span className="text-xs font-normal text-slate-500 font-sans">人</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveSubTab('devices')}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">部署感知与监测设备</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-600">
                    {currentPhase.devices.length} <span className="text-xs font-normal text-slate-500 font-sans">台套</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveSubTab('fences')}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">生效安全电子围栏</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-700">
                    {currentPhase.fences.length} <span className="text-xs font-normal text-slate-500 font-sans">处</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveSubTab('alarms')}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-rose-400 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">生效告警策略与日志</span>
                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BellRing className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-600">
                    {currentPhase.alarmPolicies.length} <span className="text-xs font-normal text-slate-500 font-sans">项</span>
                  </div>
                </div>
              </div>

              {/* 船舶主尺度与核心工程技术参数 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-900">船舶主尺度与建造技术参数规格</h3>
                  </div>
                  <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md font-mono border border-blue-200/80">
                    数模代号: {project.shipCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">总长 (LOA)</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{project.parameters?.loa || '295.0'} 米</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">型宽 (Beam)</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{project.parameters?.beam || '45.0'} 米</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">型深 (Depth)</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{project.parameters?.depth || '26.25'} 米</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">设计吃水 (Draft)</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{project.parameters?.draft || '11.5'} 米</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">设计排水量</span>
                    <span className="font-mono font-medium text-slate-700 text-xs">{project.parameters?.displacement || '118,000 吨'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">设计航速</span>
                    <span className="font-mono font-medium text-slate-700 text-xs">{project.parameters?.speed || '19.5 节'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-400 block mb-0.5">主机动力形式及节能套件</span>
                    <span className="text-slate-800 text-xs font-medium">{project.parameters?.power || '双燃料低速机 + 轴带发电机'}</span>
                  </div>
                </div>
              </div>

              {/* 项目描述与总体建造概况 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  项目描述与总体建造概况
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {project.description || '本项目为重点船舶建造工程，全面实施分阶段数字化三维人员定位、密闭空间气体监测与全生命周期安全管控。'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 关联人员与轨迹分析 */}
          {activeSubTab === 'personnel' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn">
              {/* 左侧：人员列表与筛选 (5列) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col h-[650px]">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900">
                      {currentPhase.versionId} 阶段关联人员
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    共 {filteredPersonnel.length} 人
                  </span>
                </div>

                {/* 筛选过滤按钮：仅保留“全部人员”和“触发告警”两个过滤标签 */}
                <div className="flex gap-2 mb-3 shrink-0 flex-wrap">
                  <button
                    onClick={() => setPersonnelFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                      personnelFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    全部人员 ({currentPhase.personnel.length})
                  </button>
                  <button
                    onClick={() => setPersonnelFilter('alert')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      personnelFilter === 'alert' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    触发告警 ({currentPhase.personnel.filter(p => p.alertsCount > 0).length})
                  </button>
                </div>

                {/* 人员列表卡片 */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredPersonnel.map((person) => {
                    const isSelected = selectedPerson?.id === person.id;
                    return (
                      <div
                        key={person.id}
                        onClick={() => setSelectedPersonId(person.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400/40 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {person.name.substring(0, 1)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs">{person.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">({person.id})</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                <span>工程：{person.role}</span> · <span className="text-slate-500">班组：{person.department}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              person.status === '在场作业' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : person.status === '违规预警'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {person.status}
                            </span>
                            <span className={`block text-[10px] font-semibold mt-1 ${person.alertsCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                              告警统计：{person.alertsCount} 起
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 右侧：选中人员的行动轨迹路径与触发安全告警 (7列) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col h-[650px] overflow-y-auto">
                {selectedPerson ? (
                  <div className="space-y-5">
                    {/* 人员详细头部卡片：只保留基本信息（姓名、工号、工程、班组、状态）与【播放轨迹过程】按钮 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                            {selectedPerson.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{selectedPerson.name}</h4>
                              <span className="font-mono text-xs text-slate-500">工号: {selectedPerson.id}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                selectedPerson.status === '在场作业' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : selectedPerson.status === '违规预警'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {selectedPerson.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              工程：<strong className="text-slate-800">{selectedPerson.role}</strong> · 所属班组：<strong className="text-slate-800">{selectedPerson.department}</strong>
                            </p>
                          </div>
                        </div>

                        {/* 跳转至“人员定位”主页面并自动开启轨迹回放 */}
                        <button
                          type="button"
                          onClick={() => handlePlayTrajectoryInPage(selectedPerson.id)}
                          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          播放轨迹过程
                        </button>
                      </div>
                    </div>

                    {/* 轨迹路径与分步时间轴 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Footprints className="w-4 h-4 text-indigo-600" />
                          本阶段区域内行动轨迹路径记录
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          共 {filteredTrajectory.length} 个关键定位节点
                        </span>
                      </div>

                      {/* 时间与区间查询条 */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            轨迹区间查询与筛选
                          </span>
                          {(queryDate || startTimeFilter || endTimeFilter) && (
                            <button
                              type="button"
                              onClick={() => {
                                setQueryDate('');
                                setStartTimeFilter('');
                                setEndTimeFilter('');
                              }}
                              className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer font-medium"
                            >
                              重置筛选
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 text-[11px] font-medium">按日期:</span>
                            <input
                              type="date"
                              value={queryDate}
                              onChange={(e) => setQueryDate(e.target.value)}
                              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 text-[11px] font-medium">具体时间段:</span>
                            <input
                              type="time"
                              value={startTimeFilter}
                              onChange={(e) => setStartTimeFilter(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                            />
                            <span className="text-slate-400">~</span>
                            <input
                              type="time"
                              value={endTimeFilter}
                              onChange={(e) => setEndTimeFilter(e.target.value)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 轨迹时间节点列表 (已彻底移除内嵌播放底图区域) */}
                      {filteredTrajectory.length > 0 ? (
                        <div className="relative pl-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                          {/* 垂直时间轴贯穿线 */}
                          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500 via-blue-400 to-indigo-200"></div>

                          {filteredTrajectory.map((pt, idx) => (
                            <div key={idx} className="relative flex items-start gap-3 group">
                              {/* 时间轴节点圆圈 */}
                              <div className={`w-5 h-5 rounded-full font-bold font-mono text-[10px] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-white ${
                                idx === filteredTrajectory.length - 1
                                  ? 'bg-emerald-600 text-white'
                                  : pt.status === 'alert'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-indigo-600 text-white'
                              }`}>
                                {idx + 1}
                              </div>
                              
                              {/* 时间轴卡片内容 */}
                              <div className="flex-1 bg-white border border-slate-200 hover:border-indigo-300 p-2.5 rounded-xl shadow-2xs transition-all">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span className="font-bold text-slate-800 text-xs">{pt.location}</span>
                                  </div>
                                  <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold border border-indigo-100">
                                    {pt.time}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pt-1 border-t border-slate-100">
                                  <span className="flex items-center gap-1">
                                    <span className="text-slate-400">工位区域：</span>
                                    <strong className="text-slate-700">{pt.zone}</strong>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="text-slate-400">停留时间：</span>
                                    <span className="font-mono text-blue-600 font-semibold">{pt.duration}</span>
                                  </span>
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    pt.status === 'entrance'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : pt.status === 'alert'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    {pt.status === 'entrance' ? '门禁进入' : pt.status === 'alert' ? '触发告警' : '正常作业'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
                          🔍 当前选择的时间段内无轨迹点定位记录。
                        </div>
                      )}
                    </div>

                    {/* 人员触发的安全告警记录 */}
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        本阶段该人员触发的安全告警 ({selectedPerson.alerts.length} 起)
                      </h4>

                      {selectedPerson.alerts.length > 0 ? (
                        <div className="space-y-2">
                          {selectedPerson.alerts.map((alt) => (
                            <div key={alt.id} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-rose-800 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                  {alt.type}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500">{alt.time}</span>
                              </div>
                              <p className="text-slate-700 text-[11px] leading-relaxed">
                                {alt.description}
                              </p>
                              <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500 border-t border-rose-100 pt-1">
                                <span>告警级别：<strong className="text-rose-700">{alt.level}危</strong></span>
                                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                                  {alt.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                          ✅ 该人员在当前阶段表现优良，未触发任何违规或越界安全告警。
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    请从左侧选择人员以查看其详细行动轨迹和告警记录。
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 新增定位与环境监测设备 (需求6：精简设备卡片仅展示3个主要参数+设备状态信息，无多余按钮) */}
          {activeSubTab === 'devices' && (
            <div className="space-y-5 animate-fadeIn">
              {/* 顶部控制与分类筛选 */}
              <div className="flex justify-between items-center flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {currentPhase.versionId} 阶段关联感知与监测设备 ({filteredDevices.length} 台)
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setDeviceFilter('all')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      deviceFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    全部设备 ({currentPhase.devices.length})
                  </button>
                  <button
                    onClick={() => setDeviceFilter('positioning')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      deviceFilter === 'positioning' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    定位基站 ({currentPhase.devices.filter(d => d.category === 'positioning').length})
                  </button>
                  <button
                    onClick={() => setDeviceFilter('environmental')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      deviceFilter === 'environmental' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    环境检测仪 ({currentPhase.devices.filter(d => d.category === 'environmental').length})
                  </button>
                  <button
                    onClick={() => setDeviceFilter('alarm')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      deviceFilter === 'alarm' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    声光预警 ({currentPhase.devices.filter(d => d.category === 'alarm').length})
                  </button>
                </div>
              </div>

              {/* 设备列表卡片网格：只包含三个最重要参数（设备编码、设备名称、安装位置）+ 设备状态 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDevices.map((dev) => (
                  <div 
                    key={dev.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-400 hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        编码: {dev.code}
                      </span>
                      {/* 需求2：历史版本不显示状态；当前阶段仅定位基站显示在线状态 */}
                      {currentPhase.status === 'active' && dev.category === 'positioning' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          在线正常
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-1">{dev.name}</h4>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">安装位置：</span>
                        <strong className="text-slate-800 font-semibold truncate max-w-[180px]" title={dev.location}>
                          {dev.location}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: 电子围栏与事件流水 (需求7：只显示围栏基本信息，不显示部署物理位置信息) */}
          {activeSubTab === 'fences' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {currentPhase.versionId} 阶段关联安全电子围栏 ({currentPhase.fences.length} 处)
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  支持三维立体空间网格与平面红线防护
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentPhase.fences.map((fence) => (
                  <div 
                    key={fence.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {fence.code}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            {fence.dimension}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          {fence.dangerLevel}危管控
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1">{fence.name}</h4>

                      {/* 围栏触发的事件流水 */}
                      <div className="mt-4">
                        <h5 className="text-xs font-bold text-slate-800 flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            本阶段围栏告警事件记录
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-rose-600 font-bold">
                              违规次数: {fence.events.length} 次
                            </span>
                            {fence.events.length > 0 && (
                              <button
                                type="button"
                                onClick={() => toggleFenceExpand(fence.id)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5 cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
                              >
                                {expandedFenceIds[fence.id] ? (
                                  <>收起明细 <ChevronUp className="w-3 h-3" /></>
                                ) : (
                                  <>查看明细 <ChevronDown className="w-3 h-3" /></>
                                )}
                              </button>
                            )}
                          </div>
                        </h5>

                        {expandedFenceIds[fence.id] && (
                          fence.events.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mt-2">
                              {fence.events.map((evt) => (
                                <div key={evt.id} className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-rose-900">{evt.personName}</span>
                                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                                        evt.status === '已处置'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : evt.status === '处置中'
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}>
                                        {evt.status}
                                      </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {evt.time}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 mt-1 flex items-center justify-between">
                                    <span>违规类型：<strong className="text-rose-700">{evt.eventType}</strong></span>
                                    <span>处理人：<strong className="text-slate-800">{evt.handler}</strong></span>
                                  </p>
                                  {evt.notes && (
                                    <p className="text-[10px] text-slate-600 bg-white/80 p-1.5 rounded mt-1 border border-rose-100/80">
                                      <strong>处理结果与备注：</strong>{evt.notes}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-100 mt-2">
                              ✨ 当前阶段此围栏未发生越界违规事件
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: 告警配置与审计日志 */}
          {activeSubTab === 'alarms' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-800">
                    {currentPhase.versionId} 阶段触发告警审计日志流水 ({currentPhase.alarmPolicies.flatMap(p => p.logs).length} 条记录)
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  全流程追溯与安全事件处理记录
                </span>
              </div>

              {/* 告警相关日志流水：单列全宽展示 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-600" />
                  阶段告警触发日志流水记录 (Audit & Incident Logs)
                </h4>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {currentPhase.alarmPolicies.flatMap(p => p.logs).length > 0 ? (
                    currentPhase.alarmPolicies.flatMap(p => p.logs).map((log) => (
                      <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-rose-700 flex items-center gap-1.5 text-xs">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            {log.content}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              log.status === '已处理'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : log.status === '待处理'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {log.status}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{log.time}</span>
                          </div>
                        </div>
                        
                        <p className="text-[11px] text-slate-600 flex items-center justify-between">
                          <span>触发源：<strong className="text-slate-800">{log.triggerSource}</strong></span>
                          <span>处理人：<strong className="text-blue-700">{log.processor}</strong></span>
                        </p>

                        {log.actionTaken && (
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-700">
                            <strong>处理结果与处置措施：</strong>{log.actionTaken}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                      ✅ 当前阶段运行平稳，无历史告警日志记录。
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================= 5. 底部操作栏 ================= */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                onClose();
                if (onOpenVersions) onOpenVersions(project.id);
              }} 
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
              阶段版本演进库
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">
              当前展示：<strong className="text-slate-700">{currentPhase.versionId} · {currentPhase.phaseTitle}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
            >
              关闭
            </button>
            <button 
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(project);
              }} 
              className="px-5 py-2 text-xs font-bold text-white bg-[#1677ff] hover:bg-blue-600 rounded-xl transition-all shadow-sm shadow-blue-500/20 flex items-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              编辑项目信息
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
