import * as dotenv from "dotenv";

dotenv.config();

export const APP_CONFIGS = {
    authClientUrls: process.env.AUTH_CLIENT_URLS ? process.env.AUTH_CLIENT_URLS.split(" ") : "*",
    port: process.env.PORT ? +process.env.PORT : 5000,
    appUrl: process.env.APP_URL || "",
    dbConnection: process.env.DB_CONNECTION || "",
    secretAccessToken: process.env.SECRET_ACCESS_TOKEN || "",
    secretRefreshToken: process.env.SECRET_REFRESH_TOKEN || "",
    secretIdToken: process.env.SECRET_ID_TOKEN || "",
    imgbbApiKey: process.env.IMGBB_API_KEY || "",
    imgbbApiUrl: process.env.IMGBB_API_URL || "",
};

export const EMAIL_CONFIGS = {
    mailtrapUser: process.env.MAILTRAP_USER || "",
    mailtrapPassword: process.env.MAILTRAP_PASSWORD || "",
    host: process.env.MAIL_HOST || "",
    port: process.env.MAIL_PORT ? +process.env.MAIL_PORT : 2525,
    userFrom: process.env.MAIL_FROM_USER || "",
};
