import { Schema, model } from "mongoose";
import { IMatchEventModel } from "./interfaces/IMatchEventModel";
import PlayerModel from "./PlayerModel";

const GoalEventSchema = new Schema({
    type: { type: String, required: true },
    assist: { type: Schema.Types.ObjectId, ref: PlayerModel },
    player: { type: Schema.Types.ObjectId, required: true, ref: PlayerModel },
});

const CardEventSchema = new Schema({
    type: { type: String, required: true },
    player: { type: Schema.Types.ObjectId, required: true, ref: PlayerModel },
});

const SubstitutionEventSchema = new Schema({
    inPlayer: { type: Schema.Types.ObjectId, required: true, ref: PlayerModel },
    outPlayer: { type: Schema.Types.ObjectId, required: true, ref: PlayerModel },
});

const MatchEventShema = new Schema<IMatchEventModel>({
    ocurringMinute: { type: String, required: true },
    isHome: { type: Boolean, required: true },
    goal: { type: GoalEventSchema, default: null },
    card: { type: CardEventSchema, default: null },
    substitution: { type: SubstitutionEventSchema, default: null },
});

export default model("match_event", MatchEventShema);
