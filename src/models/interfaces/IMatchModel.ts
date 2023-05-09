import { Types } from "mongoose";

export interface ICompetitorLineup {
    playerId: Types.ObjectId;
    playerType: number;
    inMatchPosition: string;
}

export interface ICompetitor {
    teamId: Types.ObjectId;
    teamType: number;
    goal: number;
    isWinner: boolean;
    totalShot: number;
    shotsOntarget: number;
    possessions: number;
    totalPass: number;
    passAccuracy: number;
    offsides: number;
    conners: number;
    fouls: number;
    lineup: Array<ICompetitorLineup>;
}

export interface IMatchModel {
    tournamentId: Types.ObjectId;
    scheduledDate: Date;
    kickedOffDate: Date;
    stadiumName: string;
    round: number;
    events: Array<Types.ObjectId>;
    competitors: Array<ICompetitor>;
}
