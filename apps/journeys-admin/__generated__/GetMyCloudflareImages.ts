/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMyCloudflareImages
// ====================================================

export interface GetMyCloudflareImages_getMyCloudflareImages {
  __typename: "CloudflareImage";
  id: string;
  url: string | null;
  blurhash: string | null;
}

export interface GetMyCloudflareImages {
  getMyCloudflareImages: GetMyCloudflareImages_getMyCloudflareImages[];
}

export interface GetMyCloudflareImagesVariables {
  offset?: number | null;
  limit?: number | null;
  isAi?: boolean | null;
}
