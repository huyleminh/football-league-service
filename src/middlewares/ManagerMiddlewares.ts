import { IAppNextFuction, IAppRequest, IAppResponse } from "../@types/AppBase";
import { USER_SEARCH_TYPE_ENUM, USER_STATUS } from "../models/UserModel";
import AppResponse from "../shared/AppResponse";
import { MAX_ITEM_PER_PAGE } from "../shared/CommonConsts";

export function verifyGetParams(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { limit, page, status, searchType, query } = req.query;

    let limitItems = parseInt(limit as string);
    let currentPage = parseInt(page as string);
    let userStatus = parseInt(status as string);
    let searchTypeNum = parseInt(searchType as string);

    if (isNaN(limitItems)) {
        limitItems = MAX_ITEM_PER_PAGE;
    }

    if (isNaN(currentPage)) {
        currentPage = 1;
    }

    if (isNaN(userStatus)) {
        userStatus = undefined;
    }

    if (isNaN(searchTypeNum) || USER_SEARCH_TYPE_ENUM[searchTypeNum] === undefined) {
        searchTypeNum = undefined;
    }
    res.locals.payload = {
        limitItems,
        currentPage,
        userStatus,
        searchTypeNum,
        query,
    };
    next();
}

export function validateRergisterData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { body } = req;
    const apiResponse = new AppResponse(res, 400);

    let { username, password, email, fullname, address, status } = body;
    if (!username || !username.toString().trim()) {
        return apiResponse.data("Thiếu tên đăng nhập").send();
    }

    if (!password || !password.toString().trim()) {
        return apiResponse.data("Thiếu mật khẩu").send();
    }

    if (!email || !email.toString().trim()) {
        return apiResponse.data("Thiếu email").send();
    }

    if (!fullname || !fullname.toString().trim()) {
        return apiResponse.data("Thiếu họ tên").send();
    }

    if (status === null || status === undefined || USER_STATUS[status] === undefined) {
        status = USER_STATUS.ACTIVE;
    }
    res.locals.payload = {
        username: username.toString().trim(),
        password: password.toString().trim(),
        email: email.toString().trim(),
        fullname: fullname.toString().trim(),
        address: address?.toString()?.trim(),
        status: status,
    };
    next();
}

export default { verifyGetParams, validateRergisterData };
