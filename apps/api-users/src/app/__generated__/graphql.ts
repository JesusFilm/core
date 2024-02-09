
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class EmailPreferencesUpdateInput {
    id: string;
    journeyNotifications: boolean;
    teamInvites: boolean;
    thirdCategory: boolean;
}

export class EmailPreferences {
    __typename?: 'EmailPreferences';
    id: string;
    userEmail: string;
    teamInvites: boolean;
    journeyNotifications: boolean;
    thirdCategory: boolean;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract emailPreferences(): Nullable<Nullable<EmailPreferences>[]> | Promise<Nullable<Nullable<EmailPreferences>[]>>;

    abstract emailPreference(id: string, idType: string): Nullable<EmailPreferences> | Promise<Nullable<EmailPreferences>>;

    abstract me(): Nullable<User> | Promise<Nullable<User>>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract updateEmailPreferences(input: EmailPreferencesUpdateInput): Nullable<EmailPreferences> | Promise<Nullable<EmailPreferences>>;

    abstract createEmailPreferencesForAllUsers(): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract userImpersonate(email: string): Nullable<string> | Promise<Nullable<string>>;
}

export class User {
    __typename?: 'User';
    id: string;
    firstName: string;
    lastName?: Nullable<string>;
    email: string;
    imageUrl?: Nullable<string>;
    superAdmin?: Nullable<boolean>;
    emailPreferences?: Nullable<EmailPreferences>;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export class Language {
    id: string;
}

type Nullable<T> = T | null;
