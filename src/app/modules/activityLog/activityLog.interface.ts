// activityLog.interface.ts - activityLog module

import { Types } from "mongoose";

export type ActivityType = 
  | "PROJECT_CREATED"
  | "TASK_ASSIGNED"
  | "TASK_REASSIGNED";

export interface IActivityLog {
  activityType: ActivityType;
  description: string;
  user?: Types.ObjectId | string;
  project?: Types.ObjectId | string;
  task?: Types.ObjectId | string;
  fromMember?: Types.ObjectId | string;
  toMember?: Types.ObjectId | string;
  metadata?: Record<string, any>;
  createdAt?: Date;
}
