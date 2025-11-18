// tasks.interface.ts - tasks module

export interface ITask {
    title: string;
    description?: string;

    project: string;
    assignedMember?: string;

    priority?: "Low" | "Medium" | "High";
    status?: "Pending" | "In Progress" | "Done";
    createdAt?: Date;
    updatedAt?: Date;
}