
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum IdType {
    databaseId = "databaseId",
    slug = "slug"
}

export enum VideoType {
    episode = "episode",
    standalone = "standalone",
    playlist = "playlist"
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
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export class Video {
    __typename?: 'Video';
    id: string;
    label: VideoLabel;
    primaryLanguageId: string;
    title: Translation[];
    seoTitle: Translation[];
    snippet: Translation[];
    description: Translation[];
    studyQuestions: Translation[];
    image?: Nullable<string>;
    imageAlt: Translation[];
    variantLanguages: Language[];
    slug: Translation[];
    noIndex?: Nullable<boolean>;
    children: Video[];
    variant?: Nullable<VideoVariant>;
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
    subtitle: Translation[];
}

export class Language {
    id: string;
}

export abstract class IQuery {
    abstract videos(where?: Nullable<VideosFilter>, offset?: Nullable<number>, limit?: Nullable<number>): Video[] | Promise<Video[]>;

    abstract video(id: string, idType?: Nullable<IdType>): Video | Promise<Video>;
}

type Nullable<T> = T | null;
