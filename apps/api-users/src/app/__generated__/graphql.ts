
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum UserJourneyRoles {
    inviteRequested = "inviteRequested",
    editor = "editor",
    owner = "owner"
}

export class UserCreateInput {
    id?: Nullable<string>;
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    email?: Nullable<string>;
    imageUrl?: Nullable<string>;
}

export class UserJourneyCreateInput {
    id?: Nullable<string>;
    userId: string;
    journeyId: string;
    role?: Nullable<UserJourneyRoles>;
}

export class UserJourneyUpdateInput {
    role?: Nullable<UserJourneyRoles>;
}

export class User {
    __typename?: 'User';
    id: string;
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    email?: Nullable<string>;
    imageUrl?: Nullable<string>;
    usersJourneys?: Nullable<UserJourney[]>;
}

export class UserJourney {
    __typename?: 'UserJourney';
    user?: Nullable<User>;
    id: string;
    userId: string;
    journeyId: string;
    role: UserJourneyRoles;
}

export abstract class IQuery {
    abstract me(): Nullable<User> | Promise<Nullable<User>>;

    abstract users(): User[] | Promise<User[]>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract userCreate(input: UserCreateInput): User | Promise<User>;

    abstract userJourneyCreate(input: UserJourneyCreateInput): UserJourney | Promise<UserJourney>;

    abstract userJourneyUpdate(id: string, input: UserJourneyUpdateInput): UserJourney | Promise<UserJourney>;

    abstract userJourneyRemove(id: string): UserJourney | Promise<UserJourney>;
}

export class Journey {
    usersJourneys?: Nullable<UserJourney[]>;
}

type Nullable<T> = T | null;
