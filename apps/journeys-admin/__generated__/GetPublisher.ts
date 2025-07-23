/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { Role } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPublisher
// ====================================================

export interface GetPublisher_getUserRole {
  __typename: "UserRole";
  id: string | null;
  roles: Role[] | null;
}

export interface GetPublisher {
  getUserRole: GetPublisher_getUserRole | null;
}
