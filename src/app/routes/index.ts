import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { TeamRoutes } from '../modules/teams/teams.route';



const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/teams',
    route: TeamRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
