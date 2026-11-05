/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 加班日报与定位统计分析视图 (严格对应截图并联动加班管理)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCw, 
  Download, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { 
  OvertimeDailyRecord, 
  getStoredDailyReportRecords, 
  saveStoredDailyReportRecords 
} from '@/src/data/overtimeDailyReportData';
import { OvertimeTrajectoryModal } from './OvertimeTrajectoryModal';

interface OvertimeDailyReportViewProps {
  onNavigateToTracking?: (personName: string) => void;
}

export function OvertimeDailyReportView({ onNavigateToTracking }: OvertimeDailyReportViewProps) {
  // 数据集中存储
  const [records, setRecords] = useState<OvertimeDailyRecord[]>(() => getStoredDailyReportRecords());

  // 弹窗状态
  const [selectedRecordForTrajectory, setSelectedRecordForTrajectory] = useState<OvertimeDailyRecord | null>(null);

  // 筛选字段 (严格对应截图顶部筛选栏)
  const [filterDate, setFilterDate] = useState<string>('2026-09-20');
  const [filterName, setFilterName] = useState<string>('');
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [filterWorkType, setFilterWorkType] = useState<string>('');
  const [filterSafetyStatus, setFilterSafetyStatus] = useState<string>('');

  // 分页状态 (对应截图底部 10条/页 分页控件)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // 监听数据联动更新
  useEffect(() => {
    const handleDailyUpdate = (e: any) => {
      if (e.detail?.records) {
        setRecords(e.detail.records);
      }
    };
    window.addEventListener('overtime_daily_records_updated', handleDailyUpdate);
    return () => window.removeEventListener('overtime_daily_records_updated', handleDailyUpdate);
  }, []);

  // 下拉框字典提取
  const { companyList, deptList, teamList, workTypeList } = useMemo(() => {
    const companies = new Set<string>();
    const depts = new Set<string>();
    const teams = new Set<string>();
    const workTypes = new Set<string>();

    records.forEach(r => {
      if (r.company) companies.add(r.company);
      if (r.deptName) depts.add(r.deptName);
      if (r.teamName) teams.add(r.teamName);
      if (r.workType) workTypes.add(r.workType);
    });

    return {
      companyList: Array.from(companies),
      deptList: Array.from(depts),
      teamList: Array.from(teams),
      workTypeList: Array.from(workTypes)
    };
  }, [records]);

  // 综合条件筛选过滤
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterDate && r.reportDate !== filterDate) return false;
      if (filterName.trim() && !r.workerName.toLowerCase().includes(filterName.trim().toLowerCase())) return false;
      if (filterCompany && r.company !== filterCompany) return false;
      if (filterDept && r.deptName !== filterDept) return false;
      if (filterTeam && r.teamName !== filterTeam) return false;
      if (filterWorkType && r.workType !== filterWorkType) return false;
      if (filterSafetyStatus && r.safetyStatus !== filterSafetyStatus) return false;
      return true;
    });
  }, [records, filterDate, filterName, filterCompany, filterDept, filterTeam, filterWorkType, filterSafetyStatus]);

  // 分页截取
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  // 重置筛选
  const handleResetFilters = () => {
    setFilterDate('2026-09-20');
    setFilterName('');
    setFilterCompany('');
    setFilterDept('');
    setFilterTeam('');
    setFilterWorkType('');
    setFilterSafetyStatus('');
    setCurrentPage(1);
  };

  // 导出 Excel 触发
  const handleExport = () => {
    alert(`已为您导出【${filterDate || '全部'}】加班日报统计表格 (共 ${filteredRecords.length} 条记录)`);
  };

  return (
    <div className="space-y-4">
      {/* 顶部筛选表单栏 (严格还原截图样式) */}
      <div className="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* 1. 统计日期 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">统计日期</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 2. 姓名 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">姓名</label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="请输入姓名"
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 3. 公司 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">公司</label>
            <select
              value={filterCompany}
              onChange={(e) => {
                setFilterCompany(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择公司</option>
              {companyList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 4. 部门 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">部门</label>
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择所属部门</option>
              {deptList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 5. 班组 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">班组</label>
            <select
              value={filterTeam}
              onChange={(e) => {
                setFilterTeam(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择所属班组</option>
              {teamList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 6. 工种 */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">工种</label>
            <select
              value={filterWorkType}
              onChange={(e) => {
                setFilterWorkType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择所属工种</option>
              {workTypeList.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* 7. 搜索 & 重置 按钮组合 */}
          <div className="flex items-end gap-2 pt-1">
            <button
              onClick={() => setCurrentPage(1)}
              className="flex-1 h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>搜索</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* 导出按钮栏 */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出表格</span>
          </button>

          <div className="text-xs text-slate-500 font-mono">
            今日累积统计加班人数: <strong className="text-blue-600">{records.length}</strong> 人 · 人员定位轨迹监控有效
          </div>
        </div>
      </div>

      {/* 数据表格 (严格还原截图，并结合加班管理及安全员告警) */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">统计日期</th>
                <th className="py-3 px-3">姓名</th>
                <th className="py-3 px-3">联系方式</th>
                <th className="py-3 px-3">所属公司</th>
                <th className="py-3 px-3">所属部门</th>
                <th className="py-3 px-3">所属班组</th>
                <th className="py-3 px-3">所属工种</th>
                <th className="py-3 px-3 font-bold text-blue-700">累计停留时长</th>
                <th className="py-3 px-3 font-bold text-emerald-700">定位加班时长</th>
                <th className="py-3 px-3">关联加班单 / 船号区域</th>
                <th className="py-3 px-3">安全员在岗状态</th>
                <th className="py-3 px-3">创建时间</th>
                <th className="py-3 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      <span>未查询到符合条件的加班日报数据</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr 
                    key={r.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      r.safetyStatus === 'absent' ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* 统计日期 */}
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {r.reportDate}
                    </td>

                    {/* 姓名 */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {r.workerName}
                    </td>

                    {/* 联系方式 */}
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {r.phone}
                    </td>

                    {/* 所属公司 */}
                    <td className="py-3 px-3 text-slate-700">
                      {r.company}
                    </td>

                    {/* 所属部门 */}
                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {r.deptName}
                    </td>

                    {/* 所属班组 */}
                    <td className="py-3 px-3 text-slate-600">
                      {r.teamName}
                    </td>

                    {/* 所属工种 */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {r.workType}
                      </span>
                    </td>

                    {/* 强制保留字段 1：累计停留时长 */}
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 text-sm">
                      {r.cumulativeStayHours}
                    </td>

                    {/* 强制保留字段 2：定位加班时长 */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600 text-sm">
                      {r.positionedOvertimeHours}
                    </td>

                    {/* 结合加班管理：关联加班单及施工船舶区域 */}
                    <td className="py-3 px-3 max-w-[160px]">
                      <div className="font-mono text-xs font-bold text-slate-800 truncate" title={`${r.shipNo} (${r.workArea})`}>
                        #{r.overtimeId} · {r.shipNo}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {r.workArea}
                      </div>
                    </td>

                    {/* 结合告警管理：安全员在岗联动 */}
                    <td className="py-3 px-3">
                      {r.safetyStatus === 'absent' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white flex items-center gap-1 w-max shadow-2xs">
                          <AlertTriangle className="w-3 h-3" />
                          缺岗告警
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          在岗: {r.safetyOfficer.split(' ')[0]}
                        </span>
                      )}
                    </td>

                    {/* 创建时间 */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {r.createdAt}
                    </td>

                    {/* 强制保留字段 3：查看轨迹 */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecordForTrajectory(r)}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>查看轨迹</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 底部分页栏 (严格还原截图样式) */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>共 <strong className="font-mono text-slate-900">{totalRecords}</strong> 条</span>
            <select
              value={pageSize}
              disabled
              className="h-7 px-2 rounded border border-slate-300 bg-white text-xs font-mono"
            >
              <option value={10}>10条/页</option>
            </select>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(6, totalPages) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-7 h-7 rounded text-xs font-bold transition-all cursor-pointer ${
                  currentPage === p
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p}
              </button>
            ))}

            {totalPages > 6 && (
              <>
                <span className="px-1 text-slate-400">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-7 h-7 rounded text-xs font-bold transition-all cursor-pointer ${
                    currentPage === totalPages
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="ml-2 text-slate-500">前往</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-10 h-7 text-center rounded border border-slate-300 bg-white text-xs font-bold"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* 人员轨迹回放弹窗 */}
      <OvertimeTrajectoryModal
        record={selectedRecordForTrajectory}
        isOpen={!!selectedRecordForTrajectory}
        onClose={() => setSelectedRecordForTrajectory(null)}
        onNavigateToTracking={onNavigateToTracking}
      />
    </div>
  );
}
