// projects.model.ts - projects module

import { Schema, model, Types } from "mongoose";

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  assignedTeam: { type: Types.ObjectId, ref: "Team", required: true },

  // optional status, dueDate, tags
  status: { type: String, enum: ["Active", "Archived", "Completed"], default: "Active" },
}, { timestamps: true });

export const Project = model("Project", projectSchema);