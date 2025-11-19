// projects.route.ts - projects module

import { Router } from "express";
import { ProjectsController } from "./projects.controller";

const router = Router();

router.post("/create", ProjectsController.createProjectController);
router.get("/", ProjectsController.getProjectsController);

export const ProjectsRoutes = router;

