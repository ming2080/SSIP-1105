/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DHR 人力资源系统单向数据同步控制中心
 * 严格依据需求：
 * 1. 单向同步：数据从 DHR 系统同步过来，不从本系统更新上传
 * 2. 仅同步人员库业务系统信息，不同步用户管理模块
 * 3. 支持手动同步更新与定时同步策略 (每天凌晨 01:00:00)
 */

import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Server, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Database,
  Building2,
  Users,
  FileText,
  Activity,
  Calendar,
  History
} from 'lucide-react';
import { DhrPersonnelItem, DHR_INCREMENTAL_NEW_PERSONNEL } from '@/src/data/dhrPersonnelData';
import { appendDhrSyncLog } from '@/src/data/dhrSyncLogData';

interface DhrSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: (newItems: DhrPersonnelItem[]) => void;
  lastSyncTime: string;
  onOpenSyncLogs?: () => void;
}

export function DhrSyncModal({ isOpen, onClose, onSyncComplete, lastSyncTime, onOpenSyncLogs }: DhrSyncModalProps) {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [syncResult, setSyncResult] = useState<{
    newCount: number;
    updatedCount: number;
    totalSynced: number;
    departmentsUpdated: number;
    executionDuration: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartSync = () => {
    setSyncState('syncing');
    setSyncProgress(15);
    setCurrentStep('正在建立与 DHR 人资系统接口通信 (OpenAPI: /api/v2/dhr/sync)...');

    setTimeout(() => {
      setSyncProgress(45);
      setCurrentStep('正在拉取组织架构树与班组编码映射 (同步公司/部门/班组三级层级)...');
    }, 700);

    setTimeout(() => {
      setSyncProgress(75);
      setCurrentStep('正在校验员工工号、身份证号、用工类型与岗位工种字典增量...');
    }, 1500);

    setTimeout(() => {
      setSyncProgress(100);
      setCurrentStep('增量数据写入人员库完成，更新在线与档案索引...');
      setSyncState('success');
      
      const nowStr = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
      const batchNo = `SYNC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;

      const result = {
        newCount: DHR_INCREMENTAL_NEW_PERSONNEL.length,
        updatedCount: 8,
        totalSynced: 12 + DHR_INCREMENTAL_NEW_PERSONNEL.length,
        departmentsUpdated: 3,
        executionDuration: '1.82s'
      };
      setSyncResult(result);
      onSyncComplete(DHR_INCREMENTAL_NEW_PERSONNEL);

      // 记录同步日志
      appendDhrSyncLog({
        id: `LOG-${Date.now()}`,
        batchNo,
        syncTime: nowStr,
        triggerType: 'manual',
        triggerTypeName: '管理员手动同步',
        operator: '系统管理员 (当前在线)',
        duration: '1.82s',
        status: 'success',
        statusText: '执行成功',
        totalChecked: result.totalSynced,
        newCount: result.newCount,
        updatedCount: result.updatedCount,
        deptsUpdated: result.departmentsUpdated,
        abnormalCount: 0,
        summary: `管理员执行即时单向拉取同步，成功入库 ${result.newCount} 名新员工，同步 ${result.departmentsUpdated} 个班组组织`,
        stepLogs: [
          { time: nowStr.split(' ')[1] || '12:00:00', step: '通道通信', level: 'info', detail: '连接 DHR OpenAPI Gateway (/api/v2/dhr/sync) 成功' },
          { time: nowStr.split(' ')[1] || '12:00:00', step: '组织比对', level: 'info', detail: '拉取 B01 组织表与造船班组层级映射通过' },
          { time: nowStr.split(' ')[1] || '12:00:00', step: '档案更新', level: 'success', detail: `新增 ${result.newCount} 名在册人员，主档案已写入` }
        ],
        details: DHR_INCREMENTAL_NEW_PERSONNEL.map(p => ({
          empId: p.empID,
          name: p.name,
          empcode: p.empcode,
          deptname: p.deptname,
          gwName: p.gwName,
          changeType: '新增入库'
        }))
      });
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        
        {/* 弹窗头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <RefreshCw className={`w-5 h-5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">DHR 人力资源系统数据同步</h3>
              <p className="text-xs text-slate-500">接口机制：单向增量同步 (DHR &rarr; 智慧船厂 SSSP 人员库)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={syncState === 'syncing'}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 状态与接口配置信息卡 */}
        <div className="px-6 py-4 space-y-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <span className="text-slate-400 text-[11px] block mb-1">DHR接口状态</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>通道已连通</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <span className="text-slate-400 text-[11px] block mb-1">上次同步时间</span>
              <div className="font-semibold text-slate-700 truncate font-mono text-[11px]">
                {lastSyncTime || '2026-09-14 01:00:00'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <span className="text-slate-400 text-[11px] block mb-1">下一次自动同步</span>
              <div className="font-semibold text-blue-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>次日 01:00:00</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
              <span className="text-slate-400 text-[11px] block mb-1">数据映射范围</span>
              <div className="font-semibold text-slate-700">
                <span>部门 + 人员主档</span>
              </div>
            </div>
          </div>

          {/* 同步中状态进度条 */}
          {syncState === 'syncing' && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span>{currentStep}</span>
                </div>
                <span className="font-mono">{syncProgress}%</span>
              </div>
              <div className="w-full bg-blue-200/70 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 同步成功结果展示卡 */}
          {syncState === 'success' && syncResult && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-emerald-900 font-bold border-b border-emerald-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>本次单向同步执行成功 (耗时 {syncResult.executionDuration})</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-normal">数据已实时并入人员库</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-emerald-200">
                  <span className="text-slate-400 text-[10px] block">总核对档案</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">{syncResult.totalSynced} 人</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200">
                  <span className="text-slate-400 text-[10px] block">新增入库人员</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">+{syncResult.newCount} 人</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200">
                  <span className="text-slate-400 text-[10px] block">信息变更更新</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">{syncResult.updatedCount} 人</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-200">
                  <span className="text-slate-400 text-[10px] block">同步班组组织</span>
                  <span className="font-bold text-indigo-600 font-mono text-sm">{syncResult.departmentsUpdated} 个</span>
                </div>
              </div>

              {/* 新增人员明细 */}
              <div className="bg-white rounded-lg p-2.5 border border-emerald-200 text-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-700 block">DHR 增量更新入库明细：</span>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {DHR_INCREMENTAL_NEW_PERSONNEL.map((p) => (
                    <div key={p.empID} className="flex items-center justify-between text-[11px] py-1 px-2 bg-slate-50 rounded border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-400 font-mono">({p.empcode})</span>
                        <span className="text-blue-600 text-[10px] bg-blue-50 px-1.5 rounded">{p.gwName}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] truncate max-w-[200px]">{p.deptname}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>单向传输协议安全校验通过</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSyncLogs && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSyncLogs();
                }}
                className="px-3 py-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>查看同步日志</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              {syncState === 'success' ? '完成并关闭' : '取消'}
            </button>
            <button 
              onClick={handleStartSync}
              disabled={syncState === 'syncing'}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncState === 'syncing' ? '正在拉取同步...' : '立即手动同步'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
