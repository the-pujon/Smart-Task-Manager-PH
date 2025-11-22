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
    overloaded: { type: Boolean, default: false },
    // taskAssigned: [{ type: Schema.Types.ObjectId, ref: "Task" }],
},
{ timestamps: true }
)


memberSchema.pre('save', function () {
    if (this.totalTasks > this.capacity) {
        this.overloaded = true;
    } else {
        this.overloaded = false;
    }
});


export const Member = model('Member', memberSchema);