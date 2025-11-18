// teams.route.ts - teams module

import { Router } from "express";
import { teamController } from "./teams.controller";

const router = Router()

router.post('/create', teamController.createTeamController);
router.get('/', teamController.getTeamsController);
router.patch('/:teamId', teamController.updateTeamController);
router.delete('/:teamId', teamController.deleteTeamController);

export const TeamRoutes = router;