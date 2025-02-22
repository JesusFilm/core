/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter, VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideos
// ====================================================

export interface GetVideos_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetVideos_videos_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetVideos_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetVideos_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetVideos_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetVideos_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetVideos_videos_title[];
  images: GetVideos_videos_images[];
  imageAlt: GetVideos_videos_imageAlt[];
  snippet: GetVideos_videos_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  variant: GetVideos_videos_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideos {
  videos: GetVideos_videos[];
}

export interface GetVideosVariables {
  where?: VideosFilter | null;
  offset?: number | null;
  limit?: number | null;
  languageId?: string | null;
}
