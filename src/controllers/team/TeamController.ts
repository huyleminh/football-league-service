import * as mongoose from "mongoose";
import { IAPIPaginationMetadata, IAppRequest, IAppResponse } from "../../@types/AppBase";
import AuthMiddlewares from "../../middlewares/AuthMiddlewares";
import DiskUploadMiddleware from "../../middlewares/MulterUploadMiddlewares";
import TeamMiddlewares from "../../middlewares/TeamMiddlewares";
import PlayerModel from "../../models/PlayerModel";
import TeamModel, { TEAM_STAFF_ROLE_ENUM } from "../../models/TeamModel";
import TournamentModel from "../../models/TournamentModel";
import TournamentParticipantModel from "../../models/TournamentParticipantModel";
import ImgBBService from "../../services/ImgBBService";
import AppResponse from "../../shared/AppResponse";
import AppController from "../AppController";

export default class TeamController extends AppController {
    constructor() {
        super("TeamController");
    }

    binding(): void {
        this.getPlayerListByTeamIdAsync = this.getPlayerListByTeamIdAsync.bind(this);
        this.getTeamDetailByIdAsync = this.getTeamDetailByIdAsync.bind(this);
        this.getTeamListAsync = this.getTeamListAsync.bind(this);
        this.postCreateTeamAsync = this.postCreateTeamAsync.bind(this);
        this.postCreateTeamStaffAsync = this.postCreateTeamStaffAsync.bind(this);
        this.putUpdateTeamStaffAsync = this.putUpdateTeamStaffAsync.bind(this);
        this.deleteTeamStaffAsync = this.deleteTeamStaffAsync.bind(this);
    }

    init(): void {
        this._router.get("/teams/:id/players", [AuthMiddlewares.verifyManagerRole], this.getPlayerListByTeamIdAsync);
        this._router.get("/teams/:id", this.getTeamDetailByIdAsync);
        this._router.get("/teams", [TeamMiddlewares.validateGetParams], this.getTeamListAsync);

        this._router.post(
            "/teams/:id/staffs",
            [AuthMiddlewares.verifyManagerRole, TeamMiddlewares.validateCreateStaffData],
            this.postCreateTeamStaffAsync,
        );
        this._router.post(
            "/teams",
            [
                AuthMiddlewares.verifyManagerRole,
                DiskUploadMiddleware.single("logo"),
                TeamMiddlewares.validateCreateTeamData,
            ],
            this.postCreateTeamAsync,
        );

        this._router.put(
            "/teams/:id/staffs/:staffId",
            [AuthMiddlewares.verifyManagerRole, TeamMiddlewares.validateCreateStaffData],
            this.putUpdateTeamStaffAsync,
        );

        this._router.delete(
            "/teams/:id/staffs/:staffId",
            [AuthMiddlewares.verifyManagerRole],
            this.deleteTeamStaffAsync,
        );
    }

    async getPlayerListByTeamIdAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const apiRes = new AppResponse(res);

