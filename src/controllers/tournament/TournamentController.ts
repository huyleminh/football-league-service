import * as mongoose from "mongoose";
import { IAppRequest, IAppResponse } from "../../@types/AppBase";
import escapeStringRegexp from "../../libs/escape-string-regexp";
import AuthMiddlewares from "../../middlewares/AuthMiddlewares";
import DiskUploadMiddleware from "../../middlewares/MulterUploadMiddlewares";
import TournamentMiddlewares from "../../middlewares/TournamentMiddlewares";
import TeamModel from "../../models/TeamModel";
import TournamentModel, { TOURNAMENT_SEARCH_TYPE_ENUM, TOURNAMENT_STATUS_ENUM } from "../../models/TournamentModel";
import TournamentParticipantModel from "../../models/TournamentParticipantModel";
import UserModel from "../../models/UserModel";
import ImgBBService from "../../services/ImgBBService";
import AppResponse from "../../shared/AppResponse";
import AppController from "../AppController";
import moment = require("moment");

export default class TournamentController extends AppController {
    constructor() {
        super("TournamentController");
    }

    binding(): void {
        this.getTournamentConfigByIdAsync = this.getTournamentConfigByIdAsync.bind(this);
        this.getTournamentParticipantsByIdAsync = this.getTournamentParticipantsByIdAsync.bind(this);
        this.getTournamentByIdAsync = this.getTournamentByIdAsync.bind(this);
        this.getTournamentListAsync = this.getTournamentListAsync.bind(this);
        this.postCreateTournamentAsync = this.postCreateTournamentAsync.bind(this);
        this.patchChangeTournamentStatusAsync = this.patchChangeTournamentStatusAsync.bind(this);
        this.deleteTournamentAsync = this.deleteTournamentAsync.bind(this);
    }

    init(): void {
        this._router.get(
            "/tournaments/:id/config",
            [AuthMiddlewares.verifyManagerRole],
            this.getTournamentConfigByIdAsync,
        );
        this._router.get(
            "/tournaments/:id/participants",
            [AuthMiddlewares.verifyManagerRole],
            this.getTournamentParticipantsByIdAsync,
        );
        this._router.get("/tournaments/:id", this.getTournamentByIdAsync);
        this._router.get("/tournaments", [TournamentMiddlewares.validateGetParams], this.getTournamentListAsync);

        this._router.post(
            "/tournaments",
            [
                AuthMiddlewares.verifyManagerRole,
                DiskUploadMiddleware.single("logo"),
                TournamentMiddlewares.validateCreateTournamentData,
            ],
            this.postCreateTournamentAsync,
        );

        this._router.patch(
            "/tournaments/:id/status",
            [AuthMiddlewares.verifyManagerRole],
            this.patchChangeTournamentStatusAsync,
        );

        this._router.delete("/tournaments/:id", [AuthMiddlewares.verifyManagerRole], this.deleteTournamentAsync);
    }

