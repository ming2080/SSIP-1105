/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * 班组与组织架构管理数据服务 (SSSP 智慧船厂)
 * 独立维护：公司 (1级) -> 部门/车间 (2级) -> 作业班组/工段 (3级) -> 施工作业小队 (4级)
 */

import { DhrDepartment } from './dhrPersonnelData';

export interface DepartmentNode extends DhrDepartment {
  leader?: string;          // 班组长/负责人
  phone?: string;           // 负责人联系方式
  workLocation?: string;    // 主要作业工区 (如：1号船坞、涂装工段、制造下料车间)
  remark?: string;          // 职能/备注
  sortOrder?: number;       // 排序
  createTime?: string;      // 创建时间
  updateTime?: string;      // 修改时间
  children?: DepartmentNode[];
}

// 预置默认组织架构与班组层级
export const INITIAL_DEPARTMENT_NODES: DepartmentNode[] = [
  {
    deptid: 'DEPT-001',
    deptname: '东南船厂',
    depttype: '2', // 子公司/厂区
    deptcode: 'DN_SHIP',
    parentid: '',
    deptgrade: 1, // 1级: 公司
    disabled: 0,
    leader: '林建国',
    phone: '13905910001',
    workLocation: '马尾造船基地厂区总部',
    remark: '造船工程建设运营主体',
    sortOrder: 1,
    createTime: '2024-01-01 08:00',
    children: [
      {
        deptid: 'DEPT-010',
        deptname: '制造部',
        depttype: '4',
        deptcode: 'DN_MFG',
        deptattribute: '02', // 生产车间
        parentid: 'DEPT-001',
        deptgrade: 2, // 2级: 部门/车间
        disabled: 0,
        leader: '张德胜',
        phone: '13850020101',
        workLocation: '制造分段联合车间',
        remark: '负责船体钢结构下料、加工、小组立与大组立拼装制造',
        sortOrder: 10,
        createTime: '2024-01-01 08:30',
        children: [
          {
            deptid: 'DEPT-0101',
            deptname: '船体电焊一组',
            depttype: '4',
            deptcode: 'DN_WELD_01',
            deptattribute: '02',
            parentid: 'DEPT-010',
            deptgrade: 3, // 3级: 作业班组
            disabled: 0,
            leader: '陈志强',
            phone: '13700010101',
            workLocation: '1号制造车间A跨',
            remark: '承接船体结构二氧化碳保护焊与埋弧自动焊关键工序',
            sortOrder: 101,
            createTime: '2024-01-05 09:00'
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
            leader: '黄国祥',
            phone: '13700010102',
            workLocation: '1号制造车间B跨',
            remark: '分段总装预拼与构架定位装配班组',
            sortOrder: 102,
            createTime: '2024-01-05 09:00'
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
            leader: '孙伟平',
            phone: '13700010103',
            workLocation: '数控切割中心',
            remark: '负责船用特种高强钢板高精度数控下料割板',
            sortOrder: 103,
            createTime: '2024-01-05 09:00'
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
        leader: '郑海潮',
        phone: '13850020201',
        workLocation: '1号/2号船坞及滑道船台',
        remark: '负责全船大型分段合拢搭载与起重定位',
        sortOrder: 20,
        createTime: '2024-01-01 08:30',
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
            leader: '王大勇',
            phone: '13700010201',
            workLocation: '1号船坞干船坞区',
            remark: '船体大合拢缝对接及水平轴系基准校核作业',
            sortOrder: 201,
            createTime: '2024-01-05 09:30'
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
            leader: '刘长胜',
            phone: '13700010202',
            workLocation: '800吨龙门吊作业区',
            remark: '特种大型龙门吊起重与分段翻身作业班组',
            sortOrder: 202,
            createTime: '2024-01-05 09:30'
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
        leader: '何永生',
        phone: '13850020301',
        workLocation: '涂装防腐专业工场',
        remark: '船体分段喷砂打砂除锈与特种环保油漆涂覆',
        sortOrder: 30,
        createTime: '2024-01-01 08:30',
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
            leader: '赵玉成',
            phone: '13700010301',
            workLocation: '2号喷漆封闭棚',
            remark: '压载舱及外板无气高压特种喷涂施工',
            sortOrder: 301,
            createTime: '2024-01-05 10:00'
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
            leader: '周福林',
            phone: '13700010302',
            workLocation: '打砂棚1号工位',
            remark: '钢板除锈达到 Sa2.5 标准表面处理班组',
            sortOrder: 302,
            createTime: '2024-01-05 10:00'
          }
        ]
      },
      {
        deptid: 'DEPT-040',
        deptname: '安环部',
        depttype: '4',
        deptcode: 'DN_HSE',
        deptattribute: '01', // 后勤/职能
        parentid: 'DEPT-001',
        deptgrade: 2,
        disabled: 0,
        leader: '李建峰',
        phone: '13850020401',
        workLocation: '安全监督调度中心',
        remark: '负责全厂安全生产监督、受限空间作业监护及环保消防',
        sortOrder: 40,
        createTime: '2024-01-01 08:30',
        children: [
          {
            deptid: 'DEPT-0401',
            deptname: '船坞码头安全督查巡检组',
            depttype: '4',
            deptcode: 'DN_SEC_01',
            deptattribute: '01',
            parentid: 'DEPT-040',
            deptgrade: 3,
            disabled: 0,
            leader: '徐立新',
            phone: '13700010401',
            workLocation: '船坞/码头舾装全域',
            remark: '动火作业监护与高空登高安全防护核查',
            sortOrder: 401,
            createTime: '2024-01-05 10:30'
          }
        ]
      }
    ]
  }
];

