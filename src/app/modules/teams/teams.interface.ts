// teams.interface.ts - teams module

import { Types } from "mongoose";

export interface ITeam {
    name: string;
    members?: Types.ObjectId[];
    totalMembers?: number;
    totalProjects?: number;
}