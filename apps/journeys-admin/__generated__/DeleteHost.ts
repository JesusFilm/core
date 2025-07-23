/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteHost
// ====================================================

export interface DeleteHost_hostDelete {
  __typename: "Host";
  id: string | null;
}

export interface DeleteHost {
  hostDelete: DeleteHost_hostDelete | null;
}

export interface DeleteHostVariables {
  id: string;
  teamId: string;
}
