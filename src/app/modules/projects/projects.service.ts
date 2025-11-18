// projects.service.ts - projects module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IProject } from "./projects.interface";
import { Project } from "./projects.model";
import { Team } from "../teams/teams.model";

const createProjectService = async (payload: IProject) => {
    try {
    
    const existingTeam = await Team.findById(payload.assignedTeam);
    if (!existingTeam) {
      throw new AppError(httpStatus.BAD_REQUEST, "Assigned team does not exist");
    }

    const newProject = await Project.create(payload);
    existingTeam.totalProjects += 1;
    await existingTeam.save();
    return newProject;

    }catch (error) {
       if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create project"
    );
    }
}


export const ProjectsService = {
    createProjectService,
}

