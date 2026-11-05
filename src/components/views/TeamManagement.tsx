/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 组织管理 (组织架构与作业班组) 功能模块
 * 业务定位：独立维护公司、部门、作业班组的层级结构信息，
 * 支持对组织信息的增加、编辑、查看、修改操作。
 * 1. 列表仅使用树形表格视图，已删除层级卡片、导出备份与重置预置功能。
 * 2. 启用/禁用支持子级组织联动设置。
 * 3. 名称与标题统一为【组织管理】，无冗余副标题。
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  FolderTree, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CornerDownRight,
  ArrowUpDown
} from 'lucide-react';
import { 
  DepartmentNode, 
  getStoredDepartments, 
  saveStoredDepartments, 
  flattenDepartments, 
  getAllDescendantIds,
  buildTreeFromFlatList 
} from '@/src/data/departmentData';
import { 
  DhrPersonnelItem, 
  INITIAL_PERSONNEL_ITEMS 
} from '@/src/data/dhrPersonnelData';
import { TeamDetailModal } from './TeamDetailModal';
import { TeamEditModal } from './TeamEditModal';

interface TeamManagementProps {
  onNavigateToPersonnel?: (deptId: string) => void;
}

export function TeamManagement({ onNavigateToPersonnel }: TeamManagementProps = {}) {
  // 部门与组织树数据
  const [departments, setDepartments] = useState<DepartmentNode[]>(() => {
    return getStoredDepartments();
  });

  // 人员数据（用于删除防呆校验）
  const [personnelList] = useState<DhrPersonnelItem[]>(() => {
    try {
      const saved = localStorage.getItem('shipyard_personnel_list');
      return saved ? JSON.parse(saved) : INITIAL_PERSONNEL_ITEMS;
    } catch {
      return INITIAL_PERSONNEL_ITEMS;
    }
  });

  // 展开折叠的节点ID集合
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const all = flattenDepartments(departments);
    // 默认展开前两级
    return new Set(all.filter(d => (d.deptgrade || 1) <= 2).map(d => d.deptid));
  });

  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // 当前正在查看详情的节点
  const [viewingNode, setViewingNode] = useState<DepartmentNode | null>(null);

  // 编辑 / 新增模态框状态
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalMode, setEditModalMode] = useState<'create' | 'edit'>('create');
  const [editingNode, setEditingNode] = useState<DepartmentNode | null>(null);
  const [defaultParentIdForCreate, setDefaultParentIdForCreate] = useState<string>('');

  // 删除确认与防呆状态
  const [deleteTargetNode, setDeleteTargetNode] = useState<DepartmentNode | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // 扁平化列表（用于快速查找和计算）
  const flatDepartments = useMemo(() => {
    return flattenDepartments(departments);
  }, [departments]);

  // 部门ID到名称的映射字典
  const deptNameMap = useMemo(() => {
    const map = new Map<string, string>();
    flatDepartments.forEach(d => {
      map.set(d.deptid, d.deptname);
    });
    return map;
  }, [flatDepartments]);

  // 统计概览
  const overallStats = useMemo(() => {
    const totalNodes = flatDepartments.length;
    const activeNodes = flatDepartments.filter(d => d.disabled !== 1).length;
    const disabledNodes = totalNodes - activeNodes;
    const teamLevelNodes = flatDepartments.filter(d => (d.deptgrade || 1) >= 3).length;

    return { totalNodes, activeNodes, disabledNodes, teamLevelNodes };
  }, [flatDepartments]);

  // 展开/收起单个节点
  const toggleExpand = (nodeId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // 全部展开
  const handleExpandAll = () => {
    const allIds = flatDepartments.map(d => d.deptid);
    setExpandedIds(new Set(allIds));
  };

  // 全部折叠
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // 打开新增模态框
  const handleOpenCreate = (parentId?: string) => {
    setEditModalMode('create');
    setDefaultParentIdForCreate(parentId || '');
    setEditingNode(null);
    setIsEditModalOpen(true);
  };

  // 打开编辑模态框
  const handleOpenEdit = (node: DepartmentNode) => {
    setEditModalMode('edit');
    setEditingNode(node);
    setDefaultParentIdForCreate(node.parentid || '');
    setIsEditModalOpen(true);
  };

  // 关闭模态框
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNode(null);
    setDefaultParentIdForCreate('');
  };

  // 保存（新增或修改），支持启用/禁用联动子级组织
  const handleSaveNode = (nodeData: DepartmentNode) => {
    let updatedFlatList = [...flatDepartments];

    if (editModalMode === 'create') {
      // 新增
      updatedFlatList.push(nodeData);
    } else {
      // 编辑修改：如果改变了状态，联动更新所有子级组织状态
      const affectedChildIds = new Set(getAllDescendantIds(departments, nodeData.deptid, false));
      
      updatedFlatList = updatedFlatList.map(item => {
        if (item.deptid === nodeData.deptid) {
          return {
            ...item,
            ...nodeData,
            children: item.children
          };
        }
        if (affectedChildIds.has(item.deptid)) {
          return {
            ...item,
            disabled: nodeData.disabled,
            updateTime: new Date().toISOString().slice(0, 16)
          };
        }
        return item;
      });
    }

    // 重构树结构
    const newTree = buildTreeFromFlatList(updatedFlatList);
    setDepartments(newTree);
    saveStoredDepartments(newTree);
    handleCloseEditModal();

    // 自动展开其父节点
    if (nodeData.parentid) {
      setExpandedIds(prev => new Set(prev).add(nodeData.parentid));
    }
  };

  // 快捷停用/启用切换 (联动设置子级组织)
  const handleToggleStatus = (node: DepartmentNode) => {
    const nextStatus = node.disabled === 1 ? 0 : 1;
    // 获取该节点以及所有子孙节点的 ID 集合进行联动
    const affectedIds = new Set(getAllDescendantIds(departments, node.deptid, true));
    affectedIds.add(node.deptid);

    const updatedFlatList = flatDepartments.map(item => {
      if (affectedIds.has(item.deptid)) {
        return { 
          ...item, 
          disabled: nextStatus, 
          updateTime: new Date().toISOString().slice(0, 16) 
        };
      }
      return item;
    });
    const newTree = buildTreeFromFlatList(updatedFlatList);
    setDepartments(newTree);
    saveStoredDepartments(newTree);
  };

  // 请求删除组织 - 触发安全防呆校验
  const handleRequestDelete = (node: DepartmentNode) => {
    // 检查是否有下级节点
    const subIds = getAllDescendantIds(departments, node.deptid, false);
    if (subIds.length > 0) {
      setDeleteWarning(`【安全限制】该组织/机构下包含 ${subIds.length} 个下属子机构或班组。为防止架构断裂，请先删除或转移下属机构，或使用【禁用】功能。`);
      setDeleteTargetNode(node);
      return;
    }

    // 检查是否有归属人员
    const allSubIds = getAllDescendantIds(departments, node.deptid, true);
    const hasPersonnel = personnelList.some(p => 
      allSubIds.includes(p.DEPT_CODE) || p.deptname?.includes(node.deptname)
    );
    if (hasPersonnel) {
      setDeleteWarning(`【人员关联警告】当前有在册人员隶属于该组织。直接删除将导致相关人员无归属组织，建议先在【人员管理】中调整员工归属，或选择【禁用】。`);
      setDeleteTargetNode(node);
      return;
    }

    // 允许安全删除
    setDeleteWarning(null);
    setDeleteTargetNode(node);
  };

  // 确认删除
  const handleConfirmDelete = () => {
    if (!deleteTargetNode) return;

    const remainingFlat = flatDepartments.filter(d => d.deptid !== deleteTargetNode.deptid);
    const newTree = buildTreeFromFlatList(remainingFlat);
    setDepartments(newTree);
    saveStoredDepartments(newTree);
    setDeleteTargetNode(null);
    setDeleteWarning(null);
  };

  // 对树形节点按排序位 sortOrder 排序（越小越靠前）
  const sortNodes = (nodes: DepartmentNode[]): DepartmentNode[] => {
    return [...nodes].sort((a, b) => (a.sortOrder ?? 1) - (b.sortOrder ?? 1));
  };

  // 递归渲染树形行
  const renderTreeRows = (nodes: DepartmentNode[], depth = 0): React.ReactNode => {
    const sorted = sortNodes(nodes);

    return sorted.map(node => {
      const isExpanded = expandedIds.has(node.deptid);
      const hasChildren = node.children && node.children.length > 0;
      const isEnabled = node.disabled !== 1;

      // 搜索与状态匹配
      const isMatchedSearch = !searchKeyword.trim() || 
        node.deptname.toLowerCase().includes(searchKeyword.trim().toLowerCase());

      const isMatchedStatus = statusFilter === 'all' || 
        (statusFilter === 'active' ? isEnabled : !isEnabled);

      const isDirectMatch = isMatchedSearch && isMatchedStatus;

      // 所属上级机构名称
      const parentName = node.parentid ? (deptNameMap.get(node.parentid) || '上级机构') : '—';

      return (
        <React.Fragment key={node.deptid}>
          <tr className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors ${!isEnabled ? 'opacity-65 bg-slate-50/50' : ''} ${!isDirectMatch && searchKeyword ? 'bg-slate-50/30' : ''}`}>
            
            {/* 1. 组织/机构名称 (支持层级缩进与展开折叠) */}
            <td className="py-3 px-4 text-xs font-medium text-slate-800">
              <div className="flex items-center" style={{ paddingLeft: `${depth * 22}px` }}>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(node.deptid)}
                    className="w-5 h-5 rounded hover:bg-slate-200 text-slate-500 flex items-center justify-center mr-1.5 transition-colors shrink-0 cursor-pointer"
                    title={isExpanded ? '折叠' : '展开'}
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <span className="w-5 h-5 mr-1.5 inline-flex items-center justify-center text-slate-300 shrink-0">
                    <CornerDownRight className="w-3 h-3" />
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${depth === 0 ? 'bg-blue-600' : depth === 1 ? 'bg-indigo-500' : 'bg-slate-400'}`}></span>
                  <span className={`font-semibold ${depth === 0 ? 'text-slate-900 text-xs' : 'text-slate-700 text-xs'}`}>
                    {node.deptname}
                  </span>
                  {depth === 0 && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-normal">
                      顶级机构
                    </span>
                  )}
                </div>
              </div>
            </td>

            {/* 2. 所属上级机构 */}
            <td className="py-3 px-4 text-xs text-slate-600">
              <span className="truncate max-w-[200px] inline-block font-mono text-[11px]" title={parentName}>
                {parentName}
              </span>
            </td>

            {/* 3. 排序位 */}
            <td className="py-3 px-4 text-xs text-slate-600 font-mono">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                {node.sortOrder ?? 1}
              </span>
            </td>

            {/* 4. 组织状态 (支持联动设置子级) */}
            <td className="py-3 px-4 text-xs">
              <button
                type="button"
                onClick={() => handleToggleStatus(node)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                  isEnabled 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                    : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                }`}
                title="点击切换状态（联动设置子级组织）"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span>{isEnabled ? '启用' : '禁用'}</span>
              </button>
            </td>

            {/* 5. 操作 */}
            <td className="py-3 px-4 text-xs text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1.5">
                {/* 新增下级 */}
                <button
                  type="button"
                  onClick={() => handleOpenCreate(node.deptid)}
                  className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded font-medium transition-colors cursor-pointer"
                  title="在该节点下新增子组织"
                >
                  + 下级
                </button>

                {/* 查看详情 */}
                <button
                  type="button"
                  onClick={() => setViewingNode(node)}
                  className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors cursor-pointer"
                >
                  查看
                </button>

                {/* 编辑修改 */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(node)}
                  className="px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded font-medium transition-colors cursor-pointer"
                >
                  编辑
                </button>

                {/* 删除 */}
                <button
                  type="button"
                  onClick={() => handleRequestDelete(node)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="删除该组织"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>

          {/* 递归展开子级 */}
          {hasChildren && isExpanded && renderTreeRows(node.children || [], depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">组织管理</h2>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                共 {overallStats.totalNodes} 个机构节点
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenCreate('')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新增组织机构
          </button>
        </div>
      </div>

      {/* 操作工具栏与搜索过滤 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* 快捷展开/折叠按钮 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              全部展开
            </button>

            <button
              type="button"
              onClick={handleCollapseAll}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              全部折叠
            </button>
          </div>

          {/* 筛选与搜索行 */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-lg justify-end">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="搜索组织 / 机构名称..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="w-36">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">组织状态: 全部</option>
                <option value="active">启用中</option>
                <option value="disabled">已禁用</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 组织管理树形表格视图 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-[11px] font-semibold">
                <th className="py-3 px-4 min-w-[280px]">组织 / 机构名称</th>
                <th className="py-3 px-4 min-w-[180px]">所属上级机构</th>
                <th className="py-3 px-4 min-w-[120px]">排序位</th>
                <th className="py-3 px-4 min-w-[100px]">组织状态</th>
                <th className="py-3 px-4 min-w-[180px] text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    暂无组织架构数据，请点击上方按钮新建。
                  </td>
                </tr>
              ) : (
                renderTreeRows(departments)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 查看组织详情弹窗 */}
      {viewingNode && (
        <TeamDetailModal
          node={viewingNode}
          tree={departments}
          onClose={() => setViewingNode(null)}
          onEdit={(node) => {
            setViewingNode(null);
            handleOpenEdit(node);
          }}
        />
      )}

      {/* 新增 / 编辑组织弹窗 */}
      {isEditModalOpen && (
        <TeamEditModal
          mode={editModalMode}
          initialNode={editingNode}
          defaultParentId={defaultParentIdForCreate}
          tree={departments}
          onClose={handleCloseEditModal}
          onSave={handleSaveNode}
        />
      )}

      {/* 删除防呆校验提示模态框 */}
      {deleteTargetNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">
                  {deleteWarning ? '无法直接删除组织' : '确认删除组织机构？'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  目标节点: <strong className="text-slate-800 font-semibold">{deleteTargetNode.deptname}</strong>
                </p>
              </div>
            </div>

            {deleteWarning ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 leading-relaxed">
                {deleteWarning}
              </div>
            ) : (
              <div className="text-xs text-slate-600 leading-relaxed">
                该组织当前无直接下属子节点，且无关联员工档案。删除后将从组织树结构中彻底移除，是否确认执行删除？
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetNode(null);
                  setDeleteWarning(null);
                }}
                className="px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
              >
                取消
              </button>

              {deleteWarning ? (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleStatus(deleteTargetNode);
                    setDeleteTargetNode(null);
                    setDeleteWarning(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  转为【禁用】状态 (联动子级)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  确认删除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
