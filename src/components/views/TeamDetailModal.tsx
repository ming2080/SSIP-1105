/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 班组/组织节点详细档案查看弹窗
 * 仅保留核心字段：班组/机构名称、所属上级机构、班组状态、排序位
 */

import React, { useMemo } from 'react';
import { 
  X, 
  FolderTree, 
  Layers, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle,
  Edit3
} from 'lucide-react';
import { 
  DepartmentNode, 
  flattenDepartments 
} from '@/src/data/departmentData';

interface TeamDetailModalProps {
  node: DepartmentNode;
  tree: DepartmentNode[];
  onClose: () => void;
  onEdit: (node: DepartmentNode) => void;
}

export function TeamDetailModal({
  node,
  tree,
  onClose,
  onEdit
}: TeamDetailModalProps) {
  // 查找所属上级机构名称
  const parentName = useMemo(() => {
    if (!node.parentid) {
      return '无上级机构（顶级单位）';
    }
    const flat = flattenDepartments(tree);
    const parent = flat.find(d => d.deptid === node.parentid);
    return parent ? parent.deptname : '顶级机构';
  }, [tree, node.parentid]);

  const isEnabled = node.disabled !== 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">班组组织详情</h3>
              <p className="text-xs text-slate-500 mt-0.5">查看班组基本组织架构信息</p>
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

        {/* 详情信息列表（竖形排列） */}
        <div className="p-6 space-y-4 text-xs">
          {/* 1. 班组/机构名称 */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[11px] block font-medium">班组 / 机构名称</span>
            <div className="text-sm font-bold text-slate-800">
              {node.deptname}
            </div>
          </div>

          {/* 2. 所属上级机构 */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>所属上级机构</span>
            </div>
            <div className="text-xs font-semibold text-slate-700">
              {parentName}
            </div>
          </div>

          {/* 3. 班组状态 */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-1">
            <span className="text-slate-400 text-[11px] block font-medium">班组状态</span>
            <div className="flex items-center gap-2">
              {isEnabled ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  启用
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  禁用
                </span>
              )}
            </div>
          </div>

          {/* 4. 排序位 */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>排序位</span>
              </div>
              <span className="text-[10px] text-slate-400">数值越小越靠前</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-800">
              {node.sortOrder ?? 1}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(node);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            编辑修改
          </button>
        </div>
      </div>
    </div>
  );
}
