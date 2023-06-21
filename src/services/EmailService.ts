import * as nodemailer from "nodemailer";
import { EMAIL_CONFIGS } from "../shared/AppConfigs";
import { newAccountTemplate, resetPasswordTemplate } from "../templates/EmailTemplate";

const transport = nodemailer.createTransport({
    host: EMAIL_CONFIGS.host,
    port: EMAIL_CONFIGS.port,
    auth: {
        user: EMAIL_CONFIGS.mailtrapUser,
        pass: EMAIL_CONFIGS.mailtrapPassword,
    },
});

export default class EmailService {
    static sendUsernamePassword(to: string, username: string, password: string) {
        return transport.sendMail({
            from: EMAIL_CONFIGS.userFrom,
            to,
            subject: "Thông báo tài khoản",
            html: newAccountTemplate(username, password),
        });
    }

    static sendResetPassword(to: string, password: string) {
        return transport.sendMail({
            from: EMAIL_CONFIGS.userFrom,
            to,
            subject: "Cấp lại mật khẩu",
            html: resetPasswordTemplate(password),
        });
    }
}
