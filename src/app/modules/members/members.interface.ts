// members.interface.ts - members module

export interface IMember {
    name: string;
    role: string;
    capacity: number;
    team: string; 
    totalTasks?: number;
    tasksCompleted?: number;
    // taskAssigned?: string[];
}