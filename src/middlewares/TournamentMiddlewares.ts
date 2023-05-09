import { IAppNextFuction, IAppRequest, IAppResponse } from "../@types/AppBase";
import { TOURNAMENT_SEARCH_TYPE_ENUM, TOURNAMENT_STATUS_ENUM } from "../models/TournamentModel";
import AppResponse from "../shared/AppResponse";
import { MAX_ITEM_PER_PAGE } from "../shared/CommonConsts";

export function validateCreateTournamentData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const body = req.body;
    const apiRes = new AppResponse(res, 400);

    if (!body.name || !body.name.toString().trim()) {
        return apiRes.data("Thiếu tên giải đấu").send();
    }

    if (!body.sponsorName || !body.sponsorName.toString().trim()) {
        return apiRes.data("Thiếu tên nhà tài trợ").send();
    }

    let config = body.config;
    try {
        config = JSON.parse(config);
    } catch (error) {
        console.log(error);
        config = {};
    }
    if (Object.keys(body.config).length === 0) {
        return apiRes.data("Thiếu cấu hình giải đấu").send();
    }

    let status;
    let scheduledDate;
    if (TOURNAMENT_STATUS_ENUM[body.status]) {
        status = body.status;
    }
    if (body.scheduledDate && status !== undefined) {
        scheduledDate = body.scheduledDate;
    }

    res.locals.payload = {
        name: body.name,
        sponsorName: body.sponsorName,
        config,
        status,
        scheduledDate,
    };
    next();
}

export function validateGetParams(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { page, limit, status, query, searchType, selfAssigned } = req.query;

    let limitItems = parseInt(limit as string);
    let currentPage = parseInt(page as string);
    let tournamentStatus = parseInt(status as string);
    let searchTypeNum = parseInt(searchType as string);
    let isSelfAssigned = selfAssigned && selfAssigned === "true" ? true : undefined;
    let searchQuery = query;

    if (isNaN(limitItems)) {
        limitItems = MAX_ITEM_PER_PAGE;
    }

    if (isNaN(currentPage)) {
        currentPage = 1;
    }

    if (isNaN(tournamentStatus)) {
        tournamentStatus = undefined;
    }

    if (isNaN(searchTypeNum) || TOURNAMENT_SEARCH_TYPE_ENUM[searchTypeNum] === undefined) {
        searchTypeNum = undefined;
        searchQuery = undefined;
    }

    if (query === undefined || query === null) {
        searchTypeNum = undefined;
        searchQuery = undefined;
    }

    res.locals.payload = {
        limitItems,
        currentPage,
        tournamentStatus,
        searchTypeNum,
        query: searchQuery,
        isSelfAssigned,
    };
    next();
}

export default { validateCreateTournamentData, validateGetParams };
