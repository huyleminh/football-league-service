import { Types } from "mongoose";

export interface ITeamStaff {
    fullname: string;
    country: string;
    role: number;
}

export interface ITeamModel {
    name: string;
    logo: string;
    coachName: string;
    teamStaff: Array<ITeamStaff>;
    totalMember?: number;
    players: Array<Types.ObjectId>;
}
