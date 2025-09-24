/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EmailActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: BlockActionEmailUpdate
// ====================================================

export interface BlockActionEmailUpdate_blockUpdateEmailAction {
  __typename: "EmailAction";
  parentBlockId: string;
  gtmEventName: string | null;
  email: string;
}

export interface BlockActionEmailUpdate {
  blockUpdateEmailAction: BlockActionEmailUpdate_blockUpdateEmailAction;
}

export interface BlockActionEmailUpdateVariables {
  id: string;
  input: EmailActionInput;
}
