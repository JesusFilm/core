/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideosForTestData
// ====================================================

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
  subtitleCount: number;
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
