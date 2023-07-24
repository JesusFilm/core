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
  id: string;
  title: string;
}

export interface TeamUpdate {
  teamUpdate: TeamUpdate_teamUpdate;
}

export interface TeamUpdateVariables {
  id: string;
  input: TeamUpdateInput;
}
