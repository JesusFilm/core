/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamUpdateInput, UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserTeamUpdate
// ====================================================

export interface UserTeamUpdate_userTeamUpdate_user {
  __typename: "User";
  id: string;
}

export interface UserTeamUpdate_userTeamUpdate {
  __typename: "UserTeam";
  role: UserTeamRole | null;
  id: string | null;
  user: UserTeamUpdate_userTeamUpdate_user | null;
}

export interface UserTeamUpdate {
  userTeamUpdate: UserTeamUpdate_userTeamUpdate | null;
}

export interface UserTeamUpdateVariables {
  id: string;
  input?: UserTeamUpdateInput | null;
}
