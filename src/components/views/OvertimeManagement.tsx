/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 东南基地加班登记与安全岗位在岗告警联动管理
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  RotateCw, 
  FileText, 
  Trash2, 
  Eye, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Building2, 
  Filter,
  CheckCircle2,
  BellRing,
  Phone,
  Flame,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { 
  OvertimeRecord, 
  getStoredOvertimeRecords, 
  saveStoredOvertimeRecords 
} from '@/src/data/overtimeData';
import { CreateOvertimeModal } from './overtime/CreateOvertimeModal';
import { OvertimeDetailModal } from './overtime/OvertimeDetailModal';
import { OvertimeDailyReportView } from './overtime/OvertimeDailyReportView';
import { OvertimeMonthlyReportView } from './overtime/OvertimeMonthlyReportView';
import { ViewType } from '@/src/types';

interface OvertimeManagementProps {
  onChangeView?: (view: ViewType) => void;
}

export function OvertimeManagement({ onChangeView }: OvertimeManagementProps) {
  // 顶部大 Tab 切换: 'daily_report' (加班日报) | 'monthly_report' (加班月报) | 'registration' (加班登记表)
  const [activeTab, setActiveTab] = useState<'daily_report' | 'monthly_report' | 'registration'>('daily_report');

  // 数据集状态
  const [records, setRecords] = useState<OvertimeRecord[]>(() => getStoredOvertimeRecords());

  // 弹窗状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<OvertimeRecord | null>(null);

  // 筛选字段
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterContractor, setFilterContractor] = useState<string>('');
  const [filterSafetyStatus, setFilterSafetyStatus] = useState<'all' | 'present' | 'absent'>('all');

  // 监听广播联动更新
  useEffect(() => {
    const handleOvertimeUpdate = (e: any) => {
      if (e.detail?.records) {
        setRecords(e.detail.records);
      }
    };
    window.addEventListener('overtime_data_updated', handleOvertimeUpdate);
    return () => window.removeEventListener('overtime_data_updated', handleOvertimeUpdate);
  }, []);

  // 保存与广播更新
  const updateRecords = (newRecords: OvertimeRecord[]) => {
    setRecords(newRecords);
    saveStoredOvertimeRecords(newRecords);
  };

  // 核心统计指标
  const stats = useMemo(() => {
    const totalCount = records.length;
    const totalWorkers = records.reduce((sum, r) => sum + (Number(r.workerCount) || 0), 0);
    const presentCount = records.filter(r => r.safetyStatus === 'present').length;
    const absentAlertCount = records.filter(r => r.safetyStatus === 'absent').length;
    const highRiskCount = records.filter(r => r.isHotWork || r.isConfinedSpace).length;
    const presentRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '100.0';

    return {
      totalCount,
      totalWorkers,
      presentCount,
      absentAlertCount,
      highRiskCount,
      presentRate
    };
  }, [records]);

  // 部门与施工单位去重列表
  const { deptList, contractorList } = useMemo(() => {
    const depts = new Set<string>();
    const contractors = new Set<string>();
    records.forEach(r => {
      if (r.deptName) depts.add(r.deptName);
      if (r.contractor) contractors.add(r.contractor);
    });
    return {
      deptList: Array.from(depts),
      contractorList: Array.from(contractors)
    };
  }, [records]);

  // 过滤后数据列表
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 关键字检索：施工船号、施工区域、施工单位、加班项目、施工人员、填报人、安全员
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchKw = 
          r.shipNo.toLowerCase().includes(kw) ||
          r.workArea.toLowerCase().includes(kw) ||
          r.contractor.toLowerCase().includes(kw) ||
          r.projectName.toLowerCase().includes(kw) ||
          r.workerList.toLowerCase().includes(kw) ||
          r.reporter.toLowerCase().includes(kw) ||
          r.safetyOfficer.toLowerCase().includes(kw);
        if (!matchKw) return false;
      }

      // 部门筛选
      if (filterDept && r.deptName !== filterDept) return false;

      // 施工单位筛选
      if (filterContractor && r.contractor !== filterContractor) return false;

      // 安全岗位在岗状态筛选
      if (filterSafetyStatus !== 'all') {
        if (filterSafetyStatus === 'present' && r.safetyStatus !== 'present') return false;
        if (filterSafetyStatus === 'absent' && r.safetyStatus !== 'absent') return false;
      }

      return true;
    });
  }, [records, searchKeyword, filterDept, filterContractor, filterSafetyStatus]);

  // 处理提交新记录
  const handleCreateSubmit = (newRecord: OvertimeRecord) => {
    const updated = [newRecord, ...records];
    updateRecords(updated);
  };

  // 切换安全员在岗状态 (触发或核销告警)
  const handleToggleSafetyStatus = (targetRecord: OvertimeRecord) => {
    const isCurrentlyAbsent = targetRecord.safetyStatus === 'absent';
    const nextStatus: 'present' | 'absent' = isCurrentlyAbsent ? 'present' : 'absent';
    const hasActiveAlert = nextStatus === 'absent';

    const updated = records.map(r => {
      if (r.id === targetRecord.id) {
        return {
          ...r,
          safetyStatus: nextStatus,
          hasActiveAlert,
          alertReason: hasActiveAlert 
            ? `加班现场缺少在岗安全员监护 (${r.safetyOfficer})` 
            : undefined,
          safetyOfficer: nextStatus === 'present' 
            ? (r.safetyOfficer === '未在岗/缺席' ? '当班安全员' : r.safetyOfficer)
            : '未在岗/缺席'
        };
      }
      return r;
    });

    updateRecords(updated);

    // 同步更新详情弹窗中的记录
    if (selectedRecordForDetail && selectedRecordForDetail.id === targetRecord.id) {
      setSelectedRecordForDetail({
        ...selectedRecordForDetail,
        safetyStatus: nextStatus,
        hasActiveAlert,
        safetyOfficer: nextStatus === 'present' ? '当班安全员' : '未在岗/缺席'
      });
    }
  };

  // 删除某条加班记录
  const handleDeleteRecord = (id: string) => {
    if (window.confirm(`确定删除序号为 #${id} 的加班登记记录吗？`)) {
      const updated = records.filter(r => r.id !== id);
      updateRecords(updated);
    }
  };

  // 重置筛选条件
  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterDept('');
    setFilterContractor('');
    setFilterSafetyStatus('all');
  };

  return (
    <div className="p-5 space-y-4 bg-slate-50 min-h-screen text-slate-800">
      {/* 顶部 Tab 导览选项 */}
      <div className="bg-white p-2.5 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('daily_report')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'daily_report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>加班日报与统计</span>
          </button>
          <button
            onClick={() => setActiveTab('monthly_report')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'monthly_report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>加班月报与汇总</span>
          </button>
          <button
            onClick={() => setActiveTab('registration')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'registration'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>加班登记表 (安全在岗联动)</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {onChangeView && (
            <button
              onClick={() => onChangeView('alarms')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-rose-500" />
              <span>进入告警中心</span>
            </button>
          )}

          {activeTab === 'registration' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>新增加班登记</span>
            </button>
          )}
        </div>
      </div>

      {/* 视图分发 */}
      {activeTab === 'daily_report' ? (
        <OvertimeDailyReportView 
          onNavigateToTracking={(personName) => {
            if (onChangeView) onChangeView('personnel');
          }} 
        />
      ) : activeTab === 'monthly_report' ? (
        <OvertimeMonthlyReportView />
      ) : (
        <>
          {/* 关键安全指标统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. 总加班登记项数 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">加班申报项数</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-slate-900">{stats.totalCount}</span>
              <span className="text-xs text-slate-400">项</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* 2. 加班施工总人数 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">加班施工总人数</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-blue-600">{stats.totalWorkers}</span>
              <span className="text-xs text-slate-400">人</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* 3. 安全岗位在岗项数 */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">安全岗位在岗项</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-600">{stats.presentCount}</span>
              <span className="text-xs text-slate-400">/ {stats.totalCount} ({stats.presentRate}%)</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* 4. 安全岗位缺岗告警项 (核心高亮) */}
        <button
          onClick={() => setFilterSafetyStatus(filterSafetyStatus === 'absent' ? 'all' : 'absent')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            stats.absentAlertCount > 0
              ? 'bg-rose-50/90 border-rose-300 shadow-xs hover:border-rose-400'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-xs font-bold ${stats.absentAlertCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
                安全岗位缺岗告警
              </span>
              {stats.absentAlertCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-mono ${stats.absentAlertCount > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                {stats.absentAlertCount}
              </span>
              <span className={`text-xs ${stats.absentAlertCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                项告警
              </span>
            </div>
          </div>
          <div className={`p-2.5 rounded-lg ${stats.absentAlertCount > 0 ? 'bg-rose-600 text-white shadow-xs animate-bounce' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </button>

        {/* 5. 特种作业管控 (动火与受限空间) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block mb-1">动火/受限特种作业</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-amber-600">{stats.highRiskCount}</span>
              <span className="text-xs text-slate-400">项</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 如果有缺岗告警，展示强烈的预警横幅 Banner */}
      {stats.absentAlertCount > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div className="text-xs">
              <p className="font-bold">
                检测到当前有 <span className="underline decoration-2 font-mono text-sm">{stats.absentAlertCount}</span> 项加班现场缺少安全岗位人员监护在岗！
              </p>
              <p className="text-rose-700 text-[11px] mt-0.5">
                已自动向【告警管理中心】推送安全缺岗事件，请即时派员补位核销或联系带班人停工整改。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSafetyStatus('absent')}
              className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              筛选缺岗告警项
            </button>
            {onChangeView && (
              <button
                onClick={() => onChangeView('alarms')}
                className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-rose-700 border border-rose-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>跳转告警大厅</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 筛选与搜索工具栏 */}
      <div className="bg-white p-3.5 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* 关键字搜索 */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索船号/区域/单位/项目/人员/安全员..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* 在岗状态筛选 Tab */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterSafetyStatus('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                filterSafetyStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部状态
            </button>
            <button
              onClick={() => setFilterSafetyStatus('present')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                filterSafetyStatus === 'present' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              安全员在岗
            </button>
            <button
              onClick={() => setFilterSafetyStatus('absent')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                filterSafetyStatus === 'absent' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              <span>缺岗告警</span>
              {stats.absentAlertCount > 0 && (
                <span className="px-1 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-bold">
                  {stats.absentAlertCount}
                </span>
              )}
            </button>
          </div>

          {/* 部门筛选 */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部部门</option>
            {deptList.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* 施工单位筛选 */}
          <select
            value={filterContractor}
            onChange={(e) => setFilterContractor(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部施工单位</option>
            {contractorList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>重置筛选</span>
          </button>
          <span className="text-slate-400 font-mono">共 {filteredRecords.length} 条</span>
        </div>
      </div>

      {/* 加班登记与安全员在岗表单 */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-12 text-center">序号</th>
                <th className="py-3 px-3">部门 / 日期</th>
                <th className="py-3 px-3">加班时间段</th>
                <th className="py-3 px-3">施工船号 / 作业区域</th>
                <th className="py-3 px-3">施工单位 / 人数</th>
                <th className="py-3 px-3">加班项目</th>
                <th className="py-3 px-3">特种管控</th>
                <th className="py-3 px-3">安全岗位人员</th>
                <th className="py-3 px-3 text-center">在岗状态 & 告警联动</th>
                <th className="py-3 px-3">带班人/电话</th>
                <th className="py-3 px-3 w-28 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <span>未查找到匹配的加班登记记录</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr 
                    key={r.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      r.safetyStatus === 'absent' ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    {/* 序号 */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                      #{r.id}
                    </td>

                    {/* 部门 / 日期 */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{r.deptName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{r.reportDate}</div>
                    </td>

                    {/* 加班时间段 */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {r.timeRange}
                      </span>
                    </td>

                    {/* 施工船号 / 作业区域 */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-800">{r.shipNo}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[140px]" title={r.workArea}>
                        {r.workArea}
                      </div>
                    </td>

                    {/* 施工单位 / 人数 */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{r.contractor}</div>
                      <div className="text-[11px] font-bold text-emerald-600 font-mono">
                        {r.workerCount} 人
                      </div>
                    </td>

                    {/* 加班项目 */}
                    <td className="py-3 px-3 max-w-[180px]">
                      <p className="font-mono text-slate-700 truncate" title={r.projectName}>
                        {r.projectName}
                      </p>
                    </td>

                    {/* 特种管控 */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        {r.isHotWork ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 w-max">
                            动火 ({r.hotWorkLevel})
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">非动火</span>
                        )}
                        {r.isConfinedSpace && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 w-max">
                            密闭空间
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 安全岗位人员 */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <span>{r.safetyOfficer || '未配备'}</span>
                      </div>
                      {r.safetyOfficerPhone && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{r.safetyOfficerPhone}</span>
                        </div>
                      )}
                    </td>

                    {/* 在岗状态 & 告警联动 */}
                    <td className="py-3 px-3 text-center">
                      {r.safetyStatus === 'absent' ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-xs flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            缺岗告警
                          </span>
                          <button
                            onClick={() => handleToggleSafetyStatus(r)}
                            className="text-[10px] text-emerald-700 underline font-bold hover:text-emerald-900 cursor-pointer"
                          >
                            核销在岗
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            安全员在岗
                          </span>
                          <button
                            onClick={() => handleToggleSafetyStatus(r)}
                            className="text-[10px] text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            标记缺岗
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 填报人 / 电话 */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{r.reporter}</div>
                      <div className="text-[10px] font-mono text-slate-500">{r.reporterPhone}</div>
                    </td>

                    {/* 操作 */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedRecordForDetail(r)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="删除记录"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增加班登记弹窗 */}
      <CreateOvertimeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* 加班登记详情弹窗 */}
      <OvertimeDetailModal
        record={selectedRecordForDetail}
        isOpen={!!selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        onToggleSafetyStatus={handleToggleSafetyStatus}
      />
        </>
      )}
    </div>
  );
}
