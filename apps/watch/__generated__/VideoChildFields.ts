/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL fragment: VideoChildFields
// ====================================================

export interface VideoChildFields_title {
  __typename: "Translation";
  value: string;
}

export interface VideoChildFields_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface VideoChildFields_snippet {
  __typename: "Translation";
  value: string;
}

export interface VideoChildFields_children {
  __typename: "Video";
  id: string;
}

export interface VideoChildFields_variant_subtitle_language_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface VideoChildFields_variant_subtitle_language {
  __typename: "Language";
  name: VideoChildFields_variant_subtitle_language_name[];
  bcp47: string | null;
  id: string;
}

export interface VideoChildFields_variant_subtitle {
  __typename: "Translation";
  language: VideoChildFields_variant_subtitle_language;
  value: string;
}

export interface VideoChildFields_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
  subtitle: VideoChildFields_variant_subtitle[];
}

export interface VideoChildFields {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: VideoChildFields_title[];
  image: string | null;
  imageAlt: VideoChildFields_imageAlt[];
  snippet: VideoChildFields_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: VideoChildFields_children[];
  variant: VideoChildFields_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}
