import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Wind, 
  Eye, 
  Cpu, 
  HardHat, 
  Cigarette, 
  Smartphone, 
  Radio, 
  DoorClosed, 
  FileDown, 
  RotateCw, 
  Filter, 
  Award, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Settings, 
  SlidersHorizontal, 
  Sparkles, 
  Printer, 
  X,
  ExternalLink,
  Zap,
  BarChart3,
  Layers,
  Search,
  Check,
  Building2,
  Ship
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid, 
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { 
  AnalyticsTimeRange, 
  AnalyticsZoneScope, 
  ZONE_SCOPE_OPTIONS, 
  PolicyTriggerMetric, 
  DeviceDetectionMetric, 
  IncidentPreventionMetric,
  TeamEfficiencyRank,
  getFilteredAlarmAnalytics 
} from '@/src/data/alarmAnalyticsData';

interface AlarmAnalyticsDashboardProps {
  onNavigateToRules?: () => void;
  onNavigateToRecords?: (filterType?: string) => void;
}

export function AlarmAnalyticsDashboard({
  onNavigateToRules,
  onNavigateToRecords
}: AlarmAnalyticsDashboardProps) {
  // 核心筛选维度
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('month');
  const [zoneScope, setZoneScope] = useState<AnalyticsZoneScope>('all');
  const [levelFilter, setLevelFilter] = useState<string>(''); // '' | '高' | '中' | '低'
  
  // 交互状态
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('刚刚 (14:32:05)');
  const [selectedPolicyDetail, setSelectedPolicyDetail] = useState<PolicyTriggerMetric | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [policySearchKeyword, setPolicySearchKeyword] = useState('');
  const [activeChartTab, setActiveChartTab] = useState<'bar' | 'pie'>('bar');

  // 计算筛选后的分析数据
  const analyticsData = useMemo(() => {
    return getFilteredAlarmAnalytics(timeRange, zoneScope, levelFilter);
  }, [timeRange, zoneScope, levelFilter]);

  // 策略表格搜索过滤
  const filteredPolicyList = useMemo(() => {
    if (!policySearchKeyword.trim()) return analyticsData.policyMetrics;
    const kw = policySearchKeyword.toLowerCase();
    return analyticsData.policyMetrics.filter(p => 
      p.policyName.toLowerCase().includes(kw) || 
      p.policyType.toLowerCase().includes(kw) ||
      p.recommendation.toLowerCase().includes(kw)
    );
  }, [analyticsData.policyMetrics, policySearchKeyword]);

  // 手动刷新逻辑
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastRefreshedAt(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }, 600);
  };

  // 策略类型图标映射
  const getPolicyTypeIcon = (type: string) => {
    switch (type) {
      case '气体告警': return Wind;
      case '烟感告警': return Flame;
      case '安全帽脱落': return HardHat;
      case '厂区吸烟': return Cigarette;
      case '厂区玩手机': return Smartphone;
      case '人员进入': return DoorClosed;
      case '异常停留': return Clock;
      case '安全员脱岗告警': 
      case '安全员脱岗': 
        return ShieldAlert;
      case '标签防拆': return Radio;
      default: return AlertTriangle;
    }
  };

  // 告警级别配色
  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case '高': return 'text-red-700 bg-red-50 border border-red-200';
      case '中': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case '低': return 'text-blue-700 bg-blue-50 border border-blue-200';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  // 图表调色盘 (严谨工业色系，杜绝廉价渐变)
  const PIE_COLORS = ['#1677ff', '#0ea5e9', '#0d9488', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899'];

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 overflow-y-auto">
      {/* 顶部全局多维筛选与控制工具条 */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 sticky top-0 z-20 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 时间跨度切换 */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  timeRange === 'today' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                今日实时
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  timeRange === 'week' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                近7天
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  timeRange === 'month' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                近30天
              </button>
              <button
                onClick={() => setTimeRange('quarter')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  timeRange === 'quarter' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                本季度
              </button>
            </div>

            {/* 空间工区筛选 */}
            <div className="flex items-center">
              <select
                value={zoneScope}
                onChange={(e) => setZoneScope(e.target.value as AnalyticsZoneScope)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer shadow-2xs"
              >
                {ZONE_SCOPE_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.subLabel})
                  </option>
                ))}
              </select>
            </div>

            {/* 告警级别筛选 */}
            <div className="flex items-center">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer shadow-2xs"
              >
                <option value="">全部严重级别</option>
                <option value="高">仅高危告警 (Red)</option>
                <option value="中">仅中危告警 (Yellow)</option>
                <option value="低">仅低危预警 (Blue)</option>
              </select>
            </div>
          </div>

        {/* 右侧操作群 */}
        <div className="flex items-center gap-2 ml-auto">
          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            title={`最后刷新：${lastRefreshedAt}`}
            className="p-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* 导出诊断分析报告 */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            导出安全效能报告
          </button>
        </div>
      </div>

      {/* 主体分析区域 */}
      <div className="p-6 space-y-6">

        {/* 1. 顶层五维核心指标卡 (仅展示一级数据，删除二级与附加文本) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 指标卡 1: 预防安全事件阻断率 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">安全事件预防阻断率</span>
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {analyticsData.kpi.incidentPreventionRate}%
              </div>
            </div>
          </div>

          {/* 指标卡 2: 告警总触发数 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">告警触发总数</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {analyticsData.kpi.totalAlerts} <span className="text-xs font-normal text-slate-400">起</span>
              </div>
            </div>
          </div>

          {/* 指标卡 3: 监测设备在线率 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">监测设备在线率</span>
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {analyticsData.kpi.deviceOnlineRate}%
              </div>
            </div>
          </div>

          {/* 指标卡 4: 平均响应时效 MTTA */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">平均确认响应时效 (MTTA)</span>
              <Clock className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {Math.floor(analyticsData.kpi.weightedMtta / 60)}分{analyticsData.kpi.weightedMtta % 60}秒
              </div>
            </div>
          </div>

          {/* 指标卡 5: 平均处置闭环时效 MTTR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-medium">平均处置闭环时效 (MTTR)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {analyticsData.kpi.weightedMttr} <span className="text-xs font-normal text-slate-400">分钟</span>
              </div>
            </div>
          </div>
        </div>

        {/* 告警策略与触发类型分析 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                告警策略与触发类型分析
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  onClick={() => setActiveChartTab('bar')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeChartTab === 'bar' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  堆叠柱状分布
                </button>
                <button
                  onClick={() => setActiveChartTab('pie')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activeChartTab === 'pie' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  类型占比环形
                </button>
              </div>

              {onNavigateToRules && (
                <button
                  onClick={onNavigateToRules}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 rounded-lg border border-blue-200 font-medium transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  配置与调整策略
                </button>
              )}
            </div>
          </div>

          {/* 图表展示区与类型卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* 左侧可视化图表 */}
            <div className="lg:col-span-7 h-72">
              {activeChartTab === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.typeDistributionData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <RechartsTooltip 
                      formatter={(val, name) => {
                        const labelMap: Record<string, string> = { high: '高危告警', medium: '中危告警', low: '低危告警' };
                        return [`${val} 次`, labelMap[String(name)] || name];
                      }}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                      formatter={(val) => {
                        const labelMap: Record<string, string> = { high: '高危级别', medium: '中危级别', low: '低危级别' };
                        return labelMap[val] || val;
                      }}
                    />
                    <Bar dataKey="high" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} name="high" />
                    <Bar dataKey="medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} name="medium" />
                    <Bar dataKey="low" stackId="a" fill="#1677ff" radius={[4, 4, 0, 0]} name="low" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.typeDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analyticsData.typeDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(val, name, item) => [`${val} 次 (${item?.payload?.rate}%)`, name]}
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right" 
                        wrapperStyle={{ fontSize: '11px', lineHeight: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 右侧类型数据速览卡片 */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-72 pr-1">
              {analyticsData.typeDistributionData.map((t, idx) => {
                const IconComponent = getPolicyTypeIcon(t.name);
                return (
                  <div 
                    key={t.name}
                    onClick={() => onNavigateToRecords && onNavigateToRecords(t.name)}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-lg border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-800">{t.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-blue-600 flex items-center">
                        日志 <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-slate-900 font-mono">{t.value} <span className="text-[10px] font-normal text-slate-500">次</span></span>
                        <span className="text-xs font-semibold text-blue-600 font-mono">{t.rate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 详细策略触发与优化建议表格 */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">配置策略触发排行与有效性矩阵</span>
                <span className="text-xs text-slate-400">共 {filteredPolicyList.length} 条策略触发记录</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="按策略名称 / 建议搜索..."
                    value={policySearchKeyword}
                    onChange={(e) => setPolicySearchKeyword(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">告警配置策略名称</th>
                    <th className="py-2.5 px-3 w-24">触发类型</th>
                    <th className="py-2.5 px-3 w-20 text-center">触发总次</th>
                    <th className="py-2.5 px-3 w-28">级别结构 (高/中/低)</th>
                    <th className="py-2.5 px-3 w-24 text-center">平均响应</th>
                    <th className="py-2.5 px-3 w-24 text-center">平均处置</th>
                    <th className="py-2.5 px-3 w-20 text-center">误报率</th>
                    <th className="py-2.5 px-3 w-20 text-center">敏感度</th>
                    <th className="py-2.5 px-3">产品调优建议与成效评价</th>
                    <th className="py-2.5 px-3 w-20 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPolicyList.map((p, idx) => (
                    <tr key={p.policyId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{p.policyName}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({p.version})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-600 font-medium">{p.policyType}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono">
                        {p.triggerCount}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <span className="text-red-600 font-bold">{p.highCount}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-amber-600 font-bold">{p.mediumCount}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-blue-600 font-bold">{p.lowCount}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {p.avgResponseSeconds}秒
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {p.avgResolveMinutes}分
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={p.falseAlarmRate > 2.5 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                          {p.falseAlarmRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          p.sensitivity === '过敏' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                          p.sensitivity === '迟钝' ? 'text-purple-700 bg-purple-50 border border-purple-200' :
                          'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        }`}>
                          {p.sensitivity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-xs">
                        {p.recommendation}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedPolicyDetail(p)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          查看明细
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. 设备检测效能与安全风险防范并排布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 设备检测分布与运行状态 (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    设备检测分布与运行状态
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  在线检测点 {analyticsData.deviceMetrics.length} 处
                </span>
              </div>

              {/* 设备类型检测数量分布 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                    <span>主要传感器设备类型检测分布</span>
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    {analyticsData.deviceTypeData.slice(0, 4).map(dt => (
                      <div key={dt.name} className="text-xs">
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span className="truncate max-w-[180px]">{dt.name}</span>
                          <span className="font-bold text-slate-900 font-mono">{dt.count} 件</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(dt.count / (analyticsData.deviceTypeData[0]?.count || 1)) * 100}%` }} 
                            className="bg-blue-600 h-full rounded-full"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 mb-1">设备检测可靠度与杂波过滤指标</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      智能端侧边缘计算与物联网网关在告警上报前完成动态平滑与防抖，过滤环境光线与气流扰动伪告警：
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-center">
                    <div>
                      <div className="text-base font-bold text-emerald-600 font-mono">1.42万次</div>
                      <div className="text-[10px] text-slate-400">过滤杂波噪声</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-blue-600 font-mono">99.8%</div>
                      <div className="text-[10px] text-slate-400">关键设备标定合格率</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 重点设备告警检测量 TOP 排行 */}
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-900 mb-2">重点监测设备检测告警数量 TOP 榜</div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">设备名称与编号</th>
                        <th className="py-2 px-3">部署工位 / 区域</th>
                        <th className="py-2 px-3 text-center">检测告警量</th>
                        <th className="py-2 px-3 text-center">在线率</th>
                        <th className="py-2 px-3 text-center">标定状态</th>
                        <th className="py-2 px-3 text-center">健康评分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {analyticsData.deviceMetrics.slice(0, 5).map((d) => (
                        <tr key={d.deviceId} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{d.deviceName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{d.deviceCode}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            <div>{d.location}</div>
                            <div className="text-[10px] text-blue-600 font-medium">{d.primaryAlarmType}</div>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900 font-mono">
                            {d.detectCount}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-emerald-600 font-medium">
                            {d.onlineRate}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              d.calibrationStatus === '正常' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                            }`}>
                              {d.calibrationStatus}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">
                            {d.healthScore}分
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 安全风险阻断与事故防范分析 (5 Columns) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    安全风险阻断与事故防范
                  </h2>
                </div>
              </div>

              {/* 预防漏斗模型 */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>安全风险拦截防御漏斗模型</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">100% 杜绝重特大事件</span>
                </div>

                <div className="space-y-2 mt-2">
                  {analyticsData.funnelSteps.map((step, idx) => (
                    <div key={step.step} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-700 font-medium flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          {step.step}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {step.count.toLocaleString()} {idx === 4 ? '事故发生' : '次/起'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.max(6, (step.percentage || 0))}%` }} 
                          className={`h-full ${idx === 4 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{step.subText}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 分类阻断重大隐患列表 */}
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-900 mb-2">重大事故类别分类防范与挽回损失评估</div>
                <div className="space-y-2">
                  {analyticsData.incidentPreventions.slice(0, 3).map(inc => (
                    <div key={inc.id} className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/70 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{inc.hazardType}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          事故概率下降 {inc.incidentProbabilityDrop}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>阻断拦截 <strong>{inc.mitigatedCount}</strong> 起</span>
                        <span className="text-slate-700 font-medium">规避损失 {inc.avoidedLossAmount}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">
                        核心机制：{inc.keySafeguard}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 告警响应与闭环处置时效 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-slate-900">
                告警响应与闭环处置时效
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">安全SLA履约考核标准：</span>
              <span className="font-bold text-slate-800">响应 &lt; 3分钟 · 处置 &lt; 20分钟</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* 左侧 24小时走势 */}
            <div className="lg:col-span-6">
              <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                <span>24小时各班次告警触发与响应延时走势</span>
                <span className="text-[11px] text-slate-400">白班合拢作业高峰与夜间巡检</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.hourlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="totalAlertsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1677ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <RechartsTooltip 
                      formatter={(val, name) => [`${val} 起`, name === 'total' ? '告警触发数' : name]}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#1677ff" strokeWidth={2} fillOpacity={1} fill="url(#totalAlertsGrad)" name="total" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2">
                <span>主要高峰期：10:00-11:30 (钢构合拢焊接)</span>
                <span>次高峰：14:00-16:30 (涂装喷砂动火)</span>
              </div>
            </div>

            {/* 右侧 施工班组响应与处置能效排行榜 */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
                  <span>第一响应人与作业班组处置能效排行榜</span>
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5 text-center w-8">排名</th>
                        <th className="py-2 px-3">班组名称 / 安全负责人</th>
                        <th className="py-2 px-2 text-center">接单量</th>
                        <th className="py-2 px-2 text-center">平均响应</th>
                        <th className="py-2 px-2 text-center">平均处置</th>
                        <th className="py-2 px-2 text-center">超时升级</th>
                        <th className="py-2 px-2 text-center">SLA达标</th>
                        <th className="py-2 px-3 text-center">综合评分</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {analyticsData.teamEfficiency.map((t) => (
                        <tr key={t.teamName} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2.5 text-center font-bold">
                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                              t.rank === 1 ? 'bg-amber-100 text-amber-800' :
                              t.rank === 2 ? 'bg-slate-200 text-slate-700' :
                              t.rank === 3 ? 'bg-amber-50 text-amber-700' :
                              'text-slate-400'
                            }`}>
                              {t.rank}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-slate-900">{t.teamName}</div>
                            <div className="text-[10px] text-slate-400">{t.leadPerson} · {t.assignedZone}</div>
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-medium">{t.receivedCount}</td>
                          <td className="py-2 px-2 text-center font-mono text-emerald-600 font-bold">{t.mttaSeconds}秒</td>
                          <td className="py-2 px-2 text-center font-mono">{t.mttrMinutes}分</td>
                          <td className="py-2 px-2 text-center font-mono">
                            <span className={t.escalationCount > 2 ? 'text-amber-600 font-bold' : 'text-slate-500'}>
                              {t.escalationCount}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-medium text-slate-800">
                            {t.slaComplianceRate}%
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">
                            {t.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 阶段耗时链条 */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800 mb-1.5">告警闭环 5 阶段平均用时分解</div>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="p-1.5 bg-white rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">1. 推达通知</div>
                    <div className="font-bold text-slate-900 font-mono text-xs">4 秒</div>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">2. 接单响应</div>
                    <div className="font-bold text-slate-900 font-mono text-xs">1分14秒</div>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">3. 现场排查</div>
                    <div className="font-bold text-slate-900 font-mono text-xs">8分20秒</div>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">4. 处置恢复</div>
                    <div className="font-bold text-slate-900 font-mono text-xs">4分10秒</div>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">5. 闭环复核</div>
                    <div className="font-bold text-slate-900 font-mono text-xs">37 秒</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 弹窗 1: 策略详情诊断与优化指导 */}
      {selectedPolicyDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">告警配置策略深度诊断报告</h3>
              </div>
              <button 
                onClick={() => setSelectedPolicyDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-900 text-sm">{selectedPolicyDetail.policyName}</div>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <span>策略版本 {selectedPolicyDetail.version}</span>
                  <span aria-hidden="true">·</span>
                  <span>触发类型：{selectedPolicyDetail.policyType}</span>
                  <span aria-hidden="true">·</span>
                  <span>当前状态：{selectedPolicyDetail.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">统计周期触发</div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{selectedPolicyDetail.triggerCount} 次</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">平均响应 (MTTA)</div>
                  <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">{selectedPolicyDetail.avgResponseSeconds} 秒</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400">误报率评估</div>
                  <div className="text-xl font-bold text-blue-600 font-mono mt-0.5">{selectedPolicyDetail.falseAlarmRate}%</div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-800 mb-1.5">告警级别分布</div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200 font-medium">高危 {selectedPolicyDetail.highCount} 次</span>
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 font-medium">中危 {selectedPolicyDetail.mediumCount} 次</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 font-medium">低危 {selectedPolicyDetail.lowCount} 次</span>
                  <span className="text-slate-400 ml-auto">超时升级 {selectedPolicyDetail.escalationCount} 次</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
                <div className="font-semibold text-amber-900 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  智能调优与运营建议
                </div>
                <div className="text-slate-700 leading-relaxed">
                  {selectedPolicyDetail.recommendation}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedPolicyDetail(null);
                  if (onNavigateToRecords) onNavigateToRecords(selectedPolicyDetail.policyType);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                查看该策略产生的所有告警日志 <ChevronRight className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPolicyDetail(null)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                >
                  关闭
                </button>
                {onNavigateToRules && (
                  <button
                    onClick={() => {
                      setSelectedPolicyDetail(null);
                      onNavigateToRules();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    前往策略配置修改
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 2: 导出专业安全与告警态势效能诊断报告 */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  智慧船厂安全告警与事故防范效能分析简报
                </h3>
              </div>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 报告正文预览 (符合专业产品经理与EHS总监汇报要求) */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 font-sans leading-relaxed">
              <div className="border-b border-slate-200 pb-3">
                <div className="text-base font-bold text-slate-900 text-center">
                  数字船厂智能安防告警与安全生产预防效能评估报告
                </div>
                <div className="text-center text-[11px] text-slate-400 mt-1">
                  报告编号：EHS-ALM-2026-Q3-09 · 生成时间：2026年09月 · 评估周期：{
                    timeRange === 'today' ? '今日实时' : timeRange === 'week' ? '近7天' : timeRange === 'month' ? '近30天' : '本季度'
                  }
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">一、 总体安全态势与风险防范概况</h4>
                <p>
                  本统计周期内，系统依托部署于造船台、船坞、涂装房及舾装码头的 <strong>{analyticsData.deviceMetrics.length} 台套</strong> 在线监测设备（涵盖防爆气体探测仪、AI双光谱热成像安防相机、UWB防拆基站及极早期吸气式感烟探测器），累计采集环境遥测数据超过 <strong>1.8 万次</strong>，有效过滤环境扰动杂波 <strong>1.4 万次</strong>。
                </p>
                <p className="mt-1">
                  系统共触发各类配置策略告警 <strong>{analyticsData.kpi.totalAlerts} 起</strong>，其中高危严重告警 <strong>{analyticsData.kpi.totalHigh} 起</strong>、中危告警 <strong>{analyticsData.kpi.totalMedium} 起</strong>、低危预警 <strong>{analyticsData.kpi.totalLow} 起</strong>。安全事件预防阻断率高达 <strong>{analyticsData.kpi.incidentPreventionRate}%</strong>，实现重特大安全事故 <strong>零转化</strong>，规避潜在财产损失与工伤赔偿估算达 <strong>{analyticsData.kpi.estimatedAvoidedLoss}</strong>。
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">二、 告警策略有效性与重点触发类型分析</h4>
                <p>
                  从触发告警类型来看，排名前三的高频类型分别为：<strong>人员进入违规（占比约28%）</strong>、<strong>气体超标预警（占比约22%）</strong>、以及<strong>高空脚手架未戴安全帽（占比约19%）</strong>。针对各策略敏感度评估：
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li><strong>气体多级告警策略</strong>运行极其稳健，成功在1号船台底舱阻断密闭空间缺氧窒息风险，建议持续作为标杆推广；</li>
                  <li><strong>动火烟感与初期火焰策略</strong>偶发受强光焊弧扰动，已建议微调双光谱持续判定帧数至3秒，以降低误报疲劳；</li>
                  <li><strong>起重机械盲区电子围栏策略</strong>阻断率达100%，无一人次违规闯入造成人员伤亡。</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-1">三、 告警响应时效 (MTTA) 与处置闭环 (MTTR) 考核</h4>
                <p>
                  全厂平均告警响应时效（MTTA）达到 <strong>{Math.floor(analyticsData.kpi.weightedMtta / 60)}分{analyticsData.kpi.weightedMtta % 60}秒</strong>，大幅优于行业安全SLA标准（3分钟），SLA达标率 <strong>{analyticsData.kpi.slaComplianceRate}%</strong>；平均整改闭环时效（MTTR）为 <strong>{analyticsData.kpi.weightedMttr} 分钟</strong>，一次复核合格率达 96.5%。
                </p>
                <p className="mt-1">
                  施工班组中，<strong>结构建造三队（合拢组）</strong>与<strong>船坞综合安监快速响应班</strong>以综合98.5分和97.4分分列第一、二名，基层第一响应人现场化解率超过 95.8%，多级升级率控制在 4.1% 的极低水平。
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 text-xs mb-1">四、 下一步优化管理建议</div>
                <div className="text-slate-600 space-y-0.5">
                  <div>1. 针对外协脚手架搭设施工队，加强安全交底与高空防脱扣考核，缩短其平均处置闭环时长；</div>
                  <div>2. 对涂装危险品仓库防爆全景摄像仪安排周期性标定，确保光学传感器洁净度；</div>
                  <div>3. 持续巩固“声光预警 - 现场阻断 - 线上闭环 - 主管复核”的数字化全闭环管理链条。</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">经系统自动签名，可直接用于EHS例会汇报及归档备查</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  打印 / 另存为 PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
