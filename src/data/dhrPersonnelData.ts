/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DHR (人力资源系统) 与 SSSP (智慧船厂平台) 业务要素映射对照字典及主数据
 * 严格依据《部门与人员业务要素对照表》及《编码表对应》定义
 */

// 1.2 部门类型编码表 (HR系统编码: ID -> NAME)
export const DHR_DEPT_TYPES: Record<string, string> = {
  '1': '集团',
  '2': '子公司',
  '3': '分公司',
  '4': '普通公司'
};

// 1.3 部门属性编码表
export const DHR_DEPT_ATTRIBUTES: Record<string, string> = {
  '01': '后勤',
  '02': '生产车间'
};

// 1.4 用工类型编码表 (HR系统编码: ID -> NAME)
export const DHR_EMPLOYMENT_TYPES: Record<string, string> = {
  '10': '马船员工',
  '11': '马船派遣',
  '12': '利亚员工',
  '13': '劳务员工',
  '14': '实习生',
  '15': '临时工（利榕）',
  '16': '船政重工',
  '17': '东南员工',
  '18': '福宁员工',
  '19': '研究院员工',
  '20': '闽船员工',
  '21': '东南返聘',
  '22': '东南派遣',
  '23': '闽船派遣',
  '24': '东南临时工',
  '25': '东南供养',
  '26': '马船供养'
};

// 1.5 岗位工种编码表 (HR系统编码 1~190 常见生产与管理岗位)
export const DHR_POST_JOBS: Record<string, string> = {
  '1': '厨工',
  '4': '报关员',
  '7': '检验支持',
  '8': '军品支持',
  '9': '设计支持',
  '10': '营销支持',
  '22': '钣金工',
  '23': '船长',
  '24': '大副',
  '28': '轮机长',
  '30': '水手',
  '31': '搭架工',
  '32': '打磨工',
  '33': '打砂工',
  '34': '船舶电工',
  '35': '船舶电焊工',
  '36': '碳弧气刨',
  '37': '吊车工',
  '38': '信号员',
  '39': '电气调试',
  '40': '轮机调试',
  '41': '放样工',
  '42': '敷缆工',
  '43': '叉车司机',
  '45': '平板车司机',
  '46': '汽车吊司机',
  '48': '船舶管铜工',
  '49': '划线工',
  '50': '火工',
  '51': '车工',
  '56': '集配工',
  '57': '仓管员',
  '64': '船舶钳工',
  '65': '船舶气割工',
  '70': '配电工',
  '75': '喷涂工',
  '77': '油漆工',
  '79': '管工',
  '81': '维修电工',
  '83': '船舶除锈油漆工',
  '84': '船舶装配工',
  '85': '冷作工',
  '87': '工时管理',
  '88': '计划管理',
  '89': '船体管理',
  '90': '单船管理',
  '91': '电气管理',
  '92': '管系管理',
  '93': '建造管理',
  '94': '轮机管理',
  '95': '起重管理',
  '96': '区域管理',
  '97': '生产管理',
  '98': '项目管理',
  '101': '安全员',
  '102': '保安',
  '110': '工艺员',
  '111': '焊接工艺',
  '113': '检验员',
  '122': '船体检验',
  '123': '电气检验',
  '125': '轮机检验',
  '126': '品质管理',
  '134': '安全管理',
  '171': '船体设计',
  '181': '信息管理'
};

// 1.7 性别编码表
export const DHR_GENDER_TYPES: Record<string, string> = {
  '1': '男',
  '2': '女'
};

// 1.8 人员类别/状态编码表
export const DHR_PERSONNEL_STATUS: Record<string, string> = {
  '1': '在职',
  '15': '离职',
  '18': '离退休',
  '21': '已故',
  '25': '其他',
  '26': '外包员工',
  '27': '外包离司'
};

