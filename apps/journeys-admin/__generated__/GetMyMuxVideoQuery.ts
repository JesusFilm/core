/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMyMuxVideoQuery
// ====================================================

export interface GetMyMuxVideoQuery_getMyMuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
  readyToStream: boolean;
}

export interface GetMyMuxVideoQuery {
  getMyMuxVideo: GetMyMuxVideoQuery_getMyMuxVideo;
}

export interface GetMyMuxVideoQueryVariables {
  id: string;
}
