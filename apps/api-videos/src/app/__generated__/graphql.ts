
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum QualityType {
    low = "low",
    high = "high"
}

export class VideosFilter {
    availableVariantLanguageIds?: Nullable<Nullable<string>[]>;
    title?: Nullable<string>;
}

export class Video {
    __typename?: 'Video';
    id: string;
    title: Translation[];
    snippet: Translation[];
    description: Translation[];
    studyQuestions: undefined[];
    image?: Nullable<string>;
    variantLanguages: Language[];
    variant?: Nullable<VideoVariant>;
}

export class Translation {
    __typename?: 'Translation';
    value: string;
    language: Language;
    primary: boolean;
}

export class VideoVariant {
    __typename?: 'VideoVariant';
    subtitle: Translation[];
    hls: string;
    downloads: Download[];
    duration: number;
    language: Language;
}

export class Download {
    __typename?: 'Download';
    quality: QualityType;
    size: number;
    url: string;
}

export class Language {
    id: string;
}

export abstract class IQuery {
    abstract videos(where?: Nullable<VideosFilter>, page?: Nullable<number>, limit?: Nullable<number>): Video[] | Promise<Video[]>;
}

type Nullable<T> = T | null;
