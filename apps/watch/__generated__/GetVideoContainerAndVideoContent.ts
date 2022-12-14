/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

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

export interface GetVideoContainerAndVideoContent_container_variant_language_name {
  __typename: "Translation";
  value: string;
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
  language: GetVideoContainerAndVideoContent_container_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
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
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideoContainerAndVideoContent_container_children[];
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

export interface GetVideoContainerAndVideoContent_content_variant_language_name {
  __typename: "Translation";
  value: string;
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
  language: GetVideoContainerAndVideoContent_content_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
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
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideoContainerAndVideoContent_content_children[];
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
