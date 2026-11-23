/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂系统用户账号管理与菜单权限配置数据模型
 */

import { ViewType } from '@/src/types';

export type SystemUserRole = 
  | '系统管理员'
  | '造船项目管理员'
  | '车间主任/班组长'
  | '安环巡检员'
  | '外协审核员'
  | '展厅展示员'
  | '普通作业员';

export interface MenuPermissionItem {
  id: ViewType;
  label: string;
  description?: string;
}

export interface MenuPermissionGroup {
  groupId: string;
  groupLabel: string;
  items: MenuPermissionItem[];
}

export const MENU_PERMISSION_GROUPS: MenuPermissionGroup[] = [
  {
    groupId: 'dashboard',
    groupLabel: '驾驶舱',
    items: [
      { id: 'dashboard', label: '驾驶舱（管理工作台）', description: '厂区与在建船舶数字孪生总览' }
    ]
  },
  {
    groupId: 'exhibition',
    groupLabel: '展厅展示',
    items: [
      { id: 'exhibition_dashboard', label: '驾驶舱（展示）', description: '展厅独立全屏驾驶舱，支持与作业面大屏触摸互切、5分钟无操作回厂区首页' },
      { id: 'exhibition_workface', label: '作业看板（展示）', description: '展厅独立大屏看板，默认仅播放部署码头的船舶项目并自动轮播' }
    ]
  },
  {
    groupId: 'shipbuilding',
    groupLabel: '船舶建造',
    items: [
      { id: 'project_overview', label: '建造总览' },
      { id: 'projects', label: '船舶项目' },
      { id: 'personnel_mgmt', label: '人员管理' },
      { id: 'models', label: '船模管理' }
    ]
  },
  {
    groupId: 'inspection',
    groupLabel: '定位巡检',
    items: [
      { id: 'personnel', label: '人员定位' },
      { id: 'personnel_track', label: '人员轨迹' }
    ]
  },
  {
    groupId: 'safety',
    groupLabel: '安全管控',
    items: [
      { id: 'alarm_analysis', label: '告警分析' },
      { id: 'alarms', label: '告警策略' },
      { id: 'alarm_records', label: '告警处置' }
    ]
  },
  {
    groupId: 'equipment',
    groupLabel: '设备管理',
    items: [
      { id: 'tags', label: '定位标签' },
      { id: 'devices', label: '物联设备' }
    ]
  },
  {
    groupId: 'workface_menu',
    groupLabel: '作业区域',
    items: [
      { id: 'workface_screen', label: '作业看板' },
      { id: 'workface_config', label: '区域划分' },
      { id: 'fence', label: '电子围栏' }
    ]
  },
  {
    groupId: 'overtime_group',
    groupLabel: '加班管理',
    items: [
      { id: 'overtime', label: '加班管理' }
    ]
  },
  {
    groupId: 'system',
    groupLabel: '系统管理',
    items: [
      { id: 'team_mgmt', label: '组织管理' },
      { id: 'user_mgmt', label: '用户管理' }
    ]
  }
];

export const ALL_MENU_PERMISSION_IDS: ViewType[] = MENU_PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.id));

export interface SystemUser {
  userId: number | string;
  userName: string;
  nickName: string;
  deptName: string;
  phonenumber: string;
  status: '0' | '1' | 'enabled' | 'disabled';
  createTime: string;

  id?: string;
  username?: string;
  name?: string;
  phone?: string;
  empId?: string;
  deptId?: string;
  companyName?: string;
  role?: SystemUserRole;
  password?: string;
  remarks?: string;
  createdAt?: string;
  lastLoginTime?: string;
  lastLoginIp?: string;
  permissions?: string[];
  menuPermissions?: ViewType[];
  defaultView?: ViewType;
}

