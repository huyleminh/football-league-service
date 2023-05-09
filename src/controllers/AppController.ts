import * as express from "express";
import { ControllerErrorHandler } from "../shared/AppErrorHandler";

export default abstract class AppController {
	protected _router: express.Router;
	protected _errorHandler: ControllerErrorHandler;

	constructor(protected _name: string) {
		this._router = express.Router();
		this._errorHandler = new ControllerErrorHandler(_name);
		this.binding();
		this.init();
	}

	abstract binding(): void;

	abstract init(): void;

	public get router(): express.Router {
		return this._router;
	}
}
