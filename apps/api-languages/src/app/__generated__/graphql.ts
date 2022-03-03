
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
}

export abstract class IQuery {
    abstract languages(): Language[] | Promise<Language[]>;
}

type Nullable<T> = T | null;
