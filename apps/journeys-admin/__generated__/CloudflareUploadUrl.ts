/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CloudflareUploadUrl
// ====================================================

export interface CloudflareUploadUrl_createCloudflareImage {
  __typename: "CloudflareImage";
  uploadUrl: string;
  id: string;
}

export interface CloudflareUploadUrl {
  createCloudflareImage: CloudflareUploadUrl_createCloudflareImage | null;
}
