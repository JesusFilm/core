/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TeamCreateInput, UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TeamCreate
// ====================================================

export interface TeamCreate_teamCreate_userTeams_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
  email: string;
}

export interface TeamCreate_teamCreate_userTeams {
  __typename: "UserTeam";
  id: string | null;
  user: TeamCreate_teamCreate_userTeams_user | null;
  role: UserTeamRole | null;
}

export interface TeamCreate_teamCreate_customDomains {
  __typename: "CustomDomain";
  id: string | null;
  name: string | null;
}

export interface TeamCreate_teamCreate {
  __typename: "Team";
  id: string | null;
  title: string | null;
  publicTitle: string | null;
  userTeams: TeamCreate_teamCreate_userTeams[] | null;
  customDomains: TeamCreate_teamCreate_customDomains[] | null;
}

export interface TeamCreate {
  teamCreate: TeamCreate_teamCreate | null;
}

export interface TeamCreateVariables {
  input: TeamCreateInput;
}
