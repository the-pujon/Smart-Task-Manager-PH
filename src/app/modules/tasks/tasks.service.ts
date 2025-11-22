// tasks.service.ts - tasks module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { ITask } from "./tasks.interface";
import { Project } from "../projects/projects.model";
import { Member } from "../members/members.model";
import { Task } from "./tasks.model";
import {
  checkAndReassignIfOverloaded,
  reassignTasksForOverloadedMembers,
} from "./tasks.utils";
import { Types } from "mongoose";
import { logTaskAssignment } from "../activityLog/activityLog.utils";

const createTaskService = async (
  payload: ITask,
  autoReassign: boolean = false,
  userId?: string
) => {
  try {
    const projectExists = await Project.findById(payload.project);
    if (!projectExists) {
      throw new AppError(httpStatus.BAD_REQUEST, "Project does not exist");
    }

    let memberExists;
    let reassignmentResult = null;

    if (payload.assignedMember) {
      memberExists = await Member.findById(payload.assignedMember);
      if (!memberExists) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Assigned member does not exist"
        );
      }
    }

    const newTask = await Task.create(payload);

    if (memberExists) {
      if (newTask.status !== "Done") {
        memberExists.totalTasks += 1;
      }
      if (newTask.status === "Done") {
        memberExists.tasksCompleted += 1;
      }

      // memberExists.totalTasks += 1;
      await memberExists.save();

      // Log task assignment activity
      await logTaskAssignment(
        newTask._id,
        newTask.title,
        payload.project,
        memberExists._id,
        userId
      );

      // Check if member is overloaded and trigger auto-reassignment if enabled
      if (autoReassign) {
        reassignmentResult = await checkAndReassignIfOverloaded(
          memberExists._id,
          autoReassign
        );
      }
    }

    projectExists.tasks.push(newTask._id);
    await projectExists.save();

    // Populate the task before returning
    const populatedTask = await Task.findById(newTask._id)
      .populate("project", { tasks: 0 })
      .populate("assignedMember");

    return {
      task: populatedTask,
      reassignmentPerformed: reassignmentResult !== null,
      reassignmentDetails: reassignmentResult,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to create task"
    );
  }
};

const getTasksService = async () => {
  try {
    const tasks = await Task.find()
      .populate("project", { tasks: 0 })
      .populate("assignedMember");
    return tasks;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to fetch tasks"
    );
  }
};

/**
 * Manual reassignment service - triggers task reassignment for a specific team
 * @param teamId - The team ID to perform reassignment for
 */
const reassignTasksService = async (teamId: string) => {
  console.log(teamId);
  try {
    // Validate team ID
    if (!Types.ObjectId.isValid(teamId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid team ID");
    }

    // Perform reassignment
    const result = await reassignTasksForOverloadedMembers(teamId);

    if (!result.success) {
      throw new AppError(httpStatus.BAD_REQUEST, result.message);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to reassign tasks"
    );
  }
};

/**
 * Get overloaded members in a team
 * @param teamId - The team ID to check for overloaded members
 */
const getOverloadedMembersService = async (teamId: string) => {
  try {
    // Validate team ID
    if (!Types.ObjectId.isValid(teamId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid team ID");
    }

    const overloadedMembers = await Member.find({
      team: teamId,
      overloaded: true,
    }).select("name role capacity totalTasks");

    return overloadedMembers;
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to fetch overloaded members"
    );
  }
};

const updateTaskService = async (
  taskId: string,
  updateData: Partial<ITask>
) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
    })
      .populate("project", { tasks: 0 })
      .populate("assignedMember");

    if (!updatedTask) {
      throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    // Additional logic for updating related entities can be added here
    const updateMember = await Member.findById(updatedTask.assignedMember);

    if (taskId && updateData.status === "Done" && updateMember) {
      updateMember.tasksCompleted += 1;
      updateMember.totalTasks -= 1;
      await updateMember.save();
    }

    return updatedTask;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to update task"
    );
  }
};

const deleteTaskService = async (taskId: string) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    // Additional logic for updating related entities can be added here
    const updateMember = await Member.findById(deletedTask.assignedMember);

    if (taskId && updateMember) {
      if (deletedTask.status === "Done") {
        updateMember.tasksCompleted = Math.max(
          0,
          updateMember.tasksCompleted - 1
        );
      } else {
        updateMember.totalTasks = Math.max(0, updateMember.totalTasks - 1);
      }
      await updateMember.save();
    }

    return;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message || "Failed to delete task"
    );
  }
};

export const TasksService = {
  createTaskService,
  getTasksService,
  reassignTasksService,
  getOverloadedMembersService,
  updateTaskService,
  deleteTaskService,
};
