import { Logger } from "../utils/Logger";

export default abstract class AppErrorHandler {
    constructor(protected _scope: string) {}
    abstract handle(message: string): void;
}

export class ControllerErrorHandler extends AppErrorHandler {
    constructor(private _name: string) {
        super("Controller");
    }

    public handle(message: string) {
        Logger.error({ message: { scope: this._scope, class: this._name, msg: message } });
    }
}
