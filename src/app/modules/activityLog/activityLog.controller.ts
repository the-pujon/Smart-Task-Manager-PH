// activityLog.controller.ts - activityLog module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ActivityLogService } from "./activityLog.service";

/**
 * Get all activity logs with optional filtering
 */
const getActivityLogsController = catchAsync(async (req, res) => {
  const { project, task, activityType, limit } = req.query;

  const filters: any = {};
  if (project) filters.project = project as string;
  if (task) filters.task = task as string;
  if (activityType) filters.activityType = activityType as string;
  if (limit) filters.limit = parseInt(limit as string);

  const activityLogs = await ActivityLogService.getActivityLogsService(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Activity logs fetched successfully",
    data: activityLogs,
  });
});

/**
 * Get activity logs for a specific project
 */
const getProjectActivityLogsController = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  const activityLogs = await ActivityLogService.getProjectActivityLogsService(projectId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project activity logs fetched successfully",
    data: activityLogs,
  });
});

/**
 * Get activity logs for a specific task
 */
const getTaskActivityLogsController = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  const activityLogs = await ActivityLogService.getTaskActivityLogsService(taskId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task activity logs fetched successfully",
    data: activityLogs,
  });
});

export const ActivityLogController = {
  getActivityLogsController,
  getProjectActivityLogsController,
  getTaskActivityLogsController,
};
