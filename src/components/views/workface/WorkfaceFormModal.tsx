/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 智慧船厂 - 作业面管理：新增 / 编辑作业面表单模态框
 * 优化重点：
 * 1. 顶部新增作业面类型单选标签 (有限空间 / 通用作业面)
 * 2. 移除定员上限、开工日期、完工日期及作业时段
 * 3. 步骤简化合并为：【基础信息】与【责任与安全要求】
 * 4. 归属类型造船项目改造为【建造船模选择】，动态关联船模管理中的船模类型，并加载二级分层与标高
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Layers, 
  ShieldAlert, 
  ShieldCheck,
  FileText, 
  Users, 
  Radio, 
  Flame, 
  Video, 
  Bell, 
  Plus, 
  Trash2,
  Check,
  AlertCircle,
  Building2,
  MapPin,
  Compass,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  PenTool,
  ChevronDown,
  Box,
  Ship,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  WorkfaceRecord, 
  WorkfaceBaseStation, 
  WorkfaceGasDetector, 
  WorkfaceCamera, 
  WorkfaceAlarmDevice,
  WorkfaceBelongingType,
  WorkfaceFence,
  WorkfaceAreaDefinition,
  SafetyOfficerItem,
  SHIPYARD_SAFETY_OFFICERS,
  SOUTHEAST_SHIPYARD_ZONES,
  PROJECT_FLOOR_OPTIONS
} from '@/src/data/workfaceData';
import { MOCK_PROJECTS } from '@/src/data/mockProjects';
import { 
  getStoredShipModels, 
  ShipModel, 
  ShipLayer 
} from '@/src/data/shipModelData';
import { Workface3DSpatialDrawModal } from './Workface3DSpatialDrawModal';
import { SafetyOfficerSelect } from './SafetyOfficerSelect';

interface WorkfaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: WorkfaceRecord) => void;
  initialData?: WorkfaceRecord | null;
  activeType?: 'workface' | 'confinedSpace';
  isShipModelConfinedMode?: boolean;
}

// 候选主基站库 (定位主基站必选项)
const CANDIDATE_BASE_STATIONS = [
  { id: 'BS-LNG-01', name: '1#液货舱主基站', code: 'DEV-BS-05', type: '主基站 (防爆UWB)', status: 'online' as const, ip: '192.168.10.21', coverage: '35m半径' },
  { id: 'BS-LNG-02', name: 'LNG艉部合拢主基站', code: 'DEV-BS-07', type: '主基站 (超宽带)', status: 'online' as const, ip: '192.168.10.22', coverage: '25m半径' },
  { id: 'BS-BOX-01', name: '10#箱位导轨主基站', code: 'DEV-BS-08', type: '主基站 (超宽带)', status: 'online' as const, ip: '192.168.10.31', coverage: '40m半径' },
  { id: 'BS-ENG-01', name: '机舱作业面主基站', code: 'LNG-BS-W02', type: '主基站 (防爆UWB)', status: 'online' as const, ip: '192.168.10.23', coverage: '30m半径' },
  { id: 'BS-PCTC-01', name: '滚装跳板作业面主基站', code: 'PCTC-BS-W01', type: '主基站 (工业级)', status: 'online' as const, ip: '192.168.10.45', coverage: '30m半径' },
  { id: 'BS-BULK-01', name: '1#大舱舷梯口主基站', code: 'BULK-BS-W01', type: '主基站 (防爆UWB)', status: 'online' as const, ip: '192.168.10.51', coverage: '25m半径' },
  { id: 'BS-WIND-01', name: '桩腿高空作业面主基站', code: 'WIND-BS-W01', type: '主基站 (高空专用)', status: 'online' as const, ip: '192.168.10.61', coverage: '30m半径' },
  { id: 'BS-SUP-01', name: '驾驶台通导主基站', code: 'DEV-BS-09', type: '主基站 (高精度)', status: 'online' as const, ip: '192.168.10.72', coverage: '25m半径' },
  { id: 'BS-CRANE-01', name: '龙门吊G-01主基站', code: 'DEV-BS-02', type: '主基站 (露天重载)', status: 'online' as const, ip: '192.168.10.15', coverage: '50m半径' }
];

