/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VisitorUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VisitorUpdate
// ====================================================

export interface VisitorUpdate_visitorUpdate {
  __typename: "Visitor";
  id: string;
}

export interface VisitorUpdate {
  /**
   * Update a visitor
   */
  visitorUpdate: VisitorUpdate_visitorUpdate;
}

export interface VisitorUpdateVariables {
  input: VisitorUpdateInput;
}
