/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理：责任安全员多选与模糊查询组件
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Phone, 
  BadgeCheck, 
  Plus,
  ChevronDown
} from 'lucide-react';
import { SafetyOfficerItem, SHIPYARD_SAFETY_OFFICERS } from '@/src/data/workfaceData';

interface SafetyOfficerSelectProps {
  selectedOfficers: SafetyOfficerItem[];
  onChange: (officers: SafetyOfficerItem[]) => void;
  required?: boolean;
}

export function SafetyOfficerSelect({
  selectedOfficers,
  onChange,
  required = true
}: SafetyOfficerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 模糊匹配候选池
  const filteredOfficers = SHIPYARD_SAFETY_OFFICERS.filter(officer => {
    if (!keyword.trim()) return true;
    const term = keyword.trim().toLowerCase();
    return (
      officer.name.toLowerCase().includes(term) ||
      officer.department.toLowerCase().includes(term) ||
      officer.role.toLowerCase().includes(term) ||
      officer.phone.includes(term) ||
      officer.certNumber.toLowerCase().includes(term)
    );
  });

  // 切换单个人员选中状态
  const toggleOfficer = (officer: SafetyOfficerItem) => {
    const isSelected = selectedOfficers.some(item => item.id === officer.id || item.name === officer.name);
    if (isSelected) {
      onChange(selectedOfficers.filter(item => item.id !== officer.id && item.name !== officer.name));
    } else {
      onChange([...selectedOfficers, officer]);
    }
  };

  // 移除指定人员
  const removeOfficer = (id: string, name: string) => {
    onChange(selectedOfficers.filter(item => item.id !== id && item.name !== name));
  };

  // 添加自定义安全员
  const handleAddCustom = () => {
    if (!keyword.trim()) return;
    const newOfficer: SafetyOfficerItem = {
      id: `SO-CUSTOM-${Date.now().toString().slice(-4)}`,
      name: keyword.trim(),
      phone: customPhone.trim() || '13800000000',
      department: '现场作业指挥部',
      role: '专职安全监护员',
      certNumber: `SA-TEMP-${Date.now().toString().slice(-3)}`
    };
    onChange([...selectedOfficers, newOfficer]);
    setKeyword('');
    setCustomPhone('');
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span>责任安全员 (支持设定多位安全员)</span>
          {required && <span className="text-red-500">*</span>}
        </span>
        <span className="text-[11px] text-slate-400 font-normal">
          已选 <strong className="text-blue-600 font-bold">{selectedOfficers.length}</strong> 位
        </span>
      </label>

      {/* 已选人员 Chips 标签展示与搜索输入框 */}
      <div 
        onClick={() => setIsOpen(true)}
        className="min-h-[42px] p-1.5 border border-slate-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 flex flex-wrap items-center gap-1.5 cursor-text transition-all"
      >
        {selectedOfficers.map(officer => (
          <span
            key={officer.id || officer.name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-medium border border-blue-200 shadow-2xs group"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold">{officer.name}</span>
            <span className="text-[10px] text-blue-600 font-mono">[{officer.tagCode || officer.id}]</span>
            <span className="text-[11px] text-blue-700">{officer.department}</span>
            <span className="text-[10px] text-blue-600 font-mono">{officer.phone}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeOfficer(officer.id, officer.name);
              }}
              className="w-3.5 h-3.5 rounded-full hover:bg-blue-200/80 text-blue-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}

        {/* 模糊搜索输入框 */}
        <div className="flex-1 min-w-[160px] flex items-center gap-1 px-1">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={e => {
              setKeyword(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedOfficers.length === 0 ? "检索安全员姓名、标签号、班组或电话..." : "继续添加安全员..."}
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 下拉浮层：模糊搜索匹配结果多选列表 */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>责任安全员人员库 ({filteredOfficers.length} 位符合条件)</span>
            {selectedOfficers.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                清空已选
              </button>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredOfficers.length > 0 ? (
              filteredOfficers.map(officer => {
                const isSelected = selectedOfficers.some(item => item.id === officer.id || item.name === officer.name);
                return (
                  <div
                    key={officer.id}
                    onClick={() => toggleOfficer(officer)}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 hover:bg-blue-100/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-800">{officer.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                            {officer.tagCode || officer.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>班组：{officer.department}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 font-mono">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            {officer.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {isSelected ? (
                        <span className="text-blue-600 font-medium">已选择</span>
                      ) : (
                        <span className="text-slate-400">点击选择</span>
                      )}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 space-y-2">
                <div>未检索到匹配的安全员 "{keyword}"</div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customPhone}
                    onChange={e => setCustomPhone(e.target.value)}
                    placeholder="填入联系电话 (可选)"
                    className="px-2 py-1 border border-slate-200 rounded text-xs w-36"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加 "{keyword}"</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
