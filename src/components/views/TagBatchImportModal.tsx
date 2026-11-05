/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 定位标签批量导入模态框 (TagBatchImportModal)
 * 支持 CSV/Excel 复制粘贴/文件拖拽上传，标签编码规范与查重，
 * 智能根据工号或姓名匹配人员档案，同步双向更新标签池与人员库收发状态。
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Radio, 
  Users, 
  Sparkles, 
  ShieldCheck,
  Battery,
  UserCheck
} from 'lucide-react';
import { 
  LocationTagItem, 
  BatteryLevel, 
  getStoredTags, 
  saveStoredTags 
} from '@/src/data/tagData';
import { DhrPersonnelItem } from '@/src/data/dhrPersonnelData';
import * as XLSX from 'xlsx';

interface ParsedTagRow {
  id: string; // 临时唯一ID
  tagCode: string; // 标签编码 (必填项)
  inputEmpCode: string; // Excel导入的人员工号
  inputName: string; // Excel导入的员工姓名
  tagStatus: 'used' | 'unused';
  matchedPerson?: DhrPersonnelItem;
  deviceStatus: 'online' | 'offline';
  batteryLevel: BatteryLevel | null;
  status: 'valid' | 'warning' | 'error';
  statusMessages: string[];
  isExistingInSystem: boolean;
  selected: boolean;
}

interface TagBatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTags: LocationTagItem[];
  personnelList: DhrPersonnelItem[];
  onImportSuccess: (importedCount: number, overwrittenCount: number) => void;
}

