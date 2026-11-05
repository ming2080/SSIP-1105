/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 定位标签 新增 / 编辑弹窗
 * 按照要求：离线/在线状态及电量由设备自动上报，表单中不可创建和编辑，删除这几项表单维护项；
 * 仅保留标签编码、标签状态及人员绑定分配项。
 */

import React, { useState, useEffect } from 'react';
import { X, Radio, AlertCircle } from 'lucide-react';
import { LocationTagItem } from '@/src/data/tagData';
import { DhrPersonnelItem } from '@/src/data/dhrPersonnelData';

interface TagEditModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialTag: LocationTagItem | null;
  personnelList: DhrPersonnelItem[];
  onClose: () => void;
  onSave: (tagData: LocationTagItem, bindEmpId?: string) => void;
}

export function TagEditModal({
  isOpen,
  mode,
  initialTag,
  personnelList,
  onClose,
  onSave
}: TagEditModalProps) {
  const [tagCode, setTagCode] = useState('');
  const [tagStatus, setTagStatus] = useState<'used' | 'unused'>('unused');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (mode === 'edit' && initialTag) {
        setTagCode(initialTag.tagCode || '');
        setTagStatus(initialTag.tagStatus || 'unused');
        setSelectedEmpId(initialTag.empId || '');
      } else {
        // 新建默认
        setTagCode('');
        setTagStatus('unused');
        setSelectedEmpId('');
      }
    }
  }, [isOpen, mode, initialTag]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagCode.trim()) {
      setErrorMsg('请填写标签编码（如 2、FF260805、UWB-1001）');
      return;
    }

    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
    let personName = '-';
    let deptName = '';

    if (tagStatus === 'used' && selectedEmpId) {
      const p = personnelList.find(item => item.empID === selectedEmpId);
      if (p) {
        personName = p.name;
        deptName = p.deptname || '';
      }
    }

    const savedTag: LocationTagItem = {
      id: initialTag?.id || `TAG-${Date.now()}`,
      tagCode: tagCode.trim(),
      tagStatus,
      empId: tagStatus === 'used' && selectedEmpId ? selectedEmpId : undefined,
      personName: tagStatus === 'used' ? personName : '-',
      deptName: tagStatus === 'used' ? deptName : undefined,
      // 离线/在线设备状态与电量由设备自动上报产生，编辑时保留原设备上报值，新建默认为离线与未上报
      deviceStatus: initialTag ? initialTag.deviceStatus : 'offline',
      batteryLevel: initialTag ? initialTag.batteryLevel : null,
      lastUpdateTime: initialTag ? initialTag.lastUpdateTime || nowStr : '',
      remark: initialTag?.remark || ''
    };

    onSave(savedTag, tagStatus === 'used' ? selectedEmpId : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col text-slate-800">
        
        {/* 顶部标题栏 */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {mode === 'create' ? '新增定位标签' : '编辑定位标签'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'create' ? '录入新购置或新投入的 UWB/RFID 定位标签' : `修改标签【${initialTag?.tagCode}】信息与归属`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 表单内容 - 优雅竖形排列 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. 标签编码 */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">
              标签编码 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={tagCode}
              onChange={e => setTagCode(e.target.value)}
              placeholder="例如：2、FF260805、UWB-1008"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <p className="text-[11px] text-slate-400">
              对应现场工牌芯片编码或外壳印刻编号
            </p>
          </div>

          {/* 2. 标签状态 */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">
              标签状态 <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="tagStatus"
                  value="unused"
                  checked={tagStatus === 'unused'}
                  onChange={() => {
                    setTagStatus('unused');
                    setSelectedEmpId('');
                  }}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="font-semibold text-rose-600">未使用 (空闲库存)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="tagStatus"
                  value="used"
                  checked={tagStatus === 'used'}
                  onChange={() => setTagStatus('used')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-semibold text-blue-600">已使用 (已分配人员)</span>
              </label>
            </div>
          </div>

          {/* 3. 关联人员名称（仅已使用时需指定） */}
          {tagStatus === 'used' && (
            <div className="space-y-1.5 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
              <label className="block text-slate-700 font-semibold">
                分配绑定人员 <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- 请选择人员 --</option>
                {personnelList.map(p => (
                  <option key={p.empID} value={p.empID}>
                    {p.name} [{p.empcode}] - {p.gwName || '作业工人'} ({p.deptname?.split('//').pop()})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-blue-600 leading-tight">
                绑定后系统将在人员库中同步更新该员工的标签工牌与发卡记录
              </p>
            </div>
          )}

          {/* 底部操作按钮 */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              保存标签
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
