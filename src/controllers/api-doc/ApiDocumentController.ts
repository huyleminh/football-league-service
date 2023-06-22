import { NextFunction, Response } from "express";
import AppController from "../AppController";
import * as fs from "fs";
import { parse } from "yaml";
import { APP_CONFIGS } from "../../shared/AppConfigs";
import * as SwaggerUi from "swagger-ui-express";
import path = require("path");

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
        this._router.use("/api-docs", this.modifySwaggerOnTheFly, SwaggerUi.serve);

        this._router.get("/api-docs/swagger.json", (req, res) => res.json(swaggerDoc));
        this._router.get(
            "/api-docs",
            SwaggerUi.setup(null, {
                explorer: true,
                swaggerOptions: {
                    urls: [
                        {
                            url: `${APP_CONFIGS.appUrl}/api-docs/swagger.json`,
                            name: "Football League Service",
                        },
                    ],
                },
                customSiteTitle: "API Specs - Football League Service",
                customfavIcon: "/public/icons/favicon-32x32.png",
            }),
        );
    }

    modifySwaggerOnTheFly(req: any, res: Response, next: NextFunction) {
        swaggerDoc.servers[0].url = APP_CONFIGS.appUrl;
        req.swaggerDoc = swaggerDoc;
        next();
    }
}
