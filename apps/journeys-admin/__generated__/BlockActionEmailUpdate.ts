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
  parentBlockId: string | null;
  gtmEventName: string | null;
  email: string;
  customizable: boolean | null;
  parentStepId: string | null;
}

export interface BlockActionEmailUpdate {
  blockUpdateEmailAction: BlockActionEmailUpdate_blockUpdateEmailAction | null;
}

export interface BlockActionEmailUpdateVariables {
  id: string;
  input: EmailActionInput;
}
