
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum UserJourneyRole {
    inviteRequested = "inviteRequested",
    editor = "editor",
    owner = "owner"
}

export enum UserJourneyRoleForUpdates {
    inviteRequested = "inviteRequested",
    editor = "editor"
}

export class UserCreateInput {
    id?: Nullable<string>;
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    email?: Nullable<string>;
    imageUrl?: Nullable<string>;
}

export class UserJourneyCreateInput {
    userId: string;
    journeyId: string;
    role?: Nullable<UserJourneyRole>;
}

export class UserJourneyUpdateInput {
    userId: string;
    journeyId: string;
    role: UserJourneyRoleForUpdates;
}

export class User {
    id: string;
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    email?: Nullable<string>;
    imageUrl?: Nullable<string>;
    usersJourneys?: Nullable<UserJourney[]>;
}

export class UserJourney {
    user?: Nullable<User>;
    userId: string;
    journeyId: string;
    role: UserJourneyRole;
}

export abstract class IQuery {
    abstract me(): Nullable<User> | Promise<Nullable<User>>;

    abstract users(): User[] | Promise<User[]>;

    abstract user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    abstract userCreate(input: UserCreateInput): User | Promise<User>;

    abstract userJourneyCreate(input: UserJourneyCreateInput): UserJourney | Promise<UserJourney>;

    abstract userJourneyUpdate(input: UserJourneyUpdateInput): UserJourney | Promise<UserJourney>;
}

export class Journey {
    usersJourneys?: Nullable<UserJourney[]>;
}

type Nullable<T> = T | null;
