
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class UserUpdateInput {
    acceptedTermsAt?: Nullable<string>;
}

export class User {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    imageUrl?: Nullable<string>;
    acceptedTermsAt?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract me(): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract userUpdate(id: string, input?: Nullable<UserUpdateInput>): User | Promise<User>;
}

type Nullable<T> = T | null;
