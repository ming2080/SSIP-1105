/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理主界面
 * 包含：作业面列表检索、多维统计、新增/编辑弹窗联动、详情页联动、批量操作与导出
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Plus, 
  Layers, 
  ShieldAlert, 
  Users, 
  Cpu, 
  Radio, 
  Flame, 
  Video, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  MapPin, 
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  BarChart3,
  Tv
} from 'lucide-react';
import { 
  WorkfaceRecord, 
  getStoredWorkfaces, 
  saveStoredWorkfaces, 
  INITIAL_WORKFACES,
  SOUTHEAST_SHIPYARD_ZONES,
  WorkfaceBelongingType
} from '@/src/data/workfaceData';
import { MOCK_PROJECTS } from '@/src/data/mockProjects';
import { MODEL_LAYER_OPTIONS } from '@/src/components/views/DeviceManagement';
import { WorkfaceFormModal } from './WorkfaceFormModal';
import { WorkfaceDetailModal } from './WorkfaceDetailModal';

interface WorkfaceManagementProps {
  onNavigateToTracking?: (personId?: string) => void;
  onNavigateToMonitor?: () => void;
  onNavigateToScreen?: () => void;
}

// 归一化状态判断 (两状态模型：允许作业 / 禁止进入)
export const getNormalizedStatus = (status: string): '允许作业' | '禁止进入' => {
  if (
    status === '禁止进入' || 
    status === 'forbidden' || 
    status === 'restricted' || 
    status === '禁入中' || 
    status === 'paused' ||
    status === '封锁'
  ) {
    return '禁止进入';
  }
  return '允许作业';
};

