// dashboard.controller.ts - dashboard module

import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DashboardServices } from "./dashboard.service";

/**
 * Handles fetching dashboard data
 */
const getDashboardData = catchAsync(async (req, res) => {
  const refresh = req.query.refresh === "true";

  const result = await DashboardServices.getDashboardData(refresh);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard data retrieved successfully",
    data: result,
  });
});

/**
 * Clears dashboard cache
 */
const clearCache = catchAsync(async (req, res) => {
  await DashboardServices.clearDashboardCache();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard cache cleared successfully",
    data: null,
  });
});

export const DashboardControllers = {
  getDashboardData,
  clearCache,
};
