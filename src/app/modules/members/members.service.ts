// members.service.ts - members module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { Team } from "../teams/teams.model";
import { IMember } from "./members.interface";
import { Member } from "./members.model";
import { Types } from "mongoose";

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

    const newMember = await Member.create({ ...payload, team: teamId } as any);

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

export const MemberService = {
  createMembersService,
  getMembersService,
  deleteMembersService,
  updateMembersService,
};
