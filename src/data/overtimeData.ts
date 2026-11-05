/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 加班管理数据定义与存储服务 (联动告警管理)
 */

import { syncOvertimeAlarmToRecords } from './alarmRecordData';

export interface OvertimeRecord {
  id: string; // 序号/单号, 如 12, 13, 14...
  deptName: string; // 部门, 如 制造部、搭载部
  reportDate: string; // 填报日期, 如 2026-08-07
  timeRange: string; // 加班时间段, 如 17:00 - 21:00
  shipNo: string; // 施工船号, 如 185-4 / 517-2
  workArea: string; // 施工区域, 如 16T前
  contractor: string; // 施工单位, 如 安海、明烨、鹏杨
  workerCount: number; // 施工人数
  projectName: string; // 加班项目
  isHotWork: boolean; // 是否动火 (是/否)
  hotWorkLevel: string; // 动火等级 (无 / 一级 / 二级 / 三级)
  isConfinedSpace: boolean; // 是否有限空间作业 (是/否)
  workerList: string; // 施工人员名单
  reporter: string; // 填报人
  reporterPhone: string; // 填报人电话
  remark?: string; // 备注

  // 核心安全监护与告警联动字段
  safetyOfficer: string; // 现场安全岗位人员 / 安全监护人
  safetyOfficerPhone?: string; // 安全员联系电话
  safetyStatus: 'present' | 'absent' | 'unassigned'; // 安全员在岗状态: present=在岗; absent=缺岗告警; unassigned=未配备
  hasActiveAlert: boolean; // 是否处于告警状态
  alertId?: string; // 关联告警单号
  alertReason?: string; // 告警原因
}

