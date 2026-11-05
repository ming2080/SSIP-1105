import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight,
  Info
} from 'lucide-react';

export interface AlarmTrendDayData {
  date: string;       // e.g. '10-30'
  dayLabel: string;   // e.g. '周五'
  totalTriggered: number; // 触发告警总数
  processed: number;      // 已完成处置数
  completionRate: number; // 完成率 (0 - 100)
  pendingCount: number;   // 待处理数
  avgResponseMin: number; // 平均响应时长(分钟)
}

// 模拟船厂近 7 天真实告警及完成率数据
export const DEFAULT_7DAYS_ALARM_TREND: AlarmTrendDayData[] = [
  { date: '10-30', dayLabel: '10/30', totalTriggered: 18, processed: 17, completionRate: 94.4, pendingCount: 1, avgResponseMin: 6.2 },
  { date: '10-31', dayLabel: '10/31', totalTriggered: 22, processed: 20, completionRate: 90.9, pendingCount: 2, avgResponseMin: 7.5 },
  { date: '11-01', dayLabel: '11/01', totalTriggered: 29, processed: 25, completionRate: 86.2, pendingCount: 4, avgResponseMin: 9.1 },
  { date: '11-02', dayLabel: '11/02', totalTriggered: 25, processed: 23, completionRate: 92.0, pendingCount: 2, avgResponseMin: 6.8 },
  { date: '11-03', dayLabel: '11/03', totalTriggered: 31, processed: 29, completionRate: 93.5, pendingCount: 2, avgResponseMin: 5.4 },
  { date: '11-04', dayLabel: '11/04', totalTriggered: 27, processed: 26, completionRate: 96.3, pendingCount: 1, avgResponseMin: 4.8 },
  { date: '11-05', dayLabel: '今日', totalTriggered: 24, processed: 23, completionRate: 95.8, pendingCount: 1, avgResponseMin: 4.2 }
];

interface MobileAlarmTrendCardProps {
  trendData?: AlarmTrendDayData[];
  pendingTotal?: number;
  onQuickProcess?: () => void;
}

