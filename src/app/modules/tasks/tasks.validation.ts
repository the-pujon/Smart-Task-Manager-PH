// tasks.validation.ts - tasks module

import { z } from "zod";

// Validation schema for task reassignment
export const reassignTasksValidationSchema = z.object({
  body: z.object({
    teamId: z.string({
      required_error: "Team ID is required",
      invalid_type_error: "Team ID must be a string",
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid team ID format"),
  }),
});

// Validation schema for getting overloaded members
export const getOverloadedMembersValidationSchema = z.object({
  params: z.object({
    teamId: z.string({
      required_error: "Team ID is required",
      invalid_type_error: "Team ID must be a string",
    }).regex(/^[0-9a-fA-F]{24}$/, "Invalid team ID format"),
  }),
});

export const TasksValidation = {
  reassignTasksValidationSchema,
  getOverloadedMembersValidationSchema,
};
