/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter, VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideos
// ====================================================

export interface GetVideos_videos_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideos_videos_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideos_videos_variant {
  __typename: "VideoVariant";
  duration: number;
}

export interface GetVideos_videos_slug {
  __typename: "Translation";
  value: string;
}

export interface GetVideos_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  snippet: GetVideos_videos_snippet[];
  title: GetVideos_videos_title[];
  variant: GetVideos_videos_variant | null;
  childIds: string[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetVideos_videos_slug[];
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
