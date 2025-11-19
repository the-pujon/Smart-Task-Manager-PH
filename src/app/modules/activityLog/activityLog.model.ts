// activityLog.model.ts - activityLog module

import { Schema, model } from "mongoose";
import { IActivityLog } from "./activityLog.interface";

const activityLogSchema = new Schema<IActivityLog>(
  {
    activityType: {
      type: String,
      required: true,
      enum: ["PROJECT_CREATED", "TASK_ASSIGNED", "TASK_REASSIGNED"],
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
    fromMember: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    toMember: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
