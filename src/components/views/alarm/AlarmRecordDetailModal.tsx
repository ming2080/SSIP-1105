import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  User, 
  CheckCircle2,
  Layers,
  Wrench,
  Wind,
  Play,
  Image as ImageIcon,
  Video,
  Paperclip,
  Smartphone,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { AlarmEventRecord, AlarmAttachment } from '@/src/types/alarmRecord';

interface AlarmRecordDetailModalProps {
  isOpen: boolean;
  record: AlarmEventRecord | null;
  onClose: () => void;
  onOpenProcess?: (record: AlarmEventRecord) => void;
}

export function AlarmRecordDetailModal({
  isOpen,
  record,
  onClose,
  onOpenProcess
}: AlarmRecordDetailModalProps) {
  const [selectedMedia, setSelectedMedia] = useState<AlarmAttachment | null>(null);

  if (!isOpen || !record) return null;

  // 严重级别徽章：严格根据要求 3 显示为“高”、“中”、“低”
  const getLevelBadge = (level: string) => {
    switch (level) {
      case '高': 
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            高
          </span>
        );
      case '中': 
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            中
          </span>
        );
      case '低': 
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            低
          </span>
        );
      default: 
        return <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">{level}</span>;
    }
  };

  const isClosed = record.processStatus === 'closed' || record.processStatus === 'false_alarm' || record.processStatus === 'recovered';

  // 多级升级阶梯数据适配
  const defaultUpgradePlans = [
    {
      level: '低' as const,
      target: '当班安全员 / 班组长',
      countdown: '10分钟未响应升级',
      desc: '现场初级核实，语音与手环震动提醒'
    },
    {
      level: '中' as const,
      target: '车间安全主任 (林峰)',
      countdown: '5分钟未响应升级',
      desc: '车间级介入，现场短信推送与防爆声光警报'
    },
    {
      level: '高' as const,
      target: '安监总监 (陈志强) / 现场指挥部',
      countdown: '最高级别现场联动',
      desc: '全厂级调度，全面停机避险并启动应急处置'
    }
  ];

  const upgradePlans = (record.upgradePlans && record.upgradePlans.length > 0) 
    ? record.upgradePlans.map((p, idx) => ({
        level: p.level,
        target: p.target,
        countdown: p.countdown,
        desc: defaultUpgradePlans[idx]?.desc || '按预案通知联动'
      }))
    : defaultUpgradePlans;

  // 业务规则：所有响应均从低级开始，保留实际经历的响应升级过程；未上升到达的高阶级别不显示
  const levelRank: Record<string, number> = { '低': 1, '中': 2, '高': 3 };
  const currentRank = levelRank[record.currentLevel] || 1;

  // 过滤出当前告警实际经历过的响应级别 (低级必有；达到中级则显示低+中；达到高级则显示低+中+高)
  const activeUpgradePlans = upgradePlans.filter(p => (levelRank[p.level] || 1) <= currentRank);

  // 业务规则：告警最终处理人只能有一个，高亮有且仅显示一个
  const finalHandlerLevel = (() => {
    if (!isClosed || !record.handler || record.handler === '-' || record.handler === '未处理') {
      return null;
    }
    const h = record.handler.trim();

    // 1. 优先在已激活的响应级别中，精准匹配处理人身份关键词
    const highPlan = activeUpgradePlans.find(p => p.level === '高');
    if (highPlan && (highPlan.target.includes(h) || h.includes('陈志强') || h.includes('总监') || h.includes('指挥部') || h.includes('安监'))) {
      return '高';
    }

    const midPlan = activeUpgradePlans.find(p => p.level === '中');
    if (midPlan && (midPlan.target.includes(h) || h.includes('林峰') || h.includes('车间') || h.includes('主任'))) {
      return '中';
    }

    const lowPlan = activeUpgradePlans.find(p => p.level === '低');
    if (lowPlan && (lowPlan.target.includes(h) || h.includes('班组长') || h.includes('安全员') || h.includes('张强') || h.includes('李伟') || h.includes('王建国'))) {
      return '低';
    }

    // 2. 若未特异命中姓名，以处置闭环时的当前响应级别作为唯一的处理人所属级别
    if (activeUpgradePlans.some(p => p.level === record.currentLevel)) {
      return record.currentLevel;
    }

    // 3. 兜底为经历的最后一级
    return activeUpgradePlans[activeUpgradePlans.length - 1]?.level || '低';
  })();

  // 提取人员范围列表数据（匹配图片业务要素）
  const getPersonsList = () => {
    if (record.targetPerson && record.targetPerson !== '未知' && record.targetPerson !== '-') {
      const raw = record.targetPerson.trim();
      const parts = raw.split(/[、,，\s]+/).filter(Boolean);
      if (parts.length > 1) {
        return parts;
      }
      if (record.personDept && record.personRole) {
        return [`${raw} (${record.personRole} · ${record.personDept})`];
      }
      return [raw];
    }
    return ['厂区全员 / 现场当班作业人员 (全员生效)'];
  };
  const personsList = getPersonsList();

  // 策略条件展示（符合附件图业务要素）
  const getPolicyCondition = () => {
    if (!record.conditionDesc) return '告警时段 00:00:00 至 23:59:59';
    if (record.conditionDesc.includes('时段')) return record.conditionDesc;
    return `告警时段 00:00:00 至 23:59:59 (${record.conditionDesc})`;
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 text-slate-700 font-sans my-auto flex flex-col max-h-[92vh]"
      >
        {/* 顶部 Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              record.currentLevel === '高' 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : record.currentLevel === '中' 
                ? 'bg-amber-50 text-amber-600 border-amber-200' 
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-800">
                  告警记录详情
                </h2>
                {/* 策略分类：人员触发 vs 环境检测 */}
                {(() => {
                  const isEnv = record.policyType.includes('气') || 
                    record.policyType.includes('环境') || 
                    record.policyType.includes('烟') || 
                    ['气', '温', '湿', '尘', '氧', '烟', '水', '毒', '压', '风'].some(k => record.policyName.includes(k)) ||
                    record.conditionDesc.includes('ppm') ||
                    record.conditionDesc.includes('浓度');
                  return (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${
                      isEnv
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {isEnv ? <Wind className="w-3 h-3 text-cyan-600" /> : <User className="w-3 h-3 text-indigo-600" />}
                      {isEnv ? '环境检测' : '人员触发'}
                    </span>
                  );
                })()}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>严重级别：</span>
                  {getLevelBadge(record.currentLevel)}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                  isClosed 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-emerald-600' : 'bg-red-600'}`} />
                  {isClosed ? '已处理' : '待处理'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 详情主体：四大板块（顺序：告警触发情况、告警信息处理、告警级别升级情况、告警策略信息） */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* ======================= 1. 告警触发情况 ======================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 overflow-hidden">
            {/* 标题：▌ 告警触发情况 */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-rose-500 rounded-xs inline-block" />
                <h3 className="font-bold text-slate-900 text-xs tracking-wide">告警触发情况</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">起始触发级别:</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  低
                </span>
                {record.currentLevel !== '低' && (
                  <>
                    <span className="text-slate-300 text-[10px]">➔ 超时升级至</span>
                    {getLevelBadge(record.currentLevel)}
                  </>
                )}
                <span className="text-[11px] text-slate-300">|</span>
                <span className="text-[11px] text-slate-400">持续时长:</span>
                <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {record.durationStr || '持续中'}
                </span>
              </div>
            </div>

            {/* 触发关键指标网格/表格 */}
            <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {/* 第 1 行：触发时间、现场实测值/状态、安全阈值标准 */}
                  <tr className="border-b border-slate-200">
                    <td className="w-[13%] bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      触发时间
                    </td>
                    <td className="w-[20%] bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200 font-mono font-medium">
                      {record.triggerTime}
                    </td>
                    <td className="w-[12%] bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      现场实测值/状态
                    </td>
                    <td className="w-[20%] bg-white text-rose-600 px-3.5 py-2.5 border-r border-slate-200 font-semibold font-mono">
                      {record.currentValue || '规则越限触发'}
                    </td>
                    <td className="w-[12%] bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      安全阈值标准
                    </td>
                    <td className="w-[23%] bg-white text-slate-800 px-3.5 py-2.5 font-medium font-mono">
                      {record.thresholdValue || '-'}
                    </td>
                  </tr>

                  {/* 第 2 行：发生区域位置、关联工程项目、触发判定条件 */}
                  <tr className="border-b border-slate-200">
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      发生区域位置
                    </td>
                    <td className="bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200">
                      {record.areaName}
                    </td>
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      关联工程项目
                    </td>
                    <td className="bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200">
                      {record.projectName ? record.projectName : '厂区范围内通用'}
                    </td>
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      触发判定条件
                    </td>
                    <td className="bg-white text-slate-800 px-3.5 py-2.5">
                      {record.conditionDesc}
                    </td>
                  </tr>

                  {/* 第 3 行：触发关联主体 (环境检测设备 vs 涉事人员及所属班组) */}
                  <tr>
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      触发关联主体
                    </td>
                    <td colSpan={5} className="bg-white text-slate-800 px-3.5 py-2.5">
                      {record.deviceName ? (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                          <div>
                            <span className="text-slate-400">检测设备：</span>
                            <span className="font-semibold text-slate-800">{record.deviceName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">设备编号：</span>
                            <span className="font-mono font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{record.deviceCode || '-'}</span>
                          </div>
                          {record.deviceType && (
                            <div>
                              <span className="text-slate-400">设备类型：</span>
                              <span className="text-slate-700">{record.deviceType}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                          <div>
                            <span className="text-slate-400">涉事人员：</span>
                            <span className="font-semibold text-slate-800">{record.targetPerson || '作业人员'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">所属班组：</span>
                            <span className="font-medium text-slate-700">{record.personDept || '-'}</span>
                          </div>
                          {record.personRole && (
                            <div>
                              <span className="text-slate-400">工种岗位：</span>
                              <span className="text-slate-700">{record.personRole}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          {/* ======================= 2. 告警信息处理 ======================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>告警信息处理</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                isClosed 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {isClosed ? '已处置闭环' : '待现场处置'}
              </span>
            </div>

            {/* 包含处理人、处理时间、处置情况说明以及图片/视频附件上传查看 */}
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. 处理人 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                  <span className="text-slate-400 block text-[11px] mb-1">处理人</span>
                  <span className="font-semibold text-slate-800 text-xs block">
                    {record.handler || (isClosed ? '林峰 (现场安全管理员)' : '待分配处理人')}
                  </span>
                </div>

                {/* 2. 处理时间 */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                  <span className="text-slate-400 block text-[11px] mb-1">处理时间</span>
                  <span className="font-mono font-semibold text-slate-800 text-xs block">
                    {record.closedTime || (isClosed ? record.triggerTime : '待处理完成')}
                  </span>
                </div>
              </div>

              {/* 3. 处置情况说明 */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <span className="text-slate-400 block text-[11px] mb-1">处置情况说明</span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {record.correctiveActions || record.causeAnalysis || (isClosed 
                    ? '现场复核排查作业工况正常，已落实隐患排查处置并完成通风置换，复测环境参数达标，准予安全复工。' 
                    : '现场正在核查排查中，暂未录入处置内容。点击下方“立即处理”可提交现场整改记录。')}
                </p>
              </div>

              {/* 4. 现场处理附件 (支持图片与视频附件，单文件≤50MB) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-semibold block text-[11px] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span>处理图片或视频附件</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    单个文件 ≤ 50MB · 共 {record.attachments?.length || 0} 个附件
                  </span>
                </div>

                {record.attachments && record.attachments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {record.attachments.map((att) => (
                      <div 
                        key={att.id}
                        onClick={() => setSelectedMedia(att)}
                        className="group relative bg-white border border-slate-200 rounded-lg p-2 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer overflow-hidden"
                      >
                        {/* 缩略图或视频卡片 */}
                        <div className="w-full h-24 bg-slate-100 rounded-md overflow-hidden relative flex items-center justify-center">
                          {att.type === 'video' ? (
                            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white/90">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                              </div>
                              <span className="text-[10px] text-slate-300">点击播放现场视频</span>
                            </div>
                          ) : (
                            <img 
                              src={att.url} 
                              alt={att.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          )}
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white backdrop-blur-xs">
                            {att.type === 'video' ? '现场视频' : '现场照片'}
                          </span>
                        </div>

                        {/* 文件信息 */}
                        <div className="mt-1.5">
                          <p className="text-[11px] font-semibold text-slate-800 truncate" title={att.name}>
                            {att.name}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono">{att.size}</span>
                            <span>{att.uploadTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center border border-dashed border-slate-200 rounded-lg bg-white/60">
                    <p className="text-slate-400 text-xs">暂无上传的现场图片或视频附件</p>
                    {onOpenProcess && !isClosed && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenProcess(record);
                        }}
                        className="mt-1 text-[11px] text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                      >
                        点击进入处理录入并上传佐证附件 (≤50MB) &gt;
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 5. 移动端H5解除通知回执与短信通知明细 (若已闭环生成) */}
              {record.releaseReceipt && (
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>移动端H5现场解除通知回执</span>
                    </div>
                    <span className="font-mono text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 font-bold">
                      回执号: {record.releaseReceipt.receiptNo}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">解除时间: </span>
                      <span className="font-mono font-semibold text-slate-800">{record.releaseReceipt.releasedAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">现场处置人: </span>
                      <span className="font-semibold text-slate-800">{record.releaseReceipt.handlerName} ({record.releaseReceipt.handlerPhone})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">复测指标: </span>
                      <span className="font-mono font-bold text-emerald-700">{record.releaseReceipt.retestMetrics}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">处置结论: </span>
                      <span className="font-bold text-slate-800">{record.releaseReceipt.releaseTypeLabel}</span>
                    </div>
                  </div>

                  {/* 短信通知送达情况 */}
                  {record.releaseReceipt.notifiedPersons && record.releaseReceipt.notifiedPersons.length > 0 && (
                    <div className="pt-2 border-t border-emerald-200/60">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>已发送告警解除短信通知 ({record.releaseReceipt.notifiedPersons.length}人):</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {record.releaseReceipt.notifiedPersons.map((p, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-200/80 text-[11px] space-y-0.5">
                            <div className="font-bold text-slate-800 flex items-center justify-between">
                              <span>{p.name}</span>
                              <span className="text-[10px] text-emerald-600">已送达</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">{p.phone}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 签名展示 */}
                  {record.releaseReceipt.signatureUrl && (
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">处置责任人手写签字:</span>
                      <div className="w-24 h-8 bg-white border border-emerald-200 rounded p-0.5 flex items-center justify-center">
                        <img src={record.releaseReceipt.signatureUrl} alt="签名" className="max-h-full max-w-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>


          {/* ======================= 3. 告警级别升级情况 ======================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 overflow-hidden">
            {/* 标题：▌ 告警级别升级情况 */}
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-1 h-3.5 bg-amber-500 rounded-xs inline-block" />
              <h3 className="font-bold text-slate-900 text-xs tracking-wide">告警级别升级情况</h3>
            </div>

            {/* 三等分区域显示 (即使只显示低级也固定占1/3区域) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              {activeUpgradePlans.map((plan, idx) => {
                // 确保有且仅有一个卡片高亮显示为最终处理人
                const isFinalHandler = finalHandlerLevel === plan.level;

                // 是否为历史已超时升级阶段
                const isHistoricalStage = idx < activeUpgradePlans.length - 1;
                // 是否为未闭环下的当前响应阶段
                const isPendingCurrent = !isClosed && idx === activeUpgradePlans.length - 1;

                return (
                  <div 
                    key={idx}
                    className={`p-3.5 rounded-xl transition-all relative ${
                      isFinalHandler
                        ? 'bg-emerald-50/70 border-2 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : isPendingCurrent 
                        ? 'bg-blue-50/40 border-2 border-blue-400 shadow-xs' 
                        : isHistoricalStage
                        ? 'bg-slate-50/80 border border-slate-200 text-slate-600'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {/* 最终处理人高亮加框徽章 */}
                    {isFinalHandler && (
                      <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 border border-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        告警最终处理人
                      </span>
                    )}

                    {/* 当前待响应级别徽章 */}
                    {isPendingCurrent && (
                      <span className="absolute -top-2.5 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                        当前响应级别
                      </span>
                    )}

                    {/* 历史超时流转徽章 */}
                    {isHistoricalStage && !isFinalHandler && (
                      <span className="absolute -top-2.5 right-3 bg-slate-500 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-2xs">
                        已超时升级
                      </span>
                    )}

                    {/* 升级框内三项信息：告警等级、触发倒计时升级时间、通知对象 */}
                    <div className="space-y-2.5 text-xs">
                      {/* 1. 告警等级 */}
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-1">告警等级</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${
                            plan.level === '高' 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : plan.level === '中' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {plan.level} 级
                          </span>
                          {isFinalHandler && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300">
                              处置责任级别
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 2. 触发倒计时升级时间 */}
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">触发倒计时升级时间</span>
                        <span className="font-semibold text-slate-800 font-mono text-xs block">
                          {plan.countdown}
                        </span>
                      </div>

                      {/* 3. 通知对象 */}
                      <div>
                        <span className="text-slate-400 block text-[11px] mb-0.5">通知对象</span>
                        <span className={`font-semibold text-xs block ${isFinalHandler ? 'text-emerald-900 font-bold' : 'text-slate-800'}`}>
                          {plan.target}
                        </span>
                        {isFinalHandler && (
                          <div className="mt-1.5 px-2 py-1 bg-emerald-100/90 rounded border border-emerald-300 text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                            <span>✓ 最终处理人：</span>
                            <span className="font-bold underline decoration-emerald-500">{record.handler || plan.target}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* ======================= 4. 告警策略信息 ======================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-5 overflow-hidden">
            {/* 标题：▌ 告警策略信息 */}
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-1 h-3.5 bg-[#1677ff] rounded-xs inline-block" />
              <h3 className="font-bold text-slate-900 text-xs tracking-wide">告警策略信息</h3>
            </div>

            {/* 业务要素表格（参考附件图展示） */}
            <div className="border border-slate-200 rounded-sm overflow-hidden text-xs">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {/* 第 1 行：告警策略名称、策略类型、策略条件 */}
                  <tr className="border-b border-slate-200">
                    <td className="w-[13%] bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      告警策略名称
                    </td>
                    <td className="w-[20%] bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200 font-medium">
                      {record.policyName}
                    </td>
                    <td className="w-[12%] bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      策略类型
                    </td>
                    <td className="w-[20%] bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200">
                      {record.policyType}
                    </td>
                    <td className="w-[12%] bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      策略条件
                    </td>
                    <td className="w-[23%] bg-white text-slate-800 px-3.5 py-2.5">
                      {getPolicyCondition()}
                    </td>
                  </tr>

                  {/* 第 2 行：通知方式、告警间隔、生效周期 */}
                  <tr className="border-b border-slate-200">
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      通知方式
                    </td>
                    <td className="bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200">
                      {record.notifyWays && record.notifyWays.length > 0 ? record.notifyWays.join('、') : '-'}
                    </td>
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      告警间隔
                    </td>
                    <td className="bg-white text-slate-800 px-3.5 py-2.5 border-r border-slate-200">
                      不重复
                    </td>
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-2.5 font-medium border-r border-slate-200 whitespace-nowrap">
                      生效周期
                    </td>
                    <td className="bg-white text-slate-800 px-3.5 py-2.5">
                      永久
                    </td>
                  </tr>

                  {/* 第 3 行：区域范围 */}
                  <tr className="border-b border-slate-200">
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-3 font-medium border-r border-slate-200 align-top whitespace-nowrap">
                      区域范围
                    </td>
                    <td colSpan={5} className="bg-white text-slate-800 px-3.5 py-3 leading-relaxed">
                      <div className="text-slate-400 text-[11px] mb-1">
                        区域范围详情 (共 1 条数据)
                      </div>
                      <div className="text-slate-700">
                        主基站是: {record.areaName} ({record.areaType || '现场网格已生效'})
                      </div>
                    </td>
                  </tr>

                  {/* 第 4 行：人员范围 */}
                  <tr>
                    <td className="bg-slate-50 text-slate-600 px-3.5 py-3 font-medium border-r border-slate-200 align-top whitespace-nowrap">
                      人员范围
                    </td>
                    <td colSpan={5} className="bg-white text-slate-800 px-3.5 py-3 leading-relaxed">
                      <div className="text-slate-400 text-[11px] mb-1">
                        人员范围详情 (共 {personsList.length} 条数据)
                      </div>
                      <div className="text-slate-700">
                        人员是: {personsList.join('、')}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 底部关闭与操作栏 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {/* 左侧：手机端H5处置通道快捷入口 */}
          <button
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('navigate_mobile_alarm', { detail: { alarmId: record.id } }));
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{!isClosed ? '📱 手机端H5现场处理' : '📱 手机端H5回执单'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              关闭
            </button>
            {onOpenProcess && !isClosed && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProcess(record);
                }}
                className="px-4 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                PC直接处理
              </button>
            )}
          </div>
        </div>

        {/* 全屏图片/视频预览灯箱 */}
        {selectedMedia && (
          <div 
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-2xl overflow-hidden max-w-3xl w-full border border-slate-700 shadow-2xl flex flex-col"
            >
              <div className="px-4 py-2.5 bg-slate-800/90 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-2 text-slate-200 text-xs truncate">
                  {selectedMedia.type === 'video' ? <Video className="w-4 h-4 text-purple-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
                  <span className="font-semibold truncate">{selectedMedia.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({selectedMedia.size})</span>
                </div>
                <button 
                  onClick={() => setSelectedMedia(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center bg-black/95 max-h-[70vh] overflow-hidden">
                {selectedMedia.type === 'video' ? (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    autoPlay 
                    className="max-h-[60vh] max-w-full rounded-lg"
                  />
                ) : (
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.name} 
                    referrerPolicy="no-referrer"
                    className="max-h-[60vh] max-w-full object-contain rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
