import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Ship, 
  Calendar, 
  ShieldCheck, 
  LayoutGrid, 
  List, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Eye, 
  Edit3, 
  GitBranch, 
  Trash2, 
  Filter, 
  ChevronRight,
  Clock,
  AlertTriangle,
  Users,
  Compass,
  Check,
  Anchor,
  Layers,
  Box,
  ChevronDown,
  SlidersHorizontal,
  MoreVertical
} from 'lucide-react';
import { CreateProjectModal, CreatedProjectData, SHIP_TYPE_OPTIONS, SHIPYARD_AREA_OPTIONS } from './CreateProjectModal';
import { ProjectVersionsModal } from './ProjectVersionsModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectConfinedSpaceModal } from './ProjectConfinedSpaceModal';
import { ProjectCabinConfigModal } from './ProjectCabinConfigModal';

// 导入 8 款船型的 3D 数字孪生模型高清渲染图作为船模缩略图
import lngModelBg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerModelBg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerModelBg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkModelBg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';
import psvModelBg from '@/src/assets/images/psv_3d_model_1787972977692.jpg';
import workboatModelBg from '@/src/assets/images/workboat_3d_model_1787972992279.jpg';
import supportModelBg from '@/src/assets/images/support_3d_model_1787973007774.jpg';
import chemTankerModelBg from '@/src/assets/images/chemical_tanker_3d_1787973019008.jpg';

// 根据项目信息匹配对应的 3D 船模缩略图
export const getProjectShipThumbnail = (project: { shipType?: string; shipCode?: string; name?: string; id?: string }) => {
  const text = `${project.shipType || ''} ${project.shipCode || ''} ${project.name || ''} ${project.id || ''}`.toLowerCase();
  if (text.includes('lng') || text.includes('清洁能源') || text.includes('天然气')) return lngModelBg;
  if (text.includes('box') || text.includes('container') || text.includes('集装箱') || text.includes('ctn')) return containerModelBg;
  if (text.includes('vlcc') || text.includes('tank') || text.includes('原油') || text.includes('油轮') || text.includes('液体散货')) return tankerModelBg;
  if (text.includes('bulk') || text.includes('散货') || text.includes('干散货')) return bulkModelBg;
  if (text.includes('psv') || text.includes('平台供应') || text.includes('动力定位') || text.includes('海洋工程')) return psvModelBg;
  if (text.includes('chem') || text.includes('化') || text.includes('特种危化')) return chemTankerModelBg;
  if (text.includes('sov') || text.includes('风电') || text.includes('支持') || text.includes('海上风电')) return supportModelBg;
  if (text.includes('ahts') || text.includes('三用') || text.includes('拖轮') || text.includes('海工辅助') || text.includes('工作船')) return workboatModelBg;
  return lngModelBg;
};

