import { model, Schema } from "mongoose";
import { ITeamModel, ITeamStaff } from "./interfaces/ITeamModel";
import PlayerModel from "./PlayerModel";

export enum TEAM_STAFF_ROLE_ENUM {
    COACH,
    COACH_ASSISTANT,
    STAFF,
}

const TeamStaffSchema = new Schema<ITeamStaff>({
    fullname: { type: String, required: true },
    country: { type: String, required: true },
    role: {
        type: Number,
        enum: [TEAM_STAFF_ROLE_ENUM.COACH, TEAM_STAFF_ROLE_ENUM.COACH_ASSISTANT, TEAM_STAFF_ROLE_ENUM.STAFF],
        required: true,
    },
});

const TeamSchema = new Schema<ITeamModel>({
    name: { type: String, required: true },
    logo: { type: String, required: true },
    coachName: { type: String, required: true },
    teamStaff: { type: [TeamStaffSchema], required: true },
    totalMember: { type: Number },
    players: { type: [{ type: Schema.Types.ObjectId, ref: PlayerModel }], required: true },
});

export default model("team", TeamSchema);
