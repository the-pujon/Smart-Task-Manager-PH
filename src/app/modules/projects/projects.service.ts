// projects.service.ts - projects module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IProject } from "./projects.interface";
import { Project } from "./projects.model";
import { Team } from "../teams/teams.model";
import { logProjectCreation } from "../activityLog/activityLog.utils";
import { Task } from "../tasks/tasks.model";
import { Member } from "../members/members.model";
import { ActivityLog } from "../activityLog/activityLog.model";

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

import mongoose from "mongoose";

const deleteProjectService = async (projectId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const project = await Project.findById(projectId).session(session);
        if (!project) {
            throw new AppError(httpStatus.NOT_FOUND, "Project not found");
        }

        const tasks = await Task.find({ project: projectId }).session(session);
        
        const memberUpdates = new Map<string, { totalTasksDecrement: number, completedTasksDecrement: number }>();
        
        for (const task of tasks) {
            if (task.assignedMember) {
                const memberId = task.assignedMember.toString();
                const current = memberUpdates.get(memberId) || { totalTasksDecrement: 0, completedTasksDecrement: 0 };
                
                current.totalTasksDecrement += 1;
                if (task.status === "Done") {
                    current.completedTasksDecrement += 1;
                }
                
                memberUpdates.set(memberId, current);
            }
        }

        // Update all members
        for (const [memberId, updates] of memberUpdates.entries()) {
            const member = await Member.findById(memberId).session(session);
            if (member) {
                member.totalTasks = Math.max(0, member.totalTasks - updates.totalTasksDecrement);
                member.tasksCompleted = Math.max(0, member.tasksCompleted - updates.completedTasksDecrement);
                await member.save({ session });
            }
        }

        // Update team
        const assignedTeam = await Team.findById(project.assignedTeam).session(session);
        if (assignedTeam) {
            assignedTeam.totalProjects = Math.max(0, assignedTeam.totalProjects - 1);
            await assignedTeam.save({ session });
        }

        // Delete all tasks associated with the project
        await Task.deleteMany({ project: projectId }).session(session);

        // Delete all activity logs associated with the project
        await ActivityLog.deleteMany({ project: projectId }).session(session);

        // Delete the project
        await Project.findByIdAndDelete(projectId).session(session);

        // Commit the transaction
        await session.commitTransaction();
        
        return {
            message: "Project and all associated data deleted successfully",
            projectId,
        };
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        
        if (error instanceof AppError) throw error;
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            (error as Error).message || "Failed to delete project"
        );
    } finally {
        // End session
        session.endSession();
    }
}

export const ProjectsService = {
    createProjectService,
    getProjectsService,
    deleteProjectService
}

