/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EmailActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: EmailActionUpdate
// ====================================================

export interface EmailActionUpdate_blockUpdateEmailAction {
  __typename: "EmailAction";
  gtmEventName: string | null;
  email: string;
}

export interface EmailActionUpdate {
  blockUpdateEmailAction: EmailActionUpdate_blockUpdateEmailAction;
}

export interface EmailActionUpdateVariables {
  id: string;
  journeyId: string;
  input: EmailActionInput;
}
