
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum UserRole {
    publisher = "publisher"
}

export class User {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    imageUrl?: Nullable<string>;
    role?: Nullable<UserRole>;
}

export abstract class IQuery {
    abstract me(): Nullable<User> | Promise<Nullable<User>>;
}

type Nullable<T> = T | null;
