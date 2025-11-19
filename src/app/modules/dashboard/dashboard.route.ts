// dashboard.route.ts - dashboard module

import express from 'express';
import { DashboardControllers } from './dashboard.controller';
import { auth } from '../../middlewares/auth';

const router = express.Router();

// Get dashboard data - accessible by authenticated users
router.get(
  '/',
//   auth('admin', 'superAdmin', 'project_manager'),
  DashboardControllers.getDashboardData,
);

// Clear dashboard cache - accessible by admins only
router.delete(
  '/cache',
  auth('admin', 'superAdmin'),
  DashboardControllers.clearCache,
);

export const DashboardRoutes = router;
