// projects.controller.ts - projects module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProjectsService } from "./projects.service";

const createProjectController = catchAsync(async (req, res) => {
    const projectData = req.body;
    const userId = req.user?.userId; // Get user ID from authenticated request
    console.log("userId", userId)
    const newProject = await ProjectsService.createProjectService(projectData, false, userId);
  
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
})

const getProjectsController = catchAsync(async (req, res) => {
    const projects = await ProjectsService.getProjectsService();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Projects fetched successfully",
        data: projects,
    });
});

export const ProjectsController = {
    createProjectController,
    getProjectsController,
}