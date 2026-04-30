/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMyMuxVideos
// ====================================================

export interface GetMyMuxVideos_getMyMuxVideos {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
  readyToStream: boolean;
}

export interface GetMyMuxVideos {
  getMyMuxVideos: GetMyMuxVideos_getMyMuxVideos[];
}

export interface GetMyMuxVideosVariables {
  offset?: number | null;
  limit?: number | null;
}
