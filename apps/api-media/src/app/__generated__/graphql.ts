
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CloudflareDirectCreatorUploadResponse {
    __typename?: 'CloudflareDirectCreatorUploadResponse';
    id?: Nullable<string>;
    uploadURL?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract getCloudflareUploadInfo(): Nullable<CloudflareDirectCreatorUploadResponse> | Promise<Nullable<CloudflareDirectCreatorUploadResponse>>;
}

type Nullable<T> = T | null;
