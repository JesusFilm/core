/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateCloudflareTeamUploadByFile
// ====================================================

export interface CreateCloudflareTeamUploadByFile_createCloudflareUploadByFile {
  __typename: "CloudflareImage";
  uploadUrl: string | null;
  id: string;
}

export interface CreateCloudflareTeamUploadByFile {
  createCloudflareUploadByFile: CreateCloudflareTeamUploadByFile_createCloudflareUploadByFile;
}

export interface CreateCloudflareTeamUploadByFileVariables {
  teamId: string;
}
