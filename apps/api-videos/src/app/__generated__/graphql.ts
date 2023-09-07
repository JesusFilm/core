
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum CacheControlScope {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE"
}

export enum IdType {
    databaseId = "databaseId",
    slug = "slug"
}

export enum VideoLabel {
    collection = "collection",
    episode = "episode",
    featureFilm = "featureFilm",
    segment = "segment",
    series = "series",
    shortFilm = "shortFilm"
}

export enum VideoVariantDownloadQuality {
    low = "low",
    high = "high"
}

export class VideosFilter {
    availableVariantLanguageIds?: Nullable<string[]>;
    title?: Nullable<string>;
    labels?: Nullable<VideoLabel[]>;
    ids?: Nullable<string[]>;
    subtitleLanguageIds?: Nullable<string[]>;
}

export class LanguageWithSlug {
    __typename?: 'LanguageWithSlug';
    language?: Nullable<Language>;
    slug?: Nullable<string>;
}

export class Video {
    __typename?: 'Video';
    id: string;
    label: VideoLabel;
    primaryLanguageId: string;
    title?: Translation[];
    seoTitle?: Translation[];
    snippet?: Translation[];
    description?: Translation[];
    studyQuestions?: Translation[];
    image?: Nullable<string>;
    imageAlt?: Translation[];
    variantLanguages: Language[];
    variantLanguagesCount: number;
    slug: string;
    noIndex?: Nullable<boolean>;
    children: Video[];
    childrenCount: number;
    variantLanguagesWithSlug: LanguageWithSlug[];
    variant?: Nullable<VideoVariant>;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract videos(where?: Nullable<VideosFilter>, offset?: Nullable<number>, limit?: Nullable<number>): Video[] | Promise<Video[]>;

    abstract video(id: string, idType?: Nullable<IdType>): Nullable<Video> | Promise<Nullable<Video>>;
}

export class VideoVariantDownload {
    __typename?: 'VideoVariantDownload';
    quality: VideoVariantDownloadQuality;
    size: number;
    url: string;
}

export class VideoVariant {
    __typename?: 'VideoVariant';
    id: string;
    hls?: Nullable<string>;
    downloads: VideoVariantDownload[];
    duration: number;
    language: Language;
    subtitle?: Translation[];
    subtitleCount: number;
    slug: string;
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
