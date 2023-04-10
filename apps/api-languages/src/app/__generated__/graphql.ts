
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

export enum IdType {
    databaseId = "databaseId",
    slug = "slug"
}

export enum LanguageIdType {
    databaseId = "databaseId",
    bcp47 = "bcp47"
}

export class Country {
    __typename?: 'Country';
    id: string;
    name: Translation[];
    population: number;
    continent: Translation[];
    slug: Translation[];
    languages: Language[];
    latitude: number;
    longitude: number;
    image?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract countries(): Country[] | Promise<Country[]>;

    abstract country(id: string, idType?: Nullable<IdType>): Country | Promise<Country>;

    abstract languages(offset?: Nullable<number>, limit?: Nullable<number>): Language[] | Promise<Language[]>;

    abstract language(id: string, idType?: Nullable<LanguageIdType>): Nullable<Language> | Promise<Nullable<Language>>;
}

export class Language {
    __typename?: 'Language';
    id: string;
    bcp47?: Nullable<string>;
    iso3?: Nullable<string>;
    name: Translation[];
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

type Nullable<T> = T | null;
