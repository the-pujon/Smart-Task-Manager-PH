// tasks.route.ts - tasks module

import { Router } from "express";
import { TasksController } from "./tasks.controller";
import validateRequest from "../../middlewares/validateRequest";
import { TasksValidation } from "./tasks.validation";

const router = Router()

router.post("/create", TasksController.createTaskController);
router.get("/", TasksController.getTasksController);

// Manual task reassignment endpoint
router.post(
  "/reassign",
  validateRequest(TasksValidation.reassignTasksValidationSchema),
  TasksController.reassignTasksController
);

// Get overloaded members in a team
router.get(
  "/overloaded/:teamId",
  validateRequest(TasksValidation.getOverloadedMembersValidationSchema),
  TasksController.getOverloadedMembersController
);

export const TasksRoutes = router;