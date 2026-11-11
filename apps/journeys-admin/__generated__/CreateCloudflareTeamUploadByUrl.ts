/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateCloudflareTeamUploadByUrl
// ====================================================

export interface CreateCloudflareTeamUploadByUrl_createCloudflareUploadByUrl {
  __typename: "CloudflareImage";
  id: string;
  url: string | null;
}

export interface CreateCloudflareTeamUploadByUrl {
  createCloudflareUploadByUrl: CreateCloudflareTeamUploadByUrl_createCloudflareUploadByUrl;
}

export interface CreateCloudflareTeamUploadByUrlVariables {
  url: string;
  journeyId?: string | null;
  teamId?: string | null;
}
