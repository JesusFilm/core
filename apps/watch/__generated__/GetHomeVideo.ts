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

export interface GetHomeVideo_video_variant {
  __typename: "VideoVariant";
  duration: number;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetHomeVideo_video_children {
  __typename: "Video";
  id: string;
}

export interface GetHomeVideo_video {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  image: string | null;
  title: GetHomeVideo_video_title[];
  variant: GetHomeVideo_video_variant | null;
  children: GetHomeVideo_video_children[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
}

export interface GetHomeVideo {
  video: GetHomeVideo_video;
}

export interface GetHomeVideoVariables {
  id: string;
  languageId?: string | null;
}
