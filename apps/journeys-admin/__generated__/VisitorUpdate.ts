/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { VisitorUpdateInput, VisitorStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: VisitorUpdate
// ====================================================

export interface VisitorUpdate_visitorUpdate {
  __typename: "Visitor";
  id: string;
  /**
   * Messenger ID of the visitor as set by any journeys-admin user via the
   * VisitorUpdate mutation. This could be a phone number, user id or other
   * unique identifier provided by the messenger network.
   */
  messengerId: string | null;
  /**
   * Messenger network of the visitor as set by any journeys-admin user via the
   * VisitorUpdate mutation.
   */
  messengerNetwork: string | null;
  /**
   * The name of the visitor as populated by mutation or otherwise via
   * SignUpEventSubmissionEventCreate mutation.
   */
  name: string | null;
  /**
   * Private notes of the visitor as set by any journeys-admin user via the
   * VisitorUpdate mutation.
   */
  notes: string | null;
  /**
   * Status of the visitor as set by any journeys-admin user via the VisitorUpdate
   * mutation.
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
