// projects.service.ts - projects module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IProject } from "./projects.interface";
import { Project } from "./projects.model";
import { Team } from "../teams/teams.model";
import { logProjectCreation } from "../activityLog/activityLog.utils";

const createProjectService = async (payload: IProject, autoReassign: boolean = false, userId?: string) => {
    try {
    
    const existingTeam = await Team.findById(payload.assignedTeam);
    if (!existingTeam) {
      throw new AppError(httpStatus.BAD_REQUEST, "Assigned team does not exist");
    }

    const newProject = await Project.create(payload);
    existingTeam.totalProjects += 1;
    await existingTeam.save();

    // Log project creation activity
    await logProjectCreation(
      newProject._id,
      payload.name,
      payload.assignedTeam,
      userId
    );

    return newProject;

    }catch (error) {
       if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create project"
    );
    }
}

const getProjectsService = async () => {
    try {
        const projects = await Project.find()
            .populate('assignedTeam', { members: 0 })
            .populate({
                path: 'tasks',
                populate: {
                    path: 'assignedMember'
                }
            });
        return projects;
    } catch (error) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            (error as Error).message || "Failed to fetch projects"
        );
    }
}


export const ProjectsService = {
    createProjectService,
    getProjectsService,
}

