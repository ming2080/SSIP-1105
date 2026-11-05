/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 东南基地加班登记表 - 新增加班申请登记弹窗 (支持安全岗位在岗检测与告警联动)
 */

import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Building2, 
  MapPin, 
  ShieldAlert, 
  UserCheck,
  AlertTriangle,
  Phone,
  Users,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { OvertimeRecord } from '@/src/data/overtimeData';

interface CreateOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: OvertimeRecord) => void;
}

export function CreateOvertimeModal({ isOpen, onClose, onSubmit }: CreateOvertimeModalProps) {
  const [deptName, setDeptName] = useState<string>('制造部');
  const [reportDate, setReportDate] = useState<string>('2026-08-07');
  const [timeRange, setTimeRange] = useState<string>('17:00 - 21:00');
  const [shipNo, setShipNo] = useState<string>('185-4 / 517-2');
  const [workArea, setWorkArea] = useState<string>('16T前');
  const [contractor, setContractor] = useState<string>('安海');
  const [workerCount, setWorkerCount] = useState<number>(10);
  const [projectName, setProjectName] = useState<string>('分段打磨与结构合拢电焊');
  const [isHotWork, setIsHotWork] = useState<boolean>(true);
  const [hotWorkLevel, setHotWorkLevel] = useState<string>('无');
  const [isConfinedSpace, setIsConfinedSpace] = useState<boolean>(false);
  const [workerList, setWorkerList] = useState<string>('王成林, 蔡佐兵, 黄贤锦, 张国, 蔡切兵, 李芳, 刘丙涛, 莫大奎');
  const [reporter, setReporter] = useState<string>('潘记锋');
  const [reporterPhone, setReporterPhone] = useState<string>('18888394634');
  const [remark, setRemark] = useState<string>('');

  // 核心安全岗位联动配置
  const [safetyOfficer, setSafetyOfficer] = useState<string>('周卫国 (安全工程师)');
  const [safetyOfficerPhone, setSafetyOfficerPhone] = useState<string>('13890123456');
  const [safetyStatus, setSafetyStatus] = useState<'present' | 'absent'>('present');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert('请填写加班项目');
      return;
    }
    if (!workerList.trim()) {
      alert('请填写施工人员名单');
      return;
    }

    const newId = String(Date.now()).slice(-4);
    const hasActiveAlert = safetyStatus === 'absent';
    const alertId = hasActiveAlert ? `ALM-OT-20260807-${newId}` : undefined;
    const alertReason = hasActiveAlert ? `加班施工现场未配备/未到位在岗安全员(${safetyOfficer})` : undefined;

    const newRecord: OvertimeRecord = {
      id: newId,
      deptName: deptName.trim(),
      reportDate,
      timeRange: timeRange.trim(),
      shipNo: shipNo.trim(),
      workArea: workArea.trim(),
      contractor: contractor.trim(),
      workerCount: Number(workerCount) || 1,
      projectName: projectName.trim(),
      isHotWork,
      hotWorkLevel: isHotWork ? hotWorkLevel : '无',
      isConfinedSpace,
      workerList: workerList.trim(),
      reporter: reporter.trim(),
      reporterPhone: reporterPhone.trim(),
      remark: remark.trim(),
      safetyOfficer: safetyOfficer.trim() || '未设定',
      safetyOfficerPhone: safetyOfficerPhone.trim(),
      safetyStatus,
      hasActiveAlert,
      alertId,
      alertReason
    };

    onSubmit(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">东南基地加班登记表 - 新增申报与安全监督</h2>
              <p className="text-xs text-slate-500">同步核实现场安全岗位人员在岗状态，联动触发告警管理中心</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {/* 部门 & 填报日期 & 加班时间段 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>部门
              </label>
              <input
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="例如: 制造部"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>填报日期
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>加班时间段
              </label>
              <input
                type="text"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                placeholder="例如: 17:00 - 21:00"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>

          {/* 施工船号 & 施工区域 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>施工船号
              </label>
              <input
                type="text"
                value={shipNo}
                onChange={(e) => setShipNo(e.target.value)}
                placeholder="例如: 185-4 / 517-2"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>施工区域
              </label>
              <input
                type="text"
                value={workArea}
                onChange={(e) => setWorkArea(e.target.value)}
                placeholder="例如: 16T前 / 内场第三跨 / 128"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 施工单位 & 施工人数 & 加班项目 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>施工单位
              </label>
              <input
                type="text"
                value={contractor}
                onChange={(e) => setContractor(e.target.value)}
                placeholder="例如: 安海, 明烨, 鹏杨"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>施工人数
              </label>
              <input
                type="number"
                min={1}
                value={workerCount}
                onChange={(e) => setWorkerCount(Number(e.target.value))}
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-bold text-blue-600 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>加班项目
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="例如: 12.922.932分段焊接"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 核心需求：安全岗位人员及在岗检测联动 */}
          <div className={`p-3.5 rounded-lg border transition-all ${
            safetyStatus === 'absent' 
              ? 'border-rose-300 bg-rose-50/80' 
              : 'border-blue-200 bg-blue-50/40'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>加班安全岗位人员与在岗核验联动</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  指定安全岗位人员 / 安全员
                </label>
                <input
                  type="text"
                  value={safetyOfficer}
                  onChange={(e) => setSafetyOfficer(e.target.value)}
                  placeholder="例如: 周卫国 (安全工程师)"
                  className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  安全员联系电话
                </label>
                <input
                  type="text"
                  value={safetyOfficerPhone}
                  onChange={(e) => setSafetyOfficerPhone(e.target.value)}
                  placeholder="例如: 13890123456"
                  className="w-full h-8 px-2.5 rounded border border-slate-300 bg-white text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            {safetyStatus === 'absent' && (
              <div className="mt-2.5 p-2 rounded bg-rose-100/90 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 animate-bounce" />
                <span>
                  <strong>系统警告：</strong> 当前加班记录无安全员在岗，提交后将自动触发<strong>【加班施工无安全岗位人员在岗告警】</strong>并即时推送至告警管理中心！
                </span>
              </div>
            )}
          </div>

          {/* 安全选项：动火、动火等级、有限空间 */}
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 space-y-3">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>施工安全特性控制</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">是否动火</label>
                <div className="flex items-center gap-3 h-8">
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="hotWork"
                      checked={isHotWork}
                      onChange={() => setIsHotWork(true)}
                      className="mr-1 text-amber-600"
                    />
                    是
                  </label>
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="hotWork"
                      checked={!isHotWork}
                      onChange={() => setIsHotWork(false)}
                      className="mr-1 text-amber-600"
                    />
                    否
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">动火等级</label>
                <select
                  disabled={!isHotWork}
                  value={hotWorkLevel}
                  onChange={(e) => setHotWorkLevel(e.target.value)}
                  className="w-full h-8 px-2 rounded border border-amber-300 bg-white text-xs text-slate-800 disabled:bg-slate-100"
                >
                  <option value="无">无</option>
                  <option value="一级">一级</option>
                  <option value="二级">二级</option>
                  <option value="三级">三级</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-900 mb-1">是否有限空间作业</label>
                <div className="flex items-center gap-3 h-8">
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="confinedSpace"
                      checked={isConfinedSpace}
                      onChange={() => setIsConfinedSpace(true)}
                      className="mr-1 text-amber-600"
                    />
                    是
                  </label>
                  <label className="inline-flex items-center text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="confinedSpace"
                      checked={!isConfinedSpace}
                      onChange={() => setIsConfinedSpace(false)}
                      className="mr-1 text-amber-600"
                    />
                    否
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 施工人员名单 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              <span className="text-rose-500 mr-1">*</span>施工人员名单 (多个姓名用逗号分隔)
            </label>
            <textarea
              rows={2}
              value={workerList}
              onChange={(e) => setWorkerList(e.target.value)}
              placeholder="例如: 王成林, 蔡佐兵, 黄贤锦, 张国, 蔡切兵, 李芳, 刘丙涛, 莫大奎..."
              className="w-full p-2.5 rounded-md border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 带班人 & 带班人电话 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>带班人
              </label>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="带班人姓名"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                <span className="text-rose-500 mr-1">*</span>带班人电话
              </label>
              <input
                type="text"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="带班人联系电话"
                className="w-full h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`px-5 py-2 text-xs font-medium text-white rounded-md transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 ${
              safetyStatus === 'absent' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {safetyStatus === 'absent' && <Bell className="w-3.5 h-3.5 animate-pulse" />}
            {safetyStatus === 'absent' ? '登记并联动触发告警' : '保存提交加班登记'}
          </button>
        </div>
      </div>
    </div>
  );
}
