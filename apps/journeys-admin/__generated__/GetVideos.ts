/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideos
// ====================================================

export interface GetVideos_videos_snippet_language {
  __typename: "Language";
  id: string;
}

export interface GetVideos_videos_snippet {
  __typename: "Translation";
  primary: boolean;
  value: string;
  language: GetVideos_videos_snippet_language;
}

export interface GetVideos_videos_title_language {
  __typename: "Language";
  id: string;
}

export interface GetVideos_videos_title {
  __typename: "Translation";
  primary: boolean;
  value: string;
  language: GetVideos_videos_title_language;
}

export interface GetVideos_videos_variant {
  __typename: "VideoVariant";
  duration: number;
}

export interface GetVideos_videos {
  __typename: "Video";
  id: string;
  image: string | null;
  snippet: GetVideos_videos_snippet[];
  title: GetVideos_videos_title[];
  variant: GetVideos_videos_variant | null;
}

export interface GetVideos {
  videos: GetVideos_videos[];
}

export interface GetVideosVariables {
  where?: VideosFilter | null;
  limit?: number | null;
  page?: number | null;
}
