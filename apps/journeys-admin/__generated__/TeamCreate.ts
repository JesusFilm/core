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
  id: string;
  user: TeamCreate_teamCreate_userTeams_user;
  role: UserTeamRole;
}

export interface TeamCreate_teamCreate_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
}

export interface TeamCreate_teamCreate {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
  userTeams: TeamCreate_teamCreate_userTeams[];
  customDomains: TeamCreate_teamCreate_customDomains[];
}

export interface TeamCreate {
  teamCreate: TeamCreate_teamCreate;
}

export interface TeamCreateVariables {
  input: TeamCreateInput;
}
