import * as moment from "moment";
import { IAppNextFuction, IAppRequest, IAppResponse } from "../@types/AppBase";
import AppResponse from "../shared/AppResponse";

export function validateCreateMatchData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { body } = req;
    const apiRes = new AppResponse(res, 400);

    if (!body.tournamentId || !body.tournamentId.toString().trim()) {
        return apiRes.data("Thiếu thông tin giải đấu").send();
    }

    if (!body.homeId || !body.homeId.toString().trim()) {
        return apiRes.data("Thiếu thông tin đội nhà").send();
    }
    if (!body.awayId || !body.awayId.toString().trim()) {
        return apiRes.data("Thiếu thông tin đội khách").send();
    }
    if (!body.stadiumName || !body.stadiumName.toString().trim()) {
        return apiRes.data("Thiếu thông tin sân vận động").send();
    }

    let round = parseInt(body.round);
    if (isNaN(round)) {
        return apiRes.data("Thiếu thông tin vòng đấu").send();
    }

    let scheduledDate = moment(body.scheduledDate);
    if (!scheduledDate.isValid()) {
        return apiRes.data("Ngày lên lịch không hợp lệ").send();
    }

    res.locals.payload = {
        tournamentId: body.tournamentId,
        homeId: body.homeId,
        awayId: body.awayId,
        stadiumName: body.stadiumName,
        round,
        scheduledDate: scheduledDate.toISOString(),
    };
    next();
}

export function validateGetParams(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { query } = req;
    let round = parseInt(query.round as string);
    if (isNaN(round) || round < 0) {
        round = 1;
    }

    if (!query.tournamentId || !query.tournamentId.toString().trim()) {
        new AppResponse(res, 400, "Thiếu thông tin giải đấu").send();
    }
    res.locals.payload = { round, tournamentId: query.tournamentId };
    next();
}

export function validateEditData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { body } = req;
    const apiRes = new AppResponse(res, 400);

    let { scheduledDate, stadiumName, events, competitors } = body;
    // Check info
    if (!stadiumName || !stadiumName.toString().trim()) {
        return apiRes.data("Thiếu thông tin sân thi đấu").send();
    }

    const scheduledDateConverted = moment(scheduledDate);
    // if (!scheduledDateConverted.isValid() || scheduledDateConverted.isBefore(moment())) {
    // 	return apiRes.data("Ngày thi đấu không hợp lệ").send();
    // }
    if (!scheduledDateConverted.isValid()) {
        return apiRes.data("Ngày thi đấu không hợp lệ").send();
    }
    // Check event
    if (events !== null && !Array.isArray(events)) {
        return apiRes.data("Sự kiện trận đấu không hợp lệ").send();
    }
    // Check competitors
    if (competitors !== null && !Array.isArray(competitors)) {
        return apiRes.data("Kết quả trận đấu không hợp lệ").send();
    }

    res.locals.payload = {
        stadiumName,
        scheduledDate: scheduledDateConverted.toISOString(),
        events,
        competitors,
    };
    next();
}

export default { validateCreateMatchData, validateGetParams, validateEditData };