export const ROLE_MENU_DEFAULTS: Record<SystemUserRole, { menuPermissions: ViewType[]; defaultView: ViewType }> = {
  '系统管理员': {
    menuPermissions: [...ALL_MENU_PERMISSION_IDS],
    defaultView: 'dashboard'
  },
  '造船项目管理员': {
    menuPermissions: [
      'dashboard', 'exhibition_dashboard', 'exhibition_workface',
      'project_overview', 'projects', 'personnel_mgmt', 'models',
      'personnel', 'workface_screen', 'workface_config', 'fence'
    ],
    defaultView: 'dashboard'
  },
  '车间主任/班组长': {
    menuPermissions: [
      'dashboard', 'projects', 'personnel_mgmt', 'personnel', 'personnel_track',
      'tags', 'workface_screen', 'overtime'
    ],
    defaultView: 'dashboard'
  },
  '安环巡检员': {
    menuPermissions: [
      'dashboard', 'exhibition_dashboard', 'exhibition_workface',
      'personnel', 'personnel_track', 'alarm_analysis', 'alarms', 'alarm_records',
      'workface_screen', 'workface_config', 'fence'
    ],
    defaultView: 'dashboard'
  },
  '外协审核员': {
    menuPermissions: ['dashboard', 'personnel_mgmt', 'personnel', 'tags'],
    defaultView: 'personnel_mgmt'
  },
  '展厅展示员': {
    menuPermissions: ['exhibition_dashboard', 'exhibition_workface'],
    defaultView: 'exhibition_dashboard'
  },
  '普通作业员': {
    menuPermissions: ['dashboard', 'personnel'],
    defaultView: 'dashboard'
  }
};

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    userId: 145,
    userName: 'huangpz',
    nickName: '黄潘增',
    deptName: '安全环保部门',
    phonenumber: '',
    status: '0',
    createTime: '2026-05-06 17:37:04',
    id: 'USR-145',
    username: 'huangpz',
    name: '黄潘增',
    phone: '',
    empId: 'EMP-1004',
    deptId: 'DEPT-0401',
    companyName: '东南船厂',
    role: '安环巡检员',
    createdAt: '2026-05-06 17:37:04',
    lastLoginTime: '2026-09-14 16:10:05',
    lastLoginIp: '192.168.10.142',
    remarks: '码头安全督查与安环巡检',
    menuPermissions: ROLE_MENU_DEFAULTS['安环巡检员'].menuPermissions,
    defaultView: 'dashboard'
  },
  {
    userId: 146,
    userName: 'exhibition',
    nickName: '主楼展厅大屏',
    deptName: '综合展厅/主楼交互大屏',
    phonenumber: '13805910088',
    status: '0',
    createTime: '2026-06-01 09:30:00',
    id: 'USR-146',
    username: 'exhibition',
    name: '主楼展厅大屏',
    phone: '13805910088',
    empId: 'EMP-1099',
    deptId: 'DEPT-001',
    companyName: '东南船厂',
    role: '展厅展示员',
    createdAt: '2026-06-01 09:30:00',
    lastLoginTime: '2026-09-15 08:30:00',
    lastLoginIp: '192.168.20.10',
    remarks: '展厅专用账号，登录后默认独立全屏进入驾驶舱（展示）',
    menuPermissions: ['exhibition_dashboard', 'exhibition_workface'],
    defaultView: 'exhibition_dashboard'
  },
  {
    userId: 1,
    userName: 'admin',
    nickName: '系统管理员',
    deptName: '总经办/信息中心',
    phonenumber: '13705910045',
    status: '0',
    createTime: '2026-01-01 09:00:00',
    id: 'USR-001',
    username: 'admin',
    name: '系统管理员',
    phone: '13705910045',
    empId: 'EMP-1001',
    deptId: 'DEPT-001',
    companyName: '东南船厂',
    role: '系统管理员',
    createdAt: '2026-01-01 09:00:00',
    lastLoginTime: '2026-09-14 17:45:12',
    lastLoginIp: '192.168.10.125',
    remarks: '最高系统管理员',
    menuPermissions: [...ALL_MENU_PERMISSION_IDS],
    defaultView: 'dashboard'
  },
  {
    userId: 102,
    userName: 'yangpl',
    nickName: '杨培林',
    deptName: '制造部/装配二班',
    phonenumber: '13799308821',
    status: '0',
    createTime: '2026-03-15 10:20:00',
    id: 'USR-002',
    username: 'yangpl',
    name: '杨培林',
    phone: '13799308821',
    empId: 'EMP-1011',
    deptId: 'DEPT-0102',
    companyName: '东南船厂',
    role: '造船项目管理员',
    createdAt: '2026-03-15 10:20:00',
    lastLoginTime: '2026-09-14 15:30:20',
    lastLoginIp: '192.168.10.168',
    remarks: '负责船舶排产推进',
    menuPermissions: ROLE_MENU_DEFAULTS['造船项目管理员'].menuPermissions,
    defaultView: 'dashboard'
  },
  {
    userId: 103,
    userName: 'zhangzq',
    nickName: '张志强',
    deptName: '制造部/电焊一组',
    phonenumber: '13905918801',
    status: '0',
    createTime: '2026-04-10 14:00:00',
    id: 'USR-003',
    username: 'zhangzq',
    name: '张志强',
    phone: '13905918801',
    empId: 'EMP-1003',
    deptId: 'DEPT-0101',
    companyName: '东南船厂',
    role: '车间主任/班组长',
    createdAt: '2026-04-10 14:00:00',
    lastLoginTime: '2026-09-13 18:22:45',
    lastLoginIp: '192.168.12.88',
    remarks: '电焊班组长作业管理',
    menuPermissions: ROLE_MENU_DEFAULTS['车间主任/班组长'].menuPermissions,
    defaultView: 'dashboard'
  },
  {
    userId: 104,
    userName: 'chenjf',
    nickName: '陈建峰',
    deptName: '搭载部/船台搭载工段',
    phonenumber: '13859012345',
    status: '0',
    createTime: '2026-04-20 11:15:30',
    id: 'USR-004',
    username: 'chenjf',
    name: '陈建峰',
    phone: '13859012345',
    empId: 'EMP-1025',
    deptId: 'DEPT-020',
    companyName: '东南船厂',
    role: '车间主任/班组长',
    createdAt: '2026-04-20 11:15:30',
    lastLoginTime: '2026-09-12 10:11:00',
    lastLoginIp: '192.168.12.92',
    remarks: '搭载部工段调度',
    menuPermissions: ROLE_MENU_DEFAULTS['车间主任/班组长'].menuPermissions,
    defaultView: 'dashboard'
  },
  {
    userId: 105,
    userName: 'linwb',
    nickName: '林文标',
    deptName: '涂装防腐工程部',
    phonenumber: '13600987654',
    status: '1',
    createTime: '2026-05-01 08:30:00',
    id: 'USR-005',
    username: 'linwb',
    name: '林文标',
    phone: '13600987654',
    empId: 'EMP-1030',
    deptId: 'DEPT-030',
    companyName: '东南船厂',
    role: '普通作业员',
    createdAt: '2026-05-01 08:30:00',
    lastLoginTime: '2026-08-20 14:20:00',
    lastLoginIp: '192.168.11.35',
    remarks: '已离场，账号锁定',
    menuPermissions: ROLE_MENU_DEFAULTS['普通作业员'].menuPermissions,
    defaultView: 'dashboard'
  }
];

