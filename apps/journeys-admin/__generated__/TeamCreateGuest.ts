/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TeamCreateInput, UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TeamCreateGuest
// ====================================================

export interface TeamCreateGuest_teamCreate_userTeams_user_AuthenticatedUser {
  __typename: "AuthenticatedUser";
  id: string;
}

export interface TeamCreateGuest_teamCreate_userTeams_user_AnonymousUser {
  __typename: "AnonymousUser";
  id: string;
}

export type TeamCreateGuest_teamCreate_userTeams_user = TeamCreateGuest_teamCreate_userTeams_user_AuthenticatedUser | TeamCreateGuest_teamCreate_userTeams_user_AnonymousUser;

export interface TeamCreateGuest_teamCreate_userTeams {
  __typename: "UserTeam";
  id: string;
  user: TeamCreateGuest_teamCreate_userTeams_user;
  role: UserTeamRole;
}

export interface TeamCreateGuest_teamCreate_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
}

export interface TeamCreateGuest_teamCreate {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
  userTeams: TeamCreateGuest_teamCreate_userTeams[];
  customDomains: TeamCreateGuest_teamCreate_customDomains[];
}

export interface TeamCreateGuest {
  teamCreate: TeamCreateGuest_teamCreate;
}

export interface TeamCreateGuestVariables {
  input: TeamCreateInput;
}
