
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
    superAdmin?: Nullable<boolean>;
    emailVerified: boolean;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract me(redirectLink?: Nullable<string>): Nullable<User> | Promise<Nullable<User>>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;

    abstract userByEmail(email: string): Nullable<User> | Promise<Nullable<User>>;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export abstract class IMutation {
    abstract userImpersonate(email: string): Nullable<string> | Promise<Nullable<string>>;

    abstract createVerificationRequest(redirectLink?: Nullable<string>): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract validateEmail(email: string, token: string): Nullable<User> | Promise<Nullable<User>>;
}

export class Language {
    id: string;
}

type Nullable<T> = T | null;
