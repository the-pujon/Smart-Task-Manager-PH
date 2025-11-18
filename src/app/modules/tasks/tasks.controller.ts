// tasks.controller.ts - tasks module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TasksService } from "./tasks.service";

const createTaskController = catchAsync(async (req, res) => {
    const taskData = req.body;
    const newTask = await TasksService.createTaskService(taskData);
  
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
})

export const TasksController = {
    createTaskController,
}

