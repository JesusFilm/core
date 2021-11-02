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
  startAt: number | null;
  endAt: number | null;
  videoContent: VideoFields_videoContent | null;
}
