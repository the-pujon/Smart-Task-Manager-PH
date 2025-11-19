// dashboard.interface.ts - dashboard module

export interface IDashboardStats {
  totalProjects: number;
  totalTasks: number;
  teamMembers: number;
  overloaded: number;
}

export interface ILatestTeam {
  _id?: any;
  name?: string;
  totalMembers?: number;
  totalProjects?: number;
  createdAt?: Date;
}

export interface ILatestProject {
  _id?: any;
  name?: string;
  description?: string;
  status?: string;
  assignedTeam?: {
    _id?: any;
    name?: string;
  } | any;
  createdAt?: Date;
}

export interface ILatestActivity {
  _id?: any;
  activityType?: string;
  description?: string;
  user?: {
    _id?: any;
    name?: string;
    email?: string;
  } | any;
  project?: {
    _id?: any;
    name?: string;
  } | any;
  task?: {
    _id?: any;
    title?: string;
  } | any;
  createdAt?: Date;
}

export interface IDashboardResponse {
  stats: IDashboardStats;
  latestTeams: any[];
  latestProjects: any[];
  latestActivities: any[];
}
