// projects.interface.ts - projects module

export interface IProject {
    name: string;
    description?: string;
    assignedTeam: string;
    
    status?: "Active" | "Archived" | "Completed";
    createdAt?: Date;
    updatedAt?: Date;
}