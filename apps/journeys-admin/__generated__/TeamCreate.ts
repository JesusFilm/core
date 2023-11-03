/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TeamCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TeamCreate
// ====================================================

export interface TeamCreate_teamCreate_userTeams_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
}

export interface TeamCreate_teamCreate_userTeams {
  __typename: "UserTeam";
  id: string;
  user: TeamCreate_teamCreate_userTeams_user;
}

export interface TeamCreate_teamCreate {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
  userTeams: TeamCreate_teamCreate_userTeams[];
}

export interface TeamCreate {
  teamCreate: TeamCreate_teamCreate;
}

export interface TeamCreateVariables {
  input: TeamCreateInput;
}
