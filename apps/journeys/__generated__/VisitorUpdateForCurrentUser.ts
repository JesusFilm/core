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
  id: string;
}

export interface VisitorUpdateForCurrentUser {
  /**
   * Allow current user to update specific allowable fields of their visitor record
   */
  visitorUpdateForCurrentUser: VisitorUpdateForCurrentUser_visitorUpdateForCurrentUser;
}

export interface VisitorUpdateForCurrentUserVariables {
  input: VisitorUpdateInput;
}
