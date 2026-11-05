/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 用户管理视图组件
 * 核心对齐业务标准与中国主流企业级中后台体验：
 * 1. 组织机构与人员管理模块共用同一套组织层级管理架构
 * 2. 具备完善可用的密码重置功能（重置密码模态框）
 * 3. 去除删除功能，支持启用/停用操作
 * 字段严格涵盖：用户编号、用户名称、用户昵称、部门、手机号码、状态、创建时间及操作
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Plus, 
  Edit3, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Building2,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Phone,
  PowerOff,
  Power,
  Lock
} from 'lucide-react';
import { 
  SystemUser, 
  INITIAL_SYSTEM_USERS 
} from '@/src/data/userManagementData';
import { 
  DepartmentNode, 
  getStoredDepartments, 
  getAllDescendantIds,
  flattenDepartments 
} from '@/src/data/departmentData';
import { CreateUserModal } from './CreateUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';

interface UserManagementProps {
  onNavigateToPersonnel?: () => void;
  onNavigateToTeams?: () => void;
  targetEmpId?: string;
}

export function UserManagement({ 
  onNavigateToPersonnel, 
  onNavigateToTeams,
  targetEmpId 
}: UserManagementProps = {}) {
  // 组织架构树数据（与人员管理/组织管理共用一套）
  const [departments, setDepartments] = useState<DepartmentNode[]>(() => getStoredDepartments());
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [expandedDeptIds, setExpandedDeptIds] = useState<Set<string>>(() => {
    const all = flattenDepartments(getStoredDepartments());
    return new Set(all.filter(d => (d.deptgrade || 1) <= 3).map(d => d.deptid));
  });

  // 监听全局部门/组织更新
  useEffect(() => {
    const handleDeptUpdated = () => {
      setDepartments(getStoredDepartments());
    };
    window.addEventListener('departments_updated', handleDeptUpdated);
    return () => window.removeEventListener('departments_updated', handleDeptUpdated);
  }, []);

  // 用户列表数据
  const [userList, setUserList] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem('shipyard_system_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasHuangpz = parsed.some(u => (u.userId === 145 || u.userName === 'huangpz' || u.username === 'huangpz'));
          const normalized = parsed.map((u, idx) => ({
            userId: u.userId ?? (idx === 0 ? 145 : idx + 1),
            userName: u.userName || u.username || `user_${idx}`,
            nickName: u.nickName || u.name || '系统用户',
            deptName: u.deptName || '安全环保部门',
            phonenumber: u.phonenumber || u.phone || '',
            status: (u.status === '1' || u.status === 'disabled') ? '1' : '0',
            createTime: u.createTime || u.createdAt || '2026-05-06 17:37:04',
            ...u
          }));
          return hasHuangpz ? normalized : [INITIAL_SYSTEM_USERS[0], ...normalized];
        }
      }
      return INITIAL_SYSTEM_USERS;
    } catch {
      return INITIAL_SYSTEM_USERS;
    }
  });

  // 查询过滤条件
  const [queryUserName, setQueryUserName] = useState('');
  const [queryPhone, setQueryPhone] = useState('');
  const [queryStatus, setQueryStatus] = useState<'all' | '0' | '1'>('all');

  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(!!targetEmpId);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // 重置密码弹窗状态
  const [isResetPwdModalOpen, setIsResetPwdModalOpen] = useState(false);
  const [resetPwdUser, setResetPwdUser] = useState<SystemUser | null>(null);

  // 消息提示轻量 Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveUsers = (newList: SystemUser[]) => {
    setUserList(newList);
    try {
      localStorage.setItem('shipyard_system_users', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  // 重置搜索表单
  const handleResetSearch = () => {
    setQueryUserName('');
    setQueryPhone('');
    setQueryStatus('all');
    setSelectedDeptId('ALL');
  };

  // 展开/收起部门节点
  const toggleDeptExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedDeptIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 切换单行用户状态 (启用/停用)
  const handleToggleStatus = (targetUser: SystemUser) => {
    const nextStatus = (targetUser.status === '0' || targetUser.status === 'enabled') ? '1' : '0';
    const updatedList = userList.map(u => {
      const isMatch = (u.userId !== undefined && u.userId === targetUser.userId) || 
                      (u.userName && u.userName === targetUser.userName);
      if (isMatch) {
        return {
          ...u,
          status: nextStatus as '0' | '1'
        };
      }
      return u;
    });

    saveUsers(updatedList);
    showToast(`用户【${targetUser.userName}】已成功设置为：${nextStatus === '0' ? '启用' : '停用'}`);
  };

  // 保存新增或修改用户
  const handleSaveUser = (formData: Partial<SystemUser>) => {
    if (editingUser) {
      const updatedList = userList.map(u => {
        const isMatch = (u.userId !== undefined && u.userId === editingUser.userId) ||
                        (u.userName && u.userName === editingUser.userName);
        if (isMatch) {
          return {
            ...u,
            ...formData,
            userId: u.userId,
            createTime: u.createTime || u.createdAt || '2026-05-06 17:37:04'
          };
        }
        return u;
      });
      saveUsers(updatedList);
      showToast(`已成功修改用户【${formData.userName || editingUser.userName}】`);
    } else {
      // 生成最大用户编号 + 1
      const maxId = userList.reduce((max, u) => {
        const num = typeof u.userId === 'number' ? u.userId : parseInt(String(u.userId), 10);
        return !isNaN(num) && num > max ? num : max;
      }, 145);

      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const newUser: SystemUser = {
        userId: maxId + 1,
        userName: formData.userName || 'user_new',
        nickName: formData.nickName || '新用户',
        deptName: formData.deptName || '安全环保部门',
        phonenumber: formData.phonenumber || '',
        status: formData.status || '0',
        createTime: nowStr,
        ...formData
      };

      saveUsers([newUser, ...userList]);
      showToast(`已成功新增系统用户【${newUser.userName}】`);
    }
  };

  // 执行重置密码确认
  const handleConfirmResetPassword = (userId: number | string, newPassword: string) => {
    const updatedList = userList.map(u => {
      const isMatch = (u.userId !== undefined && u.userId === userId) || (u.userName === userId);
      if (isMatch) {
        return {
          ...u,
          password: newPassword
        };
      }
      return u;
    });

    saveUsers(updatedList);
    showToast(`用户【${resetPwdUser?.userName}】登录密码已重置成功！`);
  };

  // 递归查找选中的部门名称及所有子部门
  const selectedDeptNames = useMemo(() => {
    if (selectedDeptId === 'ALL') return null;
    const ids = new Set(getAllDescendantIds(departments, selectedDeptId, true));

    const flat = flattenDepartments(departments);
    const targetNodes = flat.filter(n => ids.has(n.deptid));
    return targetNodes.map(n => n.deptname);
  }, [departments, selectedDeptId]);

  // 过滤后的数据列表
  const filteredUsers = useMemo(() => {
    return userList.filter(user => {
      // 组织架构树部门过滤
      if (selectedDeptNames && selectedDeptNames.length > 0) {
        const uDept = user.deptName || '';
        const matchDept = selectedDeptNames.some(dName => 
          uDept.includes(dName) || dName.includes(uDept)
        );
        if (!matchDept) return false;
      }

      // 用户名称/昵称过滤
      if (queryUserName.trim()) {
        const kw = queryUserName.trim().toLowerCase();
        const matchUName = (user.userName || user.username || '').toLowerCase().includes(kw);
        const matchNName = (user.nickName || user.name || '').toLowerCase().includes(kw);
        if (!matchUName && !matchNName) return false;
      }

      // 手机号码过滤
      if (queryPhone.trim()) {
        const phone = user.phonenumber || user.phone || '';
        if (!phone.includes(queryPhone.trim())) return false;
      }

      // 状态过滤
      if (queryStatus !== 'all') {
        const isEnabled = user.status === '0' || user.status === 'enabled';
        if (queryStatus === '0' && !isEnabled) return false;
        if (queryStatus === '1' && isEnabled) return false;
      }

      return true;
    });
  }, [userList, selectedDeptNames, queryUserName, queryPhone, queryStatus]);

  // 递归渲染左侧部门树
  const renderDeptTree = (nodes: DepartmentNode[], level = 0) => {
    return nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedDeptIds.has(node.deptid);
      const isSelected = selectedDeptId === node.deptid;

      return (
        <div key={node.deptid} className="select-none">
          <div 
            onClick={() => setSelectedDeptId(node.deptid)}
            className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-colors ${
              isSelected 
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            style={{ paddingLeft: `${level * 14 + 8}px` }}
          >
            <div className="flex items-center gap-1.5 truncate">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleDeptExpand(node.deptid, e)}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-400 cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <span className="truncate">{node.deptname}</span>
            </div>
            {node.disabled === 1 && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded">停用</span>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="space-y-0.5">
              {renderDeptTree(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-3 animate-fadeIn">
      
      {/* 顶部极简 Toast 提示 */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 主体双栏布局：左侧共享组织架构树 + 右侧用户管理主区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* 左侧：组织机构层级树 (共用一套组织层级管理) */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs flex flex-col min-h-[580px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>组织架构 / 部门层级</span>
            </div>
            <div className="flex items-center gap-1">
              {onNavigateToTeams && (
                <button
                  type="button"
                  onClick={onNavigateToTeams}
                  className="text-[10px] px-1.5 py-0.5 rounded text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-0.5 cursor-pointer"
                  title="前往组织管理维护部门架构"
                >
                  <FolderTree className="w-3 h-3" />
                  <span>维护</span>
                </button>
              )}
              <button 
                type="button"
                onClick={() => setSelectedDeptId('ALL')}
                className={`text-[11px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  selectedDeptId === 'ALL' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                全部 ({userList.length})
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mb-2 px-1">
            <span>点击部门可快速筛选用户</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 max-h-[620px]">
            {renderDeptTree(departments)}
          </div>
        </div>

        {/* 右侧：用户列表与管理操作 (9列宽) */}
        <div className="lg:col-span-9 space-y-3">
          
          {/* 1. 顶部查询筛选卡片 */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
            <form 
              onSubmit={e => { e.preventDefault(); }} 
              className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs"
            >
              {/* 用户名称查询 */}
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium whitespace-nowrap">用户名称</label>
                <input 
                  type="text"
                  value={queryUserName}
                  onChange={e => setQueryUserName(e.target.value)}
                  placeholder="请输入用户名称/昵称"
                  className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-blue-500 w-44 bg-white text-slate-800"
                />
              </div>

              {/* 手机号码查询 */}
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium whitespace-nowrap">手机号码</label>
                <input 
                  type="text"
                  value={queryPhone}
                  onChange={e => setQueryPhone(e.target.value)}
                  placeholder="请输入手机号码"
                  className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-blue-500 w-40 bg-white text-slate-800 font-mono"
                />
              </div>

              {/* 状态查询 */}
              <div className="flex items-center gap-2">
                <label className="text-slate-600 font-medium whitespace-nowrap">状态</label>
                <select
                  value={queryStatus}
                  onChange={e => setQueryStatus(e.target.value as any)}
                  className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-hidden focus:border-blue-500 bg-white text-slate-800 w-28"
                >
                  <option value="all">所有状态</option>
                  <option value="0">启用 (正常)</option>
                  <option value="1">停用</option>
                </select>
              </div>

              {/* 操作按钮组 */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {}}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>搜索</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. 主体表格卡片 */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
            
            {/* 表格上方快捷操作按钮 */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增用户</span>
                </button>
              </div>

              <div className="text-xs text-slate-400">
                共 <span className="font-mono font-bold text-slate-700">{filteredUsers.length}</span> 条系统用户记录
              </div>
            </div>

            {/* 核心数据表格 (去除删除列，改为启用/停用操作) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                    <th className="py-3 px-4 font-medium w-24">用户编号</th>
                    <th className="py-3 px-4 font-medium w-36">用户名称</th>
                    <th className="py-3 px-4 font-medium w-32">用户昵称</th>
                    <th className="py-3 px-4 font-medium min-w-[160px]">部门</th>
                    <th className="py-3 px-4 font-medium w-36">手机号码</th>
                    <th className="py-3 px-4 font-medium w-28 text-center">状态</th>
                    <th className="py-3 px-4 font-medium w-44">创建时间</th>
                    <th className="py-3 px-4 font-medium w-36 text-right pr-4">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>暂无符合条件的用户数据</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isEnabled = user.status === '0' || user.status === 'enabled';
                      const uId = user.userId ?? user.id ?? '—';
                      const uName = user.userName || user.username || '—';
                      const nName = user.nickName || user.name || '—';
                      const dName = user.deptName || '—';
                      const phone = user.phonenumber || user.phone || '';
                      const cTime = user.createTime || user.createdAt || '—';

                      return (
                        <tr key={`${uId}-${uName}`} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* 1. 用户编号 */}
                          <td className="py-3 px-4 text-slate-600 font-mono text-[13px]">
                            {uId}
                          </td>

                          {/* 2. 用户名称 */}
                          <td className="py-3 px-4 font-medium text-slate-900 font-mono text-[13px]">
                            {uName}
                          </td>

                          {/* 3. 用户昵称 */}
                          <td className="py-3 px-4 text-slate-800 text-[13px]">
                            {nName}
                          </td>

                          {/* 4. 部门 */}
                          <td className="py-3 px-4 text-slate-700 text-[13px]">
                            <span className="truncate max-w-[200px] inline-block" title={dName}>
                              {dName}
                            </span>
                          </td>

                          {/* 5. 手机号码 */}
                          <td className="py-3 px-4 font-mono text-slate-600 text-[13px]">
                            {phone || <span className="text-slate-300 font-normal select-none">—</span>}
                          </td>

                          {/* 6. 状态 (经典蓝色 Switch 滑块开关) */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isEnabled}
                              onClick={() => handleToggleStatus(user)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                isEnabled ? 'bg-[#1890ff]' : 'bg-slate-300'
                              }`}
                              title={`当前状态: ${isEnabled ? '正常启用 (点击停用)' : '已停用 (点击启用)'}`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>

                          {/* 7. 创建时间 */}
                          <td className="py-3 px-4 font-mono text-slate-500 text-[12px] whitespace-nowrap">
                            {cTime}
                          </td>

                          {/* 8. 操作 (修改、重置密码、启用/停用；已按要求去除删除功能) */}
                          <td className="py-3 px-4 text-right pr-4 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5 text-xs font-medium">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                title="修改用户信息"
                              >
                                修改
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setResetPwdUser(user);
                                  setIsResetPwdModalOpen(true);
                                }}
                                className="text-amber-600 hover:text-amber-800 transition-colors cursor-pointer font-medium"
                                title="重置登录密码"
                              >
                                重置密码
                              </button>

                              {/* 启用 / 停用切换按钮 */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user)}
                                className={`transition-colors cursor-pointer font-medium ${
                                  isEnabled ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'
                                }`}
                                title={isEnabled ? '停用此用户' : '启用此用户'}
                              >
                                {isEnabled ? '停用' : '启用'}
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* 新增 / 修改用户弹窗 */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        editingUser={editingUser}
        targetEmpId={targetEmpId}
      />

      {/* 重置密码弹窗 */}
      <ResetPasswordModal
        isOpen={isResetPwdModalOpen}
        user={resetPwdUser}
        onClose={() => {
          setIsResetPwdModalOpen(false);
          setResetPwdUser(null);
        }}
        onConfirm={handleConfirmResetPassword}
      />

    </div>
  );
}
