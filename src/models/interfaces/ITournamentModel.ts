import { Types } from "mongoose";

export interface ITournamentModel {
    createdBy: Types.ObjectId;
    name: string;
    logoUrl: string;
    sponsorName: Array<string>;
    totalTeam?: number;
    status: number;
    config: {
        maxAdditionalPlayer: number;
        maxChangingPlayer: number;
        maxPlayerAge: number;
        maxAbroardPlayer: number;
        maxTeam: number;
        maxPlayerPerMatch: number;
    };
    createdAt: Date;
    updatedAt: Date;
    scheduledDate: Date;
}
