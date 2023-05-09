import { model, Schema } from "mongoose";
import { ITournamentModel } from "./interfaces/ITournamentModel";
import UserModel from "./UserModel";

export enum TOURNAMENT_STATUS_ENUM {
    PENDING,
    INPROGRESS,
    EXPIRE_SOON,
    ENDED,
}

export enum TOURNAMENT_SEARCH_TYPE_ENUM {
    NAME,
    MANAGER_NAME,
}

const TournamentSchema = new Schema<ITournamentModel>({
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: UserModel },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    sponsorName: { type: [String], required: true },
    totalTeam: { type: Number, default: 0 },
    status: {
        type: Number,
        enum: [
            TOURNAMENT_STATUS_ENUM.INPROGRESS,
            TOURNAMENT_STATUS_ENUM.PENDING,
            TOURNAMENT_STATUS_ENUM.EXPIRE_SOON,
            TOURNAMENT_STATUS_ENUM.ENDED,
        ],
        default: TOURNAMENT_STATUS_ENUM.PENDING,
    },
    config: {
        maxAdditionalPlayer: { type: Number, required: true },
        maxChangingPlayer: { type: Number, required: true },
        maxPlayerAge: { type: Number, required: true },
        maxAbroardPlayer: { type: Number, required: true },
        maxTeam: { type: Number, required: true },
        maxPlayerPerMatch: { type: Number, required: true },
    },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
    scheduledDate: { type: Date, default: () => new Date(new Date().getTime() + 86400000) }, // next one day
});

TournamentSchema.index({ name: "text" });

export default model("tournament", TournamentSchema);
