/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 船舶建造项目 - 有限空间安全员配置模态框 (精简分层网格版)
 * 业务定位：
 * 1. 按分层结构清晰列出有限空间舱位的网络网格排列
 * 2. 舱位仅展示名称与编号，去除冗余副标题与解释
 * 3. 人员选择与下拉选择严格精简为：姓名、标签号、所在班组、手机号 4 项信息
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Trash2, 
  Save, 
  Box, 
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  WorkfaceRecord, 
  getStoredWorkfaces, 
  saveStoredWorkfaces, 
  SHIPYARD_SAFETY_OFFICERS 
} from '@/src/data/workfaceData';
import { 
  INITIAL_PERSONNEL_ITEMS, 
  DhrPersonnelItem 
} from '@/src/data/dhrPersonnelData';
import { CreatedProjectData } from './CreateProjectModal';

export interface PersonnelCandidate {
  id: string;
  name: string;        // 姓名
  tagCode: string;     // 标签号
  department: string;  // 所在班组
  phone: string;       // 手机号
}

interface ProjectConfinedSpaceModalProps {
  isOpen: boolean;
  project: CreatedProjectData;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function ProjectConfinedSpaceModal({
  isOpen,
  project,
  onClose,
  onSuccess
}: ProjectConfinedSpaceModalProps) {
  // 1. 全部作业面列表
  const [allWorkfaces, setAllWorkfaces] = useState<WorkfaceRecord[]>(() => getStoredWorkfaces());
  
  // 2. 本模态框中当前项目关联的有限空间作业面列表
  const [projectWorkfaces, setProjectWorkfaces] = useState<WorkfaceRecord[]>([]);

  // 3. 搜索与下拉浮层状态 (wfId -> search keyword)
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [activeDropdownWfId, setActiveDropdownWfId] = useState<string | null>(null);


  // 构建精简人员候选库（仅包含：姓名、标签号、所在班组、手机号）
  const personnelPool = useMemo<PersonnelCandidate[]>(() => {
    const list: PersonnelCandidate[] = [];
    const addedKeys = new Set<string>();

    // A. 专职安全员
    SHIPYARD_SAFETY_OFFICERS.forEach(so => {
      const key = `${so.name}_${so.tagCode || ''}`;
      if (!addedKeys.has(key)) {
        addedKeys.add(key);
        list.push({
          id: so.id,
          name: so.name,
          tagCode: so.tagCode || '未配卡',
          department: so.department || '安监部',
          phone: so.phone || '-'
        });
      }
    });

    // B. 人员库
    let rawPersons: DhrPersonnelItem[] = INITIAL_PERSONNEL_ITEMS;
    try {
      const stored = localStorage.getItem('shipyard_personnel_list');
      if (stored) {
        rawPersons = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    rawPersons.forEach(p => {
      const key = `${p.name}_${p.tagCode || ''}`;
      if (!addedKeys.has(key)) {
        addedKeys.add(key);
        list.push({
          id: p.empID,
          name: p.name,
          tagCode: p.tagCode || '未配卡',
          department: p.deptname?.split('//').pop() || p.deptname || '造船作业组',
          phone: p.cellphone || '-'
        });
      }
    });

    return list;
  }, []);

  // 监听及初始化当前船舶项目的有限空间
  useEffect(() => {
    if (!isOpen || !project) return;
    
    const reloadWorkfaces = (all: WorkfaceRecord[]) => {
      setAllWorkfaces(all);
      const matched = all.filter(wf => {
        const isProjectBelonging = wf.belongingType === 'project';
        const isProjectIdMatch = wf.projectId === project.id;
        const isProjectNameMatch = wf.projectName === project.name;
        const isShipCodeMatch = !!(project.shipCode && wf.shipCode === project.shipCode);
        const isModelNameMatch = !!(project.name && (wf.shipModelName?.includes(project.name) || project.name.includes(wf.shipModelName || '')));
        
        // 引用关联判定: linkedProjectIds 包含当前项目 ID
        const isLinkedMatch = !!(wf.linkedProjectIds && wf.linkedProjectIds.includes(project.id));

        return (isProjectBelonging && (isProjectIdMatch || isProjectNameMatch || isShipCodeMatch || isModelNameMatch)) || isLinkedMatch;
      });
      setProjectWorkfaces(matched);
    };

    reloadWorkfaces(getStoredWorkfaces());
    setSearchTerms({});
    setActiveDropdownWfId(null);

    const handleUpdated = (e: any) => {
      const list = e.detail || getStoredWorkfaces();
      reloadWorkfaces(list);
    };

    window.addEventListener('workfaces_updated', handleUpdated);
    return () => window.removeEventListener('workfaces_updated', handleUpdated);
  }, [isOpen, project]);

  // 按分层结构聚合有限空间舱位
  const layerGroups = useMemo(() => {
    const groups: Record<string, WorkfaceRecord[]> = {};

    projectWorkfaces.forEach(wf => {
      const layer = wf.shipModelLayerName || wf.modelLevelName || '主甲板层';
      if (!groups[layer]) {
        groups[layer] = [];
      }
      groups[layer].push(wf);
    });

    return groups;
  }, [projectWorkfaces]);

  if (!isOpen || !project) return null;

  // 自动填充该船型典型分层有限空间
  const handleAutoInitSpaces = () => {
    const prefix = project.shipCode ? project.shipCode.replace('HULL-', '') : 'PRJ';
    const presets: Array<{ name: string; layer: string; code: string }> = [
      { name: '1#液货舱密闭作业舱', layer: '货舱层 (中舱)', code: `WF-${prefix}-01` },
      { name: '2#主货舱双层隔舱', layer: '货舱层 (中舱)', code: `WF-${prefix}-02` },
      { name: '1#双层底压载水舱', layer: '双层底/底部舱区', code: `WF-${prefix}-03` },
      { name: '2#底部滑油深井舱', layer: '双层底/底部舱区', code: `WF-${prefix}-04` },
      { name: '主机机舱轴隧区', layer: '机舱区', code: `WF-${prefix}-05` },
      { name: '辅机与发电机隔舱', layer: '机舱区', code: `WF-${prefix}-06` },
      { name: '艏尖舱压载水柜', layer: '艏尖舱/艉尖舱', code: `WF-${prefix}-07` },
      { name: '甲板下电缆管隧', layer: '主甲板层', code: `WF-${prefix}-08` }
    ];

    const defaultOfficer = personnelPool[0] || {
      id: 'SO-01',
      name: '周卫国',
      tagCode: 'TAG-SO-01',
      department: '安全环保班组',
      phone: '13812345601'
    };

    const newWfs: WorkfaceRecord[] = presets.map((p, idx) => ({
      id: `WF-${project.id}-${Date.now()}-${idx}`,
      code: p.code,
      name: p.name,
      workfaceType: '有限空间',
      belongingType: 'project',
      projectId: project.id,
      projectName: project.name,
      shipCode: project.shipCode || '',
      dockingArea: project.dockingArea || '船台',
      shipModelLayerName: p.layer,
      modelLevelName: p.layer,
      workType: '密闭舱室作业',
      riskLevel: '重大风险(红)',
      status: 'active',
      safetyOfficer: defaultOfficer.name,
      safetyOfficerPhone: defaultOfficer.phone,
      safetyOfficers: [
        {
          id: defaultOfficer.id,
          name: defaultOfficer.name,
          phone: defaultOfficer.phone,
          department: defaultOfficer.department,
          role: '安全员',
          certNumber: '',
          tagCode: defaultOfficer.tagCode
        }
      ],
      teamName: '造船工程搭载队',
      teamLeader: '班组长',
      teamLeaderPhone: '',
      currentPersonnelCount: 0,
      currentPersonnel: [],
      boundBaseStations: [],
      boundGasDetectors: [],
      boundCameras: [],
      boundAlarms: [],
      safetyMeasures: ['强制通风', '气体检测'],
      description: '',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));

    setProjectWorkfaces(newWfs);
  };

  // 状态归一化解析函数 (两状态模型：允许作业 / 禁止进入)
  const normalizeSpaceStatus = (status: string): '允许作业' | '禁止进入' => {
    if (status === '禁止进入' || status === 'forbidden' || status === 'restricted' || status === '禁入中' || status === 'paused') return '禁止进入';
    return '允许作业';
  };

  // 修改单个有限空间的状态 (允许作业 / 禁止进入)
  const handleUpdateSpaceStatus = (wfId: string, newStatus: '允许作业' | '禁止进入') => {
    setProjectWorkfaces(prev => prev.map(wf => {
      if (wf.id !== wfId) return wf;
      return {
        ...wf,
        status: newStatus as any,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    }));
  };

  // 删除单个舱位
  const handleRemoveSpace = (wfId: string) => {
    setProjectWorkfaces(prev => prev.filter(w => w.id !== wfId));
  };

  // 获取某个舱位已选人员候选列表（仅提取 4 项：姓名、标签号、所在班组、手机号）
  const getSelectedOfficers = (wf: WorkfaceRecord): PersonnelCandidate[] => {
    if (wf.safetyOfficers && wf.safetyOfficers.length > 0) {
      return wf.safetyOfficers.map(so => ({
        id: so.id,
        name: so.name,
        tagCode: so.tagCode || '未配卡',
        department: so.department || '安监部',
        phone: so.phone || '-'
      }));
    }
    if (wf.safetyOfficer) {
      const names = wf.safetyOfficer.split(/[,，、]/).map(n => n.trim()).filter(Boolean);
      return names.map((name, idx) => {
        const matched = personnelPool.find(p => p.name === name);
        if (matched) return matched;
        return {
          id: `SO-${idx}-${name}`,
          name: name,
          tagCode: '未配卡',
          department: '安监部',
          phone: wf.safetyOfficerPhone || '-'
        };
      });
    }
    return [];
  };

  // 添加人员
  const handleAddOfficer = (wfId: string, candidate: PersonnelCandidate) => {
    setProjectWorkfaces(prev => prev.map(wf => {
      if (wf.id !== wfId) return wf;
      const current = getSelectedOfficers(wf);
      if (current.some(c => c.id === candidate.id || c.name === candidate.name)) {
        return wf;
      }
      const updated = [...current, candidate];
      return {
        ...wf,
        safetyOfficers: updated.map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          department: item.department,
          role: '安全员',
          certNumber: '',
          tagCode: item.tagCode
        })),
        safetyOfficer: updated.map(item => item.name).join('、'),
        safetyOfficerPhone: updated[0]?.phone || ''
      };
    }));
  };

  // 移除人员
  const handleRemoveOfficer = (wfId: string, officerId: string, officerName: string) => {
    setProjectWorkfaces(prev => prev.map(wf => {
      if (wf.id !== wfId) return wf;
      const current = getSelectedOfficers(wf);
      const updated = current.filter(c => c.id !== officerId && c.name !== officerName);
      return {
        ...wf,
        safetyOfficers: updated.map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          department: item.department,
          role: '安全员',
          certNumber: '',
          tagCode: item.tagCode
        })),
        safetyOfficer: updated.map(item => item.name).join('、'),
        safetyOfficerPhone: updated[0]?.phone || ''
      };
    }));
  };

  // 保存所有更改
  const handleSaveAll = () => {
    const currentProjectWfIds = new Set(projectWorkfaces.map(w => w.id));
    const previousProjectWfIds = new Set(
      allWorkfaces.filter(wf => {
        const isProjectBelonging = wf.belongingType === 'project';
        const isProjectIdMatch = wf.projectId === project.id;
        const isProjectNameMatch = wf.projectName === project.name;
        const isShipCodeMatch = !!(project.shipCode && wf.shipCode === project.shipCode);
        return isProjectBelonging && (isProjectIdMatch || isProjectNameMatch || isShipCodeMatch);
      }).map(w => w.id)
    );

    const retainedOthers = allWorkfaces.filter(wf => !previousProjectWfIds.has(wf.id) && !currentProjectWfIds.has(wf.id));
    
    const finalizedCurrentWfs = projectWorkfaces.map(wf => {
      const isExternalLinked = wf.linkedProjectIds && wf.linkedProjectIds.includes(project.id) && wf.projectId !== project.id;
      return {
        ...wf,
        belongingType: isExternalLinked ? wf.belongingType : ('project' as const),
        workfaceType: '有限空间' as const,
        projectId: isExternalLinked ? wf.projectId : project.id,
        projectName: isExternalLinked ? wf.projectName : project.name,
        shipCode: isExternalLinked ? wf.shipCode : (project.shipCode || wf.shipCode || ''),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
    });

    const completeWorkfaces = [...retainedOthers, ...finalizedCurrentWfs];

    saveStoredWorkfaces(completeWorkfaces);
    window.dispatchEvent(new CustomEvent('workfaces_updated', { detail: completeWorkfaces }));

    if (onSuccess) {
      onSuccess(`项目【${project.name}】有限空间安全员配置已保存！`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={() => setActiveDropdownWfId(null)}
      >
        {/* 顶部头部：极简标题与项目名称 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-slate-800">有限空间安全员配置</h2>
            <span className="text-xs text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              {project.name}
            </span>
            <span className="font-mono text-xs text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
              {project.shipCode || project.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {projectWorkfaces.length === 0 && (
              <button
                type="button"
                onClick={handleAutoInitSpaces}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>初始化分层舱位</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 主体内容：按分层结构排列的有限空间舱位网络 */}
        <div className="flex-1 overflow-y-auto p-5">
          {projectWorkfaces.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Box className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs mb-3">暂无关联的有限空间舱位</p>
              <button
                type="button"
                onClick={handleAutoInitSpaces}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                一键生成典型分层舱位
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(layerGroups) as [string, WorkfaceRecord[]][]).map(([layerName, wfs]) => (
                <div key={layerName} className="space-y-2.5">
                  {/* 分层标题 */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full" />
                    <h3 className="text-xs font-bold text-slate-800">{layerName}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">({wfs.length} 处舱位)</span>
                  </div>

                  {/* 舱位网络排列 (Grid Network) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {wfs.map(wf => {
                      const selectedOfficers = getSelectedOfficers(wf);
                      const currentSearch = (searchTerms[wf.id] || '').trim().toLowerCase();
                      const isDropdownOpen = activeDropdownWfId === wf.id;

                      // 模糊查询：姓名 或 标签号
                      const matchedCandidates = personnelPool.filter(c => {
                        if (!currentSearch) return true;
                        return (
                          c.name.toLowerCase().includes(currentSearch) ||
                          c.tagCode.toLowerCase().includes(currentSearch) ||
                          c.department.toLowerCase().includes(currentSearch) ||
                          c.phone.includes(currentSearch)
                        );
                      });

                      const spaceStatus = normalizeSpaceStatus(wf.status as string);
                      const spaceStatusCls = spaceStatus === '允许作业'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-300';

                      return (
                        <div 
                          key={wf.id}
                          className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-all flex flex-col justify-between shadow-2xs relative"
                          onClick={e => e.stopPropagation()}
                        >
                          <div>
                            {/* 舱位名称、编号、状态变更与删除 */}
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-xs text-slate-900 truncate" title={wf.name}>
                                  {wf.name}
                                </span>
                                <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                  {wf.code}
                                </span>
                                {wf.linkedProjectIds && wf.linkedProjectIds.includes(project.id) && (
                                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium shrink-0">
                                    引用关联
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* 状态修改选择器 (两状态：允许作业 / 禁止进入) */}
                                <select
                                  value={spaceStatus}
                                  onChange={e => handleUpdateSpaceStatus(wf.id, e.target.value as '允许作业' | '禁止进入')}
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border cursor-pointer focus:outline-none transition-colors ${spaceStatusCls}`}
                                  title="修改有限空间状态"
                                >
                                  <option value="允许作业" className="text-emerald-700 bg-white font-semibold">允许作业</option>
                                  <option value="禁止进入" className="text-rose-700 bg-white font-semibold">禁止进入</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSpace(wf.id)}
                                  className="text-slate-300 hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                                  title="移除舱位"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* 已配置人员标签列表 (仅展示：姓名、标签号、班组、手机号) */}
                            <div className="flex flex-wrap gap-1 mb-2 min-h-[26px]">
                              {selectedOfficers.length === 0 ? (
                                <span className="text-[11px] text-slate-400 py-0.5">未配置安全员</span>
                              ) : (
                                selectedOfficers.map(officer => (
                                  <span 
                                    key={officer.id || officer.name}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-[11px]"
                                  >
                                    <span className="font-bold">{officer.name}</span>
                                    <span className="font-mono text-[10px] text-blue-600">{officer.tagCode}</span>
                                    <span className="text-[10px] text-slate-500">· {officer.department}</span>
                                    <span className="font-mono text-[10px] text-slate-500">· {officer.phone}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOfficer(wf.id, officer.id, officer.name)}
                                      className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* 人员选择搜索输入框 */}
                          <div className="relative mt-1">
                            <div className="flex items-center border border-slate-200 rounded px-2 py-1 bg-slate-50 focus-within:bg-white focus-within:border-blue-500">
                              <Search className="w-3 h-3 text-slate-400 mr-1.5 shrink-0" />
                              <input
                                type="text"
                                value={searchTerms[wf.id] || ''}
                                onChange={e => {
                                  const val = e.target.value;
                                  setSearchTerms(prev => ({ ...prev, [wf.id]: val }));
                                  setActiveDropdownWfId(wf.id);
                                }}
                                onFocus={() => setActiveDropdownWfId(wf.id)}
                                placeholder="查询姓名或标签号添加..."
                                className="w-full text-xs bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800"
                              />
                              {searchTerms[wf.id] && (
                                <button
                                  type="button"
                                  onClick={() => setSearchTerms(prev => ({ ...prev, [wf.id]: '' }))}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* 人员选择下拉面板：严格仅显示 姓名、标签号、所在班组、手机号 4 项信息 */}
                            {isDropdownOpen && (
                              <div 
                                className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-lg shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100"
                                onClick={e => e.stopPropagation()}
                              >
                                {/* 精简表头 */}
                                <div className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 grid grid-cols-4 sticky top-0 border-b border-slate-200">
                                  <span>姓名</span>
                                  <span>标签号</span>
                                  <span>所在班组</span>
                                  <span>手机号</span>
                                </div>

                                {matchedCandidates.length === 0 ? (
                                  <div className="p-3 text-center text-xs text-slate-400">无匹配人员</div>
                                ) : (
                                  matchedCandidates.map(c => {
                                    const isSelected = selectedOfficers.some(
                                      o => o.id === c.id || o.name === c.name
                                    );

                                    return (
                                      <div
                                        key={c.id}
                                        onClick={() => {
                                          if (isSelected) {
                                            handleRemoveOfficer(wf.id, c.id, c.name);
                                          } else {
                                            handleAddOfficer(wf.id, c);
                                          }
                                        }}
                                        className={`px-2.5 py-1.5 grid grid-cols-4 items-center text-xs cursor-pointer transition-colors ${
                                          isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1 truncate">
                                          {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                                          <span className="truncate">{c.name}</span>
                                        </div>
                                        <span className="font-mono text-[11px] text-slate-600 truncate">{c.tagCode}</span>
                                        <span className="text-[11px] text-slate-500 truncate">{c.department}</span>
                                        <span className="font-mono text-[11px] text-slate-500 truncate">{c.phone}</span>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部保存与取消 */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            共 {projectWorkfaces.length} 处舱位，已指定 {
              projectWorkfaces.reduce((sum, wf) => sum + getSelectedOfficers(wf).length, 0)
            } 人次安全责任人
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存配置</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
