import { Types } from "mongoose";

export interface IInMatchPlayer {
    playerId: Types.ObjectId;
    playerType: number;
    inMatchPosition: string;
}

export interface ILineupModel {
    players: Array<IInMatchPlayer>;
}
