export interface AlarmRuleVersion {
  versionId: string; // 格式: V{序号}，例如 'V1'、'V2'
  versionNumber: number; // 1, 2, 3...
  dateStr?: string; // 可选日期记录
  createdAt: string; // '2026-08-21 19:23:21'
  modifier: string; // '系统管理员' | '安全主管-张明'
  changeNotes?: string; // 变更说明
  snapshot: {
    name: string;
    type: string;
    level: '低' | '中' | '高';
    areaConditions: Array<{ type: string; relation: string; target: string }>;
    personConditions: Array<{ scope: string; relation: string; target: string }>;
    conditionType: string;
    conditionOperator: string;
    conditionValue: number;
    notifyTargets: {
      low: string;
      lowCountdown: string;
      mid: string;
      midCountdown: string;
      high: string;
    };
    notifyWays: string[];
    repeatInterval: '不重复' | '重复告警';
    effectivePeriod: '自定义' | '永久' | '联动【加班登记单】实际作业时段';
    status: '启用' | '禁用';
  };
}

export interface AlarmRuleItem {
  id: number;
  name: string;
  type: string;
  level: '低' | '中' | '高';
  notify: '是' | '否';
  period: string;
  status: '启用' | '禁用';
  currentVersion: string; // 当前最新版本号，如 'V1'、'V2'
  versions: AlarmRuleVersion[]; // 历史版本列表，首个元素为最新版本
  modifiedAt: string;
  createdAt: string;
  // 当前版本激活属性
  areaConditions: Array<{ type: string; relation: string; target: string }>;
  personConditions: Array<{ scope: string; relation: string; target: string }>;
  conditionType: string;
  conditionOperator: string;
  conditionValue: number;
  notifyTargets: {
    low: string;
    lowCountdown: string;
    mid: string;
    midCountdown: string;
    high: string;
  };
  notifyWays: string[];
  repeatInterval: '不重复' | '重复告警';
  effectivePeriod: '自定义' | '永久' | '联动【加班登记单】实际作业时段';
}

// 告警策略类型标准枚举选项（包含安全员脱岗告警等核心安监类别）
export const ALARM_POLICY_TYPES = [
  '人员进入',
  '气体告警',
  '安全帽脱落',
  '厂区吸烟',
  '厂区玩手机',
  '异常停留',
  '烟感告警',
  '安全员脱岗告警'
] as const;

export type AlarmPolicyType = typeof ALARM_POLICY_TYPES[number];

// 区域范围标准枚举选项（严格规范为 3 大空间范围类）
export const ALARM_AREA_TYPES = [
  '作业面',
  '有限空间',
  '电子围栏'
] as const;

export type AlarmAreaType = typeof ALARM_AREA_TYPES[number];

// 辅助函数：生成版本号 V{number}，例如 V1、V2、V3
export function generateVersionId(versionNumber: number): string {
  return `V${versionNumber}`;
}

