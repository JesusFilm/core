
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class Country {
    __typename?: 'Country';
    id: string;
    name: Translation[];
    population: number;
    continent: Translation[];
    permalink: Translation[];
    languages: Language[];
    latitude: number;
    longitude: number;
    image: string;
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

export abstract class IQuery {
    abstract countries(): Country[] | Promise<Country[]>;

    abstract country(id: string): Country | Promise<Country>;

    abstract languages(offset?: Nullable<number>, limit?: Nullable<number>): Language[] | Promise<Language[]>;

    abstract language(id: string): Nullable<Language> | Promise<Nullable<Language>>;
}

type Nullable<T> = T | null;
