/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 加班月报与定位统计数据定义与存储服务
 */

export interface OvertimeMonthlyRecord {
  id: string; // 记录ID, 如 'MR-202609-01'
  reportMonth: string; // 统计月份, 如 '2026-09'
  workerName: string; // 姓名, 如 '苏舶宁'
  phone: string; // 联系方式, 如 '130****3632'
  company: string; // 所属公司 / 施工单位, 如 '明烨二队'
  deptName: string; // 所属部门, 如 '船装部'
  teamName: string; // 所属班组, 如 '船装一组'
  workType: string; // 所属工种, 如 '装配工'
  
  // 用户强强调保留的核心字段：
  cumulativeStayHours: number; // 定位累计停留时长 (小时), 如 480.3, 437.44
  positionedOvertimeHours: number; // 定位加班时长 (小时), 如 141.74, 125.07
  
  // 结合加班管理与安全告警联动的调整字段：
  overtimeDaysCount: number; // 月度加班总天数, 如 18 天
  safetyViolationCount: number; // 月度安全员缺岗告警次数, 如 0 次
  safetyComplianceRate: string; // 安全岗位在岗率, 如 '100%'
  primaryShipNo: string; // 主工作船号, 如 '185-4 / 517-2'
  primaryWorkArea: string; // 主工作区域, 如 '内场/10T前/5#轨'
  createdAt: string; // 统计生成时间, 如 '2026-09-21 00:20:02'
}

export const INITIAL_MONTHLY_REPORT_RECORDS: OvertimeMonthlyRecord[] = [
  {
    id: 'MR-01',
    reportMonth: '2026-09',
    workerName: '苏舶宁',
    phone: '130****3632',
    company: '明烨二队',
    deptName: '船装部',
    teamName: '船装一组',
    workType: '装配工',
    cumulativeStayHours: 480.3,
    positionedOvertimeHours: 141.74,
    overtimeDaysCount: 18,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '185-4 / 517-2',
    primaryWorkArea: '内场/10T前/5#轨',
    createdAt: '2026-09-21 00:20:02'
  },
  {
    id: 'MR-02',
    reportMonth: '2026-09',
    workerName: '刘绍宏',
    phone: '133****8062',
    company: '大连施工队',
    deptName: '安全环保部',
    teamName: '巡查一组',
    workType: '安全员',
    cumulativeStayHours: 437.44,
    positionedOvertimeHours: 125.07,
    overtimeDaysCount: 16,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '18500-4 / 517-2',
    primaryWorkArea: '堆场, 5号轨',
    createdAt: '2026-09-21 00:20:01'
  },
  {
    id: 'MR-03',
    reportMonth: '2026-09',
    workerName: '缪华彬',
    phone: '186****2656',
    company: '鹏杨安装',
    deptName: '搭载部',
    teamName: '搭载二组',
    workType: '调度',
    cumulativeStayHours: 362.1,
    positionedOvertimeHours: 107.48,
    overtimeDaysCount: 15,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '18500/3号',
    primaryWorkArea: '1.2号轨, 内场第三跨',
    createdAt: '2026-09-21 00:20:01'
  },
  {
    id: 'MR-04',
    reportMonth: '2026-09',
    workerName: '陈鑫',
    phone: '156****0205',
    company: '安海工程',
    deptName: '机电部',
    teamName: '机电一班',
    workType: '安全员',
    cumulativeStayHours: 214.66,
    positionedOvertimeHours: 65.85,
    overtimeDaysCount: 12,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '185-4 / 517-2',
    primaryWorkArea: '16T前',
    createdAt: '2026-09-21 00:20:00'
  },
  {
    id: 'MR-05',
    reportMonth: '2026-09',
    workerName: '商伟',
    phone: '153****2740',
    company: '大连施工队',
    deptName: '安全环保部',
    teamName: '巡查二组',
    workType: '安全监护',
    cumulativeStayHours: 155.86,
    positionedOvertimeHours: 64.7,
    overtimeDaysCount: 11,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '18500-4',
    primaryWorkArea: '堆场, 5号轨',
    createdAt: '2026-09-21 00:20:02'
  },
  {
    id: 'MR-06',
    reportMonth: '2026-09',
    workerName: '赵浩研',
    phone: '132****0990',
    company: '厂直属',
    deptName: '船体电焊班组',
    teamName: '电焊一组',
    workType: '焊工',
    cumulativeStayHours: 131.57,
    positionedOvertimeHours: 41.92,
    overtimeDaysCount: 8,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '185-4',
    primaryWorkArea: '内场第二跨',
    createdAt: '2026-09-21 00:20:01'
  },
  {
    id: 'MR-07',
    reportMonth: '2026-09',
    workerName: '林琳',
    phone: '138****4748',
    company: '安全部',
    deptName: '安全环保部',
    teamName: '巡查一组',
    workType: '质检员',
    cumulativeStayHours: 130.41,
    positionedOvertimeHours: 42.0,
    overtimeDaysCount: 8,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '18500-4',
    primaryWorkArea: '堆场区域',
    createdAt: '2026-09-21 00:20:01'
  },
  {
    id: 'MR-08',
    reportMonth: '2026-09',
    workerName: '明辉',
    phone: '135****9854',
    company: '安全部',
    deptName: '机电部',
    teamName: '机电二班',
    workType: '质检员',
    cumulativeStayHours: 124.8,
    positionedOvertimeHours: 41.76,
    overtimeDaysCount: 7,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '185-4',
    primaryWorkArea: '16T前',
    createdAt: '2026-09-21 00:20:03'
  },
  {
    id: 'MR-09',
    reportMonth: '2026-09',
    workerName: '罗志刚',
    phone: '150****6464',
    company: '安海工程',
    deptName: '机电部',
    teamName: '机电一班',
    workType: '电工',
    cumulativeStayHours: 119.9,
    positionedOvertimeHours: 35.0,
    overtimeDaysCount: 6,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '185-4 / 517-2',
    primaryWorkArea: '16T前',
    createdAt: '2026-09-21 00:20:01'
  },
  {
    id: 'MR-10',
    reportMonth: '2026-09',
    workerName: '李旻',
    phone: '136****0253',
    company: '明烨二队',
    deptName: '机电部',
    teamName: '机电二班',
    workType: '电焊工',
    cumulativeStayHours: 119.9,
    positionedOvertimeHours: 35.0,
    overtimeDaysCount: 6,
    safetyViolationCount: 0,
    safetyComplianceRate: '100%',
    primaryShipNo: '185-4 / 517-2',
    primaryWorkArea: '16T前',
    createdAt: '2026-09-21 00:20:01'
  }
];

const MONTHLY_STORAGE_KEY = 'shipyard_overtime_monthly_records_v1';

export function getStoredMonthlyReportRecords(): OvertimeMonthlyRecord[] {
  try {
    const saved = localStorage.getItem(MONTHLY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load monthly report records from localStorage', e);
  }
  return INITIAL_MONTHLY_REPORT_RECORDS;
}

export function saveStoredMonthlyReportRecords(records: OvertimeMonthlyRecord[]): void {
  try {
    localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('overtime_monthly_records_updated', { detail: { records } }));
  } catch (e) {
    console.error('Failed to save monthly report records to localStorage', e);
  }
}
