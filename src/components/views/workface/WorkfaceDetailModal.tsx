/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理：作业面详情模态框
 * 优化：按聚焦模式需求删除状态徽标、测算划定面积及边界周长信息项
 */

import React from 'react';
import { 
  X, 
  Layers, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Building2, 
  Phone, 
  Edit3, 
  ShieldCheck, 
  Ship,
  Box
} from 'lucide-react';
import { WorkfaceRecord } from '@/src/data/workfaceData';

interface WorkfaceDetailModalProps {
  isOpen: boolean;
  workface: WorkfaceRecord | null;
  onClose: () => void;
  onEdit?: (wf: WorkfaceRecord) => void;
}

export function WorkfaceDetailModal({
  isOpen,
  workface,
  onClose,
  onEdit
}: WorkfaceDetailModalProps) {
  if (!isOpen || !workface) return null;

  // 判断是否为有限空间 (船模/有限空间)
  const isConfinedSpace = workface.belongingType === 'project' || workface.workfaceType === '有限空间';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部 Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {workface.code}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {workface.name}
              </h2>

              {/* 作业面类型徽标 */}
              {isConfinedSpace ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>有限空间</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                  <span>作业面</span>
                </span>
              )}

              {/* 归属类型徽标 */}
              {workface.belongingType === 'yard' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>船厂厂区</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1">
                  <Ship className="w-3 h-3" />
                  <span>船舶建造项目</span>
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500">
              作业面配置详情台账 · 创建时间：{workface.createdAt}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(workface)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>编辑</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 详情内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. 基础配置 */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>{isConfinedSpace ? '有限空间基础信息与结构设置' : '作业面基础信息与结构设置'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400">{isConfinedSpace ? '有限空间编号：' : '作业面编号：'}</span>
                <span className="text-slate-800 font-mono font-semibold ml-1">{workface.code}</span>
              </div>

              <div>
                <span className="text-slate-400">{isConfinedSpace ? '有限空间名称：' : '作业面名称：'}</span>
                <span className="text-slate-800 font-medium ml-1">{workface.name}</span>
              </div>

              <div>
                <span className="text-slate-400">空间上限人数：</span>
                <span className="text-slate-800 font-mono font-bold ml-1">{workface.capacityLimit || 15} 人</span>
              </div>

              <div>
                <span className="text-slate-400">归属区域类型：</span>
                <span className="text-slate-800 font-medium ml-1">
                  {workface.belongingType === 'yard' ? '船厂厂区' : '船模类型 (建造船模)'}
                </span>
              </div>

              <div>
                <span className="text-slate-400">
                  {isConfinedSpace ? '关联船模与分层：' : '所属厂区工位：'}
                </span>
                <span className="text-slate-800 font-medium ml-1">
                  {workface.belongingType === 'yard' 
                    ? `${workface.yardZoneName || '厂区'} · ${workface.yardSubAreaName || workface.dockingArea}`
                    : `${workface.shipModelName || workface.projectName} · ${workface.shipModelLayerName || workface.modelLevelName}`}
                </span>
              </div>

              {isConfinedSpace && workface.volume && (
                <div>
                  <span className="text-slate-400">空间容积：</span>
                  <span className="text-emerald-700 font-mono font-semibold ml-1">{workface.volume} m³</span>
                </div>
              )}

              {workface.belongingType === 'yard' && workface.yardSpecs && (
                <div>
                  <span className="text-slate-400">工位规格：</span>
                  <span className="text-slate-800 font-mono ml-1">{workface.yardSpecs}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. 责任安全员 (仅厂区/作业面类型显示，有限空间不显示) */}
          {!isConfinedSpace && workface.belongingType === 'yard' && (
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>责任安全员配置</span>
              </h3>

              {workface.safetyOfficers && workface.safetyOfficers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {workface.safetyOfficers.map((officer, idx) => (
                    <div key={officer.id || idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 shadow-2xs">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>{officer.name}</span>
                        <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          定位标签: {officer.tagCode || officer.id || 'TAG-SO-01'}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px] flex items-center justify-between pt-1">
                        <span>班组：{officer.department || '造船安监科'}</span>
                        <span className="font-mono text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {officer.phone || workface.safetyOfficerPhone}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>{workface.safetyOfficer || '未配置'}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] flex items-center justify-between pt-1">
                    <span>联系电话：</span>
                    <span className="font-mono text-slate-700">{workface.safetyOfficerPhone || '-'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. 作业面区域划定与空间坐标 */}
          <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>三维空间区域划定</span>
            </h3>

            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">划定形状</span>
              <span className="font-bold text-slate-800">
                {workface.areaDefinition?.areaShape || (workface.fence?.type === 'rectangle' ? '标准矩形框选' : '多边形轮廓')}
              </span>
            </div>

            {/* 空间坐标点说明 */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
              <div className="text-[11px] font-sans font-medium text-slate-500 mb-1">空间控制点坐标矩阵：</div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[11px] break-all">
                {workface.areaDefinition?.coordinatesText || '[25.4, 25.8  58.2, 25.8  58.2, 68.4  25.4, 68.4]'}
              </div>
            </div>
          </div>

          {/* 4. 关联绑定感知设备：类型为“作业面”时仅显示定位主基站，类型为“有限空间”时不显示 */}
          {!isConfinedSpace && (
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>关联绑定感知设备</span>
              </h3>

              {/* 仅显示定位主基站 */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span>定位主基站 ({workface.boundBaseStations?.length || 0})</span>
                </div>
                {workface.boundBaseStations && workface.boundBaseStations.length > 0 ? (
                  <div className="space-y-1">
                    {workface.boundBaseStations.map(bs => (
                      <div key={bs.id} className="text-[11px] text-slate-600 font-mono bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{bs.name} <span className="text-slate-400">({bs.code})</span></span>
                        <span className="text-slate-500">信号覆盖范围: {bs.coverage}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 py-1">未绑定主基站</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部 Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-400">
            更新时间：{workface.updatedAt}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
