/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 加班日报与人员定位统计数据定义与存储服务
 */

export interface OvertimeDailyRecord {
  id: string; // 记录ID, 如 'DR-101'
  reportDate: string; // 统计日期, 如 '2026-09-20'
  workerName: string; // 姓名, 如 '罗志刚'
  phone: string; // 联系方式, 如 '150****6464'
  company: string; // 所属公司 / 施工单位, 如 '安海工程'
  deptName: string; // 所属部门, 如 '机电部'
  teamName: string; // 所属班组, 如 '机电一班'
  workType: string; // 所属工种, 如 '电工'
  
  // 保留字段：
  cumulativeStayHours: number; // 累计停留时长 (小时), 如 23.9
  positionedOvertimeHours: number; // 定位加班时长 (小时), 如 7.0
  
  // 结合加班管理与安全告警联动的拓展字段：
  overtimeId: string; // 关联加班单号, 如 '12', '15', '20'
  shipNo: string; // 施工船号, 如 '185-4 / 517-2'
  workArea: string; // 作业区域, 如 '16T前'
  isHotWork: boolean; // 是否动火
  hotWorkLevel?: string; // 动火等级
  isConfinedSpace: boolean; // 是否密闭空间
  safetyOfficer: string; // 现场安全员, 如 '周卫国 (安全工程师)'
  safetyStatus: 'present' | 'absent'; // 安全员在岗状态: 在岗 / 缺岗告警
  tagCode: string; // UWB定位标签ID, 如 'TAG-1082'
  createdAt: string; // 创建/采集更新时间, 如 '2026-09-21 00:05:53'
}

