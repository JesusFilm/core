/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

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

export interface GetVideo_video {
  __typename: "Video";
  id: string;
  image: string | null;
  description: GetVideo_video_description[];
  title: GetVideo_video_title[];
  variant: GetVideo_video_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  episodeIds: string[];
  permalink: string;
}

export interface GetVideo {
  video: GetVideo_video;
}

export interface GetVideoVariables {
  id: string;
}
