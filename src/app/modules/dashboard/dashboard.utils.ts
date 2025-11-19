// dashboard.utils.ts - dashboard module

import { DashboardServices } from "./dashboard.service";

/**
 * Helper function to invalidate dashboard cache after data changes
 * Call this function after creating/updating/deleting projects, tasks, teams, or members
 */
export const invalidateDashboardCache = async (): Promise<void> => {
  await DashboardServices.clearDashboardCache();
};

/**
 * Format dashboard stats for display
 */
export const formatDashboardStats = (data: any) => {
  return {
    ...data,
    stats: {
      ...data.stats,
      overloadedPercentage: data.stats.teamMembers > 0 
        ? ((data.stats.overloaded / data.stats.teamMembers) * 100).toFixed(2) + '%'
        : '0%',
    },
  };
};
