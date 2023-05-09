import { Schema, model } from "mongoose";
import { IUserTokenModel } from "./interfaces/IUserTokenModel";
import UserModel from "./UserModel";

const UserTokenSchema = new Schema<IUserTokenModel>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: UserModel },
    initVector: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expireDate: { type: Date, required: true },
    createdDate: {
        type: Date,
        required: true,
        default: function () {
            return new Date();
        },
    },
});

export default model("user_token", UserTokenSchema);
