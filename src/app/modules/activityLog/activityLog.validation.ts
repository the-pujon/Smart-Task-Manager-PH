// activityLog.validation.ts - activityLog module

import { z } from "zod";

const getActivityLogsSchema = z.object({
  query: z.object({
    project: z.string().optional(),
    task: z.string().optional(),
    activityType: z.enum(["PROJECT_CREATED", "TASK_ASSIGNED", "TASK_REASSIGNED"]).optional(),
    limit: z.string().optional(),
  }),
});

const getProjectActivityLogsSchema = z.object({
  params: z.object({
    projectId: z.string({
      required_error: "Project ID is required",
    }),
  }),
});

const getTaskActivityLogsSchema = z.object({
  params: z.object({
    taskId: z.string({
      required_error: "Task ID is required",
    }),
  }),
});

export const ActivityLogValidation = {
  getActivityLogsSchema,
  getProjectActivityLogsSchema,
  getTaskActivityLogsSchema,
};
