import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  MapPin,
  Ban,
  Check,
  Sparkles,
  Layers,
  Maximize2,
  X
} from 'lucide-react';
import { 
  BERTH_AREAS, 
  BerthAreaConfig, 
  BerthSubSlot, 
  checkIsSmallShip,
  checkSlotAvailability
} from '@/src/data/berthData';

interface BerthPickerProps {
  startDate?: string;
  selectedBerthId: string | null;
  selectedSlotNumber?: number | null;
  onSelectBerth: (berth: BerthAreaConfig, slotNumber?: number) => void;
  shipName?: string;
  shipType?: string;
  className?: string;
}

export function BerthPicker({
  startDate,
  selectedBerthId,
  selectedSlotNumber,
  onSelectBerth,
  shipName,
  shipType,
  className = ''
}: BerthPickerProps) {
  // 当前正在查看/操作的一级码头或平船台
  const [currentBerthId, setCurrentBerthId] = useState<string>(selectedBerthId || BERTH_AREAS[0].id);
  const [currentSlotNum, setCurrentSlotNum] = useState<number | null>(selectedSlotNumber ?? null);
  
  // 提示信息
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  // 示意图放大查看弹窗
  const [showZoomModal, setShowZoomModal] = useState(false);

  useEffect(() => {
    if (selectedBerthId) {
      setCurrentBerthId(selectedBerthId);
    }
  }, [selectedBerthId]);

  useEffect(() => {
    if (selectedSlotNumber !== undefined) {
      setCurrentSlotNum(selectedSlotNumber);
    }
  }, [selectedSlotNumber]);

  const isCurrentShipSmall = checkIsSmallShip(shipName) || checkIsSmallShip(shipType);
  const activeBerth = BERTH_AREAS.find(b => b.id === currentBerthId) || BERTH_AREAS[0];

  // 切换一级码头/船台
  const handleChoosePrimaryBerth = (berth: BerthAreaConfig) => {
    setCurrentBerthId(berth.id);
    setWarningMsg(null);

    // 寻找该码头下空闲且船型匹配、满足组合规则的第一个二级泊位
    const firstAvailableSlot = berth.slots.find(slot => {
      const avail = checkSlotAvailability(berth, slot.slotNumber, isCurrentShipSmall);
      return avail.isAvailable;
    });

    const chosenSlot = firstAvailableSlot ? firstAvailableSlot.slotNumber : null;
    setCurrentSlotNum(chosenSlot);
    onSelectBerth(berth, chosenSlot || undefined);
  };

  // 选择二级具体顺序号泊位
  const handleSelectSlot = (slot: BerthSubSlot) => {
    const avail = checkSlotAvailability(activeBerth, slot.slotNumber, isCurrentShipSmall);
    if (!avail.isAvailable) {
      setWarningMsg(`⚠️ 无法选择：${avail.reason || '该泊位当前不可用'}`);
      return;
    }

    setWarningMsg(null);
    setCurrentSlotNum(slot.slotNumber);
    onSelectBerth(activeBerth, slot.slotNumber);
  };

  // 确认移泊按钮触发
  const handleConfirm = () => {
    if (!currentSlotNum) {
      setWarningMsg('请先在二级泊位列表中选择一个空闲且满足规则的泊位。');
      return;
    }
    const avail = checkSlotAvailability(activeBerth, currentSlotNum, isCurrentShipSmall);
    if (!avail.isAvailable) {
      setWarningMsg(`⚠️ 无法选择：${avail.reason || '当前选定泊位不符合规则'}`);
      return;
    }
    setWarningMsg(null);
    onSelectBerth(activeBerth, currentSlotNum || undefined);
  };

  // 平船台统计分析（大船数与小船数）
  const activeOccupiedSlots = activeBerth.slots.filter(s => s.isOccupied);
  const activeLargeCount = activeOccupiedSlots.filter(s => s.occupiedShip && s.occupiedShip.isSmallShip === false).length;
  const activeSmallCount = activeOccupiedSlots.filter(s => s.occupiedShip && s.occupiedShip.isSmallShip === true).length;

  return (
    <div className={`space-y-4 ${className}`}>

      {/* 提示横幅 */}
      {warningMsg && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/80 text-amber-200 rounded-xl text-xs flex items-start justify-between gap-2 animate-fadeIn shadow-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{warningMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setWarningMsg(null)}
            className="text-amber-400 hover:text-amber-200 shrink-0 text-xs px-1.5 py-0.5 rounded hover:bg-amber-900/60"
          >
            ✕
          </button>
        </div>
      )}

      {/* 核心停泊位可视化选择区域 */}
      <div className="flex flex-col lg:flex-row gap-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 text-white shadow-xl">
        
        {/* 左侧：纯场景示意图展示 */}
        <div className="w-full lg:w-[46%] flex flex-col min-w-0">
          
          {/* 顶部标题与静态说明 */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <h4 className="text-xs font-bold text-slate-100 tracking-wide flex items-center gap-1.5">
                <span>船厂厂区停泊位场景示意图</span>
                <span className="text-[11px] font-normal text-slate-400 font-mono">(六大停泊区域)</span>
              </h4>
            </div>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 px-2 py-0.5 rounded-md font-medium">
              全新规范 6 大区域
            </span>
          </div>

          {/* 纯展示示意图片容器 */}
          <div 
            onClick={() => setShowZoomModal(true)}
            className="group relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner flex items-center justify-center cursor-pointer"
            title="点击查看高清大图"
          >
            <img 
              src="/assets/shipyard_berths_map_0916.png" 
              alt="东南造船厂厂区停泊位场景示意图 (2026-09-16新版)" 
              className="w-full h-full object-contain object-center select-none group-hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.fallback) {
                  target.dataset.fallback = 'true';
                  target.src = 'assets/shipyard_berths_map_0916.png';
                }
              }}
            />
            {/* 悬浮放大提示条 */}
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/90 text-white text-[11px] px-3 py-1.5 rounded-full border border-slate-600 flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>点击查看高清示意大图</span>
              </div>
            </div>
            {/* 右上角放大图标 */}
            <div className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 shadow-xs pointer-events-none">
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>

          {/* 六大区域核心规则精简卡片 */}
          <div className="mt-2.5 bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>六大区域停泊与组合规则：</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 leading-relaxed">
              <div><strong className="text-sky-300">1/3/4号码头：</strong>同一位置可停1艘大船或1艘小船（1号3位、3号2位、4号2位）。</div>
              <div><strong className="text-amber-300">2号码头：</strong>共1个号位，只能停泊一艘小船。</div>
              <div><strong className="text-emerald-300">2万吨船台：</strong>可停2艘小船或1艘大船（停1艘大船时不能再停其他船，停1艘小船时可再停1艘小船）。</div>
              <div><strong className="text-purple-300">平船台(4位)：</strong>a.停4小船；b.停2大船(仅限1/2号并排)+2小船；c.停1大船+3小船。</div>
            </div>
          </div>

        </div>

        {/* 右侧：码头选择与二级停泊位关联操作面板 */}
        <div className="w-full lg:w-[54%] bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between shrink-0 space-y-3.5">
          
          <div className="space-y-3">
            {/* 1. 一级码头/平船台选择 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-blue-400" />
                  <span>选择停泊码头 / 平船台 (共6大区域)</span>
                </label>
                <span className="text-[10px] text-slate-400">点击切换停泊区域</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BERTH_AREAS.map((b) => {
                  const isSelected = currentBerthId === b.id;
                  const freeCount = b.slots.filter(s => {
                    const avail = checkSlotAvailability(b, s.slotNumber, isCurrentShipSmall);
                    return avail.isAvailable;
                  }).length;
                  
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleChoosePrimaryBerth(b)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-400/40 shadow-sm'
                          : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-900 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-xs truncate pr-1 ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          #{b.code} {b.shortName}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{b.categoryName}</span>
                        <span className={`font-mono font-bold ${freeCount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          可用 {freeCount}/{b.slots.length}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 当前选中码头基本信息与规则 */}
            <div className="bg-slate-900/85 rounded-xl p-3 border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-mono text-[11px] font-bold">
                    #{activeBerth.code}
                  </span>
                  <span>{activeBerth.name}</span>
                  <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    {activeBerth.categoryName}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  总泊位: <strong className="text-cyan-400">{activeBerth.slots.length}</strong> 个
                </span>
              </div>

              {/* 规则文字 */}
              <div className="bg-slate-950/60 rounded-lg p-2 border border-slate-800 text-[11px] space-y-1">
                <p className="text-amber-300 font-medium leading-relaxed">
                  <strong>停泊规则说明：</strong>{activeBerth.ruleDescription}
                </p>
                {/* 针对平船台与2万吨船台的动态组合状态辅助提示 */}
                {activeBerth.id === 'berth-6' && (
                  <div className="text-[10px] text-slate-300 flex items-center gap-2 pt-1 border-t border-slate-800">
                    <Layers className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>当前在泊：<strong>{activeLargeCount}</strong> 艘大船 + <strong>{activeSmallCount}</strong> 艘小船</span>
                    <span className="text-purple-300 font-medium">
                      {activeLargeCount === 2 ? '(已启用组合b: 2大船并排)' : activeLargeCount === 1 ? '(组合b/c进行中)' : '(支持组合a/b/c)'}
                    </span>
                  </div>
                )}
                {activeBerth.id === 'berth-5' && (
                  <div className="text-[10px] text-slate-300 flex items-center gap-2 pt-1 border-t border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>2万吨船台状态：{activeLargeCount > 0 ? <strong className="text-rose-400">大船在泊独占中</strong> : activeSmallCount > 0 ? <strong className="text-cyan-300">已有{activeSmallCount}艘小船，还可停1艘小船</strong> : <strong className="text-emerald-400">全船台空闲（可停1大船或2小船）</strong>}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. 二级停泊位列表及占用情况 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>二级停泊位列表及占用状态</span>
                  <span className="text-[10px] font-normal text-slate-400">(按顺序号唯一标识)</span>
                </label>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 可选
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> 已占用/互斥
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                {activeBerth.slots.map((slot) => {
                  const isSelected = currentSlotNum === slot.slotNumber;
                  const avail = checkSlotAvailability(activeBerth, slot.slotNumber, isCurrentShipSmall);
                  const isClickable = avail.isAvailable;

                  return (
                    <div
                      key={slot.slotId}
                      onClick={() => isClickable && handleSelectSlot(slot)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-400 ring-1 ring-cyan-400/60 shadow-md'
                          : !isClickable
                          ? 'bg-slate-900/50 border-rose-900/50 opacity-80 cursor-not-allowed'
                          : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 cursor-pointer hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {/* 顺序号标识 */}
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                            isSelected
                              ? 'bg-cyan-400 text-slate-950'
                              : !isClickable
                              ? 'bg-rose-900/80 text-rose-300'
                              : 'bg-slate-700 text-slate-200'
                          }`}>
                            {slot.slotNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-100">
                            {slot.slotName}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                            slot.allowedType === 'small_only'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                              : 'bg-blue-950/60 text-blue-300 border-blue-700/60'
                          }`}>
                            {slot.allowedTypeLabel}
                          </span>
                        </div>

                        {/* 空闲 / 占用 / 互斥状态 */}
                        <div>
                          {slot.isOccupied ? (
                            <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 border border-rose-700/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Ban className="w-3 h-3 text-rose-400" /> 已占用
                            </span>
                          ) : !avail.isAvailable ? (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-700/80 px-2 py-0.5 rounded-full flex items-center gap-1" title={avail.reason}>
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> {avail.badgeText || '规则互斥不可用'}
                            </span>
                          ) : isSelected ? (
                            <span className="text-[10px] font-bold text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3 h-3" /> 当前选定
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> 空闲可停
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 占用信息或规则提示 */}
                      {slot.occupiedShip ? (
                        <div className="bg-slate-950/70 p-1.5 rounded-lg text-[10px] text-slate-300 space-y-0.5 border border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="text-slate-200 font-medium">{slot.occupiedShip.name}</span>
                              <span className="text-slate-500 font-mono ml-1">
                                ({slot.occupiedShip.shipCode} · {slot.occupiedShip.stage})
                              </span>
                            </div>
                            <span className="text-rose-400 font-mono shrink-0">在泊中</span>
                          </div>
                        </div>
                      ) : !avail.isAvailable ? (
                        <p className="text-[10px] text-amber-300/90 mt-0.5 leading-tight">
                          {avail.reason}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          顺序号【{slot.slotNumber}号位】处于空闲状态，符合当前船型与组合规划规则，可直接选定。
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 4. 确认移泊按钮 */}
          <div className="pt-2 border-t border-slate-700/70">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>确认移泊规划</span>
              {currentSlotNum ? (
                <span className="font-mono text-cyan-200 font-normal">
                  (已选：#{activeBerth.code} {activeBerth.shortName} - {currentSlotNum}号位)
                </span>
              ) : (
                <span className="text-slate-300 font-normal">
                  (请选定空闲且匹配的泊位)
                </span>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* 高清停泊位示意图放大查看模态框 */}
      {showZoomModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowZoomModal(false)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-700/90 rounded-2xl p-3 sm:p-4 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>船厂厂区停泊位场景示意图 (2026-09-16新版)</span>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                    assets/shipyard_berths_map_0916.png
                  </span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 min-h-0 bg-slate-950/60 rounded-xl mt-3 border border-slate-800/80">
              <img
                src="/assets/shipyard_berths_map_0916.png"
                alt="东南造船厂厂区停泊位场景示意图"
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-md select-none"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.fallback) {
                    target.dataset.fallback = 'true';
                    target.src = 'assets/shipyard_berths_map_0916.png';
                  }
                }}
              />
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="text-[11px]">包含1-4号码头、5号2万吨船台、6号平船台全部泊位号与组合分布</span>
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