// 组织架构接口定义（对照表 部门/班组）
export interface DhrDepartment {
  deptid: string; // 班组ID / 部门ID (不允许为空)
  deptname: string; // 班组名称 (不允许为空)
  depttype: string; // 部门类型 (1集团, 2子公司, 3分公司, 4普通公司)
  deptcode: string; // 部门/班组编码
  deptattribute?: string; // 部门属性 (01后勤, 02生产车间)
  parentid: string; // 上级部门ID (Root部门为空)
  deptgrade: number; // 班组层级 (1公司, 2部门, 3班组)
  disabled: number; // 作废标识 (0启用, 1作废)
  children?: DhrDepartment[];
  memberCount?: number;
}

// 人员库人员档案实体（对照表 人员 + SSSP 业务要素）
export interface DhrPersonnelItem {
  empID: string; // HR员工ID (人员ID, 不允许为空, 主键)
  name: string; // 姓名 (不允许为空)
  empcode: string; // 员工工号 (允许为空)
  deptname: string; // 部门/班组全称 (公司//部门//班组)
  DEPT_CODE: string; // 所属部门/班组CODE (不允许为空)
  ygtype: string; // 用工类型CODE (对应 DHR_EMPLOYMENT_TYPES)
  ygtypeName?: string;
  IDCard: string; // 身份证号 (不允许为空)
  gw: string; // 岗位工种CODE (对应 DHR_POST_JOBS)
  gwName?: string;
  entryDate: string; // 入职日期
  cellphone: string; // 联系电话 (不允许为空)
  sex: string; // 性别CODE (1男, 2女)
  potype: string; // 人员类别CODE (1在职, 15离职, 26外包等)
  deleted: number; // 人员删除标记 (0否, 1是)
  
  // SSSP 专有业务要素
  presenceStatus: 1 | 2; // 在场状态：1在场, 2离场
  photo?: string; // 照片
  tagStatus: 'bound' | 'unbound' | 'fault' | 'offline'; // 标签状态
  tagCode?: string; // 定位标签编号 (UWB-xxxx)
  tagBattery?: number; // 标签电量 (0~100)
  tagBindTime?: string; // 标签佩戴发卡时间
  projectId?: string; // 所属船舶建造项目
  projectName?: string;
  
  // 关联系统用户状态 (人员与账号 1:0..1 映射)
  hasUserAccount: boolean;
  systemUsername?: string;
  systemUserRole?: string;
}

