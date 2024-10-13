/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoContainerAndVideoContent
// ====================================================

export interface GetVideoContainerAndVideoContent_container_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideoContainerAndVideoContent_container_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContainerAndVideoContent_container_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerAndVideoContent_container_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContainerAndVideoContent_container_variant_language_name[];
}

export interface GetVideoContainerAndVideoContent_container_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloads: GetVideoContainerAndVideoContent_container_variant_downloads[];
  language: GetVideoContainerAndVideoContent_container_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetVideoContainerAndVideoContent_container {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: GetVideoContainerAndVideoContent_container_images[];
  imageAlt: GetVideoContainerAndVideoContent_container_imageAlt[];
  snippet: GetVideoContainerAndVideoContent_container_snippet[];
  description: GetVideoContainerAndVideoContent_container_description[];
  studyQuestions: GetVideoContainerAndVideoContent_container_studyQuestions[];
  title: GetVideoContainerAndVideoContent_container_title[];
  variant: GetVideoContainerAndVideoContent_container_variant | null;
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

export interface GetVideoContainerAndVideoContent_content_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideoContainerAndVideoContent_content_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_description {
  __typename: "VideoDescription";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_studyQuestions {
  __typename: "VideoStudyQuestion";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContainerAndVideoContent_content_variant_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerAndVideoContent_content_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContainerAndVideoContent_content_variant_language_name[];
}

export interface GetVideoContainerAndVideoContent_content_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  downloads: GetVideoContainerAndVideoContent_content_variant_downloads[];
  language: GetVideoContainerAndVideoContent_content_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitleCount: number;
}

export interface GetVideoContainerAndVideoContent_content {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  images: GetVideoContainerAndVideoContent_content_images[];
  imageAlt: GetVideoContainerAndVideoContent_content_imageAlt[];
  snippet: GetVideoContainerAndVideoContent_content_snippet[];
  description: GetVideoContainerAndVideoContent_content_description[];
  studyQuestions: GetVideoContainerAndVideoContent_content_studyQuestions[];
  title: GetVideoContainerAndVideoContent_content_title[];
  variant: GetVideoContainerAndVideoContent_content_variant | null;
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

export interface GetVideoContainerAndVideoContent {
  container: GetVideoContainerAndVideoContent_container;
  content: GetVideoContainerAndVideoContent_content;
}

export interface GetVideoContainerAndVideoContentVariables {
  containerId: string;
  contentId: string;
  languageId?: string | null;
}
