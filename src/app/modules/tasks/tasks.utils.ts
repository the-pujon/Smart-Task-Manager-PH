// tasks.utils.ts - tasks module

import { Member } from "../members/members.model";
import { Task } from "./tasks.model";
import { Types } from "mongoose";
import { logBulkTaskReassignments } from "../activityLog/activityLog.utils";

/**
 * Reassigns low and medium priority tasks from overloaded members to available members within the same team
 * @param teamId - The team ID to perform reassignment within
 * @returns Object containing reassignment statistics
 */
export const reassignTasksForOverloadedMembers = async (teamId: string | Types.ObjectId) => {
  try {
    // Get all members in the team
    const teamMembers = await Member.find({ team: teamId });

    if (teamMembers.length === 0) {
      return {
        success: false,
        message: "No members found in the team",
        tasksReassigned: 0,
      };
    }

    // Separate overloaded and available members
    const overloadedMembers = teamMembers.filter(
      (member) => member.totalTasks > member.capacity
    );
    const availableMembers = teamMembers.filter(
      (member) => member.totalTasks < member.capacity
    );

    if (overloadedMembers.length === 0) {
      return {
        success: true,
        message: "No overloaded members found",
        tasksReassigned: 0,
      };
    }

    if (availableMembers.length === 0) {
      return {
        success: false,
        message: "No available members to reassign tasks to",
        tasksReassigned: 0,
      };
    }

    let totalTasksReassigned = 0;
    const reassignmentDetails: Array<{
      taskId: string;
      taskTitle: string;
      fromMember: string;
      toMember: string;
      priority: string;
    }> = [];

    // Create a map to track member updates by ID for efficient lookup
    const memberUpdates = new Map<string, { totalTasks: number }>();

    // Process each overloaded member
    for (const overloadedMember of overloadedMembers) {
      // Get low and medium priority tasks assigned to this member
      // Sort by priority (Low first, then Medium) to move lower priority tasks first
      const tasksToReassign = await Task.find({
        assignedMember: overloadedMember._id,
        priority: { $in: ["Low", "Medium"] },
        status: { $ne: "Done" }, // Don't reassign completed tasks
      }).sort({ priority: 1 }); // Low priority first

      // Calculate how many tasks need to be moved
      const excessTasks = overloadedMember.totalTasks - overloadedMember.capacity;

      let tasksMovedFromThisMember = 0;

      // Try to reassign tasks until member is no longer overloaded or no more tasks to move
      for (const task of tasksToReassign) {
        if (tasksMovedFromThisMember >= excessTasks) {
          break; // Member is no longer overloaded
        }

        // Find an available member with capacity
        const targetMember = availableMembers.find(
          (member) => member.totalTasks < member.capacity
        );

        if (!targetMember) {
          break; // No more available members
        }

        // Reassign the task
        task.assignedMember = targetMember._id as any;
        await task.save();

        // Update member statistics in memory
        overloadedMember.totalTasks -= 1;
        targetMember.totalTasks += 1;

        // Track updates
        memberUpdates.set(overloadedMember._id.toString(), {
          totalTasks: overloadedMember.totalTasks,
        });
        memberUpdates.set(targetMember._id.toString(), {
          totalTasks: targetMember.totalTasks,
        });

        tasksMovedFromThisMember++;
        totalTasksReassigned++;

        reassignmentDetails.push({
          taskId: task._id.toString(),
          taskTitle: task.title,
          fromMember: overloadedMember.name,
          toMember: targetMember.name,
          priority: task.priority || "Medium",
        });

        // If target member reaches capacity, remove from available list
        if (targetMember.totalTasks >= targetMember.capacity) {
          const index = availableMembers.indexOf(targetMember);
          if (index > -1) {
            availableMembers.splice(index, 1);
          }
        }
      }
    }

    // Bulk update all modified members in database
    // Using save() instead of findByIdAndUpdate to trigger pre-save hooks
    const updatePromises = Array.from(memberUpdates.entries()).map(
      async ([memberId, updates]) => {
        const member = await Member.findById(memberId);
        if (member) {
          member.totalTasks = updates.totalTasks;
          // The pre-save hook will automatically update the 'overloaded' field
          await member.save();
          return member;
        }
        return null;
      }
    );

    const updatedMembersArray = await Promise.all(updatePromises);
    const updatedMembers = updatedMembersArray.filter(m => m !== null);

    // Log all reassignments to activity log
    if (reassignmentDetails.length > 0) {
      await logBulkTaskReassignments(reassignmentDetails, "Automatic load balancing");
    }

    return {
      success: true,
      message: `Successfully reassigned ${totalTasksReassigned} task(s)`,
      tasksReassigned: totalTasksReassigned,
      details: reassignmentDetails,
      updatedMembers: updatedMembers.map(m => ({
        id: m._id.toString(),
        name: m.name,
        totalTasks: m.totalTasks,
        capacity: m.capacity,
        overloaded: m.overloaded,
      })),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Checks if a member is overloaded and triggers reassignment if autoReassign is enabled
 * @param memberId - The member ID to check
 * @param autoReassign - Whether to automatically trigger reassignment
 * @returns Reassignment result if triggered, null otherwise
 */
export const checkAndReassignIfOverloaded = async (
  memberId: string | Types.ObjectId,
  autoReassign: boolean
) => {
  try {
    const member = await Member.findById(memberId);
    
    if (!member) {
      return null;
    }

    // Check if member is overloaded
    if (member.totalTasks > member.capacity && autoReassign) {
      // Trigger reassignment for the entire team
      const result = await reassignTasksForOverloadedMembers(member.team);
      return result;
    }

    return null;
  } catch (error) {
    throw error;
  }
};
