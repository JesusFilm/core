/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel, VideoVariantDownloadQuality } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoContainerAndVideoContent
// ====================================================

export interface GetVideoContainerAndVideoContent_container_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_description {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContainerAndVideoContent_container_variant_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerAndVideoContent_container_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContainerAndVideoContent_container_variant_language_name[];
}

export interface GetVideoContainerAndVideoContent_container_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerAndVideoContent_container_variant_subtitle_language {
  __typename: "Language";
  name: GetVideoContainerAndVideoContent_container_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface GetVideoContainerAndVideoContent_container_variant_subtitle {
  __typename: "Translation";
  language: GetVideoContainerAndVideoContent_container_variant_subtitle_language;
  value: string;
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
  subtitle: GetVideoContainerAndVideoContent_container_variant_subtitle[];
}

export interface GetVideoContainerAndVideoContent_container_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_container_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideoContainerAndVideoContent_container_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetVideoContainerAndVideoContent_container_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetVideoContainerAndVideoContent_container_children_title[];
  image: string | null;
  imageAlt: GetVideoContainerAndVideoContent_container_children_imageAlt[];
  snippet: GetVideoContainerAndVideoContent_container_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideoContainerAndVideoContent_container_children_children[];
  variant: GetVideoContainerAndVideoContent_container_children_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideoContainerAndVideoContent_container {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
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
  children: GetVideoContainerAndVideoContent_container_children[];
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideoContainerAndVideoContent_content_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_description {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_variant_downloads {
  __typename: "VideoVariantDownload";
  quality: VideoVariantDownloadQuality;
  size: number;
  url: string;
}

export interface GetVideoContainerAndVideoContent_content_variant_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerAndVideoContent_content_variant_language {
  __typename: "Language";
  id: string;
  name: GetVideoContainerAndVideoContent_content_variant_language_name[];
}

export interface GetVideoContainerAndVideoContent_content_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface GetVideoContainerAndVideoContent_content_variant_subtitle_language {
  __typename: "Language";
  name: GetVideoContainerAndVideoContent_content_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface GetVideoContainerAndVideoContent_content_variant_subtitle {
  __typename: "Translation";
  language: GetVideoContainerAndVideoContent_content_variant_subtitle_language;
  value: string;
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
  subtitle: GetVideoContainerAndVideoContent_content_variant_subtitle[];
}

export interface GetVideoContainerAndVideoContent_content_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoContainerAndVideoContent_content_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideoContainerAndVideoContent_content_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetVideoContainerAndVideoContent_content_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetVideoContainerAndVideoContent_content_children_title[];
  image: string | null;
  imageAlt: GetVideoContainerAndVideoContent_content_children_imageAlt[];
  snippet: GetVideoContainerAndVideoContent_content_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideoContainerAndVideoContent_content_children_children[];
  variant: GetVideoContainerAndVideoContent_content_children_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideoContainerAndVideoContent_content {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
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
  children: GetVideoContainerAndVideoContent_content_children[];
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideoContainerAndVideoContent {
  container: GetVideoContainerAndVideoContent_container | null;
  content: GetVideoContainerAndVideoContent_content | null;
}

export interface GetVideoContainerAndVideoContentVariables {
  containerId: string;
  contentId: string;
  languageId?: string | null;
}
