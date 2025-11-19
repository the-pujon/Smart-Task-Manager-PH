// tasks.controller.ts - tasks module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TasksService } from "./tasks.service";

const createTaskController = catchAsync(async (req, res) => {
    const taskData = req.body;
    const autoReassign = req.query.autoReassign === "true" || req.body.autoReassign === true;
    const userId = req.user?.userId; // Get user ID from authenticated request
    
    const result = await TasksService.createTaskService(taskData, autoReassign, userId);
  
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: result.reassignmentPerformed 
        ? "Task created successfully and reassignment performed" 
        : "Task created successfully",
      data: result,
    });
});

const getTasksController = catchAsync(async (req, res) => {
    const tasks = await TasksService.getTasksService();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tasks fetched successfully",
        data: tasks,
    });
}); 

/**
 * Manual task reassignment controller
 * Allows users to trigger task reassignment for overloaded members in a team
 */
const reassignTasksController = catchAsync(async (req, res) => {
    const { teamId } = req.body;

    if (!teamId) {
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Team ID is required",
            data: null,
        });
    }

    const result = await TasksService.reassignTasksService(teamId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result,
    });
});

/**
 * Get overloaded members controller
 * Returns list of overloaded members in a team
 */
const getOverloadedMembersController = catchAsync(async (req, res) => {
    const { teamId } = req.params;

    if (!teamId) {
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Team ID is required",
            data: null,
        });
    }

    const overloadedMembers = await TasksService.getOverloadedMembersService(teamId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Overloaded members fetched successfully",
        data: overloadedMembers,
    });
});

export const TasksController = {
    createTaskController,
    getTasksController,
    reassignTasksController,
    getOverloadedMembersController,
};

