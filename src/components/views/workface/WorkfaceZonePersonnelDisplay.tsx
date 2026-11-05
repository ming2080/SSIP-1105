import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  Ship, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  UserCheck, 
  Radio, 
  Flame, 
  Layers, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Phone
} from 'lucide-react';
import { WorkfaceRecord } from '@/src/data/workfaceData';

interface WorkfaceZonePersonnelDisplayProps {
  workfaces: WorkfaceRecord[];
  selectedWorkfaceId: string;
  onSelectWorkface: (workfaceId: string) => void;
  className?: string;
}

export function WorkfaceZonePersonnelDisplay({
  workfaces,
  selectedWorkfaceId,
  onSelectWorkface,
  className = ''
}: WorkfaceZonePersonnelDisplayProps) {
  // 分类筛选: 全部 / 厂区 / 造船项目
  const [belongingFilter, setBelongingFilter] = useState<'ALL' | 'yard' | 'project'>('ALL');
  // 负荷状态筛选: 全部 / 正常 / 趋紧 / 超额
  const [loadStatusFilter, setLoadStatusFilter] = useState<'ALL' | 'normal' | 'tight' | 'over'>('ALL');
  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 统计概览
  const summary = useMemo(() => {
    let totalWorkers = 0;
    let totalCapacity = 0;
    let normalCount = 0;
    let tightCount = 0;
    let overCount = 0;

    workfaces.forEach(wf => {
      const current = wf.currentPersonnelCount || (wf.currentPersonnel?.length || 0);
      const cap = wf.capacityLimit || 1;
      totalWorkers += current;
      totalCapacity += cap;

      const ratio = current / cap;
      if (ratio > 1) {
        overCount++;
      } else if (ratio >= 0.75) {
        tightCount++;
      } else {
        normalCount++;
      }
    });

    const overallRate = totalCapacity > 0 ? ((totalWorkers / totalCapacity) * 100).toFixed(1) : '0';

    return {
      totalZones: workfaces.length,
      totalWorkers,
      totalCapacity,
      overallRate,
      normalCount,
      tightCount,
      overCount
    };
  }, [workfaces]);

  // 筛选作业区列表
  const filteredWorkfaces = useMemo(() => {
    return workfaces.filter(wf => {
      const current = wf.currentPersonnelCount || (wf.currentPersonnel?.length || 0);
      const cap = wf.capacityLimit || 1;
      const ratio = current / cap;

      const matchBelonging = belongingFilter === 'ALL' || wf.belongingType === belongingFilter;
      
      let matchLoad = true;
      if (loadStatusFilter === 'normal') matchLoad = ratio < 0.75;
      else if (loadStatusFilter === 'tight') matchLoad = ratio >= 0.75 && ratio <= 1;
      else if (loadStatusFilter === 'over') matchLoad = ratio > 1;

      const matchSearch = !searchKeyword.trim() || 
        wf.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        wf.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        wf.teamName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        wf.safetyOfficer.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchBelonging && matchLoad && matchSearch;
    });
  }, [workfaces, belongingFilter, loadStatusFilter, searchKeyword]);

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col font-sans ${className}`}>
      
      {/* 1. 明亮风格顶栏 */}
      <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* 左侧：标题与定位说明 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">
                作业面区域人员数量展示
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                实时统计在场人流
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              各受控空间作业面人员定员容量、在场作业人数、负荷饱和度及班组配备状态
            </p>
          </div>
        </div>

        {/* 右侧：统计微卡片群 (明亮高辨识度) */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">全场在场总人数:</span>
            <span className="font-bold font-mono text-blue-700 text-sm">
              {summary.totalWorkers} <span className="text-[10px] text-slate-400">/ 额定{summary.totalCapacity}人</span>
            </span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>正常受控: <strong>{summary.normalCount}</strong>区</span>
          </div>

          <div className="bg-amber-50/80 border border-amber-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>负荷趋紧: <strong>{summary.tightCount}</strong>区</span>
          </div>

          {summary.overCount > 0 && (
            <div className="bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] text-rose-700 animate-pulse font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>超员预警: <strong>{summary.overCount}</strong>区</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. 筛选过滤工具条 */}
      <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* 左侧：归属与负荷筛选按钮群 */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 归属筛选 */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setBelongingFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                belongingFilter === 'ALL' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部区域 ({workfaces.length})
            </button>
            <button
              onClick={() => setBelongingFilter('yard')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium flex items-center gap-1 ${
                belongingFilter === 'yard' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3 h-3 text-purple-600" />
              <span>厂区作业面</span>
            </button>
            <button
              onClick={() => setBelongingFilter('project')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium flex items-center gap-1 ${
                belongingFilter === 'project' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ship className="w-3 h-3 text-blue-600" />
              <span>船舶工程面</span>
            </button>
          </div>

          {/* 状态筛选 */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400">状态:</span>
            <select
              value={loadStatusFilter}
              onChange={(e) => setLoadStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">全部负荷状态</option>
              <option value="normal">🟢 正常受控 (&lt;75%)</option>
              <option value="tight">🟠 负荷趋紧 (75%~100%)</option>
              <option value="over">🔴 超员超负荷 (&gt;100%)</option>
            </select>
          </div>
        </div>

        {/* 右侧：搜索与重置 */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索作业面、班组、安全员..."
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 w-52 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {selectedWorkfaceId !== 'ALL' && (
            <button
              onClick={() => onSelectWorkface('ALL')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              title="清除选中聚焦，恢复全场综合态势"
            >
              恢复全览
            </button>
          )}
        </div>

      </div>

      {/* 3. 作业面区域人员数量明亮卡片矩阵 */}
      <div className="p-4 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredWorkfaces.map(wf => {
            const current = wf.currentPersonnelCount || (wf.currentPersonnel?.length || 0);
            const capacity = wf.capacityLimit || 1;
            const ratio = Math.round((current / capacity) * 100);
            const isSelected = selectedWorkfaceId === wf.id;

            // 负荷等级
            const isOver = current > capacity;
            const isTight = !isOver && ratio >= 75;

            // 状态样式
            const statusBadge = isOver ? {
              label: '超员预警',
              bg: 'bg-rose-50 text-rose-700 border-rose-200',
              barBg: 'bg-rose-500',
              badgeColor: 'text-rose-600',
              ringColor: 'ring-rose-400'
            } : isTight ? {
              label: '负荷趋紧',
              bg: 'bg-amber-50 text-amber-700 border-amber-200',
              barBg: 'bg-amber-500',
              badgeColor: 'text-amber-600',
              ringColor: 'ring-amber-400'
            } : {
              label: '受控正常',
              bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              barBg: 'bg-blue-600',
              badgeColor: 'text-emerald-600',
              ringColor: 'ring-blue-400'
            };

            // 工种汇总
            const roleSummary: Record<string, number> = {};
            (wf.currentPersonnel || []).forEach(p => {
              const role = p.role || '作业人员';
              roleSummary[role] = (roleSummary[role] || 0) + 1;
            });

            return (
              <div
                key={wf.id}
                onClick={() => onSelectWorkface(wf.id)}
                className={`bg-white rounded-xl border transition-all cursor-pointer p-4 flex flex-col justify-between relative shadow-2xs hover:shadow-md ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/20' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* 顶部标签与编码 */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wf.belongingType === 'yard' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {wf.belongingType === 'yard' ? '🏢 厂区作业面' : '🚢 造船工程'}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {wf.code}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${statusBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOver ? 'bg-rose-500 animate-ping' : isTight ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      <span>{statusBadge.label}</span>
                    </span>
                  </div>

                  {/* 作业面名称 */}
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mb-1" title={wf.name}>
                    {wf.name}
                  </h4>
                  <div className="text-xs text-slate-500 line-clamp-1 mb-3">
                    工艺: <strong className="text-slate-700 font-medium">{wf.workType}</strong> | 班组: {wf.teamName}
                  </div>
                </div>

                {/* 核心数据块：人员数量与定员对比 (显眼醒目) */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 my-1">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>实时在场人员数量:</span>
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black font-mono ${isOver ? 'text-rose-600' : isTight ? 'text-amber-600' : 'text-blue-700'}`}>
                        {current}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        / 额定{capacity}人
                      </span>
                    </div>
                  </div>

                  {/* 进度条与饱和度 */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1 mb-1">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${statusBadge.barBg}`}
                      style={{ width: `${Math.min(ratio, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>定员负荷率: <strong className={`font-mono font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>{ratio}%</strong></span>
                    <span>{isOver ? <strong className="text-rose-600">已超额 {current - capacity}人</strong> : `余量 ${capacity - current}人`}</span>
                  </div>
                </div>

                {/* 在场工种摘要 (若有) */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {Object.keys(roleSummary).length > 0 ? (
                    Object.entries(roleSummary).slice(0, 3).map(([role, count]) => (
                      <span key={role} className="bg-blue-50/70 text-blue-700 px-2 py-0.5 rounded border border-blue-100/60 font-medium">
                        {role} <strong>{count}</strong>人
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">当前在场作业人员均在规定班组</span>
                  )}
                  {Object.keys(roleSummary).length > 3 && (
                    <span className="text-slate-400 text-[10px]">+{Object.keys(roleSummary).length - 3}工种</span>
                  )}
                </div>

                {/* 底部信息：责任安全员与聚焦按钮 */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 truncate max-w-[170px]" title={`${wf.safetyOfficer} (${wf.safetyOfficerPhone})`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>安全员:</span>
                    <strong className="text-slate-800 font-medium truncate">{wf.safetyOfficer}</strong>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-xs text-blue-600 group">
                    <span>{isSelected ? '已聚焦' : '点击聚焦'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'}`} />
                  </div>
                </div>

                {/* 选中高亮光角 */}
                {isSelected && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-blue-600 rounded-bl-lg"></div>
                )}
              </div>
            );
          })}
        </div>

        {filteredWorkfaces.length === 0 && (
          <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">未找到符合条件的作业面区域</p>
            <p className="text-xs text-slate-400 mt-1">请尝试清除筛选条件或更换搜索关键词</p>
          </div>
        )}
      </div>

    </div>
  );
}
