/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TeamUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TeamUpdate
// ====================================================

export interface TeamUpdate_teamUpdate {
  __typename: "Team";
  id: string | null;
  title: string | null;
  publicTitle: string | null;
}

export interface TeamUpdate {
  teamUpdate: TeamUpdate_teamUpdate | null;
}

export interface TeamUpdateVariables {
  id: string;
  input: TeamUpdateInput;
}
