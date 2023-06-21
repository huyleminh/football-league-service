import { IAppNextFuction, IAppRequest, IAppResponse } from "../@types/AppBase";
import { USER_ROLE_ENUM } from "../models/UserModel";
import AppResponse from "../shared/AppResponse";
import TokenUtil from "../utils/TokenUtil";

export function validateLoginData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { body } = req;

    const apiResponse = new AppResponse(res, 400);

    let { username, password } = body;

    if (!username || !username.toString().trim()) {
        return apiResponse.data("Thiếu tên đăng nhập").send();
    }

    if (!password || !password.toString().trim()) {
        return apiResponse.data("Thiếu mật khẩu").send();
    }

    res.locals.payload = {
        username,
        password,
    };
    next();
}

export function validateRefreshTokenData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { authorization } = req.headers;
    const { refreshToken } = req.body;
    const apiRes = new AppResponse(res, 401);
    if (!authorization || !refreshToken) {
        return apiRes.send();
    }

    const idToken = authorization.split(" ")[1];
    if (!idToken) {
        return apiRes.send();
    }

    res.locals.payload = {
        refreshToken,
        idToken,
    };
    next();
}

export function verifyUserToken(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { authorization } = req.headers;
    const apiRes = new AppResponse(res, 401);
    if (!authorization) {
        return apiRes.send();
    }

    const accessToken = authorization.split(" ")[1];
    if (!accessToken) {
        return apiRes.send();
    }

    TokenUtil.verifyToken(accessToken, "access_token")
        .then((data) => {
            res.locals.tokenPayload = data;
            next();
        })
        .catch((err) => {
            if (err.message === "jwt expired") {
                apiRes.data("Token expired");
            }
            apiRes.send();
        });
}

export function verifyAdminRole(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { tokenPayload } = res.locals;
    if (tokenPayload.role === USER_ROLE_ENUM.ADMIN) {
        res.locals.tokenPayload = tokenPayload;
        return next();
    }

    return new AppResponse(res, 403, "Bạn không có quyền truy cập chức năng này").send();
}

export function verifyManagerRole(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { tokenPayload } = res.locals;
    if (tokenPayload.role === USER_ROLE_ENUM.LOCAL_MANAGER) {
        res.locals.tokenPayload = tokenPayload;
        return next();
    }

    return new AppResponse(res, 403, "Bạn không có quyền truy cập chức năng này").send();
}

export default {
    validateLoginData,
    validateRefreshTokenData,
    verifyUserToken,
    verifyAdminRole,
    verifyManagerRole,
};
