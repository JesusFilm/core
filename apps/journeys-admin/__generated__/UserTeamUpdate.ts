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
  role: UserTeamRole;
  id: string;
  user: UserTeamUpdate_userTeamUpdate_user;
}

export interface UserTeamUpdate {
  userTeamUpdate: UserTeamUpdate_userTeamUpdate;
}

export interface UserTeamUpdateVariables {
  id: string;
  input?: UserTeamUpdateInput | null;
}
