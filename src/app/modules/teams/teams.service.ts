// teams.service.ts - teams module

import AppError from "../../errors/AppError";
import { Member } from "../members/members.model";
import { ITeam } from "./teams.interface";
import { Team } from "./teams.model";
import httpStatus from "http-status";

const createTeamService = async (payload: ITeam) => {
  try {
    const newTeam = await Team.create(payload);
    return newTeam;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create team"
    );
  }
};

const getTeamsService = async () => {
  try {
    const teams = await Team.find().populate("members", { team: 0 }).exec();
    return teams;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to get teams"
    );
  }
};

const updateTeamService = async (
  teamId: string,
  updateData: Partial<ITeam>
) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(teamId, updateData, {
      new: true,
    });
    if (!updatedTeam) {
      throw new AppError(httpStatus.NOT_FOUND, "Team not found");
    }
    return updatedTeam;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to update team"
    );
  }
};

const deleteTeamService = async (teamId: string) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(teamId);
    if (!deletedTeam) {
      throw new AppError(httpStatus.NOT_FOUND, "Team not found");
    }

    await Member.deleteMany({ team: deletedTeam._id });

    return deletedTeam;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to delete team"
    );
  }
};

export const TeamService = {
  createTeamService,
  getTeamsService,
  updateTeamService,
  deleteTeamService,
};
