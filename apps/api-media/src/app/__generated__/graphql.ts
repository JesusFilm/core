
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class CloudflareDirectCreatorUploadResponse {
    __typename?: 'CloudflareDirectCreatorUploadResponse';
    imageId?: Nullable<string>;
    uploadUrl?: Nullable<string>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract getCloudflareImageUploadInfo(): Nullable<CloudflareDirectCreatorUploadResponse> | Promise<Nullable<CloudflareDirectCreatorUploadResponse>>;
}

type Nullable<T> = T | null;
