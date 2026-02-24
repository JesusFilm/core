/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TemplateCustomizeGetMyMuxVideoQuery
// ====================================================

export interface TemplateCustomizeGetMyMuxVideoQuery_getMyMuxVideo {
  __typename: "MuxVideo";
  id: string;
  assetId: string | null;
  playbackId: string | null;
  readyToStream: boolean;
}

export interface TemplateCustomizeGetMyMuxVideoQuery {
  getMyMuxVideo: TemplateCustomizeGetMyMuxVideoQuery_getMyMuxVideo;
}

export interface TemplateCustomizeGetMyMuxVideoQueryVariables {
  id: string;
}
