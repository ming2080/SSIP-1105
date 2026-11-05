import React, { useState } from 'react';
import { AlarmLiveAndHistoryView } from './alarm/AlarmLiveAndHistoryView';
import { AlarmDetailModal } from './AlarmDetailModal';
import { INITIAL_ALARM_RULES, AlarmRuleItem } from '@/src/data/alarmData';
import { ViewType } from '@/src/types';

interface AlarmDisposalViewProps {
  onNavigate?: (view: ViewType) => void;
}

export function AlarmDisposalView({ onNavigate }: AlarmDisposalViewProps) {
  const [rules] = useState<AlarmRuleItem[]>(INITIAL_ALARM_RULES);
  const [detailRule, setDetailRule] = useState<AlarmRuleItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 查看策略快照弹窗
  const handleViewRulePolicy = (policyName: string, versionId?: string) => {
    const target = rules.find(r => r.name === policyName) || rules[0];
    if (target) {
      setDetailRule(target);
      setIsDetailModalOpen(true);
    }
  };

  const handleNavigateView = (view: ViewType) => {
    if (onNavigate) {
      onNavigate(view);
    } else {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view } }));
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 告警日志与处置核心业务主体 */}
      <div className="flex-1 min-h-0 bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <AlarmLiveAndHistoryView
          rules={rules}
          onViewRulePolicy={handleViewRulePolicy}
          onNavigateToAnalytics={() => handleNavigateView('alarm_analysis')}
        />
      </div>

      {/* 策略版本快照弹窗 */}
      <AlarmDetailModal
        isOpen={isDetailModalOpen}
        rule={detailRule}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailRule(null);
        }}
        onEdit={() => {
          setIsDetailModalOpen(false);
          handleNavigateView('alarms');
        }}
      />
    </div>
  );
}
