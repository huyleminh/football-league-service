import { NextFunction, Request, Response } from "express";

export interface IAppRequest extends Request {}

export interface IAppResponse extends Response {}

export interface IAppNextFuction extends NextFunction {}

export interface IAPIPagination {
    pagination: {
        page: number;
        pageSize: number;
        totalRecord: number;
    };
}

export interface IAPIMetadata {
    createdDate: Date;
}

export interface IAPIPaginationMetadata extends IAPIMetadata, IAPIPagination {}
