// dashboard.service.ts - dashboard module

import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { IDashboardResponse } from "./dashboard.interface";
import { Project } from "../projects/projects.model";
import { Task } from "../tasks/tasks.model";
import { Member } from "../members/members.model";
import { Team } from "../teams/teams.model";
import { ActivityLog } from "../activityLog/activityLog.model";
import { DASHBOARD_CONFIG } from "./dashboard.config";
import { cacheData, getCachedData, deleteCachedData } from "../../utils/redis.utils";

/**
 * Fetches dashboard data including stats and latest records
 */
const getDashboardData = async (refresh: boolean = false): Promise<IDashboardResponse> => {
  try {
    const cacheKey = `${DASHBOARD_CONFIG.CACHE_KEY_PREFIX}:data`;

    // Check cache if not forced refresh
    if (!refresh) {
      const cachedData = await getCachedData(cacheKey) as IDashboardResponse | null;
      if (cachedData) {
        return cachedData;
      }
    }

    // Fetch all data in parallel for better performance
    const [
      totalProjects,
      totalTasks,
      teamMembers,
      overloadedMembers,
      latestTeams,
      latestProjects,
      latestActivities,
    ] = await Promise.all([
      // Get total projects count
      Project.countDocuments(),

      // Get total tasks count
      Task.countDocuments(),

      // Get team members count
      Member.countDocuments(),

      // Get overloaded members count - members where totalTasks > capacity
      Member.find({
        $expr: { $gt: ["$totalTasks", "$capacity"] }
      }).countDocuments(),
      
      // Get latest 3 teams
      Team.find()
        .sort({ createdAt: -1 })
        .limit(DASHBOARD_CONFIG.LATEST_TEAMS_LIMIT)
        .select("name totalMembers totalProjects createdAt")
        .lean(),

      // Get latest 3 projects with team info
      Project.find()
        .sort({ createdAt: -1 })
        .limit(DASHBOARD_CONFIG.LATEST_PROJECTS_LIMIT)
        .populate("assignedTeam", "name")
        .select("name description status assignedTeam createdAt")
        .lean(),

      // Get latest 5 activities with populated references
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(DASHBOARD_CONFIG.LATEST_ACTIVITIES_LIMIT)
        .populate("user", "name email")
        .populate("project", "name")
        .populate("task", "title")
        .select("activityType description user project task createdAt")
        .lean(),
    ]);

    const dashboardData: IDashboardResponse = {
      stats: {
        totalProjects,
        totalTasks,
        teamMembers,
        overloaded: overloadedMembers,
      },
      latestTeams,
      latestProjects,
      latestActivities,
    };

    // Cache the data
    await cacheData(cacheKey, dashboardData, DASHBOARD_CONFIG.CACHE_TTL);

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to fetch dashboard data"
    );
  }
};

/**
 * Clears dashboard cache (useful after creating/updating records)
 */
const clearDashboardCache = async (): Promise<void> => {
  try {
    const cacheKey = `${DASHBOARD_CONFIG.CACHE_KEY_PREFIX}:data`;
    await deleteCachedData(cacheKey);
  } catch (error) {
    console.error("Error clearing dashboard cache:", error);
    // Don't throw error for cache clearing failures
  }
};

export const DashboardServices = {
  getDashboardData,
  clearDashboardCache,
};
