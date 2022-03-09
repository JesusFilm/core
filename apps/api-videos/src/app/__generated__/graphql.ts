
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

export class Video {
    __typename?: 'Video';
    id: string;
    title: Translation[];
    snippet: Translation[];
    description: Translation[];
    studyQuestions: undefined[];
    image?: Nullable<string>;
    variants?: Nullable<Nullable<VideoVariant>[]>;
}

export class VideoVariant {
    __typename?: 'VideoVariant';
    hls: string;
    subtitle: Translation[];
    downloads: Download[];
    duration: number;
    languageId: Language;
}

export class Download {
    __typename?: 'Download';
    quality: QualityType;
    size: number;
    url: string;
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

export abstract class IQuery {
    abstract videos(): Video[] | Promise<Video[]>;
}

type Nullable<T> = T | null;
