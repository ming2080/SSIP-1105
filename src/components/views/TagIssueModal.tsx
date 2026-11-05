/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 船厂定位标签收发与绑定管理弹窗
 * 用于管理船厂人员的物理定位工牌卡 (UWB 定位标签)，支持发卡、换卡、解绑回收、电量监控
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  User, 
  Building2, 
  HardHat, 
  ShieldAlert,
  ArrowRight,
  Plus
} from 'lucide-react';
import { DhrPersonnelItem } from '@/src/data/dhrPersonnelData';
import { getAvailableTags, getStoredTags, LocationTagItem } from '@/src/data/tagData';

interface TagIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: DhrPersonnelItem | null;
  onSave: (empID: string, newTagCode?: string, action?: 'bind' | 'unbind') => void;
}

export function TagIssueModal({ isOpen, onClose, person, onSave }: TagIssueModalProps) {
  const [availableTags, setAvailableTags] = useState<LocationTagItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const tags = getAvailableTags();
      setAvailableTags(tags);
      if (tags.length > 0) {
        setSelectedTag(tags[0].tagCode);
      } else {
        setSelectedTag('');
        setIsCustomMode(true);
      }
      setCustomTagInput('');
    }
  }, [isOpen, person]);

  if (!isOpen || !person) return null;

  const isAlreadyBound = !!person.tagCode && person.tagStatus === 'bound';

  const handleBind = () => {
    const finalTagCode = isCustomMode ? customTagInput.trim() : selectedTag;
    if (!finalTagCode) {
      alert('请输入或选择有效的定位标签编码');
      return;
    }
    onSave(person.empID, finalTagCode, 'bind');
    onClose();
  };

  const handleUnbind = () => {
    onSave(person.empID, undefined, 'unbind');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800 flex flex-col">
        
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {isAlreadyBound ? '定位标签管理 (换卡 / 回收)' : '收发定位标签 (新发工牌卡)'}
              </h3>
              <p className="text-xs text-slate-500">人员：{person.name} ({person.empcode || person.empID})</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-4">
          
          {/* 人员身份档案简要卡片 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">
              {person.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{person.name}</span>
                <span className="text-slate-400 font-mono">[{person.empcode}]</span>
                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200 font-medium">
                  {person.gwName || '作业工人'}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${person.presenceStatus === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {person.presenceStatus === 1 ? '● 在线' : '○ 离线'}
                </span>
              </div>
              <p className="text-slate-500 truncate flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{person.deptname}</span>
              </p>
              <div className="text-slate-400 text-[11px] flex gap-3">
                <span>用工类型: {person.ygtypeName}</span>
                <span>手机号: {person.cellphone}</span>
              </div>
            </div>
          </div>

          {/* 当前标签状态 */}
          {isAlreadyBound ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>当前已绑定定位标签</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {person.tagCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  标签电量：
                  {(() => {
                    const currentTag = getStoredTags().find(t => t.tagCode.toLowerCase() === person.tagCode?.toLowerCase());
                    const isLow = currentTag ? currentTag.batteryLevel === 'low' : (person.tagBattery && person.tagBattery < 20);
                    return isLow ? (
                      <strong className="text-rose-600 font-bold">低电量</strong>
                    ) : (
                      <strong className="text-slate-700 font-medium">正常电量</strong>
                    );
                  })()}
                </span>
                <span className="text-slate-400 text-[11px]">发卡时间：{person.tagBindTime || '近期已绑定'}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>该员工当前<strong className="font-semibold">尚未绑定定位工牌标签</strong>，无法在三维模型与厂区全景地图中呈现轨迹。</span>
              </div>
            </div>
          )}

          {/* 选择可用定位标签 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                {isAlreadyBound ? '更换为其他空闲标签：' : '选择要发放的定位标签：'}
              </label>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                {isCustomMode ? '从空闲库中选择' : '+ 手动输入标签编码'}
              </button>
            </div>

            {isCustomMode ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] text-slate-500 block">
                  若现场手持新到工牌或直接录入新标签，请输入其硬件编码（如 2、FF260805、UWB-8888）：
                </span>
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value.trim())}
                  placeholder="请输入标签编码..."
                  className="w-full text-xs font-mono font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableTags.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    当前暂无空闲定位标签，请点击上方“手动输入标签编码”或前往【定位标签】模块添加。
                  </div>
                ) : (
                  availableTags.map((tag) => (
                    <div 
                      key={tag.id}
                      onClick={() => setSelectedTag(tag.tagCode)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        selectedTag === tag.tagCode 
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="radio" 
                          name="tag_selection" 
                          checked={selectedTag === tag.tagCode}
                          onChange={() => setSelectedTag(tag.tagCode)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-slate-900 font-mono text-xs">{tag.tagCode}</span>
                      </div>
                      <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded font-medium">
                        {tag.tagStatus === 'used' ? '已使用' : '未使用'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* 底部按钮栏 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          {isAlreadyBound ? (
            <button 
              onClick={handleUnbind}
              className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>回收并解绑标签</span>
            </button>
          ) : (
            <span className="text-slate-400 text-[11px]">绑定后将自动同步至人员定位系统</span>
          )}

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              取消
            </button>
            <button 
              onClick={handleBind}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all cursor-pointer"
            >
              {isAlreadyBound ? '确认更换标签' : '立即发卡并绑定'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
