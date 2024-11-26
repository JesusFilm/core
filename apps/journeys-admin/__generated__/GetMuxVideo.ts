/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMuxVideo
// ====================================================

export interface GetMuxVideo_getMuxVideo {
  __typename: "MuxVideo";
  id: string;
  playbackId: string | null;
  readyToStream: boolean;
}

export interface GetMuxVideo {
  getMuxVideo: GetMuxVideo_getMuxVideo | null;
}

export interface GetMuxVideoVariables {
  id: string;
}
