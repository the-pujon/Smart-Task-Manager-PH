// members.interface.ts - members module

import { Types } from "mongoose";

export interface IMember {
    _id?: Types.ObjectId;
    name: string;
    role: string;
    capacity: number;
    team: Types.ObjectId | string; 
    totalTasks?: number;
    tasksCompleted?: number;
    // taskAssigned?: string[];
}