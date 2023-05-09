import * as dotenv from "dotenv";

dotenv.config();

export class AppConfigs {
    static get AUTH_CLIENT_URLS(): string[] | string {
        return process.env.AUTH_CLIENT_URLS ? process.env.AUTH_CLIENT_URLS.split(" ") : "*";
    }

    static get PORT(): number {
        return process.env.PORT ? +process.env.PORT : 5000;
    }

    static get APP_URL(): string {
        return process.env.APP_URL || "";
    }

    static get DB_CONNECTION(): string {
        return process.env.DB_CONNECTION || "";
    }

    static get SECRET_ACCESS_TOKEN(): string {
        return process.env.SECRET_ACCESS_TOKEN || "";
    }

    static get SECRET_REFRESH_TOKEN(): string {
        return process.env.SECRET_REFRESH_TOKEN || "";
    }

    static get SECRET_ID_TOKEN(): string {
        return process.env.SECRET_ID_TOKEN || "";
    }

    static get IMGBB_API_KEY(): string {
        return process.env.IMGBB_API_KEY || "";
    }

    static get IMGBB_API_URL(): string {
        return process.env.IMGBB_API_URL || "";
    }
}

export class EmailConfigs {
    static get MAILTRAP_USER(): string {
        return process.env.MAILTRAP_USER || "";
    }

    static get MAILTRAP_PASSWORD(): string {
        return process.env.MAILTRAP_PASSWORD || "";
    }

    static get MAIL_HOST(): string {
        return process.env.MAIL_HOST || "";
    }

    static get MAIL_PORT(): number {
        return process.env.MAIL_PORT ? +process.env.MAIL_PORT : 2525;
    }

    static get MAIL_FROM_USER(): string {
        return process.env.MAIL_FROM_USER || "";
    }
}
