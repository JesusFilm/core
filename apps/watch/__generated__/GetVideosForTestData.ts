/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideosForTestData
// ====================================================

export interface GetVideosForTestData_videos_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_description {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideosForTestData_videos_variant_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideosForTestData_videos_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideosForTestData_videos_variant_language_name[];
}

export interface GetVideosForTestData_videos_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideosForTestData_videos_variant_subtitle_language {
  __typename: "Language";
  name: GetVideosForTestData_videos_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface GetVideosForTestData_videos_variant_subtitle {
  __typename: "Translation";
  language: GetVideosForTestData_videos_variant_subtitle_language;
  value: string;
}

export interface GetVideosForTestData_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloads: GetVideosForTestData_videos_variant_downloads[];
  language: GetVideosForTestData_videos_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitle: GetVideosForTestData_videos_variant_subtitle[];
}

export interface GetVideosForTestData_videos_variantLanguagesWithSlug_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideosForTestData_videos_variantLanguagesWithSlug_language {
  __typename: "Language";
  id: string;
  name: GetVideosForTestData_videos_variantLanguagesWithSlug_language_name[];
}

export interface GetVideosForTestData_videos_variantLanguagesWithSlug {
  __typename: "LanguageWithSlug";
  slug: string | null;
  language: GetVideosForTestData_videos_variantLanguagesWithSlug_language | null;
}

export interface GetVideosForTestData_videos_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideosForTestData_videos_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideosForTestData_videos_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetVideosForTestData_videos_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetVideosForTestData_videos_children_title[];
  image: string | null;
  imageAlt: GetVideosForTestData_videos_children_imageAlt[];
  snippet: GetVideosForTestData_videos_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideosForTestData_videos_children_children[];
  variant: GetVideosForTestData_videos_children_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideosForTestData_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  imageAlt: GetVideosForTestData_videos_imageAlt[];
  snippet: GetVideosForTestData_videos_snippet[];
  description: GetVideosForTestData_videos_description[];
  studyQuestions: GetVideosForTestData_videos_studyQuestions[];
  title: GetVideosForTestData_videos_title[];
  variant: GetVideosForTestData_videos_variant | null;
  variantLanguagesCount: number;
  variantLanguagesWithSlug: GetVideosForTestData_videos_variantLanguagesWithSlug[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideosForTestData_videos_children[];
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
