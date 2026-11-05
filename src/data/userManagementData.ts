/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂系统用户账号管理数据与模型
 * 依据《智慧船厂人员组织关系分析》：
 * 1. 系统用户继承人员档案，人员关联账号 1 : 0..1
 * 2. 只有具备管理职能人员才激活系统账号 (如系统管理员, 造船项目管理员, 班组长, 安环巡检员等)
 * 3. 现场普通工人仅作为“人员库档案”被监控，不分配系统软件账号
 */

export type SystemUserRole = 
  | '系统管理员'
  | '造船项目管理员'
  | '车间主任/班组长'
  | '安环巡检员'
  | '外协审核员'
  | '普通作业员';

export interface SystemUser {
  // 🎯 图中规范字段（标准用户管理属性）
  userId: number | string; // 用户编号 (如: 145)
  userName: string; // 用户名称 (登录账号，如: huangpz)
  nickName: string; // 用户昵称 (姓名，如: 黄潘增)
  deptName: string; // 部门 (如: 安全环保部门)
  phonenumber: string; // 手机号码 (如: 13705910045 或空)
  status: '0' | '1' | 'enabled' | 'disabled'; // 状态: '0'或'enabled'为启用，'1'或'disabled'为停用
  createTime: string; // 创建时间 (如: 2026-05-06 17:37:04)

  // 兼容辅助字段
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
}

// 预置系统用户账号列表（首条完全对齐用户截图：145 huangpz 黄潘增 安全环保部门）
export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    userId: 145,
    userName: 'huangpz',
    nickName: '黄潘增',
    deptName: '安全环保部门',
    phonenumber: '',
    status: '0',
    createTime: '2026-05-06 17:37:04',
    // 兼容字段
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
    remarks: '码头安全督查与安环巡检'
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
    remarks: '最高系统管理员'
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
    remarks: '负责船舶排产推进'
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
    remarks: '电焊班组长作业管理'
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
    remarks: '搭载部工段调度'
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
    remarks: '已离场，账号锁定'
  }
];

// 系统角色权限配置字典（保留极简角色配置）
export const ROLE_CONFIGS: Record<SystemUserRole, { description: string; badgeColor: string; defaultPermissions: string[] }> = {
  '系统管理员': {
    description: '全系统功能完全控制权，含用户权限、DHR同步对接、系统参数配置',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    defaultPermissions: ['驾驶舱看板', '项目管理', '船模管理', '人员定位', '人员管理', '用户管理', '电子围栏', '告警配置', '设备管理']
  },
  '造船项目管理员': {
    description: '负责船舶建造项目立项、阶段推进、版本更迭与人员派工协同',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    defaultPermissions: ['驾驶舱看板', '项目管理', '船模管理', '人员管理(只读)', '电子围栏']
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
  '普通作业员': {
    description: '普通操作权限，仅可查看个人派工项目及安全须知',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    defaultPermissions: ['基础查看']
  }
};
