/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPrivatePreviewAccess
// ====================================================

export interface GetPrivatePreviewAccess_journeyPreview {
  __typename: "Journey";
  id: string;
}

export interface GetPrivatePreviewAccess {
  journeyPreview: GetPrivatePreviewAccess_journeyPreview;
}

export interface GetPrivatePreviewAccessVariables {
  id: string;
  expectedRevision?: string | null;
}