    async getTournamentListAsync(req: IAppRequest, res: IAppResponse) {
        const apiRes = new AppResponse(res);
        const { payload, tokenPayload } = res.locals;
        const filter = [];
        let regexString = ".";
        if (payload.searchTypeNum === TOURNAMENT_SEARCH_TYPE_ENUM.MANAGER_NAME) {
            regexString = escapeStringRegexp(payload.query ? payload.query : "");
        }
        if (payload.tournamentStatus !== undefined) {
            filter.push({ status: payload.tournamentStatus });
        }
        if (payload.isSelfAssigned) {
            filter.push({ createdBy: { $eq: new mongoose.Types.ObjectId(tokenPayload.userId) } });
        }

        const pipeline: Array<any> = [
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "manager",
                },
            },
            {
                $match: { "manager.fullname": { $regex: regexString } },
            },
            {
                $project: {
                    _id: 1,
                    createdBy: 1,
                    name: 1,
                    logoUrl: 1,
                    sponsorName: 1,
                    totalTeam: 1,
                    status: 1,
                    scheduledDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "manager.fullname": 1,
                    "manager._id": 1,
                },
            },
            {
                $facet: {
                    data: [{ $skip: payload.limitItems * (payload.currentPage - 1) }, { $limit: payload.limitItems }],
                    total: [{ $count: "count" }],
                },
            },
        ];

        filter.length !== 0 && pipeline.splice(0, 0, { $match: { $and: filter } });
        payload.searchTypeNum === TOURNAMENT_SEARCH_TYPE_ENUM.NAME &&
            pipeline.unshift({
                $match: { $text: { $search: payload.query ? payload.query : "" } },
            });

        try {
            const dataSet = await TournamentModel.aggregate(pipeline).exec();
            const metadata = {
                createdDate: new Date(),
                pagination: {
                    page: payload.currentPage,
                    pageSize: dataSet[0].data.length,
                    totalRecord: dataSet[0].total[0]?.count,
                },
            };
            apiRes.code(200).data(dataSet[0].data).metadata(metadata).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy danh sách giải đấu").send();
        }
    }

    async postCreateTournamentAsync(req: IAppRequest, res: IAppResponse) {
        const { payload, tokenPayload } = res.locals;
        const apiRes = new AppResponse(res);

        if (!req.file) {
            return apiRes.code(400).data("Thiếu logo giải đấu").send();
        }

        try {
            const user = await UserModel.findById(tokenPayload.userId).exec();
            if (user === null) {
                return apiRes.code(400).data("Không tìm thấy quản lý").send();
            }

            if (payload.scheduledDate !== undefined && payload.status !== undefined) {
                const now = moment();
                const scheduledDate = moment(payload.scheduledDate);
                if (!scheduledDate.isValid()) {
                    return apiRes.code(400).data("Lịch bắt đầu không đúng định dạng").send();
                }
                if (now < scheduledDate && payload.status !== TOURNAMENT_STATUS_ENUM.PENDING) {
                    payload.status = TOURNAMENT_STATUS_ENUM.PENDING;
                }
                payload.scheduledDate = scheduledDate.toISOString();
            }

            payload.sponsorName = payload.sponsorName.split(",");

            Object.keys(payload).forEach((key) => {
                payload[key] === undefined && delete payload[key];
            });

            const logoUrl = await ImgBBService.uploadImageNoExpireAsync(req.file.path);
            await TournamentModel.create({
                createdBy: user._id,
                logoUrl,
                ...payload,
            });
            apiRes.code(201).data("Tạo mới giải đấu thành công").send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể tạo mới giải đấu").send();
        }
    }

    async getTournamentConfigByIdAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const apiRes = new AppResponse(res);
        try {
            const tournament = await TournamentModel.findById(id).exec();
            if (tournament === null) {
                throw new Error("tournament_config_notfound");
            }
            apiRes.data(tournament.config).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy cấu hình chi tiết giải đấu").send();
        }
    }

    async getTournamentParticipantsByIdAsync(req: IAppRequest, res: IAppResponse) {
        const apiRes = new AppResponse(res);
        const { id } = req.params;
        try {
            const participant = await TournamentParticipantModel.findOne({
                tournamentId: id,
            }).exec();
            if (participant === null) {
                throw new Error("participant_notfound");
            }

            const idList = participant.teams.map((item) => item.teamId);
            const resultSet = await TeamModel.find({ _id: { $in: idList } })
                .select(["-__v", "-players", "-teamStaff"])
                .exec();

            apiRes.data(resultSet).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy danh sách đội bóng").send();
        }
    }

    async getTournamentByIdAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const apiRes = new AppResponse(res);
        try {
            const tournament = await TournamentModel.findById(id).select(["-__v", "-config"]).exec();
            if (tournament === null) {
                return apiRes.code(400).data("Không tìm thấy giải đấu").send();
            }

            const manager = await UserModel.findById(tournament.createdBy).select(["fullname"]).exec();

            const ret = {
                _id: tournament._id,
                name: tournament.name,
                logoUrl: tournament.logoUrl,
                sponsorName: tournament.sponsorName,
                totalTeam: tournament.totalTeam,
                status: tournament.status,
                scheduledDate: tournament.scheduledDate,
                createdAt: tournament.createdAt,
                updatedAt: tournament.updatedAt,
                createdByName: manager !== null ? manager.fullname : "",
            };
            apiRes.data(ret).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy thông tin chi tiết giải đấu").send();
        }
    }

    async patchChangeTournamentStatusAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const { body } = req;
        const { tokenPayload } = res.locals;
        let status = body.status;

        if (!TOURNAMENT_STATUS_ENUM[status]) {
            return new AppResponse(res, 400, "Trạng thái không hợp lệ").send();
        }

        try {
            const tournament = await TournamentModel.findById(id).exec();
            if (tournament === null) throw new Error("tournament_notfound");
            if (!tournament.createdBy.equals(tokenPayload.userId)) {
                return new AppResponse(res, 400, "Không có quyền thay đổi trạng thái").send();
            }

            const now = moment();
            const update: Record<string, any> = { status };
            if (now.isBefore(moment(tournament.scheduledDate))) {
                if (status !== TOURNAMENT_STATUS_ENUM.PENDING) {
                    update["scheduledDate"] = now.toISOString();
                }
            } else {
                if (status === TOURNAMENT_STATUS_ENUM.PENDING) {
                    update["scheduledDate"] = now.add(1, "day").toISOString();
                }
            }

            await TournamentModel.findByIdAndUpdate(id, update).exec();
            new AppResponse(res, 204).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            new AppResponse(res, 400, "Không thể cập nhật trạng thái").send();
        }
    }

    async deleteTournamentAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const { tokenPayload } = res.locals;
        try {
            const tournament = await TournamentModel.findById(id).exec();
            if (tournament === null) throw new Error("tournament_notfound");
            if (tournament.totalTeam > 0) throw new Error("tournament_delete_denied");
            if (!tournament.createdBy.equals(tokenPayload.userId)) {
                return new AppResponse(res, 400, "Không có quyền xóa giải đấu").send();
            }

            await TournamentModel.findByIdAndRemove(id).exec();
            await TournamentParticipantModel.findOneAndRemove({ tournamentId: id }).exec();
            new AppResponse(res, 200).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            new AppResponse(res, 400, "Không thể xóa giải đấu").send();
        }
    }
}
