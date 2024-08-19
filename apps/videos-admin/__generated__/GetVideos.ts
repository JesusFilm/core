/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetVideos
// ====================================================

export interface GetVideos_videos {
  __typename: "Video";
  id: string;
  image: string | null;
}

export interface GetVideos {
  videos: GetVideos_videos[];
}

export interface GetVideosVariables {
  limit?: number | null;
}
