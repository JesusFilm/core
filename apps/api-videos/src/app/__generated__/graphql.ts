
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

export enum VideoVariantDownloadQuality {
    low = "low",
    high = "high"
}

export class VideosFilter {
    availableVariantLanguageIds?: Nullable<string[]>;
    title?: Nullable<string>;
    tagId?: Nullable<string>;
    types?: Nullable<VideoType[]>;
}

export class VideoTag {
    __typename?: 'VideoTag';
    id: string;
    title: Translation[];
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
    type: VideoType;
    primaryLanguageId: string;
    title: Translation[];
    seoTitle: Translation[];
    snippet: Translation[];
    description: Translation[];
    studyQuestions: Translation[];
    image?: Nullable<string>;
    imageAlt: Translation[];
    variantLanguages: Language[];
    permalink: string;
    noIndex?: Nullable<boolean>;
    episodeIds: string[];
    episodes: Video[];
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

export abstract class IQuery {
    abstract videoTags(): Nullable<VideoTag[]> | Promise<Nullable<VideoTag[]>>;

    abstract videoTag(id: string): Nullable<VideoTag> | Promise<Nullable<VideoTag>>;

    abstract episodes(playlistId: string, idType?: Nullable<IdType>, where?: Nullable<VideosFilter>, offset?: Nullable<number>, limit?: Nullable<number>): Video[] | Promise<Video[]>;

    abstract videos(where?: Nullable<VideosFilter>, offset?: Nullable<number>, limit?: Nullable<number>): Video[] | Promise<Video[]>;

    abstract video(id: string, idType?: Nullable<IdType>): Video | Promise<Video>;
}

export class Language {
    id: string;
}

type Nullable<T> = T | null;