// 预置标准组织机构数据（公司 -> 部门 -> 班组 三级层级架构）
export const INITIAL_DEPARTMENTS: DhrDepartment[] = [
  {
    deptid: 'DEPT-001',
    deptname: '东南船厂',
    depttype: '2',
    deptcode: 'DN_SHIP',
    parentid: '',
    deptgrade: 1,
    disabled: 0,
    memberCount: 42,
    children: [
      {
        deptid: 'DEPT-010',
        deptname: '制造部',
        depttype: '4',
        deptcode: 'DN_MFG',
        deptattribute: '02',
        parentid: 'DEPT-001',
        deptgrade: 2,
        disabled: 0,
        memberCount: 24,
        children: [
          {
            deptid: 'DEPT-0101',
            deptname: '船体电焊一组',
            depttype: '4',
            deptcode: 'DN_WELD_01',
            deptattribute: '02',
            parentid: 'DEPT-010',
            deptgrade: 3,
            disabled: 0,
            memberCount: 8
          },
          {
            deptid: 'DEPT-0102',
            deptname: '船体装配二班',
            depttype: '4',
            deptcode: 'DN_FIT_02',
            deptattribute: '02',
            parentid: 'DEPT-010',
            deptgrade: 3,
            disabled: 0,
            memberCount: 9
          },
          {
            deptid: 'DEPT-0103',
            deptname: '气割与等离子切割组',
            depttype: '4',
            deptcode: 'DN_CUT_01',
            deptattribute: '02',
            parentid: 'DEPT-010',
            deptgrade: 3,
            disabled: 0,
            memberCount: 7
          }
        ]
      },
      {
        deptid: 'DEPT-020',
        deptname: '搭载部',
        depttype: '4',
        deptcode: 'DN_ERECTION',
        deptattribute: '02',
        parentid: 'DEPT-001',
        deptgrade: 2,
        disabled: 0,
        memberCount: 11,
        children: [
          {
            deptid: 'DEPT-0201',
            deptname: '大合拢搭载班',
            depttype: '4',
            deptcode: 'DN_EREC_01',
            deptattribute: '02',
            parentid: 'DEPT-020',
            deptgrade: 3,
            disabled: 0,
            memberCount: 6
          },
          {
            deptid: 'DEPT-0202',
            deptname: '起重吊装组',
            depttype: '4',
            deptcode: 'DN_CRANE_01',
            deptattribute: '02',
            parentid: 'DEPT-020',
            deptgrade: 3,
            disabled: 0,
            memberCount: 5
          }
        ]
      },
      {
        deptid: 'DEPT-030',
        deptname: '涂装防腐部',
        depttype: '4',
        deptcode: 'DN_PAINT',
        deptattribute: '02',
        parentid: 'DEPT-001',
        deptgrade: 2,
        disabled: 0,
        memberCount: 7,
        children: [
          {
            deptid: 'DEPT-0301',
            deptname: '特种喷涂一组',
            depttype: '4',
            deptcode: 'DN_PAINT_01',
            deptattribute: '02',
            parentid: 'DEPT-030',
            deptgrade: 3,
            disabled: 0,
            memberCount: 4
          },
          {
            deptid: 'DEPT-0302',
            deptname: '高压打砂除锈班',
            depttype: '4',
            deptcode: 'DN_SAND_01',
            deptattribute: '02',
            parentid: 'DEPT-030',
            deptgrade: 3,
            disabled: 0,
            memberCount: 3
          }
        ]
      },
      {
        deptid: 'DEPT-040',
        deptname: '安环部',
        depttype: '4',
        deptcode: 'DN_HSE',
        deptattribute: '01',
        parentid: 'DEPT-001',
        deptgrade: 2,
        disabled: 0,
        memberCount: 5,
        children: [
          {
            deptid: 'DEPT-0401',
            deptname: '船坞码头安全督查巡检组',
            depttype: '4',
            deptcode: 'DN_SAFE_01',
            deptattribute: '01',
            parentid: 'DEPT-040',
            deptgrade: 3,
            disabled: 0,
            memberCount: 5
          }
        ]
      }
    ]
  },
  {
    deptid: 'DEPT-002',
    deptname: '马尾造船厂',
    depttype: '2',
    deptcode: 'MW_SHIP',
    parentid: '',
    deptgrade: 1,
    disabled: 0,
    memberCount: 18,
    children: [
      {
        deptid: 'DEPT-050',
        deptname: '机电工程部',
        depttype: '4',
        deptcode: 'MW_ELEC',
        deptattribute: '02',
        parentid: 'DEPT-002',
        deptgrade: 2,
        disabled: 0,
        memberCount: 12,
        children: [
          {
            deptid: 'DEPT-0501',
            deptname: '船舶主电缆敷设班',
            depttype: '4',
            deptcode: 'MW_CABLE_01',
            deptattribute: '02',
            parentid: 'DEPT-050',
            deptgrade: 3,
            disabled: 0,
            memberCount: 6
          },
          {
            deptid: 'DEPT-0502',
            deptname: '轮机调试一组',
            depttype: '4',
            deptcode: 'MW_ENG_01',
            deptattribute: '02',
            parentid: 'DEPT-050',
            deptgrade: 3,
            disabled: 0,
            memberCount: 6
          }
        ]
      },
      {
        deptid: 'DEPT-060',
        deptname: '生产管理部',
        depttype: '4',
        deptcode: 'MW_PROD_MGMT',
        deptattribute: '01',
        parentid: 'DEPT-002',
        deptgrade: 2,
        disabled: 0,
        memberCount: 6,
        children: [
          {
            deptid: 'DEPT-0601',
            deptname: '现场建造调度组',
            depttype: '4',
            deptcode: 'MW_SCHED_01',
            deptattribute: '01',
            parentid: 'DEPT-060',
            deptgrade: 3,
            disabled: 0,
            memberCount: 6
          }
        ]
      }
    ]
  },
  {
    deptid: 'DEPT-003',
    deptname: '外协工程施工分队',
    depttype: '4',
    deptcode: 'SUB_ENG',
    parentid: '',
    deptgrade: 1,
    disabled: 0,
    memberCount: 15,
    children: [
      {
        deptid: 'DEPT-070',
        deptname: '利亚工程施工队',
        depttype: '4',
        deptcode: 'SUB_LIYA',
        deptattribute: '02',
        parentid: 'DEPT-003',
        deptgrade: 2,
        disabled: 0,
        memberCount: 15,
        children: [
          {
            deptid: 'DEPT-0701',
            deptname: '外协脚手架搭设班',
            depttype: '4',
            deptcode: 'SUB_SCAF_01',
            deptattribute: '02',
            parentid: 'DEPT-070',
            deptgrade: 3,
            disabled: 0,
            memberCount: 8
          },
          {
            deptid: 'DEPT-0702',
            deptname: '外协舱室打磨打砂班',
            depttype: '4',
            deptcode: 'SUB_POL_01',
            deptattribute: '02',
            parentid: 'DEPT-070',
            deptgrade: 3,
            disabled: 0,
            memberCount: 7
          }
        ]
      }
    ]
  }
];

