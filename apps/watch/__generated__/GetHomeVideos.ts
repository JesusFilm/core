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
  slug: string;
}

export interface GetHomeVideos_videos {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetHomeVideos_videos_title[];
  image: string | null;
  imageAlt: GetHomeVideos_videos_imageAlt[];
  snippet: GetHomeVideos_videos_snippet[];
  slug: string;
  variant: GetHomeVideos_videos_variant | null;
  childrenCount: number;
}

export interface GetHomeVideos {
  videos: GetHomeVideos_videos[];
}

export interface GetHomeVideosVariables {
  ids: string[];
  languageId?: string | null;
}
