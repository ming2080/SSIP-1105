/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 定位标签详情查看弹窗（只读查看设备状态、电量情况等上报信息）
 */

import React from 'react';
import { X, Radio, Battery, Wifi, User, Clock, Tag } from 'lucide-react';
import { LocationTagItem } from '@/src/data/tagData';

interface TagDetailModalProps {
  isOpen: boolean;
  tag: LocationTagItem | null;
  onClose: () => void;
}

export function TagDetailModal({
  isOpen,
  tag,
  onClose
}: TagDetailModalProps) {
  if (!isOpen || !tag) return null;

  const isUsed = tag.tagStatus === 'used';
  const isOnline = tag.deviceStatus === 'online';
  const isLowBattery = tag.batteryLevel === 'low';
  const hasBattery = tag.batteryLevel === 'normal' || tag.batteryLevel === 'low';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col text-slate-800">
        {/* 顶部标题栏 */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">定位标签详情</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                编码：{tag.tagCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 详情内容列表 */}
        <div className="p-5 space-y-4 text-xs">
          {/* 基本信息区块 */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-100">
            {/* 标签编码 */}
            <div className="flex items-center justify-between p-3">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                标签编码
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">{tag.tagCode}</span>
            </div>

            {/* 标签使用状态 */}
            <div className="flex items-center justify-between p-3">
              <span className="text-slate-500">标签状态</span>
              <div>
                {isUsed ? (
                  <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                    已使用
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                    未使用
                  </span>
                )}
              </div>
            </div>

            {/* 绑定人员 */}
            <div className="flex items-center justify-between p-3">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                持卡人员
              </span>
              <div className="text-right">
                {isUsed && tag.personName && tag.personName !== '-' ? (
                  <div>
                    <span className="font-semibold text-slate-800">{tag.personName}</span>
                    {tag.deptName && (
                      <div className="text-[11px] text-slate-500">{tag.deptName}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 font-mono">- (暂未分配)</span>
                )}
              </div>
            </div>
          </div>

          {/* 设备自动上报状态区块 (由基站/网关实时上报产生，不可手动创建编辑) */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-slate-700">设备实时上报状态</span>
              <span className="text-[10px] text-slate-400">由设备网络自动上报</span>
            </div>

            {/* 在线状态 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                设备在线状态
              </span>
              <span className={`inline-flex items-center gap-1 font-medium ${
                isOnline ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {isOnline ? '在线' : '离线'}
              </span>
            </div>

            {/* 电量情况：设备离线时为未知状态，在线时为正常电量与低电量 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-slate-400" />
                电量情况
              </span>
              <div>
                {!isOnline ? (
                  <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-sm">
                    未知 (设备离线)
                  </span>
                ) : !hasBattery ? (
                  <span className="text-slate-400 font-mono">- (未上报)</span>
                ) : isLowBattery ? (
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-sm border border-rose-200">
                    低电量 (请及时充电)
                  </span>
                ) : (
                  <span className="text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-sm">
                    正常电量
                  </span>
                )}
              </div>
            </div>

            {/* 最后更新时间 */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                最后上报时间
              </span>
              <span className="font-mono text-slate-600">
                {tag.lastUpdateTime || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
