/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 定位标签管理功能模块
 * 业务定位：船厂 UWB / RFID 物理定位工牌与芯片资产主数据管理，
 * 严格按照附图字段属性设计：[复选框]、序号、标签编码、标签状态、人员名称、电量、设备状态、最后更新时间、操作。
 * 支持增、删、改、查，并与【人员管理】中的定位标签收发与绑定信息全链路实时关联。
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Download, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Battery,
  UserCheck,
  UserX,
  ExternalLink,
  Eye,
  UploadCloud
} from 'lucide-react';
import { 
  LocationTagItem, 
  getStoredTags, 
  saveStoredTags, 
  syncPersonnelOnTagChange,
  INITIAL_TAG_ITEMS,
  BatteryLevel
} from '@/src/data/tagData';
import { 
  DhrPersonnelItem, 
  INITIAL_PERSONNEL_ITEMS 
} from '@/src/data/dhrPersonnelData';
import { TagEditModal } from './TagEditModal';
import { TagDetailModal } from './TagDetailModal';
import { TagBindModal } from './TagBindModal';
import { TagBatchImportModal } from './TagBatchImportModal';

interface TagManagementProps {
  onNavigateToPersonnel?: (empId?: string) => void;
}

export function TagManagement({ onNavigateToPersonnel }: TagManagementProps = {}) {
  // 标签数据状态
  const [tags, setTags] = useState<LocationTagItem[]>(() => getStoredTags());

  // 人员数据（用于关联显示与人员选择）
  const [personnelList, setPersonnelList] = useState<DhrPersonnelItem[]>(() => {
    try {
      const saved = localStorage.getItem('shipyard_personnel_list');
      return saved ? JSON.parse(saved) : INITIAL_PERSONNEL_ITEMS;
    } catch {
      return INITIAL_PERSONNEL_ITEMS;
    }
  });

  // 查询过滤条件
  const [searchCode, setSearchCode] = useState<string>('');
  const [searchPerson, setSearchPerson] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [batteryFilter, setBatteryFilter] = useState<'all' | 'normal' | 'low' | 'none'>('all');

  // 多选选中的标签 ID 集合
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 弹窗状态
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalMode, setEditModalMode] = useState<'create' | 'edit'>('create');
  const [currentEditingTag, setCurrentEditingTag] = useState<LocationTagItem | null>(null);

  // 查看详情弹窗状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailTag, setDetailTag] = useState<LocationTagItem | null>(null);

  // 删除提示弹窗
  const [deleteTarget, setDeleteTarget] = useState<LocationTagItem | null>(null);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState<boolean>(false);

  // 解绑确认弹窗
  const [unbindTarget, setUnbindTarget] = useState<LocationTagItem | null>(null);
  const [isBatchUnbindModalOpen, setIsBatchUnbindModalOpen] = useState<boolean>(false);

  // 绑定人员弹窗
  const [bindTargetTag, setBindTargetTag] = useState<LocationTagItem | null>(null);

  // 恢复出厂测试数据确认弹窗
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false);

  // 批量导入标签弹窗
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState<boolean>(false);

  // 消息提示 Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 监听全局标签与人员更新事件
  useEffect(() => {
    const handleTagsUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTags(e.detail);
      } else {
        setTags(getStoredTags());
      }
    };

    const handlePersonnelUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setPersonnelList(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('shipyard_personnel_list');
          if (saved) setPersonnelList(JSON.parse(saved));
        } catch {}
      }
    };

    window.addEventListener('tags_updated', handleTagsUpdate);
    window.addEventListener('personnel_updated', handlePersonnelUpdate);
    return () => {
      window.removeEventListener('tags_updated', handleTagsUpdate);
      window.removeEventListener('personnel_updated', handlePersonnelUpdate);
    };
  }, []);

  // 综合过滤与搜索计算
  const filteredTags = useMemo(() => {
    return tags.filter(item => {
      // 1. 标签编码
      if (searchCode.trim()) {
        const matchCode = item.tagCode.toLowerCase().includes(searchCode.trim().toLowerCase());
        if (!matchCode) return false;
      }

      // 2. 人员名称
      if (searchPerson.trim()) {
        const pName = item.personName || '';
        const matchPerson = pName.toLowerCase().includes(searchPerson.trim().toLowerCase());
        if (!matchPerson) return false;
      }

      // 3. 标签状态
      if (statusFilter !== 'all') {
        if (item.tagStatus !== statusFilter) return false;
      }

      // 4. 设备状态
      if (deviceFilter !== 'all') {
        if (item.deviceStatus !== deviceFilter) return false;
      }

      // 5. 电量情况过滤 (只有正常电量、低电量两种上报状态，或未上报)
      if (batteryFilter !== 'all') {
        if (batteryFilter === 'none') {
          if (item.batteryLevel !== null && item.batteryLevel !== undefined) return false;
        } else if (item.batteryLevel !== batteryFilter) {
          return false;
        }
      }

      return true;
    });
  }, [tags, searchCode, searchPerson, statusFilter, deviceFilter, batteryFilter]);

  // 统计概览指标
  const statistics = useMemo(() => {
    const total = tags.length;
    const usedCount = tags.filter(t => t.tagStatus === 'used').length;
    const unusedCount = tags.filter(t => t.tagStatus === 'unused').length;
    const onlineCount = tags.filter(t => t.deviceStatus === 'online').length;
    const lowBatteryCount = tags.filter(t => t.batteryLevel === 'low').length;
    return { total, usedCount, unusedCount, onlineCount, lowBatteryCount };
  }, [tags]);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTags.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 单行选择切换
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = filteredTags.length > 0 && selectedIds.size === filteredTags.length;

  // 重置筛选
  const handleResetFilters = () => {
    setSearchCode('');
    setSearchPerson('');
    setStatusFilter('all');
    setDeviceFilter('all');
    setBatteryFilter('all');
  };

  // 打开查看详情弹窗
  const handleOpenDetail = (tag: LocationTagItem) => {
    setDetailTag(tag);
    setIsDetailModalOpen(true);
  };

  // 打开新增标签弹窗
  const handleOpenCreate = () => {
    setEditModalMode('create');
    setCurrentEditingTag(null);
    setIsEditModalOpen(true);
  };

  // 打开编辑标签弹窗
  const handleOpenEdit = (tag: LocationTagItem) => {
    setEditModalMode('edit');
    setCurrentEditingTag(tag);
    setIsEditModalOpen(true);
  };

  // 保存新增或修改
  const handleSaveTag = (tagData: LocationTagItem, bindEmpId?: string) => {
    let updatedTags: LocationTagItem[] = [];
    const isEditing = editModalMode === 'edit';

    if (isEditing && currentEditingTag) {
      const oldCode = currentEditingTag.tagCode;
      const oldEmpId = currentEditingTag.empId;

      updatedTags = tags.map(t => (t.id === tagData.id ? tagData : t));

      // 若编码变更，同步人员库
      if (oldCode !== tagData.tagCode) {
        syncPersonnelOnTagChange(oldCode, 'code_changed', undefined, tagData.tagCode);
      }

      // 若解绑或换绑
      if (tagData.tagStatus === 'unused' && oldEmpId) {
        syncPersonnelOnTagChange(tagData.tagCode, 'unbind');
      } else if (tagData.tagStatus === 'used' && bindEmpId && bindEmpId !== oldEmpId) {
        syncPersonnelOnTagChange(tagData.tagCode, 'bind', bindEmpId);
      }

      showToast(`定位标签【${tagData.tagCode}】修改已保存！`);
    } else {
      // 检查标签编码是否已存在
      const isExist = tags.some(t => t.tagCode.toLowerCase() === tagData.tagCode.toLowerCase());
      if (isExist) {
        showToast(`系统已存在编码为【${tagData.tagCode}】的定位标签，请勿重复添加！`);
        return;
      }
      updatedTags = [tagData, ...tags];

      if (tagData.tagStatus === 'used' && bindEmpId) {
        syncPersonnelOnTagChange(tagData.tagCode, 'bind', bindEmpId);
      }
      showToast(`定位标签【${tagData.tagCode}】新增成功！`);
    }

    setTags(updatedTags);
    saveStoredTags(updatedTags);
    setIsEditModalOpen(false);
    setCurrentEditingTag(null);
  };

  // 单个删除标签
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    // 若已绑定人员，先解除人员绑定
    if (deleteTarget.tagStatus === 'used') {
      syncPersonnelOnTagChange(deleteTarget.tagCode, 'unbind');
    }

    const updatedTags = tags.filter(t => t.id !== deleteTarget.id);
    setTags(updatedTags);
    saveStoredTags(updatedTags);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(deleteTarget.id);
      return next;
    });

    showToast(`定位标签【${deleteTarget.tagCode}】已删除`);
    setDeleteTarget(null);
  };

  // 批量删除
  const handleConfirmBatchDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    const tagsToDelete = tags.filter(t => idsToDelete.includes(t.id));

    // 释放已绑人员
    tagsToDelete.forEach(t => {
      if (t.tagStatus === 'used') {
        syncPersonnelOnTagChange(t.tagCode, 'unbind');
      }
    });

    const updatedTags = tags.filter(t => !selectedIds.has(t.id));
    setTags(updatedTags);
    saveStoredTags(updatedTags);
    setSelectedIds(new Set());
    setIsBatchDeleteModalOpen(false);
    showToast(`已成功批量删除 ${idsToDelete.length} 个定位标签`);
  };

  // 单个确认绑定至人员
  const handleConfirmBind = (tag: LocationTagItem, selectedPerson: DhrPersonnelItem) => {
    // 1. 同步人员库档案
    syncPersonnelOnTagChange(tag.tagCode, 'bind', selectedPerson.empID);

    // 2. 更新本地标签池
    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
    const updatedTags = tags.map(t => {
      if (t.id === tag.id) {
        return {
          ...t,
          tagStatus: 'used' as const,
          empId: selectedPerson.empID,
          personName: selectedPerson.name,
          deptName: selectedPerson.deptname,
          lastUpdateTime: nowStr,
          deviceStatus: 'online' as const
        };
      }
      return t;
    });

    setTags(updatedTags);
    saveStoredTags(updatedTags);
    showToast(`已成功将定位标签【${tag.tagCode}】绑定至员工【${selectedPerson.name}】（${selectedPerson.empcode}）`);
    setBindTargetTag(null);
  };

  // 单个确认解绑并回收为未使用
  const handleConfirmUnbind = () => {
    if (!unbindTarget) return;

    // 1. 同步人员库档案，解除绑定
    syncPersonnelOnTagChange(unbindTarget.tagCode, 'unbind', unbindTarget.empId);

    // 2. 更新本地标签池
    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });
    const updatedTags = tags.map(t => {
      if (t.id === unbindTarget.id) {
        return {
          ...t,
          tagStatus: 'unused' as const,
          empId: undefined,
          personName: '-',
          deptName: undefined,
          lastUpdateTime: nowStr,
          deviceStatus: 'offline' as const
        };
      }
      return t;
    });

    setTags(updatedTags);
    saveStoredTags(updatedTags);
    showToast(`已成功解除标签【${unbindTarget.tagCode}】的人员绑定，状态已回收为【未使用】`);
    setUnbindTarget(null);
  };

  // 批量确认解绑
  const handleConfirmBatchUnbind = () => {
    const idsToUnbind = Array.from(selectedIds);
    const tagsToUnbind = tags.filter(t => idsToUnbind.includes(t.id) && t.tagStatus === 'used');

    if (tagsToUnbind.length === 0) {
      setIsBatchUnbindModalOpen(false);
      return;
    }

    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });

    // 同步人员库
    tagsToUnbind.forEach(t => {
      syncPersonnelOnTagChange(t.tagCode, 'unbind', t.empId);
    });

    const unbindIdSet = new Set(tagsToUnbind.map(t => t.id));
    const updatedTags = tags.map(t => {
      if (unbindIdSet.has(t.id)) {
        return {
          ...t,
          tagStatus: 'unused' as const,
          empId: undefined,
          personName: '-',
          deptName: undefined,
          lastUpdateTime: nowStr,
          deviceStatus: 'offline' as const
        };
      }
      return t;
    });

    setTags(updatedTags);
    saveStoredTags(updatedTags);
    setIsBatchUnbindModalOpen(false);
    showToast(`已成功批量解绑 ${tagsToUnbind.length} 个定位标签，全部回收为【未使用】`);
  };

  // 快捷触发解绑：直接打开解绑确认对话框
  const handleQuickUnbind = (tag: LocationTagItem) => {
    setUnbindTarget(tag);
  };

  // 导出标签数据为 CSV
  const handleExportCSV = () => {
    const headers = ['序号', '标签编码', '标签状态', '人员名称', '电量', '设备状态', '最后更新时间', '备注'];
    const rows = filteredTags.map((item, index) => [
      index + 1,
      item.tagCode,
      item.tagStatus === 'used' ? '已使用' : '未使用',
      item.personName || '-',
      item.batteryLevel === 'low' ? '低电量' : item.batteryLevel === 'normal' ? '正常电量' : '-',
      item.deviceStatus === 'online' ? '在线' : '离线',
      item.lastUpdateTime || '-',
      item.remark || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `船厂定位标签列表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('定位标签数据导出成功！');
  };

  // 重置为出厂预置
  const handleConfirmResetDefault = () => {
    setTags(INITIAL_TAG_ITEMS);
    saveStoredTags(INITIAL_TAG_ITEMS);
    setSelectedIds(new Set());
    setIsResetConfirmModalOpen(false);
    showToast('定位标签库已重置为系统预置状态');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">定位标签管理</h2>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                总标签数: {statistics.total}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              船厂 UWB / RFID 物理定位工牌卡资产台账与收发绑定管理
            </p>
          </div>
        </div>

        {/* 顶部操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="导出当前筛选结果为 CSV"
          >
            <Download className="w-3.5 h-3.5" />
            导出数据
          </button>

          <button
            type="button"
            onClick={() => setIsBatchImportModalOpen(true)}
            className="px-3 py-2 border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="批量导入定位标签资产台账及自动绑定人员"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            批量导入标签
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            新增标签
          </button>
        </div>
      </div>

      {/* 状态统计小卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-400 text-xs font-medium">总标签总数</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{statistics.total}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-blue-600 text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span> 已使用 (已绑定人员)
          </span>
          <div className="text-xl font-bold font-mono text-blue-600 mt-1">{statistics.usedCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-rose-600 text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span> 未使用 (库存空闲)
          </span>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">{statistics.unusedCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 设备在线
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{statistics.onlineCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-rose-600 text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> 低电量告警
          </span>
          <div className={`text-xl font-bold font-mono mt-1 ${
            statistics.lowBatteryCount > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-700'
          }`}>
            {statistics.lowBatteryCount}
          </div>
        </div>
      </div>

      {/* 查询搜索与过滤控制台 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* 标签编码 */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">标签编码</label>
            <div className="relative">
              <input
                type="text"
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                placeholder="搜索编码，如 2、FF260805"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 人员名称 */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">人员名称</label>
            <input
              type="text"
              value={searchPerson}
              onChange={e => setSearchPerson(e.target.value)}
              placeholder="搜索持卡员工姓名"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 标签状态 */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">标签状态</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="used">已使用 (蓝字)</option>
              <option value="unused">未使用 (红字)</option>
            </select>
          </div>

          {/* 设备状态 */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">设备状态</label>
            <select
              value={deviceFilter}
              onChange={e => setDeviceFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部设备状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
            </select>
          </div>

          {/* 电量情况 (只有正常电量、低电量两种上报状态，或未上报) */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">电量情况</label>
            <select
              value={batteryFilter}
              onChange={e => setBatteryFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部电量情况</option>
              <option value="normal">正常电量</option>
              <option value="low">低电量 (红色告警)</option>
              <option value="none">未上报 (-)</option>
            </select>
          </div>
        </div>

        {/* 底部操作与按钮栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              重置筛选
            </button>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-1.5">
                {tags.filter(t => selectedIds.has(t.id) && t.tagStatus === 'used').length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsBatchUnbindModalOpen(true)}
                    className="px-2.5 py-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    批量解绑 ({tags.filter(t => selectedIds.has(t.id) && t.tagStatus === 'used').length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsBatchDeleteModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  批量删除 ({selectedIds.size})
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsResetConfirmModalOpen(true)}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              恢复预置测试数据
            </button>
            <span className="text-xs text-slate-500">
              共查出 <strong className="text-slate-800 font-bold">{filteredTags.length}</strong> 条记录
            </span>
          </div>
        </div>
      </div>

      {/* 核心数据表格 —— 严格按照附图属性设计 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-[11px] font-semibold">
                {/* 1. 复选框 */}
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>

                {/* 2. 序号 */}
                <th className="py-3 px-4 w-16 text-center">序号</th>

                {/* 3. 标签编码 */}
                <th className="py-3 px-4 min-w-[140px]">标签编码</th>

                {/* 4. 标签状态 */}
                <th className="py-3 px-4 min-w-[110px]">标签状态</th>

                {/* 5. 人员名称 */}
                <th className="py-3 px-4 min-w-[130px]">人员名称</th>

                {/* 6. 电量 */}
                <th className="py-3 px-4 min-w-[90px]">电量</th>

                {/* 7. 设备状态 */}
                <th className="py-3 px-4 min-w-[100px]">设备状态</th>

                {/* 8. 最后更新时间 */}
                <th className="py-3 px-4 min-w-[160px]">最后更新时间</th>

                {/* 9. 操作 */}
                <th className="py-3 px-4 min-w-[140px] text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    没有找到匹配的定位标签记录，请尝试调整搜索条件或点击“新增标签”。
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag, index) => {
                  const isSelected = selectedIds.has(tag.id);
                  const isUsed = tag.tagStatus === 'used';

                  return (
                    <tr
                      key={tag.id}
                      className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${
                        isSelected ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {/* 1. 复选框 */}
                      <td className="py-3 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tag.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* 2. 序号 */}
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {index + 1}
                      </td>

                      {/* 3. 标签编码 (附图如 2, FF260805) */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {tag.tagCode}
                      </td>

                      {/* 4. 标签状态 (核心要求：未使用为红字，已使用为蓝字) */}
                      <td className="py-3 px-4">
                        {isUsed ? (
                          <span className="text-blue-600 font-medium">
                            已使用
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium">
                            未使用
                          </span>
                        )}
                      </td>

                      {/* 5. 人员名称 (附图如 - 或 FF260805) */}
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {isUsed && tag.personName && tag.personName !== '-' ? (
                          <div className="flex items-center gap-1.5">
                            <span>{tag.personName}</span>
                            {tag.deptName && (
                              <span className="text-[10px] text-slate-400 max-w-[100px] truncate" title={tag.deptName}>
                                ({tag.deptName.split('//').pop()})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* 6. 电量 (设备离线时显示为未知状态；在线时显示正常电量与低电量) */}
                      <td className="py-3 px-4">
                        {tag.deviceStatus === 'offline' ? (
                          <span className="text-slate-400 font-medium">
                            未知
                          </span>
                        ) : tag.batteryLevel === 'low' ? (
                          <span className="text-rose-600 font-bold">
                            低电量
                          </span>
                        ) : tag.batteryLevel === 'normal' ? (
                          <span className="text-slate-700 font-medium">
                            正常电量
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* 7. 设备状态 (附图如 离线) */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className={`inline-flex items-center gap-1 ${
                          tag.deviceStatus === 'online' ? 'text-emerald-600 font-medium' : 'text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tag.deviceStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}></span>
                          {tag.deviceStatus === 'online' ? '在线' : '离线'}
                        </span>
                      </td>

                      {/* 8. 最后更新时间 (附图如 2026-09-15 11:12:34) */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {tag.lastUpdateTime ? tag.lastUpdateTime : '-'}
                      </td>

                      {/* 9. 操作 (查看详情、绑定/解绑、删除) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5 text-xs">
                          {/* 查看详情（查看设备在线状态与电量上报详情） */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(tag)}
                            className="text-slate-600 hover:text-blue-600 font-medium cursor-pointer"
                            title="查看标签详情与在线/电量上报状态"
                          >
                            查看
                          </button>

                          {/* 业务联动快捷操作：绑定与解绑 */}
                          {isUsed ? (
                            <button
                              type="button"
                              onClick={() => setUnbindTarget(tag)}
                              className="text-amber-600 hover:text-amber-800 font-semibold hover:underline cursor-pointer"
                              title="解除与员工的绑定并回收为未使用"
                            >
                              解绑
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBindTargetTag(tag)}
                              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                              title="将该定位标签分配并绑定至人员"
                            >
                              绑定
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(tag)}
                            className="text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                            title="删除该标签"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 标签详情只读查看模态框 */}
      {isDetailModalOpen && (
        <TagDetailModal
          isOpen={isDetailModalOpen}
          tag={detailTag}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailTag(null);
          }}
        />
      )}

      {/* 绑定人员模态框 */}
      {bindTargetTag && (
        <TagBindModal
          isOpen={!!bindTargetTag}
          tag={bindTargetTag}
          personnelList={personnelList}
          onClose={() => setBindTargetTag(null)}
          onConfirmBind={handleConfirmBind}
        />
      )}

      {/* 新增 / 编辑标签模态框 */}
      {isEditModalOpen && (
        <TagEditModal
          isOpen={isEditModalOpen}
          mode={editModalMode}
          initialTag={currentEditingTag}
          personnelList={personnelList}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentEditingTag(null);
          }}
          onSave={handleSaveTag}
        />
      )}

      {/* 单项删除确认弹窗 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">确认删除该定位标签？</h3>
                <p className="text-xs text-slate-500 mt-1">
                  标签编码: <strong className="text-slate-800 font-mono">{deleteTarget.tagCode}</strong>
                </p>
              </div>
            </div>

            {deleteTarget.tagStatus === 'used' ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 leading-relaxed">
                该标签当前已分配给人员【{deleteTarget.personName}】。确认删除后，系统将自动解除该人员与此标签的绑定关系。
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                该标签为未使用状态，删除后将彻底从系统标签库存中注销。
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量删除确认弹窗 */}
      {isBatchDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">批量删除定位标签</h3>
                <p className="text-xs text-slate-500 mt-1">
                  已勾选 <strong className="text-rose-600 font-bold font-mono">{selectedIds.size}</strong> 个定位标签
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              确定要批量删除选中的定位标签吗？若包含已绑定人员的标签，系统将自动解绑并恢复其工牌状态。
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-3.5 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                确认批量删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 解绑确认弹窗 */}
      {unbindTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">确认解除标签人员绑定？</h3>
                <p className="text-xs text-slate-500 mt-1">
                  标签编码: <strong className="text-blue-600 font-mono font-bold">{unbindTarget.tagCode}</strong>
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs space-y-1.5 text-amber-900">
              <div className="flex items-center justify-between">
                <span className="text-amber-700">当前持卡人员:</span>
                <span className="font-bold text-slate-800">{unbindTarget.personName}</span>
              </div>
              {unbindTarget.deptName && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-700">所属部门班组:</span>
                  <span className="text-slate-600">{unbindTarget.deptName}</span>
                </div>
              )}
              <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60 leading-relaxed">
                解除绑定后，该定位标签将恢复为<strong className="text-emerald-700 font-semibold">【未使用】</strong>状态，可重新发放给其他施工人员；人员档案中的工牌状态将同步变更为【未发卡】。
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnbindTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmUnbind}
                className="px-3.5 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-700 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
              >
                确认解除绑定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量解绑确认弹窗 */}
      {isBatchUnbindModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">批量解除人员绑定</h3>
                <p className="text-xs text-slate-500 mt-1">
                  将解绑 <strong className="text-amber-600 font-bold font-mono">
                    {tags.filter(t => selectedIds.has(t.id) && t.tagStatus === 'used').length}
                  </strong> 个已占用的定位标签
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              确定要批量解绑选中的定位标签吗？解绑后这些标签将全部恢复为【未使用】空闲状态，对应施工人员的档案也将同步更新为【未发卡】。
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchUnbindModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchUnbind}
                className="px-3.5 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                确认批量解绑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 恢复出厂测试数据确认弹窗 */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">恢复预置测试数据</h3>
                <p className="text-xs text-slate-500 mt-1">重置定位标签列表为系统出厂初始化数据集</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              此操作将恢复系统的初始标签测试数据（包含各类在线/离线、电量正常/低电量、已用/未用的标准工牌卡）。当前临时录入的数据将被重置。
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmResetDefault}
                className="px-3.5 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors cursor-pointer"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 消息轻提示 Toast */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 定位标签批量导入模态框 */}
      <TagBatchImportModal
        isOpen={isBatchImportModalOpen}
        onClose={() => setIsBatchImportModalOpen(false)}
        existingTags={tags}
        personnelList={personnelList}
        onImportSuccess={(created, updated) => {
          showToast(`定位标签批量导入成功：新增 ${created} 个，更新 ${updated} 个标签资产`);
        }}
      />

    </div>
  );
}