export const ROLE_CONFIGS: Record<SystemUserRole, { description: string; badgeColor: string; defaultPermissions: string[] }> = {
  '系统管理员': {
    description: '全系统功能完全控制权，含展厅展示、用户权限、DHR同步对接与系统参数配置',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    defaultPermissions: ['驾驶舱看板', '展厅展示大屏', '项目管理', '船模管理', '人员定位', '人员管理', '用户管理', '电子围栏', '告警配置', '设备管理']
  },
  '造船项目管理员': {
    description: '负责船舶建造项目立项、阶段推进、版本更迭与人员派工协同',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    defaultPermissions: ['驾驶舱看板', '展厅展示大屏', '项目管理', '船模管理', '人员管理(只读)', '电子围栏']
  },
  '车间主任/班组长': {
    description: '负责车间班组工人日常管理、在场签到、工时审核与定位标签收发',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    defaultPermissions: ['人员管理(标签收发)', '人员定位', '班组排班']
  },
  '安环巡检员': {
    description: '负责船厂受限空间、电子围栏告警督查、越界处置与安全应急响应',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    defaultPermissions: ['人员定位', '电子围栏', '告警处置', '实时轨迹回放']
  },
  '外协审核员': {
    description: '负责审核外协工程队人员资质、安全培训证书与入场作业标签核发',
    badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    defaultPermissions: ['人员管理(外协审核)', '人员定位']
  },
  '展厅展示员': {
    description: '用于主楼展厅独立全屏交互展示，登录后直达驾驶舱（展示）与作业看板（展示）',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    defaultPermissions: ['驾驶舱（展示）', '作业看板（展示）']
  },
  '普通作业员': {
    description: '普通操作权限，仅可查看个人派工项目及安全须知',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    defaultPermissions: ['基础查看']
  }
};

