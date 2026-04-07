/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TemplateVideoUploadGetMyMuxVideoQuery
// ====================================================

export interface TemplateVideoUploadGetMyMuxVideoQuery_getMyMuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
  readyToStream: boolean;
}

export interface TemplateVideoUploadGetMyMuxVideoQuery {
  getMyMuxVideo: TemplateVideoUploadGetMyMuxVideoQuery_getMyMuxVideo;
}

export interface TemplateVideoUploadGetMyMuxVideoQueryVariables {
  id: string;
}
