/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideosForTestData
// ====================================================

export interface GetVideosForTestData_videos_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideosForTestData_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideosForTestData_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideosForTestData_videos_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetVideosForTestData_videos_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
}

export interface GetVideosForTestData_videos_bibleCitations_bibleBook_name {
  __typename: "BibleBookName";
  value: string;
}

export interface GetVideosForTestData_videos_bibleCitations_bibleBook {
  __typename: "BibleBook";
  name: GetVideosForTestData_videos_bibleCitations_bibleBook_name[];
}

export interface GetVideosForTestData_videos_bibleCitations {
  __typename: "BibleCitation";
  bibleBook: GetVideosForTestData_videos_bibleCitations_bibleBook;
  chapterStart: number;
  chapterEnd: number | null;
  verseStart: number | null;
  verseEnd: number | null;
}

export interface GetVideosForTestData_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideosForTestData_videos_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideosForTestData_videos_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideosForTestData_videos_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideosForTestData_videos_variant_language_name[];
  bcp47: string | null;
}

export interface GetVideosForTestData_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: GetVideosForTestData_videos_variant_downloads[];
  language: GetVideosForTestData_videos_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetVideosForTestData_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: GetVideosForTestData_videos_images[];
  imageAlt: GetVideosForTestData_videos_imageAlt[];
  snippet: GetVideosForTestData_videos_snippet[];
  description: GetVideosForTestData_videos_description[];
  studyQuestions: GetVideosForTestData_videos_studyQuestions[];
  bibleCitations: GetVideosForTestData_videos_bibleCitations[];
  title: GetVideosForTestData_videos_title[];
  variant: GetVideosForTestData_videos_variant | null;
  variantLanguagesCount: number;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideosForTestData {
  videos: GetVideosForTestData_videos[];
}

export interface GetVideosForTestDataVariables {
  ids: string[];
  languageId?: string | null;
}
