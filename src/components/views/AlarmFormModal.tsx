import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Check, 
  AlertTriangle, 
  GitBranch, 
  BellRing,
  Ship,
  Layers,
  CheckSquare,
  Square,
  Users,
  Sliders,
  MapPin,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { AlarmRuleItem, AlarmRuleVersion, generateVersionId, formatDateTime, ALARM_POLICY_TYPES } from '@/src/data/alarmData';
import { MOCK_PROJECTS } from '@/src/data/mockProjects';

// 厂区作业面基础列表（支持多选与批量配置）
export const YARD_WORKFACES = [
  '1号船台搭载作业面 (185段)',
  '2号船台合拢作业面 (517段)',
  '3号大型船坞总装作业面',
  '4号坞内外板涂装作业面',
  '船体分段总装胎架作业面',
  '舾装码头1号码头系泊调试面',
  '舾装码头2号码头起重吊装面',
  '综合管系预制车间作业面',
  '钢材下料与切割作业面',
  '模块总组平台作业面'
];

// 船厂标准工种字典（满足人员范围只按工种过滤）
export const SHIPYARD_WORK_TYPES = [
  '电焊工',
  '气割工',
  '装配钳工',
  '起重挂钩工',
  '打砂除锈工',
  '船体涂装工',
  '脚手架工',
  '管系安装工',
  '射线探伤检测员',
  '专职安全员/监护人',
  '船舶电工',
  '吊车司机',
  '外包特种作业人员'
];

// 船厂标准作业班组字典（满足人员范围只按班组过滤）
export const SHIPYARD_WORK_TEAMS = [
  '船体分段电焊一班',
  '船体合拢焊装二班',
  '船坞搭载装配班',
  '涂装防腐除锈一班',
  '轮机动力管系班',
  '甲板舾装综合班',
  '船舶电气工程班',
  '现场安全巡查监护组',
  '外包工程协力一组',
  '外包工程协力二组'
];

// 厂区电子围栏
export const YARD_ELECTRONIC_FENCES = [
  '800T龙门吊运行警戒区围栏',
  '重件吊装坠落警戒围栏',
  '易燃易爆品仓库防爆围栏',
  '高压试验变电警戒围栏',
  '码头临水防跌落围栏',
  '分段转运通行红线围栏'
];

// 主基站设备列表
export const YARD_BASE_STATIONS = [
  '1号码头主基站 (BS-01)',
  '2号船坞顶角基站 (BS-02)',
  '总装车间高跨基站 (BS-03)',
  '3号船台塔吊主基站 (BS-04)',
  '舾装码头浮吊基站 (BS-05)'
];

// 气体探测器列表
export const YARD_GAS_DETECTORS = [
  '1号船台移动式多合一气体检测仪-G01',
  'LNG液货舱固定式防爆可燃气探测器-G02',
  '涂装车间VOCs有机废气传感器-G03',
  '机舱轴隧硫化氢/一氧化碳传感器-G04',
  '双层底密闭舱氧气监测探头-G05'
];

// 烟雾报警器列表
export const YARD_SMOKE_DETECTORS = [
  '1号船台光电感烟探测器-S01',
  '涂装车间防爆感温感烟探测器-S02',
  '危险化学品仓库吸顶式感烟火警装置-S03',
  '机舱配电室极早期烟雾吸气系统-S04',
  '总装车间红外光束感烟火灾探测器-S05'
];

// 摄像头列表
export const YARD_AI_CAMERAS = [
  '船坞高点360度AI智能球机-CAM01',
  '1号船台搭载面全景AI枪机-CAM02',
  '总装车间安全帽检测抓拍机-CAM03',
  '舾装码头登船通道着装识别机-CAM04',
  '危险品库防爆防烟AI摄像机-CAM05',
  '主干道吸烟与玩手机识别抓拍机-CAM06'
];

// 区域与策略类型动态联动接口
export interface AreaOptionConfig {
  areaType: string;
  targets: string[];
}

/**
 * 策略类型对应区域选项动态联动数据字典
 * 规则 1：只有第二种类型告警（人员行为与定位管控类）才有厂区作业面、有限空间、电子围栏告警这些区域范围选择
 * 规则 2：去掉船舶机舱动力区相关的区域范围选项
 * 规则 3：智能标签状态类不需要选择区域范围（配置为空数组）
 */
export const POLICY_TYPE_AREA_MAP: Record<string, AreaOptionConfig[]> = {
  // 1. 环境感知与安防类：仅对应专属感知设备
  '气体告警': [
    { areaType: '气体探测器', targets: YARD_GAS_DETECTORS }
  ],
  '烟感告警': [
    { areaType: '烟雾报警器', targets: YARD_SMOKE_DETECTORS }
  ],
  '烟雾告警': [
    { areaType: '烟雾报警器', targets: YARD_SMOKE_DETECTORS }
  ],

  // 2. 人员行为与定位管控类
  '人员禁入': [
    { areaType: '电子围栏', targets: YARD_ELECTRONIC_FENCES },
    { areaType: '作业面', targets: YARD_WORKFACES },
    { areaType: '有限空间', targets: MOCK_PROJECTS.map(p => p.name) },
    { areaType: '主基站', targets: YARD_BASE_STATIONS }
  ],
  '人数超员': [
    { areaType: '作业面', targets: YARD_WORKFACES },
    { areaType: '有限空间', targets: MOCK_PROJECTS.map(p => p.name) },
    { areaType: '电子围栏', targets: YARD_ELECTRONIC_FENCES }
  ],
  '安全员/监护人脱岗': [
    { areaType: '有限空间', targets: MOCK_PROJECTS.map(p => p.name) }
  ],
  '安全员脱岗告警': [
    { areaType: '有限空间', targets: MOCK_PROJECTS.map(p => p.name) }
  ],
  '连续长时间工作/异常停留': [
    { areaType: '有限空间', targets: MOCK_PROJECTS.map(p => p.name) }
  ],
  '异常停留': [
    { areaType: '有限空间', targets: MOCK_PROJECTS.map(p => p.name) }
  ],

  // 3. 智能标签状态类：明确不需要选择区域范围（空数组，界面不渲染区域选择项）
  '标签脱落告警': [],
  '标签低电告警': [],
  '标签离线告警': [],

  // 4. AI 智能视觉分析类：仅对应AI抓拍摄像头
  '安全帽配戴': [
    { areaType: '摄像头', targets: YARD_AI_CAMERAS }
  ],
  '安全帽脱落': [
    { areaType: '摄像头', targets: YARD_AI_CAMERAS }
  ],
  '厂区吸烟': [
    { areaType: '摄像头', targets: YARD_AI_CAMERAS }
  ],
  '厂区玩手机': [
    { areaType: '摄像头', targets: YARD_AI_CAMERAS }
  ]
};

// 策略条件联动规则配置接口
export interface PolicyConditionConfig {
  conditionTypes: string[];
  operators: string[];
  defaultValue: number;
  unit: string;
  helpText: string;
  isTimeRangeOnly?: boolean;
}