export function getStoredSystemUsers(): SystemUser[] {
  try {
    const saved = localStorage.getItem('shipyard_system_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized: SystemUser[] = parsed.map((u, idx) => {
          const role = (u.role || '造船项目管理员') as SystemUserRole;
          const roleDefault = ROLE_MENU_DEFAULTS[role] || ROLE_MENU_DEFAULTS['系统管理员'];
          return {
            userId: u.userId ?? (idx === 0 ? 145 : idx + 1),
            userName: u.userName || u.username || `user_${idx}`,
            nickName: u.nickName || u.name || '系统用户',
            deptName: u.deptName || '安全环保部门',
            phonenumber: u.phonenumber || u.phone || '',
            status: (u.status === '1' || u.status === 'disabled') ? '1' : '0',
            createTime: u.createTime || u.createdAt || '2026-05-06 17:37:04',
            ...u,
            menuPermissions: Array.isArray(u.menuPermissions) && u.menuPermissions.length > 0
              ? u.menuPermissions
              : roleDefault.menuPermissions,
            defaultView: u.defaultView || roleDefault.defaultView
          };
        });
        const hasExhibition = normalized.some(u => (u.userName || u.username) === 'exhibition');
        if (!hasExhibition) {
          const exUser = INITIAL_SYSTEM_USERS.find(u => u.userName === 'exhibition');
          if (exUser) normalized.splice(1, 0, exUser);
        }
        return normalized;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_SYSTEM_USERS;
}

export function getEffectiveMenuPermissions(user?: {
  username?: string;
  role?: string;
  menuPermissions?: ViewType[];
} | null): ViewType[] {
  if (!user) return [...ALL_MENU_PERMISSION_IDS];
  if (Array.isArray(user.menuPermissions) && user.menuPermissions.length > 0) {
    return user.menuPermissions;
  }
  const roleKey = user.role as SystemUserRole | undefined;
  if (roleKey && ROLE_MENU_DEFAULTS[roleKey]) {
    return ROLE_MENU_DEFAULTS[roleKey].menuPermissions;
  }
  return [...ALL_MENU_PERMISSION_IDS];
}

export function getEffectiveDefaultView(user?: {
  defaultView?: ViewType;
  role?: string;
  menuPermissions?: ViewType[];
} | null): ViewType {
  const perms = getEffectiveMenuPermissions(user);
  if (user?.defaultView && perms.includes(user.defaultView)) {
    return user.defaultView;
  }
  const roleKey = user?.role as SystemUserRole | undefined;
  const roleDefault = roleKey && ROLE_MENU_DEFAULTS[roleKey]?.defaultView;
  if (roleDefault && perms.includes(roleDefault)) {
    return roleDefault;
  }
  if (perms.includes('dashboard')) return 'dashboard';
  return perms[0] || 'dashboard';
}
