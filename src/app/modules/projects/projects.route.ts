// projects.route.ts - projects module

import { Router } from "express";
import { ProjectsController } from "./projects.controller";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/create",
    auth("admin", "project_manager", "superAdmin"),
    ProjectsController.createProjectController);
router.get("/", auth("admin", "project_manager", "superAdmin"), ProjectsController.getProjectsController);
router.delete("/:id",
    // auth("admin", "superAdmin"),
    ProjectsController.deleteProjectController);

export const ProjectsRoutes = router;

