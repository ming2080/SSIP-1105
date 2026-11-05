import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ViewType } from '@/src/types';
import { Dashboard } from '../views/Dashboard';
import { ProjectOverviewDashboard } from '../views/ProjectOverviewDashboard';
import { ProjectManagement } from '../views/ProjectManagement';
import { PersonnelTracking } from '../views/PersonnelTracking';
import { ElectronicFence } from '../views/ElectronicFence';
import { AlarmConfig } from '../views/AlarmConfig';
import { AlarmDisposalView } from '../views/AlarmDisposalView';
import { AlarmAnalyticsDashboard } from '../views/alarm/AlarmAnalyticsDashboard';
import { DeviceManagement } from '../views/DeviceManagement';
import { ShipModelManagement } from '../views/ShipModelManagement';
import { PersonnelManagement } from '../views/PersonnelManagement';
import { UserManagement } from '../views/UserManagement';
import { TeamManagement } from '../views/TeamManagement';
import { TagManagement } from '../views/TagManagement';
import { OvertimeManagement } from '../views/OvertimeManagement';
import { WorkfaceManagement } from '../views/workface/WorkfaceManagement';
import { WorkfaceMonitorAnalytics } from '../views/workface/WorkfaceMonitorAnalytics';
import { WorkfaceScreenView } from '../views/workface/WorkfaceScreenView';
import { FullScreenAlarmMonitor } from '../views/fullscreen/FullScreenAlarmMonitor';

interface LayoutProps {
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

export function Layout({ currentUser, onLogout }: LayoutProps = {}) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [previousView, setPreviousView] = useState<ViewType>('dashboard');
  const [personnelNavState, setPersonnelNavState] = useState<{ personId?: string; autoPlay?: boolean } | null>(null);
  const [dashboardNavState, setDashboardNavState] = useState<{ projectId?: string; viewScope?: 'yard' | 'project' } | null>(null);
  const [selectedEmpForUserCreation, setSelectedEmpForUserCreation] = useState<string | undefined>(undefined);
  const [targetDeptIdForPersonnel, setTargetDeptIdForPersonnel] = useState<string | undefined>(undefined);
  
  // 指挥中心大屏全屏监控模式状态
  const [isFullScreenMonitor, setIsFullScreenMonitor] = useState<boolean>(false);

  useEffect(() => {
    const handleToggleMonitor = () => {
      setIsFullScreenMonitor(prev => !prev);
    };
    window.addEventListener('toggle_fullscreen_monitor', handleToggleMonitor);
    return () => window.removeEventListener('toggle_fullscreen_monitor', handleToggleMonitor);
  }, []);

  useEffect(() => {
    const handleCustomNavigate = (e: any) => {
      if (e.detail?.view) {
        handleNavigate(e.detail.view, { 
          personId: e.detail.personId, 
          autoPlay: e.detail.autoPlay,
          projectId: e.detail.projectId,
          viewScope: e.detail.viewScope
        });
      }
    };
    window.addEventListener('navigate_view', handleCustomNavigate);
    return () => window.removeEventListener('navigate_view', handleCustomNavigate);
  }, []);

  const handleNavigate = (view: ViewType, extra?: { personId?: string; autoPlay?: boolean; projectId?: string; viewScope?: 'yard' | 'project'; filterType?: string }) => {
    if (typeof view !== 'string') return;
    if (view === 'workface_screen' && currentView !== 'workface_screen') {
      setPreviousView(currentView);
    }
    if ((view === 'personnel' || view === 'personnel_track') && extra) {
      setPersonnelNavState({ personId: extra.personId, autoPlay: extra.autoPlay });
    }
    if (view === 'dashboard' && extra) {
      setDashboardNavState({
        projectId: extra.projectId,
        viewScope: extra.viewScope || (extra.projectId ? 'project' : undefined)
      });
    }
    setCurrentView(view);
  };

