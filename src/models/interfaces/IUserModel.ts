export interface IUserModel {
    username: string;
    password: string;
    email: string;
    fullname: string;
    address?: string;
    role: number;
    status?: number;
    lastLockedDate?: Date;
    createdDate: Date;
}
