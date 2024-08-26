/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideo
// ====================================================

export interface GetVideo_video_variant {
  __typename: "VideoVariant";
  id: string;
  /**
   * slug is a permanent link to the video variant.
   */
  slug: string;
}

export interface GetVideo_video {
  __typename: "Video";
  id: string;
  variant: GetVideo_video_variant | null;
}

export interface GetVideo {
  video: GetVideo_video;
}

export interface GetVideoVariables {
  videoId: string;
  languageId?: string | null;
}