  const handleSidebarChangeView = (view: ViewType) => {
    if (view === 'workface_screen' && currentView !== 'workface_screen') {
      setPreviousView(currentView);
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          onExit={() => setCurrentView('projects')} 
          onNavigate={handleNavigate} 
          initialProjectId={dashboardNavState?.projectId}
          initialViewScope={dashboardNavState?.viewScope}
        />
      );
      case 'project_overview': return <ProjectOverviewDashboard onNavigate={handleNavigate} />;
      case 'projects': return <ProjectManagement />;
      case 'models': return <ShipModelManagement />;
      case 'personnel': return (
        <PersonnelTracking 
          initialMode="position"
          initialPersonId={personnelNavState?.personId} 
          initialAutoPlay={false} 
        />
      );
      case 'personnel_track': return (
        <PersonnelTracking 
          initialMode="track"
          initialPersonId={personnelNavState?.personId} 
          initialAutoPlay={personnelNavState?.autoPlay ?? false} 
        />
      );
      case 'personnel_mgmt': return (
        <PersonnelManagement 
          targetDeptId={targetDeptIdForPersonnel}
          onOpenUserManagement={(empId) => {
            setSelectedEmpForUserCreation(empId);
            setCurrentView('user_mgmt');
          }}
          onNavigateToTeams={() => setCurrentView('team_mgmt')}
        />
      );
      case 'overtime': return <OvertimeManagement onChangeView={(view) => setCurrentView(view)} />;
      case 'team_mgmt': return (
        <TeamManagement 
          onNavigateToPersonnel={(deptId) => {
            setTargetDeptIdForPersonnel(deptId);
            setCurrentView('personnel_mgmt');
          }}
        />
      );
      case 'tags': return (
        <TagManagement 
          onNavigateToPersonnel={() => setCurrentView('personnel_mgmt')}
        />
      );
      case 'user_mgmt': return (
        <UserManagement 
          onNavigateToPersonnel={() => setCurrentView('personnel_mgmt')}
          targetEmpId={selectedEmpForUserCreation}
        />
      );
      case 'fence': return <ElectronicFence />;
      case 'alarm_analysis': return (
        <AlarmAnalyticsDashboard 
          onNavigateToRules={() => setCurrentView('alarms')}
          onNavigateToRecords={(filterType) => handleNavigate('alarm_records', { filterType })}
        />
      );
      case 'alarms': return <AlarmConfig initialTab="rules" />;
      case 'alarm_records': return <AlarmDisposalView onNavigate={handleNavigate} />;
      case 'devices': return <DeviceManagement />;
      case 'workface_screen': return (
        <WorkfaceScreenView 
          onNavigateToConfig={() => setCurrentView('workface_config')}
          onNavigateToMonitor={() => setCurrentView('workface_monitor')}
        />
      );
      case 'workface_monitor': return (
        <WorkfaceMonitorAnalytics 
          onNavigateToTracking={(personId) => handleNavigate('personnel', { personId })}
          onNavigateToConfig={() => setCurrentView('workface_config')}
        />
      );
      case 'workface_config':
      case 'workface': return (
        <WorkfaceManagement 
          onNavigateToTracking={(personId) => handleNavigate('personnel', { personId })} 
          onNavigateToMonitor={() => setCurrentView('workface_monitor')}
          onNavigateToScreen={() => setCurrentView('workface_screen')}
        />
      );
      default: return <Dashboard />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return '驾驶舱';
      case 'project_overview': return '建造总览';
      case 'projects': return '船舶项目';
      case 'personnel_mgmt': return '人员管理';
      case 'models': return '船模管理';
      case 'personnel': return '人员定位';
      case 'personnel_track': return '人员轨迹';
      case 'alarm_analysis': return '告警分析';
      case 'alarms': return '告警策略';
      case 'alarm_records': return '告警处置';
      case 'fence': return '电子围栏';
      case 'tags': return '定位标签';
      case 'devices': return '物联设备';
      case 'workface_screen': return '作业看板';
      case 'workface_monitor': return '监控分析';
      case 'workface_config': return '区域划分';
      case 'workface': return '区域划分';
      case 'overtime': return '加班管理';
      case 'team_mgmt': return '组织管理';
      case 'user_mgmt': return '用户管理';
      default: return '智慧船厂';
    }
  };

  // 如果处于指挥中心大屏全屏监控模式，完全隐藏侧边栏与头部操作栏，仅渲染重点区域告警看板轮播
  if (isFullScreenMonitor) {
    return (
      <FullScreenAlarmMonitor 
        onExit={() => setIsFullScreenMonitor(false)} 
      />
    );
  }

  // 需求：作业面大屏打开时默认为全屏显示 (脱离普通后台布局限制，100%全景沉浸式渲染，支持ESC与控制台双向联动)
  if (currentView === 'workface_screen') {
    return (
      <WorkfaceScreenView 
        onExit={() => setCurrentView(previousView || 'dashboard')}
        onNavigateToDashboard={() => setCurrentView('dashboard')}
        onNavigateToConfig={() => setCurrentView('workface_config')}
        onNavigateToMonitor={() => setCurrentView('workface_monitor')}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleSidebarChangeView} 
        currentUser={currentUser}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {currentView !== 'dashboard' && (
          <Header 
            title={getViewTitle()} 
            currentUser={currentUser}
            onLogout={onLogout}
          />
        )}
        <main className="flex-1 overflow-auto p-3">
          {renderView()}
        </main>
        <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest shrink-0 shadow-sm">
          <div>数据同步状态: 同步正常 (延时 24ms)</div>
          <div>© 2026 SHIPYARD CO., LTD. ALL RIGHTS RESERVED.</div>
        </footer>
      </div>
    </div>
  );
}
