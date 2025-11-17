// teams.controller.ts - teams module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { teamService } from "./teams.service";
import httpStatus from "http-status";

const createTeamController = catchAsync(async(req, res) => {
    const teamData = req.body;
    const newTeam = await teamService.createTeamService(teamData);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Team created successfully",
        data: newTeam,
    })
})

export const teamController = {
    createTeamController,
}