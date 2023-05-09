import { model, Schema } from "mongoose";
import { ITournamentParticipantModel } from "./interfaces/ITournamentParticipantModel";
import TeamModel from "./TeamModel";
import TournamentModel from "./TournamentModel";

const TournamentParticipantSchema = new Schema<ITournamentParticipantModel>({
    tournamentId: { type: Schema.Types.ObjectId, required: true, ref: TournamentModel },
    teams: {
        type: [
            {
                teamId: { type: Schema.Types.ObjectId, required: true, ref: TeamModel },
                participatedAt: { type: Date, required: true },
                totalWon: { type: Number, default: 0 },
                totalLost: { type: Number, default: 0 },
                totalTied: { type: Number, default: 0 },
                totalPoint: { type: Number, default: 0 },
                usedConfig: {
                    type: {
                        addedPlayer: { type: Number, default: 0 },
                        changedPlayer: { type: Number, default: 0 },
                        abroadPlayer: { type: Number, require: true },
                    },
                },
            },
        ],
        minlength: 0,
        required: true,
    },
});

export default model("tournament_participant", TournamentParticipantSchema);
