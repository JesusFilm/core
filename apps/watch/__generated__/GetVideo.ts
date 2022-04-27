/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideo
// ====================================================

export interface GetVideo_video_description {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_title {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideo_video_episodes_title {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_episodes_imageAlt {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_episodes_snippet {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideo_video_episodes_variant {
  __typename: "VideoVariant";
  duration: number;
  hls: string | null;
}

export interface GetVideo_video_episodes {
  __typename: "Video";
  id: string;
  title: GetVideo_video_episodes_title[];
  image: string | null;
  imageAlt: GetVideo_video_episodes_imageAlt[];
  snippet: GetVideo_video_episodes_snippet[];
  permalink: string;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  variant: GetVideo_video_episodes_variant | null;
}

export interface GetVideo_video {
  __typename: "Video";
  id: string;
  type: VideoType;
  image: string | null;
  description: GetVideo_video_description[];
  title: GetVideo_video_title[];
  variant: GetVideo_video_variant | null;
  episodes: GetVideo_video_episodes[];
  permalink: string;
}

export interface GetVideo {
  video: GetVideo_video;
}

export interface GetVideoVariables {
  id: string;
}
