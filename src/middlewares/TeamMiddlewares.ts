import { IAppNextFuction, IAppRequest, IAppResponse } from "../@types/AppBase";
import { TEAM_STAFF_ROLE_ENUM } from "../models/TeamModel";
import AppResponse from "../shared/AppResponse";
import { MAX_ITEM_PER_PAGE } from "../shared/CommonConsts";
import { Logger } from "../utils/Logger";

export function validateCreateTeamData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { body } = req;
    const apiRes = new AppResponse(res, 400);

    if (!body.tournamentId || !body.tournamentId.toString().trim()) {
        return apiRes.data("Thiếu thông tin giải đấu").send();
    }

    if (!body.name || !body.name.toString().trim()) return apiRes.data("Thiếu tên đội bóng").send();

    let playerList;
    let totalForeign = 0;
    try {
        playerList = JSON.parse(body.playerList);
        for (let player of playerList) {
            if (
                !player.playerName ||
                !player.idNumber ||
                !player.country ||
                !player.stripNumber ||
                player.stripNumber < 0 ||
                !player.position ||
                player.type < 0 ||
                player.type > 1
            ) {
                playerList = [];
                break;
            }
            player.type === 1 && totalForeign++;
            delete player.type;
        }
    } catch (error) {
        Logger.error(error);
    }

    let staffList;
    let coachName;
    try {
        staffList = JSON.parse(body.staffList);
        for (let staff of staffList) {
            if (!staff.fullname || !staff.country || TEAM_STAFF_ROLE_ENUM[staff.role] === undefined) {
                staffList = [];
                break;
            }
            if (staff.role === TEAM_STAFF_ROLE_ENUM.COACH) {
                if (coachName !== undefined) {
                    staff.role = TEAM_STAFF_ROLE_ENUM.COACH_ASSISTANT;
                } else coachName = staff.fullname;
            }
        }
    } catch (error) {
        Logger.error(error);
    }

    if (playerList === undefined || playerList.length === 0) {
        return apiRes.data("Danh sách cầu thủ không đúng định dạng").send();
    }
    if (staffList === undefined || staffList.length === 0) {
        return apiRes.data("Danh sách ban huấn luyện không đúng định dạng").send();
    }
    if (coachName === undefined) {
        staffList[0].role = TEAM_STAFF_ROLE_ENUM.COACH;
        coachName = staffList[0].fullname;
    }

    res.locals.payload = {
        tournamentId: body.tournamentId,
        name: body.name,
        playerList,
        staffList,
        coachName,
        totalForeign,
    };
    next();
}

export function validateGetParams(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { query } = req;
    let page = parseInt(query.page as string);
    let limit = parseInt(query.limit as string);
    let tournamentId = query.tournamentId;

    if (isNaN(page)) {
        page = 1;
    }
    if (isNaN(limit)) {
        limit = MAX_ITEM_PER_PAGE;
    }
    if (!query.tournamentId) {
        tournamentId = undefined;
    }

    res.locals.payload = { page, limit, tournamentId };
    next();
}

export function validateCreateStaffData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const { body } = req;
    const apiRes = new AppResponse(res, 400);

    if (!body.fullname || !body.fullname.toString().trim()) {
        return apiRes.data("Thiếu tên thành viên").send();
    }

    if (!body.country || !body.country.toString().trim()) {
        return apiRes.data("Thiếu quốc tịch của thành viên").send();
    }

    let role = parseInt(body.role);
    if (TEAM_STAFF_ROLE_ENUM[role] === undefined) {
        return apiRes.data("Vai trò không hợp lệ").send();
    }
    res.locals.payload = { fullname: body.fullname, country: body.country, role };
    next();
}

export default { validateCreateTeamData, validateGetParams, validateCreateStaffData };
