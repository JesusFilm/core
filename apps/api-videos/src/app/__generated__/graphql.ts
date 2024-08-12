
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
    shortFilm = "shortFilm",
    trailer = "trailer",
    behindTheScenes = "behindTheScenes"
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

export class BibleBook {
    __typename?: 'BibleBook';
    name?: Translation[];
    osisId: string;
    alternateName?: Nullable<string>;
    paratextAbbreviation: string;
    isNewTestament: boolean;
    order: number;
}

export class BibleCitation {
    __typename?: 'BibleCitation';
    osisId: string;
    bibleBook: BibleBook;
    chapterStart: number;
    chapterEnd?: Nullable<number>;
    verseStart: number;
    verseEnd?: Nullable<number>;
}

export class Video {
    __typename?: 'Video';
    bibleCitations: BibleCitation[];
    keywords?: Keyword[];
    id: string;
    label: VideoLabel;
    primaryLanguageId: string;
    title?: Translation[];
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
    subtitles?: VideoSubtitle[];
    variant?: Nullable<VideoVariant>;
}

export class Keyword {
    __typename?: 'Keyword';
    id: string;
    value: string;
    language: Language;
}

export class LanguageWithSlug {
    __typename?: 'LanguageWithSlug';
    language?: Nullable<Language>;
    slug?: Nullable<string>;
}

export class VideoSubtitle {
    __typename?: 'VideoSubtitle';
    id: string;
    languageId: string;
    edition: string;
    vttSrc?: Nullable<string>;
    srtSrc?: Nullable<string>;
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
