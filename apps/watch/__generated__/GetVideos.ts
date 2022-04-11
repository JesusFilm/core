/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter, VideoType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideos
// ====================================================

export interface GetVideos_videos_snippet {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideos_videos_title {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideos_videos_variant {
  __typename: "VideoVariant";
  duration: number;
}

export interface GetVideos_videos {
  __typename: "Video";
  id: string;
  type: VideoType;
  image: string | null;
  snippet: GetVideos_videos_snippet[];
  title: GetVideos_videos_title[];
  variant: GetVideos_videos_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  permalink: string;
}

export interface GetVideos {
  videos: GetVideos_videos[];
}

export interface GetVideosVariables {
  where?: VideosFilter | null;
  offset?: number | null;
  limit?: number | null;
}