const initialMockProjects: CreatedProjectData[] = [
  { 
    id: 'PRJ-2026-LNG01', 
    name: '17.4万m³ 薄膜型大型LNG船 1号舰', 
    shipType: '清洁能源运输', 
    status: 'in_progress', 
    progress: 45, 
    startDate: '2026-03-01', 
    endDate: '2027-08-30', 
    manager: '王建国',
    shipCode: 'HULL-LNG-174',
    datum: 'Datum P0 (X:-120, Z:60)',
    dockingArea: '1号船台（2万吨船台）',
    phase: '合拢焊接',
    version: 'V2.1 (合拢合口焊接)',
    devices: '读卡(12) 激励(6) 四合一(8) 烟感(16)',
    fence: '1号龙门吊立体警戒区',
    personnel: 18,
    description: '采用 GTT NO96 薄膜型绝热系统，首批两座液化天然气运输船建造标段。',
    parameters: {
      loa: '295.0',
      beam: '45.0',
      depth: '26.25',
      draft: '11.5',
      displacement: '118,000 吨',
      speed: '19.5 节',
      power: '双燃料低速机+轴带发电机'
    }
  },
  { 
    id: 'PRJ-2026-BOX12', 
    name: '24,000 TEU 超大型集装箱船', 
    shipType: '集装箱班轮', 
    status: 'planning', 
    progress: 5, 
    startDate: '2026-09-01', 
    endDate: '2028-02-15', 
    manager: '李海波',
    shipCode: 'HULL-BOX-240',
    datum: 'Datum P2 (X:-220, Z:-110)',
    dockingArea: '2号码头 (移动码头)',
    phase: '系泊试验',
    version: 'V3.0 (系泊电气调试)',
    devices: '读卡(18) 激励(8) 四合一(10) 烟感(24)',
    fence: '舾装防落水围栏',
    personnel: 14,
    description: '全球超大箱位双岛式货船，配装脱硫塔系统及节能减阻水动力套件。',
    parameters: {
      loa: '399.9',
      beam: '61.5',
      depth: '33.2',
      draft: '16.5',
      displacement: '240,000 吨',
      speed: '22.0 节',
      power: 'WinGD 11X92DF 双燃料主机'
    }
  },
  { 
    id: 'PRJ-2026-TANK02', 
    name: '30万吨 VLCC 超大型原油船', 
    shipType: '液体散货', 
    status: 'in_progress', 
    progress: 85, 
    startDate: '2025-11-10', 
    endDate: '2026-10-20', 
    manager: '张明',
    shipCode: 'HULL-VLCC-300',
    datum: 'Datum P4 (X:240, Z:-80)',
    dockingArea: '3号码头 (移动码头)',
    phase: '水下舾装',
    version: 'V4.0 (试航前管系试压)',
    devices: '读卡(14) 激励(6) 四合一(6) 烟感(18)',
    fence: '密闭舱受限空间围栏',
    personnel: 9,
    description: '30万吨级原油运输船，主货舱及压载水舱全面应用防爆气体与密闭空间监测。',
    parameters: {
      loa: '333.0',
      beam: '60.0',
      depth: '30.0',
      draft: '20.5',
      displacement: '348,000 吨',
      speed: '15.5 节',
      power: '低速柴油机 + 脱硫塔系统'
    }
  },
  {
    id: 'PRJ-2026-BULK04',
    name: '82,000 DWT 卡姆萨尔型散货船',
    shipType: '干散货运输',
    status: 'in_progress',
    progress: 32,
    startDate: '2026-01-15',
    endDate: '2026-12-30',
    manager: '陈远',
    shipCode: 'HULL-BULK-082',
    datum: 'Datum P1 (X:-30, Z:60)',
    dockingArea: '6号船台（平船台）',
    phase: '船台搭载',
    version: 'V1.3 (分段总组搭载)',
    devices: '读卡(8) 激励(4) 四合一(4) 烟感(8)',
    fence: '船台边缘警戒',
    personnel: 7,
    description: '新一代绿色环保宽体浅吃水散货船，符合大开口快速装卸设计标准。',
    parameters: {
      loa: '229.0',
      beam: '32.26',
      depth: '20.35',
      draft: '14.45',
      displacement: '98,000 吨',
      speed: '14.2 节',
      power: 'MAN B&W 6S60ME 柴油机'
    }
  },
  {
    id: 'PRJ-2026-PSV01',
    name: '75M 动力定位平台供应船 (DP-2)',
    shipType: '海洋工程',
    status: 'completed',
    progress: 100,
    startDate: '2025-05-01',
    endDate: '2026-04-18',
    manager: '林峰',
    shipCode: 'HULL-PSV-075',
    datum: 'Datum P3 (X:10, Z:-40)',
    dockingArea: '5号码头 (移动码头 - 小型船只)',
    phase: '交船交付',
    version: 'V5.0 (竣工交付归档)',
    devices: '读卡(6) 激励(4) 四合一(4) 烟感(8)',
    fence: '已解封交付',
    personnel: 0,
    description: '配备 DP-2 动力定位系统与高压泥浆输送舱，用于深海钻井平台作业支援。',
    parameters: {
      loa: '75.0',
      beam: '16.8',
      depth: '7.5',
      draft: '6.0',
      displacement: '4,200 吨',
      speed: '13.5 节',
      power: '柴电全回转电力推进系统'
    }
  }
];