export function MobileAlarmTrendCard({
  trendData = DEFAULT_7DAYS_ALARM_TREND,
  pendingTotal = 3,
  onQuickProcess
}: MobileAlarmTrendCardProps) {
  const [metricMode, setMetricMode] = useState<'rate' | 'volume'>('rate');

  // 计算近 7 天加权均值指标
  const totalTriggers = trendData.reduce((acc, curr) => acc + curr.totalTriggered, 0);
  const totalProcessed = trendData.reduce((acc, curr) => acc + curr.processed, 0);
  const avgRate = totalTriggers > 0 ? ((totalProcessed / totalTriggers) * 100).toFixed(1) : '94.2';
  const todayItem = trendData[trendData.length - 1] || trendData[0];
  const yesterdayItem = trendData[trendData.length - 2] || trendData[0];
  const rateDiff = (todayItem.completionRate - yesterdayItem.completionRate).toFixed(1);
  const isPositive = Number(rateDiff) >= 0;

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/90 text-left transition-all">
      {/* 头部标题与控制栏 */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>待处理告警趋势</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                近7天
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              告警处置闭环率与响应效能分析
            </p>
          </div>
        </div>

        {/* 维度切换胶囊 */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setMetricMode('rate')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              metricMode === 'rate'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            完成率
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('volume')}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              metricMode === 'volume'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            工单量
          </button>
        </div>
      </div>

      {/* 核心 KPI 快速看板指标 (3 栏紧凑并列) */}
      <div className="grid grid-cols-3 gap-2 py-2.5 my-1">
        {/* 指标 1：7天平均完成率 */}
        <div className="bg-slate-50/80 rounded-xl p-2 border border-slate-100 flex flex-col justify-between">
          <span className="text-[10px] text-slate-500 font-medium">7天处置率</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black font-mono text-slate-900 tracking-tight">
              {avgRate}%
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-medium mt-0.5">
            <ArrowUpRight className="w-2.5 h-2.5" />
            <span>环比 +1.6%</span>
          </div>
        </div>

        {/* 指标 2：今日完成率 */}
        <div className="bg-blue-50/60 rounded-xl p-2 border border-blue-100/80 flex flex-col justify-between">
          <span className="text-[10px] text-blue-600 font-medium">今日完成率</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black font-mono text-blue-700 tracking-tight">
              {todayItem.completionRate}%
            </span>
          </div>
          <div className={`text-[9px] font-medium mt-0.5 flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span>{isPositive ? `+${rateDiff}%` : `${rateDiff}%`} 较昨日</span>
          </div>
        </div>

        {/* 指标 3：当前待排查滞留工单 */}
        <div className="bg-amber-50/60 rounded-xl p-2 border border-amber-100/80 flex flex-col justify-between">
          <span className="text-[10px] text-amber-700 font-medium">当前待排险</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-black font-mono text-amber-700 tracking-tight">
              {pendingTotal}
            </span>
            <span className="text-[10px] text-amber-600">起</span>
          </div>
          <div className="text-[9px] text-slate-400 font-medium mt-0.5">
            需现场签到解除
          </div>
        </div>
      </div>

      {/* 折线图与面积渐变图表区域 (Recharts 自适应移动端) */}
      <div className="w-full h-44 sm:h-48 pt-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'rate' ? (
            <AreaChart data={trendData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="mobileRateAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#0284c7" stopOpacity={0.28} />
                  <stop offset="90%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dayLabel" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                domain={[80, 100]} 
                ticks={[80, 85, 90, 95, 100]}
                unit="%" 
                tick={{ fontSize: 9, fill: '#94a3b8' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as AlarmTrendDayData;
                    return (
                      <div className="bg-slate-900/90 text-white backdrop-blur-md p-2 rounded-lg text-xs shadow-lg border border-slate-700/80 space-y-1">
                        <div className="font-bold text-sky-300 flex items-center justify-between gap-3 text-[11px]">
                          <span>{data.date} 日报表</span>
                          <span className="font-mono">{data.completionRate}%</span>
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-0.5 font-mono">
                          <div>触发总量: {data.totalTriggered} 起</div>
                          <div>已处置: {data.processed} 起</div>
                          <div>待处理: {data.pendingCount} 起</div>
                          <div>平均响应: {data.avgResponseMin} 分钟</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#0284c7" 
                strokeWidth={2.5}
                fill="url(#mobileRateAreaGrad)"
                name="处理完成率"
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#0284c7" 
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#ffffff', stroke: '#0284c7', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={trendData} margin={{ top: 10, right: 8, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="dayLabel" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                unit="起" 
                tick={{ fontSize: 9, fill: '#94a3b8' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as AlarmTrendDayData;
                    return (
                      <div className="bg-slate-900/90 text-white backdrop-blur-md p-2 rounded-lg text-xs shadow-lg border border-slate-700/80 space-y-1">
                        <div className="font-bold text-sky-300 text-[11px]">{data.date}</div>
                        <div className="text-[10px] text-slate-300 space-y-0.5 font-mono">
                          <div className="text-rose-400">告警触发: {data.totalTriggered} 起</div>
                          <div className="text-emerald-400">已闭环: {data.processed} 起</div>
                          <div className="text-amber-300">处置完成率: {data.completionRate}%</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="totalTriggered" 
                stroke="#f43f5e" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#f43f5e' }}
                name="触发总量"
              />
              <Line 
                type="monotone" 
                dataKey="processed" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                name="已处置闭环"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 底部管理层提示 & 快捷指引 */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>目标基线：当日告警处置闭环率 ≥ 90% (已达标)</span>
        </div>
        {onQuickProcess && (
          <button
            type="button"
            onClick={onQuickProcess}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
          >
            <span>前往处理</span>
            <span>➔</span>
          </button>
        )}
      </div>
    </div>
  );
}
