import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Check, 
  Info, 
  AlertTriangle, 
  GitBranch, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { AlarmRuleItem, AlarmRuleVersion, generateVersionId, formatDateTime, ALARM_POLICY_TYPES } from '@/src/data/alarmData';

// 区域与策略类型动态联动接口
export interface AreaOptionConfig {
  areaType: string;
  targets: string[];
}

// 策略类型对应区域选项动态联动数据字典（严格规范为 7 大策略类型与 3 大空间范围联动）
export const POLICY_TYPE_AREA_MAP: Record<string, AreaOptionConfig[]> = {
  '人员进入': [
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '1号船台搭载作业面 (185段)',
        '2号船台合拢作业面 (517段)',
        '船体外板涂装作业面',
        '总装车间胎架作业面',
        '舾装码头高空作业面'
      ]
    },
    {
      areaType: '有限空间',
      targets: [
        '全部有限空间',
        '1#液货舱密闭作业区',
        '2#双层底压载水舱',
        '机舱管路狭窄舱室',
        '首尖舱密闭空间',
        '舵机舱密闭舱室'
      ]
    },
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '800T龙门吊运行警戒区围栏',
        '重件吊装坠落警戒围栏',
        '码头临水防跌落围栏',
        '高压试验变电警戒围栏'
      ]
    }
  ],
  '气体告警': [
    {
      areaType: '有限空间',
      targets: [
        '全部有限空间',
        '1#液货舱密闭作业区',
        '2#双层底压载水舱',
        '机舱管路狭窄舱室',
        '特种涂层作业舱',
        '燃油日用舱',
        '舵机舱密闭舱室'
      ]
    },
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '船体外板涂装作业面',
        '分段焊接合拢作业面',
        '管系气密试验作业面',
        '1号船台搭载作业面 (185段)'
      ]
    }
  ],
  '安全帽脱落': [
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '1号船台搭载作业面 (185段)',
        '2号船台合拢作业面 (517段)',
        '船体外板涂装作业面',
        '船坞高处临边作业面',
        '总装车间胎架作业面',
        '舾装码头高空作业面'
      ]
    },
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '800T龙门吊运行警戒区围栏',
        '重件吊装坠落警戒围栏',
        '分段转运通行红线围栏',
        '码头吊装作业防线围栏'
      ]
    }
  ],
  '厂区吸烟': [
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '易燃易爆品仓库防爆围栏',
        '乙炔/氧气集中气站围栏',
        '油漆化工品周转库围栏',
        '涂装车间防爆警戒线'
      ]
    },
    {
      areaType: '有限空间',
      targets: [
        '全部有限空间',
        '1#液货舱密闭作业区',
        '2#双层底压载水舱',
        '机舱管路狭窄舱室',
        '特种涂层作业舱'
      ]
    },
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '船体外板涂装作业面',
        '1号船台搭载作业面 (185段)',
        '舾装码头高空作业面'
      ]
    }
  ],
  '厂区玩手机': [
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '1号船台搭载作业面 (185段)',
        '船坞高处临边作业面',
        '舷梯登船通道作业面',
        '总装车间胎架作业面',
        '舾装码头高空作业面'
      ]
    },
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '800T龙门吊运行警戒区围栏',
        '重件吊装坠落警戒围栏',
        '厂区主物流干道红线围栏',
        '平板运输车行驶通道警戒区'
      ]
    }
  ],
  '异常停留': [
    {
      areaType: '有限空间',
      targets: [
        '全部有限空间',
        '1#液货舱密闭作业区',
        '2#双层底压载水舱',
        '机舱管路狭窄舱室',
        '首尖舱密闭空间',
        '舵机舱密闭舱室'
      ]
    },
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '1号船台搭载作业面 (185段)',
        '船体外板涂装作业面',
        '船坞高处临边作业面',
        '分段焊接合拢作业面'
      ]
    },
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '800T龙门吊运行警戒区围栏',
        '高压试验变电警戒围栏',
        '射线探伤作业防区围栏',
        '重件吊装坠落警戒围栏'
      ]
    }
  ],
  '烟感告警': [
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '易燃易爆品仓库防爆围栏',
        '乙炔/氧气集中气站围栏',
        '油漆化工品周转库围栏',
        '涂装车间防爆警戒线'
      ]
    },
    {
      areaType: '有限空间',
      targets: [
        '全部有限空间',
        '1#液货舱密闭作业区',
        '机舱管路狭窄舱室',
        '特种涂层作业舱',
        '舵机舱密闭舱室'
      ]
    },
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '分段焊接合拢作业面',
        '总装车间胎架作业面',
        '船体外板涂装作业面',
        '1号船台搭载作业面 (185段)'
      ]
    }
  ],
  '安全员脱岗告警': [
    {
      areaType: '作业面',
      targets: [
        '全部作业面',
        '1号船台搭载作业面 (185段)',
        '2号船台合拢作业面 (517段)',
        '船坞高处临边作业面',
        '总装车间胎架作业面',
        '舾装码头高空作业面'
      ]
    },
    {
      areaType: '有限空间',
      targets: [
        '全部有限空间',
        '1#液货舱密闭作业区',
        '2#双层底压载水舱',
        '机舱管路狭窄舱室',
        '特种受限空间施工作业区',
        '首尖舱密闭空间',
        '舵机舱密闭舱室'
      ]
    },
    {
      areaType: '电子围栏',
      targets: [
        '全部电子围栏',
        '800T龙门吊运行警戒区围栏',
        '重件吊装坠落警戒围栏',
        '易燃易爆品仓库防爆围栏',
        '高压试验变电警戒围栏'
      ]
    }
  ]
};

