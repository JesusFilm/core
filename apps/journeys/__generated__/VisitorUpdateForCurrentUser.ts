/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VisitorUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VisitorUpdateForCurrentUser
// ====================================================

export interface VisitorUpdateForCurrentUser_visitorUpdateForCurrentUser {
  __typename: "Visitor";
  id: string | null;
}

export interface VisitorUpdateForCurrentUser {
  visitorUpdateForCurrentUser: VisitorUpdateForCurrentUser_visitorUpdateForCurrentUser | null;
}

export interface VisitorUpdateForCurrentUserVariables {
  input: VisitorUpdateInput;
}
