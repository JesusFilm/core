/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideoTag
// ====================================================

export interface GetVideoTag_videoTag_title {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetVideoTag_videoTag {
  __typename: "VideoTag";
  id: string;
  title: GetVideoTag_videoTag_title[];
}

export interface GetVideoTag {
  videoTag: GetVideoTag_videoTag | null;
}

export interface GetVideoTagVariables {
  id: string;
}
