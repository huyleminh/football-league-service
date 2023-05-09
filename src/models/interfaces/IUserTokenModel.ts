import { Schema } from "mongoose";

export interface IUserTokenModel {
    userId: Schema.Types.ObjectId;
    initVector: string;
    refreshToken: string;
    expireDate: Date;
    createdDate: Date;
}
