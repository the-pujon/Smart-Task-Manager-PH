// dashboard.validation.ts - dashboard module

import { z } from "zod";

const getDashboardDataSchema = z.object({
  query: z.object({
    refresh: z.string().optional(),
  }).optional(),
});

export const DashboardValidation = {
  getDashboardDataSchema,
};
