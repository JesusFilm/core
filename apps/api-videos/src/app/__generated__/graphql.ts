
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class Video {
    __typename?: 'Video';
    id: string;
}

export abstract class IQuery {
    abstract videos(): Video[] | Promise<Video[]>;
}

type Nullable<T> = T | null;
