import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  Users, 
  Flame, 
  Clock, 
  RotateCw, 
  Building2, 
  Ship, 
  SlidersHorizontal, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Tv, 
  Search,
  ChevronRight,
  Filter,
  Compass,
  TrendingUp,
  Activity,
  Heart,
  BatteryCharging
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  Legend, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';

import { 
  WorkfaceRecord, 
  getStoredWorkfaces, 
  WorkfacePersonnel 
} from '@/src/data/workfaceData';
import { WorkfaceZonePersonnelDisplay } from './WorkfaceZonePersonnelDisplay';

interface WorkfaceMonitorAnalyticsProps {
  onNavigateToTracking?: (personId?: string) => void;
  onNavigateToConfig?: () => void;
}

export function WorkfaceMonitorAnalytics({
  onNavigateToTracking,
  onNavigateToConfig
}: WorkfaceMonitorAnalyticsProps) {
  // 读取当前所有作业面数据
  const [workfaces, setWorkfaces] = useState<WorkfaceRecord[]>(() => getStoredWorkfaces());
  
  // 选中的作业面聚焦 (默认 'ALL' 为全场综合态势，或选择具体作业面ID)
  const [selectedWorkfaceId, setSelectedWorkfaceId] = useState<string>('ALL');

  // 自动刷新机制
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('刚刚 (14:52:10)');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 手动刷新
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setWorkfaces(getStoredWorkfaces());
      setIsRefreshing(false);
      const now = new Date();
      setLastRefreshedAt(`刚刚 (${now.toTimeString().split(' ')[0]})`);
      triggerToast('作业面遥测指标与人员数量统计已同步');
    }, 500);
  };

  // 定时自动刷新
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const timer = setInterval(() => {
      setWorkfaces(getStoredWorkfaces());
      const now = new Date();
      setLastRefreshedAt(`刚刚 (${now.toTimeString().split(' ')[0]})`);
    }, autoRefreshInterval * 1000);
    return () => clearInterval(timer);
  }, [autoRefreshInterval]);

  // 当前聚焦选中的作业面对象
  const activeWorkface = useMemo(() => {
    if (selectedWorkfaceId === 'ALL') return null;
    return workfaces.find(wf => wf.id === selectedWorkfaceId) || null;
  }, [workfaces, selectedWorkfaceId]);

  // 全域宏观核心 KPI 计算 (全场汇总基准)
  const statsOverview = useMemo(() => {
    let totalCapacity = 0;
    let totalWorkers = 0;
    let overloadCount = 0;
    let gasDetectorsCount = 0;
    let gasWarningCount = 0;
    let baseStationsCount = 0;

    workfaces.forEach(wf => {
      totalCapacity += wf.capacityLimit || 0;
      const workerCount = wf.currentPersonnelCount || (wf.currentPersonnel?.length || 0);
      totalWorkers += workerCount;
      if (workerCount > wf.capacityLimit) {
        overloadCount++;
      }
      baseStationsCount += wf.boundBaseStations?.length || 0;
      gasDetectorsCount += wf.boundGasDetectors?.length || 0;
      wf.boundGasDetectors?.forEach(gd => {
        if (gd.status === 'warning') gasWarningCount++;
      });
    });

    const capacityRatio = totalCapacity > 0 ? ((totalWorkers / totalCapacity) * 100).toFixed(1) : '0';

    return {
      totalWorkfaces: workfaces.length,
      activeWorkfaces: workfaces.filter(w => w.status === 'active').length,
      totalWorkers,
      totalCapacity,
      capacityRatio,
      overloadCount,
      baseStationsCount,
      gasDetectorsCount,
      gasWarningCount
    };
  }, [workfaces]);

  // 随着 selectedWorkfaceId 变动的 5 大 KPI 仪表盘内容
  const currentWorkfaceKPI = useMemo(() => {
    if (!activeWorkface) {
      return {
        card1Title: '纳管监控作业面',
        card1Value: `${statsOverview.totalWorkfaces} 个`,
        card1Sub: `${statsOverview.activeWorkfaces} 个处于施工激活状态`,
        card1SubColor: 'text-emerald-600',
        card1Icon: Layers,

        card2Title: '作业面实时作业总人数',
        card2Value: `${statsOverview.totalWorkers} 人`,
        card2Cap: `/ 额定${statsOverview.totalCapacity}人`,
        card2Sub: `综合人员负荷率: ${statsOverview.capacityRatio}%`,
        card2SubColor: 'text-blue-600',
        card2Icon: Users,

        card3Title: '作业面定员超负荷',
        card3Value: `${statsOverview.overloadCount} 个`,
        card3Sub: statsOverview.overloadCount > 0 ? '已联动闸机自动限流拦截' : '各作业面定员均受控正常',
        card3SubColor: statsOverview.overloadCount > 0 ? 'text-rose-600' : 'text-slate-500',
        card3Icon: AlertTriangle,

        card4Title: '环境四合一监测在线率',
        card4Value: '100%',
        card4Cap: `(${statsOverview.gasDetectorsCount}台在线)`,
        card4Sub: statsOverview.gasWarningCount > 0 ? '1台探头提示轻度超标' : '含氧量与可燃气均合格',
        card4SubColor: statsOverview.gasWarningCount > 0 ? 'text-amber-600' : 'text-emerald-600',
        card4Icon: Flame,

        card5Title: '安全监护在岗履职率',
        card5Value: '100%',
        card5Cap: `(专职监护)`,
        card5Sub: '所有作业面持证合规上岗',
        card5SubColor: 'text-emerald-600',
        card5Icon: ShieldCheck
      };
    }

    const currentCount = activeWorkface.currentPersonnelCount || (activeWorkface.currentPersonnel?.length || 0);
    const cap = activeWorkface.capacityLimit || 1;
    const ratio = ((currentCount / cap) * 100).toFixed(1);
    const isOverload = currentCount > cap;

    return {
      card1Title: '当前聚焦作业面',
      card1Value: activeWorkface.code,
      card1Sub: `[${activeWorkface.belongingType === 'yard' ? '厂区' : '项目'}] ${activeWorkface.riskLevel}`,
      card1SubColor: activeWorkface.riskLevel.includes('红') ? 'text-rose-600' : 'text-amber-600',
      card1Icon: Building2,

      card2Title: '本区域作业人数',
      card2Value: `${currentCount} 人`,
      card2Cap: `/ 额定${cap}人`,
      card2Sub: `区域负荷率: ${ratio}%`,
      card2SubColor: isOverload ? 'text-rose-600' : 'text-blue-600',
      card2Icon: Users,

      card3Title: '区域定员负荷状态',
      card3Value: isOverload ? '超额报警' : '受控正常',
      card3Sub: isOverload ? `超员 ${currentCount - cap}人，建议分流` : `剩余定员名额: ${cap - currentCount}人`,
      card3SubColor: isOverload ? 'text-rose-600' : 'text-emerald-600',
      card3Icon: isOverload ? AlertTriangle : CheckCircle2,

      card4Title: '本作业面环境传感器',
      card4Value: `${activeWorkface.boundGasDetectors?.length || 1} 台`,
      card4Cap: '(四合一在线)',
      card4Sub: `O₂及VOC读数均处于许可范围`,
      card4SubColor: 'text-emerald-600',
      card4Icon: Flame,

      card5Title: '现场责任安全员',
      card5Value: activeWorkface.safetyOfficer || '安监专员',
      card5Sub: `电话: ${activeWorkface.safetyOfficerPhone || '在岗在线'}`,
      card5SubColor: 'text-slate-600',
      card5Icon: ShieldCheck
    };
  }, [activeWorkface, statsOverview]);

  // 环境四合一遥测数据根据选中作业面动态变动
  const currentEnvData = useMemo(() => {
    if (!activeWorkface) {
      return {
        o2: '20.8',
        o2Status: '● 全厂整体充足健康',
        voc: '185',
        vocStatus: '● 处于安全限值内',
        vocColor: 'text-amber-600',
        ch4: '0.0',
        ch4Status: '● 无可燃气泄漏',
        pressure: '-28.5',
        pressureStatus: '● 负压排风联锁正常',
        detectorName: '全厂各作业面四合一传感器矩阵',
        trend: [
          { time: '08:00', o2: 20.9, voc: 45 },
          { time: '10:00', o2: 20.6, voc: 140 },
          { time: '12:00', o2: 20.7, voc: 110 },
          { time: '14:00', o2: 20.3, voc: 220 },
          { time: '16:00', o2: 20.5, voc: 190 },
          { time: '18:00', o2: 20.8, voc: 80 }
        ]
      };
    }

    // 涂装车间特涂面
    if (activeWorkface.id === 'WF-YARD-002') {
      return {
        o2: '20.8',
        o2Status: '● 含氧量达标',
        voc: '320',
        vocStatus: '● 涂装区轻度升高(强排风开)',
        vocColor: 'text-amber-600',
        ch4: '0.1',
        ch4Status: '● 微量有机物受控',
        pressure: '-32.4',
        pressureStatus: '● 密闭负压排风开启',
        detectorName: '涂装车间有机溶剂VOC及可燃气体探头',
        trend: [
          { time: '08:00', o2: 20.9, voc: 60 },
          { time: '10:00', o2: 20.7, voc: 180 },
          { time: '12:00', o2: 20.8, voc: 130 },
          { time: '14:00', o2: 20.5, voc: 320 },
          { time: '16:00', o2: 20.6, voc: 280 },
          { time: '18:00', o2: 20.8, voc: 110 }
        ]
      };
    }

    // LNG 货舱绝热作业面
    if (activeWorkface.id === 'WF-2026-001' || activeWorkface.name.includes('LNG') || activeWorkface.name.includes('绝热')) {
      return {
        o2: '20.9',
        o2Status: '● 绝热货舱含氧充足',
        voc: '35',
        vocStatus: '● 胶粘剂挥发受控优良',
        vocColor: 'text-emerald-600',
        ch4: '0.0',
        ch4Status: '● 严禁动火受控正常',
        pressure: '-18.2',
        pressureStatus: '● 舱内恒湿微负压正常',
        detectorName: '1#LNG货舱受限空间气体监控仪',
        trend: [
          { time: '08:00', o2: 20.9, voc: 25 },
          { time: '10:00', o2: 20.9, voc: 30 },
          { time: '12:00', o2: 20.8, voc: 35 },
          { time: '14:00', o2: 20.9, voc: 40 },
          { time: '16:00', o2: 20.8, voc: 32 },
          { time: '18:00', o2: 20.9, voc: 26 }
        ]
      };
    }

    // 默认作业面
    return {
      o2: '20.8',
      o2Status: '● 含氧量健康合格',
      voc: '55',
      vocStatus: '● 焊接除尘烟气受控',
      vocColor: 'text-emerald-600',
      ch4: '0.0',
      ch4Status: '● 无可燃气泄漏',
      pressure: '-25.0',
      pressureStatus: '● 通风除尘系统运行',
      detectorName: `${activeWorkface.name}四合一探头`,
      trend: [
        { time: '08:00', o2: 20.9, voc: 35 },
        { time: '10:00', o2: 20.8, voc: 70 },
        { time: '12:00', o2: 20.8, voc: 55 },
        { time: '14:00', o2: 20.7, voc: 90 },
        { time: '16:00', o2: 20.8, voc: 65 },
        { time: '18:00', o2: 20.9, voc: 40 }
      ]
    };
  }, [activeWorkface]);

  // 图表 1: 各作业面人员负荷容量对比数据 (BarChart) - 根据选中变动
  const capacityComparisonData = useMemo(() => {
    if (!activeWorkface) {
      return workfaces.map(wf => {
        const current = wf.currentPersonnelCount || (wf.currentPersonnel?.length || 0);
        const limit = wf.capacityLimit;
        const isOverload = current > limit;
        return {
          name: wf.name.length > 7 ? wf.name.substring(0, 7) + '...' : wf.name,
          fullName: wf.name,
          code: wf.code,
          在场人数: current,
          额定定员: limit,
          isOverload
        };
      });
    }

    // 选中特定作业面时，展示该作业面的总定员与各工种细分分配
    const currentTotal = activeWorkface.currentPersonnelCount || (activeWorkface.currentPersonnel?.length || 0);
    const limitTotal = activeWorkface.capacityLimit;

    const roleGroups: Record<string, number> = {};
    (activeWorkface.currentPersonnel || []).forEach(p => {
      const r = p.role || '作业工';
      roleGroups[r] = (roleGroups[r] || 0) + 1;
    });

    const subItems = Object.entries(roleGroups).map(([role, count]) => ({
      name: role,
      fullName: `${role}工种组`,
      code: role,
      在场人数: count,
      额定定员: Math.max(count + 2, 4),
      isOverload: false
    }));

    return [
      {
        name: '本作业面总计',
        fullName: activeWorkface.name,
        code: activeWorkface.code,
        在场人数: currentTotal,
        额定定员: limitTotal,
        isOverload: currentTotal > limitTotal
      },
      ...subItems
    ];
  }, [workfaces, activeWorkface]);

  // 图表 2: 工种分布统计数据 (PieChart) - 根据选中变动
  const roleDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    const targetList = activeWorkface ? (activeWorkface.currentPersonnel || []) : workfaces.flatMap(w => w.currentPersonnel || []);
    
    targetList.forEach(p => {
      const role = p.role || '装配人员';
      counts[role] = (counts[role] || 0) + 1;
    });

    // 若工种样本过少，提供标准配比
    if (Object.keys(counts).length === 0) {
      counts['特种焊工'] = 5;
      counts['装配铆工'] = 4;
      counts['电气舾装'] = 3;
      counts['现场安全员'] = 1;
    }

    const colors = ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [workfaces, activeWorkface]);

  // 图表 3: 作业滞留时长分布直方数据 - 根据选中变动
  const durationHistogramData = useMemo(() => {
    const targetList = activeWorkface ? (activeWorkface.currentPersonnel || []) : workfaces.flatMap(w => w.currentPersonnel || []);
    let under1h = 0;
    let from1to2h = 0;
    let from2to3h = 0;
    let over3h = 0;

    targetList.forEach(p => {
      const dur = p.stayDuration || '';
      if (dur.includes('3小时') || dur.includes('4小时') || dur.includes('5小时')) {
        over3h++;
      } else if (dur.includes('2小时')) {
        from2to3h++;
      } else if (dur.includes('1小时')) {
        from1to2h++;
      } else {
        under1h++;
      }
    });

    if (under1h + from1to2h + from2to3h + over3h === 0) {
      under1h = 2;
      from1to2h = 5;
      from2to3h = 3;
      over3h = 1;
    }

    return [
      { range: '< 1小时', 人数: under1h, color: '#10b981', desc: '正常准入' },
      { range: '1-2小时', 人数: from1to2h, color: '#3b82f6', desc: '作业黄金期' },
      { range: '2-3小时', 人数: from2to3h, color: '#f59e0b', desc: '体能监控' },
      { range: '> 3小时', 人数: over3h, color: '#ef4444', desc: '防疲劳轮换' }
    ];
  }, [workfaces, activeWorkface]);

  return (
    <div className="flex flex-col gap-3.5 h-full overflow-y-auto pr-1 select-none font-sans pb-6">
      
      {/* 操作提示 Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-8 bg-slate-900/95 text-white border border-cyan-500/50 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. 顶部控制栏与导航操作 */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* 左侧：页面标题与定位 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              作业面监控分析
            </h2>
          </div>
        </div>

        {/* 右侧：自动刷新、刷新按钮、指挥大屏与快捷配置跳转 */}
        <div className="flex items-center gap-2.5 text-xs">
          
          {/* 自动刷新频率 */}
          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>自动刷新:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent font-mono font-bold text-blue-600 focus:outline-none cursor-pointer"
            >
              <option value={5}>5秒 (实时)</option>
              <option value={15}>15秒</option>
              <option value={30}>30秒</option>
              <option value={0}>暂停</option>
            </select>
          </div>

          {/* 手动刷新 */}
          <button
            onClick={handleManualRefresh}
            className={`p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1 text-[11px] font-medium ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
            title="立即刷新最新遥测与人员数据"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">刷新</span>
          </button>

          {/* 进入大屏监控 */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle_fullscreen_monitor'))}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="切换到指挥中心大屏全屏监控模式"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white">指挥大屏</span>
          </button>

          {/* 跳转到作业面配置 */}
          {onNavigateToConfig && (
            <button
              onClick={onNavigateToConfig}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="切换到区域划分与3D分层配置"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>区域划分</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 空间作业面实时监控指标一览下拉选择器 (需求3核心：支持下拉选择，联动全页数据) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3.5">
        
        {/* 左侧说明与状态提示 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <label htmlFor="workface-metrics-select" className="font-bold text-slate-900 text-sm">
                空间作业面实时监控指标选择:
              </label>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeWorkface ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
              }`}>
                {activeWorkface ? `已锁定聚焦: ${activeWorkface.name}` : '全厂全景综合态势'}
              </span>
            </div>
          </div>
        </div>

        {/* 右侧下拉选择框与快速全览恢复 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            id="workface-metrics-select"
            value={selectedWorkfaceId}
            onChange={(e) => setSelectedWorkfaceId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer shadow-2xs min-w-[340px]"
          >
            <option value="ALL">🌐 全域所有作业面综合统计与全览 ({workfaces.length}个受控面)</option>
            {workfaces.map(wf => {
              const current = wf.currentPersonnelCount || (wf.currentPersonnel?.length || 0);
              return (
                <option key={wf.id} value={wf.id}>
                  [{wf.belongingType === 'yard' ? '厂区' : '项目'}] {wf.name} ({wf.code} | 在场: {current}/{wf.capacityLimit}人)
                </option>
              );
            })}
          </select>

          {selectedWorkfaceId !== 'ALL' && (
            <button
              onClick={() => setSelectedWorkfaceId('ALL')}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-blue-200"
            >
              恢复全览
            </button>
          )}
        </div>
      </div>

      {/* 3. 核心综合指标 KPI 卡片矩阵 (5 列微型仪表盘，数据随下拉选择变动) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
        
        {/* KPI 1: 纳管作业面 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{currentWorkfaceKPI.card1Title}</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-0.5 truncate" title={currentWorkfaceKPI.card1Value}>
              {currentWorkfaceKPI.card1Value}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <currentWorkfaceKPI.card1Icon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: 在场作业人数 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{currentWorkfaceKPI.card2Title}</div>
            <div className="text-lg font-black font-mono text-blue-700 mt-0.5">
              {currentWorkfaceKPI.card2Value} <span className="text-xs font-normal text-slate-400">{currentWorkfaceKPI.card2Cap}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <currentWorkfaceKPI.card2Icon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: 定员负荷状态 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{currentWorkfaceKPI.card3Title}</div>
            <div className={`text-lg font-black font-mono mt-0.5 ${currentWorkfaceKPI.card3SubColor}`}>
              {currentWorkfaceKPI.card3Value}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            currentWorkfaceKPI.card3Value.includes('超额') ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
          }`}>
            <currentWorkfaceKPI.card3Icon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: 环境探头监控 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{currentWorkfaceKPI.card4Title}</div>
            <div className="text-lg font-black font-mono text-cyan-700 mt-0.5">
              {currentWorkfaceKPI.card4Value} <span className="text-xs font-normal text-slate-400">{currentWorkfaceKPI.card4Cap}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <currentWorkfaceKPI.card4Icon className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 5: 现场安全员在岗 */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{currentWorkfaceKPI.card5Title}</div>
            <div className="text-lg font-black text-slate-900 mt-0.5 truncate">
              {currentWorkfaceKPI.card5Value}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <currentWorkfaceKPI.card5Icon className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 4. 作业面区域人员数量展示组件 (需求1 & 2：明亮风格，无热力与无定位点，展示区域人员数量与负荷) */}
      <WorkfaceZonePersonnelDisplay 
        workfaces={workfaces}
        selectedWorkfaceId={selectedWorkfaceId}
        onSelectWorkface={(id) => setSelectedWorkfaceId(id)}
      />

      {/* 5. 环境多参数实时遥测与走势分析 (随选定作业面联动变动) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              作业面环境多参数实时遥测与走势分析
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            实时传感器联动
          </span>
        </div>

        <div className="grid grid-cols-12 gap-3.5">
          {/* 4 宫格环境遥测读数卡 (占 6 列) */}
          <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-2.5">
            <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>O₂ 氧气浓度</span>
                <span className="font-mono text-[10px] text-slate-400">标准 ≥19.5%</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-blue-700">{currentEnvData.o2}</span>
                <span className="text-xs text-slate-500">%Vol</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>VOC 挥发性有机物</span>
                <span className="font-mono text-[10px] text-slate-400">上限 &lt;400mg</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-amber-600">{currentEnvData.voc}</span>
                <span className="text-xs text-slate-500">mg/m³</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>CH₄ 可燃气体 (LEL)</span>
                <span className="font-mono text-[10px] text-slate-400">上限 &lt;20%</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-700">{currentEnvData.ch4}</span>
                <span className="text-xs text-slate-500">%LEL</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>舱内换气与微压差</span>
                <span className="font-mono text-[10px] text-slate-400">标准 &lt;-25Pa</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-slate-800">{currentEnvData.pressure}</span>
                <span className="text-xs text-slate-500">Pa</span>
              </div>
            </div>
          </div>

          {/* 走势面积折线图: O2 氧气与 VOC 浓度动态走势 (占 6 列) */}
          <div className="col-span-12 lg:col-span-6 flex flex-col min-h-[160px]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">24小时环境指标浓度走势曲线</span>
              <span className="text-[10px] text-slate-400 font-mono">单位: %Vol / mg/m³</span>
            </div>
            <div className="flex-1 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentEnvData.trend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }} 
                  />
                  <Area type="monotone" dataKey="voc" name="VOC浓度(mg/m³)" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
                  <Line type="monotone" dataKey="o2" name="氧气O₂(%)" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 三大核心数据分析图表 (需求4：同一行显示，不要跨行，均分为三列) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* 图表 1: 作业面在场人员 vs 额定定员对比分析 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>在场人员 vs 额定定员对比</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              {activeWorkface ? '工种定员配比' : '全厂作业面对比'}
            </span>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <RechartsTooltip 
                  formatter={(val: any, name: any) => [`${val} 人`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="在场人数" fill="#2563eb" radius={[4, 4, 0, 0]}>
                  {capacityComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isOverload ? '#ef4444' : '#2563eb'} />
                  ))}
                </Bar>
                <Bar dataKey="额定定员" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 图表 2: 在场作业工种分布比例 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>在场作业工种分布比例</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              {activeWorkface ? '本区域工种结构' : '全场工种结构'}
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {roleDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(val: any, name: any) => [`${val} 人`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 图表 3: 人员连续滞留作业时长分布 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>人员连续滞留作业时长分布</span>
            </h3>
            <span className="text-[10px] text-rose-500 font-bold">&gt;3小时防疲劳</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationHistogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <RechartsTooltip 
                  formatter={(val: any, name: any, item: any) => [`${val} 人 (${item.payload.desc})`, '滞留人数']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="人数" radius={[4, 4, 0, 0]}>
                  {durationHistogramData.map((entry, index) => (
                    <Cell key={`hist-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
