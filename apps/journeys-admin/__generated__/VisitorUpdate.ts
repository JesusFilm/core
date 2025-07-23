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
  id: string | null;
  messagePlatformId: string | null;
  messagePlatform: MessagePlatform | null;
  name: string | null;
  notes: string | null;
  status: VisitorStatus | null;
}

export interface VisitorUpdate {
  visitorUpdate: VisitorUpdate_visitorUpdate | null;
}

export interface VisitorUpdateVariables {
  id: string;
  input: VisitorUpdateInput;
}
