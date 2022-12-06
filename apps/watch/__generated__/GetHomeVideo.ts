/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetHomeVideo
// ====================================================

export interface GetHomeVideo_video_title {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video_children {
  __typename: "Video";
  id: string;
}

export interface GetHomeVideo_video_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetHomeVideo_video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetHomeVideo_video_title[];
  image: string | null;
  imageAlt: GetHomeVideo_video_imageAlt[];
  snippet: GetHomeVideo_video_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetHomeVideo_video_children[];
  variant: GetHomeVideo_video_variant | null;
}

export interface GetHomeVideo {
  video: GetHomeVideo_video;
}

export interface GetHomeVideoVariables {
  id: string;
  languageId?: string | null;
}