export function ProjectManagement() {
  const [projects, setProjects] = useState<CreatedProjectData[]>(initialMockProjects);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // 弹窗状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CreatedProjectData | null>(null);
  const [detailProject, setDetailProject] = useState<CreatedProjectData | null>(null);
  const [versionsProjectId, setVersionsProjectId] = useState<string | null>(null);
  const [confinedSpaceProject, setConfinedSpaceProject] = useState<CreatedProjectData | null>(null);
  const [cabinConfigProject, setCabinConfigProject] = useState<CreatedProjectData | null>(null);
  const [openMoreMenuId, setOpenMoreMenuId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // 点击外部关闭操作更多下拉菜单
  React.useEffect(() => {
    const handleDocumentClick = () => {
      setOpenMoreMenuId(null);
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, []);

  // 顶部搜索过滤条件
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [searchShipType, setSearchShipType] = useState('ALL');
  const [searchStatus, setSearchStatus] = useState('ALL');
  const [searchDockingArea, setSearchDockingArea] = useState('ALL');

  // 重置搜索条件
  const handleResetSearch = () => {
    setSearchName('');
    setSearchCode('');
    setSearchShipType('ALL');
    setSearchStatus('ALL');
    setSearchDockingArea('ALL');
  };

  // 根据多重条件过滤项目
  const filteredProjects = useMemo(() => {
    return projects.filter(item => {
      // 1. 项目名称模糊匹配
      if (searchName.trim()) {
        const query = searchName.trim().toLowerCase();
        if (!item.name.toLowerCase().includes(query)) {
          return false;
        }
      }
      // 2. 项目代码 / 船型代码匹配
      if (searchCode.trim()) {
        const query = searchCode.trim().toLowerCase();
        const matchId = item.id.toLowerCase().includes(query);
        const matchCode = item.shipCode.toLowerCase().includes(query);
        if (!matchId && !matchCode) {
          return false;
        }
      }
      // 3. 轮船类型过滤
      if (searchShipType !== 'ALL') {
        if (item.shipType !== searchShipType) {
          return false;
        }
      }
      // 4. 项目状态过滤
      if (searchStatus !== 'ALL') {
        if (item.status !== searchStatus) {
          return false;
        }
      }
      // 5. 船厂区域过滤
      if (searchDockingArea !== 'ALL') {
        if (item.dockingArea !== searchDockingArea) {
          return false;
        }
      }
      return true;
    });
  }, [projects, searchName, searchCode, searchShipType, searchStatus, searchDockingArea]);

  // 新建或编辑项目提交
  const handleSaveProject = (savedData: CreatedProjectData) => {
    if (editingProject) {
      // 编辑已有项目
      setProjects(prev => prev.map(p => p.id === savedData.id ? savedData : p));
      setSuccessBanner(`已成功更新项目【${savedData.name}】（编码：${savedData.id}）！`);
      setEditingProject(null);
    } else {
      // 创建新项目
      setProjects(prev => [savedData, ...prev]);
      handleResetSearch();
      setSuccessBanner(`成功创建工程项目【${savedData.name}】（编码：${savedData.id}），已成功绑定船模！`);
    }
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  // 删除项目
  const handleDeleteProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setDeletingProjectId(null);
    setSuccessBanner(`已成功删除项目【${target.name}】（编码：${target.id}）！`);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 3500);
  };

  // 辅助函数：提取纯净版本号，去除括号及其内部文字（例如 "V2.1 (合拢合口焊接)" -> "V2.1"）
  const getCleanVersion = (versionStr?: string) => {
    if (!versionStr) return '';
    return versionStr.replace(/[\(（].*?[\)）]/g, '').trim();
  };

  // 船厂区域 / 停泊位徽章渲染
  const renderShipyardBadge = (yardName: string) => {
    if (yardName.includes('船台') || yardName.includes('东南造船厂')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap shadow-2xs">
          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
          {yardName}
        </span>
      );
    }
    if (yardName.includes('浮动') || yardName.includes('马尾造船厂')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap shadow-2xs">
          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
          {yardName}
        </span>
      );
    }
    if (yardName.includes('码头') || yardName.includes('冠海造船厂')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-cyan-800 bg-cyan-50 border border-cyan-200/80 px-2.5 py-1 rounded-md font-semibold whitespace-nowrap shadow-2xs">
          <MapPin className="w-3 h-3 text-cyan-600 shrink-0" />
          {yardName}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        {yardName}
      </span>
    );
  };

  // 状态显示渲染
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            施工进行中
          </span>
        );
      case 'planning':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
            <Clock className="w-3 h-3 text-blue-500" />
            前期规划中
          </span>
        );
      case 'temporary_departure':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
            <Anchor className="w-3 h-3 text-sky-500 animate-pulse" />
            临时离港
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-purple-500" />
            已竣工交船
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            暂停施工
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3.5 h-full">
      
      {/* 顶部操作结果提示条 */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-500 hover:text-emerald-700 ml-3 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 顶部筛选与搜索区域（标准企业级中后台查询面板） */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm shrink-0 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. 项目名称 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">项目名称</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="搜索项目名称..."
                className="w-full pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400"
              />
              {searchName && (
                <button 
                  onClick={() => setSearchName('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* 2. 项目编码 / 船型代码 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">项目编码 / 船型代码</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="如: PRJ-2026 或 LNG"
                className="w-full pl-2.5 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-slate-400 font-mono"
              />
              {searchCode && (
                <button 
                  onClick={() => setSearchCode('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* 3. 轮船类型 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">轮船类型</label>
            <select 
              value={searchShipType}
              onChange={(e) => setSearchShipType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">全部轮船类型</option>
              <option value="清洁能源运输">清洁能源运输 (LNG)</option>
              <option value="集装箱班轮">集装箱班轮 (Container)</option>
              <option value="液体散货">液体散货 (VLCC/Tanker)</option>
              <option value="干散货运输">干散货运输 (Bulk)</option>
              <option value="海洋工程">海洋工程 (PSV)</option>
              <option value="海上风电装备">海上风电装备 (SOV)</option>
              <option value="海工辅助">海工辅助 (AHTS)</option>
              <option value="特种危化运输">特种危化运输 (Chem)</option>
            </select>
          </div>

          {/* 4. 建造船厂所在区域 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">建造船厂区域</label>
            <select 
              value={searchDockingArea}
              onChange={(e) => setSearchDockingArea(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer font-medium"
            >
              <option value="ALL">全部船厂区域</option>
              {SHIPYARD_AREA_OPTIONS.map((yard) => (
                <option key={yard} value={yard}>
                  {yard}
                </option>
              ))}
            </select>
          </div>

          {/* 5. 建造状态 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">建造状态</label>
            <select 
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">全部状态</option>
              <option value="in_progress">施工进行中</option>
              <option value="planning">前期规划中</option>
              <option value="temporary_departure">临时离港</option>
              <option value="completed">已竣工交船</option>
              <option value="suspended">暂停施工</option>
            </select>
          </div>

          {/* 6. 查询与重置操作按钮 */}
          <div className="flex items-end gap-2">
            <button 
              onClick={() => {}} // 响应式过滤已实时绑定
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> 查询
            </button>
            <button 
              onClick={handleResetSearch}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-slate-200 cursor-pointer"
              title="清空并重置筛选条件"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> 重置
            </button>
          </div>
        </div>
      </div>

      {/* 列表头部工具条 */}
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-800 border-l-2 border-blue-600 pl-2 uppercase">造船项目台账</h2>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
            共查询到 <strong className="text-blue-600 font-bold">{filteredProjects.length}</strong> / {projects.length} 个项目
          </span>
          {(searchName || searchCode || searchShipType !== 'ALL' || searchStatus !== 'ALL' || searchDockingArea !== 'ALL') && (
            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Filter className="w-2.5 h-2.5" /> 过滤生效中
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="表格列表视图"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="卡片网格视图"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'project_overview' } }));
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-3 py-1.5 rounded-lg flex items-center transition-colors text-xs font-semibold cursor-pointer"
            title="查看在建造船工程总览与里程碑大屏"
          >
            <Compass className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            进度里程碑总览
          </button>
          <button 
            onClick={() => {
              setEditingProject(null);
              setIsCreateModalOpen(true);
            }}
            className="bg-blue-600 text-white shadow-sm border border-transparent px-3 py-1.5 rounded-lg flex items-center hover:bg-blue-700 transition-colors text-xs font-semibold active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            新建造船项目
          </button>
        </div>
      </div>

      {/* 列表主体区域 */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">未匹配到符合条件的项目</p>
          <p className="text-xs text-slate-400 mb-4">请尝试调整搜索关键字或筛选条件</p>
          <button 
            onClick={handleResetSearch}
            className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
          >
            清空重置筛选
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* 表格列表视图（项目编码与项目名称分列显示，操作列防断字换行） */
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden shrink-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap w-36">项目编码</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap min-w-[200px]">项目名称</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">轮船类型 & 船型代码</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">建造所在船厂区域</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">建造周期起止时间</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">施工状态</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">当前版本 / 阶段</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">负责人</th>
                <th className="px-4 py-3 font-semibold text-center whitespace-nowrap min-w-[320px] w-80">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12px]">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* 1. 项目编码（独立单列） */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50/90 px-2.5 py-1 rounded-md border border-blue-200/80 uppercase shadow-2xs inline-block">
                      {project.id}
                    </span>
                  </td>

                  {/* 2. 项目名称（独立单列，仅显示项目名称） */}
                  <td className="px-4 py-3.5 align-middle">
                    <div 
                      className="font-bold text-slate-800 leading-snug text-[13px] hover:text-blue-600 cursor-pointer transition-colors" 
                      onClick={() => setDetailProject(project)}
                      title="点击查看项目详情"
                    >
                      {project.name}
                    </div>
                  </td>

                  {/* 3. 轮船类型 & 船型代码 */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    <div className="text-xs font-semibold text-slate-700 mb-1">{project.shipType}</div>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-200 uppercase font-medium">
                      {project.shipCode}
                    </span>
                  </td>

                  {/* 4. 建造船厂所在区域 */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    {renderShipyardBadge(project.dockingArea)}
                  </td>

                  {/* 5. 建造周期起止时间 */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    <div className="font-mono text-[11px] text-slate-700 font-medium">
                      {project.startDate}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      至 {project.endDate}
                    </div>
                  </td>

                  {/* 6. 施工状态 */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    {renderStatusBadge(project.status)}
                  </td>

                  {/* 7. 当前版本 / 阶段 */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      {getCleanVersion(project.version) && (
                        <span className="font-mono text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/70">
                          {getCleanVersion(project.version)}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-800">{project.phase}</span>
                    </div>
                  </td>

                  {/* 8. 负责人 */}
                  <td className="px-4 py-3.5 whitespace-nowrap align-middle">
                    <div className="text-xs text-slate-800 font-semibold">{project.manager}</div>
                  </td>

                  {/* 9. 操作列（排列顺序：版本、详情、编辑、更多下拉[有限空间、船舱配置、删除]） */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap align-middle">
                    <div className="inline-flex items-center justify-center gap-1.5 flex-nowrap relative">
                      <button 
                        onClick={() => setVersionsProjectId(project.id)}
                        className="px-2.5 py-1 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60 rounded-md transition-colors font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        title="查看版本与阶段"
                      >
                        <GitBranch className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">版本</span>
                      </button>
                      <button 
                        onClick={() => setDetailProject(project)}
                        className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100 border border-blue-200/60 rounded-md transition-colors font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        title="查看项目详情"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">详情</span>
                      </button>
                      <button 
                        onClick={() => {
                          setEditingProject(project);
                          setIsCreateModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs text-amber-700 hover:text-amber-900 bg-amber-50/70 hover:bg-amber-100 border border-amber-200/60 rounded-md transition-colors font-medium inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        title="编辑项目信息"
                      >
                        <Edit3 className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">编辑</span>
                      </button>

                      {/* 更多下拉操作按钮 */}
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMoreMenuId(prev => prev === `tbl-${project.id}` ? null : `tbl-${project.id}`);
                          }}
                          className={`px-2.5 py-1 text-xs border rounded-md transition-all font-semibold inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs ${
                            openMoreMenuId === `tbl-${project.id}`
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/90 border-slate-300/80'
                          }`}
                          title="更多操作（有限空间、船舱配置）"
                        >
                          <span>更多</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${openMoreMenuId === `tbl-${project.id}` ? 'rotate-180' : ''}`} />
                        </button>

                        {openMoreMenuId === `tbl-${project.id}` && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 text-left"
                          >
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setConfinedSpaceProject(project);
                                  setOpenMoreMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-cyan-50 hover:text-cyan-900 flex items-center gap-2 cursor-pointer transition-colors text-left"
                                title="配置该项目关联的有限空间及安全责任人"
                              >
                                <Box className="w-4 h-4 text-cyan-600 shrink-0" />
                                <div>
                                  <div className="font-bold text-slate-900">有限空间</div>
                                  <div className="text-[10px] text-slate-400">空间台账与安全责任人</div>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setCabinConfigProject(project);
                                  setOpenMoreMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 cursor-pointer transition-colors text-left"
                                title="配置船舱进出人员统计规则及激励器设备关联"
                              >
                                <SlidersHorizontal className="w-4 h-4 text-blue-600 shrink-0" />
                                <div>
                                  <div className="font-bold text-blue-700">船舱配置</div>
                                  <div className="text-[10px] text-slate-400">进出规则与激励器关联</div>
                                </div>
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingProjectId(project.id);
                                  setOpenMoreMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors text-left"
                                title="删除项目"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                <span>删除项目</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* 卡片网格视图（每行4个卡片，增加船模缩略图，去除项目介绍信息） */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 mb-2 shrink-0">
          {filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5 hover:border-blue-300 hover:shadow-md transition-all relative flex flex-col justify-between group"
            >
              <div>
                {/* 1. 船模 3D 数字孪生缩略图展示区 */}
                <div 
                  onClick={() => setDetailProject(project)}
                  className="relative w-full h-36 bg-slate-950 rounded-xl overflow-hidden mb-2.5 cursor-pointer group/thumb border border-slate-200/80 shadow-inner"
                  title="点击查看项目与船模详情"
                >
                  <img 
                    src={getProjectShipThumbnail(project)} 
                    alt={project.name}
                    className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* 顶底渐变蒙层增强对比度 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40" />
                  
                  {/* 顶部悬浮：项目编码与状态徽章 */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1 pointer-events-auto">
                      <span className="font-mono font-bold text-white text-[10px] bg-slate-900/85 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/20 uppercase shadow-xs">
                        {project.id}
                      </span>
                      <span className="bg-blue-600/90 text-white font-mono text-[9px] px-1 py-0.5 rounded-md border border-blue-400/40 uppercase font-semibold backdrop-blur-md">
                        {project.shipCode}
                      </span>
                    </div>
                    <div className="pointer-events-auto shadow-xs scale-90 origin-right">
                      {renderStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* 底部悬浮：3D数字孪生与船型标签 */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[9px] pointer-events-none">
                    <span className="bg-black/65 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/15 flex items-center gap-1 text-cyan-300 font-medium">
                      <Layers className="w-2.5 h-2.5 text-cyan-400" />
                      <span>3D孪生数模</span>
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/15 text-slate-200 font-medium">
                      {project.shipType}
                    </span>
                  </div>
                </div>

                {/* 2. 项目标题（点击可查看详情） */}
                <h4 
                  onClick={() => setDetailProject(project)}
                  className="font-bold text-slate-800 mb-2 text-xs line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors leading-snug" 
                  title={project.name}
                >
                  {project.name}
                </h4>

                {/* 3. 建造参数与负责人元数据面板 */}
                <div className="space-y-1.5 mb-2.5 bg-slate-50/90 p-2 rounded-xl border border-slate-100 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center text-slate-500">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                      <span>周期:</span>
                    </div>
                    <span className="font-mono text-slate-700 font-medium text-[10px]">{project.startDate} 至 {project.endDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center text-slate-500">
                      <MapPin className="w-3 h-3 mr-1 text-blue-500" />
                      <span>船厂区域:</span>
                    </div>
                    {renderShipyardBadge(project.dockingArea)}
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center text-slate-500">
                      <ShieldCheck className="w-3 h-3 mr-1 text-slate-400" />
                      <span>负责人:</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800 font-semibold">{project.manager}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{project.safetyOfficer}</span>
                    </div>
                  </div>
                </div>

                {/* 4. 当前建造阶段 */}
                <div className="mb-2.5 bg-slate-50/90 px-2.5 py-1.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                    <Anchor className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-slate-500 text-[11px]">建造阶段:</span>
                    <span className="font-semibold text-slate-800 truncate" title={project.phase}>{project.phase}</span>
                  </div>
                  {getCleanVersion(project.version) && (
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60 shrink-0 ml-1">
                      {getCleanVersion(project.version)}
                    </span>
                  )}
                </div>
              </div>

              {/* 5. 卡片底部操作按钮组（排列顺序：版本、详情、编辑、更多） */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-nowrap relative">
                <button 
                  onClick={() => setVersionsProjectId(project.id)}
                  className="flex-1 py-1.5 text-xs text-indigo-700 bg-indigo-50/70 border border-indigo-200/70 rounded-lg hover:bg-indigo-100 transition-colors font-medium flex items-center justify-center gap-0.5 whitespace-nowrap cursor-pointer"
                  title="版本/阶段管理"
                >
                  <GitBranch className="w-3 h-3 shrink-0" /> <span className="whitespace-nowrap text-[11px]">版本</span>
                </button>
                <button 
                  onClick={() => setDetailProject(project)}
                  className="flex-1 py-1.5 text-xs text-blue-600 bg-blue-50/70 border border-blue-200/70 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-0.5 whitespace-nowrap cursor-pointer"
                >
                  <Eye className="w-3 h-3 shrink-0" /> <span className="whitespace-nowrap text-[11px]">详情</span>
                </button>
                <button 
                  onClick={() => {
                    setEditingProject(project);
                    setIsCreateModalOpen(true);
                  }}
                  className="flex-1 py-1.5 text-xs text-amber-700 bg-amber-50/70 border border-amber-200/70 rounded-lg hover:bg-amber-100 transition-colors font-medium flex items-center justify-center gap-0.5 whitespace-nowrap cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 shrink-0" /> <span className="whitespace-nowrap text-[11px]">编辑</span>
                </button>

                {/* 卡片更多操作 */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMoreMenuId(prev => prev === `card-${project.id}` ? null : `card-${project.id}`);
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      openMoreMenuId === `card-${project.id}`
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 hover:bg-slate-200/90 text-slate-700 border-slate-200'
                    }`}
                    title="更多操作"
                  >
                    <span className="text-[11px]">更多</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openMoreMenuId === `card-${project.id}` ? 'rotate-180' : ''}`} />
                  </button>

                  {openMoreMenuId === `card-${project.id}` && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 bottom-full mb-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-40 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 text-left"
                    >
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setConfinedSpaceProject(project);
                            setOpenMoreMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-800 hover:bg-cyan-50 hover:text-cyan-900 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Box className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span className="font-semibold text-slate-900">有限空间</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCabinConfigProject(project);
                            setOpenMoreMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold text-blue-700">船舱配置</span>
                        </button>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingProjectId(project.id);
                            setOpenMoreMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>删除项目</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 删除二次确认弹窗 */}
      {deletingProjectId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-center font-bold text-slate-800 text-sm mb-1">确定要删除该工程项目吗？</h3>
            <p className="text-center text-xs text-slate-500 mb-4">
              删除后将移除该项目与数模、基准坐标和安防策略的关联，此操作不可撤回。
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setDeletingProjectId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => handleDeleteProject(deletingProjectId)}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm shadow-rose-500/20"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建 / 编辑项目弹窗 */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        initialData={editingProject}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }} 
        onSubmit={handleSaveProject}
      />

      {/* 项目详情弹窗 */}
      {detailProject && (
        <ProjectDetailModal 
          isOpen={true} 
          project={detailProject} 
          onClose={() => setDetailProject(null)} 
          onEdit={(proj) => {
            setEditingProject(proj);
            setIsCreateModalOpen(true);
          }}
          onOpenVersions={(projId) => {
            setVersionsProjectId(projId);
          }}
        />
      )}

      {/* 版本阶段管理弹窗 */}
      <ProjectVersionsModal 
        isOpen={!!versionsProjectId} 
        projectId={versionsProjectId} 
        projectName={projects.find(p => p.id === versionsProjectId)?.name}
        shipType={projects.find(p => p.id === versionsProjectId)?.shipType}
        onClose={() => setVersionsProjectId(null)} 
        onProjectStatusChange={(projId, newStatus) => {
          setProjects(prev => prev.map(p => {
            if (p.id === projId) {
              if (newStatus === 'completed') {
                return {
                  ...p,
                  status: 'completed',
                  progress: 100,
                  devices: '已解绑 (0)',
                  fence: '已解绑解除',
                  personnel: 0,
                  dockingArea: '已竣工交付离厂',
                  phase: '竣工交付'
                };
              } else if (newStatus === 'temporary_departure') {
                return {
                  ...p,
                  status: 'temporary_departure',
                  dockingArea: '临时离港 (停泊位已自动释放)',
                  phase: '临时离港试航/避风'
                };
              }
              return { ...p, status: newStatus };
            }
            return p;
          }));
          if (newStatus === 'completed') {
            const proj = projects.find(p => p.id === projId);
            setSuccessBanner(`项目【${proj?.name || projId}】已成功设定为【已竣工交船】！系统已自动解绑关联设备与电子围栏，项目处于归档模式。`);
            setTimeout(() => {
              setSuccessBanner(null);
            }, 6000);
          } else if (newStatus === 'temporary_departure') {
            const proj = projects.find(p => p.id === projId);
            setSuccessBanner(`项目【${proj?.name || projId}】已成功设定为【临时离港】状态！该阶段的厂区停泊位已自动释放供其他船舶临时停靠。`);
            setTimeout(() => {
              setSuccessBanner(null);
            }, 6000);
          }
        }}
      />

      {/* 船舶项目关联有限空间安全员配置模态框 */}
      {confinedSpaceProject && (
        <ProjectConfinedSpaceModal
          isOpen={true}
          project={confinedSpaceProject}
          onClose={() => setConfinedSpaceProject(null)}
          onSuccess={(msg) => {
            setSuccessBanner(msg);
            setTimeout(() => {
              setSuccessBanner(null);
            }, 5000);
          }}
        />
      )}

      {/* 船舶项目船舱配置模态框（进出规则与多激励器设备关联） */}
      {cabinConfigProject && (
        <ProjectCabinConfigModal
          isOpen={true}
          project={cabinConfigProject}
          onClose={() => setCabinConfigProject(null)}
          onSuccess={(msg) => {
            setSuccessBanner(msg);
            setTimeout(() => {
              setSuccessBanner(null);
            }, 5000);
          }}
        />
      )}
    </div>
  );
}
