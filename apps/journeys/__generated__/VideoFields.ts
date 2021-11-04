/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoFields
// ====================================================

export interface VideoFields_videoContent {
  __typename: "VideoArclight" | "VideoGeneric";
  src: string;
}

export interface VideoFields {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  title: string;
  muted: boolean | null;
  autoplay: boolean | null;
  /**
   * startAt dictates at which point of time the video should start playing
   */
  startAt: number | null;
  /**
   * endAt dictates at which point of time the video should end
   */
  endAt: number | null;
  videoContent: VideoFields_videoContent;
}
