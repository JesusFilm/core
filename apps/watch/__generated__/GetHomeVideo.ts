/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

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
}

export interface GetHomeVideo_video_slug {
  __typename: "Translation";
  value: string;
}

export interface GetHomeVideo_video {
  __typename: "Video";
  id: string;
  image: string | null;
  title: GetHomeVideo_video_title[];
  variant: GetHomeVideo_video_variant | null;
  /**
   * Episodes are child videos, currently only found in a playlist type
   */
  childIds: string[];
  /**
   * slug is a permanent link to the video. It should only be appended, not edited or deleted
   */
  slug: GetHomeVideo_video_slug[];
}

export interface GetHomeVideo {
  video: GetHomeVideo_video;
}

export interface GetHomeVideoVariables {
  id: string;
  languageId?: string | null;
}
