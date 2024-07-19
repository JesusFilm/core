/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoContent
// ====================================================

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
}

export interface GetVideoContent_content_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloads: GetVideoContent_content_variant_downloads[];
  language: GetVideoContent_content_variant_language;
  slug: string;
  subtitleCount: number;
}

export interface GetVideoContent_content {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  imageAlt: GetVideoContent_content_imageAlt[];
  snippet: GetVideoContent_content_snippet[];
  description: GetVideoContent_content_description[];
  studyQuestions: GetVideoContent_content_studyQuestions[];
  title: GetVideoContent_content_title[];
  variant: GetVideoContent_content_variant | null;
  variantLanguagesCount: number;
  slug: string;
  childrenCount: number;
}

export interface GetVideoContent {
  content: GetVideoContent_content | null;
}

export interface GetVideoContentVariables {
  id: string;
  languageId?: string | null;
}
