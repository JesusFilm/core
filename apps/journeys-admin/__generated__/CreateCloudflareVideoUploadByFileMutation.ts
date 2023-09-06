/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateCloudflareVideoUploadByFileMutation
// ====================================================

export interface CreateCloudflareVideoUploadByFileMutation_createCloudflareVideoUploadByFile {
  __typename: "CloudflareVideo";
  uploadUrl: string | null;
  id: string;
}

export interface CreateCloudflareVideoUploadByFileMutation {
  createCloudflareVideoUploadByFile: CreateCloudflareVideoUploadByFileMutation_createCloudflareVideoUploadByFile | null;
}

export interface CreateCloudflareVideoUploadByFileMutationVariables {
  uploadLength: number;
  name: string;
}
