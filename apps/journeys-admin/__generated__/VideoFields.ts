/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoFields
// ====================================================

export interface VideoFields_videoContent {
  __typename: "VideoArclight" | "VideoGeneric";
  src: string | null;
}

export interface VideoFields {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number;
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
  /**
   * posterBlockId is present if a child block should be used as a poster.
   * This child block should not be rendered normally, instead it should be used
   * as the video poster. PosterBlock should be of type ImageBlock.
   */
  posterBlockId: string | null;
  videoContent: VideoFields_videoContent;
}
