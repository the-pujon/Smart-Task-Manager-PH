// // members.model.ts - members module

// import { model, Schema } from "mongoose";

// const memberSchema = new Schema({
//     name: { type: String, required: true },
//     role: { type: String, required: true },
//     capacity: { type: Number, required: true },
//     team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
// },
// { timestamps: true }
// )

// export const Member = model('Member', memberSchema);



// members.model.ts - members module

import { model, Schema } from "mongoose";

const memberSchema = new Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    capacity: { type: Number, required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    totalTasks: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    // taskAssigned: [{ type: Schema.Types.ObjectId, ref: "Task" }],
},
{ timestamps: true }
)

export const Member = model('Member', memberSchema);