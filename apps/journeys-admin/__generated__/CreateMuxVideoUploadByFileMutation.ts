/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateMuxVideoUploadByFileMutation
// ====================================================

export interface CreateMuxVideoUploadByFileMutation_createMuxVideoUploadByFile {
  __typename: "MuxVideo";
  uploadUrl: string | null;
  id: string;
}

export interface CreateMuxVideoUploadByFileMutation {
  createMuxVideoUploadByFile: CreateMuxVideoUploadByFileMutation_createMuxVideoUploadByFile;
}

export interface CreateMuxVideoUploadByFileMutationVariables {
  name: string;
}
