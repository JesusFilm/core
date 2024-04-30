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

export interface VideoChildFields_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
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
  variant: VideoChildFields_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}
