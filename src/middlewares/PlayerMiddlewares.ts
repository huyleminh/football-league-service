import { IAppNextFuction, IAppRequest, IAppResponse } from "../@types/AppBase";
import AppResponse from "../shared/AppResponse";

export function validateCreatePlayerData(req: IAppRequest, res: IAppResponse, next: IAppNextFuction) {
    const apiRes = new AppResponse(res, 400);
    const { body } = req;

    if (!body.teamId || !body.teamId.toString().trim()) {
        return apiRes.data("Thiếu thông tin đội bóng").send();
    }
    if (!body.playerName || !body.playerName.toString().trim()) {
        return apiRes.data("Thiếu tên cầu thủ").send();
    }
    if (!body.idNumber || !body.idNumber.toString().trim()) {
        return apiRes.data("Thiếu số định danh cầu thủ").send();
    }
    if (!body.country || !body.country.toString().trim()) {
        return apiRes.data("Thiếu quốc tịch cầu thủ").send();
    }
    if (!body.position || !body.position.toString().trim()) {
        return apiRes.data("Thiếu vị trí thi đấu").send();
    }

    let stripNumber = parseInt(body.stripNumber as string);
    if (isNaN(stripNumber)) {
        return apiRes.data("Thiếu số áo thi đấu").send();
    }

    let type = parseInt(body.type);
    if (isNaN(type) || type < 0 || type > 1) {
        return apiRes.data("Thiếu loại cầu thủ hoặc loại cầu thủ không hợp lệ").send();
    }
    res.locals.payload = {
        teamId: body.teamId,
        playerName: body.playerName,
        idNumber: body.idNumber,
        country: body.country,
        position: body.position,
        stripNumber,
        type,
    };
    next();
}

export default { validateCreatePlayerData };