// 候选环境检测设备库 (按需开启)
const CANDIDATE_GAS_DETECTORS = [
  { id: 'GAS-01', sn: 'GAS-LNG-101', name: '1#液货舱防爆四合一环境检测仪', status: 'online' as const, readings: { o2: '20.9%', ch4: '0% LEL', co: '4 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' },
  { id: 'GAS-02', sn: 'GAS-LNG-102', name: '底板汇流排移动式环境检测探头', status: 'online' as const, readings: { o2: '20.8%', ch4: '2% LEL', co: '6 ppm', h2s: '0.1 ppm' }, lastUpdate: '刚刚' },
  { id: 'GAS-03', sn: 'GAS-BOX-201', name: '10#箱位固定式环境检测仪', status: 'online' as const, readings: { o2: '20.9%', ch4: '0% LEL', co: '2 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' },
  { id: 'GAS-04', sn: 'GAS-ENG-101', name: '机舱双燃料低位气体环境探头', status: 'online' as const, readings: { o2: '20.7%', ch4: '1% LEL', co: '5 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' },
  { id: 'GAS-05', sn: 'GAS-BLK-301', name: '双层底压载舱气体环境在线监测仪', status: 'warning' as const, readings: { o2: '19.4%', ch4: '0% LEL', co: '8 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' },
  { id: 'GAS-06', sn: 'GAS-WND-401', name: '桩腿高空防爆环境检测仪', status: 'online' as const, readings: { o2: '20.9%', ch4: '0% LEL', co: '1 ppm', h2s: '0.0 ppm' }, lastUpdate: '刚刚' }
];

const CANDIDATE_CAMERAS = [
  { id: 'CAM-01', name: '1#绝热合拢高点AI防爆球机', type: '防爆云台球机' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.201:554/live/stream1', currentChannel: 'CH-01' },
  { id: 'CAM-02', name: '舱口人员进出识别布控球', type: '防爆布控球' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.202:554/live/stream1', currentChannel: 'CH-02' },
  { id: 'CAM-03', name: '6号船台龙门吊吊运全景球机', type: '防爆云台球机' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.203:554/live/stream1', currentChannel: 'CH-03' },
  { id: 'CAM-04', name: '机舱中层平台监控枪机', type: 'AI抓拍枪机' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.204:554/live/stream1', currentChannel: 'CH-04' },
  { id: 'CAM-05', name: '艉部跳板抓拍AI摄像机', type: 'AI抓拍枪机' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.205:554/live/stream1', currentChannel: 'CH-05' },
  { id: 'CAM-06', name: '舱口防爆监护球机', type: '防爆布控球' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.206:554/live/stream1', currentChannel: 'CH-06' },
  { id: 'CAM-07', name: '风电桩腿高点AI云台摄像机', type: '防爆云台球机' as const, status: 'online' as const, rtspUrl: 'rtsp://192.168.10.207:554/live/stream1', currentChannel: 'CH-07' }
];

const CANDIDATE_ALARMS = [
  { id: 'ALM-DEV-01', name: '1#舱口防爆声光报警器', type: '防爆声光报警器' as const, status: 'online' as const, lastTestTime: '2026-09-28 16:30' },
  { id: 'ALM-DEV-02', name: '导轨架起吊垂直投影声光报警器', type: '防爆声光报警器' as const, status: 'online' as const, lastTestTime: '2026-09-29 09:00' },
  { id: 'ALM-DEV-03', name: '机舱出入口声光报警器', type: '防爆声光报警器' as const, status: 'online' as const, lastTestTime: '2026-09-27 11:20' },
  { id: 'ALM-DEV-04', name: '跳板动载升降警戒声光器', type: '防爆声光报警器' as const, status: 'online' as const, lastTestTime: '2026-09-26 14:00' },
  { id: 'ALM-DEV-05', name: '密闭舱口缺氧联动声光器', type: '防爆声光报警器' as const, status: 'online' as const, lastTestTime: '2026-09-28 10:00' },
  { id: 'ALM-DEV-06', name: '高空防坠失联联动声光器', type: '现场广播喇叭' as const, status: 'online' as const, lastTestTime: '2026-09-25 15:00' }
];

const COMMON_SAFETY_MEASURES = [
  '进入密闭受限空间前强制机械通风30分钟以上并完成准入检测',
  '作业全过程开启4合1便携及固定式气体连续在线监测',
  '所有进出人员100%佩戴本安型防爆定位工牌',
  '动火作业需专职安全员现场全时旁站监护并配备干粉灭火器',
  '高空作业严格佩戴五点双大钩安全带并双钩互锁挂扣',
  '起吊作业垂直投影下方严禁任何人员滞留 (联动声光告警)',
  '作业区域外围设置电子围栏并专设应急呼叫喇叭与撤离指示'
];

export function WorkfaceFormModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  activeType,
  isShipModelConfinedMode = false
}: WorkfaceFormModalProps) {
  // 模式判定 (优先使用 activeType, 其次 isShipModelConfinedMode)
  const isConfinedMode = activeType 
    ? activeType === 'confinedSpace' 
    : (isShipModelConfinedMode || initialData?.workfaceType === '有限空间' || initialData?.belongingType === 'project');

  // 表单活动标签页：合并为两步【基础信息】与【责任与安全要求】
  const [activeTab, setActiveTab] = useState<'basic' | 'responsibilityAndSafety'>('basic');
  
  // 作业面/有限空间类型
  const [workfaceType, setWorkfaceType] = useState<'有限空间' | '通用作业面'>(
    isConfinedMode ? '有限空间' : '通用作业面'
  );

  // 基本字段
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [capacityLimit, setCapacityLimit] = useState<number>(15);
  
  // 归属区域类型: 船厂厂区 | 建造船模选择 (原造船项目)
  const [belongingType, setBelongingType] = useState<WorkfaceBelongingType>('yard');
  
  // 1. 厂区二级联动状态 (东南造船基地平面图)
  const [yardZoneId, setYardZoneId] = useState<string>(SOUTHEAST_SHIPYARD_ZONES[0].id);
  const [yardSubAreaId, setYardSubAreaId] = useState<string>(SOUTHEAST_SHIPYARD_ZONES[0].subAreas[0].id);

  // 船舶建造项目关联选择 (一级：项目列表，二级：分层位置) 与容积 (m³) 业务要素
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-2026-LNG01');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('middle');
  const [elevation, setElevation] = useState<string>('+8.0m ~ +16.0m');
  const [volume, setVolume] = useState<string>('1200');

  // 仅筛选在建状态的船舶项目
  const inProgressProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => p.status === 'in_progress');
  }, []);

  // 引用关联在建项目列表选择 (默认为所有在建状态的船舶项目全选)
  const [selectedLinkedProjectIds, setSelectedLinkedProjectIds] = useState<string[]>([]);

  // 船模管理有限空间模式专用的 3D 船模选择状态
  const [shipModelsList, setShipModelsList] = useState<ShipModel[]>([]);
  const [selectedShipModelId, setSelectedShipModelId] = useState<string>('');
  const [selectedShipLayerId, setSelectedShipLayerId] = useState<string>('');

  // 作业基本属性
  const [workType, setWorkType] = useState<WorkfaceRecord['workType']>('合拢焊接');
  const [riskLevel, setRiskLevel] = useState<WorkfaceRecord['riskLevel']>('重大风险(红)');
  const [status, setStatus] = useState<WorkfaceRecord['status']>('active');

  // 作业面区域划定数据状态
  const [areaDemarcationType, setAreaDemarcationType] = useState<string>('作业区');
  const [areaDemarcationShape, setAreaDemarcationShape] = useState<string>('矩形');
  const [areaDemarcationColor, setAreaDemarcationColor] = useState<string>('#3b82f6');
  const [drawnCoordinatesText, setDrawnCoordinatesText] = useState<string>('[25.4, 25.8  58.2, 25.8  58.2, 68.4  25.4, 68.4]');
  const [is3DModalOpen, setIs3DModalOpen] = useState<boolean>(false);
  const [isAddStationOpen, setIsAddStationOpen] = useState<boolean>(false);
  const [stationSearchQuery, setStationSearchQuery] = useState<string>('');

  // 空间多边形/矩形坐标数据
  const [fence, setFence] = useState<WorkfaceFence>({
    type: 'rectangle',
    points: [
      { x: 18, y: 20 },
      { x: 82, y: 20 },
      { x: 82, y: 76 },
      { x: 18, y: 76 }
    ],
    area: '3,630 ㎡',
    perimeter: '302 m',
    status: 'active'
  });

  // 设备关联
  const [selectedBaseStationIds, setSelectedBaseStationIds] = useState<string[]>(['BS-LNG-01']);
  const [enableGasDetectors, setEnableGasDetectors] = useState<boolean>(false);
  const [selectedGasDetectorIds, setSelectedGasDetectorIds] = useState<string[]>([]);
  const [enableCameras, setEnableCameras] = useState<boolean>(false);
  const [selectedCameraIds, setSelectedCameraIds] = useState<string[]>([]);
  const [enableAlarms, setEnableAlarms] = useState<boolean>(false);
  const [selectedAlarmIds, setSelectedAlarmIds] = useState<string[]>([]);

  // 步骤二：责任与安全要求 (合并安全要求与责任)
  const [selectedOfficers, setSelectedOfficers] = useState<SafetyOfficerItem[]>([
    SHIPYARD_SAFETY_OFFICERS[0]
  ]);
  const [safetyOfficer, setSafetyOfficer] = useState('周卫国');
  const [safetyOfficerPhone, setSafetyOfficerPhone] = useState('13812345601');
  const [teamName, setTeamName] = useState('船体二分厂-绝热结构合拢班');
  const [teamLeader, setTeamLeader] = useState('赵宏');
  const [teamLeaderPhone, setTeamLeaderPhone] = useState('13955667788');

  // 安全防范与说明
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [customMeasureInput, setCustomMeasureInput] = useState('');
  const [description, setDescription] = useState('');

  // 错误提示
  const [errorMsg, setErrorMsg] = useState('');

  // 获取当前选中的 3D 船模型对象 (船模管理模式)
  const currentShipModelObj = useMemo(() => {
    return shipModelsList.find(m => m.id === selectedShipModelId) || shipModelsList[0];
  }, [shipModelsList, selectedShipModelId]);

  // 获取当前选中的 3D 船模层级对象 (船模管理模式)
  const currentShipLayerObj = useMemo(() => {
    if (!currentShipModelObj?.layers?.length) return null;
    return currentShipModelObj.layers.find(l => l.id === selectedShipLayerId) || currentShipModelObj.layers[0];
  }, [currentShipModelObj, selectedShipLayerId]);

  // 当选择不同 3D 船模时
  const handleShipModelChange = (modelId: string) => {
    setSelectedShipModelId(modelId);
    const targetModel = shipModelsList.find(m => m.id === modelId);
    if (targetModel && targetModel.layers.length > 0) {
      setSelectedShipLayerId(targetModel.layers[0].id);
      setElevation(targetModel.layers[0].elevationRange);
    }
  };

  // 当选择不同 3D 船模分层时
  const handleShipLayerChange = (layerId: string) => {
    setSelectedShipLayerId(layerId);
    if (currentShipModelObj) {
      const targetLayer = currentShipModelObj.layers.find(l => l.id === layerId);
      if (targetLayer) {
        setElevation(targetLayer.elevationRange);
      }
    }
  };

  // 获取当前选中的船舶建造项目
  const currentProject = useMemo(() => {
    return MOCK_PROJECTS.find(p => p.id === selectedProjectId) || MOCK_PROJECTS[0];
  }, [selectedProjectId]);

  // 获取当前选中的楼层分层
  const currentFloor = useMemo(() => {
    return PROJECT_FLOOR_OPTIONS.find(f => f.id === selectedFloorId) || PROJECT_FLOOR_OPTIONS[0];
  }, [selectedFloorId]);

  // 当选择不同船舶建造项目时
  const handleProjectChange = (prjId: string) => {
    setSelectedProjectId(prjId);
  };

  // 当选择不同分层时，自动联动标高范围
  const handleFloorChange = (floorId: string) => {
    setSelectedFloorId(floorId);
    const found = PROJECT_FLOOR_OPTIONS.find(f => f.id === floorId);
    if (found) {
      setElevation(found.elevation);
    }
  };

  // 三维空间区域划定保存回调
  const handle3DSpatialSave = (result: {
    coordinatesText: string;
    points: { x: number; y: number }[];
    coveredBaseStationIds: string[];
    areaSize: string;
    perimeter: string;
  }) => {
    setDrawnCoordinatesText(result.coordinatesText);
    setFence({
      type: areaDemarcationShape === '矩形' ? 'rectangle' : 'polygon',
      points: result.points,
      area: result.areaSize,
      perimeter: result.perimeter,
      status: 'active'
    });
    // 空间框选识别出基站设备后自动合并关联
    if (result.coveredBaseStationIds && result.coveredBaseStationIds.length > 0) {
      setSelectedBaseStationIds(prev => Array.from(new Set([...prev, ...result.coveredBaseStationIds])));
    }
  };

  // 辅助获取当前选中的厂区区域与工位
  const currentYardZone = SOUTHEAST_SHIPYARD_ZONES.find(z => z.id === yardZoneId) || SOUTHEAST_SHIPYARD_ZONES[0];
  const currentYardSubArea = currentYardZone.subAreas.find(s => s.id === yardSubAreaId) || currentYardZone.subAreas[0];

  // 初始化填充数据
  useEffect(() => {
    const storedModels = getStoredShipModels();
    setShipModelsList(storedModels);

    if (isConfinedMode) {
      setWorkfaceType('有限空间');
      setBelongingType('project');
      
      let foundModelId = storedModels[0]?.id || 'M-001';
      if (initialData?.shipModelId && storedModels.some(m => m.id === initialData.shipModelId)) {
        foundModelId = initialData.shipModelId;
      } else if (initialData?.projectId && storedModels.some(m => m.id === initialData.projectId)) {
        foundModelId = initialData.projectId;
      }
      setSelectedShipModelId(foundModelId);

      const targetModel = storedModels.find(m => m.id === foundModelId) || storedModels[0];
      let foundLayerId = targetModel?.layers[0]?.id || 'L-01';
      if (initialData?.shipModelLayerId && targetModel?.layers.some(l => l.id === initialData.shipModelLayerId)) {
        foundLayerId = initialData.shipModelLayerId;
      } else if (initialData?.modelLevel && targetModel?.layers.some(l => l.id === initialData.modelLevel)) {
        foundLayerId = initialData.modelLevel;
      }
      setSelectedShipLayerId(foundLayerId);

      const targetLayer = targetModel?.layers.find(l => l.id === foundLayerId) || targetModel?.layers[0];
      if (targetLayer) {
        setElevation(targetLayer.elevationRange);
      }
    } else {
      setWorkfaceType('通用作业面');
      setBelongingType('yard');
    }

    if (initialData) {
      // 回填作业面类型
      setWorkfaceType(initialData.workfaceType || (initialData.workType === '密闭舱室作业' ? '有限空间' : '通用作业面'));
      setCode(initialData.code);
      setName(initialData.name);
      setCapacityLimit(initialData.capacityLimit ?? 15);
      setBelongingType(initialData.belongingType || (initialData.yardZoneId ? 'yard' : 'project'));
      setYardZoneId(initialData.yardZoneId || SOUTHEAST_SHIPYARD_ZONES[0].id);
      setYardSubAreaId(initialData.yardSubAreaId || SOUTHEAST_SHIPYARD_ZONES[0].subAreas[0].id);

      // 船舶建造项目与分层回填
      if (initialData.projectId && MOCK_PROJECTS.some(p => p.id === initialData.projectId)) {
        setSelectedProjectId(initialData.projectId);
      } else {
        setSelectedProjectId(MOCK_PROJECTS[0].id);
      }

      if (initialData.modelLevel && PROJECT_FLOOR_OPTIONS.some(f => f.id === initialData.modelLevel)) {
        setSelectedFloorId(initialData.modelLevel);
        const found = PROJECT_FLOOR_OPTIONS.find(f => f.id === initialData.modelLevel);
        if (found) setElevation(found.elevation);
      } else {
        setSelectedFloorId(PROJECT_FLOOR_OPTIONS[0].id);
        setElevation(PROJECT_FLOOR_OPTIONS[0].elevation);
      }

      setElevation(initialData.elevation || '+8.0m ~ +16.0m');
      setVolume(initialData.volume || '1200');
      setWorkType(initialData.workType);
      setRiskLevel(initialData.riskLevel);
      setStatus(initialData.status === 'draft' ? 'active' : initialData.status);

      // 安全员解析与回填
      if (initialData.safetyOfficers && initialData.safetyOfficers.length > 0) {
        setSelectedOfficers(initialData.safetyOfficers);
      } else if (initialData.safetyOfficer) {
        const names = initialData.safetyOfficer.split(/[、,，\s]+/).filter(Boolean);
        const matched = names.map(n => {
          const found = SHIPYARD_SAFETY_OFFICERS.find(o => o.name === n);
          return found || {
            id: `SO-${n}`,
            name: n,
            phone: initialData.safetyOfficerPhone || '13812345601',
            department: '造船工程安监科',
            role: '专职安全员',
            certNumber: 'SA-2024-DEF'
          };
        });
        setSelectedOfficers(matched.length > 0 ? matched : [SHIPYARD_SAFETY_OFFICERS[0]]);
      } else {
        setSelectedOfficers([SHIPYARD_SAFETY_OFFICERS[0]]);
      }

      // 作业面区域划定与三维坐标回填
      if (initialData.areaDefinition) {
        setAreaDemarcationType(initialData.areaDefinition.areaType || '作业区');
        setAreaDemarcationShape(initialData.areaDefinition.areaShape || '矩形');
        setAreaDemarcationColor(initialData.areaDefinition.areaColor || '#3b82f6');
        setDrawnCoordinatesText(
          initialData.areaDefinition.coordinatesText || 
          (initialData.fence?.points?.length 
            ? `[${initialData.fence.points.map(p => `${p.x.toFixed(1)}, ${p.y.toFixed(1)}`).join('  ')}]` 
            : '[25.4, 25.8  58.2, 25.8  58.2, 68.4  25.4, 68.4]')
        );
      } else if (initialData.fence?.points?.length) {
        setDrawnCoordinatesText(`[${initialData.fence.points.map(p => `${p.x.toFixed(1)}, ${p.y.toFixed(1)}`).join('  ')}]`);
      } else {
        setDrawnCoordinatesText('[25.4, 25.8  58.2, 25.8  58.2, 68.4  25.4, 68.4]');
      }

      if (initialData.fence) {
        setFence(initialData.fence);
      }

      setSafetyOfficer(initialData.safetyOfficer);
      setSafetyOfficerPhone(initialData.safetyOfficerPhone);
      setTeamName(initialData.teamName);
      setTeamLeader(initialData.teamLeader);
      setTeamLeaderPhone(initialData.teamLeaderPhone);

      // 设备回填与按需开启判定
      const bsIds = initialData.boundBaseStations?.map(b => b.id) || [];
      setSelectedBaseStationIds(bsIds.length > 0 ? bsIds : ['BS-LNG-01']);

      const gasIds = initialData.boundGasDetectors?.map(g => g.id) || [];
      setSelectedGasDetectorIds(gasIds);
      setEnableGasDetectors(gasIds.length > 0 || initialData.workfaceType === '有限空间');

      const camIds = initialData.boundCameras?.map(c => c.id) || [];
      setSelectedCameraIds(camIds);
      setEnableCameras(camIds.length > 0);

      const almIds = initialData.boundAlarms?.map(a => a.id) || [];
      setSelectedAlarmIds(almIds);
      setEnableAlarms(almIds.length > 0);

      setSelectedMeasures(initialData.safetyMeasures || []);
      setDescription(initialData.description || '');

      // 引用关联在建项目列表回填 (默认为所有在建状态的船舶项目全选)
      if (initialData.linkedProjectIds && initialData.linkedProjectIds.length > 0) {
        setSelectedLinkedProjectIds(initialData.linkedProjectIds);
      } else {
        setSelectedLinkedProjectIds(inProgressProjects.map(p => p.id));
      }
    } else {
      // 默认生成编号
      const randomSeq = Math.floor(100 + Math.random() * 900);
      setWorkfaceType('通用作业面');
      setCode(`WF-AUTO-${randomSeq}`);
      setName('');
      setCapacityLimit(15);
      setBelongingType('yard');
      setYardZoneId(SOUTHEAST_SHIPYARD_ZONES[0].id);
      setYardSubAreaId(SOUTHEAST_SHIPYARD_ZONES[0].subAreas[0].id);
      
      setSelectedProjectId(MOCK_PROJECTS[0].id);
      setSelectedFloorId(PROJECT_FLOOR_OPTIONS[0].id);
      setElevation(PROJECT_FLOOR_OPTIONS[0].elevation);

      setWorkType('合拢焊接');
      setVolume('1200');
      setRiskLevel('重大风险(红)');
      setStatus('active');
      setSelectedOfficers([SHIPYARD_SAFETY_OFFICERS[0]]);
      setSafetyOfficer(SHIPYARD_SAFETY_OFFICERS[0].name);
      setSafetyOfficerPhone(SHIPYARD_SAFETY_OFFICERS[0].phone);
      setTeamName('总装分厂-分段总组一班');
      setTeamLeader('陈志强');
      setTeamLeaderPhone('13959012302');
      
      // 主基站必选：默认选中1台，其余三类设备默认不开启
      setSelectedBaseStationIds(['BS-LNG-01']);
      setEnableGasDetectors(false);
      setSelectedGasDetectorIds([]);
      setEnableCameras(false);
      setSelectedCameraIds([]);
      setEnableAlarms(false);
      setSelectedAlarmIds([]);
      
      // 作业面区域划定默认参数
      setAreaDemarcationType('作业区');
      setAreaDemarcationShape('矩形');
      setAreaDemarcationColor('#3b82f6');
      setDrawnCoordinatesText('[25.4, 25.8  58.2, 25.8  58.2, 68.4  25.4, 68.4]');
      setIsAddStationOpen(false);
      
      setFence({
        type: 'rectangle',
        points: [
          { x: 18, y: 20 },
          { x: 82, y: 20 },
          { x: 82, y: 76 },
          { x: 18, y: 76 }
        ],
        area: '3,630 ㎡',
        perimeter: '302 m',
        status: 'active'
      });

      setSelectedMeasures(COMMON_SAFETY_MEASURES.slice(0, 4));
      setDescription('');
      setSelectedLinkedProjectIds(inProgressProjects.map(p => p.id));
    }
    setErrorMsg('');
    setActiveTab('basic');
  }, [initialData, isOpen]);

  // 厂区一级区域切换联动
  const handleYardZoneChange = (zId: string) => {
    setYardZoneId(zId);
    const z = SOUTHEAST_SHIPYARD_ZONES.find(item => item.id === zId);
    if (z && z.subAreas.length > 0) {
      setYardSubAreaId(z.subAreas[0].id);
    }
  };

  // 厂区二级工位切换
  const handleYardSubAreaChange = (subId: string) => {
    setYardSubAreaId(subId);
  };

  // 添加自定义安全防范措施
  const handleAddCustomMeasure = () => {
    if (!customMeasureInput.trim()) return;
    if (!selectedMeasures.includes(customMeasureInput.trim())) {
      setSelectedMeasures([...selectedMeasures, customMeasureInput.trim()]);
    }
    setCustomMeasureInput('');
  };

  // 提交保存
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('请输入作业面编号');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('请输入作业面名称');
      return;
    }
    if (isConfinedMode) {
      if (!selectedShipModelId) {
        setErrorMsg('请选择关联船模类型');
        return;
      }
      if (!selectedShipLayerId) {
        setErrorMsg('请选择舱段分层位置');
        return;
      }
    } else if (belongingType === 'yard') {
      if (!yardZoneId || !yardSubAreaId) {
        setErrorMsg('请选择厂区一级分区及二级工位位置');
        return;
      }
      if (selectedOfficers.length === 0) {
        setErrorMsg('厂区作业面请至少设定一位责任安全员');
        return;
      }
    } else {
      if (!selectedProjectId) {
        setErrorMsg('请选择船舶建造项目');
        return;
      }
      if (!selectedFloorId) {
        setErrorMsg('请选择船舶分层位置');
        return;
      }
    }

    // 必填校验：主基站为必选设备
    if (selectedBaseStationIds.length === 0) {
      setErrorMsg('主基站为必选设备，请至少绑定一台主基站以确保定位覆盖');
      return;
    }

    const boundStations: WorkfaceBaseStation[] = CANDIDATE_BASE_STATIONS
      .filter(bs => selectedBaseStationIds.includes(bs.id))
      .map(bs => ({
        id: bs.id,
        name: bs.name,
        code: bs.code,
        type: bs.type,
        status: bs.status,
        ip: bs.ip,
        coverage: bs.coverage
      }));

    // 环境检测设备 (仅在启用时绑定)
    const boundGases: WorkfaceGasDetector[] = enableGasDetectors
      ? CANDIDATE_GAS_DETECTORS
          .filter(g => selectedGasDetectorIds.includes(g.id))
          .map(g => ({
            id: g.id,
            sn: g.sn,
            name: g.name,
            status: g.status,
            readings: g.readings,
            lastUpdate: '刚刚'
          }))
      : [];

    // AI 监控球机 (仅在启用时绑定)
    const boundCams: WorkfaceCamera[] = enableCameras
      ? CANDIDATE_CAMERAS
          .filter(c => selectedCameraIds.includes(c.id))
          .map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            status: c.status,
            rtspUrl: c.rtspUrl,
            currentChannel: c.currentChannel
          }))
      : [];

    // 防爆声光报警器 (仅在启用时绑定)
    const boundAlms: WorkfaceAlarmDevice[] = enableAlarms
      ? CANDIDATE_ALARMS
          .filter(a => selectedAlarmIds.includes(a.id))
          .map(a => ({
            id: a.id,
            name: a.name,
            type: a.type,
            status: a.status,
            lastTestTime: a.lastTestTime
          }))
      : [];

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const officerNames = selectedOfficers.map(o => o.name).join('、');
    const officerPhones = selectedOfficers.map(o => o.phone).filter(Boolean).join(', ');

    // 船舶建造项目与分层解析
    const prjObj = currentProject;
    const floorObj = currentFloor;

    const recordToSave: WorkfaceRecord = {
      id: initialData ? initialData.id : `WF-${Date.now().toString().slice(-6)}`,
      code: code.trim(),
      name: name.trim(),
      
      // 作业面类型
      workfaceType: isConfinedMode ? '有限空间' : '通用作业面',

      belongingType: isConfinedMode ? 'project' : belongingType,
      
      // 1. 厂区专属字段
      yardZoneId: (!isConfinedMode && belongingType === 'yard') ? yardZoneId : undefined,
      yardZoneName: (!isConfinedMode && belongingType === 'yard') ? currentYardZone.name : undefined,
      yardSubAreaId: (!isConfinedMode && belongingType === 'yard') ? yardSubAreaId : undefined,
      yardSubAreaName: (!isConfinedMode && belongingType === 'yard') ? currentYardSubArea.name : undefined,
      yardSpecs: (!isConfinedMode && belongingType === 'yard') ? currentYardSubArea.specs : undefined,
      
      // 2. 船舶建造项目专属字段 / 船模专属字段
      projectId: isConfinedMode 
        ? (currentShipModelObj?.id || 'M-001') 
        : (belongingType === 'project' ? prjObj.id : 'SEC-YARD'),
      projectName: isConfinedMode 
        ? (currentShipModelObj?.name || '') 
        : (belongingType === 'project' ? prjObj.name : '东南造船基地'),
      shipCode: isConfinedMode 
        ? (currentShipModelObj?.type || '') 
        : (belongingType === 'project' ? prjObj.shipCode : ''),
      dockingArea: isConfinedMode 
        ? (currentShipLayerObj?.name || '') 
        : (belongingType === 'project' ? prjObj.dockingArea : currentYardSubArea.name),
      modelLevel: isConfinedMode 
        ? (currentShipLayerObj?.id || 'L-01') 
        : (belongingType === 'project' ? floorObj.id : 'deck'),
      modelLevelName: isConfinedMode 
        ? (currentShipLayerObj?.name || '') 
        : (belongingType === 'project' ? floorObj.name : currentYardSubArea.name),
      elevation: isConfinedMode 
        ? (currentShipLayerObj?.elevationRange || elevation) 
        : (belongingType === 'project' ? (floorObj.elevation || elevation || '+8.0m ~ +16.0m') : currentYardSubArea.specs),
      volume: volume.trim() || undefined,
      
      // 引用关联在线在建项目列表
      linkedProjectIds: isConfinedMode ? selectedLinkedProjectIds : undefined,
      linkedProjectNames: isConfinedMode 
        ? inProgressProjects.filter(p => selectedLinkedProjectIds.includes(p.id)).map(p => p.name) 
        : undefined,

      // 船模衍生扩展字段同步
      shipModelId: isConfinedMode 
        ? currentShipModelObj?.id 
        : (belongingType === 'project' ? prjObj.id : undefined),
      shipModelName: isConfinedMode 
        ? currentShipModelObj?.name 
        : (belongingType === 'project' ? prjObj.name : undefined),
      shipModelType: isConfinedMode 
        ? currentShipModelObj?.type 
        : (belongingType === 'project' ? prjObj.shipCode : undefined),
      shipModelLayerId: isConfinedMode 
        ? currentShipLayerObj?.id 
        : (belongingType === 'project' ? floorObj.id : undefined),
      shipModelLayerName: isConfinedMode 
        ? currentShipLayerObj?.name 
        : (belongingType === 'project' ? floorObj.name : undefined),
      
      // 作业面区域划定与空间范围数据
      areaDefinition: {
        areaType: areaDemarcationType,
        areaColor: areaDemarcationColor,
        areaShape: areaDemarcationShape,
        coordinatesText: drawnCoordinatesText,
        points: fence.points,
        areaSize: fence.area,
        perimeter: fence.perimeter
      },
      fence,

      workType,
      riskLevel,
      status,
      safetyOfficer: isConfinedMode ? '' : officerNames,
      safetyOfficerPhone: isConfinedMode ? '' : officerPhones,
      safetyOfficers: isConfinedMode ? [] : selectedOfficers,
      teamName: teamName.trim(),
      teamLeader: teamLeader.trim(),
      teamLeaderPhone: teamLeaderPhone.trim(),
      
      // 空间上限人数 (定员上限)
      capacityLimit: Number(capacityLimit) || 15,
      currentPersonnelCount: initialData ? initialData.currentPersonnelCount : (status === 'active' ? 4 : 0),
      currentPersonnel: initialData ? initialData.currentPersonnel : [],
      boundBaseStations: boundStations,
      boundGasDetectors: boundGases,
      boundCameras: boundCams,
      boundAlarms: boundAlms,
      startDate: initialData?.startDate || '2026-10-01',
      endDate: initialData?.endDate || '2026-12-31',
      dailyWorkHours: initialData?.dailyWorkHours || '08:00 - 20:30',
      
      safetyMeasures: selectedMeasures,
      description: description.trim(),
      createdAt: initialData ? initialData.createdAt : nowStr,
      updatedAt: nowStr
    };

    onSave(recordToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-xs text-white ${
              isConfinedMode ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {isConfinedMode ? <ShieldAlert className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {isConfinedMode 
                  ? (initialData ? `编辑有限空间 - ${initialData.name}` : '新增有限空间')
                  : (initialData ? `编辑作业面 - ${initialData.name}` : '新增作业面')
                }
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isConfinedMode
                  ? '基于船模数字孪生及舱段分层定义有限空间防护网格'
                  : '基于高精度数字孪生与三维空间网格规范定义作业管控面'
                }
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 错误提示 */}
        {errorMsg && (
          <div className="mx-6 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 表单内容区 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 编号、名称与空间上限人数行 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 编号 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isConfinedMode ? '有限空间编号' : '作业面编号'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={isConfinedMode ? '如 CS-LNG-01 或 CS-TANK-02' : '如 WF-LNG-01 或 WF-SEC-05'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* 名称 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isConfinedMode ? '有限空间名称' : '作业面名称'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isConfinedMode ? '如 1#液货舱双层底压载舱' : '如 1#液货舱绝热合拢作业面'}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* 空间上限人数 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                空间上限人数 (人) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={capacityLimit}
                onChange={e => setCapacityLimit(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="如 15"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* 归属层级与业务要素区 */}
          {isConfinedMode ? (
            /* 【有限空间】标签：默认船模类型，一级关联船模，二级舱段分层，支持空间容积 */
            <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Ship className="w-4 h-4 text-amber-600" />
                  <span>有限空间归属船模与舱段结构分层 <span className="text-red-500">*</span></span>
                </label>
                <span className="text-[11px] text-amber-800 font-medium bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                  船模类型归属
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 一级：关联船模的类型 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Ship className="w-3.5 h-3.5 text-amber-600" />
                      <span>一级：关联船模类型 <span className="text-red-500">*</span></span>
                    </span>
                  </label>
                  <select
                    value={selectedShipModelId}
                    onChange={e => handleShipModelChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer font-medium text-slate-800"
                  >
                    {shipModelsList.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 二级：舱段分层选择 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>二级：舱段结构分层 <span className="text-red-500">*</span></span>
                    </span>
                  </label>
                  <select
                    value={selectedShipLayerId}
                    onChange={e => handleShipLayerChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer font-medium text-slate-800"
                  >
                    {currentShipModelObj?.layers?.map(layer => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name} ({layer.elevationRange})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 空间容积 (m³) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-emerald-600" />
                    <span>空间容积 (m³)</span>
                  </label>
                  <input
                    type="text"
                    value={volume}
                    onChange={e => setVolume(e.target.value)}
                    placeholder="如 1200"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* 【作业面】标签：归属类型默认厂区，不显示归属类型下拉选择，直接选择一级二级 */
            <div className="p-4 bg-blue-50/40 border border-blue-200/80 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>厂区作业面区域网格配置 <span className="text-red-500">*</span></span>
                </label>
                <span className="text-[11px] text-blue-800 font-medium bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200">
                  厂区归属 (默认)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 一级功能分区 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    一级：厂区功能分区 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={yardZoneId}
                    onChange={e => handleYardZoneChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {SOUTHEAST_SHIPYARD_ZONES.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({zone.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 二级具体位置/工位/车间 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    二级：具体工位 / 车间 / 平台 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={yardSubAreaId}
                    onChange={e => handleYardSubAreaChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {currentYardZone.subAreas.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.specs})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 作业面区域划定 (三维空间划定与关联基站协同) */}
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3.5 shadow-2xs">
            {/* 模块头部 */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <span>作业面区域划定</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  三维空间划定
                </span>
              </div>
              {drawnCoordinatesText && (
                <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>三维空间坐标已就绪</span>
                </span>
              )}
            </div>

            {/* 划定表单设置行 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 划定形状 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>划定形状
                </label>
                <select
                  value={areaDemarcationShape}
                  onChange={e => setAreaDemarcationShape(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="矩形">标准矩形框选</option>
                  <option value="多边形">多边形轮廓打点</option>
                  <option value="自定义">自定义空间形态</option>
                </select>
              </div>

              {/* 绘制区域操作按钮 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>三维空间绘制
                </label>
                <button
                  type="button"
                  onClick={() => setIs3DModalOpen(true)}
                  className="w-full px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Box className="w-4 h-4" />
                  <span>{drawnCoordinatesText ? '进入三维空间重新框选' : '点此进入三维设置'}</span>
                </button>
              </div>
            </div>

            {/* 框选的坐标系信息反馈卡片 */}
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <div className="flex items-center gap-2 text-xs truncate">
                <span className="font-semibold text-slate-700 shrink-0">框选坐标系：</span>
                <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium truncate max-w-xl" title={drawnCoordinatesText}>
                  {drawnCoordinatesText || '[25.4, 25.8  58.2, 25.8  58.2, 68.4  25.4, 68.4]'}
                </span>
              </div>
            </div>
          </div>

          {/* 责任安全员配置 (仅在选择“船厂厂区作业面”时显示，有限空间不配置) */}
          {!isConfinedMode && belongingType === 'yard' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>责任安全员配置</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  仅厂区作业面需指定现场责任安全管理人员
                </span>
              </div>

              <SafetyOfficerSelect
                selectedOfficers={selectedOfficers}
                onChange={(officers) => {
                  setSelectedOfficers(officers);
                  if (officers.length > 0) {
                    setSafetyOfficer(officers.map(o => o.name).join('、'));
                    setSafetyOfficerPhone(officers.map(o => o.phone).filter(Boolean).join(', '));
                  } else {
                    setSafetyOfficer('');
                    setSafetyOfficerPhone('');
                  }
                }}
                required={true}
              />
            </div>
          )}

          {/* 关联在建船舶项目 (独立卡片区域，放在表单后面，仅显示在建状态的船舶项目) */}
          {isConfinedMode && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 shadow-2xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>关联在建船舶项目 <span className="text-red-500">*</span></span>
                  </label>
                  <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                    已关联 {selectedLinkedProjectIds.length} / {inProgressProjects.length} 个在建工程
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedLinkedProjectIds(inProgressProjects.map(p => p.id))}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer transition-colors"
                  >
                    全选在建项目
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedLinkedProjectIds([])}
                    className="text-slate-500 hover:text-slate-800 hover:underline font-medium cursor-pointer transition-colors"
                  >
                    清空
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {inProgressProjects.map(prj => {
                  const isChecked = selectedLinkedProjectIds.includes(prj.id);
                  return (
                    <div
                      key={prj.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedLinkedProjectIds(prev => prev.filter(id => id !== prj.id));
                        } else {
                          setSelectedLinkedProjectIds(prev => [...prev, prj.id]);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="truncate min-w-0">
                          <span className="font-bold block truncate" title={prj.name}>{prj.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{prj.shipCode || prj.id} · 建造进度 {prj.progress}%</span>
                        </div>
                      </div>

                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 border bg-emerald-50 text-emerald-700 border-emerald-200">
                        🟢 在建中
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>提示：保存后，勾选之在线在建船舶项目的船舱有限空间管理中将联动出现或同步更新此作业面。</span>
              </p>
            </div>
          )}



          {/* 底部按钮栏 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? '保存修改' : '确认创建作业面'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 三维空间作业面区域划定设置模态框 */}
      <Workface3DSpatialDrawModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        onSave={handle3DSpatialSave}
        areaType={areaDemarcationType}
        areaColor={areaDemarcationColor}
        areaShape={areaDemarcationShape}
        projectName={belongingType === 'project' ? currentProject?.name : undefined}
        zoneName={currentYardZone.name}
        subAreaName={currentYardSubArea.name}
        levelName={belongingType === 'project' ? currentFloor?.name : undefined}
        elevation={belongingType === 'project' ? (currentFloor?.elevation || elevation) : '+8.0m ~ +16.0m'}
        candidateBaseStations={CANDIDATE_BASE_STATIONS}
        initialPoints={fence.points}
      />
    </div>
  );
}
