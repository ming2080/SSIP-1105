import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  List, 
  Plus, 
  Search, 
  RotateCw, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Eye, 
  GitBranch, 
  ShieldAlert,
  Clock,
  Filter
} from 'lucide-react';
import { INITIAL_ALARM_RULES, AlarmRuleItem, ALARM_POLICY_TYPES, ALARM_AREA_TYPES } from '@/src/data/alarmData';
import { AlarmFormModal } from './AlarmFormModal';
import { AlarmDetailModal } from './AlarmDetailModal';
import { AlarmLiveAndHistoryView } from './alarm/AlarmLiveAndHistoryView';
import { AlarmAnalyticsDashboard } from './alarm/AlarmAnalyticsDashboard';

interface AlarmConfigProps {
  initialTab?: 'analytics' | 'rules' | 'records';
}

export function AlarmConfig({ initialTab }: AlarmConfigProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'rules' | 'records'>(initialTab || 'rules');
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [rules, setRules] = useState<AlarmRuleItem[]>(INITIAL_ALARM_RULES);
  
  // 模态框状态
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlarmRuleItem | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingRule, setViewingRule] = useState<AlarmRuleItem | null>(null);

  const [latestCreatedId, setLatestCreatedId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 搜索和多维筛选状态 (严格对齐 7 大策略类型与 3 大空间范围)
  const [filterName, setFilterName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAreaType, setFilterAreaType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // 筛选规则
  const filteredRules = rules.filter(r => {
    const matchesName = filterName ? r.name.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchesType = filterType ? r.type === filterType : true;
    const matchesArea = filterAreaType ? r.areaConditions.some(c => c.type === filterAreaType) : true;
    const matchesLevel = filterLevel ? r.level === filterLevel : true;
    const matchesStatus = filterStatus ? r.status === filterStatus : true;

    return matchesName && matchesType && matchesArea && matchesLevel && matchesStatus;
  });

  // 重置筛选
  const handleResetFilters = () => {
    setFilterName('');
    setFilterType('');
    setFilterAreaType('');
    setFilterLevel('');
    setFilterStatus('');
  };

  // 处理新建/编辑规则提交
  const handleFormSubmit = (rule: AlarmRuleItem, isEdit: boolean) => {
    if (isEdit) {
      // 编辑：更新列表中对应的项
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      setLatestCreatedId(rule.id);
      setSuccessToast(`已成功将告警配置「${rule.name}」更新至最新版本 ${rule.currentVersion}！`);
    } else {
      // 新建：置顶插入
      setRules(prev => [rule, ...prev]);
      setLatestCreatedId(rule.id);
      setSuccessToast(`成功创建告警配置：「${rule.name}」并发布初始版本 ${rule.currentVersion}！`);
    }

    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  // 打开新建弹窗
  const handleOpenCreate = () => {
    setEditingRule(null);
    setIsFormModalOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEdit = (rule: AlarmRuleItem) => {
    setEditingRule(rule);
    setIsFormModalOpen(true);
  };

  // 打开查看详情弹窗
  const handleOpenDetail = (rule: AlarmRuleItem) => {
    setViewingRule(rule);
    setIsDetailModalOpen(true);
  };

  // 删除规则
  const handleDeleteRule = (id: number, name: string) => {
    if (window.confirm(`确定要删除告警配置「${name}」及其所有历史版本记录吗？`)) {
      setRules(prev => prev.filter(r => r.id !== id));
      setSuccessToast(`已删除告警配置「${name}」`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="h-full">
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'analytics' && (
            <AlarmAnalyticsDashboard
              onNavigateToRules={() => setActiveTab('rules')}
              onNavigateToRecords={(filterType) => {
                window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'alarm_records', filterType } }));
              }}
            />
          )}

          {activeTab !== 'analytics' && (
            <div className="flex flex-col h-full p-5 bg-white">
              
              {/* 成功提示条 */}
              {successToast && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-semibold">{successToast}</span>
                  </div>
                  <button 
                    onClick={() => setSuccessToast(null)}
                    className="text-emerald-600 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded hover:bg-emerald-100/50 cursor-pointer"
                  >
                    关闭
                  </button>
                </div>
              )}

              {/* Top Filter Bar */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-4 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 shrink-0">策略名称</span>
                  <input 
                    type="text" 
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="搜索策略名称..." 
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-44 placeholder-slate-400 transition-shadow" 
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 shrink-0">策略类型</span>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-36 bg-white cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <option value="">全部策略类型</option>
                    {ALARM_POLICY_TYPES.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 shrink-0">区域范围</span>
                  <select 
                    value={filterAreaType}
                    onChange={(e) => setFilterAreaType(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-32 bg-white cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <option value="">全部区域范围</option>
                    {ALARM_AREA_TYPES.map(at => (
                      <option key={at} value={at}>{at}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 shrink-0">告警级别</span>
                  <select 
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-28 bg-white cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <option value="">全部级别</option>
                    <option value="低">低</option>
                    <option value="中">中</option>
                    <option value="高">高</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 shrink-0">启用状态</span>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-28 bg-white cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <option value="">全部状态</option>
                    <option value="启用">已启用</option>
                    <option value="禁用">已禁用</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button 
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1677ff] hover:bg-blue-600 text-white text-xs rounded-lg shadow-xs transition-colors font-medium cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" /> 查询
                  </button>
                  <button 
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 text-xs rounded-lg shadow-2xs transition-colors font-medium cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> 重置
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mb-3.5 flex items-center justify-between shrink-0">
                <button 
                  onClick={handleOpenCreate}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1677ff] text-white text-xs rounded-xl hover:bg-blue-600 transition-all font-semibold shadow-sm shadow-blue-500/20 active:scale-98 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> 新增告警策略
                </button>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>共检索到 <strong className="text-slate-800 font-bold">{filteredRules.length}</strong> 条告警策略</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-400">每次编辑将自动递增生成新版本并归档快照</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto border border-slate-200 rounded-xl shadow-2xs">
                <table className="w-full text-center text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="py-3 px-3 w-12 whitespace-nowrap">序号</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">告警策略名称</th>
                      <th className="py-3 px-3 whitespace-nowrap">当前生效版本</th>
                      <th className="py-3 px-3 whitespace-nowrap">策略类型</th>
                      <th className="py-3 px-3 whitespace-nowrap">适用区域范围</th>
                      <th className="py-3 px-3 w-20 whitespace-nowrap">告警级别</th>
                      <th className="py-3 px-3 w-24 whitespace-nowrap">分级通知</th>
                      <th className="py-3 px-3 w-20 whitespace-nowrap">生效周期</th>
                      <th className="py-3 px-3 w-20 whitespace-nowrap">状态</th>
                      <th className="py-3 px-3 w-36 whitespace-nowrap">最近修改时间</th>
                      <th className="py-3 px-4 w-44 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredRules.map((rule, idx) => {
                      const isNew = rule.id === latestCreatedId;
                      return (
                        <tr 
                          key={rule.id} 
                          className={`transition-colors group ${
                            isNew ? 'bg-blue-50/70 hover:bg-blue-100/50 font-medium' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 text-left font-medium text-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => handleOpenDetail(rule)}>
                                {rule.name}
                              </span>
                              {isNew && (
                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                                  NEW
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 🎯 需求1：版本信息展示与版本标签 */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenDetail(rule)}
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                              title="点击查看此版本快照与历史变更"
                            >
                              <GitBranch className="w-3 h-3 text-blue-600" />
                              <span>{rule.currentVersion || 'V1'}</span>
                              {rule.versions && rule.versions.length > 1 && (
                                <span className="text-[9px] bg-blue-200/70 text-blue-800 px-1 rounded">
                                  {rule.versions.length}版
                                </span>
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">{rule.type}</td>
                          
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex flex-wrap items-center justify-center gap-1">
                              {Array.from(new Set(rule.areaConditions?.map(c => c.type).filter(Boolean) || [])).map(aType => (
                                <span 
                                  key={aType} 
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border ${
                                    aType === '有限空间' 
                                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                      : aType === '电子围栏' 
                                      ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                      : 'bg-sky-50 text-sky-700 border-sky-200'
                                  }`}
                                >
                                  {aType}
                                </span>
                              ))}
                            </div>
                          </td>
                          
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold min-w-[36px] ${
                              rule.level === '高' 
                                ? 'text-red-700 bg-red-50 border border-red-200' 
                                : rule.level === '中' 
                                ? 'text-amber-700 bg-amber-50 border border-amber-200' 
                                : 'text-blue-700 bg-blue-50 border border-blue-200'
                            }`}>
                              {rule.level}
                            </span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-slate-600 font-medium">{rule.notify}</span>
                          </td>

                          <td className="py-3 px-3 whitespace-nowrap">
                            {rule.period === '联动【加班登记单】实际作业时段' ? (
                              <span className="text-blue-700 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1" title="联动【加班登记单】实际作业时段">
                                <Clock className="w-3 h-3 text-blue-600" /> 单据联动
                              </span>
                            ) : (
                              <span className="text-slate-500">{rule.period}</span>
                            )}
                          </td>
                          
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              rule.status === '启用' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {rule.status}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{rule.modifiedAt}</td>

                          {/* 🎯 需求2：操作栏增加【查看】功能，可按版本查看 */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleOpenDetail(rule)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="查看版本配置详情与历史快照"
                              >
                                <Eye className="w-3.5 h-3.5" /> 查看
                              </button>
                              
                              <button 
                                onClick={() => handleOpenEdit(rule)}
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="编辑并递增生成新版本"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> 编辑
                              </button>

                              <button 
                                onClick={() => handleDeleteRule(rule.id, rule.name)}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="删除告警配置"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> 删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t border-slate-100 shrink-0 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span>共 <strong>{filteredRules.length}</strong> 条记录</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select className="pl-2.5 pr-6 py-1 border border-slate-200 rounded text-slate-600 outline-none bg-white cursor-pointer hover:border-slate-300 transition-colors">
                      <option>10条/页</option>
                      <option>20条/页</option>
                      <option>50条/页</option>
                    </select>
                  </div>
                  <div className="flex gap-1">
                    <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:border-blue-500 hover:text-blue-500 bg-white transition-colors cursor-pointer">&lt;</button>
                    <button className="w-6 h-6 flex items-center justify-center border border-blue-600 rounded text-white bg-blue-600 font-bold">1</button>
                    <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded hover:border-blue-500 hover:text-blue-500 text-slate-600 bg-white transition-colors cursor-pointer">&gt;</button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>前往</span>
                    <input type="text" defaultValue="1" className="w-9 px-1 py-0.5 border border-slate-200 rounded text-center outline-none focus:border-blue-500" />
                    <span>页</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <AlarmLiveAndHistoryView 
              rules={rules}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
              onViewRulePolicy={(policyName, versionId) => {
                const targetRule = rules.find(r => r.name === policyName);
                if (targetRule) {
                  handleOpenDetail(targetRule);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* 新建/编辑告警配置弹窗 (带自动版本递增与项目关联) */}
      <AlarmFormModal
        isOpen={isFormModalOpen}
        editRule={editingRule}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRule(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* 查看告警配置与版本快照弹窗 */}
      <AlarmDetailModal
        isOpen={isDetailModalOpen}
        rule={viewingRule}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingRule(null);
        }}
        onEdit={(rule) => {
          handleOpenEdit(rule);
        }}
      />
    </div>
  );
}
