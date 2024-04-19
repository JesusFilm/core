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
  /**
   * The country code of the visitor as poulated by visitor ip address detected in
   * the JourneyViewEventCreate mutation. This field country code is converted
   * from an IP address by the @maxmind/geoip2-node library. If this field is empty
   * it is likely that the JourneyViewEventCreate mutation was not called by the
   * visitor or that the country was not able to be determined based on the
   * visitor IP address.
   */
  countryCode: string | null;
  id: string;
  /**
   * The last time the visitor called the ButtonClickEvent mutation where the url
   * is in the format of a recognized chat platform.
   */
  lastChatStartedAt: any | null;
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
