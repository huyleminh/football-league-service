import { model, Schema } from "mongoose";
import { ICompetitor, ICompetitorLineup, IMatchModel } from "./interfaces/IMatchModel";
import LineupModel from "./LineupModel";
import MatchEventModel from "./MatchEventModel";
import PlayerModel from "./PlayerModel";
import TeamModel from "./TeamModel";

export enum MATCH_COMPETITOR_ENUM {
    HOME,
    AWAY,
}

export enum MATCH_COMPETITOR_PLAYER_TYPE_ENUM {
    MAIN,
    SUB,
}

const LineupSchema = new Schema<ICompetitorLineup>({
    playerId: { type: Schema.Types.ObjectId, required: true, ref: PlayerModel },
    playerType: {
        type: Number,
        default: MATCH_COMPETITOR_PLAYER_TYPE_ENUM.MAIN,
        enum: [MATCH_COMPETITOR_PLAYER_TYPE_ENUM.MAIN, MATCH_COMPETITOR_PLAYER_TYPE_ENUM.SUB],
        required: true,
    },
    inMatchPosition: { type: String, required: true },
});

const CompetitorModel = new Schema<ICompetitor>({
    teamId: { type: Schema.Types.ObjectId, required: true, ref: TeamModel },
    teamType: {
        type: Number,
        enum: [MATCH_COMPETITOR_ENUM.HOME, MATCH_COMPETITOR_ENUM.AWAY],
        required: true,
    },
    isWinner: { type: Boolean, required: true },
    goal: { type: Number },
    totalShot: { type: Number },
    shotsOntarget: { type: Number },
    possessions: { type: Number },
    totalPass: { type: Number },
    passAccuracy: { type: Number },
    offsides: { type: Number },
    conners: { type: Number },
    fouls: { type: Number },
    lineup: { type: [LineupSchema], default: [] },
});

const MatchSchema = new Schema<IMatchModel>({
    tournamentId: { type: Schema.Types.ObjectId, required: true },
    scheduledDate: { type: Date, required: true },
    kickedOffDate: { type: Date },
    stadiumName: { type: String, required: true },
    round: { type: Number, required: true },
    events: { type: [{ type: Schema.Types.ObjectId, ref: MatchEventModel }], default: [] },
    competitors: { type: [CompetitorModel], required: true },
});

export default model("match", MatchSchema);
