/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 人员加班定位轨迹回放弹窗
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Radio, 
  Ship, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { OvertimeDailyRecord } from '@/src/data/overtimeDailyReportData';

interface OvertimeTrajectoryModalProps {
  record: OvertimeDailyRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTracking?: (personName: string) => void;
}

export function OvertimeTrajectoryModal({
  record,
  isOpen,
  onClose,
  onNavigateToTracking
}: OvertimeTrajectoryModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackStep, setPlaybackStep] = useState<number>(0);

  // 模拟轨迹数据点
  const trajectoryPoints = [
    { time: '17:02:15', area: '一号门考勤打卡区', status: '打卡进入厂区', bg: 'bg-emerald-500' },
    { time: '17:10:40', area: `${record?.shipNo || '185-4'} 准备区`, status: '防爆工具领用与安全交底', bg: 'bg-blue-500' },
    { time: '17:25:00', area: record?.workArea || '16T前作业区', status: '进入定位作业盲区/热点', bg: 'bg-indigo-600' },
    { time: '19:30:00', area: record?.workArea || '16T前作业区', status: '持续打磨与焊接作业中', bg: 'bg-indigo-600' },
    { time: '20:55:20', area: '现场安全检测点', status: '安全监护与打卡打卡复核', bg: 'bg-amber-500' },
    { time: '21:05:10', area: '一号门打卡签出', status: '加班作业结束离厂', bg: 'bg-slate-600' }
  ];

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setPlaybackStep(prev => (prev + 1) % trajectoryPoints.length);
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, trajectoryPoints.length]);

  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  人员加班定位轨迹回放 - {record.workerName}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-slate-200 text-slate-700">
                  {record.tagCode}
                </span>
                {record.safetyStatus === 'absent' ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    安全员缺岗告警
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    安全监护在岗
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {record.deptName} · {record.company} · {record.workType} (联系电话: {record.phone})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
          {/* 核心保留字段指标展示 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">统计日期</span>
              <span className="font-mono font-bold text-slate-800">{record.reportDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">累计停留时长</span>
              <span className="font-mono font-bold text-blue-600 text-sm">
                {record.cumulativeStayHours} 小时
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">定位加班时长</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {record.positionedOvertimeHours} 小时
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">施工船舶 & 区域</span>
              <span className="font-semibold text-slate-800 truncate block">
                {record.shipNo} ({record.workArea})
              </span>
            </div>
          </div>

          {/* 轨迹动效播放控制栏 */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="font-bold">UWB高精度定位路线回放 (东南基地5G基站网)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? '暂停回放' : '播放轨迹'}</span>
                </button>
                <button
                  onClick={() => setPlaybackStep(0)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              </div>
            </div>

            {/* 模拟船厂停泊位与区域地图路线 Canvas */}
            <div className="relative h-44 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
              <img 
                src="/assets/shipyard_wide_bg.jpg" 
                alt="船厂底图" 
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter contrast-125"
              />
              
              {/* 轨迹连线 */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 rounded-full" />

              {/* 轨迹节点 */}
              <div className="relative z-10 w-full flex items-center justify-between px-2">
                {trajectoryPoints.map((pt, idx) => {
                  const isActive = idx === playbackStep;
                  const isPassed = idx <= playbackStep;
                  return (
                    <div key={idx} className="flex flex-col items-center group cursor-pointer" onClick={() => setPlaybackStep(idx)}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-md ${
                        isActive 
                          ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-400/30 scale-125 z-20' 
                          : isPassed 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="mt-2 text-center">
                        <span className="font-mono text-[10px] text-slate-300 block">{pt.time}</span>
                        <span className={`text-[10px] font-semibold block max-w-[80px] truncate ${isActive ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                          {pt.area}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 当前高亮节点详情 */}
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 mr-2">当前轨迹时刻:</span>
                <strong className="font-mono text-amber-400 mr-3">{trajectoryPoints[playbackStep].time}</strong>
                <span className="text-slate-200">【{trajectoryPoints[playbackStep].area}】</span>
                <span className="text-slate-400 ml-2 font-light">({trajectoryPoints[playbackStep].status})</span>
              </div>
              <span className="text-[11px] text-slate-400">定位精度: ±10cm (UWB网)</span>
            </div>
          </div>

          {/* 结合加班管理的在岗安全员信息 */}
          <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            record.safetyStatus === 'absent' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                <span>现场加班安全监护联控状态</span>
              </div>
              <div>
                当班安全员: <strong>{record.safetyOfficer}</strong>
                {record.safetyStatus === 'absent' && (
                  <span className="ml-2 font-bold text-rose-600">(警报：现场缺少持证安全员在线定位)</span>
                )}
              </div>
            </div>

            {onNavigateToTracking && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTracking(record.workerName);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <span>跳转三维全景地图跟踪</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
