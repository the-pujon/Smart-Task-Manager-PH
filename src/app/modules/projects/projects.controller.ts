// projects.controller.ts - projects module

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ProjectsService } from "./projects.service";

const createProjectController = catchAsync(async (req, res) => {
    const projectData = req.body;
    const newProject = await ProjectsService.createProjectService(projectData);
  
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Project created successfully",
      data: newProject,
    });
})

export const ProjectsController = {
    createProjectController,
}