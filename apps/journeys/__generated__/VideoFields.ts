/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: VideoFields
// ====================================================

export interface VideoFields_video {
  __typename: "VideoArclight" | "VideoGeneric";
  src: string;
}

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
