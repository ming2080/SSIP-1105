import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Map as MapIcon, 
  Clock, 
  User, 
  Filter, 
  Ship, 
  Layers, 
  Compass, 
  Activity, 
  Battery, 
  ShieldAlert, 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft,
  ChevronRight, 
  Radio, 
  Maximize2, 
  Minimize2,
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Phone,
  HardHat,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info,
  Calendar,
  ArrowRight,
  Navigation,
  GitCommit,
  Split,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Building2,
  Anchor,
  History,
  PanelRightClose,
  PanelRightOpen,
  UserCheck,
  FolderTree,
  FolderKanban,
  X
} from 'lucide-react';
import { MOCK_PROJECTS } from '@/src/data/mockProjects';
import { 
  MOCK_PERSONNEL_LIST, 
  DetailedPersonnel, 
  TrajectoryPoint, 
  WORKER_ROLE_OPTIONS, 
  WORKER_TEAM_OPTIONS 
} from '@/src/data/mockPersonnel';
import { TeamTreeSelect } from '@/src/components/common/TeamTreeSelect';
import { DepartmentNode } from '@/src/data/departmentData';

import lngShipImg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerShipImg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerShipImg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkShipImg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';

interface PersonnelTrackingProps {
  initialPersonId?: string;
  initialAutoPlay?: boolean;
  initialMode?: 'position' | 'track';
}

