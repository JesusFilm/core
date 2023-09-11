
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum SegmindModel {
    sdxl1__0_txt2img = "sdxl1__0_txt2img"
}

export enum UnsplashPhotoOrientation {
    landscape = "landscape",
    portrait = "portrait",
    squarish = "squarish"
}

export enum UnsplashContentFilter {
    low = "low",
    high = "high"
}

export enum UnsplashOrderBy {
    latest = "latest",
    relevant = "relevant"
}

export enum UnsplashColor {
    black_and_white = "black_and_white",
    black = "black",
    white = "white",
    yellow = "yellow",
    orange = "orange",
    red = "red",
    purple = "purple",
    magenta = "magenta",
    green = "green",
    teal = "teal",
    blue = "blue"
}

export class CloudflareImage {
    __typename?: 'CloudflareImage';
    id: string;
    uploadUrl?: Nullable<string>;
    userId: string;
    createdAt: string;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract getMyCloudflareImages(): Nullable<Nullable<CloudflareImage>[]> | Promise<Nullable<Nullable<CloudflareImage>[]>>;

    abstract getMyCloudflareVideos(): Nullable<Nullable<CloudflareVideo>[]> | Promise<Nullable<Nullable<CloudflareVideo>[]>>;

    abstract getMyCloudflareVideo(id: string): Nullable<CloudflareVideo> | Promise<Nullable<CloudflareVideo>>;

    abstract listUnsplashCollectionPhotos(collectionId: string, page?: Nullable<number>, perPage?: Nullable<number>, orientation?: Nullable<UnsplashPhotoOrientation>): UnsplashPhoto[] | Promise<UnsplashPhoto[]>;

    abstract searchUnsplashPhotos(query: string, page?: Nullable<number>, perPage?: Nullable<number>, orderBy?: Nullable<UnsplashOrderBy>, collections?: Nullable<Nullable<string>[]>, contentFilter?: Nullable<UnsplashContentFilter>, color?: Nullable<UnsplashColor>, orientation?: Nullable<UnsplashPhotoOrientation>): UnsplashQueryResponse | Promise<UnsplashQueryResponse>;
}

export class CloudflareVideo {
    __typename?: 'CloudflareVideo';
    id: string;
    uploadUrl?: Nullable<string>;
    userId: string;
    createdAt: string;
    readyToStream: boolean;
}

export class UnsplashQueryResponse {
    __typename?: 'UnsplashQueryResponse';
    total: number;
    total_pages: number;
    results: UnsplashPhoto[];
}

export class UnsplashUserImage {
    __typename?: 'UnsplashUserImage';
    small: string;
    medium: string;
    large: string;
}

export class UnsplashUserLinks {
    __typename?: 'UnsplashUserLinks';
    self: string;
    html: string;
    photos: string;
    likes: string;
    portfolio: string;
    following: string;
    followers: string;
}

export class UnsplashUser {
    __typename?: 'UnsplashUser';
    id: string;
    updated_at?: Nullable<string>;
    username: string;
    name?: Nullable<string>;
    first_name?: Nullable<string>;
    last_name?: Nullable<string>;
    twitter_username?: Nullable<string>;
    portfolio_url?: Nullable<string>;
    bio?: Nullable<string>;
    location?: Nullable<string>;
    links: UnsplashUserLinks;
    profile_image?: Nullable<UnsplashUserImage>;
    instagram_username?: Nullable<string>;
    total_collections: number;
    total_likes: number;
    total_photos: number;
    accepted_tos: boolean;
}

export class UnsplashPhoto {
    __typename?: 'UnsplashPhoto';
    id: string;
    created_at: string;
    updated_at?: Nullable<string>;
    blur_hash: string;
    width: number;
    height: number;
    color?: Nullable<string>;
    description?: Nullable<string>;
    alt_description?: Nullable<string>;
    urls: UnsplashPhotoUrls;
    links: UnsplashPhotoLinks;
    categories?: Nullable<string[]>;
    likes: number;
    liked_by_user: boolean;
    current_user_collections: string[];
    user: UnsplashUser;
}

export class UnsplashPhotoUrls {
    __typename?: 'UnsplashPhotoUrls';
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
}

export class UnsplashPhotoLinks {
    __typename?: 'UnsplashPhotoLinks';
    self: string;
    html: string;
    download: string;
    download_location: string;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export abstract class IMutation {
    abstract createCloudflareUploadByFile(): Nullable<CloudflareImage> | Promise<Nullable<CloudflareImage>>;

    abstract createCloudflareUploadByUrl(url: string): Nullable<CloudflareImage> | Promise<Nullable<CloudflareImage>>;

    abstract deleteCloudflareImage(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract cloudflareUploadComplete(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract createCloudflareVideoUploadByFile(uploadLength: number, name: string): Nullable<CloudflareVideo> | Promise<Nullable<CloudflareVideo>>;

    abstract createCloudflareVideoUploadByUrl(url: string): Nullable<CloudflareVideo> | Promise<Nullable<CloudflareVideo>>;

    abstract deleteCloudflareVideo(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;

    abstract createImageBySegmindPrompt(prompt: string, model: SegmindModel): Nullable<CloudflareImage> | Promise<Nullable<CloudflareImage>>;

    abstract triggerUnsplashDownload(url: string): Nullable<boolean> | Promise<Nullable<boolean>>;
}

export class Language {
    id: string;
}

type Nullable<T> = T | null;