const STORAGE_KEY = 'shipyard_departments_v2';

/**
 * 获取本地存储的部门树
 */
export function getStoredDepartments(): DepartmentNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse stored departments:', err);
  }
  return INITIAL_DEPARTMENT_NODES;
}

/**
 * 保存部门树并触发跨组件通知
 */
export function saveStoredDepartments(departments: DepartmentNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    window.dispatchEvent(new CustomEvent('departments_updated', { detail: departments }));
  } catch (err) {
    console.error('Failed to save departments:', err);
  }
}

/**
 * 重置部门树为默认数据
 */
export function resetStoredDepartments(): DepartmentNode[] {
  saveStoredDepartments(INITIAL_DEPARTMENT_NODES);
  return INITIAL_DEPARTMENT_NODES;
}

/**
 * 扁平化部门树结构为一维数组
 */
export function flattenDepartments(tree: DepartmentNode[]): DepartmentNode[] {
  const result: DepartmentNode[] = [];
  function traverse(nodes: DepartmentNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  traverse(tree);
  return result;
}

/**
 * 根据 ID 递归查找部门节点
 */
export function findDepartmentById(tree: DepartmentNode[], id: string): DepartmentNode | null {
  for (const node of tree) {
    if (node.deptid === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findDepartmentById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 获取层级全路径（如：东南船厂 // 制造部 // 船体电焊一组）
 */
export function getDepartmentFullPath(tree: DepartmentNode[], targetId: string): string {
  const flat = flattenDepartments(tree);
  const pathParts: string[] = [];
  let curr = flat.find(d => d.deptid === targetId);

  while (curr) {
    pathParts.unshift(curr.deptname);
    if (!curr.parentid) break;
    curr = flat.find(d => d.deptid === curr!.parentid);
  }

  return pathParts.join(' // ') || '';
}

/**
 * 获取所有子孙部门的 ID（包括自己或不包括自己）
 */
export function getAllDescendantIds(tree: DepartmentNode[], deptId: string, includeSelf = false): string[] {
  const result: string[] = includeSelf ? [deptId] : [];
  const target = findDepartmentById(tree, deptId);
  if (!target || !target.children) return result;

  function collect(nodes: DepartmentNode[]) {
    for (const n of nodes) {
      result.push(n.deptid);
      if (n.children && n.children.length > 0) {
        collect(n.children);
      }
    }
  }
  collect(target.children);
  return result;
}

/**
 * 将平铺数组重建为树形结构
 */
export function buildTreeFromFlatList(flatList: DepartmentNode[]): DepartmentNode[] {
  const idMap = new Map<string, DepartmentNode>();
  const clonedList: DepartmentNode[] = flatList.map(item => ({
    ...item,
    children: []
  }));

  clonedList.forEach(item => {
    idMap.set(item.deptid, item);
  });

  const roots: DepartmentNode[] = [];

  clonedList.forEach(item => {
    if (!item.parentid || !idMap.has(item.parentid)) {
      roots.push(item);
    } else {
      const parent = idMap.get(item.parentid)!;
      if (!parent.children) parent.children = [];
      parent.children.push(item);
    }
  });

  // 按 sortOrder 排序
  function sortNodes(nodes: DepartmentNode[]) {
    nodes.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
    nodes.forEach(n => {
      if (n.children && n.children.length > 0) {
        sortNodes(n.children);
      }
    });
  }
  sortNodes(roots);

  return roots;
}

/**
 * 层级名称获取
 */
export function getGradeLabel(grade: number): { label: string; bg: string; text: string; border: string } {
  switch (grade) {
    case 1:
      return { label: '一级·公司主体', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 2:
      return { label: '二级·部门车间', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 3:
      return { label: '三级·作业班组', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 4:
      return { label: '四级·施工作业队', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    default:
      return { label: `第${grade}级机构`, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