export const INITIAL_DAILY_REPORT_RECORDS: OvertimeDailyRecord[] = [
  {
    id: 'DR-101',
    reportDate: '2026-09-20',
    workerName: '罗志刚',
    phone: '150****6464',
    company: '安海工程',
    deptName: '机电部',
    teamName: '机电一班',
    workType: '电工',
    cumulativeStayHours: 23.9,
    positionedOvertimeHours: 7.0,
    overtimeId: '12',
    shipNo: '185-4 / 517-2',
    workArea: '16T前',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '周卫国 (安全工程师)',
    safetyStatus: 'present',
    tagCode: 'TAG-1082',
    createdAt: '2026-09-21 00:05:53'
  },
  {
    id: 'DR-102',
    reportDate: '2026-09-20',
    workerName: '肖俊华',
    phone: '158****3168',
    company: '安海工程',
    deptName: '机电部',
    teamName: '机电一班',
    workType: '钳工',
    cumulativeStayHours: 23.9,
    positionedOvertimeHours: 7.0,
    overtimeId: '12',
    shipNo: '185-4 / 517-2',
    workArea: '16T前',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '周卫国 (安全工程师)',
    safetyStatus: 'present',
    tagCode: 'TAG-1083',
    createdAt: '2026-09-21 00:05:52'
  },
  {
    id: 'DR-103',
    reportDate: '2026-09-20',
    workerName: '李旻',
    phone: '136****0253',
    company: '明烨二队',
    deptName: '机电部',
    teamName: '机电二班',
    workType: '电焊工',
    cumulativeStayHours: 23.9,
    positionedOvertimeHours: 7.0,
    overtimeId: '13',
    shipNo: '185-4 / 517-2',
    workArea: '16T前',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '张明 (当班安全员)',
    safetyStatus: 'present',
    tagCode: 'TAG-1084',
    createdAt: '2026-09-21 00:05:52'
  },
  {
    id: 'DR-104',
    reportDate: '2026-09-20',
    workerName: '苏舶宁',
    phone: '130****3632',
    company: '明烨二队',
    deptName: '船装部',
    teamName: '船装一组',
    workType: '装配工',
    cumulativeStayHours: 23.53,
    positionedOvertimeHours: 6.98,
    overtimeId: '15',
    shipNo: '185-4 / 517-2',
    workArea: '内场/10T前/5#轨',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '未在岗/缺席',
    safetyStatus: 'absent',
    tagCode: 'TAG-1085',
    createdAt: '2026-09-21 00:05:57'
  },
  {
    id: 'DR-105',
    reportDate: '2026-09-20',
    workerName: '丁俊雄',
    phone: '198****3286',
    company: '鹏杨安装',
    deptName: '搭载部',
    teamName: '搭载二组',
    workType: '铆工',
    cumulativeStayHours: 22.9,
    positionedOvertimeHours: 6.81,
    overtimeId: '16',
    shipNo: '18500/3号',
    workArea: '1.2号轨, 内场第三跨',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '林峰 (安全主管)',
    safetyStatus: 'present',
    tagCode: 'TAG-1086',
    createdAt: '2026-09-21 00:05:40'
  },
  {
    id: 'DR-106',
    reportDate: '2026-09-20',
    workerName: '陈翔',
    phone: '139****3830',
    company: '鹏杨安装',
    deptName: '涂装部',
    teamName: '喷涂一班',
    workType: '涂装工',
    cumulativeStayHours: 22.81,
    positionedOvertimeHours: 6.9,
    overtimeId: '17',
    shipNo: '18500/3号',
    workArea: '1.2号轨, 内场第三跨',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '陈建国 (当班安全员)',
    safetyStatus: 'present',
    tagCode: 'TAG-1087',
    createdAt: '2026-09-21 00:05:52'
  },
  {
    id: 'DR-107',
    reportDate: '2026-09-20',
    workerName: '林武',
    phone: '177****1805',
    company: '鹏杨安装',
    deptName: '搭载部',
    teamName: '搭载一组',
    workType: '结构工',
    cumulativeStayHours: 22.43,
    positionedOvertimeHours: 6.79,
    overtimeId: '18',
    shipNo: '18500-4 / 517-2',
    workArea: '128',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '王德海 (安全员)',
    safetyStatus: 'present',
    tagCode: 'TAG-1088',
    createdAt: '2026-09-21 00:05:19'
  },
  {
    id: 'DR-108',
    reportDate: '2026-09-20',
    workerName: '刘绍宏',
    phone: '133****8062',
    company: '大连施工队',
    deptName: '安全环保部',
    teamName: '巡查一组',
    workType: '安全员',
    cumulativeStayHours: 21.47,
    positionedOvertimeHours: 6.25,
    overtimeId: '19',
    shipNo: '18500-4 / 517-2',
    workArea: '堆场, 5号轨',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '刘海 (当班安全员)',
    safetyStatus: 'present',
    tagCode: 'TAG-1089',
    createdAt: '2026-09-21 00:06:17'
  },
  {
    id: 'DR-109',
    reportDate: '2026-09-20',
    workerName: '姜春烁',
    phone: '178****1714',
    company: '鹏杨安装',
    deptName: '搭载部',
    teamName: '搭载三组',
    workType: '管道工',
    cumulativeStayHours: 20.33,
    positionedOvertimeHours: 6.99,
    overtimeId: '18',
    shipNo: '18500-4 / 517-2',
    workArea: '128',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    safetyOfficer: '王德海 (安全员)',
    safetyStatus: 'present',
    tagCode: 'TAG-1090',
    createdAt: '2026-09-21 00:05:40'
  },
  {
    id: 'DR-110',
    reportDate: '2026-09-20',
    workerName: '谢信禧',
    phone: '138****3822',
    company: '大连施工队',
    deptName: '安全环保部',
    teamName: '巡查二组',
    workType: '安全员',
    cumulativeStayHours: 18.18,
    positionedOvertimeHours: 6.16,
    overtimeId: '20',
    shipNo: '18500-4',
    workArea: '堆场, 5号轨',
    isHotWork: true,
    hotWorkLevel: '一级',
    isConfinedSpace: true,
    safetyOfficer: '未在岗/缺席',
    safetyStatus: 'absent',
    tagCode: 'TAG-1091',
    createdAt: '2026-09-21 00:06:12'
  }
];

const DAILY_STORAGE_KEY = 'shipyard_overtime_daily_records_v1';

export function getStoredDailyReportRecords(): OvertimeDailyRecord[] {
  try {
    const saved = localStorage.getItem(DAILY_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load daily report records from localStorage', e);
  }
  return INITIAL_DAILY_REPORT_RECORDS;
}

export function saveStoredDailyReportRecords(records: OvertimeDailyRecord[]): void {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('overtime_daily_records_updated', { detail: { records } }));
  } catch (e) {
    console.error('Failed to save daily report records to localStorage', e);
  }
}
