import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { TeamRoutes } from '../modules/teams/teams.route';
import { MemberRoutes } from '../modules/members/members.route';
import { ProjectsRoutes } from '../modules/projects/projects.route';
import { TaskRoutes } from '../modules/tasks/tasks.route';



const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/teams',
    route: TeamRoutes,
  },
  {
    path: '/members',
    route: MemberRoutes,
  },
  {
    path: '/projects',
    route: ProjectsRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
