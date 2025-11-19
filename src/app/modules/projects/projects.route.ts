// projects.route.ts - projects module

import { Router } from "express";
import { ProjectsController } from "./projects.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/create",
    auth("admin", "project_manager", "superAdmin"),
    ProjectsController.createProjectController);
router.get("/", auth("admin", "project_manager", "superAdmin"), ProjectsController.getProjectsController);

export const ProjectsRoutes = router;

