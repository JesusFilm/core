/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetHomeVideos
// ====================================================

export interface GetHomeVideos_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetHomeVideos_videos_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetHomeVideos_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetHomeVideos_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetHomeVideos_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetHomeVideos_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetHomeVideos_videos_title[];
  images: GetHomeVideos_videos_images[];
  imageAlt: GetHomeVideos_videos_imageAlt[];
  snippet: GetHomeVideos_videos_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  variant: GetHomeVideos_videos_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetHomeVideos {
  videos: GetHomeVideos_videos[];
}

export interface GetHomeVideosVariables {
  ids: string[];
  languageId?: string | null;
}
