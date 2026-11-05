import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Ship,
  Compass,
  FolderKanban, 
  UserCheck,
  Radar,
  MapPin,
  Route,
  ShieldAlert, 
  BarChart3,
  BellRing, 
  Shield,
  Cpu,
  Radio,
  ServerCrash,
  Clock,
  Settings,
  FolderTree,
  UserCog,
  ChevronDown,
  Boxes,
  Layers,
  SlidersHorizontal,
  Tv,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ViewType } from '@/src/types';

interface SidebarProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

interface SubMenuItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  viewId?: ViewType; // 直达一级菜单（如驾驶舱）
  children?: SubMenuItem[]; // 二级子菜单
}

// 严格按照用户需求调整的一二级菜单层次与名称
const MENU_STRUCTURE: MenuItem[] = [
  { 
    id: 'dashboard', 
    label: '驾驶舱', 
    icon: LayoutDashboard, 
    viewId: 'dashboard' 
  },
  { 
    id: 'shipbuilding', 
    label: '船舶建造', 
    icon: Ship, 
    children: [
      { id: 'project_overview', label: '建造总览', icon: Compass },
      { id: 'projects', label: '船舶项目', icon: FolderKanban },
      { id: 'personnel_mgmt', label: '人员管理', icon: UserCheck },
      { id: 'models', label: '船模管理', icon: Boxes },
    ] 
  },
  { 
    id: 'inspection', 
    label: '定位巡检', 
    icon: Radar, 
    children: [
      { id: 'personnel', label: '人员定位', icon: MapPin },
      { id: 'personnel_track', label: '人员轨迹', icon: Route },
    ] 
  },
  { 
    id: 'safety', 
    label: '安全管控', 
    icon: ShieldAlert, 
    children: [
      { id: 'alarm_analysis', label: '告警分析', icon: BarChart3 },
      { id: 'alarms', label: '告警策略', icon: BellRing },
      { id: 'alarm_records', label: '告警处置', icon: ClipboardCheck },
      { id: 'fence', label: '电子围栏', icon: Shield },
    ] 
  },
  { 
    id: 'equipment', 
    label: '设备管理', 
    icon: Cpu, 
    children: [
      { id: 'tags', label: '定位标签', icon: Radio },
      { id: 'devices', label: '物联设备', icon: ServerCrash },
    ] 
  },
  { 
    id: 'workface_menu', 
    label: '作业区域', 
    icon: Layers, 
    children: [
      { id: 'workface_screen', label: '作业看板', icon: Tv },
      { id: 'workface_config', label: '区域划分', icon: SlidersHorizontal },
    ]
  },
  { 
    id: 'overtime_group', 
    label: '加班管理', 
    icon: Clock, 
    children: [
      { id: 'overtime', label: '加班管理', icon: Clock },
    ] 
  },
  { 
    id: 'system', 
    label: '系统管理', 
    icon: Settings, 
    children: [
      { id: 'team_mgmt', label: '组织管理', icon: FolderTree },
      { id: 'user_mgmt', label: '用户管理', icon: UserCog },
    ] 
  },
];

// 根据当前视图查找归属的一级菜单ID
function getParentMenuId(view: ViewType): string | null {
  for (const item of MENU_STRUCTURE) {
    if (item.children?.some(child => child.id === view)) {
      return item.id;
    }
  }
  if (view === 'workface' || view === 'workface_monitor') return 'workface_menu';
  return null;
}

