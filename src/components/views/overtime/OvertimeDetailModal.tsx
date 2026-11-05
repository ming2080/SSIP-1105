/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 加班登记表 - 详情弹窗 (展示安全岗位人员及联动告警)
 */

import React from 'react';
import { 
  X, 
  Clock, 
  Building2, 
  MapPin, 
  ShieldAlert, 
  FileText,
  Users,
  Phone,
  HardHat,
  Calendar,
  Ship,
  ShieldCheck,
  AlertTriangle,
  BellRing,
  CheckCircle2
} from 'lucide-react';
import { OvertimeRecord } from '@/src/data/overtimeData';

interface OvertimeDetailModalProps {
  record: OvertimeRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSafetyStatus?: (record: OvertimeRecord) => void;
}

export function OvertimeDetailModal({ 
  record, 
  isOpen, 
  onClose,
  onToggleSafetyStatus
}: OvertimeDetailModalProps) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${
              record.safetyStatus === 'absent' ? 'bg-rose-600 animate-pulse' : 'bg-blue-600'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">加班登记表详情</h2>
                <span className="font-mono text-xs font-medium text-slate-500">序号 #{record.id}</span>
                {record.safetyStatus === 'absent' ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    安全员缺岗告警
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    安全员在岗
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">填报日期：{record.reportDate} · 部门：{record.deptName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {/* 安全岗位人员与告警联动卡片 */}
          <div className={`p-4 rounded-lg border ${
            record.safetyStatus === 'absent' 
              ? 'border-rose-300 bg-rose-50/80' 
              : 'border-emerald-200 bg-emerald-50/50'
          } flex flex-wrap items-center justify-between gap-3`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${
                  record.safetyStatus === 'absent' ? 'text-rose-600' : 'text-emerald-600'
                }`} />
                <span className="text-xs font-bold text-slate-800">安全岗位人员及在岗监控</span>
              </div>
              <div className="text-xs text-slate-700 font-medium">
                当班安全员：<strong className="text-slate-900">{record.safetyOfficer || '未指定'}</strong>
                {record.safetyOfficerPhone && (
                  <span className="ml-2 font-mono text-slate-500">({record.safetyOfficerPhone})</span>
                )}
              </div>
              {record.safetyStatus === 'absent' && (
                <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                  <span>告警原因：{record.alertReason || '现场无安全员在场/离岗缺席'}</span>
                </div>
              )}
            </div>

            {onToggleSafetyStatus && (
              <button
                onClick={() => onToggleSafetyStatus(record)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md shadow-2xs transition-colors cursor-pointer ${
                  record.safetyStatus === 'absent'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {record.safetyStatus === 'absent' ? '核销到岗 (恢复在岗)' : '标记缺岗 (触发告警)'}
              </button>
            )}
          </div>

          {/* 核心工程基础信息卡片 */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">部门</span>
              <span className="font-bold text-slate-800">{record.deptName}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">填报日期</span>
              <span className="font-mono font-semibold text-slate-800">{record.reportDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">加班时间段</span>
              <span className="font-mono font-bold text-blue-600">{record.timeRange}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">施工人数</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">{record.workerCount} 人</span>
            </div>
          </div>

          {/* 施工船号与作业区域 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Ship className="w-4 h-4 text-blue-600" />
              <span>施工船舶与区域定位</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400">施工船号：</span>
                <span className="font-semibold text-slate-800 font-mono">{record.shipNo}</span>
              </div>
              <div>
                <span className="text-slate-400">施工区域：</span>
                <span className="font-semibold text-slate-800">{record.workArea}</span>
              </div>
              <div>
                <span className="text-slate-400">施工单位：</span>
                <span className="font-semibold text-slate-800">{record.contractor}</span>
              </div>
            </div>
          </div>

          {/* 加班项目 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>加班项目</span>
            </div>
            <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
              {record.projectName}
            </p>
          </div>

          {/* 安全作业特性 */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>施工安全特性控制</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-amber-800">是否动火：</span>
                <span className={`font-bold ${record.isHotWork ? 'text-rose-600' : 'text-slate-600'}`}>
                  {record.isHotWork ? '是' : '否'}
                </span>
              </div>
              <div>
                <span className="text-amber-800">动火等级：</span>
                <span className="font-bold text-amber-900">{record.hotWorkLevel || '无'}</span>
              </div>
              <div>
                <span className="text-amber-800">是否有限空间：</span>
                <span className={`font-bold ${record.isConfinedSpace ? 'text-rose-600' : 'text-slate-600'}`}>
                  {record.isConfinedSpace ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>

          {/* 施工人员名单 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                施工人员名单
              </span>
              <span className="text-[11px] font-normal text-slate-400">共 {record.workerCount} 人</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
              {record.workerList}
            </p>
          </div>

          {/* 带班人联系信息 */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">带班人：</span>
              <span className="font-bold text-slate-800">{record.reporter}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-400">联系电话：</span>
              <span className="font-mono font-bold text-slate-800">{record.reporterPhone}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            东南基地加班与告警管理联动引擎
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