// 辅助函数：格式化时间 YYYY-MM-DD HH:mm:ss
export function formatDateTime(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 初始模拟告警策略数据（严格对齐 7 大策略类型与 3 大空间范围，带规范版本号）
export const INITIAL_ALARM_RULES: AlarmRuleItem[] = [
  {
    id: 1,
    name: '1号船台密闭舱气体浓度多级告警',
    type: '气体告警',
    level: '高',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V2',
    modifiedAt: '2026-08-25 14:20:10',
    createdAt: '2026-08-21 19:23:21',
    areaConditions: [
      { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' },
      { type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' }
    ],
    personConditions: [
      { scope: '工种类别', relation: '是', target: '焊接工' },
      { scope: '工种类别', relation: '是', target: '装配钳工' }
    ],
    conditionType: '可燃气体超标浓度',
    conditionOperator: '大于',
    conditionValue: 15,
    notifyTargets: {
      low: '当班区域安全员',
      lowCountdown: '3分钟',
      mid: '车间安全主任',
      midCountdown: '5分钟',
      high: '厂级安全总监与应急指挥中心'
    },
    notifyWays: ['声光报警通知', '发送短信通知'],
    repeatInterval: '重复告警',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V2',
        versionNumber: 2,
        dateStr: '20260825',
        createdAt: '2026-08-25 14:20:10',
        modifier: '系统管理员',
        changeNotes: '升级告警通知链，增加短信报警并缩短中级升级倒计时至5分钟',
        snapshot: {
          name: '1号船台密闭舱气体浓度多级告警',
          type: '气体告警',
          level: '高',
          areaConditions: [
            { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' },
            { type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' }
          ],
          personConditions: [
            { scope: '工种类别', relation: '是', target: '焊接工' },
            { scope: '工种类别', relation: '是', target: '装配钳工' }
          ],
          conditionType: '可燃气体超标浓度',
          conditionOperator: '大于',
          conditionValue: 15,
          notifyTargets: {
            low: '当班区域安全员',
            lowCountdown: '3分钟',
            mid: '车间安全主任',
            midCountdown: '5分钟',
            high: '厂级安全总监与应急指挥中心'
          },
          notifyWays: ['声光报警通知', '发送短信通知'],
          repeatInterval: '重复告警',
          effectivePeriod: '永久',
          status: '启用'
        }
      },
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260821',
        createdAt: '2026-08-21 19:23:21',
        modifier: '安全工程师-林峰',
        changeNotes: '初始创建1号船台液货舱气体浓度基础监测策略',
        snapshot: {
          name: '1号船台密闭舱气体浓度监测策略 (初始)',
          type: '气体告警',
          level: '中',
          areaConditions: [
            { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' }
          ],
          personConditions: [
            { scope: '工种类别', relation: '是', target: '全体施工人员' }
          ],
          conditionType: '可燃气体超标浓度',
          conditionOperator: '大于',
          conditionValue: 20,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '5分钟',
            mid: '当班区域安全员',
            midCountdown: '10分钟',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 2,
    name: '全厂区作业面安全帽脱落智能识别策略',
    type: '安全帽脱落',
    level: '中',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V1',
    modifiedAt: '2026-08-21 21:44:13',
    createdAt: '2026-08-21 19:21:25',
    areaConditions: [
      { type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' },
      { type: '电子围栏', relation: '是', target: '800T龙门吊运行警戒区围栏' }
    ],
    personConditions: [
      { scope: '全厂工人', relation: '是', target: '全体施工人员' }
    ],
    conditionType: '未戴安全帽持续帧数',
    conditionOperator: '大于',
    conditionValue: 3,
    notifyTargets: {
      low: '现场施工班组长',
      lowCountdown: '2分钟',
      mid: '当班区域安全员',
      midCountdown: '',
      high: ''
    },
    notifyWays: ['声光报警通知'],
    repeatInterval: '不重复',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260821',
        createdAt: '2026-08-21 19:21:25',
        modifier: '系统管理员',
        changeNotes: '初始创建全厂区作业面安全帽AI视觉+定位穿戴违规检测全局策略',
        snapshot: {
          name: '全厂区作业面安全帽脱落智能识别策略',
          type: '安全帽脱落',
          level: '中',
          areaConditions: [
            { type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' },
            { type: '电子围栏', relation: '是', target: '800T龙门吊运行警戒区围栏' }
          ],
          personConditions: [
            { scope: '全厂工人', relation: '是', target: '全体施工人员' }
          ],
          conditionType: '未戴安全帽持续帧数',
          conditionOperator: '大于',
          conditionValue: 3,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '2分钟',
            mid: '当班区域安全员',
            midCountdown: '',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 3,
    name: '2号码头重型龙门吊防侵入人员进入告警',
    type: '人员进入',
    level: '高',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V3',
    modifiedAt: '2026-08-27 16:35:12',
    createdAt: '2026-08-18 18:18:12',
    areaConditions: [
      { type: '电子围栏', relation: '是', target: '重件吊装坠落警戒围栏' },
      { type: '作业面', relation: '是', target: '舾装码头高空作业面' }
    ],
    personConditions: [
      { scope: '指定人员', relation: '否', target: '起重工' }
    ],
    conditionType: '无进出许可进入',
    conditionOperator: '存在',
    conditionValue: 1,
    notifyTargets: {
      low: '现场施工班组长',
      lowCountdown: '1分钟',
      mid: '车间安全主任',
      midCountdown: '3分钟',
      high: '厂级安全总监与应急指挥中心'
    },
    notifyWays: ['声光报警通知', '发送短信通知'],
    repeatInterval: '重复告警',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V3',
        versionNumber: 3,
        dateStr: '20260827',
        createdAt: '2026-08-27 16:35:12',
        modifier: '安全总监-赵志刚',
        changeNotes: '将起重指挥作业区电子围栏警戒精度提升至分米级，并接入高分贝声光警报',
        snapshot: {
          name: '2号码头重型龙门吊立体防侵入警戒',
          type: '人员进入',
          level: '高',
          areaConditions: [
            { type: '电子围栏', relation: '是', target: '重件吊装坠落警戒围栏' }
          ],
          personConditions: [
            { scope: '指定人员', relation: '否', target: '起重工' }
          ],
          conditionType: '无进出许可进入',
          conditionOperator: '存在',
          conditionValue: 1,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '1分钟',
            mid: '车间安全主任',
            midCountdown: '3分钟',
            high: '厂级安全总监与应急指挥中心'
          },
          notifyWays: ['声光报警通知', '发送短信通知'],
          repeatInterval: '重复告警',
          effectivePeriod: '永久',
          status: '启用'
        }
      },
      {
        versionId: 'V2',
        versionNumber: 2,
        dateStr: '20260823',
        createdAt: '2026-08-23 10:12:00',
        modifier: '安全工程师-林峰',
        changeNotes: '增加起重工白名单豁免权限',
        snapshot: {
          name: '2号码头重型龙门吊立体防侵入警戒 (V2)',
          type: '人员进入',
          level: '高',
          areaConditions: [{ type: '电子围栏', relation: '是', target: '重件吊装坠落警戒围栏' }],
          personConditions: [{ scope: '指定人员', relation: '否', target: '起重工' }],
          conditionType: '无进出许可进入',
          conditionOperator: '存在',
          conditionValue: 1,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '2分钟',
            mid: '车间安全主任',
            midCountdown: '5分钟',
            high: '厂级安全总监与应急指挥中心'
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '重复告警',
          effectivePeriod: '永久',
          status: '启用'
        }
      },
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260818',
        createdAt: '2026-08-18 18:18:12',
        modifier: '系统管理员',
        changeNotes: '初始创建吊装警戒区规则',
        snapshot: {
          name: '2号码头吊装警戒基础策略',
          type: '人员进入',
          level: '中',
          areaConditions: [{ type: '电子围栏', relation: '是', target: '重件吊装坠落警戒围栏' }],
          personConditions: [{ scope: '全厂工人', relation: '是', target: '全体施工人员' }],
          conditionType: '无进出许可进入',
          conditionOperator: '存在',
          conditionValue: 1,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '5分钟',
            mid: '当班区域安全员',
            midCountdown: '',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 4,
    name: '密闭舱室作业人员异常停留超时预警',
    type: '异常停留',
    level: '高',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V1',
    modifiedAt: '2026-08-21 21:44:47',
    createdAt: '2026-08-21 18:06:29',
    areaConditions: [
      { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' },
      { type: '有限空间', relation: '是', target: '2#双层底压载水舱' }
    ],
    personConditions: [
      { scope: '全厂工人', relation: '是', target: '全体施工人员' }
    ],
    conditionType: '静止不活动时长',
    conditionOperator: '大于',
    conditionValue: 10,
    notifyTargets: {
      low: '当班区域安全员',
      lowCountdown: '2分钟',
      mid: '车间安全主任',
      midCountdown: '3分钟',
      high: '厂级安全总监与应急指挥中心'
    },
    notifyWays: ['声光报警通知', '发送短信通知'],
    repeatInterval: '重复告警',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260821',
        createdAt: '2026-08-21 18:06:29',
        modifier: '系统管理员',
        changeNotes: '初始创建密闭舱作业人员跌落/昏迷生命体征及静止时长保护策略',
        snapshot: {
          name: '密闭舱室作业人员静止不活动超时预警',
          type: '异常停留',
          level: '高',
          areaConditions: [
            { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' },
            { type: '有限空间', relation: '是', target: '2#双层底压载水舱' }
          ],
          personConditions: [
            { scope: '全厂工人', relation: '是', target: '全体施工人员' }
          ],
          conditionType: '静止不活动时长',
          conditionOperator: '大于',
          conditionValue: 10,
          notifyTargets: {
            low: '当班区域安全员',
            lowCountdown: '2分钟',
            mid: '车间安全主任',
            midCountdown: '3分钟',
            high: '厂级安全总监与应急指挥中心'
          },
          notifyWays: ['声光报警通知', '发送短信通知'],
          repeatInterval: '重复告警',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 5,
    name: '30万吨VLCC机舱管路有限空间异常停留',
    type: '异常停留',
    level: '中',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V2',
    modifiedAt: '2026-08-26 09:15:40',
    createdAt: '2026-08-21 17:48:20',
    areaConditions: [
      { type: '有限空间', relation: '是', target: '机舱管路狭窄舱室' }
    ],
    personConditions: [
      { scope: '工种类别', relation: '是', target: '外包施工人员' }
    ],
    conditionType: '滞留超时时长',
    conditionOperator: '大于',
    conditionValue: 120,
    notifyTargets: {
      low: '现场施工班组长',
      lowCountdown: '10分钟',
      mid: '造船项目副经理',
      midCountdown: '',
      high: ''
    },
    notifyWays: ['声光报警通知'],
    repeatInterval: '不重复',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V2',
        versionNumber: 2,
        dateStr: '20260826',
        createdAt: '2026-08-26 09:15:40',
        modifier: '项目专员-钱伟',
        changeNotes: '调整外包工机舱连续作业时长上限为120分钟',
        snapshot: {
          name: '30万吨VLCC机舱管路有限空间异常停留',
          type: '异常停留',
          level: '中',
          areaConditions: [{ type: '有限空间', relation: '是', target: '机舱管路狭窄舱室' }],
          personConditions: [{ scope: '工种类别', relation: '是', target: '外包施工人员' }],
          conditionType: '滞留超时时长',
          conditionOperator: '大于',
          conditionValue: 120,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '10分钟',
            mid: '造船项目副经理',
            midCountdown: '',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      },
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260821',
        createdAt: '2026-08-21 17:48:20',
        modifier: '系统管理员',
        changeNotes: '初始配置机舱管路区受限空间作业时长规则',
        snapshot: {
          name: '30万吨VLCC机舱有限空间停留管理 (初始)',
          type: '异常停留',
          level: '低',
          areaConditions: [{ type: '有限空间', relation: '是', target: '机舱管路狭窄舱室' }],
          personConditions: [{ scope: '工种类别', relation: '是', target: '全体施工人员' }],
          conditionType: '滞留超时时长',
          conditionOperator: '大于',
          conditionValue: 180,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '15分钟',
            mid: '',
            midCountdown: '',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 6,
    name: '作业车间生产作业玩手机违章AI视觉识别',
    type: '厂区玩手机',
    level: '低',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V1',
    modifiedAt: '2026-08-21 21:45:40',
    createdAt: '2026-08-21 15:18:11',
    areaConditions: [
      { type: '作业面', relation: '是', target: '总装车间胎架作业面' },
      { type: '电子围栏', relation: '是', target: '800T龙门吊运行警戒区围栏' }
    ],
    personConditions: [
      { scope: '全厂工人', relation: '是', target: '全体施工人员' }
    ],
    conditionType: '滞留超时时长',
    conditionOperator: '大于',
    conditionValue: 2,
    notifyTargets: {
      low: '现场施工班组长',
      lowCountdown: '',
      mid: '',
      midCountdown: '',
      high: ''
    },
    notifyWays: ['声光报警通知'],
    repeatInterval: '不重复',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260821',
        createdAt: '2026-08-21 15:18:11',
        modifier: '系统管理员',
        changeNotes: '初始配置车间作业人员玩手机违章AI视觉识别规则',
        snapshot: {
          name: '作业车间生产作业玩手机违章AI视觉识别',
          type: '厂区玩手机',
          level: '低',
          areaConditions: [
            { type: '作业面', relation: '是', target: '总装车间胎架作业面' },
            { type: '电子围栏', relation: '是', target: '800T龙门吊运行警戒区围栏' }
          ],
          personConditions: [
            { scope: '全厂工人', relation: '是', target: '全体施工人员' }
          ],
          conditionType: '滞留超时时长',
          conditionOperator: '大于',
          conditionValue: 2,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '',
            mid: '',
            midCountdown: '',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 7,
    name: '涂装分段车间易燃易爆区域烟感告警策略',
    type: '烟感告警',
    level: '高',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V1',
    modifiedAt: '2026-08-29 11:20:00',
    createdAt: '2026-08-29 11:20:00',
    areaConditions: [
      { type: '电子围栏', relation: '是', target: '易燃易爆品仓库防爆围栏' },
      { type: '有限空间', relation: '是', target: '特种涂层作业舱' }
    ],
    personConditions: [
      { scope: '全厂工人', relation: '是', target: '全体施工人员' }
    ],
    conditionType: '烟雾浓度与感温响应值',
    conditionOperator: '大于',
    conditionValue: 10,
    notifyTargets: {
      low: '当班区域安全员',
      lowCountdown: '1分钟',
      mid: '车间安全主任',
      midCountdown: '3分钟',
      high: '厂级安全总监与应急指挥中心'
    },
    notifyWays: ['声光报警通知', '发送短信通知'],
    repeatInterval: '重复告警',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260829',
        createdAt: '2026-08-29 11:20:00',
        modifier: '系统管理员',
        changeNotes: '初始配置涂装车间高灵敏度防爆烟感红外预警策略',
        snapshot: {
          name: '涂装分段车间易燃易爆区域烟感告警策略',
          type: '烟感告警',
          level: '高',
          areaConditions: [
            { type: '电子围栏', relation: '是', target: '易燃易爆品仓库防爆围栏' },
            { type: '有限空间', relation: '是', target: '特种涂层作业舱' }
          ],
          personConditions: [
            { scope: '全厂工人', relation: '是', target: '全体施工人员' }
          ],
          conditionType: '烟雾浓度与感温响应值',
          conditionOperator: '大于',
          conditionValue: 10,
          notifyTargets: {
            low: '当班区域安全员',
            lowCountdown: '1分钟',
            mid: '车间安全主任',
            midCountdown: '3分钟',
            high: '厂级安全总监与应急指挥中心'
          },
          notifyWays: ['声光报警通知', '发送短信通知'],
          repeatInterval: '重复告警',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 8,
    name: '船坞船台禁火区域人员厂区吸烟违章识别',
    type: '厂区吸烟',
    level: '高',
    notify: '是',
    period: '永久',
    status: '启用',
    currentVersion: 'V1',
    modifiedAt: '2026-08-30 14:00:00',
    createdAt: '2026-08-30 14:00:00',
    areaConditions: [
      { type: '电子围栏', relation: '是', target: '易燃易爆品仓库防爆围栏' },
      { type: '作业面', relation: '是', target: '船体外板涂装作业面' }
    ],
    personConditions: [
      { scope: '全厂工人', relation: '是', target: '全体施工人员' }
    ],
    conditionType: '明火与吸烟AI判定',
    conditionOperator: '大于',
    conditionValue: 0,
    notifyTargets: {
      low: '当班区域安全员',
      lowCountdown: '2分钟',
      mid: '车间安全主任',
      midCountdown: '',
      high: ''
    },
    notifyWays: ['声光报警通知'],
    repeatInterval: '不重复',
    effectivePeriod: '永久',
    versions: [
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260830',
        createdAt: '2026-08-30 14:00:00',
        modifier: '安全主管-张明',
        changeNotes: '初始创建禁烟重点防爆区域吸烟行为AI识别策略',
        snapshot: {
          name: '船坞船台禁火区域人员厂区吸烟违章识别',
          type: '厂区吸烟',
          level: '高',
          areaConditions: [
            { type: '电子围栏', relation: '是', target: '易燃易爆品仓库防爆围栏' },
            { type: '作业面', relation: '是', target: '船体外板涂装作业面' }
          ],
          personConditions: [
            { scope: '全厂工人', relation: '是', target: '全体施工人员' }
          ],
          conditionType: '明火与吸烟AI判定',
          conditionOperator: '大于',
          conditionValue: 0,
          notifyTargets: {
            low: '当班区域安全员',
            lowCountdown: '2分钟',
            mid: '车间安全主任',
            midCountdown: '',
            high: ''
          },
          notifyWays: ['声光报警通知'],
          repeatInterval: '不重复',
          effectivePeriod: '永久',
          status: '启用'
        }
      }
    ]
  },
  {
    id: 9,
    name: '重点施工作业面安全员脱岗告警',
    type: '安全员脱岗告警',
    level: '高',
    notify: '是',
    period: '联动【加班登记单】实际作业时段',
    status: '启用',
    currentVersion: 'V1',
    modifiedAt: '2026-08-31 09:30:00',
    createdAt: '2026-08-31 09:30:00',
    areaConditions: [
      { type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' },
      { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' }
    ],
    personConditions: [
      { scope: '指定人员', relation: '是', target: '现场当班专职安全员' }
    ],
    conditionType: '脱离指定监护区域时长',
    conditionOperator: '大于',
    conditionValue: 10,
    notifyTargets: {
      low: '现场施工班组长',
      lowCountdown: '2分钟',
      mid: '车间安全主任',
      midCountdown: '5分钟',
      high: '厂级安全总监与应急指挥中心'
    },
    notifyWays: ['声光报警通知', '发送短信通知'],
    repeatInterval: '重复告警',
    effectivePeriod: '联动【加班登记单】实际作业时段',
    versions: [
      {
        versionId: 'V1',
        versionNumber: 1,
        dateStr: '20260831',
        createdAt: '2026-08-31 09:30:00',
        modifier: '系统管理员',
        changeNotes: '初始配置高风险作业与加班期间安全员脱岗实时监测策略',
        snapshot: {
          name: '重点施工作业面安全员脱岗告警',
          type: '安全员脱岗告警',
          level: '高',
          areaConditions: [
            { type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' },
            { type: '有限空间', relation: '是', target: '1#液货舱密闭作业区' }
          ],
          personConditions: [
            { scope: '指定人员', relation: '是', target: '现场当班专职安全员' }
          ],
          conditionType: '脱离指定监护区域时长',
          conditionOperator: '大于',
          conditionValue: 10,
          notifyTargets: {
            low: '现场施工班组长',
            lowCountdown: '2分钟',
            mid: '车间安全主任',
            midCountdown: '5分钟',
            high: '厂级安全总监与应急指挥中心'
          },
          notifyWays: ['声光报警通知', '发送短信通知'],
          repeatInterval: '重复告警',
          effectivePeriod: '联动【加班登记单】实际作业时段',
          status: '启用'
        }
      }
    ]
  }
];
