/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter, VideoType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetHomeVideos
// ====================================================

export interface GetHomeVideos_videos_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideos_videos_title {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideos_videos_variant {
  __typename: "VideoVariant";
  duration: number;
}

export interface GetHomeVideos_videos_slug {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideos_videos {
  __typename: "Video";
  id: string;
  type: VideoType;
  image: string | null;
  snippet: GetHomeVideos_videos_snippet[];
  title: GetHomeVideos_videos_title[];
  variant: GetHomeVideos_videos_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetHomeVideos_videos_slug[];
}

export interface GetHomeVideos {
  videos: GetHomeVideos_videos[];
}

export interface GetHomeVideosVariables {
  where?: VideosFilter | null;
  languageId?: string | null;
}