export function TagBatchImportModal({
  isOpen,
  onClose,
  existingTags,
  personnelList,
  onImportSuccess
}: TagBatchImportModalProps) {
  // 文件名称
  const [fileName, setFileName] = useState<string>('');

  // 查重策略：'skip' 跳过已存在 | 'overwrite' 覆盖更新
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'overwrite'>('overwrite');

  // 是否同步更新人员档案中的定位标签绑定关系
  const [syncToPersonnel, setSyncToPersonnel] = useState<boolean>(true);

  // 解析后的行数据
  const [parsedRows, setParsedRows] = useState<ParsedTagRow[]>([]);

  // 筛选预览状态
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'warning' | 'error'>('all');

  // 是否正在导入中
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 导入结果汇总
  const [importSummary, setImportSummary] = useState<{
    success: boolean;
    total: number;
    created: number;
    updated: number;
    boundPersonnel: number;
  } | null>(null);

  // 统计指标 (必须在所有早退前无条件调用 Hook)
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter(r => r.status === 'valid').length;
    const warning = parsedRows.filter(r => r.status === 'warning').length;
    const error = parsedRows.filter(r => r.status === 'error').length;
    const selectedCount = parsedRows.filter(r => r.selected && r.status !== 'error').length;
    return { total, valid, warning, error, selectedCount };
  }, [parsedRows]);

  // 过滤展示 (必须在所有早退前无条件调用 Hook)
  const displayedRows = useMemo(() => {
    if (filterTab === 'all') return parsedRows;
    return parsedRows.filter(r => r.status === filterTab);
  }, [parsedRows, filterTab]);

  // 根据工号或姓名智能检索匹配人员
  const findMatchingPerson = (empCode?: string, name?: string): DhrPersonnelItem | undefined => {
    const cleanCode = empCode?.trim().toLowerCase();
    const cleanName = name?.trim().toLowerCase();

    // 1. 优先按工号精确匹配
    if (cleanCode) {
      const byCode = personnelList.find(p => 
        (p.empcode && p.empcode.toLowerCase() === cleanCode) ||
        (p.empID && p.empID.toLowerCase() === cleanCode)
      );
      if (byCode) return byCode;
    }

    // 2. 其次按姓名匹配
    if (cleanName) {
      const byName = personnelList.find(p => p.name && p.name.toLowerCase() === cleanName);
      if (byName) return byName;
    }

    return undefined;
  };

  // 解析 Excel 格式二维行数据 (三列：标签编码*、绑定人员工号、姓名)
  const parseRowsFromExcel = (rawRows: any[][]) => {
    if (!rawRows || rawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    const validRawRows = rawRows.filter(r => 
      Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')
    );

    if (validRawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    // 判断第一行是否是表头
    const firstRowStr = (validRawRows[0] || []).map(c => String(c ?? '').trim()).join(',');
    const isHeader = firstRowStr.includes('标签') || firstRowStr.includes('tag') || firstRowStr.includes('编码') || 
                     firstRowStr.includes('code') || firstRowStr.includes('工号') || firstRowStr.includes('姓名');
    const dataLines = isHeader ? validRawRows.slice(1) : validRawRows;

    const seenCodesInBatch = new Set<string>();

    const rows: ParsedTagRow[] = dataLines.map((row, idx) => {
      // 字段顺序（严格保留3列）：
      // 列 0: 标签编码 (必填项, 如 TG-9001, UWB-009)
      // 列 1: 绑定人员工号 (选填, 如 DN-1001)
      // 列 2: 姓名 (选填, 如 张伟)
      const tagCode = String(row[0] ?? '').trim();
      const inputEmpCode = String(row[1] ?? '').trim();
      const inputName = String(row[2] ?? '').trim();

      const statusMessages: string[] = [];
      let status: 'valid' | 'warning' | 'error' = 'valid';

      // 1. 标签编码必填校验
      if (!tagCode) {
        status = 'error';
        statusMessages.push('标签编码为必填项，不能为空');
      }

      // 2. 本批次内重复编码校验
      if (tagCode) {
        if (seenCodesInBatch.has(tagCode.toLowerCase())) {
          status = 'error';
          statusMessages.push(`Excel文件中存在重复标签编码【${tagCode}】`);
        } else {
          seenCodesInBatch.add(tagCode.toLowerCase());
        }
      }

      // 3. 系统内已存在标签查重
      const existingTag = existingTags.find(t => t.tagCode.toLowerCase() === tagCode.toLowerCase());
      const isExistingInSystem = Boolean(existingTag);

      if (isExistingInSystem && status !== 'error') {
        status = 'warning';
        statusMessages.push(`系统标签库中已存在【${tagCode}】，将执行${duplicatePolicy === 'overwrite' ? '覆盖更新' : '跳过'}`);
      }

      // 4. 匹配人员及判定标签状态
      let matchedPerson: DhrPersonnelItem | undefined = undefined;
      let finalTagStatus: 'used' | 'unused' = 'unused';

      if (inputEmpCode || inputName) {
        matchedPerson = findMatchingPerson(inputEmpCode, inputName);
        if (matchedPerson) {
          finalTagStatus = 'used';
          // 检查该人员是否已佩戴其他标签
          if (matchedPerson.tagCode && matchedPerson.tagCode.toLowerCase() !== tagCode.toLowerCase()) {
            if (status !== 'error') status = 'warning';
            statusMessages.push(`员工【${matchedPerson.name}】原绑定标签【${matchedPerson.tagCode}】，导入后将被替换`);
          } else {
            statusMessages.push(`合规，已关联员工【${matchedPerson.name} (${matchedPerson.empcode || matchedPerson.empID})】`);
          }
        } else {
          if (status !== 'error') status = 'warning';
          const queryLabel = [inputEmpCode, inputName].filter(Boolean).join(' / ');
          statusMessages.push(`未在人员库中检索到【${queryLabel}】，将作为空闲标签导入`);
          finalTagStatus = 'unused';
        }
      } else {
        finalTagStatus = 'unused';
        statusMessages.push('合规，库存空闲待分配标签');
      }

      // 设备状态与电量（自动根据是否佩戴/使用初始化）
      const deviceStatus: 'online' | 'offline' = finalTagStatus === 'used' ? 'online' : 'offline';
      const batteryLevel: BatteryLevel | null = finalTagStatus === 'used' ? 'normal' : null;

      return {
        id: `excel-tag-row-${idx}-${Date.now()}`,
        tagCode,
        inputEmpCode,
        inputName,
        tagStatus: finalTagStatus,
        matchedPerson,
        deviceStatus,
        batteryLevel,
        status,
        statusMessages,
        isExistingInSystem,
        selected: true
      };
    });

    setParsedRows(rows);
  };

  // 下载标签导入 Excel (.xlsx) 模板（仅保留：标签编码、绑定人员工号、姓名 3列）
  const handleDownloadTemplate = () => {
    const headers = ['标签编码*', '绑定人员工号', '姓名'];
    const sampleData = [
      headers,
      ['TG-9201', '', ''],
      ['TG-9202', 'DN-1001', '张伟'],
      ['TG-9203', 'DN-1002', '陈建国'],
      ['TG-9204', 'DN-1003', '林少伟'],
      ['TG-9205', '', ''],
      ['TG-9206', 'DN-1005', '王建华']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 18 }, // 标签编码 (必填)
      { wch: 20 }, // 绑定人员工号
      { wch: 18 }  // 姓名
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '定位标签导入');
    XLSX.writeFile(wb, `船厂定位标签批量导入模板_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 载入演示批次数据 (Excel 3列结构)
  const handleLoadDemoData = () => {
    setFileName('2026年Q4批次防爆定位工牌采购入库.xlsx');
    const demoData = [
      ['标签编码*', '绑定人员工号', '姓名'],
      ['TG-9301', '', ''],
      ['TG-9302', 'DN-1001', '张伟'],
      ['TG-9303', 'DN-1002', '陈建国'],
      ['TG-9304', 'DN-1003', '林少伟'],
      ['2', '', ''], // 系统已有测试标签(测试覆盖或跳过)
      ['TG-9306', 'DN-1005', '王建华']
    ];
    parseRowsFromExcel(demoData);
  };

  // 文件选择上传 (严格仅支持 .xlsx 与 .xls)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (!isExcel) {
      alert('格式错误：本系统定位标签批量导入已升级为 Excel 专属导入，仅支持 .xlsx 或 .xls 格式文件，不支持 CSV 或 TXT！请上传 Excel 文件或点击右上角下载标准 Excel 模板。');
      e.target.value = '';
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        parseRowsFromExcel(rawRows);
      } catch (err) {
        console.error('Failed to parse Excel workbook', err);
        alert('Excel 文件解析失败，请确保上传的是格式有效、未损坏的 Excel (.xlsx / .xls) 工作簿！');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 移除某一行
  const handleRemoveRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // 切换行选中状态
  const handleToggleSelect = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  // 确认执行导入
  const handleExecuteImport = () => {
    const rowsToImport = parsedRows.filter(r => r.selected && r.status !== 'error');
    if (rowsToImport.length === 0) return;

    setIsSubmitting(true);

    try {
      let currentTags: LocationTagItem[] = getStoredTags();
      const savedPersonnel = localStorage.getItem('shipyard_personnel_list');
      let currentPersonnel: DhrPersonnelItem[] = savedPersonnel ? JSON.parse(savedPersonnel) : [...personnelList];

      let createdCount = 0;
      let updatedCount = 0;
      let boundPersonnelCount = 0;
      const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });

      rowsToImport.forEach(row => {
        const existingIndex = currentTags.findIndex(
          t => t.tagCode.toLowerCase() === row.tagCode.toLowerCase()
        );

        const matchedP = row.matchedPerson;
        const autoRemark = matchedP ? `批量导入配发（${matchedP.name}）` : '批量导入登记入库';

        if (existingIndex >= 0) {
          // 标签已存在
          if (duplicatePolicy === 'overwrite') {
            const oldTag = currentTags[existingIndex];
            currentTags[existingIndex] = {
              ...oldTag,
              tagStatus: row.tagStatus,
              empId: matchedP ? matchedP.empID : (row.tagStatus === 'used' ? oldTag.empId : undefined),
              personName: matchedP ? matchedP.name : (row.tagStatus === 'used' ? oldTag.personName : '-'),
              deptName: matchedP ? matchedP.deptname : (row.tagStatus === 'used' ? oldTag.deptName : undefined),
              deviceStatus: row.deviceStatus,
              batteryLevel: row.batteryLevel,
              lastUpdateTime: nowStr,
              remark: autoRemark
            };
            updatedCount++;
          }
        } else {
          // 新增标签
          const newTag: LocationTagItem = {
            id: `TAG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            tagCode: row.tagCode,
            tagStatus: row.tagStatus,
            empId: matchedP?.empID,
            personName: matchedP ? matchedP.name : '-',
            deptName: matchedP?.deptname,
            deviceStatus: row.deviceStatus,
            batteryLevel: row.batteryLevel,
            lastUpdateTime: nowStr,
            remark: autoRemark
          };
          currentTags.unshift(newTag);
          createdCount++;
        }

        // 同步更新人员主数据
        if (syncToPersonnel && matchedP) {
          boundPersonnelCount++;
          currentPersonnel = currentPersonnel.map(p => {
            // 如果此人就是被绑者
            if (p.empID === matchedP.empID) {
              return {
                ...p,
                tagStatus: 'bound',
                tagCode: row.tagCode,
                tagBattery: row.batteryLevel === 'low' ? 18 : 88,
                tagBindTime: nowStr
              };
            }
            // 如果其他人之前拿着这个新卡，则解绑其他人
            if (p.tagCode && p.tagCode.toLowerCase() === row.tagCode.toLowerCase() && p.empID !== matchedP.empID) {
              return {
                ...p,
                tagStatus: 'unbound',
                tagCode: undefined,
                tagBattery: undefined,
                tagBindTime: undefined
              };
            }
            return p;
          });
        }
      });

      // 保存标签
      saveStoredTags(currentTags);
      window.dispatchEvent(new CustomEvent('tags_updated', { detail: currentTags }));

      // 保存人员
      if (syncToPersonnel && boundPersonnelCount > 0) {
        localStorage.setItem('shipyard_personnel_list', JSON.stringify(currentPersonnel));
        window.dispatchEvent(new CustomEvent('personnel_updated', { detail: currentPersonnel }));
      }

      setImportSummary({
        success: true,
        total: rowsToImport.length,
        created: createdCount,
        updated: updatedCount,
        boundPersonnel: boundPersonnelCount
      });

      onImportSuccess(createdCount, updatedCount);
    } catch (err) {
      console.error('Batch import tags failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-blue-50/50 via-white to-sky-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">定位标签资产批量导入</h3>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  Excel 专属格式 (.xlsx / .xls)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支持通过标准 Excel 工作簿批量录入定位标签资产台账，支持按工号或姓名自动建立人员绑定映射
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="下载标准 Excel 导入模板 (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>下载导入模板</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 导入完成反馈 */}
        {importSummary ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">定位标签批量导入成功！</h4>
            <p className="text-xs text-slate-500 max-w-md">
              标签资产数据已成功写入系统台账，对应人员佩戴状态已同步建立双向联动。
            </p>

            <div className="grid grid-cols-4 gap-3 w-full max-w-lg mt-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">处理总数</div>
                <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{importSummary.total}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-700 font-medium">新增标签</div>
                <div className="text-lg font-bold text-emerald-600 font-mono mt-0.5">+{importSummary.created}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div className="text-[11px] text-amber-700 font-medium">覆盖更新</div>
                <div className="text-lg font-bold text-amber-600 font-mono mt-0.5">{importSummary.updated}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <div className="text-[11px] text-blue-700 font-medium">配发绑定员工</div>
                <div className="text-lg font-bold text-blue-600 font-mono mt-0.5">{importSummary.boundPersonnel}</div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  setImportSummary(null);
                  setParsedRows([]);
                  setFileName('');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                继续导入下一批
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                完成并返回标签列表
              </button>
            </div>
          </div>
        ) : (
          /* 主体内容 */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* 上传操作栏 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>选择或拖拽 Excel 文件（仅支持 .xlsx、.xls 格式）</span>
              </div>

              {/* 演示数据快速填充 */}
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>一键填入演示批次数据</span>
              </button>
            </div>

            {/* 文件选择区 */}
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20 rounded-xl p-6 text-center transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    点击选择或拖拽定位标签 Excel 数据文件至此处
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    支持标准 Excel 工作簿（.xlsx/.xls）文件格式
                  </p>
                </div>
                {fileName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-mono font-medium">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 导入策略 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              {/* 重复编码处理 */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>标签编码重复冲突策略</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">当标签编码已在资产库中存在时</div>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDuplicatePolicy('overwrite')}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                      duplicatePolicy === 'overwrite'
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    覆盖更新
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicatePolicy('skip')}
                    className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                      duplicatePolicy === 'skip'
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    跳过忽略
                  </button>
                </div>
              </div>

              {/* 人员档案联动 */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>人员管理档案双向联动</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">同步更新对应员工档案中的定位标签绑定状态</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToPersonnel}
                    onChange={(e) => setSyncToPersonnel(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* 数据校验预览 */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">导入校验数据清单</span>
                    <span className="text-[11px] text-slate-500">
                      共解析到 <strong className="text-slate-900">{stats.total}</strong> 个标签
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        filterTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      全部 ({stats.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('valid')}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        filterTab === 'valid' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-emerald-700'
                      }`}
                    >
                      合规 ({stats.valid})
                    </button>
                    {stats.warning > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterTab('warning')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                          filterTab === 'warning' ? 'bg-amber-500 text-white font-bold shadow-2xs' : 'text-amber-700'
                        }`}
                      >
                        提示/需覆盖 ({stats.warning})
                      </button>
                    )}
                    {stats.error > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterTab('error')}
                        className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                          filterTab === 'error' ? 'bg-rose-600 text-white font-bold shadow-2xs' : 'text-rose-700'
                        }`}
                      >
                        格式错误 ({stats.error})
                      </button>
                    )}
                  </div>
                </div>

                {/* 预览表格 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 z-10 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8">
                            <span className="sr-only">选择</span>
                          </th>
                          <th className="py-2.5 px-3 font-semibold">校验结论</th>
                          <th className="py-2.5 px-3 font-semibold">标签编码*</th>
                          <th className="py-2.5 px-3 font-semibold">绑定人员工号</th>
                          <th className="py-2.5 px-3 font-semibold">姓名</th>
                          <th className="py-2.5 px-3 font-semibold">系统匹配员工与班组</th>
                          <th className="py-2.5 px-3 font-semibold">配发状态</th>
                          <th className="py-2.5 px-3 font-semibold text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {displayedRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              当前筛选条件下无匹配记录
                            </td>
                          </tr>
                        ) : (
                          displayedRows.map((row) => (
                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="checkbox"
                                  disabled={row.status === 'error'}
                                  checked={row.selected}
                                  onChange={() => handleToggleSelect(row.id)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-30"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                  row.status === 'valid'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : row.status === 'warning'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {row.status === 'valid' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                  {row.status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                                  {row.status === 'error' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                                  <span>{row.statusMessages[0]}</span>
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {row.tagCode ? (
                                  <span>{row.tagCode}</span>
                                ) : (
                                  <span className="text-rose-500 italic">缺失（必填项）</span>
                                )}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap font-mono text-slate-700">
                                {row.inputEmpCode || <span className="text-slate-300">-</span>}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap font-medium text-slate-800">
                                {row.inputName || <span className="text-slate-300">-</span>}
                              </td>
                              <td className="py-2 px-3">
                                {row.matchedPerson ? (
                                  <div className="leading-tight">
                                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                                      <span>{row.matchedPerson.name}</span>
                                      <span className="text-slate-400 font-mono text-[11px]">
                                        ({row.matchedPerson.empcode || row.matchedPerson.empID})
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate max-w-[220px] mt-0.5">
                                      {row.matchedPerson.deptname.split('//').slice(-2).join(' / ')}
                                    </div>
                                  </div>
                                ) : (row.inputEmpCode || row.inputName ? (
                                  <span className="text-amber-600 text-[11px] font-medium">未匹配到系统人员档案</span>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">未关联 (作为空闲库存入库)</span>
                                ))}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                  row.tagStatus === 'used' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                  {row.tagStatus === 'used' ? '已配发使用' : '未配发/库存'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="移除此行"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部操作区 */}
        {!importSummary && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70">
            <div className="text-xs text-slate-500">
              {parsedRows.length > 0 ? (
                <span>
                  就绪 <strong className="text-blue-600 font-bold">{stats.selectedCount}</strong> 个有效标签待导入
                  {stats.error > 0 && <span className="text-rose-600 ml-2">({stats.error}个编码错误已排除)</span>}
                </span>
              ) : (
                <span>请先选择或拖拽 Excel 文件（.xlsx / .xls）</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={stats.selectedCount === 0 || isSubmitting}
                onClick={handleExecuteImport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>正在导入中...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>确认批量导入 ({stats.selectedCount} 个标签)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