// 策略条件动态联动字典
export const POLICY_CONDITION_CONFIGS: Record<string, PolicyConditionConfig> = {
  '气体告警': {
    conditionTypes: [],
    operators: [],
    defaultValue: 0,
    unit: '',
    helpText: '由气体探测器设备自身浓度阈值自动触发告警，无需额外设置策略条件'
  },
  '烟感告警': {
    conditionTypes: [],
    operators: [],
    defaultValue: 0,
    unit: '',
    helpText: '由烟雾报警器设备自身火情探测阈值自动触发告警，无需额外设置策略条件'
  },
  '烟雾告警': {
    conditionTypes: [],
    operators: [],
    defaultValue: 0,
    unit: '',
    helpText: '由烟雾报警器设备自身火情探测阈值自动触发告警，无需额外设置策略条件'
  },
  '人员禁入': {
    conditionTypes: ['告警时段'],
    operators: ['处于时段'],
    defaultValue: 1,
    unit: '时段',
    isTimeRangeOnly: true,
    helpText: '电子围栏、有限空间、作业面及主基站区域均按所设告警时段触发人员禁入告警'
  },
  '人数超员': {
    conditionTypes: ['持续时长'],
    operators: ['大于等于', '大于'],
    defaultValue: 5,
    unit: '分钟',
    helpText: '超出区域核定人数并持续达到设定时长后触发超员告警'
  },
  '安全员/监护人脱岗': {
    conditionTypes: ['脱岗离岗时长'],
    operators: ['大于等于', '大于'],
    defaultValue: 10,
    unit: '分钟',
    helpText: '有限空间作业期间，作业票关联的安全监护人员离开监护范围超过设定脱岗离岗时长'
  },
  '安全员脱岗告警': {
    conditionTypes: ['脱岗离岗时长'],
    operators: ['大于等于', '大于'],
    defaultValue: 10,
    unit: '分钟',
    helpText: '有限空间作业期间，作业票关联的安全监护人员离开监护范围超过设定脱岗离岗时长'
  },
  '连续长时间工作/异常停留': {
    conditionTypes: ['同一区域停留时长', '静止不活动时长(晕厥/受困预警)'],
    operators: ['大于等于', '大于'],
    defaultValue: 120,
    unit: '分钟',
    helpText: '有限空间内作业票关联人员滞留超时，或定位标签无位移可能发生意外'
  },
  '异常停留': {
    conditionTypes: ['同一区域停留时长', '静止不活动时长(晕厥/受困预警)'],
    operators: ['大于等于', '大于'],
    defaultValue: 120,
    unit: '分钟',
    helpText: '有限空间内作业票关联人员滞留超时，或定位标签无位移可能发生意外'
  },
  '标签脱落告警': {
    conditionTypes: [],
    operators: [],
    defaultValue: 0,
    unit: '',
    helpText: '标签防拆触点弹开即触发告警，无需设置人员范围及策略条件'
  },
  '标签低电告警': {
    conditionTypes: [],
    operators: [],
    defaultValue: 0,
    unit: '',
    helpText: '标签电量低于系统安全阈值即触发告警，无需设置人员范围及策略条件'
  },
  '标签离线告警': {
    conditionTypes: ['连接失联时长'],
    operators: ['大于等于', '大于'],
    defaultValue: 2,
    unit: '小时',
    helpText: '基站连续未收到标签心跳信号达到设定失联时长(小时)后触发告警'
  },
  '安全帽配戴': {
    conditionTypes: ['未配戴安全帽违规检测数', '未戴安全帽持续帧数'],
    operators: ['大于等于', '大于'],
    defaultValue: 1,
    unit: '个',
    helpText: 'AI视觉摄像头在受控区域内识别到未按规定配戴安全帽行为'
  },
  '安全帽脱落': {
    conditionTypes: ['未配戴安全帽违规检测数', '未戴安全帽持续帧数'],
    operators: ['大于等于', '大于'],
    defaultValue: 1,
    unit: '个',
    helpText: 'AI视觉摄像头在受控区域内识别到未按规定配戴安全帽行为'
  },
  '厂区吸烟': {
    conditionTypes: ['吸烟违规行为识别数', '吸烟持续识别次数'],
    operators: ['大于等于', '大于'],
    defaultValue: 1,
    unit: '次',
    helpText: 'AI视觉算法在禁烟区、涂装车间或船舶作业面识别到吸烟点火行为'
  },
  '厂区玩手机': {
    conditionTypes: ['低头玩手机持续时长', '违规玩手机识别次数'],
    operators: ['大于等于', '大于'],
    defaultValue: 2,
    unit: '分钟',
    helpText: 'AI视觉算法识别在临边、吊装警戒区或高危作业面玩手机行为'
  }
};

// 历史兼容类型归一化映射（含已删除的“人员进入”迁移至“人员禁入”）
const POLICY_TYPE_ALIAS_MAP: Record<string, string> = {
  '人员进入': '人员禁入',
  '烟雾告警': '烟感告警',
  '安全员脱岗告警': '安全员/监护人脱岗',
  '异常停留': '连续长时间工作/异常停留',
  '安全帽脱落': '安全帽配戴'
};

// 获取今天的日期字符串 YYYYMMDD
export function getTodayDateStr(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

// 策略单条条件项定义（支持多条件组合与告警时段）
export interface PolicyConditionItem {
  id: string;
  type: string;
  operator: string;
  value: number;
  unit: string;
  timeStart?: string;
  timeEnd?: string;
}

interface AlarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rule: AlarmRuleItem, isEdit: boolean) => void;
  editRule?: AlarmRuleItem | null;
}