        try {
            const team = await TeamModel.findById(id).exec();
            if (team === null) throw new Error("team_notfound");

            const playerIdList = team.players;
            const playerList = await PlayerModel.find({ _id: { $in: playerIdList } })
                .select(["-__v"])
                .exec();

            apiRes.data(playerList).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy danh sách cầu thủ").send();
        }
    }

    async getTeamListAsync(req: IAppRequest, res: IAppResponse) {
        const apiRes = new AppResponse(res);
        const {
            payload: { page, limit, tournamentId },
        } = res.locals;
        try {
            let resultSet;
            let totalRecord = 0;
            const metadata: IAPIPaginationMetadata = {
                createdDate: new Date(),
                pagination: {
                    page: page,
                    pageSize: 0,
                    totalRecord,
                },
            };

            if (tournamentId === undefined) {
                resultSet = await TeamModel.find()
                    .select(["-__v", "-players", "-teamStaff"])
                    .limit(limit)
                    .skip(limit * (page - 1))
                    .exec();
                totalRecord = await TeamModel.countDocuments().exec();
            } else {
                const participant = await TournamentParticipantModel.findOne({
                    tournamentId,
                }).exec();
                if (participant === null) {
                    return apiRes.data([]).metadata(metadata).send();
                }
                const idList = participant.teams.map((item) => item.teamId);
                resultSet = await TeamModel.find({ _id: { $in: idList } })
                    .select(["-__v", "-players", "-teamStaff"])
                    .limit(limit)
                    .skip(limit * (page - 1))
                    .exec();
                totalRecord = await TeamModel.find({ _id: { $in: idList } })
                    .countDocuments()
                    .exec();
            }

            metadata.pagination = {
                page: page,
                pageSize: resultSet.length,
                totalRecord,
            };
            apiRes.data(resultSet).metadata(metadata).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy danh sách đội bóng").send();
        }
    }

    async postCreateTeamStaffAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const { payload } = res.locals;
        const apiRes = new AppResponse(res);
        // check coach, if new is coach => change new staff role to normal
        if (payload.role === TEAM_STAFF_ROLE_ENUM.COACH) {
            payload.role = TEAM_STAFF_ROLE_ENUM.STAFF;
        }

        try {
            // check team
            const team = await TeamModel.findById(id).exec();
            if (team === null) {
                return apiRes.code(400).data("Không tìm thấy đội bóng").send();
            }

            const teamStaff = team.teamStaff;
            teamStaff.push({
                fullname: payload.fullname,
                role: payload.role,
                country: payload.country,
            });

            await TeamModel.findByIdAndUpdate(id, {
                totalMember: ++team.totalMember,
                teamStaff: teamStaff,
            });
            apiRes.code(201).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể tạo mới ban huấn luyện").send();
        }
    }

    async postCreateTeamAsync(req: IAppRequest, res: IAppResponse) {
        const apiRes = new AppResponse(res);
        if (!req.file) {
            return apiRes.code(400).data("Thiếu logo đội bóng").send();
        }
        const {
            payload: { tournamentId, name, playerList, staffList, coachName, totalForeign },
        } = res.locals;

        try {
            // Load tournament config
            const tournament = await TournamentModel.findById(tournamentId).exec();
            if (tournament === null) {
                return apiRes.code(400).data("Giải đấu không hợp lệ").send();
            }

            // Check max team
            const participant = await TournamentParticipantModel.findOne({ tournamentId });
            if (participant !== null && participant.teams.length >= tournament.config.maxTeam) {
                return apiRes.code(400).data("Số đội bóng đã đạt giới hạn").send();
            }

            // Check max abroad players
            if (totalForeign > tournament.config.maxAbroardPlayer) {
                return apiRes.code(400).data("Số ngoại binh vượt quá giới hạn").send();
            }

            const tempCode = new mongoose.Types.ObjectId(32);
            const playerInserted = await PlayerModel.insertMany(
                playerList.map((player) => {
                    return {
                        ...player,
                        teamId: tempCode,
                    };
                }),
            );
            const playerIdList = playerInserted.map((player) => player._id);

            const logo = await ImgBBService.uploadImageNoExpireAsync(req.file.path);
            const team = await TeamModel.create({
                name,
                logo,
                coachName,
                teamStaff: staffList,
                totalMember: staffList.length + playerInserted.length,
                players: playerIdList,
            });

            // Update teamId in player
            await PlayerModel.updateMany({ teamId: tempCode }, { teamId: team._id }).exec();
            if (participant === null) {
                await TournamentParticipantModel.create({
                    tournamentId,
                    teams: [
                        {
                            teamId: team._id,
                            participatedAt: new Date(),
                            usedConfig: { abroadPlayer: totalForeign },
                        },
                    ],
                });
            } else {
                await TournamentParticipantModel.findByIdAndUpdate(participant._id, {
                    teams: [
                        ...participant.teams,
                        {
                            teamId: team._id,
                            participatedAt: new Date(),
                            usedConfig: { abroadPlayer: totalForeign },
                        },
                    ],
                });
            }

            // Update totalTeams in tournament
            await TournamentModel.findByIdAndUpdate(tournamentId, {
                totalTeam: participant === null ? 1 : participant.teams.length + 1,
            }).exec();

            apiRes.code(201).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể tạo mới đội bóng").send();
        }
    }

    async getTeamDetailByIdAsync(req: IAppRequest, res: IAppResponse) {
        const { id } = req.params;
        const apiRes = new AppResponse(res);

        try {
            const teamPromise = TeamModel.findById(id).select(["-__v", "-players"]).exec();
            const playerPromise = PlayerModel.find({ teamId: id }).select(["-__v", "-teamId"]).exec();
            const [team, playerList] = await Promise.all([teamPromise, playerPromise]);
            if (!team || !playerList) {
                throw new Error("get_team_detail_failed");
            }
            apiRes.data({ team, playerList }).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể lấy chi tiết đội bóng").send();
        }
    }

    async putUpdateTeamStaffAsync(req: IAppRequest, res: IAppResponse) {
        const { id, staffId } = req.params;
        const { payload } = res.locals;
        const apiRes = new AppResponse(res);

        try {
            const team = await TeamModel.findById(id).exec();
            if (team === null) {
                return apiRes.code(400).data("Không tìm thấy đội bóng").send();
            }

            const teamStaff: Array<any> = team.teamStaff;
            const index = teamStaff.findIndex((staff) => staff._id.toString() === staffId);
            if (index === -1) {
                return apiRes.code(400).data("Không tìm thấy thành viên").send();
            }

            const staff = teamStaff[index];
            if (staff.role === TEAM_STAFF_ROLE_ENUM.COACH && payload.role !== TEAM_STAFF_ROLE_ENUM.COACH) {
                payload.role = TEAM_STAFF_ROLE_ENUM.COACH;
            }
            staff.fullname = payload.fullname;
            staff.country = payload.country;
            let coachName = team.coachName;
            if (staff.role !== TEAM_STAFF_ROLE_ENUM.COACH && payload.role === TEAM_STAFF_ROLE_ENUM.COACH) {
                coachName = payload.fullname;
                const coach = teamStaff.find((staff) => staff.role === TEAM_STAFF_ROLE_ENUM.COACH);
                coach.role = TEAM_STAFF_ROLE_ENUM.STAFF;
            }
            staff.role = payload.role;

            await TeamModel.findByIdAndUpdate(id, { coachName, teamStaff }).exec();
            apiRes.code(204).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể cập nhật ban huấn luyện").send();
        }
    }

    async deleteTeamStaffAsync(req: IAppRequest, res: IAppResponse) {
        const { id, staffId } = req.params;
        const apiRes = new AppResponse(res);
        try {
            const team = await TeamModel.findById(id).exec();
            if (team === null) {
                return apiRes.code(400).data("Không tìm thấy đội bóng").send();
            }

            const teamStaff: Array<any> = team.teamStaff;
            const index = teamStaff.findIndex((staff) => staff._id.toString() === staffId);
            if (index === -1) {
                throw new Error("team_staff_not_found");
            }

            const staff = teamStaff[index];
            if (staff.role === TEAM_STAFF_ROLE_ENUM.COACH) {
                return apiRes.code(400).data("Không thể xóa huấn luyện viên trưởng").send();
            }

            await TeamModel.findByIdAndUpdate(id, {
                totalMember: --team.totalMember,
                $pull: { teamStaff: { _id: new mongoose.Types.ObjectId(staffId) } },
            }).exec();
            apiRes.code(204).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể xóa thành viên ban huấn luyện").send();
        }
    }
}
