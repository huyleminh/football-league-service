import { Types } from "mongoose";

export type GoalType = "normal" | "og" | "penalty";

export type CardType = "red" | "yellow";

export interface IMatchEventModel {
    ocurringMinute: string;
    isHome: boolean;
    goal?: {
        type: GoalType;
        assist?: Types.ObjectId;
        player: Types.ObjectId;
    };
    card: {
        type: CardType;
        player: Types.ObjectId;
    };
    substitution?: {
        inPlayer: Types.ObjectId;
        outPlayer: Types.ObjectId;
    };
}
