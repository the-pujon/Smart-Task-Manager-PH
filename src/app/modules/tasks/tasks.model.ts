// tasks.model.ts - tasks module

import { Schema, model, Types } from "mongoose";

const taskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },

  project: { type: Types.ObjectId, ref: "Project", required: true },
  assignedMember: { type: Types.ObjectId, ref: "Member", default: null },

  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { type: String, enum: ["Pending", "In Progress", "Done"], default: "Pending" },
}, { timestamps: true });

export const Task = model("Task", taskSchema);