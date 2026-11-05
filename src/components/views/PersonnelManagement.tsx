/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 人员管理 (人员库) 功能模块
 * 业务定位：主要用于管理船厂人员业务信息管理，维护人员信息及用于收发定位标签管理为主。
 * 支持单向对接与同步 DHR 人资系统接口。
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Radio, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Battery, 
  RotateCcw, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  HardHat,
  Ship,
  Sparkles,
  Layers,
  Activity,
  FolderTree,
  History,
  X,
  UploadCloud
} from 'lucide-react';
import { 
  DhrPersonnelItem, 
  INITIAL_PERSONNEL_ITEMS, 
  DhrDepartment,
  DHR_EMPLOYMENT_TYPES,
  DHR_POST_JOBS
} from '@/src/data/dhrPersonnelData';
import { 
  getStoredDepartments, 
  getAllDescendantIds, 
  flattenDepartments,
  DepartmentNode 
} from '@/src/data/departmentData';
import { syncTagOnPersonnelIssue } from '@/src/data/tagData';
import { DhrSyncModal } from './DhrSyncModal';
import { DhrSyncLogsModal } from './DhrSyncLogsModal';
import { TagIssueModal } from './TagIssueModal';
import { PersonnelDetailModal } from './PersonnelDetailModal';
import { PersonnelImportModal } from './PersonnelImportModal';

interface PersonnelManagementProps {
  onOpenUserManagement?: (personEmpId?: string) => void;
  onNavigateToTeams?: () => void;
  targetDeptId?: string;
}

