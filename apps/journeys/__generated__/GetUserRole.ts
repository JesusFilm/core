/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetUserRole
// ====================================================

export interface GetUserRole_getUserRole {
  __typename: "UserRole";
  id: string | null;
  roles: Role[] | null;
}

export interface GetUserRole {
  getUserRole: GetUserRole_getUserRole | null;
}