export function Sidebar({ currentView, onChangeView, currentUser, onLogout }: SidebarProps) {
  // 手风琴互斥状态：记录当前展开的一级菜单ID（null表示全部折叠）
  const [openMenuId, setOpenMenuId] = useState<string | null>(() => getParentMenuId(currentView));

  // 一二级联动：当外部导航或当前视图改变时，自动展开对应的父菜单并保持互斥
  useEffect(() => {
    const parentId = getParentMenuId(currentView);
    if (parentId) {
      setOpenMenuId(parentId);
    }
  }, [currentView]);

  // 点击一级菜单处理
  const handleParentClick = (menu: MenuItem) => {
    if (menu.viewId) {
      // 驾驶舱等直达一级菜单
      onChangeView(menu.viewId);
      // 手风琴互斥：切换到驾驶舱时可将展开的菜单收起，保持界面清爽
      setOpenMenuId(null);
    } else if (menu.children && menu.children.length > 0) {
      // 具有二级菜单的一级菜单：手风琴互斥切换（点击自身折叠，点击其它展开自身并收起上一个）
      setOpenMenuId(prev => (prev === menu.id ? null : menu.id));
    }
  };

  // 点击二级子菜单
  const handleChildClick = (childId: ViewType, e?: React.MouseEvent) => {
    onChangeView(childId);
    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: childId } }));
  };

  return (
    <div className="w-56 h-screen bg-white text-slate-700 flex flex-col border-r border-slate-200 z-10 shadow-sm shrink-0 select-none">
      {/* 顶部系统标识 */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200">
        <div className="h-8 w-8 flex items-center justify-center mr-2.5 rounded-lg bg-blue-50/90 border border-blue-100 p-1 shrink-0 shadow-xs">
          <img 
            src="/assets/extracted_logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="overflow-hidden">
          <h1 className="text-slate-900 font-bold text-sm tracking-tight truncate leading-tight">智慧船厂</h1>
          <div className="text-[9px] text-blue-600 font-semibold tracking-wider">DIGITAL SHIPYARD</div>
        </div>
      </div>

      {/* 菜单列表区域 */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          业务协同导航
        </div>

        <nav className="space-y-1 mt-1">
          {MENU_STRUCTURE.map((menu) => {
            const hasChildren = Boolean(menu.children && menu.children.length > 0);
            const isOpen = openMenuId === menu.id;
            const isDirectActive = menu.viewId === currentView;
            // 判断当前一级菜单的子集是否包含激活项
            const containsActiveChild = Boolean(
              menu.children?.some(child => child.id === currentView)
            );

            return (
              <div key={menu.id} className="rounded-lg transition-colors">
                {/* 一级菜单按钮 */}
                <button
                  type="button"
                  onClick={() => handleParentClick(menu)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer group",
                    isDirectActive
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : containsActiveChild
                        ? "bg-blue-50/80 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <menu.icon 
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        isDirectActive 
                          ? "text-white" 
                          : containsActiveChild 
                            ? "text-blue-600" 
                            : "text-slate-500 group-hover:text-slate-700"
                      )} 
                    />
                    <span className="truncate">{menu.label}</span>
                  </div>

                  {/* 如果有子菜单，展示平滑旋转的手风琴箭头指示器 */}
                  {hasChildren && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {containsActiveChild && !isOpen && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      )}
                      <ChevronDown 
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-300 ease-in-out",
                          isOpen ? "rotate-180 text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        )} 
                      />
                    </div>
                  )}
                </button>

                {/* 二级菜单：CSS Grid 顺滑动效折叠区 */}
                {hasChildren && (
                  <div 
                    className={cn(
                      "grid transition-all duration-300 ease-in-out overflow-hidden",
                      isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0"
                    )}
                  >
                    <div className="overflow-hidden pl-4 pr-1 space-y-0.5 border-l-2 border-slate-200/80 ml-4 my-0.5">
                      {menu.children?.map((child) => {
                        const isChildActive = currentView === child.id;
                        const ChildIcon = child.icon;

                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={(e) => handleChildClick(child.id, e)}
                            title={child.label}
                            className={cn(
                              "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-all duration-150 cursor-pointer text-left",
                              isChildActive
                                ? "bg-blue-50 text-blue-600 font-bold shadow-2xs border-l-2 border-blue-600"
                                : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 font-medium"
                            )}
                          >
                            <ChildIcon 
                              className={cn(
                                "w-3.5 h-3.5 shrink-0 transition-colors",
                                isChildActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                              )} 
                            />
                            <span className="truncate">{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* 隐藏侧边栏底部大屏监控模式入口 (页面保留以备后期使用) */}
      {/* 
      <div className="p-2.5 mx-2 mb-1 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl border border-cyan-900/60 shadow-sm shrink-0">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle_fullscreen_monitor'))}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
          title="点击进入指挥中心大屏全屏监控模式"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/80 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <Tv className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                <span>大屏监控模式</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              </div>
              <div className="text-[10px] text-slate-400">
                重点区域告警实时轮播
              </div>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded">
            大屏
          </span>
        </button>
      </div>
      */}

      {/* 侧边栏底部系统状态 */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-600">服务正常运行</span>
          </div>
          <span className="font-mono text-slate-400 font-medium">V2.6 PRO</span>
        </div>
      </div>
    </div>
  );
}
