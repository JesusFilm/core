/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoFields
// ====================================================

export interface VideoFields_video_VideoGeneric {
  __typename: "VideoGeneric";
  src: string;
}

export interface VideoFields_video_VideoArclight {
  __typename: "VideoArclight";
  src: string;
  mediaComponentId: string;
  languageId: string;
}

export type VideoFields_video = VideoFields_video_VideoGeneric | VideoFields_video_VideoArclight;

export interface VideoFields {
  __typename: "VideoBlock";
  id: string;
  parentBlockId: string | null;
  title: string;
  volume: number | null;
  autoplay: boolean | null;
  startAt: number | null;
  video: VideoFields_video | null;
}
