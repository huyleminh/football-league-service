import { Types } from "mongoose";

export interface IPlayerModel {
    teamId: Types.ObjectId;
    playerName: string;
    idNumber: string;
    country: string;
    stripNumber: number;
    position: string;
}
