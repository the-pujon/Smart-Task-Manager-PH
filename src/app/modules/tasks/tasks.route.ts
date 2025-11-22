// tasks.route.ts - tasks module

import { NextFunction, Router } from "express";
import { TasksController } from "./tasks.controller";
import validateRequest from "../../middlewares/validateRequest";
import { TasksValidation } from "./tasks.validation";
import { auth } from "../../middlewares/auth";

const router = Router()

router.post("/create",
  // auth("admin", "project_manager", "superAdmin"), 
  TasksController.createTaskController);
router.get("/",
  //  auth("admin", "project_manager", "superAdmin"),
    TasksController.getTasksController);

// Manual task reassignment endpoint
router.post(
  "/reassign",
  auth("admin", "project_manager", "superAdmin"),
  validateRequest(TasksValidation.reassignTasksValidationSchema),
  TasksController.reassignTasksController
);

// Get overloaded members in a team
router.get(
  "/overloaded/:teamId",
  auth("admin", "project_manager", "superAdmin"),
  validateRequest(TasksValidation.getOverloadedMembersValidationSchema),
  TasksController.getOverloadedMembersController
);

router.patch("/:taskId",
  // auth("admin", "project_manager", "superAdmin"),
  // validateRequest(TasksValidation.updateTaskValidationSchema),
  TasksController.updateTaskController
);

router.delete("/:taskId",
  // auth("admin", "project_manager", "superAdmin"),
  // validateRequest(TasksValidation.deleteTaskValidationSchema),
  TasksController.deleteTaskController
);

export const TasksRoutes = router;