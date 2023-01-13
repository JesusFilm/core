/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VideoLabel } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVideoChildren
// ====================================================

export interface GetVideoChildren_video_children_title {
  __typename: "Translation";
  value: string;
}

export interface GetVideoChildren_video_children_imageAlt {
  __typename: "Translation";
  value: string;
}

export interface GetVideoChildren_video_children_snippet {
  __typename: "Translation";
  value: string;
}

export interface GetVideoChildren_video_children_children {
  __typename: "Video";
  id: string;
}

export interface GetVideoChildren_video_children_variant {
  __typename: "VideoVariant";
  id: string;
  duration: number;
  hls: string | null;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetVideoChildren_video_children {
  __typename: "Video";
  id: string;
  label: VideoLabel;
  title: GetVideoChildren_video_children_title[];
  image: string | null;
  imageAlt: GetVideoChildren_video_children_imageAlt[];
  snippet: GetVideoChildren_video_children_snippet[];
  /**
   * slug is a permanent link to the video.
   */
  slug: string;
  children: GetVideoChildren_video_children_children[];
  variant: GetVideoChildren_video_children_variant | null;
  /**
   * the number value of the amount of children on a video
   */
  childrenCount: number;
}

export interface GetVideoChildren_video {
  __typename: "Video";
  children: GetVideoChildren_video_children[];
}

export interface GetVideoChildren {
  video: GetVideoChildren_video | null;
}

export interface GetVideoChildrenVariables {
  id: string;
  languageId?: string | null;
}
