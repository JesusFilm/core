/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetRole
// ====================================================

export interface GetRole_getUserRole {
  __typename: "UserRole";
  id: string | null;
  userId: string | null;
  roles: Role[] | null;
}

export interface GetRole {
  getUserRole: GetRole_getUserRole | null;
}