// 预置的人员库初始数据
export const INITIAL_PERSONNEL_ITEMS: DhrPersonnelItem[] = [
  {
    empID: 'EMP-1001',
    name: '陈建国',
    empcode: 'DN-8001',
    deptname: '东南船厂//制造部//船体电焊一组',
    DEPT_CODE: 'DEPT-0101',
    ygtype: '17', // 东南员工
    ygtypeName: '东南员工',
    IDCard: '350123198503120018',
    gw: '35', // 船舶电焊工
    gwName: '船舶电焊工',
    entryDate: '2018-04-15',
    cellphone: '13859012301',
    sex: '1',
    potype: '1', // 在职
    deleted: 0,
    presenceStatus: 1, // 在场
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1001',
    tagBattery: 88,
    tagBindTime: '2026-09-01 07:30:00',
    projectId: 'PRJ-2026-01',
    projectName: '25000 DWT 多用途重吊船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1002',
    name: '林少伟',
    empcode: 'DN-8002',
    deptname: '东南船厂//制造部//船体电焊一组',
    DEPT_CODE: 'DEPT-0101',
    ygtype: '17',
    ygtypeName: '东南员工',
    IDCard: '350123199008240032',
    gw: '35',
    gwName: '船舶电焊工',
    entryDate: '2020-03-10',
    cellphone: '13859012302',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1002',
    tagBattery: 92,
    tagBindTime: '2026-09-02 07:40:00',
    projectId: 'PRJ-2026-01',
    projectName: '25000 DWT 多用途重吊船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1003',
    name: '张志强',
    empcode: 'DN-8003',
    deptname: '东南船厂//制造部//船体装配二班',
    DEPT_CODE: 'DEPT-0102',
    ygtype: '17',
    ygtypeName: '东南员工',
    IDCard: '350123198211050015',
    gw: '84', // 船舶装配工
    gwName: '船舶装配工',
    entryDate: '2016-09-01',
    cellphone: '13905918801',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1003',
    tagBattery: 75,
    tagBindTime: '2026-09-03 08:00:00',
    projectId: 'PRJ-2026-02',
    projectName: '18500 DWT 油化船',
    hasUserAccount: true,
    systemUsername: 'zhangzq',
    systemUserRole: '班组长'
  },
  {
    empID: 'EMP-1004',
    name: '黄志明',
    empcode: 'DN-8004',
    deptname: '东南船厂//安环部//船坞码头安全督查巡检组',
    DEPT_CODE: 'DEPT-0401',
    ygtype: '17',
    ygtypeName: '东南员工',
    IDCard: '350104198806150076',
    gw: '101', // 安全员
    gwName: '安全员',
    entryDate: '2017-05-18',
    cellphone: '13705910045',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1004',
    tagBattery: 95,
    tagBindTime: '2026-09-01 07:15:00',
    projectId: 'PRJ-2026-01',
    projectName: '25000 DWT 多用途重吊船',
    hasUserAccount: true,
    systemUsername: 'huangzm_safe',
    systemUserRole: '安环巡检员'
  },
  {
    empID: 'EMP-1005',
    name: '王小红',
    empcode: 'DN-8005',
    deptname: '东南船厂//制造部//气割与等离子切割组',
    DEPT_CODE: 'DEPT-0103',
    ygtype: '22', // 东南派遣
    ygtypeName: '东南派遣',
    IDCard: '350123199402180062',
    gw: '65', // 船舶气割工
    gwName: '船舶气割工',
    entryDate: '2021-06-20',
    cellphone: '15980234501',
    sex: '2',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1005',
    tagBattery: 82,
    tagBindTime: '2026-09-05 08:20:00',
    projectId: 'PRJ-2026-02',
    projectName: '18500 DWT 油化船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1006',
    name: '周大海',
    empcode: 'DN-8006',
    deptname: '东南船厂//搭载部//起重吊装组',
    DEPT_CODE: 'DEPT-0202',
    ygtype: '17',
    ygtypeName: '东南员工',
    IDCard: '350123197909090019',
    gw: '37', // 吊车工
    gwName: '吊车工',
    entryDate: '2015-03-01',
    cellphone: '13600812306',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1006',
    tagBattery: 68,
    tagBindTime: '2026-09-04 07:45:00',
    projectId: 'PRJ-2026-01',
    projectName: '25000 DWT 多用途重吊船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1007',
    name: '郑宇飞',
    empcode: 'DN-8007',
    deptname: '东南船厂//涂装防腐部//特种喷涂一组',
    DEPT_CODE: 'DEPT-0301',
    ygtype: '13', // 劳务员工
    ygtypeName: '劳务员工',
    IDCard: '410102199207110038',
    gw: '75', // 喷涂工
    gwName: '喷涂工',
    entryDate: '2022-04-12',
    cellphone: '18750239912',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 2, // 离场
    photo: '',
    tagStatus: 'unbound',
    projectId: 'PRJ-2026-03',
    projectName: '3800 车位滚装船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1008',
    name: '赵立明',
    empcode: 'MW-7001',
    deptname: '马尾造船厂//机电工程部//船舶主电缆敷设班',
    DEPT_CODE: 'DEPT-0501',
    ygtype: '10', // 马船员工
    ygtypeName: '马船员工',
    IDCard: '350105198412250013',
    gw: '34', // 船舶电工
    gwName: '船舶电工',
    entryDate: '2014-08-15',
    cellphone: '13808517701',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1008',
    tagBattery: 90,
    tagBindTime: '2026-09-02 08:10:00',
    projectId: 'PRJ-2026-04',
    projectName: '65米海洋多功能平台供应船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1009',
    name: '孙浩然',
    empcode: 'MW-7002',
    deptname: '马尾造船厂//机电工程部//轮机调试一组',
    DEPT_CODE: 'DEPT-0502',
    ygtype: '10',
    ygtypeName: '马船员工',
    IDCard: '350105198604080031',
    gw: '40', // 轮机调试
    gwName: '轮机调试',
    entryDate: '2016-10-08',
    cellphone: '13905026612',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1009',
    tagBattery: 78,
    tagBindTime: '2026-09-06 08:30:00',
    projectId: 'PRJ-2026-04',
    projectName: '65米海洋多功能平台供应船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1010',
    name: '吴德福',
    empcode: 'SUB-9001',
    deptname: '外协工程施工分队//利亚工程施工队//外协脚手架搭设班',
    DEPT_CODE: 'DEPT-0701',
    ygtype: '12', // 利亚员工
    ygtypeName: '利亚员工',
    IDCard: '420106198105140057',
    gw: '31', // 搭架工
    gwName: '搭架工',
    entryDate: '2023-02-15',
    cellphone: '15060012389',
    sex: '1',
    potype: '26', // 外包员工
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1010',
    tagBattery: 65,
    tagBindTime: '2026-09-08 07:20:00',
    projectId: 'PRJ-2026-01',
    projectName: '25000 DWT 多用途重吊船',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1011',
    name: '杨培林',
    empcode: 'DN-8011',
    deptname: '东南船厂//制造部//船体装配二班',
    DEPT_CODE: 'DEPT-0102',
    ygtype: '17',
    ygtypeName: '东南员工',
    IDCard: '350123198710200034',
    gw: '98', // 项目管理
    gwName: '项目管理',
    entryDate: '2015-07-01',
    cellphone: '13799308821',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    photo: '',
    tagStatus: 'bound',
    tagCode: 'UWB-1011',
    tagBattery: 89,
    tagBindTime: '2026-09-01 08:00:00',
    projectId: 'PRJ-2026-01',
    projectName: '25000 DWT 多用途重吊船',
    hasUserAccount: true,
    systemUsername: 'yangpl_pm',
    systemUserRole: '造船项目管理员'
  },
  {
    empID: 'EMP-1012',
    name: '徐春梅',
    empcode: 'DN-8012',
    deptname: '东南船厂//涂装防腐部//高压打砂除锈班',
    DEPT_CODE: 'DEPT-0302',
    ygtype: '22',
    ygtypeName: '东南派遣',
    IDCard: '350123199301140026',
    gw: '33', // 打砂工
    gwName: '打砂工',
    entryDate: '2021-08-10',
    cellphone: '15860712399',
    sex: '2',
    potype: '1',
    deleted: 0,
    presenceStatus: 2, // 离场
    photo: '',
    tagStatus: 'unbound',
    hasUserAccount: false
  }
];

