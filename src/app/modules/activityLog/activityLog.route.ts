// activityLog.route.ts - activityLog module

import { Router } from "express";
import { ActivityLogController } from "./activityLog.controller";

const router = Router();

// Get all activity logs with optional filters
router.get("/", ActivityLogController.getActivityLogsController);

// Get activity logs for a specific project
router.get("/project/:projectId", ActivityLogController.getProjectActivityLogsController);

// Get activity logs for a specific task
router.get("/task/:taskId", ActivityLogController.getTaskActivityLogsController);

export const ActivityLogRoutes = router;
