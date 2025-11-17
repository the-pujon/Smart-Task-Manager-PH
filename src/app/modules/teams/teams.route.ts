// teams.route.ts - teams module

import { Router } from "express";
import { teamController } from "./teams.controller";

const router = Router()

router.post('/create', teamController.createTeamController);

export const TeamRoutes = router;