export function WorkfaceManagement({ onNavigateToTracking, onNavigateToMonitor, onNavigateToScreen }: WorkfaceManagementProps) {
  // 数据列表
  const [workfaces, setWorkfaces] = useState<WorkfaceRecord[]>(() => getStoredWorkfaces());
  
  // 选中的作业面 (批量操作)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // 标签栏状态：作业面 vs 有限空间
  const [activeTypeTab, setActiveTypeTab] = useState<'workface' | 'confinedSpace'>('workface');

  // 检索筛选条件
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkfaceType, setFilterWorkfaceType] = useState<'ALL' | '有限空间' | '通用作业面'>('ALL');
  const [filterBelonging, setFilterBelonging] = useState<'ALL' | 'yard' | 'project'>('ALL');
  const [filterYardZone, setFilterYardZone] = useState('ALL');
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterWorkType, setFilterWorkType] = useState('ALL');
  const [filterRiskLevel, setFilterRiskLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterModelLevel, setFilterModelLevel] = useState('ALL');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 弹窗与确认删除状态
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialData, setFormInitialData] = useState<WorkfaceRecord | null>(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedForDetail, setSelectedForDetail] = useState<WorkfaceRecord | null>(null);

  // 删除确认弹窗状态
  const [deletingWorkface, setDeletingWorkface] = useState<WorkfaceRecord | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Toast 提示
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 持久化存储更新
  const updateWorkfaceList = (newList: WorkfaceRecord[]) => {
    setWorkfaces(newList);
    saveStoredWorkfaces(newList);
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterWorkfaceType('ALL');
    setFilterBelonging('ALL');
    setFilterYardZone('ALL');
    setFilterProject('ALL');
    setFilterWorkType('ALL');
    setFilterRiskLevel('ALL');
    setFilterStatus('ALL');
    setFilterModelLevel('ALL');
    setCurrentPage(1);
    showToast('筛选条件已重置');
  };

  // 过滤后的数据 (包含船厂厂区与船舶建造项目)
  const filteredWorkfaces = useMemo(() => {
    return workfaces.filter(wf => {
      // 切换标签栏二分卡片筛选
      const isConfined = wf.workfaceType === '有限空间' || wf.belongingType === 'project';
      if (activeTypeTab === 'workface' && isConfined) {
        return false;
      }
      if (activeTypeTab === 'confinedSpace' && !isConfined) {
        return false;
      }

      // 关键字搜索
      if (searchTerm.trim()) {
        const keyword = searchTerm.toLowerCase().trim();
        const matchCode = wf.code.toLowerCase().includes(keyword);
        const matchName = wf.name.toLowerCase().includes(keyword);
        const matchType = wf.workfaceType?.toLowerCase().includes(keyword);
        const matchOfficer = wf.safetyOfficer.toLowerCase().includes(keyword);
        const matchTeam = wf.teamName.toLowerCase().includes(keyword);
        const matchYardZone = wf.yardZoneName?.toLowerCase().includes(keyword);
        const matchYardSub = wf.yardSubAreaName?.toLowerCase().includes(keyword);
        const matchProject = wf.projectName?.toLowerCase().includes(keyword) || wf.shipModelName?.toLowerCase().includes(keyword);
        if (!matchCode && !matchName && !matchType && !matchOfficer && !matchTeam && !matchYardZone && !matchYardSub && !matchProject) {
          return false;
        }
      }

      // 厂区功能分区筛选
      if (filterYardZone !== 'ALL' && wf.yardZoneId !== filterYardZone) {
        return false;
      }

      // 船舶工程筛选
      if (filterProject !== 'ALL' && wf.projectId !== filterProject && wf.shipModelId !== filterProject) {
        return false;
      }

      // 船体分层筛选
      if (filterModelLevel !== 'ALL' && wf.modelLevel !== filterModelLevel && wf.shipModelLayerId !== filterModelLevel) {
        return false;
      }

      // 风险等级筛选
      if (filterRiskLevel !== 'ALL' && wf.riskLevel !== filterRiskLevel) {
        return false;
      }

      // 状态筛选
      if (filterStatus !== 'ALL') {
        const norm = getNormalizedStatus(wf.status);
        if (norm !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [workfaces, activeTypeTab, searchTerm, filterYardZone, filterProject, filterModelLevel, filterRiskLevel, filterStatus]);

  // 统计概览计算
  const stats = useMemo(() => {
    const total = workfaces.length;
    const active = workfaces.filter(w => getNormalizedStatus(w.status) === '允许作业').length;
    const highRisk = workfaces.filter(w => w.riskLevel === '重大风险(红)' || w.riskLevel === '较大风险(橙)').length;
    const totalDevices = workfaces.reduce((acc, w) => {
      return acc + (w.boundBaseStations?.length || 0) + (w.boundGasDetectors?.length || 0) + (w.boundCameras?.length || 0);
    }, 0);
    const totalWorkers = workfaces.reduce((acc, w) => acc + (w.currentPersonnelCount || 0), 0);

    return { total, active, highRisk, totalDevices, totalWorkers };
  }, [workfaces]);

  // 分页数据截取
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkfaces.slice(start, start + pageSize);
  }, [filteredWorkfaces, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredWorkfaces.length / pageSize) || 1;

  // 全选/取消全选
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedList.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 单选切换
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 状态修改 (下拉框直接触发：允许作业 / 禁止进入)
  const handleUpdateStatus = (wf: WorkfaceRecord, newStatus: '允许作业' | '禁止进入') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = workfaces.map(item => {
      if (item.id === wf.id) {
        return {
          ...item,
          status: newStatus as any,
          updatedAt: nowStr
        };
      }
      return item;
    });
    updateWorkfaceList(updated);
    showToast(`作业面【${wf.name}】状态已调整为【${newStatus}】`);
    
    if (selectedForDetail && selectedForDetail.id === wf.id) {
      setSelectedForDetail(prev => prev ? { ...prev, status: newStatus as any, updatedAt: nowStr } : null);
    }
  };

  // 单条删除触发与确认
  const handleRequestDelete = (wf: WorkfaceRecord) => {
    setDeletingWorkface(wf);
  };

  const handleConfirmDelete = () => {
    if (!deletingWorkface) return;
    const targetId = deletingWorkface.id;
    const targetName = deletingWorkface.name;
    const updated = workfaces.filter(w => w.id !== targetId);
    updateWorkfaceList(updated);
    setSelectedIds(prev => prev.filter(item => item !== targetId));
    setDeletingWorkface(null);
    showToast(`作业面【${targetName}】已成功删除`);
  };

  // 批量删除触发与确认
  const handleRequestBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBatchDeleting(true);
  };

  const handleConfirmBatchDelete = () => {
    const updated = workfaces.filter(w => !selectedIds.includes(w.id));
    updateWorkfaceList(updated);
    showToast(`已批量删除 ${selectedIds.length} 个作业面`);
    setSelectedIds([]);
    setIsBatchDeleting(false);
  };

  // 批量激活
  const handleBatchActivate = () => {
    if (selectedIds.length === 0) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = workfaces.map(w => {
      if (selectedIds.includes(w.id)) {
        return { ...w, status: 'active' as const, updatedAt: nowStr };
      }
      return w;
    });
    updateWorkfaceList(updated);
    showToast(`已批量激活 ${selectedIds.length} 个作业面`);
  };

  // 批量暂停
  const handleBatchPause = () => {
    if (selectedIds.length === 0) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updated = workfaces.map(w => {
      if (selectedIds.includes(w.id)) {
        return { ...w, status: 'paused' as const, updatedAt: nowStr };
      }
      return w;
    });
    updateWorkfaceList(updated);
    showToast(`已批量暂停 ${selectedIds.length} 个作业面`);
  };

  // 打开新增
  const handleOpenCreate = () => {
    setFormInitialData(null);
    setIsFormOpen(true);
  };

  // 打开编辑
  const handleOpenEdit = (wf: WorkfaceRecord) => {
    setFormInitialData(wf);
    setIsFormOpen(true);
  };

  // 保存表单数据 (新增或编辑)
  const handleSaveForm = (record: WorkfaceRecord) => {
    if (formInitialData) {
      // 编辑更新
      const updated = workfaces.map(w => w.id === record.id ? record : w);
      updateWorkfaceList(updated);
      showToast(`作业面【${record.name}】已更新成功`);
      if (selectedForDetail && selectedForDetail.id === record.id) {
        setSelectedForDetail(record);
      }
    } else {
      // 新增插入头部
      const updated = [record, ...workfaces];
      updateWorkfaceList(updated);
      showToast(`作业面【${record.name}】已创建成功`);
    }
    setIsFormOpen(false);
  };

  // 打开详情
  const handleOpenDetail = (wf: WorkfaceRecord) => {
    setSelectedForDetail(wf);
    setIsDetailOpen(true);
  };

  // 导出报表
  const handleExportData = () => {
    const csvHeader = '编号,作业面名称,归属类型,所属对象,具体工位楼层,工位规格标高,作业类型,风险等级,责任安全员,安全员电话,责任班组,定员上限,在场人数,状态,更新时间\n';
    const csvRows = filteredWorkfaces.map(w => {
      const typeLabel = w.belongingType === 'yard' ? '船厂厂区' : '造船项目';
      const objName = w.belongingType === 'yard' ? (w.yardZoneName || '东南造船基地') : w.projectName;
      const subPos = w.belongingType === 'yard' ? (w.yardSubAreaName || w.dockingArea) : w.modelLevelName;
      const specElev = w.belongingType === 'yard' ? (w.yardSpecs || '-') : w.elevation;
      return `"${w.code}","${w.name}","${typeLabel}","${objName}","${subPos}","${specElev}","${w.workType}","${w.riskLevel}","${w.safetyOfficer}","${w.safetyOfficerPhone}","${w.teamName}",${w.capacityLimit},${w.currentPersonnelCount},"${w.status}","${w.updatedAt}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `智慧船厂_作业面管理台账_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`已成功导出 ${filteredWorkfaces.length} 条作业面台账数据`);
  };

  // 风险徽标样式
  const getRiskBadgeCls = (level: string) => {
    switch (level) {
      case '重大风险(红)':
        return 'bg-red-50 text-red-700 border-red-200';
      case '较大风险(橙)':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '一般风险(黄)':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case '低风险(蓝)':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // 状态徽标样式 (两状态：允许作业 / 禁止进入)
  const getStatusBadgeCls = (status: string) => {
    const norm = getNormalizedStatus(status);
    if (norm === '禁止进入') {
      return { 
        label: '禁止进入', 
        cls: 'bg-rose-50 text-rose-700 border-rose-200 shadow-2xs', 
        dot: 'bg-rose-500' 
      };
    }
    return { 
      label: '允许作业', 
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs', 
      dot: 'bg-emerald-500' 
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden select-none">
      {/* Toast 消息提示 */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-800 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部分类切换标签栏 (作业面 vs 有限空间) */}
      <div className="px-5 pt-3 pb-0 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTypeTab('workface');
              setCurrentPage(1);
            }}
            className={`pb-2.5 px-4 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTypeTab === 'workface'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>作业面</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTypeTab === 'workface' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {workfaces.filter(w => w.workfaceType !== '有限空间' && w.belongingType !== 'project').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTypeTab('confinedSpace');
              setCurrentPage(1);
            }}
            className={`pb-2.5 px-4 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTypeTab === 'confinedSpace'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>有限空间</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTypeTab === 'confinedSpace' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {workfaces.filter(w => w.workfaceType === '有限空间' || w.belongingType === 'project').length}
            </span>
          </button>
        </div>
      </div>

      {/* 综合操作与筛选工具栏 */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 左侧多维筛选条件 */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 模糊搜索 */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={activeTypeTab === 'workface' ? '搜索作业面名称或编号' : '搜索有限空间名称或编号'}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* 联动筛选: 厂区功能分区 */}
            {activeTypeTab === 'workface' && (
              <select
                value={filterYardZone}
                onChange={e => {
                  setFilterYardZone(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">全部厂区功能区</option>
                {SOUTHEAST_SHIPYARD_ZONES.map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            )}

            {/* 联动筛选: 船模/工程 */}
            {activeTypeTab === 'confinedSpace' && (
              <>
                <select
                  value={filterProject}
                  onChange={e => {
                    setFilterProject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">全部关联船模</option>
                  {MOCK_PROJECTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={filterModelLevel}
                  onChange={e => {
                    setFilterModelLevel(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-amber-200 rounded-lg text-xs bg-amber-50/50 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="ALL">全部舱段分层</option>
                  {MODEL_LAYER_OPTIONS.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </>
            )}

            {/* 状态筛选 (两状态：允许作业 / 禁止进入) - 仅作业面标签展示 */}
            {activeTypeTab === 'workface' && (
              <select
                value={filterStatus}
                onChange={e => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="ALL">全部状态</option>
                <option value="允许作业">🟢 允许作业</option>
                <option value="禁止进入">🔴 禁止进入</option>
              </select>
            )}

            {/* 重置按钮 */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs transition-colors flex items-center gap-1"
              title="清空所有筛选条件"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>

          {/* 右侧主操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`px-4 py-1.5 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                activeTypeTab === 'confinedSpace' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{activeTypeTab === 'workface' ? '新增作业面' : '新增有限空间'}</span>
            </button>
          </div>
        </div>

        {/* 批量操作工具条 (选中记录时浮现) */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 bg-blue-50/90 border border-blue-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>已选中 <strong>{selectedIds.length}</strong> 项{activeTypeTab === 'workface' ? '作业面' : '有限空间'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestBatchDelete}
                className="px-2.5 py-1 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded text-xs transition-colors cursor-pointer"
              >
                批量删除
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 列表表格展示区 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 font-semibold sticky top-0 z-10 text-xs">
              <tr>
                <th className="py-2.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">
                  {activeTypeTab === 'workface' ? '作业面编号' : '有限空间编号'}
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[160px]">
                  {activeTypeTab === 'workface' ? '作业面名称' : '有限空间名称'}
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">
                  {activeTypeTab === 'workface' ? '所属厂区功能区' : '关联船模类型'}
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">
                  {activeTypeTab === 'workface' ? '具体工位 / 车间' : '舱段结构分层'}
                </th>
                {activeTypeTab === 'confinedSpace' && (
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">
                    空间容积 (m³)
                  </th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-center">类型</th>
                {activeTypeTab === 'workface' && (
                  <th className="py-2.5 px-3 whitespace-nowrap">责任安全员</th>
                )}
                {activeTypeTab === 'workface' && (
                  <th className="py-2.5 px-3 whitespace-nowrap text-center">状态</th>
                )}
                <th className="py-2.5 px-3 whitespace-nowrap text-center sticky right-0 bg-slate-50/95 shadow-[-4px_0_8px_rgba(0,0,0,0.02)] min-w-[120px]">
                  操作
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedList.length > 0 ? (
                paginatedList.map(wf => {
                  const isSelected = selectedIds.includes(wf.id);
                  const statusObj = getStatusBadgeCls(wf.status);

                  return (
                    <tr 
                      key={wf.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}
                    >
                      {/* 复选框 */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(wf.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* 编号 */}
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {wf.code}
                      </td>

                      {/* 名称 */}
                      <td className="py-2.5 px-3">
                        <button 
                          type="button"
                          onClick={() => handleOpenDetail(wf)}
                          className="font-medium text-slate-900 hover:text-blue-600 cursor-pointer transition-colors text-left truncate max-w-[200px] block"
                          title={wf.name}
                        >
                          {wf.name}
                        </button>
                      </td>

                      {/* 所属工程 / 区域 */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {wf.belongingType === 'yard' ? (
                          <span title="东南造船基地平面图功能区">
                            {wf.yardZoneName || '东南造船基地'}
                          </span>
                        ) : (
                          <span title={wf.shipModelName || wf.projectName}>
                            {wf.shipModelName || wf.projectName}
                          </span>
                        )}
                      </td>

                      {/* 具体工位 / 舱段分层 */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                        {wf.belongingType === 'yard' ? (
                          <span title={wf.yardSpecs || ''} className="font-medium text-slate-800">
                            {wf.yardSubAreaName || wf.dockingArea}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-800">
                            {wf.shipModelLayerName || wf.modelLevelName || '双层底压载舱'}
                          </span>
                        )}
                      </td>

                      {/* 容积 (仅有限空间显示) */}
                      {activeTypeTab === 'confinedSpace' && (
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-right text-emerald-700 font-medium">
                          {wf.volume ? `${wf.volume} m³` : '-'}
                        </td>
                      )}

                      {/* 作业类型 */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {wf.workfaceType === '有限空间' || wf.belongingType === 'project' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">
                            有限空间
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            作业面
                          </span>
                        )}
                      </td>

                      {/* 责任安全员 (仅作业面显示，有限空间不显示) */}
                      {activeTypeTab === 'workface' && (
                        <td 
                          className="py-2.5 px-3 whitespace-nowrap text-slate-800 font-medium"
                          title={`联系电话: ${wf.safetyOfficerPhone}`}
                        >
                          {wf.safetyOfficer || '安监责任组'}
                        </td>
                      )}

                      {/* 状态 (仅作业面显示) */}
                      {activeTypeTab === 'workface' && (
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border inline-flex items-center gap-1.5 ${statusObj.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dot}`} />
                            {statusObj.label}
                          </span>
                        </td>
                      )}

                      {/* 操作列 */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/80 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {/* 状态变更 (仅作业面标签显示) */}
                          {activeTypeTab === 'workface' && (
                            <select
                              value=""
                              onChange={e => {
                                if (e.target.value) {
                                  handleUpdateStatus(wf, e.target.value as '允许作业' | '禁止进入');
                                }
                              }}
                              className="px-2 py-0.5 rounded border border-blue-200 text-xs font-medium bg-blue-50/80 hover:bg-blue-100 text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors shadow-2xs"
                              title="点击变更状态"
                            >
                              <option value="" disabled hidden>状态变更</option>
                              <option value="允许作业" className="text-emerald-600 font-semibold bg-white">允许作业</option>
                              <option value="禁止进入" className="text-rose-600 font-semibold bg-white">禁止进入</option>
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenDetail(wf)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                          >
                            详情
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(wf)}
                            className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestDelete(wf)}
                            className="text-red-600 hover:text-red-800 font-medium transition-colors cursor-pointer"
                            title="删除"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={activeTypeTab === 'confinedSpace' ? 8 : 9} className="py-12 text-center text-slate-400 text-xs">
                    没有找到符合条件的{activeTypeTab === 'workface' ? '作业面' : '有限空间'}记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 底部规范分页栏 */}
      <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-2">
          <span>共 <strong className="text-slate-800">{filteredWorkfaces.length}</strong> 条记录</span>
          <span className="text-slate-300">|</span>
          <span>每页</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-slate-200 rounded text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value={10}>10 条</option>
            <option value={20}>20 条</option>
            <option value={50}>50 条</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-mono font-medium text-slate-800">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 新增 / 编辑弹窗 */}
      <WorkfaceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        initialData={formInitialData}
        activeType={activeTypeTab}
      />

      {/* 详情页弹窗 */}
      <WorkfaceDetailModal
        isOpen={isDetailOpen}
        workface={selectedForDetail}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(wf) => {
          setIsDetailOpen(false);
          handleOpenEdit(wf);
        }}
      />

      {/* 单条删除确认弹窗 */}
      {deletingWorkface && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">确认删除作业面？</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  您即将删除作业面 <strong className="text-slate-900 font-semibold">【{deletingWorkface.name}】</strong>（编号：<span className="font-mono text-blue-600">{deletingWorkface.code}</span>）。删除后该记录将不可恢复，并同时解除关联的感知设备映射关系。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingWorkface(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量删除确认弹窗 */}
      {isBatchDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">确认批量删除选中的作业面？</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  您即将批量删除选中的 <strong className="text-red-600 font-bold">{selectedIds.length}</strong> 项作业面记录。删除后记录将彻底清除，请确认是否继续操作。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchDeleting(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
