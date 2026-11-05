/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 船厂人员库详细档案与新建/编辑弹窗
 * 全面对应《人员与部门业务要素对照表》
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building2, 
  CreditCard, 
  Phone, 
  Calendar, 
  HardHat, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Ship,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  DhrPersonnelItem, 
  DHR_EMPLOYMENT_TYPES, 
  DHR_POST_JOBS
} from '@/src/data/dhrPersonnelData';
import { 
  getStoredDepartments, 
  flattenDepartments, 
  getDepartmentFullPath 
} from '@/src/data/departmentData';

interface PersonnelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: DhrPersonnelItem | null;
  mode: 'view' | 'create' | 'edit';
  onSave?: (personData: Partial<DhrPersonnelItem>, createAccount?: boolean) => void;
}

export function PersonnelDetailModal({ isOpen, onClose, person, mode, onSave }: PersonnelDetailModalProps) {
  const [showIdCard, setShowIdCard] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  // 弹窗打开时，若是新建模式，确保默认为不勾选状态
  useEffect(() => {
    if (isOpen && mode === 'create') {
      setCreateAccount(false);
    }
  }, [isOpen, mode]);

  // 动态读取最新的部门与班组架构
  const deptTree = getStoredDepartments();
  const flatDepts = flattenDepartments(deptTree);

  // 表单状态
  const [formData, setFormData] = useState<Partial<DhrPersonnelItem>>({
    name: person?.name || '',
    empcode: person?.empcode || `DN-${Math.floor(8000 + Math.random() * 999)}`,
    sex: person?.sex || '1',
    cellphone: person?.cellphone || '',
    IDCard: person?.IDCard || '',
    DEPT_CODE: person?.DEPT_CODE || 'DEPT-0101',
    deptname: person?.deptname || '东南船厂//制造部//船体电焊一组',
    ygtype: person?.ygtype || '17',
    gw: person?.gw || '35',
    entryDate: person?.entryDate || '2026-09-01',
    presenceStatus: person?.presenceStatus || 1,
    tagCode: person?.tagCode || '',
    tagStatus: person?.tagStatus || 'unbound',
    projectName: person?.projectName || '25000 DWT 多用途重吊船'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cellphone) {
      alert('请填写员工姓名和联系方式！');
      return;
    }
    const ygtypeName = DHR_EMPLOYMENT_TYPES[formData.ygtype || '17'] || '东南员工';
    const gwName = DHR_POST_JOBS[formData.gw || '35'] || '船舶电焊工';
    
    if (onSave) {
      onSave({
        ...formData,
        ygtypeName,
        gwName,
        potype: '1',
        deleted: 0
      }, createAccount);
    }
    onClose();
  };

  const maskIdCard = (id: string) => {
    if (!id || id.length < 10) return id;
    return id.replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        
        {/* 弹窗头部 */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {mode === 'create' ? '新建船厂人员档案' : mode === 'edit' ? '编辑人员档案信息' : '人员业务主档案详情'}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === 'create' ? '录入船厂现场人员业务档案要素' : `人员编号：${person?.empID || formData.empcode}`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === 'view' && person ? (
            /* 查看模式：详尽要素面板 */
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl border border-blue-200">
                  {person.name.slice(0, 1)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold text-slate-900">{person.name}</h4>
                    <span className="text-xs text-slate-400 font-mono">[{person.empcode}]</span>
                    <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded border border-blue-200">
                      {person.gwName || '工种未定'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${person.presenceStatus === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {person.presenceStatus === 1 ? '● 在线' : '○ 离线'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{person.deptname}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span>性别：{person.sex === '1' ? '男' : '女'}</span>
                    <span>用工类型：<strong className="text-slate-700">{person.ygtypeName}</strong></span>
                    <span>入职时间：{person.entryDate}</span>
                  </div>
                </div>
              </div>

              {/* 核心业务要素表单信息 */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] block">身份证号 (HR严格唯一实名)</span>
                  <div className="flex items-center justify-between font-mono font-medium text-slate-800">
                    <span>{showIdCard ? person.IDCard : maskIdCard(person.IDCard)}</span>
                    <button 
                      onClick={() => setShowIdCard(!showIdCard)}
                      className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                    >
                      {showIdCard ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] block">联系手机</span>
                  <span className="font-mono font-semibold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{person.cellphone}</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] block">定位标签编号</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                    <Radio className={`w-3.5 h-3.5 ${person.tagCode ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{person.tagCode || '未绑定发卡'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 text-[11px] block">系统用户账号状态 (1:0..1)</span>
                  <div className="flex items-center gap-2">
                    {person.hasUserAccount ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>已激活系统账号 ({person.systemUsername})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        <span>未激活账号 (仅作为人员库档案)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 所属工程建造项目 */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Ship className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[11px] text-blue-600 block">当前指派在建船舶项目</span>
                    <span className="font-bold text-slate-900">{person.projectName || '暂未指定派工项目'}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">项目表维护关联</span>
              </div>
            </div>
          ) : (
            /* 新建/编辑表单 */
            <form id="personForm" onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">员工姓名 <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.name || ''} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入真实姓名" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">员工工号</label>
                  <input 
                    type="text" 
                    value={formData.empcode || ''} 
                    onChange={e => setFormData({ ...formData, empcode: e.target.value })}
                    placeholder="如：DN-8025" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">性别</label>
                  <select 
                    value={formData.sex || '1'} 
                    onChange={e => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="1">男</option>
                    <option value="2">女</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">联系电话 (手机号) <span className="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    required
                    value={formData.cellphone || ''} 
                    onChange={e => setFormData({ ...formData, cellphone: e.target.value })}
                    placeholder="请输入11位手机号码" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">身份证号 (HR实名) <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.IDCard || ''} 
                  onChange={e => setFormData({ ...formData, IDCard: e.target.value })}
                  placeholder="请输入18位居民身份证号码" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">所属部门/班组</label>
                  <select 
                    value={formData.DEPT_CODE || 'DEPT-0101'} 
                    onChange={e => {
                      const code = e.target.value;
                      const path = getDepartmentFullPath(deptTree, code);
                      setFormData({ ...formData, DEPT_CODE: code, deptname: path || '东南船厂//作业班组' });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    {flatDepts.map(d => (
                      <option key={d.deptid} value={d.deptid}>
                        {'— '.repeat(Math.max(0, d.deptgrade - 1))}
                        {d.deptname} ({d.deptgrade === 1 ? '公司' : d.deptgrade === 2 ? '部门' : '班组'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">用工类型</label>
                  <select 
                    value={formData.ygtype || '17'} 
                    onChange={e => setFormData({ ...formData, ygtype: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="17">东南员工</option>
                    <option value="10">马船员工</option>
                    <option value="22">东南派遣</option>
                    <option value="13">劳务员工</option>
                    <option value="12">外协劳务 (利亚)</option>
                    <option value="14">实习生</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">岗位工种</label>
                <select 
                  value={formData.gw || '35'} 
                  onChange={e => setFormData({ ...formData, gw: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="35">船舶电焊工</option>
                  <option value="84">船舶装配工</option>
                  <option value="34">船舶电工</option>
                  <option value="101">安全员</option>
                  <option value="98">项目管理</option>
                  <option value="37">吊车工</option>
                  <option value="75">喷涂工</option>
                  <option value="31">搭架工</option>
                </select>
              </div>

              {/* 场景1联动：初次创建在人员库录入时勾选开通账号权限 */}
              {mode === 'create' && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={createAccount}
                      onChange={e => setCreateAccount(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="font-bold text-blue-900 text-xs flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>同时激活系统用户账号</span>
                    </span>
                  </label>
                  <p className="text-[11px] text-blue-700 pl-6 leading-relaxed">
                    默认不开通系统账号，只做为纯现场施工作业人员，账号默认为手机号，权限继承所属部门
                  </p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
          >
            {mode === 'view' ? '关闭' : '取消'}
          </button>

          {mode !== 'view' && (
            <button 
              type="submit"
              form="personForm"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all cursor-pointer"
            >
              保存人员档案
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
