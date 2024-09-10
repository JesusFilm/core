
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Service {
    apiJourneys = "apiJourneys",
    apiLanguages = "apiLanguages",
    apiMedia = "apiMedia",
    apiTags = "apiTags",
    apiUsers = "apiUsers",
    apiVideos = "apiVideos"
}

export class Tag {
    __typename?: 'Tag';
    id: string;
    name: Translation[];
    parentId?: Nullable<string>;
    service?: Nullable<Service>;
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
