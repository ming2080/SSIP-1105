import React, { useState, useEffect } from 'react';
import { 
  X, 
  Eye, 
  GitBranch, 
  Clock, 
  User, 
  ShieldAlert, 
  BellRing, 
  Layers, 
  CheckCircle2, 
  Edit3, 
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AlarmRuleItem, AlarmRuleVersion } from '@/src/data/alarmData';

interface AlarmDetailModalProps {
  isOpen: boolean;
  rule: AlarmRuleItem | null;
  onClose: () => void;
  onEdit?: (rule: AlarmRuleItem) => void;
}

export function AlarmDetailModal({ isOpen, rule, onClose, onEdit }: AlarmDetailModalProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  // 默认每次打开或切换 rule 时，选中最新的版本
  useEffect(() => {
    if (isOpen && rule) {
      if (rule.versions && rule.versions.length > 0) {
        setSelectedVersionId(rule.versions[0].versionId);
      } else {
        setSelectedVersionId(rule.currentVersion || 'V1');
      }
    }
  }, [isOpen, rule]);

  if (!isOpen || !rule) return null;

  // 找出当前选中的版本对象，如果没找到则默认最新快照
  const currentVersionObj = rule.versions?.find(v => v.versionId === selectedVersionId) || rule.versions?.[0];
  const snapshot = currentVersionObj?.snapshot || {
    name: rule.name,
    type: rule.type,
    level: rule.level,
    areaConditions: rule.areaConditions || [],
    personConditions: rule.personConditions || [],
    conditionType: rule.conditionType,
    conditionOperator: rule.conditionOperator,
    conditionValue: rule.conditionValue,
    notifyTargets: rule.notifyTargets,
    notifyWays: rule.notifyWays,
    repeatInterval: rule.repeatInterval,
    effectivePeriod: rule.effectivePeriod,
    status: rule.status
  };

  const isLatestVersion = selectedVersionId === (rule.versions?.[0]?.versionId || rule.currentVersion);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-slate-700 font-sans"
      >
        {/* 1. 顶部栏与版本切换器 */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-blue-50/20 to-white border-b border-slate-100 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-slate-800 tracking-wide">
                    告警配置详情与版本快照
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                    snapshot.status === '启用' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${snapshot.status === '启用' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {snapshot.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {rule.name}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 🎯 需求2：可按版本查看告警信息，默认显示最新版本 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                <span>查看版本配置快照：</span>
              </div>
              
              <div className="relative">
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="px-3 py-1.5 bg-white border-2 border-blue-500/40 rounded-xl font-mono text-xs font-bold text-blue-900 focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs pr-8 hover:bg-blue-50/50 transition-colors"
                >
                  {rule.versions && rule.versions.map((ver, idx) => (
                    <option key={ver.versionId} value={ver.versionId}>
                      {ver.versionId} {idx === 0 ? '(⭐ 最新当前生效版本)' : `(历史归档 · ${ver.createdAt.split(' ')[0]})`}
                    </option>
                  ))}
                </select>
              </div>

              {isLatestVersion ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> 最新当前生效版本
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" /> 历史归档快照
                </span>
              )}
            </div>

            {/* 版本快照元信息 */}
            {currentVersionObj && (
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  生成于：<strong className="font-mono text-slate-700">{currentVersionObj.createdAt}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  操作人：<strong className="text-slate-700">{currentVersionObj.modifier}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 版本变更说明 */}
          {currentVersionObj?.changeNotes && (
            <div className="px-3 py-1.5 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-center gap-2">
              <span className="font-semibold shrink-0">📝 本版本变更说明：</span>
              <span>{currentVersionObj.changeNotes}</span>
            </div>
          )}
        </div>

        {/* 2. 详情内容主体 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-[13px]">

          {/* 模块1：生效设置与频次 */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                策略生效周期与告警频次
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">生效周期：</span>
                {snapshot.effectivePeriod === '联动【加班登记单】实际作业时段' ? (
                  <strong className="text-blue-800 font-bold bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> 联动【加班登记单】实际作业时段
                  </strong>
                ) : (
                  <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">{snapshot.effectivePeriod}</strong>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs flex items-center justify-between">
                <span className="text-slate-500 font-medium">告警频次：</span>
                <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-lg">{snapshot.repeatInterval}</strong>
              </div>
            </div>
          </div>

          {/* 模块2：策略基础属性与判断条件 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-xs block mb-1">策略类型</span>
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                {snapshot.type}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-xs block mb-1">主告警级别</span>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  snapshot.level === '高' 
                    ? 'text-red-700 bg-red-50 border border-red-200' 
                    : snapshot.level === '中' 
                    ? 'text-amber-700 bg-amber-50 border border-amber-200' 
                    : 'text-blue-700 bg-blue-50 border border-blue-200'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  {snapshot.level} 等级
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-slate-400 text-xs block mb-1">策略判断阈值与规则</span>
              <div className="font-mono text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1.5 rounded border border-slate-200/80">
                {snapshot.conditionType} {snapshot.conditionOperator} {snapshot.conditionValue}
              </div>
            </div>
          </div>

          {/* 模块3：区域范围与人员范围规则 (AND 条件链) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 区域范围 */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                区域范围限制条件
              </div>
              <div className="space-y-2">
                {snapshot.areaConditions && snapshot.areaConditions.length > 0 ? (
                  snapshot.areaConditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs">
                      <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${
                        cond.type === '有限空间'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : cond.type === '电子围栏'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {cond.type || '作业面'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[11px]">
                        {cond.relation === '否' ? '排除(否)' : '包含(是)'}
                      </span>
                      <span className="font-bold text-slate-800">{cond.target || '全部区域'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs italic">全厂区所有作业区域</div>
                )}
              </div>
            </div>

            {/* 人员范围 */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                人员范围限制条件
              </div>
              <div className="space-y-2">
                {snapshot.personConditions && snapshot.personConditions.length > 0 ? (
                  snapshot.personConditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs">
                      <span className="text-slate-500 font-medium">{cond.scope || '全员'}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[11px]">
                        {cond.relation === '否' ? '排除(否)' : '包含(是)'}
                      </span>
                      <span className="font-bold text-slate-800">{cond.target || '全体工人'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs italic">全厂所有作业工人</div>
                )}
              </div>
            </div>
          </div>

          {/* 模块4：多级联动升级通知机制 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase">
                <BellRing className="w-4 h-4 text-blue-600" />
                多级告警通知与超时升级策略
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>通知渠道：</span>
                {(() => {
                  const isTamper = snapshot.type === '标签防拆' || snapshot.type?.includes('防拆');
                  const ways = (snapshot.notifyWays || []).filter(w => !isTamper || w !== '声光报警通知');
                  if (ways.length > 0) {
                    return ways.map((w, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 text-[11px] font-medium">
                        {w}
                      </span>
                    ));
                  }
                  return <span className="text-slate-400">{isTamper ? '未开启短信通知' : '未指定'}</span>;
                })()}
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-24 text-center">告警等级</th>
                  <th className="py-2.5 px-4">通知指定对象</th>
                  <th className="py-2.5 px-4 w-60">触发升级倒计时</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">低</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {snapshot.notifyTargets?.low || <span className="text-slate-300">未配置</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {snapshot.notifyTargets?.lowCountdown ? (
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                        {snapshot.notifyTargets.lowCountdown} 超时升级至中级
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-center font-bold text-amber-600">中</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {snapshot.notifyTargets?.mid || <span className="text-slate-300">未配置</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {snapshot.notifyTargets?.midCountdown ? (
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                        {snapshot.notifyTargets.midCountdown} 超时升级至高级
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-center font-bold text-red-600">高</td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {snapshot.notifyTargets?.high || <span className="text-slate-300">未配置</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-400 italic">
                    最高级告警，即时全员警报
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 模块5：版本演进历史时间轴 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase">
                <GitBranch className="w-4 h-4 text-blue-600" />
                全生命周期版本迭代演进（共 {rule.versions?.length || 1} 个版本）
              </div>
              <span className="text-[11px] text-slate-400">
                每次编辑保存自动生成新版本并归档
              </span>
            </div>

            <div className="space-y-2">
              {rule.versions && rule.versions.map((ver, idx) => {
                const isSelected = ver.versionId === selectedVersionId;
                const isTop = idx === 0;
                return (
                  <div 
                    key={ver.versionId}
                    onClick={() => setSelectedVersionId(ver.versionId)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs px-2.5 py-0.5 rounded-lg font-bold ${
                        isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ver.versionId}
                      </span>
                      {isTop && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          最新
                        </span>
                      )}
                      <span className="text-xs text-slate-700 font-medium">
                        {ver.changeNotes || '版本快照已归档'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{ver.createdAt}</span>
                      <span className="text-slate-500 font-sans">({ver.modifier})</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. 底部操作栏 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0 rounded-b-2xl">
          <div className="text-xs text-slate-500">
            当前查看：<strong className="font-mono text-blue-700">{selectedVersionId}</strong>
            {isLatestVersion ? '（当前最新生效配置）' : '（历史快照）'}
          </div>

          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(rule);
                }}
                className="px-5 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 text-[13px] rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                编辑此策略并发布新版本
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-[13px] rounded-xl shadow-md shadow-blue-500/20 transition-all font-semibold cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
