
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class User {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    imageUrl?: Nullable<string>;
}

export abstract class IQuery {
    abstract me(): Nullable<User> | Promise<Nullable<User>>;
}

type Nullable<T> = T | null;
