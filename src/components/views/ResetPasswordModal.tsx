/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 用户重置密码模态框组件
 * 支持输入新密码、确认密码或一键重置为默认初始密码 (123456)
 */

import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { SystemUser } from '@/src/data/userManagementData';

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: SystemUser | null;
  onClose: () => void;
  onConfirm: (userId: number | string, newPassword: string) => void;
}

export function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onConfirm
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMsg('请输入新密码');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('密码长度不能少于 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('两次输入的密码不一致');
      return;
    }

    onConfirm(user.userId ?? user.userName, newPassword);
    onClose();
  };

  const handleSetDefault = () => {
    setNewPassword('123456');
    setConfirmPassword('123456');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col text-slate-800">
        
        {/* 顶部标题栏 */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">重置用户密码</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                目标账号：{user.userName} ({user.nickName || '未命名'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* 用户基本信息卡片 */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">所属部门</span>
              <span className="font-medium text-slate-800">{user.deptName || '安全环保部门'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">手机号码</span>
              <span className="font-mono text-slate-700">{user.phonenumber || '未设置'}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 新密码输入 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">新密码</label>
              <button
                type="button"
                onClick={handleSetDefault}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                设为默认密码 (123456)
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="请输入新密码（不少于6位）"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 确认密码输入 */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">确认新密码</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="请再次输入新密码"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-blue-500 bg-white"
            />
          </div>

          {/* 底部按钮 */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>确认重置</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