export const INITIAL_OVERTIME_RECORDS: OvertimeRecord[] = [
  {
    id: '12',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 19:00',
    shipNo: '185-4 / 517-2',
    workArea: '16T前',
    contractor: '安海',
    workerCount: 13,
    projectName: '12.922.932.834.806/142.14',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '王成林, 蔡佐兵, 黄贤锦, 张国, 蔡切兵, 李芳, 刘丙涛, 莫大奎, 李水财, 孙洪刚, 沈建康, 范清霖, 郑维',
    reporter: '潘记锋',
    reporterPhone: '18888394634',
    remark: '东南基地日常加班',
    safetyOfficer: '周卫国 (安全工程师)',
    safetyOfficerPhone: '13890123456',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '13',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 21:00',
    shipNo: '185-4 / 517-2',
    workArea: '16T前',
    contractor: '安海',
    workerCount: 14,
    projectName: '12.922.932.834.806/142.14',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '王克群, 王克亮, 张亮, 张东东, 杨正朝, 康小环, 孟令占, 荣耀武, 马旭, 朱少林, 麦朝元, 康小峰, 张富强',
    reporter: '潘记锋',
    reporterPhone: '18888394634',
    remark: '夜间赶工焊接',
    safetyOfficer: '张明 (当班安全员)',
    safetyOfficerPhone: '13911223344',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '14',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 21:00',
    shipNo: '185-4 / 517-2',
    workArea: '16T前',
    contractor: '安海',
    workerCount: 8,
    projectName: '12.922.932.834.806/142.14',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '陈天国, 周忠良, 九景勒, 九计福, 布, 余自国, 岑由良, 卫健敏, 曾先雄',
    reporter: '潘记锋',
    reporterPhone: '18888394634',
    remark: '打磨与预装配',
    safetyOfficer: '李建平 (安全员)',
    safetyOfficerPhone: '13788990011',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '15',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 20:30',
    shipNo: '185-4 / 517-2',
    workArea: '内场/10T前/5#轨',
    contractor: '明烨',
    workerCount: 18,
    projectName: '03.923.933.501.509.111/13',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '张玉海, 汪铁飞, 梁三平, 崔亚西, 刘芳, 罗佳城, 刘世富, 喻玉宋, 杨承先, 孟献苏, 王少奇, 王玉龙, 陈红, 险大道, 潘文敏, 戚风凤, 游波, 熊良超, 马立, 杨荣强, 余清',
    reporter: '莫济生',
    reporterPhone: '18059875608',
    remark: '内场框架拼装',
    safetyOfficer: '未在岗/缺席',
    safetyOfficerPhone: '18059875608',
    safetyStatus: 'absent',
    hasActiveAlert: true,
    alertId: 'ALM-OT-20260807-15',
    alertReason: '18人加班施工，现场无安全岗位人员监护在岗'
  },
  {
    id: '16',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '18:00 - 19:00',
    shipNo: '18500/3号',
    workArea: '1.2号轨, 内场第三跨',
    contractor: '鹏杨',
    workerCount: 16,
    projectName: '810+961+971+122+101',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '顾海, 陈双喜, 孙友建, 潘家强, 郭玉新, 张小毛, 朱元荣, 华成林, 任茂, 郭存国, 张守峰, 刘艳, 关粮',
    reporter: '李德平',
    reporterPhone: '15880728378',
    remark: '管路及结构补强',
    safetyOfficer: '林峰 (安全主管)',
    safetyOfficerPhone: '13988219901',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '17',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 21:00',
    shipNo: '18500/3号',
    workArea: '1.2号轨, 内场第三跨',
    contractor: '鹏杨',
    workerCount: 18,
    projectName: '810+961+971+122+101',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '王德才, 王德力, 唐观强, 刘志强, 周志全, 强泉华, 碰电堤, 刘志强, 刘松林, 张志容',
    reporter: '李德平',
    reporterPhone: '15880728378',
    remark: '电焊打磨合拢作业',
    safetyOfficer: '陈建国 (当班安全员)',
    safetyOfficerPhone: '13522334455',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '18',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 21:00',
    shipNo: '18500-4 / 517-2',
    workArea: '128',
    contractor: '鹏杨',
    workerCount: 10,
    projectName: '电焊打磨122, 807',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '易伟, 凡水春, 耿文朝, 倪洪强, 易乐华',
    reporter: '易伟',
    reporterPhone: '18250498839',
    remark: '打磨与缝隙修补',
    safetyOfficer: '王德海 (安全员)',
    safetyOfficerPhone: '13877621190',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '19',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 21:00',
    shipNo: '18500-4 / 517-2',
    workArea: '堆场, 5号轨',
    contractor: '大连',
    workerCount: 5,
    projectName: '-401, 504, 503分段管路',
    isHotWork: true,
    hotWorkLevel: '无',
    isConfinedSpace: false,
    workerList: '龚灿, 刘文耀, 魏长胜, 张金成, 戚成, 邢海洋, 韦建文, 邓正奎',
    reporter: '戚林',
    reporterPhone: '15060404788',
    remark: '分段管路安装',
    safetyOfficer: '刘海 (当班安全员)',
    safetyOfficerPhone: '13611223344',
    safetyStatus: 'present',
    hasActiveAlert: false
  },
  {
    id: '20',
    deptName: '制造部',
    reportDate: '2026-08-07',
    timeRange: '17:00 - 21:00',
    shipNo: '18500-4',
    workArea: '堆场, 5号轨',
    contractor: '大连',
    workerCount: 8,
    projectName: '打磨装配与管路定位',
    isHotWork: true,
    hotWorkLevel: '一级',
    isConfinedSpace: true,
    workerList: '白太良, 杨小龙, 陈宏胜, 范庆, 田后保, 周德春, 关建, 谷云飞, 张峰, 许小明, 敬忠吉, 张善芳, 孙进',
    reporter: '白太良',
    reporterPhone: '18030272887',
    remark: '密闭空间作业，具备防爆通风',
    safetyOfficer: '未在岗/缺席',
    safetyOfficerPhone: '18030272887',
    safetyStatus: 'absent',
    hasActiveAlert: true,
    alertId: 'ALM-OT-20260807-20',
    alertReason: '一级动火与密闭空间特种加班作业，现场无持证安全员在岗'
  }
];

const STORAGE_KEY = 'shipyard_overtime_data_v3';

export function getStoredOvertimeRecords(): OvertimeRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load overtime records from localStorage', e);
  }
  return INITIAL_OVERTIME_RECORDS;
}

export function saveStoredOvertimeRecords(records: OvertimeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    
    // 联动同步告警到告警管理
    records.forEach(r => {
      syncOvertimeAlarmToRecords(r.id, {
        shipNo: r.shipNo,
        workArea: r.workArea,
        contractor: r.contractor,
        projectName: r.projectName,
        timeRange: r.timeRange,
        workerCount: r.workerCount,
        reporter: r.reporter,
        reporterPhone: r.reporterPhone,
        safetyOfficer: r.safetyOfficer,
        safetyOfficerPhone: r.safetyOfficerPhone,
        safetyStatus: r.safetyStatus,
        isHotWork: r.isHotWork,
        isConfinedSpace: r.isConfinedSpace
      });
    });

    window.dispatchEvent(new CustomEvent('overtime_data_updated', { detail: { records } }));
  } catch (e) {
    console.error('Failed to save overtime records to localStorage', e);
  }
}
