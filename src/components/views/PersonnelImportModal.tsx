/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 船厂人员档案批量导入模态框 (PersonnelImportModal)
 * 支持 CSV / Excel 复制粘贴 / 文件拖拽上传、智能格式校验、查重与冲突策略处理、
 * 部门班组自动映射、工种与用工类型解析，并联动定位标签登记与绑定。
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
  Users, 
  Radio, 
  Building2, 
  Sparkles, 
  ChevronRight, 
  Layers,
  ArrowRight,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { 
  DhrPersonnelItem, 
  DHR_EMPLOYMENT_TYPES, 
  DHR_POST_JOBS 
} from '@/src/data/dhrPersonnelData';
import { 
  getStoredDepartments, 
  flattenDepartments 
} from '@/src/data/departmentData';
import { 
  getStoredTags, 
  saveStoredTags, 
  LocationTagItem 
} from '@/src/data/tagData';
import * as XLSX from 'xlsx';

interface ParsedPersonnelRow {
  id: string; // 临时唯一ID
  name: string;
  empcode: string;
  deptname: string;
  deptCode: string;
  gwName: string;
  gwCode: string;
  ygtypeName: string;
  ygtypeCode: string;
  cellphone: string;
  idCard: string;
  sex: '1' | '2';
  projectName: string;
  tagCode?: string;
  status: 'valid' | 'warning' | 'error';
  statusMessages: string[];
  isExisting: boolean;
  selected: boolean;
}

interface PersonnelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPersonnel: DhrPersonnelItem[];
  onImportSuccess: (importedCount: number, overwrittenCount: number) => void;
}

