/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 新增 / 编辑系统用户弹窗
 * 业务极简设计：字段严格对应中后台标准字段：
 * [用户编号]、[用户名称]、[用户昵称]、[部门]、[手机号码]、[状态]、[登录密码]
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserPlus, 
  Search, 
  Building2, 
  CheckCircle2, 
  KeyRound, 
  Lock, 
  Phone,
  User,
  Sparkles
} from 'lucide-react';
import { DhrPersonnelItem, INITIAL_PERSONNEL_ITEMS } from '@/src/data/dhrPersonnelData';
import { SystemUser, SystemUserRole } from '@/src/data/userManagementData';
import { getStoredDepartments, flattenDepartments } from '@/src/data/departmentData';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<SystemUser>) => void;
  editingUser?: SystemUser | null;
  targetEmpId?: string;
}

export function CreateUserModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingUser,
  targetEmpId 
}: CreateUserModalProps) {
  // 人员库数据（可选快捷带入）
  const personnelList: DhrPersonnelItem[] = useMemo(() => {
    try {
      const saved = localStorage.getItem('shipyard_personnel_list');
      return saved ? JSON.parse(saved) : INITIAL_PERSONNEL_ITEMS;
    } catch {
      return INITIAL_PERSONNEL_ITEMS;
    }
  }, []);

  // 部门数据（快捷选择）
  const flatDepts = useMemo(() => {
    try {
      return flattenDepartments(getStoredDepartments());
    } catch {
      return [];
    }
  }, []);

  // 表单状态
  const [userName, setUserName] = useState(editingUser?.userName || editingUser?.username || '');
  const [nickName, setNickName] = useState(editingUser?.nickName || editingUser?.name || '');
  const [deptName, setDeptName] = useState(editingUser?.deptName || '安全环保部门');
  const [phonenumber, setPhonenumber] = useState(editingUser?.phonenumber || editingUser?.phone || '');
  const [password, setPassword] = useState('123456');
  const [status, setStatus] = useState<'0' | '1'>(() => {
    if (editingUser) {
      return (editingUser.status === '1' || editingUser.status === 'disabled') ? '1' : '0';
    }
    return '0';
  });

  // 快捷从人员库选择弹窗/抽屉展开状态
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [empSearch, setEmpSearch] = useState('');

  if (!isOpen) return null;

  // 快捷选择员工后自动填充对应字段
  const handleSelectPersonnel = (p: DhrPersonnelItem) => {
    setNickName(p.name);
    setDeptName(p.deptname.replace(/\\/g, '/').split('//').slice(-1)[0] || p.deptname);
    setPhonenumber(p.cellphone || '');
    if (!userName || !editingUser) {
      // 自动生成用户名称拼音/工号前缀
      setUserName(p.cellphone ? `user_${p.cellphone.slice(-4)}` : (p.empcode || p.empID).toLowerCase());
    }
    setShowQuickSelect(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('请输入用户名称（登录账号）');
      return;
    }
    if (!nickName.trim()) {
      alert('请输入用户昵称（姓名）');
      return;
    }
    if (!deptName.trim()) {
      alert('请选择或输入归属部门');
      return;
    }
    if (!phonenumber.trim()) {
      alert('请输入手机号码');
      return;
    }
    if (!password.trim()) {
      alert('请输入初始密码');
      return;
    }
    if (!status) {
      alert('请选择账号状态');
      return;
    }

    onSave({
      userName: userName.trim(),
      username: userName.trim(),
      nickName: nickName.trim(),
      name: nickName.trim(),
      deptName: deptName.trim() || '造船总装部',
      phonenumber: phonenumber.trim(),
      phone: phonenumber.trim(),
      status: status,
      password: password,
      role: (editingUser?.role || '造船项目管理员') as SystemUserRole,
      remarks: editingUser?.remarks || '平台登录账号'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* 弹窗头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight">
                {editingUser ? `修改用户账号信息 (${editingUser.userName || editingUser.username})` : '新增系统用户'}
              </h3>
              <p className="text-[11px] text-slate-500">
                配置用户名称、用户昵称、归属部门与启用状态
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 快捷引用人员库轻量入口 */}
        {!editingUser && (
          <div className="px-6 pt-3">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-[11px]">可从现有人员库中一键带入员工姓名与部门信息</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickSelect(!showQuickSelect)}
                className="text-xs px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 shadow-2xs transition-colors cursor-pointer"
              >
                {showQuickSelect ? '收起候选' : '从人员库导入'}
              </button>
            </div>

            {/* 人员快速检索面板 */}
            {showQuickSelect && (
              <div className="mt-2 border border-blue-200 rounded-xl p-2.5 bg-white space-y-2 shadow-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                    placeholder="输入姓名或工号筛选人员..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {personnelList
                    .filter(p => !empSearch || p.name.includes(empSearch) || p.deptname.includes(empSearch) || (p.empcode && p.empcode.includes(empSearch)))
                    .slice(0, 6)
                    .map(p => (
                      <div 
                        key={p.empID}
                        onClick={() => handleSelectPersonnel(p)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{p.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{p.empcode}</span>
                          <span className="text-slate-500 text-[10px]">{p.cellphone || '无电话'}</span>
                        </div>
                        <span className="text-slate-400 text-[10px] truncate max-w-[140px]">
                          {p.deptname.split('//').slice(-1)[0]}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 表单内容 */}
        <form id="simpleUserForm" onSubmit={handleSubmit} className="p-6 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          <div className="grid grid-cols-2 gap-3.5">
            {/* 用户名称 (登录账号) */}
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                用户名称 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="例如: huangpz"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400">系统登录账号（唯一）</span>
            </div>

            {/* 用户昵称 (姓名) */}
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                用户昵称 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                placeholder="例如: 黄潘增"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
              />
              <span className="text-[10px] text-slate-400">显示给用户的真实姓名</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* 部门 */}
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                部门 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                placeholder="例如: 安全环保部门"
                list="deptOptions"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
              />
              <datalist id="deptOptions">
                <option value="安全环保部门" />
                <option value="制造部/船体电焊一组" />
                <option value="制造部/船体装配二班" />
                <option value="搭载部/船台搭载工段" />
                <option value="涂装防腐工程部" />
                <option value="机电工程部" />
                <option value="外协工程施工分队" />
                {flatDepts.map(d => (
                  <option key={d.deptid} value={d.deptname} />
                ))}
              </datalist>
              <span className="text-[10px] text-slate-400">归属部门机构</span>
            </div>

            {/* 手机号码 */}
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                手机号码 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="tel"
                required
                value={phonenumber}
                onChange={e => setPhonenumber(e.target.value)}
                placeholder="请输入手机号码，如: 13705910045"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400">联系电话，用于通知推送与登录验证</span>
            </div>
          </div>

          {/* 密码设置 */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                初始密码 <span className="text-rose-500">*</span>
              </label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="请输入初始密码（默认: 123456）"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400">系统初次分配登录凭证</span>
            </div>

            {/* 状态 (正常 / 停用) */}
            <div className="space-y-1">
              <label className="block font-medium text-slate-700">
                账号状态 <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status_radio" 
                    required
                    checked={status === '0'} 
                    onChange={() => setStatus('0')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-800">正常 (开启)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    name="status_radio" 
                    required
                    checked={status === '1'} 
                    onChange={() => setStatus('1')}
                    className="text-slate-500 focus:ring-slate-400"
                  />
                  <span className="text-xs text-slate-500">停用 (锁定)</span>
                </label>
              </div>
              <span className="text-[10px] text-slate-400">停用后该账号将无法登录系统</span>
            </div>
          </div>

        </form>

        {/* 弹窗底部 */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          >
            取消
          </button>
          <button 
            type="submit"
            form="simpleUserForm"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-all cursor-pointer"
          >
            确定
          </button>
        </div>

      </div>
    </div>
  );
}
