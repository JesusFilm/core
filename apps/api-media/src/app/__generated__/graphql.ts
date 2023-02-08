
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

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
    uploadUrl: string;
    userId: string;
    createdAt: string;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract createCloudflareImage(): Nullable<CloudflareImage> | Promise<Nullable<CloudflareImage>>;

    abstract getMyCloudflareImages(): Nullable<Nullable<CloudflareImage>[]> | Promise<Nullable<Nullable<CloudflareImage>[]>>;

    abstract listUnsplashCollectionPhotos(collectionId: string, page?: Nullable<number>, perPage?: Nullable<number>, orientation?: Nullable<UnsplashPhotoOrientation>): Nullable<UnsplashPhoto>[] | Promise<Nullable<UnsplashPhoto>[]>;

    abstract searchUnsplashPhotos(query: string, page?: Nullable<number>, perPage?: Nullable<number>, orderBy?: Nullable<UnsplashOrderBy>, collections?: Nullable<Nullable<string>[]>, contentFilter?: Nullable<UnsplashContentFilter>, color?: Nullable<UnsplashColor>, orientation?: Nullable<UnsplashPhotoOrientation>): UnsplashQueryResponse | Promise<UnsplashQueryResponse>;
}

export class UnsplashQueryResponse {
    __typename?: 'UnsplashQueryResponse';
    total?: Nullable<number>;
    total_pages?: Nullable<number>;
    results?: Nullable<Nullable<UnsplashPhoto>[]>;
}

export class UnsplashUserImage {
    __typename?: 'UnsplashUserImage';
    small?: Nullable<string>;
    medium?: Nullable<string>;
    large?: Nullable<string>;
}

export class UnsplashUserLinks {
    __typename?: 'UnsplashUserLinks';
    self?: Nullable<string>;
    html?: Nullable<string>;
    photos?: Nullable<string>;
    likes?: Nullable<string>;
    portfolio?: Nullable<string>;
    following?: Nullable<string>;
    followers?: Nullable<string>;
}

export class UnsplashUser {
    __typename?: 'UnsplashUser';
    id?: Nullable<string>;
    updated_at?: Nullable<string>;
    username?: Nullable<string>;
    name?: Nullable<string>;
    first_name?: Nullable<string>;
    last_name?: Nullable<string>;
    twitter_username?: Nullable<string>;
    portfolio_url?: Nullable<string>;
    bio?: Nullable<string>;
    location?: Nullable<string>;
    links?: Nullable<UnsplashUserLinks>;
    profile_image?: Nullable<UnsplashUserImage>;
    instagram_username?: Nullable<string>;
    total_collections?: Nullable<number>;
    total_likes?: Nullable<number>;
    total_photos?: Nullable<number>;
    accepted_tos?: Nullable<boolean>;
}

export class UnsplashPhoto {
    __typename?: 'UnsplashPhoto';
    id?: Nullable<string>;
    created_at?: Nullable<string>;
    updated_at?: Nullable<string>;
    blur_hash?: Nullable<string>;
    width?: Nullable<number>;
    height?: Nullable<number>;
    color?: Nullable<string>;
    description?: Nullable<string>;
    alt_description?: Nullable<string>;
    urls?: Nullable<UnsplashPhotoUrls>;
    links?: Nullable<UnsplashPhotoLinks>;
    categories?: Nullable<Nullable<string>[]>;
    likes?: Nullable<number>;
    liked_by_user?: Nullable<boolean>;
    current_user_collections?: Nullable<Nullable<string>[]>;
    user?: Nullable<UnsplashUser>;
}

export class UnsplashPhotoUrls {
    __typename?: 'UnsplashPhotoUrls';
    raw?: Nullable<string>;
    full?: Nullable<string>;
    regular?: Nullable<string>;
    small?: Nullable<string>;
    thumb?: Nullable<string>;
}

export class UnsplashPhotoLinks {
    __typename?: 'UnsplashPhotoLinks';
    self?: Nullable<string>;
    html?: Nullable<string>;
    download?: Nullable<string>;
    download_location?: Nullable<string>;
}

export abstract class IMutation {
    abstract deleteCloudflareImage(id: string): Nullable<boolean> | Promise<Nullable<boolean>>;
}

type Nullable<T> = T | null;
