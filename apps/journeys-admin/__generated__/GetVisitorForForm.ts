/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MessagePlatform, VisitorStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetVisitorForForm
// ====================================================

export interface GetVisitorForForm_visitor {
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

export interface GetVisitorForForm {
  /**
   * Get a single visitor
   */
  visitor: GetVisitorForForm_visitor;
}

export interface GetVisitorForFormVariables {
  id: string;
}