export function PersonnelManagement({ onOpenUserManagement, onNavigateToTeams, targetDeptId }: PersonnelManagementProps = {}) {
  // 部门树状态（与班组管理同步持久化）
  const [departments, setDepartments] = useState<DepartmentNode[]>(() => {
    return getStoredDepartments();
  });

  // 监听班组与组织数据变更
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setDepartments(e.detail);
      }
    };
    window.addEventListener('departments_updated', handleUpdate);
    return () => window.removeEventListener('departments_updated', handleUpdate);
  }, []);

  // 人员主数据列表
  const [personnelList, setPersonnelList] = useState<DhrPersonnelItem[]>(() => {
    try {
      const saved = localStorage.getItem('shipyard_personnel_list');
      return saved ? JSON.parse(saved) : INITIAL_PERSONNEL_ITEMS;
    } catch {
      return INITIAL_PERSONNEL_ITEMS;
    }
  });

  // 组织架构与选中的部门过滤
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => targetDeptId || 'ALL');
  const [expandedDeptIds, setExpandedDeptIds] = useState<string[]>(['DEPT-001', 'DEPT-010']);

  // 若传入了目标部门ID，自动切换并展开
  useEffect(() => {
    if (targetDeptId) {
      setSelectedDeptId(targetDeptId);
      // 展开所有上级
      const flat = flattenDepartments(departments);
      const target = flat.find(d => d.deptid === targetDeptId);
      if (target && target.parentid) {
        setExpandedDeptIds(prev => Array.from(new Set([...prev, target.parentid])));
      }
    }
  }, [targetDeptId, departments]);

  // 搜索与过滤条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterPresence, setFilterPresence] = useState<'all' | '1' | '2'>('all');
  const [filterTagStatus, setFilterTagStatus] = useState<'all' | 'bound' | 'unbound'>('all');
  const [filterYgType, setFilterYgType] = useState<string>('all');

  // 弹窗状态
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncLogsModalOpen, setIsSyncLogsModalOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2026-09-14 01:00:00');
  
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [selectedPersonForTag, setSelectedPersonForTag] = useState<DhrPersonnelItem | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailPerson, setDetailPerson] = useState<DhrPersonnelItem | null>(null);
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'create' | 'edit'>('view');

  // 批量导入人员弹窗状态
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 回收卡二次确认弹窗状态
  const [confirmUnbindPerson, setConfirmUnbindPerson] = useState<DhrPersonnelItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 持久化保存并广播
  const savePersonnelList = (newList: DhrPersonnelItem[]) => {
    setPersonnelList(newList);
    try {
      localStorage.setItem('shipyard_personnel_list', JSON.stringify(newList));
      window.dispatchEvent(new CustomEvent('personnel_updated', { detail: newList }));
    } catch {
      // ignore
    }
  };

  // 监听外部对人员库的更新（如定位标签管理端发卡/解绑/修改）
  useEffect(() => {
    const handlePersonnelUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPersonnelList(e.detail);
      } else {
        const saved = localStorage.getItem('shipyard_personnel_list');
        if (saved) {
          try {
            setPersonnelList(JSON.parse(saved));
          } catch {}
        }
      }
    };
    window.addEventListener('personnel_updated', handlePersonnelUpdated);
    return () => window.removeEventListener('personnel_updated', handlePersonnelUpdated);
  }, []);

  // 切换部门展开收起
  const toggleDeptExpand = (id: string) => {
    setExpandedDeptIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // 组织架构树递归渲染
  const renderDeptTree = (depts: DepartmentNode[], level = 0) => {
    return depts.map(dept => {
      const isExpanded = expandedDeptIds.includes(dept.deptid);
      const isSelected = selectedDeptId === dept.deptid;
      const hasChildren = dept.children && dept.children.length > 0;
      const subIds = getAllDescendantIds(departments, dept.deptid, true);
      const count = personnelList.filter(p => subIds.includes(p.DEPT_CODE) || p.deptname?.includes(dept.deptname)).length;

      return (
        <div key={dept.deptid} className="select-none">
          <div 
            onClick={() => setSelectedDeptId(dept.deptid)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
              isSelected 
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
            }`}
            style={{ paddingLeft: `${Math.max(10, level * 14 + 10)}px` }}
          >
            <div className="flex items-center gap-1.5 truncate">
              {hasChildren ? (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDeptExpand(dept.deptid);
                  }}
                  className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <span className="w-3.5 h-3.5 inline-block shrink-0"></span>
              )}
              <span className="truncate">{dept.deptname}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              isSelected ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-200/60 text-slate-500'
            }`}>
              {count}
            </span>
          </div>

          {hasChildren && isExpanded && (
            <div className="space-y-0.5">
              {renderDeptTree(dept.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // 过滤数据计算
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter(person => {
      // 部门树筛选
      if (selectedDeptId !== 'ALL') {
        const subIds = getAllDescendantIds(departments, selectedDeptId, true);
        const targetDept = flattenDepartments(departments).find(d => d.deptid === selectedDeptId);
        const matchCode = subIds.includes(person.DEPT_CODE);
        const matchName = targetDept ? person.deptname?.includes(targetDept.deptname) : false;
        if (!matchCode && !matchName) return false;
      }

      // 关键词搜索 (姓名/工号/手机号/标签卡号)
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = person.name.toLowerCase().includes(kw);
        const matchCode = (person.empcode || '').toLowerCase().includes(kw);
        const matchPhone = person.cellphone.includes(kw);
        const matchTag = (person.tagCode || '').toLowerCase().includes(kw);
        const matchGw = (person.gwName || '').toLowerCase().includes(kw);
        if (!matchName && !matchCode && !matchPhone && !matchTag && !matchGw) {
          return false;
        }
      }

      // 在场状态
      if (filterPresence !== 'all' && person.presenceStatus.toString() !== filterPresence) {
        return false;
      }

      // 标签佩戴状态
      if (filterTagStatus !== 'all' && person.tagStatus !== filterTagStatus) {
        return false;
      }

      // 用工类型
      if (filterYgType !== 'all' && person.ygtype !== filterYgType) {
        return false;
      }

      return true;
    });
  }, [personnelList, selectedDeptId, searchKeyword, filterPresence, filterTagStatus, filterYgType]);

  // 处理 DHR 单向同步完成
  const handleDhrSyncComplete = (newItems: DhrPersonnelItem[]) => {
    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
    setLastSyncTime(nowStr);

    // 增量合并
    const existingMap = new Map<string, DhrPersonnelItem>(personnelList.map(p => [p.empID, p]));
    newItems.forEach(item => {
      if (!existingMap.has(item.empID)) {
        existingMap.set(item.empID, item);
      }
    });

    const updated: DhrPersonnelItem[] = Array.from(existingMap.values());
    savePersonnelList(updated);
    showToast(`DHR 人资数据单向同步成功！已更新 ${newItems.length} 条员工增量档案至人员库`);
  };

  // 处理标签收发保存
  const handleSaveTagIssue = (empID: string, newTagCode?: string, action?: 'bind' | 'unbind') => {
    const targetPerson = personnelList.find(p => p.empID === empID);
    const oldTagCode = targetPerson?.tagCode;

    const updated = personnelList.map(p => {
      if (p.empID === empID) {
        if (action === 'unbind') {
          return {
            ...p,
            tagStatus: 'unbound' as const,
            tagCode: undefined,
            tagBattery: undefined,
            tagBindTime: undefined
          };
        } else {
          return {
            ...p,
            tagStatus: 'bound' as const,
            tagCode: newTagCode,
            tagBattery: Math.floor(85 + Math.random() * 14),
            tagBindTime: new Date().toLocaleString('zh-CN', { hour12: false })
          };
        }
      }
      return p;
    });

    savePersonnelList(updated);

    // 同步更新定位标签数据池状态
    syncTagOnPersonnelIssue(
      action === 'unbind' ? 'unbind' : (oldTagCode ? 'change' : 'bind'),
      empID,
      targetPerson?.name || '员工',
      newTagCode,
      oldTagCode
    );

    showToast(action === 'unbind' ? '已成功解绑并回收定位工牌标签' : `已成功为员工发放定位标签 【${newTagCode}】`);
  };

  // 处理新增/编辑人员保存
  const handleSavePersonnel = (personData: Partial<DhrPersonnelItem>, createAccount = false) => {
    if (detailModalMode === 'create') {
      const newEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPerson: DhrPersonnelItem = {
        empID: newEmpId,
        name: personData.name || '新员工',
        empcode: personData.empcode || `DN-${Math.floor(8000 + Math.random() * 999)}`,
        deptname: personData.deptname || '东南船厂//制造部//船体电焊一组',
        DEPT_CODE: personData.DEPT_CODE || 'DEPT-0101',
        ygtype: personData.ygtype || '17',
        ygtypeName: personData.ygtypeName || '东南员工',
        IDCard: personData.IDCard || '350123199501010018',
        gw: personData.gw || '35',
        gwName: personData.gwName || '船舶电焊工',
        entryDate: personData.entryDate || '2026-09-14',
        cellphone: personData.cellphone || '',
        sex: personData.sex || '1',
        potype: '1',
        deleted: 0,
        presenceStatus: personData.presenceStatus || 1,
        tagStatus: personData.tagStatus || 'unbound',
        tagCode: personData.tagCode,
        hasUserAccount: createAccount,
        systemUsername: createAccount ? (personData.cellphone || `user_${newEmpId}`) : undefined,
        systemUserRole: createAccount ? '普通作业员' : undefined,
        projectName: personData.projectName || '25000 DWT 多用途重吊船'
      };

      const nextList = [newPerson, ...personnelList];
      savePersonnelList(nextList);
      showToast(`已成功录入人员【${newPerson.name}】档案${createAccount ? '，并同步激活系统用户账号' : ''}`);
    } else if (detailModalMode === 'edit' && detailPerson) {
      const updated = personnelList.map(p => {
        if (p.empID === detailPerson.empID) {
          return { ...p, ...personData };
        }
        return p;
      });
      savePersonnelList(updated);
      showToast(`已更新员工【${detailPerson.name}】的业务信息`);
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      
      {/* Toast 提示 */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 主体双栏区域：左侧组织架构树 + 右侧人员列表与操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* 左侧：多层级部门与班组架构树 (3列宽) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col min-h-[580px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>组织架构 / 班组层级</span>
            </div>
            <div className="flex items-center gap-1">
              {onNavigateToTeams && (
                <button
                  onClick={onNavigateToTeams}
                  className="text-[10px] px-1.5 py-0.5 rounded text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-0.5"
                  title="前往班组管理维护架构"
                >
                  <FolderTree className="w-3 h-3" />
                  <span>维护</span>
                </button>
              )}
              <button 
                onClick={() => setSelectedDeptId('ALL')}
                className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  selectedDeptId === 'ALL' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                全部 ({personnelList.length})
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mb-2 px-1 flex items-center justify-between">
            <span>公司 &gt; 部门 &gt; 作业班组</span>
            <span className="font-mono">B01表对应</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
            {renderDeptTree(departments)}
          </div>


        </div>

        {/* 右侧：人员库管理与定位标签操作核心区 (9列宽) */}
        <div className="lg:col-span-9 bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col space-y-3">
          
          {/* 顶部工具栏：筛选、搜索、DHR同步与新建 */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
            
            {/* 复合搜索与快速筛选 */}
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  placeholder="搜索姓名 / 工号 / 标签号 / 工种..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50/50"
                />
              </div>

              {/* 在线状态筛选 */}
              <select 
                value={filterPresence}
                onChange={e => setFilterPresence(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">在线状态: 全部</option>
                <option value="1">在线 (绿点)</option>
                <option value="2">离线 (灰点)</option>
              </select>

              {/* 标签佩戴状态筛选 */}
              <select 
                value={filterTagStatus}
                onChange={e => setFilterTagStatus(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">定位标签: 全部</option>
                <option value="bound">已佩戴定位标签</option>
                <option value="unbound">未绑定 / 待发卡</option>
              </select>

              {/* 用工类型 */}
              <select 
                value={filterYgType}
                onChange={e => setFilterYgType(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:border-blue-500 hidden sm:block"
              >
                <option value="all">用工类型: 全部</option>
                <option value="17">东南员工</option>
                <option value="10">马船员工</option>
                <option value="13">劳务员工</option>
                <option value="22">东南派遣</option>
                <option value="12">外协员工 (利亚)</option>
              </select>
            </div>

            {/* 核心操作按钮组 */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* DHR 同步日志记录按钮 */}
              <button
                type="button"
                onClick={() => setIsSyncLogsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="查看 DHR 人力资源系统单向同步流水与增量数据明细"
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>同步日志</span>
              </button>

              {/* DHR单向同步按钮 */}
              <button 
                onClick={() => setIsSyncModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                title="与企业 DHR 人力资源系统单向拉取增量人员与班组信息"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-180 transition-transform duration-500" />
                <span>同步 DHR 数据</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {/* 人员批量导入 */}
              <button 
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="批量导入船厂人员档案、班组归属并支持联动绑定定位标签"
              >
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>批量导入</span>
              </button>

              {/* 新建人员档案 */}
              <button 
                onClick={() => {
                  setDetailPerson(null);
                  setDetailModalMode('create');
                  setIsDetailModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建人员档案</span>
              </button>
            </div>
          </div>

          {/* 人员列表表格 */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-y border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">人员姓名</th>
                  <th className="py-2.5 px-3 font-semibold">工号</th>
                  <th className="py-2.5 px-3 font-semibold">部门和班组</th>
                  <th className="py-2.5 px-3 font-semibold">工种</th>
                  <th className="py-2.5 px-3 font-semibold">用工类型</th>
                  <th className="py-2.5 px-3 font-semibold">在线状态</th>
                  <th className="py-2.5 px-3 font-semibold">定位标签编号</th>
                  <th className="py-2.5 px-3 font-semibold text-right">业务操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPersonnel.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p>未检索到匹配的船厂人员档案信息</p>
                    </td>
                  </tr>
                ) : (
                  filteredPersonnel.map((person) => (
                    <tr key={person.empID} className="hover:bg-blue-50/30 transition-colors group">
                      
                      {/* 人员姓名 (一维显示) */}
                      <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                        {person.name}
                      </td>

                      {/* 工号 (独立列) */}
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {person.empcode || person.empID}
                      </td>

                      {/* 部门和班组 (不显示班组编号) */}
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="truncate max-w-[220px] inline-block" title={person.deptname}>
                          {person.deptname.split('//').slice(-2).join(' / ')}
                        </span>
                      </td>

                      {/* 工种 (独立列) */}
                      <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                        {person.gwName || '普通工人'}
                      </td>

                      {/* 用工类型 (独立列) */}
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {person.ygtypeName || '东南员工'}
                      </td>

                      {/* 在线状态 */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {person.presenceStatus === 1 ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>在线</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>离线</span>
                          </span>
                        )}
                      </td>

                      {/* 定位标签管理 (只显示标签编号，不显示电量) */}
                      <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {person.tagCode && person.tagStatus === 'bound' ? (
                          <span className="font-semibold text-blue-700">{person.tagCode}</span>
                        ) : (
                          <span className="text-slate-300 select-none">—</span>
                        )}
                      </td>

                      {/* 业务操作 (支持发卡和回收功能，已删除换卡功能) */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5 text-xs">
                          {person.tagCode && person.tagStatus === 'bound' ? (
                            <button 
                              type="button"
                              onClick={() => setConfirmUnbindPerson(person)}
                              className="text-rose-600 hover:text-rose-800 font-medium transition-colors cursor-pointer"
                              title="回收解绑定位工牌标签"
                            >
                              回收
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedPersonForTag(person);
                                setIsTagModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer"
                              title="为该员工发放定位标签"
                            >
                              发卡
                            </button>
                          )}

                          <button 
                            type="button"
                            onClick={() => {
                              setDetailPerson(person);
                              setDetailModalMode('view');
                              setIsDetailModalOpen(true);
                            }}
                            className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            详情
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              setDetailPerson(person);
                              setDetailModalMode('edit');
                              setIsDetailModalOpen(true);
                            }}
                            className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            编辑
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 表格底部信息 */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <div>
              显示当前检索结果 <strong className="text-slate-700 font-mono">{filteredPersonnel.length}</strong> 条记录（底账共 {personnelList.length} 人）
            </div>
            <div className="flex items-center gap-3">
              <span>单向同步接口：DHR OpenAPI V2</span>
              <span>上次同步：{lastSyncTime}</span>
            </div>
          </div>

        </div>

      </div>

      {/* DHR 单向同步弹窗 */}
      <DhrSyncModal 
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={handleDhrSyncComplete}
        lastSyncTime={lastSyncTime}
        onOpenSyncLogs={() => setIsSyncLogsModalOpen(true)}
      />

      {/* DHR 数据同步日志弹窗 */}
      <DhrSyncLogsModal
        isOpen={isSyncLogsModalOpen}
        onClose={() => setIsSyncLogsModalOpen(false)}
        onTriggerManualSync={() => setIsSyncModalOpen(true)}
      />

      {/* 收发定位标签弹窗 */}
      <TagIssueModal 
        isOpen={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setSelectedPersonForTag(null);
        }}
        person={selectedPersonForTag}
        onSave={handleSaveTagIssue}
      />

      {/* 人员详细档案与新建编辑弹窗 */}
      <PersonnelDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailPerson(null);
        }}
        person={detailPerson}
        mode={detailModalMode}
        onSave={handleSavePersonnel}
      />

      {/* 回收定位标签二次确认弹窗 */}
      {confirmUnbindPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col text-slate-800">
            {/* 头部 */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">回收定位标签确认</h3>
                  <p className="text-[11px] text-slate-500">人员工牌标签解绑操作</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmUnbindPerson(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">目标员工：</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {confirmUnbindPerson.name} 
                    <span className="font-normal font-mono text-xs text-slate-500 ml-1">({confirmUnbindPerson.empcode || confirmUnbindPerson.empID})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">所属部门：</span>
                  <span className="text-slate-700 truncate max-w-[200px]" title={confirmUnbindPerson.deptname}>
                    {confirmUnbindPerson.deptname}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
                  <span className="text-rose-700 font-medium">当前绑定标签：</span>
                  <span className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300">
                    {confirmUnbindPerson.tagCode}
                  </span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-xs">
                确定要回收该员工当前佩戴的定位标签吗？回收后该标签将与人员解除绑定，恢复为<strong className="text-rose-600 font-semibold">“未使用”</strong>空闲状态，可重新发放给其他人员。
              </p>
            </div>

            {/* 底部操作 */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmUnbindPerson(null)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmUnbindPerson;
                  setConfirmUnbindPerson(null);
                  handleSaveTagIssue(target.empID, undefined, 'unbind');
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs cursor-pointer"
              >
                确认回收
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 人员档案批量导入弹窗 */}
      <PersonnelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingPersonnel={personnelList}
        onImportSuccess={(created, updated) => {
          showToast(`人员批量导入完成：新录入 ${created} 人，更新 ${updated} 人档案`);
        }}
      />

    </div>
  );
}
