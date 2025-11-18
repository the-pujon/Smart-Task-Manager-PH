// tasks.route.ts - tasks module

import { Router } from "express";
import { TasksController } from "./tasks.controller";

const router = Router()

router.post("/create", TasksController.createTaskController);

export const TaskRoutes = router;
