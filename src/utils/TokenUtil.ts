import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { IUserModel } from "../models/interfaces/IUserModel";
import { AppConfigs } from "../shared/AppConfigs";

export function generateAccessToken(data: any): string {
    return jwt.sign(data, AppConfigs.SECRET_ACCESS_TOKEN, {
        algorithm: "HS256",
        expiresIn: "1 hours",
    });
}

export function generateRefreshToken(data: string) {
    const algorithm = "aes-256-cbc";
    const initVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(AppConfigs.SECRET_REFRESH_TOKEN, "hex"), initVector);

    let token = cipher.update(data);
    token = Buffer.concat([token, cipher.final()]);
    return { iv: initVector.toString("hex"), refreshToken: token.toString("hex") };
}

export function generateIdToken(userId: string, data: Partial<IUserModel>): string {
    return jwt.sign({ ...data }, AppConfigs.SECRET_ID_TOKEN, {
        algorithm: "HS256",
        expiresIn: "7 days",
        subject: userId,
        issuer: AppConfigs.APP_URL,
        // audience: "frontend",
    });
}

export function decryptRefreshToken(token: string, iv: string) {
    const algorithm = "aes-256-cbc";
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(AppConfigs.SECRET_REFRESH_TOKEN, "hex"),
        Buffer.from(iv, "hex"),
    );

    let decrypted = decipher.update(token, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

export async function verifyToken(token: string, type: "access_token" | "id_token"): Promise<jwt.JwtPayload | string> {
    return new Promise(function (resolve, reject) {
        const key = type === "access_token" ? AppConfigs.SECRET_ACCESS_TOKEN : AppConfigs.SECRET_ID_TOKEN;
        jwt.verify(token, key, function (err, payload) {
            if (err) {
                return reject(err);
            }

            resolve(payload);
        });
    });
}

export default {
    generateAccessToken,
    generateRefreshToken,
    generateIdToken,
    decryptRefreshToken,
    verifyToken,
};
