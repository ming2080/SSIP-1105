export type ViewType = 
  | 'dashboard' 
  | 'project_overview'
  | 'projects' 
  | 'personnel' 
  | 'personnel_track'
  | 'personnel_mgmt'
  | 'overtime'
  | 'team_mgmt'
  | 'tags'
  | 'user_mgmt'
  | 'fence' 
  | 'alarms' 
  | 'alarm_records'
  | 'alarm_analysis'
  | 'devices'
  | 'models'
  | 'workface'
  | 'workface_monitor'
  | 'workface_config'
  | 'workface_screen';

export interface Project {
  id: string;
  name: string;
  shipType: string;
  status: 'planning' | 'in_progress' | 'completed' | 'suspended' | 'temporary_departure';
  progress: number;
  startDate: string;
  endDate: string;
  manager: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'locator' | 'sensor_env' | 'sensor_smoke' | 'sensor_alarm';
  status: 'online' | 'offline' | 'fault';
  projectId?: string;
  areaId?: string;
  lastActive: string;
}

export interface Alarm {
  id: string;
  level: 'high' | 'medium' | 'low';
  type: 'fence_intrusion' | 'device_fault' | 'env_abnormal';
  message: string;
  time: string;
  status: 'unhandled' | 'handled';
  projectId?: string;
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  locatorId?: string;
  projectId?: string;
}
