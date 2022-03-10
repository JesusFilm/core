
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class Language {
    __typename?: 'Language';
    id: string;
    bcp47?: Nullable<string>;
    iso3?: Nullable<string>;
    name: Nullable<Translation>[];
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    primary: boolean;
    language?: Nullable<Language>;
}

export abstract class IQuery {
    abstract languages(page?: Nullable<number>, limit?: Nullable<number>): Language[] | Promise<Language[]>;

    abstract language(id: string): Nullable<Language> | Promise<Nullable<Language>>;
}

type Nullable<T> = T | null;
