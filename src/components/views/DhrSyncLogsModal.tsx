/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DHR 人力资源系统数据同步日志查看弹窗
 * 可清晰查看每次同步的时间、操作人、数据增删改情况及系统底层操作日志
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  Search, 
  ArrowRight, 
  FileText, 
  Users, 
  FolderTree, 
  ChevronRight, 
  RefreshCw,
  Sparkles,
  Layers,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { DhrSyncLogItem, getStoredDhrSyncLogs } from '@/src/data/dhrSyncLogData';

interface DhrSyncLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerManualSync?: () => void;
}

export function DhrSyncLogsModal({ isOpen, onClose, onTriggerManualSync }: DhrSyncLogsModalProps) {
  const [logs, setLogs] = useState<DhrSyncLogItem[]>(() => getStoredDhrSyncLogs());
  const [selectedLogId, setSelectedLogId] = useState<string>(() => {
    const list = getStoredDhrSyncLogs();
    return list[0]?.id || '';
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'schedule' | 'manual'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 当弹窗打开时刷新最新日志
  React.useEffect(() => {
    if (isOpen) {
      const refreshed = getStoredDhrSyncLogs();
      setLogs(refreshed);
      if (!selectedLogId && refreshed.length > 0) {
        setSelectedLogId(refreshed[0].id);
      }
    }
  }, [isOpen]);

  // 重置所有筛选条件
  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Boolean(searchKeyword || filterType !== 'all' || startDate || endDate);

  // 筛选过滤（支持批次关键词、触发类型、日期区间）
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. 触发类型过滤
      if (filterType !== 'all' && log.triggerType !== filterType) return false;

      // 2. 日期区间过滤 (按 syncTime 中的 YYYY-MM-DD 比较)
      const logDate = log.syncTime ? log.syncTime.substring(0, 10) : '';
      if (startDate && logDate && logDate < startDate) {
        return false;
      }
      if (endDate && logDate && logDate > endDate) {
        return false;
      }

      // 3. 关键词过滤 (批次号 / 简述 / 操作人)
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchBatch = log.batchNo.toLowerCase().includes(kw);
        const matchSummary = log.summary.toLowerCase().includes(kw);
        const matchOperator = log.operator.toLowerCase().includes(kw);
        if (!matchBatch && !matchSummary && !matchOperator) return false;
      }

      return true;
    });
  }, [logs, filterType, searchKeyword, startDate, endDate]);

  const currentLog = useMemo(() => {
    return logs.find(l => l.id === selectedLogId) || filteredLogs[0] || logs[0];
  }, [logs, selectedLogId, filteredLogs]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] max-h-[820px] flex flex-col overflow-hidden border border-slate-200 text-slate-700 font-sans"
      >
        {/* 1. 顶部 Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-blue-50/25 to-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-800 tracking-wide">
                  DHR 人力资源系统数据同步日志
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  共 {logs.length} 次同步记录
                </span>
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    筛选结果：{filteredLogs.length} 条
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                实时追溯每次与集团 DHR 系统的单向同步情况、数据增量统计及操作流水
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTriggerManualSync && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerManualSync();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                立即执行同步
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. 主体左右分栏布局 */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* 左侧：同步批次列表及丰富筛选栏 */}
          <div className="w-full md:w-88 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
            {/* 搜索与多维度过滤 */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2.5">
              {/* 日期区间筛选 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    按日期区间查询
                  </span>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="text-blue-600 hover:underline cursor-pointer text-[10px]"
                    >
                      清空日期
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 items-center text-xs">
                  <div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:bg-white focus:outline-hidden focus:border-blue-500"
                      title="开始日期"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:bg-white focus:outline-hidden focus:border-blue-500"
                      title="结束日期"
                    />
                  </div>
                </div>
              </div>

              {/* 关键词搜索 */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  placeholder="搜索批次号 / 简述 / 操作人"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* 触发方式快捷切换与重置 */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1 flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'all' ? 'bg-white font-bold text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('schedule')}
                    className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'schedule' ? 'bg-white font-bold text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    定时自动
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('manual')}
                    className={`flex-1 py-1 rounded-md transition-colors cursor-pointer ${filterType === 'manual' ? 'bg-white font-bold text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    手动同步
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="重置所有筛选"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 列表条目 */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-slate-300" />
                  <p>未检索到符合条件的同步日志</p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                    >
                      清空筛选条件
                    </button>
                  )}
                </div>
              ) : (
                filteredLogs.map(item => {
                  const isSelected = item.id === currentLog?.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLogId(item.id)}
                      className={`p-3 transition-colors cursor-pointer text-xs ${
                        isSelected 
                          ? 'bg-blue-50/80 border-l-4 border-blue-600' 
                          : 'hover:bg-white border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {item.batchNo}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.statusText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.syncTime}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧：单次同步详情与变更明细（已根据需求移除DHR OpenAPI Gateway Operation Logs底层黑底流水） */}
          {currentLog ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
              {/* 1. 概览基本信息卡片 */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">同步批次：</span>
                    <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                      {currentLog.batchNo}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {currentLog.triggerTypeName}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3 font-mono">
                    <span>耗时：<strong>{currentLog.duration}</strong></span>
                    <span>完成时间：<strong>{currentLog.syncTime}</strong></span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                  <span className="font-semibold text-slate-800 shrink-0">执行概述：</span>
                  <span>{currentLog.summary}</span>
                </div>

                {/* 四大指标数据统计 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <div className="text-[11px] text-slate-400">核对档案总数</div>
                    <div className="text-base font-bold font-mono text-slate-800 mt-0.5">
                      {currentLog.totalChecked} 条
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-center bg-emerald-50/20">
                    <div className="text-[11px] text-emerald-600 font-medium">新增入库人员</div>
                    <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                      +{currentLog.newCount} 人
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-200 text-center bg-blue-50/20">
                    <div className="text-[11px] text-blue-600 font-medium">部门/信息调整</div>
                    <div className="text-base font-bold font-mono text-blue-700 mt-0.5">
                      {currentLog.updatedCount} 人
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                    <div className="text-[11px] text-slate-400">操作人/触发源</div>
                    <div className="text-xs font-semibold text-slate-700 truncate mt-1" title={currentLog.operator}>
                      {currentLog.operator}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 变更人员详细数据明细 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>本次同步数据变动明细 ({currentLog.details?.length || 0})</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-400">单向同步自动入库</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/60 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3.5">人员姓名</th>
                        <th className="py-2.5 px-3.5">系统工号</th>
                        <th className="py-2.5 px-3.5">所属部门/班组</th>
                        <th className="py-2.5 px-3.5">岗位工种</th>
                        <th className="py-2.5 px-3.5 text-right">变动类型</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {currentLog.details && currentLog.details.length > 0 ? (
                        currentLog.details.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                              {item.name}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-slate-600 text-[11px]">
                              {item.empcode}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600 truncate max-w-[220px]" title={item.deptname}>
                              {item.deptname.split('//').pop()}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600">
                              {item.gwName}
                            </td>
                            <td className="py-2.5 px-3.5 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.changeType === '新增入库'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {item.changeType}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            本次执行为常规一致性校验，档案数据均保持最新，无新增变动记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              请从左侧选择一条同步记录查看
            </div>
          )}

        </div>

        {/* 底部关闭 */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            DHR 数据为权威唯一源，本系统单向只读拉取，确保现场人员与人资系统实时一致
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

