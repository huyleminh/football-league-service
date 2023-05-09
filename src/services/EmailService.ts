import * as nodemailer from "nodemailer";
import { EmailConfigs } from "../shared/AppConfigs";
import { newAccountTemplate, resetPasswordTemplate } from "../templates/EmailTemplate";

const transport = nodemailer.createTransport({
    host: EmailConfigs.MAIL_HOST,
    port: EmailConfigs.MAIL_PORT,
    auth: {
        user: EmailConfigs.MAILTRAP_USER,
        pass: EmailConfigs.MAILTRAP_PASSWORD,
    },
});

export default class EmailService {
    static sendUsernamePassword(to: string, username: string, password: string) {
        return transport.sendMail({
            from: EmailConfigs.MAIL_FROM_USER,
            to,
            subject: "Thông báo tài khoản",
            html: newAccountTemplate(username, password),
        });
    }

    static sendResetPassword(to: string, password: string) {
        return transport.sendMail({
            from: EmailConfigs.MAIL_FROM_USER,
            to,
            subject: "Cấp lại mật khẩu",
            html: resetPasswordTemplate(password),
        });
    }
}
