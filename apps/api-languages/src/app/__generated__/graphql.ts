
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

export class Country {
    __typename?: 'Country';
    id: string;
    name?: Translation[];
    population?: Nullable<number>;
    continent?: Translation[];
    languages: Language[];
    latitude?: Nullable<number>;
    longitude?: Nullable<number>;
    flagPngSrc?: Nullable<string>;
    flagWebpSrc?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract countries(): Country[] | Promise<Country[]>;

    abstract country(id: string): Country | Promise<Country>;

    abstract languages(offset?: Nullable<number>, limit?: Nullable<number>, where?: Nullable<LanguagesFilter>): Language[] | Promise<Language[]>;

    abstract language(id: string, idType?: Nullable<LanguageIdType>): Nullable<Language> | Promise<Nullable<Language>>;
}

export class Language {
    __typename?: 'Language';
    id: string;
    bcp47?: Nullable<string>;
    iso3?: Nullable<string>;
    name?: Translation[];
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

type Nullable<T> = T | null;
