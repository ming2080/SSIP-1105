/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 智慧船厂 - 船舶项目登船点配置模态框（精简合并版）
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Trash2,
  Save,
  Radio,
  Plus,
  CheckCircle2,
  Info,
  CheckSquare,
  Square,
  Ban,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  Anchor,
  MapPin,
  Ship,
  AlertCircle
} from 'lucide-react';
import { CreatedProjectData } from './CreateProjectModal';
import {
  BoardingPointConfigItem,
  BoardingExciterOption,
  getAllAvailableExciterDevices,
  getStoredBoardingPoints,
  saveStoredBoardingPoints
} from '@/src/data/boardingPointData';

interface ProjectBoardingPointModalProps {
  isOpen: boolean;
  project: CreatedProjectData | null;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

type PointSide = 'ground' | 'ship';

export function ProjectBoardingPointModal({
  isOpen,
  project,
  onClose,
  onSuccess
}: ProjectBoardingPointModalProps) {
  const [boardingPoints, setBoardingPoints] = useState<BoardingPointConfigItem[]>([]);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<BoardingExciterOption[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 关联激励器子弹窗状态
  const [pickingSide, setPickingSide] = useState<PointSide | null>(null);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [exciterSearch, setExciterSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    if (!isOpen || !project) return;
    const loadedPoints = getStoredBoardingPoints(project.id);
    const devices = getAllAvailableExciterDevices();
    setBoardingPoints(loadedPoints);
    setActivePointId(loadedPoints[0]?.id || null);
    setAvailableDevices(devices);
    setValidationError(null);
    setPickingSide(null);
    setSelectedDeviceIds([]);
    setExciterSearch('');
  }, [isOpen, project]);

  const activePoint = useMemo(() => {
    if (!boardingPoints.length) return null;
    return boardingPoints.find(p => p.id === activePointId) || boardingPoints[0];
  }, [boardingPoints, activePointId]);

  const deviceMap = useMemo(() => {
    const map = new Map<string, BoardingExciterOption>();
    availableDevices.forEach(d => map.set(d.id, d));
    return map;
  }, [availableDevices]);

  const pairedCount = useMemo(() => {
    return boardingPoints.filter(
      p => p.groundDeviceIds.length > 0 && p.shipDeviceIds.length > 0
    ).length;
  }, [boardingPoints]);

  // 新增登船点
  const handleAddBoardingPoint = () => {
    if (!project) return;
    const nextNum = boardingPoints.length + 1;
    const newId = `BP-${project.id}-${Date.now().toString().slice(-4)}`;
    const newPoint: BoardingPointConfigItem = {
      id: newId,
      projectId: project.id,
      code: `GATE-${String(nextNum).padStart(2, '0')}`,
      name: `${nextNum}# 登船点`,
      locationDesc: '',
      enabled: true,
      directionMode: 'bidirectional',
      sequenceWindowSec: 30,
      groundDeviceIds: [],
      shipDeviceIds: [],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setBoardingPoints(prev => [...prev, newPoint]);
    setActivePointId(newId);
    setValidationError(null);
  };

  // 删除登船点
  const handleDeleteBoardingPoint = (pointId: string) => {
    const remaining = boardingPoints.filter(p => p.id !== pointId);
    setBoardingPoints(remaining);
    if (activePointId === pointId) {
      setActivePointId(remaining[0]?.id || null);
    }
    setValidationError(null);
  };

  // 更新当前选中登船点
  const updateActivePoint = (updater: (prev: BoardingPointConfigItem) => BoardingPointConfigItem) => {
    if (!activePoint) return;
    const targetId = activePoint.id;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setBoardingPoints(prev =>
      prev.map(item => (item.id === targetId ? { ...updater(item), updatedAt: nowStr } : item))
    );
    setValidationError(null);
  };

  // 打开激励器选择弹窗
  const handleOpenDevicePicker = (side: PointSide) => {
    setPickingSide(side);
    setSelectedDeviceIds([]);
    setExciterSearch('');
  };

  // 确认批量关联激励器
  const handleConfirmBatchAdd = () => {
    if (!pickingSide || !activePoint || selectedDeviceIds.length === 0) {
      setPickingSide(null);
      return;
    }

    updateActivePoint(point => {
      if (pickingSide === 'ground') {
        return {
          ...point,
          groundDeviceIds: Array.from(new Set([...point.groundDeviceIds, ...selectedDeviceIds]))
        };
      }
      return {
        ...point,
        shipDeviceIds: Array.from(new Set([...point.shipDeviceIds, ...selectedDeviceIds]))
      };
    });

    showToast(`已关联 ${selectedDeviceIds.length} 台设备`);
    setPickingSide(null);
    setSelectedDeviceIds([]);
  };

  // 解除激励器关联
  const handleRemoveDevice = (devId: string, side: PointSide) => {
    updateActivePoint(point => {
      if (side === 'ground') {
        return {
          ...point,
          groundDeviceIds: point.groundDeviceIds.filter(id => id !== devId)
        };
      }
      return {
        ...point,
        shipDeviceIds: point.shipDeviceIds.filter(id => id !== devId)
      };
    });
  };

  // 单船多登船点与双侧点位互斥占用映射
  const deviceUsageMap = useMemo(() => {
    const usage = new Map<string, { pointId: string; pointName: string; side: PointSide }>();
    boardingPoints.forEach(point => {
      point.groundDeviceIds.forEach(id => {
        usage.set(id, { pointId: point.id, pointName: point.name, side: 'ground' });
      });
      point.shipDeviceIds.forEach(id => {
        usage.set(id, { pointId: point.id, pointName: point.name, side: 'ship' });
      });
    });
    return usage;
  }, [boardingPoints]);

  const filteredExciterList = useMemo(() => {
    const kw = exciterSearch.toLowerCase().trim();
    const list = availableDevices.filter(dev => {
      if (!kw) return true;
      return (
        dev.name.toLowerCase().includes(kw) ||
        dev.code.toLowerCase().includes(kw) ||
        dev.location.toLowerCase().includes(kw)
      );
    });

    return list.slice().sort((a, b) => {
      const aUsed = deviceUsageMap.has(a.id);
      const bUsed = deviceUsageMap.has(b.id);
      if (aUsed && !bUsed) return 1;
      if (!aUsed && bUsed) return -1;
      return 0;
    });
  }, [availableDevices, exciterSearch, deviceUsageMap]);

  const selectableDevices = useMemo(() => {
    return filteredExciterList.filter(dev => !deviceUsageMap.has(dev.id));
  }, [filteredExciterList, deviceUsageMap]);

  const isAllSelectableChecked = useMemo(() => {
    if (selectableDevices.length === 0) return false;
    return selectableDevices.every(dev => selectedDeviceIds.includes(dev.id));
  }, [selectableDevices, selectedDeviceIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelectableChecked) {
      setSelectedDeviceIds([]);
    } else {
      setSelectedDeviceIds(selectableDevices.map(d => d.id));
    }
  };

  const handleToggleDeviceSelect = (devId: string, isDisabled: boolean) => {
    if (isDisabled) return;
    setSelectedDeviceIds(prev =>
      prev.includes(devId) ? prev.filter(id => id !== devId) : [...prev, devId]
    );
  };

  // 保存配置
  const handleSaveConfigs = () => {
    if (!project) return;

    for (const point of boardingPoints) {
      if (!point.name.trim()) {
        setActivePointId(point.id);
        setValidationError(`登船点【${point.code}】名称不能为空`);
        return;
      }
      if (point.enabled && (point.groundDeviceIds.length === 0 || point.shipDeviceIds.length === 0)) {
        setActivePointId(point.id);
        const missing: string[] = [];
        if (point.groundDeviceIds.length === 0) missing.push('地面点位');
        if (point.shipDeviceIds.length === 0) missing.push('船上点位');
        setValidationError(`【${point.name}】缺少${missing.join('、')}关联激励器，请先配对设备`);
        return;
      }
    }

    const normalized = boardingPoints.map(p => ({
      ...p,
      directionMode: 'bidirectional' as const
    }));
    saveStoredBoardingPoints(project.id, normalized);
    showToast('登船点配置已保存');
    if (onSuccess) {
      onSuccess(`【${project.name}】登船点配置已保存（共 ${normalized.length} 个登船点）`);
    }
    setTimeout(() => {
      onClose();
    }, 450);
  };

  if (!isOpen || !project) return null;

  const renderDeviceCard = (devId: string, side: PointSide) => {
    const dev = deviceMap.get(devId) || {
      id: devId,
      code: devId,
      name: `激励器 ${devId}`,
      location: side === 'ground' ? '地面侧' : '船上侧',
      status: '在线' as const
    };
    const isGround = side === 'ground';

    return (
      <div
        key={devId}
        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
          isGround
            ? 'border-sky-200/90 bg-sky-50/40 hover:border-sky-400'
            : 'border-indigo-200/90 bg-indigo-50/40 hover:border-indigo-400'
        }`}
      >
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                isGround ? 'text-sky-900 bg-sky-100' : 'text-indigo-900 bg-indigo-100'
              }`}
            >
              {dev.code}
            </span>
            <span className="font-bold text-xs text-slate-900 truncate" title={dev.name}>
              {dev.name}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 truncate" title={dev.location}>
            {dev.location}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleRemoveDevice(devId, side)}
          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          title="解除关联"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-10 right-10 z-60 bg-slate-900 text-white text-xs px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 顶部 Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Anchor className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">登船点配置</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 项目名称与新增登船点栏 */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-600 text-white shrink-0">
              项目名称
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 truncate">{project.name}</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              已配对{' '}
              <strong
                className={
                  pairedCount === boardingPoints.length && boardingPoints.length > 0
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }
              >
                {pairedCount}/{boardingPoints.length}
              </strong>
            </span>

            <button
              type="button"
              onClick={handleAddBoardingPoint}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增登船点</span>
            </button>
          </div>
        </div>

        {/* 校验提示 */}
        {validationError && (
          <div className="px-6 py-2 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-3 text-xs text-rose-700 shrink-0">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="text-rose-400 hover:text-rose-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 主体区域：左侧登船点列表 + 右侧合并配置区 */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/40 min-h-0">
          {/* 左侧：登船点列表 */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/80 flex flex-col shrink-0 max-h-48 md:max-h-none">
            <div className="px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-700">登船点列表</span>
              <span className="text-[11px] text-slate-500 font-mono">{boardingPoints.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {boardingPoints.length === 0 ? (
                <div className="py-8 px-3 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white text-xs text-slate-400">
                  暂无登船点
                </div>
              ) : (
                boardingPoints.map((point, index) => {
                  const isActive = activePoint?.id === point.id;
                  const isPaired = point.groundDeviceIds.length > 0 && point.shipDeviceIds.length > 0;

                  return (
                    <div
                      key={point.id}
                      onClick={() => setActivePointId(point.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-white border-teal-500 ring-1 ring-teal-500/30 shadow-xs'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              !point.enabled
                                ? 'bg-slate-300'
                                : isPaired
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                            {point.code || `GATE-${String(index + 1).padStart(2, '0')}`}
                          </span>
                          {!point.enabled && (
                            <span className="text-[10px] text-slate-400 shrink-0">停用</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteBoardingPoint(point.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded opacity-70 group-hover:opacity-100 transition-colors cursor-pointer shrink-0"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="font-bold text-xs text-slate-900 mt-1 truncate" title={point.name}>
                        {point.name || '未命名登船点'}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 font-semibold">
                            地面 {point.groundDeviceIds.length}
                          </span>
                          <ArrowLeftRight className="w-3 h-3 text-slate-400" />
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            船上 {point.shipDeviceIds.length}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            isPaired ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {isPaired ? '已配对' : '待配对'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧：基本信息、方向规则与成对点位设备配置合并展示区 */}
          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {activePoint ? (
              <div className="border border-slate-200 rounded-2xl bg-slate-50/40 overflow-hidden">
                {/* 头部：基本信息 */}
                <div className="p-4 bg-white border-b border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-600 text-white">
                        {activePoint.code}
                      </span>
                      <span className="font-bold text-sm text-slate-900">登船点与设备配对配置</span>
                    </div>

                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activePoint.enabled}
                        onChange={e =>
                          updateActivePoint(prev => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="w-3.5 h-3.5 accent-teal-600 rounded cursor-pointer"
                      />
                      <span>启用</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        登船点名称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={activePoint.name}
                        onChange={e =>
                          updateActivePoint(prev => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="如：1# 左舷主登船梯口"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        位置说明
                      </label>
                      <input
                        type="text"
                        value={activePoint.locationDesc}
                        onChange={e =>
                          updateActivePoint(prev => ({ ...prev, locationDesc: e.target.value }))
                        }
                        placeholder="选填，如：1号船台左舷中段舷梯"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 方向规则条（与配对点位融为一体） */}
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                      <span>地面点位</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span>船上点位</span>
                      <span className="text-emerald-700 font-bold">· 登船</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                      <span>船上点位</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                      <span>地面点位</span>
                      <span className="text-amber-700 font-bold">· 下船</span>
                    </span>
                  </div>
                </div>

                {/* 成对点位关联设备区（左：地面点位 | 中：方向箭头 | 右：船上点位） */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-11 gap-3.5 items-stretch">
                  {/* 左栏：地面点位 */}
                  <div className="lg:col-span-5 border border-sky-200 rounded-xl p-3.5 bg-white flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-sky-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-sky-600" />
                        <h5 className="font-bold text-xs text-slate-900">地面点位</h5>
                        <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 font-mono">
                          {activePoint.groundDeviceIds.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenDevicePicker('ground')}
                        className="px-2.5 py-1 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>关联设备</span>
                      </button>
                    </div>

                    <div className="space-y-2 flex-1">
                      {activePoint.groundDeviceIds.length > 0 ? (
                        activePoint.groundDeviceIds.map(devId => renderDeviceCard(devId, 'ground'))
                      ) : (
                        <div className="py-8 text-center border-2 border-dashed border-sky-200/80 rounded-xl text-slate-400 text-xs">
                          暂未关联地面点位设备
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 中间：方向配对指示 */}
                  <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-2 py-1">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                      <span>登船</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold whitespace-nowrap">
                      <ArrowLeft className="w-3 h-3" />
                      <span>下船</span>
                    </div>
                  </div>

                  {/* 右栏：船上点位 */}
                  <div className="lg:col-span-5 border border-indigo-200 rounded-xl p-3.5 bg-white flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                      <div className="flex items-center gap-1.5">
                        <Ship className="w-4 h-4 text-indigo-600" />
                        <h5 className="font-bold text-xs text-slate-900">船上点位</h5>
                        <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 font-mono">
                          {activePoint.shipDeviceIds.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenDevicePicker('ship')}
                        className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>关联设备</span>
                      </button>
                    </div>

                    <div className="space-y-2 flex-1">
                      {activePoint.shipDeviceIds.length > 0 ? (
                        activePoint.shipDeviceIds.map(devId => renderDeviceCard(devId, 'ship'))
                      ) : (
                        <div className="py-8 text-center border-2 border-dashed border-indigo-200/80 rounded-xl text-slate-400 text-xs">
                          暂未关联船上点位设备
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Anchor className="w-8 h-8 text-slate-300" />
                <p className="text-xs">点击上方【新增登船点】开始配置</p>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>保存后上下船识别规则实时生效</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveConfigs}
              className="px-5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存配置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 关联激励器多选弹窗 */}
      {pickingSide && activePoint && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setPickingSide(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 space-y-3.5 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Radio className="w-4 h-4 text-teal-600" />
                <span>
                  关联【{pickingSide === 'ground' ? '地面点位' : '船上点位'}】激励器
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPickingSide(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索设备名称、编号或位置"
                  value={exciterSearch}
                  onChange={e => setExciterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {selectableDevices.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isAllSelectableChecked ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-teal-600" />
                      <span>取消全选</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>全选</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {filteredExciterList.map(dev => {
                const usage = deviceUsageMap.get(dev.id);
                const isDisabled = !!usage;
                const isChecked = selectedDeviceIds.includes(dev.id);

                let disabledReason = '';
                if (usage) {
                  if (usage.pointId === activePoint.id && usage.side === pickingSide) {
                    disabledReason = '当前已关联';
                  } else if (usage.pointId === activePoint.id) {
                    disabledReason = usage.side === 'ground' ? '已关联地面' : '已关联船上';
                  } else {
                    disabledReason = `${usage.pointName}占用`;
                  }
                }

                return (
                  <div
                    key={dev.id}
                    onClick={() => handleToggleDeviceSelect(dev.id, isDisabled)}
                    className={`p-2.5 flex items-center justify-between gap-2 transition-colors ${
                      isDisabled
                        ? 'bg-slate-50/80 cursor-not-allowed opacity-75'
                        : 'hover:bg-teal-50/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">
                        {isDisabled ? (
                          <Ban className="w-4 h-4 text-slate-300" />
                        ) : isChecked ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                            {dev.code}
                          </span>
                          <span
                            className={`font-semibold text-xs truncate ${
                              isDisabled ? 'text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {dev.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {dev.location}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isDisabled ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                          {disabledReason}
                        </span>
                      ) : isChecked ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800">
                          已选
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {filteredExciterList.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">未找到匹配设备</div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                已选 <b className="text-teal-600 font-mono">{selectedDeviceIds.length}</b> 台
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickingSide(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={selectedDeviceIds.length === 0}
                  onClick={handleConfirmBatchAdd}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedDeviceIds.length === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  }`}
                >
                  确认关联 ({selectedDeviceIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
