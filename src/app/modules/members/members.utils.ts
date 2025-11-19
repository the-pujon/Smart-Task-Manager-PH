// members.utils.ts - members module

import { Member } from "./members.model";
import { Task } from "../tasks/tasks.model";
import { Types } from "mongoose";

/**
 * Recalculate and update a member's task statistics
 * This ensures data consistency between tasks and member stats
 * @param memberId - The member ID to update
 */
export const updateMemberTaskStats = async (memberId: string | Types.ObjectId) => {
  try {
    const member = await Member.findById(memberId);
    
    if (!member) {
      throw new Error("Member not found");
    }

    // Count total tasks assigned to this member (excluding completed)
    const totalTasks = await Task.countDocuments({
      assignedMember: memberId,
      status: { $ne: "Done" }
    });

    // Count completed tasks
    const tasksCompleted = await Task.countDocuments({
      assignedMember: memberId,
      status: "Done"
    });

    // Update member with actual counts
    member.totalTasks = totalTasks;
    member.tasksCompleted = tasksCompleted;
    
    // The pre-save hook will automatically update the 'overloaded' field
    await member.save();

    return member;
  } catch (error) {
    throw error;
  }
};

/**
 * Increment a member's total task count
 * @param memberId - The member ID to update
 * @param count - The amount to increment (default: 1)
 */
export const incrementMemberTasks = async (
  memberId: string | Types.ObjectId,
  count: number = 1
) => {
  try {
    const member = await Member.findById(memberId);
    
    if (!member) {
      throw new Error("Member not found");
    }

    member.totalTasks += count;
    await member.save(); // Triggers pre-save hook for overloaded status

    return member;
  } catch (error) {
    throw error;
  }
};

/**
 * Decrement a member's total task count
 * @param memberId - The member ID to update
 * @param count - The amount to decrement (default: 1)
 */
export const decrementMemberTasks = async (
  memberId: string | Types.ObjectId,
  count: number = 1
) => {
  try {
    const member = await Member.findById(memberId);
    
    if (!member) {
      throw new Error("Member not found");
    }

    member.totalTasks = Math.max(0, member.totalTasks - count);
    await member.save(); // Triggers pre-save hook for overloaded status

    return member;
  } catch (error) {
    throw error;
  }
};

/**
 * Update task completion count for a member
 * @param memberId - The member ID to update
 * @param increment - Whether to increment (true) or decrement (false)
 */
export const updateMemberCompletedTasks = async (
  memberId: string | Types.ObjectId,
  increment: boolean = true
) => {
  try {
    const member = await Member.findById(memberId);
    
    if (!member) {
      throw new Error("Member not found");
    }

    if (increment) {
      member.tasksCompleted += 1;
      member.totalTasks = Math.max(0, member.totalTasks - 1);
    } else {
      member.tasksCompleted = Math.max(0, member.tasksCompleted - 1);
      member.totalTasks += 1;
    }

    await member.save(); // Triggers pre-save hook for overloaded status

    return member;
  } catch (error) {
    throw error;
  }
};

/**
 * Recalculate stats for all members in a team
 * Useful for data consistency checks or after bulk operations
 * @param teamId - The team ID to update all members for
 */
export const recalculateTeamMemberStats = async (teamId: string | Types.ObjectId) => {
  try {
    const members = await Member.find({ team: teamId });
    
    const updatePromises = members.map(async (member) => {
      return updateMemberTaskStats(member._id);
    });

    const updatedMembers = await Promise.all(updatePromises);
    
    return {
      success: true,
      membersUpdated: updatedMembers.length,
      members: updatedMembers.map(m => ({
        id: m._id.toString(),
        name: m.name,
        totalTasks: m.totalTasks,
        tasksCompleted: m.tasksCompleted,
        capacity: m.capacity,
        overloaded: m.overloaded,
      })),
    };
  } catch (error) {
    throw error;
  }
};
