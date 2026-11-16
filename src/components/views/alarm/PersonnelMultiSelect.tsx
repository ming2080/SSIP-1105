import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, ChevronDown, Users } from 'lucide-react';

export interface NotificationPersonOption {
  id: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  empId?: string;
}

interface PersonnelMultiSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: NotificationPersonOption[];
  placeholder?: string;
  accentColor?: 'blue' | 'amber' | 'red';
  dropdownPlacement?: 'bottom' | 'top';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PersonnelMultiSelect({
  value,
  onChange,
  options,
  placeholder = '点击模糊搜索并选择通知人员（支持多选）',
  accentColor = 'blue',
  dropdownPlacement = 'bottom',
  isOpen: controlledOpen,
  onOpenChange
}: PersonnelMultiSelectProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  // 解析已选人员列表（以顿号或中英文逗号分隔）
  const selectedNames = useMemo(() => {
    if (!value || !value.trim()) return [];
    const parts = value
      .split(/[、,，]/)
      .map(s => s.trim())
      .filter(Boolean);
    return Array.from(new Set(parts));
  }, [value]);

  // 点击外部自动收起
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 20);
    } else {
      setKeyword('');
    }
  }, [isOpen]);

  // 模糊搜索过滤（支持姓名、部门、岗位/角色、工号、手机号）
  const filteredOptions = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return options;
    return options.filter(opt => {
      return (
        opt.name.toLowerCase().includes(q) ||
        opt.department.toLowerCase().includes(q) ||
        opt.role.toLowerCase().includes(q) ||
        (opt.empId && opt.empId.toLowerCase().includes(q)) ||
        (opt.phone && opt.phone.toLowerCase().includes(q))
      );
    });
  }, [options, keyword]);

  const togglePerson = (personName: string) => {
    const exists = selectedNames.includes(personName);
    const next = exists
      ? selectedNames.filter(n => n !== personName)
      : [...selectedNames, personName];
    onChange(next.join('、'));
  };

  const removePerson = (personName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selectedNames.filter(n => n !== personName);
    onChange(next.join('、'));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const chipStyles = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    red: 'bg-rose-50 text-rose-800 border-rose-200'
  }[accentColor];

  const chipRemoveStyles = {
    blue: 'text-blue-500 hover:text-blue-800 hover:bg-blue-100',
    amber: 'text-amber-500 hover:text-amber-800 hover:bg-amber-100',
    red: 'text-rose-500 hover:text-rose-800 hover:bg-rose-100'
  }[accentColor];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 触发选择框 */}
      <div
        onClick={() => setOpen(!isOpen)}
        className={`min-h-[36px] w-full px-2.5 py-1.5 bg-white border rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-all ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-100'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
          {selectedNames.length === 0 ? (
            <span className="text-slate-400 text-[12px] truncate pl-0.5">{placeholder}</span>
          ) : (
            selectedNames.map(name => {
              const matched = options.find(o => o.name === name);
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[12px] font-medium ${chipStyles}`}
                  title={matched ? `${matched.name} · ${matched.role} (${matched.department})` : name}
                >
                  <span className="truncate max-w-[140px]">{name}</span>
                  <button
                    type="button"
                    onClick={(e) => removePerson(name, e)}
                    className={`rounded p-0.2 transition-colors cursor-pointer ${chipRemoveStyles}`}
                    title={`移除 ${name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedNames.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {selectedNames.length}人
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </div>

      {/* 模糊查询与多选下拉浮层 */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fadeIn ${
            dropdownPlacement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* 顶部模糊搜索输入框 */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入姓名、部门、岗位或工号模糊搜索..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="清空搜索"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 候选人员多选列表 */}
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-slate-300" />
                <span>未匹配到包含 “{keyword}” 的人员</span>
              </div>
            ) : (
              filteredOptions.map(person => {
                const isSelected = selectedNames.includes(person.name);
                return (
                  <div
                    key={person.id}
                    onClick={() => togglePerson(person.name)}
                    className={`px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                      isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>

                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {person.name.slice(0, 1)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {person.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {person.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                          <span className="truncate">{person.department}</span>
                          {person.empId && <span className="font-mono shrink-0">{person.empId}</span>}
                          {person.phone && <span className="font-mono shrink-0">{person.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 底部统计与快捷操作栏 */}
          <div className="px-3 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              已选 <strong className="text-blue-600 font-mono">{selectedNames.length}</strong> 人
              {keyword && <span className="ml-1.5 text-slate-400">(匹配 {filteredOptions.length} 条)</span>}
            </span>
            <div className="flex items-center gap-2">
              {selectedNames.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer font-medium"
                >
                  清空
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors cursor-pointer"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
