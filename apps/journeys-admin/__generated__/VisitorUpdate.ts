/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VisitorUpdateInput, MessagePlatform, VisitorStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VisitorUpdate
// ====================================================

export interface VisitorUpdate_visitorUpdate {
  __typename: "Visitor";
  id: string;
  /**
   * ID of the visitor as set by VisitorUpdate mutation. This could be a phone
   * number, user id or other unique identifier provided by the message platform.
   */
  messagePlatformId: string | null;
  /**
   * Message platform the visitor wishes to be connected to us on as populated by
   * VisitorUpdate mutation or ChatOpenEventCreate mutation.
   */
  messagePlatform: MessagePlatform | null;
  /**
   * The name of the visitor as populated by VisitorUpdate mutation or
   * SignUpEventSubmissionEventCreate mutation.
   */
  name: string | null;
  /**
   * Private notes of the visitor as set by VisitorUpdate mutation.
   */
  notes: string | null;
  /**
   * Status of the visitor as populated by VisitorUpdate mutation.
   */
  status: VisitorStatus | null;
}

export interface VisitorUpdate {
  /**
   * Update a visitor
   */
  visitorUpdate: VisitorUpdate_visitorUpdate;
}

export interface VisitorUpdateVariables {
  id: string;
  input: VisitorUpdateInput;
}
