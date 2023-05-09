import { model, Schema } from "mongoose";
import { IUserModel } from "./interfaces/IUserModel";

export enum USER_ROLE_ENUM {
    ADMIN,
    LOCAL_MANAGER,
}

export enum USER_STATUS {
    INACTIVE,
    ACTIVE,
}

export enum USER_SEARCH_TYPE_ENUM {
    FULLNAME,
    EMAIL,
}

const UserSchema = new Schema<IUserModel>({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    fullname: { type: String, required: true },
    address: { type: String },
    role: {
        type: Number,
        enum: [USER_ROLE_ENUM.ADMIN, USER_ROLE_ENUM.LOCAL_MANAGER],
        default: USER_ROLE_ENUM.LOCAL_MANAGER,
        required: true,
    },
    status: {
        type: Number,
        enum: [USER_STATUS.INACTIVE, USER_STATUS.ACTIVE],
        default: USER_STATUS.ACTIVE,
    },
    lastLockedDate: { type: Date },
    createdDate: {
        type: Date,
        default: function () {
            return new Date();
        },
    },
});

export default model("user", UserSchema);
