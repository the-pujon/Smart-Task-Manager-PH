// members.controller.ts - members module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MemberService } from "./members.service";

const createMemberController = catchAsync(async (req, res) => {
    const memberData = req.body;
    const newMember = await MemberService.createMembersService(memberData);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Member created successfully",
        data: newMember,
    });
});


const getMembersController = catchAsync(async (req, res) => {
    const teamId = req.params.teamId;
    const members = await MemberService.getMembersService(teamId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Members retrieved successfully",
        data: members,
    });
});

const deleteMemberController = catchAsync(async (req, res) => {
    const memberId = req.params.memberId;
    const deletedMember = await MemberService.deleteMembersService(memberId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Member deleted successfully",
        data: deletedMember,
    });
});

const updateMemberController = catchAsync(async (req, res) => {
    const memberId = req.params.memberId;
    const updateData = req.body;
    const updatedMember = await MemberService.updateMembersService(memberId, updateData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Member updated successfully",
        data: updatedMember,
    });
});

/**
 * Recalculate task statistics for a specific member
 */
const recalculateMemberStatsController = catchAsync(async (req, res) => {
    const memberId = req.params.memberId;
    const result = await MemberService.recalculateMemberStatsService(memberId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result.member,
    });
});

/**
 * Recalculate task statistics for all members in a team
 */
const recalculateTeamStatsController = catchAsync(async (req, res) => {
    const teamId = req.params.teamId;
    const result = await MemberService.recalculateTeamStatsService(teamId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result.members,
    });
});

export const MemberController = {
    createMemberController,
    getMembersController,
    deleteMemberController,
    updateMemberController,
    recalculateMemberStatsController,
    recalculateTeamStatsController,
};