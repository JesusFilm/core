/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideosFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideos
// ====================================================

export interface GetVideos_videos_images {
  __typename: "CloudflareImage";
  url: string;
}

export interface GetVideos_videos_snippet {
  __typename: "VideoSnippet";
  primary: boolean;
  value: string;
}

export interface GetVideos_videos_title {
  __typename: "VideoTitle";
  primary: boolean;
  value: string;
}

export interface GetVideos_videos_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
}

export interface GetVideos_videos {
  __typename: "Video";
  id: string;
  images: GetVideos_videos_images[];
  snippet: GetVideos_videos_snippet[];
  title: GetVideos_videos_title[];
  variant: GetVideos_videos_variant | null;
}

export interface GetVideos {
  videos: GetVideos_videos[];
}

export interface GetVideosVariables {
  where?: VideosFilter | null;
  limit: number;
  offset: number;
}
