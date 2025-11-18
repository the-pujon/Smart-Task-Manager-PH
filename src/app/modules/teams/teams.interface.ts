// teams.interface.ts - teams module

export interface ITeam {
    name: string;
    members?: string[];
    totalMembers?: number;
    totalProjects?: number;
}