import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  MapPin, 
  Clock, 
  GitBranch,
  Edit,
  Lock,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CreateVersionModal, VersionPayload, ProjectStatusType, PROJECT_STATUS_OPTIONS } from './CreateVersionModal';

interface ProjectVersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  projectName?: string;
  shipType?: string;
  onProjectStatusChange?: (projectId: string, newStatus: ProjectStatusType) => void;
}

// 计算上个版本结束时间的辅助函数：新版本开始时间减1秒
function getPreviousEndDate(startDateStr: string): string {
  try {
    const normalized = startDateStr.includes('T') ? startDateStr : startDateStr.replace(' ', 'T');
    const dt = new Date(normalized);
    if (isNaN(dt.getTime())) return startDateStr;
    const prevDt = new Date(dt.getTime() - 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = prevDt.getFullYear();
    const m = pad(prevDt.getMonth() + 1);
    const d = pad(prevDt.getDate());
    const hh = pad(prevDt.getHours());
    const mm = pad(prevDt.getMinutes());
    const ss = pad(prevDt.getSeconds());
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  } catch (e) {
    return startDateStr;
  }
}

export function ProjectVersionsModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectName = '17.4万m³ 薄膜型大型LNG船 1号舰',
  shipType = '清洁能源运输',
  onProjectStatusChange
}: ProjectVersionsModalProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<VersionPayload | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const [versions, setVersions] = useState<VersionPayload[]>([
    {
      id: 'v1',
      title: 'V1.0 - 分段搭载与总组阶段',
      versionNumber: 'V1.0',
      phaseName: '分段搭载与总组阶段',
      status: 'archived',
      projectStatus: 'in_progress',
      startDate: '2026-03-01 08:00:00',
      endDate: '2026-06-16 07:59:59',
      sync: true,
      hasAssociatedData: true,
      associatedPersonnelIds: ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006'],
      associatedPersonnelCount: 6,
      enableBerthTransfer: true,
      berthId: 'berth-5',
      berthCode: 5,
      berthName: '2万吨船台',
      berthSlotNumber: 1,
      berthCategoryName: '船台'
    },
    {
      id: 'v2',
      title: 'V2.0 - 大接缝合拢与密闭舱焊接',
      versionNumber: 'V2.0',
      phaseName: '大接缝合拢与密闭舱焊接',
      status: 'active',
      projectStatus: 'in_progress',
      startDate: '2026-06-16 08:00:00',
      endDate: '生效中',
      sync: true,
      hasAssociatedData: true,
      associatedPersonnelIds: ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006', 'EMP-007', 'EMP-008', 'EMP-009', 'EMP-010', 'EMP-011', 'EMP-012', 'EMP-013', 'EMP-014', 'EMP-015', 'EMP-016', 'EMP-017', 'EMP-018'],
      associatedPersonnelCount: 18,
      enableBerthTransfer: true,
      berthId: 'berth-3',
      berthCode: 3,
      berthName: '3号码头 (旧码头)',
      berthSlotNumber: 2,
      berthCategoryName: '移动码头'
    }
  ]);

  if (!isOpen) return null;

  // 上个阶段版本的施工状态（用于新建阶段版本的继承逻辑，如无任何前序版本则返回 undefined）
  const activeVersion = versions.find(v => v.status === 'active');
  const latestVersion = activeVersion || (versions.length > 0 ? versions[versions.length - 1] : null);
  const previousProjectStatus = latestVersion?.projectStatus || (versions.length > 0 ? 'in_progress' : undefined);
  
  // 校验当前项目是否处于“已竣工交船”状态（需求项3：已竣工交船的项目归档，不再允许新增阶段版本）
  const isProjectCompleted = latestVersion?.projectStatus === 'completed';

  // 处理保存（创建或编辑）
  const handleSaveVersion = (savedVersion: VersionPayload) => {
    if (editingVersion) {
      // 编辑模式
      setVersions(prev => prev.map(v => v.id === savedVersion.id ? savedVersion : v));
      setEditingVersion(null);

      // 同步影响项目全局施工状态
      if (savedVersion.status === 'active' && savedVersion.projectStatus && projectId && onProjectStatusChange) {
        onProjectStatusChange(projectId, savedVersion.projectStatus);
      }
    } else {
      // 创建新阶段版本：自动成为最新活跃版本，上个版本转为归档版本并设置结束时间（开始时间减1秒）
      const newStartDate = savedVersion.startDate;
      const calculatedPrevEndDate = getPreviousEndDate(newStartDate);

      setVersions(prev => {
        const updatedPrevious = prev.map(v => {
          if (v.status === 'active') {
            return {
              ...v,
              status: 'archived' as const,
              endDate: calculatedPrevEndDate
            };
          }
          return v;
        });

        // 将新版本（status为active）加入列表
        return [...updatedPrevious, { ...savedVersion, status: 'active', endDate: '生效中' }];
      });

      // 同步影响项目全局施工状态
      if (savedVersion.projectStatus && projectId && onProjectStatusChange) {
        onProjectStatusChange(projectId, savedVersion.projectStatus);
      }
    }
  };

  const handleOpenCreate = () => {
    if (isProjectCompleted) return;
    setEditingVersion(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (ver: VersionPayload) => {
    // 保护：历史阶段版本信息不允许编辑
    if (ver.status === 'archived') {
      return;
    }
    setEditingVersion(ver);
    setIsCreateOpen(true);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] border border-slate-200 text-slate-700 font-sans overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/10 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>阶段版本时间轴与厂区移泊演进</span>
                {projectId && (
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80">
                    {projectId}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                按施工阶段显示项目版本代号、阶段名称、生效时间段及停泊位演进路线
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs active:scale-98 cursor-pointer"
              title="查看全厂区停泊位与码头分布示意图"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-600" />
              <span>泊位示意图</span>
            </button>
            <button 
              onClick={handleOpenCreate} 
              disabled={isProjectCompleted}
              title={isProjectCompleted ? "本项目已竣工交船，无法新增阶段版本" : "新增阶段版本"}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                isProjectCompleted
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isProjectCompleted ? '新增阶段版本 (已竣工禁用)' : '新增阶段版本'}</span>
            </button>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Timeline */}
        <div className="p-6 sm:p-8 overflow-y-auto relative bg-slate-50/50 rounded-b-2xl">
          {/* 需求项3：已竣工交船状态强提醒 Banner */}
          {isProjectCompleted && (
            <div className="mb-5 p-3.5 bg-amber-50/90 border border-amber-300 text-amber-950 rounded-2xl text-xs flex items-start gap-3 shadow-2xs animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold text-sm text-amber-950 flex items-center gap-2">
                  <span>项目已进入【已竣工交船】与归档模式</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-bold">已归档封存</span>
                </strong>
                <p className="text-amber-800 leading-relaxed text-xs font-medium">
                  本项目已竣工，不允许创建新的阶段，所有本项目绑定的人员、设备和电子围栏设置已解除关联。
                </p>
              </div>
            </div>
          )}

          {/* Timeline continuous line background */}
          <div className="absolute left-[38px] sm:left-[51px] top-12 bottom-12 w-0.5 bg-slate-200"></div>

          <div className="space-y-6 pl-8 sm:pl-12 relative">
            {versions.map((version) => {
              const isActive = version.status === 'active';
              const isCompleted = version.projectStatus === 'completed';

              return (
                <div key={version.id} className="relative">
                  {/* Timeline node marker */}
                  {isCompleted ? (
                    <div className="absolute -left-[45px] sm:-left-[57px] top-5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-4 ring-emerald-100 shadow-sm z-10"></div>
                  ) : isActive ? (
                    <div className="absolute -left-[45px] sm:-left-[57px] top-5 w-3.5 h-3.5 bg-cyan-500 rounded-full ring-4 ring-cyan-100 shadow-sm z-10 animate-pulse"></div>
                  ) : (
                    <div className="absolute -left-[45px] sm:-left-[57px] top-5 w-3.5 h-3.5 bg-slate-400 rounded-full ring-4 ring-white shadow-sm z-10"></div>
                  )}

                  {/* Card Container */}
                  <div className={`bg-white rounded-2xl p-4 sm:p-5 transition-all ${
                    isCompleted
                      ? 'border-2 border-emerald-400/80 shadow-md shadow-emerald-500/5 bg-gradient-to-br from-white via-white to-emerald-50/20'
                      : isActive 
                        ? 'border-2 border-cyan-400/90 shadow-md shadow-cyan-500/5' 
                        : 'border border-slate-200 shadow-2xs'
                  }`}>
                    {/* Top Row: Version number, Phase name, Status Badge & Edit Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded border ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : isActive 
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {version.versionNumber}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">
                          {version.phaseName}
                        </h3>
                        {/* 阶段施工状态徽章 */}
                        {version.projectStatus && version.projectStatus !== 'completed' && (() => {
                          const statusConfig = PROJECT_STATUS_OPTIONS.find(o => o.value === version.projectStatus);
                          if (!statusConfig) return null;
                          return (
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${statusConfig.badgeBg}`}>
                              {statusConfig.label}
                            </span>
                          );
                        })()}
                        {isCompleted ? (
                          <span className="text-[10px] border border-emerald-300 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            已竣工交付
                          </span>
                        ) : isActive ? (
                          <span className="text-[10px] border border-cyan-300 text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
                            当前最新活跃版本
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-medium border border-slate-200">
                            已结束归档
                          </span>
                        )}
                      </div>

                      {/* 编辑按钮：已竣工项目或历史阶段版本不可编辑 */}
                      {isActive && !isCompleted ? (
                        <button 
                          onClick={() => handleOpenEdit(version)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-all active:scale-95 cursor-pointer shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                          <span>编辑阶段</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg select-none">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{isCompleted ? '已竣工归档 (禁止编辑)' : '历史版本 (禁止编辑)'}</span>
                        </div>
                      )}
                    </div>

                    {/* Details Body: Time period, Berth info, Personnel count */}
                    <div className="space-y-2.5 text-xs text-slate-700">
                      {/* 时间段 */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-emerald-600' : isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                        <span className="text-slate-400 font-medium">时间段:</span>
                        {isActive ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 bg-blue-50/80 text-blue-900 px-2 py-0.5 rounded border border-blue-200/80">
                              生效起始时间：{version.startDate}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                              isCompleted ? 'text-emerald-800 bg-emerald-100 border-emerald-300' : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            }`}>
                              {isCompleted ? '已竣工封存' : '至今 (当前持续生效中)'}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {version.startDate} 至 {version.endDate || '结束'}
                          </span>
                        )}
                      </div>

                      {/* 停泊位信息 */}
                      <div className="flex flex-wrap items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-slate-400 font-medium">停泊位与解绑信息:</span>
                        {isCompleted ? (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            已竣工交付离厂
                          </span>
                        ) : version.projectStatus === 'temporary_departure' || version.berthName?.includes('临时离港') ? (
                          <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-flex items-center gap-1">
                            🚢 临时离港 (厂区停泊位已自动释放)
                          </span>
                        ) : (
                          <>
                            <span className="font-bold text-slate-800">
                              #{version.berthCode ?? 1} {version.berthName ?? '1号船台'}
                            </span>
                            {version.berthSlotNumber && (
                              <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[11px]">
                                {version.berthSlotNumber}号位
                              </span>
                            )}
                            {version.berthCategoryName && (
                              <span className="text-slate-500 text-[11px]">
                                ({version.berthCategoryName})
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* 项目关联人员 */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-slate-400 font-medium">项目关联人员:</span>
                        {isCompleted ? (
                          <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            0 名作业人员 (竣工自动离场解绑)
                          </span>
                        ) : (
                          <>
                            <span className="font-bold text-slate-800 bg-indigo-50 text-indigo-900 px-2 py-0.5 rounded border border-indigo-200/80 text-[11px]">
                              {version.associatedPersonnelIds?.length ?? version.associatedPersonnelCount ?? 12} 名作业人员
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              (已绑定阶段项目组权限与全维空间轨迹感知)
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end items-center shrink-0 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
          >
            关闭时间轴
          </button>
        </div>
      </div>
      
      <CreateVersionModal 
        isOpen={isCreateOpen} 
        onClose={() => {
          setIsCreateOpen(false);
          setEditingVersion(null);
        }} 
        onSave={handleSaveVersion}
        projectName={projectName}
        shipType={shipType}
        editVersion={editingVersion}
        previousProjectStatus={previousProjectStatus}
      />

      {/* 厂区停泊位示意图查看模态框 */}
      {showMapModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowMapModal(false)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-700/90 rounded-2xl p-4 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>船厂厂区停泊位场景示意图 (2026-09-16新版)</span>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    assets/shipyard_berths_map_0916.png
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 min-h-0 bg-slate-950/60 rounded-xl mt-3 border border-slate-800/80">
              <img
                src="/assets/shipyard_berths_map_0916.png"
                alt="东南造船厂厂区停泊位场景示意图"
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-md select-none"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = 'assets/shipyard_berths_map_0916.png';
                  }
                }}
              />
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px]">包含1-4号码头、5号2万吨船台、6号平船台共六大停泊区域</span>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


