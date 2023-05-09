import { model, Schema } from "mongoose";
import { IInMatchPlayer, ILineupModel } from "./interfaces/ILineupModel";
import PlayerModel from "./PlayerModel";

export enum PLAYER_TYPE_ENUM {
    MAIN,
    SUB,
}

const InMatchPlayerSchema = new Schema<IInMatchPlayer>({
    playerId: { type: Schema.Types.ObjectId, required: true, ref: PlayerModel },
    playerType: {
        type: Number,
        default: PLAYER_TYPE_ENUM.MAIN,
        enum: [PLAYER_TYPE_ENUM.MAIN, PLAYER_TYPE_ENUM.SUB],
        required: true,
    },
    inMatchPosition: { type: String, required: true },
});

const LineupSchema = new Schema<ILineupModel>({
    players: { type: [InMatchPlayerSchema], minlength: 0, required: true },
});

export default model("lineup", LineupSchema);
