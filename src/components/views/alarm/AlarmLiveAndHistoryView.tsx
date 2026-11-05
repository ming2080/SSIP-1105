import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCw, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  CheckCircle, 
  UserCheck, 
  FileText,
  SlidersHorizontal,
  FolderKanban,
  Wind,
  Activity,
  ShieldAlert,
  User,
  Users,
  Cpu,
  Ship,
  Building2
} from 'lucide-react';
import { AlarmEventRecord, AlarmAttachment } from '@/src/types/alarmRecord';
import { INITIAL_ALARM_RECORDS, getStoredAlarmRecords, saveStoredAlarmRecords } from '@/src/data/alarmRecordData';
import { AlarmRecordDetailModal } from './AlarmRecordDetailModal';
import { AlarmSimpleProcessModal } from './AlarmSimpleProcessModal';
import { AlarmRuleItem } from '@/src/data/alarmData';

// 区分策略类型大类：人员触发告警 vs 环境检测告警
export type AlarmTriggerCategory = 'person' | 'environment';

export function getPolicyTriggerCategory(record: AlarmEventRecord): AlarmTriggerCategory {
  const envKeywords = ['气', '温', '湿', '尘', '氧', '烟', '水', '毒', '压', '风', '环境'];
  if (
    record.policyType.includes('气') || 
    record.policyType.includes('环境') ||
    record.policyType.includes('烟') ||
    envKeywords.some(k => record.policyName.includes(k)) ||
    record.conditionDesc.includes('ppm') ||
    record.conditionDesc.includes('浓度')
  ) {
    return 'environment';
  }
  return 'person';
}

// 获取项目关联情况：无项目关联 (厂区范围内) vs 造船项目关联
export function getProjectAssociation(record: AlarmEventRecord): {
  type: 'none' | 'shipbuilding';
  label: string;
  subLabel: string;
  projectName: string;
} {
  const isNone = record.projectType === 'none' || !record.projectName || record.projectName === '无项目关联' || record.projectName === '厂区范围内';
  if (isNone) {
    return {
      type: 'none',
      label: '无项目关联',
      subLabel: '厂区范围内',
      projectName: '厂区范围内'
    };
  }
  const cleanName = record.projectName.replace(/\s*\([^)]*\)/g, '').trim() || record.projectName;
  return {
    type: 'shipbuilding',
    label: '造船项目关联',
    subLabel: record.projectName,
    projectName: cleanName
  };
}

interface AlarmLiveAndHistoryViewProps {
  onViewRulePolicy?: (policyName: string, versionId: string) => void;
  rules?: AlarmRuleItem[];
  onNavigateToAnalytics?: () => void;
}

