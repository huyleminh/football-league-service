import { NextFunction, Response } from "express";
import AppController from "../AppController";
import * as fs from "fs";
import { parse } from "yaml";
import { APP_CONFIGS } from "../../shared/AppConfigs";
import * as SwaggerUi from "swagger-ui-express";
import path = require("path");

// const swaggerYaml = fs.readFileSync(`${__dirname}/../swagger.yml`, "utf8");
const swaggerYaml = fs.readFileSync(path.join(__dirname, "../swagger.yml"), "utf8");
const swaggerDoc = parse(swaggerYaml);

export default class ApiDocumentController extends AppController {
    constructor() {
        super("ApiDocumentController");
    }

    binding(): void {
        this.modifySwaggerOnTheFly = this.modifySwaggerOnTheFly.bind(this);
    }

    init(): void {
        this._router.use("/api-docs", this.modifySwaggerOnTheFly, SwaggerUi.serveFiles(swaggerDoc, {}));
        this._router.get("/api-docs", SwaggerUi.setup());
    }

    modifySwaggerOnTheFly(req: any, res: Response, next: NextFunction) {
        swaggerDoc.servers[0].url = APP_CONFIGS.appUrl;
        req.swaggerDoc = swaggerDoc;
        next();
    }
}
