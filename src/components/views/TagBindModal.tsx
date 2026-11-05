/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 定位标签 - 绑定人员弹窗组件
 * 业务定位：在定位标签管理列表中，针对未使用的定位标签，快速选择人员进行绑定发卡。
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Radio, 
  Search, 
  User, 
  Building2, 
  HardHat, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { LocationTagItem } from '@/src/data/tagData';
import { DhrPersonnelItem } from '@/src/data/dhrPersonnelData';

interface TagBindModalProps {
  isOpen: boolean;
  tag: LocationTagItem | null;
  personnelList: DhrPersonnelItem[];
  onClose: () => void;
  onConfirmBind: (tag: LocationTagItem, selectedPerson: DhrPersonnelItem) => void;
}

export function TagBindModal({
  isOpen,
  tag,
  personnelList,
  onClose,
  onConfirmBind
}: TagBindModalProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [onlyUnbound, setOnlyUnbound] = useState(true);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // 过滤人员列表
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter(p => {
      // 是否仅看未绑定标签的人员
      if (onlyUnbound) {
        const isBound = !!p.tagCode && p.tagStatus === 'bound';
        if (isBound) return false;
      }

      if (!searchKeyword.trim()) return true;
      const kw = searchKeyword.trim().toLowerCase();
      const matchName = p.name.toLowerCase().includes(kw);
      const matchCode = (p.empcode || '').toLowerCase().includes(kw);
      const matchPhone = (p.cellphone || '').includes(kw);
      const matchDept = (p.deptname || '').toLowerCase().includes(kw);
      const matchGw = (p.gwName || '').toLowerCase().includes(kw);

      return matchName || matchCode || matchPhone || matchDept || matchGw;
    });
  }, [personnelList, searchKeyword, onlyUnbound]);

  if (!isOpen || !tag) return null;

  const selectedPerson = personnelList.find(p => p.empID === selectedEmpId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson) return;
    onConfirmBind(tag, selectedPerson);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                绑定定位标签
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                将标签 <strong className="text-blue-600 font-mono font-semibold">{tag.tagCode}</strong> 分配并绑定至现场作业人员
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体选择区 */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* 目标标签卡片 */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 font-mono text-sm">{tag.tagCode}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                    {tag.tagStatus === 'used' ? '已使用' : '未使用'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {tag.remark || '高精度防爆工牌定位卡'}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded font-medium">
              待分配发卡
            </span>
          </div>

          {/* 搜索与过滤栏 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-xs text-slate-700">
                选择绑定人员 <span className="text-rose-500">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={onlyUnbound}
                  onChange={e => setOnlyUnbound(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>仅显示未持卡人员</span>
              </label>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="搜索员工姓名 / 工号 / 部门 / 手机号..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* 人员列表选择框 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100 bg-slate-50/40">
            {filteredPersonnel.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <AlertCircle className="w-5 h-5 mx-auto text-slate-300" />
                <p>未找到符合条件的员工档案</p>
                {onlyUnbound && (
                  <button
                    type="button"
                    onClick={() => setOnlyUnbound(false)}
                    className="text-blue-600 hover:underline text-[11px] cursor-pointer"
                  >
                    取消“仅显示未持卡人员”过滤
                  </button>
                )}
              </div>
            ) : (
              filteredPersonnel.map(person => {
                const isSelected = selectedEmpId === person.empID;
                const isBound = !!person.tagCode && person.tagStatus === 'bound';

                return (
                  <div
                    key={person.empID}
                    onClick={() => setSelectedEmpId(person.empID)}
                    className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/90 text-blue-900 border-l-4 border-blue-600' 
                        : 'hover:bg-white bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {person.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{person.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">[{person.empcode}]</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            {person.gwName || '工种未定'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-[280px] mt-0.5">
                          {person.deptname}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isBound ? (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                          原绑: {person.tagCode}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                          未绑卡
                        </span>
                      )}
                      <input 
                        type="radio" 
                        name="selectedPerson"
                        checked={isSelected}
                        onChange={() => setSelectedEmpId(person.empID)}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 选中员工确认提示 */}
          {selectedPerson && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                已选中：<strong>{selectedPerson.name}</strong>（工号：{selectedPerson.empcode}，部门：{selectedPerson.deptname}）
              </span>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          >
            取消
          </button>

          <button 
            type="button"
            disabled={!selectedPerson}
            onClick={handleSubmit}
            className={`px-4 py-1.5 rounded-lg font-semibold shadow-xs transition-all cursor-pointer ${
              selectedPerson 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            确认绑定
          </button>
        </div>

      </div>
    </div>
  );
}
