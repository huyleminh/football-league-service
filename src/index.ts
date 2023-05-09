import * as cors from "cors";
import * as express from "express";
import helmet from "helmet";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import { IAppNextFuction, IAppRequest, IAppResponse } from "./@types/AppBase";
import ControllerList from "./controllers";
import AppController from "./controllers/AppController";
import AuthMiddlewares from "./middlewares/AuthMiddlewares";
import { AppConfigs } from "./shared/AppConfigs";
import { AppLogStream, Logger } from "./utils/Logger";

export default class Server {
    private _app: express.Application;
    private readonly PORT: number;

    constructor() {
        this._app = express();
        this.PORT = AppConfigs.PORT;
    }

    initializeGlobalMiddlewares() {
        this._app.use("/public", express.static("public"));
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(helmet());
        this._app.use(
            cors({
                origin: AppConfigs.AUTH_CLIENT_URLS,
                credentials: true,
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
            }),
        );

        this._app.use(
            morgan("combined", {
                stream: new AppLogStream(),
            }),
        );
        this._app.use(AuthMiddlewares.verifyUserToken);
    }

    initializeControllers() {
        ControllerList.forEach((controller: AppController) => {
            this._app.use("/", controller.router);
        });
    }

    initializeErrorHandlerMiddlewares() {
        this._app.use((req: IAppRequest, res: IAppResponse, next: IAppNextFuction) => {
            res.status(404).send("Not Found");
        });

        this._app.use((err: any, req: IAppRequest, res: IAppResponse, next: IAppNextFuction) => {
            Logger.error(err.message);
            res.status(500).send("Internal Server Error");
        });
    }

    async initializeDBConnectionAsync() {
        try {
            await mongoose.connect(AppConfigs.DB_CONNECTION, {
                autoIndex: true,
                dbName: "football_leagues",
            });
            Logger.info("Connected to mongodb");
        } catch (error) {
            Logger.error("Failed to connect to mongodb: ", error);
            setTimeout(() => {
                this.initializeDBConnectionAsync();
            }, 5000);
        }
    }

    async start() {
        this.initializeGlobalMiddlewares();
        this.initializeControllers();

        await this.initializeDBConnectionAsync();

        this.initializeErrorHandlerMiddlewares();
        this._app.listen(this.PORT, () => {
            Logger.info(`Server is listening on port ${this.PORT}`);
        });
    }
}

const appServer = new Server();
appServer.start();
