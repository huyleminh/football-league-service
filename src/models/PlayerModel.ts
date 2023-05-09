import { model, Schema } from "mongoose";
import { IPlayerModel } from "./interfaces/IPlayerModel";

const PlayerSchema = new Schema<IPlayerModel>({
    teamId: { type: Schema.Types.ObjectId }, //, ref: TeamModel
    playerName: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    stripNumber: { type: Number, required: true },
    position: { type: String, required: true },
});

export default model("player", PlayerSchema);
