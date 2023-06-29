/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TeamCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TeamCreate
// ====================================================

export interface TeamCreate_teamCreate {
  __typename: "Team";
  id: string;
  title: string;
}

export interface TeamCreate {
  teamCreate: TeamCreate_teamCreate;
}

export interface TeamCreateVariables {
  input: TeamCreateInput;
}
