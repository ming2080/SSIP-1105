import React, { useState, useMemo } from 'react';
import { 
  Ship, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  ShieldCheck, 
  Users, 
  Layers, 
  ArrowUpRight, 
  Search, 
  RotateCcw, 
  Filter, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  Cpu, 
  MapPin, 
  Eye, 
  Flame, 
  BarChart3, 
  LayoutGrid, 
  ListOrdered, 
  Building2, 
  Activity, 
  X, 
  Award, 
  Hammer, 
  Anchor
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { ViewType } from '@/src/types';
import { 
  ACTIVE_SHIPBUILDING_PROJECTS, 
  ActiveShipbuildingProject, 
  ShipbuildingMilestone, 
  YARD_PROJECT_OVERVIEW_KPIS 
} from '@/src/data/projectOverviewData';

// 导入 3D 船模渲染图
import lngModelBg from '@/src/assets/images/lng_ship_model_1787972569670.jpg';
import containerModelBg from '@/src/assets/images/container_ship_model_1787972581740.jpg';
import tankerModelBg from '@/src/assets/images/tanker_ship_model_1787972594875.jpg';
import bulkModelBg from '@/src/assets/images/bulk_ship_model_1787972609425.jpg';
import chemTankerModelBg from '@/src/assets/images/chemical_tanker_3d_1787973019008.jpg';
import psvModelBg from '@/src/assets/images/psv_3d_model_1787972977692.jpg';

// 根据船舶分类与编号获取 3D 模型图
export const getShipVesselImage = (project: { shipType?: string; shipCode?: string; name?: string; id?: string }) => {
  const text = `${project.shipType || ''} ${project.shipCode || ''} ${project.name || ''} ${project.id || ''}`.toLowerCase();
  if (text.includes('lng') || text.includes('清洁能源') || text.includes('天然气')) return lngModelBg;
  if (text.includes('box') || text.includes('container') || text.includes('集装箱') || text.includes('ctn')) return containerModelBg;
  if (text.includes('vlcc') || text.includes('tank') || text.includes('原油') || text.includes('油轮') || text.includes('液体散货')) return tankerModelBg;
  if (text.includes('bulk') || text.includes('散货') || text.includes('干散货')) return bulkModelBg;
  if (text.includes('chem') || text.includes('化学品') || text.includes('危化')) return chemTankerModelBg;
  return psvModelBg;
};

interface ProjectOverviewDashboardProps {
  onNavigate?: (view: ViewType, extra?: any) => void;
}

export function ProjectOverviewDashboard({ onNavigate }: ProjectOverviewDashboardProps) {
  // 状态管理
  const [projectsList] = useState<ActiveShipbuildingProject[]>(ACTIVE_SHIPBUILDING_PROJECTS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBerth, setSelectedBerth] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'berths'>('cards');

  // 弹窗与详情抽屉
  const [activeMilestoneDetail, setActiveMilestoneDetail] = useState<{
    project: ActiveShipbuildingProject;
    milestone: ShipbuildingMilestone;
    milestoneIndex: number;
  } | null>(null);

  const [activeProjectDrawer, setActiveProjectDrawer] = useState<ActiveShipbuildingProject | null>(null);

  // 过滤后的项目列表
  const filteredProjects = useMemo(() => {
    return projectsList.filter(proj => {
      // 关键字搜索
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchName = proj.name.toLowerCase().includes(kw);
        const matchCode = proj.shipCode.toLowerCase().includes(kw);
        const matchManager = proj.manager.toLowerCase().includes(kw);
        const matchOwner = proj.owner.toLowerCase().includes(kw);
        if (!matchName && !matchCode && !matchManager && !matchOwner) {
          return false;
        }
      }

      // 船型分类
      if (selectedCategory !== 'ALL' && proj.shipCategory !== selectedCategory) {
        return false;
      }

      // 工位筛选
      if (selectedBerth !== 'ALL' && !proj.dockingArea.includes(selectedBerth)) {
        return false;
      }

      // 健康度
      if (selectedHealth !== 'ALL' && proj.healthStatus !== selectedHealth) {
        return false;
      }

      return true;
    });
  }, [projectsList, searchKeyword, selectedCategory, selectedBerth, selectedHealth]);

  // 重置筛选
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('ALL');
    setSelectedBerth('ALL');
    setSelectedHealth('ALL');
  };

  // 快捷跳转驾驶舱，带入当前选中造船项目并切换到项目3D孪生视图
  const handleGoTo3DTwin = (projectId: string) => {
    if (onNavigate) {
      onNavigate('dashboard', { projectId, viewScope: 'project' });
    } else {
      window.dispatchEvent(new CustomEvent('navigate_view', { 
        detail: { view: 'dashboard', projectId, viewScope: 'project' } 
      }));
    }
  };

  // 快捷跳转项目版本配置
  const handleGoToProjectMgmt = () => {
    if (onNavigate) {
      onNavigate('projects');
    } else {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'projects' } }));
    }
  };

  // 快捷跳转人员定位
  const handleGoToPersonnel = () => {
    if (onNavigate) {
      onNavigate('personnel');
    } else {
      window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'personnel' } }));
    }
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col p-4 md:p-6 space-y-5">
      {/* 1. 顶部驾驶舱仪表看板：标题、全厂概览与核心指标 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-xl p-5 md:p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Anchor className="w-64 h-64 text-blue-200" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              在建造船项目总览看板
            </h1>
          </div>
        </div>

        {/* 核心 KPI 指标卡片网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 mt-5 pt-4 border-t border-slate-800/80">
          {/* 指标 1: 在建重点船舶 */}
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/60 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>在建重点船舶</span>
              <Ship className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {YARD_PROJECT_OVERVIEW_KPIS.totalActiveProjects}
              <span className="text-xs font-normal text-slate-400 ml-1">艘</span>
            </div>
          </div>

          {/* 指标 2: 全厂综合平均进度 */}
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/60 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>综合平均进度</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1.5">
              {YARD_PROJECT_OVERVIEW_KPIS.averageProgress}%
            </div>
          </div>

          {/* 指标 3: 现场在场施工总人力 */}
          <div 
            onClick={handleGoToPersonnel} 
            className="bg-slate-800/40 hover:bg-slate-800/70 rounded-lg p-3 border border-slate-700/60 backdrop-blur-sm transition-colors cursor-pointer group"
          >
            <div className="text-[11px] text-slate-400 group-hover:text-blue-300 font-medium flex items-center justify-between">
              <span>在场作业人力</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1.5">
              {YARD_PROJECT_OVERVIEW_KPIS.totalWorkersOnSite}
              <span className="text-xs font-normal text-slate-400 ml-1">人</span>
            </div>
          </div>

          {/* 指标 4: 连续安全运行 */}
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/60 backdrop-blur-sm">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>安全生产天数</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1.5">
              {YARD_PROJECT_OVERVIEW_KPIS.safeOperationDays}
              <span className="text-xs font-normal text-slate-400 ml-1">天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 检索筛选过滤栏与视图切换器 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* 关键字搜索输入框 */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索船名、船号(LNG-174)、总长、船东..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all"
            />
            {searchKeyword && (
              <button 
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 船型分类选择 */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0">船型:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">全部船型 ({projectsList.length})</option>
              <option value="LNG/清洁能源">LNG/清洁能源</option>
              <option value="超大型集装箱">超大型集装箱</option>
              <option value="VLCC油轮">VLCC油轮</option>
              <option value="大吨位散货">大吨位散货</option>
              <option value="特种化学品">特种化学品</option>
            </select>
          </div>

          {/* 船坞工位选择 */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0">工位:</span>
            <select
              value={selectedBerth}
              onChange={(e) => setSelectedBerth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">全部工位</option>
              <option value="1号船台">1号船台 (平船台)</option>
              <option value="2号码头">2号码头 (舾装)</option>
              <option value="3号码头">3号码头 (水下舾装)</option>
              <option value="4号船台">4号船台 (平船台)</option>
              <option value="6号船台">6号船台 (散货平船台)</option>
            </select>
          </div>

          {/* 进度健康状态 */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0">健康度:</span>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">全部状态</option>
              <option value="ahead">进度超前 (Ahead)</option>
              <option value="normal">正常可控 (Normal)</option>
              <option value="warning">工期受阻预警 (Warning)</option>
            </select>
          </div>

          {(searchKeyword || selectedCategory !== 'ALL' || selectedBerth !== 'ALL' || selectedHealth !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              title="重置全部筛选条件"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          )}
        </div>

        {/* 右侧：视图模式切换 (卡片全景 / 船位图) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards' 
                ? 'bg-white text-blue-600 shadow-xs font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>项目综合卡片</span>
          </button>
          <button
            onClick={() => setViewMode('berths')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'berths' 
                ? 'bg-white text-blue-600 shadow-xs font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>工位分布</span>
          </button>
        </div>
      </div>

      {/* 3. 核心内容区域 */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Ship className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">未找到符合条件的在建船舶工程</h3>
          <p className="text-xs text-slate-500 max-w-md">
            当前筛选条件下未匹配到对应船舶项目，请尝试清空关键词或重置筛选选项。
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-all cursor-pointer"
          >
            重置筛选条件
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* 模式 A：里程碑综合卡片视图 */
        <div className="space-y-5">
          {filteredProjects.map((project) => {
            const shipImg = getShipVesselImage(project);
            const isAhead = project.healthStatus === 'ahead';
            const isWarning = project.healthStatus === 'warning';

            return (
              <div 
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* 卡片头部：船舶身份、代码、船东、状态标签与进度环 */}
                <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/40">
                  <div className="flex items-start gap-4">
                    {/* 3D 船模微缩图 */}
                    <div 
                      onClick={() => setActiveProjectDrawer(project)}
                      className="w-24 h-18 md:w-32 md:h-22 rounded-lg overflow-hidden relative shrink-0 border border-slate-200 bg-slate-900 group cursor-pointer shadow-xs"
                      title="点击查看船舶详细工程参数"
                    >
                      <img 
                        src={shipImg} 
                        alt={project.name} 
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] text-white/90 font-mono tracking-wider font-semibold">
                          {project.shipCode}
                        </span>
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-0.5 text-white">
                        <Eye className="w-3 h-3" />
                      </div>
                    </div>

                    {/* 项目基本信息 */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 
                          onClick={() => setActiveProjectDrawer(project)}
                          className="text-base md:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2"
                        >
                          {project.name}
                        </h2>

                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {project.shipCategory}
                        </span>

                        {isAhead && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            工期超前
                          </span>
                        )}
                        {isWarning && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            工期预警
                          </span>
                        )}
                        {!isAhead && !isWarning && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            按期推进
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          {project.statusLabel}
                        </span>
                      </div>

                      {/* 船东与负责人 */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>船东: <strong className="text-slate-700 font-medium">{project.owner}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>建造总长: <strong className="text-slate-700 font-medium">{project.manager}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>工位: <strong className="text-slate-700 font-medium">{project.dockingArea}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>交付目标: <strong className="text-slate-700 font-medium font-mono">{project.deliveryDate}</strong></span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* 右侧：进度百分比与行动操作 */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-medium">总体建造进度</div>
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className={`text-2xl md:text-3xl font-extrabold font-mono ${
                          project.overallProgress >= 80 ? 'text-emerald-600' :
                          project.overallProgress >= 40 ? 'text-blue-600' : 'text-cyan-600'
                        }`}>
                          {project.overallProgress}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        距交付倒计时: <span className="font-mono font-bold text-slate-800">{project.remainingDays}</span> 天
                      </div>
                    </div>
                  </div>
                </div>

                {/* 卡片主体：关键里程碑时间轴进度 (7大关键节点) */}
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                        造船建造工艺七大关键里程碑节点
                      </h3>
                      <span className="text-[11px] text-slate-400">(点击任意节点查看质量检验与攻坚状态)</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>已达成</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                        <span>正在攻坚</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        <span>待开始</span>
                      </div>
                    </div>
                  </div>

                  {/* 里程碑时序流程线 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 relative">
                    {project.milestones.map((milestone, idx) => {
                      const isCompleted = milestone.status === 'completed';
                      const isInProgress = milestone.status === 'in_progress';
                      const isUpcoming = milestone.status === 'upcoming';
                      const isDelayed = milestone.status === 'delayed';

                      return (
                        <div
                          key={milestone.id}
                          onClick={() => setActiveMilestoneDetail({ project, milestone, milestoneIndex: idx })}
                          className={`relative rounded-xl p-3 border transition-all cursor-pointer flex flex-col justify-between group ${
                            isInProgress 
                              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/15 shadow-sm' 
                              : isCompleted 
                              ? 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300' 
                              : isDelayed
                              ? 'bg-amber-50/60 border-amber-300'
                              : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* 节点序号与状态图标 */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                isInProgress 
                                  ? 'bg-blue-600 text-white' 
                                  : isCompleted 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                0{idx + 1}
                              </span>

                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {isInProgress && (
                                <span className="flex h-2 w-2 relative shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                              )}
                              {isDelayed && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                              {isUpcoming && <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            </div>

                            <div className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {milestone.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono tracking-tight truncate">
                              {milestone.englishName}
                            </div>
                          </div>

                          {/* 节点进度与日期 */}
                          <div className="mt-3 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                              <span>完成度</span>
                              <span className="font-mono font-bold text-slate-700">
                                {milestone.progressPercent}%
                              </span>
                            </div>

                            {/* 微进度条 */}
                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden mb-1.5">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  isCompleted ? 'bg-emerald-500' :
                                  isInProgress ? 'bg-blue-600' :
                                  isDelayed ? 'bg-amber-500' : 'bg-slate-300'
                                }`}
                                style={{ width: `${milestone.progressPercent}%` }}
                              ></div>
                            </div>

                            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                              <span className="text-slate-400">计划:</span>
                              <span className="truncate">{milestone.plannedDate.slice(5)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 模式 B：工位船台占用全景分布 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-900 text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {project.dockingArea}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    进度: {project.overallProgress}%
                  </span>
                </div>

                <div className="h-32 rounded-lg overflow-hidden bg-slate-900 relative my-3">
                  <img 
                    src={getShipVesselImage(project)} 
                    alt={project.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                    <span className="text-white text-xs font-bold font-mono">{project.shipCode}</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-800">{project.name}</h4>
                <div className="text-xs text-slate-500 mt-1">
                  当前工艺阶段: <strong className="text-blue-600 font-medium">{project.statusLabel}</strong>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  现场在岗人数: <strong className="text-slate-700 font-mono font-medium">{project.metrics.workersOnSite} 人</strong>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">交船: {project.deliveryDate}</span>
                <button
                  onClick={() => handleGoTo3DTwin(project.id)}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-medium cursor-pointer"
                >
                  工位视角
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. 交互弹窗：关键里程碑节点详细审查抽屉 (Milestone Inspection Modal) */}
      {activeMilestoneDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* 弹窗头部 */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold font-mono text-blue-300">
                  0{activeMilestoneDetail.milestoneIndex + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {activeMilestoneDetail.milestone.name}
                    </h3>
                    <span className="text-xs text-blue-300 font-mono">
                      ({activeMilestoneDetail.milestone.englishName})
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    所属船舶: {activeMilestoneDetail.project.name} ({activeMilestoneDetail.project.shipCode})
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveMilestoneDetail(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
              {/* 节点核心状态指示 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">达成状态</div>
                  <div className="text-sm font-bold mt-1 text-slate-800 flex items-center gap-1.5">
                    {activeMilestoneDetail.milestone.status === 'completed' && (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> 已按期完成
                      </span>
                    )}
                    {activeMilestoneDetail.milestone.status === 'in_progress' && (
                      <span className="text-blue-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span> 重点攻坚中
                      </span>
                    )}
                    {activeMilestoneDetail.milestone.status === 'upcoming' && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> 计划中
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">完成度 / 计划排期</div>
                  <div className="text-sm font-bold mt-1 font-mono text-blue-600">
                    {activeMilestoneDetail.milestone.progressPercent}%
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      ({activeMilestoneDetail.milestone.plannedDate})
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-400">检验单项达标率</div>
                  <div className="text-sm font-bold mt-1 font-mono text-emerald-600">
                    {activeMilestoneDetail.milestone.checklistCount.passed} / {activeMilestoneDetail.milestone.checklistCount.total} 项
                  </div>
                </div>
              </div>

              {/* 关键交付成果 Deliverable */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-200/60">
                <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>里程碑核心交付物与工艺目标:</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeMilestoneDetail.milestone.keyDeliverable}
                </p>
              </div>

              {/* 船检与质检验收负责 */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">船级社与总检验收师:</span>
                  <span className="font-medium text-slate-900">{activeMilestoneDetail.milestone.inspector}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">所在船位工区:</span>
                  <span className="font-medium text-slate-900">{activeMilestoneDetail.project.dockingArea}</span>
                </div>
                {activeMilestoneDetail.milestone.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-600">
                    <span className="font-bold text-slate-700">攻坚记录与保障措施: </span>
                    {activeMilestoneDetail.milestone.notes}
                  </div>
                )}
              </div>
            </div>

            {/* 弹窗底部操作 */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const pid = activeMilestoneDetail.project.id;
                  setActiveMilestoneDetail(null);
                  handleGoTo3DTwin(pid);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>进入该项目 3D 孪生工位查看</span>
              </button>

              <button
                onClick={() => setActiveMilestoneDetail(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 交互抽屉：船舶详细工程主尺度参数 (Project Detail Drawer) */}
      {activeProjectDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <Ship className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {activeProjectDrawer.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {activeProjectDrawer.shipCode} · {activeProjectDrawer.shipType}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveProjectDrawer(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
              {/* 顶部渲染图与基本参数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img 
                    src={getShipVesselImage(activeProjectDrawer)} 
                    alt={activeProjectDrawer.name} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 mb-2">船舶工程主尺度参数 (Hull Parameters)</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-slate-400">总长(LOA):</span> <strong className="font-mono text-slate-800">{activeProjectDrawer.parameters.loa} m</strong></div>
                    <div><span className="text-slate-400">型宽(Beam):</span> <strong className="font-mono text-slate-800">{activeProjectDrawer.parameters.beam} m</strong></div>
                    <div><span className="text-slate-400">型深(Depth):</span> <strong className="font-mono text-slate-800">{activeProjectDrawer.parameters.depth} m</strong></div>
                    <div><span className="text-slate-400">设计吃水:</span> <strong className="font-mono text-slate-800">{activeProjectDrawer.parameters.draft} m</strong></div>
                    <div className="col-span-2"><span className="text-slate-400">载重/排水量:</span> <strong className="font-mono text-slate-800">{activeProjectDrawer.parameters.displacement}</strong></div>
                    <div className="col-span-2"><span className="text-slate-400">主机推进:</span> <strong className="font-mono text-slate-800">{activeProjectDrawer.parameters.power}</strong></div>
                  </div>
                </div>
              </div>

              {/* 船东、船级社与建造团队 */}
              <div className="grid grid-cols-3 gap-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                <div>
                  <div className="text-[11px] text-slate-400">船东客户</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{activeProjectDrawer.owner}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">入级船级社</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{activeProjectDrawer.classificationSociety}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">建造总指挥</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{activeProjectDrawer.manager}</div>
                </div>
              </div>

              {/* 各专业分项进度全表 */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2">建造专业分项进度横向全览 (Discipline Breakdown)</div>
                <div className="space-y-2">
                  {activeProjectDrawer.disciplines.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-28 text-slate-600 truncate">{d.name}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            d.status === 'ahead' ? 'bg-emerald-500' :
                            d.status === 'lagging' ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${d.progress}%` }}
                        ></div>
                      </div>
                      <span className="w-12 font-mono font-bold text-slate-800 text-right">{d.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const pid = activeProjectDrawer.id;
                  setActiveProjectDrawer(null);
                  handleGoTo3DTwin(pid);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                前往该船 3D 驾驶舱
              </button>
              <button
                onClick={() => setActiveProjectDrawer(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
