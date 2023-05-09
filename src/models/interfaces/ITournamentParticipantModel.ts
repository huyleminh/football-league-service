import { Types } from "mongoose";

export interface ITournamentParticipantModel {
    tournamentId: Types.ObjectId;
    teams: Array<{
        teamId: Types.ObjectId;
        participatedAt: Date;
        totalWon: number;
        totalLost: number;
        totalTied: number;
        totalPoint: number;
        usedConfig: {
            addedPlayer: number;
            changedPlayer: number;
            abroadPlayer: number;
        };
    }>;
}