export function PersonnelTracking({ 
  initialPersonId, 
  initialAutoPlay = false,
  initialMode = 'position'
}: PersonnelTrackingProps = {}) {
  // 选中的人员
  const [selectedPersonId, setSelectedPersonId] = useState<string>(initialPersonId || 'EMP-001');
  // 项目关联人员筛选 ('all' 或具体 projectId)
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  // 人员工种下拉筛选
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  // 人员班组树形筛选 (保存选中的 deptid 或 'all')
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  // 选中的班组节点对象
  const [selectedTeamNode, setSelectedTeamNode] = useState<DepartmentNode | null>(null);
  // 选中的节点及其所有子孙节点的匹配名称列表
  const [selectedTeamMatchedNames, setSelectedTeamMatchedNames] = useState<string[]>([]);
  // 搜索关键词（姓名/工号/角色/定位卡号）
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // 地图显示模式：'shipyard' 厂区全景图 | 'vessel' 工程项目模型图
  const [mapViewMode, setMapViewMode] = useState<'shipyard' | 'vessel'>('shipyard');
  
  // 当前在项目模型视图中查看的关联项目ID (默认第一个项目)
  const [activeViewerProjectId, setActiveViewerProjectId] = useState<string>(MOCK_PROJECTS[0].id);

  // 造船项目下拉选择器展开状态
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);

  // 地图右侧轨迹时间轴面板展开状态 (轨迹模式默认开启，实时定位模式默认折叠)
  const [isTimelinePanelOpen, setIsTimelinePanelOpen] = useState<boolean>(initialMode === 'track');

  // 自定义时段下拉设置面板展开状态
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState<boolean>(false);

  // 地图图层控制开关
  const [showFences, setShowFences] = useState<boolean>(true);
  const [showBasestations, setShowBasestations] = useState<boolean>(true); // 定位基站开关
  const [showTrajectoryPath, setShowTrajectoryPath] = useState<boolean>(initialMode === 'track');
  const [showWorkerAvatars, setShowWorkerAvatars] = useState<boolean>(true);

  // 网页级全屏查看控制
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // 时间段选择与查询状态
  const [timePreset, setTimePreset] = useState<'all' | 'morning' | 'afternoon' | 'recent2h' | 'custom'>('all');
  const [queryDate, setQueryDate] = useState<string>('2026-08-29');
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('18:00');
  const [appliedTimeFilter, setAppliedTimeFilter] = useState<{ start: string; end: string; label: string }>({
    start: '00:00',
    end: '23:59',
    label: '今日全天 (00:00 - 24:00)'
  });

  // 轨迹回放控制
  const [isPlayingTrajectory, setIsPlayingTrajectory] = useState<boolean>(initialAutoPlay);

  // 响应 initialMode 切换
  useEffect(() => {
    if (initialMode === 'position') {
      setIsTimelinePanelOpen(false);
      setShowTrajectoryPath(false);
      setIsPlayingTrajectory(false);
    } else if (initialMode === 'track') {
      setIsTimelinePanelOpen(true);
      setShowTrajectoryPath(true);
      if (initialAutoPlay) {
        setIsPlayingTrajectory(true);
      }
    }
  }, [initialMode, initialAutoPlay]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  
  // 回放时是否自动随轨迹节点阶段切换视图 (厂区阶段 <-> 项目船舶模型阶段)
  const [autoSwitchView, setAutoSwitchView] = useState<boolean>(true);
  
  // 视图自动切换时的动态广播通知
  const [viewSwitchNotice, setViewSwitchNotice] = useState<{
    show: boolean;
    mode: 'shipyard' | 'vessel';
    message: string;
    stageLabel: string;
    timestamp: string;
  } | null>(null);

  // 缩放级别 (1x, 1.25x, 1.5x)
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 选中的人员详细信息
  const currentPerson = useMemo(() => {
    return MOCK_PERSONNEL_LIST.find(p => p.id === selectedPersonId) || MOCK_PERSONNEL_LIST[0];
  }, [selectedPersonId]);

  // 当选择新人员时，若该人员有归属项目，同步更新 viewerProjectId
  useEffect(() => {
    if (currentPerson && currentPerson.projectId) {
      setActiveViewerProjectId(currentPerson.projectId);
    }
  }, [currentPerson.id]);

  // 关联的活跃项目详细信息
  const currentProject = useMemo(() => {
    return MOCK_PROJECTS.find(p => p.id === activeViewerProjectId) || MOCK_PROJECTS[0];
  }, [activeViewerProjectId]);

  // 各工程项目的关联人员数量统计映射
  const projectPersonnelCountMap = useMemo(() => {
    const map = new Map<string, number>();
    MOCK_PROJECTS.forEach(proj => {
      const count = MOCK_PERSONNEL_LIST.filter(p => p.projectId === proj.id).length;
      map.set(proj.id, count);
    });
    return map;
  }, []);

  // 人员列表过滤（根据搜索关键字、项目关联人员、工种下拉、班组树形结构层级匹配）
  const filteredPersonnel = useMemo(() => {
    return MOCK_PERSONNEL_LIST.filter(p => {
      const matchKeyword = 
        searchKeyword.trim() === '' ||
        p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.role.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.locatorId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.department.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.projectName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (p.projectId && p.projectId.toLowerCase().includes(searchKeyword.toLowerCase()));
      
      // 项目关联人员匹配
      const matchProject = selectedProjectFilter === 'all' || p.projectId === selectedProjectFilter;

      // 工种匹配
      const matchRole = selectedRoleFilter === 'all' || p.role === selectedRoleFilter;

      // 班组树形层级关联匹配
      let matchTeam = true;
      if (selectedTeamFilter !== 'all') {
        const pDept = (p.department || '').trim();
        if (selectedTeamMatchedNames.length > 0) {
          matchTeam = selectedTeamMatchedNames.some(name => {
            return pDept === name || 
                   pDept.includes(name) || 
                   name.includes(pDept) ||
                   (name === '船体电焊一组' && pDept.includes('电焊')) ||
                   (name === '船体装配二班' && pDept.includes('装配')) ||
                   (name === '特种喷涂一组' && (pDept.includes('喷涂') || pDept.includes('涂装'))) ||
                   (name === '大合拢搭载班' && (pDept.includes('搭载') || pDept.includes('船装'))) ||
                   (name === '起重吊装组' && pDept.includes('起重')) ||
                   (name === '气割与等离子切割组' && (pDept.includes('切割') || pDept.includes('机电'))) ||
                   (name === '船坞码头安全督查巡检组' && (pDept.includes('安全') || pDept.includes('安环')));
          });
        } else {
          matchTeam = p.department === selectedTeamFilter;
        }
      }

      return matchKeyword && matchProject && matchRole && matchTeam;
    });
  }, [searchKeyword, selectedProjectFilter, selectedRoleFilter, selectedTeamFilter, selectedTeamMatchedNames]);

  // 当筛选变化导致当前选中的人员不再在过滤结果中时，智能切换至当前首位在场人员
  useEffect(() => {
    if (filteredPersonnel.length > 0) {
      const isCurrentInFiltered = filteredPersonnel.some(p => p.id === selectedPersonId);
      if (!isCurrentInFiltered) {
        setSelectedPersonId(filteredPersonnel[0].id);
      }
    }
  }, [filteredPersonnel, selectedPersonId]);

  // 根据时间范围查询过滤当前人员的轨迹节点
  const filteredTrajectory = useMemo(() => {
    const rawTrajectory = currentPerson.trajectory;
    if (!rawTrajectory || rawTrajectory.length === 0) return [];

    return rawTrajectory.filter(pt => {
      const ptTime = pt.time.slice(0, 5); // '08:00'
      return ptTime >= appliedTimeFilter.start && ptTime <= appliedTimeFilter.end;
    });
  }, [currentPerson.trajectory, appliedTimeFilter]);

  // 轨迹点更新时校正当前步进索引
  useEffect(() => {
    if (filteredTrajectory.length > 0) {
      setCurrentStepIndex(filteredTrajectory.length - 1);
    } else {
      setCurrentStepIndex(0);
    }
  }, [filteredTrajectory.length, selectedPersonId, appliedTimeFilter]);

  // 监听全屏 ESC 按键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // 执行时间段筛选查询
  const handleApplyTimeQuery = () => {
    let start = '00:00';
    let end = '23:59';
    let label = '今日全天';

    if (timePreset === 'morning') {
      start = '08:00';
      end = '12:00';
      label = '上午班次 (08:00 - 12:00)';
    } else if (timePreset === 'afternoon') {
      start = '12:00';
      end = '18:00';
      label = '下午班次 (12:00 - 18:00)';
    } else if (timePreset === 'recent2h') {
      start = '09:00';
      end = '11:00';
      label = '最近2小时 (09:00 - 11:00)';
    } else if (timePreset === 'custom') {
      start = startTime;
      end = endTime;
      label = `自定义时段 (${startTime} - ${endTime})`;
    } else {
      start = '00:00';
      end = '23:59';
      label = '今日全天 (00:00 - 24:00)';
    }

    setAppliedTimeFilter({ start, end, label });
    setIsPlayingTrajectory(false);
  };

  // 重置时间筛选
  const handleResetTimeQuery = () => {
    setTimePreset('all');
    setStartTime('08:00');
    setEndTime('18:00');
    setAppliedTimeFilter({
      start: '00:00',
      end: '23:59',
      label: '今日全天 (00:00 - 24:00)'
    });
    setIsPlayingTrajectory(false);
  };

  // 项目船体背景图解析
  const vesselBgImage = useMemo(() => {
    switch (activeViewerProjectId) {
      case 'PRJ-2026-LNG01':
        return lngShipImg;
      case 'PRJ-2026-BOX12':
        return containerShipImg;
      case 'PRJ-2026-TANK02':
        return tankerShipImg;
      case 'PRJ-2026-BULK04':
        return bulkShipImg;
      default:
        return lngShipImg;
    }
  }, [activeViewerProjectId]);

  // 当前激活的轨迹节点
  const activeTrajectoryPoint: TrajectoryPoint | undefined = useMemo(() => {
    if (filteredTrajectory.length === 0) return undefined;
    return filteredTrajectory[Math.min(currentStepIndex, filteredTrajectory.length - 1)];
  }, [filteredTrajectory, currentStepIndex]);

  // 核心功能：由厂区阶段进到项目阶段在播放轨迹时才自动切换视图 (以及由项目返回厂区时自动切回)
  useEffect(() => {
    // 关键优化：仅在正在播放轨迹时 (isPlayingTrajectory === true) 才随轨迹节点阶段自动切换厂区/项目模型视图，初始或未播放时保持用户视图(默认厂区全景)
    if (!isPlayingTrajectory || !autoSwitchView || !activeTrajectoryPoint) return;

    const currentDomain = activeTrajectoryPoint.domain;
    const isVesselStage = currentDomain === 'vessel' || (currentDomain === 'transition' && !!activeTrajectoryPoint.vesselPos);
    const targetProjectId = activeTrajectoryPoint.vesselPos?.projectId || currentPerson.projectId;

    if (isVesselStage) {
      // 目标属于【工程项目阶段/船舶模型】
      if (mapViewMode !== 'vessel') {
        setMapViewMode('vessel');
        if (targetProjectId && targetProjectId !== activeViewerProjectId) {
          setActiveViewerProjectId(targetProjectId);
        }
        setViewSwitchNotice({
          show: true,
          mode: 'vessel',
          message: `轨迹进入【项目阶段】(${activeTrajectoryPoint.time})：已自动切至 ${targetProjectId} 工程模型`,
          stageLabel: '工程项目船舶模型',
          timestamp: activeTrajectoryPoint.time
        });
      } else if (targetProjectId && targetProjectId !== activeViewerProjectId) {
        setActiveViewerProjectId(targetProjectId);
      }
    } else if (currentDomain === 'shipyard') {
      // 目标属于【船厂厂区阶段】
      if (mapViewMode !== 'shipyard') {
        setMapViewMode('shipyard');
        setViewSwitchNotice({
          show: true,
          mode: 'shipyard',
          message: `轨迹返回【厂区阶段】(${activeTrajectoryPoint.time})：已自动切至船厂厂区全景总图`,
          stageLabel: '船厂厂区全景图',
          timestamp: activeTrajectoryPoint.time
        });
      }
    }
  }, [isPlayingTrajectory, currentStepIndex, autoSwitchView, activeTrajectoryPoint, mapViewMode, activeViewerProjectId, currentPerson.projectId]);

  // 自动切换视图提示消息定时淡出
  useEffect(() => {
    if (viewSwitchNotice?.show) {
      const timer = setTimeout(() => {
        setViewSwitchNotice(prev => prev ? { ...prev, show: false } : null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [viewSwitchNotice?.show, viewSwitchNotice?.timestamp]);

  // 轨迹自动回放定时器
  useEffect(() => {
    let timer: any;
    if (isPlayingTrajectory && filteredTrajectory.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= filteredTrajectory.length - 1) {
            setIsPlayingTrajectory(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1600 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlayingTrajectory, filteredTrajectory.length, playbackSpeed]);

  // 开始/暂停播放处理 (若在末尾则自动从头开始)
  const handleTogglePlay = () => {
    if (!isPlayingTrajectory) {
      if (currentStepIndex >= filteredTrajectory.length - 1) {
        setCurrentStepIndex(0);
        // 如果起点在厂区全景，确保初始视角为厂区
        const firstPt = filteredTrajectory[0];
        if (firstPt?.domain === 'shipyard') {
          setMapViewMode('shipyard');
        }
      }
      setIsPlayingTrajectory(true);
    } else {
      setIsPlayingTrajectory(false);
    }
  };

  // 单步后退
  const handleStepBackward = () => {
    setIsPlayingTrajectory(false);
    const newIdx = Math.max(0, currentStepIndex - 1);
    setCurrentStepIndex(newIdx);
    if (autoSwitchView && filteredTrajectory[newIdx]) {
      const pt = filteredTrajectory[newIdx];
      if (pt.domain === 'vessel' || (pt.domain === 'transition' && pt.vesselPos)) {
        setMapViewMode('vessel');
      } else if (pt.domain === 'shipyard') {
        setMapViewMode('shipyard');
      }
    }
  };

  // 单步前进
  const handleStepForward = () => {
    setIsPlayingTrajectory(false);
    const newIdx = Math.min(filteredTrajectory.length - 1, currentStepIndex + 1);
    setCurrentStepIndex(newIdx);
    if (autoSwitchView && filteredTrajectory[newIdx]) {
      const pt = filteredTrajectory[newIdx];
      if (pt.domain === 'vessel' || (pt.domain === 'transition' && pt.vesselPos)) {
        setMapViewMode('vessel');
      } else if (pt.domain === 'shipyard') {
        setMapViewMode('shipyard');
      }
    }
  };

  // 重置回放 (恢复为初始厂区全景视图与起始点)
  const resetPlayback = () => {
    setIsPlayingTrajectory(false);
    if (filteredTrajectory.length > 0) {
      setCurrentStepIndex(0);
      setMapViewMode('shipyard');
    }
  };

  // 安全帽颜色映射
  const getHelmetBadge = (color: DetailedPersonnel['helmetColor']) => {
    switch (color) {
      case 'yellow':
        return { label: '特种/焊装', bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
      case 'red':
        return { label: '安环巡检', bg: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
      case 'blue':
        return { label: '起重搭载', bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
      case 'white':
        return { label: '质检管理', bg: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500' };
      case 'orange':
        return { label: '涂装防腐', bg: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500' };
    }
  };

  // 跨区域检测：统计当前筛选轨迹中是否有跨厂区到项目模型的轨迹
  const hasCrossDomainEvents = useMemo(() => {
    return filteredTrajectory.some(pt => pt.isCrossDomain || pt.domain === 'transition');
  }, [filteredTrajectory]);

  // 渲染主地图核心内容组件（复用于常规窗口及网页级全屏模式）
  const renderMapCanvas = (fullscreenMode: boolean = false) => {
    return (
      <div className={`relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center select-none ${fullscreenMode ? 'rounded-2xl border border-slate-700' : ''}`}>
        
        {/* 背景地图图层 (含缩放变换) */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out flex items-center justify-center overflow-hidden"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {mapViewMode === 'shipyard' ? (
            /* 模式 A：船厂全景厂区 GIS 真实鸟瞰总图 */
            <div className="relative w-full h-full">
              <img 
                src="/assets/shipyard_wide_bg.jpg" 
                alt="船厂全景鸟瞰总图" 
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/25 backdrop-brightness-95 pointer-events-none"></div>
              
              {/* 船厂各主要功能泊位与船台标定区 */}
              <div 
                onClick={() => {
                  setActiveViewerProjectId('PRJ-2026-LNG01');
                  setMapViewMode('vessel');
                }}
                className="absolute top-[35%] left-[26%] bg-blue-950/90 border border-blue-400 text-blue-200 text-[10px] px-2.5 py-1 rounded-md font-bold backdrop-blur-sm shadow-lg cursor-pointer hover:bg-blue-800/90 transition-all flex items-center gap-1 group z-10"
              >
                <span>1号造船台 (PRJ-2026-LNG01)</span>
                <ExternalLink className="w-2.5 h-2.5 text-blue-300 opacity-70 group-hover:opacity-100" />
              </div>

              <div 
                onClick={() => {
                  setActiveViewerProjectId('PRJ-2026-BULK04');
                  setMapViewMode('vessel');
                }}
                className="absolute top-[46%] left-[42%] bg-blue-950/90 border border-blue-400 text-blue-200 text-[10px] px-2.5 py-1 rounded-md font-bold backdrop-blur-sm shadow-lg cursor-pointer hover:bg-blue-800/90 transition-all flex items-center gap-1 group z-10"
              >
                <span>2号造船台 (PRJ-2026-BULK04)</span>
                <ExternalLink className="w-2.5 h-2.5 text-blue-300 opacity-70 group-hover:opacity-100" />
              </div>

              <div 
                onClick={() => {
                  setActiveViewerProjectId('PRJ-2026-BOX12');
                  setMapViewMode('vessel');
                }}
                className="absolute top-[24%] left-[68%] bg-blue-950/90 border border-blue-400 text-blue-200 text-[10px] px-2.5 py-1 rounded-md font-bold backdrop-blur-sm shadow-lg cursor-pointer hover:bg-blue-800/90 transition-all flex items-center gap-1 group z-10"
              >
                <span>1号码头·舾装 (PRJ-2026-BOX12)</span>
                <ExternalLink className="w-2.5 h-2.5 text-blue-300 opacity-70 group-hover:opacity-100" />
              </div>

              <div 
                onClick={() => {
                  setActiveViewerProjectId('PRJ-2026-TANK02');
                  setMapViewMode('vessel');
                }}
                className="absolute top-[58%] left-[76%] bg-blue-950/90 border border-blue-400 text-blue-200 text-[10px] px-2.5 py-1 rounded-md font-bold backdrop-blur-sm shadow-lg cursor-pointer hover:bg-blue-800/90 transition-all flex items-center gap-1 group z-10"
              >
                <span>3号码头·水下舾装 (PRJ-2026-TANK02)</span>
                <ExternalLink className="w-2.5 h-2.5 text-blue-300 opacity-70 group-hover:opacity-100" />
              </div>

              {/* 电子围栏区域覆盖 */}
              {showFences && (
                <>
                  {/* 1号船台高空吊装警戒区 */}
                  <div className="absolute top-[32%] left-[28%] w-[16%] h-[20%] border-2 border-dashed border-rose-500/80 bg-rose-500/15 rounded-xl flex items-start p-1.5 pointer-events-none animate-pulse">
                    <span className="text-[9px] font-bold text-rose-300 bg-rose-950/80 px-1 py-0.2 rounded">
                      ⚠️ 1号龙门吊起重警戒区
                    </span>
                  </div>
                  {/* 3号码头受限空间 */}
                  <div className="absolute top-[56%] left-[72%] w-[18%] h-[22%] border-2 border-dashed border-amber-500/80 bg-amber-500/15 rounded-xl flex items-start p-1.5 pointer-events-none">
                    <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded">
                      ⚠️ 密闭舱气体监测区
                    </span>
                  </div>
                </>
              )}

              {/* 定位基站锚点 (已将原UWB基站全面更名为通用定位基站) */}
              {showBasestations && (
                <>
                  <div className="absolute top-[28%] left-[25%] flex items-center gap-1 text-[9px] font-mono text-cyan-300 pointer-events-none z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30 animate-ping"></div>
                    <span className="bg-slate-950/80 px-1 rounded border border-cyan-500/40">定位基站 BS-01 (1号船台)</span>
                  </div>
                  <div className="absolute top-[42%] left-[38%] flex items-center gap-1 text-[9px] font-mono text-cyan-300 pointer-events-none z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30"></div>
                    <span className="bg-slate-950/80 px-1 rounded border border-cyan-500/40">定位基站 BS-02 (2号船台)</span>
                  </div>
                  <div className="absolute top-[20%] left-[70%] flex items-center gap-1 text-[9px] font-mono text-cyan-300 pointer-events-none z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30"></div>
                    <span className="bg-slate-950/80 px-1 rounded border border-cyan-500/40">定位基站 BS-03 (1号码头)</span>
                  </div>
                  <div className="absolute top-[62%] left-[80%] flex items-center gap-1 text-[9px] font-mono text-cyan-300 pointer-events-none z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30"></div>
                    <span className="bg-slate-950/80 px-1 rounded border border-cyan-500/40">定位基站 BS-04 (3号码头)</span>
                  </div>
                </>
              )}

              {/* 厂区全景轨迹连线 SVG (动态绘制当前选中人员在厂区及跨域点位移动轨迹) */}
              {showTrajectoryPath && filteredTrajectory.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                  <defs>
                    <linearGradient id="shipyardPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {/* 绘制厂区线段 */}
                  {filteredTrajectory.slice(0, currentStepIndex + 1).map((pt, idx, arr) => {
                    if (idx === 0) return null;
                    const prevPt = arr[idx - 1];
                    const x1 = prevPt.shipyardPos?.x ?? prevPt.x;
                    const y1 = prevPt.shipyardPos?.y ?? prevPt.y;
                    const x2 = pt.shipyardPos?.x ?? pt.x;
                    const y2 = pt.shipyardPos?.y ?? pt.y;

                    return (
                      <line
                        key={`line-${idx}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={pt.isCrossDomain ? '#f59e0b' : '#38bdf8'}
                        strokeWidth={pt.isCrossDomain ? '3.5' : '2.5'}
                        strokeDasharray={pt.isCrossDomain ? '4 2' : '6 3'}
                        className="animate-[dash_1.5s_linear_infinite]"
                      />
                    );
                  })}

                  {/* 绘制厂区节点 */}
                  {filteredTrajectory.slice(0, currentStepIndex + 1).map((pt, idx) => {
                    const isLatest = idx === currentStepIndex;
                    const x = pt.shipyardPos?.x ?? pt.x;
                    const y = pt.shipyardPos?.y ?? pt.y;

                    return (
                      <g key={`pt-${idx}`}>
                        <circle
                          cx={`${x}%`}
                          cy={`${y}%`}
                          r={isLatest ? 8 : (pt.isCrossDomain ? 6 : 4)}
                          fill={isLatest ? '#38bdf8' : (pt.isCrossDomain ? '#f59e0b' : '#64748b')}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className={isLatest ? 'animate-pulse' : ''}
                        />
                        {/* 跨域登船点特殊光环 */}
                        {pt.isCrossDomain && (
                          <circle
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r={12}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                            className="animate-spin"
                          />
                        )}
                        <text
                          x={`${x}%`}
                          y={`${y - 3.5}%`}
                          textAnchor="middle"
                          fill={pt.isCrossDomain ? '#fde68a' : '#bae6fd'}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          className="drop-shadow-md"
                        >
                          {pt.time} {pt.isCrossDomain ? '⚡[跨域登船]' : `(${pt.zone})`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* 厂区所有在岗人员点位渲染 */}
              {showWorkerAvatars && MOCK_PERSONNEL_LIST.map(person => {
                if (person.status === 'inactive') return null;
                const isSelected = selectedPersonId === person.id;

                return (
                  <div
                    key={person.id}
                    onClick={() => {
                      setSelectedPersonId(person.id);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-20 group ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                    }`}
                    style={{ left: `${person.shipyardPos.x}%`, top: `${person.shipyardPos.y}%` }}
                  >
                    {/* 选中高亮光环 */}
                    {isSelected && (
                      <div className="absolute -inset-2 rounded-full bg-blue-400/40 animate-ping pointer-events-none"></div>
                    )}

                    {/* 圆形人员头像标点 */}
                    <div className={`w-8 h-8 rounded-full ${person.avatarBg} text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 ${
                      isSelected ? 'border-yellow-300 ring-4 ring-blue-500/60' : 'border-white ring-2 ring-black/40'
                    }`}>
                      {person.avatarText}
                    </div>

                    {/* 悬停/选中状态的人员气泡 */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950/95 text-white border border-slate-700 px-2.5 py-1.5 rounded-xl shadow-xl whitespace-nowrap pointer-events-none transition-all z-40 ${
                      isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{person.name}</span>
                        <span className="text-[10px] text-blue-300">({person.role})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {person.shipyardPos.areaName}
                      </div>
                      <div className="w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1"></div>
                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            /* 模式 B：工程项目区域 3D/船舶结构模型图（可自由下拉切换不同船舶项目） */
            <div className="relative w-full h-full flex items-center justify-center p-6">
              
              {/* 船模背景插图与容器 */}
              <div className="relative w-[92%] max-w-5xl h-[80%] rounded-2xl overflow-hidden border border-blue-500/30 bg-slate-950/90 shadow-2xl flex items-center justify-center p-4">
                <img 
                  src={vesselBgImage} 
                  alt={`${currentProject.name} 结构模型图`} 
                  className="w-full h-full object-contain opacity-75 filter drop-shadow-[0_0_25px_rgba(59,130,246,0.35)]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none"></div>

                {/* 船体舱段标定文字与项目关联信息 */}
                <div className="absolute top-4 left-6 flex items-center gap-2 bg-blue-950/90 border border-blue-700 px-3 py-1.5 rounded-lg shadow-lg">
                  <Ship className="w-3.5 h-3.5 text-blue-400" />
                  <div className="text-xs font-mono font-bold text-blue-200">
                    <span>{currentProject.name}</span>
                    <span className="text-blue-400 ml-1.5">[{currentProject.shipCode}]</span>
                  </div>
                </div>

                <div className="absolute top-4 right-6 text-xs font-mono text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>泊位: {currentProject.dockLocation}</span>
                </div>

                {/* 船体结构方位标注 */}
                <div className="absolute bottom-3 left-8 text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <span>◄ 艏部 (Bow Section)</span>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono text-slate-400">
                  ▲ 货舱/绝热/装配中段 (Cargo Hold & Deck)
                </div>
                <div className="absolute bottom-3 right-8 text-[11px] font-mono text-slate-400">
                  艉部机舱与生活区 (Stern) ►
                </div>

                {/* 船舶模型内部轨迹连线 SVG */}
                {showTrajectoryPath && filteredTrajectory.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                    <defs>
                      <linearGradient id="vesselPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
                      </linearGradient>
                    </defs>

                    {/* 绘制船舶内部线段 */}
                    {filteredTrajectory.slice(0, currentStepIndex + 1).map((pt, idx, arr) => {
                      if (idx === 0) return null;
                      const prevPt = arr[idx - 1];
                      const x1 = prevPt.vesselPos?.x ?? prevPt.x;
                      const y1 = prevPt.vesselPos?.y ?? prevPt.y;
                      const x2 = pt.vesselPos?.x ?? pt.x;
                      const y2 = pt.vesselPos?.y ?? pt.y;

                      return (
                        <line
                          key={`vessel-line-${idx}`}
                          x1={`${x1}%`}
                          y1={`${y1}%`}
                          x2={`${x2}%`}
                          y2={`${y2}%`}
                          stroke={pt.isCrossDomain ? '#f59e0b' : '#3b82f6'}
                          strokeWidth="2.5"
                          strokeDasharray={pt.isCrossDomain ? '4 2' : '6 3'}
                          className="animate-[dash_1.5s_linear_infinite]"
                        />
                      );
                    })}

                    {/* 绘制船舶模型节点 */}
                    {filteredTrajectory.slice(0, currentStepIndex + 1).map((pt, idx) => {
                      const isLatest = idx === currentStepIndex;
                      const x = pt.vesselPos?.x ?? pt.x;
                      const y = pt.vesselPos?.y ?? pt.y;

                      return (
                        <g key={`vessel-pt-${idx}`}>
                          <circle
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r={isLatest ? 7 : (pt.isCrossDomain ? 6 : 4)}
                            fill={isLatest ? '#3b82f6' : (pt.isCrossDomain ? '#f59e0b' : '#94a3b8')}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className={isLatest ? 'animate-pulse' : ''}
                          />
                          <text
                            x={`${x}%`}
                            y={`${y - 3.5}%`}
                            textAnchor="middle"
                            fill={pt.isCrossDomain ? '#fde68a' : '#93c5fd'}
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {pt.time} {pt.isCrossDomain ? '⚡[跨入船模]' : `(${pt.vesselPos?.deck || pt.zone})`}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}

                {/* 船舶模型中当前人员当前点位的高亮标头 */}
                {activeTrajectoryPoint && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-25 transition-all duration-300"
                    style={{ 
                      left: `${activeTrajectoryPoint.vesselPos?.x ?? activeTrajectoryPoint.x}%`, 
                      top: `${activeTrajectoryPoint.vesselPos?.y ?? activeTrajectoryPoint.y}%` 
                    }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-2xl ring-4 ring-yellow-400 border-2 border-white">
                        {currentPerson.avatarText}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-blue-900/95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg border border-blue-500">
                        {currentPerson.name} · {activeTrajectoryPoint.vesselPos?.compartment || activeTrajectoryPoint.location}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}
        </div>

        {/* ===================== 顶部一体化悬浮控制栏 (需求 1 & 需求 2) ===================== */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
          
          {/* 左侧：驾驶舱风格视图切换胶囊 + 造船项目专属选择器 (需求 1) */}
          <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
            
            {/* 驾驶舱标准胶囊按钮组 */}
            <div className="flex items-center bg-[#071d3d]/90 p-0.5 rounded-full border border-[#1f4a7c] shadow-[0_0_16px_rgba(0,210,255,0.25)] backdrop-blur-md">
              <button
                onClick={() => {
                  setMapViewMode('shipyard');
                  setIsProjectDropdownOpen(false);
                }}
                className={`px-3.5 py-1 text-xs font-bold tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  mapViewMode === 'shipyard'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_14px_rgba(0,210,255,0.7)]'
                    : 'text-[#8ab4f8] hover:text-white hover:bg-[#0c315e]/50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>厂区全景</span>
              </button>

              <button
                onClick={() => {
                  setMapViewMode('vessel');
                  // 只有当选择造船项目时才显示项目选择，默认切换为第一个项目
                  if (!activeViewerProjectId) {
                    setActiveViewerProjectId(MOCK_PROJECTS[0].id);
                  }
                }}
                className={`px-3.5 py-1 text-xs font-bold tracking-wider transition-all duration-300 rounded-full flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  mapViewMode === 'vessel'
                    ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_14px_rgba(0,210,255,0.7)]'
                    : 'text-[#8ab4f8] hover:text-white hover:bg-[#0c315e]/50'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>造船项目</span>
              </button>
            </div>

            {/* 造船项目专属选择下拉胶囊 (仅当选择造船项目时才显示，参考驾驶舱图1，需求 1) */}
            {mapViewMode === 'vessel' && (
              <div className="relative animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProjectDropdownOpen(!isProjectDropdownOpen);
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
                      <span>选择在建造船项目</span>
                      <span className="font-mono text-cyan-400">共 {MOCK_PROJECTS.length} 个项目</span>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                      {MOCK_PROJECTS.map(proj => {
                        const isCurrentActive = proj.id === activeViewerProjectId;
                        return (
                          <div
                            key={proj.id}
                            onClick={() => {
                              setActiveViewerProjectId(proj.id);
                              setIsProjectDropdownOpen(false);
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
                              <span>编号: {proj.id} · {proj.shipType}</span>
                              <span className="font-mono text-emerald-400">进度: {proj.progress}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 人员实时位置徽标 */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/85 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-slate-200 backdrop-blur-md shadow-md">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white">{currentPerson.name}</span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] font-medium text-slate-300 truncate max-w-[140px]">
                {mapViewMode === 'shipyard' 
                  ? `${currentPerson.shipyardPos.areaName}` 
                  : `${currentPerson.vesselPos.deck} - ${currentPerson.vesselPos.compartment}`}
              </span>
            </div>

          </div>

          {/* 右侧：时段筛选、图层控制开关、缩放、全屏与时间轴展开按钮 (需求 2) */}
          <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
            
            {/* 轨迹时间段筛选胶囊 (需求 2) */}
            <div className="relative">
              <div className="flex items-center bg-slate-900/90 border border-slate-700/80 p-0.5 rounded-xl shadow-lg backdrop-blur-md text-[11px]">
                <div className="flex items-center gap-1 px-2 text-slate-400 font-medium">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span className="hidden sm:inline">时段:</span>
                </div>
                {[
                  { id: 'all', label: '全天' },
                  { id: 'morning', label: '上午' },
                  { id: 'afternoon', label: '下午' },
                  { id: 'recent2h', label: '近2h' },
                  { id: 'custom', label: '自定义' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setTimePreset(tab.id as any);
                      if (tab.id === 'custom') {
                        setIsCustomTimeOpen(!isCustomTimeOpen);
                      } else {
                        setIsCustomTimeOpen(false);
                        let start = '00:00';
                        let end = '23:59';
                        let label = '今日全天';
                        if (tab.id === 'morning') { start = '08:00'; end = '12:00'; label = '上午班次 (08:00-12:00)'; }
                        if (tab.id === 'afternoon') { start = '12:00'; end = '18:00'; label = '下午班次 (12:00-18:00)'; }
                        if (tab.id === 'recent2h') { start = '09:00'; end = '11:00'; label = '最近2小时 (09:00-11:00)'; }
                        setAppliedTimeFilter({ start, end, label });
                      }
                    }}
                    className={`px-2 py-0.8 rounded-lg font-medium transition-all ${
                      timePreset === tab.id 
                        ? 'bg-blue-600 text-white font-bold shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 自定义时段下拉弹窗 */}
              {isCustomTimeOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full mt-2 right-0 w-72 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 text-xs text-slate-200"
                >
                  <div className="font-bold text-white mb-2 flex items-center justify-between">
                    <span>设置自定义查询时段</span>
                    <button onClick={() => setIsCustomTimeOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">查询日期</span>
                      <input 
                        type="date" 
                        value={queryDate} 
                        onChange={(e) => setQueryDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">开始时间</span>
                        <input 
                          type="time" 
                          value={startTime} 
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">结束时间</span>
                        <input 
                          type="time" 
                          value={endTime} 
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleApplyTimeQuery();
                      setIsCustomTimeOpen(false);
                    }}
                    className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    确认查询
                  </button>
                </div>
              )}
            </div>

            {/* 图层开关控制胶囊 (需求 2) */}
            <div className="hidden md:flex items-center gap-0.5 bg-slate-900/90 border border-slate-700/80 p-0.5 rounded-xl text-[11px] text-slate-300 shadow-lg backdrop-blur-md">
              <button
                onClick={() => setShowFences(!showFences)}
                className={`px-2 py-0.8 rounded-lg font-medium transition-colors ${showFences ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-200'}`}
                title="开关电子围栏警戒区"
              >
                电子围栏
              </button>
              <button
                onClick={() => setShowTrajectoryPath(!showTrajectoryPath)}
                className={`px-2 py-0.8 rounded-lg font-medium transition-colors ${showTrajectoryPath ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-200'}`}
                title="开关轨迹连线路径"
              >
                轨迹路径
              </button>
              <button
                onClick={() => setShowBasestations(!showBasestations)}
                className={`px-2 py-0.8 rounded-lg font-medium transition-colors ${showBasestations ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-400 hover:text-slate-200'}`}
                title="开关定位基站"
              >
                定位基站
              </button>
            </div>

            {/* 地图缩放控制 */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.9, prev - 0.1))} 
                className="p-1.5 hover:bg-slate-800 text-slate-300"
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-slate-300 border-x border-slate-800">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))} 
                className="p-1.5 hover:bg-slate-800 text-slate-300"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 网页全屏按钮 */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-slate-900/90 hover:bg-blue-600/80 border border-slate-700/80 text-white px-2.5 py-1.5 rounded-xl shadow-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md"
              title={isFullscreen ? "退出网页全屏 (ESC)" : "切换至网页全屏沉浸式查看"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? '退出' : '全屏'}</span>
            </button>

            {/* 展开/折叠右侧时间轴面板按钮 (需求 3) */}
            <button
              onClick={() => setIsTimelinePanelOpen(!isTimelinePanelOpen)}
              className={`px-3 py-1.5 rounded-xl shadow-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md border ${
                isTimelinePanelOpen 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-[0_0_14px_rgba(0,210,255,0.5)]' 
                  : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
              }`}
              title="切换历史轨迹节点记录与时间轴回放面板"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">轨迹时间轴</span>
              <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.2 rounded-full">
                {filteredTrajectory.length}
              </span>
            </button>

          </div>

        </div>

        {/* 视角阶段自动切换动态广播横幅 (由厂区进到项目或由项目回厂区时自动高亮广播) */}
        {viewSwitchNotice?.show && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-blue-950/95 via-indigo-950/95 to-slate-950/95 border-2 border-cyan-400/90 text-white px-4 py-2 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.45)] backdrop-blur-md flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-md ring-2 ring-cyan-200 animate-pulse">
              {viewSwitchNotice.mode === 'vessel' ? <Ship className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                <span>智能视角联动：已自动切至【{viewSwitchNotice.stageLabel}】</span>
                <span className="text-[10px] text-cyan-300/80 font-mono">[{viewSwitchNotice.timestamp}]</span>
              </div>
              <div className="text-[11px] text-slate-200">
                {viewSwitchNotice.message}
              </div>
            </div>
            <button 
              onClick={() => setViewSwitchNotice(null)}
              className="text-slate-400 hover:text-white p-1 rounded ml-1 text-xs cursor-pointer"
              title="关闭提示"
            >
              ✕
            </button>
          </div>
        )}

        {/* 地图居中底部当前视角状态胶囊 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/85 border border-slate-700/80 rounded-full px-3.5 py-1 text-xs text-slate-300 backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span className="text-slate-400">当前视图:</span>
          {mapViewMode === 'shipyard' ? (
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>船厂厂区全景地图 (地面与车间)</span>
            </span>
          ) : (
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Ship className="w-3.5 h-3.5" />
              <span>工程项目模型 ({activeViewerProjectId} · {currentProject.name})</span>
            </span>
          )}
          {autoSwitchView && (
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.2 rounded-full font-medium ml-1">
              联动切视角开启
            </span>
          )}
        </div>

        {/* ===================== 右侧嵌入式时间轴与轨迹回放控制面板 (需求 3) ===================== */}
        {isTimelinePanelOpen && (
          <div className="absolute top-14 bottom-3 right-3 w-84 sm:w-92 z-30 bg-[#061833]/92 border border-[#00d2ff]/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.85),0_0_24px_rgba(0,210,255,0.25)] backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200">
            
            {/* 面板顶部：标题、人员信息与收起按钮 */}
            <div className="p-3 border-b border-blue-900/60 bg-blue-950/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>【{currentPerson.name}】历史轨迹节点</span>
                  </h4>
                  <p className="text-[10px] font-mono text-cyan-300/80 truncate">
                    {currentPerson.id} · 卡号: {currentPerson.locatorId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleResetTimeQuery}
                  className="p-1 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                  title="重置时段为今日全天"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsTimelinePanelOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  title="收起时间轴面板"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 跨域事件高亮提示条 (若有跨域行动) */}
            {hasCrossDomainEvents && (
              <div className="bg-amber-950/70 border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>检测到跨厂区-登船作业轨迹</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <button 
                    onClick={() => setMapViewMode('shipyard')}
                    className={`px-1.5 py-0.5 rounded font-bold ${mapViewMode === 'shipyard' ? 'bg-amber-500 text-black' : 'text-amber-300 hover:bg-amber-900/50'}`}
                  >
                    厂区
                  </button>
                  <span className="text-amber-500">/</span>
                  <button 
                    onClick={() => setMapViewMode('vessel')}
                    className={`px-1.5 py-0.5 rounded font-bold ${mapViewMode === 'vessel' ? 'bg-cyan-500 text-black' : 'text-cyan-300 hover:bg-blue-900/50'}`}
                  >
                    船模
                  </button>
                </div>
              </div>
            )}

            {/* 回放控制器操作条 (需求 3) */}
            <div className="p-3 border-b border-blue-900/60 bg-[#092244]/60 flex flex-col gap-2 shrink-0">
              
              {/* 进度与当前点位指示 */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  当前节点: <span className="font-bold text-cyan-300 font-mono">{filteredTrajectory.length > 0 ? currentStepIndex + 1 : 0}</span> / {filteredTrajectory.length}
                </span>
                <span className="font-mono text-cyan-400 font-bold">
                  {activeTrajectoryPoint ? activeTrajectoryPoint.time : '--:--'}
                </span>
              </div>

              {/* 回放进度条 */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-200"
                  style={{ width: `${filteredTrajectory.length > 0 ? ((currentStepIndex + 1) / filteredTrajectory.length) * 100 : 0}%` }}
                ></div>
              </div>

              {/* 控制按钮矩阵 */}
              <div className="flex items-center justify-between gap-1 mt-1">
                
                {/* 自动切视角联动 */}
                <button
                  onClick={() => setAutoSwitchView(!autoSwitchView)}
                  className={`px-2 py-1 text-[10px] rounded-lg font-medium flex items-center gap-1 transition-all border cursor-pointer ${
                    autoSwitchView 
                      ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500 shadow-2xs font-bold' 
                      : 'bg-slate-800/80 text-slate-400 border-slate-700'
                  }`}
                  title="由厂区阶段进到项目阶段回放轨迹时自动切换视图"
                >
                  <Sparkles className={`w-3 h-3 ${autoSwitchView ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>自动切视角: {autoSwitchView ? '开' : '关'}</span>
                </button>

                {/* 控制按键组 */}
                <div className="flex items-center gap-1">
                  
                  {/* 上一步 */}
                  <button
                    onClick={handleStepBackward}
                    disabled={currentStepIndex <= 0}
                    className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="上一个轨迹点"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* 播放/暂停大按键 */}
                  <button
                    onClick={handleTogglePlay}
                    className={`px-3 py-1 text-xs rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md ${
                      isPlayingTrajectory 
                        ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]' 
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_12px_rgba(0,210,255,0.5)]'
                    }`}
                  >
                    {isPlayingTrajectory ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingTrajectory ? '暂停' : '播放'}</span>
                  </button>

                  {/* 下一步 */}
                  <button
                    onClick={handleStepForward}
                    disabled={currentStepIndex >= filteredTrajectory.length - 1}
                    className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="下一个轨迹点"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* 重置 */}
                  <button
                    onClick={resetPlayback}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
                    title="重置到初始"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                </div>

                {/* 倍速 */}
                <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 text-[10px] text-slate-400 font-mono">
                  {[1, 2, 4].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-1.5 py-0.5 rounded ${playbackSpeed === speed ? 'bg-blue-600 font-bold text-white shadow-2xs' : 'hover:text-slate-200'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* 垂直时间轴列表 (需求 3: 历史轨迹节点记录与回放按时间轴方式展示) */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
              {filteredTrajectory.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
                  <p>当前所选时段内无轨迹记录</p>
                  <p className="text-[10px] text-slate-500 mt-1">请尝试切换为【今日全天】或其他时间段</p>
                </div>
              ) : (
                filteredTrajectory.map((point, index) => {
                  const isCurrentActive = index === currentStepIndex;
                  const isPassed = index <= currentStepIndex;

                  return (
                    <div 
                      key={index}
                      onClick={() => {
                        setCurrentStepIndex(index);
                        if (autoSwitchView) {
                          if (point.domain === 'vessel' || (point.domain === 'transition' && point.vesselPos)) {
                            setMapViewMode('vessel');
                          } else if (point.domain === 'shipyard') {
                            setMapViewMode('shipyard');
                          }
                        }
                      }}
                      className={`relative pl-6 pb-4 group cursor-pointer transition-all ${
                        index === filteredTrajectory.length - 1 ? 'pb-1' : ''
                      }`}
                    >
                      {/* 纵向时间轴连接线 */}
                      {index !== filteredTrajectory.length - 1 && (
                        <div className={`absolute left-2.5 top-3.5 bottom-0 w-0.5 transition-colors ${
                          isPassed ? 'bg-gradient-to-b from-cyan-400 to-blue-600' : 'bg-slate-800'
                        }`}></div>
                      )}

                      {/* 时间轴圆点节点 */}
                      <div className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isCurrentActive 
                          ? 'bg-cyan-400 ring-4 ring-cyan-400/30 text-black shadow-[0_0_12px_rgba(0,210,255,0.9)] animate-pulse z-10' 
                          : point.isCrossDomain 
                          ? 'bg-amber-500 ring-2 ring-amber-400/40 text-black z-10'
                          : isPassed
                          ? 'bg-blue-600 border-2 border-slate-900 text-white'
                          : 'bg-slate-800 border-2 border-slate-700 text-slate-500'
                      }`}>
                        {point.isCrossDomain ? (
                          <span className="text-[10px] font-bold">⚡</span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        )}
                      </div>

                      {/* 节点内容卡片 */}
                      <div className={`p-2 rounded-xl border transition-all ${
                        isCurrentActive 
                          ? 'bg-gradient-to-r from-blue-900/90 to-cyan-950/90 border-[#00d2ff] shadow-[0_0_16px_rgba(0,210,255,0.3)] ring-1 ring-[#00d2ff]/40' 
                          : 'bg-[#082042]/50 border-blue-900/30 hover:bg-[#0c2d5c]/60 hover:border-blue-700/50'
                      }`}>
                        
                        {/* 顶栏：打卡时间 + 停留时长 + 状态徽标 */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-cyan-300">{point.time}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({point.duration})</span>
                          </div>
                          
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                            point.status === 'entrance' 
                              ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' 
                              : point.status === 'transition'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                              : point.status === 'alert'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          }`}>
                            {point.status === 'entrance' 
                              ? '门禁进入' 
                              : point.status === 'transition'
                              ? '跨域登船'
                              : point.status === 'alert'
                              ? '超时预警'
                              : '正常作业'}
                          </span>
                        </div>

                        {/* 中栏：具体空间位置 */}
                        <div className="text-xs font-semibold text-white mb-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{point.location}</span>
                        </div>

                        {/* 底栏：空间归属场景 */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-blue-900/40">
                          <div className="flex items-center gap-1">
                            {point.domain === 'vessel' ? (
                              <span className="text-cyan-300 bg-blue-950/80 px-1.5 py-0.2 rounded border border-cyan-800/40 flex items-center gap-1">
                                <Ship className="w-2.5 h-2.5" />
                                <span>船模 · {point.vesselPos?.deck || '舱段'}</span>
                              </span>
                            ) : point.domain === 'transition' ? (
                              <span className="text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-700/40 flex items-center gap-1 font-bold">
                                <span>⚡ 登船跨域通道</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-700/40 flex items-center gap-1">
                                <Building2 className="w-2.5 h-2.5" />
                                <span>厂区地面</span>
                              </span>
                            )}
                          </div>

                          {isCurrentActive && (
                            <span className="text-cyan-400 font-bold text-[9px] flex items-center gap-1 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                              <span>当前定位点</span>
                            </span>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-3 overflow-hidden select-none relative">
      
      {/* ===================== 网页级全屏查看模态层 (要求 3) ===================== */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-2 overflow-hidden select-none animate-in fade-in duration-200">
          <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {renderMapCanvas(true)}
          </div>
        </div>
      )}

      {/* ===================== 常规视图模式 ===================== */}

      {/* 左侧栏：人员列表与精准项目筛选 */}
      <div className="w-full lg:w-80 xl:w-88 bg-white shadow-sm border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0">
        
        {/* 顶部搜索与多维项目筛选 */}
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-800 border-l-3 border-blue-600 pl-2 uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>人员定位监控</span>
            </h3>
            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              在场 {filteredPersonnel.filter(p => p.status !== 'inactive').length} / {filteredPersonnel.length} 人
            </span>
          </div>

          {/* 关键字搜索框 */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索姓名、工号、卡号、岗位、所属项目..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition-all"
            />
            {searchKeyword && (
              <button 
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* 维度多重筛选条件：1.项目关联人员 2.人员工种 3.人员班组 */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {/* 1. 项目关联人员项筛选 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FolderKanban className="w-3 h-3 text-blue-600" />
                  <span>项目关联人员</span>
                </span>
                {selectedProjectFilter !== 'all' && (
                  <span className="text-[10px] text-blue-600 font-normal">已筛选</span>
                )}
              </label>
              <select 
                value={selectedProjectFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedProjectFilter(val);
                  // 选定具体工程项目时，智能联动切换右侧模型查看器对应的项目
                  if (val !== 'all') {
                    setActiveViewerProjectId(val);
                  }
                }}
                className={`w-full text-xs border rounded-lg py-1.5 px-2.5 outline-none transition-all cursor-pointer shadow-2xs ${
                  selectedProjectFilter !== 'all' 
                    ? 'bg-blue-50/50 border-blue-400 text-blue-800 font-semibold ring-2 ring-blue-500/10' 
                    : 'bg-white border-slate-200 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              >
                <option value="all">全部造船工程项目 ({MOCK_PROJECTS.length} 个项目 / 全厂人员)</option>
                {MOCK_PROJECTS.map(proj => {
                  const count = projectPersonnelCountMap.get(proj.id) || 0;
                  return (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({count}人 · {proj.phase})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. 人员工种下拉筛选 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-600" />
                  <span>人员工种</span>
                </span>
                {selectedRoleFilter !== 'all' && (
                  <span className="text-[10px] text-blue-600 font-normal">已筛选</span>
                )}
              </label>
              <select 
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className={`w-full text-xs border rounded-lg py-1.5 px-2.5 outline-none transition-all cursor-pointer shadow-2xs ${
                  selectedRoleFilter !== 'all' 
                    ? 'bg-blue-50/50 border-blue-400 text-blue-800 font-semibold ring-2 ring-blue-500/10' 
                    : 'bg-white border-slate-200 text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              >
                <option value="all">全部工种 ({WORKER_ROLE_OPTIONS.length} 类工种)</option>
                {WORKER_ROLE_OPTIONS.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. 人员班组树形结构筛选 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FolderTree className="w-3 h-3 text-blue-600" />
                  <span>人员班组 (层级架构)</span>
                </span>
                {selectedTeamFilter !== 'all' && (
                  <span className="text-[10px] text-blue-600 font-normal">
                    {selectedTeamNode ? `已选: ${selectedTeamNode.deptname}` : '已筛选'}
                  </span>
                )}
              </label>

              <TeamTreeSelect
                value={selectedTeamFilter}
                onChange={(deptId, node, descendantIds, matchedNames) => {
                  setSelectedTeamFilter(deptId);
                  setSelectedTeamNode(node);
                  setSelectedTeamMatchedNames(matchedNames);
                }}
                personnelList={MOCK_PERSONNEL_LIST}
                placeholder="全部人员班组 (全厂架构)"
              />
            </div>

            {/* 快速重置过滤按钮 */}
            {(selectedProjectFilter !== 'all' || selectedRoleFilter !== 'all' || selectedTeamFilter !== 'all' || searchKeyword.trim() !== '') && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setSelectedProjectFilter('all');
                    setSelectedRoleFilter('all');
                    setSelectedTeamFilter('all');
                    setSelectedTeamNode(null);
                    setSelectedTeamMatchedNames([]);
                    setSearchKeyword('');
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1 py-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>重置所有筛选条件</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 人员列表卡片容器 */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 bg-slate-50/50">
          {filteredPersonnel.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <User className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>未查找到符合条件的人员记录</p>
            </div>
          ) : (
            filteredPersonnel.map(person => {
              const isSelected = selectedPersonId === person.id;
              const helmetBadge = getHelmetBadge(person.helmetColor);

              return (
                <div 
                  key={person.id}
                  onClick={() => {
                    setSelectedPersonId(person.id);
                    setIsPlayingTrajectory(false);
                    setMapViewMode('shipyard');
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all relative ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/90 shadow-sm ring-2 ring-blue-500/10' 
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    
                    {/* 圆形头像 */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className={`w-10 h-10 rounded-full ${person.avatarBg} text-white font-bold text-sm flex items-center justify-center shadow-sm ring-2 ring-white`}>
                        {person.avatarText}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-2xs ${
                        person.status === 'active' 
                          ? 'bg-emerald-500 ring-1 ring-emerald-300' 
                          : person.status === 'warning' 
                          ? 'bg-amber-500 ring-1 ring-amber-300 animate-pulse' 
                          : 'bg-slate-400'
                      }`} title={person.status === 'active' ? '在线在岗' : person.status === 'warning' ? '状态预警' : '已离场'}></span>
                    </div>

                    {/* 人员核心身份与工号 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-800 text-xs truncate">{person.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 font-medium">({person.id})</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                          person.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : person.status === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {person.status === 'active' ? '在岗' : person.status === 'warning' ? '预警' : '离场'}
                        </span>
                      </div>

                      {/* 岗位与部门信息 */}
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${helmetBadge.bg}`}>
                          {person.role}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="truncate text-slate-500 text-[10px]">{person.department}</span>
                      </div>

                      {/* 归属项目展示与定位标签 */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] gap-1">
                        <div className="flex items-center gap-1 text-slate-600 truncate font-medium" title={person.projectName}>
                          <Ship className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{person.projectName}</span>
                        </div>
                        <span className="font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded text-[9px] shrink-0 border border-slate-200">
                          {person.locatorId}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ===================== 右侧一体化地图核心监控工作台 (需求 2 & 需求 3) ===================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950 border border-slate-800 rounded-xl shadow-md relative">
        {renderMapCanvas(false)}
      </div>

    </div>
  );
}
