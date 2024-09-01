/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMyCloudflareVideoQuery
// ====================================================

export interface GetMyCloudflareVideoQuery_getMyCloudflareVideo {
  __typename: "CloudflareVideo";
  id: string;
  readyToStream: boolean;
}

export interface GetMyCloudflareVideoQuery {
  getMyCloudflareVideo: GetMyCloudflareVideoQuery_getMyCloudflareVideo;
}

export interface GetMyCloudflareVideoQueryVariables {
  id: string;
}
