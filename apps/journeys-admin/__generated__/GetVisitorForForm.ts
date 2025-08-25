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
  countryCode: string | null;
  id: string | null;
  lastChatStartedAt: any | null;
  messagePlatformId: string | null;
  messagePlatform: MessagePlatform | null;
  name: string | null;
  notes: string | null;
  status: VisitorStatus | null;
}

export interface GetVisitorForForm {
  visitor: GetVisitorForForm_visitor | null;
}

export interface GetVisitorForFormVariables {
  id: string;
}