// 通用后备选项列表（作业面、有限空间、电子围栏）
export const DEFAULT_AREA_OPTIONS: AreaOptionConfig[] = [
  {
    areaType: '作业面',
    targets: [
      '全部作业面',
      '1号船台搭载作业面 (185段)',
      '2号船台合拢作业面 (517段)',
      '船体外板涂装作业面',
      '总装车间胎架作业面',
      '舾装码头高空作业面'
    ]
  },
  {
    areaType: '有限空间',
    targets: [
      '全部有限空间',
      '1#液货舱密闭作业区',
      '2#双层底压载水舱',
      '机舱管路狭窄舱室',
      '首尖舱密闭空间',
      '舵机舱密闭舱室'
    ]
  },
  {
    areaType: '电子围栏',
    targets: [
      '全部电子围栏',
      '800T龙门吊运行警戒区围栏',
      '重件吊装坠落警戒围栏',
      '易燃易爆品仓库防爆围栏',
      '码头临水防跌落围栏'
    ]
  }
];

// 获取今天的日期字符串 YYYYMMDD
export function getTodayDateStr(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

interface AlarmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rule: AlarmRuleItem, isEdit: boolean) => void;
  editRule?: AlarmRuleItem | null; // 如果传入则为编辑模式，否则为新建模式
}

