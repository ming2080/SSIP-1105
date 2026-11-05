/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DHR 人力资源系统单向同步日志数据定义与存储
 */

export interface DhrSyncLogItem {
  id: string;
  batchNo: string; // 批次号，如 SYNC-20260915-010000
  syncTime: string; // 同步时间
  triggerType: 'schedule' | 'manual'; // 触发类型：定时任务 vs 手动立即同步
  triggerTypeName: string; // 定时自动同步 / 管理员手动同步
  operator: string; // 触发操作人
  duration: string; // 耗时
  status: 'success' | 'warning' | 'failed'; // 同步状态
  statusText: string;
  totalChecked: number; // 核对总档案数
  newCount: number; // 新增入库人数
  updatedCount: number; // 信息变更人数
  deptsUpdated: number; // 组织架构同步数
  abnormalCount: number; // 异常拦截数
  summary: string; // 概述
  stepLogs: {
    time: string;
    step: string;
    level: 'info' | 'success' | 'warning';
    detail: string;
  }[];
  details: {
    empId: string;
    name: string;
    empcode: string;
    deptname: string;
    gwName: string;
    changeType: '新增入库' | '部门调整' | '岗位变更' | '离职归档';
  }[];
}

export const INITIAL_DHR_SYNC_LOGS: DhrSyncLogItem[] = [
  {
    id: 'LOG-20260915-01',
    batchNo: 'SYNC-20260915-010000',
    syncTime: '2026-09-15 01:00:00',
    triggerType: 'schedule',
    triggerTypeName: '系统定时自动同步',
    operator: 'DHR定时守护服务 (CronJob)',
    duration: '2.15s',
    status: 'success',
    statusText: '执行成功',
    totalChecked: 1420,
    newCount: 4,
    updatedCount: 9,
    deptsUpdated: 3,
    abnormalCount: 0,
    summary: '每日凌晨定时单向增量同步完成，新增4名劳务外协电焊工，更新9名员工班组归属',
    stepLogs: [
      { time: '01:00:00.021', step: '通道握手', level: 'info', detail: '成功连接 DHR OpenAPI 网关 (HTTPS 200 OK，协议 TLS 1.3)' },
      { time: '01:00:00.340', step: '增量拉取', level: 'info', detail: '拉取自 2026-09-14 01:00:00 起发生变更的 B01组织表与人员主档' },
      { time: '01:00:01.210', step: '字段映射', level: 'info', detail: '工号、身份证、用工类型与岗位字典自动映射并校验通过' },
      { time: '01:00:02.100', step: '数据写入', level: 'success', detail: '人员主库写入完成，生成在册人员索引，同步状态置为成功' }
    ],
    details: [
      { empId: 'EMP-051', name: '黄世荣', empcode: 'DN-8901', deptname: '东南造船厂//制造部//船体电焊二组', gwName: '二氧化碳保护焊工', changeType: '新增入库' },
      { empId: 'EMP-052', name: '罗文辉', empcode: 'DN-8902', deptname: '东南造船厂//制造部//船体电焊二组', gwName: '船舶电焊工', changeType: '新增入库' },
      { empId: 'EMP-053', name: '张发强', empcode: 'DN-8903', deptname: '东南造船厂//涂装分厂//除锈喷涂一组', gwName: '特种喷涂作业员', changeType: '新增入库' },
      { empId: 'EMP-054', name: '钟培根', empcode: 'DN-8904', deptname: '东南造船厂//搭载车间//大合拢铆工班', gwName: '造船装配铆工', changeType: '新增入库' },
      { empId: 'EMP-012', name: '陈立新', empcode: 'DN-8012', deptname: '东南造船厂//制造部//船体电焊一组', gwName: '特种气刨焊工', changeType: '部门调整' }
    ]
  },
  {
    id: 'LOG-20260914-01',
    batchNo: 'SYNC-20260914-010000',
    syncTime: '2026-09-14 01:00:00',
    triggerType: 'schedule',
    triggerTypeName: '系统定时自动同步',
    operator: 'DHR定时守护服务 (CronJob)',
    duration: '1.98s',
    status: 'success',
    statusText: '执行成功',
    totalChecked: 1416,
    newCount: 3,
    updatedCount: 5,
    deptsUpdated: 1,
    abnormalCount: 0,
    summary: '每日凌晨定时单向增量同步完成，新增3名入职员工档案，更新5名员工岗位信息',
    stepLogs: [
      { time: '01:00:00.018', step: '通道握手', level: 'info', detail: '成功连接 DHR OpenAPI 网关 (HTTPS 200 OK)' },
      { time: '01:00:00.412', step: '增量拉取', level: 'info', detail: '拉取人资数据变动记录' },
      { time: '01:00:01.120', step: '字段校验', level: 'info', detail: '无身份证重复或手机号异常记录' },
      { time: '01:00:01.950', step: '数据入库', level: 'success', detail: '人员主库入库成功' }
    ],
    details: [
      { empId: 'EMP-048', name: '郑建国', empcode: 'DN-8848', deptname: '东南造船厂//安监环保部//现场安全巡查一组', gwName: '专职安全监督员', changeType: '新增入库' },
      { empId: 'EMP-049', name: '何家成', empcode: 'DN-8849', deptname: '东南造船厂//制造部//起重吊装班', gwName: '门座起重机司机', changeType: '新增入库' },
      { empId: 'EMP-050', name: '林海峰', empcode: 'DN-8850', deptname: '东南造船厂//管系加工车间//弯管气割组', gwName: '高压管系焊工', changeType: '新增入库' }
    ]
  },
  {
    id: 'LOG-20260913-15',
    batchNo: 'SYNC-20260913-153022',
    syncTime: '2026-09-13 15:30:22',
    triggerType: 'manual',
    triggerTypeName: '管理员手动同步',
    operator: '安全总监 (王大明)',
    duration: '1.74s',
    status: 'success',
    statusText: '执行成功',
    totalChecked: 1413,
    newCount: 2,
    updatedCount: 3,
    deptsUpdated: 2,
    abnormalCount: 0,
    summary: '管理员为新开工 17.4万方LNG船 (H1821A) 项目入场队伍执行即时同步',
    stepLogs: [
      { time: '15:30:22.012', step: '管理员鉴权', level: 'info', detail: '操作人 王大明 (UID: 145) 发起即时全量核验单向同步请求' },
      { time: '15:30:22.500', step: '接口响应', level: 'info', detail: 'DHR OpenAPI 返回最新有效在册数据包' },
      { time: '15:30:23.700', step: '增量合并', level: 'success', detail: '增量人员档案与部门层级成功并入本地缓存与主库' }
    ],
    details: [
      { empId: 'EMP-046', name: '孙德胜', empcode: 'DN-8846', deptname: '东南造船厂//制造部//船体装焊三组', gwName: '特种气刨工', changeType: '新增入库' },
      { empId: 'EMP-047', name: '吴天明', empcode: 'DN-8847', deptname: '东南造船厂//制造部//船体装焊三组', gwName: '船舶装配工', changeType: '新增入库' }
    ]
  }
];

export function getStoredDhrSyncLogs(): DhrSyncLogItem[] {
  try {
    const saved = localStorage.getItem('shipyard_dhr_sync_logs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_DHR_SYNC_LOGS;
}

export function saveStoredDhrSyncLogs(logs: DhrSyncLogItem[]): void {
  try {
    localStorage.setItem('shipyard_dhr_sync_logs', JSON.stringify(logs));
  } catch {}
}

export function appendDhrSyncLog(newLog: DhrSyncLogItem): DhrSyncLogItem[] {
  const current = getStoredDhrSyncLogs();
  const next = [newLog, ...current];
  saveStoredDhrSyncLogs(next);
  return next;
}