export function PersonnelImportModal({
  isOpen,
  onClose,
  existingPersonnel,
  onImportSuccess
}: PersonnelImportModalProps) {
  // 部门树与扁平化列表
  const deptTree = useMemo(() => getStoredDepartments(), []);
  const flatDepts = useMemo(() => flattenDepartments(deptTree), [deptTree]);

  // 现有标签池
  const existingTags = useMemo(() => getStoredTags(), []);

  // 文件名称
  const [fileName, setFileName] = useState<string>('');

  // 冲突策略：'skip' 跳过已存在 | 'overwrite' 覆盖更新
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'overwrite'>('overwrite');

  // 是否同步在标签库中创建/绑定标签
  const [syncTags, setSyncTags] = useState<boolean>(true);

  // 解析后的行数据
  const [parsedRows, setParsedRows] = useState<ParsedPersonnelRow[]>([]);

  // 筛选预览状态：'all' | 'valid' | 'warning' | 'error'
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'warning' | 'error'>('all');

  // 是否正在导入执行
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 导入完成统计
  const [importSummary, setImportSummary] = useState<{
    success: boolean;
    total: number;
    created: number;
    updated: number;
    tagBound: number;
  } | null>(null);

  // 统计数据 (必须在所有早退前无条件调用 Hook)
  const stats = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter(r => r.status === 'valid').length;
    const warning = parsedRows.filter(r => r.status === 'warning').length;
    const error = parsedRows.filter(r => r.status === 'error').length;
    const selectedCount = parsedRows.filter(r => r.selected && r.status !== 'error').length;
    return { total, valid, warning, error, selectedCount };
  }, [parsedRows]);

  // 过滤展示行 (必须在所有早退前无条件调用 Hook)
  const displayedRows = useMemo(() => {
    if (filterTab === 'all') return parsedRows;
    return parsedRows.filter(r => r.status === filterTab);
  }, [parsedRows, filterTab]);

  // 辅助反查工种代码
  const findPostJobCode = (name: string): { code: string; name: string } => {
    if (!name) return { code: '35', name: '船舶电焊工' };
    const trimmed = name.trim();
    for (const [code, val] of Object.entries(DHR_POST_JOBS)) {
      if (val === trimmed || trimmed.includes(val) || val.includes(trimmed)) {
        return { code, name: val };
      }
    }
    return { code: '35', name: trimmed };
  };

  // 辅助反查用工类型代码
  const findEmploymentTypeCode = (name: string): { code: string; name: string } => {
    if (!name) return { code: '17', name: '东南员工' };
    const trimmed = name.trim();
    for (const [code, val] of Object.entries(DHR_EMPLOYMENT_TYPES)) {
      if (val === trimmed || trimmed.includes(val) || val.includes(trimmed)) {
        return { code, name: val };
      }
    }
    return { code: '17', name: trimmed };
  };

  // 辅助部门反查与模糊匹配
  const findDepartment = (deptInput: string): { deptname: string; deptCode: string } => {
    if (!deptInput || deptInput.trim() === '') {
      return {
        deptname: '东南船厂//制造部//船体电焊一组',
        deptCode: 'DEPT-0101'
      };
    }
    const clean = deptInput.trim();
    // 1. 完全匹配
    const exact = flatDepts.find(d => d.deptname === clean || d.deptcode === clean);
    if (exact) {
      return { deptname: exact.deptname, deptCode: exact.deptid || exact.deptcode };
    }
    // 2. 包含匹配
    const partial = flatDepts.find(d => clean.includes(d.deptname) || d.deptname.includes(clean));
    if (partial) {
      return { deptname: partial.deptname, deptCode: partial.deptid || partial.deptcode };
    }
    // 3. 默认格式化为标准层级
    return {
      deptname: clean.includes('//') ? clean : `东南船厂//制造部//${clean}`,
      deptCode: 'DEPT-0101'
    };
  };

  // 解析 Excel 格式二维行数据
  const parseRowsFromExcel = (rawRows: any[][]) => {
    if (!rawRows || rawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    // 过滤掉所有单元格均为空的空白行
    const validRawRows = rawRows.filter(r => 
      Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')
    );

    if (validRawRows.length === 0) {
      setParsedRows([]);
      return;
    }

    // 检查首行是否为表头
    const firstRowStr = (validRawRows[0] || []).map(c => String(c ?? '').trim()).join(',');
    const isHeader = firstRowStr.includes('姓名') || firstRowStr.includes('name') || firstRowStr.includes('工号') || firstRowStr.includes('code');
    const dataLines = isHeader ? validRawRows.slice(1) : validRawRows;

    const seenCodesInBatch = new Set<string>();

    const rows: ParsedPersonnelRow[] = dataLines.map((row, idx) => {
      // 字段对应顺序：
      // 0: 姓名 (必填)
      // 1: 工号 (必填)
      // 2: 所属部门班组
      // 3: 岗位工种
      // 4: 用工类型
      // 5: 身份证号
      // 6: 手机号码
      // 7: 性别 (男/女/1/2)
      // 8: 船舶项目
      // 9: 定位标签编号
      const name = String(row[0] ?? '').trim();
      const empcode = String(row[1] ?? '').trim();
      const deptRaw = String(row[2] ?? '').trim();
      const gwRaw = String(row[3] ?? '').trim() || '船舶电焊工';
      const ygRaw = String(row[4] ?? '').trim() || '东南员工';
      const idCard = String(row[5] ?? '').trim();
      const cellphone = String(row[6] ?? '').trim();
      const sexRaw = String(row[7] ?? '').trim() || '男';
      const projectName = String(row[8] ?? '').trim() || '25000 DWT 多用途重吊船';
      const tagCode = String(row[9] ?? '').trim();

      const statusMessages: string[] = [];
      let status: 'valid' | 'warning' | 'error' = 'valid';

      // 必填项校验
      if (!name) {
        status = 'error';
        statusMessages.push('人员姓名不能为空');
      }
      if (!empcode) {
        status = 'error';
        statusMessages.push('员工工号不能为空');
      }

      // 批次内工号查重
      if (empcode) {
        if (seenCodesInBatch.has(empcode.toLowerCase())) {
          status = 'error';
          statusMessages.push(`Excel文件中工号【${empcode}】存在重复`);
        } else {
          seenCodesInBatch.add(empcode.toLowerCase());
        }
      }

      // 系统现有人员工号查重
      const existingPerson = existingPersonnel.find(
        p => (p.empcode && p.empcode.toLowerCase() === empcode.toLowerCase()) || 
             (p.empID && p.empID.toLowerCase() === empcode.toLowerCase())
      );
      const isExisting = Boolean(existingPerson);

      if (isExisting && status !== 'error') {
        status = 'warning';
        statusMessages.push(`系统已存在工号【${empcode}】(${existingPerson?.name})，将按策略处理`);
      }

      // 手机号格式提示
      if (cellphone && !/^1[3-9]\d{9}$/.test(cellphone)) {
        if (status !== 'error') status = 'warning';
        statusMessages.push('手机号非标准11位大陆号码');
      }

      // 身份证格式提示
      if (idCard && !/^\d{17}[\dXx]$/.test(idCard)) {
        if (status !== 'error') status = 'warning';
        statusMessages.push('身份证号非标准18位格式');
      }

      // 标签校验
      if (tagCode) {
        const tagInSystem = existingTags.find(t => t.tagCode.toLowerCase() === tagCode.toLowerCase());
        if (tagInSystem && tagInSystem.tagStatus === 'used' && tagInSystem.personName !== name) {
          if (status !== 'error') status = 'warning';
          statusMessages.push(`标签【${tagCode}】当前已被【${tagInSystem.personName}】佩戴，导入后将转移绑定`);
        }
      }

      if (status === 'valid') {
        statusMessages.push('校验通过，格式合规');
      }

      const postJob = findPostJobCode(gwRaw);
      const empType = findEmploymentTypeCode(ygRaw);
      const dept = findDepartment(deptRaw);

      return {
        id: `excel-row-${idx}-${Date.now()}`,
        name,
        empcode,
        deptname: dept.deptname,
        deptCode: dept.deptCode,
        gwName: postJob.name,
        gwCode: postJob.code,
        ygtypeName: empType.name,
        ygtypeCode: empType.code,
        cellphone: cellphone || `138${Math.floor(10000000 + Math.random() * 90000000)}`,
        idCard: idCard || `350123199${Math.floor(100000000 + Math.random() * 900000000)}`,
        sex: (sexRaw === '女' || sexRaw === '2') ? '2' : '1',
        projectName: projectName || '25000 DWT 多用途重吊船',
        tagCode: tagCode || undefined,
        status,
        statusMessages,
        isExisting,
        selected: true
      };
    });

    setParsedRows(rows);
  };

  // 1. 下载标准导入模板 Excel (.xlsx 格式)
  const handleDownloadTemplate = () => {
    const headers = ['姓名*', '工号*', '所属部门班组*', '工种*', '用工类型*', '身份证号*', '手机号码', '性别', '关联船舶项目', '定位标签编号'];
    const sampleData = [
      headers,
      ['王海峰', 'DN-8101', '东南船厂//制造部//船体电焊一组', '船舶电焊工', '东南员工', '350123199205102319', '13859012341', '男', '25000 DWT 多用途重吊船', 'TG-9011'],
      ['林晨阳', 'DN-8102', '东南船厂//制造部//船体装配二班', '船舶装配工', '劳务员工', '350123199508154412', '13859012342', '男', '25000 DWT 多用途重吊船', 'TG-9012'],
      ['张强华', 'DN-8103', '东南船厂//制造部//起重运输班', '汽车吊司机', '马船员工', '350123198811201213', '13859012343', '男', '25000 DWT 多用途重吊船', ''],
      ['陈立新', 'DN-8104', '东南船厂//品质部//船体探伤班', '无损检测员', '东南员工', '350123199003053321', '13859012344', '男', '25000 DWT 多用途重吊船', 'TG-9014'],
      ['刘雅芳', 'DN-8105', '东南船厂//安监环保部//现场安全监护组', '安全员', '东南员工', '350123199312015528', '13859012345', '女', '25000 DWT 多用途重吊船', 'TG-9015']
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    // 配置列宽自适应
    ws['!cols'] = [
      { wch: 12 }, // 姓名
      { wch: 14 }, // 工号
      { wch: 34 }, // 部门班组
      { wch: 16 }, // 工种
      { wch: 14 }, // 用工类型
      { wch: 22 }, // 身份证号
      { wch: 16 }, // 手机号
      { wch: 8 },  // 性别
      { wch: 26 }, // 船舶项目
      { wch: 16 }  // 标签编号
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '人员档案批量导入');
    XLSX.writeFile(wb, `船厂人员批量导入标准模板_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 2. 载入预置演示批次数据 (直接按 Excel 2D 数组结构加载)
  const handleLoadDemoData = () => {
    setFileName('2026年船体外包与新增焊装人员导入批次.xlsx');
    const demoData = [
      ['姓名', '工号', '所属部门班组', '工种', '用工类型', '身份证号', '手机号码', '性别', '关联船舶项目', '定位标签编号'],
      ['陆家明', 'DN-8201', '东南船厂//制造部//船体电焊一组', '船舶电焊工', '东南员工', '350123199104081234', '13959110001', '男', '25000 DWT 多用途重吊船', 'TG-8201'],
      ['赵天宇', 'DN-8202', '东南船厂//制造部//船体电焊一组', '碳弧气刨', '劳务员工', '350123199307192345', '13959110002', '男', '25000 DWT 多用途重吊船', 'TG-8202'],
      ['周立群', 'DN-8203', '东南船厂//制造部//船体装配二班', '船舶装配工', '东南员工', '350123198902143456', '13959110003', '男', '25000 DWT 多用途重吊船', ''],
      ['黄伟豪', 'DN-1001', '东南船厂//制造部//船体电焊一组', '船舶电焊工', '东南员工', '350123199001011234', '13800000001', '男', '25000 DWT 多用途重吊船', 'UWB-1001'],
      ['吴敏敏', 'DN-8205', '东南船厂//安监环保部//现场安全监护组', '安全员', '东南员工', '350123199611255678', '13959110005', '女', '25000 DWT 多用途重吊船', 'TG-8205']
    ];
    parseRowsFromExcel(demoData);
  };

  // 3. 文件上传选择 (严格仅支持 .xlsx 与 .xls)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    if (!isExcel) {
      alert('格式错误：本系统人员档案导入已全面升级为 Excel 专属导入，仅支持 .xlsx 或 .xls 格式文件，不支持 CSV 或 TXT！请上传 Excel 文件或点击右上角下载标准 Excel 模板。');
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

  // 5. 移除某一行
  const handleRemoveRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  // 6. 切换行选中状态
  const handleToggleSelect = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  // 7. 提交批量导入
  const handleExecuteImport = () => {
    const rowsToImport = parsedRows.filter(r => r.selected && r.status !== 'error');
    if (rowsToImport.length === 0) return;

    setIsSubmitting(true);

    try {
      // 1. 读取人员主表
      const savedPersonnel = localStorage.getItem('shipyard_personnel_list');
      let currentPersonnel: DhrPersonnelItem[] = savedPersonnel ? JSON.parse(savedPersonnel) : [...existingPersonnel];

      // 2. 读取标签表
      let currentTags: LocationTagItem[] = getStoredTags();

      let createdCount = 0;
      let updatedCount = 0;
      let tagBoundCount = 0;
      const nowStr = new Date().toLocaleString('zh-CN', { hour12: false });

      rowsToImport.forEach(row => {
        const existingIndex = currentPersonnel.findIndex(
          p => (p.empcode && p.empcode.toLowerCase() === row.empcode.toLowerCase()) || 
               (p.empID && p.empID.toLowerCase() === row.empcode.toLowerCase())
        );

        if (existingIndex >= 0) {
          // 已存在
          if (duplicatePolicy === 'overwrite') {
            const oldPerson = currentPersonnel[existingIndex];
            const updatedPerson: DhrPersonnelItem = {
              ...oldPerson,
              name: row.name,
              deptname: row.deptname,
              DEPT_CODE: row.deptCode,
              gw: row.gwCode,
              gwName: row.gwName,
              ygtype: row.ygtypeCode,
              ygtypeName: row.ygtypeName,
              cellphone: row.cellphone,
              IDCard: row.idCard,
              sex: row.sex,
              projectName: row.projectName,
              tagCode: row.tagCode || oldPerson.tagCode,
              tagStatus: (row.tagCode || oldPerson.tagCode) ? 'bound' : 'unbound'
            };
            currentPersonnel[existingIndex] = updatedPerson;
            updatedCount++;

            // 标签处理
            if (syncTags && row.tagCode) {
              tagBoundCount++;
              linkTagToPerson(currentTags, row.tagCode, updatedPerson.empID, updatedPerson.name, updatedPerson.deptname, nowStr);
            }
          }
          // 若为 skip 则略过
        } else {
          // 新增人员
          const newEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
          const newPerson: DhrPersonnelItem = {
            empID: newEmpId,
            name: row.name,
            empcode: row.empcode,
            deptname: row.deptname,
            DEPT_CODE: row.deptCode,
            ygtype: row.ygtypeCode,
            ygtypeName: row.ygtypeName,
            IDCard: row.idCard,
            gw: row.gwCode,
            gwName: row.gwName,
            entryDate: new Date().toISOString().slice(0, 10),
            cellphone: row.cellphone,
            sex: row.sex,
            potype: '1',
            deleted: 0,
            presenceStatus: 1,
            tagStatus: row.tagCode ? 'bound' : 'unbound',
            tagCode: row.tagCode || undefined,
            tagBattery: row.tagCode ? Math.floor(88 + Math.random() * 10) : undefined,
            tagBindTime: row.tagCode ? nowStr : undefined,
            projectName: row.projectName,
            hasUserAccount: false
          };

          currentPersonnel.unshift(newPerson);
          createdCount++;

          // 标签处理
          if (syncTags && row.tagCode) {
            tagBoundCount++;
            linkTagToPerson(currentTags, row.tagCode, newPerson.empID, newPerson.name, newPerson.deptname, nowStr);
          }
        }
      });

      // 保存人员数据
      localStorage.setItem('shipyard_personnel_list', JSON.stringify(currentPersonnel));
      window.dispatchEvent(new CustomEvent('personnel_updated', { detail: currentPersonnel }));

      // 保存标签数据
      if (syncTags && tagBoundCount > 0) {
        saveStoredTags(currentTags);
        window.dispatchEvent(new CustomEvent('tags_updated', { detail: currentTags }));
      }

      setImportSummary({
        success: true,
        total: rowsToImport.length,
        created: createdCount,
        updated: updatedCount,
        tagBound: tagBoundCount
      });

      onImportSuccess(createdCount, updatedCount);
    } catch (err) {
      console.error('Batch import failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 内部辅助：自动登记或关联标签
  const linkTagToPerson = (
    tags: LocationTagItem[], 
    tagCode: string, 
    empId: string, 
    personName: string, 
    deptName: string, 
    timeStr: string
  ) => {
    const existingTag = tags.find(t => t.tagCode.toLowerCase() === tagCode.toLowerCase());
    if (existingTag) {
      existingTag.tagStatus = 'used';
      existingTag.empId = empId;
      existingTag.personName = personName;
      existingTag.deptName = deptName;
      existingTag.deviceStatus = 'online';
      existingTag.lastUpdateTime = timeStr;
    } else {
      tags.unshift({
        id: `TAG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tagCode,
        tagStatus: 'used',
        empId,
        personName,
        deptName,
        batteryLevel: 'normal',
        deviceStatus: 'online',
        lastUpdateTime: timeStr,
        remark: '人员批量导入自动登记绑定'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-blue-50/50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">人员档案批量导入</h3>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  Excel 专属格式 (.xlsx / .xls)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支持标准 Excel 工作簿批量导入船厂员工档案、班组归属、工种分配，并可选择同步关联物理定位工牌
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
              <span>下载 Excel 标准模板</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 导入完成成功反馈卡片 */}
        {importSummary ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">批量导入操作已成功完成！</h4>
            <p className="text-xs text-slate-500 max-w-md">
              人员数据已安全写入系统人员库与本地持久化存储，并已实时广播通知关联模块。
            </p>

            <div className="grid grid-cols-4 gap-3 w-full max-w-lg mt-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">处理总数</div>
                <div className="text-lg font-bold text-slate-800 font-mono mt-0.5">{importSummary.total}</div>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <div className="text-[11px] text-emerald-700 font-medium">新录入员工</div>
                <div className="text-lg font-bold text-emerald-600 font-mono mt-0.5">+{importSummary.created}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div className="text-[11px] text-amber-700 font-medium">覆盖更新档案</div>
                <div className="text-lg font-bold text-amber-600 font-mono mt-0.5">{importSummary.updated}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <div className="text-[11px] text-blue-700 font-medium">自动绑定标签</div>
                <div className="text-lg font-bold text-blue-600 font-mono mt-0.5">{importSummary.tagBound}</div>
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
                继续导入其他批次
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                完成并返回人员列表
              </button>
            </div>
          </div>
        ) : (
          /* 主体内容：上方控制/上传区 + 下方数据校验预览表格 */
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
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>一键填入演示批次数据</span>
              </button>
            </div>

            {/* 文件上传拖拽组件 */}
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
                    点击选择或拖拽人员 Excel 数据文件至此处
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    仅支持标准 Excel 工作簿（.xlsx / .xls），不支持 CSV / TXT 格式
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

            {/* 导入策略与参数配置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              {/* 重复工号处理策略 */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>工号查重与冲突策略</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">当工号与现有员工档案重复时</div>
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

              {/* 定位标签自动登记绑定 */}
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-indigo-600" />
                    <span>定位标签资产联动</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">若填写了定位标签，自动在标签库登记并绑定</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncTags}
                    onChange={(e) => setSyncTags(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* 校验与解析统计条 */}
            {parsedRows.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">解析数据校验预览</span>
                    <span className="text-[11px] text-slate-500">
                      共解析到 <strong className="text-slate-900">{stats.total}</strong> 条记录
                    </span>
                  </div>

                  {/* 状态过滤选项卡 */}
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
                        提示/重复 ({stats.warning})
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
                          <th className="py-2.5 px-3 font-semibold">状态校验</th>
                          <th className="py-2.5 px-3 font-semibold">姓名</th>
                          <th className="py-2.5 px-3 font-semibold">工号</th>
                          <th className="py-2.5 px-3 font-semibold">部门和班组</th>
                          <th className="py-2.5 px-3 font-semibold">工种</th>
                          <th className="py-2.5 px-3 font-semibold">用工类型</th>
                          <th className="py-2.5 px-3 font-semibold">手机号码</th>
                          <th className="py-2.5 px-3 font-semibold">定位标签</th>
                          <th className="py-2.5 px-3 font-semibold text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {displayedRows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-8 text-center text-slate-400">
                              当前筛选下无匹配记录
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
                              <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                                {row.name || <span className="text-rose-500 italic">缺失</span>}
                              </td>
                              <td className="py-2 px-3 font-mono font-medium whitespace-nowrap">
                                {row.empcode || <span className="text-rose-500 italic">缺失</span>}
                              </td>
                              <td className="py-2 px-3 max-w-[180px] truncate" title={row.deptname}>
                                {row.deptname.split('//').slice(-2).join(' / ')}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">{row.gwName}</td>
                              <td className="py-2 px-3 whitespace-nowrap">{row.ygtypeName}</td>
                              <td className="py-2 px-3 font-mono whitespace-nowrap">{row.cellphone}</td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                {row.tagCode ? (
                                  <span className="inline-flex items-center gap-1 font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] border border-blue-200">
                                    <Radio className="w-2.5 h-2.5" />
                                    {row.tagCode}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
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

        {/* 底部按钮栏 */}
        {!importSummary && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70">
            <div className="text-xs text-slate-500">
              {parsedRows.length > 0 ? (
                <span>
                  已就绪 <strong className="text-blue-600 font-bold">{stats.selectedCount}</strong> 条有效数据待导入
                  {stats.error > 0 && <span className="text-rose-600 ml-2">({stats.error}条错误已自动排除)</span>}
                </span>
              ) : (
                <span>请先选择文件或粘贴人员表格数据</span>
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
                    <span>确认批量导入 ({stats.selectedCount} 条)</span>
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
