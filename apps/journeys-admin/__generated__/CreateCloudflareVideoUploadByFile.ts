/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateCloudflareVideoUploadByFile
// ====================================================

export interface CreateCloudflareVideoUploadByFile_createCloudflareVideoUploadByFile {
  __typename: "CloudflareVideo";
  uploadUrl: string | null;
  id: string;
}

export interface CreateCloudflareVideoUploadByFile {
  createCloudflareVideoUploadByFile: CreateCloudflareVideoUploadByFile_createCloudflareVideoUploadByFile | null;
}

export interface CreateCloudflareVideoUploadByFileVariables {
  uploadLength: number;
}
