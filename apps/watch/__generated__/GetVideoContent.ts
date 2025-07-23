/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoContent
// ====================================================

export interface GetVideoContent_content_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideoContent_content_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideoContent_content_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideoContent_content_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetVideoContent_content_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
}

export interface GetVideoContent_content_bibleCitations_bibleBook_name {
  __typename: "BibleBookName";
  value: string;
}

export interface GetVideoContent_content_bibleCitations_bibleBook {
  __typename: "BibleBook";
  name: GetVideoContent_content_bibleCitations_bibleBook_name[];
}

export interface GetVideoContent_content_bibleCitations {
  __typename: "BibleCitation";
  bibleBook: GetVideoContent_content_bibleCitations_bibleBook;
  chapterStart: number;
  chapterEnd: number | null;
  verseStart: number | null;
  verseEnd: number | null;
}

export interface GetVideoContent_content_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideoContent_content_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContent_content_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideoContent_content_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContent_content_variant_language_name[];
  bcp47: string | null;
}

export interface GetVideoContent_content_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: GetVideoContent_content_variant_downloads[];
  language: GetVideoContent_content_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetVideoContent_content {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: GetVideoContent_content_images[];
  imageAlt: GetVideoContent_content_imageAlt[];
  snippet: GetVideoContent_content_snippet[];
  description: GetVideoContent_content_description[];
  studyQuestions: GetVideoContent_content_studyQuestions[];
  bibleCitations: GetVideoContent_content_bibleCitations[];
  title: GetVideoContent_content_title[];
  variant: GetVideoContent_content_variant | null;
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

export interface GetVideoContent {
  content: GetVideoContent_content;
}

export interface GetVideoContentVariables {
  id: string;
  languageId?: string | null;
}