// DHR 模拟服务端增量数据（用于单向同步模拟测试）
export const DHR_INCREMENTAL_NEW_PERSONNEL: DhrPersonnelItem[] = [
  {
    empID: 'EMP-1013',
    name: '马天成',
    empcode: 'DN-8013',
    deptname: '东南船厂//制造部//船体电焊一组',
    DEPT_CODE: 'DEPT-0101',
    ygtype: '17',
    ygtypeName: '东南员工',
    IDCard: '350123199605120019',
    gw: '35',
    gwName: '船舶电焊工',
    entryDate: '2026-09-10',
    cellphone: '13859012313',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    tagStatus: 'unbound',
    hasUserAccount: false
  },
  {
    empID: 'EMP-1014',
    name: '梁志祥',
    empcode: 'MW-7014',
    deptname: '马尾造船厂//机电工程部//轮机调试一组',
    DEPT_CODE: 'DEPT-0502',
    ygtype: '10',
    ygtypeName: '马船员工',
    IDCard: '350105199109030012',
    gw: '40',
    gwName: '轮机调试',
    entryDate: '2026-09-12',
    cellphone: '13905026614',
    sex: '1',
    potype: '1',
    deleted: 0,
    presenceStatus: 1,
    tagStatus: 'unbound',
    hasUserAccount: false
  }
];
