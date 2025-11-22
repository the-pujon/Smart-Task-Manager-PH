// members.service.ts - members module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { Team } from "../teams/teams.model";
import { IMember } from "./members.interface";
import { Member } from "./members.model";
import { Types } from "mongoose";
import { recalculateTeamMemberStats, updateMemberTaskStats } from "./members.utils";

const createMembersService = async (payload: IMember) => {
  try {
    if (!payload.team) {
      throw new AppError(httpStatus.BAD_REQUEST, "Team ID is required");
    }

    let teamId: Types.ObjectId;

    try {
      teamId = new Types.ObjectId(payload.team);
    } catch (err) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid team ID");
    }

    const existingTeam = await Team.findById(teamId);
    if (!existingTeam) {
      throw new AppError(httpStatus.BAD_REQUEST, "Team does not exist");
    }

    const newMember = await Member.create({ ...payload, team: teamId } as IMember);

    existingTeam.members.push(newMember._id);
    existingTeam.totalMembers = existingTeam.members.length;
    await existingTeam.save();

    return newMember;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create member"
    );
  }
};

const getMembersService = async (teamId: string) => {
  try {
    const members = await Member.find().populate("team",{ _id: 1, name: 1, totalMembers: 1});
    return members;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to get members"
    );
  }
};

const deleteMembersService = async (memberId: string) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(memberId);
    if (!deletedMember) {
      throw new AppError(httpStatus.NOT_FOUND, "Member not found");
    }
    console.log(deletedMember);
    // Also remove member from the team's members array
    await Team.findByIdAndUpdate(deletedMember.team, {
      $pull: { members: deletedMember._id },
      $inc: { totalMembers: -1 },
    });

    return deletedMember;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to delete member"
    );
  }
};

const updateMembersService = async (memberId: string, payload: Partial<IMember>) => {
    try {
        const updatedMember = await Member.findByIdAndUpdate(memberId, payload, { new: true });
        if (!updatedMember) {
            throw new AppError(httpStatus.NOT_FOUND, "Member not found");
        }
        return updatedMember;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            (error as Error).message || "Failed to update member"
        );
    }
}

/**
 * Recalculate task statistics for a specific member
 * @param memberId - The member ID to recalculate stats for
 */
const recalculateMemberStatsService = async (memberId: string) => {
  try {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid member ID");
    }

    const updatedMember = await updateMemberTaskStats(memberId);

    return {
      success: true,
      message: "Member statistics recalculated successfully",
      member: {
        id: updatedMember._id.toString(),
        name: updatedMember.name,
        totalTasks: updatedMember.totalTasks,
        tasksCompleted: updatedMember.tasksCompleted,
        capacity: updatedMember.capacity,
        overloaded: updatedMember.overloaded,
      },
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to recalculate member stats"
    );
  }
};

/**
 * Recalculate task statistics for all members in a team
 * @param teamId - The team ID to recalculate stats for
 */
const recalculateTeamStatsService = async (teamId: string) => {
  try {
    if (!Types.ObjectId.isValid(teamId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid team ID");
    }

    const result = await recalculateTeamMemberStats(teamId);

    return {
      message: `Successfully recalculated stats for ${result.membersUpdated} member(s)`,
      ...result,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to recalculate team stats"
    );
  }
};

export const MemberService = {
  createMembersService,
  getMembersService,
  deleteMembersService,
  updateMembersService,
  recalculateMemberStatsService,
  recalculateTeamStatsService,
};
