/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoContentPart3
// ====================================================

export interface GetVideoContentPart3_content_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideoContentPart3_content_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideoContentPart3_content_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideoContentPart3_content_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetVideoContentPart3_content_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
  primary: boolean;
}

export interface GetVideoContentPart3_content_bibleCitations_bibleBook_name {
  __typename: "BibleBookName";
  value: string;
}

export interface GetVideoContentPart3_content_bibleCitations_bibleBook {
  __typename: "BibleBook";
  name: GetVideoContentPart3_content_bibleCitations_bibleBook_name[];
}

export interface GetVideoContentPart3_content_bibleCitations {
  __typename: "BibleCitation";
  bibleBook: GetVideoContentPart3_content_bibleCitations_bibleBook;
  chapterStart: number;
  chapterEnd: number | null;
  verseStart: number | null;
  verseEnd: number | null;
}

export interface GetVideoContentPart3_content_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideoContentPart3_content_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContentPart3_content_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideoContentPart3_content_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContentPart3_content_variant_language_name[];
  bcp47: string | null;
}

export interface GetVideoContentPart3_content_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: GetVideoContentPart3_content_variant_downloads[];
  language: GetVideoContentPart3_content_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetVideoContentPart3_content {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: GetVideoContentPart3_content_images[];
  imageAlt: GetVideoContentPart3_content_imageAlt[];
  snippet: GetVideoContentPart3_content_snippet[];
  description: GetVideoContentPart3_content_description[];
  studyQuestions: GetVideoContentPart3_content_studyQuestions[];
  bibleCitations: GetVideoContentPart3_content_bibleCitations[];
  title: GetVideoContentPart3_content_title[];
  variant: GetVideoContentPart3_content_variant | null;
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

export interface GetVideoContentPart3 {
  content: GetVideoContentPart3_content;
}

export interface GetVideoContentPart3Variables {
  contentId: string;
  languageId?: string | null;
}
