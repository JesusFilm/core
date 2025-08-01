/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoContainerPart2
// ====================================================

export interface GetVideoContainerPart2_container_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideoContainerPart2_container_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideoContainerPart2_container_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideoContainerPart2_container_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetVideoContainerPart2_container_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerPart2_container_bibleCitations_bibleBook_name {
  __typename: "BibleBookName";
  value: string;
}

export interface GetVideoContainerPart2_container_bibleCitations_bibleBook {
  __typename: "BibleBook";
  name: GetVideoContainerPart2_container_bibleCitations_bibleBook_name[];
}

export interface GetVideoContainerPart2_container_bibleCitations {
  __typename: "BibleCitation";
  bibleBook: GetVideoContainerPart2_container_bibleCitations_bibleBook;
  chapterStart: number;
  chapterEnd: number | null;
  verseStart: number | null;
  verseEnd: number | null;
}

export interface GetVideoContainerPart2_container_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideoContainerPart2_container_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContainerPart2_container_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerPart2_container_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContainerPart2_container_variant_language_name[];
  bcp47: string | null;
}

export interface GetVideoContainerPart2_container_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloadable: boolean;
  downloads: GetVideoContainerPart2_container_variant_downloads[];
  language: GetVideoContainerPart2_container_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetVideoContainerPart2_container {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: GetVideoContainerPart2_container_images[];
  imageAlt: GetVideoContainerPart2_container_imageAlt[];
  snippet: GetVideoContainerPart2_container_snippet[];
  description: GetVideoContainerPart2_container_description[];
  studyQuestions: GetVideoContainerPart2_container_studyQuestions[];
  bibleCitations: GetVideoContainerPart2_container_bibleCitations[];
  title: GetVideoContainerPart2_container_title[];
  variant: GetVideoContainerPart2_container_variant | null;
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

export interface GetVideoContainerPart2 {
  container: GetVideoContainerPart2_container;
}

export interface GetVideoContainerPart2Variables {
  containerId: string;
  languageId?: string | null;
}
