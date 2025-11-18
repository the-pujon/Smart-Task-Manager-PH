// members.route.ts - members module

import { Router } from "express";
import { MemberController } from "./members.controller";

const router = Router()

router.post("/create", MemberController.createMemberController);
router.get("/", MemberController.getMembersController);
router.delete("/:memberId", MemberController.deleteMemberController);
router.patch("/:memberId", MemberController.updateMemberController);

export const MemberRoutes = router;

