import { Response } from "express";
import { IAPIMetadata } from "../@types/AppBase";

export default class AppResponse {
    private _res: Response;
    private _code?: number;
    private _data: any;
    private _message?: string;
    private _metadata?: IAPIMetadata;

    constructor(res: Response, code?: number, data?: any, metadata?: IAPIMetadata) {
        this._res = res;
        this._code = code || 200;
        this._message = this.mappMessageByCode(this._code);
        this._data = data;
        this._metadata = metadata || {
            createdDate: new Date(),
        };
    }

    public code(code: number): this {
        this._code = code;
        this._message = this.mappMessageByCode(code);
        return this;
    }

    public data(dataResponse: any): this {
        this._data = dataResponse;
        return this;
    }

    public message(msg: string): this {
        this._message = msg;
        return this;
    }

    public metadata<T extends IAPIMetadata>(metadata: T) {
        this._metadata = metadata;
        return this;
    }

    public send() {
        this._res.status(200).json({
            code: this._code,
            message: this._message,
            data: this._data,
            metadata: this._metadata,
        });
    }

    private mappMessageByCode(code: number): string {
        switch (code) {
            // Succesfull response
            case 200:
                return "OK";
            case 201:
                return "Created";
            case 202:
                return "Accepted";
            case 204:
                return "No Content";
            // Client error responses
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 403:
                return "Forbidden";
            case 404:
                return "Not Found";
            // Internal error
            case 500:
                return "Internal Server Error";
            default:
                return "Unknown Message";
        }
    }
}
