
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum CacheControlScope {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export enum LanguageIdType {
    databaseId = "databaseId",
    bcp47 = "bcp47"
}

export class LanguagesFilter {
    ids?: Nullable<string[]>;
}

export class Language {
    __typename?: 'Language';
    id: string;
    bcp47?: Nullable<string>;
    iso3?: Nullable<string>;
    name?: Translation[];
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract languages(offset?: Nullable<number>, limit?: Nullable<number>, where?: Nullable<LanguagesFilter>): Language[] | Promise<Language[]>;

    abstract language(id: string, idType?: Nullable<LanguageIdType>): Nullable<Language> | Promise<Nullable<Language>>;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

type Nullable<T> = T | null;
