// teams.controller.ts - teams module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TeamService } from "./teams.service";
import httpStatus from "http-status";

const createTeamController = catchAsync(async(req, res) => {
    const teamData = req.body;
    const newTeam = await TeamService.createTeamService(teamData);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Team created successfully",
        data: newTeam,
    })
})

const getTeamsController = catchAsync(async (req, res) => {
    const teams = await TeamService.getTeamsService();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Teams retrieved successfully",
        data: teams,
    });
});

const updateTeamController = catchAsync(async (req, res) => {
    const teamId = req.params.teamId;
    const updateData = req.body;

    const updatedTeam = await TeamService.updateTeamService(teamId, updateData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Team updated successfully",
        data: updatedTeam,
    });
});

const deleteTeamController = catchAsync(async (req, res) => {
    const teamId = req.params.teamId;

    const deletedTeam = await TeamService.deleteTeamService(teamId);
    
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Team deleted successfully",
        data: deletedTeam,
    });
});

export const teamController = {
    createTeamController,
    getTeamsController,
    updateTeamController,
    deleteTeamController,
}