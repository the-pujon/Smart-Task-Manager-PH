// teams.model.ts - teams module

import { model, Schema } from "mongoose";

const teamSchema = new Schema({
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    totalMembers: { type: Number, default: 0 }

},
{ timestamps: true }
)

export const Team = model('Team', teamSchema);