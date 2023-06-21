import { IAppRequest, IAppResponse } from "../../@types/AppBase";
import AuthMiddlewares from "../../middlewares/AuthMiddlewares";
import TeamModel from "../../models/TeamModel";
import TournamentParticipantModel from "../../models/TournamentParticipantModel";
import AppResponse from "../../shared/AppResponse";
import AppController from "../AppController";

export default class RankingController extends AppController {
    constructor() {
        super("RankingController");
    }

    binding(): void {
        this.getTournamentRankingAsync = this.getTournamentRankingAsync.bind(this);
    }

    init(): void {
        this._router.use(AuthMiddlewares.verifyUserToken);
        this._router.get("/ranking/:id", this.getTournamentRankingAsync);
    }

    async getTournamentRankingAsync(req: IAppRequest, res: IAppResponse) {
        const apiRes = new AppResponse(res);
        const { id } = req.params;

        try {
            const participantList = await TournamentParticipantModel.find({ tournamentId: id })
                .select(["-__v", "_id"])
                .exec();
            if (participantList.length === 0) {
                return apiRes.data([]).send();
            }

            const teams = participantList[0].teams;
            const teamIdList = teams.map((team) => team.teamId);

            const teamList = await TeamModel.find({ _id: { $in: teamIdList } })
                .select(["_id", "name", "logo"])
                .exec();
            if (teamList.length === 0) {
                return apiRes.code(400).data("Không thể xem bảng xếp hạng giải đấu").send();
            }

            const mappedData = teamList.map((team) => {
                const index = teams.findIndex((item) => item.teamId.equals(team._id));
                const item = {
                    id: team._id,
                    name: team.name,
                    logo: team.logo,
                    participatedAt: teams[index]?.participatedAt,
                    totalWon: teams[index]?.totalWon,
                    totalLost: teams[index]?.totalLost,
                    totalTied: teams[index]?.totalTied,
                    totalPoint: teams[index]?.totalPoint,
                };
                return item;
            });

            apiRes.data(mappedData).send();
        } catch (error) {
            this._errorHandler.handle(error.message);
            apiRes.code(400).data("Không thể xem bảng xếp hạng giải đấu").send();
        }
    }
}
