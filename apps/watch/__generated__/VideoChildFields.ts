/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL fragment: VideoChildFields
// ====================================================

export interface VideoChildFields_title {
  __typename: "VideoTitle";
  value: string;
}

export interface VideoChildFields_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface VideoChildFields_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface VideoChildFields_snippet {
  __typename: "VideoSnippet";
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
  images: VideoChildFields_images[];
  imageAlt: VideoChildFields_imageAlt[];
  snippet: VideoChildFields_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  variant: VideoChildFields_variant | null;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
}
