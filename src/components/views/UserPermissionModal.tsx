import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckSquare,
  Square,
  MonitorPlay,
  LayoutDashboard,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ViewType } from '@/src/types';
import {
  SystemUser,
  SystemUserRole,
  MENU_PERMISSION_GROUPS,
  ALL_MENU_PERMISSION_IDS,
  ROLE_MENU_DEFAULTS,
  getEffectiveMenuPermissions,
  getEffectiveDefaultView
} from '@/src/data/userManagementData';

interface UserPermissionModalProps {
  isOpen: boolean;
  user: SystemUser | null;
  onClose: () => void;
  onSave: (userId: number | string, payload: {
    role: SystemUserRole;
    menuPermissions: ViewType[];
    defaultView: ViewType;
  }) => void;
}

export function UserPermissionModal({
  isOpen,
  user,
  onClose,
  onSave
}: UserPermissionModalProps) {
  const initialRole = (user?.role || '系统管理员') as SystemUserRole;
  const [role, setRole] = useState<SystemUserRole>(initialRole);
  const [selectedPerms, setSelectedPerms] = useState<ViewType[]>(() =>
    getEffectiveMenuPermissions(user)
  );
  const [defaultView, setDefaultView] = useState<ViewType>(() =>
    getEffectiveDefaultView(user)
  );

  useEffect(() => {
    if (!isOpen || !user) return;
    setRole((user.role || '系统管理员') as SystemUserRole);
    setSelectedPerms(getEffectiveMenuPermissions(user));
    setDefaultView(getEffectiveDefaultView(user));
  }, [isOpen, user]);

  // 所有已选中的菜单项元数据，用于选择默认登录首页
  const selectedViewOptions = useMemo(() => {
    const allItems = MENU_PERMISSION_GROUPS.flatMap(g =>
      g.items.map(item => ({ ...item, groupLabel: g.groupLabel }))
    );
    return allItems.filter(item => selectedPerms.includes(item.id));
  }, [selectedPerms]);

  if (!isOpen || !user) return null;

  const toggleItem = (id: ViewType) => {
    setSelectedPerms(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(x => x !== id) : [...prev, id];
      if (next.length > 0 && !next.includes(defaultView)) {
        setDefaultView(next[0]);
      }
      return next;
    });
  };

  const toggleGroup = (groupIds: ViewType[]) => {
    const allChecked = groupIds.every(id => selectedPerms.includes(id));
    setSelectedPerms(prev => {
      let next: ViewType[];
      if (allChecked) {
        next = prev.filter(id => !groupIds.includes(id));
      } else {
        next = Array.from(new Set([...prev, ...groupIds]));
      }
      if (next.length > 0 && !next.includes(defaultView)) {
        setDefaultView(next[0]);
      }
      return next;
    });
  };

  const applyTemplate = (tpl: 'all' | 'exhibition_only' | 'safety') => {
    if (tpl === 'all') {
      setRole('系统管理员');
      setSelectedPerms([...ALL_MENU_PERMISSION_IDS]);
      setDefaultView('dashboard');
    } else if (tpl === 'exhibition_only') {
      setRole('展厅展示员');
      setSelectedPerms(['exhibition_dashboard', 'exhibition_workface']);
      setDefaultView('exhibition_dashboard');
    } else {
      const safetyDefaults = ROLE_MENU_DEFAULTS['安环巡检员'];
      setRole('安环巡检员');
      setSelectedPerms([...safetyDefaults.menuPermissions]);
      setDefaultView(safetyDefaults.defaultView);
    }
  };

  const handleRoleChange = (nextRole: SystemUserRole) => {
    setRole(nextRole);
    const preset = ROLE_MENU_DEFAULTS[nextRole];
    if (preset) {
      setSelectedPerms([...preset.menuPermissions]);
      setDefaultView(preset.defaultView);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPerms.length === 0) {
      return;
    }
    const finalDefaultView = selectedPerms.includes(defaultView) ? defaultView : selectedPerms[0];
    onSave(user.userId ?? user.userName, {
      role,
      menuPermissions: selectedPerms,
      defaultView: finalDefaultView
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                菜单权限与默认视图配置 · {user.nickName || user.name}（{user.userName || user.username}）
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                分配可访问的一级/二级菜单（含展厅展示大屏），并设置账号登录后的默认进入页面
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容区 */}
        <form id="permissionForm" onSubmit={handleConfirm} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* 角色与快捷模板 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">所属角色模板</label>
              <select
                value={role}
                onChange={e => handleRoleChange(e.target.value as SystemUserRole)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                {(Object.keys(ROLE_MENU_DEFAULTS) as SystemUserRole[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">登录后默认首页</label>
              <select
                value={defaultView}
                onChange={e => setDefaultView(e.target.value as ViewType)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                {selectedViewOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.groupLabel === opt.label ? opt.label : `${opt.groupLabel} · ${opt.label}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>快速权限预设：</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('exhibition_only')}
                  className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <MonitorPlay className="w-3 h-3" />
                  <span>仅展厅展示（登录直达独立全屏）</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('safety')}
                  className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-medium transition-colors cursor-pointer"
                >
                  安环监管权限
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('all')}
                  className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium transition-colors cursor-pointer"
                >
                  全部菜单权限
                </button>
              </div>
            </div>
          </div>

          {/* 菜单树权限矩阵 */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>一 / 二级菜单访问权限（已选 {selectedPerms.length} / {ALL_MENU_PERMISSION_IDS.length} 项）</span>
              </h4>
              {selectedPerms.length === 0 && (
                <span className="text-rose-600 text-[11px] font-medium">请至少勾选一项菜单权限</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MENU_PERMISSION_GROUPS.map(group => {
                const groupIds = group.items.map(i => i.id);
                const checkedCount = groupIds.filter(id => selectedPerms.includes(id)).length;
                const allChecked = checkedCount === groupIds.length;
                const isExhibitionGroup = group.groupId === 'exhibition';

                return (
                  <div
                    key={group.groupId}
                    className={`rounded-xl border p-3.5 transition-colors ${
                      isExhibitionGroup
                        ? 'bg-indigo-50/45 border-indigo-200 md:col-span-2'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/70">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupIds)}
                        className="flex items-center gap-2 font-bold text-slate-800 hover:text-blue-700 cursor-pointer"
                      >
                        {allChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span>{group.groupLabel}</span>
                        {isExhibitionGroup && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                            展厅大屏专属菜单
                          </span>
                        )}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {checkedCount}/{groupIds.length}
                      </span>
                    </div>

                    <div className={`grid gap-2 ${isExhibitionGroup ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
                      {group.items.map(item => {
                        const checked = selectedPerms.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                              checked
                                ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                                : 'bg-slate-50/50 border-transparent hover:border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleItem(item.id)}
                              className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs flex items-center gap-1.5">
                                <span className="truncate">{item.label}</span>
                                {defaultView === item.id && checked && (
                                  <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-700 rounded font-medium shrink-0">
                                    默认首页
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* 底部操作 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>配置保存后即时生效，支持对应账号按权限展示侧边栏与默认独立全屏</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              form="permissionForm"
              disabled={selectedPerms.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold shadow-xs transition-all cursor-pointer"
            >
              保存权限配置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
