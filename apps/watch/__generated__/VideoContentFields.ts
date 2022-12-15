/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL fragment: VideoContentFields
// ====================================================

export interface VideoContentFields_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_snippet {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_description {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_studyQuestions {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_title {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_variant_language_name {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_variant_language {
  __typename: "Language";
  id: string;
  name: VideoContentFields_variant_language_name[];
}

export interface VideoContentFields_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface VideoContentFields_variant_subtitle_language {
  __typename: "Language";
  name: VideoContentFields_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface VideoContentFields_variant_subtitle {
  __typename: "Translation";
  language: VideoContentFields_variant_subtitle_language;
  value: string;
}

export interface VideoContentFields_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  language: VideoContentFields_variant_language;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitle: VideoContentFields_variant_subtitle[];
}

export interface VideoContentFields_children_title {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface VideoContentFields_children_children {
  __typename: "Video";
  id: string;
}

export interface VideoContentFields_children_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface VideoContentFields_children_variant_subtitle_language {
  __typename: "Language";
  name: VideoContentFields_children_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface VideoContentFields_children_variant_subtitle {
  __typename: "Translation";
  language: VideoContentFields_children_variant_subtitle_language;
  value: string;
}

export interface VideoContentFields_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitle: VideoContentFields_children_variant_subtitle[];
}

export interface VideoContentFields_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: VideoContentFields_children_title[];
  image: string | null;
  imageAlt: VideoContentFields_children_imageAlt[];
  snippet: VideoContentFields_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: VideoContentFields_children_children[];
  variant: VideoContentFields_children_variant | null;
}

export interface VideoContentFields {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  imageAlt: VideoContentFields_imageAlt[];
  snippet: VideoContentFields_snippet[];
  description: VideoContentFields_description[];
  studyQuestions: VideoContentFields_studyQuestions[];
  title: VideoContentFields_title[];
  variant: VideoContentFields_variant | null;
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: VideoContentFields_children[];
}
