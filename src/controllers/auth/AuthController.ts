import * as moment from "moment";
import { IAppRequest, IAppResponse } from "../../@types/AppBase";
import AuthMiddlewares from "../../middlewares/AuthMiddlewares";
import UserModel from "../../models/UserModel";
import UserTokenModel from "../../models/UserTokenModel";
import AppResponse from "../../shared/AppResponse";
import BcryptUtil from "../../utils/BcryptUtil";
import { Logger } from "../../utils/Logger";
import TokenUtil from "../../utils/TokenUtil";
import AppController from "../AppController";
export default class AuthController extends AppController {
    constructor() {
        super("AuthController");
    }

    binding(): void {
        this.postLoginAsync = this.postLoginAsync.bind(this);
        this.postRefreshTokenAsync = this.postRefreshTokenAsync.bind(this);
        this.postLogoutAsync = this.postLogoutAsync.bind(this);
        this.postRefreshTokenAsync = this.postRefreshTokenAsync.bind(this);
    }

    init(): void {
        this._router.post("/auth/login", [AuthMiddlewares.validateLoginData], this.postLoginAsync);
        this._router.post("/auth/refresh", [AuthMiddlewares.validateRefreshTokenData], this.postRefreshTokenAsync);

        this._router.post("/auth/logout", this.postLogoutAsync);

        this._router.get("/verify-token", [AuthMiddlewares.verifyUserToken], this.getVerifyTokenAsync);
    }

    async postLoginAsync(req: IAppRequest, res: IAppResponse) {
        const { username, password } = res.locals.payload;
        const apiResponse = new AppResponse(res);

        try {
            const user = await UserModel.findOne({ username });
            if (user === null || !BcryptUtil.verifyHashedString(password, user.password)) {
                return apiResponse.code(400).data("Tên đăng nhập hoặc mật khẩu không đúng").send();
            }

            const accessToken = TokenUtil.generateAccessToken({
                scope: "leagues:all",
                role: user.role,
                userId: user._id,
            });
            const { refreshToken, iv } = TokenUtil.generateRefreshToken(
                JSON.stringify({
                    scope: "leagues:all",
                    role: user.role,
                    userId: user._id,
                }),
            );
            const idToken = TokenUtil.generateIdToken(user._id.toString(), {
                email: user.email,
                fullname: user.fullname,
            });

            // delete old token
            UserTokenModel.deleteMany({ userId: user._id })
                .exec()
                .catch((err) => {
                    Logger.error({
                        message: { class: "AuthController", method: "postLoginAsync", msg: err.message },
                    });
                });

            // store refresh token + iv to mongo
            UserTokenModel.create({
                userId: user._id,
                refreshToken,
                initVector: iv,
                expireDate: moment().add(7, "days").toDate(),
            }).catch((err) => {
                Logger.error({
                    message: { class: "AuthController", method: "postLoginAsync", msg: err.message },
                });
            });

            apiResponse
                .data({
                    token: {
                        accessToken,
                        refreshToken,
                        idToken,
                        expireIn: 60 * 60 * 1000,
                        expireAt: moment().add(60, "minutes").toISOString(),
                    },
                    user: {
                        fullname: user.fullname,
                    },
                })
                .send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiResponse.code(400).data("Không thể đăng nhập, vui lòng thử lại").send();
        }
    }

    async postRefreshTokenAsync(req: IAppRequest, res: IAppResponse) {
        const { refreshToken, idToken } = res.locals.payload;
        const apiRes = new AppResponse(res);
        try {
            const payload = await TokenUtil.verifyToken(idToken, "id_token");
            const userToken = await UserTokenModel.findOne({ userId: payload.sub });

            if (userToken === null) {
                throw new Error(`User is not logged in or Invalid idToken: ${idToken}`);
            }
            if (refreshToken !== userToken.refreshToken || moment().isAfter(moment(userToken.expireDate))) {
                await UserTokenModel.findByIdAndRemove(userToken._id);
                throw new Error(`Malicious refresh token: ${refreshToken}`);
            }

            const data = TokenUtil.decryptRefreshToken(userToken.refreshToken, userToken.initVector);
            const accessToken = TokenUtil.generateAccessToken(JSON.parse(data));
            const newRefreshToken = TokenUtil.generateRefreshToken(data);

            UserTokenModel.findByIdAndUpdate(userToken._id, {
                refreshToken: newRefreshToken.refreshToken,
                initVector: newRefreshToken.iv,
                expireDate: moment().add(7, "days").toDate(),
            }).exec();

            apiRes
                .code(200)
                .data({
                    accessToken,
                    refreshToken: newRefreshToken.refreshToken,
                    idToken,
                    expireIn: 60 * 60 * 1000,
                    expireAt: moment().add(60, "minutes").toISOString(),
                })
                .send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(401).data("Không thể làm mới phiên đăng nhập, vui lòng đăng nhập lại").send();
        }
    }

    async postLogoutAsync(req: IAppRequest, res: IAppResponse) {
        const { authorization } = req.headers;
        const { refreshToken } = req.body;
        const apiRes = new AppResponse(res, 204);
        if (!authorization || !refreshToken) {
            return apiRes.send();
        }

        const idToken = authorization.split(" ")[1];
        if (!idToken) {
            return apiRes.send();
        }

        try {
            const payload = await TokenUtil.verifyToken(idToken, "id_token");
            await UserTokenModel.findOneAndRemove({ userId: payload.sub });
        } catch (error) {
            this._errorHandler.handle(error.message);
        }
        apiRes.send();
    }

    async getVerifyTokenAsync(req: IAppRequest, res: IAppResponse) {
        const { tokenPayload } = res.locals;
        new AppResponse(res, 200, {
            scope: tokenPayload.scope,
            role: tokenPayload.role,
        }).send();
    }
}
