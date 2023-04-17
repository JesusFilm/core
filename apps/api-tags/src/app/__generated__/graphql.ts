
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class Tag {
    __typename?: 'Tag';
    id: string;
    name: Translation[];
    parentId?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract tags(): Tag[] | Promise<Tag[]>;
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
