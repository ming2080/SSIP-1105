/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 船舶项目船舱配置模态框
 * 业务定位：
 * 1. 针对船舶项目进行进出船舱规则判定设备关联配置。
 * 2. 页面左右分栏呈现“规则配置”：左侧“进舱关联”，右侧“出舱关联”。
 * 3. 卡片设备信息显示：设备编号、设备名称、所在位置。
 * 4. 增加关联设备时支持批量多选，且被选择为进舱关联设备的，互斥不可同时选择做为出舱关联设备（反之亦然）。
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  Save, 
  Radio, 
  Plus, 
  SlidersHorizontal, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Info,
  CheckSquare,
  Square,
  Ban
} from 'lucide-react';
import { CreatedProjectData } from './CreateProjectModal';
import { 
  CabinConfigItem, 
  MOCK_EXCITER_DEVICES, 
  getStoredCabinConfigs, 
  saveStoredCabinConfigs 
} from '@/src/data/cabinConfigData';
import { getStoredWorkfaces } from '@/src/data/workfaceData';

interface ProjectCabinConfigModalProps {
  isOpen: boolean;
  project: CreatedProjectData | null;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function ProjectCabinConfigModal({
  isOpen,
  project,
  onClose,
  onSuccess
}: ProjectCabinConfigModalProps) {
  if (!isOpen || !project) return null;

  // 1. 船舱配置列表
  const [cabinConfigs, setCabinConfigs] = useState<CabinConfigItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2. 选择关联判定设备浮层状态与多选 ID 数组
  const [isAddingExciter, setIsAddingExciter] = useState<'entry' | 'exit' | null>(null);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [exciterSearch, setExciterSearch] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 初始化加载项目关联的船舱及规则
  useEffect(() => {
    if (!project) return;
    const configs = getStoredCabinConfigs(project.id);

    // 检查是否有来自有限空间模块的新建舱室，如有则自动补充纳入
    const workfaces = getStoredWorkfaces().filter(
      wf => wf.projectId === project.id || wf.shipModelId === project.id || wf.belongingType === 'project'
    );

    let mergedConfigs = [...configs];
    workfaces.forEach(wf => {
      const existing = mergedConfigs.find(c => c.cabinId === wf.id || c.cabinCode === wf.code);
      if (!existing && (wf.workfaceType === '有限空间' || wf.belongingType === 'project')) {
        mergedConfigs.push({
          id: `CC-${project.id}-${wf.id}`,
          projectId: project.id,
          projectName: project.name,
          cabinId: wf.id,
          cabinCode: wf.code,
          cabinName: wf.name,
          modelLevel: wf.modelLevel || 'bottom',
          modelLevelName: wf.modelLevelName || '底舱层 (双层底/压载密闭舱)',
          volume: Number(wf.volume) || 2400,
          capacityLimit: wf.capacityLimit || 10,
          denseThreshold: 3,
          maxStayMinutes: 120,
          entryRule: {
            ruleName: `${wf.name}进舱感知规则`,
            enabled: true,
            detectionMode: 'single_exciter',
            associatedDeviceIds: ['EXC-LNG-01'],
            debounceSeconds: 3
          },
          exitRule: {
            ruleName: `${wf.name}出舱结算规则`,
            enabled: true,
            detectionMode: 'single_exciter',
            associatedDeviceIds: ['EXC-LNG-02'],
            autoExitHours: 6
          },
          currentPersonnelCount: wf.currentPersonnelCount || 0,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        });
      }
    });

    if (mergedConfigs.length === 0) {
      mergedConfigs.push({
        id: `CC-${project.id}-default`,
        projectId: project.id,
        projectName: project.name,
        cabinId: `CB-${project.id}`,
        cabinCode: 'CC-01',
        cabinName: `${project.name} 船舱受控区`,
        modelLevel: 'bottom',
        modelLevelName: '主船舱区域',
        volume: 2400,
        capacityLimit: 10,
        denseThreshold: 3,
        maxStayMinutes: 120,
        entryRule: {
          ruleName: `进舱感知规则`,
          enabled: true,
          detectionMode: 'single_exciter',
          associatedDeviceIds: ['EXC-LNG-01'],
          debounceSeconds: 3
        },
        exitRule: {
          ruleName: `出舱结算规则`,
          enabled: true,
          detectionMode: 'single_exciter',
          associatedDeviceIds: ['EXC-LNG-02'],
          autoExitHours: 6
        },
        currentPersonnelCount: 0,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    }

    setCabinConfigs(mergedConfigs);
  }, [project]);

  // 主舱室规则对象
  const currentCabin = useMemo(() => {
    return cabinConfigs[0] || null;
  }, [cabinConfigs]);

  // 更新船舱规则属性
  const updateCurrentCabin = (updater: (prev: CabinConfigItem) => CabinConfigItem) => {
    setCabinConfigs(prev => {
      if (prev.length === 0) return prev;
      return prev.map(c => updater(c));
    });
  };

  // 打开关联设备弹窗
  const handleOpenAddingModal = (ruleType: 'entry' | 'exit') => {
    setIsAddingExciter(ruleType);
    setSelectedDeviceIds([]);
    setExciterSearch('');
  };

  // 批量添加选中的判定设备
  const handleConfirmBatchAdd = () => {
    if (!isAddingExciter || selectedDeviceIds.length === 0) {
      setIsAddingExciter(null);
      return;
    }

    updateCurrentCabin(cabin => {
      const targetRule = isAddingExciter === 'entry' ? cabin.entryRule : cabin.exitRule;
      const mergedIds = Array.from(new Set([...targetRule.associatedDeviceIds, ...selectedDeviceIds]));
      return {
        ...cabin,
        [isAddingExciter === 'entry' ? 'entryRule' : 'exitRule']: {
          ...targetRule,
          associatedDeviceIds: mergedIds
        },
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    });

    showToast(`已成功关联 ${selectedDeviceIds.length} 台【${isAddingExciter === 'entry' ? '进舱' : '出舱'}】判定设备`);
    setIsAddingExciter(null);
    setSelectedDeviceIds([]);
  };

  // 从规则中解除判定设备关联
  const handleRemoveExciterFromRule = (exciterId: string, ruleType: 'entry' | 'exit') => {
    updateCurrentCabin(cabin => {
      const targetRule = ruleType === 'entry' ? cabin.entryRule : cabin.exitRule;
      const newDeviceIds = targetRule.associatedDeviceIds.filter(id => id !== exciterId);
      return {
        ...cabin,
        [ruleType === 'entry' ? 'entryRule' : 'exitRule']: {
          ...targetRule,
          associatedDeviceIds: newDeviceIds
        },
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    });
    showToast(`已解除判定设备关联`);
  };

  // 保存配置
  const handleSaveConfigs = () => {
    if (!project) return;
    saveStoredCabinConfigs(project.id, cabinConfigs);
    showToast(`船舱进出规则与判定设备绑定关系已保存生效！`);
    if (onSuccess) {
      onSuccess(`【${project.name}】船舱进出规则关联判定设备配置已保存生效`);
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // 互斥设备关联关系计算
  const currentRuleDeviceIds = useMemo(() => {
    if (!currentCabin || !isAddingExciter) return [];
    return isAddingExciter === 'entry'
      ? currentCabin.entryRule.associatedDeviceIds
      : currentCabin.exitRule.associatedDeviceIds;
  }, [currentCabin, isAddingExciter]);

  const otherRuleDeviceIds = useMemo(() => {
    if (!currentCabin || !isAddingExciter) return [];
    return isAddingExciter === 'entry'
      ? currentCabin.exitRule.associatedDeviceIds
      : currentCabin.entryRule.associatedDeviceIds;
  }, [currentCabin, isAddingExciter]);

  // 过滤后的可选判定设备列表（已关联设备排列在最后面）
  const filteredExciterList = useMemo(() => {
    const list = MOCK_EXCITER_DEVICES.filter(dev => {
      if (exciterSearch.trim()) {
        const kw = exciterSearch.toLowerCase().trim();
        return dev.name.toLowerCase().includes(kw) || dev.code.toLowerCase().includes(kw) || dev.location.toLowerCase().includes(kw);
      }
      return true;
    });

    return list.slice().sort((a, b) => {
      const aAssociated = currentRuleDeviceIds.includes(a.id) || otherRuleDeviceIds.includes(a.id);
      const bAssociated = currentRuleDeviceIds.includes(b.id) || otherRuleDeviceIds.includes(b.id);
      if (aAssociated && !bAssociated) return 1;  // 已关联排在后面
      if (!aAssociated && bAssociated) return -1; // 未关联排在前面
      return 0;
    });
  }, [exciterSearch, currentRuleDeviceIds, otherRuleDeviceIds]);

  // 计算可选择的设备总数（剔除已在两侧关联的设备）
  const selectableDevices = useMemo(() => {
    return filteredExciterList.filter(dev => {
      const isAlreadyInCurrent = currentRuleDeviceIds.includes(dev.id);
      const isAlreadyInOther = otherRuleDeviceIds.includes(dev.id);
      return !isAlreadyInCurrent && !isAlreadyInOther;
    });
  }, [filteredExciterList, currentRuleDeviceIds, otherRuleDeviceIds]);

  // 全选/反选逻辑
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
      prev.includes(devId) 
        ? prev.filter(id => id !== devId) 
        : [...prev, devId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Toast 提示 */}
        {toastMessage && (
          <div className="fixed top-12 right-12 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 顶部 Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  船舱配置
                </h2>
              </div>
            </div>
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

        {/* 主体无分栏直接展开 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">

          {/* 项目名称标题栏 */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-600 text-white shadow-2xs">
                项目名称
              </span>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h3>
            </div>
          </div>

          {currentCabin ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 统一标题栏：规则配置 */}
              <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>规则配置</span>
                </div>
              </div>

              {/* 左右分栏两列：左边“进舱关联”，右边“出舱关联” */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                
                {/* 左栏：进舱关联 */}
                <div className="space-y-4 md:pr-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4.5 h-4.5 text-emerald-600" />
                      <h4 className="font-extrabold text-sm text-slate-900">进舱关联</h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                        {currentCabin.entryRule.associatedDeviceIds.length} 台设备
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddingModal('entry')}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>关联设备</span>
                    </button>
                  </div>

                  {/* 进舱已关联设备列表（仅显示：设备编号、设备名称、所在位置） */}
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {currentCabin.entryRule.associatedDeviceIds.map(devId => {
                      const dev = MOCK_EXCITER_DEVICES.find(d => d.id === devId) || {
                        id: devId,
                        code: devId,
                        name: `设备 ${devId}`,
                        location: '舱口安装位'
                      };

                      return (
                        <div 
                          key={devId}
                          className="p-3 rounded-xl border border-emerald-200/90 bg-emerald-50/40 flex items-center justify-between relative group hover:border-emerald-400 transition-all shadow-2xs"
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.2 rounded shrink-0">
                                {dev.code}
                              </span>
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {dev.name}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600">
                              所在位置: <span className="font-medium text-slate-800">{dev.location}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExciterFromRule(devId, 'entry')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="解除关联"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {currentCabin.entryRule.associatedDeviceIds.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                        暂未关联进舱设备，请点击右上角【关联设备】
                      </div>
                    )}
                  </div>
                </div>

                {/* 右栏：出舱关联 */}
                <div className="space-y-4 pt-6 md:pt-0 md:pl-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-amber-200">
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4.5 h-4.5 text-amber-600" />
                      <h4 className="font-extrabold text-sm text-slate-900">出舱关联</h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 font-mono">
                        {currentCabin.exitRule.associatedDeviceIds.length} 台设备
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddingModal('exit')}
                      className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>关联设备</span>
                    </button>
                  </div>

                  {/* 出舱已关联设备列表（仅显示：设备编号、设备名称、所在位置） */}
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {currentCabin.exitRule.associatedDeviceIds.map(devId => {
                      const dev = MOCK_EXCITER_DEVICES.find(d => d.id === devId) || {
                        id: devId,
                        code: devId,
                        name: `设备 ${devId}`,
                        location: '舱口逆向通道'
                      };

                      return (
                        <div 
                          key={devId}
                          className="p-3 rounded-xl border border-amber-200/90 bg-amber-50/40 flex items-center justify-between relative group hover:border-amber-400 transition-all shadow-2xs"
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded shrink-0">
                                {dev.code}
                              </span>
                              <span className="font-bold text-xs text-slate-900 truncate">
                                {dev.name}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600">
                              所在位置: <span className="font-medium text-slate-800">{dev.location}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExciterFromRule(devId, 'exit')}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title="解除关联"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {currentCabin.exitRule.associatedDeviceIds.length === 0 && (
                      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                        暂未关联出舱设备，请点击右上角【关联设备】
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              未能载入当前项目的船舱配置
            </div>
          )}
        </div>

        {/* 底部保存按钮栏 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>保存后规则与设备的绑定映射关系将实时生效</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveConfigs}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>保存配置</span>
            </button>
          </div>
        </div>
      </div>

      {/* 关联设备多选 Modal */}
      {isAddingExciter && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 p-4"
          onClick={() => setIsAddingExciter(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>选择关联的【{isAddingExciter === 'entry' ? '进舱' : '出舱'}】设备（支持多选）</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingExciter(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 搜索与全选工具栏 */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索设备名称或编码"
                  value={exciterSearch}
                  onChange={e => setExciterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>取消全选</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>全选可选设备</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 可选设备列表（支持多选勾选） */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {filteredExciterList.map(dev => {
                const isAlreadyInCurrent = currentRuleDeviceIds.includes(dev.id);
                const isAlreadyInOther = otherRuleDeviceIds.includes(dev.id);
                const isDisabled = isAlreadyInCurrent || isAlreadyInOther;
                const isChecked = selectedDeviceIds.includes(dev.id);

                return (
                  <div 
                    key={dev.id} 
                    onClick={() => handleToggleDeviceSelect(dev.id, isDisabled)}
                    className={`p-3 flex items-center justify-between transition-colors ${
                      isDisabled 
                        ? 'bg-slate-50/80 cursor-not-allowed opacity-75' 
                        : 'hover:bg-blue-50/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="shrink-0">
                        {isDisabled ? (
                          <Ban className="w-4 h-4 text-slate-300" />
                        ) : isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                            {dev.code}
                          </span>
                          <span className={`font-semibold text-xs truncate ${isDisabled ? 'text-slate-400' : 'text-slate-900'}`}>
                            {dev.name}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          所在位置: <span className="font-medium text-slate-700">{dev.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* 状态提示 */}
                    <div className="shrink-0 pl-2">
                      {isDisabled ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                          已关联
                        </span>
                      ) : isChecked ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                          已选中
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {filteredExciterList.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  未搜寻到匹配的判定设备
                </div>
              )}
            </div>

            {/* 弹窗底部操作按钮 */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                已勾选 <b className="text-blue-600 font-mono text-sm">{selectedDeviceIds.length}</b> 台设备
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExciter(null)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
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
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
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
