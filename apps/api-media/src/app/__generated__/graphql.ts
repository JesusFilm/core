
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CloudflareImage {
    __typename?: 'CloudflareImage';
    id: string;
    uploadUrl: string;
    userId: string;
    createdAt: string;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract createCloudflareImage(): Nullable<CloudflareImage> | Promise<Nullable<CloudflareImage>>;

    abstract getMyCloudflareImages(): Nullable<Nullable<CloudflareImage>[]> | Promise<Nullable<Nullable<CloudflareImage>[]>>;
}

export abstract class IMutation {
    abstract deleteCloudflareImage(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;
}

type Nullable<T> = T | null;
