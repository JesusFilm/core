/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter, VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetLatestVideos
// ====================================================

export interface GetLatestVideos_videos_title {
  __typename: "VideoTitle";
  value: string;
}

export interface GetLatestVideos_videos_images {
  __typename: "CloudflareImage";
  mobileCinematicHigh: string | null;
}

export interface GetLatestVideos_videos_imageAlt {
  __typename: "VideoImageAlt";
  value: string;
}

export interface GetLatestVideos_videos_snippet {
  __typename: "VideoSnippet";
  value: string;
}

export interface GetLatestVideos_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetLatestVideos_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetLatestVideos_videos_title[];
  images: GetLatestVideos_videos_images[];
  imageAlt: GetLatestVideos_videos_imageAlt[];
  snippet: GetLatestVideos_videos_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  variant: GetLatestVideos_videos_variant | null;
  /**
   * The number of published child videos associated with this video
   */
  childrenCount: number;
  publishedAt: any | null;
}

export interface GetLatestVideos {
  videos: GetLatestVideos_videos[];
}

export interface GetLatestVideosVariables {
  where?: VideosFilter | null;
  languageId?: string | null;
  limit?: number | null;
}
