/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 班组树形下拉选择组件 (TeamTreeSelect)
 * 严格关联【班组管理】中的组织架构与层次结构信息 (公司 -> 部门/车间 -> 作业班组 -> 施工作业队)
 * 专为中国工业中后台系统定制，支持层级缩进、节点人员统计、关键词搜索过滤、快速清空与层级路径面包屑提示
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Building2, 
  Users, 
  Layers, 
  HardHat, 
  Check, 
  X, 
  FolderTree, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  DepartmentNode, 
  getStoredDepartments, 
  findDepartmentById, 
  getAllDescendantIds,
  flattenDepartments,
  getDepartmentFullPath,
  getGradeLabel
} from '@/src/data/departmentData';
import { DetailedPersonnel } from '@/src/data/mockPersonnel';

export interface TeamTreeSelectProps {
  value: string; // 选中的部门/班组 deptid 或 'all'
  onChange: (
    deptId: string, 
    selectedNode: DepartmentNode | null, 
    descendantIds: string[], 
    matchedNames: string[]
  ) => void;
  personnelList?: DetailedPersonnel[];
  className?: string;
  placeholder?: string;
}

export function TeamTreeSelect({
  value,
  onChange,
  personnelList = [],
  className = '',
  placeholder = '全部人员班组 (全厂架构)'
}: TeamTreeSelectProps) {
  // 部门树数据（与班组管理保持实时同步）
  const [departmentTree, setDepartmentTree] = useState<DepartmentNode[]>([]);
  // 下拉面板开闭状态
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  // 展开的节点 ID 集合
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['DEPT-001', 'DEPT-010', 'DEPT-020', 'DEPT-030', 'DEPT-040']));

  const containerRef = useRef<HTMLDivElement>(null);

  // 初始化加载与跨组件事件监听
  useEffect(() => {
    const loadDepts = () => {
      const depts = getStoredDepartments();
      setDepartmentTree(depts);
      // 默认展开所有一级和二级节点
      const defaultExpanded = new Set<string>();
      depts.forEach(root => {
        defaultExpanded.add(root.deptid);
        if (root.children) {
          root.children.forEach(c => defaultExpanded.add(c.deptid));
        }
      });
      setExpandedKeys(defaultExpanded);
    };

    loadDepts();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setDepartmentTree(e.detail);
      } else {
        loadDepts();
      }
    };

    window.addEventListener('departments_updated', handleUpdate);
    return () => {
      window.removeEventListener('departments_updated', handleUpdate);
    };
  }, []);

  // 点击外部收起下拉面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 平铺所有部门节点以供快速检索
  const flatDepartments = useMemo(() => {
    return flattenDepartments(departmentTree);
  }, [departmentTree]);

  // 当前选中的节点
  const selectedNode = useMemo(() => {
    if (!value || value === 'all') return null;
    return flatDepartments.find(d => d.deptid === value) || null;
  }, [value, flatDepartments]);

  // 当前选中节点的全路径（如：东南船厂 > 制造部 > 船体电焊一组）
  const selectedFullPath = useMemo(() => {
    if (!selectedNode) return '';
    return getDepartmentFullPath(departmentTree, selectedNode.deptid);
  }, [selectedNode, departmentTree]);

  // 统计每个节点下的人员数量（包含子孙班组人员）
  const nodePersonnelCountMap = useMemo(() => {
    const countMap = new Map<string, number>();

    flatDepartments.forEach(node => {
      const descendantIds = getAllDescendantIds(departmentTree, node.deptid, true);
      const descendantNodes = flatDepartments.filter(d => descendantIds.includes(d.deptid));
      const descendantNames = descendantNodes.map(d => d.deptname);

      // 计算在该节点或其所有子孙班组下的人员总数
      const count = personnelList.filter(p => {
        const pDept = (p.department || '').trim();
        return descendantNames.some(name => {
          return pDept === name || 
                 pDept.includes(name) || 
                 name.includes(pDept) ||
                 // 兼容常见班组别名映射
                 (name === '船体电焊一组' && pDept.includes('电焊')) ||
                 (name === '船体装配二班' && pDept.includes('装配')) ||
                 (name === '特种喷涂一组' && (pDept.includes('喷涂') || pDept.includes('涂装'))) ||
                 (name === '大合拢搭载班' && (pDept.includes('搭载') || pDept.includes('船装'))) ||
                 (name === '起重吊装组' && pDept.includes('起重')) ||
                 (name === '船坞码头安全督查巡检组' && (pDept.includes('安全') || pDept.includes('安环')));
        });
      }).length;

      countMap.set(node.deptid, count);
    });

    return countMap;
  }, [departmentTree, flatDepartments, personnelList]);

  // 切换折叠/展开
  const toggleExpand = (deptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  // 选择节点
  const handleSelectNode = (node: DepartmentNode | null) => {
    if (!node) {
      onChange('all', null, [], []);
      setIsOpen(false);
      return;
    }

    const descendantIds = getAllDescendantIds(departmentTree, node.deptid, true);
    const descendantNodes = flatDepartments.filter(d => descendantIds.includes(d.deptid));
    const matchedNames = descendantNodes.map(d => d.deptname);

    onChange(node.deptid, node, descendantIds, matchedNames);
    setIsOpen(false);
  };

  // 清除选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('all', null, [], []);
  };

  // 根据级别获得对应图标
  const getNodeIcon = (grade: number) => {
    switch (grade) {
      case 1:
        return <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 2:
        return <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      case 3:
        return <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 4:
        return <HardHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      default:
        return <FolderTree className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  // 递归渲染树节点
  const renderTreeNode = (node: DepartmentNode, level = 0): React.ReactNode => {
    const isExpanded = expandedKeys.has(node.deptid) || searchKeyword.trim() !== '';
    const isSelected = selectedNode?.deptid === node.deptid;
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const count = nodePersonnelCountMap.get(node.deptid) || 0;
    const gradeStyle = getGradeLabel(node.deptgrade);

    // 搜索过滤匹配检测
    const isMatchSelf = searchKeyword.trim() === '' || 
      node.deptname.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (node.deptcode && node.deptcode.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (node.leader && node.leader.toLowerCase().includes(searchKeyword.toLowerCase()));

    // 检查子树是否有匹配
    const hasMatchingDescendant = (n: DepartmentNode): boolean => {
      if (!n.children || n.children.length === 0) return false;
      return n.children.some(child => 
        child.deptname.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        hasMatchingDescendant(child)
      );
    };

    const isMatchAny = isMatchSelf || hasMatchingDescendant(node);
    if (!isMatchAny) return null;

    return (
      <div key={node.deptid} className="relative">
        <div 
          onClick={() => handleSelectNode(node)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2.5 rounded-lg cursor-pointer transition-all text-xs ${
            isSelected 
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs' 
              : 'text-slate-700 hover:bg-slate-100/80'
          }`}
        >
          {/* 左侧：展开折叠小箭头 + 层级图标 + 部门名称 */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.deptid, e)}
                className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded transition-colors shrink-0 cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="w-4 shrink-0 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              </div>
            )}

            {getNodeIcon(node.deptgrade)}

            <span className="truncate" title={node.deptname}>
              {node.deptname}
            </span>

            {/* 如果有负责人 */}
            {node.leader && (
              <span className="text-[10px] text-slate-400 font-normal truncate hidden sm:inline">
                ({node.leader})
              </span>
            )}
          </div>

          {/* 右侧：层级标签 + 人数徽章 + 选中勾选 */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* 层级标签简写 */}
            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
              {node.deptgrade === 1 ? '公司' : node.deptgrade === 2 ? '车间/部' : node.deptgrade === 3 ? '班组' : '队'}
            </span>

            {/* 人数徽标 */}
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-semibold ${
              count > 0 
                ? isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                : 'text-slate-300'
            }`}>
              {count}人
            </span>

            {/* 选中勾选标识 */}
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-blue-600" />
            )}
          </div>
        </div>

        {/* 子节点递归渲染 */}
        {hasChildren && isExpanded && (
          <div className="relative border-l border-slate-200/70 ml-4 pl-0">
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* 触发输入框按钮 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg border cursor-pointer transition-all shadow-2xs select-none ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white'
            : selectedNode
            ? 'bg-blue-50/50 border-blue-400 text-blue-900 font-medium'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
        title={selectedFullPath || placeholder}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
          {selectedNode ? (
            <>
              {getNodeIcon(selectedNode.deptgrade)}
              <span className="font-semibold text-blue-900 truncate">
                {selectedNode.deptname}
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded border border-blue-200/70 font-medium shrink-0">
                {selectedNode.deptgrade === 1 ? '公司' : selectedNode.deptgrade === 2 ? '部门车间' : selectedNode.deptgrade === 3 ? '班组' : '作业队'}
              </span>
            </>
          ) : (
            <>
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 truncate">{placeholder}</span>
            </>
          )}
        </div>

        {/* 右侧动作图标 */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selectedNode && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-slate-600 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
              title="清除选择，查看全部班组"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
        </div>
      </div>

      {/* 下拉展开的树形选择面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-76 sm:w-84 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* 面板顶栏：搜索框 */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索部门、车间、工段或班组..."
                className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 快捷选项：“全部人员班组” */}
          <div className="p-1.5 border-b border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectNode(null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                !selectedNode 
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderTree className="w-3.5 h-3.5 text-blue-600" />
                <span>全部人员班组 (全厂架构)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-semibold">
                  {personnelList.length}人
                </span>
                {!selectedNode && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
            </button>
          </div>

          {/* 部门层级树列表区域 */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
            {departmentTree.length > 0 ? (
              departmentTree.map(root => renderTreeNode(root, 0))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                暂无组织架构信息，可在【班组管理】中配置
              </div>
            )}
          </div>

          {/* 面板底栏：状态与关联来源说明 */}
          <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 truncate text-slate-400">
              <Info className="w-3 h-3 text-blue-500 shrink-0" />
              <span>数据实时关联【班组管理】主数据</span>
            </span>
            <span className="font-mono text-slate-400 shrink-0">
              共 {flatDepartments.length} 个层级
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