export function AlarmFormModal({ isOpen, onClose, onSubmit, editRule }: AlarmFormModalProps) {
  const isEdit = Boolean(editRule);

  // 表单字段状态
  const [name, setName] = useState('');
  const [type, setType] = useState('人员禁入');
  
  // 区域范围条件列表 (支持多条件组合，作业面多选、船舶建造项目多选)
  const [areaConditions, setAreaConditions] = useState<Array<{
    type: string;
    relation: string;
    target: string;
    scopeMode?: 'all' | 'custom';
    selectedTargets?: string[];
    selectedProjectIds?: string[]; // 有限空间时多选的船舶项目ID列表
  }>>([
    { type: '电子围栏', relation: '是', target: YARD_ELECTRONIC_FENCES[0] }
  ]);

  // 人员范围条件列表 (严格限定：只对应工种或班组，选择是或不是两种范围，每种类型只能添加一次)
  const [personConditions, setPersonConditions] = useState<Array<{
    scope: '工种类别' | '作业班组';
    relation: '是' | '不是';
    target: string;
  }>>([
    { scope: '工种类别', relation: '是', target: SHIPYARD_WORK_TYPES[0] }
  ]);

  // 策略条件列表 (支持多条件组合，每种条件类型只能被添加一次)
  const [policyConditions, setPolicyConditions] = useState<PolicyConditionItem[]>([
    {
      id: 'cond-1',
      type: '告警时段',
      operator: '00:00 ~ 23:59',
      value: 1,
      unit: '时段',
      timeStart: '00:00',
      timeEnd: '23:59'
    }
  ]);

  // 通知人员配置
  const [lowTarget, setLowTarget] = useState('');
  const [lowCountdown, setLowCountdown] = useState('');
  const [lowUnit, setLowUnit] = useState('分钟');

  const [midTarget, setMidTarget] = useState('');
  const [midCountdown, setMidCountdown] = useState('');
  const [midUnit, setMidUnit] = useState('分钟');

  const [highTarget, setHighTarget] = useState('');

  // 通知方式与周期
  const [notifySoundLight, setNotifySoundLight] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [alarmInterval, setAlarmInterval] = useState<'不重复' | '重复告警'>('不重复');
  const [effectivePeriod, setEffectivePeriod] = useState<'自定义' | '永久' | '联动【加班登记单】实际作业时段'>('永久');
  const [status, setStatus] = useState<'启用' | '禁用'>('启用');

  // 编辑模式特有：变更说明
  const [changeNotes, setChangeNotes] = useState('');
  // 错误提示
  const [errorMsg, setErrorMsg] = useState('');

  // 预估新版本号计算
  const getNextVersionNumber = () => {
    if (!editRule || !editRule.versions || editRule.versions.length === 0) return 1;
    const maxNum = Math.max(...editRule.versions.map(v => v.versionNumber || 1));
    return maxNum + 1;
  };

  const nextVersionId = isEdit 
    ? generateVersionId(getNextVersionNumber()) 
    : generateVersionId(1);

  // 获取当前策略类型对应的条件配置项
  const getCurrentPolicyConditionConfig = (policyType: string): PolicyConditionConfig => {
    return POLICY_CONDITION_CONFIGS[policyType] || {
      conditionTypes: ['触发次数', '持续时长(分钟)'],
      operators: ['大于等于', '大于', '等于'],
      defaultValue: 1,
      unit: '次',
      helpText: '当达到设定安全判定阈值时触发报警'
    };
  };

  // 当前策略类型支持的可用区域类型配置
  const availableAreaConfigs = POLICY_TYPE_AREA_MAP[type] || [];
  // 是否为不需要选择区域范围的策略类型（例如智能标签状态类）
  const isNoAreaNeeded = availableAreaConfigs.length === 0;
  // 动态控制人员范围与策略条件显隐及作业票联动规则
  const isEnvSensorType = ['气体告警', '烟感告警', '烟雾告警'].includes(type);
  const isGuardianOffType = ['安全员/监护人脱岗', '安全员脱岗告警'].includes(type);
  const isOverstayType = ['连续长时间工作/异常停留', '异常停留'].includes(type);
  const isWorkPermitLinkedPerson = isGuardianOffType || isOverstayType;
  const isTagStatusType = ['标签脱落告警', '标签低电告警', '标签离线告警'].includes(type);
  const isPersonScopeHidden = isEnvSensorType || type === '人数超员' || isTagStatusType;
  const isPolicyConditionHidden = isEnvSensorType || type === '标签脱落告警' || type === '标签低电告警';

  // 当 editRule 发生变化时，回填表单
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (editRule) {
        // 编辑模式回填
        setName(editRule.name || '');
        const rawType = editRule.type || '人员禁入';
        const currentType = POLICY_TYPE_ALIAS_MAP[rawType] || rawType;
        setType(currentType);
        
        // 区域范围回填
        const validAreaCfgs = POLICY_TYPE_AREA_MAP[currentType] || [];
        if (validAreaCfgs.length === 0) {
          // 智能标签类，无需区域范围
          setAreaConditions([]);
        } else if (editRule.areaConditions && editRule.areaConditions.length > 0) {
          const parsed = editRule.areaConditions
            .filter(c => validAreaCfgs.some(cfg => cfg.areaType === c.type))
            .map(c => {
              if (c.type === '作业面') {
                const isAll = (c.target || '').includes('全部') || (!c.selectedTargets || c.selectedTargets.length === 0);
                const extractedTargets = c.selectedTargets || (isAll ? [] : (c.target || '').split(/[、,，]/).map(s => s.trim()).filter(Boolean));
                return {
                  ...c,
                  scopeMode: isAll ? ('all' as const) : ('custom' as const),
                  selectedTargets: extractedTargets,
                  target: isAll ? '全部作业面' : (extractedTargets.length > 0 ? extractedTargets.join('、') : '全部作业面')
                };
              } else if (c.type === '有限空间') {
                let prjIds: string[] = [];
                if (c.selectedTargets && c.selectedTargets.length > 0) {
                  prjIds = c.selectedTargets.map(t => {
                    const found = MOCK_PROJECTS.find(p => p.name === t || p.id === t);
                    return found ? found.id : t;
                  });
                } else if (c.target) {
                  const matchedProjects = MOCK_PROJECTS.filter(p => c.target.includes(p.name));
                  prjIds = matchedProjects.map(p => p.id);
                }
                if (prjIds.length === 0) {
                  prjIds = [MOCK_PROJECTS[0].id];
                }
                const selectedNames = prjIds.map(id => MOCK_PROJECTS.find(p => p.id === id)?.name || id);
                return {
                  type: '有限空间',
                  relation: c.relation || '是',
                  selectedProjectIds: prjIds,
                  target: selectedNames.join('、')
                };
              }
              return { ...c };
            });

          if (parsed.length > 0) {
            setAreaConditions(parsed);
          } else {
            const firstCfg = validAreaCfgs[0];
            if (firstCfg.areaType === '有限空间') {
              setAreaConditions([{
                type: '有限空间',
                relation: '是',
                selectedProjectIds: [MOCK_PROJECTS[0].id],
                target: MOCK_PROJECTS[0].name
              }]);
            } else {
              setAreaConditions([{
                type: firstCfg.areaType,
                relation: '是',
                target: firstCfg.targets[0] || ''
              }]);
            }
          }
        } else {
          const firstCfg = validAreaCfgs[0];
          if (firstCfg.areaType === '有限空间') {
            setAreaConditions([{
              type: '有限空间',
              relation: '是',
              selectedProjectIds: [MOCK_PROJECTS[0].id],
              target: MOCK_PROJECTS[0].name
            }]);
          } else {
            setAreaConditions([{
              type: firstCfg.areaType,
              relation: '是',
              target: firstCfg.targets[0] || ''
            }]);
          }
        }

        // 人员范围回填：仅限工种类别或作业班组，是或不是
        if (editRule.personConditions && editRule.personConditions.length > 0) {
          const usedScopes = new Set<string>();
          const sanitizedPersons: Array<{ scope: '工种类别' | '作业班组'; relation: '是' | '不是'; target: string }> = [];

          editRule.personConditions.forEach(c => {
            if (c.scope === '作业票关联') return;
            const scopeVal: '工种类别' | '作业班组' = (c.scope === '作业班组') ? '作业班组' : '工种类别';
            if (!usedScopes.has(scopeVal)) {
              usedScopes.add(scopeVal);
              const relationVal: '是' | '不是' = (c.relation === '否' || c.relation === '不是') ? '不是' : '是';
              let targetVal = c.target || '';
              if (scopeVal === '工种类别' && !SHIPYARD_WORK_TYPES.includes(targetVal)) {
                targetVal = SHIPYARD_WORK_TYPES[0];
              } else if (scopeVal === '作业班组' && !SHIPYARD_WORK_TEAMS.includes(targetVal)) {
                targetVal = SHIPYARD_WORK_TEAMS[0];
              }
              sanitizedPersons.push({
                scope: scopeVal,
                relation: relationVal,
                target: targetVal
              });
            }
          });

          setPersonConditions(sanitizedPersons.length > 0 ? sanitizedPersons : [{
            scope: '工种类别',
            relation: '是',
            target: SHIPYARD_WORK_TYPES[0]
          }]);
        } else {
          setPersonConditions([{ scope: '工种类别', relation: '是', target: SHIPYARD_WORK_TYPES[0] }]);
        }

        // 策略条件回填
        const condConfig = getCurrentPolicyConditionConfig(currentType);
        if (condConfig.conditionTypes.length === 0) {
          setPolicyConditions([]);
        } else if (condConfig.isTimeRangeOnly) {
          const existing = editRule.policyConditions?.[0];
          setPolicyConditions([{
            id: 'cond-1',
            type: '告警时段',
            operator: existing?.operator && existing.operator.includes('~') ? existing.operator : '00:00 ~ 23:59',
            value: 1,
            unit: '时段',
            timeStart: existing?.timeStart || '00:00',
            timeEnd: existing?.timeEnd || '23:59'
          }]);
        } else if (editRule.policyConditions && editRule.policyConditions.length > 0) {
          const matched = editRule.policyConditions
            .filter(pc => condConfig.conditionTypes.includes(pc.type))
            .map((pc, idx) => ({
              id: `cond-${Date.now()}-${idx}`,
              type: pc.type,
              operator: condConfig.operators.includes(pc.operator) ? pc.operator : (condConfig.operators[0] || '大于等于'),
              value: pc.value ?? condConfig.defaultValue,
              unit: condConfig.unit || pc.unit || ''
            }));
          setPolicyConditions(matched.length > 0 ? matched : [{
            id: 'cond-1',
            type: condConfig.conditionTypes[0],
            operator: condConfig.operators[0] || '大于等于',
            value: condConfig.defaultValue,
            unit: condConfig.unit
          }]);
        } else {
          const validType = condConfig.conditionTypes.includes(editRule.conditionType)
            ? editRule.conditionType
            : condConfig.conditionTypes[0];
          const validOp = condConfig.operators.includes(editRule.conditionOperator)
            ? editRule.conditionOperator
            : (condConfig.operators[0] || '大于等于');
          setPolicyConditions([{
            id: 'cond-1',
            type: validType,
            operator: validOp,
            value: editRule.conditionValue ?? condConfig.defaultValue,
            unit: condConfig.unit
          }]);
        }

        // 通知配置
        const targets = editRule.notifyTargets || { low: '', lowCountdown: '', mid: '', midCountdown: '', high: '' };
        setLowTarget(targets.low || '');
        const lowCd = targets.lowCountdown || '';
        if (lowCd.includes('小时')) {
          setLowCountdown(lowCd.replace('小时', ''));
          setLowUnit('小时');
        } else {
          setLowCountdown(lowCd.replace('分钟', ''));
          setLowUnit('分钟');
        }

        setMidTarget(targets.mid || '');
        const midCd = targets.midCountdown || '';
        if (midCd.includes('小时')) {
          setMidCountdown(midCd.replace('小时', ''));
          setMidUnit('小时');
        } else {
          setMidCountdown(midCd.replace('分钟', ''));
          setMidUnit('分钟');
        }

        setHighTarget(targets.high || '');
        setNotifySoundLight(editRule.notifyWays ? editRule.notifyWays.includes('声光报警通知') : true);
        setNotifySms(editRule.notifyWays ? editRule.notifyWays.includes('发送短信通知') : false);
        setAlarmInterval(editRule.repeatInterval || '不重复');
        setEffectivePeriod(editRule.effectivePeriod || '永久');
        setStatus(editRule.status || '启用');
        setChangeNotes(`调整告警参数，更新至 ${nextVersionId}`);
      } else {
        // 新建模式初始化：默认人员禁入
        const initialType = '人员禁入';
        setType(initialType);
        const todayStr = getTodayDateStr();
        setName(`${initialType}_${todayStr}`);
        
        // 初始区域条件：人员禁入默认电子围栏
        setAreaConditions([{ 
          type: '电子围栏', 
          relation: '是', 
          target: YARD_ELECTRONIC_FENCES[0] 
        }]);

        // 初始人员范围：工种类别
        setPersonConditions([{ 
          scope: '工种类别', 
          relation: '是', 
          target: SHIPYARD_WORK_TYPES[0] 
        }]);

        // 初始策略条件：告警时段
        setPolicyConditions([{
          id: 'cond-1',
          type: '告警时段',
          operator: '00:00 ~ 23:59',
          value: 1,
          unit: '时段',
          timeStart: '00:00',
          timeEnd: '23:59'
        }]);

        setLowTarget('当班区域安全员');
        setLowCountdown('3');
        setLowUnit('分钟');
        setMidTarget('车间安全主任');
        setMidCountdown('5');
        setMidUnit('分钟');
        setHighTarget('厂级安全总监与应急指挥中心');
        setNotifySoundLight(true);
        setNotifySms(true);
        setAlarmInterval('不重复');
        setEffectivePeriod('永久');
        setStatus('启用');
        setChangeNotes('');
      }
    }
  }, [isOpen, editRule]);

  if (!isOpen) return null;

  // 1. 策略类型切换联动
  const handleTypeChange = (selectedType: string) => {
    setType(selectedType);
    if (errorMsg) setErrorMsg('');

    // 自动按 策略类型_YYYYMMDD 生成策略名称
    const todayStr = getTodayDateStr();
    setName(`${selectedType}_${todayStr}`);

    // 区域范围联动
    const availableCfgs = POLICY_TYPE_AREA_MAP[selectedType] || [];
    if (availableCfgs.length === 0) {
      // 智能标签状态类：无需选择区域范围
      setAreaConditions([]);
    } else {
      const firstCfg = availableCfgs[0];
      if (firstCfg.areaType === '作业面') {
        setAreaConditions([{
          type: '作业面',
          relation: '是',
          scopeMode: 'all',
          selectedTargets: [],
          target: '全部作业面'
        }]);
      } else if (firstCfg.areaType === '有限空间') {
        const defaultPrj = MOCK_PROJECTS[0];
        setAreaConditions([{
          type: '有限空间',
          relation: '是',
          selectedProjectIds: [defaultPrj.id],
          target: defaultPrj.name
        }]);
      } else {
        setAreaConditions([{
          type: firstCfg.areaType,
          relation: '是',
          target: firstCfg.targets[0] || ''
        }]);
      }
    }

    // 策略条件联动重置
    const condConfig = getCurrentPolicyConditionConfig(selectedType);
    if (condConfig.conditionTypes.length === 0) {
      setPolicyConditions([]);
    } else if (condConfig.isTimeRangeOnly) {
      setPolicyConditions([{
        id: `cond-${Date.now()}`,
        type: '告警时段',
        operator: '00:00 ~ 23:59',
        value: 1,
        unit: '时段',
        timeStart: '00:00',
        timeEnd: '23:59'
      }]);
    } else {
      setPolicyConditions([{
        id: `cond-${Date.now()}`,
        type: condConfig.conditionTypes[0],
        operator: condConfig.operators[0] || '大于等于',
        value: condConfig.defaultValue,
        unit: condConfig.unit
      }]);
    }
  };

  // 添加区域条件（每种区域范围类型在同一个告警策略中只能选择一次）
  const canAddMoreAreaCondition = areaConditions.length < availableAreaConfigs.length;

  const handleAddAreaCondition = () => {
    const usedTypes = areaConditions.map(c => c.type);
    const unusedConfigs = availableAreaConfigs.filter(cfg => !usedTypes.includes(cfg.areaType));
    if (unusedConfigs.length === 0) return;

    const nextCfg = unusedConfigs[0];
    if (nextCfg.areaType === '作业面') {
      setAreaConditions([
        ...areaConditions, 
        { type: '作业面', relation: '是', target: '全部作业面', scopeMode: 'all', selectedTargets: [] }
      ]);
    } else if (nextCfg.areaType === '有限空间') {
      const defaultPrj = MOCK_PROJECTS[0];
      setAreaConditions([
        ...areaConditions, 
        { 
          type: '有限空间', 
          relation: '是', 
          selectedProjectIds: [defaultPrj.id], 
          target: defaultPrj.name 
        }
      ]);
    } else {
      const defaultTarget = nextCfg.targets[0] || '';
      setAreaConditions([...areaConditions, { type: nextCfg.areaType, relation: '是', target: defaultTarget }]);
    }
  };

  const handleRemoveAreaCondition = (idx: number) => {
    if (areaConditions.length <= 1) return;
    setAreaConditions(areaConditions.filter((_, i) => i !== idx));
  };

  // 添加人员条件（工种类别与作业班组各只能添加一次，最多 2 条）
  const canAddPersonCondition = personConditions.length < 2;

  const handleAddPersonCondition = () => {
    const usedScopes = personConditions.map(c => c.scope);
    const nextScope = (['工种类别', '作业班组'] as const).find(s => !usedScopes.includes(s));
    if (!nextScope) return;

    setPersonConditions([
      ...personConditions, 
      { 
        scope: nextScope, 
        relation: '是', 
        target: nextScope === '工种类别' ? SHIPYARD_WORK_TYPES[0] : SHIPYARD_WORK_TEAMS[0] 
      }
    ]);
  };

  const handleRemovePersonCondition = (idx: number) => {
    if (personConditions.length <= 1) return;
    setPersonConditions(personConditions.filter((_, i) => i !== idx));
  };

  // 添加策略条件（每种策略条件只能被添加设置一次）
  const currentConditionConfig = getCurrentPolicyConditionConfig(type);
  const canAddPolicyCondition = policyConditions.length < currentConditionConfig.conditionTypes.length;

  const handleAddPolicyCondition = () => {
    const usedTypes = policyConditions.map(c => c.type);
    const unusedType = currentConditionConfig.conditionTypes.find(t => !usedTypes.includes(t));
    if (!unusedType) return;

    setPolicyConditions([
      ...policyConditions,
      {
        id: `cond-${Date.now()}`,
        type: unusedType,
        operator: currentConditionConfig.operators[0] || '大于等于',
        value: currentConditionConfig.defaultValue || 1,
        unit: currentConditionConfig.unit
      }
    ]);
  };

  const handleRemovePolicyCondition = (id: string) => {
    if (policyConditions.length <= 1) return;
    setPolicyConditions(policyConditions.filter(c => c.id !== id));
  };

  // 提交表单保存
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('请输入告警策略名称');
      return;
    }
    if (!type) {
      setErrorMsg('请选择策略类型');
      return;
    }

    if (!isNoAreaNeeded) {
      for (const cond of areaConditions) {
        if (cond.type === '有限空间' && (!cond.selectedProjectIds || cond.selectedProjectIds.length === 0)) {
          setErrorMsg('请至少选择一个有限空间对应的船舶建造项目');
          return;
        }
        if (cond.type === '作业面' && cond.scopeMode === 'custom' && (!cond.selectedTargets || cond.selectedTargets.length === 0)) {
          setErrorMsg('请至少勾选一个厂区作业面，或切换为全部作业面');
          return;
        }
      }
    }

    const now = new Date();
    const formattedNow = formatDateTime(now);

    let mainLevel: '低' | '中' | '高' = '低';
    if (highTarget) {
      mainLevel = '高';
    } else if (midTarget) {
      mainLevel = '中';
    }

    const notifyWays: string[] = [];
    if (notifySoundLight) notifyWays.push('声光报警通知');
    if (notifySms) notifyWays.push('发送短信通知');

    const lowCdFormatted = lowCountdown ? `${lowCountdown}${lowUnit}` : '';
    const midCdFormatted = midCountdown ? `${midCountdown}${midUnit}` : '';

    // 当前版本的快照对象
    const snapshot = {
      name: name.trim(),
      type: type,
      level: mainLevel,
      areaConditions: isNoAreaNeeded ? [] : areaConditions
        .filter(c => c.type || c.target)
        .map(cond => {
          if (cond.type === '作业面') {
            const isAll = cond.scopeMode === 'all' || !cond.selectedTargets || cond.selectedTargets.length === 0;
            const targetStr = isAll ? '全部作业面' : cond.selectedTargets!.join('、');
            return {
              type: '作业面',
              relation: cond.relation || '是',
              target: targetStr,
              selectedTargets: isAll ? undefined : cond.selectedTargets
            };
          } else if (cond.type === '有限空间') {
            const pIds = cond.selectedProjectIds || [];
            const projectNames = pIds.map(id => MOCK_PROJECTS.find(p => p.id === id)?.name || id);
            return {
              type: '有限空间',
              relation: cond.relation || '是',
              target: projectNames.join('、'),
              selectedTargets: projectNames
            };
          }
          return {
            type: cond.type,
            relation: cond.relation || '是',
            target: cond.target
          };
        }),
      personConditions: isPersonScopeHidden
        ? []
        : isWorkPermitLinkedPerson
          ? [{
              scope: '作业票关联',
              relation: '是',
              target: isGuardianOffType ? '有限空间作业票指定安全员/监护人' : '有限空间作业票登记作业人员'
            }]
          : personConditions.filter(c => c.scope && c.target),
      // 主条件保持与首个策略条件一致，向下兼容
      conditionType: isPolicyConditionHidden
        ? '设备阈值自动触发'
        : (policyConditions[0]?.type || currentConditionConfig.conditionTypes[0] || ''),
      conditionOperator: isPolicyConditionHidden
        ? '自动监测'
        : (currentConditionConfig.isTimeRangeOnly
            ? `${policyConditions[0]?.timeStart || '00:00'} ~ ${policyConditions[0]?.timeEnd || '23:59'}`
            : (policyConditions[0]?.operator || '大于等于')),
      conditionValue: isPolicyConditionHidden
        ? 0
        : (policyConditions[0]?.value ?? currentConditionConfig.defaultValue),
      // 保存完整的多策略条件
      policyConditions: isPolicyConditionHidden
        ? []
        : policyConditions.map(pc => ({
            type: pc.type,
            operator: currentConditionConfig.isTimeRangeOnly
              ? `${pc.timeStart || '00:00'} ~ ${pc.timeEnd || '23:59'}`
              : pc.operator,
            value: pc.value,
            unit: pc.unit,
            ...(currentConditionConfig.isTimeRangeOnly
              ? { timeStart: pc.timeStart || '00:00', timeEnd: pc.timeEnd || '23:59' }
              : {})
          })),
      notifyTargets: {
        low: lowTarget,
        lowCountdown: lowCdFormatted,
        mid: midTarget,
        midCountdown: midCdFormatted,
        high: highTarget
      },
      notifyWays: notifyWays,
      repeatInterval: alarmInterval,
      effectivePeriod: effectivePeriod,
      status: status
    };

    if (isEdit && editRule) {
      const newVersionNum = getNextVersionNumber();
      const newVersionId = generateVersionId(newVersionNum);

      const newVersionRecord: AlarmRuleVersion = {
        versionId: newVersionId,
        versionNumber: newVersionNum,
        createdAt: formattedNow,
        modifier: '系统管理员',
        changeNotes: changeNotes.trim() || `优化告警动态项配置，更新为 ${newVersionId}`,
        snapshot: snapshot
      };

      const updatedRule: AlarmRuleItem = {
        ...editRule,
        name: name.trim(),
        type: type,
        level: mainLevel,
        notify: (lowTarget || midTarget || highTarget) ? '是' : '否',
        period: effectivePeriod,
        status: status,
        currentVersion: newVersionId,
        modifiedAt: formattedNow,
        versions: [newVersionRecord, ...(editRule.versions || [])],
        areaConditions: snapshot.areaConditions,
        personConditions: snapshot.personConditions,
        conditionType: snapshot.conditionType,
        conditionOperator: snapshot.conditionOperator,
        conditionValue: snapshot.conditionValue,
        policyConditions: snapshot.policyConditions,
        notifyTargets: snapshot.notifyTargets,
        notifyWays: snapshot.notifyWays,
        repeatInterval: snapshot.repeatInterval,
        effectivePeriod: snapshot.effectivePeriod
      };

      onSubmit(updatedRule, true);
    } else {
      const initialVersionId = generateVersionId(1);

      const initialVersionRecord: AlarmRuleVersion = {
        versionId: initialVersionId,
        versionNumber: 1,
        createdAt: formattedNow,
        modifier: '系统管理员',
        changeNotes: '创建并配置告警策略场景规则',
        snapshot: snapshot
      };

      const newRule: AlarmRuleItem = {
        id: Date.now(),
        name: name.trim(),
        type: type,
        level: mainLevel,
        notify: (lowTarget || midTarget || highTarget) ? '是' : '否',
        period: effectivePeriod,
        status: status,
        currentVersion: initialVersionId,
        modifiedAt: formattedNow,
        createdAt: formattedNow,
        versions: [initialVersionRecord],
        areaConditions: snapshot.areaConditions,
        personConditions: snapshot.personConditions,
        conditionType: snapshot.conditionType,
        conditionOperator: snapshot.conditionOperator,
        conditionValue: snapshot.conditionValue,
        policyConditions: snapshot.policyConditions,
        notifyTargets: snapshot.notifyTargets,
        notifyWays: snapshot.notifyWays,
        repeatInterval: snapshot.repeatInterval,
        effectivePeriod: snapshot.effectivePeriod
      };

      onSubmit(newRule, false);
    }

    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-slate-700 font-sans"
      >
        {/* 1. 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${
              isEdit 
                ? 'bg-amber-500/10 border-amber-200 text-amber-600' 
                : 'bg-blue-600/10 border-blue-200 text-blue-600'
            }`}>
              {isEdit ? <GitBranch className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 tracking-wide">
                  {isEdit ? `编辑告警策略` : `新增告警策略`}
                </h2>
                {isEdit ? (
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>当前: {editRule?.currentVersion}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-emerald-700 font-bold">新版本: {nextVersionId}</span>
                  </span>
                ) : (
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    版本号: {nextVersionId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                根据所选告警策略类型，动态联动区域范围、人员关联方式及触发条件设置
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 表单内容区域 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-[13px]">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 业务要素1：策略类型 */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/40 to-slate-50/40 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center">
              <label className="w-28 text-right pr-4 text-slate-700 shrink-0 font-bold flex items-center justify-end gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-red-500 mr-0.5">*</span>策略类型:
              </label>
              <div className="flex-1">
                <select 
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-blue-400/70 rounded-xl text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-[13px] bg-white cursor-pointer font-bold shadow-xs"
                >
                  <option value="" disabled hidden>请选择策略类型</option>
                  <optgroup label="1. 环境感知与安防类 (仅配置探测器设备)">
                    <option value="气体告警">气体告警 (气体探测器)</option>
                    <option value="烟感告警">烟感告警 (烟雾报警器)</option>
                  </optgroup>
                  <optgroup label="2. 人员行为与定位管控类 (作业面、有限空间、电子围栏、主基站)">
                    <option value="人员禁入">人员禁入 (电子围栏/作业面/有限空间/主基站)</option>
                    <option value="人数超员">人员超员 (作业面/有限空间/电子围栏)</option>
                    <option value="安全员/监护人脱岗">安全员/监护人脱岗 (仅限有限空间)</option>
                    <option value="连续长时间工作/异常停留">连续长时间工作/异常停留 (仅限有限空间)</option>
                  </optgroup>
                  <optgroup label="3. 智能标签状态类 (全域监测，无需配置区域及人员范围)">
                    <option value="标签脱落告警">标签脱落告警</option>
                    <option value="标签低电告警">标签低电告警</option>
                    <option value="标签离线告警">标签离线告警</option>
                  </optgroup>
                  <optgroup label="4. AI 智能视觉分析类 (仅对应AI摄像头)">
                    <option value="安全帽配戴">安全帽配戴 (AI视觉识别摄像头)</option>
                    <option value="厂区吸烟">厂区吸烟 (AI视觉识别摄像头)</option>
                    <option value="厂区玩手机">厂区玩手机 (AI视觉识别摄像头)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* 告警策略名称 */}
            <div className="flex items-center">
              <label className="w-28 text-right pr-4 text-slate-700 shrink-0 font-medium">
                <span className="text-red-500 mr-1">*</span>策略名称:
              </label>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={name}
                  maxLength={255}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={type ? `例如：${type}_${getTodayDateStr()}` : "请先选择策略类型或手动输入策略名称"} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[13px] bg-white font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono pointer-events-none">
                  {name.length} / 255
                </span>
              </div>
            </div>
          </div>

          {/* 业务要素2：区域范围 */}
          <div className="flex items-start">
            <label className="w-28 text-right pr-4 pt-2 text-slate-700 shrink-0 font-bold flex items-center justify-end gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-red-500 mr-0.5">*</span>区域范围:
            </label>
            <div className="flex-1 space-y-3">
              {/* 针对智能标签状态类：无需选择区域范围 */}
              {isNoAreaNeeded ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    智能标签状态类（脱落 / 低电 / 离线）由物联网定位基站对全厂作业人员所佩戴之移动标签进行全域实时监测，<strong>无需选择区域范围</strong>。
                  </span>
                </div>
              ) : (
                <>
                  {areaConditions.map((cond, idx) => {
                    const currentCfg = availableAreaConfigs.find(c => c.areaType === cond.type);
                    const currentTargets = currentCfg ? currentCfg.targets : (cond.target ? [cond.target] : []);

                    const isWorkface = cond.type === '作业面';
                    const isShipProject = cond.type === '有限空间';

                    // 作业面多选状态
                    const currentWorkfaceBlocks = cond.selectedTargets || [];
                    const isAllWorkfaces = cond.scopeMode === 'all' || currentWorkfaceBlocks.length === 0;

                    // 有限空间：船舶建造项目多选状态（已去除全厂在建船舶工程选项）
                    const currentSelectedProjectIds = cond.selectedProjectIds || [MOCK_PROJECTS[0].id];

                    return (
                      <div 
                        key={idx} 
                        className={`rounded-xl transition-all border ${
                          isWorkface || isShipProject 
                            ? 'p-3.5 bg-slate-50/80 border-slate-200 shadow-2xs space-y-3' 
                            : 'p-2.5 bg-slate-50/40 border-slate-200 space-y-2'
                        }`}
                      >
                        {/* 顶部主选择栏 */}
                        <div className="flex items-center gap-2.5">
                          {/* 区域类型选择：已选择过的区域项变为不可选 */}
                          <select 
                            value={cond.type}
                            onChange={(e) => {
                              const selectedAreaType = e.target.value;
                              const updated = [...areaConditions];
                              
                              if (selectedAreaType === '作业面') {
                                updated[idx] = {
                                  type: selectedAreaType,
                                  relation: cond.relation || '是',
                                  scopeMode: 'all',
                                  selectedTargets: [],
                                  target: '全部作业面'
                                };
                              } else if (selectedAreaType === '有限空间') {
                                const defaultPrj = MOCK_PROJECTS[0];
                                updated[idx] = {
                                  type: selectedAreaType,
                                  relation: cond.relation || '是',
                                  selectedProjectIds: [defaultPrj.id],
                                  target: defaultPrj.name
                                };
                              } else {
                                const foundCfg = availableAreaConfigs.find(c => c.areaType === selectedAreaType);
                                updated[idx] = {
                                  type: selectedAreaType,
                                  relation: cond.relation || '是',
                                  target: foundCfg?.targets[0] || ''
                                };
                              }
                              setAreaConditions(updated);
                            }}
                            className={`w-40 px-3 py-1.5 border rounded-lg text-[13px] bg-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                              cond.type === '作业面'
                                ? 'border-blue-400 text-blue-700 bg-blue-50/40'
                                : cond.type === '有限空间'
                                ? 'border-purple-400 text-purple-700 bg-purple-50/40'
                                : 'border-slate-300 text-slate-800'
                            }`}
                          >
                            <option value="" disabled hidden>请选择区域类型</option>
                            {availableAreaConfigs.map(cfg => {
                              // 每种区域范围类型在同一个告警策略配置中只可选择一次
                              const isAlreadyUsed = areaConditions.some((c, i) => i !== idx && c.type === cfg.areaType);
                              return (
                                <option 
                                  key={cfg.areaType} 
                                  value={cfg.areaType}
                                  disabled={isAlreadyUsed}
                                >
                                  {cfg.areaType === '作业面' 
                                    ? '🏗️ 厂区作业面 (支持多选)' 
                                    : cfg.areaType === '有限空间' 
                                    ? '🚢 有限空间 (船舶建造项目)' 
                                    : cfg.areaType === '电子围栏'
                                    ? '🚧 电子围栏警戒区'
                                    : cfg.areaType === '主基站'
                                    ? '📡 主基站覆盖区'
                                    : cfg.areaType === '气体探测器'
                                    ? '🧪 气体探测器监测点'
                                    : cfg.areaType === '烟雾报警器'
                                    ? '🔥 烟雾报警器监测点'
                                    : cfg.areaType === '摄像头'
                                    ? '📷 AI视觉识别摄像头'
                                    : cfg.areaType}
                                  {isAlreadyUsed ? ' (已配置)' : ''}
                                </option>
                              );
                            })}
                          </select>

                          {/* 关系 (是/否) */}
                          <select 
                            value={cond.relation}
                            onChange={(e) => {
                              const updated = [...areaConditions];
                              updated[idx].relation = e.target.value;
                              setAreaConditions(updated);
                            }}
                            className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium cursor-pointer"
                          >
                            <option value="是">是 (在区域内)</option>
                            <option value="否">否 (排除/不在区域)</option>
                          </select>

                          {/* 普通类型 (电子围栏 / 摄像头 / 主基站 / 探测器)：单选下拉 */}
                          {!isWorkface && !isShipProject && (
                            <select 
                              value={cond.target}
                              onChange={(e) => {
                                const updated = [...areaConditions];
                                updated[idx].target = e.target.value;
                                setAreaConditions(updated);
                              }}
                              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium cursor-pointer"
                            >
                              <option value="" disabled hidden>请选择指定设备或范围</option>
                              {currentTargets.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          )}

                          {/* 作业面 / 有限空间：顶部展示当前设定摘要 */}
                          {(isWorkface || isShipProject) && (
                            <div className="flex-1 flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs truncate">
                              <span className="text-slate-500 shrink-0">生效目标:</span>
                              <span className="font-semibold text-blue-700 truncate ml-2">
                                {isWorkface
                                  ? (isAllWorkfaces ? '全厂全部作业面 (10个)' : `已选 ${currentWorkfaceBlocks.length} 个作业面: ${currentWorkfaceBlocks.join('、')}`)
                                  : `已选 ${currentSelectedProjectIds.length} 个船舶建造项目: ${currentSelectedProjectIds.map(id => MOCK_PROJECTS.find(p => p.id === id)?.name || id).join('、')}`
                                }
                              </span>
                            </div>
                          )}

                          {areaConditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAreaCondition(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="删除此区域条件"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* A. 若为“作业面”：支持厂区作业面批量多选 */}
                        {isWorkface && (
                          <div className="bg-white border border-blue-200/80 rounded-xl p-3 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                                  <span>厂区作业面选择:</span>
                                </span>
                                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...areaConditions];
                                      updated[idx] = {
                                        ...cond,
                                        scopeMode: 'all',
                                        selectedTargets: [],
                                        target: '全部作业面'
                                      };
                                      setAreaConditions(updated);
                                    }}
                                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                      isAllWorkfaces 
                                        ? 'bg-blue-600 text-white shadow-xs' 
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    全部作业面 (全厂生效)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...areaConditions];
                                      const initial = (cond.selectedTargets && cond.selectedTargets.length > 0)
                                        ? cond.selectedTargets
                                        : YARD_WORKFACES.slice(0, 2);
                                      updated[idx] = {
                                        ...cond,
                                        scopeMode: 'custom',
                                        selectedTargets: initial,
                                        target: initial.join('、')
                                      };
                                      setAreaConditions(updated);
                                    }}
                                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                      !isAllWorkfaces 
                                        ? 'bg-blue-600 text-white shadow-xs' 
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    <span>手动批量勾选作业面</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                      !isAllWorkfaces ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                      {currentWorkfaceBlocks.length}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {!isAllWorkfaces && (
                                <div className="flex items-center gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...areaConditions];
                                      updated[idx] = {
                                        ...cond,
                                        scopeMode: 'custom',
                                        selectedTargets: [...YARD_WORKFACES],
                                        target: YARD_WORKFACES.join('、')
                                      };
                                      setAreaConditions(updated);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-medium"
                                  >
                                    全选 ({YARD_WORKFACES.length})
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...areaConditions];
                                      updated[idx] = {
                                        ...cond,
                                        scopeMode: 'custom',
                                        selectedTargets: [],
                                        target: '请在下方勾选作业面'
                                      };
                                      setAreaConditions(updated);
                                    }}
                                    className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                                  >
                                    清空
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* 全部作业面提示 */}
                            {isAllWorkfaces && (
                              <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span>已选择 <strong>全厂全部作业面</strong>（覆盖船台、船坞、涂装等 <strong>{YARD_WORKFACES.length}</strong> 处主力作业面）。</span>
                                </span>
                                <span className="text-[11px] text-blue-700 font-mono bg-blue-100 px-2 py-0.5 rounded font-bold">
                                  厂区全覆盖
                                </span>
                              </div>
                            )}

                            {/* 作业面多选复选网格 */}
                            {!isAllWorkfaces && (
                              <div className="space-y-2 pt-1">
                                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                  <span>点击勾选/取消勾选具体厂区作业面，可任意多选：</span>
                                  <span className="font-mono text-slate-600 font-medium">已勾选 {currentWorkfaceBlocks.length} / {YARD_WORKFACES.length} 个作业面</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                  {YARD_WORKFACES.map((faceName) => {
                                    const isChecked = currentWorkfaceBlocks.includes(faceName);
                                    return (
                                      <label
                                        key={faceName}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const updated = [...areaConditions];
                                          let newBlocks: string[];
                                          if (isChecked) {
                                            newBlocks = currentWorkfaceBlocks.filter(b => b !== faceName);
                                          } else {
                                            newBlocks = [...currentWorkfaceBlocks, faceName];
                                          }
                                          updated[idx] = {
                                            ...cond,
                                            scopeMode: 'custom',
                                            selectedTargets: newBlocks,
                                            target: newBlocks.length > 0 ? newBlocks.join('、') : '请在下方勾选作业面'
                                          };
                                          setAreaConditions(updated);
                                        }}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                          isChecked
                                            ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                                        }`}
                                      >
                                        {isChecked ? (
                                          <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        ) : (
                                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        )}
                                        <span className="truncate">{faceName}</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {/* 已选作业面标签列表 */}
                                {currentWorkfaceBlocks.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] text-slate-500 font-medium">已选作业面:</span>
                                    {currentWorkfaceBlocks.map(block => (
                                      <span
                                        key={block}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100/90 text-blue-900 text-[11px] font-semibold border border-blue-300/80 shadow-2xs"
                                      >
                                        <span>{block}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...areaConditions];
                                            const newBlocks = currentWorkfaceBlocks.filter(b => b !== block);
                                            updated[idx] = {
                                              ...cond,
                                              scopeMode: newBlocks.length > 0 ? 'custom' : 'all',
                                              selectedTargets: newBlocks,
                                              target: newBlocks.length > 0 ? newBlocks.join('、') : '全部作业面'
                                            };
                                            setAreaConditions(updated);
                                          }}
                                          className="text-blue-600 hover:text-blue-800 p-0.5 rounded cursor-pointer"
                                          title="移除此作业面"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* B. 若为“有限空间”：仅选择船舶建造项目（支持多选，去掉了全厂在建船舶工程选项与适用舱室设定） */}
                        {isShipProject && (
                          <div className="bg-white border border-purple-200/80 rounded-xl p-3 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Ship className="w-3.5 h-3.5 text-purple-600" />
                                <span>对应船舶建造项目 (支持多选):</span>
                              </span>

                              <div className="flex items-center gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...areaConditions];
                                    const allIds = MOCK_PROJECTS.map(p => p.id);
                                    const allNames = MOCK_PROJECTS.map(p => p.name);
                                    updated[idx] = {
                                      ...cond,
                                      selectedProjectIds: allIds,
                                      target: allNames.join('、')
                                    };
                                    setAreaConditions(updated);
                                  }}
                                  className="text-purple-600 hover:text-purple-700 hover:underline cursor-pointer font-medium"
                                >
                                  全选 ({MOCK_PROJECTS.length})
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...areaConditions];
                                    updated[idx] = {
                                      ...cond,
                                      selectedProjectIds: [],
                                      target: '请勾选船舶项目'
                                    };
                                    setAreaConditions(updated);
                                  }}
                                  className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
                                >
                                  清空
                                </button>
                              </div>
                            </div>

                            {/* 船舶项目多选复选网格 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                              {MOCK_PROJECTS.map((prj) => {
                                const isChecked = currentSelectedProjectIds.includes(prj.id);
                                return (
                                  <label
                                    key={prj.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const updated = [...areaConditions];
                                      let newIds: string[];
                                      if (isChecked) {
                                        newIds = currentSelectedProjectIds.filter(id => id !== prj.id);
                                      } else {
                                        newIds = [...currentSelectedProjectIds, prj.id];
                                      }
                                      const projectNames = newIds.map(id => MOCK_PROJECTS.find(p => p.id === id)?.name || id);
                                      updated[idx] = {
                                        ...cond,
                                        selectedProjectIds: newIds,
                                        target: projectNames.length > 0 ? projectNames.join('、') : '请勾选船舶项目'
                                      };
                                      setAreaConditions(updated);
                                    }}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                      isChecked
                                        ? 'bg-purple-50/90 border-purple-400 text-purple-900 font-semibold shadow-2xs'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                                    }`}
                                  >
                                    <div className="pt-0.5 shrink-0">
                                      {isChecked ? (
                                        <CheckSquare className="w-4 h-4 text-purple-600" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold truncate">{prj.name}</div>
                                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                        船号: {prj.shipCode || prj.id}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>

                            {/* 已选船舶项目标签汇总 */}
                            {currentSelectedProjectIds.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] text-slate-500 font-medium">已选建造项目:</span>
                                {currentSelectedProjectIds.map(id => {
                                  const prj = MOCK_PROJECTS.find(p => p.id === id);
                                  const prjTitle = prj ? prj.name : id;
                                  return (
                                    <span
                                      key={id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100/90 text-purple-900 text-[11px] font-semibold border border-purple-300/80 shadow-2xs"
                                    >
                                      <span>{prjTitle}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...areaConditions];
                                          const newIds = currentSelectedProjectIds.filter(item => item !== id);
                                          const projectNames = newIds.map(i => MOCK_PROJECTS.find(p => p.id === i)?.name || i);
                                          updated[idx] = {
                                            ...cond,
                                            selectedProjectIds: newIds,
                                            target: projectNames.length > 0 ? projectNames.join('、') : '请勾选船舶项目'
                                          };
                                          setAreaConditions(updated);
                                        }}
                                        className="text-purple-600 hover:text-purple-800 p-0.5 rounded cursor-pointer"
                                        title="移除此项目"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* 添加并且区域条件：每种区域类型只可选择一次 */}
                  {canAddMoreAreaCondition && (
                    <button
                      type="button"
                      onClick={handleAddAreaCondition}
                      className="flex items-center gap-1 text-[#1677ff] bg-[#e6f4ff] hover:bg-[#bae0ff] border border-[#91caff] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> 添加（并且）区域条件
                    </button>
                  )}

                  {!canAddMoreAreaCondition && areaConditions.length > 0 && (
                    <div className="text-[11px] text-slate-400 italic pt-0.5">
                      ✓ 已添加所有可用区域范围类型（每种类型在同一个告警策略中只可选择一次）。
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 业务要素3：人员范围（气体/烟感/超员/智能标签三类隐藏；安全员脱岗与异常停留保持与作业票默认关联） */}
          {!isPersonScopeHidden && (
            <div className="flex items-start">
              <label className="w-28 text-right pr-4 pt-2 text-slate-700 shrink-0 font-bold flex items-center justify-end gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                {!isWorkPermitLinkedPerson && <span className="text-red-500 mr-0.5">*</span>}
                {isWorkPermitLinkedPerson ? '人员关联:' : '人员范围:'}
              </label>
              <div className="flex-1 space-y-2.5">
                {isWorkPermitLinkedPerson ? (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold">
                        {isGuardianOffType ? '默认与有限空间作业票关联' : '保持与作业票的人员默认关联'}
                      </span>
                      <span className="text-blue-700 ml-1.5">
                        {isGuardianOffType
                          ? '（无需手动设置人员关联，系统将自动关联对应有限空间作业票中指定的值班安全员/监护人）'
                          : '（无需手动设置人员关联，系统将自动关联对应有限空间作业票下登记的进舱作业人员）'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {personConditions.map((cond, idx) => {
                      const targetOptions = cond.scope === '工种类别' ? SHIPYARD_WORK_TYPES : SHIPYARD_WORK_TEAMS;

                      return (
                        <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-50/70 border border-slate-200 rounded-xl">
                          {/* 范围维度选择：工种类别 / 作业班组（已被其它行添加的变为不可选） */}
                          <select 
                            value={cond.scope}
                            onChange={(e) => {
                              const updated = [...personConditions];
                              const newScope = e.target.value as '工种类别' | '作业班组';
                              const newOptions = newScope === '工种类别' ? SHIPYARD_WORK_TYPES : SHIPYARD_WORK_TEAMS;
                              updated[idx] = {
                                ...updated[idx],
                                scope: newScope,
                                target: newOptions[0]
                              };
                              setPersonConditions(updated);
                            }}
                            className="w-36 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-blue-500 text-[13px] bg-white cursor-pointer"
                          >
                            {(['工种类别', '作业班组'] as const).map(scopeOpt => {
                              const isUsed = personConditions.some((c, i) => i !== idx && c.scope === scopeOpt);
                              return (
                                <option key={scopeOpt} value={scopeOpt} disabled={isUsed}>
                                  {scopeOpt === '工种类别' ? '🛠️ 工种类别' : '👥 作业班组'}
                                  {isUsed ? ' (已添加)' : ''}
                                </option>
                              );
                            })}
                          </select>

                          {/* 关系筛选：只允许“是”与“不是”两种范围 */}
                          <select 
                            value={cond.relation}
                            onChange={(e) => {
                              const updated = [...personConditions];
                              updated[idx].relation = e.target.value as '是' | '不是';
                              setPersonConditions(updated);
                            }}
                            className={`w-32 px-3 py-1.5 border rounded-lg text-[13px] bg-white font-bold cursor-pointer ${
                              cond.relation === '是' 
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50/30' 
                                : 'border-rose-300 text-rose-700 bg-rose-50/30'
                            }`}
                          >
                            <option value="是">是 (包含此类)</option>
                            <option value="不是">不是 (排除此类)</option>
                          </select>

                          {/* 目标工种或班组下拉列表 */}
                          <select 
                            value={cond.target}
                            onChange={(e) => {
                              const updated = [...personConditions];
                              updated[idx].target = e.target.value;
                              setPersonConditions(updated);
                            }}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium cursor-pointer"
                          >
                            <option value="" disabled hidden>
                              {cond.scope === '工种类别' ? '请选择工种' : '请选择作业班组'}
                            </option>
                            {targetOptions.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          {personConditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePersonCondition(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="删除此人员过滤条件"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* 添加人员条件按钮：工种和班组各限一次，最多 2 条 */}
                    {canAddPersonCondition && (
                      <button
                        type="button"
                        onClick={handleAddPersonCondition}
                        className="flex items-center gap-1 text-[#1677ff] bg-[#e6f4ff] hover:bg-[#bae0ff] border border-[#91caff] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 添加（并且）人员过滤条件
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 业务要素4：策略条件（气体/烟感/标签脱落/标签低电隐藏；人员禁入仅体现告警时段；人数超员仅保留持续时长；标签离线仅保留连接失联时长[小时]） */}
          {!isPolicyConditionHidden && (
            <div className="flex items-start">
              <label className="w-28 text-right pr-4 pt-2 text-slate-700 shrink-0 font-bold flex items-center justify-end gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-red-500 mr-0.5">*</span>策略条件:
              </label>
              <div className="flex-1 space-y-2.5">
                {currentConditionConfig.isTimeRangeOnly ? (
                  /* 人员禁入专用：仅体现告警时段设置 */
                  policyConditions.slice(0, 1).map((condItem, idx) => {
                    const tStart = condItem.timeStart || '00:00';
                    const tEnd = condItem.timeEnd || '23:59';
                    const applyPreset = (s: string, e: string) => {
                      const updated = [...policyConditions];
                      updated[idx] = {
                        ...updated[idx],
                        type: '告警时段',
                        operator: `${s} ~ ${e}`,
                        timeStart: s,
                        timeEnd: e
                      };
                      setPolicyConditions(updated);
                    };
                    return (
                      <div key={condItem.id} className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-bold text-xs shrink-0">
                            告警时段
                          </span>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={tStart}
                              onChange={(e) => applyPreset(e.target.value || '00:00', tEnd)}
                              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono font-bold text-[13px] focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-slate-400 font-bold">至</span>
                            <input
                              type="time"
                              value={tEnd}
                              onChange={(e) => applyPreset(tStart, e.target.value || '23:59')}
                              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 font-mono font-bold text-[13px] focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            {[
                              { label: '全天禁入', s: '00:00', e: '23:59' },
                              { label: '夜间时段', s: '18:00', e: '08:00' },
                              { label: '午休时段', s: '12:00', e: '13:30' }
                            ].map(preset => {
                              const isActive = tStart === preset.s && tEnd === preset.e;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() => applyPreset(preset.s, preset.e)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                                    isActive
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {currentConditionConfig.helpText}（当前生效时段：<strong className="font-mono text-blue-700">{tStart} ~ {tEnd}</strong>）
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {policyConditions.map((condItem, idx) => (
                      <div key={condItem.id} className="p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-2.5">
                          {/* 1. 条件类型 */}
                          <select 
                            value={condItem.type}
                            onChange={(e) => {
                              const newType = e.target.value;
                              const updated = [...policyConditions];
                              updated[idx] = {
                                ...updated[idx],
                                type: newType
                              };
                              setPolicyConditions(updated);
                            }}
                            className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-bold cursor-pointer"
                          >
                            {currentConditionConfig.conditionTypes.map(cType => {
                              const isUsed = policyConditions.some((c, i) => i !== idx && c.type === cType);
                              return (
                                <option key={cType} value={cType} disabled={isUsed}>
                                  {cType} {isUsed ? '(已配置)' : ''}
                                </option>
                              );
                            })}
                          </select>

                          {/* 2. 判定规则算子 */}
                          <select 
                            value={condItem.operator}
                            onChange={(e) => {
                              const updated = [...policyConditions];
                              updated[idx] = {
                                ...updated[idx],
                                operator: e.target.value
                              };
                              setPolicyConditions(updated);
                            }}
                            className="w-36 px-3 py-2 border-2 border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-bold cursor-pointer"
                          >
                            {currentConditionConfig.operators.map(op => (
                              <option key={op} value={op}>{op}</option>
                            ))}
                          </select>

                          {/* 3. 设置值步进器与单位 */}
                          <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...policyConditions];
                                updated[idx] = {
                                  ...updated[idx],
                                  value: Math.max(0, condItem.value - 1)
                                };
                                setPolicyConditions(updated);
                              }}
                              className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input 
                              type="number" 
                              value={condItem.value}
                              onChange={(e) => {
                                const updated = [...policyConditions];
                                updated[idx] = {
                                  ...updated[idx],
                                  value: Number(e.target.value) || 0
                                };
                                setPolicyConditions(updated);
                              }}
                              className="w-16 py-1.5 text-center text-slate-800 text-[13px] font-mono font-bold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...policyConditions];
                                updated[idx] = {
                                  ...updated[idx],
                                  value: condItem.value + 1
                                };
                                setPolicyConditions(updated);
                              }}
                              className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-200 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold border-l border-slate-200 select-none">
                              {condItem.unit || currentConditionConfig.unit}
                            </span>
                          </div>

                          {policyConditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePolicyCondition(condItem.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="删除此策略条件"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* 添加（并且）策略条件按钮：仅当策略有多种条件且尚未配全时展示 */}
                    {canAddPolicyCondition && (
                      <button
                        type="button"
                        onClick={handleAddPolicyCondition}
                        className="flex items-center gap-1 text-[#1677ff] bg-[#e6f4ff] hover:bg-[#bae0ff] border border-[#91caff] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors mt-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 添加（并且）策略条件
                      </button>
                    )}

                    {!canAddPolicyCondition && policyConditions.length > 0 && currentConditionConfig.conditionTypes.length > 1 && (
                      <div className="text-[11px] text-slate-400 italic pt-0.5">
                        ✓ 该告警类型下的所有策略条件类型已全部配置（每种条件类型仅可配置一次）。
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 通知人员多级升级配置表格 */}
          <div className="flex items-start">
            <label className="w-28 text-right pr-4 pt-2 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>通知人员:
            </label>
            <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#fafafa] border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-4 w-20 text-center">等级</th>
                    <th className="py-2.5 px-4"><span className="text-red-500 mr-1">*</span>通知对象</th>
                    <th className="py-2.5 px-4 w-64">触发升级倒计时</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {/* 低等级 */}
                  <tr>
                    <td className="py-2.5 px-4 text-center font-bold text-blue-600">低</td>
                    <td className="py-2.5 px-4">
                      <select 
                        value={lowTarget}
                        onChange={(e) => setLowTarget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px] bg-white cursor-pointer"
                      >
                        <option value="" disabled hidden>请选择通知对象</option>
                        <option value="当班区域安全员">当班区域安全员</option>
                        <option value="现场施工班组长">现场施工班组长</option>
                        <option value="车间调度员">车间调度员</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={lowCountdown}
                          onChange={(e) => setLowCountdown(e.target.value)}
                          placeholder="请输入时长" 
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px]"
                        />
                        <select 
                          value={lowUnit}
                          onChange={(e) => setLowUnit(e.target.value)}
                          className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-[13px] bg-white cursor-pointer"
                        >
                          <option value="分钟">分钟</option>
                          <option value="小时">小时</option>
                        </select>
                      </div>
                    </td>
                  </tr>

                  {/* 中等级 */}
                  <tr>
                    <td className="py-2.5 px-4 text-center font-bold text-amber-600">中</td>
                    <td className="py-2.5 px-4">
                      <select 
                        value={midTarget}
                        onChange={(e) => setMidTarget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px] bg-white cursor-pointer"
                      >
                        <option value="" disabled hidden>请选择通知对象</option>
                        <option value="车间安全主任">车间安全主任</option>
                        <option value="造船项目副经理">造船项目副经理</option>
                        <option value="生产作业部长">生产作业部长</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={midCountdown}
                          onChange={(e) => setMidCountdown(e.target.value)}
                          placeholder="请输入时长" 
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px]"
                        />
                        <select 
                          value={midUnit}
                          onChange={(e) => setMidUnit(e.target.value)}
                          className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-[13px] bg-white cursor-pointer"
                        >
                          <option value="分钟">分钟</option>
                          <option value="小时">小时</option>
                        </select>
                      </div>
                    </td>
                  </tr>

                  {/* 高等级 */}
                  <tr>
                    <td className="py-2.5 px-4 text-center font-bold text-red-600">高</td>
                    <td className="py-2.5 px-4">
                      <select 
                        value={highTarget}
                        onChange={(e) => setHighTarget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px] bg-white cursor-pointer"
                      >
                        <option value="" disabled hidden>请选择通知对象</option>
                        <option value="厂级安全总监与应急指挥中心">厂级安全总监与应急指挥中心</option>
                        <option value="船厂总工程师与厂长">船厂总工程师与厂长</option>
                        <option value="造船项目第一负责人">造船项目第一负责人</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-xs italic">
                      最高级别无需升级
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 通知方式 */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              通知方式:
            </label>
            <div className="flex items-center gap-6 text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifySoundLight}
                  onChange={(e) => setNotifySoundLight(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span>声光报警通知</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span>发送短信通知</span>
              </label>
            </div>
          </div>

          {/* 告警间隔 */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              告警间隔:
            </label>
            <div className="flex items-center gap-6 text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="alarmInterval"
                  value="不重复"
                  checked={alarmInterval === '不重复'}
                  onChange={() => setAlarmInterval('不重复')}
                  className="text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>不重复</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="alarmInterval"
                  value="重复告警"
                  checked={alarmInterval === '重复告警'}
                  onChange={() => setAlarmInterval('重复告警')}
                  className="text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>重复告警</span>
              </label>
            </div>
          </div>

          {/* 生效周期 */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              生效周期:
            </label>
            <div className="flex items-center gap-6 text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="effectivePeriod"
                  value="自定义"
                  checked={effectivePeriod === '自定义'}
                  onChange={() => setEffectivePeriod('自定义')}
                  className="text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>自定义</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="effectivePeriod"
                  value="永久"
                  checked={effectivePeriod === '永久'}
                  onChange={() => setEffectivePeriod('永久')}
                  className="text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>永久</span>
              </label>
            </div>
          </div>

          {/* 状态 */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>启用状态:
            </label>
            <div className="flex items-center gap-6 text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status"
                  value="启用"
                  checked={status === '启用'}
                  onChange={() => setStatus('启用')}
                  className="text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>启用</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="status"
                  value="禁用"
                  checked={status === '禁用'}
                  onChange={() => setStatus('禁用')}
                  className="text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <span>禁用</span>
              </label>
            </div>
          </div>

          {/* 编辑模式下的变更说明 */}
          {isEdit && (
            <div className="flex items-start pt-2 border-t border-slate-100">
              <label className="w-28 text-right pr-4 pt-2 text-slate-600 shrink-0 font-medium">
                版本变更说明:
              </label>
              <div className="flex-1">
                <textarea
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder={`请简述本次版本更新的变动内容`}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                />
                <span className="text-[11px] text-slate-400">
                  说明将记录进版本快照历史时间轴中，便于追溯。
                </span>
              </div>
            </div>
          )}

        </form>

        {/* 3. 底部操作按钮 */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0 rounded-b-2xl">
          <div className="text-xs text-slate-500 font-mono">
            {isEdit ? (
              <span>将生成新版本: <strong className="text-emerald-600">{nextVersionId}</strong></span>
            ) : (
              <span>初始发布版本: <strong className="text-blue-600">{nextVersionId}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-[13px] rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-colors font-medium cursor-pointer shadow-xs"
            >
              取消
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#1677ff] hover:bg-blue-600 text-white text-[13px] rounded-xl shadow-md shadow-blue-500/20 transition-all font-semibold flex items-center gap-1.5 active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" /> 
              <span>{isEdit ? `保存并发布新版本 ${nextVersionId}` : `保存策略 (${nextVersionId})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
