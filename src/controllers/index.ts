import AppController from "./AppController";
import AuthController from "./auth/AuthController";
import ManagerController from "./manager/ManagerController";
import MatchController from "./match/MatchController";
import PlayerController from "./player/PlayerController";
import RankingController from "./ranking/RankingController";
import TeamController from "./team/TeamController";
import TournamentController from "./tournament/TournamentController";

const ControllerList: AppController[] = [
    new AuthController(),
    new ManagerController(),
    new TournamentController(),
    new TeamController(),
    new RankingController(),
    new PlayerController(),
    new MatchController(),
];
export default ControllerList;