export function AlarmFormModal({ isOpen, onClose, onSubmit, editRule }: AlarmFormModalProps) {
  const isEdit = Boolean(editRule);

  // 表单字段状态
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  
  // 区域范围条件列表 (支持多条件组合)
  const [areaConditions, setAreaConditions] = useState([
    { type: '', relation: '是', target: '' }
  ]);

  // 人员范围条件列表 (支持多条件组合)
  const [personConditions, setPersonConditions] = useState([
    { scope: '', relation: '是', target: '' }
  ]);

  // 策略条件
  const [conditionType, setConditionType] = useState('');
  const [conditionOperator, setConditionOperator] = useState('');
  const [conditionValue, setConditionValue] = useState<number>(10);

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

  // 编辑模式特有：变更说明 / 备注
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

  // 当 editRule 发生变化时，回填表单
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (editRule) {
        // 编辑模式：回填
        setName(editRule.name || '');
        setType(editRule.type || '');
        
        if (editRule.areaConditions && editRule.areaConditions.length > 0) {
          setAreaConditions([...editRule.areaConditions]);
        } else {
          setAreaConditions([{ type: '作业面', relation: '是', target: '1号船台搭载作业面 (185段)' }]);
        }

        if (editRule.personConditions && editRule.personConditions.length > 0) {
          setPersonConditions([...editRule.personConditions]);
        } else {
          setPersonConditions([{ scope: '全厂工人', relation: '是', target: '全体施工人员' }]);
        }

        setConditionType(editRule.conditionType || '滞留超时时长');
        setConditionOperator(editRule.conditionOperator || '大于');
        setConditionValue(editRule.conditionValue ?? 10);

        // 解析低中高通知
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
        // 新建模式：重置为默认值
        setName('');
        setType('');
        setAreaConditions([{ type: '', relation: '是', target: '' }]);
        setPersonConditions([{ scope: '', relation: '是', target: '' }]);
        setConditionType('');
        setConditionOperator('');
        setConditionValue(10);
        setLowTarget('');
        setLowCountdown('');
        setLowUnit('分钟');
        setMidTarget('');
        setMidCountdown('');
        setMidUnit('分钟');
        setHighTarget('');
        setNotifySoundLight(true);
        setNotifySms(false);
        setAlarmInterval('不重复');
        setEffectivePeriod('永久');
        setStatus('启用');
        setChangeNotes('');
      }
    }
  }, [isOpen, editRule]);

  if (!isOpen) return null;

  // 策略类型选择联动处理：自动生成策略名称 + 动态联动切换区域范围
  const handleTypeChange = (selectedType: string) => {
    setType(selectedType);
    if (errorMsg) setErrorMsg('');

    // 需求2: 策略名称根据选择的类型名+日期自动生成命名 (格式如: 人员进入_20261104)，可自由修改
    const todayStr = getTodayDateStr();
    setName(`${selectedType}_${todayStr}`);

    // 需求3: 区域范围下拉选择根据类型不同选择的内容也动态不同
    const availableConfigs = POLICY_TYPE_AREA_MAP[selectedType] || DEFAULT_AREA_OPTIONS;
    const defaultAreaType = availableConfigs[0]?.areaType || '';
    const defaultTarget = availableConfigs[0]?.targets[0] || '';

    const validAreaTypes = availableConfigs.map(c => c.areaType);
    setAreaConditions(prev => {
      return prev.map(cond => {
        if (!cond.type || !validAreaTypes.includes(cond.type)) {
          return {
            type: defaultAreaType,
            relation: cond.relation || '是',
            target: defaultTarget
          };
        }
        const cfg = availableConfigs.find(c => c.areaType === cond.type);
        if (cfg && !cfg.targets.includes(cond.target)) {
          return {
            ...cond,
            target: cfg.targets[0] || ''
          };
        }
        return cond;
      });
    });

    // 针对 7 大策略类型智能预设判定条件与算子
    if (selectedType === '人员进入') {
      setConditionType('无进出许可进入');
      setConditionOperator('存在');
      setConditionValue(1);
    } else if (selectedType === '气体告警') {
      setConditionType('可燃气体超标浓度');
      setConditionOperator('大于');
      setConditionValue(15);
    } else if (selectedType === '安全帽脱落') {
      setConditionType('未戴安全帽持续帧数');
      setConditionOperator('大于');
      setConditionValue(3);
    } else if (selectedType === '厂区吸烟') {
      setConditionType('明火与吸烟AI判定');
      setConditionOperator('大于');
      setConditionValue(0);
    } else if (selectedType === '厂区玩手机') {
      setConditionType('滞留超时时长');
      setConditionOperator('大于');
      setConditionValue(2);
    } else if (selectedType === '异常停留') {
      setConditionType('静止不活动时长');
      setConditionOperator('大于');
      setConditionValue(10);
    } else if (selectedType === '烟感告警') {
      setConditionType('烟雾浓度与感温响应值');
      setConditionOperator('大于');
      setConditionValue(10);
    } else if (selectedType === '安全员脱岗告警' || selectedType === '安全员脱岗') {
      setConditionType('脱离指定监护区域时长');
      setConditionOperator('大于');
      setConditionValue(10);
      setPersonConditions([
        { scope: '指定人员', relation: '是', target: '现场当班专职安全员' }
      ]);
    }
  };

  // 添加区域条件
  const handleAddAreaCondition = () => {
    const currentAreaConfigs = type 
      ? (POLICY_TYPE_AREA_MAP[type] || DEFAULT_AREA_OPTIONS) 
      : DEFAULT_AREA_OPTIONS;
    const defaultAreaType = currentAreaConfigs[0]?.areaType || '作业面';
    const defaultTarget = currentAreaConfigs[0]?.targets[0] || '全部作业面';
    setAreaConditions([...areaConditions, { type: defaultAreaType, relation: '是', target: defaultTarget }]);
  };

  const handleRemoveAreaCondition = (idx: number) => {
    if (areaConditions.length <= 1) return;
    setAreaConditions(areaConditions.filter((_, i) => i !== idx));
  };

  // 添加人员条件
  const handleAddPersonCondition = () => {
    setPersonConditions([...personConditions, { scope: '', relation: '是', target: '' }]);
  };

  const handleRemovePersonCondition = (idx: number) => {
    if (personConditions.length <= 1) return;
    setPersonConditions(personConditions.filter((_, i) => i !== idx));
  };

  // 提交表单
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

    const now = new Date();
    const formattedNow = formatDateTime(now);

    // 计算主告警等级 (优先取有配置的最高等级或默认低)
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
      areaConditions: areaConditions.filter(c => c.type || c.target),
      personConditions: personConditions.filter(c => c.scope || c.target),
      conditionType: conditionType || '滞留超时时长',
      conditionOperator: conditionOperator || '大于',
      conditionValue: conditionValue,
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
      // ===== 编辑模式：生成新版本并追加至历史 =====
      const newVersionNum = getNextVersionNumber();
      const newVersionId = generateVersionId(newVersionNum);

      const newVersionRecord: AlarmRuleVersion = {
        versionId: newVersionId,
        versionNumber: newVersionNum,
        createdAt: formattedNow,
        modifier: '系统管理员',
        changeNotes: changeNotes.trim() || `编辑告警配置项，更新为 ${newVersionId}`,
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
        // 更新当前版本列表（新版本插入最前面）
        versions: [newVersionRecord, ...(editRule.versions || [])],
        // 更新激活属性
        areaConditions: snapshot.areaConditions,
        personConditions: snapshot.personConditions,
        conditionType: snapshot.conditionType,
        conditionOperator: snapshot.conditionOperator,
        conditionValue: snapshot.conditionValue,
        notifyTargets: snapshot.notifyTargets,
        notifyWays: snapshot.notifyWays,
        repeatInterval: snapshot.repeatInterval,
        effectivePeriod: snapshot.effectivePeriod
      };

      onSubmit(updatedRule, true);
    } else {
      // ===== 新建模式：初始生成 V1 =====
      const initialVersionId = generateVersionId(1);

      const initialVersionRecord: AlarmRuleVersion = {
        versionId: initialVersionId,
        versionNumber: 1,
        createdAt: formattedNow,
        modifier: '系统管理员',
        changeNotes: '初始创建告警配置策略',
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
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-slate-700 font-sans"
      >
        {/* 1. 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
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
                {isEdit 
                  ? '修改配置并保存后将自动归档历史快照并递增生成新的告警版本编号' 
                  : '先选择策略类型自动生成命名，并联动动态配置作业区域范围、人员过滤与升级策略'}
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

          {/* 版本递增提示横幅 (编辑模式) */}
          {isEdit && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>版本自动递增机制：</strong>本次保存后将自动归档当前版本（{editRule?.currentVersion}），并生成最新版本 <strong>{nextVersionId}</strong>。
                </span>
              </div>
              <div className="font-mono text-[11px] text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300/60">
                按 V{getNextVersionNumber()}-{nextVersionId.split('-')[1]} 命名
              </div>
            </div>
          )}

          {/* 策略类型 (优先选择) */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>策略类型
            </label>
            <div className="flex-1">
              <select 
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-[13px] bg-white cursor-pointer font-medium"
              >
                <option value="" disabled hidden>请选择策略类型</option>
                {ALARM_POLICY_TYPES.map(policyType => (
                  <option key={policyType} value={policyType}>
                    {policyType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 告警策略名称 (根据选择的类型名+日期自动生成，可手动修改) */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>告警策略名称
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
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-[13px]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono pointer-events-none">
                {name.length} / 255
              </span>
            </div>
          </div>

          {/* 区域范围 (根据策略类型动态联动匹配可用区域分类及目标) */}
          <div className="flex items-start">
            <label className="w-28 text-right pr-4 pt-2 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>区域范围
            </label>
            <div className="flex-1 space-y-2">
              {areaConditions.map((cond, idx) => {
                // 动态获取匹配当前策略类型的区域配置（如：人员进入只关联 作业面、有限空间）
                const currentAreaConfigs = type 
                  ? (POLICY_TYPE_AREA_MAP[type] || DEFAULT_AREA_OPTIONS) 
                  : DEFAULT_AREA_OPTIONS;
                
                const selectedCfg = currentAreaConfigs.find(c => c.areaType === cond.type);
                const currentTargets = selectedCfg ? selectedCfg.targets : (cond.target ? [cond.target] : []);

                return (
                  <div key={idx} className="flex items-center gap-2.5">
                    {/* 区域类型选择 */}
                    <select 
                      value={cond.type}
                      onChange={(e) => {
                        const selectedAreaType = e.target.value;
                        const updated = [...areaConditions];
                        updated[idx].type = selectedAreaType;

                        // 联动该区域类型的首选目标
                        const cfg = currentAreaConfigs.find(c => c.areaType === selectedAreaType);
                        if (cfg && cfg.targets.length > 0) {
                          updated[idx].target = cfg.targets[0];
                        }
                        setAreaConditions(updated);
                      }}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
                    >
                      <option value="" disabled hidden>请选择区域类型</option>
                      {currentAreaConfigs.map(cfg => (
                        <option key={cfg.areaType} value={cfg.areaType}>
                          {cfg.areaType}
                        </option>
                      ))}
                    </select>

                    {/* 关系 */}
                    <select 
                      value={cond.relation}
                      onChange={(e) => {
                        const updated = [...areaConditions];
                        updated[idx].relation = e.target.value;
                        setAreaConditions(updated);
                      }}
                      className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
                    >
                      <option value="是">是 (在区域内)</option>
                      <option value="否">否 (排除/不在区域内)</option>
                    </select>

                    {/* 具体目标区域 */}
                    <select 
                      value={cond.target}
                      onChange={(e) => {
                        const updated = [...areaConditions];
                        updated[idx].target = e.target.value;
                        setAreaConditions(updated);
                      }}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
                    >
                      <option value="" disabled hidden>请选择指定区域</option>
                      {cond.target && !currentTargets.includes(cond.target) && (
                        <option value={cond.target}>{cond.target}</option>
                      )}
                      {currentTargets.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    {areaConditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAreaCondition(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="删除此条件"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddAreaCondition}
                className="flex items-center gap-1 text-[#1677ff] bg-[#e6f4ff] hover:bg-[#bae0ff] border border-[#91caff] px-3 py-1 rounded-lg text-xs font-medium transition-colors mt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 添加（并且）区域条件
              </button>
            </div>
          </div>

          {/* 人员范围 */}
          <div className="flex items-start">
            <label className="w-28 text-right pr-4 pt-2 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>人员范围
            </label>
            <div className="flex-1 space-y-2">
              {personConditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <select 
                    value={cond.scope}
                    onChange={(e) => {
                      const updated = [...personConditions];
                      const selectedScope = e.target.value;
                      updated[idx].scope = selectedScope;
                      if (selectedScope === '单据指定安全员/监护人') {
                        updated[idx].target = '单据登记之当班安全员 (如 周卫国)';
                      }
                      setPersonConditions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
                  >
                    <option value="" disabled hidden>请选择工人人员范围</option>
                    <option value="单据指定安全员/监护人">单据指定安全员/监护人 (⚡精准锁定单据主体)</option>
                    <option value="工种类别">工种类别</option>
                    <option value="作业班组">作业班组</option>
                    <option value="部门">部门</option>
                    <option value="指定人员">指定人员</option>
                    <option value="全厂工人">全厂工人</option>
                  </select>

                  <select 
                    value={cond.relation}
                    onChange={(e) => {
                      const updated = [...personConditions];
                      updated[idx].relation = e.target.value;
                      setPersonConditions(updated);
                    }}
                    className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
                  >
                    <option value="是">是 (包含目标)</option>
                    <option value="否">否 (排除目标)</option>
                  </select>

                  <select 
                    value={cond.target}
                    onChange={(e) => {
                      const updated = [...personConditions];
                      updated[idx].target = e.target.value;
                      setPersonConditions(updated);
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
                  >
                    <option value="" disabled hidden>请选择具体对象</option>
                    <option value="单据登记之当班安全员 (如 周卫国)">单据登记之当班安全员 (如 周卫国)</option>
                    <option value="焊接工">焊接工</option>
                    <option value="装配钳工">装配钳工</option>
                    <option value="探伤质检员">探伤质检员</option>
                    <option value="起重工">起重工</option>
                    <option value="电工">电工</option>
                    <option value="外包施工人员">外包施工人员</option>
                    <option value="全体施工人员">全体施工人员</option>
                  </select>

                  {personConditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePersonCondition(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors"
                      title="删除此条件"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPersonCondition}
                className="flex items-center gap-1 text-[#1677ff] bg-[#e6f4ff] hover:bg-[#bae0ff] border border-[#91caff] px-3 py-1 rounded-lg text-xs font-medium transition-colors mt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 添加（并且）人员条件
              </button>
            </div>
          </div>

          {/* 策略条件 */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>策略条件
            </label>
            <div className="flex-1 flex items-center gap-3">
              <select 
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white font-medium"
              >
                <option value="" disabled hidden>请选择策略条件</option>
                <option value="脱离指定区域时长">脱离指定区域时长 (缺岗/脱岗判别)</option>
                <option value="连续缺岗时长">连续缺岗时长</option>
                <option value="滞留超时时长">滞留超时时长</option>
                <option value="可燃气体超标浓度">可燃气体超标浓度</option>
                <option value="静止不活动时长">静止不活动时长</option>
                <option value="无进出许可进入">无进出许可进入</option>
                <option value="未佩戴定位手环">未佩戴定位手环</option>
                <option value="防拆触点断开触发">防拆触点断开触发</option>
                <option value="烟雾浓度超标">烟雾浓度超标</option>
              </select>

              <select 
                value={conditionOperator}
                onChange={(e) => setConditionOperator(e.target.value)}
                className="w-32 px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 text-[13px] bg-white"
              >
                <option value="" disabled hidden>请选择</option>
                <option value="大于">大于</option>
                <option value="大于等于">大于等于</option>
                <option value="小于">小于</option>
                <option value="等于">等于</option>
                <option value="存在">存在</option>
              </select>

              {/* 步进器 */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setConditionValue(Math.max(0, conditionValue - 1))}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border-r border-slate-200 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input 
                  type="number"
                  value={conditionValue}
                  onChange={(e) => setConditionValue(Number(e.target.value) || 0)}
                  className="w-16 py-1.5 text-center text-slate-800 text-[13px] font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setConditionValue(conditionValue + 1)}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border-l border-slate-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 通知人员表格 */}
          <div className="flex items-start">
            <label className="w-28 text-right pr-4 pt-2 text-slate-600 shrink-0 font-medium">
              <span className="text-red-500 mr-1">*</span>通知人员
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
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px] bg-white"
                      >
                        <option value="" disabled hidden>请选择通知对象</option>
                        <option value="现场施工班组长">现场施工班组长</option>
                        <option value="当班区域安全员">当班区域安全员</option>
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
                          className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-[13px] bg-white"
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
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px] bg-white"
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
                          className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-[13px] bg-white"
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
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[13px] bg-white"
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
              通知方式
            </label>
            <div className="flex items-center gap-6 text-slate-700">
              {!(type === '标签防拆' || type.includes('防拆')) && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifySoundLight}
                    onChange={(e) => setNotifySoundLight(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <span>声光报警通知</span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span>发送短信通知</span>
              </label>

              {(type === '标签防拆' || type.includes('防拆')) && (
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  标签防拆告警类型下仅保留发送短信通知
                </span>
              )}
            </div>
          </div>

          {/* 告警间隔 */}
          <div className="flex items-center">
            <label className="w-28 text-right pr-4 text-slate-600 shrink-0 font-medium">
              告警间隔
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
              生效周期
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
              <span className="text-red-500 mr-1">*</span>启用状态
            </label>
            <div className="flex items-center gap-6 text-slate-700">
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
            </div>
          </div>

          {/* 编辑模式下的变更说明 */}
          {isEdit && (
            <div className="flex items-start pt-2 border-t border-slate-100">
              <label className="w-28 text-right pr-4 pt-2 text-slate-600 shrink-0 font-medium">
                版本变更说明
              </label>
              <div className="flex-1">
                <textarea
                  value={changeNotes}
                  onChange={(e) => setChangeNotes(e.target.value)}
                  placeholder={`请简述本次版本更新的变动内容（如：调整了某船台触发条件或通知链）`}
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
              <span>初始版本: <strong className="text-blue-600">{nextVersionId}</strong></span>
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
