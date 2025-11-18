// tasks.service.ts - tasks module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ITask } from "./tasks.interface";
import { Project } from "../projects/projects.model";
import { Member } from "../members/members.model";

const createTaskService = async (payload: ITask) => {
  try {
    const projectExists = await Project.findById(payload.project);
    if (!projectExists) {
      throw new AppError(httpStatus.BAD_REQUEST, "Project does not exist");
    }

    let memberExists;

    if (payload.assignedMember) {
      memberExists = await Member.findById(payload.assignedMember);
      if (!memberExists) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Assigned member does not exist"
        );
      }
    }

    const newTask = await Project.create(payload);
    if (memberExists) {
      memberExists.totalTasks += 1;
      await memberExists.save();
    }
    return newTask;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create task"
    );
  }
};

export const TasksService = {
  createTaskService,
};
