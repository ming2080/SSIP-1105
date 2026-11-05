/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 班组/组织层级编辑与新建弹窗
 * 仅保留核心字段：班组/机构名称、所属上级机构、班组状态、排序位，采用竖形排列
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  FolderTree, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  DepartmentNode, 
  flattenDepartments, 
  getAllDescendantIds 
} from '@/src/data/departmentData';

interface TeamEditModalProps {
  mode: 'create' | 'edit';
  initialNode?: DepartmentNode | null;
  defaultParentId?: string;
  tree: DepartmentNode[];
  onClose: () => void;
  onSave: (nodeData: DepartmentNode) => void;
}

export function TeamEditModal({
  mode,
  initialNode,
  defaultParentId = '',
  tree,
  onClose,
  onSave
}: TeamEditModalProps) {
  // 扁平化列表用于选择上级部门
  const allDepartmentsFlat = useMemo(() => {
    return flattenDepartments(tree);
  }, [tree]);

  // 如果是编辑模式，不能将自己或自己的子孙节点选为父节点（防止循环嵌套）
  const forbiddenParentIds = useMemo(() => {
    if (mode === 'edit' && initialNode) {
      return getAllDescendantIds(tree, initialNode.deptid, true);
    }
    return [];
  }, [mode, initialNode, tree]);

  // 可选的上级部门候选列表
  const validParentCandidates = useMemo(() => {
    return allDepartmentsFlat.filter(d => !forbiddenParentIds.includes(d.deptid));
  }, [allDepartmentsFlat, forbiddenParentIds]);

  // 表单状态：仅保留班组/机构名称、所属上级机构、班组状态、排序位
  const [deptname, setDeptname] = useState<string>(() => {
    if (mode === 'edit' && initialNode) {
      return initialNode.deptname || '';
    }
    return '';
  });

  const [parentid, setParentid] = useState<string>(() => {
    if (mode === 'edit' && initialNode) {
      return initialNode.parentid || '';
    }
    return defaultParentId || '';
  });

  // 班组状态：0 为启用，1 为禁用，默认为启用 (0)
  const [disabled, setDisabled] = useState<number>(() => {
    if (mode === 'edit' && initialNode) {
      return initialNode.disabled ?? 0;
    }
    return 0;
  });

  // 排序位：越小越靠前，默认为 1
  const [sortOrder, setSortOrder] = useState<number>(() => {
    if (mode === 'edit' && initialNode) {
      return initialNode.sortOrder ?? 1;
    }
    return 1;
  });

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptname.trim()) {
      setErrorMsg('请填写班组/机构名称');
      return;
    }

    // 计算层级等级
    const parentNode = allDepartmentsFlat.find(d => d.deptid === parentid);
    const calculatedGrade = parentNode ? Math.min((parentNode.deptgrade || 1) + 1, 4) : 1;
    const randomCode = Math.floor(1000 + Math.random() * 9000);

    const payload: DepartmentNode = {
      deptid: initialNode?.deptid || `DEPT-${Date.now().toString().slice(-6)}`,
      deptname: deptname.trim(),
      deptcode: initialNode?.deptcode || `TEAM_${randomCode}`,
      deptgrade: calculatedGrade,
      parentid: parentid || '',
      depttype: initialNode?.depttype || '4',
      deptattribute: initialNode?.deptattribute || '02',
      disabled: disabled === 1 ? 1 : 0,
      leader: initialNode?.leader || '',
      phone: initialNode?.phone || '',
      workLocation: initialNode?.workLocation || '',
      remark: initialNode?.remark || '',
      sortOrder: Number(sortOrder) || 1,
      createTime: initialNode?.createTime || new Date().toISOString().replace('T', ' ').substring(0, 16),
      updateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      children: initialNode?.children || []
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {mode === 'create' ? '新增班组 / 组织机构' : `编辑班组 - ${initialNode?.deptname}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                维护组织架构层级结构与班组基本信息
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容：采用竖形排列 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. 班组/机构名称 */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">
              班组 / 机构名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={deptname}
              onChange={e => {
                setDeptname(e.target.value);
                setErrorMsg('');
              }}
              placeholder="请输入班组或机构全称，如：船体制造车间、搭载电焊二组"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs transition-shadow"
              required
              autoFocus
            />
          </div>

          {/* 2. 所属上级机构 */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">
              所属上级机构
            </label>
            <select
              value={parentid}
              onChange={e => setParentid(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs bg-white text-slate-800 transition-shadow"
            >
              <option value="">【无上级机构】顶级单位 / 集团公司</option>
              {validParentCandidates.map(parent => (
                <option key={parent.deptid} value={parent.deptid}>
                  {'— '.repeat(Math.max(0, parent.deptgrade - 1))}
                  {parent.deptname}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              请选择上级挂载节点，不选则默认为顶级机构
            </p>
          </div>

          {/* 3. 班组状态（启用 / 禁用，默认为启用） */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold">
              班组状态
            </label>
            <div className="flex items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="team_status"
                  value="0"
                  checked={disabled === 0}
                  onChange={() => setDisabled(0)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  启用 (正常)
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="team_status"
                  value="1"
                  checked={disabled === 1}
                  onChange={() => setDisabled(1)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  禁用 (停用)
                </span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              默认为启用状态。禁用后该班组将处于停用状态
            </p>
          </div>

          {/* 4. 排序位 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 font-semibold">
                排序位
              </label>
              <span className="text-[11px] text-slate-400">
                数值越小越靠前
              </span>
            </div>
            <input
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(Number(e.target.value))}
              placeholder="请输入排序数字，例如：1"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs font-mono transition-shadow"
              min={0}
              step={1}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            确认保存
          </button>
        </div>
      </div>
    </div>
  );
}
