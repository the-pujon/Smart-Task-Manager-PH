// activityLog.utils.ts - activityLog module

import { Types } from "mongoose";
import { ActivityLogService } from "./activityLog.service";
import { Member } from "../members/members.model";

/**
 * Log project creation activity
 */
export const logProjectCreation = async (
  projectId: string | Types.ObjectId,
  projectName: string,
  teamId: string | Types.ObjectId,
  userId?: string | Types.ObjectId
) => {
    console.log("loging")
  try {
    await ActivityLogService.createActivityLogService({
      activityType: "PROJECT_CREATED",
      description: `Project "${projectName}" was created`,
      user: userId,
      project: projectId,
      metadata: {
        projectName,
        teamId,
      },
    });
  } catch (error) {
    console.error("Failed to log project creation:", error);
  }
};

/**
 * Log task assignment activity
 */
export const logTaskAssignment = async (
  taskId: string | Types.ObjectId,
  taskTitle: string,
  projectId: string | Types.ObjectId,
  memberId: string | Types.ObjectId,
  userId?: string | Types.ObjectId
) => {
  try {
    const member = await Member.findById(memberId);
    const memberName = member?.name || "Unknown Member";

    await ActivityLogService.createActivityLogService({
      activityType: "TASK_ASSIGNED",
      description: `Task "${taskTitle}" was assigned to ${memberName}`,
      user: userId,
      project: projectId,
      task: taskId,
      toMember: memberId,
      metadata: {
        taskTitle,
        memberName,
      },
    });
  } catch (error) {
    console.error("Failed to log task assignment:", error);
  }
};

/**
 * Log task reassignment activity
 */
export const logTaskReassignment = async (
  taskId: string | Types.ObjectId,
  taskTitle: string,
  projectId: string | Types.ObjectId,
  fromMemberId: string | Types.ObjectId,
  toMemberId: string | Types.ObjectId,
  reason: string = "Manual reassignment",
  userId?: string | Types.ObjectId
) => {
  try {
    const [fromMember, toMember] = await Promise.all([
      Member.findById(fromMemberId),
      Member.findById(toMemberId),
    ]);

    const fromMemberName = fromMember?.name || "Unknown Member";
    const toMemberName = toMember?.name || "Unknown Member";

    await ActivityLogService.createActivityLogService({
      activityType: "TASK_REASSIGNED",
      description: `Task "${taskTitle}" was reassigned from ${fromMemberName} to ${toMemberName}`,
      user: userId,
      project: projectId,
      task: taskId,
      fromMember: fromMemberId,
      toMember: toMemberId,
      metadata: {
        taskTitle,
        fromMemberName,
        toMemberName,
        reason,
      },
    });
  } catch (error) {
    console.error("Failed to log task reassignment:", error);
  }
};

/**
 * Log bulk task reassignments
 */
export const logBulkTaskReassignments = async (
  reassignmentDetails: Array<{
    taskId: string;
    taskTitle: string;
    fromMember: string;
    toMember: string;
    priority: string;
  }>,
  reason: string = "Automatic load balancing"
) => {
  try {
    const logPromises = reassignmentDetails.map(async (detail) => {
      // We need to get member IDs from names
      const [fromMember, toMember] = await Promise.all([
        Member.findOne({ name: detail.fromMember }),
        Member.findOne({ name: detail.toMember }),
      ]);

      if (fromMember && toMember) {
        await ActivityLogService.createActivityLogService({
          activityType: "TASK_REASSIGNED",
          description: `Task "${detail.taskTitle}" was reassigned from ${detail.fromMember} to ${detail.toMember}`,
          task: detail.taskId,
          fromMember: fromMember._id,
          toMember: toMember._id,
          metadata: {
            taskTitle: detail.taskTitle,
            fromMemberName: detail.fromMember,
            toMemberName: detail.toMember,
            priority: detail.priority,
            reason,
          },
        });
      }
    });

    await Promise.all(logPromises);
  } catch (error) {
    console.error("Failed to log bulk task reassignments:", error);
  }
};