export function AlarmLiveAndHistoryView({ onViewRulePolicy }: AlarmLiveAndHistoryViewProps) {
  // 数据集状态
  const [records, setRecords] = useState<AlarmEventRecord[]>(() => getStoredAlarmRecords());

  // 监听广播联动更新
  useEffect(() => {
    const handleAlarmUpdate = (e: any) => {
      if (e.detail?.records) {
        setRecords(e.detail.records);
      }
    };
    window.addEventListener('alarm_records_updated', handleAlarmUpdate);
    return () => window.removeEventListener('alarm_records_updated', handleAlarmUpdate);
  }, []);

  // 弹窗状态
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<AlarmEventRecord | null>(null);
  const [selectedRecordForProcess, setSelectedRecordForProcess] = useState<AlarmEventRecord | null>(null);

  // 快速状态切换 Tab: 全部 | 待处理 | 已处理
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'pending' | 'closed'>('all');

  // 筛选字段
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterCategory, setFilterCategory] = useState<'' | 'person' | 'environment'>('');
  const [filterProjectAssoc, setFilterProjectAssoc] = useState<'' | 'shipbuilding' | 'none'>('');
  const [filterDeviceType, setFilterDeviceType] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // 动态提取全部设备类型 (按环境检测及设备类型聚合)
  const deviceTypeList = useMemo(() => {
    const types = new Set<string>();
    records.forEach(r => {
      if (r.deviceType) types.add(r.deviceType);
      if (r.deviceName) types.add(r.deviceName);
    });
    // 确保工业监测标准设备类型完备
    ['在线物联网传感探头', '工业在线气体分析仪', '防爆型固定式可燃气体探测仪', '多参数复合气体检测变送器'].forEach(t => types.add(t));
    return Array.from(types).filter(Boolean);
  }, [records]);

  // 动态提取全部班组信息 (按人员触发类所属班组聚合)
  const deptList = useMemo(() => {
    const depts = new Set<string>();
    records.forEach(r => {
      if (r.personDept) depts.add(r.personDept);
    });
    return Array.from(depts).filter(Boolean);
  }, [records]);

  // 提示信息
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ===================== 2. 统计区计算 (严格按用户要求4项) =====================
  // 1) 待处理告警数：统计未处理告警总数 (即非 closed 且非 false_alarm)
  const pendingCount = records.filter(r => r.processStatus !== 'closed' && r.processStatus !== 'false_alarm').length;

  // 2) 告警总数：统计所有已处理与未处理告警数量总数
  const totalCount = records.length;

  // 3) 触发告警人数：统计人员行为触发的告警总数 (有具体人员违章或触发的记录)
  const personTriggeredCount = records.filter(
    r => r.targetPerson && r.targetPerson !== '全员' && r.targetPerson !== '未知' && r.targetPerson !== '-'
  ).length;

  // 4) 告警处理闭环率：统计告警处理解决的完成率
  const closedCount = records.filter(r => r.processStatus === 'closed' || r.processStatus === 'false_alarm').length;
  const closeRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 100;

  // 辅助函数：清洗项目名，去除编号 (如 "H1821A" 之类)
  const cleanProjectName = (rawName: string) => {
    if (!rawName) return '厂区范围内';
    const cleaned = rawName.replace(/\s*\([^)]*\)/g, '').trim();
    return cleaned || '厂区范围内';
  };

  // 辅助函数：简化触发条件，提取核心语义
  const cleanConditionDesc = (rawCond: string) => {
    if (!rawCond) return '-';
    // 去除过长的辅助说明，只保留核心判定规则
    return rawCond.split('持续')[0].split('且')[0].trim();
  };

  // 辅助函数：判断是否已处理
  const isRecordClosed = (rec: AlarmEventRecord) => {
    return rec.processStatus === 'closed' || rec.processStatus === 'false_alarm';
  };

  // 过滤后的列表
  const filteredList = records.filter(record => {
    // 快速状态切换过滤
    if (activeStatusTab === 'pending' && isRecordClosed(record)) return false;
    if (activeStatusTab === 'closed' && !isRecordClosed(record)) return false;

    // 关联项目判定
    const projAssoc = getProjectAssociation(record);

    // 关键词搜索 (支持策略名、人员、所属班组、设备名、设备编号、设备类型、项目名、发生区域)
    const matchesKeyword = !searchKeyword.trim() || 
      record.policyName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      projAssoc.label.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      projAssoc.projectName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (record.targetPerson && record.targetPerson.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (record.personDept && record.personDept.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (record.deviceName && record.deviceName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (record.deviceCode && record.deviceCode.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (record.deviceType && record.deviceType.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      record.areaName.toLowerCase().includes(searchKeyword.toLowerCase());

    // 级别筛选
    const matchesLevel = !filterLevel || record.currentLevel === filterLevel;

    // 策略大类筛选 (人员触发 / 环境检测)
    const category = getPolicyTriggerCategory(record);
    const matchesCategory = !filterCategory || category === filterCategory;

    // 关联项目筛选 (造船项目关联 vs 无项目关联)
    const matchesProject = !filterProjectAssoc || projAssoc.type === filterProjectAssoc;

    // 设备类型筛选 (按 deviceType 或 deviceName 匹配)
    const matchesDeviceType = !filterDeviceType || 
      record.deviceType === filterDeviceType ||
      record.deviceName === filterDeviceType ||
      (record.deviceName && record.deviceName.includes(filterDeviceType));

    // 班组信息筛选 (按 personDept 匹配)
    const matchesDept = !filterDept || 
      record.personDept === filterDept ||
      (record.personDept && record.personDept.includes(filterDept));

    return matchesKeyword && matchesLevel && matchesCategory && matchesProject && matchesDeviceType && matchesDept;
  });

  // 重置筛选
  const handleResetFilters = () => {
    setSearchKeyword('');
    setFilterLevel('');
    setFilterCategory('');
    setFilterProjectAssoc('');
    setFilterDeviceType('');
    setFilterDept('');
    setActiveStatusTab('all');
  };

  // 提交简单处理
  const handleProcessSubmit = (
    recordId: string, 
    newStatus: 'closed' | 'false_alarm' | 'pending', 
    handler: string, 
    notes: string,
    attachments?: AlarmAttachment[]
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return {
          ...rec,
          processStatus: newStatus,
          isRealtime: newStatus === 'pending',
          handler: handler,
          correctiveActions: notes,
          closedTime: newStatus === 'closed' ? (rec.closedTime || nowStr) : rec.closedTime,
          attachments: attachments || rec.attachments
        };
      }
      return rec;
    }));

    // 若当前正在查看详情弹窗，同步更新详情对象
    setSelectedRecordForDetail(prev => {
      if (prev && prev.id === recordId) {
        return {
          ...prev,
          processStatus: newStatus,
          isRealtime: newStatus === 'pending',
          handler: handler,
          correctiveActions: notes,
          closedTime: newStatus === 'closed' ? (prev.closedTime || nowStr) : prev.closedTime,
          attachments: attachments || prev.attachments
        };
      }
      return prev;
    });

    setToastMessage(`告警记录 [${recordId}] 已成功${newStatus === 'closed' ? '完成处理' : newStatus === 'false_alarm' ? '标记为误报消除' : '重新置为待处理'}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 快速切换处理状态
  const handleQuickToggleStatus = (record: AlarmEventRecord) => {
    const nextStatus = isRecordClosed(record) ? 'pending' : 'closed';
    handleProcessSubmit(
      record.id, 
      nextStatus, 
      nextStatus === 'closed' ? '安全管理员' : '', 
      nextStatus === 'closed' ? '已排查确认并解除告警。' : ''
    );
  };

  return (
    <div className="flex flex-col h-full bg-white p-5">
      
      {/* 顶部操作提示 */}
      {toastMessage && (
        <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            关闭
          </button>
        </div>
      )}

      {/* 2. 告警数据统计区 (严格按用户要求的4项数据统计与显示，已去除冗余备注文字) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4 shrink-0">
        
        {/* 1）待处理告警数 */}
        <div className="p-4 bg-gradient-to-br from-red-50/80 to-white rounded-xl border border-red-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-600/90 block mb-1">
              待处理告警数
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-red-700 font-mono tracking-tight">
                {pendingCount}
              </span>
              <span className="text-[11px] text-red-500 font-medium">起待办</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* 2）告警总数 */}
        <div className="p-4 bg-gradient-to-br from-blue-50/80 to-white rounded-xl border border-blue-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-700/90 block mb-1">
              告警总数
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-blue-800 font-mono tracking-tight">
                {totalCount}
              </span>
              <span className="text-[11px] text-blue-500 font-medium">起累计</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* 3）触发告警人数 */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-white rounded-xl border border-indigo-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-700/90 block mb-1">
              触发告警人数
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-indigo-800 font-mono tracking-tight">
                {personTriggeredCount}
              </span>
              <span className="text-[11px] text-indigo-500 font-medium">人次</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* 4）告警处理闭环率 */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700/90 block mb-1">
              告警处理闭环率
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-800 font-mono tracking-tight">
                {closeRate}%
              </span>
              <span className="text-[11px] text-emerald-500 font-medium">已办结 {closedCount} 起</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. 搜索与筛选工具栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 shrink-0">
        
        {/* 左侧状态快速筛选 */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeStatusTab === 'all'
                ? 'bg-white text-slate-800 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            全部告警 ({records.length})
          </button>
          <button
            onClick={() => setActiveStatusTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeStatusTab === 'pending'
                ? 'bg-white text-red-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            待处理 ({pendingCount})
          </button>
          <button
            onClick={() => setActiveStatusTab('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeStatusTab === 'closed'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            已处理 ({closedCount})
          </button>
        </div>

        {/* 右侧组合查询条件 */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索策略/项目/人员/区域..." 
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-52 placeholder-slate-400 bg-white" 
            />
          </div>

          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="">全部级别</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>

          {/* 策略类型大类筛选：人员触发 vs 环境检测 */}
          <select 
            value={filterCategory}
            onChange={(e) => {
              const val = e.target.value as '' | 'person' | 'environment';
              setFilterCategory(val);
              if (val === 'person') {
                setFilterDeviceType(''); // 切换到人员触发时重置设备类型
              } else if (val === 'environment') {
                setFilterDept(''); // 切换到环境检测时重置班组信息
              } else {
                setFilterDeviceType('');
                setFilterDept('');
              }
            }}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer font-medium"
          >
            <option value="">全部策略分类</option>
            <option value="person">人员触发</option>
            <option value="environment">环境检测</option>
          </select>

          {/* 当策略分类为人员触发时，显示班组信息的过滤条件选择框 */}
          {filterCategory === 'person' && (
            <select 
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-blue-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-blue-50/40 cursor-pointer max-w-[170px]"
              title="按班组信息分类查询"
            >
              <option value="">全部班组信息</option>
              {deptList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}

          {/* 当策略分类为环境检测时，显示设备类型过滤条件选择框 */}
          {filterCategory === 'environment' && (
            <select 
              value={filterDeviceType}
              onChange={(e) => setFilterDeviceType(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-cyan-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-cyan-50/40 cursor-pointer max-w-[170px]"
              title="按设备类型分类查询"
            >
              <option value="">全部设备类型</option>
              {deviceTypeList.map(dtype => (
                <option key={dtype} value={dtype}>{dtype}</option>
              ))}
            </select>
          )}

          {/* 项目关联类型筛选：具体关联项目 vs 厂区范围内通用 */}
          <select 
            value={filterProjectAssoc}
            onChange={(e) => setFilterProjectAssoc(e.target.value as '' | 'shipbuilding' | 'none')}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="">全部关联类型</option>
            <option value="shipbuilding">具体关联项目</option>
            <option value="none">厂区范围内通用</option>
          </select>

          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="重置全部筛选条件"
          >
            <RotateCw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>

      </div>

      {/* 4. 告警信息列表 (支持造船项目/厂区范围双模展示，环境告警关联设备，人员告警关联人员) */}
      <div className="flex-1 overflow-auto border border-slate-200 rounded-xl shadow-2xs bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10 select-none">
            <tr>
              <th className="py-3 px-3 text-center w-12 whitespace-nowrap">序号</th>
              <th className="py-3 px-3 min-w-[160px]">策略名称</th>
              <th className="py-3 px-3 min-w-[145px] whitespace-nowrap">策略类型</th>
              <th className="py-3 px-3 min-w-[160px]">关联项目</th>
              <th className="py-3 px-3 min-w-[130px]">发生区域</th>
              <th className="py-3 px-3 min-w-[120px]">关联人员/设备</th>
              <th className="py-3 px-3 min-w-[130px]">所属班组/设备编号</th>
              <th className="py-3 px-3 min-w-[70px] whitespace-nowrap text-center">严重级别</th>
              <th className="py-3 px-3 min-w-[125px] whitespace-nowrap">发生时间</th>
              <th className="py-3 px-3 min-w-[90px] whitespace-nowrap text-center">当前状态</th>
              <th className="py-3 px-3 text-center min-w-[120px] sticky right-0 bg-slate-50 shadow-[-4px_0_8px_rgba(0,0,0,0.03)]">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <span>暂无符合筛选条件的告警日志记录</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredList.map((record, index) => {
                const closed = isRecordClosed(record);
                const triggerCategory = getPolicyTriggerCategory(record);
                const projAssoc = getProjectAssociation(record);

                return (
                  <tr 
                    key={record.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !closed ? 'bg-red-50/15' : ''
                    }`}
                  >
                    {/* 1. 序号 */}
                    <td className="py-3 px-3 text-center font-mono text-slate-400 whitespace-nowrap">
                      {index + 1}
                    </td>

                    {/* 2. 策略名称 */}
                    <td className="py-3 px-3">
                      <span 
                        onClick={() => setSelectedRecordForDetail(record)}
                        className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer block"
                        title={record.policyName}
                      >
                        {record.policyName}
                      </span>
                    </td>

                    {/* 3. 策略类型 (环境检测 / 人员触发 + 具体类型 同行显示不换行) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {triggerCategory === 'person' ? (
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded">
                            <User className="w-3 h-3 text-indigo-600 shrink-0" />
                            人员触发
                          </span>
                          <span className="text-xs text-slate-700 font-medium">
                            {record.policyType}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200/80 px-1.5 py-0.5 rounded">
                            <Wind className="w-3 h-3 text-cyan-600 shrink-0" />
                            环境检测
                          </span>
                          <span className="text-xs text-slate-700 font-medium">
                            {record.policyType}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 4. 关联项目 (简化：不显示造船项目关联/无项目关联标签，直接显示具体项目名或厂区范围内通用) */}
                    <td className="py-3 px-3">
                      {projAssoc.type === 'shipbuilding' && projAssoc.projectName ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium max-w-[210px]" title={projAssoc.projectName}>
                          <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{projAssoc.projectName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="whitespace-nowrap">厂区范围内通用</span>
                        </div>
                      )}
                    </td>

                    {/* 5. 发生区域 */}
                    <td className="py-3 px-3 text-slate-700">
                      <span className="truncate block max-w-[140px]" title={record.areaName}>
                        {record.areaName}
                      </span>
                    </td>

                    {/* 6. 关联人员/设备 (拆解列1：显示人员姓名或设备名称) */}
                    <td className="py-3 px-3 text-slate-800">
                      {triggerCategory === 'environment' ? (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 max-w-[160px]" title={record.deviceName || '气体智能传感探头'}>
                          <Cpu className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span className="truncate">{record.deviceName || '气体智能传感探头'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{record.targetPerson || '-'}</span>
                        </div>
                      )}
                    </td>

                    {/* 7. 所属班组/设备编号 (拆解列2：人员显示所属班组信息[不显示人员编号]，设备显示设备编号) */}
                    <td className="py-3 px-3 text-slate-700">
                      {triggerCategory === 'environment' ? (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="bg-slate-100 text-slate-700 font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200/80 text-[11px] whitespace-nowrap">
                            {record.deviceCode || 'GT-G04-A'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-slate-600 max-w-[160px]" title={record.personDept || '-'}>
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{record.personDept || '-'}</span>
                        </div>
                      )}
                    </td>

                    {/* 7. 严重级别 (高 / 中 / 低) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {record.currentLevel === '高' && (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold text-xs">
                          高
                        </span>
                      )}
                      {record.currentLevel === '中' && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold text-xs">
                          中
                        </span>
                      )}
                      {record.currentLevel === '低' && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold text-xs">
                          低
                        </span>
                      )}
                    </td>

                    {/* 9. 发生时间 */}
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                      {record.triggerTime}
                    </td>

                    {/* 10. 当前状态 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {closed ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          已处理
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          待处理
                        </span>
                      )}
                    </td>

                    {/* 11. 操作 */}
                    <td className="py-3 px-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/80 shadow-[-4px_0_8px_rgba(0,0,0,0.03)] whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* 详情查看 */}
                        <button
                          onClick={() => setSelectedRecordForDetail(record)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          详情
                        </button>

                        {/* 处理操作 */}
                        <button
                          onClick={() => setSelectedRecordForProcess(record)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            !closed
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {!closed ? '处理' : '已处理'}
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

      {/* 分页与统计底栏 */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 shrink-0 text-xs text-slate-500">
        <div>
          显示 <strong>{filteredList.length}</strong> / <strong>{records.length}</strong> 条记录
        </div>
        <div className="flex items-center gap-3">
          <select className="px-2 py-1 border border-slate-200 rounded text-slate-600 outline-none bg-white cursor-pointer">
            <option>10条/页</option>
            <option>20条/页</option>
            <option>50条/页</option>
          </select>
          <div className="flex gap-1">
            <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-400 bg-white cursor-pointer">&lt;</button>
            <button className="w-6 h-6 flex items-center justify-center border border-blue-600 rounded text-white bg-blue-600 font-bold cursor-pointer">1</button>
            <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-400 bg-white cursor-pointer">&gt;</button>
          </div>
        </div>
      </div>

      {/* 弹窗 1: 告警日志详情查看 */}
      {selectedRecordForDetail && (
        <AlarmRecordDetailModal
          isOpen={true}
          record={selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
          onOpenProcess={(rec) => {
            setSelectedRecordForDetail(null);
            setSelectedRecordForProcess(rec);
          }}
        />
      )}

      {/* 弹窗 2: 简易实用的告警信息处理登记 */}
      {selectedRecordForProcess && (
        <AlarmSimpleProcessModal
          isOpen={true}
          record={selectedRecordForProcess}
          onClose={() => setSelectedRecordForProcess(null)}
          onSubmit={handleProcessSubmit}
        />
      )}

    </div>
  );
}
