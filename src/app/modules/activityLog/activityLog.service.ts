// activityLog.service.ts - activityLog module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IActivityLog } from "./activityLog.interface";
import { ActivityLog } from "./activityLog.model";

/**
 * Create an activity log entry
 */
const createActivityLogService = async (payload: IActivityLog) => {
  try {
    const activityLog = await ActivityLog.create(payload);
    return activityLog;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create activity log"
    );
  }
};

/**
 * Get all activity logs with optional filtering
 */
const getActivityLogsService = async (filters?: {
  project?: string;
  task?: string;
  activityType?: string;
  limit?: number;
}) => {
  try {
    const query: any = {};

    if (filters?.project) query.project = filters.project;
    if (filters?.task) query.task = filters.task;
    if (filters?.activityType) query.activityType = filters.activityType;

    const activityLogs = await ActivityLog.find(query)
      .populate("user", "name email")
      .populate("project", "name")
      .populate("task", "title")
      .populate("fromMember", "name role")
      .populate("toMember", "name role")
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 100);

    return activityLogs;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to fetch activity logs"
    );
  }
};

/**
 * Get activity logs for a specific project
 */
const getProjectActivityLogsService = async (projectId: string) => {
  try {
    const activityLogs = await ActivityLog.find({ project: projectId })
      .populate("user", "name email")
      .populate("task", "title")
      .populate("fromMember", "name role")
      .populate("toMember", "name role")
      .sort({ createdAt: -1 });

    return activityLogs;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to fetch project activity logs"
    );
  }
};

/**
 * Get activity logs for a specific task
 */
const getTaskActivityLogsService = async (taskId: string) => {
  try {
    const activityLogs = await ActivityLog.find({ task: taskId })
      .populate("user", "name email")
      .populate("project", "name")
      .populate("fromMember", "name role")
      .populate("toMember", "name role")
      .sort({ createdAt: -1 });

    return activityLogs;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to fetch task activity logs"
    );
  }
};

export const ActivityLogService = {
  createActivityLogService,
  getActivityLogsService,
  getProjectActivityLogsService,
  getTaskActivityLogsService,
};
